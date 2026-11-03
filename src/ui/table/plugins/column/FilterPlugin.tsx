/**
 * 列头筛选插件
 * 提供列头筛选功能，使用 TableColumnFilter 组件
 */

import { TableColumnFilter } from '../../atoms/TableColumnFilter';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import type { ActionConfig, FilterValue, TablePlugin } from '../../types';
import type { TableColumn } from '../../types/base';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginColumnAction } from '../../types/hooks';
import type { TablePluginContext } from '../../types/hooks';
import React from 'react';

/**
 * 筛选插件配置
 */
export interface FilterPluginConfig {
  /** 是否启用筛选功能 */
  enabled?: boolean;
  /** 优先级 */
  priority?: number;
}

/**
 * 筛选插件状态
 */
export interface FilterPluginState {
  /** 当前筛选状态 */
  filterState?: Record<string, any>;
}

/**
 * 筛选按钮组件
 */
const FilterButton: React.FC<{
  column: TableColumn;
  context?: TablePluginContext;
  config?: FilterPluginConfig;
  action?: ActionConfig;
  onClick?: (event?: React.MouseEvent, value?: FilterValue) => void;
}> = ({ column, context, onClick, action }) => {
  const tableContext = context?.tableContext;
  const tableConfig = tableContext?.state?.config;

  // 检查是否应该显示筛选按钮
  const shouldShowFilter = () => {
    // 1. 表格配置允许筛选
    if (!tableConfig?.filterable) return false;

    // 2. 列配置允许筛选
    if (!column.filterable) return false;

    return true;
  };

  if (!shouldShowFilter()) {
    return null;
  }

  return (
    <TableColumnFilter
      action={action}
      column={column}
      onChange={(e, value) => {
        // 当筛选值变化时，触发 onClick 事件
        onClick?.(e, value);
      }}
    />
  );
};

/**
 * 筛选插件定义
 */
export const FilterPlugin: TablePlugin = {
  id: 'column-filter',
  name: 'column-filter-plugin',
  type: 'action',
  positionType: 'column',
  version: '1.0.0',
  description: 'Column header filter plugin',
  messages: getTablePluginMessages('filter'),

  defaultState: {
    filterState: {},
  } as FilterPluginState,

  actions: [
    {
      key: 'table-column-filter',
      label: 'plugin.filter.title',
      icon: 'filter',
      tooltip: 'plugin.filter.tooltip',
      position: [TablePluginContributionPoint.COLUMN_HEADER],
      priority: 20, // 排序后面
      group: 'filter',
      type: 'table-column-filter',
      isPluginAction: true,
      messages: getTablePluginMessages('filter'),
      variant: 'ghost',
      interaction: {
        type: 'menu',
        menu: {
          placement: 'bottomRight',
        },
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },

      // 显示条件：只判断表格配置（初始化时拿不到column）
      when: (column, context) => {
        const tableConfig = context?.state?.config;
        return !!tableConfig?.filterable;
      },

      // 点击事件处理
      execute: async (column, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        try {
          // 检查列是否允许筛选
          if (!column?.filterable) return;

          // 获取表格逻辑实例
          const tableLogic = context?.tableContext?.tableLogic;
          if (!tableLogic) return;

          // 获取当前筛选状态
          const filterState = context?.tableContext?.state?.filterState;
          const currentFilter = filterState?.[column.name];

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-column-filter',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: {
                  columnName: column.name,
                  columnTitle: column.title,
                  currentFilter: currentFilter,
                  action: 'filter-change',
                },
                result: { success: true, data: filterState },
              },
              context.tableContext,
              action || ({} as ActionConfig),
            );
          }
        } catch (error) {
          console.error(processMessage('plugin.filter.failed', tableMessages, { error: String(error) }), error);

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-column-filter',
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

      // 自定义渲染：使用 TableColumnFilter 组件，在这里判断列配置
      render: (column, context, action) => {
        // 在render时再次检查列配置
        if (!column?.filterable) {
          return null;
        }

        const handleClick = (event?: React.MouseEvent, value?: FilterValue | undefined) => {
          // 直接调用插件的pluginExecute方法，实现统一的事件处理
          if (action?.pluginExecute) {
            action?.pluginExecute(column, context, action);
          }
        };

        return React.createElement(FilterButton, {
          column,
          context,
          action,
          onClick: handleClick,
        });
      },
    },
  ] as TablePluginColumnAction[],

  init: (context: TablePluginContext) => {
    // 初始化筛选状态
    if (!context.state?.filterState && context.updateState) {
      context.updateState({
        filterState: {},
      });
    }
  },

  destroy: (context: TablePluginContext) => {
    // 清理筛选状态
    if (context.updateState) {
      context.updateState({
        filterState: {},
      });
    }
  },
};

export default FilterPlugin;
