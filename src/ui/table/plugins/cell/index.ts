/**
 * 单元格级插件统一导出
 * 提供所有cell级内置插件的便捷访问
 */

// 内置cell action插件
export { default as CellCopyPlugin } from './CellCopyPlugin';
export { default as CellEditPlugin } from './CellEditPlugin';

// 插件类型导出
export type {
  CellCopyPluginConfig,
  CellCopyPluginState,
} from './CellCopyPlugin';
export type {
  CellEditPluginConfig,
  CellEditPluginState,
} from './CellEditPlugin';

import CellCopyPlugin from './CellCopyPlugin';
import CellEditPlugin from './CellEditPlugin';

// 默认cell插件列表
export const defaultCellPlugins = [CellCopyPlugin, CellEditPlugin];

// cell插件映射表
export const CELL_PLUGINS = {
  cellCopy: CellCopyPlugin,
  cellEdit: CellEditPlugin,
} as const;

// 插件类型
export type CellPluginType = keyof typeof CELL_PLUGINS;
