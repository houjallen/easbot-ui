/**
 * Toaster 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Toast 容器的基本渲染与类名
 * 2. 状态测试 - 验证主题跟随（light / dark）与自定义属性
 * 3. 交互测试 - 验证调用 toast 后提示被渲染与关闭
 * 4. 无障碍测试 - 验证通知容器的 aria 属性与实时区域语义
 * 5. 边界测试 - 验证透传属性、无 Provider 时的降级行为
 *
 * @remarks
 * 基于 `sonner` v2 —— `Toaster` 渲染一个 `aria-live` 的通知区域，
 * 提示内容通过 `toast()` API 推入（sonner 的全局单例）。
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { vi } from 'vitest';

import { Toaster } from '../sonner';
import { ThemeProvider } from '../../../providers/theme-provider';

describe('Toaster 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染通知容器', () => {
      render(<Toaster />);

      const region = document.querySelector('[aria-label="Notifications alt+T"]');
      expect(region).toBeInTheDocument();
      expect(region?.tagName).toBe('SECTION');
    });

    it('应该为通知容器应用 toaster 类名', async () => {
      render(<Toaster />);

      // sonner v2 把 className 应用在承载提示列表的 `<ol>` 上，
      // 该元素只有在存在提示时才会渲染。
      act(() => {
        toast('带类名的提示');
      });

      await waitFor(() => {
        expect(document.querySelector('.toaster')).toBeInTheDocument();
      });
    });

    it('应该为通知列表注入主题相关的 CSS 变量', async () => {
      render(<Toaster />);

      act(() => {
        toast('带变量的提示');
      });

      await waitFor(() => {
        const list = document.querySelector('[data-sonner-toaster]') as HTMLElement;
        expect(list.style.getPropertyValue('--normal-bg')).toBe('var(--popover)');
        expect(list.style.getPropertyValue('--normal-text')).toBe('var(--popover-foreground)');
        expect(list.style.getPropertyValue('--normal-border')).toBe('var(--border)');
      });
    });
  });

  describe('状态测试', () => {
    it('应该在亮色主题下渲染通知容器', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <Toaster />
        </ThemeProvider>,
      );

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toBeInTheDocument();
    });

    it('应该在暗色主题下渲染通知容器', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <Toaster />
        </ThemeProvider>,
      );

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toBeInTheDocument();
    });

    it('应该在没有 Provider 时降级为亮色主题', () => {
      render(<Toaster />);

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toBeInTheDocument();
    });

    it('应该透传 position 属性到通知容器', () => {
      render(<Toaster position="bottom-right" />);

      const region = document.querySelector('[aria-label="Notifications alt+T"]') as HTMLElement;
      expect(region).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在调用 toast 后渲染提示内容', async () => {
      render(<Toaster />);

      act(() => {
        toast('保存成功');
      });

      await waitFor(() => {
        expect(screen.getByText('保存成功')).toBeInTheDocument();
      });
    });

    it('应该在调用带描述的 toast 后渲染描述内容', async () => {
      render(<Toaster />);

      act(() => {
        toast('操作失败', { description: '请稍后重试' });
      });

      await waitFor(() => {
        expect(screen.getByText('请稍后重试')).toBeInTheDocument();
      });
    });

    it('应该在调用 toast.dismiss 后移除提示内容', async () => {
      render(<Toaster />);

      act(() => {
        toast('即将关闭');
      });

      await waitFor(() => {
        expect(screen.getByText('即将关闭')).toBeInTheDocument();
      });

      act(() => {
        toast.dismiss();
      });

      await waitFor(() => {
        expect(screen.queryByText('即将关闭')).not.toBeInTheDocument();
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该为通知容器设置 aria-live 为 polite', () => {
      render(<Toaster />);

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toHaveAttribute('aria-live', 'polite');
    });

    it('应该为通知容器设置 aria-atomic 为 false', () => {
      render(<Toaster />);

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toHaveAttribute('aria-atomic', 'false');
    });

    it('应该为通知容器设置 aria-relevant', () => {
      render(<Toaster />);

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toHaveAttribute('aria-relevant', 'additions text');
    });

    it('应该为通知容器提供可访问名称', () => {
      render(<Toaster />);

      expect(screen.getByLabelText('Notifications alt+T')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的提示容器', () => {
      render(<Toaster />);

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toBeInTheDocument();
    });

    it('应该透传额外的 className 到通知列表', async () => {
      render(<Toaster className="custom-toaster" />);

      act(() => {
        toast('自定义类名的提示');
      });

      await waitFor(() => {
        expect(document.querySelector('[data-sonner-toaster]')).toHaveClass('custom-toaster');
      });
    });

    it('应该允许渲染空的提示容器', () => {
      render(<Toaster />);

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toBeInTheDocument();
    });

    it('应该透传 richColors 与 closeButton 属性', () => {
      render(<Toaster richColors closeButton />);

      expect(document.querySelector('[aria-label="Notifications alt+T"]')).toBeInTheDocument();
    });

    it('应该在多次调用 toast 后渲染多条提示', async () => {
      const handleError = vi.fn();
      render(<Toaster />);

      act(() => {
        toast('第一条');
        toast('第二条');
      });

      await waitFor(() => {
        expect(screen.getByText('第一条')).toBeInTheDocument();
        expect(screen.getByText('第二条')).toBeInTheDocument();
      });
      expect(handleError).not.toHaveBeenCalled();
    });
  });
});
