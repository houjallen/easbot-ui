/**
 * 批量删除插件
 * 提供表格数据批量删除功能，支持选中行删除和全部删除
 */

import type { TableContextValue } from '../index';
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
} from '../../alert-dialog';
import { Button } from '../../button';
import { Icon } from '../../icon';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import React from 'react';
import type { ActionConfig, TablePlugin } from '../types';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableActionConfig } from '../types/hooks';
import type { TablePluginContext } from '../types/hooks';

/**
 * 批量删除插件配置
 */
export interface BatchDeletePluginConfig {
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
  onDelete?: (selectedRows: any[], context: TablePluginContext) => Promise<boolean> | boolean;
}

/**
 * 批量删除插件状态接口
 */
export interface BatchDeletePluginState {
  /** 是否正在删除 */
  loading: boolean;
  /** 最后删除时间 */
  lastDeleteTime?: Date;
}

/**
 * 批量删除插件定义
 */
const BatchDeletePlugin: TablePlugin = {
  id: 'batchDelete',
  name: 'batchDelete',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Batch delete table data',
  messages: getTablePluginMessages('batchDelete'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-delete',
      label: 'plugin.batchDelete.title',
      icon: 'trash',
      position: [TablePluginContributionPoint.TOOLBAR_LEFT],
      priority: 2,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('batchDelete'),
      variant: 'destructive',
      type: 'table-delete',
      interaction: {
        type: 'direct',
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (selectedRows, context) => {
        return true;
      },
      execute: async (selectedRows = [], context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as BatchDeletePluginState;
        const tableContext = context?.tableContext;
        const systemPlugin = context?.tableContext?.tableLogic?.plugin;
        const config = (systemPlugin?.getPluginConfig?.('batchDelete') as BatchDeletePluginConfig) || {};
        const deleteRows = selectedRows || [];
        const rowKey = context?.tableContext?.state?.config?.rowKey ?? 'unknown';
        const deleteKes = selectedRows?.map((record) => record?.[rowKey]) || [];

        try {
          if (deleteRows.length === 0) {
            console.warn(processMessage('plugin.batchDelete.noSelectedRows', tableMessages));
            return;
          }

          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            loading: true,
          });

          // 如果有自定义删除处理函数，调用它
          if (config.onDelete && context) {
            await config.onDelete(deleteRows, context);
          } else {
            // 默认删除逻辑：通过事件系统处理
            console.debug('执行默认批量删除逻辑');
          }

          // 更新最后删除时间
          const now = new Date();
          context?.updateState?.({
            ...pluginState,
            loading: false,
            lastDeleteTime: now,
          });

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-delete',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  rows: deleteRows,
                  count: deleteRows.length,
                  rowKey,
                },
                result: {
                  success: true,
                  data: deleteKes,
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage('plugin.batchDelete.deleteSuccess', tableMessages));
        } catch (error) {
          console.error(processMessage('plugin.batchDelete.deleteFailed', tableMessages, { error: String(error) }), error);

          context?.updateState?.({
            ...pluginState,
            loading: false,
          });

          // 操作失败后，也emit事件
          const errorActionEvents = tableContext?.tableLogic?.actionEvents;
          if (errorActionEvents) {
            await errorActionEvents.emitAction(
              'table-delete',
              {
                selectedRows: deleteRows,
                source: 'plugin',
                timestamp: Date.now(),
                hardDelete: config?.hardDelete ?? false, // 添加硬删除标识
                result: {
                  success: false,
                  error: error as Error,
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }
        }
      },
      render: (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as BatchDeletePluginState;

        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

        const selectedCount = selectedRows?.length || 0;

        const handleClick = (event?: React.MouseEvent) => {};

        const systemPlugin = context?.tableContext?.tableLogic?.plugin;
        const config = (systemPlugin?.getPluginConfig?.('batchDelete') as BatchDeletePluginConfig) || {};
        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              {React.createElement(
                Button,
                {
                  variant: 'destructive',
                  size: showLabel ? (action?.size ?? 'sm') : 'icon',
                  className: 'shrink-0 p-1',
                  title: processMessage('plugin.batchDelete.tooltip', tableMessages) + (selectedCount > 0 ? ` (${selectedCount})` : ''),
                  leftIcon: React.createElement(Icon, {
                    name: 'trash',
                    size: 16,
                  }),
                  disabled: pluginState?.loading || selectedCount === 0,
                  onClick: (e) => {
                    handleClick(e);
                  },
                },
                showLabel ? `${processMessage('plugin.batchDelete.batchDelete', tableMessages)}${selectedCount > 0 ? ` (${selectedCount})` : ''}` : null,
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
                <AlertDialogTitle>{config.confirmTitle || processMessage('plugin.batchDelete.confirmDelete', tableMessages)}</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>{config.confirmContent || processMessage('plugin.batchDelete.confirmDeleteText', tableMessages, { count: selectedCount })}</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  {React.createElement(
                    Button,
                    {
                      className: 'js-alert-cancel',
                      autoFocus: true,
                      variant: 'secondary',
                    },
                    config.confirmCancelText || processMessage('cancel', tableMessages),
                  )}
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  {React.createElement(
                    Button,
                    {
                      className: 'js-alert-confirm',
                      variant: 'destructive',
                      onClick: () => {
                        if (action?.pluginExecute) {
                          action?.pluginExecute(selectedRows, context, action);
                        }
                      },
                    },
                    config.confirmOkText || processMessage('confirm', tableMessages),
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ] as TablePluginTableActionConfig[],
  init: (context) => {
    // 初始化插件状态
    const initialState: BatchDeletePluginState = {
      loading: false,
      lastDeleteTime: undefined,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理删除相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default BatchDeletePlugin;
