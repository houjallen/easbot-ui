/**
 * 表格编辑表单组件
 * 提供统一的表单布局和渲染功能
 * 用于表格行编辑、新增等场景
 */

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../form/form';
import type { TableContextValue } from '../context';
import { generateEditField, generateStaticField } from '../utils/field-generator';
import { createMessageProcessor } from '../../../utils/ui-message';
import type { UiMessages } from '../../../utils/ui-message';
import { tableMessages } from '../../../utils/component-messages';
import { cn } from '../../../utils/classnames';
import { validateFields } from '../../../utils/validation-rule';
import type { ValidationContext } from '../../../utils/validation-rule';
import React, { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import type { ActionConfig, TableColumn } from '../types';

/**
 * 编辑表单组件属性接口
 */
export interface EditFormProps {
  /** 表格上下文 context */
  context?: TableContextValue;
  /** 列定义 */
  columns: TableColumn[];
  /** 初始值 */
  initialValues?: Record<string, any>;
  /** 布局模式：grid | list */
  layout?: 'grid' | 'list';
  /** 网格列数，仅在 grid 模式下有效，'auto' 表示自适应 */
  gridCols?: number | 'auto';
  /** 字段的默认最小宽度 */
  minFieldWidth?: number;
  /** 是否显示字段标签 */
  showLabel?: boolean;
  /** 是否单行显示（label 和 field 在一行） */
  singleLine?: boolean;
  /** 默认占满一行的字段类型列表 */
  fullWidthTypes?: string[];
  /** 加载状态 */
  loading?: boolean;
  /** 提交回调 */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** 表单重置回调 */
  onReset?: () => void;
  /** 值变更回调 */
  onValueChange?: (fieldName: string, value: any) => void;
  /** 验证失败回调 */
  onValidationFailed?: (errors: any[]) => void;
  /** 国际化处理函数 */
  processMessage?: (key: string, messages?: Record<string, any>) => string;
  /** 自定义文案（覆盖内置文案） */
  messages?: UiMessages;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义底部内容 */
  footer?: ReactNode;
  /** 表单实例引用 */
  formRef?: (form: UseFormReturn<any>) => void;
  /** 语言环境 */
  locale?: string;
  /** 动作配置 */
  action?: ActionConfig;
  /** 是否为静态模式（用于查看，不可编辑） */
  staticMode?: boolean;
  /** 自定义字段渲染函数（用于静态模式） */
  customFieldRenderer?: (column: TableColumn, value: any, record: Record<string, any>) => React.ReactNode;
}

/**
 * 编辑表单组件
 * 统一封装表单布局和渲染功能
 */
export const EditForm: React.FC<EditFormProps> = ({
  columns = [],
  initialValues = {},
  layout = 'grid',
  gridCols = 'auto',
  minFieldWidth = 320,
  showLabel = true,
  singleLine = true,
  fullWidthTypes = ['textarea', 'file', 'image'],
  loading = false,
  onSubmit,
  onReset,
  onValueChange,
  onValidationFailed,
  processMessage = (key) => key,
  messages,
  className,
  style,
  footer,
  formRef,
  locale = 'zh-CN',
  staticMode = false,
  context,
  action,
}) => {
  // 消费方文案优先于内置文案
  const uiMessage = createMessageProcessor({
    locale: context?.getLocale() ?? locale,
    messages: { ...tableMessages, ...messages },
    fallbackLocale: 'zh-CN',
  });
  // 过滤出可编辑的列
  const editableColumns = useMemo(() => {
    return columns.filter((column) => column.editable !== false);
  }, [columns]);

  // 初始化表单数据
  const getInitialValues = useCallback(() => {
    const values: Record<string, any> = {};
    editableColumns.forEach((column) => {
      const fieldName = column.dataIndex || column.name;
      values[fieldName] = initialValues[fieldName] !== undefined ? initialValues[fieldName] : '';
    });
    return values;
  }, [editableColumns, initialValues]);

  // 初始化表单 - 不使用zodResolver，校验由ValidationRule统一处理
  const form = useForm({
    defaultValues: getInitialValues(),
    mode: 'onSubmit', // 只在提交时校验
  });

  // 提供表单实例给父组件
  React.useEffect(() => {
    formRef?.(form);
  }, [form, formRef]);

  // 表单提交处理
  const handleSubmit = useCallback(
    async (values: any) => {
      if (!onSubmit) return;

      // 执行字段验证
      const validationContext: Omit<ValidationContext, 'field'> = {
        i18nOptions: {
          locale,
          fallbackLocale: 'zh-CN',
        },
      };

      // 构建验证规则映射
      const rulesMap: Record<string, any> = {};
      editableColumns.forEach((column) => {
        if (column.editConfig?.rules) {
          rulesMap[column.dataIndex] = column.editConfig.rules;
        }
      });

      // 执行批量验证
      const validationResults = validateFields(values, rulesMap, validationContext);
      if (validationResults.length > 0) {
        // 有验证错误，设置表单错误
        validationResults.forEach((result) => {
          if (result.field) {
            form.setError(result.field, {
              type: 'validation',
              message: result.message || uiMessage('validationFailed'),
            });
          }
        });

        onValidationFailed?.(validationResults);
        return;
      }

      // 验证通过，调用提交回调
      await onSubmit(values);
    },
    [onSubmit, editableColumns, locale, form, onValidationFailed, uiMessage],
  );

  // 表单重置处理
  const handleReset = useCallback(() => {
    form.reset(getInitialValues());
    onReset?.();
  }, [form, getInitialValues, onReset]);

  // 基于 TableConfig 构建上传配置与 httpClient 适配器
  const tableConfig = context?.state?.config;
  const apiBaseUrl = tableConfig?.api?.baseUrl;

  const joinUrl = useCallback((base?: string, path?: string): string | undefined => {
    if (!path) return path;
    const isAbs = /^(https?:)?\/\//i.test(path);
    if (isAbs || !base) return path;
    return `${String(base).replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
  }, []);

  const buildUploadForField = useCallback(() => {
    const endpoint = tableConfig?.upload?.endpoint;
    if (!endpoint) return undefined;
    if (typeof endpoint === 'string') {
      return {
        action: joinUrl(apiBaseUrl, endpoint),
        method: 'POST' as const,
        name: 'file',
      };
    }
    return {
      action: joinUrl(apiBaseUrl, endpoint.url),
      method: (endpoint.method || 'POST') as 'POST' | 'PUT',
      headers: endpoint.headers,
      name: 'file',
    };
  }, [apiBaseUrl, joinUrl, tableConfig?.upload?.endpoint]);

  const httpClientAdapter = useCallback(() => {
    const uploader = tableConfig?.upload?.uploader;
    if (!uploader) return undefined;
    return {
      uploadFile: async (
        requestConfig: { url?: string; method?: string; headers?: Record<string, any>; onUploadProgress?: (e: any) => void },
        uploadParams: { file: File; name?: string; filename?: string; data?: Record<string, any> },
      ) => {
        // 适配到外部的 uploader(file, opts)
        const opts: any = {
          url: requestConfig.url,
          method: requestConfig.method,
          headers: requestConfig.headers,
          name: uploadParams.name,
          filename: uploadParams.filename,
          data: uploadParams.data,
          onUploadProgress: requestConfig.onUploadProgress,
        };
        return uploader(uploadParams.file, opts);
      },
    } as any;
  }, [tableConfig?.upload?.uploader]);

  // 判断字段是否应该占满一行
  const shouldFieldBeFullWidth = useCallback(
    (column: TableColumn) => {
      // 只有在 grid 布局下才处理全宽
      if (layout === 'list') return false;

      const fieldType = column.editConfig?.type;
      return fieldType && fullWidthTypes.includes(fieldType);
    },
    [layout, fullWidthTypes],
  );

  // 计算网格布局样式
  const getGridStyle = useCallback(() => {
    if (layout === 'list') return undefined;

    if (gridCols === 'auto') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minFieldWidth}px, 1fr))`,
        gap: '1rem',
      };
    } else {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: '1rem',
      };
    }
  }, [layout, gridCols, minFieldWidth]);

  // 如果没有可编辑的列，显示提示信息
  if (editableColumns.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">{uiMessage('form.noEditableFields')}</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onReset={handleReset}
        className={cn(
          staticMode ? 'eas-static-form' : 'eas-edit-form',
          // 默认使用 grid 布局
          layout === 'grid' ? 'grid gap-2' : 'flex flex-col gap-2',
          className,
        )}
        style={{ ...getGridStyle(), ...style }}
      >
        {editableColumns.map((column) => {
          const fieldName = column.dataIndex || column.name;
          const isFullWidth = shouldFieldBeFullWidth(column);

          return (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem
                  className={cn(
                    staticMode ? 'eas-static-form-item' : 'eas-edit-form-item',
                    // 默认 label 和 field 一行显示
                    'flex items-center gap-2',
                    layout === 'grid' && `min-w-[${minFieldWidth}px]`,
                    // list 布局且不是 singleLine 时才垂直布局
                    layout === 'list' && !singleLine && 'flex-col items-start space-y-2',
                    // 全宽字段占满整行
                    isFullWidth && layout === 'grid' && 'col-span-full',
                  )}
                  style={isFullWidth && layout === 'grid' ? { gridColumn: '1 / -1' } : undefined}
                >
                  {showLabel && (
                    <FormLabel
                      className={cn(
                        staticMode ? 'eas-static-form-item-label' : 'eas-edit-form-item-label',
                        // 参考 SearchPanel 的 label 样式
                        'min-w-[80px] whitespace-nowrap font-medium',
                        layout === 'list' && !singleLine && 'min-w-0',
                      )}
                    >
                      {staticMode || column.dataType !== 'boolean' ? column.title : ' '}
                    </FormLabel>
                  )}
                  <FormControl className={cn(staticMode ? 'eas-static-form-item-field' : 'eas-edit-form-item-field', 'min-w-0 flex-1')}>
                    {staticMode
                      ? generateStaticField(column, field.value, initialValues, {
                          context: 'static',
                          maxTags: 5,
                          t: processMessage,
                          baseUrl: apiBaseUrl,
                        })
                      : generateEditField(
                          column,
                          field.value,
                          (value) => {
                            field.onChange(value);
                            onValueChange?.(fieldName, value);
                          },
                          {
                            // 当不显示 label 时，使用 label 作为 placeholder 提示
                            placeholder: showLabel ? uiMessage('form.fieldPlaceholder', { field: String(column.title) }) : String(column.title),
                            disabled: loading,
                            className: 'w-full',
                            t: processMessage,
                            baseUrl: apiBaseUrl,
                            upload: buildUploadForField(),
                            httpClient: httpClientAdapter(),
                          },
                        )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}

        {footer}
      </form>
    </Form>
  );
};

export default EditForm;
