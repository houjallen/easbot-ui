/**
 * 表格行编辑模态组件
 * 整合EditModal和EditForm组件，提供完整的行编辑功能
 * 用于表格行编辑、新增等场景
 */

import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { TableContextValue } from '../context';
import type { TableColumn } from '../types';
import type { ActionConfig } from '../types';
import { tableMessages } from '../../../utils/component-messages';
import type { UiMessages } from '../../../utils/ui-message';
import { EditForm } from './EditForm';
import { EditModal } from './EditModal';

/**
 * 表格行编辑模态组件属性接口
 */
export interface EditRowModalProps {
  /** 模态框类型：dialog | drawer | sheet | page，默认 'dialog' */
  mode?: 'dialog' | 'drawer' | 'sheet' | 'page';
  /** 位置，仅在 drawer 和 sheet 模式下有效 */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** 布局模式：grid | list，drawer 默认 'list'，其他默认 'grid' */
  layout?: 'grid' | 'list';
  /** 网格列数，仅在 grid 模式下有效，'auto' 表示自适应，默认 'auto' */
  gridCols?: number | 'auto';
  /** 字段的默认最小宽度，默认 320px */
  minFieldWidth?: number;
  /** 是否显示字段标签，默认 true */
  showLabel?: boolean;
  /** 是否单行显示（label 和 field 在一行），默认 true */
  singleLine?: boolean;
  /**
   * 默认占满一行的字段类型列表
   * 当 gridCols = 'auto' 时，这些类型的字段会自动占满一行
   * 默认: ['textarea', 'file', 'image']
   */
  fullWidthTypes?: string[];
  /** 排除的数据字段列表（按 dataIndex 排除） */
  excludeFields?: string[];
  /** 仅包含的数据字段列表（按 dataIndex 包含） */
  includeFields?: string[];
  /** 标题 */
  title?: ReactNode;
  /** 描述文本，仅在 dialog 模式下显示 */
  description?: ReactNode;
  /** 触发按钮 */
  trigger: ReactNode;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 表格列定义 */
  columns: TableColumn[];
  /** 行数据 */
  record?: Record<string, any>;
  /** 表格上下文 */
  tableContext?: TableContextValue;
  /** 页面跳转URL生成器（仅在 page 模式下有效） */
  urlGenerator?: (record?: Record<string, any>, context?: any) => string;
  /** 编辑成功回调 */
  onEditSuccess?: (newValues: Record<string, any>, oldValues?: Record<string, any>) => void;
  /** 编辑失败回调 */
  onEditError?: (error: Error, record?: Record<string, any>) => void;
  /** 值变更回调 */
  onValueChange?: (fieldName: string, newValue: any, oldValue?: any) => void;
  /** 国际化处理函数 */
  processMessage?: (key: string, messages?: Record<string, any>, params?: Record<string, any>) => string;
  /** 自定义文案（覆盖内置文案） */
  messages?: UiMessages;
  /** 自定义类名 */
  className?: string;
  /** action 动作定义 */
  action?: ActionConfig;
  /** 是否为静态模式（用于查看，不可编辑） */
  staticMode?: boolean;
  /** 自定义字段渲染函数（用于静态模式） */
  customFieldRenderer?: (column: TableColumn, value: any, record: Record<string, any>) => React.ReactNode;
  /** 是否打开 */
  open?: boolean;
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
}

/**
 * 表格行编辑模态组件
 * 整合EditModal和EditForm组件，提供完整的行编辑功能
 */
export const EditRowModal: React.FC<EditRowModalProps> = ({
  mode = 'dialog',
  side = mode === 'sheet' ? 'right' : 'bottom',
  layout = mode === 'drawer' ? 'list' : 'grid',
  gridCols = 'auto',
  minFieldWidth = 320,
  showLabel = true,
  singleLine = true,
  fullWidthTypes = ['textarea', 'file', 'image'],
  excludeFields = [],
  includeFields,
  title,
  description,
  trigger,
  confirmText,
  cancelText,
  columns = [],
  record,
  tableContext,
  urlGenerator,
  onEditSuccess,
  onEditError,
  onValueChange,
  processMessage = (key, messages = tableMessages, params) => {
    const locale = tableContext?.getLocale?.() || 'zh-CN';
    const localeMessages = messages[locale] || messages['zh-CN'] || {};
    const template = localeMessages[key];
    if (typeof template !== 'string') return key;
    if (!params) return template;
    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => acc.replaceAll(`{${paramKey}}`, String(paramValue)), template);
  },
  messages,
  className,
  action,
  staticMode = false,
  customFieldRenderer,
  open,
  onOpenChange,
  onCancel,
  showCancel = true,
  showConfirm = !staticMode,
}) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [formInstance, setFormInstance] = useState<any>(null);
  const [internalOpen, setInternalOpen] = useState(false);

  // 控制打开状态
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      } else {
        setInternalOpen(value);
      }
    },
    [onOpenChange],
  );

  // 获取可编辑/可查看的列
  const editableColumns = useMemo((): TableColumn[] => {
    const filteredColumns = columns.filter((column) => {
      // 如果是静态模式(查看模式)，则不需要检查editable属性
      if (!staticMode && column.editable === false) return false;

      // 检查排除列表
      if (excludeFields.includes(column.dataIndex || column.name)) return false;

      // 检查包含列表
      if (includeFields && !includeFields.includes(column.dataIndex || column.name)) return false;

      return true;
    });

    // 按 priority 排序，没配置的默认为 100
    return filteredColumns.sort((a, b) => {
      const priorityA = a.editConfig?.priority ?? 100;
      const priorityB = b.editConfig?.priority ?? 100;
      return priorityA - priorityB;
    });
  }, [columns, excludeFields, includeFields, staticMode]);

  // 处理表单提交
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      if (!tableContext) return;
      const rowKey = tableContext?.state?.config?.rowKey;

      try {
        setLoading(true);

        // 调用成功回调
        if (onEditSuccess) {
          onEditSuccess(values, record);
        }

        // 触发编辑事件
        const actionEvents = tableContext?.tableLogic?.actionEvents;
        if (actionEvents) {
          await actionEvents.emitAction(
            (action?.type as any) ?? 'table-row-edit',
            {
              source: action?.isPluginAction ? 'plugin' : 'user',
              timestamp: Date.now(),
              payload: {
                rowKey,
                newValues: values,
                oldValues: record,
              },
              result: {
                success: true,
                data: record?.[rowKey ?? 'id'] ? { ...values, [rowKey ?? 'id']: record?.[rowKey ?? 'id'] } : values,
              },
            },
            tableContext,
          );
        }

        setLoading(false);
        console.debug(processMessage('plugin.editRow.editSuccess'));
      } catch (error) {
        console.error(processMessage('plugin.editRow.editFailed', tableMessages, { error: String(error) }), error);

        // 调用错误回调
        if (onEditError && error instanceof Error) {
          onEditError(error, record);
        }

        // 触发失败事件
        const actionEvents = tableContext?.tableLogic?.actionEvents;
        if (actionEvents) {
          await actionEvents.emitAction(
            (action?.type as any) ?? 'table-row-edit',
            {
              source: action?.isPluginAction ? 'plugin' : 'user',
              timestamp: Date.now(),
              payload: {
                record,
                rowKey,
              },
              result: {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            },
            tableContext,
            action,
          );
        }

        setLoading(false);
        throw error;
      }
    },
    [record, tableContext, onEditSuccess, onEditError, processMessage, action],
  );

  // 处理字段值变更
  const handleValueChange = useCallback(
    (fieldName: string, value: any) => {
      if (onValueChange) {
        const oldValue = record?.[fieldName];
        onValueChange(fieldName, value, oldValue);
      }
    },
    [onValueChange, record],
  );

  // 处理表单验证失败
  const handleValidationFailed = useCallback(
    (errors: any[]) => {
      console.warn(processMessage('form.validationFailedLog', tableMessages), errors);
    },
    [processMessage],
  );

  // 渲染表单
  const renderForm = useCallback(() => {
    return (
      <EditForm
        context={tableContext}
        columns={editableColumns}
        action={action}
        initialValues={record}
        layout={layout}
        gridCols={gridCols}
        minFieldWidth={minFieldWidth}
        showLabel={showLabel}
        singleLine={singleLine}
        fullWidthTypes={fullWidthTypes}
        loading={loading}
        onSubmit={handleSubmit}
        onValueChange={handleValueChange}
        onValidationFailed={handleValidationFailed}
        processMessage={tableContext?.tableLogic?.i18n?.t}
        messages={messages}
        formRef={setFormInstance}
        locale={tableContext?.getLocale?.() || 'zh-CN'}
        staticMode={staticMode}
        customFieldRenderer={customFieldRenderer}
      />
    );
  }, [
    editableColumns,
    record,
    layout,
    gridCols,
    minFieldWidth,
    showLabel,
    singleLine,
    fullWidthTypes,
    loading,
    handleSubmit,
    handleValueChange,
    handleValidationFailed,
    tableContext,
    staticMode,
    customFieldRenderer,
    action,
    messages,
  ]);

  // 处理确认操作
  const handleConfirm = useCallback(async () => {
    if (formInstance) {
      return formInstance.handleSubmit(handleSubmit)();
    }
  }, [formInstance, handleSubmit]);

  // 处理取消操作
  const handleCancel = useCallback(() => {
    if (formInstance) {
      formInstance.reset();
    }
  }, [formInstance]);

  // 处理URL生成
  const handleUrlGenerate = useCallback(() => {
    if (urlGenerator) {
      return urlGenerator(record, tableContext);
    }
    return '#';
  }, [urlGenerator, record, tableContext]);

  return (
    <EditModal
      mode={mode}
      side={side}
      title={title || (staticMode ? processMessage('viewTitle', tableMessages) : processMessage('plugin.editRow.title', tableMessages))}
      description={description || (staticMode ? processMessage('viewDescription', tableMessages) : processMessage('plugin.editRow.description', tableMessages))}
      trigger={trigger}
      confirmText={confirmText || processMessage('save', tableMessages)}
      cancelText={cancelText || processMessage('cancel', tableMessages)}
      confirmLoading={loading}
      onConfirm={staticMode ? undefined : handleConfirm}
      onCancel={onCancel || handleCancel}
      urlGenerator={handleUrlGenerate}
      className={className}
      open={isOpen}
      onOpenChange={handleOpenChange}
      showConfirm={showConfirm}
      showCancel={showCancel}
    >
      {renderForm()}
    </EditModal>
  );
};

export default EditRowModal;
