/**
 * useTableEventActions Hook 单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Hook 返回的注册 / 查询能力
 * 2. 状态测试 - 验证监听器优先级排序、一次性监听器、条件与防抖节流
 * 3. 交互测试 - 验证 emitAction 发射链路、失败中断与监听器移除
 *
 * 测试载体说明：
 * `useTableEventActions` 需要一个 `TableContextValue`（可选），用探针组件在真实
 * `TableProvider` 下取出上下文，再把 Hook 返回值与上下文一并透出。
 *
 * 关键约束：
 * - 该 Hook 内部大量使用 `console.debug` / `console.error` / `console.warn`，
 *   用例里统一静音，避免测试输出不可读。
 * - 监听器按 **优先级升序** 执行（数字越小越先执行）。
 * - `interactionType` 为 `confirm` / `prompt` 时，失败的监听器会中断后续链路。
 */

import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import type { TableContextValue } from '../../context/TableContext';
import type { UseTableActionsReturn } from '../../types/hooks';
import { useTableEventActions } from '../useTableEventActions';

/**
 * 探针组件 —— 在真实 TableProvider 上下文中消费事件 Hook
 */
const EventActionsProbe = ({ onReady }: { onReady: (value: UseTableActionsReturn, context: TableContextValue) => void }) => {
  const context = useTableContext();
  const value = useTableEventActions(context);

  onReady(value, context);

  return null;
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderEventActions = (config?: Record<string, unknown>) => {
  const latest: { value?: UseTableActionsReturn; context?: TableContextValue } = {};

  const utils = render(
    <TableProvider data={[]} columns={[]} config={config as never}>
      <EventActionsProbe
        onReady={(value, context) => {
          latest.value = value;
          latest.context = context;
        }}
      />
    </TableProvider>,
  );

  return { ...utils, latest };
};

describe('useTableEventActions Hook', () => {
  beforeEach(() => {
    // 该 Hook 内部大量打日志，统一静音
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // 防抖 / 节流用例会临时切换为假定时器 —— 必须复位，避免污染后续用例
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('渲染测试', () => {
    it('应该暴露事件发射与监听管理的完整能力', () => {
      const { latest } = renderEventActions();

      expect(typeof latest.value?.emitAction).toBe('function');
      expect(typeof latest.value?.onAction).toBe('function');
      expect(typeof latest.value?.offAction).toBe('function');
      expect(typeof latest.value?.offAllActions).toBe('function');
      expect(typeof latest.value?.getRegisteredActionKeys).toBe('function');
      expect(typeof latest.value?.hasActionListeners).toBe('function');
      expect(typeof latest.value?.getActionListenerCount).toBe('function');
    });

    it('应该在没有监听器时返回空的注册表', () => {
      const { latest } = renderEventActions();

      expect(latest.value?.getRegisteredActionKeys()).toEqual({});
      expect(latest.value?.hasActionListeners('table-refresh')).toBe(false);
      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(0);
    });

    it('应该自动注册配置中声明的事件监听器', () => {
      const handler = vi.fn();
      const { latest } = renderEventActions({
        eventListeners: {
          refresh: { actionKey: 'table-refresh', handler },
        },
      });

      expect(latest.value?.hasActionListeners('table-refresh')).toBe(true);
      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(1);
      expect(latest.value?.getRegisteredActionKeys()['table-refresh']?.actionKey).toBe('table-refresh');
    });
  });

  describe('状态测试', () => {
    it('应该注册监听器后记录其数量与元信息', () => {
      const { latest } = renderEventActions();

      act(() => {
        latest.value?.onAction('table-refresh', vi.fn(), { priority: 5, once: true });
      });

      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(1);

      const registered = latest.value?.getRegisteredActionKeys()['table-refresh'];
      expect(registered?.totalCount).toBe(1);
      expect(registered?.listeners?.[0]?.priority).toBe(5);
      expect(registered?.listeners?.[0]?.once).toBe(true);
    });

    it('应该按优先级升序执行监听器', async () => {
      const { latest } = renderEventActions();
      const order: string[] = [];

      act(() => {
        latest.value?.onAction(
          'table-refresh',
          () => {
            order.push('low');
          },
          { priority: 10 },
        );
        latest.value?.onAction(
          'table-refresh',
          () => {
            order.push('high');
          },
          { priority: 1 },
        );
      });

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      expect(order).toEqual(['high', 'low']);
    });

    it('应该在一次性监听器执行后将其移除', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler, { once: true });
      });
      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(1);

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(0);
    });

    it('应该在条件不满足时跳过监听器', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler, { condition: () => false });
      });

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该在条件满足时执行监听器', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler, { condition: () => true });
      });

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('交互测试', () => {
    it('应该在没有监听器时返回空的发射结果', async () => {
      const { latest } = renderEventActions();

      let result: Awaited<ReturnType<NonNullable<UseTableActionsReturn['emitAction']>>> | undefined;

      await act(async () => {
        result = await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      expect(result?.success).toBe(true);
      expect(result?.results).toEqual([]);
      expect(result?.totalListeners).toBe(0);
    });

    it('应该把事件数据与上下文透传给监听器', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler);
      });

      await act(async () => {
        await latest.value?.emitAction('table-refresh', { payload: { id: 1 } }, latest.context as TableContextValue);
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const [data, context] = handler.mock.calls[0] ?? [];
      expect(data?.payload).toEqual({ id: 1 });
      expect(data?.source).toBe('system');
      expect(data?.timestamp).toEqual(expect.any(Number));
      expect(context).toBe(latest.context);
    });

    it('应该返回每个监听器的执行结果', async () => {
      const { latest } = renderEventActions();

      act(() => {
        latest.value?.onAction('table-refresh', () => 'ok');
      });

      let result: Awaited<ReturnType<NonNullable<UseTableActionsReturn['emitAction']>>> | undefined;

      await act(async () => {
        result = await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      expect(result?.success).toBe(true);
      expect(result?.totalListeners).toBe(1);
      expect(result?.results?.[0]?.success).toBe(true);
      expect(result?.results?.[0]?.result).toBe('ok');
    });

    it('应该在监听器抛错时标记整体失败并继续执行后续链路', async () => {
      const { latest } = renderEventActions();
      const secondHandler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', () => {
          throw new Error('监听器异常');
        });
        latest.value?.onAction('table-refresh', secondHandler);
      });

      let result: Awaited<ReturnType<NonNullable<UseTableActionsReturn['emitAction']>>> | undefined;

      await act(async () => {
        result = await latest.value?.emitAction('table-refresh', { interactionType: 'direct' }, latest.context as TableContextValue);
      });

      expect(result?.success).toBe(false);
      expect(result?.results).toHaveLength(2);
      expect(secondHandler).toHaveBeenCalledTimes(1);
    });

    it('应该在确认型交互中于监听器失败后中断剩余链路', async () => {
      const { latest } = renderEventActions();
      const secondHandler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', () => {
          throw new Error('监听器异常');
        });
        latest.value?.onAction('table-refresh', secondHandler);
      });

      let result: Awaited<ReturnType<NonNullable<UseTableActionsReturn['emitAction']>>> | undefined;

      await act(async () => {
        result = await latest.value?.emitAction('table-refresh', { interactionType: 'confirm' }, latest.context as TableContextValue);
      });

      expect(result?.success).toBe(false);
      expect(result?.results).toHaveLength(1);
      expect(secondHandler).not.toHaveBeenCalled();
    });

    it('应该在取消订阅后移除对应监听器', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      let unsubscribe: (() => void) | undefined;
      act(() => {
        unsubscribe = latest.value?.onAction('table-refresh', handler);
      });

      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(1);

      act(() => {
        unsubscribe?.();
      });

      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(0);

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该按监听器 ID 移除指定监听器', () => {
      const { latest } = renderEventActions();

      act(() => {
        latest.value?.onAction('table-refresh', vi.fn());
        latest.value?.onAction('table-refresh', vi.fn());
      });
      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(2);

      const listenerId = latest.value?.getRegisteredActionKeys()['table-refresh']?.listeners?.[0]?.id;
      let removed: boolean | undefined;

      act(() => {
        removed = latest.value?.offAction('table-refresh', listenerId);
      });

      expect(removed).toBe(true);
      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(1);
    });

    it('应该在移除不存在的监听器时返回 false', () => {
      const { latest } = renderEventActions();

      let removed: boolean | undefined;
      act(() => {
        removed = latest.value?.offAction('table-refresh', 'not-exist-id');
      });

      expect(removed).toBe(false);
    });

    it('应该在不传监听器 ID 时移除该 action 的全部监听器', () => {
      const { latest } = renderEventActions();

      act(() => {
        latest.value?.onAction('table-refresh', vi.fn());
        latest.value?.onAction('table-refresh', vi.fn());
      });

      let removed: boolean | undefined;
      act(() => {
        removed = latest.value?.offAction('table-refresh');
      });

      expect(removed).toBe(true);
      expect(latest.value?.getActionListenerCount('table-refresh')).toBe(0);
    });

    it('应该按过滤条件清理监听器并返回清理统计', () => {
      const { latest } = renderEventActions();

      act(() => {
        latest.value?.onAction('table-refresh', vi.fn());
        latest.value?.onAction('table-export', vi.fn());
      });

      let stats: { removedKeys: string[]; totalRemoved: number } | undefined;
      act(() => {
        stats = latest.value?.offAllActions((actionKey) => actionKey === 'table-refresh');
      });

      expect(stats?.removedKeys).toEqual(['table-refresh']);
      expect(stats?.totalRemoved).toBe(1);
      expect(latest.value?.hasActionListeners('table-refresh')).toBe(false);
      expect(latest.value?.hasActionListeners('table-export')).toBe(true);
    });

    it('应该在不传过滤条件时清理全部监听器', () => {
      const { latest } = renderEventActions();

      act(() => {
        latest.value?.onAction('table-refresh', vi.fn());
        latest.value?.onAction('table-export', vi.fn());
      });

      let stats: { removedKeys: string[]; totalRemoved: number } | undefined;
      act(() => {
        stats = latest.value?.offAllActions();
      });

      expect(stats?.totalRemoved).toBe(2);
      expect(stats?.removedKeys).toHaveLength(2);
      expect(latest.value?.getRegisteredActionKeys()).toEqual({});
    });

    it('应该在防抖选项下合并短时间内的重复调用', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler, { debounce: 30 });
      });

      // 连续两次发射 —— 防抖窗口内只会真正执行一次
      act(() => {
        void latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
        void latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 120));
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('应该在节流选项下忽略窗口内的重复调用', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler, { throttle: 10000 });
      });

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });
      expect(handler).toHaveBeenCalledTimes(1);

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该保留事件来源标记供无障碍审计追溯', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler);
      });

      await act(async () => {
        await latest.value?.emitAction('table-refresh', { source: 'user', interactionType: 'direct' }, latest.context as TableContextValue);
      });

      const [data] = handler.mock.calls[0] ?? [];
      expect(data?.source).toBe('user');
      expect(data?.interactionType).toBe('direct');
    });

    it('应该在交互类型缺省时回退为 direct', async () => {
      const { latest } = renderEventActions();
      const handler = vi.fn();

      act(() => {
        latest.value?.onAction('table-refresh', handler);
      });

      await act(async () => {
        await latest.value?.emitAction('table-refresh', {}, latest.context as TableContextValue);
      });

      const [data] = handler.mock.calls[0] ?? [];
      expect(data?.interactionType).toBe('direct');
    });
  });
});
