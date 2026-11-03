/**
 * 全屏插件 - 使用React Portal方案
 * 保持React事件系统和上下文完整性
 */

import type { TableContextValue } from '../context';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableActionConfig } from '../types/hooks';
import type { TablePluginContext } from '../types/hooks';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { ActionConfig, TablePlugin } from '../types';
import type { TableColumn, TableConfig } from '../types/base';
import { Button, CloseButton } from '../../button';
import { Icon } from '../../icon';
import { TableProvider } from '../context/TableContext';
import { AdvancedTable } from '../organisms/AdvancedTable';

/**
 * 深拷贝纯数据行
 *
 * @description
 * 数据行只包含可 JSON 序列化的业务字段，用结构化克隆切断与原表的引用关系，
 * 避免全屏态的编辑操作直接污染外层表格的数据源。
 *
 * @param data 原始数据行
 * @returns 克隆后的数据行
 */
const clonePlainData = (data?: Record<string, any>[]): Record<string, any>[] => {
  if (!data) return [];
  return data.map((row) => ({ ...row }));
};

/**
 * 深拷贝列定义，保留 render / formatter / parser 等函数
 *
 * @description
 * 不能使用 `JSON.parse(JSON.stringify())` —— JSON 序列化会静默丢弃函数，
 * 导致全屏态的单元格自定义渲染、格式化、解析全部失效。
 *
 * @param columns 原始列定义
 * @returns 克隆后的列定义（函数引用保持不变）
 */
const cloneColumns = (columns?: TableColumn[]): TableColumn[] => {
  if (!columns) return [];
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
 * 深拷贝表格配置，保留回调函数
 *
 * @description
 * 全屏表格需要独立的配置副本，但 `onSelectionChange` / `filterer` / `sorter` /
 * `renderExpandedRow` 等回调必须保持引用，否则行为与外层表格不一致。
 *
 * @param config 原始表格配置
 * @returns 克隆后的表格配置（函数引用保持不变）
 */
const cloneTableConfig = (config?: TableConfig): TableConfig => {
  if (!config) return {};
  return {
    ...config,
    selection: config.selection ? { ...config.selection } : undefined,
    sort: config.sort ? { ...config.sort } : undefined,
    filter: config.filter ? { ...config.filter } : undefined,
    expansion: config.expansion ? { ...config.expansion } : undefined,
    resize: config.resize ? { ...config.resize } : undefined,
    pagination: config.pagination ? { ...config.pagination } : undefined,
    search: config.search
      ? {
          ...config.search,
          fields: config.search.fields?.map((field) => ({ ...field, options: field.options?.map((option) => ({ ...option })) })),
        }
      : undefined,
    toolbar: config.toolbar ? { ...config.toolbar } : undefined,
    statusBar: config.statusBar ? { ...config.statusBar } : undefined,
    rowAction: config.rowAction ? { ...config.rowAction } : undefined,
    contextMenu: config.contextMenu ? { ...config.contextMenu } : undefined,
    columnHeaderAction: config.columnHeaderAction ? { ...config.columnHeaderAction } : undefined,
    card: config.card ? { ...config.card } : undefined,
    i18n: config.i18n ? { ...config.i18n } : undefined,
  };
};

/**
 * 全屏插件配置
 */
export interface FullscreenPluginConfig {
  /** 是否启用全屏功能 */
  enabled?: boolean;
  /** 浮层标题 */
  title?: string;
  /** z-index层级 */
  zIndex?: number;
  /** 容器选择器 */
  container?: string;
}

/**
 * 全屏插件状态
 */
export interface FullscreenPluginState {
  /** 是否处于全屏状态 */
  loading: boolean;
  /** 初始化标记 */
  initialized?: boolean;
  /** 全屏内容组件 */
  fullscreenContent?: React.ReactNode;
}

/**
 * 全屏浮层组件
 */
const FullscreenOverlay: React.FC<{
  context?: TablePluginContext;
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}> = ({ context, children, onClose, title }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // 防止body滚动
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [onClose]);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 90,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  };

  const contentStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
    borderRadius: '8px 8px 0 0',
  };

  const tableLogic = context?.tableContext?.tableLogic;
  const tableConfig = context?.tableContext?.state?.config;
  const plugin = tableLogic?.plugin.getPlugin?.(FullscreenPlugin.id as string);
  const pluginConfig = plugin?.config as FullscreenPluginConfig;

  // 1) 优先按 tableId 精确定位该表格容器；未配置 tableId 时退化为类选择器
  //    注意：`pluginConfig.container` 形如 '.eas-table-container'，是「类选择器」而非「后代选择器」，
  //    直接与 `#${tableId}` 拼接会要求元素同时具备 id 与该 class，过于脆弱。
  const tableId = tableConfig?.tableId;
  const containerSelector = tableId ? `#${CSS.escape(tableId)}` : pluginConfig?.container || '.eas-table-container';
  const easTableContainer = document.querySelector(containerSelector) as HTMLElement | null;
  // data-slot="table-container" 是 TableContainer 根节点
  const tableContainer =
    (easTableContainer?.matches('[data-slot="table-container"]') ? easTableContainer : (easTableContainer?.querySelector('[data-slot="table-container"]') as HTMLElement | null)) ||
    (document.querySelector('[data-slot="table-container"]') as HTMLElement | null);

  // 获取滚动模式
  const scrollMode = tableContainer?.getAttribute('data-scroll-mode');
  const isCustomScroll = scrollMode === 'custom';

  const className = isCustomScroll ? 'flex flex-col flex-1 overflow-hidden p-4 h-full w-full' : 'flex-1 overflow-auto p-4';

  // 浮层标题：优先取外部传入，否则走内置文案
  const processMessage = context?.processMessage || ((key: string, messages?: any) => processUiMessage(key, { messages: messages || tableMessages, fallbackLocale: 'zh-CN' }));
  const overlayTitle = title ?? processMessage('plugin.fullscreen.overlayTitle', tableMessages);

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={contentStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-bold text-lg">{overlayTitle}</span>
          </div>
          <CloseButton onClick={onClose} title={processMessage('plugin.fullscreen.exitTooltip', tableMessages)} />
        </div>
        <div className={className}>{children}</div>
      </div>
    </div>
  );
};

/**
 * 全屏插件定义
 */
const FullscreenPlugin: TablePlugin = {
  id: 'fullscreen',
  name: 'fullscreen',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Fullscreen display plugin with overlay',
  messages: getTablePluginMessages('fullscreen'),
  // 默认配置
  config: {
    enabled: true,
    title: 'Fullscreen',
    zIndex: 90,
    container: '.eas-table-container',
  } as FullscreenPluginConfig,
  // 默认状态
  defaultState: {
    loading: false,
    initialized: false,
  } as FullscreenPluginState,

  // 初始化
  init: (context) => {
    // 检查是否已初始化，避免重复初始化
    const currentState = context?.state as FullscreenPluginState;
    if (currentState?.initialized) {
      return;
    }

    context.updateState?.({
      loading: false,
      initialized: true,
    });
  },

  // 销毁
  destroy: (context) => {
    context.updateState?.({
      loading: false,
      initialized: false,
    });
  },

  // 动作定义
  actions: [
    {
      key: 'table-fullscreen',
      label: 'plugin.fullscreen.title',
      icon: 'table-fullscreen',
      position: [TablePluginContributionPoint.TOOLBAR_RIGHT],
      priority: 3,
      group: 'display',
      isPluginAction: true,
      messages: getTablePluginMessages('fullscreen'),
      variant: 'ghost',
      type: 'table-fullscreen', // 使用schema定义的标准action type
      interaction: {
        type: 'direct', // 直接执行，无需确认
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },

      when: (selectedRows, context) => {
        const systemPlugin = context?.tableLogic?.plugin;
        const config = systemPlugin?.getPluginConfig?.(FullscreenPlugin.id as string) as FullscreenPluginConfig;
        return config?.enabled !== false;
      },

      execute: async (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);

        try {
          const currentState = context?.state as FullscreenPluginState;
          const newState = !currentState?.loading;
          const tableLogic = context?.tableContext?.tableLogic;
          const tableConfig = context?.tableContext?.state?.config;

          if (newState) {
            // 进入全屏模式 - 直接创建并渲染Portal
            const tableContext = context?.tableContext;
            // 创建Portal并直接渲染到body
            const portalElement = createPortal(
              <TableProvider data={clonePlainData(tableContext?.state?.data)} columns={cloneColumns(tableContext?.state?.columns)} config={cloneTableConfig(tableContext?.state?.config)}>
                <FullscreenOverlay
                  title={processMessage('plugin.fullscreen.overlayTitle', tableMessages)}
                  context={context}
                  onClose={() => {
                    // 关闭时清理Portal并更新状态
                    context?.updateState?.({
                      loading: false,
                      fullscreenContent: null,
                    });
                    // 移除Portal容器
                    const portalContainer = document.getElementById('fullscreen-portal-container');
                    if (portalContainer) {
                      document.body.removeChild(portalContainer);
                    }
                  }}
                >
                  <AdvancedTable />
                </FullscreenOverlay>
              </TableProvider>,
              (() => {
                // 创建Portal容器
                let container = document.getElementById('fullscreen-portal-container');
                if (!container) {
                  container = document.createElement('div');
                  container.id = 'fullscreen-portal-container';
                  document.body.appendChild(container);
                }
                return container;
              })(),
              `fullscreen-key-${tableConfig?.tableId}`,
            );

            // 更新状态并存储Portal元素
            context?.updateState?.({
              loading: true,
            });

            // 手动触发Portal渲染
            const portalContainer = document.getElementById('fullscreen-portal-container');
            if (portalContainer) {
              // 使用ReactDOM.createRoot创建根节点
              const root = createRoot(portalContainer);
              // 使用root.render渲染Portal内容
              root.render(portalElement);
            }
          } else {
            // 退出全屏模式
            const portalContainer = document.getElementById('fullscreen-portal-container');
            if (portalContainer) {
              document.body.removeChild(portalContainer);
            }

            context?.updateState?.({
              loading: false,
              fullscreenContent: null,
            });
          }

          // 发送事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-fullscreen',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { isFullscreen: newState },
                result: {
                  success: true,
                  data: { isFullscreen: newState },
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage('plugin.fullscreen.success', tableMessages));
        } catch (error) {
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-fullscreen',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { isFullscreen: false },
                result: {
                  success: false,
                  error: error as Error,
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          console.error(processMessage('plugin.fullscreen.failed', tableMessages, { error: String(error) }), error);
        }
      },

      render: (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

        const pluginState = context?.state as FullscreenPluginState;
        const isFullscreen = pluginState?.loading || false;

        const handleClick = (event?: React.MouseEvent) => {
          if (action?.pluginExecute) {
            action?.pluginExecute(selectedRows, context, action);
          }
        };

        return React.createElement(
          Button,
          {
            variant: 'ghost',
            size: showLabel ? (action?.size ?? 'sm') : 'icon',
            onClick: (e) => handleClick(e),
            className: 'shrink-0 p-1',
            title: isFullscreen ? processMessage('plugin.fullscreen.exitTooltip', tableMessages) : processMessage('plugin.fullscreen.tooltip', tableMessages),
            leftIcon: React.createElement(Icon, {
              name: 'table-fullscreen',
              size: 16,
            }),
          },
          showLabel ? (isFullscreen ? processMessage('plugin.fullscreen.exitTitle', tableMessages) : processMessage('plugin.fullscreen.title', tableMessages)) : null,
        );
      },
    },
  ] as TablePluginTableActionConfig[],
};

export default FullscreenPlugin;
