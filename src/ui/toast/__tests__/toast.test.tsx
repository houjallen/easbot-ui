/**
 * Toast 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Toast 在 Viewport 内的基本渲染与标题 / 描述
 * 2. 变体测试 - 验证不同样式变体类名的应用
 * 3. 状态测试 - 验证打开状态与关闭后的移除行为
 * 4. 交互测试 - 验证关闭按钮点击与 onClose 回调
 * 5. 无障碍测试 - 验证 listitem 语义角色与 aria 属性透传
 *
 * 说明：Radix Toast 的 `Root` 必须挂载在 `Viewport` 之内才会渲染到 DOM；
 * 关闭后 Radix 会把 `li` 节点从列表中移除，因此关闭行为用「节点消失」断言。
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { Toast, ToastProvider, ToastViewport } from '../toast';

/**
 * Toast 的渲染载体
 *
 * @description
 * Radix Toast 的 `Root` 必须挂载在 `Viewport` 之内才会渲染到 DOM，
 * 因此测试统一通过本包装组件提供 Provider + Viewport 结构。
 */
const TestToast = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
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

    it('应该正确渲染标题与描述', () => {
      render(
        <TestToast>
          <Toast title="通知标题" description="通知描述" />
        </TestToast>,
      );
      expect(screen.getByText('通知标题')).toBeInTheDocument();
      expect(screen.getByText('通知描述')).toBeInTheDocument();
    });

    it('应该支持不同变体样式', () => {
      render(
        <TestToast>
          <Toast variant="destructive">
            <div>错误提示</div>
          </Toast>
        </TestToast>,
      );
      const toast = screen.getByText('错误提示').closest('li');
      expect(toast).toHaveClass('border-destructive');
    });

    it('应正确应用成功样式变体', () => {
      render(
        <TestToast>
          <Toast variant="success">
            <div>成功提示</div>
          </Toast>
        </TestToast>,
      );
      const toast = screen.getByText('成功提示').closest('li');
      expect(toast).toHaveClass('border-green-400');
      expect(toast).toHaveClass('bg-green-50');
    });

    it('应该正确应用默认变体样式', () => {
      render(
        <TestToast>
          <Toast>
            <div>默认提示</div>
          </Toast>
        </TestToast>,
      );
      const toast = screen.getByText('默认提示').closest('li');
      expect(toast).toHaveClass('bg-card');
      expect(toast).toHaveClass('text-card-foreground');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应该默认渲染为打开状态', () => {
      render(
        <TestToast>
          <Toast title="状态测试" />
        </TestToast>,
      );
      expect(screen.getByText('状态测试').closest('li')).toHaveAttribute('data-state', 'open');
    });

    it('应该在关闭后从列表中移除通知', () => {
      render(
        <TestToast>
          <Toast title="关闭测试" />
        </TestToast>,
      );

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.queryByText('关闭测试')).not.toBeInTheDocument();
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该在点击关闭按钮时触发 onClose 回调', () => {
      const onClose = vi.fn();
      render(
        <TestToast>
          <Toast title="关闭回调" onClose={onClose} />
        </TestToast>,
      );

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('应该在指定时间后自动关闭', () => {
      render(
        <TestToast>
          <Toast title="自动关闭" duration={3000} />
        </TestToast>,
      );

      expect(screen.getByText('自动关闭')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.queryByText('自动关闭')).not.toBeInTheDocument();
    });
  });

  // 布局测试
  describe('布局测试', () => {
    it('关闭按钮不应使用绝对定位（避免压住内容文字）', () => {
      render(
        <TestToast>
          <Toast title="布局测试" description="这是一段描述文案" />
        </TestToast>,
      );

      const closeButton = screen.getByRole('button');

      // 📌 此前关闭按钮带 `eas-close-btn`（`position: absolute`），
      //    会脱离 flex 流直接压在内容上 —— 表现为「关闭按钮与内容重合」。
      expect(closeButton.className).not.toContain('eas-close-btn');
    });

    it('关闭按钮应位于右侧居中（与内容同行）', () => {
      render(
        <TestToast>
          <Toast title="布局测试" />
        </TestToast>,
      );

      const closeButton = screen.getByRole('button');

      // 📌 关闭按钮参与 flex 布局，位于**右侧居中** ——
      //    与内容的「标题 + 一行描述」在同一水平线上，
      //    容器用 `items-center` 对齐，无需 `pt-9` 预留顶部空白。
      expect(closeButton).toHaveClass('self-center');
      expect(closeButton).toHaveClass('shrink-0');
      expect(closeButton).not.toHaveClass('absolute');
    });

    it('关闭按钮应与 Dialog 一致：方角、无内边距、24px 方形', () => {
      render(
        <TestToast>
          <Toast title="样式测试" />
        </TestToast>,
      );

      const closeButton = screen.getByRole('button');

      // 📌 形状 `rounded-xs`（方角，`!` 前缀强制覆盖 CloseButton 自带的 `rounded-md`）
      expect(closeButton).toHaveClass('!rounded-xs');
      expect(closeButton).not.toHaveClass('rounded-full');
      // 📌 内边距清零（覆盖 CloseButton 自带的 `p-0.5`）
      expect(closeButton).toHaveClass('p-0');
      // 📌 尺寸 24×24（可访问性点击热区要求）
      expect(closeButton).toHaveClass('size-6');
    });

    it('内容区应可收缩并占据剩余空间（为关闭按钮留出位置）', () => {
      render(
        <TestToast>
          <Toast title="布局测试" description="这是一段描述文案" />
        </TestToast>,
      );

      const closeButton = screen.getByRole('button');
      // 内容区 = 关闭按钮的前一个兄弟节点
      const content = closeButton.previousElementSibling;

      expect(content).not.toBeNull();
      expect(content).toHaveClass('min-w-0');
      expect(content).toHaveClass('flex-1');
      // 📌 关闭按钮参与布局（自身占位），无需再预留右侧留白
      expect(content).not.toHaveClass('pr-10');
    });

    it('容器应垂直居中对齐内容与关闭按钮，且不预留顶部空白', () => {
      render(
        <TestToast>
          <Toast title="布局测试" description="这是一段描述文案" />
        </TestToast>,
      );

      const item = screen.getByRole('listitem');

      // 📌 `items-center` 让内容与关闭按钮在同一水平线上
      expect(item).toHaveClass('items-center');
      // 📌 不再需要 `pt-9` 为右上角按钮预留顶部空白
      expect(item).not.toHaveClass('pt-9');
    });

    it('Toast 应设置最小宽度（短文案时也有舒适排版空间）', () => {
      render(
        <TestToast>
          <Toast title="成功" />
        </TestToast>,
      );

      // 📌 宽度区间 **[240px, 350px]**：
      //    下限保证短文案不缩成窄条，上限兼顾移动端与阅读行长。
      expect(screen.getByRole('listitem')).toHaveClass('w-[var(--toast-min-width)]');
      expect(screen.getByRole('listitem')).toHaveClass('max-w-[var(--toast-max-width)]');
    });

    it('Toast 不应注入覆盖组件样式的内联 maxWidth / padding / gap', () => {
      render(
        <TestToast>
          <Toast title="成功" />
        </TestToast>,
      );

      // 📌 内联 style 优先级高于 class ——
      //    此前 `use-toast` 注入 `maxWidth` / `padding` / `gap` 内联样式，
      //    会**静默覆盖**组件的 `max-w-[var(--toast-max-width)]` 与
      //    `px-[var(--eas-gap-lg)] py-[var(--eas-gap-sm)]`，
      //    表现为「最大宽度失效」与「内边距不一致」。
      const item = screen.getByRole('listitem');
      const inline = item.getAttribute('style') ?? '';
      expect(inline).not.toMatch(/max-width/);
      expect(inline).not.toMatch(/padding/);
      expect(inline).not.toMatch(/gap/);
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该暴露listitem语义角色', () => {
      render(
        <TestToast>
          <Toast title="语义角色" />
        </TestToast>,
      );
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('应该暴露region语义角色的通知视口', () => {
      render(
        <TestToast>
          <Toast title="视口语义" />
        </TestToast>,
      );
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('应该支持键盘操作', () => {
      const onClose = vi.fn();
      render(
        <TestToast>
          <Toast title="键盘测试" onClose={onClose} />
        </TestToast>,
      );

      const closeButton = screen.getByRole('button');
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // 原生 button 上按 Enter 会触发 click，这里以 click 模拟键盘激活
      act(() => {
        fireEvent.click(closeButton);
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('应该有正确的aria属性', () => {
      render(
        <TestToast>
          <Toast title="ARIA测试" aria-label="通知" />
        </TestToast>,
      );
      expect(screen.getByLabelText('通知')).toBeInTheDocument();
      expect(screen.getByLabelText('通知')).toHaveAttribute('aria-label', '通知');
    });
  });
});
