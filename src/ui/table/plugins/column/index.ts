/**
 * 列头插件导出
 */

export {
  SortPlugin,
  type SortPluginConfig,
  type SortPluginState,
} from './SortPlugin';
export {
  FilterPlugin,
  type FilterPluginConfig,
  type FilterPluginState,
} from './FilterPlugin';
import { FilterPlugin } from './FilterPlugin';
import { SortPlugin } from './SortPlugin';
// 默认列头插件集合
export const defaultColumnPlugins = [SortPlugin, FilterPlugin];
