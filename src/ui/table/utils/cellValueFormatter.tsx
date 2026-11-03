/**
 * 表格单元格值格式化工具
 * 提取自CellValue组件的renderValueByType逻辑，用于插件和其他场景的数据格式化
 */

import type { DataType, TableColumn, TableColumnType } from '../types/base';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { parseTimeStampToFormatDate } from './date-util';

/**
 * 格式化数组类型的值
 * @param value 数组值
 * @param format 格式化字符串，默认使用逗号分隔
 */
const formatArrayValue = (value: any[], format?: string): string => {
  if (!Array.isArray(value)) return typeof value === 'string' ? String(value || '') : JSON.stringify(value);

  // 默认使用逗号分隔
  const separator = format || ', ';

  // 处理对象数组，对对象类型的元素进行JSON序列化
  return value
    .map((item) => {
      if (item === null || item === undefined) {
        return '';
      }
      // 如果是对象类型，使用JSON序列化
      if (typeof item === 'object') {
        try {
          return JSON.stringify(item);
        } catch (e) {
          return String(item);
        }
      }
      // 其他类型直接转字符串
      return String(item);
    })
    .join(separator);
};

/**
 * 格式化数字类型的值
 * @param value 数字值
 * @param format 格式化字符串
 * @param locale 当前语言，用于日志文案
 */
const formatNumberValue = (value: any, format?: string, locale?: string): string => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value || '');

  if (!format) return String(num);

  try {
    // 支持简单的数字格式化
    if (format.includes('.')) {
      const decimals = format.split('.')[1]?.length || 0;
      return num.toFixed(decimals);
    }

    // 支持千分位分隔符
    if (format.includes(',')) {
      return num.toLocaleString();
    }

    // 支持百分比格式
    if (format.includes('%')) {
      return (num * 100).toFixed(2) + '%';
    }

    return String(num);
  } catch (error) {
    console.warn(processUiMessage('numberFormatFailed', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
    return String(num);
  }
};

/**
 * 格式化单元格值为纯文本（用于显示和打印）
 * @param value 单元格值
 * @param column 列配置
 * @param record 行数据
 * @param index 行索引
 * @param locale 当前语言，用于布尔值与日志文案
 * @returns 格式化后的纯文本字符串
 */
export const formatCellValueToText = (value: any, column: TableColumn, record?: Record<string, any>, index?: number, locale?: string): string => {
  // 如果值为null或undefined，返回空字符串（用于打印）
  if (value === null || value === undefined) return '';

  // 获取实际的类型：优先使用 type，如果没有则使用 dataType
  const actualType = column.type || column.dataType;

  // 根据列类型格式化 - 支持所有TableColumnType和DataType
  switch (actualType as TableColumnType | DataType) {
    case 'date':
      // 使用日期工具类处理时间戳
      return (
        parseTimeStampToFormatDate({
          value: value,
          format: column.format,
          dateType: column.dateType || 'date',
          mode: column.dateConfig?.mode || 'day',
          locale,
        }) || ''
      );

    case 'boolean':
      return String(value) === 'true' || value === true
        ? processUiMessage('booleanTrue', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' })
        : processUiMessage('booleanFalse', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' });

    case 'number':
    case 'int':
    case 'float':
    case 'long':
    case 'double':
      // 数字类型支持格式化
      return formatNumberValue(value, column.format, locale);

    case 'tag':
      // 标签类型 - 转换为纯文本
      if (Array.isArray(value)) {
        return value.map((tag) => String(tag)).join(', ');
      }
      return String(value);

    case 'image':
      // 图片类型 - 返回URL或描述文本
      return typeof value === 'string' ? String(value) : JSON.stringify(value);
    case 'link':
      // 链接类型 - 返回URL
      return String(value);

    case 'json':
    case 'object':
      // JSON/对象类型 - 转换为JSON字符串
      try {
        return typeof value === 'string' ? value : JSON.stringify(value);
      } catch (e) {
        return String(value);
      }

    case 'list':
      // 列表类型
      if (Array.isArray(value)) {
        return formatArrayValue(value, column.format);
      }
      return String(value);

    case 'enum':
      // 枚举类型
      return String(value);

    case 'actions':
      // 操作列类型 - 通常不需要导出
      return '';

    case 'custom':
      // 自定义类型
      return String(value);

    case 'string':
      if (Array.isArray(value)) {
        return formatArrayValue(value, column.format);
      }
      return String(value);
    case 'text': {
      if (Array.isArray(value)) {
        return formatArrayValue(value, column.format);
      }
      return String(value);
    }
    default:
      // 默认文本类型
      if (Array.isArray(value)) {
        return formatArrayValue(value, column.format);
      }
      return String(value);
  }
};

/**
 * 格式化单元格值为导出文本（专门用于CSV/Excel等导出）
 * 基于主流产品的导出最佳实践：Excel、Google Sheets、Notion、Airtable等
 * @param value 单元格值
 * @param column 列配置
 * @param record 行数据
 * @param index 行索引
 * @param locale 当前语言，用于自定义内容占位文案
 * @returns 适合导出的纯文本字符串
 */
export const formatCellValueForExport = (value: any, column: TableColumn, record?: Record<string, any>, index?: number, locale?: string): string => {
  // 如果值为null或undefined，返回空字符串（用于导出）
  if (value === null || value === undefined) return '';

  // 获取实际的类型：优先使用 type，如果没有则使用 dataType
  const actualType = column.type || column.dataType;

  // 根据列类型格式化 - 专门针对导出优化，支持所有TableColumnType和DataType
  switch (actualType as TableColumnType | DataType) {
    case 'date': {
      // 日期类型 - 导出为标准格式，便于Excel等工具识别
      const formattedDate = parseTimeStampToFormatDate({
        value: value,
        format: column.format || 'YYYY-MM-DD HH:mm:ss', // 默认使用标准格式
        dateType: column.dateType || 'date',
        mode: column.dateConfig?.mode || 'day',
      });
      return formattedDate || '';
    }

    case 'boolean': {
      // 布尔类型 - 导出为TRUE/FALSE，便于Excel识别
      const boolValue = String(value) === 'true' || value === true;
      return boolValue ? 'TRUE' : 'FALSE';
    }

    case 'number':
    case 'int':
    case 'float':
    case 'long':
    case 'double': {
      // 数字类型 - 保持原始数值，不添加格式化符号
      const num = Number(value);
      if (Number.isNaN(num)) return '';

      // 对于百分比类型，转换为小数形式
      if (column.format?.includes('%')) {
        return String(num); // 保持原始小数值，如0.85而不是85%
      }

      // 其他数字类型保持原值，让Excel自动处理格式
      return String(num);
    }

    case 'tag':
      // 标签类型 - 使用分号分隔，避免与CSV逗号冲突
      if (Array.isArray(value)) {
        return value
          .filter((tag) => tag !== null && tag !== undefined && tag !== '')
          .map((tag) => String(tag).trim())
          .join('; ');
      }
      return String(value).trim();

    case 'image': {
      // 图片类型 - 只导出URL，不导出图片本身
      const imageUrl = String(value).trim();
      return imageUrl.startsWith('http') ? imageUrl : '';
    }

    case 'link': {
      // 链接类型 - 导出完整URL
      const linkUrl = String(value).trim();
      return linkUrl.startsWith('http') ? linkUrl : value ? `https://${linkUrl}` : '';
    }

    case 'json':
    case 'object':
      // JSON/对象类型 - 导出为扁平化的键值对或简化格式
      try {
        if (typeof value === 'string') {
          return value;
        }

        if (typeof value === 'object' && value !== null) {
          // 对于简单对象，转换为键值对格式
          if (Object.keys(value).length <= 3) {
            return Object.entries(value)
              .map(([k, v]) => `${k}: ${typeof v === 'string' ? String(v) : JSON.stringify(v)}`)
              .join('; ');
          }

          // 对于复杂对象，使用紧凑JSON格式
          return JSON.stringify(value);
        }

        return String(value);
      } catch (e) {
        return String(value);
      }

    case 'list':
      // 列表类型 - 使用分号分隔，避免CSV冲突
      if (Array.isArray(value)) {
        const separator = column.format === ',' ? '; ' : column.format || '; ';
        return value
          .filter((item) => item !== null && item !== undefined && item !== '')
          .map((item) => (typeof value === 'string' ? String(value) : JSON.stringify(value)))
          .join(separator);
      }
      return String(value);
    case 'enum':
      // 枚举类型 - 直接导出枚举值
      return String(value).trim();

    case 'actions':
      // 操作列类型 - 不导出操作按钮
      return '';

    case 'custom':
      // 自定义类型 - 尝试提取有意义的文本
      if (typeof value === 'object' && value !== null) {
        // 如果是React元素或复杂对象，尝试提取文本内容
        if (value.props?.children) {
          return String(value.props.children);
        }
        return processUiMessage('customContent', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' });
      }
      return String(value);
    default: {
      // 文本类型 - 清理多余空白字符
      if (Array.isArray(value)) {
        return value
          .filter((item) => item !== null && item !== undefined && item !== '')
          .map((item) => String(item).trim())
          .join('; ');
      }

      const textValue = String(value).trim();

      // 处理多行文本，转换为单行
      if (textValue.includes('\n')) {
        return textValue.replace(/\n+/g, ' | ').trim();
      }

      return textValue;
    }
  }
};

/**
 * 格式化单元格值为HTML（用于打印）
 * @param value 单元格值
 * @param column 列配置
 * @param record 行数据
 * @param index 行索引
 * @param locale 当前语言，用于布尔值与日志文案
 * @returns 格式化后的HTML字符串
 */
export const formatCellValueToHtml = (value: any, column: TableColumn, record?: Record<string, any>, index?: number, locale?: string): string => {
  // 先获取纯文本格式
  const textValue = formatCellValueToText(value, column, record, index, locale);

  // 对HTML特殊字符进行转义
  const escapedValue = textValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // 获取实际的类型
  const actualType = column.type || column.dataType;

  // 根据类型添加特殊的HTML格式
  switch (actualType as TableColumnType | DataType) {
    case 'link':
      // 链接类型 - 保持为可点击链接
      return `<a href="${escapedValue}" target="_blank" rel="noopener noreferrer">${escapedValue}</a>`;

    case 'tag':
      // 标签类型 - 添加简单的样式
      if (Array.isArray(value)) {
        return value.map((tag) => `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; margin-right: 4px;">${String(tag)}</span>`).join('');
      }
      return `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${escapedValue}</span>`;

    case 'json':
    case 'object':
      // JSON类型 - 使用等宽字体
      return `<pre style="font-family: monospace; font-size: 11px; margin: 0; white-space: pre-wrap;">${escapedValue}</pre>`;

    default:
      return escapedValue;
  }
};

/**
 * 批量格式化行数据
 * @param data 数据数组
 * @param columns 列配置数组
 * @param formatter 格式化函数
 * @returns 格式化后的数据数组
 */
export const formatTableData = (
  data: Record<string, any>[],
  columns: TableColumn[],
  formatter: typeof formatCellValueToText | typeof formatCellValueToHtml = formatCellValueToText,
): Record<string, any>[] => {
  return data.map((row, index) => {
    const formattedRow = { ...row };

    columns.forEach((column) => {
      // 使用dataIndex作为数据标识，name只是显示标识
      const key = column.dataIndex;
      if (key && key in row) {
        const rawValue = (row as any)[key];
        (formattedRow as any)[key] = formatter(rawValue, column, row as any, index);
      }
    });

    return formattedRow;
  });
};
