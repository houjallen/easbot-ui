/**
 * DatePicker 日期时间选择器组件导出
 */

export { DatePicker } from './date-picker';
export { InputDate } from './input-date';
export { InputTime } from './input-time';
export { InputDateTime } from './input-date-time';
export { InputDateRange } from './input-date-range';
export { InputTimeRange } from './input-time-range';
export { InputDateTimeRange } from './input-date-time-range';
export { EnhancedDatePicker } from './enhanced-date-picker';
export { EmbeddedDatePicker } from './embedded-date-picker';

// 视图组件导出
export {
  ViewSelectorHeader,
  YearView,
  YearRangeView,
  MonthView,
  MonthRangeView,
  QuarterView,
  QuarterRangeView,
  DayView,
  DayRangeView,
  TimeView,
  TimeRangeView,
  ShortcutView,
  ShortcutRangeView,
  CombinedShortcutView,
  type ViewMode,
  type BaseViewProps,
  type BaseRangeViewProps,
  type ViewSelectorHeaderProps,
  type TimeConstraints,
  type TimeViewProps,
  type TimeRangeViewProps,
  type ViewComponentStructure,
  type BaseShortcutViewProps,
  type ShortcutViewProps,
  type ShortcutRangeViewProps,
  type CombinedShortcutViewProps,
} from './view';

// 快捷选择相关导出
export {
  // 基于locale的快捷选择创建函数
  createDateShortcuts,
  createDateRangeShortcuts,
  createTimeShortcuts,
  // 类型定义
  type DateShortcut,
  type DateRangeShortcut,
} from './shortcuts';

// 国际化相关导出
export {
  type DatePickerLocale,
  zhCN,
  enUS,
  localeMap,
  getDatePickerLocale,
} from './locale';

// Hooks 导出
export {
  useDatePickerLocale,
  useDatePickerFormatters,
} from './hooks/use-date-picker-locale';

export {
  useDebouncedDateInput,
  useDateCache,
  useDateComparisons,
  useDateVirtualization,
  useDateSuggestions,
  useDateValidation,
} from './hooks/use-date-optimization';

// 工具函数导出
export {
  safeDateFormat,
  safeDateParse,
  validateDateRange,
  detectDateFormat,
  smartDateParse,
  combineDisabledDate,
  commonDisabledDates,
  dateCalculations,
  dateComparisons,
  DATE_FORMATS,
  getDateFormats,
  type FormatResult,
  type ParseResult,
} from './date-utils';

// 类型导出
export type { DatePickerProps } from './date-picker';
export type { InputDateProps } from './input-date';
export type { InputTimeProps } from './input-time';
export type { InputDateTimeProps } from './input-date-time';
export type { InputDateRangeProps } from './input-date-range';
export type { InputTimeRangeProps } from './input-time-range';
export type { EnhancedDatePickerProps } from './enhanced-date-picker';
export type { EmbeddedDatePickerProps } from './embedded-date-picker';
