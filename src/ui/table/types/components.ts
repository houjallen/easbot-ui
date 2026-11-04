/**
 * 表格组件属性类型定义
 * 包含所有表格组件的Props接口
 * 与 schema 体系保持一致
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { TableColumn, VirtualizationConfig } from './base';
import type { TableActionConfig, TableConfig, TableRowActionConfig, ToolbarConfig } from './base';
import type {
  CardConfig,
  ColumnAlign,
  EmptyConfig,
  ExpansionConfig,
  FilterState,
  FixedPosition,
  GetRowKey,
  PaginationState,
  ResizeConfig,
  ScrollConfig,
  SelectionConfig,
  SelectionType,
  SortState,
  TableDensity,
  TableSize,
  ToolbarActionConfig,
} from './base';

// ============ 基础组件属性 ============

/**
 * 表格容器属性
 */
export interface TableContainerProps extends ComponentPropsWithoutRef<'div'> {
  /** 表格尺寸 */
  size?: TableSize;
  /** 表格密度 */
  density?: TableDensity;
  /** 是否显示边框 - 与 schema bordered 字段对应 */
  bordered?: boolean;
  /** 是否显示条纹 */
  striped?: boolean;
  /** 是否固定表头 */
  stickyHeader?: boolean;
  /** 是否启用悬停效果 */
  hoverable?: boolean;
  /** 是否填充满父容器 */
  fillContainer?: boolean;
  /** 滚动配置 - 与 schema scroll 字段对应 */
  scroll?: ScrollConfig;
  /** 是否全屏模式 */
  fullscreen?: boolean;
  /** 加载配置 */
  loading?: boolean;
  /** 错误信息 */
  error?: ReactNode;
  /** 是否是空数据 */
  empty?: boolean;
}

/**
 * 列宽配置接口
 */
export interface ColumnWidth {
  /** 列宽度 */
  width?: number;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
}

/**
 * 现代化表格网格组件
 * 提供最基础的HTML table元素封装
 */
export interface TableGridProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** 是否使用固定布局 */
  fixedLayout?: boolean;
  /** 表格最小宽度 */
  tableMinWidth?: number;
  /** 列宽配置 */
  columnWidths?: ColumnWidth[];
}

/**
 * 表格头部属性
 */
export interface TableHeaderProps extends ComponentPropsWithoutRef<'thead'> {
  /** 是否粘性定位 */
  stickyHeader?: boolean;
  /** 粘性定位偏移量 */
  stickyHeaderOffset?: number;
  /** 表格尺寸 */
  size?: TableSize;
  /** 表格密度 */
  density?: TableDensity;
}

/**
 * 表格主体属性
 */
export interface TableBodyProps extends ComponentPropsWithoutRef<'tbody'> {
  /** 最小高度 */
  minHeight?: number | string;
  /** 表格尺寸 */
  size?: TableSize;
  /** 表格密度 */
  density?: TableDensity;
  /** 是否显示条纹 */
  striped?: boolean;
  /** 是否启用悬停效果 */
  hoverable?: boolean;
}

/**
 * 表格行属性
 */
export interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {
  /** 是否选中 */
  selected?: boolean;
  /** 是否展开 */
  expanded?: boolean;
  /** 是否支持悬停效果 */
  hoverable?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 行索引 */
  index?: number;
  /** 行数据记录 - 用于右键菜单等功能 */
  record?: Record<string, any>;
  /** 表格尺寸 */
  size?: TableSize;
  /** 表格密度 */
  density?: TableDensity;
}

/**
 * 表格单元格属性
 */
export interface TableCellProps extends Omit<ComponentPropsWithoutRef<'td'>, 'align'> {
  /** 单元格类型 */
  as?: 'td' | 'th';
  /** 对齐方式 */
  align?: ColumnAlign;
  /** 是否固定 */
  fixed?: FixedPosition;
  /** 是否截断文本 */
  ellipsis?: boolean;
  /** 是否可调整大小 */
  resizeable?: boolean;
  /** 调整大小回调 */
  onResize?: (width: number) => void;
  /** 表格尺寸 */
  size?: TableSize;
  /** 表格密度 */
  density?: TableDensity;
}

// ============ 选择相关组件属性 ============

/**
 * 选择列属性
 */
export interface SelectionColumnProps {
  /** 选择类型 */
  type?: SelectionType;
  /** 选中的行键 */
  selectedRowKeys?: (string | number)[];
  /** 选择变化回调 */
  onSelectionChange?: (selectedRowKeys: (string | number)[], selectedRows: Record<string, any>[]) => void;
  /** 获取行键的方法 */
  getRowKey?: GetRowKey;
  /** 是否禁用选择 */
  disabled?: boolean;
  /** 获取行选择属性 */
  getCheckboxProps?: (record: Record<string, any>) => { disabled?: boolean };
  /** 数据源 */
  data?: Record<string, any>[];
}

/**
 * 选择器属性
 */
export interface TableSelectorProps {
  /** 选择类型 */
  type: SelectionType;
  /** 是否选中 */
  checked?: boolean;
  /** 是否部分选中 */
  indeterminate?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选择变化回调 */
  onChange?: (checked: boolean) => void;
}

// ============ 排序相关组件属性 ============

/**
 * 排序器属性
 */
export interface TableSorterProps {
  /** 当前排序方向 */
  direction?: 'asc' | 'desc' | null;
  /** 排序变化回调 */
  onSortChange?: (direction: 'asc' | 'desc' | null) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义图标 */
  icons?: {
    asc?: ReactNode;
    desc?: ReactNode;
    default?: ReactNode;
  };
}

// ============ 筛选相关组件属性 ============

/**
 * 筛选器属性
 */
export interface TableFilterProps {
  /** 筛选值 */
  value?: any;
  /** 筛选变化回调 */
  onChange?: (value: any) => void;
  /** 筛选选项 */
  options?: Array<{ label: ReactNode; value: any; disabled?: boolean }>;
  /** 占位符 */
  placeholder?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 自定义筛选内容 */
  filterDropdown?: ReactNode;
  /** 是否显示重置按钮 */
  showReset?: boolean;
}

/**
 * Table 动作组件属性
 */
export interface TableActionProps extends TableActionConfig {}

/**
 * Table 行动作组件属性
 */
export interface TableRowActionProps extends TableRowActionConfig {}

// ============ 虚拟滚动相关组件属性 ============

/**
 * 虚拟滚动容器属性
 */
export interface VirtualScrollContainerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onScroll'> {
  /** 总高度 */
  height: number;
  /** 行高 */
  itemHeight: number;
  /** 数据总数 */
  itemCount: number;
  /** 缓冲区大小 */
  overscan?: number;
  /** 滚动事件回调 */
  onScroll?: (scrollTop: number) => void;
}

/**
 * 虚拟滚动项属性
 */
export interface VirtualScrollItemProps extends ComponentPropsWithoutRef<'div'> {
  /** 项索引 */
  index: number;
  /** 项高度 */
  height: number;
  /** 偏移量 */
  offset: number;
}

// ============ 工具栏相关组件属性 ============

/**
 * 表格工具栏属性
 */
export interface TableToolbarProps extends ToolbarConfig {
  /** 是否显示导出按钮 */
  showExport?: boolean;
  /** 是否显示打印按钮 */
  showPrint?: boolean;
  /** 是否显示全屏按钮 */
  showFullscreen?: boolean;
  /** 是否显示列管理按钮 */
  showColumnManager?: boolean;
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 自定义动作 */
  actions?: (ToolbarActionConfig | React.ReactNode)[];
  /** 导出回调 */
  onExport?: (format: string) => void;
  /** 打印回调 */
  onPrint?: () => void;
  /** 全屏变化回调 */
  onFullscreenChange?: (fullscreen: boolean) => void;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 列管理回调 */
  onColumnManager?: () => void;
}

// ============ 主要表格组件属性 ============

/**
 * 基础表格属性 - 与 schema TableDataSchema 保持一致
 */
export interface BaseTableProps extends TableConfig {
  /** 数据源 */
  data: Record<string, any>[];
  /** 列配置 - 与 schema columns 字段对应 */
  columns: TableColumn[];

  /** 表头配置 */
  showHeader?: boolean;
  stickyHeader?: boolean;
  stickyHeaderOffset?: number;

  /** 状态配置 */
  /** 加载配置 */
  loading?: boolean;
  /** 错误信息 */
  error?: ReactNode;
  /** 空状态配置 */
  empty?: ReactNode | EmptyConfig;

  /** 选择配置 - 与 schema selection 字段对应 */
  selectable?: boolean;
  selection?: SelectionConfig;

  /** 排序配置 */
  sortable?: boolean;
  sort?: SortState;

  /** 筛选配置 */
  filterable?: boolean;
  filter?: FilterState;

  /** 展开配置 - 与 schema expandable 字段对应 */
  expandable?: boolean;
  expansion?: ExpansionConfig;

  /** 列宽调整配置 */
  resizeable?: boolean;
  resize?: ResizeConfig;

  /** 分页配置 */
  paginable?: boolean;
  pagination?: PaginationState;

  /** 事件回调 */
  onRowClick?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
  onRowDoubleClick?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
  onRowMouseEnter?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
  onRowMouseLeave?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;

  /** 样式配置 */
  className?: string;
  style?: React.CSSProperties;

  /** 子组件 */
  children?: ReactNode;
}

/**
 * 增强表格属性
 */
export interface EnhancedTableProps {
  /** 数据源 */
  data?: Record<string, any>[];
  /** 列配置 - 与 schema columns 字段对应 */
  columns?: TableColumn[];

  /** 状态配置 */
  /** 加载配置 */
  loading?: boolean;
  /** 错误信息 */
  error?: ReactNode;
  /** 空状态配置 */
  empty?: ReactNode | EmptyConfig;

  /** 表格配置 */
  config?: TableConfig;

  /** 事件回调 */
  onRowClick?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
  onRowDoubleClick?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
  onRowMouseEnter?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
  onRowMouseLeave?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;

  /** 样式配置 */
  className?: string;
  style?: React.CSSProperties;

  /** 子组件 */
  children?: ReactNode;
}

// 📌 **原 `AdvancedTableProps` 定义已移除（ADR 0001 / A-3）** ——
//    该定义与 `organisms/AdvancedTable.tsx` 中**组件实际使用**的那份字段结构完全不同
//    （此处是 `plugins`/`searchPanel`，组件用的是 `plugin`/`search`），
//    且从未被任何组件消费 —— 属死代码。
//    更严重的是：修复前包根 barrel 导出的正是这份死代码，
//    消费方按导出类型写 props 会得到类型层面就错误的反馈。
//    唯一定义源：`src/ui/table/organisms/AdvancedTable.tsx`，由 `organisms/index.ts` 导出。

/**
 * 表格卡片视图组件属性
 */
export interface TableCardViewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 卡片配置 */
  cardConfig?: CardConfig;
  /** 选择变化回调 */
  onCheckedChange?: (record: Record<string, any>, index: number, selected?: boolean) => void;
  onCardClick?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
  onCardDoubleClick?: (record: Record<string, any>, index: number, event: React.MouseEvent) => void;
}

// ============ 分页组件属性 ============

// 📌 **原 `TablePaginationProps` 定义已移除（ADR 0001 / A-3）** ——
//    该定义与 `atoms/TablePagination.tsx` 中**组件实际使用**的那份字段结构完全不同
//    （此处是扁平的 `current`/`pageSize`/`total`，组件用的是 `pagination`/`config` 对象），
//    且从未被任何组件消费 —— 属死代码。
//    唯一定义源：`src/ui/table/atoms/TablePagination.tsx`，由 `atoms/index.ts` 导出。

// ============ 空状态组件属性 ============

/**
 * 空状态组件属性
 */
export interface TableEmptyProps {
  /** 描述文本 */
  description?: ReactNode;
  /** 图片或图标 */
  image?: ReactNode;
  /** 操作按钮 */
  action?: ReactNode;
  /** 自定义样式 */
  className?: string;
  style?: React.CSSProperties;
}

// ============ 加载组件属性 ============

/**
 * 加载组件属性
 */
export interface TableLoadingProps {
  /** 是否显示加载状态 */
  spinning?: boolean;
  /** 加载文本 */
  tip?: ReactNode;
  /** 延迟显示时间(ms) */
  delay?: number;
  /** 自定义加载指示器 */
  indicator?: ReactNode;
  /** 包装的内容 */
  children?: ReactNode;
  /** 自定义样式 */
  className?: string;
  style?: React.CSSProperties;
}

// ============ 虚拟滚动视图组件属性 ============

/**
 * 虚拟滚动Body属性
 */
export interface TableVirtualBodyProps {
  /** 虚拟化配置 */
  virtualizationConfig?: Partial<VirtualizationConfig>;
  /** 渲染单行的函数 - 由BaseTable提供 */
  renderRow: (params: { index: number; style: React.CSSProperties }) => React.ReactNode;
  /** 数据总数 */
  itemCount: number;
  /** 是否启用虚拟滚动 */
  shouldUseVirtualization: boolean;
  /** 降级渲染函数 - 当不使用虚拟滚动时 */
  fallbackRender: () => React.ReactNode;
}

/**
 * 虚拟滚动视图组件属性
 */
export interface TableVirtualViewProps extends ComponentPropsWithoutRef<'div'> {
  /** 虚拟化配置 */
  virtualizationConfig?: Partial<VirtualizationConfig>;
  /** 行点击事件 */
  onRowClick?: (record: any, index: number, event: React.MouseEvent) => void;
  /** 行双击事件 */
  onRowDoubleClick?: (record: any, index: number, event: React.MouseEvent) => void;
  /** 获取单元格样式类名 */
  getCellClassName?: (record: any, column: TableColumn, rowIndex: number, colIndex: number) => string;
  /** 渲染展开行内容 */
  renderExpandedRowContent?: (record: any, index: number) => ReactNode;
}
