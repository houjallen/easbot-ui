/**
 * 行操作单元格组件
 * 支持普通行操作和插件行操作的统一渲染，参考Toolbar组件设计
 */

import { Button } from '../../button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../dropdown-menu';
import { Icon } from '../../icon';
import { useTableLogic } from '../context/TableContext';
import { useTableConfig, useTableContext } from '../context/TableContext';
import type { TableContextValue } from '../context/TableContext';
import type { TableRowActionConfig } from '../types/base';
import type { RowActionConfig, TableSize } from '../types/base';
import { TooltipProvider } from '../../tooltip';
import { processUiMessage } from '../../../utils/ui-message';
import type { UiMessages } from '../../../utils/ui-message';
import { cn } from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';
import { isEmpty } from '../../../utils/object';
import React, { useMemo, useCallback } from 'react';

/**
 * 行操作单元格属性
 */
export interface RowActionCellProps {
  /** 当前行记录 */
  record: Record<string, any>;
  /** 行索引 */
  rowIndex: number;
  /** 行操作配置 */
  config?: RowActionConfig;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 扩展的行操作配置（包含插件相关属性）
 */
interface ExtendedRowActionConfig extends TableRowActionConfig {
  pluginRender?: (record?: unknown, context?: unknown, action?: TableRowActionConfig) => React.ReactNode;
  pluginExecute?: (record?: unknown, context?: unknown, action?: TableRowActionConfig) => void;
  pluginId?: string;
}

/**
 * 行操作按钮组件
 */
const RowActionButton: React.FC<{
  action: ExtendedRowActionConfig;
  record: Record<string, any>;
  rowIndex: number;
  context: TableContextValue;
  size?: TableSize;
  showLabel?: boolean;
}> = ({ action, record, context, size = 'sm', showLabel = false }) => {
  const tableConfig = context.state.config;
  const tableLogic = context.tableLogic;
  const currentLocale = context.getLocale();

  const isDisabled = useMemo(() => {
    if (typeof action.disabled === 'function') {
      return action.disabled(record);
    }
    return action.disabled;
  }, [action.disabled, record]);

  const isVisible = useMemo(() => {
    if (typeof action.visible === 'function') {
      return action.visible(record);
    }
    // `when` 条件回调与 `visible` 互斥生效，语义与其他操作列保持一致
    if (typeof action.when === 'function') {
      return action.when(record, context, action);
    }
    return action.visible !== false;
  }, [action.visible, action.when, record, context, action]);

  // 处理动态 icon 和 label
  const renderIcon = useMemo(() => {
    if (!action.icon) return null;
    if (typeof action.icon === 'function') {
      return action.icon(record, context, action);
    }
    // 如果是字符串，使用Icon组件
    if (typeof action.icon === 'string') {
      return <Icon name={action.icon} size={16} />;
    }
    return action.icon;
  }, [action.icon, record, context, action]);

  const renderLabel = useMemo(() => {
    if (!action.label) return null;
    if (typeof action.label === 'function') {
      return action.label(record, context, action);
    }

    // 如果action，需要进行i18n处理
    if (!isEmpty(action.messages) && typeof action.label === 'string') {
      // 直接从action中获取pluginMessages，这些在Toolbar合并时已经设置好了
      return processUiMessage(action.label, {
        locale: currentLocale,
        messages: action.messages,
        fallbackLocale: 'zh-CN',
      });
    }

    return action.label;
  }, [action.label, record, context, action, currentLocale]);

  // 点击处理
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e) {
        e?.preventDefault();
        e?.stopPropagation();
      }
      if (isDisabled) return;

      // 如果是插件action，使用插件的onClick和特殊context
      if (action.isPluginAction && action.pluginExecute) {
        const pluginContext = {
          pluginId: action.pluginId,
          tableContext: context,
          state: tableLogic.plugin?.getPluginState?.(action.pluginId as string),
          updateState: (newState: any) => tableLogic.plugin?.updatePluginState?.(action.pluginId as string, newState),
          processMessage: (key: string, messages?: UiMessages, params?: Record<string, any>) => {
            return processUiMessage(
              key,
              {
                locale: currentLocale,
                messages: messages || {},
                fallbackLocale: 'zh-CN',
              },
              params,
            );
          },
        };
        action.pluginExecute(record, pluginContext, action);
      } else if (action.execute) {
        // 普通action使用原始context
        action.execute(record, context, action);
      }
    },
    [action, record, context, tableLogic, isDisabled, currentLocale],
  );

  if (!isVisible) return null;

  // 根据action类型选择合适的render方法和context
  if (action.render || (action.isPluginAction && action.pluginRender)) {
    if (action.isPluginAction && action.pluginRender) {
      // 插件action使用特殊的插件context
      const pluginContext = {
        pluginId: action.pluginId,
        tableContext: context,
        state: tableLogic.plugin?.getPluginState?.(action.pluginId as string),
        updateState: (newState: any) => tableLogic.plugin?.updatePluginState?.(action.pluginId as string, newState),
        processMessage: (key: string, messages?: UiMessages, params?: Record<string, any>) => {
          return processUiMessage(
            key,
            {
              locale: currentLocale,
              messages: messages || {},
              fallbackLocale: 'zh-CN',
            },
            params,
          );
        },
      };
      return action.pluginRender(record, pluginContext, action);
    } else if (action.render) {
      // 普通action使用原始context
      return action.render(record, context, action);
    }
  }

  const buttonContent = (
    <Button variant="ghost" size={size} disabled={isDisabled} title={action.tooltip} onClick={handleClick} className={cn('shrink-0 p-1', action.className)} leftIcon={renderIcon}>
      {showLabel && renderLabel && <>{renderLabel}</>}
    </Button>
  );

  return buttonContent;
};

/**
 * 更多菜单组件
 */
const MoreMenu: React.FC<{
  actions: ExtendedRowActionConfig[];
  record: Record<string, any>;
  context: TableContextValue;
  size?: TableSize;
}> = ({ actions, record, context, size = 'sm' }) => {
  const tableConfig = context.state.config;
  const tableLogic = context.tableLogic;

  const currentLocale = context.getLocale();

  const visibleActions = useMemo(() => {
    return actions.filter((action) => {
      if (typeof action.visible === 'function') {
        return action.visible(record, context, action);
      }
      // `when` 条件回调与 `visible` 互斥生效，语义与其他操作列保持一致
      if (typeof action.when === 'function') {
        return action.when(record, context, action);
      }
      return action.visible !== false;
    });
  }, [actions, record, context]);

  if (visibleActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer p-1" rightIcon={<Icon name="more-vertical" size={16} />} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="eas-table-row-action-moremenu">
        {visibleActions.map((action, index) => {
          const isDisabled = typeof action.disabled === 'function' ? action.disabled(record, context, action) : action.disabled;

          // 根据action类型选择合适的onClick处理
          const handleClick = (event: React.MouseEvent) => {
            if (event) {
              event?.preventDefault();
              event?.stopPropagation();
            }
            if (isDisabled) return;

            // 如果是插件action，使用插件的onClick和特殊context
            if (action.isPluginAction && action.pluginExecute) {
              const pluginContext = {
                pluginId: action.pluginId,
                tableContext: context,
                state: tableLogic.plugin?.getPluginState?.(action.pluginId as string),
                updateState: (newState: any) => tableLogic.plugin?.updatePluginState?.(action.pluginId as string, newState),
                processMessage: (key: string, messages?: UiMessages, params?: Record<string, any>) => {
                  return processUiMessage(
                    key,
                    {
                      locale: currentLocale,
                      messages: messages || {},
                      fallbackLocale: 'zh-CN',
                    },
                    params,
                  );
                },
              };
              action.pluginExecute(record, pluginContext, action);
            } else if (action.execute) {
              // 普通action使用原始context
              action.execute(record, context, action);
            }
          };

          // 处理动态 icon 和 label
          const renderIcon = () => {
            if (!action.icon) return null;
            if (typeof action.icon === 'function') {
              return action.icon(record, context, action);
            }
            return <Icon name={action.icon} size={16} />;
          };

          const renderLabel = () => {
            if (typeof action.label === 'function') {
              return action.label(record, context, action);
            }

            // 如果是插件action，需要进行i18n处理
            if (!isEmpty(action.messages) && typeof action.label === 'string') {
              return processUiMessage(action.label, {
                locale: currentLocale,
                messages: action.messages || {},
                fallbackLocale: 'zh-CN',
              });
            }

            return action.label;
          };

          // 如果插件有自定义render函数，需要特殊处理
          if (action.isPluginAction && action.pluginRender) {
            // 其他有render函数的插件，直接渲染插件内容
            // 插件的render函数应该返回可点击的元素，onClick事件由插件内部处理
            const pluginContext = {
              pluginId: action.pluginId,
              tableContext: context,
              state: tableLogic.plugin?.getPluginState?.(action.pluginId as string),
              updateState: (newState: any) => tableLogic.plugin?.updatePluginState?.(action.pluginId as string, newState),
              processMessage: (key: string, messages?: UiMessages, params?: Record<string, any>) => {
                return processUiMessage(
                  key,
                  {
                    locale: currentLocale,
                    messages: messages || {},
                    fallbackLocale: 'zh-CN',
                  },
                  params,
                );
              },
            };
            return (
              <React.Fragment key={action.key}>
                <DropdownMenuItem asChild className="p-0">
                  {action?.pluginRender(record, pluginContext, action)}
                </DropdownMenuItem>
                {index < visibleActions.length - 1 && (action.group || 'default') !== (visibleActions[index + 1]?.group || 'default') && <DropdownMenuSeparator />}
              </React.Fragment>
            );
          }

          // 普通菜单项
          return (
            <React.Fragment key={action.key}>
              {action.render ? (
                <DropdownMenuItem asChild className="p-0">
                  {action.render(record, context, action)}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild className="p-0">
                  <Button
                    variant="ghost"
                    size={size}
                    disabled={isDisabled}
                    className="shrink-0 cursor-pointer p-1"
                    leftIcon={renderIcon()}
                    title={action.tooltip}
                    onClick={(e) => {
                      handleClick(e);
                    }}
                  >
                    {renderLabel()}
                  </Button>
                </DropdownMenuItem>
              )}
              {index < visibleActions.length - 1 && action.group !== visibleActions[index + 1]?.group && <DropdownMenuSeparator />}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * 行操作单元格组件
 */
export const RowActionCell: React.FC<RowActionCellProps> = ({ config = {}, record, rowIndex, className }) => {
  const tableContext = useTableContext();
  const tableConfig = useTableConfig();
  const finalConfig = deepMerge(tableConfig?.rowAction || {}, config);
  // 尺寸缺省回退 'sm'（size 是 TableSize 字符串联合类型，不是数值）
  const size: TableSize = finalConfig.size || 'sm';
  const showLabel = finalConfig.showLabel || false;
  const tableLogic = useTableLogic();

  // 获取插件系统
  const pluginSystem = tableLogic.plugin;

  // 获取行操作配置
  const rowActionConfig = tableConfig.rowAction;

  // 获取插件提供的行动作
  const pluginActions = useMemo(() => {
    if (!pluginSystem) return [];

    // 获取所有行动作相关的插件渲染
    const pluginRowActions = pluginSystem.getRendersByPosition('row.actions') || [];

    return pluginRowActions.map(
      (render) =>
        ({
          ...render,
          key: `plugin-${render.key}`,
          priority: render.priority || 100,
          showInMore: false, // 插件动作默认不放在更多菜单中
          showLabel: showLabel,
          size: size,
          // 标记这是插件action
          isPluginAction: true,
          // 保存原始的插件render和onClick
          pluginRender: render.render,
          pluginExecute: render.execute,
          pluginId: (render as any).pluginId || render.key,
        }) as ExtendedRowActionConfig,
    );
  }, [pluginSystem, showLabel, size]);

  // 合并所有动作（配置中的 + 插件的）
  const allActions = useMemo(() => {
    // 获取配置中的动作
    const configActions = rowActionConfig?.actions || [];

    // 为普通action添加isPluginAction: false标记
    const normalActions = configActions.map((action) => ({
      ...action,
      isPluginAction: false,
      showLabel: showLabel,
      size: size,
    }));

    return [...normalActions, ...pluginActions].sort((a, b) => (a.priority || 100) - (b.priority || 100));
  }, [rowActionConfig?.actions, pluginActions, size, showLabel]);

  // 过滤可见的动作
  const visibleActions = useMemo(() => {
    return allActions.filter((action) => {
      if (typeof action.visible === 'function') {
        return action.visible(record, tableContext, action);
      }
      // `when` 条件回调与 `visible` 互斥生效，语义与其他操作列保持一致
      if (typeof action.when === 'function') {
        return action.when(record, tableContext, action);
      }
      return action.visible !== false;
    });
  }, [allActions, record, tableContext]);

  // 分离显示在行内和更多菜单中的动作
  const { displayActions, moreActions } = useMemo(() => {
    const maxVisible = rowActionConfig?.maxVisible || 3;

    // 首先分离明确标记为showInMore的动作
    const inlineActions = visibleActions.filter((action) => !action.showInMore);
    const moreMenuActions = visibleActions.filter((action) => action.showInMore);

    // 如果内联动作超过最大显示数量，将超出部分移到更多菜单
    if (inlineActions.length > maxVisible) {
      const overflow = inlineActions.splice(maxVisible);
      moreMenuActions.unshift(...overflow);
    }

    return {
      displayActions: inlineActions,
      moreActions: moreMenuActions.map((action) => ({
        ...action,
        showInMore: true,
      })),
    };
  }, [visibleActions, rowActionConfig?.maxVisible]);

  // 如果没有任何操作，返回空
  if (allActions.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={cn('eas-table-row-action-cell flex w-full items-center justify-between', className)}>
        {/* 左侧：直接显示的操作 */}
        <div className="flex items-center gap-1">
          {displayActions.map((action) => (
            <RowActionButton key={action.key} action={action as ExtendedRowActionConfig} record={record} rowIndex={rowIndex} context={tableContext} size={size} showLabel={showLabel} />
          ))}
        </div>

        {/* 右侧：更多菜单 */}
        {moreActions.length > 0 && (
          <div className="flex items-center">
            <MoreMenu actions={moreActions as ExtendedRowActionConfig[]} record={record} context={tableContext} size={size} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RowActionCell;
