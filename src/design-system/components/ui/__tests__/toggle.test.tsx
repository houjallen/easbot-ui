/**
 * Toggle 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能、变体与尺寸类名
 * 2. 状态测试 - 验证开启/关闭状态、禁用态
 * 3. 交互测试 - 验证点击与键盘触发的状态切换与回调
 * 4. 无障碍测试 - 验证语义角色、aria-pressed、焦点管理
 * 5. 边界测试 - 验证受控模式、空 children、额外透传属性
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Toggle, toggleVariants } from '../toggle';

describe('Toggle 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染切换按钮', () => {
      render(<Toggle>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('data-slot', 'toggle');
    });

    it('应该正确应用默认变体与尺寸类名', () => {
      render(<Toggle>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      expect(toggle).toHaveClass('bg-transparent');
      expect(toggle).toHaveClass('h-9');
      expect(toggle).toHaveClass('min-w-9');
      expect(toggle).toHaveClass('px-2');
    });

    it('应该正确应用 outline 变体类名', () => {
      render(<Toggle variant="outline">轮廓</Toggle>);

      const toggle = screen.getByRole('button', { name: '轮廓' });
      expect(toggle).toHaveClass('border');
      expect(toggle).toHaveClass('border-input');
      expect(toggle).toHaveClass('bg-transparent');
      expect(toggle).toHaveClass('shadow-xs');
    });

    it('应该正确应用 sm 尺寸类名', () => {
      render(<Toggle size="sm">小号</Toggle>);

      const toggle = screen.getByRole('button', { name: '小号' });
      expect(toggle).toHaveClass('h-8');
      expect(toggle).toHaveClass('min-w-8');
      expect(toggle).toHaveClass('px-1.5');
    });

    it('应该正确应用 lg 尺寸类名', () => {
      render(<Toggle size="lg">大号</Toggle>);

      const toggle = screen.getByRole('button', { name: '大号' });
      expect(toggle).toHaveClass('h-10');
      expect(toggle).toHaveClass('min-w-10');
      expect(toggle).toHaveClass('px-2.5');
    });

    it('应该正确合并自定义类名', () => {
      render(<Toggle className="custom-class">自定义</Toggle>);

      const toggle = screen.getByRole('button', { name: '自定义' });
      expect(toggle).toHaveClass('custom-class');
      expect(toggle).toHaveClass('h-9');
    });

    it('应该正确导出 toggleVariants 并生成类名', () => {
      expect(toggleVariants({ variant: 'outline', size: 'lg' })).toContain('border-input');
      expect(toggleVariants({ size: 'sm' })).toContain('h-8');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(<Toggle>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      expect(toggle).toHaveAttribute('data-state', 'off');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('应该在受控开启状态下渲染 data-state 为 on', () => {
      render(<Toggle pressed>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      expect(toggle).toHaveAttribute('data-state', 'on');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('应该在禁用状态下渲染 data-disabled 与 disabled 属性', () => {
      render(<Toggle disabled>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      expect(toggle).toBeDisabled();
      expect(toggle).toHaveAttribute('data-disabled');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('应该在受控关闭状态下渲染 data-state 为 off', () => {
      render(<Toggle pressed={false}>切换</Toggle>);

      expect(screen.getByRole('button', { name: '切换' })).toHaveAttribute('data-state', 'off');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时切换状态并触发回调', () => {
      const handleChange = vi.fn();
      render(<Toggle onPressedChange={handleChange}>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      fireEvent.click(toggle);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(toggle).toHaveAttribute('data-state', 'on');
    });

    it('应该在再次点击时切回关闭状态', () => {
      const handleChange = vi.fn();
      render(<Toggle onPressedChange={handleChange}>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      fireEvent.click(toggle);
      fireEvent.click(toggle);

      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(toggle).toHaveAttribute('data-state', 'off');
    });

    it('应该在按下空格键时切换状态', () => {
      const handleChange = vi.fn();
      render(<Toggle onPressedChange={handleChange}>切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '切换' });
      toggle.focus();
      // Radix 的 Toggle 只监听 `click`；真实浏览器在空格键上会合成 click 事件，
      // jsdom 不会合成，因此这里显式模拟浏览器的行为。
      fireEvent.keyDown(toggle, { key: ' ', code: 'Space' });
      fireEvent.click(toggle);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('应该在禁用状态下不触发回调', () => {
      const handleChange = vi.fn();
      render(
        <Toggle disabled onPressedChange={handleChange}>
          切换
        </Toggle>,
      );

      fireEvent.click(screen.getByRole('button', { name: '切换' }));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 button 语义角色', () => {
      render(<Toggle>无障碍切换</Toggle>);

      expect(screen.getByRole('button', { name: '无障碍切换' })).toBeInTheDocument();
    });

    it('应该通过 aria-pressed 暴露按下状态', () => {
      render(<Toggle pressed>无障碍切换</Toggle>);

      expect(screen.getByRole('button', { name: '无障碍切换' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('应该支持通过键盘获得焦点', () => {
      render(<Toggle>无障碍切换</Toggle>);

      const toggle = screen.getByRole('button', { name: '无障碍切换' });
      toggle.focus();
      expect(toggle).toHaveFocus();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Toggle aria-label="切换加粗" />);

      expect(screen.getByRole('button', { name: '切换加粗' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染没有 children 的按钮', () => {
      render(<Toggle aria-label="空切换" />);

      const toggle = screen.getByRole('button', { name: '空切换' });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('data-state', 'off');
    });

    it('应该在受控模式下保持外部传入的状态', () => {
      const handleChange = vi.fn();
      render(
        <Toggle pressed={false} onPressedChange={handleChange}>
          切换
        </Toggle>,
      );

      const toggle = screen.getByRole('button', { name: '切换' });
      fireEvent.click(toggle);

      expect(handleChange).toHaveBeenCalledWith(true);
      // 受控模式下状态由外部决定，组件本身不会自行变更
      expect(toggle).toHaveAttribute('data-state', 'off');
    });

    it('应该透传额外的 data-* 属性', () => {
      render(<Toggle data-custom="value">自定义</Toggle>);

      expect(screen.getByRole('button', { name: '自定义' })).toHaveAttribute('data-custom', 'value');
    });
  });
});
