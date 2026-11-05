import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '../icon-button';

/**
 * IconButton 单元测试
 *
 * 📌 重点锁定两条对外契约：
 * 1. **默认 ghost 样式** —— 无静态背景 / 边框 / 阴影（对齐全库图标按钮约定）；
 * 2. **焦点态** —— 仅键盘导航显示半透明光晕，且**不引入实色 border**。
 */
describe('IconButton', () => {
  describe('渲染', () => {
    it('应渲染为 button 元素且默认 type 为 button', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('应透传 aria-* 属性', () => {
      render(<IconButton aria-label="删除" icon="x-circle" aria-describedby="tip" />);
      const button = screen.getByRole('button', { name: '删除' });
      expect(button).toHaveAttribute('aria-describedby', 'tip');
    });

    it('应支持 children 角标内容', () => {
      render(
        <IconButton aria-label="通知" icon="bell">
          <span data-testid="badge">3</span>
        </IconButton>,
      );
      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });

    it('应支持传入自定义 React 节点作为图标', () => {
      render(
        <IconButton aria-label="自定义">
          <svg data-testid="custom-icon" />
        </IconButton>,
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('默认样式（ghost 约定）', () => {
    it('默认不应带静态背景类', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      // 📌 IconButton 曾默认 `bg-card`，是全库唯一带底色的图标按钮，与 ghost 约定相悖
      expect(button).not.toHaveClass('bg-card');
      expect(button).not.toHaveClass('bg-background');
      expect(button).not.toHaveClass('bg-primary');
      expect(button).not.toHaveClass('bg-muted');
      expect(button).not.toHaveClass('bg-accent');
    });

    it('默认不应带阴影类', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).not.toHaveClass('shadow-sm');
      expect(button).not.toHaveClass('shadow-xs');
    });

    it('默认不应带边框类', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).not.toHaveClass('border');
      expect(button).not.toHaveClass('border-input');
    });

    it('应在 hover 时给出背景反馈（ghost 反馈方式）', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('circle 形状应为圆形，square 形状应为方形', () => {
      const { rerender } = render(<IconButton aria-label="设置" icon="settings" />);
      expect(screen.getByRole('button', { name: '设置' })).toHaveClass('rounded-full');

      rerender(<IconButton aria-label="设置" icon="settings" shape="square" />);
      expect(screen.getByRole('button', { name: '设置' })).toHaveClass('rounded-[var(--radius-md)]');
    });
  });

  describe('焦点态', () => {
    it('应使用 focus-visible 而非 focus（避免鼠标点击后焦点圈常驻）', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      // 📌 `focus:` 会被鼠标点击触发，点击后焦点圈常驻，看起来像「选中态」
      expect(button.className).not.toMatch(/(^|\s)focus:/);
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('焦点指示不得表现为描边 —— 不应使用 ring 或 border 表达焦点', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      // 📌 `ring` 紧贴元素边缘绘制，在圆形按钮上与 `border-radius` 完全重合 —— 视觉就是一圈描边，
      //    会被用户误读为「选中态」。焦点指示必须用绘制在元素之外的 `outline`。
      expect(button.className).not.toMatch(/focus-visible:ring/);
      expect(button.className).not.toMatch(/focus-visible:border/);
      expect(button).not.toHaveClass('border');
    });

    it('焦点指示应为半透明光晕而非实色描边', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('focus-visible:outline-ring/70');
      expect(button).not.toHaveClass('focus-visible:outline-ring');
    });

    it('焦点指示与元素之间应留白（outline-offset）', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('应移除浏览器默认焦点框', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('outline-none');
    });

    it('键盘 Tab 导航后应可获得焦点', async () => {
      const user = userEvent.setup();
      render(
        <>
          <IconButton aria-label="第一个" icon="settings" />
          <IconButton aria-label="第二个" icon="settings" />
        </>,
      );
      await user.tab();
      expect(screen.getByRole('button', { name: '第一个' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: '第二个' })).toHaveFocus();
    });
  });

  describe('className 覆盖', () => {
    it('应用方传入的 className 应覆盖默认样式（twMerge）', () => {
      render(<IconButton aria-label="设置" icon="settings" className="bg-primary/10" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('bg-primary/10');
      // 📌 `bg-primary/10` 与默认的 `hover:bg-accent` 属于**不同分组**（静态 vs hover 修饰），
      //    twMerge 不会互相覆盖 —— 应用方要禁用 hover 反馈需显式传 `hover:bg-transparent`。
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('应用方可通过 className 覆盖默认的 hover 背景', () => {
      render(<IconButton aria-label="设置" icon="settings" className="hover:bg-transparent" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('hover:bg-transparent');
      expect(button).not.toHaveClass('hover:bg-accent');
    });

    it('应用方可通过 className 添加实体背景', () => {
      render(<IconButton aria-label="设置" icon="settings" className="bg-muted shadow-sm" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('bg-muted');
      expect(button).toHaveClass('shadow-sm');
    });

    it('className 应保留在末位（可覆盖前面的默认类）', () => {
      render(<IconButton aria-label="设置" icon="settings" className="rounded-md" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveClass('rounded-md');
      expect(button).not.toHaveClass('rounded-full');
    });
  });

  describe('尺寸', () => {
    it('默认尺寸应为 32px', () => {
      render(<IconButton aria-label="设置" icon="settings" />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveStyle({ width: '32px', height: '32px' });
    });

    it('应支持数字尺寸', () => {
      render(<IconButton aria-label="设置" icon="settings" size={48} />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveStyle({ width: '48px', height: '48px' });
    });

    it('应支持字符串尺寸', () => {
      render(<IconButton aria-label="设置" icon="settings" size="2rem" />);
      const button = screen.getByRole('button', { name: '设置' });
      // 📌 jsdom 的 CSS 解析会把 `rem` 归一化为 `px`（1rem = 16px），故此处断言 `32px`
      expect(button).toHaveStyle({ width: '32px', height: '32px' });
    });

    it('style prop 应可覆盖尺寸', () => {
      render(<IconButton aria-label="设置" icon="settings" size={32} style={{ width: '100px' }} />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toHaveStyle({ width: '100px' });
    });
  });

  describe('交互', () => {
    it('点击应触发 onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<IconButton aria-label="设置" icon="settings" onClick={onClick} />);
      await user.click(screen.getByRole('button', { name: '设置' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('禁用时应不触发 onClick 且带禁用样式', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<IconButton aria-label="设置" icon="settings" disabled onClick={onClick} />);
      const button = screen.getByRole('button', { name: '设置' });
      expect(button).toBeDisabled();
      // 📌 禁用态用 `cursor-not-allowed` 而非 `pointer-events-none` ——
      //    `pointer-events: none` 会让元素对鼠标完全透明，
      //    浏览器解析光标时命中下层元素，`cursor: not-allowed` 永远不会生效。
      expect(button).toHaveClass('cursor-not-allowed');
      expect(button).not.toHaveClass('pointer-events-none');
      expect(button).toHaveClass('opacity-50');
      // 📌 禁用态必须显式压掉 hover 反馈：`:hover` 对 `button:disabled` 依然命中，
      //    否则「禁用 + 悬停」仍会浮出 `bg-accent` 背景、文字变 `accent-foreground`。
      //    `disabled:hover:*`（0,2,0）也能压过调用方 className 里的自定义 hover（0,1,0）。
      expect(button).toHaveClass('disabled:hover:bg-transparent');
      expect(button).toHaveClass('disabled:hover:text-current');
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('ref 转发', () => {
    it('应把 ref 转发到 button 元素', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<IconButton ref={ref} aria-label="设置" icon="settings" />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });
});
