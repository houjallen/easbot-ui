/**
 * 表格业务交互Hook - 处理与外部业务系统的参数交互
 * 统一管理filter、sort、search、pagination等参数的变化检测和提交
 */

import type { DataStorePage, FilterDataType, FilterExpression, FilterRule } from '../../../models/index';
import { deepMerge } from '../../../utils/object';
import { deepValueEqual, isEmpty } from '../../../utils/object';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { TableContextValue } from '../context/TableContext';
import type { BusinessQueryParams, DataType, TableStorePageConfig } from '../types';

/**
 * 稳定的空对象引用，避免每次 useMemo 都创建新对象导致不必要的重新渲染和比较
 * 用于 pagination, sort, filter, search 的默认值
 */
const EMPTY_OBJECT = Object.freeze({});

/**
 * 表格数据类型 → 后端过滤数据类型 的映射
 *
 * @description
 * 表格侧的 `DataType` 面向 UI 编辑器，其中 `'number'` 是通用数字类型；
 * 而后端 `FilterDataTypeSchema`（`FilterDataType`）只区分具体数值宽度
 * （`int` / `float` / `long` / `double`），不包含通用数字类型。
 *
 * 直接透传 `'number'` 会违反后端过滤表达式的数据契约，
 * 因此在转换为过滤表达式时统一收敛到 `'double'`（可无损承载任意数值比较）。
 */
const DATA_TYPE_TO_FILTER_DATA_TYPE: Record<DataType, FilterDataType> = {
  string: 'string',
  number: 'double',
  int: 'int',
  float: 'float',
  long: 'long',
  double: 'double',
  boolean: 'boolean',
  date: 'date',
  enum: 'enum',
  list: 'list',
  object: 'object',
};

/**
 * 将表格数据类型转换为后端过滤数据类型
 * @param dataType 表格数据类型
 * @returns 后端过滤数据类型
 */
const toFilterDataType = (dataType?: DataType): FilterDataType => DATA_TYPE_TO_FILTER_DATA_TYPE[dataType ?? 'string'] ?? 'string';

/**
 * 业务交互配置
 */
export interface TableStorePageOptions extends TableStorePageConfig {}

/**
 * 业务交互Hook返回值
 */
export interface UseTableStorePageReturn {
  /** 当前查询参数 */
  currentParams: BusinessQueryParams;
  /** 手动触发参数提交 */
  submitParams: (customParams?: Partial<BusinessQueryParams>) => Promise<void>;
  /** 重置参数 */
  resetParams: () => void;
  /** 是否正在提交 */
  isSubmitting: boolean;
  /** 转换为DataStorePageSchema格式 */
  toDataStorePageSchema: (params?: BusinessQueryParams) => DataStorePage;
}

/**
 * 表格业务交互Hook
 * 监听表格状态变化，自动提取业务参数并与外部系统交互
 */
export function useTableStorePage(context: TableContextValue, options: TableStorePageOptions = {}): UseTableStorePageReturn {
  const tableConfig = context.state.config;
  const {
    onParamsChange,
    onPageChange,
    debounceDelay = 300,
    triggerOnInit = false,
    extractParams,
    compareParams: providedCompareParams,
  } = deepMerge(tableConfig?.storePage ?? {}, options) as TableStorePageOptions;

  // 使用useCallback确保compareParams函数稳定
  const compareParams = useCallback(
    providedCompareParams ||
      // 注意：此处必须显式标注参数类型 ——
      // 左侧 `providedCompareParams` 的类型含 `undefined`，
      // `||` 右侧的箭头函数拿不到有效的上下文类型，参数会退化为隐式 `any`。
      ((prev: BusinessQueryParams, current: BusinessQueryParams): boolean => {
        // 自定义深度比较，处理特殊情况
        if (!prev || !current) return false;

        // 比较分页参数：忽略 total，仅比较 pageNo/pageSize/reloadTrigger，避免后端回写 total 触发二次请求
        const normPagination = (p: any) => ({
          pageNo: p?.pageNo ?? 1,
          pageSize: p?.pageSize ?? 10,
          reloadTrigger: p?.reloadTrigger,
        });
        if (!deepValueEqual(normPagination(prev.pagination), normPagination(current.pagination))) {
          console.debug('分页参数不相等(忽略total):', {
            prev: normPagination(prev.pagination),
            current: normPagination(current.pagination),
          });
          return false;
        }

        // 比较排序参数
        // 规则：当双方sorting都“为空”时视为相等。
        // 空排序定义：对象为空(isEmpty)；或(columnName/order 都为空、null、undefined)；
        // 兼容可能存在的 column 字段写法。
        const isSortEmpty = (s: any): boolean => {
          if (!s || isEmpty(s)) return true;
          if (typeof s !== 'object') return false;
          const columnName = (s as any).columnName ?? (s as any).column;
          const order = (s as any).order;
          const isColumnEmpty = columnName === undefined || columnName === null || columnName === '';
          const isOrderEmpty = order === undefined || order === null || order === '';
          return isColumnEmpty && isOrderEmpty;
        };

        const prevSortEmpty = isSortEmpty(prev.sort);
        const currSortEmpty = isSortEmpty(current.sort);

        if (!(prevSortEmpty && currSortEmpty)) {
          // 只有在双方不同时为空的情况下才进行深比较
          if (!deepValueEqual(prev.sort, current.sort)) {
            console.debug('排序参数不相等:', {
              prev: prev.sort,
              current: current.sort,
            });
            return false;
          }
        }

        // 比较过滤参数
        if (!deepValueEqual(prev.filter, current.filter)) {
          console.debug('过滤参数不相等:', {
            prev: prev.filter,
            current: current.filter,
          });
          return false;
        }

        // 比较搜索参数
        if (!deepValueEqual(prev.search, current.search)) {
          console.debug('搜索参数不相等:', {
            prev: prev.search,
            current: current.search,
          });
          return false;
        }

        // 比较其他自定义参数
        const prevKeys = Object.keys(prev).filter((key) => !['pagination', 'sort', 'filter', 'search'].includes(key));
        const currentKeys = Object.keys(current).filter((key) => !['pagination', 'sort', 'filter', 'search'].includes(key));

        if (prevKeys.length !== currentKeys.length) return false;

        for (const key of prevKeys) {
          if (!deepValueEqual(prev[key], current[key])) return false;
        }

        return true;
      }),
    [],
  );

  const state = context.state;
  const actions = context.actions;

  // 状态管理
  const previousParams = state.lastQueryParams;
  const isInitializedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isSubmittingRef = useRef(false);
  // 使用 ref 同步保存已提交的参数，避免依赖异步的 state 更新
  const lastSubmittedParamsRef = useRef<BusinessQueryParams | null>(null);

  // 获取表格状态
  // 使用稳定的 EMPTY_OBJECT 引用，避免每次都创建新对象导致：
  // 1. currentParams 引用变化
  // 2. useEffect 重复触发
  // 3. compareParams 误判为不相等
  const pagination = useMemo(() => context.state.pagination || EMPTY_OBJECT, [context.state.pagination]);
  const sort = useMemo(() => context.state.sortState || EMPTY_OBJECT, [context.state.sortState]);
  const filter = useMemo(() => context.state.filterState || EMPTY_OBJECT, [context.state.filterState]);
  const search = useMemo(() => context.state.searchState || EMPTY_OBJECT, [context.state.searchState]);

  // 提取当前查询参数
  const currentParams = useMemo((): BusinessQueryParams => {
    const baseParams: BusinessQueryParams = {
      pagination,
      sort,
      filter,
      search,
    };

    // 如果有自定义参数提取函数，则使用它
    if (extractParams) {
      const customParams = extractParams(state);
      return { ...baseParams, ...customParams };
    }

    return baseParams;
  }, [pagination, sort, filter, search, extractParams, state]);

  // 辅助函数：构建FilterRuleSchema，支持嵌套分组
  const buildFilterRule = useCallback(
    (filterExpressions: FilterExpression[], searchExpressions: FilterExpression[], searchRules: FilterRule[], logic: 'and' | 'or' = 'and'): FilterRule | undefined => {
      // 构建规则组
      const rules: FilterRule[] = [];

      // 1. 添加filter规则组（如果有filter表达式）
      if (filterExpressions.length > 0) {
        rules.push({
          logic: 'and',
          group: 'filter_conditions',
          expressions: filterExpressions,
        });
      }

      // 2. 添加search规则组
      if (searchExpressions.length > 0 || searchRules.length > 0) {
        const searchSubRules: FilterRule[] = [...searchRules];

        // 如果有单字段搜索表达式，将它们组合成一个规则组
        if (searchExpressions.length > 0) {
          searchSubRules.push({
            logic: 'and', // 单字段搜索条件之间用AND连接
            group: 'search_single_fields',
            expressions: searchExpressions,
          });
        }

        // 创建搜索总规则组
        rules.push({
          logic: 'and', // 多个搜索条件（包括多字段组）之间用AND连接
          group: 'search_conditions',
          rules: searchSubRules,
        });
      }

      // 3. 返回最终结构
      if (rules.length === 0) {
        return undefined;
      }

      return {
        logic: 'and', // 顶层使用and连接filter和search
        rules,
      };
    },
    [],
  );

  // 转换为DataStorePageSchema格式
  const toDataStorePageSchema = useCallback(
    (params?: BusinessQueryParams): DataStorePage => {
      const targetParams = params || currentParams;
      const { pagination, sort, filter, search } = targetParams;

      // 转换排序格式
      const sorting: Array<{ field: string; order: 'asc' | 'desc' }> = [];
      if (sort && typeof sort === 'object') {
        // 处理SortState格式: { columnName: string | null; order: SortDirection | null }
        if ('columnName' in sort && 'order' in sort && sort.columnName && sort.order) {
          const column = state.columns.find((col) => col.name === sort.columnName);
          const field = column?.dataIndex || sort.columnName;
          sorting.push({ field, order: sort.order });
        }
      }

      // 构建FilterRuleSchema - 支持完整的field、op、value、type、format
      // （实际构建在下方 filter / search 表达式收集完成之后）

      // 分别收集filter和search表达式
      const filterExpressions: FilterExpression[] = [];
      const searchExpressions: FilterExpression[] = [];

      // 1. 处理filter状态 - FilterState: { [columnKey: string]: FilterValue }
      if (filter && typeof filter === 'object' && Object.keys(filter).length > 0) {
        Object.entries(filter).forEach(([columnKey, filterValue]) => {
          if (filterValue && typeof filterValue === 'object' && filterValue.op) {
            // 确保value是数组格式，过滤掉undefined和null值
            const valueArray = Array.isArray(filterValue.value)
              ? filterValue.value.filter((v) => v !== undefined && v !== null)
              : filterValue.value !== undefined && filterValue.value !== null
                ? [filterValue.value]
                : [];

            if (valueArray.length > 0 || ['isnull', 'isnotnull'].includes(filterValue.op)) {
              // 直接使用filterValue中已设置的type，提高性能
              const dataType = toFilterDataType(filterValue.type);

              // 直接使用filterValue中的format，如果是函数则不传递
              const formatString = typeof filterValue.format === 'function' ? undefined : filterValue.format;

              filterExpressions.push({
                field: filterValue.field || columnKey,
                op: filterValue.op,
                value: valueArray.length > 0 ? valueArray : [], // 确保value始终是数组
                type: dataType,
                format: formatString,
              });
            }
          }
        });
      }

      // 2. 处理search状态 - SearchState: { [fieldKey: string]: SearchCondition }
      const searchRules: FilterRule[] = [];
      if (search && typeof search === 'object' && Object.keys(search).length > 0) {
        Object.entries(search).forEach(([fieldKey, searchCondition]) => {
          if (searchCondition && typeof searchCondition === 'object' && searchCondition.operator) {
            // 处理多字段搜索
            const fields = searchCondition.field; // 现在已经是 string[]

            // 确保value是数组格式，过滤掉undefined和null值
            const valueArray = Array.isArray(searchCondition.value)
              ? searchCondition.value.filter((v) => v !== undefined && v !== null && v !== '')
              : searchCondition.value !== undefined && searchCondition.value !== null && searchCondition.value !== ''
                ? [searchCondition.value]
                : [];

            // 只有当有有效值或者是null检查操作时才添加表达式
            if (valueArray.length > 0 || ['isnull', 'isnotnull'].includes(searchCondition.operator)) {
              const operator = searchCondition.operator || 'eq';
              const dataType = toFilterDataType(searchCondition.type);
              const formatString = searchCondition.format;

              // 如果只有一个字段，直接添加到searchExpressions
              const [singleField] = fields;
              if (fields.length === 1 && singleField !== undefined) {
                searchExpressions.push({
                  field: singleField,
                  op: operator,
                  value: valueArray.length > 0 ? valueArray : [],
                  type: dataType,
                  format: formatString,
                });
              } else {
                // 多字段情况：创建子分组，内部用OR连接
                const multiFieldExpressions: FilterExpression[] = fields.map((field) => ({
                  field: field,
                  op: operator,
                  value: valueArray.length > 0 ? valueArray : [],
                  type: dataType,
                  format: formatString,
                }));

                // 创建一个子规则组，内部用OR连接多个字段
                const multiFieldRule: FilterRule = {
                  logic: 'or',
                  group: `search_multifield_${fieldKey}`,
                  expressions: multiFieldExpressions,
                };

                // 将子规则组添加到searchRules中
                searchRules.push(multiFieldRule);
              }
            }
          }
        });
      }

      // 3. 使用辅助函数构建FilterRuleSchema结构，支持嵌套分组
      const filterRule: FilterRule | undefined = buildFilterRule(filterExpressions, searchExpressions, searchRules, 'and');

      // 构建额外参数
      const params_extra: Record<string, any> = {};

      // 添加其他自定义参数
      Object.entries(targetParams).forEach(([key, value]) => {
        if (!['pagination', 'sort', 'filter', 'search'].includes(key)) {
          params_extra[key] = value;
        }
      });

      return {
        pageNo: pagination?.pageNo || 1,
        pageSize: pagination?.pageSize || 20,
        sorting: sorting.length > 0 ? sorting : undefined,
        filter: filterRule,
        params: Object.keys(params_extra).length > 0 ? params_extra : undefined,
        autoCount: true, // 默认自动计算总数
      };
    },
    [currentParams, state.columns, buildFilterRule],
  );

  // 使用 ref 保存最新的 currentParams，避免 submitParams 频繁重新创建
  const currentParamsRef = useRef(currentParams);
  currentParamsRef.current = currentParams;

  // 手动提交参数
  const submitParams = useCallback(
    async (customParams?: Partial<BusinessQueryParams>) => {
      // 从 ref 中获取最新的 currentParams，避免闭包问题
      const latestParams = currentParamsRef.current;
      const paramsToSubmit = customParams ? { ...latestParams, ...customParams } : latestParams;

      try {
        isSubmittingRef.current = true;
        // 立即同步更新已提交的参数，避免依赖异步的 state 更新
        lastSubmittedParamsRef.current = latestParams;
        console.debug('[useTableStorePage] 开始提交参数', { latestParams });

        // 调用原始参数回调
        if (onParamsChange) {
          await onParamsChange(paramsToSubmit);
        }

        // 调用页面参数回调，转换为DataStorePageSchema格式
        if (onPageChange) {
          const pageSchema = toDataStorePageSchema(paramsToSubmit);
          await onPageChange(pageSchema);
        }

        // 使用提交时的参数作为 lastQueryParams
        actions.updateLastQueryParams(latestParams);
        console.debug('[useTableStorePage] 提交完成');
      } catch (error) {
        console.error(processUiMessage('submitFailed', { locale: context.getLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
        throw error;
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [onParamsChange, onPageChange, toDataStorePageSchema, actions, context],
  );

  // 重置参数
  const resetParams = useCallback(() => {
    // 这里可以根据需要重置表格状态
    actions.reset();
  }, [
    // 这里可以根据需要重置表格状态
    actions.reset,
  ]);

  // 监听参数变化并自动提交
  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 如果参数为空，则返回
    if (isEmpty(currentParams)) {
      console.debug('[useTableStorePage] 参数为空，跳过提交');
      return;
    }

    // 如果没有任何回调函数，直接返回
    if (!onParamsChange && !onPageChange) {
      console.debug('[useTableStorePage] 无回调函数，跳过提交');
      return;
    }

    // 初始化处理
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.debug('[useTableStorePage] 首次初始化', { triggerOnInit });

      // 如果配置了初始化时触发，则提交参数
      if (triggerOnInit) {
        console.debug('[useTableStorePage] 初始化触发提交');
        // 提交失败由 submitParams 内部记录日志，此处显式吞掉 rejection 避免未处理的 Promise 异常
        submitParams().catch(() => {});
      }
      return;
    }

    // 检查参数是否真正发生了变化
    // 优先使用 ref 中同步保存的已提交参数，避免依赖异步的 state 更新
    const lastParams = lastSubmittedParamsRef.current || previousParams;
    const paramsChanged = !lastParams || !compareParams(lastParams, currentParams);
    console.debug('[useTableStorePage] 参数比较结果', {
      paramsChanged,
      lastSubmittedParams: lastSubmittedParamsRef.current,
      previousParams,
      currentParams,
      usingRefParams: !!lastSubmittedParamsRef.current,
    });

    if (!paramsChanged) {
      console.debug('[useTableStorePage] 参数未变化，跳过提交');
      return;
    }

    // 如果正在提交中，跳过新的提交，避免重复
    if (isSubmittingRef.current) {
      console.debug('[useTableStorePage] 正在提交中，跳过重复提交');
      return;
    }

    // 🔒 数据安全：参数变化时清空选择和展开状态，避免跨页/跨条件误操作
    // 当分页、排序、筛选、搜索任一变化时，清空当前选择和展开的行
    const shouldClearSelection = state.config.dataMode?.clearSelectedOnPagination !== false;

    if (shouldClearSelection) {
      console.debug('[useTableStorePage] 查询条件变化，清空选择和展开状态');
      actions.clearSelection();
      actions.collapseAll();
    }

    // 使用防抖延迟执行提交
    console.debug('[useTableStorePage] 参数已变化，延迟提交', { debounceDelay });
    debounceTimerRef.current = setTimeout(() => {
      console.debug('[useTableStorePage] 执行延迟提交');
      // 提交失败由 submitParams 内部记录日志，此处显式吞掉 rejection 避免未处理的 Promise 异常
      submitParams().catch(() => {});
    }, debounceDelay);

    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    currentParams,
    onParamsChange,
    onPageChange,
    triggerOnInit,
    debounceDelay,
    compareParams,
    submitParams,
    actions.clearSelection,
    state.config.dataMode?.clearSelectedOnPagination,
    previousParams,
    actions.collapseAll,
  ]);

  return {
    currentParams,
    submitParams,
    resetParams,
    isSubmitting: isSubmittingRef.current,
    toDataStorePageSchema,
  };
}
