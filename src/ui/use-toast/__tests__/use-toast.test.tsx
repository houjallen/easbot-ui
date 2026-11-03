/**
 * useToast Hook 单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 状态测试 - 验证 Hook 返回值与内存队列的增删
 * 2. 交互测试 - 验证 `toast()` / `dismiss()` 回调与状态变更
 * 3. 无障碍测试 - 验证渲染出的通知暴露 status 语义角色
 *
 * 说明：`useToast` 只维护内存状态，真正的 DOM 渲染由 `Toaster` 组件承担，
 * 因此本文件聚焦「Hook 返回值与订阅」，渲染相关断言放在 `toaster.test.tsx`。
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { Toast, ToastProvider, ToastViewport } from '../../toast/toast';
import { useToast } from '../use-toast';

/**
 * 订阅 useToast 状态并把通知渲染到 DOM 的测试载体
 */
const ToastStateProbe = ({ onReady }: { onReady: (state: ReturnType<typeof useToast>) => void }) => {
  const state = useToast();
  onReady(state);
  return (
    <ToastProvider>
      {state.toasts.map((item) => (
        <Toast key={item.id} title={item.title} description={item.description} variant={item.variant} />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
};

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 状态测试
  describe('状态测试', () => {
    it('应该在初始状态下返回空的toasts列表', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      expect(state?.toasts).toEqual([]);
    });

    it('应该在调用toast后把通知加入队列', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      act(() => {
        state?.toast({ title: '入队通知' });
      });

      expect(state?.toasts).toHaveLength(1);
      expect(state?.toasts[0]?.title).toBe('入队通知');
    });

    it('应该在调用dismiss后把通知标记为关闭', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      let toastId = '';
      act(() => {
        toastId = state?.toast({ title: '待关闭通知' }).id ?? '';
      });

      act(() => {
        state?.dismiss(toastId);
      });

      expect(state?.toasts[0]?.open).toBe(false);
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该在渲染的DOM中呈现通知标题与描述', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      act(() => {
        state?.toast({ title: '渲染标题', description: '渲染描述' });
      });

      expect(screen.getByText('渲染标题')).toBeInTheDocument();
      expect(screen.getByText('渲染描述')).toBeInTheDocument();
    });

    it('应该支持不同的变体类型', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      act(() => {
        state?.toast({ title: '成功通知', variant: 'success' });
      });

      expect(screen.getByText('成功通知').closest('li')).toHaveClass('border-green-400');
    });

    it('应该支持不同的位置', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      act(() => {
        state?.toast({ title: '定位通知', position: 'top-left' });
      });

      expect(state?.toasts[0]?.position).toBe('top-left');
    });

    it('应该在dismiss后从队列中移除通知', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      let toastId = '';
      act(() => {
        toastId = state?.toast({ title: '待移除通知' }).id ?? '';
      });

      act(() => {
        state?.dismiss(toastId);
      });

      // DISMISS 后进入移除延迟队列，推进定时器后条目才真正被移除
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(state?.toasts).toHaveLength(0);
    });

    it('应该支持自定义样式', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      act(() => {
        state?.toast({
          title: '自定义样式',
          style: {
            '--toast-background': 'var(--primary)',
          },
        });
      });

      expect(state?.toasts[0]?.style?.['--toast-background']).toBe('var(--primary)');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该暴露status语义角色', () => {
      let state: ReturnType<typeof useToast> | undefined;
      render(<ToastStateProbe onReady={(s) => (state = s)} />);

      act(() => {
        state?.toast({ title: '无障碍通知' });
      });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
