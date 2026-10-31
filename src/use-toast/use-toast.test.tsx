import { render, screen, act } from '@testing-library/react';
import { useToast } from './use-toast';
import { Toast, ToastProvider, ToastTitle, ToastViewport } from '../toast';
import { vi } from 'vitest';

test('应正确显示和隐藏Toast', async () => {
  vi.useFakeTimers();

  try {
    const TestComponent = () => {
      const { toast } = useToast();
      return (
        <button type="button" onClick={() => toast({ title: '测试' })}>
          触发
        </button>
      );
    };

    // 渲染 useToast 队列中的 Toast（Toaster 组件）
    // 注意：useToast 只维护状态队列，本身不渲染任何内容，必须配合 Toaster 才有 DOM
    const Toaster = () => {
      const { toasts } = useToast();
      return (
        <>
          {toasts.map((t) => (
            <Toast key={t.id} variant={t.variant} duration={t.duration} onOpenChange={t.onOpenChange} open={t.open}>
              <ToastTitle>{t.title}</ToastTitle>
            </Toast>
          ))}
        </>
      );
    };

    render(
      <ToastProvider>
        {/* Radix Toast 必须挂在 ToastViewport 之下，否则 ToastRoot 不渲染内容 */}
        <ToastViewport />
        <TestComponent />
        <Toaster />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText('触发').click();
    });

    // 注意：此处不能用 findByText/waitFor（内部使用真实定时器轮询，与假定时器冲突会死锁）
    expect(screen.getByText('测试')).toBeInTheDocument();

    // 推进到 Toast 的移除延迟（TOAST_REMOVE_DELAY = 10000ms）之后
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('测试')).not.toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});
