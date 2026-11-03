'use client';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { dateMessages } from '../../utils/component-messages';
import { processUiMessage } from '../../utils/ui-message';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

// 时区配置接口
export interface TimezoneConfig {
  utc?: boolean;
  timezone?: string;
  displayTimezone?: string;
  autoDetectTimezone?: boolean;
  /** 文案语言（用于时区标签 / 警告文案），缺省回退到 zh-CN */
  locale?: string;
}

// 时区信息接口
export interface TimezoneInfo {
  name: string;
  label: string;
  offset: string;
  abbreviation: string;
}

/** 时区标签解析选项 */
export interface TimezoneLabelOptions {
  /** 文案语言（用于时区标签），缺省回退到 zh-CN */
  locale?: string;
}

// 常用时区列表（labelKey 指向内置文案表的 key，标签在读取时按语言解析）
const COMMON_TIMEZONE_DEFINITIONS: (Omit<TimezoneInfo, 'label'> & { labelKey: string })[] = [
  {
    name: 'UTC',
    labelKey: 'timezoneLabels.utc',
    offset: '+00:00',
    abbreviation: 'UTC',
  },
  {
    name: 'Asia/Shanghai',
    labelKey: 'timezoneLabels.shanghai',
    offset: '+08:00',
    abbreviation: 'CST',
  },
  {
    name: 'Asia/Tokyo',
    labelKey: 'timezoneLabels.tokyo',
    offset: '+09:00',
    abbreviation: 'JST',
  },
  {
    name: 'Asia/Seoul',
    labelKey: 'timezoneLabels.seoul',
    offset: '+09:00',
    abbreviation: 'KST',
  },
  {
    name: 'Asia/Hong_Kong',
    labelKey: 'timezoneLabels.hongKong',
    offset: '+08:00',
    abbreviation: 'HKT',
  },
  {
    name: 'Asia/Taipei',
    labelKey: 'timezoneLabels.taipei',
    offset: '+08:00',
    abbreviation: 'CST',
  },
  {
    name: 'Asia/Singapore',
    labelKey: 'timezoneLabels.singapore',
    offset: '+08:00',
    abbreviation: 'SGT',
  },
  {
    name: 'Europe/London',
    labelKey: 'timezoneLabels.london',
    offset: '+00:00',
    abbreviation: 'GMT',
  },
  {
    name: 'Europe/Paris',
    labelKey: 'timezoneLabels.paris',
    offset: '+01:00',
    abbreviation: 'CET',
  },
  {
    name: 'Europe/Berlin',
    labelKey: 'timezoneLabels.berlin',
    offset: '+01:00',
    abbreviation: 'CET',
  },
  {
    name: 'America/New_York',
    labelKey: 'timezoneLabels.newYork',
    offset: '-05:00',
    abbreviation: 'EST',
  },
  {
    name: 'America/Los_Angeles',
    labelKey: 'timezoneLabels.losAngeles',
    offset: '-08:00',
    abbreviation: 'PST',
  },
  {
    name: 'America/Chicago',
    labelKey: 'timezoneLabels.chicago',
    offset: '-06:00',
    abbreviation: 'CST',
  },
  {
    name: 'America/Denver',
    labelKey: 'timezoneLabels.denver',
    offset: '-07:00',
    abbreviation: 'MST',
  },
];

/**
 * 按语言解析常用时区列表
 *
 * @param options 解析选项（文案语言）
 * @returns 时区信息列表（label 已按语言解析）
 */
export function getCommonTimezones(options: TimezoneLabelOptions = {}): TimezoneInfo[] {
  return COMMON_TIMEZONE_DEFINITIONS.map(({ labelKey, ...info }) => ({
    ...info,
    label: processUiMessage(labelKey, { locale: options.locale, messages: dateMessages }),
  }));
}

// 常用时区列表（缺省 zh-CN）
export const COMMON_TIMEZONES: TimezoneInfo[] = getCommonTimezones();

// 获取当前系统时区
export function getSystemTimezone(): string {
  return dayjs.tz.guess();
}

// 获取时区信息
export function getTimezoneInfo(timezone: string, options: TimezoneLabelOptions = {}): TimezoneInfo | null {
  try {
    const now = dayjs().tz(timezone);
    const offset = now.format('Z');
    const abbreviation = now.format('z');

    const commonTz = getCommonTimezones(options).find((tz) => tz.name === timezone);

    return {
      name: timezone,
      label: commonTz?.label || timezone,
      offset,
      abbreviation: abbreviation || commonTz?.abbreviation || '',
    };
  } catch (error) {
    console.warn(processUiMessage('invalidTimezone', { locale: options.locale, messages: dateMessages }, { timezone }));
    return null;
  }
}

// 转换日期到指定时区
export function convertToTimezone(date: Date | dayjs.Dayjs | string, targetTimezone: string, sourceTimezone?: string): dayjs.Dayjs {
  let dayjsDate = dayjs(date);

  // 如果指定了源时区，先设置源时区
  if (sourceTimezone) {
    dayjsDate = dayjsDate.tz(sourceTimezone);
  }

  // 转换到目标时区
  return dayjsDate.tz(targetTimezone);
}

// 转换日期到 UTC
export function convertToUTC(date: Date | dayjs.Dayjs | string, sourceTimezone?: string): dayjs.Dayjs {
  let dayjsDate = dayjs(date);

  if (sourceTimezone) {
    dayjsDate = dayjsDate.tz(sourceTimezone);
  }

  return dayjsDate.utc();
}

// 从 UTC 转换到本地时区
export function convertFromUTC(utcDate: Date | dayjs.Dayjs | string, targetTimezone?: string): dayjs.Dayjs {
  const utcDayjs = dayjs.utc(utcDate);

  if (targetTimezone) {
    return utcDayjs.tz(targetTimezone);
  }

  return utcDayjs.local();
}

// 格式化日期时间（带时区信息）
export function formatWithTimezone(date: Date | dayjs.Dayjs | string, format: string, config: TimezoneConfig = {}): string {
  const { utc = false, timezone, displayTimezone, locale } = config;

  let dayjsDate = dayjs(date);

  if (utc) {
    dayjsDate = dayjsDate.utc();
  } else if (timezone) {
    dayjsDate = dayjsDate.tz(timezone);
  }

  let formattedDate = dayjsDate.format(format);

  // 添加时区信息显示
  if (displayTimezone && !utc) {
    const tzInfo = timezone ? getTimezoneInfo(timezone, { locale }) : null;
    if (tzInfo) {
      formattedDate += ` (${tzInfo.abbreviation})`;
    }
  } else if (utc) {
    formattedDate += ' (UTC)';
  }

  return formattedDate;
}

// 解析带时区的日期字符串
export function parseWithTimezone(dateString: string, format: string, config: TimezoneConfig = {}): dayjs.Dayjs {
  const { utc = false, timezone } = config;

  if (utc) {
    return dayjs.utc(dateString, format);
  } else if (timezone) {
    return dayjs.tz(dateString, format, timezone);
  }

  return dayjs(dateString, format);
}

// 获取时区偏移量（分钟）
export function getTimezoneOffset(timezone?: string, options: TimezoneLabelOptions = {}): number {
  if (!timezone) {
    return new Date().getTimezoneOffset();
  }

  try {
    const now = dayjs().tz(timezone);
    return -now.utcOffset(); // dayjs 返回的是相反的值
  } catch (error) {
    console.warn(processUiMessage('invalidTimezone', { locale: options.locale, messages: dateMessages }, { timezone }));
    return 0;
  }
}

// 比较两个时区的时间差（小时）
export function getTimezoneDifference(timezone1: string, timezone2: string, options: TimezoneLabelOptions = {}): number {
  try {
    const now = dayjs();
    const time1 = now.tz(timezone1);
    const time2 = now.tz(timezone2);

    return (time1.utcOffset() - time2.utcOffset()) / 60;
  } catch (error) {
    console.warn(processUiMessage('invalidTimezoneComparison', { locale: options.locale, messages: dateMessages }, { timezone1, timezone2 }));
    return 0;
  }
}

// 检查是否为有效时区
export function isValidTimezone(timezone: string): boolean {
  try {
    dayjs().tz(timezone);
    return true;
  } catch (error) {
    return false;
  }
}

// 自动检测用户时区
export function detectUserTimezone(options: TimezoneLabelOptions = {}): string {
  try {
    // 优先使用 Intl API
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone && isValidTimezone(timezone)) {
        return timezone;
      }
    }

    // 回退到 dayjs 的猜测
    return dayjs.tz.guess();
  } catch (error) {
    console.warn(processUiMessage('timezoneDetectFailed', { locale: options.locale, messages: dateMessages }));
    return 'UTC';
  }
}

// 时区转换工具类
export class TimezoneConverter {
  private sourceTimezone: string;
  private targetTimezone: string;
  /** 文案语言（用于时区标签） */
  private locale?: string;

  constructor(sourceTimezone = 'UTC', targetTimezone: string = getSystemTimezone(), locale?: string) {
    this.sourceTimezone = sourceTimezone;
    this.targetTimezone = targetTimezone;
    this.locale = locale;
  }

  // 设置源时区
  setSourceTimezone(timezone: string): this {
    this.sourceTimezone = timezone;
    return this;
  }

  // 设置目标时区
  setTargetTimezone(timezone: string): this {
    this.targetTimezone = timezone;
    return this;
  }

  // 设置文案语言
  setLocale(locale?: string): this {
    this.locale = locale;
    return this;
  }

  // 转换日期
  convert(date: Date | dayjs.Dayjs | string): dayjs.Dayjs {
    return convertToTimezone(date, this.targetTimezone, this.sourceTimezone);
  }

  // 批量转换日期
  convertBatch(dates: (Date | dayjs.Dayjs | string)[]): dayjs.Dayjs[] {
    return dates.map((date) => this.convert(date));
  }

  // 获取转换信息
  getConversionInfo(): {
    source: TimezoneInfo | null;
    target: TimezoneInfo | null;
    difference: number;
  } {
    return {
      source: getTimezoneInfo(this.sourceTimezone, { locale: this.locale }),
      target: getTimezoneInfo(this.targetTimezone, { locale: this.locale }),
      difference: getTimezoneDifference(this.sourceTimezone, this.targetTimezone, { locale: this.locale }),
    };
  }
}

// UTC 时间处理的 React Hook
export function useTimezone(config: TimezoneConfig = {}) {
  const { utc = false, timezone, displayTimezone, autoDetectTimezone = false, locale } = config;

  const [currentTimezone, setCurrentTimezone] = React.useState<string>(() => {
    if (utc) return 'UTC';
    if (timezone) return timezone;
    if (autoDetectTimezone) return detectUserTimezone({ locale });
    return getSystemTimezone();
  });

  React.useEffect(() => {
    if (autoDetectTimezone && !timezone) {
      const detectedTz = detectUserTimezone({ locale });
      setCurrentTimezone(detectedTz);
    }
  }, [autoDetectTimezone, timezone, locale]);

  const formatDate = React.useCallback(
    (date: Date | dayjs.Dayjs | string, format: string): string => {
      return formatWithTimezone(date, format, {
        utc,
        timezone: currentTimezone,
        displayTimezone,
        locale,
      });
    },
    [utc, currentTimezone, displayTimezone, locale],
  );

  const parseDate = React.useCallback(
    (dateString: string, format: string): dayjs.Dayjs => {
      return parseWithTimezone(dateString, format, {
        utc,
        timezone: currentTimezone,
      });
    },
    [utc, currentTimezone],
  );

  const convertToLocal = React.useCallback(
    (date: Date | dayjs.Dayjs | string): dayjs.Dayjs => {
      if (utc) {
        return convertFromUTC(date, currentTimezone);
      }
      return convertToTimezone(date, currentTimezone);
    },
    [utc, currentTimezone],
  );

  const convertToUTCCallback = React.useCallback(
    (date: Date | dayjs.Dayjs | string): dayjs.Dayjs => {
      return convertToUTC(date, currentTimezone);
    },
    [currentTimezone],
  );

  return {
    currentTimezone,
    setTimezone: setCurrentTimezone,
    formatDate,
    parseDate,
    convertToLocal,
    convertToUTC: convertToUTCCallback,
    timezoneInfo: getTimezoneInfo(currentTimezone, { locale }),
    isUTC: utc,
  };
}

// 导入 React（用于 Hook）
import React from 'react';
