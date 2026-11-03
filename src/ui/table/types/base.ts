import type { ItemRenderer, ItemSizeGetter, ItemsRenderedEventData, ScrollEventData, VirtualAlignment, VirtualDirection } from '../atoms/virtual-list';
import type { TableContextValue } from '../context';
import type { TablePlugin } from './';
import type { ActionListenerOptions } from './hooks';
import type { ValidationRule } from '../../../utils/validation-rule';
import type { DataStorePage, TableCellActionType, TableColumnActionType } from '../../../models/index';
import type { TableActionType, TableRowActionType } from '../../../models/table';
import type { ReactNode } from 'react';

// ============ 基础枚举类型 ============

/**
 * 表格列类型 - 与 schema 保持一致
 */
export type TableColumnType = 'text' | 'number' | 'date' | 'boolean' | 'tag' | 'image' | 'link' | 'json' | 'actions' | 'custom';

/**
 * 日期组件类型 - 当 dataType 为 'date' 时使用
 */
export type DateComponentType =
  | 'date' // 单日期选择 - InputDate
  | 'date-range' // 日期范围选择 - InputDateRange
  | 'datetime' // 日期时间选择 - InputDateTime
  | 'datetime-range' // 日期时间范围选择 - InputDateTimeRange
  | 'time' // 时间选择 - InputTime
  | 'time-range'; // 时间范围选择 - InputTimeRange

/**
 * 表格尺寸 - 与 schema 保持一致
 */
export type TableSize = 'sm' | 'md' | 'lg';

/**
 * 表格密度
 */
export type TableDensity = 'compact' | 'default' | 'comfortable';

/**
 * 表格主题
 */
export type TableTheme = 'default' | 'minimal' | 'modern' | 'classic' | 'dark' | 'light';

/**
 * 表格变体
 */
export type TableVariant = 'default' | 'bordered' | 'striped' | 'hoverable' | 'compact' | 'spacious';

/**
 * 列对齐方式 - 与 schema 保持一致
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * 固定位置 - 与 schema 保持一致
 */
export type FixedPosition = 'left' | 'right';

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 选择类型 - 与 schema 保持一致
 */
export type SelectionType = 'single' | 'multiple';

/**
 * 筛选操作符 - 与后端FilterExpression保持一致
 */
export type FilterOperator =
  | 'eq' // 等于
  | 'ne' // 不等于
  | 'gt' // 大于
  | 'ge' // 大于等于
  | 'lt' // 小于
  | 'le' // 小于等于
  | 'like' // 包含(模糊匹配)
  | 'notlike' // 不包含(模糊匹配)
  | 'between' // 介于
  | 'notbetween' // 不介于
  | 'in' // 包含于
  | 'notin' // 不包含于
  | 'isnull' // 为空
  | 'isnotnull' // 不为空
  | 'startwith' // 开头
  | 'endwith'; // 结尾

/**
 * 数据类型 - 与后端FilterExpression保持一致
 */
export type DataType =
  | 'string' // 字符串类型
  | 'number' // 通用数字类型
  | 'int' // 整数类型
  | 'float' // 浮点数类型
  | 'long' // 长整型
  | 'double' // 双精度浮点型
  | 'boolean' // 布尔类型
  | 'date' // 日期类型
  | 'enum' // 枚举类型
  | 'list' // 列表类型
  | 'object'; // 对象类型

// ============ 基础数据类型 ============

/**
 * 筛选值类型
 */
export interface FilterValue {
  /** 字段数据类型 */
  type: DataType;
  /** 字段名 */
  field: string;
  /** 操作符 */
  op: FilterOperator;
  /** 筛选值 - 支持单值或数组格式 */
  value: any[];
  /** 格式化函数，可选，如果没有则使用列上的format */
  format?: (value: any) => string;
}

/**
 * 筛选状态
 */
export interface FilterState {
  [columnKey: string]: FilterValue | undefined;
}

/**
 * 搜索条件，兼容 FilterExpressionSchema
 */
export interface SearchCondition {
  /** 搜索字段，支持多字段搜索 */
  field: string[];
  /** 搜索操作符 */
  operator: FilterOperator;
  /** 搜索值，统一使用数组格式 */
  value: any[];
  /** 数据类型，对应 FilterExpressionSchema 的 type */
  type: DataType;
  /** 格式化字符串，对应 FilterExpressionSchema 的 format */
  format?: string;
  /** 是否区分大小写（扩展字段） */
  caseSensitive?: boolean;
}

/**
 * 搜索状态
 */
export interface SearchState {
  [fieldKey: string]: SearchCondition | undefined;
}

/**
 * 将 SearchCondition 转换为 FilterExpressionSchema
 */
export function searchConditionToFilterExpression(condition: SearchCondition): any {
  // 处理多字段情况
  const fields = Array.isArray(condition.field) ? condition.field : [condition.field];

  // 如果是多字段，需要生成多个条件或使用OR逻辑
  if (fields.length === 1) {
    return {
      field: fields[0],
      op: condition.operator,
      value: Array.isArray(condition.value) ? condition.value : [condition.value],
      type: condition.type || 'string',
      format: condition.format,
    };
  } else {
    // 多字段情况，生成OR条件组
    return {
      logic: 'or',
      conditions: fields.map((field) => ({
        field,
        op: condition.operator,
        value: Array.isArray(condition.value) ? condition.value : [condition.value],
        type: condition.type || 'string',
        format: condition.format,
      })),
    };
  }
}

/**
 * 排序状态
 */
export interface SortState {
  /** 排序列名称 (column.name) */
  columnName: string | null;
  /** 排序方向 */
  order: SortDirection | null;
}

/**
 * 分页状态
 */
export interface PaginationState {
  /**
   * 当前页码
   */
  pageNo?: number;
  /**
   * 总条数
   */
  total?: number;
  /**
   * 默认每页条目数
   */
  pageSize?: number;

  /**
   * 是否显示分页
   */
  show?: boolean;

  /**
   * reload时触发的标识符
   */
  reloadTrigger?: number;
}
/**
 * 表格数据
 */
export type TableActionVariant = 'link' | 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'success' | 'warning' | 'info';
/**
 * 交互模型定义 - 定义action的业务交互行为
 */
export interface ActionInteractionModel {
  /** 交互类型 */
  type: 'confirm' | 'prompt' | 'modal' | 'drawer' | 'dialog' | 'menu' | 'page' | 'direct' | 'custom';
  /** 确认对话框配置 */
  confirm?: {
    title?: string;
    content?: string;
    okText?: string;
    cancelText?: string;
    danger?: boolean;
  };
  /** 输入提示配置 */
  prompt?: {
    title?: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
    validator?: (value: string) => boolean | string;
  };
  /** 模态框配置 */
  modal?: {
    title?: string;
    width?: number | string;
    component?: React.ComponentType<any>;
    props?: Record<string, any>;
  };
  /** 抽屉配置 */
  drawer?: {
    title?: string;
    width?: number | string;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    component?: React.ComponentType<any>;
    props?: Record<string, any>;
  };
  /** 下拉菜单配置 */
  menu?: {
    items?: Array<{
      key: string;
      label: string;
      icon?: string;
      onClick?: (context: any) => void;
    }>;
    placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
  };
  /** 页面跳转配置 */
  page?: {
    /** 页面URL或路由路径 */
    url?: string;
    /** URL生成器函数 */
    urlGenerator?: (context: any, record?: Record<string, any>) => string;
    /** 跳转方式 */
    target?: '_blank' | '_self' | '_parent' | '_top';
    /** 是否在新窗口打开 */
    newWindow?: boolean;
    /** 窗口特性（当newWindow为true时） */
    windowFeatures?: string;
    /** 传递给目标页面的参数 */
    params?: Record<string, any>;
    /** 参数提取器 */
    paramsExtractor?: (context: any, record?: Record<string, any>) => Record<string, any>;
  };
  /** 自定义交互处理器 */
  custom?: {
    handler: (context: any) => Promise<any>;
  };
  /** 前置条件检查 */
  preCheck?: (context: any) => boolean | Promise<boolean>;
  /** 后置处理 */
  postProcess?: (result: any, context: any) => void | Promise<void>;
}

/**
 * 事件发射配置
 */
export interface ActionEventConfig {
  /** 是否发射事件 */
  emit?: boolean;
  /** 事件数据提取器 */
  dataExtractor?: (context: any) => any;
  /** 事件发射时机 */
  timing?: 'before' | 'after' | 'both';
  /** 自定义事件名称，默认使用action.key */
  eventName?: string;
}

/**
 * 动作配置定义
 */
export interface ActionConfig {
  /** 动作键 - 用作事件标识，支持标准action type或自定义key */
  key: string;
  /** 动作类型 - 使用schema定义的标准类型 */
  type?: TableActionType | TableRowActionType | TableColumnActionType | TableCellActionType | string;
  /** 动作差异化配置 */
  config?: Record<string, any>;
  /** 是否为插件动作 - 默认false表示普通动作，true表示插件动作 */
  isPluginAction?: boolean;
  /** 是否在更多菜单中显示 在有菜单的情况下才生效，由位置进行动态计算传递，单独设置不生效 */
  showInMore?: boolean;
  /** 组件尺寸, 由位置进行动态计算传递，单独设置不生效 */
  size?: TableSize;
  /** 是否在显示按钮label, 在非菜单的情况下才生效，由位置进行动态计算传递，单独设置不生效 */
  showLabel?: boolean;
  /** action button 式样 */
  variant?: TableActionVariant;
  /** i81n消息对象  */
  messages?: Record<string, Record<string, string>>;
  /** 显示文本 */
  label: ReactNode | ((...args: any[]) => ReactNode);
  /** 图标 */
  icon?: ReactNode | ((...args: any[]) => ReactNode);
  /** 是否禁用 */
  disabled?: boolean | ((...args: any[]) => boolean);
  /** 是否显示 */
  visible?: boolean | ((...args: any[]) => boolean);
  /** 动作优先级，数字越小优先级越高 */
  priority?: number;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (...args: any[]) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (...args: any[]) => void | Promise<void>;
  /** 工具提示 */
  tooltip?: string;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义渲染函数 */
  render?: (...args: any[]) => React.ReactNode;
  /** 交互模型定义 */
  interaction?: ActionInteractionModel;
  /** 事件发射配置 */
  eventConfig?: ActionEventConfig;
  /** 扩展属性 */
  [key: string]: any;
}

/**
 * Table 动作
 */
export interface TableActionConfig extends ActionConfig {
  /** 动作优先级，数字越小优先级越高 */
  priority?: number;
  /** 是否在更多菜单中显示 */
  showInMore?: boolean;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (selectedRows?: Record<string, any>[], context?: TableContextValue, action?: ActionConfig) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (selectedRows?: Record<string, any>[], context?: TableContextValue, action?: ActionConfig, event?: React.MouseEvent) => void | Promise<void>;
  /** 自定义渲染函数 */
  render?: (selectedRows?: Record<string, any>[], context?: TableContextValue, action?: ActionConfig) => React.ReactNode;
}

/**
 * Table 行动作
 */
export interface TableRowActionConfig extends ActionConfig {
  /** 动作优先级，数字越小优先级越高 */
  priority?: number;
  /** 是否在更多菜单中显示 */
  showInMore?: boolean;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig, event?: React.MouseEvent) => void | Promise<void>;
  /** 自定义渲染函数 */
  render?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig) => React.ReactNode;
}

/**
 * Table 单元格动作
 */
export interface TableCellActionConfig extends ActionConfig {
  /** 动作优先级，数字越小优先级越高 */
  priority?: number;
  /** 是否在更多菜单中显示 */
  showInMore?: boolean;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig, column?: TableColumn) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig, event?: React.MouseEvent, column?: TableColumn) => void | Promise<void>;
  /** 自定义渲染函数 */
  render?: (record?: Record<string, any>, context?: TableContextValue, action?: ActionConfig, column?: TableColumn) => React.ReactNode;
}

/**
 * Table 列动作
 */
export interface TableColumnActionConfig extends ActionConfig {
  /** 动作优先级，数字越小优先级越高 */
  priority?: number;
  /** 是否在更多菜单中显示 */
  showInMore?: boolean;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (column?: TableColumn, context?: TableContextValue, action?: ActionConfig) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (column?: TableColumn, context?: TableContextValue, action?: ActionConfig) => void | Promise<void>;
  /** 自定义渲染函数 */
  render?: (column?: TableColumn, context?: TableContextValue, action?: ActionConfig) => React.ReactNode;
}

/**
 * 获取行键的方法类型
 * 支持返回字符串或数字类型的键值，兼容number类型
 */
export type GetRowKey = (record: Record<string, any>, index: number) => string | number;

// ============ 行级别操作配置 ============

/**
 * 右键菜单操作配置
 */
export interface ContextMenuActionConfig extends ActionConfig {
  /** 动作优先级，数字越小优先级越高 */
  priority?: number;
  /** 动作分组 */
  group?: string;
  /** 启用条件 */
  when?: (
    record?: Record<string, any>,
    context?: TableContextValue,
    action?: ActionConfig,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => boolean;
  /** 动作执行 - 通用执行接口 */
  execute?: (
    record?: Record<string, any>,
    context?: TableContextValue,
    action?: ActionConfig,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => void | Promise<void>;
  /** 自定义渲染函数 */
  render?: (
    record?: Record<string, any>,
    context?: TableContextValue,
    action?: ActionConfig,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => React.ReactNode;
}

/**
 * 右键菜单对齐方式
 */
export type ContextMenuAlign = 'start' | 'center' | 'end';

/**
 * 右键菜单配置
 */
export interface ContextMenuConfig {
  /** 右键菜单操作列表 */
  actions?: ContextMenuActionConfig[];
  /** 菜单对齐方式 */
  align?: ContextMenuAlign;
  /** 菜单尺寸预设 */
  size?: TableSize;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否显示分隔线 */
  showSeparator?: boolean;
  /** 自定义菜单渲染 */
  render?: (
    record: Record<string, any>,
    context?: TableContextValue,
    action?: ActionConfig,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => ReactNode;
  /** 菜单打开前的回调 */
  onBeforeOpen?: (
    record: Record<string, any>,
    context?: TableContextValue,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => boolean | Promise<boolean>;
  /** 菜单关闭后的回调 */
  onAfterClose?: (
    record: Record<string, any>,
    context?: TableContextValue,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => void;
}

/**
 * 行操作列配置
 */
export interface RowActionConfig {
  /** 列标题 */
  title?: ReactNode;
  /** 列宽度 */
  width?: number | string;
  /** 列固定位置 */
  fixed?: FixedPosition;
  /** 列对齐方式 */
  align?: ColumnAlign;
  /** 最大显示数量，超出部分显示在更多菜单中 */
  maxVisible?: number;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 操作列表 */
  actions?: TableRowActionConfig[];
  /** 操作列表尺寸 */
  size?: TableSize;
  /** 更多菜单配置 */
  moreMenu?: {
    /** 更多按钮文本 */
    text?: string;
    /** 更多按钮图标 */
    icon?: string;
    /** 菜单对齐方式 */
    align?: 'start' | 'end';
    /** 菜单最大高度 */
    maxHeight?: number;
  };
  /** 自定义渲染整个操作列 */
  render?: (record: Record<string, any>, context?: TableContextValue, action?: ActionConfig) => ReactNode;
}

/**
 * 列操作配置
 */
export interface ColumnActionConfig {
  /** 右键菜单操作列表 */
  actions?: TableColumnActionConfig[];
  /** 菜单尺寸预设 */
  size?: TableSize;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 列对齐方式 */
  align?: ColumnAlign;
  /** 最大显示数量，超出部分显示在更多菜单中 */
  maxVisible?: number;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 是否显示分隔线 */
  showSeparator?: boolean;
  /** 自定义列操作渲染 */
  render?: (column: TableColumn, context?: TableContextValue, action?: ActionConfig) => ReactNode;
  /** 更多菜单配置 */
  moreMenu?: {
    /** 更多按钮文本 */
    text?: string;
    /** 更多按钮图标 */
    icon?: string;
    /** 菜单对齐方式 */
    align?: 'start' | 'end';
    /** 菜单最大高度 */
    maxHeight?: number;
  };
}

// ============ 工具栏类型 ============

/**
 * 工具栏动作位置
 */
export type ToolbarActionPosition = 'toolbar.left' | 'toolbar.right';

/**
 * 工具栏动作配置
 */
export interface ToolbarActionConfig extends TableActionConfig {
  /** 动作位置 */
  position?: ToolbarActionPosition[];
  /** 动作优先级，数字越小优先级越高 */
  priority?: number;
  /** 是否在更多菜单中显示 */
  showInMore?: boolean;
  /** 动作分组 */
  group?: string;
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean;
  /** 左侧动作列表 */
  left?: ToolbarActionConfig[];
  /** 右侧动作列表 */
  right?: ToolbarActionConfig[];
  /** 最大显示数量，超出部分显示在更多菜单中 */
  maxVisible?: number;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 工具栏尺寸 */
  size?: TableSize;
  /** 自定义类名 */
  className?: string;
  /** 工具栏自定义样式 */
  style?: React.CSSProperties;
}
/**
 * 状态栏配置
 */
export interface StatusBarConfig {
  /** 是否显示状态栏 */
  show?: boolean;
  /** 工具栏尺寸 */
  size?: TableSize;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 通用字段配置接口 - 作为TableColumn和SearchFieldConfig的基础
 * 包含所有共同的字段配置属性
 */
export interface UniversalFieldConfig {
  // 通用type，每个实际类型可以自行扩展定义
  type?: any;
  /** 数据类型，用于过滤器和后端交互，默认为string */
  dataType?: DataType;
  /** 日期组件类型，当 dataType 为 'date' 时指定使用哪个日期组件 */
  dateType?: DateComponentType;
  /** 选项列表 */
  options?: Array<{ label: string; value: string; disabled?: boolean }>;
  /** 格式化配置 */
  format?: string;
  /** 日期配置 */
  dateConfig?: DateConfig;
  /** 自定义编辑渲染函数 */
  editRender?: (
    value: any,
    onChange: (value: any) => void,
    //通用包含兼容参数，没有可以不传
    ...args: any[]
  ) => React.ReactNode;
  /** 编辑器配置 */
  editConfig?: EditorConfig;
  /** 是否多选 */
  multiple?: boolean;
  /** 占位符 */
  placeholder?: string | string[];
}

/**
 * 搜索字段配置 - 继承UniversalFieldConfig以实现统一
 */
export interface SearchFieldConfig extends UniversalFieldConfig {
  /** 搜索组件类型，决定渲染什么UI组件 */
  type?: 'text' | 'select' | 'date' | 'date-range' | 'number' | 'boolean' | 'range' | 'combobox';
  /** 组件名称 唯一标识 */
  name: string;
  /** 数据字段键，支持一个条件查询多个字段 统一使用数组*/
  dataIndex?: string[];
  /** 字段标签 */
  label: string;
  /** 条件匹配类型 */
  op?: FilterOperator;
  /** 字段最小宽度（仅在 filterMultiple=false 时生效，优先级高于 SearchConfig.minFieldWidth） */
  minWidth?: number;
  /** 自定义渲染函数 - 优先使用此函数渲染字段组件 */
  editRender?: (value: any, onChange: (value: any) => void, field: SearchFieldConfig, context?: TableContextValue) => React.ReactNode;
}

// ============ 配置类型 ============

// 移除重复的TableColumn定义，使用下面统一的定义

/**
 * 表格显示模式
 */
export type TableDisplayMode = 'table' | 'card' | 'virtual';

/**
 * 卡片布局模式
 */
export type CardLayoutMode = 'grid' | 'list';

/**
 * 卡片尺寸
 */
export type CardSize = 'sm' | 'md' | 'lg';

/**
 * 卡片配置
 */
export interface CardConfig {
  /** 卡片布局模式 */
  layout?: CardLayoutMode;
  /** 每行卡片数量 */
  columns?: number | 'auto';
  /** 卡片间距 */
  gap?: number | string;
  /** 卡片最小宽度 */
  minWidth?: number | string;
  /** 卡片最大宽度 */
  maxWidth?: number | string;
  /** 卡片高度 */
  height?: number | string | 'auto';
  /** 是否显示阴影 */
  shadow?: boolean;
  /** 卡片标题字段 */
  titleField?: string;
  /** 卡片描述字段 */
  descriptionField?: string;
  /** 卡片图片/图标字段 */
  imageField?: string;
  /** 自定义卡片渲染函数 */
  renderCard?: (record: Record<string, any>, context?: TableContextValue, action?: ActionConfig) => ReactNode;
  /** 卡片点击回调 */
  onCardClick?: (record: Record<string, any>, index: number) => void;
}

/**
 * 表格配置接口
 */
export interface TableConfig {
  /** 数据ID字段 */
  rowKey?: string;
  /** 显示模式 */
  displayMode?: TableDisplayMode;
  /** 卡片配置 */
  card?: CardConfig;
  /** 表格尺寸 */
  size?: TableSize;
  /** 表格密度 */
  density?: TableDensity;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否显示条纹 */
  striped?: boolean;
  /** 是否可悬停 */
  hoverable?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 是否显示右键菜单 */
  contextMenuable?: boolean;
  /** 是否启用选择功能 */
  selectable?: boolean;
  /** 是否启用排序功能 */
  sortable?: boolean;
  /** 是否启用筛选功能 */
  filterable?: boolean;
  /** 是否启用搜索功能 */
  searchable?: boolean;
  /** 是否启用工具栏功能 */
  toolbarable?: boolean;
  /** 是否启用状态栏功能 */
  statusBarable?: boolean;
  /** 是否启用行操作功能 */
  rowActionable?: boolean;
  /** 是否启用列头操作功能 */
  columnHeaderActionable?: boolean;
  /** 是否启用展开功能 */
  /** 是否启用展开功能 */
  expandable?: boolean;
  /** 是否启用列宽调整 */
  resizeable?: boolean;
  /** 是否启用虚拟滚动 */
  virtualizable?: boolean;
  /** 是否启用分页 */
  paginable?: boolean;
  /** 是否启用固定列功能 */
  fixedable?: boolean;
  /** 是否撑满容器高度 - 让table和分页组件撑满父容器 */
  fillContainer?: boolean;
  /** 是否启用性能优化 */
  memoizationable?: boolean;
  /** 是否延迟加载 */
  deferredable?: boolean;
  /*** 是否启用插件系统 */
  pluginable?: boolean;
  /** 是否启用缓存 */
  cacheable?: boolean;
  /** 是否启持久化 */
  persistable?: boolean;
  /** 持久化类型 */
  persistent?: 'local' | 'session' | 'none';
  /** 表格唯一标识，用于持久化存储 */
  tableId?: string;

  /** 是否显示表头 */
  showHeader?: boolean;
  /** 是否固定表头 */
  stickyHeader?: boolean;
  /** 固定表头偏移量 */
  stickyHeaderOffset?: number;

  /** 滚动配置 */
  scroll?: ScrollConfig;
  /** 是固定grid table的fixed模式，开启设置table的最小宽度等 */
  fixedLayout?: boolean;
  /** 虚拟化配置 */
  virtualization?: VirtualizationConfig;

  /** 选择配置 */
  selection?: SelectionConfig;
  /** 排序配置 */
  sort?: SortConfig;
  /** 筛选配置 */
  filter?: FilterConfig;
  /** 展开配置 */
  expansion?: ExpansionConfig;
  /** 列调整大小配置 */
  resize?: ResizeConfig;
  /** 国际化配置 */
  i18n?: I18nConfig;
  /** 插件配置 */
  plugin?: PluginConfig;
  /** 缓存配置 */
  cache?: CacheConfig;
  /** 样式配置 */
  style?: React.CSSProperties;
  /** 业务page交互配置 */
  storePage?: TableStorePageConfig;
  /** 分页配置 */
  pagination?: PaginationConfig | null;
  /** 查询面板配置 */
  search?: SearchConfig;
  /** 工具栏配置 */
  toolbar?: ToolbarConfig;
  /** 状态栏配置 */
  statusBar?: StatusBarConfig;
  /** 行操作配置 */
  rowAction?: RowActionConfig;
  /** 右键菜单配置 */
  contextMenu?: ContextMenuConfig;
  /** 列头操作配置 */
  columnHeaderAction?: ColumnActionConfig;

  /**
   * 运行时 API 基础配置
   * 仅定义 baseUrl，具体请求由外部注入的 ajax/服务执行
   */
  api?: {
    /** 请求基础地址 */
    baseUrl?: string;
  };

  /**
   * 上传配置：用于表格内上传型功能（如导入、单元格上传等）
   */
  upload?: {
    /** 上传端点配置（字符串或包含方法与头信息的对象） */
    endpoint?: string | { url: string; method?: 'POST' | 'PUT'; headers?: Record<string, string> };
    /** 实际执行上传的函数，由运行时注入 */
    uploader?: (file: File | Blob | File[] | Blob[], opts?: any) => Promise<any>;
  };

  dataMode?: DataModeConfig;
  /** 数据处理模式配置 */

  /** table action 监听器配置 */
  eventListeners?: Record<string, TableEventListenerConfig>;
}

/**
 * 数据处理模式配置 - 参考 Ant Design 和 Element Plus 设计
 */
export interface DataModeConfig {
  /** 排序模式 - 默认为 'remote' */
  sort?: 'local' | 'remote';
  /** 筛选模式 - 默认为 'remote' */
  filter?: 'local' | 'remote';
  /** 分页模式 - 默认为 'remote' */
  pagination?: 'local' | 'remote';
  /** 搜索模式 - 默认为 'remote' */
  search?: 'local' | 'remote';
  /** 分页时是否清空选中 - 默认为 true，避免误操作数据 */
  clearSelectedOnPagination?: boolean;
}

/**
 * 滚动配置 - 与 schema 保持一致
 */
export interface ScrollConfig {
  /** 横向滚动 */
  x?: number | string | boolean;
  /** 纵向滚动 */
  y?: number | string;
  /** 滚动到指定位置 */
  scrollToFirstRowOnChange?: boolean;
  /** GridTable 最小宽度 */
  tableMinWidth?: number;
}

/**
 * 虚拟化配置
 */
export interface VirtualizationConfig {
  // 启用阈值
  threshold?: number;
  /** 容器高度 */
  height?: number;
  /** 容器宽度 */
  width?: number;
  /** 项目数量 */
  itemCount?: number;
  // 行高
  itemHeight?: number;
  /** 项目尺寸 */
  itemSize?: number | ItemSizeGetter;
  /** 预估项目尺寸 */
  estimatedItemSize?: number;
  /** 预渲染项目数量 */
  overscanCount?: number;
  /** 滚动方向 */
  scrollDirection?: VirtualDirection;
  /** 滚动到指定索引 */
  scrollToIndex?: number;
  /** 滚动对齐方式 */
  scrollToAlignment?: VirtualAlignment;
  /** 滚动偏移量 */
  scrollOffset?: number;
  /** 项目渲染函数 */
  renderItem?: ItemRenderer;
  /** 滚动事件回调 */
  onScroll?: (data: ScrollEventData) => void;
  /** 项目渲染回调 */
  onItemsRendered?: (data: ItemsRenderedEventData) => void;
  /** 固定表头内容 */
  stickyHeader?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 容器ref */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * 空状态配置
 */
export interface EmptyConfig {
  /** 描述文本 */
  description?: ReactNode;
  /** 图片或图标 */
  image?: ReactNode;
  /** 操作按钮 */
  action?: ReactNode;
}

/**
 * 加载配置
 */
export interface LoadingConfig {
  /** 是否显示加载状态 */
  spinning?: boolean;
  /** 加载文本 */
  tip?: ReactNode;
  /** 延迟显示时间(ms) */
  delay?: number;
  /** 自定义加载指示器 */
  indicator?: ReactNode;
}

/**
 * 选择配置
 */
export interface SelectionConfig {
  /** 选择类型 */
  type?: SelectionType;
  /** 选中的行键 - 兼容字符串和数字 */
  selectedRowKeys?: (string | number)[];
  /** 选择变化回调 */
  onSelectionChange?: (selectedRowKeys: (string | number)[], selectedRows: Record<string, any>[]) => void;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  /**
   * 默认分页显示状态
   */
  show?: boolean;
  /**
   * 当前页码
   */
  pageNo?: number;
  /**
   * 默认每页条目数
   */
  pageSize?: number;
  /**
   * 默认条数
   */
  total?: number;
  /**
   * 是否允许切换每页条数，默认 true。建议优先用 layout 控制结构。
   */
  showSizeChanger?: boolean;
  /**
   * 是否允许快速跳页，默认 true。建议优先用 layout 控制结构。
   */
  showQuickJumper?: boolean;
  /**
   * 可选的每页条数列表，默认 [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];
  /**
   * 分页条结构编排，决定分页区块的顺序和显示。可选值：'total'|'perPage'|'pager'|'go'，如 ['total','pager','perPage','go']
   * @default ['pager']
   */
  layout?: ('total' | 'perPage' | 'pager' | 'go')[];
  /**
   * 最大页码按钮数，默认 5
   */
  maxButtons?: number;
  /**
   * 是否极简模式，仅显示前后页
   */
  simple?: boolean;
  /**
   * 是否显示总数
   */
  showTotal?: boolean;
  /**
   * 是否显示首页/末页
   */
  showFirstLast?: boolean;
  /**
   * 分页条位置
   */
  position?: 'left' | 'center' | 'right';
  /**
   * 是否显示分页条。由 `useTablePagination` 归一化后的运行时字段提供。
   */
  showPagination?: boolean;
  /**
   * 分页参数变化回调。由 `useTablePagination` 的 `paginationConfig` 提供。
   */
  onPaginationChange?: (pagination: PaginationState) => void;
}

/**
 * 排序配置
 */
export interface SortConfig extends SortState {}

/**
 * 筛选配置
 */
export interface FilterConfig extends FilterState {}

/**
 * 搜索配置
 */
export interface SearchConfig {
  /** 初始搜索状态 */
  initialState?: SearchState;
  /** 是否显示搜索面板 */
  show?: boolean;
  /** 是否显示字段标签，为 false 时使用 placeholder 作为标签 */
  showLabel?: boolean;
  /** 是否多选筛选模式 - 为 true 时强制所有字段使用选择模式，每个字段一个 toggle，使用 options 进行选择 */
  filterMultiple?: boolean;
  /** 最大条件数量 */
  maxConditions?: number;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 默认是否折叠 */
  defaultCollapsed?: boolean;
  /** 可搜索字段配置 */
  fields?: SearchFieldConfig[];
  /** 布局模式 - grid: 网格布局，list: 列表布局 */
  mode?: 'grid' | 'list';
  /** 字段最小宽度（仅在 grid 模式下有效） */
  minFieldWidth?: number;
  /** 是否field自动onChange时触发搜索，非filterMultiple模式下有效 */
  autoSearch?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 搜索组件尺寸 */
  size?: TableSize;
  /** 搜索变化回调 */
  onSearchChange?: (searchState: SearchState) => void;
  /** 全局搜索变化回调 */
  onGlobalSearchChange?: (keyword: string) => void;
  /** 搜索条件变化回调 */
  onSearchConditionChange?: (conditions: SearchCondition[]) => void;
}

/**
 * 展开配置
 */
export interface ExpansionConfig {
  /** 展开方式 */
  type?: 'single' | 'multiple';
  /** 展开的行键 - 兼容字符串和数字 */
  expandedRowKeys?: (string | number)[];
  /** 单行展开变化回调 */
  onExpand?: (expanded: boolean, record?: Record<string, any> | null, rowKey?: string | number | null) => void;
  /** 选择变化回调 */
  onExpandChange?: (expandRowKeys: (string | number)[], expandRows: Record<string, any>[]) => void;
  /** 展开行渲染函数 */
  renderExpandedRow?: (record: Record<string, any>, index?: number) => ReactNode;
  /** 点击行展开 */
  expandRowByClick?: boolean;
}

/**
 * 列调整大小配置
 */
export interface ResizeConfig {
  /** 列宽映射 */
  columnWidths?: Record<string, number>;
  /** 列宽变化回调 */
  onResize?: (columnName: string, width: number) => void;
  /** 重置列宽回调 */
  onReset?: () => void;
  /** 最小列宽 */
  minWidth?: number;
  /** 最大列宽 */
  maxWidth?: number;
}

/**
 * 国际化配置
 */
export interface I18nConfig {
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
 * 插件配置
 */
export interface PluginConfig {
  /** 插件列表 */
  plugins?: TablePlugin[];
  /** 插件上下文 */
  context?: Record<string, any>;
  /** 是否启用插件系统 */
  enabled?: boolean;
  /** 插件配置 */
  config?: { [pluginKey: string]: any };
}

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 性能优化选项 */
  options?: Record<string, any>;
}

/** 缓存配置 */
export interface CacheConfig {
  ttl?: number;
  key?: string;
}
/**
 * 样式配置
 */
export interface StyleConfig {
  /** 样式类名 */
  className?: string;
  /** 样式对象 */
  style?: Record<string, any>;
}

/**
 * 业务查询参数接口
 */
export interface BusinessQueryParams {
  /** 分页参数 */
  pagination?: PaginationState;
  /** 排序参数 */
  sort?: SortState;
  /** 筛选参数 */
  filter?: FilterState;
  /** 搜索状态 */
  search?: SearchState;
  /** 其他自定义参数 */
  [key: string]: any;
}

/**
 * 业务page交互配置
 */
export interface TableStorePageConfig {
  /** 参数变化回调 - 用于向后端提交查询 */
  onParamsChange?: (params: BusinessQueryParams) => void | Promise<void>;
  /** 页面参数变化回调 - 返回 DataStorePage 格式（由 `DataStorePageSchema` 推导） */
  onPageChange?: (pageSchema: DataStorePage) => void | Promise<void>;
  /** 防抖延迟时间（毫秒），默认300ms */
  debounceDelay?: number;
  /** 是否在初始化时触发回调，默认false */
  triggerOnInit?: boolean;
  /** 自定义参数提取函数 */
  extractParams?: (state: any) => Record<string, any>;
  /** 参数比较函数，默认使用lodash isEqual */
  compareParams?: (prev: BusinessQueryParams, current: BusinessQueryParams) => boolean;
}

// ============ 列定义 ============
export interface EnumConfig {
  /** 是否多选 */
  multiple?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 最大选择数量 */
  maxCount?: number;
}

export interface ListConfig {
  /** 列表项类型 */
  itemType?: 'string' | 'number' | 'object';
  /** 最大项目数量 */
  maxItems?: number;
  /** 最小项目数量 */
  minItems?: number;
  /** 是否支持排序 */
  sortable?: boolean;
  /** 添加按钮文本 */
  addButtonText?: string;
}

export interface ObjectConfig {
  /** 键占位符 */
  keyPlaceholder?: string;
  /** 值占位符 */
  valuePlaceholder?: string;
  /** 最大属性数量 */
  maxProperties?: number;
  /** 最小属性数量 */
  minProperties?: number;
  /** 添加按钮文本 */
  addButtonText?: string;
  /** 预定义的键列表 */
  predefinedKeys?: string[];
}

export interface DateConfig {
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 禁用的日期判断函数 */
  disabledDate?: (date: Date) => boolean;
  /** 是否显示快捷选择（仅对 date 类型有效） */
  showShortcuts?: boolean;
  /** 选择模式（仅对 date 类型有效）：day=日选择，month=月选择，year=年选择 */
  mode?: 'day' | 'month' | 'year';
  /** 分隔符（仅对范围类型有效） */
  separator?: string;
}

/**
 * 字段验证规则
 */
export interface FieldRules extends ValidationRule {
  [key: string]: any;
}

/**
 * 选择项定义（统一用于所有选择类型）
 */
export interface SelectOption {
  /** 显示标签 */
  label: string;
  /** 选项值 */
  value: string | number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 描述信息 */
  description?: string;
  /** 图标 */
  icon?: string;
  /** 分组 */
  group?: string;
}

export type EditorType = 'input' | 'textarea' | 'select' | 'combobox' | 'checkbox' | 'date' | 'number' | 'boolean' | 'text' | 'range' | 'image' | 'file' | 'enum' | 'list' | 'object';
/**
 * 编辑器配置
 */
export interface EditorConfig {
  /** 编辑器类型 */
  type?: EditorType;
  /** 优先级 **/
  priority?: number;
  /** 字段验证规则 */
  rules?: FieldRules;
  /** 占位符 */
  placeholder?: string | string[];
  /** 是否多选（适用于 enum 类型） */
  multiple?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否支持排序（适用于 list 类型） */
  sortable?: boolean;
  /** 列表项类型（适用于 list 类型） */
  itemType?: 'string' | 'number' | 'object';
  /** 键占位符（适用于 object 类型） */
  keyPlaceholder?: string;
  /** 值占位符（适用于 object 类型） */
  valuePlaceholder?: string;
  /** 预定义的键列表（适用于 object 类型） */
  predefinedKeys?: string[];
  /** 添加按钮文本 */
  addButtonText?: string;
  /** 日期模式（适用于 date 类型） */
  mode?: 'date' | 'month' | 'year';
  /** 日期 数值 格式 */
  format?: string;
  /** 数字精度（适用于 number 类型） */
  precision?: number;
  /** 数字步长（适用于 number 类型） */
  step?: number;
  /** 布尔值为true时对应的值（适用于 boolean 类型） */
  trueValue?: any;
  /** 布尔值为false时对应的值（适用于 boolean 类型） */
  falseValue?: any;
  /** 最大文件数量（适用于 file、image 类型） */
  maxCount?: number;
  /** 自定义属性 */
  props?: Record<string, any>;
}

/**
 * 表格列定义 - 与 schema TableColumnSchema 保持一致
 */
export interface TableColumn extends UniversalFieldConfig {
  /** 列名称 - 与 schema name 字段对应 */
  name: string;
  /** 列标题 - 与 schema title 字段对应 */
  title: string;
  /** 列描述 */
  description?: string;
  /** 列提示 */
  tooltip?: string;
  /** 数据索引 - 与 schema dataIndex 字段对应 */
  dataIndex: string;
  /** 列类型，影响渲染方式 - 与 schema type 字段对应 */
  type?: TableColumnType;
  /** 格式化函数 */
  formatter?: (value: any, record: any) => string;
  /** 解析函数（格式化的逆操作） */
  parser?: (value: string, record: any) => any;
  /** 日期组件的额外配置 */
  dateConfig?: DateConfig;
  /** 枚举配置 */
  enumConfig?: EnumConfig;
  /** 列表配置 */
  listConfig?: ListConfig;
  /** 对象配置 */
  objectConfig?: ObjectConfig;
  /** 列宽 - 与 schema width 字段对应 */
  width?: number | string;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 固定位置 - 与 schema fixed 字段对应 */
  fixed?: FixedPosition;
  /** 对齐方式 - 与 schema align 字段对应 */
  align?: ColumnAlign;
  /** 是否可见 - 与 schema visible 字段对应 */
  visible?: boolean;
  /** 是否可排序 - 与 schema sortable 字段对应 */
  sortable?: boolean;
  /** 排序回调函数 使用field回调而非name*/
  onSort?: (field: string, order: SortDirection | null) => void;
  /** 是否省略显示 - 与 schema ellipsis 字段对应 */
  ellipsis?: boolean;
  /** 自定义渲染 - 与 schema render 字段对应 */
  render?: (value: any, record: Record<string, any>, index: number) => ReactNode;
  /** 列合并 - 与 schema colSpan 字段对应 */
  colSpan?: number | string;
  /** 行合并 - 与 schema rowSpan 字段对应 */
  rowSpan?: number | string;
  /** 列分组 - 与 schema group 字段对应 */
  group?: string;
  /** 列属性 - 与 schema attrs 字段对应 */
  attrs?: Record<string, any>;
  /** 列样式 - 与 schema styles 字段对应 */
  styles?: Record<string, any>;
  /** 排序器 */
  sorter?: boolean | ((a: Record<string, any>, b: Record<string, any>, sortState?: SortState) => number);

  /** 是否可筛选 */
  filterable?: boolean;
  /** 筛选函数 */
  filterer?: (value: any, record: Record<string, any>) => boolean;
  /** 筛选回调函数 */
  onFilter?: (columnName: string, value: FilterValue | undefined) => boolean;
  /** 是否多选筛选 */
  filterMultiple?: boolean;
  /** 默认筛选操作符 */
  filterOp?: FilterOperator;
  /** 是否可编辑 */
  editable?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义编辑渲染函数 */
  editRender?: (value: any, onChange: (value: any) => void, column?: TableColumn, record?: Record<string, any>) => React.ReactNode;
  /** 编辑器配置 */
  editConfig?: EditorConfig;
  /** 是否可调整大小 */
  resizeable?: boolean;
  /** 列样式 */
  className?: string;
  /** 列样式 */
  style?: React.CSSProperties;
  /** 头部样式 */
  headerStyle?: React.CSSProperties;
  /** 单元格样式 */
  cellStyle?: React.CSSProperties;
  /** 其他扩展属性 */
  // [key: string]: any;
}

/**
 * Action事件数据类型
 */
export interface ActionEventData {
  /** 触发的记录数据（行操作时） */
  record?: Record<string, any>;
  /** 选中的行数据（工具栏操作时） */
  selectedRows?: Record<string, any>[];
  /** 行索引（行操作时） */
  rowIndex?: number;
  /** 原始事件对象 */
  originalEvent?: React.MouseEvent;
  /** 自定义数据 */
  payload?: any;
  /** 事件时间戳 */
  timestamp?: number;
  /** 事件来源 */
  source?: 'plugin' | 'user' | 'system';
  /** 交互类型 */
  interactionType?: 'confirm' | 'prompt' | 'dialog' | 'modal' | 'drawer' | 'menu' | 'page' | 'direct' | 'custom';
  /** 是否为硬删除（物理删除），仅删除操作时使用 */
  hardDelete?: boolean;
  /** 操作结果（after事件时） */
  result?: {
    success: boolean;
    data?: any;
    error?: Error | string;
  };
}
/**
 * 表格监听器配置
 */
export interface TableEventListenerConfig<T extends ActionEventData = ActionEventData> {
  actionKey: string;
  /** `action` 可选 —— 与 `emitAction(actionKey, data, context, action?)` 的契约一致 */
  handler: (data: T, context: TableContextValue, action?: ActionConfig) => Promise<any> | any;
  options?: ActionListenerOptions;
  priority?: number;
}
