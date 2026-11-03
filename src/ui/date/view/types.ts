/**
 * View组件通用类型定义
 */

import type { Dayjs } from 'dayjs';
import React from 'react';
import type { DateRangeShortcut, DateShortcut } from '../shortcuts';

// 视图模式类型
export type ViewMode = 'days' | 'months' | 'years' | 'quarters' | 'time';

// 通用视图属性接口
export interface BaseViewProps {
  viewDate: Dayjs;
  selectedDate?: Dayjs;
  onSelect: (date: Dayjs) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  isValidDate?: (date: Dayjs) => boolean;
  className?: string;
}

// 范围视图属性接口
export interface BaseRangeViewProps {
  viewDate: Dayjs;
  selectedStartDate?: Dayjs;
  selectedEndDate?: Dayjs;
  onStartSelect: (date: Dayjs) => void;
  onEndSelect: (date: Dayjs) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  isValidDate?: (date: Dayjs) => boolean;
  className?: string;
}

// 视图选择器头部属性
export interface ViewSelectorHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  viewDate: Dayjs;
  onViewDateChange: (date: Dayjs) => void;
  selectedDate?: Dayjs;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  showTimeView?: boolean;
  showQuarterView?: boolean;
  isValidDate?: (date: Dayjs) => boolean;
  className?: string;
}

// 时间约束配置
export interface TimeConstraints {
  hours?: { min: number; max: number; step?: number };
  minutes?: { min: number; max: number; step?: number };
  seconds?: { min: number; max: number; step?: number };
}

// 时间视图属性
export interface TimeViewProps extends Omit<BaseViewProps, 'viewDate' | 'minDate' | 'maxDate'> {
  showMinutes?: boolean;
  showSeconds?: boolean;
  timeConstraints?: TimeConstraints;
}

// 时间范围视图属性
export interface TimeRangeViewProps extends Omit<BaseRangeViewProps, 'viewDate' | 'minDate' | 'maxDate'> {
  showMinutes?: boolean;
  showSeconds?: boolean;
  timeConstraints?: TimeConstraints;
  separator?: string;
}

// 快捷选择基础属性
export interface BaseShortcutViewProps {
  /** 是否显示快捷选择 */
  show?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
  /** 标题 */
  title?: string;
  /** 最小宽度 */
  minWidth?: string;
}

// 单选快捷选择属性
export interface ShortcutViewProps extends BaseShortcutViewProps {
  /** 快捷选择选项 */
  shortcuts: DateShortcut[];
  /** 选择回调 */
  onSelect: (shortcut: DateShortcut) => void;
}

// 范围选择快捷选择属性
export interface ShortcutRangeViewProps extends BaseShortcutViewProps {
  /** 快捷选择选项 */
  shortcuts: DateRangeShortcut[];
  /** 选择回调 */
  onSelect: (shortcut: DateRangeShortcut) => void;
}

// 组合快捷选择属性
export interface CombinedShortcutViewProps extends BaseShortcutViewProps {
  /** 单选快捷选择选项 */
  dateShortcuts?: DateShortcut[];
  /** 范围选择快捷选择选项 */
  rangeShortcuts?: DateRangeShortcut[];
  /** 单选选择回调 */
  onDateSelect?: (shortcut: DateShortcut) => void;
  /** 范围选择回调 */
  onRangeSelect?: (shortcut: DateRangeShortcut) => void;
  /** 分组标题 */
  dateTitle?: string;
  rangeTitle?: string;
  /** 显示模式 */
  mode?: 'date' | 'range' | 'both';
}

// 通用视图组件结构
export interface ViewComponentStructure<T = any> {
  View: React.ComponentType<T>;
  Trigger?: React.ComponentType<any>;
  Content?: React.ComponentType<any>;
}
