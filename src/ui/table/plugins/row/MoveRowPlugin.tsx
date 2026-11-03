/**
 * 移动行插件
 * 提供表格行数据移动功能，支持上移、下移等操作
 */

import type { TableContextValue } from '../../index';
import { Button } from '../../../button';
import { Icon } from '../../../icon';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import React from 'react';
import type { TablePlugin } from '../../types';
import type { ActionConfig } from '../../types/base';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginRowAction } from '../../types/hooks';

/**
 * 移动行插件配置
 */
export interface MoveRowPluginConfig {
  /** 是否启用移动功能 */
  enabled?: boolean;
  /** 移动模式：上下移动或拖拽 */
  moveMode?: 'upDown' | 'drag' | 'both';
  /** 是否允许跨页移动 */
  allowCrossPage?: boolean;
  /** 移动后是否自动保存 */
  autoSave?: boolean;
  /** 自定义移动处理函数 */
  onMove?: (record: any, fromIndex: number, toIndex: number) => void;
}

/**
 * 移动行插件状态接口
 */
export interface MoveRowPluginState {
  /** 是否正在移动 */
  loading: boolean;
  /** 最后移动时间 */
  lastMoveTime?: Date;
  /** 移动的记录数 */
  movedCount: number;
}

/**
 * 移动行插件定义
 */
const MoveRowPlugin: TablePlugin = {
  id: 'moveRow',
  name: 'moveRow',
  type: 'action',
  positionType: 'row',
  version: '1.0.0',
  description: 'Move table row position',
  messages: getTablePluginMessages('moveRow'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-row-move',
      label: 'plugin.moveRow.title',
      icon: 'move',
      position: [TablePluginContributionPoint.ROW_ACTIONS],
      priority: 6,
      group: 'edit',
      isPluginAction: true,
      messages: getTablePluginMessages('moveRow'),
      variant: 'ghost',
      type: 'table-row-move',
      interaction: {
        type: 'direct',
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (record, context) => {
        return true; // 默认启用，具体配置由外部控制
      },
      execute: async (record = {}, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as MoveRowPluginState;

        try {
          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            loading: true,
          });

          const config = (action?.config as MoveRowPluginConfig) || {};
          const tableContext = context?.tableContext;
          const currentData = tableContext?.state?.data || [];

          // 找到当前记录的索引
          const currentIndex = currentData.findIndex((item) => (item.id && item.id === record.id) || (item.key && item.key === record.key) || item === record);
          tableContext?.getRowKey(record);
          if (currentIndex === -1) {
            throw new Error(processMessage('plugin.moveRow.recordNotFound', tableMessages));
          }

          // 默认移动逻辑：显示简单的移动选项
          const moveOptions = [
            {
              label: processMessage('plugin.moveRow.moveUp', tableMessages),
              value: 'up',
            },
            {
              label: processMessage('plugin.moveRow.moveDown', tableMessages),
              value: 'down',
            },
            {
              label: processMessage('plugin.moveRow.moveToTop', tableMessages),
              value: 'top',
            },
            {
              label: processMessage('plugin.moveRow.moveToBottom', tableMessages),
              value: 'bottom',
            },
          ];

          const choice = prompt(
            `${processMessage('plugin.moveRow.moveTooltip', tableMessages)}\n\n` +
              moveOptions.map((opt, idx) => `${idx + 1}. ${opt.label}`).join('\n') +
              `\n\n${processMessage('plugin.moveRow.chooseOption', tableMessages)}`,
          );

          if (!choice || Number.isNaN(Number(choice))) {
            context?.updateState?.({
              ...pluginState,
              loading: false,
            });
            return;
          }

          const selectedOption = moveOptions[Number(choice) - 1];
          if (!selectedOption) {
            context?.updateState?.({
              ...pluginState,
              loading: false,
            });
            return;
          }

          let newIndex = currentIndex;
          const moveType = selectedOption.value;

          switch (moveType) {
            case 'up':
              newIndex = Math.max(0, currentIndex - 1);
              break;
            case 'down':
              newIndex = Math.min(currentData.length - 1, currentIndex + 1);
              break;
            case 'top':
              newIndex = 0;
              break;
            case 'bottom':
              newIndex = currentData.length - 1;
              break;
            default:
              throw new Error(`Unsupported move type: ${moveType}`);
          }

          // 如果位置没有变化，显示提示
          if (newIndex === currentIndex) {
            const messageKey = moveType === 'up' ? 'plugin.moveRow.cannotMoveUp' : 'plugin.moveRow.cannotMoveDown';
            console.warn(processMessage(messageKey, tableMessages));
            return;
          }

          console.debug(processMessage('plugin.moveRow.moveSuccess', tableMessages));
          context?.updateState?.({
            ...pluginState,
            loading: false,
            lastMoveTime: new Date(),
            movedCount: pluginState.movedCount + 1,
          });

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-move',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  record,
                  fromIndex: currentIndex,
                  toIndex: newIndex,
                  moveType,
                  movedCount: pluginState.movedCount + 1,
                },
                result: {
                  success: true,
                  data: { record, fromIndex: currentIndex, toIndex: newIndex },
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage('plugin.moveRow.moveSuccess', tableMessages));
        } catch (error) {
          console.error(processMessage('plugin.moveRow.moveFailed', tableMessages, { error: String(error) }), error);

          context?.updateState?.({
            ...pluginState,
            loading: false,
          });

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-move',
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
      render: (record, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as MoveRowPluginState;

        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.showLabel;

        const handleClick = (event?: React.MouseEvent) => {
          if (action?.pluginExecute) {
            action?.pluginExecute(record, context, action);
          }
        };

        return React.createElement(
          Button,
          {
            variant: 'ghost',
            size: showLabel ? (action?.size ?? 'sm') : 'icon',
            className: 'shrink-0 p-1',
            title: processMessage('plugin.moveRow.tooltip', tableMessages),
            leftIcon: React.createElement(Icon, {
              name: 'move',
              size: 16,
            }),
            disabled: pluginState?.loading,
            onClick: (e) => {
              handleClick(e);
            },
          },
          showLabel ? processMessage('plugin.moveRow.move', tableMessages) : null,
        );
      },
    },
  ] as TablePluginRowAction[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: MoveRowPluginState = {
      loading: false,
      lastMoveTime: undefined,
      movedCount: 0,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理移动相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default MoveRowPlugin;
