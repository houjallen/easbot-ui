/**
 * 日期快捷选择配置
 */

import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import type { DatePickerLocale } from './locale';

// 扩展dayjs支持季度操作
dayjs.extend(quarterOfYear);

export interface DateShortcut {
  label: string;
  value: () => Date;
}

export interface DateRangeShortcut {
  label: string;
  value: () => [Date, Date];
}

// 创建单日期快捷选择
export const createDateShortcuts = (locale: DatePickerLocale): DateShortcut[] => [
  {
    label: locale.shortcuts.today,
    value: () => dayjs().startOf('day').toDate(),
  },
  {
    label: locale.shortcuts.yesterday,
    value: () => dayjs().subtract(1, 'day').startOf('day').toDate(),
  },
  {
    label: locale.shortcuts.tomorrow,
    value: () => dayjs().add(1, 'day').startOf('day').toDate(),
  },
  {
    label: locale.shortcuts.thisWeekStart,
    value: () => dayjs().startOf('week').toDate(),
  },
  {
    label: locale.shortcuts.thisMonthStart,
    value: () => dayjs().startOf('month').toDate(),
  },
  {
    label: locale.shortcuts.thisQuarterStart,
    value: () => dayjs().startOf('quarter').toDate(),
  },
  {
    label: locale.shortcuts.thisYearStart,
    value: () => dayjs().startOf('year').toDate(),
  },
];

// 创建日期范围快捷选择
export const createDateRangeShortcuts = (locale: DatePickerLocale): DateRangeShortcut[] => [
  {
    label: locale.shortcuts.today,
    value: () => [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()],
  },
  {
    label: locale.shortcuts.yesterday,
    value: () => [dayjs().subtract(1, 'day').startOf('day').toDate(), dayjs().subtract(1, 'day').endOf('day').toDate()],
  },
  {
    label: locale.shortcuts.thisWeek,
    value: () => [dayjs().startOf('week').toDate(), dayjs().endOf('week').toDate()],
  },
  {
    label: locale.shortcuts.lastWeek,
    value: () => [dayjs().subtract(1, 'week').startOf('week').toDate(), dayjs().subtract(1, 'week').endOf('week').toDate()],
  },
  {
    label: locale.shortcuts.thisMonth,
    value: () => [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
  },
  {
    label: locale.shortcuts.lastMonth,
    value: () => [dayjs().subtract(1, 'month').startOf('month').toDate(), dayjs().subtract(1, 'month').endOf('month').toDate()],
  },
  {
    label: locale.shortcuts.thisQuarter,
    value: () => [dayjs().startOf('quarter').toDate(), dayjs().endOf('quarter').toDate()],
  },
  {
    label: locale.shortcuts.lastQuarter,
    value: () => [dayjs().subtract(1, 'quarter').startOf('quarter').toDate(), dayjs().subtract(1, 'quarter').endOf('quarter').toDate()],
  },
  {
    label: locale.shortcuts.thisYear,
    value: () => [dayjs().startOf('year').toDate(), dayjs().endOf('year').toDate()],
  },
  {
    label: locale.shortcuts.lastYear,
    value: () => [dayjs().subtract(1, 'year').startOf('year').toDate(), dayjs().subtract(1, 'year').endOf('year').toDate()],
  },
  {
    label: locale.shortcuts.last7Days,
    value: () => [dayjs().subtract(6, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()],
  },
  {
    label: locale.shortcuts.last30Days,
    value: () => [dayjs().subtract(29, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()],
  },
  {
    label: locale.shortcuts.last90Days,
    value: () => [dayjs().subtract(89, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()],
  },
];

// 创建时间快捷选择
export const createTimeShortcuts = (locale: DatePickerLocale): DateShortcut[] => [
  {
    label: locale.shortcuts.now,
    value: () => new Date(),
  },
  {
    label: locale.shortcuts.morning9,
    value: () => dayjs().hour(9).minute(0).second(0).toDate(),
  },
  {
    label: locale.shortcuts.afternoon2,
    value: () => dayjs().hour(14).minute(0).second(0).toDate(),
  },
  {
    label: locale.shortcuts.afternoon6,
    value: () => dayjs().hour(18).minute(0).second(0).toDate(),
  },
];
