/**
 * 刷新插件
 * 提供表格数据刷新功能，支持手动刷新和自动刷新
 */

import type { TableContextValue } from '../index';
import { Button } from '../../button';
import { Icon } from '../../icon';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import type { PrintPluginState } from './PrintPlugin';
import React, { useCallback, useEffect } from 'react';
import type { ActionConfig, TablePlugin } from '../types';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableActionConfig } from '../types/hooks';
import type { TablePluginContext } from '../types/hooks';

/**
 * 刷新插件配置
 */
export interface RefreshPluginConfig {
  /** 是否启用刷新功能 */
  enabled?: boolean;
  /** 自动刷新间隔(秒) */
  autoRefreshInterval?: number;
  /** 是否显示刷新时间 */
  showLastRefreshTime?: boolean;
  /** 刷新时是否重置到第一页 */
  resetToFirstPage?: boolean;
  /** 刷新时是否保持筛选条件 */
  keepFilters?: boolean;
  /** 刷新时是否保持排序条件 */
  keepSorting?: boolean;
}

/**
 * 刷新插件状态接口
 */
export interface RefreshPluginState {
  /** 是否正在刷新 */
  loading: boolean;
  /** 最后刷新时间 */
  lastRefreshTime?: Date;
  /** 自动刷新定时器ID */
  autoRefreshTimer?: number;
}

/**
 * 刷新按钮组件
 */
const RefreshButton: React.FC<{
  context?: TablePluginContext;
  config?: RefreshPluginConfig;
  action?: ActionConfig;
}> = ({ context, config, action }) => {
  const processMessage = context?.processMessage || ((key: string) => key);

  const tableConfig = context?.tableContext?.state?.config || {};
  const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

  const isRefreshing = context?.state?.loading || false;
  const selectedRows = context?.tableContext?.getSelectedRows?.() || [];

  const pluginState = context?.state as RefreshPluginState;
  const lastRefreshTime = pluginState?.lastRefreshTime;

  // 默认配置：保持当前页码，这是最符合用户预期的行为
  const defaultConfig: RefreshPluginConfig = {
    resetToFirstPage: false, // 默认不重置到第一页
    keepFilters: true, // 保持筛选条件
    keepSorting: true, // 保持排序条件
    ...config,
  };

  // 格式化刷新时间显示
  const formatRefreshTime = useCallback(
    (time?: Date) => {
      if (!time) return '';

      const now = new Date();
      const diff = now.getTime() - time.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);

      if (minutes < 1) {
        return processMessage('plugin.refresh.refreshedJustNow', tableMessages);
      } else if (minutes < 60) {
        return processMessage('plugin.refresh.refreshedMinutesAgo', tableMessages, {
          minutes,
        });
      } else {
        return processMessage('plugin.refresh.refreshedHoursAgo', tableMessages, {
          hours,
        });
      }
    },
    [processMessage],
  );

  useEffect(() => {
    if (isRefreshing === true) {
      // 更新最后刷新时间
      context?.updateState?.({
        loading: context?.tableContext?.state?.loading,
        lastRefreshTime: new Date(),
      });
    }
    return;
  }, [
    context?.tableContext?.state?.loading,
    isRefreshing, // 更新最后刷新时间
    context?.updateState,
  ]);
  const tooltipText = lastRefreshTime
    ? `${processMessage('plugin.refresh.refreshTooltip', tableMessages)} (${formatRefreshTime(lastRefreshTime)})`
    : processMessage('plugin.refresh.refreshTooltip', tableMessages);

  return (
    <Button
      variant="ghost"
      size={showLabel ? (action?.size ?? 'sm') : 'icon'}
      onClick={(e) => {
        if (action?.pluginExecute) {
          action?.pluginExecute(selectedRows, context, action);
        }
      }}
      disabled={isRefreshing}
      className="shrink-0 p-1"
      title={tooltipText}
      leftIcon={<Icon name="table-refresh" size={16} className={isRefreshing ? 'animate-spin' : ''} />}
    >
      {showLabel && processMessage('plugin.refresh.refresh', tableMessages)}
    </Button>
  );
};

/**
 * 刷新插件定义
 */
const RefreshPlugin: TablePlugin = {
  id: 'refresh',
  name: 'refresh',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Refresh table data', // 使用英文作为默认值，实际显示时会通过messages进行国际化
  messages: getTablePluginMessages('refresh'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-refresh',
      label: 'plugin.refresh.title',
      icon: 'table-refresh',
      position: [TablePluginContributionPoint.TOOLBAR_RIGHT],
      priority: 2,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('refresh'),
      variant: 'ghost',
      type: 'table-refresh', // 使用schema定义的标准action type
      interaction: {
        type: 'direct', // 直接执行刷新
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (selectedRows, context) => {
        return true; // 默认启用，具体配置由外部控制
      },
      execute: async (selectedRows, context, action) => {
        // 阻止事件向上传递
        event?.preventDefault?.();
        event?.stopPropagation?.();
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as PrintPluginState;
        const config = (context?.tableContext?.tableLogic?.plugin?.getPluginConfig(RefreshPlugin.id as string) as RefreshPluginConfig) || {};

        // 默认配置：保持当前页码，这是最符合用户预期的行为
        const defaultConfig: RefreshPluginConfig = {
          resetToFirstPage: false, // 默认不重置到第一页
          keepFilters: true, // 保持筛选条件
          keepSorting: true, // 保持排序条件
          ...config,
        };

        // 执行实际的刷新逻辑
        try {
          const isRefreshing = pluginState?.loading || context?.tableContext?.state?.loading || false;
          if (isRefreshing) return;

          // 更新插件状态
          context?.updateState?.({
            loading: true,
          });

          // 核心刷新逻辑：重新加载数据
          const tableContext = context?.tableContext;
          const actions = tableContext?.actions;

          if (actions) {
            await actions.reload(false, true, true); // 不重置到第一页，保持筛选和排序

            // 操作完成后，通过统一的actionEvents实例emit事件
            const actionEvents = tableContext?.tableLogic?.actionEvents;
            if (actionEvents) {
              await actionEvents.emitAction(
                'table-refresh',
                {
                  source: 'plugin',
                  timestamp: Date.now(),
                  payload: {
                    resetToFirstPage: defaultConfig.resetToFirstPage,
                    keepFilters: defaultConfig.keepFilters,
                    keepSorting: defaultConfig.keepSorting,
                  },
                  result: {
                    success: true,
                    data: { refreshTime: new Date() },
                  },
                },
                context?.tableContext as TableContextValue,
                action || ({} as ActionConfig),
              );
            }

            console.debug(processMessage('plugin.refresh.refreshSuccess', tableMessages));
          }
        } catch (error) {
          console.error(processMessage('plugin.refresh.refreshFailed', tableMessages, { error: String(error) }), error);
          context?.updateState?.({
            loading: false,
          });
        }
      },
      render: (selectedRows, context, action) => {
        return React.createElement(RefreshButton, {
          context,
          action,
          config: undefined, // 使用默认配置
          key: 'refresh-button',
        });
      },
    },
  ] as TablePluginTableActionConfig[],

  // 插件初始化
  init: (context) => {
    // 检查是否已经初始化过，避免重复初始化覆盖现有状态
    // 初始化插件状态
    const initialState: RefreshPluginState = {
      loading: false,
      lastRefreshTime: new Date(),
      autoRefreshTimer: undefined,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理自动刷新定时器
    const pluginState = context?.tableContext?.state?.pluginStates as RefreshPluginState;
    if (pluginState?.autoRefreshTimer) {
      clearInterval(pluginState.autoRefreshTimer);
    }
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default RefreshPlugin;
