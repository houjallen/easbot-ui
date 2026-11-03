/**
 * 表格工具栏组件
 * 支持左侧自定义动作和右侧内置动作，支持溢出菜单
 */

import { Button } from '../../button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../dropdown-menu';
import { Icon } from '../../icon';
import { useTableLogic } from '../context/TableContext';
import { useTableConfig, useTableContext } from '../context/TableContext';
import type { TableContextValue } from '../context/TableContext';
import type { ToolbarActionConfig } from '../types/base';
import type { TableSize, ToolbarConfig } from '../types/base';
import { TablePluginContributionPoint } from '../types/hooks';
import { TooltipProvider } from '../../tooltip';
import { processUiMessage } from '../../../utils/ui-message';
import type { UiMessages } from '../../../utils/ui-message';
import { cn } from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';
import { isEmpty } from '../../../utils/object';
import React, { useMemo, useCallback } from 'react';

/**
 * 工具栏属性/
 */
export interface ToolbarProps {
  /** 工具栏配置 */
  config?: ToolbarConfig;
  /** 自定义样式类名 */
  className?: string;
  /** 额外的左侧动作 */
  extraLeftActions?: ToolbarActionConfig[];
  /** 额外的右侧动作 */
  extraRightActions?: ToolbarActionConfig[];
}

/**
 * 扩展的工具栏动作配置（包含插件相关属性）
 */
interface ExtendedToolbarActionConfig extends ToolbarActionConfig {
  pluginRender?: (record?: unknown, context?: unknown, action?: ToolbarActionConfig) => React.ReactNode;
  pluginExecute?: (record?: unknown, context?: unknown, action?: ToolbarActionConfig) => void;
  pluginId?: string;
}

/**
 * 动作按钮组件
 */
const ActionButton: React.FC<{
  action: ExtendedToolbarActionConfig;
  selectedRows: Record<string, any>[];
  context: TableContextValue;
  size?: TableSize;
}> = ({ action, selectedRows, context, size = 'sm' }) => {
  const tableConfig = context.state.config;
  const tableLogic = context.tableLogic;
  const showLabel = action?.showInMore || action?.showLabel;

  const isDisabled = useMemo(() => {
    if (typeof action.disabled === 'function') {
      return action.disabled(selectedRows, context, action);
    }
    return action.disabled;
  }, [action.disabled, selectedRows, context, action]);

  const isVisible = useMemo(() => {
    if (typeof action.visible === 'function') {
      return action.visible(selectedRows, context, action);
    }
    return action.visible !== false;
  }, [action.visible, selectedRows, context, action]);

  const currentLocale = context.getLocale();

  // 处理动态 icon 和 label
  const renderIcon = useMemo(() => {
    if (!action.icon) return null;
    if (typeof action.icon === 'function') {
      return action.icon(selectedRows, context, action);
    }
    // 如果是字符串，使用Icon组件
    if (typeof action.icon === 'string') {
      return <Icon name={action.icon} size={16} />;
    }
    return action.icon;
  }, [action.icon, selectedRows, context, action]);

  const renderLabel = useMemo(() => {
    if (!action.label) return null;
    if (typeof action.label === 'function') {
      return action.label(selectedRows, context, action);
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
  }, [action.label, selectedRows, context, action, currentLocale]);

  // 没有render方法时，使用默认的Button生成逻辑
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
        action.pluginExecute(selectedRows, pluginContext, action);
      } else if (action.execute) {
        // 普通action使用原始context
        action.execute(selectedRows, context, action);
      }
    },
    [action, selectedRows, context, isDisabled, tableLogic.plugin?.updatePluginState, tableLogic.plugin?.getPluginState, currentLocale],
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
      return action.pluginRender(selectedRows, pluginContext, action);
    } else if (action.render) {
      // 普通action使用原始context
      return action.render(selectedRows, context, action);
    }
  }

  const buttonContent = (
    <Button
      variant={showLabel ? 'outline' : 'ghost'}
      size={showLabel ? size : 'icon'}
      disabled={isDisabled}
      title={action.tooltip}
      onClick={(e) => {
        handleClick(e);
      }}
      className={cn('shrink-0 p-1', action.className)}
      leftIcon={renderIcon}
    >
      {showLabel && renderLabel && <>{renderLabel}</>}
    </Button>
  );

  return buttonContent;
};

/**
 * 更多菜单组件
 */
const MoreMenu: React.FC<{
  actions: ExtendedToolbarActionConfig[];
  selectedRows: Record<string, any>[];
  context: TableContextValue;
  /** 表格尺寸 */
  size?: TableSize;
}> = ({ actions, selectedRows, context, size = 'md' }) => {
  const tableLogic = context.tableLogic;
  const currentLocale = context.getLocale();

  const visibleActions = useMemo(() => {
    return actions.filter((action) => {
      if (typeof action.visible === 'function') {
        return action.visible(selectedRows, context, action);
      }
      return action.visible !== false;
    });
  }, [actions, selectedRows, context]);

  if (visibleActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 p-1" rightIcon={<Icon name="more-vertical" size={16} />} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="eas-table-toolbar-right-moremenu">
        {visibleActions.map((action, index) => {
          const isDisabled = typeof action.disabled === 'function' ? action.disabled(selectedRows, context, action) : action.disabled;

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
              action.pluginExecute(selectedRows, pluginContext, action);
            } else if (action.execute) {
              // 普通action使用原始context
              action.execute(selectedRows, context, action);
            }
          };

          // 处理动态 icon 和 label
          const renderIcon = () => {
            if (!action.icon) return null;
            if (typeof action.icon === 'function') {
              return action.icon(selectedRows, context, action);
            }
            // 如果是字符串，使用Icon组件
            if (typeof action.icon === 'string') {
              return <Icon name={action.icon} size={16} />;
            }
            return action.icon;
          };

          const renderLabel = () => {
            if (typeof action.label === 'function') {
              return action.label(selectedRows, context, action);
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
                  {action?.pluginRender(selectedRows, pluginContext, action)}
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
                  action.render(selectedRows, context, action)
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild className="p-0">
                  <Button
                    variant="ghost"
                    size={size}
                    disabled={isDisabled}
                    className="shrink-0 cursor-pointer"
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
              {index < visibleActions.length - 1 && (action.group || 'default') !== (visibleActions[index + 1]?.group || 'default') && <DropdownMenuSeparator />}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * 工具栏组件
 */
export const Toolbar: React.FC<ToolbarProps> = ({ config, className, extraLeftActions = [], extraRightActions = [] }) => {
  const tableContext = useTableContext();
  const tableConfig = useTableConfig();
  const finalConfig = deepMerge(tableConfig.toolbar || {}, config);
  const selectedRows = tableContext.getSelectedRows();
  const tableLogic = useTableLogic();
  // 获取插件系统
  const pluginSystem = tableLogic.plugin;

  const { show = true, left: leftActions = [], right: rightActions = [], maxVisible: maxRightActions = 2, size = tableConfig.size ?? 'sm' } = finalConfig;

  // 获取插件提供的工具栏动作
  const pluginActions = useMemo(() => {
    // 获取所有工具栏相关的插件动作，使用 Set 去重
    const actionSet = new Set<string>();
    const allToolbarActions: any[] = [];

    // 获取各个位置的插件动作
    const positions = [TablePluginContributionPoint.TOOLBAR_LEFT, TablePluginContributionPoint.TOOLBAR_RIGHT, TablePluginContributionPoint.TOOLBAR];
    const tActions = pluginSystem.getRendersByPosition(positions as any);
    tActions.forEach((action) => {
      // 使用 action.key + pluginId 作为唯一标识
      const uniqueKey = `${action.key}-${(action as any).pluginId}`;
      if (!actionSet.has(uniqueKey)) {
        actionSet.add(uniqueKey);
        allToolbarActions.push(action);
      }
    });

    return allToolbarActions.map((render): ExtendedToolbarActionConfig => {
      // 根据插件动作的位置数组确定在工具栏中的显示位置
      // 插件的position是TablePluginPosition[]，需要转换为工具栏位置
      let displayPosition: (TablePluginContributionPoint.TOOLBAR_LEFT | TablePluginContributionPoint.TOOLBAR_RIGHT)[] = []; // 默认右侧

      // 优先级：toolbar.left > toolbar.right > toolbar（通用）
      const pluginPositions = (render.position as string[]) || [];
      if (pluginPositions && Array.isArray(pluginPositions)) {
        if (pluginPositions.includes(TablePluginContributionPoint.TOOLBAR_LEFT)) {
          displayPosition = [TablePluginContributionPoint.TOOLBAR_LEFT];
        } else if (pluginPositions.includes(TablePluginContributionPoint.TOOLBAR_RIGHT)) {
          displayPosition = [TablePluginContributionPoint.TOOLBAR_RIGHT];
        } else if (pluginPositions.includes(TablePluginContributionPoint.TOOLBAR)) {
          // 通用工具栏位置，默认右侧
          displayPosition = [TablePluginContributionPoint.TOOLBAR_RIGHT];
        }
      }

      return {
        ...render,
        key: `plugin-${render.key}`,
        position: displayPosition, // 转换为工具栏的单一位置
        priority: render.priority || 100,
        size: size,
        showInMore: false, // 插件动作默认不放在更多菜单中
        showLabel: displayPosition.includes(TablePluginContributionPoint.TOOLBAR_LEFT),
        // 标记这是插件action
        isPluginAction: true,
        // 保存原始的插件render和onClick
        pluginRender: render.render,
        pluginExecute: render.execute,
        pluginId: (render as any).pluginId || render.key,
      } as ExtendedToolbarActionConfig;
    });
  }, [pluginSystem, size]);

  // 合并左侧动作（普通action + 插件action）
  const allLeftActions = useMemo(() => {
    const pluginLeftActions = pluginActions.filter((action) => action?.position?.includes(TablePluginContributionPoint.TOOLBAR_LEFT));
    // 为普通action添加isPluginAction: false标记
    const normalLeftActions = [...leftActions, ...extraLeftActions].map((action) => ({
      ...action,
      position: [TablePluginContributionPoint.TOOLBAR_LEFT],
      isPluginAction: false,
      showLabel: true,
      size: size,
    }));
    return [...normalLeftActions, ...pluginLeftActions].sort((a, b) => (a.priority || 100) - (b.priority || 100));
  }, [leftActions, extraLeftActions, pluginActions, size]);

  // 合并右侧动作（普通action + 插件action）
  const allRightActions = useMemo(() => {
    const pluginRightActions = pluginActions.filter((action) => action.position?.includes(TablePluginContributionPoint.TOOLBAR_RIGHT));
    // 为普通action添加isPluginAction: false标记
    const normalRightActions = [...rightActions, ...extraRightActions].map((action) => ({
      ...action,
      position: [TablePluginContributionPoint.TOOLBAR_RIGHT],
      isPluginAction: false,
      showLabel: false,
      size: size,
    }));
    return [...normalRightActions, ...pluginRightActions].sort((a, b) => (a.priority || 100) - (b.priority || 100));
  }, [rightActions, extraRightActions, pluginActions, size]);

  // 分离显示在工具栏和更多菜单中的右侧动作
  const { visibleRightActions, moreActions } = useMemo(() => {
    const visible = allRightActions.filter((action) => !action.showInMore);
    const more = allRightActions.filter((action) => action.showInMore);

    // 如果显示的动作超过最大数量，将超出部分移到更多菜单
    if (visible.length > maxRightActions) {
      const overflow = visible.splice(maxRightActions);
      more.unshift(...overflow);
    }

    return {
      visibleRightActions: visible,
      moreActions: more.map((action) => {
        return {
          ...action,
          showInMore: true, // 标记为显示在更多菜单中
        };
      }),
    };
  }, [allRightActions, maxRightActions]);

  if (tableConfig.toolbarable === false || !show) return null;

  return (
    <TooltipProvider>
      <div className={cn('eas-table-toolbar-container flex w-full shrink-0 items-center justify-between gap-2 py-2', finalConfig.className, className)} style={finalConfig.style}>
        {/* 左侧动作 */}
        <div className="eas-table-toolbar-left flex items-center gap-2">
          {allLeftActions.map((action) => (
            <ActionButton key={action.key} action={action as ExtendedToolbarActionConfig} selectedRows={selectedRows} context={tableContext} size={size} />
          ))}
        </div>

        {/* 右侧动作 */}
        <div className="eas-table-toolbar-right flex items-center gap-1">
          {visibleRightActions.map((action) => (
            <ActionButton key={action.key} action={action as ExtendedToolbarActionConfig} selectedRows={selectedRows} context={tableContext} size={size} />
          ))}

          {/* 更多菜单 */}
          {moreActions.length > 0 && <MoreMenu actions={moreActions as ExtendedToolbarActionConfig[]} selectedRows={selectedRows} context={tableContext} size={size} />}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
