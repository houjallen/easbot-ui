/**
 * 表格Hook系统统一导出
 * 基于Context的统一状态管理，提供完整的表格逻辑处理
 */

import { deepMerge } from '../../../utils/object';
import { useCallback, useMemo } from 'react';
import type { UseTableI18nReturn, UseTableLogicOptions, UseTableLogicReturn, UseTablePluginReturn } from '../types';
import type { FilterValue, SearchCondition } from '../types/base';
import { applyTableFilter, applyTableSearch, applyTableSort } from '../utils/businessUtils';

// 核心Context Hook
import type { TableContextValue } from '../context/TableContext';

// 基础Hook
import { useTablePagination } from './useTablePagination';
import type { UseTablePaginationLogicReturn } from './useTablePagination';

import { useTableI18n } from './useTableI18n';

import { useTablePlugin } from './useTablePlugin';
// 业务交互Hook
import { useTableStorePage } from './useTableStorePage';
import type { UseTableStorePageReturn } from './useTableStorePage';
import { processUiMessage } from '../../../utils/ui-message';
import type { UiMessages } from '../../../utils/ui-message';

import { useTableEventActions } from './useTableEventActions';

export { useTablePagination } from './useTablePagination';
export { useTableI18n } from './useTableI18n';
export { useTablePlugin } from './useTablePlugin';
export {
  useTableStorePage,
  type TableStorePageOptions,
  type UseTableStorePageReturn,
} from './useTableStorePage';
export { useTableEventActions } from './useTableEventActions';

/**
 * 表格逻辑Hook - 基于Context的统一逻辑处理
 * 整合了所有表格功能的逻辑方法，不再依赖独立的Hook文件
 */
export function useHookTableLogic(tableContext: TableContextValue, options?: UseTableLogicOptions): UseTableLogicReturn {
  const tableConfig = tableContext.state.config;
  const { state, actions, getRowKey } = tableContext;

  // 从context配置中获取各模块配置，options作为覆盖参数
  const selection = deepMerge(state.config.selection, options?.selection);
  const sort = deepMerge(state.config.sort, options?.sort);
  const filter = deepMerge(state.config.filter, options?.filter);
  const search = state.config.search;
  const expansion = deepMerge(state.config.expansion, options?.expansion);
  const resize = deepMerge(state.config.resize, options?.resize);
  const dataMode = deepMerge(state.config.dataMode, options?.dataMode);
  const plugin = deepMerge(state.config.plugin, options?.plugin);
  const columns = state.columns;
  // 在Hook入口统一获取当前locale
  const currentLocale = tableContext.getLocale();

  const getColumn = useCallback((columnName: string) => columns.find((column) => column.name === columnName), [columns]);

  const getField = useCallback(
    (fieldName: string) => {
      // 从 search config 中查找字段配置
      const searchField = search?.fields?.find((field) => field.name === fieldName);
      if (searchField?.dataIndex && searchField.dataIndex.length > 0) {
        // 如果搜索字段配置了 dataIndex，返回第一个字段（多字段搜索的情况）
        return searchField.dataIndex[0];
      }

      // 如果没有找到搜索字段配置，尝试从列配置中查找对应的 dataIndex
      const column = getColumn(fieldName);
      return column?.dataIndex || fieldName;
    },
    [search?.fields, getColumn],
  );

  // 排序逻辑 - 基于Context状态
  const sortLogic = useMemo(
    () => ({
      // 设置排序
      setSort: (columnName: string, order: 'asc' | 'desc' | null) => {
        const newSortState = { columnName: columnName, order };
        actions.setSortState(newSortState);
        const column = getColumn(columnName);
        column?.onSort?.(column?.dataIndex || columnName, order);
      },

      // 切换排序
      toggleSort: (columnName: string) => {
        const currentOrder = state.sortState.columnName === columnName ? state.sortState.order : null;
        let newOrder: 'asc' | 'desc' | null;

        if (currentOrder === null) {
          newOrder = 'asc';
        } else if (currentOrder === 'asc') {
          newOrder = 'desc';
        } else {
          newOrder = null;
        }

        const newSortState = {
          columnName: newOrder ? columnName : null,
          order: newOrder,
        };
        actions.setSortState(newSortState);
        const column = getColumn(columnName);
        column?.onSort?.(column?.dataIndex || columnName, newOrder);
      },

      // 获取排序后的数据
      getSortedData: (inputData?: any[]) => {
        if (!state.sortState.columnName || !state.sortState.order || dataMode?.sort === 'remote') {
          return inputData || state.data;
        }

        return applyTableSort(inputData || state.data, state.sortState, state.columns);
      },

      // 是否为本地排序模式
      isLocalMode: () => dataMode?.sort !== 'remote',
    }),
    [state.sortState, state.data, actions, state.columns, getColumn, dataMode?.sort],
  );

  // 筛选逻辑 - 基于Context状态
  const filterLogic = useMemo(
    () => ({
      // 设置筛选
      setFilter: (columnName: string, value?: FilterValue) => {
        const newFilterState = { ...state.filterState, [columnName]: value };
        actions.setFilterState(newFilterState);
        const column = getColumn(columnName);
        column?.onFilter?.(columnName, value);
      },

      // 清空筛选
      clearFilter: (columnName?: string) => {
        let newFilterState = {};
        if (columnName) {
          const { [columnName]: _, ...rest } = state.filterState;
          newFilterState = rest;
        } else {
          newFilterState = {};
        }
        actions.setFilterState(newFilterState);
        if (columnName) {
          const column = getColumn(columnName);
          column?.onFilter?.(columnName, undefined);
        }
      },

      // 获取筛选后的数据
      getFilteredData: (inputData?: any[]) => {
        if (Object.keys(state.filterState).length === 0 || dataMode?.filter === 'remote') {
          return inputData || state.data;
        }

        // 使用新的过滤工具函数
        const validFilterState = Object.fromEntries(Object.entries(state.filterState).filter(([, value]) => value !== undefined)) as Record<string, FilterValue>;

        return applyTableFilter(inputData || state.data, validFilterState, {
          getFieldValue: (record, field) => {
            // getFieldValue 只负责获取字段值，不执行筛选逻辑
            // field 参数是 dataIndex，直接用于获取数据
            return record[field];
          },
          customFilterer: (filterValue, record) => {
            // 通过 filterState 的键（column.name）查找对应的列配置
            // filterState 的键是 column.name，而不是 dataIndex
            const columnName = Object.keys(state.filterState).find((key) => state.filterState[key] === filterValue);
            const column = columnName ? getColumn(columnName) : null;
            if (column?.filterer && typeof column.filterer === 'function') {
              return column.filterer(filterValue, record);
            }
            // 返回 true 表示使用默认筛选逻辑
            return true;
          },
        });
      },

      // 是否为本地筛选模式
      isLocalMode: () => dataMode?.filter !== 'remote',
    }),
    [state.filterState, state.data, actions, getColumn, dataMode?.filter],
  );

  // 搜索逻辑 - 基于Context状态
  const searchLogic = useMemo(
    () => ({
      // 设置搜索条件
      setSearchCondition: (fieldKey: string, condition: SearchCondition) => {
        (actions as any).setSearchCondition(fieldKey, condition);
        // 直接执行回调，不使用setTimeout避免状态覆盖问题
        search?.onSearchChange?.(state.searchState);
      },

      // 移除搜索条件
      removeSearchCondition: (fieldKey: string) => {
        (actions as any).removeSearchCondition(fieldKey);
        // 直接执行回调，不使用setTimeout避免状态覆盖问题
        search?.onSearchChange?.(state.searchState);
      },

      // 设置搜索状态
      setSearchState: (searchState: any) => {
        (actions as any).setSearchState(searchState);
        // 直接执行回调，不使用setTimeout避免状态覆盖问题
        search?.onSearchChange?.(searchState);
      },

      // 清空所有搜索条件
      clearSearch: () => {
        (actions as any).clearSearch();
        // 直接执行回调，不使用setTimeout避免状态覆盖问题
        search?.onSearchChange?.({});
      },

      // 获取搜索后的数据
      getSearchedData: (inputData?: any[]) => {
        if (Object.keys(state.searchState).length === 0 || dataMode?.search === 'remote') {
          return inputData || state.data;
        }

        const validSearchState = Object.fromEntries(Object.entries(state.searchState).filter(([, value]) => value !== undefined)) as Record<string, SearchCondition>;

        return applyTableSearch(inputData || state.data, validSearchState, {
          getFieldValue: (record, field) => {
            // field 参数已经是 dataIndex，直接使用
            return record[field];
          },
        });
      },

      // 是否为本地搜索模式
      isLocalMode: () => dataMode?.search !== 'remote',

      // 获取当前搜索条件数量
      getSearchConditionCount: () => Object.keys(state.searchState).length,

      // 检查是否有搜索条件
      hasSearchConditions: () => Object.keys(state.searchState).length > 0,
    }),
    [state.searchState, state.data, actions, search, dataMode?.search],
  );

  // 展开逻辑 - 基于Context状态
  const expansionLogic = useMemo(
    () => ({
      // 展开所有行
      expandAll: () => {
        const allKeys = state.data.map((record, index) => getRowKey(record, index));
        actions.setExpandedRowKeys(allKeys);
        expansion?.onExpandChange?.(allKeys, state.data);
      },

      // 收起所有行
      collapseAll: () => {
        actions.setExpandedRowKeys([]);
        expansion?.onExpandChange?.([], []);
      },

      // 切换行展开
      toggleRowExpansion: (key: string | number, record: any) => {
        const isExpanded = state.expandedRowKeys.includes(key);
        let newExpandedKeys: (string | number)[];

        if (isExpanded) {
          // 如果已展开，则收起
          newExpandedKeys = state.expandedRowKeys.filter((k) => k !== key);
        } else {
          // 如果未展开，则展开
          if (state.config.expansion?.type === 'single') {
            // single模式：手风琴效果，只能展开一个
            newExpandedKeys = [key];
          } else {
            // multiple模式：可以展开多个
            newExpandedKeys = [...state.expandedRowKeys, key];
          }
        }

        actions.setExpandedRowKeys(newExpandedKeys);
        expansion?.onExpand?.(!isExpanded, record, key);

        const newExpandedRows = state.data.filter((record, index) => newExpandedKeys.includes(getRowKey(record, index)));
        expansion?.onExpandChange?.(newExpandedKeys, newExpandedRows);
      },
    }),
    [state.expandedRowKeys, state.data, actions, expansion, getRowKey, state.config.expansion?.type],
  );

  // 列宽调整逻辑 - 基于Context状态，与colgroup配合
  const resizeLogic = useMemo(
    () => ({
      // 设置列宽 - 更新state.columnWidths，自动触发colgroup重新渲染
      setColumnWidth: (field: string, width: number) => {
        // 特殊列不允许调整宽度
        if (field === '__selection__' || field === '__expansion__') {
          return;
        }

        actions.setColumnWidth(field, width);
        resize?.onResize?.(field, width);
      },

      // 重置列宽 - 清空state.columnWidths，恢复列定义的默认宽度
      resetColumnWidths: () => {
        actions.resetColumnWidths();
        resize?.onReset?.();
      },
    }),
    [actions, resize],
  );

  const paginationLogic: UseTablePaginationLogicReturn = useTablePagination(tableContext);

  // ⚠️ **必须定义在 `searchLogic` / `filterLogic` / `sortLogic` / `paginationLogic` 之后**
  // —— 它的依赖数组引用了这四个 `useMemo`，定义在其前会触发 TDZ 引用（TS2448 / TS2454）。
  // 选择逻辑 - 基于Context状态
  const selectionLogic = useMemo(
    () => ({
      // 选择所有行 - 只选择当前筛选和分页后的可见数据
      selectAll: () => {
        let data = state.data;

        // 应用搜索
        if (dataMode?.search !== 'remote' && Object.keys(state.searchState).length > 0) {
          data = searchLogic.getSearchedData(data);
        }

        // 应用筛选
        if (dataMode?.filter !== 'remote' && Object.keys(state.filterState).length > 0) {
          data = filterLogic.getFilteredData(data);
        }

        // 应用排序
        if (dataMode?.sort !== 'remote' && state.sortState.columnName && state.sortState.order) {
          data = sortLogic.getSortedData(data);
        }

        // 本地分页 - 获取当前页数据
        if (dataMode?.pagination !== 'remote') {
          data = paginationLogic.getPaginatedData(data);
        }

        const visibleKeys = data.map((record, index) => getRowKey(record, index));
        actions.setSelectedRowKeys(visibleKeys);
        selection?.onSelectionChange?.(visibleKeys, data);
      },

      // 清空选择
      clearSelection: () => {
        actions.setSelectedRowKeys([]);
        selection?.onSelectionChange?.([], []);
      },

      // 切换行选择
      toggleRowSelection: (key: string | number) => {
        const isSelected = state.selectedRowKeys.includes(key);
        let newKeys: (string | number)[];

        if (isSelected) {
          newKeys = state.selectedRowKeys.filter((k) => k !== key);
        } else if (selection?.type === 'single') {
          newKeys = [key];
        } else {
          newKeys = [...state.selectedRowKeys, key];
        }

        actions.setSelectedRowKeys(newKeys);

        const selectedRows = state.data.filter((record, index) => newKeys.includes(getRowKey(record, index)));
        selection?.onSelectionChange?.(newKeys, selectedRows);
      },

      // 获取选中的行数据
      getSelectedRows: () => {
        return state.data.filter((record, index) => state.selectedRowKeys.includes(getRowKey(record, index)));
      },

      // 检查是否全选
      isAllSelected: () => {
        if (state.data.length === 0) return false;
        return state.data.every((record, index) => state.selectedRowKeys.includes(getRowKey(record, index)));
      },

      // 检查是否部分选中
      isIndeterminate: () => {
        const selectedCount = state.data.filter((record, index) => state.selectedRowKeys.includes(getRowKey(record, index))).length;
        return selectedCount > 0 && selectedCount < state.data.length;
      },
    }),
    [
      state.selectedRowKeys,
      state.data,
      actions,
      selection,
      getRowKey,
      state.sortState.columnName,
      filterLogic.getFilteredData,
      state.sortState.order,
      dataMode?.search,
      sortLogic.getSortedData,
      state.searchState,
      searchLogic.getSearchedData,
      dataMode?.pagination,
      state.filterState,
      paginationLogic.getPaginatedData,
      dataMode?.sort,
      dataMode?.filter,
    ],
  );

  const storePageLogic: UseTableStorePageReturn = useTableStorePage(tableContext);

  // Action事件系统
  const actionsLogic = useTableEventActions(tableContext);

  const pluginContext = useMemo(() => {
    return deepMerge(plugin?.context ?? {}, {
      tableContext: tableContext,
      processMessage: (key: string, messages?: UiMessages, params?: Record<string, any>) => {
        return processUiMessage(
          key,
          {
            locale: currentLocale,
            messages: messages || {},
            fallbackLocale: 'zh-CN',
          },
          params,
        );
      },
    });
  }, [plugin?.context, tableContext, currentLocale]);

  const pluginLogic: UseTablePluginReturn = useTablePlugin(tableContext, {
    plugins: plugin?.plugins || [],
    context: pluginContext,
    config: plugin?.config || {},
  });

  const i18nLogic: UseTableI18nReturn = useTableI18n({ locale: currentLocale });

  // 生成colgroup配置 - 包含所有实际渲染的列
  const columnWidths = useMemo(() => {
    //resize 打开时计算宽度
    if (!state.config.resizeable) return [];

    const widthConfigs: {
      width?: number;
      minWidth?: number;
      maxWidth?: number;
    }[] = [];

    // 1. 选择列
    if (state.config?.selectable) {
      widthConfigs.push({
        width: 48,
        minWidth: 48,
        maxWidth: 48,
      });
    }

    // 2. 展开列
    if (state.config?.expandable) {
      widthConfigs.push({
        width: 48,
        minWidth: 48,
        maxWidth: 48,
      });
    }

    // 3. 普通列
    columns.forEach((column) => {
      // 隐藏列不参与计算
      if (column.visible === false) return;

      const columnWidth = state.columnWidths[column.name];

      // 提取公共的默认值
      const defaultMinWidth = state.config?.resize?.minWidth ?? 80;
      const defaultMaxWidth = state.config?.resize?.maxWidth ?? Number.MAX_SAFE_INTEGER;

      const config: { width?: number; minWidth?: number; maxWidth?: number } = {};

      if (columnWidth) {
        // 用户调整的列宽
        config.width = columnWidth;
        config.minWidth = Math.min(columnWidth, column.minWidth ?? defaultMinWidth);
        config.maxWidth = Math.max(columnWidth, column.maxWidth ?? defaultMaxWidth);
      } else {
        // 列定义的默认宽度
        config.width = column.width ? (typeof column.width === 'number' ? column.width : Number.parseInt(column.width, 10)) : 120; // 默认值 120

        config.minWidth = column.minWidth ?? defaultMinWidth;
        config.maxWidth = column.maxWidth ?? defaultMaxWidth;
      }

      widthConfigs.push(config);
    });

    // 4. 行操作列
    if (state.config?.rowActionable) {
      widthConfigs.push({
        width: 160,
        minWidth: 160,
        maxWidth: 160,
      });
    }

    return widthConfigs;
  }, [
    columns,
    state.columnWidths,
    state.config?.selectable,
    state.config?.expandable,
    state.config?.rowActionable,
    state.config?.resize?.minWidth,
    state.config?.resize?.maxWidth,
    state.config.resizeable,
  ]);

  return {
    // Context状态和操作
    state,
    actions,

    // 逻辑方法
    selection: selectionLogic,
    sort: sortLogic,
    filter: filterLogic,
    search: searchLogic,
    expansion: expansionLogic,
    resize: resizeLogic,
    pagination: paginationLogic,
    plugin: pluginLogic,
    i18n: i18nLogic,
    storePage: storePageLogic,
    actionEvents: actionsLogic,

    // 列宽配置
    columnWidths,

    // 便捷方法
    getProcessedData: () => {
      let data = state.data;

      // 应用搜索
      if (dataMode?.search !== 'remote' && Object.keys(state.searchState).length > 0) {
        data = searchLogic.getSearchedData(data);
      }

      // 应用筛选（基于搜索后的数据）
      if (dataMode?.filter !== 'remote' && Object.keys(state.filterState).length > 0) {
        data = filterLogic.getFilteredData(data);
      }

      // 应用排序（基于筛选后的数据）
      if (dataMode?.sort !== 'remote' && state.sortState.columnName && state.sortState.order) {
        data = sortLogic.getSortedData(data);
      }

      // 本地分页
      if (dataMode?.pagination !== 'remote') {
        data = paginationLogic.getPaginatedData(data);
        actions.setLoading(false);
      }

      return data;
    },
  };
}
