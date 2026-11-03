import type { DateComponentType } from '../index';
import dayjs from 'dayjs';
import { isEmpty } from '../../../utils/object';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';

/**
 * 默认日期格式定义
 */
export const DEFAULT_FORMAT = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  time: 'HH:mm:ss',
  year: 'YYYY',
  month: 'YYYY-MM',
  day: 'YYYY-MM-DD',
};

/**
 * 默认日期格式的键名
 */
type DefaultFormatKey = keyof typeof DEFAULT_FORMAT;

/**
 * 日期组件类型 → 默认格式键名的映射
 *
 * @description
 * `DateComponentType` 中的范围类型（`date-range` / `datetime-range` / `time-range`）
 * 统一退化为对应的基础类型（`date` / `datetime` / `time`）。
 */
const DATE_TYPE_FORMAT_KEY: Record<DateComponentType, DefaultFormatKey> = {
  date: 'date',
  'date-range': 'date',
  datetime: 'datetime',
  'datetime-range': 'datetime',
  time: 'time',
  'time-range': 'time',
};

/**
 * 获取适用的日期格式
 * @param format 自定义格式
 * @param dateType 日期类型
 * @param mode 选择模式
 * @returns 最终使用的日期格式
 */
const getApplicableFormat = (format?: string, dateType: DateComponentType = 'date', mode: 'day' | 'month' | 'year' = 'day'): string => {
  if (!isEmpty(format)) return format as string;

  if (dateType === 'date') {
    return DEFAULT_FORMAT[mode];
  }

  return DEFAULT_FORMAT[DATE_TYPE_FORMAT_KEY[dateType]];
};

/**
 * 解析日期值为时间戳
 * @param options 参数选项
 * @returns 时间戳字符串或undefined
 */
export const parseFormatDateToTimeStamp = ({
  value,
  format,
  dateType = 'date',
  mode = 'day',
  locale,
}: {
  value: string;
  format?: string;
  dateType?: DateComponentType;
  mode?: 'day' | 'month' | 'year';
  /** 当前语言，用于日志文案 */
  locale?: string;
}): string | undefined => {
  if (!value) return undefined;

  try {
    const finalFormat = getApplicableFormat(format, dateType, mode);
    const parsed = dayjs(value, finalFormat, true);

    if (!parsed.isValid()) {
      console.warn(processUiMessage('dateParseFailed', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { value, format: finalFormat }));
      return undefined;
    }

    return parsed.toDate().getTime().toString();
  } catch (error) {
    console.error(processUiMessage('dateConvertFailed', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
    return undefined;
  }
};

/**
 * 将时间戳转换为格式化日期
 * @param options 参数选项
 * @returns 格式化的日期字符串或undefined
 */
export const parseTimeStampToFormatDate = ({
  value,
  format,
  dateType = 'date',
  mode = 'day',
  locale,
}: {
  value: string | number;
  format?: string;
  dateType?: DateComponentType;
  mode?: 'day' | 'month' | 'year';
  /** 当前语言，用于日志文案 */
  locale?: string;
}): string | undefined => {
  // TODO: isEmpty number 为 true，为什么会有这个bug？
  if (!value) return undefined;

  try {
    const finalFormat = getApplicableFormat(format, dateType, mode);
    let timestamp: number;

    if (typeof value === 'number') {
      timestamp = value;
    } else {
      // 尝试将字符串转换为数字
      timestamp = Number(value);
      if (Number.isNaN(timestamp)) {
        console.warn(processUiMessage('invalidTimestamp', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { value }));
        return undefined;
      }
    }

    return dayjs(timestamp).format(finalFormat);
  } catch (error) {
    console.error(processUiMessage('dateConvertFailed', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
    return undefined;
  }
};
