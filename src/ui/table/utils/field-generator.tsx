/**
 * 表格字段生成工具类
 * 统一处理过滤器、编辑器、搜索字段的渲染逻辑
 * 以及静态字段的渲染（用于查看模式）
 */

import { Checkbox } from '../../checkbox';
import { Combobox } from '../../combobox';
import { ListEditor } from '../../edit/ListEditor';
import { ObjectEditor } from '../../edit/ObjectEditor';
import { InputFile } from '../../file/InputFile';
import { InputImage } from '../../file/InputImage';
import type { FileInfo, FileStatus } from '../../file/types';
import { Input } from '../../input';
import { Textarea } from '../../textarea';
import { Typography } from '../../typography';
import { cn } from '../../../utils/classnames';
import { isEmpty } from '../../../utils/object';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import React from 'react';
import type { DataType, EditorType, SearchFieldConfig, TableColumn, TableColumnType, TableSize, UniversalFieldConfig } from '../types/base';
import { renderDateComponent } from './date-renderer';
import { parseFormatDateToTimeStamp, parseTimeStampToFormatDate } from './date-util';

// 当在弹层中使用时，需要自定义样式以提升 z-index
// 注意：这里不能使用 useMemo，因为这是普通函数而不是React组件
const popoverContentProps = {
  popoverContentStyle: {
    zIndex: 'calc(var(--eas-z-index-dialog, 1400) + 20)',
  } as React.CSSProperties,
};

/**
 * Field Generator 配置接口 - 只包含运行时必要的扩展配置
 * 避免与 UniversalFieldConfig 重复定义
 */
export interface FieldGeneratorConfig {
  // 运行时值和回调
  value: any;
  onChange: (value: any) => void;

  // 使用场景
  context?: 'filter' | 'edit' | 'search' | 'static';

  // 运行时样式和交互
  placeholder?: string | string[];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  wrapperClassName?: string;

  // 运行时配置
  size?: TableSize;
  locale?: string;

  // 特殊模式
  isMultiValue?: boolean;
  isRangeMode?: boolean;
  value2?: any;
  onChange2?: (value: any) => void;

  // 功能扩展
  allowClear?: boolean;
  onClear?: () => void;
  showLabel?: boolean;

  /** 是否为静态模式（用于查看，不可编辑） */
  staticMode?: boolean;

  // 文件上传相关
  baseUrl?: string;
  /** 供文件/图片字段使用的上传配置（与 InputFile 的 UploadConfig 对齐） */
  upload?: {
    action?: string;
    method?: 'POST' | 'PUT';
    name?: string;
    data?: Record<string, any> | ((file: File) => Record<string, any>);
    headers?: Record<string, string> | ((file: File) => Record<string, string>);
    withCredentials?: boolean;
    timeout?: number;
  };
  /** 统一 httpClient 适配器，需实现 uploadFile(requestConfig, uploadParams) */
  httpClient?: {
    uploadFile: (
      requestConfig: { url?: string; method?: string; headers?: Record<string, any>; onUploadProgress?: (e: any) => void },
      uploadParams: { file: File; name?: string; filename?: string; data?: Record<string, any> },
    ) => Promise<any>;
  };
  /**
   * list 类型的数据处理方式
   * - 'object': list 中存储完整对象 (默认)
   * - 'string': list 中存储字符串路径
   */
  listItemType?: 'object' | 'string';

  //最大tag数，用于cell 和 static显示配置
  maxTags?: number;

  // 国际化函数
  t?: (key: string, params?: Record<string, any>) => string;

  //是否是二进制base64内容，true时，value将被解析为base64字符串
  isBase64?: boolean;
}

/**
 * 字段渲染器类型定义 - 统一使用UniversalFieldConfig
 * 由于TableColumn和SearchFieldConfig都继承了UniversalFieldConfig，可以统一处理
 */
export type FieldRenderer = (fieldConfig: UniversalFieldConfig, config: FieldGeneratorConfig) => React.ReactNode;

/**
 * `useTableI18n` 风格 key → 内置文案表（`tableMessages`）key 的映射
 *
 * @description
 * 字段渲染器对外暴露的 key 命名沿用 `useTableI18n`（如 `filter.placeholders.text`），
 * 而内置文案表使用 `fieldPlaceholders.*` 结构，此处做一次键名归一。
 */
const FIELD_MESSAGE_KEY_ALIAS: Record<string, string> = {
  'filter.placeholders.text': 'fieldPlaceholders.filter.text',
  'filter.placeholders.number': 'fieldPlaceholders.filter.number',
  'filter.placeholders.select': 'fieldPlaceholders.filter.select',
  'filter.placeholders.minValue': 'fieldPlaceholders.filter.minValue',
  'filter.placeholders.maxValue': 'fieldPlaceholders.filter.maxValue',
  'filter.options.true': 'fieldPlaceholders.options.true',
  'filter.options.false': 'fieldPlaceholders.options.false',
  'fieldEdit.placeholders.text': 'fieldPlaceholders.edit.text',
  'fieldEdit.placeholders.number': 'fieldPlaceholders.edit.number',
  'fieldEdit.placeholders.select': 'fieldPlaceholders.edit.select',
  'search.placeholders.text': 'fieldPlaceholders.filter.text',
  'search.placeholders.number': 'fieldPlaceholders.filter.number',
  'search.placeholders.select': 'fieldPlaceholders.filter.select',
};

/**
 * 默认国际化函数
 *
 * @description
 * 未显式传入 `t` 时的兜底实现，内部走组件库内置 i18n 引擎
 * （`src/utils/component-messages.ts` 的 `tableMessages`）。
 * 支持 `filter.placeholders.text` 这类点号路径。
 *
 * @param locale 当前语言
 * @returns 文案读取函数
 */
const createDefaultT = (locale?: string) => {
  return (key: string, params?: Record<string, any>) => {
    const resolvedKey = FIELD_MESSAGE_KEY_ALIAS[key] ?? key;
    return processUiMessage(resolvedKey, { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, params);
  };
};

export function getFieldDisplayTitle(fieldConfig: UniversalFieldConfig, config: FieldGeneratorConfig): string {
  const { context = 'edit' } = config;

  // 优先检查是否有label字段（SearchFieldConfig）
  if ((fieldConfig as any).label) {
    return (fieldConfig as SearchFieldConfig).label;
  }

  // 然后检查是否有title字段（TableColumn）
  if ((fieldConfig as any).title) {
    return (fieldConfig as TableColumn).title;
  }

  // 都没有则返回空字符串
  return '';
}

export function getFieldPlaceholder(fieldConfig: UniversalFieldConfig, config: FieldGeneratorConfig) {
  const { context = 'edit' } = config;

  return (
    (Array.isArray(fieldConfig?.editConfig?.placeholder) ? fieldConfig?.editConfig?.placeholder?.[0] : fieldConfig?.editConfig?.placeholder) ||
    (Array.isArray(fieldConfig?.placeholder) ? fieldConfig?.placeholder?.[0] : fieldConfig?.placeholder) ||
    (Array.isArray(config.placeholder) ? config.placeholder[0] : config.placeholder)
  );
}
/**
 * 生成自定义编辑器（基于 fieldConfig.editor ReactNode）
 */
export const renderCustomEditor: FieldRenderer = (fieldConfig, config) => {
  if (!fieldConfig.editRender) {
    return null;
  }

  const editorElement = fieldConfig.editRender(config.value, config.onChange, fieldConfig) as React.ReactElement;
  return React.cloneElement(editorElement, {
    disabled: config.disabled,
    readOnly: config.readOnly,
    className: cn('w-full', config.className),
    ...config,
  } as any);
};

/**
 * 生成文本输入框
 */
export const renderTextInput: FieldRenderer = (fieldConfig, config) => {
  const { t = createDefaultT(config.locale), context = 'edit' } = config;

  // 处理不同场景的值格式
  const handleChange = (newValue: string) => {
    // filter和search场景始终返回数组格式
    if (context === 'filter' || context === 'search') {
      if (newValue.trim() === '') {
        config.onChange([]); // 空值返回空数组
      } else {
        config.onChange([newValue]); // 返回数组格式
      }
    } else {
      // edit场景：根据是否为多值类型决定返回格式
      if (config.isRangeMode || config.isMultiValue) {
        // 多值类型：返回数组格式
        if (newValue.trim() === '') {
          config.onChange([]); // 空值返回空数组
        } else {
          config.onChange([newValue]); // 返回数组格式
        }
      } else {
        // 单值类型：返回单值
        config.onChange(newValue);
      }
    }
  };

  // 处理显示值 - 文本输入
  const displayValue = (() => {
    if (context === 'filter' || context === 'search') {
      // filter/search场景，值始终可能是数组
      if (Array.isArray(config.value)) {
        return config.value[0] || '';
      }
      return config.value || '';
    } else {
      // edit场景：根据是否为多值类型处理显示值
      if (config.isRangeMode || config.isMultiValue) {
        // 多值类型：从数组中取第一个值显示
        if (Array.isArray(config.value)) {
          return config.value[0] || '';
        }
        return config.value || '';
      } else {
        // 单值类型：直接使用值
        return config.value || '';
      }
    }
  })();

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={getFieldPlaceholder(fieldConfig, config) || t(`${context === 'edit' ? 'fieldEdit' : context}.placeholders.text`)}
      disabled={config.disabled}
      readOnly={config.readOnly}
      className={cn('w-full', config.className)}
      wrapperClassName={cn('w-full min-w-0', config.wrapperClassName)}
    />
  );
};

// 更新文本域渲染器
export const renderTextarea: FieldRenderer = (fieldConfig, config) => {
  const { t = createDefaultT(config.locale), context = 'edit' } = config;

  return (
    <Textarea
      value={config.value || ''}
      onChange={(e) => config.onChange(e.target.value)}
      placeholder={
        config.placeholder || fieldConfig?.editConfig?.placeholder || Array.isArray(fieldConfig?.placeholder)
          ? fieldConfig?.placeholder?.[0]
          : fieldConfig?.placeholder || t(`${context === 'edit' ? 'fieldEdit' : context}.placeholders.text`)
      }
      disabled={config.disabled}
      readOnly={config.readOnly}
      className={cn('w-full resize-none', config.className)}
      rows={3}
      style={{
        maxHeight: '80px',
      }}
      maxLength={fieldConfig?.editConfig?.rules?.maxLength}
      minLength={fieldConfig?.editConfig?.rules?.minLength}
      {...fieldConfig?.editConfig?.props}
    />
  );
};

// 更新数字输入渲染器
export const renderNumberInput: FieldRenderer = (fieldConfig, config) => {
  const { t = createDefaultT(config.locale), context = 'edit' } = config;

  // 范围模式：两个输入框
  if (config.isRangeMode) {
    return (
      <div className={cn('flex w-full min-w-0 items-center gap-2', config.wrapperClassName)}>
        <Input
          type="number"
          value={Array.isArray(config.value) ? config.value[0] || '' : ''}
          onChange={(e) => {
            const newValue = e.target.value === '' ? null : Number(e.target.value);
            const currentValue = Array.isArray(config.value) ? config.value : [null, null];
            config.onChange([newValue, currentValue[1]]);
          }}
          placeholder={
            (Array.isArray(fieldConfig?.placeholder) ? fieldConfig?.placeholder[0] : null) ||
            (Array.isArray(config.placeholder) ? config.placeholder[0] : null) ||
            t(`${context === 'edit' ? 'fieldEdit' : context}.placeholders.minValue`)
          }
          disabled={config.disabled}
          readOnly={config.readOnly}
          className="flex-1"
          wrapperClassName="flex-1 min-w-0"
          min={fieldConfig?.editConfig?.rules?.min}
          max={fieldConfig?.editConfig?.rules?.max}
          step={fieldConfig?.editConfig?.step}
          {...fieldConfig?.editConfig?.props}
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          value={Array.isArray(config.value) ? config.value[1] || '' : ''}
          onChange={(e) => {
            const newValue = e.target.value === '' ? null : Number(e.target.value);
            const currentValue = Array.isArray(config.value) ? config.value : [null, null];
            config.onChange([currentValue[0], newValue]);
          }}
          placeholder={
            (Array.isArray(fieldConfig?.placeholder) ? fieldConfig?.placeholder[1] : null) ||
            (Array.isArray(config.placeholder) ? config.placeholder[1] : null) ||
            t(`${context === 'edit' ? 'fieldEdit' : context}.placeholders.maxValue`)
          }
          disabled={config.disabled}
          readOnly={config.readOnly}
          className="flex-1"
          wrapperClassName="flex-1 min-w-0"
          min={fieldConfig?.editConfig?.rules?.min}
          max={fieldConfig?.editConfig?.rules?.max}
          step={fieldConfig?.editConfig?.step}
          {...fieldConfig?.editConfig?.props}
        />
      </div>
    );
  }

  // 单值模式
  // 处理不同场景的值格式
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? null : Number(e.target.value);

    // filter和search场景始终返回数组格式
    if (context === 'filter' || context === 'search') {
      if (newValue === null) {
        config.onChange([]); // 空值返回空数组
      } else {
        config.onChange([newValue]); // 返回数组格式
      }
    } else {
      // edit场景：根据是否为多值类型决定返回格式
      if (config.isRangeMode || config.isMultiValue) {
        // 多值类型：返回数组格式
        if (newValue === null) {
          config.onChange([]); // 空值返回空数组
        } else {
          config.onChange([newValue]); // 返回数组格式
        }
      } else {
        // 单值类型：返回单值
        config.onChange(newValue);
      }
    }
  };

  // 处理显示值 - 数字输入
  const displayValue = (() => {
    if (context === 'filter' || context === 'search') {
      // filter/search场景，值始终可能是数组
      if (Array.isArray(config.value)) {
        return config.value[0] || '';
      }
      return config.value || '';
    } else {
      // edit场景：根据是否为多值类型处理显示值
      if (config.isRangeMode || config.isMultiValue) {
        // 多值类型：从数组中取第一个值显示
        if (Array.isArray(config.value)) {
          return config.value[0] || '';
        }
        return config.value || '';
      } else {
        // 单值类型：直接使用值
        return config.value || '';
      }
    }
  })();

  return (
    <Input
      type="number"
      value={displayValue}
      onChange={handleChange}
      placeholder={getFieldPlaceholder(fieldConfig, config) || t(`${context === 'edit' ? 'fieldEdit' : context}.placeholders.number`)}
      disabled={config.disabled}
      readOnly={config.readOnly}
      className={cn('w-full', config.className)}
      wrapperClassName={cn('w-full min-w-0', config.wrapperClassName)}
      min={fieldConfig?.editConfig?.rules?.min}
      max={fieldConfig?.editConfig?.rules?.max}
      step={fieldConfig?.editConfig?.step}
      {...fieldConfig?.editConfig?.props}
    />
  );
};

/**
 * 生成布尔值选择器
 */
export const renderBooleanInput: FieldRenderer = (fieldConfig, config) => {
  const { t = createDefaultT(config.locale), context = 'edit' } = config;

  // 获取 trueValue 和 falseValue 配置，默认使用业务系统一致的 1,0 数值
  const trueValue = fieldConfig?.editConfig?.trueValue !== undefined ? fieldConfig?.editConfig?.trueValue : 1;
  const falseValue = fieldConfig?.editConfig?.falseValue !== undefined ? fieldConfig?.editConfig?.falseValue : 0;

  // 添加容错处理函数，处理数值、字符串和布尔值
  const parseBooleanValue = (value: any): boolean => {
    // 如果配置了 trueValue 和 falseValue，优先使用配置的值进行比较
    if (fieldConfig?.editConfig?.trueValue !== undefined || fieldConfig?.editConfig?.falseValue !== undefined) {
      return value === trueValue;
    }

    // 如果是布尔值，直接返回
    if (typeof value === 'boolean') {
      return value;
    }

    // 如果是数值，非0为true，0为false
    if (typeof value === 'number') {
      return value !== 0;
    }

    // 如果是字符串，处理常见的布尔值表示
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      // 'true', '1', 'yes', 'on' 等表示 true
      if (['true', '1', 'yes', 'on'].includes(lowerValue)) {
        return true;
      }
      // 'false', '0', 'no', 'off', '' 等表示 false
      if (['false', '0', 'no', 'off', ''].includes(lowerValue)) {
        return false;
      }
      // 其他情况默认为 false
      return false;
    }

    // 其他类型（null, undefined, object等）默认为 false
    return Boolean(value);
  };

  // 将布尔值转换为存储值的函数
  const convertToStoredValue = (boolValue: boolean): any => {
    // 如果配置了 trueValue 和 falseValue，使用配置的值
    return boolValue ? trueValue : falseValue;
  };

  // 编辑模式使用 Checkbox（更直观的交互）
  if (context === 'edit') {
    return (
      <div className={cn('flex min-w-[20px] items-center gap-2', config.wrapperClassName)}>
        <Checkbox
          checked={parseBooleanValue(config.value)}
          onCheckedChange={(checked) => {
            // checked 可能是 true, false, 或 'indeterminate'
            const boolValue = checked === 'indeterminate' ? false : checked;
            // 根据trueValue和falseValue的定义返回对应值
            const storedValue = convertToStoredValue(boolValue);

            // edit场景：根据是否为多值类型决定返回格式
            if (config.isRangeMode || config.isMultiValue) {
              // 多值类型：返回数组格式
              config.onChange([storedValue]);
            } else {
              // 单值类型：返回单值
              config.onChange(storedValue);
            }
          }}
          disabled={config.disabled}
          className={cn('min-w-[16px] max-w-[16px]', config.className)}
        />
        {getFieldDisplayTitle(fieldConfig, config) && (
          <span className="truncate font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{getFieldDisplayTitle(fieldConfig, config)}</span>
        )}
      </div>
    );
  }

  // Filter和Search模式使用 Combobox（符合主流产品设计）
  // 处理显示值：将存储值转换为选项值
  const getDisplayValue = () => {
    if (Array.isArray(config.value) && config.value.length > 0) {
      const currentValue = config.value[0];
      // 根据当前值匹配对应的选项值，固定使用 'true' / 'false'
      if (currentValue === trueValue) {
        return ['true'];
      } else if (currentValue === falseValue) {
        return ['false'];
      }
    }
    return []; // 空值或未匹配时返回空数组
  };

  return (
    <Combobox
      value={getDisplayValue()}
      onChange={(val) => {
        if (Array.isArray(val) && val.length > 0) {
          const selectedValue = val[0];
          // 将 'true' / 'false' 转换为存储值 trueValue/falseValue
          const convertedValue = selectedValue === 'true' ? trueValue : falseValue;
          config.onChange([convertedValue]); // filter/search场景返回数组格式
        } else if (isEmpty(val)) {
          config.onChange([]); // 清空时返回空数组
        } else {
          const convertedValue = val === 'true' ? trueValue : falseValue;
          config.onChange([convertedValue]); // filter/search场景返回数组格式
        }
      }}
      options={[
        { label: t('filter.options.true'), value: 'true' },
        { label: t('filter.options.false'), value: 'false' },
      ]}
      placeholder={getFieldPlaceholder(fieldConfig, config) || t(`${context}.placeholders.select`)}
      className={cn('w-full', config.className)}
      triggerClassName={cn('w-full min-w-0', config.wrapperClassName)}
      multiple={false}
      searchable={false}
      // 使用新的属性设置 z-index
      {...popoverContentProps}
    />
  );
};

/**
 * 生成日期选择器
 */
export const renderDateInput: FieldRenderer = (fieldConfig, config) => {
  const { context = 'edit' } = config;
  const dateType = fieldConfig.dateType || 'date';
  const isRangeType = dateType.includes('-range') || config.isRangeMode;

  const dateComponent = renderDateComponent({
    // 日期组件值转换：范围类型直接传数组，单值类型传第一个元素
    // 将时间戳转换为格式化日期字符串传给组件
    value: isRangeType
      ? Array.isArray(config.value)
        ? [
            parseTimeStampToFormatDate({
              value: config.value[0],
              format: fieldConfig.format,
              dateType: dateType,
              mode: fieldConfig.dateConfig?.mode,
            }),
            parseTimeStampToFormatDate({
              value: config.value[1],
              format: fieldConfig.format,
              dateType: dateType,
              mode: fieldConfig.dateConfig?.mode,
            }),
          ]
        : []
      : Array.isArray(config.value)
        ? config.value.length > 0
          ? parseTimeStampToFormatDate({
              value: config.value[0],
              format: fieldConfig.format,
              dateType: dateType,
              mode: fieldConfig.dateConfig?.mode,
            })
          : ''
        : parseTimeStampToFormatDate({
            value: config.value,
            format: fieldConfig.format,
            dateType: dateType,
            mode: fieldConfig.dateConfig?.mode,
          }) || '',
    // onChange回调：确保值是正确格式，并转换为时间戳存储
    onChange: (val: any) => {
      if (isRangeType) {
        // 范围类型：直接传递数组，转换为时间戳
        const newValue = Array.isArray(val)
          ? [
              parseFormatDateToTimeStamp({
                value: val[0],
                format: fieldConfig.format,
                dateType: dateType,
                mode: fieldConfig.dateConfig?.mode,
              }),
              parseFormatDateToTimeStamp({
                value: val[1],
                format: fieldConfig.format,
                dateType: dateType,
                mode: fieldConfig.dateConfig?.mode,
              }),
            ]
          : [];

        // 根据上下文决定返回格式
        if (context === 'filter' || context === 'search') {
          // filter和search场景返回数组格式
          config.onChange(newValue);
        } else {
          // edit场景：根据是否为多值类型决定返回格式
          if (config.isRangeMode || config.isMultiValue) {
            // 多值类型：返回数组格式
            config.onChange(newValue.length > 0 ? newValue : []);
          } else {
            // 单值类型：返回单值（这种情况下range类型不应该出现）
            config.onChange(newValue.length > 0 ? newValue[0] : null);
          }
        }
      } else {
        // 单值类型：转换为时间戳
        const timestamp = val
          ? parseFormatDateToTimeStamp({
              value: val,
              format: fieldConfig.format,
              dateType: dateType,
              mode: fieldConfig.dateConfig?.mode,
            })
          : null;

        // 根据上下文决定返回格式
        if (context === 'filter' || context === 'search') {
          // filter和search场景返回数组格式
          config.onChange(timestamp ? [timestamp] : []);
        } else {
          // edit场景：根据是否为多值类型决定返回格式
          if (config.isRangeMode || config.isMultiValue) {
            // 多值类型：返回数组格式
            config.onChange(timestamp ? [timestamp] : []);
          } else {
            // 单值类型：返回单值
            config.onChange(timestamp);
          }
        }
      }
    },
    dateType,
    format: fieldConfig.format,
    disabled: config.disabled || fieldConfig.dateConfig?.disabled,
    readOnly: config.readOnly || fieldConfig.dateConfig?.readOnly,
    disabledDate: fieldConfig.dateConfig?.disabledDate,
    showShortcuts: fieldConfig.dateConfig?.showShortcuts,
    mode: fieldConfig.dateConfig?.mode,
    separator: fieldConfig.dateConfig?.separator,
    placeholder: getFieldPlaceholder(fieldConfig, config),
    editable: true,
    size: config.size,
    // 使用新的属性设置 z-index
    ...popoverContentProps,
  });

  return <div className={cn('w-full min-w-0', config.wrapperClassName)}>{dateComponent}</div>;
};

// 更新枚举输入渲染器
export const renderEnumInput: FieldRenderer = (fieldConfig, config) => {
  const { t = createDefaultT(config.locale), context = 'edit' } = config;

  // 统一使用 options
  const options = fieldConfig.options || [];
  const multiple = fieldConfig?.editConfig?.multiple || false;

  // 处理不同场景的值格式
  const handleChange = (newValue: any) => {
    // filter和search场景始终返回数组格式
    if (context === 'filter' || context === 'search') {
      if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
        config.onChange([]); // 空值返回空数组
      } else {
        // 确保返回数组格式
        const arrayValue = Array.isArray(newValue) ? newValue : [newValue];
        config.onChange(arrayValue);
      }
    } else {
      // edit场景：根据是否为多值类型决定返回格式
      if (config.isRangeMode || config.isMultiValue || multiple) {
        // 多值类型：返回数组格式
        if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
          config.onChange([]); // 空值返回空数组
        } else {
          const arrayValue = Array.isArray(newValue) ? newValue : [newValue];
          config.onChange(arrayValue);
        }
      } else {
        // 单值类型：返回单值
        config.onChange(newValue);
      }
    }
  };

  // 处理显示值
  const displayValue = (() => {
    if (context === 'filter' || context === 'search') {
      // filter/search场景，值始终可能是数组
      if (Array.isArray(config.value)) {
        return multiple ? config.value : config.value.slice(0, 1); // 单选时只取第一个
      }
      return config.value ? [config.value] : [];
    } else {
      // edit场景：根据是否为多值类型处理显示值
      if (config.isRangeMode || config.isMultiValue || multiple) {
        // 多值类型：确保是数组格式
        return Array.isArray(config.value) ? config.value : config.value ? [config.value] : [];
      } else {
        // 单值类型：直接使用值
        return config.value;
      }
    }
  })();

  // 直接使用 Combobox 以确保 z-index 设置生效
  return (
    <div className={cn('w-full min-w-0', config.wrapperClassName)}>
      <Combobox
        value={displayValue}
        onChange={handleChange}
        options={options}
        multiple={multiple}
        placeholder={getFieldPlaceholder(fieldConfig, config) || t(`${context === 'edit' ? 'fieldEdit' : context}.placeholders.select`)}
        disabled={config.disabled}
        searchable={fieldConfig?.editConfig?.searchable !== false}
        className={cn('w-full', config.className)}
        triggerClassName="w-full"
        // 使用新的属性设置 z-index
        {...popoverContentProps}
      />
    </div>
  );
};

// 更新列表输入渲染器
export const renderListInput: FieldRenderer = (fieldConfig, config) => {
  const { t = createDefaultT(config.locale), context = 'edit', locale = 'zh-CN' } = config;

  const itemType = fieldConfig?.editConfig?.itemType || 'string';

  // 处理不同场景的值格式
  const handleChange = (newValue: any[]) => {
    // filter和search场景始终返回数组格式
    if (context === 'filter' || context === 'search') {
      config.onChange(newValue.length > 0 ? newValue : []);
    } else {
      // edit场景：列表类型本身就是数组，直接返回
      config.onChange(newValue);
    }
  };

  // 处理显示值
  const displayValue = Array.isArray(config.value) ? config.value : [];

  return (
    <ListEditor
      value={displayValue}
      onChange={handleChange}
      itemType={itemType}
      placeholder={getFieldPlaceholder(fieldConfig, config) || t(`${context === 'edit' ? 'fieldEdit' : context}.placeholders.text`)}
      disabled={config.disabled}
      readOnly={config.readOnly}
      className={cn('w-full', config.className)}
      maxItems={fieldConfig?.editConfig?.rules?.maxItems}
      minItems={fieldConfig?.editConfig?.rules?.minItems}
      sortable={fieldConfig?.editConfig?.sortable}
      addButtonText={fieldConfig?.editConfig?.addButtonText}
      locale={locale}
      {...popoverContentProps}
    />
  );
};

// 更新对象输入渲染器
export const renderObjectInput: FieldRenderer = (fieldConfig, config) => {
  const { t = createDefaultT(config.locale), context = 'edit', locale = 'zh-CN' } = config;

  // 处理不同场景的值格式
  const handleChange = (newValue: any) => {
    // filter和search场景始终返回数组格式
    if (context === 'filter' || context === 'search') {
      if (!newValue || (typeof newValue === 'object' && Object.keys(newValue).length === 0)) {
        config.onChange([]); // 空对象返回空数组
      } else {
        config.onChange([newValue]); // 返回数组格式
      }
    } else {
      // edit场景：根据是否为多值类型决定返回格式
      if (config.isRangeMode || config.isMultiValue) {
        // 多值类型：返回数组格式
        if (!newValue || (typeof newValue === 'object' && Object.keys(newValue).length === 0)) {
          config.onChange([]); // 空对象返回空数组
        } else {
          config.onChange([newValue]); // 返回数组格式
        }
      } else {
        // 单值类型：返回对象
        config.onChange(newValue);
      }
    }
  };

  // 处理显示值
  const displayValue = (() => {
    if (context === 'filter' || context === 'search') {
      // filter/search场景，值可能是数组
      if (Array.isArray(config.value) && config.value.length > 0) {
        const firstValue = config.value[0];
        return firstValue && typeof firstValue === 'object' ? firstValue : {};
      }
      return config.value && typeof config.value === 'object' ? config.value : {};
    } else {
      // edit场景：根据是否为多值类型处理显示值
      if (config.isRangeMode || config.isMultiValue) {
        // 多值类型：从数组中取第一个对象显示
        if (Array.isArray(config.value) && config.value.length > 0) {
          const firstValue = config.value[0];
          return firstValue && typeof firstValue === 'object' ? firstValue : {};
        }
        return config.value && typeof config.value === 'object' ? config.value : {};
      } else {
        // 单值类型：直接使用对象
        return config.value && typeof config.value === 'object' ? config.value : {};
      }
    }
  })();

  return (
    <ObjectEditor
      value={displayValue}
      onChange={handleChange}
      keyPlaceholder={fieldConfig?.editConfig?.keyPlaceholder}
      valuePlaceholder={getFieldPlaceholder(fieldConfig, config)}
      disabled={config.disabled}
      readOnly={config.readOnly}
      className={cn('w-full', config.className)}
      maxProperties={fieldConfig?.editConfig?.rules?.maxProperties}
      minProperties={fieldConfig?.editConfig?.rules?.minProperties}
      addButtonText={fieldConfig?.editConfig?.addButtonText}
      predefinedKeys={fieldConfig?.editConfig?.predefinedKeys}
      locale={locale}
      {...popoverContentProps}
    />
  );
};

/**
 * 专门用于编辑器的字段生成函数
 */
export const generateEditField = (column: TableColumn, value: any, onChange: (value: any) => void, options?: Partial<FieldGeneratorConfig>): React.ReactNode => {
  return renderFieldByType(column, {
    value,
    onChange,
    context: 'edit',
    ...options,
  });
};

/**
 * 专门用于过滤器的字段生成函数
 */
export const generateFilterField = (column: TableColumn, value: any, onChange: (value: any) => void, options?: Partial<FieldGeneratorConfig>): React.ReactNode => {
  return renderFieldByType(column, {
    value,
    onChange,
    context: 'filter',
    ...options,
  });
};

/**
 * 专门用于搜索字段的字段生成函数
 */
export const generateSearchField = (fieldConfig: SearchFieldConfig, value: any, onChange: (value: any) => void, options?: Partial<FieldGeneratorConfig>): React.ReactNode => {
  return renderFieldByType(fieldConfig, {
    value,
    onChange,
    context: 'search',
    ...options,
  });
};

/**
 * 将文件路径字符串或对象转换为 FileInfo 对象
 * @param pathOrObject - 文件路径字符串或完整的文件对象
 * @param index - 索引
 * @param baseUrl - 基础URL，用于拼接相对路径
 */
const convertPathToFileInfo = (pathOrObject: string | any, index: number, baseUrl?: string): FileInfo => {
  // 如果是对象，直接使用对象的属性
  if (typeof pathOrObject === 'object' && pathOrObject !== null) {
    const fileObj = pathOrObject;
    return {
      id: fileObj.id || `file-${index}-${Date.now()}`,
      name: fileObj.name || fileObj.fileName || 'unknown',
      size: fileObj.size || 0,
      type: fileObj.type || fileObj.mimeType || '',
      url: fileObj.url || fileObj.path || '',
      thumbUrl: fileObj.thumbUrl || fileObj.thumbnail,
      status: (fileObj.status as FileStatus) || 'success',
      extra: fileObj,
    };
  }

  // 如果是字符串路径
  const path = pathOrObject as string;
  const fileName = path.split('/').pop() || path;

  // 处理URL：如果是相对路径且有baseUrl，则拼接
  let fullUrl = path;
  if (baseUrl && !path.startsWith('http') && !path.startsWith('//')) {
    fullUrl = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  return {
    id: `file-${index}-${Date.now()}`,
    name: fileName,
    size: 0, // 无法获取大小
    type: '', // 无法获取类型
    url: fullUrl,
    status: 'success' as FileStatus,
  };
};

/**
 * 将 FileInfo 数组转换为输出格式
 * @param files - FileInfo 数组
 * @param multiple - 是否多选
 * @param dataType - 数据类型
 * @param listItemType - list 类型的数据处理方式
 */
const convertFileInfoToOutput = (files: FileInfo[], multiple: boolean, dataType?: string, listItemType?: 'object' | 'string'): any => {
  // 判断是否应该返回对象格式
  const shouldReturnObject = () => {
    if (dataType === 'object') {
      return true; // object 类型固定返回对象
    }
    if (dataType === 'list') {
      return listItemType === 'object'; // list 类型根据 listItemType 配置决定
    }
    return false; // string 或其他类型返回字符串
  };

  if (shouldReturnObject()) {
    // 返回完整的文件对象
    const objects = files.map((file) => {
      // 如果有 extra 属性，优先使用原始对象
      if (file.extra) {
        return {
          ...file.extra,
          // 更新可能被修改的字段
          id: file.id,
          name: file.name,
          url: file.url,
          status: file.status,
        };
      }

      // 否则构造标准对象
      return {
        id: file.id,
        name: file.name,
        fileName: file.name,
        size: file.size,
        type: file.type,
        mimeType: file.type,
        url: file.url,
        path: file.url,
        thumbUrl: file.thumbUrl,
        thumbnail: file.thumbUrl,
        status: file.status,
      };
    });

    return multiple ? objects : objects[0] || null;
  } else {
    // 返回路径字符串
    const paths = files.map((file) => file.url || '').filter(Boolean);
    return multiple ? paths : paths[0] || '';
  }
};

/**
 * 生成文件上传组件
 *
 * 数据格式说明：
 * 1. dataType = 'string' 时：
 *    - 根据 multiple 返回 string 或 string[]
 *
 * 2. dataType = 'object' 时：
 *    - 固定返回完整文件对象 FileObject
 *
 * 3. dataType = 'list' 时：
 *    - 根据 config.listItemType 决定：
 *      - listItemType = 'object': 返回 FileObject[]
 *      - listItemType = 'string': 返回 string[]
 *      - 默认为 'object'
 *
 * 4. baseUrl 处理：
 *    - 如果提供了 config.baseUrl，相对路径会自动拼接
 *    - 绝对路径和完整URL不受影响
 */
export const renderFileInput: FieldRenderer = (fieldConfig, config) => {
  const { context = 'edit', baseUrl, listItemType = 'object', locale } = config;

  // 只在编辑模式下支持文件上传
  if (context !== 'edit') {
    return <span className="text-muted-foreground">{processUiMessage('editModeOnly', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' })}</span>;
  }

  // 获取配置
  const multiple = fieldConfig?.editConfig?.multiple ?? false;
  const maxCount = fieldConfig?.editConfig?.maxCount ?? (multiple ? 10 : 1);
  const dataType = fieldConfig?.dataType;

  // 转换输入值：string | string[] | object | object[] -> FileInfo[]
  const convertInputValue = (value: any): FileInfo[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
      // 数组：可能是字符串数组或对象数组
      return value.map((item, index) => convertPathToFileInfo(item, index, baseUrl));
    } else {
      // 单个值：可能是字符串或对象
      return [convertPathToFileInfo(value, 0, baseUrl)];
    }
  };

  // 处理值变化：FileInfo[] -> string | string[] | object | object[]
  const handleChange = (files: FileInfo[]) => {
    const result = convertFileInfoToOutput(files, multiple, dataType, listItemType);
    config.onChange(result);
  };

  // 构造上传配置：支持从 FieldGeneratorConfig.upload 读取，并在提供 baseUrl 且为相对路径时拼接
  const buildUpload = (): any | undefined => {
    const upl = config.upload;
    if (!upl) return undefined;
    const isAbs = (u?: string) => !!u && /^(https?:)?\/\//i.test(u);
    const action = upl.action ? (isAbs(upl.action) || !baseUrl ? upl.action : `${String(baseUrl).replace(/\/$/, '')}/${String(upl.action).replace(/^\//, '')}`) : upl.action;
    return {
      ...upl,
      action,
    } as any;
  };

  return (
    <InputFile
      value={convertInputValue(config.value)}
      onChange={handleChange}
      multiple={multiple}
      disabled={config.disabled}
      className={config.className}
      httpClient={config.httpClient as any}
      upload={buildUpload()}
      validation={{
        maxCount,
        maxSize: 10 * 1024 * 1024, // 10MB
      }}
      fileList={{
        showUploadButton: true, // 默认追加模式
        uploadButtonText: processUiMessage('addFile', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }),
        listType: 'tag',
        showRemove: true,
        showDownload: true,
        showPreview: false,
      }}
      dropzone={{
        enabled: false, // 默认关闭拖拽，使用追加模式
      }}
    />
  );
};

/**
 * 生成图片上传组件
 *
 * 数据格式说明：
 * 1. dataType = 'string' 时：
 *    - 根据 multiple 返回 string 或 string[]
 *
 * 2. dataType = 'object' 时：
 *    - 固定返回完整图片对象 ImageObject
 *
 * 3. dataType = 'list' 时：
 *    - 根据 config.listItemType 决定：
 *      - listItemType = 'object': 返回 ImageObject[]
 *      - listItemType = 'string': 返回 string[]
 *      - 默认为 'object'
 *
 * 4. baseUrl 处理：
 *    - 如果提供了 config.baseUrl，相对路径会自动拼接
 *    - 绝对路径和完整URL不受影响
 */
export const renderImageInput: FieldRenderer = (fieldConfig, config) => {
  const { context = 'edit', baseUrl, listItemType = 'object', locale } = config;

  // 只在编辑模式下支持图片上传
  if (context !== 'edit') {
    return <span className="text-muted-foreground">{processUiMessage('editModeOnly', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' })}</span>;
  }

  // 获取配置
  const multiple = fieldConfig?.editConfig?.multiple ?? false;
  const maxCount = fieldConfig?.editConfig?.maxCount ?? (multiple ? 9 : 1);
  const dataType = fieldConfig?.dataType;

  // 转换输入值：string | string[] | object | object[] -> FileInfo[]
  const convertInputValue = (value: any): FileInfo[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
      // 数组：可能是字符串数组或对象数组
      return value.map((item, index) => convertPathToFileInfo(item, index, baseUrl));
    } else {
      // 单个值：可能是字符串或对象
      return [convertPathToFileInfo(value, 0, baseUrl)];
    }
  };

  // 处理值变化：FileInfo[] -> string | string[] | object | object[]
  const handleChange = (files: FileInfo[]) => {
    const result = convertFileInfoToOutput(files, multiple, dataType, listItemType);
    config.onChange(result);
  };

  // 构造上传配置（图片共用与文件一致的拼接逻辑）
  const buildUpload = (): any | undefined => {
    const upl = config.upload;
    if (!upl) return undefined;
    const isAbs = (u?: string) => !!u && /^(https?:)?\/\//i.test(u);
    const action = upl.action ? (isAbs(upl.action) || !baseUrl ? upl.action : `${String(baseUrl).replace(/\/$/, '')}/${String(upl.action).replace(/^\//, '')}`) : upl.action;
    return {
      ...upl,
      action,
    } as any;
  };

  return (
    <InputImage
      value={convertInputValue(config.value)}
      onChange={handleChange}
      multiple={multiple}
      disabled={config.disabled}
      className={config.className}
      httpClient={config.httpClient as any}
      upload={buildUpload()}
      validation={{
        maxCount,
        maxSize: 5 * 1024 * 1024, // 5MB
        accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      }}
      fileList={{
        showUploadButton: true, // 默认追加模式
        uploadButtonText: processUiMessage('addImage', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }),
        showRemove: true,
        showDownload: true,
        showPreview: false,
        listClassName: '',
      }}
      dropzone={{
        enabled: false, // 默认关闭拖拽，使用追加模式
      }}
    />
  );
};

// 更新主渲染函数
export const renderFieldByType: FieldRenderer = (fieldConfig, config) => {
  // 第一优先级：使用editConfig.type（编辑器类型配置）
  if (fieldConfig?.editConfig?.type) {
    switch (fieldConfig.editConfig.type) {
      case 'input':
        return renderTextInput(fieldConfig, config);
      case 'textarea':
        return renderTextarea(fieldConfig, config);
      case 'number':
        return renderNumberInput(fieldConfig, config);
      case 'select':
      case 'enum':
        return renderEnumInput(fieldConfig, config);
      case 'combobox':
        return renderEnumInput(fieldConfig, config);
      case 'range':
        // Range类型只支持number和date类型
        if (fieldConfig.dataType === 'number' || fieldConfig.dataType === 'int' || fieldConfig.dataType === 'float' || fieldConfig.dataType === 'double' || fieldConfig.dataType === 'long') {
          return renderNumberInput(fieldConfig, {
            ...config,
            isRangeMode: true,
          });
        } else if (fieldConfig.dataType === 'date') {
          // 日期范围由date组件内部处理
          return renderDateInput(fieldConfig, config);
        } else {
          // 其他类型不支持range，降级为单值输入
          console.warn(processUiMessage('rangeTypeNotSupported', { locale: config.locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { type: fieldConfig.dataType }));
          return renderTextInput(fieldConfig, config);
        }
      case 'list':
        return renderListInput(fieldConfig, config);
      case 'object':
        return renderObjectInput(fieldConfig, config);
      case 'checkbox':
        return renderBooleanInput(fieldConfig, config);
      case 'boolean':
        return renderBooleanInput(fieldConfig, config);
      case 'date':
        return renderDateInput(fieldConfig, config);
      case 'text':
        return renderTextInput(fieldConfig, config);
      case 'file':
        return renderFileInput(fieldConfig, config);
      case 'image':
        return renderImageInput(fieldConfig, config);
      default:
    }
  }

  // 第二优先级：使用fieldConfig.type（SearchFieldConfig等的字段类型）
  if ((fieldConfig as any).type) {
    switch ((fieldConfig as any).type) {
      case 'text':
        return renderTextInput(fieldConfig, config);
      case 'number':
        return renderNumberInput(fieldConfig, config);
      case 'select':
        return renderEnumInput(fieldConfig, config);
      case 'combobox':
        return renderEnumInput(fieldConfig, config);
      case 'boolean':
        return renderBooleanInput(fieldConfig, config);
      case 'date':
      case 'date-range':
        return renderDateInput(fieldConfig, config);
      case 'range':
        // Range类型处理
        if (fieldConfig.dataType === 'number' || fieldConfig.dataType === 'int' || fieldConfig.dataType === 'float' || fieldConfig.dataType === 'double' || fieldConfig.dataType === 'long') {
          return renderNumberInput(fieldConfig, {
            ...config,
            isRangeMode: true,
          });
        } else if (fieldConfig.dataType === 'date') {
          return renderDateInput(fieldConfig, config);
        } else {
          console.warn(processUiMessage('rangeTypeNotSupported', { locale: config.locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { type: fieldConfig.dataType }));
          return renderTextInput(fieldConfig, config);
        }
      default:
    }
  }

  // 第三优先级：根据dataType渲染
  switch (fieldConfig.dataType) {
    case 'boolean':
      return renderBooleanInput(fieldConfig, config);
    case 'date':
      return renderDateInput(fieldConfig, config);
    case 'number':
    case 'int':
    case 'float':
    case 'double':
    case 'long':
      return renderNumberInput(fieldConfig, config);
    case 'enum':
      return renderEnumInput(fieldConfig, config);
    case 'list':
      return renderListInput(fieldConfig, config);
    case 'object':
      return renderObjectInput(fieldConfig, config);
    case 'string':
      // 根据字段长度决定使用 Input 还是 Textarea
      if (fieldConfig?.editConfig?.rules?.maxLength && fieldConfig?.editConfig?.rules?.maxLength > 100) {
        return renderTextarea(fieldConfig, config);
      }
      return renderTextInput(fieldConfig, config);
    default:
      return renderTextInput(fieldConfig, config);
  }
};

/**
 * 根据字段类型渲染静态字段内容
 * 用于查看模式下的字段展示
 * 使用新的 displayType 展现类型，简化类型处理逻辑
 * @param column 列配置
 * @param value 字段值
 * @param record 行数据
 * @param options 字段相关其他选择项
 * @returns React节点
 */
export const renderStaticFieldByType = (column: TableColumn, value: any, record?: Record<string, any>, options: Partial<FieldGeneratorConfig> = {}): React.ReactNode => {
  const { t = createDefaultT(options.locale), context = 'static', baseUrl } = options;
  const { editConfig = {} } = column;
  const { trueValue = 1, falseValue = 0 } = editConfig;
  const maxTagsLimit = options?.maxTags;

  // 如果值为null或undefined，返回空内容
  if (isEmpty(value)) {
    return (
      <Typography.Static isEmpty={true} emptyText="-">
        -
      </Typography.Static>
    );
  }

  // 获取展现类型
  const displayType = getStaticDisplayType(column, value);

  // 根据展现类型渲染内容
  switch (displayType) {
    case 'image': {
      // 处理图片类型，支持 string | object | string[] | object[]
      const renderImage = (imgValue: any, index: number) => {
        if (!imgValue) return null;

        const imageUrl = typeof imgValue === 'string' ? imgValue : typeof imgValue === 'object' && (imgValue.url || imgValue.src || imgValue.path) ? imgValue.url || imgValue.src || imgValue.path : '';

        if (!imageUrl) return null;

        const imageName =
          typeof imgValue === 'object'
            ? imgValue.name || column.title || column.dataIndex || processUiMessage('defaultImageName', { locale: options.locale, messages: tableMessages, fallbackLocale: 'zh-CN' })
            : column.title || column.dataIndex || processUiMessage('defaultImageName', { locale: options.locale, messages: tableMessages, fallbackLocale: 'zh-CN' });

        return (
          <div key={index} className="mb-2">
            <Typography.Static displayType="image" imageUrl={imageUrl} imageName={imageName} baseUrl={baseUrl} />
          </div>
        );
      };

      if (Array.isArray(value)) {
        const images = value.map(renderImage).filter(Boolean);
        return images.length > 0 ? (
          <div className="flex flex-col gap-2">{images}</div>
        ) : (
          <Typography.Static isEmpty={true} emptyText="-">
            -
          </Typography.Static>
        );
      }

      const singleImage = renderImage(value, 0);
      return (
        singleImage || (
          <Typography.Static isEmpty={true} emptyText="-">
            -
          </Typography.Static>
        )
      );
    }

    case 'link': {
      // 处理文件类型，支持 string | object | string[] | object[]
      const renderFile = (fileValue: any, index: number) => {
        if (!fileValue) return null;

        const fileUrl = typeof fileValue === 'string' ? fileValue : typeof fileValue === 'object' && (fileValue.url || fileValue.path) ? fileValue.url || fileValue.path : '';

        if (!fileUrl) return null;

        const fileName =
          typeof fileValue === 'object'
            ? fileValue.name || fileValue.filename || processUiMessage('defaultFileName', { locale: options.locale, messages: tableMessages, fallbackLocale: 'zh-CN' })
            : fileUrl.split('/').pop() || processUiMessage('defaultFileName', { locale: options.locale, messages: tableMessages, fallbackLocale: 'zh-CN' });

        return (
          <div key={index} className="mb-1">
            <Typography.Static displayType="link" baseUrl={baseUrl} className="block">
              {fileName}
            </Typography.Static>
          </div>
        );
      };

      if (Array.isArray(value)) {
        const files = value.map(renderFile).filter(Boolean);
        return files.length > 0 ? (
          <div className="flex flex-col">{files}</div>
        ) : (
          <Typography.Static isEmpty={true} emptyText="-">
            -
          </Typography.Static>
        );
      }

      const singleFile = renderFile(value, 0);
      return (
        singleFile || (
          <Typography.Static isEmpty={true} emptyText="-">
            -
          </Typography.Static>
        )
      );
    }

    case 'list': {
      // 处理列表类型
      const listValue = Array.isArray(value) ? value : [];
      return (
        <Typography.Static displayType="list" fixedHeight={listValue.length > 3 ? 120 : undefined} scrollable={true}>
          {listValue}
        </Typography.Static>
      );
    }

    case 'json': {
      // 处理对象类型
      const objectValue = typeof value === 'object' && value !== null ? value : {};
      return (
        <Typography.Static displayType="json" fixedHeight={Object.keys(objectValue).length > 2 ? 120 : undefined} scrollable={true}>
          {objectValue}
        </Typography.Static>
      );
    }

    case 'tag':
      // 处理标签类型（枚举选择、布尔值等）
      if (editConfig?.type === 'boolean' || editConfig?.type === 'checkbox' || column.dataType === 'boolean') {
        // 布尔值处理
        const boolValue = typeof value === 'boolean' ? value : value === trueValue || value === 'true' || value === 1;
        return (
          <Typography.Static
            displayType="tag"
            options={[
              { label: t('booleanTrue'), value: String(trueValue) },
              { label: t('booleanFalse'), value: String(falseValue) },
            ]}
            maxTags={maxTagsLimit}
          >
            {boolValue ? String(trueValue) : String(falseValue)}
          </Typography.Static>
        );
      } else {
        // 枚举类型处理
        const enumOptions = column.options || [];
        const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
        return (
          <Typography.Static displayType="tag" options={enumOptions} maxTags={maxTagsLimit}>
            {displayValue}
          </Typography.Static>
        );
      }

    case 'textarea':
      // 处理多行文本
      return (
        <Typography.Static
          displayType="textarea"
          fixedHeight={78} // 与编辑模式保持一致
          scrollable={true}
        >
          {formatStaticValueToText(value, column, record, options.locale)}
        </Typography.Static>
      );
    default:
      // 默认文本类型 - 使用 formatStaticValueToText 进行数据转换
      return <Typography.Static displayType="text">{formatStaticValueToText(value, column, record, options.locale)}</Typography.Static>;
  }
};

/**
 * 处理 column.render 后的值，进行容错处理
 * 当 render 函数返回的值与预期格式不匹配时，直接返回 Typography.Static 组件
 * @param renderedValue render 函数返回的值
 * @param column 列配置
 * @param originalValue 原始值
 * @param record 行数据
 * @param options 配置选项
 * @returns Typography.Static 组件或 null（表示需要继续使用默认处理）
 */
const handleRenderedValue = (renderedValue: any, column: TableColumn, originalValue: any, record?: Record<string, any>, options?: Partial<FieldGeneratorConfig>): React.ReactNode | null => {
  // 如果 render 后的值已经是字符串，进行智能处理
  if (typeof renderedValue === 'string') {
    const actualType = column.editConfig?.type || column.type || column.dataType;

    switch (actualType as TableColumnType | DataType | EditorType) {
      case 'date': {
        // 日期类型：检查是否是时间戳字符串
        // 如果原始值是时间戳（数字或时间戳字符串），但 render 返回的是格式化日期
        const isTimestamp = (val: any) => {
          if (typeof val === 'number') return true;
          if (typeof val === 'string') {
            // 检查是否是纯数字字符串（时间戳）
            return /^\d+$/.test(val) && val.length >= 10;
          }
          return false;
        };

        // 如果原始值是时间戳，但 render 返回的是格式化日期字符串
        if (isTimestamp(originalValue) && !isTimestamp(renderedValue)) {
          // 直接返回 Typography.Static 组件
          return <Typography.Static displayType="text">{renderedValue}</Typography.Static>;
        }
        // 其他情况返回 null，使用默认处理
        return null;
      }

      case 'image':
        // 图片类型：如果 render 返回的是处理后的 URL 字符串
        if (renderedValue && !renderedValue.startsWith('{')) {
          return (
            <Typography.Static
              displayType="image"
              imageUrl={renderedValue}
              imageName={column.title || processUiMessage('defaultImageName', { locale: options?.locale, messages: tableMessages, fallbackLocale: 'zh-CN' })}
              baseUrl={options?.baseUrl}
            />
          );
        }
        return null;

      case 'file':
        // 文件类型：如果 render 返回的是文件名或路径
        if (renderedValue && !renderedValue.startsWith('{')) {
          return (
            <Typography.Static displayType="link" baseUrl={options?.baseUrl}>
              {renderedValue}
            </Typography.Static>
          );
        }
        return null;

      case 'number':
      case 'int':
      case 'float':
      case 'long':
      case 'double':
        // 数字类型：如果 render 返回的是格式化字符串（如 "¥431"）
        return <Typography.Static displayType="text">{renderedValue}</Typography.Static>;

      default:
        // 其他类型：直接返回 Typography.Static 组件
        return <Typography.Static displayType="text">{renderedValue}</Typography.Static>;
    }
  }

  // 如果类型匹配或不需要特殊处理，返回 null 使用默认处理
  return null;
};

/**
 * 生成静态字段
 * 用于查看模式下的字段展示
 * 与编辑模式保持完全一致的字段渲染逻辑
 * @param column 列配置
 * @param value 字段值
 * @param record 行数据
 * @param options 字段相关其他选择项
 * @returns React节点
 */
export const generateStaticField = (column: TableColumn, value: any, record?: Record<string, any>, options?: Partial<FieldGeneratorConfig>): React.ReactNode => {
  // 如果列有自定义渲染函数，优先使用
  if (column.render) {
    try {
      const customRender = column.render(value, record || {}, 0);
      // 确保自定义渲染也使用统一的 Typography.Static 样式
      if (React.isValidElement(customRender)) {
        // 克隆元素并移除可能存在的无效属性
        // @ts-expect-error
        const { 'data-slot': _, ...cleanProps } = customRender.props || {};
        return React.cloneElement(customRender, cleanProps);
      }

      // 容错处理：检查 render 后的值是否需要特殊处理
      const processedValue = handleRenderedValue(customRender, column, value, record, options);
      if (processedValue !== null) {
        // 如果 handleRenderedValue 返回了处理结果，直接返回
        return processedValue;
      }
      // 如果返回 null，说明需要继续使用默认处理
      return renderStaticFieldByType(column, customRender, record, options);
    } catch (error) {
      console.error(processUiMessage('staticRenderFailed', { locale: options?.locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
      // 渲染出错时，回退到默认渲染
      return renderStaticFieldByType(column, value, record, options);
    }
  }

  // 使用通用的静态字段渲染
  return renderStaticFieldByType(column, value, record, options);
};

/**
 * 表格单元格渲染统一入口
 * - 复用 generateStaticField 完整的静态展示逻辑（含 column.render 处理、image/file/boolean(trueValue/falseValue) 等）
 * - 可选支持 tooltip 与 ellipsis 包装（后续可扩展更多差异化需求）
 */
export interface TableCellRenderOptions extends Partial<FieldGeneratorConfig> {
  /** 是否启用 tooltip，true 时使用静态文本作为 title，也可传入自定义内容 */
  tooltip?: boolean | { content?: string };
  /** 是否启用省略显示（单行/多行） */
  ellipsis?: boolean;
  /** 多行省略的最大行数（省略开启时生效，默认单行） */
  maxLines?: number;
}

export const generateTableCell = (column: TableColumn, value: any, record?: Record<string, any>, options: TableCellRenderOptions = {}): React.ReactNode => {
  // 复用静态渲染（内部已处理 column.render 与静态类型映射）
  const node = generateStaticField(column, value, record, options);

  const { tooltip, ellipsis, maxLines = 1 } = options;

  // 无需额外包装，直接返回
  if (!tooltip && !ellipsis) {
    return node;
  }

  // 计算用于 tooltip 的纯文本内容
  const textForTitle = (() => {
    if (!tooltip) return undefined;
    if (typeof tooltip === 'object' && tooltip.content) return tooltip.content;
    try {
      return formatStaticValueToText(value, column, record, options.locale);
    } catch (e) {
      return undefined;
    }
  })();

  // 省略样式（单行使用 truncate，多行使用 -webkit-line-clamp）
  const wrapperStyle: React.CSSProperties = {};
  const wrapperClass = [ellipsis ? (maxLines > 1 ? '' : 'truncate') : ''].filter(Boolean).join(' ');

  if (ellipsis && maxLines > 1) {
    Object.assign(wrapperStyle, {
      display: '-webkit-box',
      WebkitLineClamp: maxLines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    } as React.CSSProperties);
  }

  return (
    <span className={wrapperClass} style={wrapperStyle} title={textForTitle}>
      {node}
    </span>
  );
};
/**
 * 专门用于静态展现的数据格式化函数
 * 支持 editConfig.type 的类型识别，用于静态模式的数据展现
 * @param value 字段值
 * @param column 列配置
 * @param record 行数据
 * @param locale 当前语言，用于布尔值与日志文案
 * @returns 格式化后的纯文本字符串
 */
const formatStaticValueToText = (value: any, column: TableColumn, record?: Record<string, any>, locale?: string): string => {
  // 如果值为null或undefined，返回空字符串
  if (value === null || value === undefined) return '';

  // 获取实际的类型：支持 editConfig.type 的静态展现
  // 1. 优先使用 editConfig.type（编辑器类型）
  // 2. 其次使用 column.type / dataType
  const actualType = column.editConfig?.type || column.type || column.dataType;

  // 根据类型进行数据转换，参考 cellValueFormatter.tsx 的实现
  switch (actualType as TableColumnType | DataType | EditorType) {
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

    case 'number':
    case 'int':
    case 'float':
    case 'long':
    case 'double': {
      // 数字类型支持格式化
      const num = Number(value);
      if (Number.isNaN(num)) return String(value || '');

      if (!column.format) return String(num);

      try {
        // 支持简单的数字格式化
        if (column.format.includes('.')) {
          const decimals = column.format.split('.')[1]?.length || 0;
          return num.toFixed(decimals);
        }
        // 支持千分位分隔符
        if (column.format.includes(',')) {
          return num.toLocaleString();
        }
        // 支持百分比格式
        if (column.format.includes('%')) {
          return (num * 100).toFixed(2) + '%';
        }
        return String(num);
      } catch (error) {
        console.warn(processUiMessage('numberFormatFailed', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
        return String(num);
      }
    }

    case 'tag':
      // 标签类型 - 转换为纯文本
      if (Array.isArray(value)) {
        return value.map((tag) => String(tag)).join(', ');
      }
      return String(value);

    case 'image':
      // 图片类型 - 处理图片URL
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'object' && value !== null) {
        // 处理图片对象，提取URL
        if (value.url) {
          return value.url;
        }
        if (value.src) {
          return value.src;
        }
        if (value.path) {
          return value.path;
        }
        // 如果没有找到URL字段，返回JSON字符串
        return JSON.stringify(value);
      }
      return String(value);

    case 'file':
      // 文件类型 - 处理文件URL和名称
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'object' && value !== null) {
        // 处理文件对象，提取URL和名称
        if (value.url) {
          return value.url;
        }
        if (value.path) {
          return value.path;
        }
        if (value.name) {
          return value.name;
        }
        if (value.filename) {
          return value.filename;
        }
        // 如果没有找到相关字段，返回JSON字符串
        return JSON.stringify(value);
      }
      return String(value);

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
          .join(', ');
      }
      return String(value);

    case 'boolean':
    case 'checkbox': {
      // 友好处理布尔值，支持 trueValue/falseValue 与常见字符串/数字形式
      const trueValue = column.editConfig?.trueValue !== undefined ? column.editConfig?.trueValue : 1;
      const falseValue = column.editConfig?.falseValue !== undefined ? column.editConfig?.falseValue : 0;

      const toBool = (v: any): boolean | undefined => {
        if (typeof v === 'boolean') return v;
        if (v === trueValue) return true;
        if (v === falseValue) return false;
        if (typeof v === 'number') {
          if (v === 1) return true;
          if (v === 0) return false;
        }
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          // 中文取值来自内置文案表（是/否、启用/禁用、开启/关闭），保证与展示文案一致
          const trueWords = ['true', '1', 'yes', 'y', ...(tableMessages['zh-CN'].booleanTrueWords as string[])];
          const falseWords = ['false', '0', 'no', 'n', ...(tableMessages['zh-CN'].booleanFalseWords as string[])];
          if (trueWords.some((word) => word.toLowerCase() === s)) return true;
          if (falseWords.some((word) => word.toLowerCase() === s)) return false;
          // 也可能传入的是等于 trueValue/falseValue 的字符串
          if (String(trueValue) === v) return true;
          if (String(falseValue) === v) return false;
        }
        return undefined;
      };

      const b = toBool(value);

      // 优先用 options 映射到 label
      if (Array.isArray(column.options) && column.options.length > 0) {
        const hit = column.options.find((opt: any) => String(opt?.value ?? opt) === String(value));
        if (hit) return String(hit.label ?? hit);
      }

      if (b === true) return processUiMessage('booleanTrue', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' });
      if (b === false) return processUiMessage('booleanFalse', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' });
      // 兜底为字符串
      return String(value);
    }

    case 'select':
    case 'enum':
    case 'combobox': {
      // 枚举类型：
      // - 若定义了 options，显示 label
      // - 支持数组/列表，逗号分隔
      // - 否则回退为字符串
      const opts: any[] = Array.isArray((column as any).options) ? ((column as any).options as any[]) : [];

      const mapToLabel = (val: any): string => {
        if (opts.length > 0) {
          const strVal = String(val);
          const hit = opts.find((o) => String(o?.value ?? o) === strVal);
          if (hit) return String(hit?.label ?? hit);
        }
        return String(val);
      };

      if (Array.isArray(value)) {
        return value.map((v) => mapToLabel(v)).join(', ');
      }
      return mapToLabel(value);
    }

    case 'textarea':
      // 多行文本类型
      return String(value);
    default:
      // 默认文本类型
      if (Array.isArray(value)) {
        return value.map((item) => String(item)).join(', ');
      }
      return String(value);
  }
};

/**
 * 获取静态展现的显示类型
 * 根据 editConfig.type 和实际值类型确定最适合的展现方式
 * @param column 列配置
 * @param value 字段值
 * @returns 展现类型
 */
const getStaticDisplayType = (column: TableColumn, value: any): 'text' | 'image' | 'link' | 'list' | 'json' | 'tag' | 'textarea' => {
  // 获取实际的类型：支持 editConfig.type 的静态展现
  const actualType = column.editConfig?.type || column.type || column.dataType;

  // 根据编辑器类型和实际值类型确定展现类型
  switch (actualType as TableColumnType | DataType | EditorType) {
    case 'image':
      return 'image';
    case 'file':
      return 'link';
    case 'list':
      return 'list';
    case 'object':
    case 'json':
      return 'json';
    case 'boolean':
    case 'checkbox':
    case 'select':
    case 'enum':
    case 'combobox':
      return 'tag';
    case 'textarea':
      return 'textarea';
    case 'date':
      return 'text';
    case 'number':
    case 'int':
    case 'float':
    case 'long':
    case 'double':
      return 'text';
    default:
      // 根据实际值类型进行智能判断
      if (Array.isArray(value)) {
        return 'list';
      }
      if (typeof value === 'object' && value !== null) {
        // 检查是否是图片或文件对象
        if (value.url || value.src || value.path) {
          // 如果有图片相关字段，判断为图片
          if (value.type?.includes('image') || value.mimeType?.includes('image') || value.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            return 'image';
          }
          // 否则判断为文件
          return 'link';
        }
        return 'json';
      }
      if (typeof value === 'boolean') {
        return 'tag';
      }
      return 'text';
  }
};
