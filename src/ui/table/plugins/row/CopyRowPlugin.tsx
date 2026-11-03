/**
 * 复制行插件
 * 提供表格行数据复制功能，支持复制到剪贴板或复制为新行
 */

import { Button } from '../../../button';
import { Icon } from '../../../icon';
import { writeTextToClipboard } from '../../../../utils/clipboard';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import React from 'react';
import type { TablePlugin } from '../../types';
import type { ActionConfig } from '../../types/base';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginRowAction } from '../../types/hooks';

/**
 * 复制行插件配置
 */
export interface CopyRowPluginConfig {
  /** 是否启用复制功能 */
  enabled?: boolean;
  /** 复制模式：剪贴板或新行 */
  copyMode?: 'clipboard' | 'newRow' | 'both';
  /** 复制格式：JSON或文本 */
  copyFormat?: 'json' | 'text' | 'csv';
  /** 排除的字段列表 */
  excludeFields?: string[];
  /** 复制后是否自动选中新行 */
  autoSelectNewRow?: boolean;
  /** 复制位置：顶部或底部 */
  position?: 'top' | 'bottom';
  /** 自定义复制处理函数 */
  onCopy?: (record: any, index: number) => void;
}

/**
 * 复制行插件状态接口
 */
export interface CopyRowPluginState {
  /** 是否正在复制 */
  loading: boolean;
  /** 复制位置：顶部或底部 */
  position?: 'top' | 'bottom';
  /** 是否需要确认复制 */
  confirmCopy?: boolean;
  /** 最后复制时间 */
  lastCopyTime?: Date;
  /** 复制的记录数 */
  copiedCount: number;
}

/**
 * 格式化数据为不同格式
 */
const formatData = (record: any, format: string, excludeFields: string[] = []): string => {
  // 过滤掉排除的字段和内部字段
  const filteredRecord = Object.keys(record)
    .filter((key) => !excludeFields.includes(key) && !key.startsWith('_'))
    .reduce((obj, key) => {
      obj[key] = record[key];
      return obj;
    }, {} as any);

  switch (format) {
    case 'json':
      return JSON.stringify(filteredRecord, null, 2);
    case 'csv': {
      const headers = Object.keys(filteredRecord).join(',');
      const values = Object.values(filteredRecord).join(',');
      return `${headers}\n${values}`;
    }
    case 'text':
      return Object.keys(filteredRecord)
        .map((key) => `${key}: ${filteredRecord[key]}`)
        .join('\n');
    default:
      return Object.keys(filteredRecord)
        .map((key) => `${key}: ${filteredRecord[key]}`)
        .join('\n');
  }
};

/**
 * 复制行插件定义
 */
const CopyRowPlugin: TablePlugin = {
  id: 'copyRow',
  name: 'copyRow',
  type: 'action',
  positionType: 'row',
  version: '1.0.0',
  description: 'Copy table row data',
  messages: getTablePluginMessages('copyRow'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-row-copy',
      label: 'plugin.copyRow.title',
      icon: 'copy',
      position: [TablePluginContributionPoint.ROW_ACTIONS],
      priority: 8,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('copyRow'),
      variant: 'ghost',
      type: 'table-row-copy',
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
      execute: async (record, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as CopyRowPluginState;

        try {
          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            loading: true,
          });

          const config = (action?.config as CopyRowPluginConfig) || {};
          const copyMode = config.copyMode || 'clipboard';
          const copyFormat = config.copyFormat || 'json';
          const excludeFields = config.excludeFields || [];
          const copyPosition = config.position || 'bottom';

          // 准备复制的数据
          let newRowData: any = null;
          let formattedData: string | null = null;
          // 如果有自定义复制处理函数，调用它
          if (config.onCopy) {
            config.onCopy(record, 0); // 这里index暂时传0，实际使用时需要传递正确的index
          } else {
            // 默认复制逻辑
            if (copyMode === 'clipboard' || copyMode === 'both') {
              // 复制到剪贴板
              formattedData = formatData(record, copyFormat, excludeFields);
              await writeTextToClipboard(formattedData)
                .then(() => {
                  console.debug(processMessage('plugin.copyRow.copiedToClipboard', tableMessages));
                })
                .catch((e) => {
                  console.error(e);
                  throw new Error(processMessage('plugin.copyRow.clipboardNotSupported', tableMessages));
                });
            }

            if (copyMode === 'newRow' || copyMode === 'both') {
              // 复制为新行 - 通过事件通知外部业务系统处理
              newRowData = { ...record };
              delete newRowData.id;
              delete newRowData.key;

              // 添加标识
              newRowData.id = `copy_${Date.now()}`;
              newRowData._isCopy = true;
              newRowData._isNew = true;

              console.debug(processMessage('plugin.copyRow.newRowCreated', tableMessages));
            }
          }

          // 更新最后复制时间和计数
          const now = new Date();
          context?.updateState?.({
            ...pluginState,
            loading: false,
            lastCopyTime: now,
            copiedCount: pluginState.copiedCount + 1,
          });

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-copy',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  record,
                  position: copyPosition,
                  mode: copyMode,
                },
                result: {
                  success: true,
                  data: { copiedValue: formattedData ?? newRowData },
                },
              },
              context.tableContext,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage('plugin.copyRow.copySuccess', tableMessages));
        } catch (error) {
          console.error(processMessage('plugin.copyRow.copyFailed', tableMessages, { error: String(error) }), error);

          context?.updateState?.({
            ...pluginState,
            loading: false,
          });

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-copy',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { record },
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
      },
      render: (record, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as CopyRowPluginState;

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
            title: processMessage('plugin.copyRow.tooltip', tableMessages),
            leftIcon: React.createElement(Icon, {
              name: 'copy',
              size: 16,
            }),
            disabled: pluginState?.loading,
            onClick: (e) => {
              handleClick(e);
            },
          },
          showLabel ? processMessage('plugin.copyRow.copy', tableMessages) : null,
        );
      },
    },
  ] as TablePluginRowAction[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: CopyRowPluginState = {
      loading: false,
      lastCopyTime: undefined,
      copiedCount: 0,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理复制相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default CopyRowPlugin;
