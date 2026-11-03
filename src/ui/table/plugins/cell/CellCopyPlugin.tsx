/**
 * 单元格复制插件
 * 提供单元格数据快速复制到剪贴板功能
 */

import { Button } from '../../../button';
import { Icon } from '../../../icon';
import { formatCellValueForExport } from '../../utils/cellValueFormatter';
import { writeTextToClipboard } from '../../../../utils/clipboard';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import React from 'react';
import type { TableColumn, TablePlugin } from '../../types';
import type { ActionConfig } from '../../types/base';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginCellAction } from '../../types/hooks';

/**
 * 单元格复制插件配置
 */
export interface CellCopyPluginConfig {
  /** 是否启用复制功能 */
  enabled?: boolean;
  /** 复制格式化函数 */
  formatter?: (value: any, record: Record<string, any>, column: TableColumn) => string;
  /** 排除的列名列表 */
  excludeColumns?: string[];
  /** 复制成功回调 */
  onCopySuccess?: (value: any, record: Record<string, any>, column: TableColumn) => void;
  /** 复制失败回调 */
  onCopyError?: (error: Error, value: any, record: Record<string, any>, column: TableColumn) => void;
}

/**
 * 单元格复制插件状态接口
 */
export interface CellCopyPluginState {
  /** 是否正在复制 */
  copying: boolean;
  /** 最后复制时间 */
  lastCopyTime?: Date;
  /** 复制计数 */
  copyCount: number;
}

/**
 * 格式化单元格值为字符串
 */
const formatCellValue = (value: any, record: Record<string, any>, column: TableColumn, config?: CellCopyPluginConfig): string => {
  // 使用自定义格式化函数
  if (config?.formatter) {
    return config.formatter(value, record, column);
  }

  // 默认格式化逻辑
  if (value == null || value === '') {
    return '';
  }

  // 处理不同数据类型
  return formatCellValueForExport(value, column);
};

/**
 * 单元格复制插件定义
 */
const CellCopyPlugin: TablePlugin = {
  id: 'cellCopy',
  name: 'cellCopy',
  type: 'action',
  positionType: 'cell',
  version: '1.0.0',
  description: 'Copy cell content to clipboard',
  messages: getTablePluginMessages('cellCopy'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-cell-copy',
      label: 'plugin.cellCopy.title',
      icon: 'copy',
      position: [TablePluginContributionPoint.ROW_CONTEXT_MENU, TablePluginContributionPoint.CELL_CONTEXT_MENU],
      priority: 5,
      group: 'cell-data',
      isPluginAction: true,
      messages: getTablePluginMessages('cellCopy'),
      variant: 'ghost',
      type: 'table-cell-copy',
      interaction: {
        type: 'direct',
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      // 初始化调用的时候 record和column为undefined, 这个只能调用action的when才有数据
      when: (record, context, action, column) => {
        const systemPlugin = context?.tableLogic?.plugin;
        const config = systemPlugin?.getPluginConfig?.(CellCopyPlugin.id as string) as CellCopyPluginConfig;

        // 检查是否在排除列表中
        if (config?.excludeColumns?.includes(column?.name || '')) {
          return false;
        }

        return true;
      },
      execute: async (record, context, action, column) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as CellCopyPluginState;
        const config = (action?.config as CellCopyPluginConfig) || {};

        if (!column || !record) {
          console.warn(processMessage('plugin.cellCopy.missingData', tableMessages));
          return;
        }

        try {
          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            copying: true,
          });

          // 获取单元格值
          const value = record[column.dataIndex || column.name];

          if (value == null || value === '') {
            throw new Error(processMessage('plugin.cellCopy.noContent', tableMessages));
          }

          // 格式化值
          const formattedValue = formatCellValue(value, record, column, config);

          // 复制到剪贴板
          await writeTextToClipboard(formattedValue)
            .then(() => {
              console.debug(processMessage('plugin.cellCopy.copiedToClipboard', tableMessages));
            })
            .catch((e) => {
              console.error(e);
              throw new Error(processMessage('plugin.cellCopy.copyFailed', tableMessages, { error: String(e) }));
            });

          // 更新状态
          const now = new Date();
          context?.updateState?.({
            ...pluginState,
            copying: false,
            lastCopyTime: now,
            copyCount: pluginState.copyCount + 1,
          });

          // 调用成功回调
          if (config.onCopySuccess) {
            config.onCopySuccess(value, record, column);
          }

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-cell-copy',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  record,
                  column,
                  value,
                },
                result: {
                  success: true,
                  data: { copiedValue: formattedValue },
                },
              },
              context.tableContext,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage('plugin.cellCopy.copySuccess', tableMessages));
        } catch (error) {
          console.error(processMessage('plugin.cellCopy.copyFailed', tableMessages, { error: String(error) }), error);

          // 更新状态
          context?.updateState?.({
            ...pluginState,
            copying: false,
          });

          // 调用错误回调
          if (config.onCopyError && error instanceof Error) {
            config.onCopyError(error, record?.[column?.dataIndex || column?.name || ''], record, column);
          }

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-cell-copy',
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
      },
      render: (record, context, action, column) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as CellCopyPluginState;

        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.showLabel;

        const handleClick = (event?: React.MouseEvent) => {
          if (action?.pluginExecute) {
            action?.pluginExecute(record, context, action, column);
          }
        };

        return React.createElement(
          Button,
          {
            variant: 'ghost',
            size: showLabel ? (action?.size ?? 'sm') : 'icon',
            className: 'shrink-0 p-1',
            title: processMessage('plugin.cellCopy.tooltip', tableMessages),
            leftIcon: React.createElement(Icon, {
              name: 'copy',
              size: 16,
            }),
            disabled: pluginState?.copying,
            onClick: (e) => {
              handleClick(e);
            },
          },
          showLabel ? processMessage('plugin.cellCopy.copy', tableMessages) : null,
        );
      },
    },
  ] as TablePluginCellAction[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: CellCopyPluginState = {
      copying: false,
      lastCopyTime: undefined,
      copyCount: 0,
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

export default CellCopyPlugin;
