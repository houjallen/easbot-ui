/**
 * 表格组件类型定义统一导出
 * 与 schema 体系保持一致
 */

// 基础类型
export type {
  TableColumn,
  TableColumnType,
  TableSize,
  TableDensity,
  ColumnAlign,
  FixedPosition,
  SortDirection,
  FilterOperator,
  SelectionType,
  GetRowKey,
  ScrollConfig,
  VirtualizationConfig,
  EmptyConfig,
  LoadingConfig,
  SortState,
  FilterState,
  PaginationState,
  SelectionConfig,
  TableTheme,
  TableVariant,
  TableConfig,
  // 右键菜单相关类型
  ContextMenuConfig,
  ContextMenuActionConfig,
} from './base';

// Hook类型
export type {
  TablePlugin,
  TablePluginMessages,
  TablePluginStandardMessages,
  UseTablePluginOptions,
  UseTablePluginReturn,
  UseTableI18nOptions,
  UseTableI18nReturn,
  UseTableLogicOptions,
  UseTableLogicReturn,
} from './hooks';

// 组件属性类型
export type {
  TableContainerProps,
  TableGridProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableToolbarProps,
  TableActionProps,
  // 表格核心组件属性
  BaseTableProps,
  EnhancedTableProps,
  TableCardViewProps,
} from './components';

// 📌 **原从 `./components` 导出的 `AdvancedTableProps` 已移除（ADR 0001 / A-3）** ——
//    该定义是死代码（字段结构与组件实际签名不同），且从未被组件消费。
//    唯一定义源：`src/ui/table/organisms/AdvancedTable.tsx`，
//    由 `organisms/index.ts` 导出（包根经 `table/index.ts` 的 `export * from './organisms'` 暴露）。

// 工具类型
export * from './utils';

// 重新导出常用类型别名
export * from './base';
