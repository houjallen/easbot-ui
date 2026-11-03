/**
 * 单元格编辑插件
 * 提供单元格内容弹层编辑功能，支持不同数据类型的编辑器
 */

import { Button } from '../../../button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../dialog';
import { Icon } from '../../../icon';
import { validateField } from '../../../../utils/validation-rule';
import type { ValidationContext } from '../../../../utils/validation-rule';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import React, { useState, useCallback } from 'react';
import type { TableColumn, TablePlugin } from '../../types';
import type { ActionConfig } from '../../types/base';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginCellAction } from '../../types/hooks';
import type { TablePluginContext } from '../../types/hooks';
import { generateEditField } from '../../utils/field-generator';
import type { FieldGeneratorConfig } from '../../utils/field-generator';

/**
 * 单元格编辑插件配置
 */
export interface CellEditPluginConfig {
  /** 是否启用编辑功能 */
  enabled?: boolean;
  /** 排除的列名列表 */
  excludeColumns?: string[];
  /** 只读列名列表 */
  readOnlyColumns?: string[];
  /** 自定义编辑器映射 */
  customEditors?: Record<string, React.ComponentType<any>>;
  /** 编辑成功回调 */
  onEditSuccess?: (newValue: any, oldValue: any, record: Record<string, any>, column: TableColumn) => void;
  /** 编辑失败回调 */
  onEditError?: (error: Error, record: Record<string, any>, column: TableColumn) => void;
  /** 值变更回调 */
  onValueChange?: (newValue: any, oldValue: any, record: Record<string, any>, column: TableColumn) => void;
}

/**
 * 单元格编辑插件状态接口
 */
export interface CellEditPluginState {
  /** 当前编辑的单元格 */
  editingCell?: {
    rowIndex: number;
    columnName: string;
    originalValue: any;
    currentValue: any;
  };
  /** 是否正在保存 */
  saving: boolean;
  /** 编辑计数 */
  editCount: number;
}

/**
 * 单元格编辑组件属性接口
 */
interface CellEditComponentProps {
  record?: Record<string, any>;
  column?: TableColumn;
  context?: TablePluginContext;
  action?: ActionConfig;
  processMessage: (key: string, messages?: any, params?: Record<string, any>) => string;
}

/**
 * 单元格编辑组件 - 独立的React组件，用于处理状态管理
 */
const CellEditComponent: React.FC<CellEditComponentProps> = ({ record, column, context, action, processMessage }) => {
  const pluginState = context?.state as CellEditPluginState;
  const config = context?.tableContext?.tableLogic?.plugin?.getPluginConfig?.(CellEditPlugin.id as string);

  // 配置编辑器，使用 title 作为 placeholder 提示
  const editorConfig: Partial<FieldGeneratorConfig> = {
    placeholder: String(column?.title || processMessage('plugin.cellEdit.edit', tableMessages)),
  };

  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(record?.[column?.dataIndex || '']);
  const [validationError, setValidationError] = useState<string | undefined>();

  const handleSave = useCallback(async () => {
    if (!column || !record || !context) return;

    // 执行字段验证
    const validationRules = column?.editConfig?.rules;
    if (validationRules) {
      const currentLocale = context.tableContext?.getLocale?.() || 'zh-CN';
      const validationContext: ValidationContext = {
        field: column.dataIndex,
        label: column.title || column.dataIndex,
        i18nOptions: {
          locale: currentLocale,
          fallbackLocale: 'zh-CN',
        },
      };

      const validationResult = validateField(editValue, validationRules, validationContext);
      if (!validationResult.valid) {
        setValidationError(validationResult.message);
        return;
      }
    }

    // 清除验证错误
    setValidationError(undefined);

    try {
      // 更新插件状态
      context?.updateState?.({
        ...pluginState,
        saving: true,
        editingCell: {
          rowIndex: 0, // 实际使用时需要传递正确的rowIndex
          columnName: column.dataIndex, // 使用 dataIndex 作为列标识
          originalValue: record[column.dataIndex],
          currentValue: editValue,
        },
      });

      const oldValue = record[column.dataIndex];

      // 调用成功回调
      if (config.onEditSuccess) {
        config.onEditSuccess(editValue, oldValue, record, column);
      }

      // 调用值变更回调
      if (config.onValueChange) {
        config.onValueChange(editValue, oldValue, record, column);
      }

      // 操作完成后，通过统一的actionEvents实例emit事件
      const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
      if (actionEvents) {
        const rowKey = context?.tableContext?.state?.config?.rowKey ?? 'unknown';
        await actionEvents.emitAction(
          'table-cell-edit',
          {
            source: 'plugin',
            timestamp: Date.now(),
            payload: {
              record,
              column,
              rowKey,
              oldValue,
              newValue: editValue,
            },
            result: {
              success: true,
              data: {
                [rowKey]: context?.tableContext?.getRowKey(record),
                [column.dataIndex]: editValue,
              },
            },
          },
          context.tableContext,
          action || ({} as ActionConfig),
        );
      }

      // 更新状态
      context?.updateState?.({
        ...pluginState,
        saving: false,
        editingCell: undefined,
        editCount: pluginState.editCount + 1,
      });

      setOpen(false);
      console.debug(processMessage('plugin.cellEdit.editSuccess', tableMessages));
    } catch (error) {
      console.error(processMessage('plugin.cellEdit.editFailed', tableMessages, { error: String(error) }), error);

      // 更新状态
      context?.updateState?.({
        ...pluginState,
        saving: false,
        editingCell: undefined,
      });

      // 调用错误回调
      if (config.onEditError && error instanceof Error) {
        config.onEditError(error, record, column);
      }

      // 操作失败后，也emit事件
      const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
      if (actionEvents) {
        await actionEvents.emitAction(
          'table-cell-edit',
          {
            source: 'plugin',
            timestamp: Date.now(),
            payload: { record, column },
            result: {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
          context.tableContext,
          action || ({} as ActionConfig),
        );
      }
    }
  }, [editValue, record, column, context, config, pluginState, processMessage, action]);

  const handleOpenDialog = useCallback((event?: React.MouseEvent) => {
    // 直接打开Dialog，因为DropdownMenu现在使用controlled模式
    // 当Dialog打开时，DropdownMenu会自动关闭（由于它们都是异步跳转）
    setOpen(true);
  }, []);

  const tableConfig = context?.tableContext?.state?.config || {};
  const showLabel = action?.showInMore || action?.showLabel;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={showLabel ? (action?.size ?? 'sm') : 'icon'}
          className="shrink-0 p-1"
          title={processMessage('plugin.cellEdit.tooltip', tableMessages)}
          leftIcon={<Icon name="edit" size={16} />}
          disabled={pluginState?.saving}
          onClick={handleOpenDialog}
        >
          {showLabel ? processMessage('plugin.cellEdit.edit', tableMessages) : null}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        style={{
          zIndex: 'calc(var(--eas-z-index-dialog, 1400) + 10)',
        }}
        // 打开时自定义聚焦：优先聚焦 data-autofocus，其次第一个可编辑/可聚焦控件
        onOpenAutoFocus={(event) => {
          try {
            // 阻止默认把焦点放到关闭/最大化按钮
            event.preventDefault();
            const root = (event.currentTarget as HTMLElement) || document.body;
            const target = root.querySelector<HTMLElement>(
              '[data-autofocus], input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"], button:not([disabled])[data-primary], [tabindex]:not([tabindex="-1"])',
            );
            target?.focus();
          } catch {}
        }}
      >
        <DialogHeader>
          <DialogTitle>{processMessage('plugin.cellEdit.title', tableMessages)}</DialogTitle>
          <DialogDescription>{`${processMessage('plugin.cellEdit.edit', tableMessages)} ${column?.title}`}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {generateEditField(column as TableColumn, editValue, setEditValue, editorConfig)}
          {validationError && <div className="mt-2 text-red-600 text-sm">{validationError}</div>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditValue(record?.[column?.dataIndex || '']);
              setOpen(false);
            }}
          >
            {processMessage('cancel', tableMessages)}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={pluginState?.saving}>
            {pluginState?.saving ? processMessage('saving', tableMessages) : processMessage('save', tableMessages)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * 单元格编辑插件定义
 */
const CellEditPlugin: TablePlugin = {
  id: 'cellEdit',
  name: 'cellEdit',
  type: 'action',
  positionType: 'cell',
  version: '1.0.0',
  description: 'Edit cell content in dialog',
  messages: getTablePluginMessages('cellEdit'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-cell-edit',
      label: 'plugin.cellEdit.title',
      icon: 'edit',
      position: [TablePluginContributionPoint.CELL_CONTEXT_MENU],
      priority: 10,
      group: 'cell-data',
      isPluginAction: true,
      messages: getTablePluginMessages('cellEdit'),
      variant: 'ghost',
      type: 'table-cell-edit',
      interaction: {
        type: 'dialog',
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      visible: (record, context, action, column) => {
        return column?.editable !== false;
      },
      when: (record, context, action, column) => {
        const systemPlugin = context?.tableLogic?.plugin;
        const config = systemPlugin?.getPluginConfig?.(CellEditPlugin.id as string) as CellEditPluginConfig;

        // 检查是否在排除列表中
        if (config?.excludeColumns?.includes?.(column?.dataIndex || '')) {
          return false;
        }

        // 检查是否为只读列
        if (config?.readOnlyColumns?.includes?.(column?.dataIndex || '')) {
          return false;
        }

        // 检查列是否可编辑
        return column?.editable !== false;
      },
      execute: async (record, context, action, column) => {
        // 这里不需要实际的点击逻辑，因为使用Dialog组件处理
      },
      render: (record, context, action, column) => {
        const processMessage = context?.processMessage || ((key: string) => key);

        // 直接返回React组件，避免在render函数中使用Hooks
        return React.createElement(CellEditComponent, {
          record,
          column,
          context,
          action,
          processMessage,
        });
      },
    },
  ] as TablePluginCellAction[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: CellEditPluginState = {
      editingCell: undefined,
      saving: false,
      editCount: 0,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理编辑相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default CellEditPlugin;
