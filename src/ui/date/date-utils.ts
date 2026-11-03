/**
 * Date组件优化工具函数
 *
 * @description
 * 提供日期组件的通用优化功能，包括格式化、验证、解析等
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { dateMessages } from '../../utils/component-messages';
import { processUiMessage } from '../../utils/ui-message';

// 扩展dayjs插件
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/**
 * 日期格式化结果接口
 */
export interface FormatResult {
  formatted: string;
  isValid: boolean;
  error?: string;
}

/**
 * 日期解析结果接口
 */
export interface ParseResult {
  date?: Date;
  isValid: boolean;
  error?: string;
}

/**
 * 安全的日期格式化函数
 * @param date 要格式化的日期
 * @param format 格式模式
 * @param fallback 失败时的默认值
 * @param locale 文案语言（用于错误提示），缺省回退到 zh-CN
 */
export function safeDateFormat(date: string | Date | undefined, format = 'YYYY-MM-DD', fallback = '', locale?: string): FormatResult {
  if (!date) {
    return { formatted: fallback, isValid: false };
  }

  try {
    const dayDate = dayjs(date);
    if (!dayDate.isValid()) {
      return {
        formatted: fallback,
        isValid: false,
        error: processUiMessage('invalidDateValue', { locale, messages: dateMessages }),
      };
    }

    return {
      formatted: dayDate.format(format),
      isValid: true,
    };
  } catch (error) {
    return {
      formatted: fallback,
      isValid: false,
      error: processUiMessage('dateFormatFailed', { locale, messages: dateMessages }),
    };
  }
}

/**
 * 安全的日期解析函数
 * @param dateStr 要解析的日期字符串
 * @param format 期望的格式
 * @param strict 是否严格模式
 * @param locale 文案语言（用于错误提示），缺省回退到 zh-CN
 */
export function safeDateParse(dateStr: string, format = 'YYYY-MM-DD', strict = true, locale?: string): ParseResult {
  if (!dateStr || dateStr.trim() === '') {
    return { isValid: false, error: processUiMessage('emptyDateString', { locale, messages: dateMessages }) };
  }

  try {
    const parsed = dayjs(dateStr, format, strict);

    if (!parsed.isValid()) {
      return {
        isValid: false,
        error: processUiMessage('dateFormatMismatch', { locale, messages: dateMessages }, { format }),
      };
    }

    return {
      date: parsed.toDate(),
      isValid: true,
    };
  } catch (error) {
    return {
      isValid: false,
      error: processUiMessage('dateParseFailed', { locale, messages: dateMessages }),
    };
  }
}

/**
 * 日期范围验证函数
 * @param date 要验证的日期
 * @param minDate 最小日期
 * @param maxDate 最大日期
 * @param locale 文案语言（用于错误提示），缺省回退到 zh-CN
 */
export function validateDateRange(date: Date, minDate?: Date, maxDate?: Date, locale?: string): { isValid: boolean; error?: string } {
  const dayDate = dayjs(date);

  if (minDate && dayDate.isBefore(dayjs(minDate), 'day')) {
    return {
      isValid: false,
      error: processUiMessage('dateBeforeMin', { locale, messages: dateMessages }, { date: dayjs(minDate).format('YYYY-MM-DD') }),
    };
  }

  if (maxDate && dayDate.isAfter(dayjs(maxDate), 'day')) {
    return {
      isValid: false,
      error: processUiMessage('dateAfterMax', { locale, messages: dateMessages }, { date: dayjs(maxDate).format('YYYY-MM-DD') }),
    };
  }

  return { isValid: true };
}

/**
 * 检测日期字符串的可能格式
 * @param dateStr 日期字符串
 */
export function detectDateFormat(dateStr: string): string[] {
  const commonFormats = [
    'YYYY-MM-DD',
    'YYYY/MM/DD',
    'YYYY.MM.DD',
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-M-D',
    'YYYY/M/D',
    'M/D/YYYY',
    'D/M/YYYY',
    'YYYY年MM月DD日',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm',
  ];

  const validFormats: string[] = [];

  for (const format of commonFormats) {
    if (dayjs(dateStr, format, true).isValid()) {
      validFormats.push(format);
    }
  }

  return validFormats;
}

/**
 * 智能日期解析（自动检测格式）
 * @param dateStr 日期字符串
 * @param locale 文案语言（用于错误提示），缺省回退到 zh-CN
 */
export function smartDateParse(dateStr: string, locale?: string): ParseResult {
  if (!dateStr || dateStr.trim() === '') {
    return { isValid: false, error: processUiMessage('emptyDateString', { locale, messages: dateMessages }) };
  }

  // 首先尝试检测格式
  const detectedFormats = detectDateFormat(dateStr);

  if (detectedFormats.length > 0) {
    // 使用第一个检测到的格式
    return safeDateParse(dateStr, detectedFormats[0], true, locale);
  }

  // 如果检测失败，尝试默认解析
  try {
    const parsed = dayjs(dateStr);
    if (parsed.isValid()) {
      return { date: parsed.toDate(), isValid: true };
    }
  } catch (error) {
    // 忽略错误，继续下面的处理
  }

  return {
    isValid: false,
    error: processUiMessage('unrecognizedDateFormat', { locale, messages: dateMessages }),
  };
}

/**
 * 创建日期禁用函数的组合器
 * @param disableFunctions 禁用函数数组
 */
export function combineDisabledDate(...disableFunctions: Array<((date: Date) => boolean) | undefined>): (date: Date) => boolean {
  return (date: Date) => {
    return disableFunctions.some((fn) => fn?.(date));
  };
}

/**
 * 常用的日期禁用函数
 */
export const commonDisabledDates = {
  /** 禁用未来日期 */
  disableFuture: (date: Date) => dayjs(date).isAfter(dayjs(), 'day'),

  /** 禁用过去日期 */
  disablePast: (date: Date) => dayjs(date).isBefore(dayjs(), 'day'),

  /** 禁用周末 */
  disableWeekends: (date: Date) => {
    const day = dayjs(date).day();
    return day === 0 || day === 6; // 0=周日, 6=周六
  },

  /** 禁用工作日 */
  disableWeekdays: (date: Date) => {
    const day = dayjs(date).day();
    return day >= 1 && day <= 5; // 1-5=周一到周五
  },

  /** 创建禁用特定日期的函数 */
  disableSpecificDates: (dates: Date[]) => (date: Date) => {
    return dates.some((disabledDate) => dayjs(date).isSame(dayjs(disabledDate), 'day'));
  },

  /** 禁用指定日期范围 */
  disableDateRange: (startDate: Date, endDate: Date) => (date: Date) => {
    const dayDate = dayjs(date);
    return dayDate.isAfter(dayjs(startDate), 'day') && dayDate.isBefore(dayjs(endDate), 'day');
  },

  /** 禁用指定月份的某些天数 */
  disableMonthDates: (month: number, dates: number[]) => (date: Date) => {
    const dayDate = dayjs(date);
    return dayDate.month() === month - 1 && dates.includes(dayDate.date());
  },

  /** 禁用每周的特定星期几 */
  disableWeekDays: (weekDays: number[]) => (date: Date) => {
    return weekDays.includes(dayjs(date).day());
  },
};

/**
 * 日期计算工具函数
 */
export const dateCalculations = {
  /** 获取日期范围的所有日期 */
  getDateRange: (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isSameOrBefore(end, 'day')) {
      dates.push(current.toDate());
      current = current.add(1, 'day');
    }

    return dates;
  },

  /** 获取两个日期间的天数差 */
  getDaysDifference: (startDate: Date, endDate: Date): number => {
    return dayjs(endDate).diff(dayjs(startDate), 'day');
  },

  /** 获取两个日期间的工作日数量 */
  getWorkingDays: (startDate: Date, endDate: Date): number => {
    let count = 0;
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isSameOrBefore(end, 'day')) {
      const dayOfWeek = current.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // 不是周末
        count++;
      }
      current = current.add(1, 'day');
    }

    return count;
  },

  /** 获取月份的第一天 */
  getMonthStart: (date: Date): Date => {
    return dayjs(date).startOf('month').toDate();
  },

  /** 获取月份的最后一天 */
  getMonthEnd: (date: Date): Date => {
    return dayjs(date).endOf('month').toDate();
  },

  /** 获取季度的第一天 */
  getQuarterStart: (date: Date): Date => {
    return dayjs(date).startOf('quarter').toDate();
  },

  /** 获取季度的最后一天 */
  getQuarterEnd: (date: Date): Date => {
    return dayjs(date).endOf('quarter').toDate();
  },

  /** 获取年份的第一天 */
  getYearStart: (date: Date): Date => {
    return dayjs(date).startOf('year').toDate();
  },

  /** 获取年份的最后一天 */
  getYearEnd: (date: Date): Date => {
    return dayjs(date).endOf('year').toDate();
  },

  /** 获取下一个工作日 */
  getNextWorkingDay: (date: Date): Date => {
    let next = dayjs(date).add(1, 'day');
    while (next.day() === 0 || next.day() === 6) {
      next = next.add(1, 'day');
    }
    return next.toDate();
  },

  /** 获取上一个工作日 */
  getPreviousWorkingDay: (date: Date): Date => {
    let prev = dayjs(date).subtract(1, 'day');
    while (prev.day() === 0 || prev.day() === 6) {
      prev = prev.subtract(1, 'day');
    }
    return prev.toDate();
  },
};

/**
 * 日期比较工具函数
 */
export const dateComparisons = {
  /** 检查是否为今天 */
  isToday: (date: Date): boolean => {
    return dayjs(date).isSame(dayjs(), 'day');
  },

  /** 检查是否为昨天 */
  isYesterday: (date: Date): boolean => {
    return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
  },

  /** 检查是否为明天 */
  isTomorrow: (date: Date): boolean => {
    return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
  },

  /** 检查是否为本周 */
  isThisWeek: (date: Date): boolean => {
    return dayjs(date).isSame(dayjs(), 'week');
  },

  /** 检查是否为本月 */
  isThisMonth: (date: Date): boolean => {
    return dayjs(date).isSame(dayjs(), 'month');
  },

  /** 检查是否为今年 */
  isThisYear: (date: Date): boolean => {
    return dayjs(date).isSame(dayjs(), 'year');
  },

  /** 检查是否为工作日 */
  isWorkingDay: (date: Date): boolean => {
    const day = dayjs(date).day();
    return day !== 0 && day !== 6;
  },

  /** 检查是否为周末 */
  isWeekend: (date: Date): boolean => {
    const day = dayjs(date).day();
    return day === 0 || day === 6;
  },

  /** 检查是否为闰年 */
  isLeapYear: (date: Date): boolean => {
    const year = dayjs(date).year();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },
};

/**
 * 日期格式化常量
 *
 * @description
 * `DATE_CN` / `MONTH_CN` / `YEAR_CN` 三个中文格式名来自内置文案表
 * （`formatPatterns.*`），随语言变化，因此**不能**在模块加载时固化为常量。
 * 这里改为「工厂函数 + 缺省导出」：
 * - `getDateFormats(locale)` —— 按语言取格式表；
 * - `DATE_FORMATS` —— 缺省（zh-CN）格式表，保持既有导出名与用法不变。
 */

/**
 * 按语言获取日期格式表
 *
 * @param locale 文案语言，缺省回退到 zh-CN
 * @returns 日期格式表
 */
export function getDateFormats(locale?: string) {
  return {
    DATE: 'YYYY-MM-DD',
    DATE_CN: processUiMessage('formatPatterns.yearMonthDay', { locale, messages: dateMessages }),
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DATETIME_CN: 'YYYY年MM月DD日 HH:mm:ss',
    TIME: 'HH:mm:ss',
    TIME_SHORT: 'HH:mm',
    MONTH: 'YYYY-MM',
    MONTH_CN: processUiMessage('formatPatterns.yearMonth', { locale, messages: dateMessages }),
    YEAR: 'YYYY',
    YEAR_CN: processUiMessage('formatPatterns.year', { locale, messages: dateMessages }),
    QUARTER: 'YYYY-[Q]Q',
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
  } as const;
}

/** 日期格式表（缺省 zh-CN），保持既有导出名不变 */
export const DATE_FORMATS = getDateFormats();
