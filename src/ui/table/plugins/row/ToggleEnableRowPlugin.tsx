/**
 * 切换行状态插件
 * 提供启用/禁用行数据功能，根据当前状态动态显示对应操作
 */

import type { TableContextValue } from '../../index';
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
import type { TablePlugin } from '../../types';
import type { ActionConfig } from '../../types';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginRowAction } from '../../types/hooks';
import React from 'react';

/**
 * 切换行状态插件配置
 */
export interface ToggleRowPluginConfig {
  /** 是否启用切换功能 */
  enabled?: boolean;
  /** 状态字段名 */
  statusField?: string;
  /** 启用状态的值 */
  enabledValue?: any;
  /** 禁用状态的值 */
  disabledValue?: any;
  /** 是否需要确认启用 */
  confirmEnable?: boolean;
  /** 是否需要确认禁用 */
  confirmDisable?: boolean;
  /** 启用确认文本 */
  enableConfirmText?: string;
  /** 禁用确认文本 */
  disableConfirmText?: string;
  /** 自定义启用处理函数 */
  onEnable?: (record: Record<string, any>) => Promise<any>;
  /** 自定义禁用处理函数 */
  onDisable?: (record: Record<string, any>) => Promise<any>;
}

/**
 * 切换行状态插件状态接口
 */
export interface ToggleEnableRowPluginState {
  /** 是否正在处理 */
  loading: boolean;
  /** 最后操作时间 */
  lastToggleTime?: Date;
}

/**
 * 切换行状态插件定义
 */
const ToggleEnableRowPlugin: TablePlugin = {
  id: 'toggle-row',
  name: 'toggle-row',
  type: 'action',
  positionType: 'row',
  version: '1.0.0',
  description: 'Toggle row data status (enable/disable)',
  messages: getTablePluginMessages('toggleRow'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-row-enable',
      label: 'plugin.toggleRow.title',
      icon: 'toggle-left',
      position: [TablePluginContributionPoint.ROW_CONTEXT_MENU],
      priority: 30,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('toggleRow'),
      variant: 'ghost',
      type: 'table-row-enable',
      interaction: {
        type: 'direct',
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (record, context) => {
        // 仅当插件配置中显式提供了 statusField 时展示
        const systemPlugin = context?.tableLogic?.plugin;
        const config = systemPlugin?.getPluginConfig?.(ToggleEnableRowPlugin.id as string) || {};
        return !!config.statusField;
      },
      execute: async (record = {}, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as ToggleEnableRowPluginState;
        const systemPlugin = context?.tableContext?.tableLogic?.plugin;

        try {
          const config = systemPlugin?.getPluginConfig?.(ToggleEnableRowPlugin.id as string) || {};
          // statusField 与 render 保持一致：未配置时不做状态读写，避免误改 record['status']
          const statusField = config.statusField;
          const enabledValue = config.enabledValue !== undefined ? config.enabledValue : true;
          const disabledValue = config.disabledValue !== undefined ? config.disabledValue : false;

          if (!statusField) {
            console.warn(processMessage('plugin.toggleRow.operationFailed', tableMessages));
            return;
          }

          const currentStatus = record[statusField];
          const isCurrentlyEnabled = currentStatus === enabledValue;
          const targetStatus = isCurrentlyEnabled ? disabledValue : enabledValue;
          const operation = isCurrentlyEnabled ? 'disable' : 'enable';

          // 确认弹窗逻辑已在 render 中统一处理，这里不再二次确认

          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            loading: true,
          });

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            const rowKey = context?.tableContext?.state?.config?.rowKey ?? 'unknown';
            await actionEvents.emitAction(
              'table-row-enable',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  record,
                  statusField,
                  fromStatus: currentStatus,
                  toStatus: targetStatus,
                  rowKey,
                },
                result: {
                  success: true,
                  data: {
                    [rowKey]: context?.tableContext?.getRowKey(record),
                    [statusField]: targetStatus,
                  },
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage(`plugin.toggleRow.${operation}Success`, tableMessages));
          context?.updateState?.({
            ...pluginState,
            loading: false,
            lastToggleTime: new Date(),
          });
        } catch (error) {
          console.error(processMessage('plugin.toggleRow.operationFailed', tableMessages, { error: String(error) }), error);

          context?.updateState?.({
            ...pluginState,
            loading: false,
          });

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-enable',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { record },
                result: {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }
        }
      },
      render: (record = {}, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as ToggleEnableRowPluginState;
        const systemPlugin = context?.tableContext?.tableLogic?.plugin;
        const config = systemPlugin?.getPluginConfig?.(ToggleEnableRowPlugin.id as string) || {};
        const showLabel = action?.showInMore || action?.showLabel;

        const statusField = config.statusField; // 不提供默认，按需配置
        const enabledValue = config.enabledValue !== undefined ? config.enabledValue : true;
        // statusField 未配置时不应去读取 record['undefined']，此时按「非启用态」处理
        const currentStatus = statusField ? record[statusField] : undefined;
        const isCurrentlyEnabled = currentStatus === enabledValue;

        const operation = isCurrentlyEnabled ? 'disable' : 'enable';
        const iconName = isCurrentlyEnabled ? 'toggle-right' : 'toggle-left';
        const label = processMessage(`plugin.toggleRow.${operation}`, tableMessages);
        const tooltip = processMessage(`plugin.toggleRow.${operation}Tooltip`, tableMessages);

        const handleClick = (event?: React.MouseEvent) => {};

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              {React.createElement(
                Button,
                {
                  variant: 'ghost',
                  size: showLabel ? (action?.size ?? 'sm') : 'icon',
                  className: 'shrink-0 p-1',
                  title: tooltip,
                  leftIcon: React.createElement(Icon, {
                    name: iconName,
                    size: 16,
                  }),
                  disabled: pluginState?.loading || !statusField,
                  onClick: handleClick,
                },
                showLabel ? label : null,
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
                <AlertDialogTitle>
                  {config.confirmTitle || (isCurrentlyEnabled ? processMessage('plugin.toggleRow.disable', tableMessages) : processMessage('plugin.toggleRow.enable', tableMessages))}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                {config.confirmContent ||
                  (isCurrentlyEnabled
                    ? config.disableConfirmText || processMessage('plugin.toggleRow.confirmDisableText', tableMessages)
                    : config.enableConfirmText || processMessage('plugin.toggleRow.confirmEnableText', tableMessages))}
              </AlertDialogDescription>
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
                      variant: isCurrentlyEnabled ? 'destructive' : 'default',
                      onClick: (e) => {
                        if (action?.pluginExecute) {
                          action?.pluginExecute(record, context, action);
                        }
                      },
                    },
                    config.confirmOkText || (isCurrentlyEnabled ? processMessage('plugin.toggleRow.disable', tableMessages) : processMessage('plugin.toggleRow.enable', tableMessages)),
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ] as TablePluginRowAction[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: ToggleEnableRowPluginState = {
      loading: false,
      lastToggleTime: undefined,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理切换相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default ToggleEnableRowPlugin;
