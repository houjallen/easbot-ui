/**
 * 表格插件统一导出
 * 提供所有内置插件的便捷访问
 */

// 内置table action插件
export { default as ExportPlugin } from './ExportPlugin';
export { default as PrintPlugin } from './PrintPlugin';
export { default as RefreshPlugin } from './RefreshPlugin';
export { default as FullscreenPlugin } from './FullscreenPlugin';
export { default as ColumnManagerPlugin } from './ColumnManagerPlugin';
export { default as AddPlugin } from './AddPlugin';
export { default as BatchDeletePlugin } from './BatchDeletePlugin';
export { default as ImportPlugin } from './ImportPlugin';

// 内置table row action插件
export { default as EditRowPlugin } from './row/EditRowPlugin';
export { default as DeleteRowPlugin } from './row/DeleteRowPlugin';
export { default as ViewRowPlugin } from './row/ViewRowPlugin';
export { default as CopyRowPlugin } from './row/CopyRowPlugin';
export { default as MoveRowPlugin } from './row/MoveRowPlugin';
export { default as ToggleEnableRowPlugin } from './row/ToggleEnableRowPlugin';

// 内置列头插件
export { SortPlugin, FilterPlugin, defaultColumnPlugins } from './column';

// 内置cell action插件
export {
  CellCopyPlugin,
  CellEditPlugin,
  defaultCellPlugins,
  CELL_PLUGINS,
} from './cell';
export type {
  CellCopyPluginConfig,
  CellCopyPluginState,
  CellEditPluginConfig,
  CellEditPluginState,
  CellPluginType,
} from './cell';

// 插件类型导出
export type { ExportPluginConfig } from './ExportPlugin';
export type { PrintPluginConfig } from './PrintPlugin';
export type { RefreshPluginConfig } from './RefreshPlugin';
export type { FullscreenPluginConfig } from './FullscreenPlugin';
export type { ColumnManagerPluginConfig } from './ColumnManagerPlugin';
export type { AddPluginConfig } from './AddPlugin';
export type { BatchDeletePluginConfig } from './BatchDeletePlugin';
export type { ImportPluginConfig } from './ImportPlugin';
export type { ViewRowPluginConfig } from './row/ViewRowPlugin';
export type { CopyRowPluginConfig } from './row/CopyRowPlugin';
export type { MoveRowPluginConfig } from './row/MoveRowPlugin';
export type { ToggleEnableRowPluginState } from './row/ToggleEnableRowPlugin';
export type {
  SortPluginConfig,
  SortPluginState,
  FilterPluginConfig,
  FilterPluginState,
} from './column';

import AddPlugin from './AddPlugin';
import BatchDeletePlugin from './BatchDeletePlugin';
import ColumnManagerPlugin from './ColumnManagerPlugin';
import ExportPlugin from './ExportPlugin';
import FullscreenPlugin from './FullscreenPlugin';
import ImportPlugin from './ImportPlugin';
import PrintPlugin from './PrintPlugin';
import RefreshPlugin from './RefreshPlugin';
import { CellCopyPlugin, CellEditPlugin } from './cell';
import { FilterPlugin, SortPlugin } from './column';
import CopyRowPlugin from './row/CopyRowPlugin';
import DeleteRowPlugin from './row/DeleteRowPlugin';
import EditRowPlugin from './row/EditRowPlugin';
import MoveRowPlugin from './row/MoveRowPlugin';
import ToggleEnableRowPlugin from './row/ToggleEnableRowPlugin';
import ViewRowPlugin from './row/ViewRowPlugin';

// 插件映射表
export const BUILTIN_PLUGINS = {
  // table action插件
  export: ExportPlugin,
  print: PrintPlugin,
  refresh: RefreshPlugin,
  fullscreen: FullscreenPlugin,
  columnManager: ColumnManagerPlugin,
  add: AddPlugin,
  batchDelete: BatchDeletePlugin,
  import: ImportPlugin,
  // table row action插件
  editRow: EditRowPlugin,
  deleteRow: DeleteRowPlugin,
  viewRow: ViewRowPlugin,
  copyRow: CopyRowPlugin,
  moveRow: MoveRowPlugin,
  toggleEnableRow: ToggleEnableRowPlugin,
  // 列头插件
  sort: SortPlugin,
  filter: FilterPlugin,
  // cell action插件
  cellCopy: CellCopyPlugin,
  cellEdit: CellEditPlugin,
} as const;
