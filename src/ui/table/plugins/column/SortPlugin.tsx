/**
 * 列头排序插件
 * 提供列头排序功能，使用 TableSortButton 组件
 */

import TableSortButton from '../../atoms/TableSortButton';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import type { SortState, TablePlugin } from '../../types';
import type { ActionConfig, TableColumn } from '../../types/base';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginColumnAction } from '../../types/hooks';
import type { TablePluginContext } from '../../types/hooks';
import React from 'react';

/**
 * 排序插件配置
 */
export interface SortPluginConfig {
  /** 是否启用排序功能 */
  enabled?: boolean;
  /** 优先级 */
  priority?: number;
}

/**
 * 排序插件状态
 */
export interface SortPluginState {
  /** 当前排序状态 */
  sortState?: Record<string, 'asc' | 'desc' | null>;
}

/**
 * 排序按钮组件
 */
const SortButton: React.FC<{
  column: TableColumn;
  context?: TablePluginContext;
  config?: SortPluginConfig;
  action?: ActionConfig;
  onClick?: (event?: React.MouseEvent, value?: SortState | undefined) => void;
}> = ({ column, context, onClick, action }) => {
  const tableContext = context?.tableContext;
  const tableConfig = tableContext?.state?.config;

  // 检查是否应该显示排序按钮
  const shouldShowSort = () => {
    // 1. 表格配置允许排序
    if (!tableConfig?.sortable) return false;

    // 2. 列配置允许排序
    if (!column.sortable) return false;

    return true;
  };

  if (!shouldShowSort()) {
    return null;
  }

  return <TableSortButton column={column} onChange={onClick} action={action} />;
};

/**
 * 排序插件定义
 */
export const SortPlugin: TablePlugin = {
  id: 'column-sort',
  name: 'column-sort-plugin',
  type: 'action',
  positionType: 'column',
  version: '1.0.0',
  description: 'Column header sort plugin',
  messages: getTablePluginMessages('sort'),

  defaultState: {
    sortState: {},
  } as SortPluginState,

  actions: [
    {
      key: 'table-column-sort',
      label: 'plugin.sort.title',
      icon: 'arrow-up-down',
      tooltip: 'plugin.sort.tooltip',
      position: [TablePluginContributionPoint.COLUMN_HEADER],
      priority: 10, // 高优先级，排在前面
      group: 'sort',
      type: 'table-column-sort',
      isPluginAction: true,
      messages: getTablePluginMessages('sort'),
      variant: 'ghost',
      interaction: {
        type: 'direct',
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },

      // 显示条件：只判断表格配置（初始化时拿不到column）
      when: (column, context) => {
        const tableConfig = context?.state?.config;
        return !!tableConfig?.sortable;
      },

      // 点击事件处理
      execute: async (column, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        try {
          // 检查列是否允许排序
          if (!column?.sortable) return;

          // 获取表格逻辑实例
          const tableLogic = context?.tableContext?.tableLogic;
          if (!tableLogic) return;

          // 获取当前排序状态
          const sortState = context?.tableContext?.state?.sortState;
          const currentSort = sortState?.columnName === column.name ? sortState.order : null;

          // 执行排序切换
          tableLogic.sort.toggleSort(column.name);

          // 计算新的排序状态
          let newOrder: 'asc' | 'desc' | null = null;
          if (currentSort === null) {
            newOrder = 'asc';
          } else if (currentSort === 'asc') {
            newOrder = 'desc';
          } else {
            newOrder = null;
          }

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-column-sort',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  columnName: column.name,
                  columnTitle: column.title,
                  previousOrder: currentSort,
                  newOrder: newOrder,
                },
                result: { success: true, data: sortState },
              },
              context.tableContext,
              action || ({} as ActionConfig),
            );
          }
        } catch (error) {
          console.error(processMessage('plugin.sort.failed', tableMessages, { error: String(error) }), error);

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-column-sort',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  columnName: column?.name || '',
                  columnTitle: column?.title || '',
                },
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

      // 自定义渲染：使用 TableSortButton 组件，在这里判断列配置
      render: (column, context, action) => {
        // 在render时再次检查列配置
        if (!column?.sortable) {
          return null;
        }

        const handleClick = (event?: React.MouseEvent, value?: SortState | undefined) => {
          // 直接调用插件的pluginExecute方法，实现统一的事件处理
          if (action?.pluginExecute) {
            action?.pluginExecute(column, context, action);
          }
        };

        return React.createElement(SortButton, {
          column,
          context,
          action,
          onClick: handleClick,
        });
      },
    },
  ] as TablePluginColumnAction[],

  init: (context: TablePluginContext) => {
    // 初始化排序状态
    if (!context.state?.sortState && context.updateState) {
      context.updateState({
        sortState: {},
      });
    }
  },

  destroy: (context: TablePluginContext) => {
    // 清理排序状态
    if (context.updateState) {
      context.updateState({
        sortState: {},
      });
    }
  },
};

export default SortPlugin;
