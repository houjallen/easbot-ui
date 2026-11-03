/**
 * Toaster 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 `toast()` 调用后通知出现在 DOM 中
 * 2. 变体测试 - 验证不同 variant 对应的类名
 * 3. 位置测试 - 验证 `position` 影响 ToastViewport 的定位类名
 * 4. 交互测试 - 验证关闭按钮可移除通知
 * 5. 无障碍测试 - 验证通知视口暴露 region 语义角色
 *
 * 说明：Radix Toast 的 `Root` 必须挂载在 `Viewport` 之内才会渲染到 DOM，
 * 关闭后 Radix 会把通知节点从列表中移除，因此关闭行为用「节点消失」断言。
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { toast, useToast } from '../../use-toast/use-toast';
import { Toaster } from '../toaster';

describe('Toaster 组件', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 清空模块级 toast 队列，避免用例之间互相污染
    act(() => {
      toast({ title: '清理占位' });
    });
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  // 渲染测试
  describe('渲染测试', () => {
    it('应该在调用toast后渲染通知标题', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '通知标题' });
      });

      expect(screen.getByText('通知标题')).toBeInTheDocument();
    });

    it('应该同时渲染通知描述', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '标题内容', description: '描述内容' });
      });

      expect(screen.getByText('标题内容')).toBeInTheDocument();
      expect(screen.getByText('描述内容')).toBeInTheDocument();
    });

    it('应该渲染ToastViewport容器', () => {
      render(<Toaster />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('应该在未传title时使用variant对应的默认标题', () => {
      render(<Toaster />);

      act(() => {
        toast({ variant: 'success' });
      });

      // 内置文案表 `toastMessages.success` 的 zh-CN 取值
      expect(screen.getByText('成功')).toBeInTheDocument();
    });
  });

  // 变体测试
  describe('变体测试', () => {
    it('应该应用success变体的类名', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '成功通知', variant: 'success' });
      });

      const item = screen.getByText('成功通知').closest('li');
      expect(item).toHaveClass('border-green-400');
      expect(item).toHaveClass('bg-green-50');
    });

    it('应该应用destructive变体的类名', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '失败通知', variant: 'destructive' });
      });

      const item = screen.getByText('失败通知').closest('li');
      expect(item).toHaveClass('border-destructive');
    });

    it('应该应用default变体的类名', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '默认通知' });
      });

      const item = screen.getByText('默认通知').closest('li');
      expect(item).toHaveClass('bg-card');
      expect(item).toHaveClass('text-card-foreground');
    });
  });

  // 位置测试
  describe('位置测试', () => {
    it('Viewport 应退化为全屏透明容器（不承担角落定位）', () => {
      render(<Toaster />);

      const viewport = screen.getByRole('list');
      // 📌 定位已下沉到每条通知自身 —— Viewport 只提供 `fixed` 包含块
      //    与 Radix 的焦点代理 / 键盘导航能力。
      expect(viewport).toHaveClass('fixed');
      expect(viewport).toHaveClass('inset-0');
      expect(viewport).toHaveClass('pointer-events-none');
      // 📌 不再出现旧的角落定位类
      expect(viewport).not.toHaveClass('bottom-0');
      expect(viewport).not.toHaveClass('right-0');
      expect(viewport).not.toHaveClass('flex-col-reverse');
    });

    it('单条通知的 position 应决定其自身定位类名', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '左上通知', position: 'top-left' });
      });

      const item = screen.getByText('左上通知').closest('li');
      expect(item).toHaveClass('fixed');
      expect(item).toHaveClass('top-[var(--eas-gap-lg)]');
      expect(item).toHaveClass('left-[var(--eas-gap-lg)]');
    });

    it('单条通知未指定 position 时应回退到 Toaster 的默认位置', () => {
      render(<Toaster position="top-center" />);

      act(() => {
        toast({ title: '顶部通知' });
      });

      const item = screen.getByText('顶部通知').closest('li');
      expect(item).toHaveClass('fixed');
      expect(item).toHaveClass('top-[var(--eas-gap-lg)]');
      expect(item).toHaveClass('left-1/2');
      expect(item).toHaveClass('-translate-x-1/2');
    });

    it('单条通知的 position 应优先于 Toaster 的默认位置', () => {
      render(<Toaster position="top-left" />);

      act(() => {
        toast({ title: '右下通知', position: 'bottom-right' });
      });

      const item = screen.getByText('右下通知').closest('li');
      expect(item).toHaveClass('fixed');
      expect(item).toHaveClass('bottom-[var(--eas-gap-lg)]');
      expect(item).toHaveClass('right-[var(--eas-gap-lg)]');
      expect(item).not.toHaveClass('top-[var(--eas-gap-lg)]');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该在点击关闭按钮后移除通知', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '待关闭通知' });
      });

      expect(screen.getByText('待关闭通知')).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.queryByText('待关闭通知')).not.toBeInTheDocument();
    });

    it('应该在通知超时后移除通知', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '超时通知' });
      });

      expect(screen.getByText('超时通知')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.queryByText('超时通知')).not.toBeInTheDocument();
    });

    it('应该在连续调用toast后只保留最新一条通知', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '第一条通知' });
      });
      act(() => {
        toast({ title: '第二条通知' });
      });

      // `TOAST_LIMIT = 1`，队列只保留最新一条
      expect(screen.queryByText('第一条通知')).not.toBeInTheDocument();
      expect(screen.getByText('第二条通知')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('应该在调用dismiss后关闭指定的通知', () => {
      let dismiss: ((toastId?: string) => void) | undefined;

      /** 订阅 useToast 的 dismiss 能力（Hook 必须在组件内调用） */
      const DismissProbe = () => {
        dismiss = useToast().dismiss;
        return null;
      };

      render(
        <>
          <DismissProbe />
          <Toaster />
        </>,
      );

      let toastId = '';
      act(() => {
        toastId = toast({ title: '待关闭指定通知' }).id;
      });

      expect(screen.getByText('待关闭指定通知')).toBeInTheDocument();

      act(() => {
        dismiss?.(toastId);
      });

      expect(screen.queryByText('待关闭指定通知')).not.toBeInTheDocument();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该暴露region语义角色的通知视口', () => {
      render(<Toaster />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('应该为关闭按钮提供可访问角色', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '带关闭按钮的通知' });
      });

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('应该暴露status语义角色承载通知内容', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '状态通知' });
      });

      // Radix Toast 把 `role="status"` 放在独立的 live-region（ToastAnnounce）上，
      // 用于向读屏软件播报通知内容
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-live');
    });

    it('应该为关闭按钮提供可访问名称', () => {
      render(<Toaster />);

      act(() => {
        toast({ title: '带关闭按钮的通知' });
      });

      // 内置文案表 `toastMessages.closeAriaLabel` 的 zh-CN 取值
      expect(screen.getByRole('button', { name: '关闭通知' })).toBeInTheDocument();
    });
  });
});
