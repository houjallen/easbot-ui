/**
 * 表格行右键菜单组件
 * 独立的右键菜单实现，支持普通操作和插件操作
 */

import { Button } from '../../button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '../../context-menu';
import { Icon } from '../../icon';
import { useTableConfig, useTableContext } from '../context/TableContext';
import type { TableContextValue } from '../context/TableContext';
import type { ContextMenuActionConfig } from '../types/base';
import type { ActionConfig, ContextMenuConfig, TableSize } from '../types/base';
import type { TablePluginContext } from '../types/hooks';
import { processUiMessage } from '../../../utils/ui-message';
import type { UiMessages } from '../../../utils/ui-message';
import { tableMessages } from '../../../utils/component-messages';
import { cn } from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';
import { isEmpty } from '../../../utils/object';
import React, { useMemo, useCallback, useState, useRef } from 'react';
import type { TableColumn } from '../types';

/**
 * 右键菜单属性
 */
export interface RowContextMenuProps {
  /** 当前行记录 */
  record: Record<string, any>;
  /** 行索引 */
  rowIndex: number;
  /** 右键菜单配置 */
  config?: ContextMenuConfig;
  /** 子组件 - 通常是表格行 */
  children: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 扩展的右键菜单操作配置（包含插件相关属性）
 */
interface ExtendedContextMenuActionConfig extends ContextMenuActionConfig {
  pluginRender?: (
    record?: Record<string, any>,
    context?: TablePluginContext,
    action?: ActionConfig,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => void | Promise<void>;
  pluginExecute?: (
    record?: Record<string, any>,
    context?: TablePluginContext,
    action?: ActionConfig,
    // 如果cell操作，则提供列信息
    column?: TableColumn,
  ) => void | Promise<void>;
  pluginId?: string;
}

/**
 * 右键菜单项组件
 */
const ContextMenuItemComponent: React.FC<{
  action: ExtendedContextMenuActionConfig;
  record: Record<string, any>;
  rowIndex: number;
  context: TableContextValue;
  config?: ContextMenuConfig;
  size?: TableSize;
  className?: string;
  column?: TableColumn;
}> = ({ action, record, context, config, size = 'sm', className, column }) => {
  const tableConfig = context.state.config;
  const tableLogic = context.tableLogic;
  const currentLocale = context.getLocale();
  const isDisabled = useMemo(() => {
    if (typeof action.disabled === 'function') {
      return action.disabled(record, context, action, column);
    }
    return action.disabled;
  }, [action.disabled, record, context, action, column]);

  const isVisible = useMemo(() => {
    if (typeof action.visible === 'function') {
      return action.visible(record, context, action, column);
    }
    if (typeof action.when === 'function') {
      return action.when(record, context, action, column);
    }
    return action.visible !== false;
  }, [action.visible, action.when, record, context, column, action]);

  // 处理动态 icon 和 label
  const renderIcon = useMemo(() => {
    if (!action.icon || !config?.showIcon) return null;
    if (typeof action.icon === 'function') {
      return action.icon(record, context, action);
    }
    // 如果是字符串，使用Icon组件
    if (typeof action.icon === 'string') {
      return <Icon name={action.icon} size={14} />;
    }
    return action.icon;
  }, [action.icon, record, context, action, config?.showIcon]);

  const renderLabel = useMemo(() => {
    if (!action.label) return null;
    if (typeof action.label === 'function') {
      return action.label(record, context, action);
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
  }, [action.label, record, context, action, currentLocale]);

  // 点击处理
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

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
        action.pluginExecute(record, pluginContext, action, column);
      } else if (action.execute) {
        // 普通action使用原始context，传递列信息
        action.execute(record, context, action, column);
      }
    },
    [action, record, context, tableLogic, isDisabled, currentLocale, column],
  );

  if (!isVisible) return null;

  // 如果有自定义渲染函数
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
      return (
        <ContextMenuItem disabled={isDisabled} className={cn('eas-table-context-menu-item cursor-pointer', className)} asChild>
          {action.pluginRender(record, pluginContext, action, column) as React.ReactNode}
        </ContextMenuItem>
      );
    } else if (action.render) {
      // 普通action使用原始context
      return (
        <ContextMenuItem disabled={isDisabled} className={cn('eas-table-context-menu-item cursor-pointer', className)} asChild>
          {action.render(record, context, action, column)}
        </ContextMenuItem>
      );
    }
  }

  // 默认菜单项渲染 - 统一使用button样式
  return (
    <ContextMenuItem disabled={isDisabled} className={cn('eas-table-context-menu-item cursor-pointer', className, isDisabled && 'cursor-not-allowed opacity-50')} asChild>
      <Button
        variant="ghost"
        size={size}
        disabled={isDisabled}
        className="shrink-0"
        leftIcon={renderIcon}
        title={action.tooltip}
        onClick={(e) => {
          handleClick(e);
        }}
      >
        {renderLabel}
      </Button>
    </ContextMenuItem>
  );
};

/**
 * 表格行右键菜单组件
 */
export const RowContextMenu: React.FC<RowContextMenuProps> = ({ config = {}, record, rowIndex, children, className }) => {
  const tableContext = useTableContext();
  const tableConfig = useTableConfig();
  const finalConfig = deepMerge(tableConfig.contextMenu || {}, config);
  // 尺寸缺省回退 'sm'（size 是 TableSize 字符串联合类型，不是数值）
  const size: TableSize = finalConfig.size || 'sm';

  // 状态管理
  const [currentColumn, setCurrentColumn] = useState<TableColumn | undefined>(undefined);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 获取插件操作
  const pluginActions = useMemo(() => {
    if (!tableContext.tableLogic.plugin) return [];

    const contextMenuActions = tableContext.tableLogic.plugin.getRendersByPosition(['row.contextMenu', 'cell.contextMenu']) || [];

    return contextMenuActions.map(
      (render) =>
        ({
          ...render,
          key: `plugin-${render.key}`,
          priority: render.priority || 100,
          // 标记这是插件action
          isPluginAction: true,
          showInMore: true,
          showLabel: false,
          size: size,
          // 保存原始的插件render和onClick
          pluginRender: render.render,
          pluginExecute: render.execute,
          pluginId: (render as any).pluginId || render.key,
        }) as ExtendedContextMenuActionConfig,
    );
  }, [tableContext.tableLogic.plugin, size]);

  // 获取所有可用的右键菜单操作（包括插件操作）
  const allActions = useMemo(() => {
    // 获取配置中的操作
    const configActions = finalConfig?.actions || [];

    // 为普通action添加isPluginAction: false标记
    const normalActions = configActions.map((action) => ({
      ...action,
      isPluginAction: false,
      showInMore: true,
      showLabel: false,
      size: size,
    }));

    return [...normalActions, ...pluginActions].sort((a, b) => (a.priority || 100) - (b.priority || 100));
  }, [finalConfig?.actions, pluginActions, size]);

  // 过滤可见的操作
  const visibleActions = useMemo(() => {
    return allActions.filter((action) => {
      if (typeof action.visible === 'function') {
        return action.visible(record, tableContext, action, currentColumn);
      }
      if (typeof action.when === 'function') {
        return action.when(record as Record<string, any>, tableContext, action, currentColumn);
      }
      return action.visible !== false;
    });
  }, [allActions, record, tableContext, currentColumn]);

  // 按组分组操作
  const groupedActions = useMemo(() => {
    const groups: Record<string, ExtendedContextMenuActionConfig[]> = {};
    visibleActions.forEach((action) => {
      const group = action.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(action as ExtendedContextMenuActionConfig);
    });
    return groups;
  }, [visibleActions]);

  const getColumnFromEvent = useCallback(
    (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const cell = target.closest('td[data-column-name]');
        if (cell) {
          const columnName = cell.getAttribute('data-column-name');
          if (columnName) {
            const columns = tableContext.state.columns || [];
            return columns.find((col) => col.name === columnName);
          }
        }
      } catch (error) {
        console.warn(processUiMessage('contextMenuColumnResolveFailed', { locale: tableContext.getLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
      }
      return undefined;
    },
    [tableContext.state.columns, tableContext],
  );

  // 存储最新的列信息引用，避免状态更新延迟问题
  const latestColumnRef = useRef<TableColumn | undefined>(undefined);

  // 处理菜单打开前的回调
  const handleBeforeOpen = useCallback(async () => {
    if (finalConfig?.onBeforeOpen) {
      const result = await finalConfig.onBeforeOpen(record, tableContext, latestColumnRef.current);
      if (result === false) {
        return false;
      }
    }
    return true;
  }, [finalConfig?.onBeforeOpen, record, tableContext]);

  // 处理菜单关闭后的回调
  const handleAfterClose = useCallback(() => {
    if (finalConfig?.onAfterClose) {
      // 使用 ref 中的最新值，确保获取到正确的列信息
      finalConfig.onAfterClose(record, tableContext, latestColumnRef.current);
    }
  }, [finalConfig?.onAfterClose, record, tableContext]);

  // 处理右键菜单事件
  const handleContextMenuEvent = useCallback(
    (e: React.MouseEvent) => {
      const column = getColumnFromEvent(e.nativeEvent);
      setCurrentColumn(column);
      latestColumnRef.current = column;

      console.debug('右键菜单触发, row', rowIndex, 'column', column?.name);
    },
    [getColumnFromEvent, rowIndex],
  );

  // 处理菜单状态变化
  const handleMenuOpenChange = useCallback(
    async (open: boolean) => {
      if (open) {
        // 菜单打开时调用beforeOpen回调
        const result = await handleBeforeOpen();
        if (result === false) {
          // 如果返回false，需要关闭菜单
          // 由于ContextMenu不支持controlled模式，这里发送ESC事件关闭
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          return;
        }
      } else {
        // 菜单关闭时调用afterClose回调
        handleAfterClose();
      }
    },
    [handleBeforeOpen, handleAfterClose],
  );

  const menuSizeClass = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'min-w-32'; // 128px
      case 'md':
        return 'min-w-48'; // 192px
      case 'lg':
        return 'min-w-64'; // 256px
      default:
        return 'min-w-48'; // 默认中等尺寸
    }
  }, [size]);

  if (!tableConfig?.contextMenuable) {
    return <>{children}</>;
  }

  if (visibleActions.length === 0) {
    return <>{children}</>;
  }

  if (finalConfig?.render) {
    return (
      <ContextMenu onOpenChange={handleMenuOpenChange}>
        <ContextMenuTrigger asChild onContextMenu={handleContextMenuEvent}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent ref={contextMenuRef} className={cn('eas-table-context-menu', menuSizeClass, className)} style={{ zIndex: 'var(--eas-z-index-context-menu)' }}>
          {finalConfig?.render(record, tableContext, undefined, currentColumn)}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  const groupNames = Object.keys(groupedActions);

  return (
    <ContextMenu onOpenChange={handleMenuOpenChange}>
      <ContextMenuTrigger asChild onContextMenu={handleContextMenuEvent}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent ref={contextMenuRef} className={cn('eas-table-context-menu', menuSizeClass, className)} style={{ zIndex: 'var(--eas-z-index-context-menu)' }}>
        {groupNames.map((groupName, groupIndex) => (
          <React.Fragment key={groupName}>
            {(groupedActions[groupName] ?? []).map((action) => (
              <ContextMenuItemComponent key={action.key} action={action} record={record} rowIndex={rowIndex} context={tableContext} config={finalConfig} size={size} column={currentColumn} />
            ))}
            {/* 在组之间添加分隔线 */}
            {finalConfig?.showSeparator && groupIndex < groupNames.length - 1 && <ContextMenuSeparator />}
          </React.Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};
