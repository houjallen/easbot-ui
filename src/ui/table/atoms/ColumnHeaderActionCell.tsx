/**
 * 列头操作单元格组件
 * 支持普通列操作和插件列操作的统一渲染，参考RowActionCell组件设计
 */

import { Button } from '../../button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../dropdown-menu';
import { Icon } from '../../icon';
import type { IconVariant } from '../../icon';
import { IconButton } from '../../icon/icon-button';
import { useTableConfig, useTableContext, useTableLogic } from '../context/TableContext';
import type { TableContextValue } from '../context/TableContext';
import type { ColumnActionConfig, TableColumnActionConfig } from '../types/base';
import type { TableColumn, TableSize } from '../types/base';
import { processUiMessage } from '../../../utils/ui-message';
import { tableMessages } from '../../../utils/component-messages';
import { cn } from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';
import { isEmpty } from '../../../utils/object';
import React, { useMemo, useCallback } from 'react';

/**
 * 扩展的列头操作配置，包含插件标记
 */
interface ExtendedColumnHeaderActionConfig extends TableColumnActionConfig {
  /** 是否为插件动作 */
  isPluginAction?: boolean;
  /** 插件ID */
  pluginId?: string;
  /** 插件渲染函数 */
  pluginRender?: (column: TableColumn, context: any, action: ExtendedColumnHeaderActionConfig) => React.ReactNode;
  /** 插件点击回调 */
  pluginExecute?: (column: TableColumn, context: any, action: ExtendedColumnHeaderActionConfig) => void;
}

/**
 * 列头操作配置
 */
export interface ColumnHeaderActionConfig extends ColumnActionConfig {
  /** 最大显示的动作数量，超出部分显示在更多菜单中 */
  maxVisible?: number;
  /** 动作列表 */
  actions?: ExtendedColumnHeaderActionConfig[];
}

/**
 * 列头操作单元格属性
 */
export interface ColumnHeaderActionCellProps {
  /** 当前列配置 */
  column: TableColumn;
  /** 列头操作配置 */
  config?: ColumnHeaderActionConfig;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 列头操作单元格组件
 */
export const ColumnHeaderActionCell: React.FC<ColumnHeaderActionCellProps> = ({ column, config = {}, className }) => {
  const tableContext = useTableContext();
  const tableConfig = useTableConfig();
  const columnHeaderActionConfig = deepMerge(tableConfig?.columnHeaderAction || {}, config);
  // 尺寸缺省回退 'sm'（size 是 TableSize 字符串联合类型，不是数值）
  const size: TableSize = columnHeaderActionConfig.size || 'sm';
  const showLabel = columnHeaderActionConfig.showLabel || false;
  const tableLogic = useTableLogic();

  // 获取插件系统
  const pluginSystem = tableLogic.plugin;

  // 获取插件提供的列头操作
  const pluginActions = useMemo(() => {
    if (!pluginSystem) return [];

    // 获取所有列头级插件动作
    const allColumnHeaderActions = pluginSystem.getAllActions?.() || [];

    return allColumnHeaderActions
      .filter((render) => {
        // 过滤出列头级动作
        return render.position?.some((pos) => typeof pos === 'string' && pos.startsWith('column.header'));
      })
      .map((render): ExtendedColumnHeaderActionConfig => {
        return {
          ...render,
          key: `plugin-${render.key}`,
          priority: render.priority || 100,
          showInMore: false,
          showLabel: false,
          size: size,
          isPluginAction: true,
          pluginRender: render.render,
          pluginExecute: render.execute,
          pluginId: (render as any).pluginId || render.key,
        } as ExtendedColumnHeaderActionConfig;
      });
  }, [pluginSystem, size]);

  // 合并所有动作（普通action + 插件action）
  const allActions = useMemo(() => {
    const configActions = columnHeaderActionConfig?.actions || [];

    const normalActions = configActions.map((action) => ({
      ...action,
      isPluginAction: false,
      showLabel: false,
      size: size,
    }));

    return [...normalActions, ...pluginActions].sort((a, b) => (a.priority || 100) - (b.priority || 100));
  }, [columnHeaderActionConfig?.actions, pluginActions, size]);

  // 过滤可见的动作
  const visibleActions = useMemo(() => {
    return allActions.filter((action) => {
      if (typeof action.visible === 'function') {
        return action.visible(column, tableContext, action);
      }
      if (typeof action.when === 'function') {
        return action.when(column, tableContext, action);
      }
      return action.visible !== false;
    });
  }, [allActions, column, tableContext]);

  // 分离显示在列头和更多菜单中的动作
  const { displayActions, moreActions } = useMemo(() => {
    const maxVisible = columnHeaderActionConfig?.maxVisible || 3;

    const inlineActions = visibleActions.filter((action) => !action.showInMore);
    const moreMenuActions = visibleActions.filter((action) => action.showInMore);

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
  }, [visibleActions, columnHeaderActionConfig?.maxVisible]);

  // 如果没有任何操作，返回空
  if (allActions.length === 0) return null;

  return (
    <div className={cn('eas-table-column-header-actions flex items-center gap-1', className)}>
      {/* 直接显示的动作 */}
      {displayActions.map((action) => (
        <ActionButton key={action.key} action={action} column={column} context={tableContext} size={size} />
      ))}

      {/* 更多菜单 */}
      {moreActions.length > 0 && <MoreMenu actions={moreActions} column={column} context={tableContext} size={size} />}
    </div>
  );
};

/**
 * 动作按钮组件
 */
const ActionButton: React.FC<{
  action: ExtendedColumnHeaderActionConfig;
  column: TableColumn;
  context: TableContextValue;
  size?: TableSize;
}> = ({ action, column, context, size = 'sm' }) => {
  const tableConfig = context.state.config;
  const tableLogic = context.tableLogic;
  const variant = action.variant ?? 'default';
  const currentLocale = context.getLocale();

  const isDisabled = useMemo(() => {
    if (typeof action.disabled === 'function') {
      return action.disabled(column, context, action);
    }
    return action.disabled;
  }, [action, column, context]);

  // 处理动态 icon 和 label
  const renderIcon = useMemo(() => {
    if (!action.icon) return null;
    if (typeof action.icon === 'function') {
      return action.icon(column, context, action);
    }
    // 如果是字符串，使用Icon组件
    if (typeof action.icon === 'string') {
      return <Icon name={action.icon} size={16} />;
    }
    return action.icon;
  }, [action.icon, column, context, action]);

  const renderLabel = useMemo(() => {
    if (!action.label) return null;
    if (typeof action.label === 'function') {
      return action.label(column, context, action);
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
  }, [action.label, column, context, action, currentLocale]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (isDisabled) return;

      // 如果是插件action，使用插件的onClick和特殊context
      if (action.isPluginAction && action.pluginExecute) {
        const pluginContext = {
          pluginId: action.pluginId,
          tableContext: context,
          state: tableLogic.plugin?.getPluginState?.(action.pluginId as string),
          updateState: (newState: any) => tableLogic.plugin?.updatePluginState?.(action.pluginId as string, newState),
        };
        action.pluginExecute(column, pluginContext, action);
      } else if (action.execute) {
        action.execute(column, context, action);
      }
    },
    [action, column, context, isDisabled, tableLogic],
  );

  // 如果是插件action且有自定义渲染
  if (action.isPluginAction && action.pluginRender) {
    const pluginContext = {
      pluginId: action.pluginId,
      tableContext: context,
      state: tableLogic.plugin?.getPluginState?.(action.pluginId as string),
      updateState: (newState: any) => tableLogic.plugin?.updatePluginState?.(action.pluginId as string, newState),
      processMessage: (key: string, params?: Record<string, any>): string => {
        const messages = action.messages;
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
    return action.pluginRender(column, pluginContext, action);
  }

  // 获取tooltip文本
  const getTooltip = () => {
    return action.tooltip || (typeof renderLabel === 'string' ? renderLabel : '');
  };

  return action.render ? (
    action.render(column, context, action)
  ) : (
    <IconButton size={20} shape="circle" variant={variant as IconVariant} disabled={isDisabled} className="shrink-0" onClick={handleClick} title={getTooltip()} aria-label={getTooltip() || undefined}>
      {renderIcon}
    </IconButton>
  );
};

/**
 * 更多菜单组件
 */
const MoreMenu: React.FC<{
  actions: ExtendedColumnHeaderActionConfig[];
  column: TableColumn;
  context: TableContextValue;
  size?: TableSize;
}> = ({ actions: visibleActions, column, context, size = 'sm' }) => {
  const tableConfig = context.state.config;
  const tableLogic = context.tableLogic;

  const currentLocale = context.getLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon="more-horizontal" size={20} className="shrink-0" aria-label={processUiMessage('moreActions', { locale: currentLocale, messages: tableMessages, fallbackLocale: 'zh-CN' })} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="eas-table-column-header-action-moremenu">
        {visibleActions.map((action, index) => {
          const isDisabled = typeof action.disabled === 'function' ? action.disabled(column, context, action) : action.disabled;

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
                updateState: (newState?: Record<string, any>) => {
                  tableLogic.plugin?.updatePluginState?.(action.pluginId as string, newState);
                },
              };
              action.pluginExecute(column, pluginContext, action);
            } else if (action.execute) {
              action.execute(column, context, action);
            }
          };

          // 处理动态 icon 和 label
          const renderIcon = () => {
            if (!action.icon) return null;
            if (typeof action.icon === 'function') {
              return action.icon(column, context, action);
            }
            // 如果是字符串，使用Icon组件
            if (typeof action.icon === 'string') {
              return <Icon name={action.icon} size={14} />;
            }
            return action.icon;
          };

          const renderLabel = () => {
            if (typeof action.label === 'function') {
              return action.label(column, context, action);
            }

            // 如果是插件action，需要进行i18n处理
            if (!isEmpty(action.messages) && typeof action.label === 'string') {
              return processUiMessage(action.label, {
                locale: currentLocale,
                messages: action.messages,
                fallbackLocale: 'zh-CN',
              });
            }

            return action.label;
          };

          // 如果是插件action且有自定义渲染
          if (action.isPluginAction && action.pluginRender) {
            const pluginContext = {
              pluginId: action.pluginId,
              tableContext: context,
              state: tableLogic.plugin?.getPluginState?.(action.pluginId as string),
              updateState: (newState?: Record<string, any>) => {
                // 插件状态更新逻辑
              },
              processMessage: (key: string, params?: Record<string, any>): string => {
                const messages = action.messages;
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
                <DropdownMenuItem className="p-0" asChild>
                  {action?.pluginRender(column, pluginContext, action)}
                </DropdownMenuItem>
                {index < visibleActions.length - 1 && (action.group || 'default') !== (visibleActions[index + 1]?.group || 'default') && <DropdownMenuSeparator />}
              </React.Fragment>
            );
          }

          // 普通菜单项
          return (
            <React.Fragment key={action.key}>
              {action.render ? (
                <DropdownMenuItem className="p-0" asChild>
                  {action.render(column, context, action)}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="p-0" asChild>
                  <Button
                    variant="ghost"
                    size={action?.size || 'sm'}
                    disabled={isDisabled}
                    className="w-full shrink-0 cursor-pointer justify-start"
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
