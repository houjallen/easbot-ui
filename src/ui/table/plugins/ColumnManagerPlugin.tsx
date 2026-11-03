/**
 * 列管理插件
 * 提供表格列显示/隐藏、排序等管理功能
 */

import type { TableContextValue } from '../context/TableContext';
import { Icon } from '../../icon';
import { Button } from '../../button';
import { Checkbox } from '../../checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../../dropdown-menu';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableActionConfig } from '../types/hooks';
import type { TablePluginContext } from '../types/hooks';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import React from 'react';
import type { ActionConfig, TablePlugin } from '../types';
import type { TableColumn } from '../types/base';

/**
 * 深拷贝列定义，保留 render / formatter / parser 等函数
 *
 * @description
 * 不能使用 `JSON.parse(JSON.stringify())` —— JSON 序列化会静默丢弃函数，
 * 导致「重置列」后单元格的自定义渲染、格式化、解析全部失效。
 *
 * @param columns 原始列定义
 * @returns 克隆后的列定义（函数引用保持不变）
 */
const cloneColumns = (columns: TableColumn[]): TableColumn[] => {
  return columns.map((column) => ({
    ...column,
    // options / enumConfig / listConfig / objectConfig / editConfig 为嵌套对象，需逐层浅拷贝
    options: column.options?.map((option) => ({ ...option })),
    enumConfig: column.enumConfig ? { ...column.enumConfig } : undefined,
    listConfig: column.listConfig ? { ...column.listConfig } : undefined,
    objectConfig: column.objectConfig ? { ...column.objectConfig } : undefined,
    editConfig: column.editConfig ? { ...column.editConfig } : undefined,
    dateConfig: column.dateConfig ? { ...column.dateConfig } : undefined,
  }));
};

/**
 * 列管理插件配置
 */
export interface ColumnManagerPluginConfig {
  /** 是否启用插件功能 */
  enabled?: boolean;
  /** 是否允许拖拽排序 */
  allowDragSort?: boolean;
  /** 是否允许重置列 */
  allowReset?: boolean;
  /** 默认隐藏的列 */
  defaultHiddenColumns?: string[];
}

/**
 * 列管理菜单组件
 */
const ColumnManagerMenu: React.FC<{
  context?: TablePluginContext;
  action?: ActionConfig;
  onClose?: () => void;
}> = ({ context, onClose, action }) => {
  // 使用上下文提供的消息处理方法
  const processMessage = context?.processMessage || ((key: string) => key);

  const tableContext = context?.tableContext;
  const columns = tableContext?.state?.columns || [];
  const pluginState = context?.state as ColumnManagerState;

  // 从插件状态获取原始列配置和当前可见性状态
  const originalColumns = pluginState?.originalColumns || [];
  const columnVisibility = pluginState?.columnVisibility || {};

  // 切换列显示状态
  const toggleColumn = async (columnKey: string, visible: boolean) => {
    // 直接更新表格上下文中的列配置，修改原始column的visible状态
    if (tableContext?.actions?.setColumns) {
      const updatedColumns = columns.map((col: any) => {
        if (col.name === columnKey) {
          return { ...col, visible };
        }
        return col;
      });
      tableContext.actions.setColumns(updatedColumns);

      // 更新插件状态
      const newVisibility = {
        ...columnVisibility,
        [columnKey]: visible,
      };
      context?.updateState?.({
        ...pluginState,
        columnVisibility: newVisibility,
      });

      // 操作完成后，通过统一的actionEvents实例emit事件
      const actionEvents = tableContext?.tableLogic?.actionEvents;
      if (actionEvents) {
        await actionEvents.emitAction(
          'table-columnSetting',
          {
            source: 'plugin',
            timestamp: Date.now(),
            payload: { op: 'toggle', columnKey, visible },
            result: {
              success: true,
              data: { columnCount: columns.length, visibility: newVisibility },
            },
          },
          context?.tableContext as TableContextValue,
          action || ({} as ActionConfig),
        );
      }
    }
  };

  // 全选/取消全选
  const toggleAll = async (visible: boolean) => {
    // 直接更新表格上下文中的列配置，修改原始column的visible状态
    if (tableContext?.actions?.setColumns) {
      const updatedColumns = columns.map((col: any) => ({
        ...col,
        visible,
      }));
      tableContext.actions.setColumns(updatedColumns);

      // 更新插件状态
      const newVisibility: Record<string, boolean> = {};
      columns.forEach((col: any) => {
        newVisibility[col.name] = visible;
      });
      context?.updateState?.({
        ...pluginState,
        columnVisibility: newVisibility,
      });

      // 发射事件到Action事件系统
      try {
        await tableContext?.tableLogic?.actionEvents?.emitAction(
          'table-columnSetting',
          {
            source: 'plugin',
            timestamp: Date.now(),
            payload: { op: 'toggle-all', visible },
            result: {
              success: true,
              data: { columnCount: columns.length, visibility: newVisibility },
            },
          },
          context?.tableContext as TableContextValue,
          action || ({} as ActionConfig),
        );
      } catch (error) {
        console.error(processMessage('plugin.columnManager.emitToggleAllFailed', tableMessages, { error: String(error) }), error);
        await tableContext?.tableLogic?.actionEvents?.emitAction(
          'table-columnSetting',
          {
            source: 'plugin',
            timestamp: Date.now(),
            payload: { op: 'toggle-all', visible },
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
  };

  // 重置列 - 恢复到原始状态
  const resetColumns = async () => {
    if (originalColumns.length > 0 && tableContext?.actions?.setColumns) {
      // 恢复到原始列配置（保留 render / formatter 等函数，避免重置后自定义渲染失效）
      const restoredColumns = cloneColumns(originalColumns);
      tableContext.actions.setColumns(restoredColumns);

      // 更新插件状态
      const resetVisibility = originalColumns.reduce((acc: Record<string, boolean>, col: any) => {
        acc[col.name] = col.visible !== false;
        return acc;
      }, {});
      context?.updateState?.({
        ...pluginState,
        columnVisibility: resetVisibility,
      });

      // 发射事件到Action事件系统
      try {
        await tableContext?.tableLogic?.actionEvents?.emitAction(
          'table-columnSetting',
          {
            source: 'plugin',
            timestamp: Date.now(),
            payload: { op: 'reset' },
            result: {
              success: true,
              data: {
                columnCount: originalColumns.length,
                visibility: resetVisibility,
              },
            },
          },
          context?.tableContext as TableContextValue,
          action || ({} as ActionConfig),
        );
      } catch (error) {
        console.error(processMessage('plugin.columnManager.emitResetFailed', tableMessages, { error: String(error) }), error);
        await tableContext?.tableLogic?.actionEvents?.emitAction(
          'column-reset',
          {
            source: 'plugin',
            timestamp: Date.now(),
            payload: { op: 'reset' },
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
  };

  return (
    <div className="w-64 space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{processMessage('plugin.columnManager.columnSettings', tableMessages)}</h4>
      </div>

      {/* 全选操作 */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => toggleAll(true)} className="flex-1">
          {processMessage('selectAll', tableMessages)}
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(false)} className="flex-1">
          {processMessage('deselectAll', tableMessages)}
        </Button>
      </div>

      {/* 列列表 */}
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {columns.map((column: any) => {
          const key = column.name;
          const title = column.title || column.label || key;
          const isVisible = columnVisibility[key] ?? true;

          return (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox id={`column-${key}`} checked={isVisible} onCheckedChange={(checked) => toggleColumn(key, !!checked)} />
              <label htmlFor={`column-${key}`} className="flex-1 cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {title}
              </label>
            </div>
          );
        })}
      </div>

      {/* 重置按钮 */}
      <div className="border-t pt-2">
        <Button variant="outline" size="sm" onClick={resetColumns} className="w-full">
          {processMessage('plugin.columnManager.resetColumns', tableMessages)}
        </Button>
      </div>
    </div>
  );
};

/**
 * 列管理插件状态接口
 */
interface ColumnManagerState {
  /** 原始列定义 - 用于重置 */
  originalColumns: TableColumn[];
  /** 当前列可见性状态 */
  columnVisibility: Record<string, boolean>;
  /** 是否已初始化 */
  initialized: boolean;
}

/**
 * 列管理插件定义
 */
const ColumnManagerPlugin: TablePlugin = {
  id: 'columnManager',
  name: 'columnManager',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Table column manager plugin',
  messages: getTablePluginMessages('columnManager'),

  // 默认状态
  defaultState: {
    originalColumns: [],
    columnVisibility: {},
    initialized: false,
  } as ColumnManagerState,

  // 插件初始化
  init: (context: TablePluginContext) => {
    // 检查是否已经初始化，避免重复执行
    const currentState = context?.getState?.();
    if (currentState?.initialized) {
      return;
    }

    const tableContext = context?.tableContext;
    // 从tableContext.state.columns获取列定义，这是正确的路径
    const columns = tableContext?.state?.columns || [];

    // 保存原始列定义和初始可见性状态
    const originalColumns = cloneColumns(columns); // 深拷贝，保留 render / formatter 等函数
    const columnVisibility = columns.reduce((acc: Record<string, boolean>, col: any) => {
      acc[col.name] = col.visible !== false;
      return acc;
    }, {});

    // 更新插件状态
    context.updateState?.({
      originalColumns,
      columnVisibility,
      initialized: true,
    });
  },

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-columnSetting',
      label: 'plugin.columnManager.title',
      icon: 'table-settings',
      position: [TablePluginContributionPoint.TOOLBAR_RIGHT],
      priority: 1,
      group: 'view',
      isPluginAction: true,
      messages: getTablePluginMessages('columnManager'),
      variant: 'ghost',
      type: 'table-columnSetting', // 使用schema定义的标准action type
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
      when: (selectedRows, context) => {
        return true; // 默认启用，具体配置由外部控制
      },
      execute: (selectedRows, context, action) => {
        // DropdownMenu组件会自动处理菜单显示，这里不需要额外逻辑
      },
      render: (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

        return React.createElement(
          DropdownMenu,
          {},
          React.createElement(
            DropdownMenuTrigger,
            { asChild: true },
            React.createElement(
              Button,
              {
                variant: 'ghost',
                size: showLabel ? (action?.size ?? 'sm') : 'icon',
                className: 'shrink-0 p-1',
                title: processMessage('plugin.columnManager.tooltip', tableMessages),
                leftIcon: React.createElement(Icon, {
                  name: 'table-settings',
                  size: 16,
                }),
              },
              showLabel ? processMessage('plugin.columnManager.columnManager', tableMessages) : null,
            ),
          ),
          React.createElement(
            DropdownMenuContent,
            {
              align: 'end',
              className: 'p-0 eas-dropdown-content',
              style: { zIndex: 'calc(var(--eas-z-index-dropdown) + 10)' },
            },
            React.createElement(ColumnManagerMenu, {
              context,
              action,
              onClose: () => console.debug('Column manager closed'),
            }),
          ),
        );
      },
    },
  ] as TablePluginTableActionConfig[],

  // 列转换 - 应用默认隐藏列配置
  transformColumns: (columns, context) => {
    // 暂时禁用列隐藏功能，需要扩展TableConfig类型
    return columns;
  },
};

export default ColumnManagerPlugin;
