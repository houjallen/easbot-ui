/**
 * 表格日期组件渲染工具
 * 根据 dateType 选择对应的日期组件进行渲染
 */

import cn from '../../../utils/classnames';
import React from 'react';
import { InputDate } from '../../date/input-date';
import { InputDateRange } from '../../date/input-date-range';
import { InputDateTime } from '../../date/input-date-time';
import { InputDateTimeRange } from '../../date/input-date-time-range';
import { InputTime } from '../../date/input-time';
import { InputTimeRange } from '../../date/input-time-range';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import type { DateComponentType } from '../types/base';

/**
 * 日期组件渲染器接口
 */
export interface DateRendererProps {
  /** 当前值 */
  value: any;
  /** 值变化回调 */
  onChange?: (value: any) => void;
  /** 日期组件类型，默认为 'date' */
  dateType?: DateComponentType;
  /** 格式化字符串 */
  format?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 禁用的日期判断函数 */
  disabledDate?: (date: Date) => boolean;
  /** 是否显示快捷选择（仅对 date 类型有效） */
  showShortcuts?: boolean;
  /** 选择模式（仅对 date 类型有效）：day=日选择，month=月选择，year=年选择 */
  mode?: 'day' | 'month' | 'year';
  /** 分隔符（仅对范围类型有效） */
  separator?: string;
  /** 是否为编辑模式，默认为 true */
  editable?: boolean;
  /** 自定义渲染 */
  size?: 'sm' | 'md' | 'lg';
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
}

/**
 * 获取默认的日期格式
 */
const getDefaultDateFormat = (dateType: DateComponentType): string => {
  switch (dateType) {
    case 'date':
      return 'YYYY-MM-DD';
    case 'date-range':
      return 'YYYY-MM-DD';
    case 'datetime':
      return 'YYYY-MM-DD HH:mm:ss';
    case 'datetime-range':
      return 'YYYY-MM-DD HH:mm:ss';
    case 'time':
      return 'HH:mm:ss';
    case 'time-range':
      return 'HH:mm:ss';
    default:
      return 'YYYY-MM-DD';
  }
};

/**
 * 格式化日期值用于显示
 */
export const formatDateValue = (value: any, dateType: DateComponentType = 'date', format?: string, locale?: string): string => {
  if (!value) return '';

  const finalFormat = format || getDefaultDateFormat(dateType);

  try {
    // 处理范围类型的值
    if (dateType.includes('-range')) {
      if (Array.isArray(value) && value.length === 2) {
        const separator = dateType === 'time-range' ? ' ~ ' : ' ~ ';
        return `${value[0]}${separator}${value[1]}`;
      }
      return '';
    }

    // 处理单值类型
    return String(value);
  } catch (error) {
    console.warn(processUiMessage('dateFormatFailed', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
    return String(value);
  }
};

/**
 * 日期组件渲染器
 */
export const renderDateComponent = ({
  value,
  onChange,
  dateType = 'date',
  format,
  placeholder,
  disabled = false,
  readOnly = false,
  disabledDate,
  showShortcuts = false,
  mode = 'day',
  separator = '~',
  editable = true,
  size = 'md',
  popoverContentStyle,
}: DateRendererProps): React.ReactNode => {
  const finalFormat = format || getDefaultDateFormat(dateType);

  // 非编辑模式，只显示格式化后的值
  if (!editable) {
    return <span className="text-sm">{formatDateValue(value, dateType, finalFormat)}</span>;
  }

  // 通用的组件属性
  const commonProps = {
    value,
    onChange,
    format: finalFormat,
    disabled,
    readOnly,
    placeholder,
    disabledDate,
    className: cn('w-full', `eas-table-search-field-${size}`),
    popoverContentStyle,
  };

  // 根据日期类型渲染对应的组件
  switch (dateType) {
    case 'date':
      return <InputDate {...commonProps} showShortcuts={showShortcuts} mode={mode} />;

    case 'date-range':
      return <InputDateRange {...commonProps} separator={separator} mode={mode} />;

    case 'datetime':
      return <InputDateTime {...commonProps} showShortcuts={showShortcuts} />;

    case 'datetime-range':
      return <InputDateTimeRange {...commonProps} separator={separator} />;

    case 'time':
      return <InputTime {...commonProps} />;

    case 'time-range':
      return <InputTimeRange {...commonProps} separator={separator} />;

    default:
      // 默认使用单日期选择
      return <InputDate {...commonProps} showShortcuts={showShortcuts} mode={mode} />;
  }
};

/**
 * 获取日期显示值的辅助函数
 */
export const getDateDisplayValue = (value: any, dateType: DateComponentType = 'date', format?: string): string => {
  if (!value) return '';
  return formatDateValue(value, dateType, format);
};
