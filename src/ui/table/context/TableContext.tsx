/**
 * 现代化表格上下文管理
 * 作为表格系统的配置中心，统一管理所有状态和配置
 */

import { getLocaleOnClient } from '../../../utils/locale';
import { deepMerge } from '../../../utils/object';
import { isEmpty, deepValueEqual } from '../../../utils/object';

/**
 * 稳定的空对象引用，避免每次都创建新对象导致不必要的重新渲染
 * 用于状态初始化、默认值等场景
 */
const EMPTY_OBJECT = Object.freeze({}) as Record<string, any>;
const EMPTY_ARRAY = Object.freeze([]) as readonly any[];
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useHookTableLogic } from '../hooks';
import type { PaginationState, TableColumn, TableConfig } from '../types';
import type { BusinessQueryParams, FilterState, FilterValue, SearchCondition, SearchState, SortDirection, SortState, UseTableLogicReturn } from '../types';
import { processTableData } from '../utils/businessUtils';

// ============ 统一状态类型 ============

/**
 * 表格状态接口
 */
export interface TableState {
  // 配置
  config: TableConfig;

  // 数据和列
  data: Record<string, any>[];
  columns: TableColumn[];

  // 状态
  selectedRowKeys: (string | number)[];
  expandedRowKeys: (string | number)[];
  sortState: { columnName: string | null; order: SortDirection | null };
  filterState: FilterState;
  searchState: SearchState;
  columnWidths: Record<string, number>;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  /** 插件状态存储 - 每个插件可以在此存储自己的状态 */
  pluginStates: Record<string, any>;
  /** 最后一次业务查询参数 */
  lastQueryParams: BusinessQueryParams;
}

/**
 * 表格操作方法
 */
export interface TableActions {
  // 配置操作
  updateConfig: (config: Partial<TableConfig>) => void;

  // 数据操作
  setData: (data: Record<string, any>[]) => void;
  updateItem: (rowKey: string | number, updates: Partial<Record<string, any>>) => void;
  removeItem: (rowKey: string | number) => void;
  addItem: (item: Record<string, any>, index?: number) => void;
  setColumns: (columns: TableColumn[]) => void;
  updateColumn: (columnName: string, updates: Partial<TableColumn>) => void;

  // 选择操作
  setSelectedRowKeys: (keys: (string | number)[]) => void;
  toggleRowSelection: (key: string | number) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // 展开操作
  setExpandedRowKeys: (keys: (string | number)[]) => void;
  toggleRowExpansion: (key: string | number) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // 排序操作
  setSort: (columnName: string | null, order: SortDirection | null) => void;
  setSortState: (state: SortState) => void;
  clearSort: () => void;

  // 筛选操作
  setFilter: (columnKey: string, value: FilterValue | undefined) => void;
  setFilterState: (state: FilterState) => void;
  clearFilter: (columnKey?: string) => void;

  // 搜索操作
  setSearchCondition: (fieldKey: string, condition: SearchCondition) => void;
  removeSearchConditionByField: (fieldKey: string) => void;
  setSearchState: (state: SearchState) => void;
  clearSearch: () => void;

  // 插件状态操作
  setPluginState: (pluginId: string, state: any) => void;
  getPluginState: (pluginId: string) => any;
  clearPluginState: (pluginId: string) => void;
  clearAllPluginStates: () => void;

  // 列宽操作
  setColumnWidth: (columnKey: string, width: number) => void;
  resetColumnWidths: () => void;

  // 分页操作
  updatePagination: (pagination: PaginationState | null) => void;

  // UI状态操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 业务交互操作
  updateLastQueryParams: (params: BusinessQueryParams) => void;

  // 重置操作
  reset: (data?: Record<string, any>[], columns?: TableColumn[], config?: TableConfig) => void;

  // 重新加载操作
  reload: (resetToFirstPage?: boolean, keepFilters?: boolean, keepSorting?: boolean) => Promise<boolean>;
}

/**
 * 表格上下文值
 */
export interface TableContextValue {
  state: TableState;
  actions: TableActions;
  // table logic hook唯一实例，用于获取table逻辑操作，不允许单独使用业务hook
  tableLogic: UseTableLogicReturn;
  // 便捷计算属性
  getRowKey: (record: Record<string, any>, index?: number) => string | number;
  isRowSelected: (key: string | number) => boolean;
  isRowExpanded: (key: string | number) => boolean;
  getSelectedRows: () => Record<string, any>[];
  getExpandedRows: () => Record<string, any>[];
  // 国际化便捷方法
  getLocale: () => string;
}

// ============ 状态管理 ============

/**
 * 创建初始状态
 */
function createInitialState(props: Omit<TableProviderProps, 'children'>): TableState {
  const { data = [], columns = [], config = {}, loading = false, error = null, pagination } = props;
  return {
    config: {
      // 基础配置
      tableId: config.tableId ?? `eas-table-id-${Date.now()}`,
      rowKey: config.rowKey ?? 'id',
      displayMode: config.displayMode ?? 'table',
      size: config.size ?? 'md',
      density: config.density ?? 'default',
      bordered: config.bordered ?? false,
      striped: config.striped ?? false,
      hoverable: config.hoverable ?? false,
      clickable: config.clickable ?? false,

      // 卡片配置 - 当显示模式为 card 时提供默认配置
      card:
        config.displayMode === 'card'
          ? deepMerge(
              {
                layout: 'grid',
                size: 'md',
                columns: 'auto',
                gap: 16,
                shadow: true,
                bordered: true,
                hoverable: true,
                titleField: 'name',
                descriptionField: 'description',
                imageField: 'image',
                minWidth: 240,
                actions: [],
              },
              config.card || {},
            )
          : undefined,

      // 功能开关
      selectable: config.selectable ?? false,
      sortable: config.sortable ?? false,
      filterable: config.filterable ?? false,
      expandable: config.expandable ?? false,
      resizeable: config.resizeable ?? false,
      fillContainer: config.fillContainer ?? false,
      fixedable: config.fixedable ?? false,
      virtualizable: config.virtualizable ?? false,
      memoizationable: config.memoizationable ?? false,
      deferredable: config.deferredable ?? false,
      pluginable: config.pluginable ?? false,
      searchable: config.searchable ?? false,
      toolbarable: config.toolbarable ?? false,
      statusBarable: config.statusBarable ?? false,
      cacheable: config.cacheable ?? false,
      persistable: config.persistable ?? false,
      rowActionable: config.rowActionable ?? false,
      contextMenuable: config.contextMenuable ?? false,
      columnHeaderActionable: config.columnHeaderActionable ?? false,
      //默认打开
      paginable: config.paginable ?? true,

      // 显示配置
      showHeader: config.showHeader ?? true,
      stickyHeader: config.stickyHeader ?? true,
      stickyHeaderOffset: config.stickyHeaderOffset ?? 0,

      // 分页配置
      pagination: deepMerge(
        {
          pageNo: 1,
          pageSize: 10,
          total: data?.length ?? 0,
        },
        config.pagination,
      ),

      // 滚动配置 - 默认启用水平滚动
      scroll: deepMerge(
        {
          x: 'auto',
          y: 'auto',
          tableMinWidth: 720,
          scrollToFirstRowOnChange: true,
        },
        config.scroll,
      ),

      /** 是固定grid table的fixed模式，开启设置table的最小宽度等 */
      fixedLayout: config.fixedLayout ?? true,

      // 虚拟滚动配置 - 基于最佳实践的默认值
      virtualization: deepMerge(
        {
          // 启用阈值：数据量超过100条时自动启用虚拟滚动
          threshold: 100,
          // 容器高度：默认400px，适合大多数场景
          height: 400,
          // 行高：48px是表格行的标准高度，兼顾内容显示和性能
          itemHeight: 48,
          // 预估行高：与itemHeight保持一致，用于动态行高场景
          estimatedItemSize: 48,
          // 预渲染数量：5-10个项目可以保证滚动流畅性，避免白屏
          overscanCount: 8,
          // 滚动方向：表格通常是垂直滚动
          scrollDirection: 'vertical' as const,
          // 滚动对齐：自动对齐提供最佳用户体验
          scrollToAlignment: 'auto' as const,
          // 固定表头：大数据表格通常需要固定表头
          stickyHeader: true,
        },
        // 合并用户配置
        config.virtualization,
      ),

      // 选择配置
      selection: config.selection ?? undefined,

      // 排序配置
      sort: config.sort ?? undefined,

      // 筛选配置
      filter: config.filter ?? undefined,

      // 展开配置
      expansion: config.expansion ?? undefined,

      // 搜索配置
      search: deepMerge(
        {
          show: true,
          showLabel: true,
          autoSearch: false,
          maxConditions: 5,
          collapsible: true,
          defaultCollapsed: false,
          mode: 'grid',
          minFieldWidth: 320,
          fields: [],
        },
        config.search,
      ),

      // 工具栏配置
      toolbar: deepMerge(
        {
          show: false,
          showExport: false,
          showPrint: false,
          showRefresh: false,
          showFullscreen: false,
          showColumnManager: false,
          maxVisible: 3,
          showLabel: false,
          size: 'sm',
          left: [],
          right: [],
        },
        config.toolbar,
      ),

      // 状态栏配置
      statusBar: deepMerge(
        {
          show: true,
          size: 'sm',
        },
        config.statusBar,
      ),

      // 列调整大小配置
      resize: deepMerge({ minWidth: 80 }, config.resize),

      // 行操作配置
      rowAction: deepMerge(
        {
          actions: [],
          maxVisible: 3,
          showLabel: false,
          showSeparator: true,
          width: 160,
          minWidth: 160,
          maxWidth: 160,
          size: 'sm',
        },
        config.rowAction,
      ),

      // 右键菜单配置
      contextMenu: deepMerge(
        {
          actions: [],
          size: 'md',
          showIcon: true,
          showSeparator: true,
          align: 'start',
        },
        config.contextMenu,
      ),

      // 列头操作配置
      columnHeaderAction: deepMerge(
        {
          actions: [],
          maxVisible: 3,
          showLabel: false,
          showSeparator: true,
        },
        config.columnHeaderAction,
      ),

      // 国际化配置（提供默认 locale 兜底）
      i18n: { locale: config?.i18n?.locale ?? 'zh-CN' },

      // 插件配置
      plugin: config.plugin ?? undefined,

      // 缓存配置
      cache: config.cache ?? undefined,

      // 样式配置
      style: config.style ?? undefined,

      // 运行时 API 配置与上传配置（由外部注入，可为空）
      api: config.api ?? undefined,
      upload: config.upload ?? undefined,

      // 业务 page 交互配置
      storePage: deepMerge({ debounceDelay: 300, triggerOnInit: false }, config.storePage),

      eventListeners: config?.eventListeners || EMPTY_OBJECT,

      // 数据处理模式配置 - 默认为远程模式
      dataMode: {
        ...config.dataMode,
        sort: config.dataMode?.sort ?? 'remote',
        filter: config.dataMode?.filter ?? 'remote',
        search: config.dataMode?.search ?? 'remote',
        pagination: config.dataMode?.pagination ?? 'remote',
        clearSelectedOnPagination: config.dataMode?.clearSelectedOnPagination ?? true,
      },
    },
    data,
    columns,
    selectedRowKeys: config?.dataMode?.clearSelectedOnPagination === false ? (config?.selection?.selectedRowKeys ?? []) : (EMPTY_ARRAY as unknown as (string | number)[]),
    expandedRowKeys: EMPTY_ARRAY as unknown as (string | number)[],
    sortState: config?.sort ?? { columnName: null, order: null },
    filterState: config?.filter || EMPTY_OBJECT,
    searchState: config?.search?.initialState || EMPTY_OBJECT,
    columnWidths: config?.resize?.columnWidths || EMPTY_OBJECT,
    pluginStates: EMPTY_OBJECT as Record<string, any>,
    loading: loading,
    error: error,
    pagination: {
      pageNo: pagination?.pageNo ?? config?.pagination?.pageNo ?? 1,
      pageSize: pagination?.pageSize ?? config?.pagination?.pageSize ?? 10,
      total: pagination?.total ?? config?.pagination?.total ?? 0,
      show: typeof pagination?.show === 'boolean' ? pagination.show : (config?.pagination?.show ?? true),
    },
    lastQueryParams: EMPTY_OBJECT as BusinessQueryParams,
  };
}

/**
 * 基础状态操作类型
 */
type BaseTableStateAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<TableConfig> }
  | { type: 'SET_DATA'; payload: Record<string, any>[] }
  | {
      type: 'UPDATE_ITEM';
      payload: {
        rowKey: string | number;
        updates: Partial<Record<string, any>>;
      };
    }
  | { type: 'REMOVE_ITEM'; payload: string | number }
  | { type: 'ADD_ITEM'; payload: { item: Record<string, any>; index?: number } }
  | { type: 'SET_COLUMNS'; payload: TableColumn[] }
  | {
      type: 'UPDATE_COLUMN';
      payload: { columnName: string; updates: Partial<TableColumn> };
    }
  | { type: 'SET_SELECTED_ROWS'; payload: (string | number)[] }
  | { type: 'TOGGLE_ROW_SELECTION'; payload: string | number }
  | { type: 'SET_EXPANDED_ROWS'; payload: (string | number)[] }
  | { type: 'TOGGLE_ROW_EXPANSION'; payload: string | number }
  | {
      type: 'SET_SORT';
      payload: { columnName: string | null; order: SortDirection | null };
    }
  | { type: 'SET_SORT_STATE'; payload: SortState }
  | {
      type: 'SET_FILTER';
      payload: { columnKey: string; value: FilterValue | undefined };
    }
  | { type: 'SET_FILTER_STATE'; payload: FilterState }
  | { type: 'CLEAR_FILTER'; payload?: string }
  | {
      type: 'SET_SEARCH_CONDITION';
      payload: { fieldKey: string; condition: SearchCondition };
    }
  | { type: 'REMOVE_SEARCH_CONDITION'; payload: string }
  | { type: 'SET_SEARCH_STATE'; payload: SearchState }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'SET_PLUGIN_STATE'; payload: { pluginId: string; state: any } }
  | { type: 'CLEAR_PLUGIN_STATE'; payload: string }
  | { type: 'CLEAR_ALL_PLUGIN_STATES' }
  | { type: 'SET_COLUMN_WIDTH'; payload: { columnKey: string; width: number } }
  | { type: 'RESET_COLUMN_WIDTHS' }
  | { type: 'UPDATE_PAGINATION'; payload: PaginationState | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_lAST_QUERY_PARAMS'; payload: BusinessQueryParams }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RELOAD'; payload?: { resetToFirstPage?: boolean } }
  | {
      type: 'RESET';
      payload?: {
        data?: Record<string, any>[];
        columns?: TableColumn[];
        config?: TableConfig;
      };
    };

/**
 * 状态操作类型（支持函数式dispatch）
 */
type TableStateAction = BaseTableStateAction | ((state: TableState) => BaseTableStateAction);

/**
 * 状态reducer
 */
function tableStateReducer(state: TableState, action: TableStateAction): TableState {
  // 支持函数式dispatch
  if (typeof action === 'function') {
    return tableStateReducer(state, action(state));
  }

  // 此时action是BaseTableStateAction类型
  const baseAction = action as BaseTableStateAction;
  switch (baseAction.type) {
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: deepMerge(state.config, baseAction.payload),
      };

    case 'SET_DATA':
      return {
        ...state,
        data: baseAction.payload,
      };

    case 'UPDATE_ITEM': {
      const { rowKey, updates } = baseAction.payload;
      const index = state.data.findIndex((item) => getRowKeyValue(item, state.data.indexOf(item), state.config.rowKey) === rowKey);
      if (index !== -1) {
        const newData = [...state.data];
        newData[index] = { ...newData[index], ...updates };
        return {
          ...state,
          data: newData,
        };
      }
      return state;
    }

    case 'REMOVE_ITEM': {
      const rowKey = baseAction.payload;
      const index = state.data.findIndex((item) => getRowKeyValue(item, state.data.indexOf(item), state.config.rowKey) === rowKey);
      if (index !== -1) {
        const newData = [...state.data];
        newData.splice(index, 1);
        return {
          ...state,
          data: newData,
        };
      }
      return state;
    }

    case 'ADD_ITEM': {
      const { item, index } = baseAction.payload;
      const newData = [...state.data];
      if (index !== undefined) {
        newData.splice(index, 0, item);
      } else {
        newData.push(item);
      }
      return {
        ...state,
        data: newData,
      };
    }

    case 'SET_COLUMNS':
      return {
        ...state,
        columns: baseAction.payload,
      };

    case 'UPDATE_COLUMN': {
      const { columnName, updates } = baseAction.payload;
      const index = state.columns.findIndex((column) => column.name === columnName);
      if (index !== -1) {
        const newColumns = [...state.columns];
        // `noUncheckedIndexedAccess` 下索引访问可能为 undefined，
        // 但此处已由 `index !== -1` 保证元素存在
        const target = newColumns[index]!;
        newColumns[index] = { ...target, ...updates };
        return {
          ...state,
          columns: newColumns,
        };
      }
      return state;
    }

    case 'SET_SELECTED_ROWS':
      return {
        ...state,
        selectedRowKeys: baseAction.payload,
      };

    case 'TOGGLE_ROW_SELECTION': {
      const key = baseAction.payload;
      const isSelected = state.selectedRowKeys.includes(key);
      return {
        ...state,
        selectedRowKeys: isSelected ? state.selectedRowKeys.filter((k) => k !== key) : [...state.selectedRowKeys, key],
      };
    }

    case 'SET_EXPANDED_ROWS':
      return {
        ...state,
        expandedRowKeys: baseAction.payload,
      };

    case 'TOGGLE_ROW_EXPANSION': {
      const key = baseAction.payload;
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

      return {
        ...state,
        expandedRowKeys: newExpandedKeys,
      };
    }

    case 'SET_SORT':
      return {
        ...state,
        sortState: baseAction.payload,
      };

    case 'SET_SORT_STATE':
      return {
        ...state,
        sortState: baseAction.payload,
      };

    case 'SET_FILTER':
      return {
        ...state,
        filterState: {
          ...state.filterState,
          [baseAction.payload.columnKey]: baseAction.payload.value,
        },
      };

    case 'SET_FILTER_STATE':
      return {
        ...state,
        filterState: baseAction.payload,
      };

    case 'CLEAR_FILTER':
      if (baseAction.payload) {
        const { [baseAction.payload]: removed, ...rest } = state.filterState;
        return { ...state, filterState: rest };
      } else {
        return { ...state, filterState: {} };
      }
    case 'SET_SEARCH_CONDITION': {
      const { fieldKey, condition } = baseAction.payload;
      return {
        ...state,
        searchState: {
          ...state.searchState,
          [fieldKey]: condition,
        },
      };
    }

    case 'REMOVE_SEARCH_CONDITION': {
      const { [baseAction.payload]: removed, ...rest } = state.searchState;
      return {
        ...state,
        searchState: rest,
      };
    }

    case 'SET_SEARCH_STATE':
      return {
        ...state,
        searchState: baseAction.payload,
      };

    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchState: {},
      };

    case 'SET_PLUGIN_STATE': {
      const { pluginId, state: newState } = baseAction.payload;
      return {
        ...state,
        pluginStates: {
          ...state.pluginStates,
          [pluginId]: newState,
        },
      };
    }

    case 'CLEAR_PLUGIN_STATE': {
      const { [baseAction.payload]: _, ...remainingStates } = state.pluginStates;
      return {
        ...state,
        pluginStates: remainingStates,
      };
    }

    case 'CLEAR_ALL_PLUGIN_STATES':
      return {
        ...state,
        pluginStates: {},
      };

    case 'SET_COLUMN_WIDTH':
      return {
        ...state,
        columnWidths: {
          ...state.columnWidths,
          [baseAction.payload.columnKey]: baseAction.payload.width,
        },
      };

    case 'RESET_COLUMN_WIDTHS':
      return {
        ...state,
        columnWidths: {},
      };

    case 'UPDATE_PAGINATION':
      return {
        ...state,
        pagination: deepMerge(state.pagination, baseAction.payload),
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: baseAction.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: baseAction.payload,
      };

    case 'UPDATE_lAST_QUERY_PARAMS':
      // 注意：必须使用“替换”而不是深度合并，否则在清空 filter/search 时
      // 旧的键会被 deepMerge 保留下来，导致 previousParams 与 currentParams
      // 永远不相等，从而触发无限次的相同回调提交。
      return {
        ...state,
        lastQueryParams: baseAction.payload,
      };

    case 'RESET':
      return createInitialState({
        data: baseAction.payload?.data || state.data,
        columns: baseAction.payload?.columns || state.columns,
        config: baseAction.payload?.config || state.config,
      });
    case 'RELOAD':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          reloadTrigger: (state.pagination?.reloadTrigger ?? 0) + 1,
          pageNo: baseAction?.payload?.resetToFirstPage ? 1 : state.pagination.pageNo,
        },
      };

    default:
      return state;
  }
}

// ============ 上下文定义 ============

const TableContext = createContext<TableContextValue | null>(null);

/**
 * TableProvider Props
 */
export interface TableProviderProps {
  children: React.ReactNode;
  data?: Record<string, any>[];
  columns?: TableColumn[];
  config?: TableConfig;
  loading?: boolean;
  error?: string | null;
  /** 直接传入的分页信息（优先于 config.pagination），供外部数据源驱动分页 */
  pagination?: PaginationState;
}

/**
 * 表格上下文提供者
 */
export function TableProvider({ children, data = [], columns = [], config = {}, loading = false, error = null, pagination }: TableProviderProps) {
  const [state, dispatch] = useReducer(tableStateReducer, { data, columns, config, loading, error, pagination }, createInitialState);

  // 创建操作方法
  const actions: TableActions = useMemo(
    () => ({
      updateConfig: (config) => dispatch({ type: 'UPDATE_CONFIG', payload: config }),
      setData: (data) => dispatch({ type: 'SET_DATA', payload: data }),
      updateItem: (rowKey, updates) => {
        dispatch({ type: 'UPDATE_ITEM', payload: { rowKey, updates } });
      },
      removeItem: (rowKey) => {
        dispatch({ type: 'REMOVE_ITEM', payload: rowKey });
      },
      addItem: (item, index) => {
        dispatch({ type: 'ADD_ITEM', payload: { item, index } });
      },
      setColumns: (columns) => dispatch({ type: 'SET_COLUMNS', payload: columns }),
      updateColumn: (columnName, updates) => {
        dispatch({ type: 'UPDATE_COLUMN', payload: { columnName, updates } });
      },

      setSelectedRowKeys: (keys) => dispatch({ type: 'SET_SELECTED_ROWS', payload: keys }),
      toggleRowSelection: (key) => dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: key }),
      selectAll: () => {
        // 使用dispatch的函数形式获取最新状态，避免闭包问题
        dispatch((currentState) => {
          // 获取当前筛选和分页后的可见数据
          let data = currentState.data;

          // 使用新的综合数据处理函数
          const validFilterState = Object.fromEntries(Object.entries(currentState.filterState).filter(([, value]) => value !== undefined)) as Record<string, FilterValue>;

          const validSearchState = Object.fromEntries(Object.entries(currentState.searchState).filter(([, value]) => value !== undefined)) as Record<string, SearchCondition>;

          data = processTableData(data, {
            filterState: validFilterState,
            searchState: validSearchState,
            sortState: currentState.sortState,
            paginationState: currentState.pagination,
            dataMode: currentState.config.dataMode,
            columns: currentState.columns,
          });

          const visibleKeys = data.map((record, index) => getRowKeyValue(record, index, currentState.config.rowKey));
          return { type: 'SET_SELECTED_ROWS', payload: visibleKeys };
        });
      },
      clearSelection: () => {
        // 值对比优化：如果已经为空，则跳过
        if (isEmpty(state.selectedRowKeys)) {
          return;
        }
        dispatch({ type: 'SET_SELECTED_ROWS', payload: [] as (string | number)[] });
      },

      setExpandedRowKeys: (keys) => {
        // 值对比优化：如果展开行键相同，则跳过
        if (deepValueEqual(state.expandedRowKeys, keys)) {
          return;
        }
        dispatch({ type: 'SET_EXPANDED_ROWS', payload: keys });
      },
      toggleRowExpansion: (key) => dispatch({ type: 'TOGGLE_ROW_EXPANSION', payload: key }),
      expandAll: () => {
        // 获取当前页所有可展开的行键
        // 使用与 selectAll 相同的逻辑，只展开当前可见的数据
        const validFilterState = Object.fromEntries(Object.entries(state.filterState).filter(([, value]) => value !== undefined)) as Record<string, FilterValue>;

        const validSearchState = Object.fromEntries(Object.entries(state.searchState).filter(([, value]) => value !== undefined)) as Record<string, SearchCondition>;

        const allKeys = processTableData(state.data, {
          filterState: validFilterState,
          searchState: validSearchState,
          sortState: state.sortState,
          paginationState: state.pagination,
          dataMode: state.config.dataMode,
          columns: state.columns,
        }).map((record, index) => getRowKeyValue(record, index, state.config.rowKey));
        // 注意：不做值对比优化，因为expandedRowKeys是跨页的，而这里只处理当前页数据
        dispatch({ type: 'SET_EXPANDED_ROWS', payload: allKeys });
      },
      collapseAll: () => {
        // 值对比优化：如果已经全部折叠，则跳过
        if (isEmpty(state.expandedRowKeys)) {
          return;
        }
        dispatch({ type: 'SET_EXPANDED_ROWS', payload: [] as (string | number)[] });
      },

      setSort: (columnName, order) => {
        // 值对比优化：避免相同排序的重复更新
        const newSort = { columnName, order };
        if (deepValueEqual(state.sortState, newSort)) {
          return;
        }

        dispatch({ type: 'SET_SORT', payload: newSort });
        // 排序时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      setSortState: (sortState) => {
        // 值对比优化：避免相同排序状态的重复更新
        if (deepValueEqual(state.sortState, sortState)) {
          return;
        }

        dispatch({ type: 'SET_SORT_STATE', payload: sortState });
        // 排序时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      clearSort: () => {
        // 值对比优化：如果排序状态已经为空，则跳过
        const emptySortState = { columnName: null, order: null };
        if (deepValueEqual(state.sortState, emptySortState)) {
          return;
        }

        dispatch({
          type: 'SET_SORT',
          payload: emptySortState,
        });
        // 清空排序时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },

      setFilter: (columnKey, value) => {
        // 值对比优化：如果筛选值相同，则跳过
        if (deepValueEqual(state.filterState[columnKey], value)) {
          return;
        }

        dispatch({ type: 'SET_FILTER', payload: { columnKey, value } });
        // 筛选时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      setFilterState: (filterState) => {
        // 值对比优化：避免相同筛选状态的重复更新
        if (deepValueEqual(state.filterState, filterState)) {
          return;
        }

        dispatch({ type: 'SET_FILTER_STATE', payload: filterState });
        // 筛选时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      clearFilter: (columnKey) => {
        // 值对比优化：如果指定列的筛选已经为空，则跳过
        if (columnKey && isEmpty(state.filterState[columnKey])) {
          return;
        }
        // 如果没有指定列且整个筛选状态为空，则跳过
        if (!columnKey && isEmpty(state.filterState)) {
          return;
        }

        dispatch({ type: 'CLEAR_FILTER', payload: columnKey });
        // 清空筛选时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      setSearchCondition: (fieldKey: string, condition: SearchCondition) => {
        // 值对比优化：如果搜索条件相同，则跳过
        if (deepValueEqual(state.searchState[fieldKey], condition)) {
          return;
        }

        dispatch({
          type: 'SET_SEARCH_CONDITION',
          payload: { fieldKey, condition },
        });
        // 搜索时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      removeSearchCondition: (fieldKey: string) => {
        // 值对比优化：如果搜索条件已经为空，则跳过
        if (isEmpty(state.searchState[fieldKey])) {
          return;
        }

        dispatch({ type: 'REMOVE_SEARCH_CONDITION', payload: fieldKey });
        // 搜索时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      removeSearchConditionByField: (fieldKey: string) => {
        // 值对比优化：如果搜索条件已经为空，则跳过
        if (isEmpty(state.searchState[fieldKey])) {
          return;
        }

        dispatch({ type: 'REMOVE_SEARCH_CONDITION', payload: fieldKey });
        // 搜索时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      setSearchState: (searchState) => {
        // 值对比优化：避免相同筛选状态的重复更新
        if (deepValueEqual(state.searchState, searchState)) {
          return;
        }

        dispatch({ type: 'SET_SEARCH_STATE', payload: searchState });
        // 搜索时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },
      clearSearch: () => {
        // 值对比优化：如果搜索状态已经为空，则跳过
        if (isEmpty(state.searchState)) {
          return;
        }

        dispatch({ type: 'CLEAR_SEARCH' });
        // 搜索时重置到第一页（仅当当前页不是第1页时）
        if (state.pagination && state.pagination.pageNo !== 1) {
          dispatch({
            type: 'UPDATE_PAGINATION',
            payload: { ...state.pagination, pageNo: 1 },
          });
        }
      },

      // 插件状态操作
      setPluginState: (pluginId, pluginState) => {
        // 值对比优化：如果插件状态相同，则跳过
        const curPluginState = state.pluginStates[pluginId] || EMPTY_OBJECT;
        //TODO: 先不做值对比优化，因为插件状态获取和渲染是，值值存在不一致的bug，导致无法更新状态
        // if (deepValueEqual(curPluginState, pluginState)) {
        //   return;
        // }
        dispatch({
          type: 'SET_PLUGIN_STATE',
          payload: { pluginId, state: deepMerge(curPluginState, pluginState) },
        });
      },
      getPluginState: (pluginId) => {
        return state.pluginStates[pluginId];
      },
      clearPluginState: (pluginId) => {
        // 值对比优化：如果插件状态已经为空，则跳过
        if (isEmpty(state.pluginStates[pluginId])) {
          return;
        }
        dispatch({ type: 'CLEAR_PLUGIN_STATE', payload: pluginId });
      },
      clearAllPluginStates: () => {
        // 值对比优化：如果所有插件状态已经为空，则跳过
        if (isEmpty(state.pluginStates)) {
          return;
        }
        dispatch({ type: 'CLEAR_ALL_PLUGIN_STATES' });
      },

      setColumnWidth: (columnKey, width) => dispatch({ type: 'SET_COLUMN_WIDTH', payload: { columnKey, width } }),
      resetColumnWidths: () => dispatch({ type: 'RESET_COLUMN_WIDTHS' }),

      updatePagination: (newPagination) => {
        // 值对比优化：避免相同分页状态的重复更新
        if (deepValueEqual(state.pagination, newPagination)) {
          return;
        }
        dispatch({ type: 'UPDATE_PAGINATION', payload: newPagination });
      },

      setLoading: (loading) => {
        // 值对比优化：如果loading状态相同，则跳过
        if (state.loading === loading) {
          return;
        }
        dispatch({ type: 'SET_LOADING', payload: loading });
      },
      setError: (error) => {
        // 值对比优化：如果错误信息相同，则跳过
        if (deepValueEqual(state.error, error)) {
          return;
        }
        dispatch({ type: 'SET_ERROR', payload: error });
      },
      updateLastQueryParams: (params: BusinessQueryParams) => {
        if (deepValueEqual(state.lastQueryParams, params)) {
          return;
        }
        dispatch({ type: 'UPDATE_lAST_QUERY_PARAMS', payload: params });
      },
      reset: (data?: Record<string, any>[], columns?: TableColumn[], config?: TableConfig) => {
        dispatch({ type: 'RESET', payload: { data, columns, config } });
      },
      reload: (resetToFirstPage = false, keepFilters = true, keepSorting = true) => {
        if (!keepFilters) {
          dispatch({ type: 'CLEAR_FILTER' });
          dispatch({ type: 'CLEAR_SEARCH' });
        }
        if (!keepSorting) {
          dispatch({
            type: 'SET_SORT',
            payload: { columnName: null, order: null },
          });
        }

        dispatch({ type: 'RELOAD', payload: { resetToFirstPage } });

        return Promise.resolve(true);
      },
    }),
    [state], // 修改依赖项，包含完整的state以确保selectAll能访问到最新状态
  );

  // 工具函数
  const getRowKey = useCallback(
    (record: Record<string, any>, index?: number): string | number => {
      return getRowKeyValue(record, index, state.config.rowKey);
    },
    [state.config.rowKey],
  );

  const isRowSelected = useCallback(
    (key: string | number): boolean => {
      return state.selectedRowKeys.includes(key);
    },
    [state.selectedRowKeys],
  );

  const isRowExpanded = useCallback(
    (key: string | number): boolean => {
      return state.expandedRowKeys.includes(key);
    },
    [state.expandedRowKeys],
  );

  const getSelectedRows = useCallback((): Record<string, any>[] => {
    return state.data.filter((record, index) => {
      const key = getRowKeyValue(record, index, state.config.rowKey);
      return state.selectedRowKeys.includes(key);
    });
  }, [state.data, state.selectedRowKeys, state.config.rowKey]);

  const getExpandedRows = useCallback((): Record<string, any>[] => {
    return state.data.filter((record, index) => {
      const key = getRowKeyValue(record, index, state.config.rowKey);
      return state.expandedRowKeys.includes(key);
    });
  }, [state.data, state.expandedRowKeys, state.config.rowKey]);

  // 国际化便捷方法
  const getLocale = useCallback((): string => {
    let locale = state.config.i18n?.locale;
    if (!locale) {
      try {
        locale = getLocaleOnClient() || 'zh-CN';
      } catch (error) {
        locale = 'zh-CN';
      }
    }
    return locale;
  }, [state.config.i18n?.locale]);

  // 使用ref来解决循环依赖问题
  const contextRef = useRef<TableContextValue | null>(null);

  const contextValue: TableContextValue = useMemo(() => {
    const context = {
      state,
      actions,
      getRowKey,
      isRowSelected,
      isRowExpanded,
      getSelectedRows,
      getExpandedRows,
      getLocale,
      tableLogic: {} as any, // 临时占位，后面会被替换
    };
    contextRef.current = context;
    return context;
  }, [state, actions, getRowKey, isRowSelected, isRowExpanded, getSelectedRows, getExpandedRows, getLocale]);

  const tableLogic = useHookTableLogic(contextValue);

  // 更新contextValue中的tableLogic引用，确保是同一个实例
  if (contextRef.current) {
    contextRef.current.tableLogic = tableLogic;
  }

  // 监听 data 和 columns 属性变化，更新内部状态
  const prevDataRef = useRef(data);
  const prevColumnsRef = useRef(columns);
  const paginationRef = useRef(pagination);
  const loadingRef = useRef(loading);

  useEffect(() => {
    if (!deepValueEqual(prevDataRef.current, data)) {
      actions.setData(data);
      prevDataRef.current = data;
    }
  }, [data, actions]);

  useEffect(() => {
    if (!deepValueEqual(prevColumnsRef.current, columns)) {
      actions.setColumns(columns);
      prevColumnsRef.current = columns;
    }
  }, [columns, actions]);

  useEffect(() => {
    if (!isEmpty(pagination) && !deepValueEqual(paginationRef.current, pagination)) {
      actions.updatePagination({ ...state.pagination, ...pagination });
      paginationRef.current = pagination as PaginationState;
    }
  }, [pagination, actions, state.pagination]);

  useEffect(() => {
    if (!deepValueEqual(loadingRef.current, loading)) {
      actions.setLoading(loading);
      loadingRef.current = loading;
    }

    if (!isEmpty(error)) {
      actions.setError(error);
    }
  }, [loading, error, actions]);

  return <TableContext.Provider value={contextRef.current}>{children}</TableContext.Provider>;
}

// ============ Hooks ============

/**
 * 使用表格上下文
 */
export function useTableContext(): TableContextValue {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
}

/**
 * 使用表格状态
 * 支持选择器模式，可以精确订阅需要的状态片段
 */
export function useTableState(): TableState;
export function useTableState<T>(selector: (state: TableState) => T): T;
export function useTableState<T>(selector?: (state: TableState) => T) {
  const { state } = useTableContext();

  return useMemo(() => {
    if (selector) {
      return selector(state);
    }
    return state;
  }, [state, selector]);
}

export function useHasTableContext(): boolean {
  const context = useContext(TableContext);
  return !!context;
}

export function useTableLogic(): UseTableLogicReturn {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }

  return context.tableLogic;
}

/**
 * 使用表格状态的便捷选择器
 */
export const useTableStateSelectors = {
  // 数据相关
  useData: () => useTableState((state) => state.data),
  useColumns: () => useTableState((state) => state.columns),

  // 选择相关
  useSelectedRowKeys: () => useTableState((state) => state.selectedRowKeys),
  useSelectedCount: () => useTableState((state) => state.selectedRowKeys.length),
  useIsAllSelected: () => useTableState((state) => state.data.length > 0 && state.selectedRowKeys.length === state.data.length),
  useIsPartialSelected: () => useTableState((state) => state.selectedRowKeys.length > 0 && state.selectedRowKeys.length < state.data.length),

  // 展开相关
  useExpandedRowKeys: () => useTableState((state) => state.expandedRowKeys),
  useExpandedCount: () => useTableState((state) => state.expandedRowKeys.length),

  // 排序相关
  useSortState: () => useTableState((state) => state.sortState),
  useSortField: () => useTableState((state) => state.sortState.columnName),
  useSortOrder: () => useTableState((state) => state.sortState.order),

  // 筛选相关
  useFilterState: () => useTableState((state) => state.filterState),
  useActiveFilters: () =>
    useTableState((state) =>
      Object.keys(state.filterState).filter((key) => {
        const filterValue = state.filterState[key];
        return filterValue && !isEmpty(filterValue.value);
      }),
    ),

  // 搜索相关
  useSearchState: () => useTableState((state) => state.searchState),
  useHasActiveSearch: () => useTableState((state) => !isEmpty(state.searchState)),

  // 列宽相关
  useColumnWidths: () => useTableState((state) => state.columnWidths),

  // UI状态相关
  useLoading: () => useTableState((state) => state.loading),
  useError: () => useTableState((state) => state.error),

  // 分页相关
  usePagination: () => useTableState((state) => state.pagination),

  //插件状态相关
  usePluginState: (pluginId: string) => useTableState((state) => state.pluginStates[pluginId]),
  usePluginStates: () => useTableState((state) => state.pluginStates),

  // 配置相关
  useConfig: () => useTableState((state) => state.config),
  useRowKey: () => useTableState((state) => state.config.rowKey),
  useSize: () => useTableState((state) => state.config.size),
  useDensity: () => useTableState((state) => state.config.density),

  // 功能开关
  useSelectable: () => useTableState((state) => state.config.selectable),
  useSortable: () => useTableState((state) => state.config.sortable),
  useFilterable: () => useTableState((state) => state.config.filterable),
  useExpandable: () => useTableState((state) => state.config.expandable),
  useResizeable: () => useTableState((state) => state.config.resizeable),
  usePaginable: () => useTableState((state) => state.config.paginable),
};

/**
 * 使用表格操作
 */
export function useTableActions() {
  return useTableContext().actions;
}

/**
 * 使用表格配置
 */
export function useTableConfig() {
  return useTableContext().state.config;
}

// ============ 工具函数 ============

/**
 * 获取行键值
 */
function getRowKeyValue(record: Record<string, any>, index?: number, rowKey = 'id'): string {
  const keyValue = record[rowKey];
  return keyValue !== undefined && keyValue !== null ? String(keyValue) : String(index);
}
