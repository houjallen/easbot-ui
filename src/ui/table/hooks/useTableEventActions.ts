import { useCallback, useEffect } from 'react';
import { useRef } from 'react';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import type { TableContextValue } from '../context/TableContext';
import type { ActionConfig, ActionEventData } from '../types/base';
import type { ActionEmitResult, ActionListenerOptions, ListenerInfo, RegisteredActionInfo, UnsubscribeFunction, UseTableActionsReturn } from '../types/hooks';

// 事件处理器类型
// `action` 可选 —— 与 `emitAction(actionKey, data, context, action?)` 的契约一致
export type ActionEventHandler = (data: ActionEventData, context: TableContextValue, action?: ActionConfig) => Promise<any> | any;

// 监听器执行结果类型
export interface ListenerExecutionResult {
  listenerId: string;
  success: boolean;
  result?: any;
  error?: Error;
}

/**
 * 表格Action事件系统Hook
 * 提供基于action key的事件发射、监听和管理能力
 */
export function useTableEventActions(tableContext?: TableContextValue): UseTableActionsReturn {
  const eventListenersConfig = tableContext?.state?.config?.eventListeners || {};
  // 事件监听器存储
  const eventListenersRef = useRef<Map<string, ListenerInfo[]>>(new Map());

  /**
   * 读取当前语言（优先取表格上下文配置）
   */
  const resolveLocale = useCallback((): string | undefined => {
    try {
      return tableContext?.getLocale();
    } catch (error) {
      return undefined;
    }
  }, [tableContext]);

  /**
   * 基于action key的事件发射器
   * 支持所有交互类型和完整的事件发射机制
   */
  const emitAction = useCallback(
    async (actionKey: string, data: ActionEventData, context: TableContextValue, action?: ActionConfig): Promise<ActionEmitResult> => {
      const listeners = eventListenersRef.current.get(actionKey) || [];

      // 增强事件数据
      const enhancedData: ActionEventData = {
        ...data,
        timestamp: data.timestamp || Date.now(),
        source: data.source || 'system',
        interactionType: data.interactionType || action?.interaction?.type || 'direct',
      };

      if (listeners.length === 0) {
        console.debug(`没有找到action key "${actionKey}" 的监听器`);
        return {
          success: true,
          results: [],
          totalListeners: 0,
        };
      }

      // 按优先级排序执行（优先级越小越先执行）
      const sortedListeners = [...listeners].sort((a, b) => (a.priority || 0) - (b.priority || 0));

      // 直接使用必传的context和action参数
      const targetContext = context;
      const targetAction = action;

      const results: Array<{
        listenerId: string;
        success: boolean;
        result?: any;
        error?: Error;
      }> = [];
      let overallSuccess = true;

      // 记录事件发射开始
      console.debug(`开始发射action事件 [${actionKey}]，监听器数量: ${listeners.length}`);

      for (const listener of sortedListeners) {
        let listenerResult: ListenerExecutionResult = {
          listenerId: listener.id,
          success: false,
          result: undefined,
          error: undefined,
        };

        try {
          // 执行监听器处理函数
          const result = await listener?.handler?.(enhancedData, targetContext, targetAction);

          listenerResult = {
            listenerId: listener.id,
            success: true,
            result,
          };

          console.debug(`Action事件处理器执行成功 [${actionKey}] - ${listener.id}`);

          // 一次性监听器执行后移除
          if (listener.once) {
            const currentListeners = eventListenersRef.current.get(actionKey) || [];
            const updatedListeners = currentListeners.filter((l) => l.id !== listener.id);
            if (updatedListeners.length === 0) {
              eventListenersRef.current.delete(actionKey);
            } else {
              eventListenersRef.current.set(actionKey, updatedListeners);
            }
            console.debug(`移除一次性监听器 [${actionKey}] - ${listener.id}`);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          listenerResult = {
            listenerId: listener.id,
            success: false,
            error: err,
          };

          overallSuccess = false;
          console.error(
            processUiMessage('actionHandlerFailed', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { action: actionKey, listener: listener.id, error: String(err) }),
            err,
          );

          // 根据交互类型决定是否继续执行其他监听器
          if (enhancedData.interactionType === 'confirm' || enhancedData.interactionType === 'prompt') {
            // 对于确认或提示类型的交互，如果失败则停止执行后续监听器
            console.warn(
              processUiMessage('actionStoppedByInteraction', { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { interactionType: enhancedData.interactionType }),
            );
            results.push(listenerResult);
            break;
          }
        }

        results.push(listenerResult);
      }

      // 记录事件发射完成
      console.debug(`Action事件发射完成 [${actionKey}]，成功: ${overallSuccess}，处理结果: ${results.length}/${listeners.length}`);

      return {
        success: overallSuccess,
        results,
        totalListeners: listeners.length,
      };
    },
    [resolveLocale],
  );

  /**
   * 基于action key的事件监听器
   * 支持类型安全、优先级控制、条件检查、防抖节流等功能
   */
  const onAction = useCallback(
    <T extends ActionEventData = ActionEventData>(
      actionKey: string,
      handler: (data: T, context: TableContextValue, action?: ActionConfig) => Promise<any> | any,
      options: ActionListenerOptions = {},
    ): UnsubscribeFunction => {
      const listenerId = `${actionKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const listeners = eventListenersRef.current.get(actionKey) || [];

      // 创建带有防抖/节流功能的处理器
      let wrappedHandler = handler;

      // 为每个监听器创建独立的定时器引用
      const timerRefs = {
        debounceTimer: null as NodeJS.Timeout | null,
        lastThrottleTime: 0,
      };

      if (options.debounce && options.debounce > 0) {
        wrappedHandler = (data: T, context: TableContextValue, action?: ActionConfig) => {
          return new Promise((resolve, reject) => {
            if (timerRefs.debounceTimer) {
              clearTimeout(timerRefs.debounceTimer);
            }

            timerRefs.debounceTimer = setTimeout(async () => {
              try {
                const result = await handler(data, context, action);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, options.debounce);
          });
        };
      } else if (options.throttle && options.throttle > 0) {
        wrappedHandler = (data: T, context: TableContextValue, action?: ActionConfig) => {
          const now = Date.now();

          if (now - timerRefs.lastThrottleTime >= options.throttle!) {
            timerRefs.lastThrottleTime = now;
            return handler(data, context, action);
          } else {
            // 节流期间忽略调用，返回空的成功结果
            return Promise.resolve(undefined);
          }
        };
      }

      // 创建最终的处理器（包含条件检查）
      const finalHandler: ActionEventHandler = async (data, context, action) => {
        // 条件检查 - 安全的类型检查
        if (options.condition) {
          try {
            if (!options.condition(data as T, context, action)) {
              console.debug(`监听器条件不满足，跳过执行 [${actionKey}] - ${listenerId}`);
              return;
            }
          } catch (conditionError) {
            console.error(
              processUiMessage(
                'listenerConditionFailed',
                { locale: resolveLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' },
                { action: actionKey, listener: listenerId, error: String(conditionError) },
              ),
              conditionError,
            );
            return;
          }
        }

        return await wrappedHandler(data as T, context, action);
      };

      const listenerInfo: ListenerInfo = {
        handler: finalHandler,
        once: options.once,
        priority: options.priority || 0,
        id: listenerId,
      };

      listeners.push(listenerInfo);
      eventListenersRef.current.set(actionKey, listeners);

      console.debug(`注册action监听器 [${actionKey}] - ${listenerId}，优先级: ${listenerInfo.priority}，一次性: ${!!options.once}`);

      // 返回取消订阅函数
      return () => {
        // 清理定时器
        if (timerRefs.debounceTimer) {
          clearTimeout(timerRefs.debounceTimer);
        }

        const currentListeners = eventListenersRef.current.get(actionKey) || [];
        const filteredListeners = currentListeners.filter((l) => l.id !== listenerId);

        if (filteredListeners.length === 0) {
          eventListenersRef.current.delete(actionKey);
          console.debug(`移除action监听器并清空key [${actionKey}] - ${listenerId}`);
        } else {
          eventListenersRef.current.set(actionKey, filteredListeners);
          console.debug(`移除action监听器 [${actionKey}] - ${listenerId}`);
        }
      };
    },
    [resolveLocale],
  );

  /**
   * 移除指定action的监听器
   * @param actionKey action键
   * @param listenerId 可选的监听器ID，如果不提供则移除所有监听器
   * @returns 是否成功移除
   */
  const offAction = useCallback((actionKey: string, listenerId?: string): boolean => {
    const listeners = eventListenersRef.current.get(actionKey);

    if (!listeners || listeners.length === 0) {
      console.debug(`没有找到action key "${actionKey}" 的监听器`);
      return false;
    }

    if (listenerId) {
      // 移除特定的监听器
      const filteredListeners = listeners.filter((l) => l.id !== listenerId);
      const removed = filteredListeners.length !== listeners.length;

      if (removed) {
        if (filteredListeners.length === 0) {
          eventListenersRef.current.delete(actionKey);
          console.debug(`移除监听器并清空key [${actionKey}] - ${listenerId}`);
        } else {
          eventListenersRef.current.set(actionKey, filteredListeners);
          console.debug(`移除特定监听器 [${actionKey}] - ${listenerId}`);
        }
      } else {
        console.debug(`未找到要移除的监听器 [${actionKey}] - ${listenerId}`);
      }

      return removed;
    } else {
      // 移除所有监听器
      const removedCount = listeners.length;
      eventListenersRef.current.delete(actionKey);
      console.debug(`移除所有监听器 [${actionKey}]，数量: ${removedCount}`);
      return removedCount > 0;
    }
  }, []);

  /**
   * 移除所有监听器
   * @param filter 可选的过滤函数，用于选择性移除监听器
   * @returns 移除的统计信息
   */
  const offAllActions = useCallback((filter?: (actionKey: string, listeners: ListenerInfo[]) => boolean): { removedKeys: string[]; totalRemoved: number } => {
    const allKeys = Array.from(eventListenersRef.current.keys());
    const removedKeys: string[] = [];
    let totalRemoved = 0;

    for (const actionKey of allKeys) {
      const listeners = eventListenersRef.current.get(actionKey) || [];

      if (!filter || filter(actionKey, listeners)) {
        totalRemoved += listeners.length;
        removedKeys.push(actionKey);
        eventListenersRef.current.delete(actionKey);
      }
    }

    console.debug(`清理所有监听器完成，移除keys: ${removedKeys.length}，移除监听器: ${totalRemoved}`);

    return {
      removedKeys,
      totalRemoved,
    };
  }, []);

  /**
   * 获取已注册的action keys和监听器信息
   * @returns 已注册的action信息
   */
  const getRegisteredActionKeys = useCallback((): Record<string, RegisteredActionInfo> => {
    const actionInfo: Record<string, RegisteredActionInfo> = {};

    for (const [actionKey, listeners] of eventListenersRef.current.entries()) {
      actionInfo[actionKey] = {
        actionKey: actionKey,
        totalCount: listeners.length,
        listeners: listeners.map((l) => ({
          id: l.id,
          priority: l.priority || 0,
          once: !!l.once,
        })),
      };
    }

    return actionInfo;
  }, []);

  /**
   * 检查是否有指定action的监听器
   * @param actionKey action键
   * @returns 是否存在监听器
   */
  const hasActionListeners = useCallback((actionKey: string): boolean => {
    const listeners = eventListenersRef.current.get(actionKey);
    return !!(listeners && listeners.length > 0);
  }, []);

  /**
   * 获取指定action的监听器数量
   * @param actionKey action键
   * @returns 监听器数量
   */
  const getActionListenerCount = useCallback((actionKey: string): number => {
    const listeners = eventListenersRef.current.get(actionKey);
    return listeners ? listeners.length : 0;
  }, []);

  // 自动注册配置中的监听器
  useEffect(() => {
    const unsubscribeFunctions: UnsubscribeFunction[] = [];

    // 遍历配置中的监听器并注册
    Object.values(eventListenersConfig).forEach((listenerConfig) => {
      if (listenerConfig?.actionKey && listenerConfig?.handler) {
        // 直接调用内部逻辑，避免依赖useCallback
        const listenerId = `${listenerConfig.actionKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const listeners = eventListenersRef.current.get(listenerConfig.actionKey) || [];

        const listenerInfo: ListenerInfo = {
          handler: listenerConfig.handler,
          once: listenerConfig.options?.once,
          priority: listenerConfig.options?.priority || 0,
          id: listenerId,
          createdAt: Date.now(),
        };

        listeners.push(listenerInfo);
        eventListenersRef.current.set(listenerConfig.actionKey, listeners);

        console.debug(`自动注册配置监听器 [${listenerConfig.actionKey}] - ${listenerId}`);

        // 创建清理函数
        const unsubscribe = () => {
          const currentListeners = eventListenersRef.current.get(listenerConfig.actionKey) || [];
          const filteredListeners = currentListeners.filter((l) => l.id !== listenerId);

          if (filteredListeners.length === 0) {
            eventListenersRef.current.delete(listenerConfig.actionKey);
          } else {
            eventListenersRef.current.set(listenerConfig.actionKey, filteredListeners);
          }

          console.debug(`自动清理配置监听器 [${listenerConfig.actionKey}] - ${listenerId}`);
        };

        unsubscribeFunctions.push(unsubscribe);
      }
    });

    // 清理函数
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => {
        unsubscribe();
      });
    };
  }, [eventListenersConfig]);

  // 组件卸载时清理所有监听器
  useEffect(() => {
    return () => {
      // 直接清理，避免依赖useCallback
      eventListenersRef.current.clear();
      console.debug('组件卸载，清理所有action监听器');
    };
  }, []);

  return {
    // 核心功能
    emitAction,
    onAction,
    offAction,
    offAllActions,

    // 查询功能
    getRegisteredActionKeys,
    hasActionListeners,
    getActionListenerCount,
  };
}

export default useTableEventActions;
