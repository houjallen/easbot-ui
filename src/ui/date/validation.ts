'use client';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { dateMessages } from '../../utils/component-messages';
import { getUiMessageObject, processUiMessage } from '../../utils/ui-message';

// 扩展 dayjs 插件
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(quarterOfYear);

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  parsedDate?: dayjs.Dayjs;
}

// 格式化选项接口
export interface FormatOptions {
  format: string;
  utc?: boolean;
  timezone?: string;
  /**
   * dayjs 本地化语言（用于月份 / 星期名等），
   * **不是**文案语言 —— 文案语言请用 `messagesLocale`。
   */
  locale?: string;
  /** 文案语言（用于错误提示），缺省回退到 zh-CN */
  messagesLocale?: string;
}

// 验证选项接口
export interface ValidationOptions extends FormatOptions {
  minDate?: Date | dayjs.Dayjs;
  maxDate?: Date | dayjs.Dayjs;
  disabledDate?: (date: Date) => boolean;
  allowEmpty?: boolean;
  strictParsing?: boolean;
}

// 常用日期格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATE_CN: 'YYYY年MM月DD日',
  DATE_SLASH: 'YYYY/MM/DD',
  DATE_DOT: 'YYYY.MM.DD',
  TIME: 'HH:mm:ss',
  TIME_SHORT: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_SHORT: 'YYYY-MM-DD HH:mm',
  DATETIME_CN: 'YYYY年MM月DD日 HH时mm分ss秒',
  MONTH: 'YYYY-MM',
  MONTH_CN: 'YYYY年MM月',
  YEAR: 'YYYY',
  YEAR_CN: 'YYYY年',
  QUARTER: 'YYYY-[Q]Q',
  QUARTER_CN: 'YYYY年第Q季度',
} as const;

// 自动检测日期格式
export function detectDateFormat(input: string): string | null {
  const formats = Object.values(DATE_FORMATS);

  for (const format of formats) {
    if (dayjs(input, format, true).isValid()) {
      return format;
    }
  }

  // 尝试一些常见的变体格式
  const commonFormats = ['YYYY-M-D', 'YYYY/M/D', 'YYYY.M.D', 'M/D/YYYY', 'D/M/YYYY', 'M-D-YYYY', 'D-M-YYYY', 'H:m:s', 'H:m', 'YYYY-M-D H:m:s', 'YYYY-M-D H:m'];

  for (const format of commonFormats) {
    if (dayjs(input, format, true).isValid()) {
      return format;
    }
  }

  return null;
}

// 智能解析日期字符串
export function parseDate(input: string, options: Partial<ValidationOptions> = {}): ValidationResult {
  const { format, utc = false, timezone, locale, strictParsing = true, messagesLocale } = options;

  if (!input || input.trim() === '') {
    if (options.allowEmpty) {
      return { isValid: true };
    }
    return { isValid: false, error: processUiMessage('emptyDate', { locale: messagesLocale, messages: dateMessages }) };
  }

  let parsedDate: dayjs.Dayjs;

  try {
    if (format) {
      // 使用指定格式解析
      parsedDate = dayjs(input, format, strictParsing);
    } else {
      // 自动检测格式
      const detectedFormat = detectDateFormat(input);
      if (detectedFormat) {
        parsedDate = dayjs(input, detectedFormat, true);
      } else {
        // 使用默认解析
        parsedDate = dayjs(input);
      }
    }

    // 应用时区设置
    if (utc) {
      parsedDate = parsedDate.utc();
    } else if (timezone) {
      parsedDate = parsedDate.tz(timezone);
    }

    // 应用本地化
    if (locale) {
      parsedDate = parsedDate.locale(locale);
    }

    // 检查解析结果是否有效
    if (!parsedDate.isValid()) {
      return {
        isValid: false,
        error: format
          ? processUiMessage('dateFormatMismatch', { locale: messagesLocale, messages: dateMessages }, { format })
          : processUiMessage('invalidDate', { locale: messagesLocale, messages: dateMessages }),
      };
    }

    return {
      isValid: true,
      parsedDate,
    };
  } catch (error) {
    return {
      isValid: false,
      error: processUiMessage('dateParseFailed', { locale: messagesLocale, messages: dateMessages }),
    };
  }
}

// 验证日期
export function validateDate(input: string, options: ValidationOptions): ValidationResult {
  // 首先解析日期
  const parseResult = parseDate(input, options);

  if (!parseResult.isValid || !parseResult.parsedDate) {
    return parseResult;
  }

  const { parsedDate } = parseResult;
  const { minDate, maxDate, disabledDate, messagesLocale } = options;

  // 检查最小日期限制
  if (minDate) {
    const min = dayjs(minDate);
    if (parsedDate.isBefore(min, 'day')) {
      return {
        isValid: false,
        error: processUiMessage('dateBeforeMin', { locale: messagesLocale, messages: dateMessages }, { date: min.format(options.format || DATE_FORMATS.DATE) }),
      };
    }
  }

  // 检查最大日期限制
  if (maxDate) {
    const max = dayjs(maxDate);
    if (parsedDate.isAfter(max, 'day')) {
      return {
        isValid: false,
        error: processUiMessage('dateAfterMax', { locale: messagesLocale, messages: dateMessages }, { date: max.format(options.format || DATE_FORMATS.DATE) }),
      };
    }
  }

  // 检查自定义禁用日期
  if (disabledDate?.(parsedDate.toDate())) {
    return {
      isValid: false,
      error: processUiMessage('dateDisabled', { locale: messagesLocale, messages: dateMessages }),
    };
  }

  return {
    isValid: true,
    parsedDate,
  };
}

// 格式化日期
export function formatDate(date: Date | dayjs.Dayjs | string | null | undefined, options: FormatOptions): string {
  if (!date) return '';

  const { format, utc = false, timezone, locale } = options;

  let dayjsDate = dayjs(date);

  // 应用时区设置
  if (utc) {
    dayjsDate = dayjsDate.utc();
  } else if (timezone) {
    dayjsDate = dayjsDate.tz(timezone);
  }

  // 应用本地化
  if (locale) {
    dayjsDate = dayjsDate.locale(locale);
  }

  return dayjsDate.format(format);
}

// 验证时间范围
export function validateTimeRange(startTime: string, endTime: string, options: ValidationOptions): ValidationResult {
  const { messagesLocale } = options;
  const startResult = validateDate(startTime, options);
  if (!startResult.isValid) {
    return { ...startResult, error: processUiMessage('startTimePrefix', { locale: messagesLocale, messages: dateMessages }, { error: startResult.error }) };
  }

  const endResult = validateDate(endTime, options);
  if (!endResult.isValid) {
    return { ...endResult, error: processUiMessage('endTimePrefix', { locale: messagesLocale, messages: dateMessages }, { error: endResult.error }) };
  }

  if (startResult.parsedDate && endResult.parsedDate && startResult.parsedDate.isAfter(endResult.parsedDate)) {
    return {
      isValid: false,
      error: processUiMessage('startTimeAfterEndTime', { locale: messagesLocale, messages: dateMessages }),
    };
  }

  return { isValid: true };
}

// 验证日期范围
export function validateDateRange(startDate: string, endDate: string, options: ValidationOptions): ValidationResult {
  const { messagesLocale } = options;
  const startResult = validateDate(startDate, options);
  if (!startResult.isValid) {
    return { ...startResult, error: processUiMessage('startDatePrefix', { locale: messagesLocale, messages: dateMessages }, { error: startResult.error }) };
  }

  const endResult = validateDate(endDate, options);
  if (!endResult.isValid) {
    return { ...endResult, error: processUiMessage('endDatePrefix', { locale: messagesLocale, messages: dateMessages }, { error: endResult.error }) };
  }

  if (startResult.parsedDate && endResult.parsedDate && startResult.parsedDate.isAfter(endResult.parsedDate, 'day')) {
    return {
      isValid: false,
      error: processUiMessage('startDateAfterEndDate', { locale: messagesLocale, messages: dateMessages }),
    };
  }

  return { isValid: true };
}

// 规范化输入格式
export function normalizeInput(input: string, targetFormat: string): string {
  const parseResult = parseDate(input, { allowEmpty: true });

  if (!parseResult.isValid || !parseResult.parsedDate) {
    return input; // 返回原始输入
  }

  return parseResult.parsedDate.format(targetFormat);
}

// 获取格式化提示文本
export function getFormatHint(format: string, locale?: string): string {
  // 格式示例表来自内置文案表（key 内含 `.` ，需整表取出后再按格式取值）
  const examples = getUiMessageObject<Record<string, string>>('formatExamples', { locale, messages: dateMessages });
  const hint = examples?.[format];

  if (hint) return hint;

  return processUiMessage('formatHint', { locale, messages: dateMessages }, { format });
}

// 实时输入格式化（用于输入过程中的格式化）
export function formatInputOnType(input: string, format: string, previousValue = ''): string {
  // 移除非数字字符（保留分隔符）
  const allowedChars = /[0-9\-/.:\s年月日时分秒第季度Q]/g;
  let cleaned = input.match(allowedChars)?.join('') || '';

  // 根据格式自动添加分隔符
  if (format.includes('-')) {
    // 处理 YYYY-MM-DD 格式
    cleaned = cleaned.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    cleaned = cleaned.replace(/(\d{4})(\d{2})/, '$1-$2');
  } else if (format.includes('/')) {
    // 处理 YYYY/MM/DD 格式
    cleaned = cleaned.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
    cleaned = cleaned.replace(/(\d{4})(\d{2})/, '$1/$2');
  } else if (format.includes('.')) {
    // 处理 YYYY.MM.DD 格式
    cleaned = cleaned.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
    cleaned = cleaned.replace(/(\d{4})(\d{2})/, '$1.$2');
  }

  // 处理时间格式
  if (format.includes(':')) {
    cleaned = cleaned.replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3');
    cleaned = cleaned.replace(/(\d{2})(\d{2})/, '$1:$2');
  }

  return cleaned;
}
