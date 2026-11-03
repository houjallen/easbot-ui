/**
 * 现代化Table组件系统统一导出
 * 全新设计，采用最新TypeScript特性和React模式
 * 基于Hook系统和插件架构的统一实现
 */

// ============ 核心类型导出 ============

export type {
  // 基础类型
  TableSize,
  TableDensity,
  ColumnAlign,
  FixedPosition,
  SortDirection,
  DateComponentType,
  // 数据类型
  TableColumn,
  // 配置类型
  TableConfig,
  ScrollConfig,
  VirtualizationConfig,
  SelectionConfig,
  ExpansionConfig,
  SortConfig,
  FilterConfig,
  // 组件属性类型
  BaseTableProps,
  EnhancedTableProps,
  AdvancedTableProps,
  TableContainerProps,
  TableGridProps,
  TableCellProps,
  TableRowProps,
  TableHeaderProps,
  TableBodyProps,
  // 插件系统类型
  TablePlugin,
  UseTablePluginOptions,
  UseTablePluginReturn,
} from './types';

// ============ 上下文类型导出导出 ============
export * from './context/TableContext';

// ============ 原子组件导出 ============

export * from './atoms';

// ============ 功能组件导出 ============

export * from './components';

// ============ Hook系统导出 ============

// 核心状态管理Hooks
export * from './hooks';

// ============ 插件系统导出 ============

// 内置插件
export * from './plugins';

// ============ 推荐的主要组件 ============

// 基础表格
export * from './organisms';

export * from './molecules';

// ============ 工具函数导出 ============

export * from './utils';

// ============ 远端数据源导出 ============

export * from './store/tableDataSource';
export * from './hooks/useTableRemoteData';
