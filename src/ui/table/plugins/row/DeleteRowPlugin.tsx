/**
 * 删除行插件
 * 提供标准的行删除功能
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../alert-dialog';
import { Button } from '../../../button';
import { Icon } from '../../../icon';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import type { TableContextValue } from '../../context';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginRowAction } from '../../types/hooks';
import type { TablePluginContext } from '../../types/hooks';
import React from 'react';
import type { ActionConfig, TablePlugin } from '../../types';

/**
 * 删除插件状态接口
 */
export interface DeleteRowPluginState {
  loading: boolean;
  deletingRowKey?: string | number;
}

/**
 * 删除插件配置接口
 */
export interface DeleteRowPluginConfig {
  /** 是否启用插件功能 */
  enabled?: boolean;
  /** 是否显示确认对话框 */
  showConfirm?: boolean;
  /** 确认对话框标题 */
  confirmTitle?: string;
  /** 确认对话框内容 */
  confirmContent?: string;
  /** 确认按钮文案 */
  confirmOkText?: string;
  /** 取消按钮文案 */
  confirmCancelText?: string;
  /** 是否为硬删除（物理删除），默认为false（软删除/逻辑删除） */
  hardDelete?: boolean;
  /** 自定义删除处理函数 */
  onDelete?: (row: any, context: TablePluginContext) => Promise<boolean> | boolean;
}

/**
 * 删除行插件定义
 */
const DeleteRowPlugin: TablePlugin = {
  id: 'deleteRow',
  name: 'deleteRow',
  type: 'action',
  positionType: 'row',
  version: '1.0.0',
  description: 'Delete row plugin for table',
  messages: getTablePluginMessages('deleteRow'),

  // 默认状态
  defaultState: {
    loading: false,
    deletingRowKey: undefined,
  } as DeleteRowPluginState,

  // 初始化
  init: (context) => {
    context.updateState?.({
      loading: false,
      deletingRowKey: undefined,
    });
  },

  // 销毁
  destroy: (context) => {
    // 清理资源
    context.updateState?.({
      loading: false,
      deletingRowKey: undefined,
    });
  },

  // 动作定义
  actions: [
    {
      key: 'table-row-delete',
      label: 'plugin.deleteRow.title',
      icon: 'table-delete',
      position: [TablePluginContributionPoint.ROW_ACTIONS, TablePluginContributionPoint.ROW_CONTEXT_MENU],
      priority: 3,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('deleteRow'),
      variant: 'ghost',
      type: 'table-row-delete', // 使用schema定义的标准action type
      // 确认交互在 render 层通过 AlertDialogModal 统一实现
      eventConfig: {
        emit: true,
        timing: 'before',
      },

      when: (record, context) => {
        // 可以根据记录状态判断是否显示删除按钮
        return true;
      },

      execute: async (record = {}, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const tableContext = context?.tableContext;
        const systemPlugin = context?.tableContext?.tableLogic?.plugin;
        const config = (systemPlugin?.getPluginConfig?.('deleteRow') as DeleteRowPluginConfig) || {};
        const rowKey = context?.tableContext?.state?.config?.rowKey ?? 'unknown';
        try {
          // 更新状态
          context?.updateState?.({
            loading: true,
            deletingRowKey: tableContext?.getRowKey?.(record),
          });

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-delete',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  record,
                  hardDelete: config?.hardDelete ?? false, // 添加硬删除标识
                  rowKey,
                },
                result: {
                  success: true,
                  data: [context?.tableContext?.getRowKey(record)],
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          // 重置状态
          context?.updateState?.({
            loading: false,
            deletingRowKey: undefined,
          });

          console.debug(processMessage('plugin.deleteRow.success', tableMessages));
        } catch (error) {
          // 操作失败后，也emit事件
          const actionEvents = tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-delete',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  record,
                  hardDelete: config?.hardDelete ?? false, // 添加硬删除标识
                  rowKey,
                },
                result: {
                  success: false,
                  error: error as Error,
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          context?.updateState?.({
            loading: false,
            deletingRowKey: undefined,
          });
          console.error(processMessage('plugin.deleteRow.failed', tableMessages, { error: String(error) }), error);
        }
      },

      render: (record = {}, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);

        const tableConfig = context?.tableContext?.state?.config || {};
        const systemPlugin = context?.tableContext?.tableLogic?.plugin;
        const pluginConfig = (systemPlugin?.getPluginConfig?.('deleteRow') as DeleteRowPluginConfig) || {};
        const showLabel = action?.showInMore || action?.showLabel;

        const pluginState = context?.state as DeleteRowPluginState;
        // 统一的点击处理函数
        const handleClick = (event?: React.MouseEvent) => {};

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              {React.createElement(
                Button,
                {
                  variant: 'ghost',
                  size: showLabel ? (action?.size ?? 'sm') : 'icon',
                  disabled: pluginState?.loading,
                  onClick: handleClick,
                  className: 'shrink-0 p-1',
                  title: processMessage('plugin.deleteRow.tooltip', tableMessages),
                  leftIcon: React.createElement(Icon, {
                    key: 'icon',
                    name: 'table-delete',
                    className: 'text-destructive hover:text-destructive',
                    size: 16,
                  }),
                },
                showLabel ? processMessage('plugin.deleteRow.title', tableMessages) : null,
              )}
            </AlertDialogTrigger>
            <AlertDialogContent
              onOpenAutoFocus={(event) => {
                try {
                  // 阻止默认聚焦到关闭按钮，优先聚焦“取消”
                  event.preventDefault();
                  const root = (event.currentTarget as HTMLElement) || document.body;
                  const cancelBtn = root.querySelector<HTMLElement>('.js-alert-cancel');
                  (cancelBtn || root).focus();
                } catch {}
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{pluginConfig?.confirmTitle || processMessage('plugin.deleteRow.confirmTitle', tableMessages)}</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>{pluginConfig?.confirmContent || processMessage('plugin.deleteRow.confirmContent', tableMessages)}</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  {React.createElement(
                    Button,
                    {
                      className: 'js-alert-cancel',
                      autoFocus: true,
                      variant: 'secondary',
                    },
                    pluginConfig?.confirmCancelText || processMessage('plugin.deleteRow.confirmCancel', tableMessages),
                  )}
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  {React.createElement(
                    Button,
                    {
                      className: 'js-alert-confirm',
                      variant: 'destructive',
                      onClick: (e) => {
                        if (action?.pluginExecute) {
                          action?.pluginExecute(record, context, action);
                        }
                      },
                    },
                    pluginConfig?.confirmOkText || processMessage('plugin.deleteRow.confirmOk', tableMessages),
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ] as TablePluginRowAction[],
};

export default DeleteRowPlugin;
