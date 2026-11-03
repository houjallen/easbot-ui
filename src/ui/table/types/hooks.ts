/**
 * 表格Hook类型定义
 * 定义所有表格相关的Hook接口和配置类型
 * 与 schema 体系保持一致
 */

import type { TableState } from '../context/TableContext';
import type { TableActions } from '../context/TableContext';
import type { TableContextValue } from '../context/TableContext';
import type { UseTablePaginationLogicReturn } from '../hooks/useTablePagination';
import type { TableStorePageOptions, UseTableStorePageReturn } from '../hooks/useTableStorePage';
import React from 'react';
import type {
  ActionConfig,
  ActionEventData,
  DataModeConfig,
  ExpansionConfig,
  FilterConfig,
  I18nConfig,
  PaginationConfig,
  PerformanceConfig,
  PluginConfig,
  ResizeConfig,
  SearchCondition,
  SearchConfig,
  SearchState,
  SelectionConfig,
  SortConfig,
  TableColumn,
  VirtualizationConfig,
} from './base';

// ============ 状态管理Hook类型 ============

/**
 * 表格状态Hook返回值
 */

// ============ 选择功能Hook类型 ============

// ============ 排序功能Hook类型 ============
// ============ 筛选功能Hook类型 ============

// ============ 展开功能Hook类型 ============
// ============ 列宽调整Hook类型 ============

// ============ 虚拟滚动Hook类型 ============

// ============ 分页Hook类型 ============
// ============ 插件系统Hook类型 ============

/**
 * 插件类型枚举
 */
export type TablePluginType = 'data' | 'ui' | 'action' | 'hybrid';

/**
 * 插件通用消息key规范
 * 定义插件必须提供的标准消息key，外部可通过这些key获取统一信息
 */
export interface TablePluginStandardMessages {
  /** 插件标题/名称 */
  title: string;
  /** 插件描述 */
  description?: string;
  /** 插件工具提示 */
  tooltip?: string;
  /** 启用状态文本 */
  enabled?: string;
  /** 禁用状态文本 */
  disabled?: string;
  /** 加载中文本 */
  loading?: string;
  /** 错误信息 */
  error?: string;
  /** 成功信息 */
  success?: string;
}

/**
 * 插件国际化消息类型
 * 支持多语言的插件消息定义，包含标准key和自定义key
 */
export interface TablePluginMessages {
  /** 中文消息 */
  'zh-CN'?: TablePluginStandardMessages & Record<string, any>;
  /** 英文消息 */
  'en-US'?: TablePluginStandardMessages & Record<string, any>;
  /** 其他语言消息 */
  [locale: string]: (TablePluginStandardMessages & Record<string, any>) | undefined;
}

/**
 * 表格插件位置类型
 */
export type TablePluginPositionType = 'table' | 'row' | 'column' | 'cell';

/**
 * 表格级插件位置
 */
export type TablePluginTablePosition = 'toolbar.left' | 'toolbar.right' | 'toolbar' | 'search.panel' | 'table.header' | 'table.footer';

/**
 * 行级插件位置
 */
export type TablePluginRowPosition = 'row.actions' | 'row.contextMenu';

/**
 * 列级插件位置
 */
export type TablePluginColumnPosition = 'column.actions' | 'column.header' | 'column.footer';

/**
 * 单元格级插件位置
 */
export type TablePluginCellPosition = 'cell.content' | 'cell.overlay' | 'cell.contextMenu' | 'cell.actions';

/**
 * 所有插件位置的联合类型
 */
export type TablePluginPosition = TablePluginTablePosition | TablePluginRowPosition | TablePluginColumnPosition | TablePluginCellPosition;

/**
 * 插件贡献点位置枚举（保持向后兼容）
 */
export enum TablePluginContributionPoint {
  /** 工具栏左侧 */
  TOOLBAR_LEFT = 'toolbar.left',
  /** 工具栏右侧 */
  TOOLBAR_RIGHT = 'toolbar.right',
  /** 工具栏通用 */
  TOOLBAR = 'toolbar',
  /** 搜索面板 */
  SEARCH_PANEL = 'search.panel',
  /** 表格头部 */
  TABLE_HEADER = 'table.header',
  /** 表格底部 */
  TABLE_FOOTER = 'table.footer',
  /** 行操作 */
  ROW_ACTIONS = 'row.actions',
  /** 行右键菜单 */
  ROW_CONTEXT_MENU = 'row.contextMenu',
  /** 列操作 */
  COLUMN_ACTIONS = 'column.actions',
  /** 列头部 */
  COLUMN_HEADER = 'column.header',
  /** 列底部 */
  COLUMN_FOOTER = 'column.footer',
  /** 单元格内容 */
  CELL_CONTENT = 'cell.content',
  /** 单元格覆盖层 */
  CELL_OVERLAY = 'cell.overlay',
  /** 单元格右键菜单 */
  CELL_CONTEXT_MENU = 'cell.contextMenu',
  /** 单元格操作 */
  CELL_ACTIONS = 'cell.actions',
}

/**
 * 表格级插件动作配置
 */
export interface TablePluginTableActionConfig extends ActionConfig {
  /** 动作位置数组 - 支持在表格类型的多个位置显示 */
  position: TablePluginTablePosition[];
  /** 动作优先级 */
  priority?: number;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (selectedRows?: Record<string, any>[], context?: TableContextValue, action?: ActionConfig) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (selectedRows?: Record<string, any>[], context?: TablePluginContext, action?: ActionConfig, event?: React.MouseEvent) => void | Promise<void>;
  /** 自定义渲染函数 - 插件动作特有的参数结构 */
  render?: (selectedRows?: Record<string, any>[], context?: TablePluginContext, action?: ActionConfig) => React.ReactNode;
}

/**
 * 行级插件动作配置
 */
export interface TablePluginRowActionConfig extends ActionConfig {
  /** 动作位置数组 - 支持在行类型的多个位置显示 */
  position: TablePluginRowPosition[];
  /** 动作优先级 */
  priority?: number;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (record?: Record<string, any>, context?: TablePluginContext, action?: ActionConfig) => void | Promise<void>;
  /** 自定义渲染函数 - 插件动作特有的参数结构 */
  render?: (record?: Record<string, any>, context?: TablePluginContext, action?: ActionConfig) => React.ReactNode;
}

/**
 * 列级插件动作配置
 */
export interface TablePluginColumnActionConfig extends ActionConfig {
  /** 动作位置数组 - 支持在列类型的多个位置显示 */
  position: TablePluginColumnPosition[];
  /** 动作优先级 */
  priority?: number;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (column?: TableColumn, context?: TableContextValue, action?: ActionConfig) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (column?: TableColumn, context?: TablePluginContext, action?: ActionConfig) => void | Promise<void>;
  /** 自定义渲染函数 - 插件动作特有的参数结构 */
  render?: (column?: TableColumn, context?: TablePluginContext, action?: ActionConfig) => React.ReactNode;
}

/**
 * 单元格级插件动作配置
 */
export interface TablePluginCellActionConfig extends ActionConfig {
  /** 动作位置数组 - 支持在单元格类型的多个位置显示 */
  position: TablePluginCellPosition[];
  /** 动作优先级 */
  priority?: number;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig, column?: TableColumn) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (record?: Record<string, any>, context?: TablePluginContext, action?: ActionConfig, column?: TableColumn) => void | Promise<void>;
  /** 自定义渲染函数 - 插件动作特有的参数结构 */
  render?: (record?: Record<string, any>, context?: TablePluginContext, action?: ActionConfig, column?: TableColumn) => React.ReactNode;
}

/**
 * 所有插件动作配置的联合类型
 */
export type TablePluginActionConfig = TablePluginTableActionConfig | TablePluginRowActionConfig | TablePluginColumnActionConfig | TablePluginCellActionConfig;

/**
 * 插件动作配置
 */
export type TablePluginTableAction = TablePluginTableActionConfig;

/**
 * 行插件动作配置
 */
export type TablePluginRowAction = TablePluginRowActionConfig;

/**
 * 列插件动作配置
 */
export type TablePluginColumnAction = TablePluginColumnActionConfig;

/**
 * 单元格插件动作配置
 */
export type TablePluginCellAction = TablePluginCellActionConfig;

/**
 * 插件贡献配置
 */
export interface TablePluginContribution {
  /** 贡献点位置 */
  point: TablePluginContributionPoint;
  /** 优先级，数字越小优先级越高 */
  priority?: number;
  /** 分组，同组内的贡献会被归类显示 */
  group?: string;
  /** 显示条件 */
  when?: string | ((context: TablePluginContext) => boolean);
}

/**
 * 插件命令定义，参考 VSCode 命令系统
 */
export interface TablePluginCommand {
  /** 命令ID */
  command: string;
  /** 命令标题 */
  title: string;
  /** 命令分类 */
  category?: string;
  /** 命令图标 */
  icon?: React.ReactNode;
  /** 命令处理函数 */
  handler: (context: TablePluginContext, ...args: any[]) => void | Promise<void>;
  /** 启用条件 */
  enablement?: string | ((context: TablePluginContext) => boolean);
}

/**
 * 插件菜单项定义
 */
export interface TablePluginMenuItem extends ActionConfig {
  /** 贡献配置 */
  contribution: TablePluginContribution;
  /** 关联的命令ID */
  command?: string;
  /** 子菜单 */
  submenu?: TablePluginMenuItem[];
}

/**
 * 表格插件接口
 */
export interface TablePlugin {
  /** 插件ID */
  id?: string;
  /** 插件名称 */
  name: string;
  /** 插件类型 */
  type?: TablePluginType;
  /** 插件位置类型 */
  positionType?: TablePluginPositionType;
  /** 插件描述 */
  description?: string;
  /** 插件版本 */
  version?: string;
  /** 插件依赖 */
  dependencies?: string[];
  /** 插件配置 每个插件自己的配置定义 */
  config?: { enabled?: boolean; [key: string]: any };
  /** 插件功能 */
  features?: string[];
  /** 默认状态 */
  defaultState?: any;
  /** 插件国际化消息 */
  messages?: TablePluginMessages;
  /** 插件钩子 */
  hooks?: Record<string, (...args: any[]) => any>;
  /** 插件初始化 */
  init?: (context: TablePluginContext) => void;
  /** 插件销毁 */
  destroy?: (context: TablePluginContext) => void;
  /** 启用插件 */
  enable?: (context: TablePluginContext) => void;
  /** 禁用插件 */
  disable?: (context: TablePluginContext) => void;
  /** 更新配置 */
  updateConfig?: (config: any, context: TablePluginContext) => void;
  /** 数据转换 */
  transformData?: (data: Record<string, any>[], context: TablePluginContext) => Record<string, any>[];
  /** 列转换 */
  transformColumns?: (columns: TableColumn[], context: TablePluginContext) => TableColumn[];
  /** 事件处理 */
  onEvent?: (event: string, ...args: any[]) => void;
  /** 插件命令定义 */
  commands?: TablePluginCommand[];
  /** 插件菜单项定义 */
  menus?: TablePluginMenuItem[];
  /** 插件动作配置 - 统一的UI渲染和交互定义 */
  actions?: TablePluginActionConfig[];
}

/**
 * 表格插件上下文
 */
export interface TablePluginContext {
  /** 表格状态 */
  tableContext: TableContextValue;
  /** 更新插件状态存储 */
  updateState?: (newState?: Record<string, any>) => void;
  /** 事件发射器 */
  emit?: (event: string, ...args: any[]) => void;
  /** 事件监听器 */
  on?: (event: string, handler: (...args: any[]) => void) => void;
  /** 移除事件监听器 */
  off?: (event: string, handler: (...args: any[]) => void) => void;
  /** 插件消息处理器 */
  processMessage?: (key: string, messages?: Record<string, Record<string, any>>, params?: Record<string, any>) => string;
  /** 其他扩展属性 */
  [key: string]: any;
}

/**
 * 表格插件配置
 */
export interface UseTablePluginOptions {
  /** 插件列表 */
  plugins?: TablePlugin[];
  /** 插件上下文 */
  context?: TablePluginContext;
  /** 是否启用插件系统 */
  enabled?: boolean;
}

/**
 * 表格插件Hook返回值
 */
export interface UseTablePluginReturn {
  /** 插件状态 */
  pluginStates: Record<string, any>;
  /** 已注册插件 */
  registeredPlugins: TablePlugin[];
  /** 注册插件 */
  registerPlugin: (plugin: TablePlugin) => void;
  /** 卸载插件 */
  unregisterPlugin: (pluginId: string) => void;
  /** 获取插件 */
  getPlugin: (pluginId: string) => TablePlugin | undefined;
  /** 检查插件是否已注册 */
  isPluginRegistered: (pluginId: string) => boolean;
  /** 启用/禁用插件 */
  togglePlugin: (pluginId: string, enable: boolean) => void;
  /** 获取插件状态 */
  getPluginState: (pluginId: string) => any;
  /** 更新插件状态 */
  updatePluginState: (pluginId: string, state: any) => void;
  /** 获取插件配置 */
  getPluginConfig: (pluginId: string) => any;
  /** 更新插件配置 */
  updatePluginConfig: (pluginId: string, config: any) => void;
  /** 执行插件钩子 */
  executeHook: (hookName: string, ...args: any[]) => any[];
  /** 数据转换 */
  transformData: (data: Record<string, any>[]) => Record<string, any>[];
  /** 列转换 */
  transformColumns: (columns: TableColumn[]) => TableColumn[];
  /** 获取指定位置的渲染组件 - 支持单个位置或多个位置 */
  getRendersByPosition: (position: TablePluginPosition | TablePluginPosition[]) => TablePluginActionConfig[];
  /** 获取所有插件动作 */
  getAllActions: () => TablePluginActionConfig[];
  /** 获取指定插件的动作 */
  getPluginActions: (pluginId: string) => TablePluginActionConfig[];
  /** 执行插件动作 */
  executeAction: (actionKey: string, pluginId?: string) => void | Promise<void>;
  /** 获取插件的标准消息 */
  getPluginStandardMessage: (pluginId: string, key: string, locale?: string) => string | undefined;
}

// ============ 国际化Hook类型 ============

/**
 * 表格国际化配置
 */
export interface UseTableI18nOptions {
  /** 当前语言 */
  locale?: string;
  /** 翻译函数 */
  t?: (key: string, params?: Record<string, any>) => string;
  /** 翻译资源 */
  messages?: Record<string, Record<string, string>>;
  /** 切换语言环境 */
  onLocaleChange?: (locale: string) => void;
}

/**
 * 表格国际化Hook返回值
 */
export interface UseTableI18nReturn {
  /** 当前语言 */
  locale: string;
  /** 合并后的消息 */
  messages: Record<string, any>;
  /** 翻译函数 */
  t: (key: string, params?: Record<string, any>) => string;
  /** 设置语言 */
  setLocale: (locale: string) => void;
  /** 获取本地化文本 */
  getLocalizedText: (key: string) => string;
  /** 通用翻译工具方法：支持传入自定义messages参数 */
  translateWithMessages: (key: string, customMessages: Record<string, any>, params?: Record<string, any>) => string;
  /** 获取支持的语言列表 */
  getSupportedLocales: () => string[];
  /** 检查是否支持某个语言 */
  isLocaleSupported: (locale: string) => boolean;
}

/**
 * Action事件监听器选项
 */
export interface ActionListenerOptions {
  /** 是否只执行一次 */
  once?: boolean;
  /** 优先级（数字越小优先级越高） */
  priority?: number;
  /** 条件检查函数 */
  condition?: (data: ActionEventData, context: TableContextValue, action?: ActionConfig) => boolean;
  /** 防抖延迟（毫秒） */
  debounce?: number;
  /** 节流间隔（毫秒） */
  throttle?: number;
}

/**
 * Action事件发射结果
 */
export interface ActionEmitResult {
  /** 是否成功 */
  success: boolean;
  /** 监听器执行结果 */
  results: Array<{
    listenerId: string;
    success: boolean;
    result?: any;
    error?: Error;
  }>;
  /** 总监听器数量 */
  totalListeners: number;
}

/**
 * 取消订阅函数类型
 */
export type UnsubscribeFunction = () => void;

/**
 * 监听器信息
 */
export interface ListenerInfo {
  id: string;
  /**
   * 事件监听器。
   *
   * 签名与 `useTableEventActions` 中的 `ActionEventHandler` 保持一致
   * （`(data, context, action) => void | Promise<any>`），
   * 但此处不能直接引用那个类型 —— 会形成 `types` ↔ `hooks` 的循环依赖。
   *
   * `action` 声明为可选 —— `emitAction` 的 `action` 参数本身可选，
   * 调用方可能不传具体动作配置。
   */
  handler?: (data: ActionEventData, context: TableContextValue, action?: ActionConfig) => unknown;
  options?: ActionListenerOptions;
  createdAt?: number;
  priority?: number;
  once?: boolean;
}

/**
 * 已注册Action信息
 */
export interface RegisteredActionInfo {
  actionKey: string;
  listeners?: ListenerInfo[];
  totalCount?: number;
  createdAt?: number;
}

/**
 * Action事件系统Hook返回值
 */
export interface UseTableActionsReturn {
  /** 发射action事件 */
  emitAction: (actionKey: string, data: ActionEventData, context: TableContextValue, action?: ActionConfig) => Promise<ActionEmitResult>;
  /** 监听action事件 */
  onAction: <T extends ActionEventData = ActionEventData>(
    actionKey: string,
    handler: (data: T, context: TableContextValue, action?: ActionConfig) => Promise<any> | any,
    options?: ActionListenerOptions,
  ) => UnsubscribeFunction;
  /** 移除action监听器 */
  offAction: (actionKey: string, listenerId?: string) => boolean;
  /** 移除所有监听器 */
  offAllActions: (filter?: (actionKey: string, listeners: ListenerInfo[]) => boolean) => {
    removedKeys: string[];
    totalRemoved: number;
  };
  /** 获取已注册的action keys */
  getRegisteredActionKeys: () => Record<string, RegisteredActionInfo>;
  /** 检查是否有指定action的监听器 */
  hasActionListeners: (actionKey: string) => boolean;
  /** 获取指定action的监听器数量 */
  getActionListenerCount: (actionKey: string) => number;
}

/**
 * 表格逻辑Hook配置选项
 */
export interface UseTableLogicOptions {
  virtualization?: VirtualizationConfig;
  /** 分页配置 */
  pagination?: PaginationConfig;
  /** 选择配置 */
  selection?: SelectionConfig;
  /** 排序配置 */
  sort?: SortConfig;
  /** 筛选配置 */
  filter?: FilterConfig;
  /** 搜索配置 */
  search?: SearchConfig;
  /** 展开配置 */
  expansion?: ExpansionConfig;
  /** 列调整大小配置 */
  resize?: ResizeConfig;
  /** 国际化配置 */
  i18n?: I18nConfig;
  /** 插件配置 */
  plugin?: PluginConfig;
  /** 性能配置 */
  performance?: PerformanceConfig;
  /** 数据处理模式配置 */
  dataMode?: DataModeConfig;
  /** 业务交互配置 */
  business?: TableStorePageOptions;
}

/**
 * 表格逻辑Hook返回值
 */
export interface UseTableLogicReturn {
  /** Context状态 */
  state: TableState;
  /** Context操作 */
  actions: TableActions;

  /** 选择逻辑 */
  selection: {
    /** 选择所有行 */
    selectAll: () => void;
    /** 清空选择 */
    clearSelection: () => void;
    /** 切换行选择 */
    toggleRowSelection: (key: string | number) => void;
    /** 获取选中的行数据 */
    getSelectedRows: () => Record<string, any>[];
  };

  /** 排序逻辑 */
  sort: {
    /** 设置排序 */
    setSort: (columnName: string, order: 'asc' | 'desc' | null) => void;
    /** 切换排序 */
    toggleSort: (columnName: string) => void;
    /** 获取排序后的数据 */
    getSortedData: () => Record<string, any>[];
    /** 是否为本地排序模式 */
    isLocalMode: () => boolean;
  };

  /** 筛选逻辑 */
  filter: {
    /** 设置筛选 */
    setFilter: (columnKey: string, value: any) => void;
    /** 清空筛选 */
    clearFilter: (columnKey?: string) => void;
    /** 获取筛选后的数据 */
    getFilteredData: (data?: Record<string, any>[]) => Record<string, any>[];
    /** 是否为本地筛选模式 */
    isLocalMode: () => boolean;
  };

  /** 展开逻辑 */
  expansion: {
    /** 展开所有行 */
    expandAll: () => void;
    /** 收起所有行 */
    collapseAll: () => void;
    /** 切换行展开 */
    toggleRowExpansion: (key: string | number, record: any) => void;
  };

  /** 列宽调整逻辑 */
  resize: {
    /** 设置列宽 */
    setColumnWidth: (columnKey: string, width: number) => void;
    /** 重置列宽 */
    resetColumnWidths: () => void;
  };

  /** 分页逻辑 */
  pagination: UseTablePaginationLogicReturn;

  /** 国际化逻辑*/
  i18n: UseTableI18nReturn;

  /** 搜索逻辑 */
  search: {
    /** 设置搜索条件 */
    setSearchCondition: (fieldKey: string, condition: SearchCondition) => void;
    /** 移除搜索条件 */
    removeSearchCondition: (fieldKey: string) => void;
    /** 设置搜索状态 */
    setSearchState: (searchState: SearchState) => void;
    /** 清空搜索 */
    clearSearch: () => void;
    /** 获取搜索后的数据 */
    getSearchedData: (inputData?: any[]) => any[];
    /** 是否为本地搜索模式 */
    isLocalMode: () => boolean;
    /** 获取搜索条件数量 */
    getSearchConditionCount: () => number;
    /** 是否有搜索条件 */
    hasSearchConditions: () => boolean;
  };

  /** 插件逻辑 */
  plugin: UseTablePluginReturn;

  /** 查询业务交互逻辑 */
  storePage: UseTableStorePageReturn;

  /** Action事件系统 */
  actionEvents: UseTableActionsReturn;

  /** 列宽配置 - 用于colgroup */
  columnWidths: Array<{ width?: number; minWidth?: number; maxWidth?: number }>;

  /** 便捷方法 */
  getProcessedData: () => Record<string, any>[];
}
