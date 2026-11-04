/**
 * 表格插件管理Hook
 * 直接从TableContext获取状态和更新函数，提供插件系统的注册、管理和执行功能
 */

import type { TablePluginContext } from '../types/hooks';
import { deepMerge } from '../../../utils/object';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { TableContextValue } from '../context/TableContext';
import { BUILTIN_PLUGINS } from '../plugins';
import type { TablePlugin, UseTablePluginReturn } from '../types';
import type { TablePluginActionConfig } from '../types/hooks';

/**
 * 默认插件列表
 * 当用户没有提供插件时，自动加载这些内置插件
 */
const DEFAULT_PLUGINS: TablePlugin[] = [
  // table内置插件
  BUILTIN_PLUGINS.columnManager,
  BUILTIN_PLUGINS.refresh,
  BUILTIN_PLUGINS.export,
  BUILTIN_PLUGINS.print,
  BUILTIN_PLUGINS.fullscreen,
  BUILTIN_PLUGINS.add,
  BUILTIN_PLUGINS.batchDelete,
  BUILTIN_PLUGINS.import,
  // table行内置插件
  //TODO: 移动行插件功能未实现，暂时不开放
  // BUILTIN_PLUGINS.moveRow,
  BUILTIN_PLUGINS.editRow,
  BUILTIN_PLUGINS.deleteRow,
  BUILTIN_PLUGINS.viewRow,
  BUILTIN_PLUGINS.copyRow,
  BUILTIN_PLUGINS.toggleEnableRow,
  // table列内置插件
  BUILTIN_PLUGINS.sort,
  BUILTIN_PLUGINS.filter,
  // table cell内置插件
  BUILTIN_PLUGINS.cellCopy,
  BUILTIN_PLUGINS.cellEdit,
];

/**
 * 表格插件管理Hook
 * 直接从TableContext获取状态和更新函数，提供插件系统的注册、管理和执行功能
 */
export function useTablePlugin(
  tableContext: TableContextValue,
  options: {
    plugins?: TablePlugin[];
    context: TablePluginContext;
    config?: { [pluginKey: string]: any };
  },
): UseTablePluginReturn {
  const { plugins: userPlugins, context, config } = options;

  // 如果用户没有提供插件，使用默认插件列表
  const plugins = useMemo(() => {
    return userPlugins && userPlugins.length > 0 ? userPlugins : DEFAULT_PLUGINS;
  }, [userPlugins]);
  const tableConfig = tableContext.state.config;
  const { state, actions } = tableContext;
  const enabled = tableConfig.pluginable ?? false;
  const pluginStates = state.pluginStates || {};
  const pluginInstancesRef = useRef<Map<string, TablePlugin>>(new Map());

  /**
   * 读取当前语言（优先取表格上下文配置）
   */
  const resolveLocale = useCallback((): string | undefined => {
    try {
      return tableContext.getLocale();
    } catch (error) {
      return undefined;
    }
  }, [tableContext]);

  // 更新插件状态的函数
  const updatePluginState = useCallback(
    (pluginId: string, newState: Record<string, any> | undefined) => {
      // 使用actions中的方法更新插件状态
      if (actions.setPluginState) {
        // 直接执行状态更新，不使用setTimeout避免异步问题
        actions.setPluginState(pluginId, newState);
      }
    },
    [actions],
  );

  // 注册插件
  const registerPlugin = useCallback(
    (plugin: TablePlugin) => {
      // 全局开启插件功能判定
      if (!enabled) return;

      const pluginId = plugin.id || plugin.name;

      // 检查是否已经注册，避免重复初始化
      if (pluginInstancesRef.current.has(pluginId)) {
        return;
      }

      // 检查依赖
      if (plugin.dependencies) {
        const missingDeps = plugin.dependencies.filter((dep) => !pluginInstancesRef.current.has(dep));
        if (missingDeps.length > 0) {
          console.warn(
            processUiMessage('pluginMissingDependencies', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { plugin: pluginId, dependencies: missingDeps.join(', ') }),
          );
          return;
        }
      }

      // 合并配置
      plugin.config = deepMerge(plugin.config || {}, config?.[pluginId]);

      // 配置开启插件功能判定
      // 📌 **字段名必须是 `enabled`** —— `TablePlugin['config']` 的类型声明是
      //    `{ enabled?: boolean; [key: string]: any }`，且**全部内置插件**的 config
      //    类型都用 `enabled`。此前此处误写成 `enable`（少一个 d），
      //    导致消费方按类型声明传 `enabled: false` 时永远关不掉插件。
      if (plugin.config?.enabled === false) {
        return;
      }

      // 初始化插件 - 传递完整的插件上下文
      if (plugin.init) {
        try {
          const pluginContext = deepMerge(context, {
            pluginId,
            tableContext,
            state: pluginStates[pluginId] || plugin.defaultState,
            updateState: (newState: any) => updatePluginState(pluginId, newState),
          });

          plugin?.init?.(pluginContext);
        } catch (error) {
          console.error(processUiMessage('pluginInitFailed', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { plugin: pluginId, error: String(error) }), error);
          return;
        }
      }

      pluginInstancesRef.current.set(pluginId, plugin);

      // 不在这里设置初始状态，让插件的init方法自己处理
    },
    [enabled, context, tableContext, pluginStates, updatePluginState, config, resolveLocale],
  );

  // 注销插件
  const unregisterPlugin = useCallback(
    (pluginId: string) => {
      const plugin = pluginInstancesRef.current.get(pluginId);
      if (plugin?.destroy) {
        try {
          const pluginContext = deepMerge(context, {
            pluginId,
            tableContext,
            state: pluginStates[pluginId] || plugin.defaultState,
            updateState: (newState: any) => updatePluginState(pluginId, newState),
          });

          plugin?.destroy(pluginContext);
        } catch (error) {
          console.error(processUiMessage('pluginDestroyFailed', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { plugin: pluginId, error: String(error) }), error);
        }
      }

      pluginInstancesRef.current.delete(pluginId);
      // 清理插件状态
      // 注意：`setPluginState` 走 deepMerge 合并，`undefined` 会被跳过导致状态残留，
      // 因此注销必须走专用的 `clearPluginState` action
      tableContext.actions.clearPluginState(pluginId);
    },
    [
      pluginStates,
      tableContext, // 清理插件状态
      context,
      resolveLocale,
    ],
  );

  // 获取插件实例
  const getPlugin = useCallback((pluginId: string): TablePlugin | undefined => {
    return pluginInstancesRef.current.get(pluginId);
  }, []);

  // 获取插件状态
  const getPluginState = useCallback(
    (pluginId: string) => {
      // 直接从tableContext获取最新状态，避免闭包陷阱
      const currentPluginStates = tableContext.state.pluginStates || {};
      return currentPluginStates[pluginId];
    },
    [tableContext],
  );

  // 获取所有已注册的插件
  const getRegisteredPlugins = useCallback((): TablePlugin[] => {
    return Array.from(pluginInstancesRef.current.values());
  }, []);

  // 获取指定位置的渲染组件 - 使用缓存避免频繁重计算
  const rendersCacheRef = useRef<Map<string, TablePluginActionConfig[]>>(new Map());

  // 获取指定位置的渲染组件 - 支持单个位置字符串或位置字符串数组
  const getRendersByPosition = useCallback(
    (position: string | string[]): TablePluginActionConfig[] => {
      if (!enabled) return [];

      // 统一转换为数组处理
      const positions = Array.isArray(position) ? position : [position];
      if (positions.length === 0) return [];

      // 获取最新的插件状态，避免闭包陷阱
      const currentPluginStates = tableContext.state.pluginStates || {};

      const allRenders: TablePluginActionConfig[] = [];

      positions.forEach((pos) => {
        // 使用缓存键
        const cacheKey = `${pos}_${Object.keys(currentPluginStates).join('_')}_${JSON.stringify(Object.values(currentPluginStates).map((s) => s?.isRefreshing || false))}`;

        let positionRenders: TablePluginActionConfig[] = [];

        if (rendersCacheRef.current.has(cacheKey)) {
          positionRenders = rendersCacheRef.current.get(cacheKey)!;
        } else {
          // 为单个位置计算渲染组件
          for (const [pluginId, plugin] of pluginInstancesRef.current) {
            if (plugin.actions) {
              const pluginContext = deepMerge(context, {
                pluginId,
                tableContext,
                state: currentPluginStates[pluginId] || plugin.defaultState,
                updateState: (newState: any) => updatePluginState(pluginId, newState),
              });

              const pluginRenders = plugin.actions
                .filter((action) => {
                  // 直接支持多位置数组，不再兼容单个位置
                  return (action.position as string[])?.includes(pos);
                })
                .filter((action) => {
                  if (action.when) {
                    try {
                      return action.when(undefined, tableContext);
                    } catch (error) {
                      console.warn(
                        processUiMessage('pluginConditionFailed', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { plugin: pluginId, error: String(error) }),
                        error,
                      );
                      return false;
                    }
                  }
                  return true;
                })
                .map((action) => ({
                  ...action,
                  pluginId,
                  // 确保 onClick 能正确传递上下文
                  onClick: action.onClick
                    ? (data: any, ctx: any, plginAction: any, event: any, column: any) => {
                        return action?.onClick?.(data, pluginContext, action, event, column);
                      }
                    : undefined,
                }));

              positionRenders.push(...(pluginRenders as any[]));
            }
          }

          // 缓存单个位置的结果
          rendersCacheRef.current.set(cacheKey, positionRenders);
        }

        allRenders.push(...positionRenders);
      });

      // 去重（基于key和pluginId）
      const uniqueRenders = allRenders.filter((render, index, array) => {
        return array.findIndex((r) => r.key === render.key && r.pluginId === render.pluginId) === index;
      });

      // 按优先级排序
      const sortedRenders = uniqueRenders.sort((a, b) => (a.priority || 100) - (b.priority || 100));

      // 清理旧缓存（保持最新的10个）
      if (rendersCacheRef.current.size > 10) {
        const firstKey = rendersCacheRef.current.keys().next().value;
        if (firstKey) {
          rendersCacheRef.current.delete(firstKey);
        }
      }

      return sortedRenders;
    },
    [enabled, updatePluginState, tableContext, context, resolveLocale],
  );

  // 执行插件动作
  const executeAction = useCallback(
    async (actionKey: string, pluginId?: string): Promise<void> => {
      if (!enabled) return;
      let targetPlugin: TablePlugin | undefined;
      let targetAction: any = null;
      let targetPluginId = '';

      if (pluginId) {
        targetPlugin = getPlugin(pluginId);
        if (targetPlugin?.actions) {
          targetAction = targetPlugin.actions.find((action) => action.key === actionKey);
          targetPluginId = pluginId;
        }
      } else {
        for (const [id, plugin] of pluginInstancesRef.current) {
          if (plugin.actions) {
            const action = plugin.actions.find((action) => action.key === actionKey);
            if (action) {
              targetAction = action;
              targetPluginId = id;
              targetPlugin = plugin;
              break;
            }
          }
        }
      }

      if (!targetAction) {
        console.warn(processUiMessage('pluginActionNotFound', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { action: actionKey }));
        return;
      }

      // 构建插件上下文 - 获取最新状态避免闭包陷阱
      const currentPluginStates = tableContext.state.pluginStates || {};
      const pluginContext = deepMerge(context, {
        pluginId: targetPluginId,
        tableContext,
        state: currentPluginStates[targetPluginId],
        updateState: (newState: Record<string, any>) => updatePluginState(targetPluginId, newState),
      });
      // 执行动作 - 优先使用 execute 方法，其次使用 onClick, 只有table内置插件才能使用 execute 数据，row/column内置插件无法获取运行时数据
      try {
        const data: any = targetPlugin?.positionType !== 'column' && targetPlugin?.positionType !== 'row' ? tableContext.getSelectedRows() : undefined;
        if (targetAction.execute) {
          await targetAction.execute(data, pluginContext, targetAction);
        } else if (targetAction.onClick) {
          await targetAction.onClick(data, pluginContext, targetAction);
        }
      } catch (error) {
        console.error(processUiMessage('pluginActionFailed', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { action: actionKey, error: String(error) }), error);
      }
    },
    [enabled, getPlugin, updatePluginState, tableContext, context, resolveLocale],
  );

  // 初始化所有插件 - 使用 useRef 避免循环依赖
  const initializePlugins = useCallback(() => {
    if (!enabled) return;

    // 获取当前已注册的插件ID集合
    const currentPluginIds = new Set(pluginInstancesRef.current.keys());
    const newPluginIds = new Set(plugins.map((p) => p.id || p.name));

    // 只注销不再需要的插件
    currentPluginIds.forEach((pluginId) => {
      if (!newPluginIds.has(pluginId)) {
        unregisterPlugin(pluginId);
      }
    });

    // 只注册新插件，避免重复初始化
    plugins.forEach((plugin) => {
      const pluginId = plugin.id || plugin.name;
      if (!currentPluginIds.has(pluginId)) {
        registerPlugin(plugin);
      }
    });
  }, [enabled, plugins, unregisterPlugin, registerPlugin]);

  // 使用 useRef 跟踪插件是否已初始化
  const initializedRef = useRef(false);
  const lastPluginsRef = useRef<TablePlugin[]>([]);

  // 使用useEffect而不是useMemo来避免在渲染期间更新状态
  useEffect(() => {
    // 首次初始化或插件列表发生变化时才重新初始化
    const pluginsChanged =
      !initializedRef.current ||
      plugins.length !== lastPluginsRef.current.length ||
      plugins.some((plugin, index) => {
        const lastPlugin = lastPluginsRef.current[index];
        return !lastPlugin || (plugin.id || plugin.name) !== (lastPlugin.id || lastPlugin.name);
      });

    if (pluginsChanged) {
      initializePlugins();
      initializedRef.current = true;
      lastPluginsRef.current = [...plugins];
    }
  }, [plugins, initializePlugins]);

  return {
    // 状态
    pluginStates,
    registeredPlugins: getRegisteredPlugins(),

    // 插件管理
    registerPlugin,
    unregisterPlugin,
    getPlugin,
    isPluginRegistered: (pluginId: string) => pluginInstancesRef.current.has(pluginId),
    togglePlugin: (pluginId: string, enabled: boolean) => {
      const plugin = getPlugin(pluginId);
      if (plugin) {
        if (plugin?.updateConfig) {
          plugin.updateConfig(config, context);
        } else if (plugin) {
          // 📌 **字段名必须是 `enabled`** —— 与 `registerPlugin` 的判定保持同源，
          //    否则 `togglePlugin(id, false)` 写入的开关对注册判定无效。
          plugin.config = deepMerge(plugin.config ?? {}, { enabled });
        }
      }
    },

    // 状态管理
    getPluginState,
    updatePluginState,

    // 配置管理
    getPluginConfig: (pluginId: string) => {
      const plugin = getPlugin(pluginId);
      return plugin?.config ?? {};
    },
    updatePluginConfig: (pluginId: string, config: any) => {
      const plugin = getPlugin(pluginId);
      if (plugin?.updateConfig) {
        plugin.updateConfig(config, context);
      } else if (plugin) {
        plugin.config = deepMerge(plugin.config ?? {}, config);
      }
    },

    // 钩子执行
    executeHook: (hookName: string, ...args: any[]) => {
      // 简化版本，后续可扩展
      return args;
    },

    // 数据转换
    transformData: (data: Record<string, any>[]) => data,
    transformColumns: (columns: any[]) => columns,

    // 渲染和动作
    getRendersByPosition,
    getAllActions: (): TablePluginActionConfig[] => {
      const allActions: TablePluginActionConfig[] = [];
      plugins.forEach((plugin) => {
        if (plugin.actions) {
          plugin.actions.forEach((action) => {
            allActions.push({
              ...action,
              pluginId: plugin.id || plugin.name,
            });
          });
        }
      });
      return allActions;
    },
    getPluginActions: (pluginId: string) => {
      const plugin = getPlugin(pluginId);
      return plugin?.actions || [];
    },
    executeAction,
    getPluginStandardMessage: (pluginId: string, key: string, locale = 'zh-CN') => {
      const plugin = getPlugin(pluginId);
      const localeMessages = plugin?.messages?.[locale] || plugin?.messages?.['zh-CN'];
      return localeMessages?.[key];
    },
  };
}
