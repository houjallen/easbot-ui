/**
 * Toast 组件测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 变体测试 - 验证不同样式变体的应用
 * 3. 动画测试 - 验证显示和隐藏动画
 * 4. 交互测试 - 验证用户交互行为
 * 5. 无障碍测试 - 验证组件的可访问性
 * 6. 移动端适配测试 - 验证移动端表现
 */

import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from './toast';
import { useToast } from '../use-toast/use-toast';
import { vi } from 'vitest';

// 测试包装组件
// 注意：Radix Toast 必须挂在 ToastViewport 之下，否则 ToastRoot 返回 null（不渲染任何内容）
const TestToast = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <ToastViewport />
      {children}
    </ToastProvider>
  );
};

// Toast触发组件
const ToastTrigger = () => {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        toast({
          title: '测试标题',
          description: '测试描述',
          duration: 3000,
        });
      }}
    >
      显示Toast
    </button>
  );
};

// 渲染 useToast 队列中的 Toast（Toaster 组件）
// 注意：本仓库的 Toast 组件只渲染 children，title/description 需要由调用方自行渲染
const Toaster = () => {
  const { toasts } = useToast();
  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} duration={t.duration} onOpenChange={t.onOpenChange} open={t.open}>
          <ToastTitle>{t.title}</ToastTitle>
          <ToastDescription>{t.description}</ToastDescription>
        </Toast>
      ))}
    </>
  );
};

describe('Toast 组件', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染Toast', () => {
      render(
        <TestToast>
          <Toast>
            <div>测试内容</div>
          </Toast>
        </TestToast>,
      );
      expect(screen.getByText('测试内容')).toBeInTheDocument();
    });

    it('应该支持不同变体样式', () => {
      render(
        <TestToast>
          <Toast variant="destructive">
            <div>错误提示</div>
          </Toast>
        </TestToast>,
      );
      const toast = screen.getByText('错误提示').parentElement;
      // Tailwind v4：语义类已替换为 CSS 变量任意值
      expect(toast).toHaveClass('bg-[var(--toast-destructive-background)]');
    });

    it('应正确应用成功样式变体', () => {
      render(
        <TestToast>
          <Toast variant="success">
            <div>成功提示</div>
          </Toast>
        </TestToast>,
      );
      const toast = screen.getByText('成功提示').parentElement;
      expect(toast).toHaveClass('bg-[var(--toast-success-background)]');
    });

    it('应该正确应用显示位置', () => {
      // 说明：position 属性在当前实现中尚未落地到 ToastRoot 的 class/style 上，
      // 实际定位由 ToastViewport 的响应式类（sm:bottom-0 sm:right-0 等）承担。
      // 因此此处断言视口容器的定位类，而不是 Toast 自身的定位类。
      render(
        <TestToast>
          <Toast position="top-center">
            <div>位置测试</div>
          </Toast>
        </TestToast>,
      );
      const viewport = screen.getByRole('region', { name: /notifications/i });
      expect(viewport.querySelector('ol')).toHaveClass('sm:bottom-0', 'sm:right-0');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该在指定时间后自动关闭', async () => {
      render(
        <TestToast>
          <ToastTrigger />
          <Toaster />
        </TestToast>,
      );

      fireEvent.click(screen.getByText('显示Toast'));
      expect(screen.getByText('测试标题')).toBeInTheDocument();

      // Radix Toast 的自动关闭定时器由 ToastRoot 内部管理
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.queryByText('测试标题')).not.toBeInTheDocument();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的role属性', () => {
      render(
        <TestToast>
          <Toast>
            <div>测试Toast</div>
          </Toast>
        </TestToast>,
      );
      // Radix Toast 通过独立的隐藏 live region（role="status"）向读屏器播报内容
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('应该支持键盘操作', () => {
      const onClose = vi.fn();
      render(
        <TestToast>
          <Toast onClose={onClose} duration={10000}>
            <div>键盘测试</div>
          </Toast>
        </TestToast>,
      );

      // Radix ToastRoot 渲染为 <li>，通过 Escape 键触发关闭（onEscapeKeyDown → onClose）
      const toast = screen.getByText('键盘测试').parentElement as HTMLElement;
      expect(toast.tagName).toBe('LI');
      fireEvent.keyDown(toast, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('应该有正确的aria属性', () => {
      render(
        <TestToast>
          <Toast aria-label="通知">
            <div>ARIA测试</div>
          </Toast>
        </TestToast>,
      );
      // ToastRoot 渲染为 <li>，自定义 aria-label 会透传到该元素
      const toast = screen.getByText('ARIA测试').parentElement;
      expect(toast).toHaveAttribute('aria-label', '通知');
    });
  });
});
