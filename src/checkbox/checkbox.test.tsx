/**
 * Checkbox 组件单元测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 状态测试 - 验证不同状态的展示
 * 3. 交互测试 - 验证用户交互行为
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './checkbox';
import { vi } from 'vitest';

describe('Checkbox 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染基础复选框', () => {
      render(<Checkbox>测试选项</Checkbox>);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('测试选项')).toBeInTheDocument();
    });

    it('应该正确渲染带描述的复选框', () => {
      render(<Checkbox description="这是描述文本">测试选项</Checkbox>);
      expect(screen.getByText('这是描述文本')).toBeInTheDocument();
    });

    it('应该正确渲染错误状态', () => {
      render(<Checkbox error="这是错误信息">测试选项</Checkbox>);
      expect(screen.getByText('这是错误信息')).toHaveClass('text-destructive');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应该正确应用默认变体样式', () => {
      render(<Checkbox variant="default">默认样式</Checkbox>);
      // default 变体的边框为 gray-400；border-primary 仅在 data-[state=checked] 时生效
      expect(screen.getByRole('checkbox')).toHaveClass('border-gray-400');
      expect(screen.getByRole('checkbox')).toHaveClass('data-[state=checked]:border-primary');
    });

    it('应该正确应用成功变体样式', () => {
      render(<Checkbox variant="success">成功样式</Checkbox>);
      expect(screen.getByRole('checkbox')).toHaveClass('border-success');
    });

    it('应该正确应用不同尺寸', () => {
      render(<Checkbox size="lg">大号复选框</Checkbox>);
      expect(screen.getByRole('checkbox')).toHaveClass('h-5', 'w-5');
    });

    it('禁用状态应该有正确的样式', () => {
      render(<Checkbox disabled>禁用选项</Checkbox>);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('disabled:opacity-50');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('点击应该触发状态变化', () => {
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange}>可点击选项</Checkbox>);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('中间态应该正确显示和切换', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox indeterminate defaultChecked onCheckedChange={handleChange}>
          父选项
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      // 中间态时指示器渲染 Minus 图标（而非 Check 图标）
      expect(checkbox.querySelector('.lucide-minus')).toBeInTheDocument();
      expect(checkbox.querySelector('.lucide-check')).not.toBeInTheDocument();

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('禁用状态应该阻止交互', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox disabled onCheckedChange={handleChange}>
          禁用选项
        </Checkbox>,
      );

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的ARIA属性', () => {
      render(
        <Checkbox aria-label="无障碍标签" aria-describedby="checkbox-desc">
          测试选项
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', '无障碍标签');
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-desc');
    });

    it('标签应该与复选框关联', () => {
      render(<Checkbox id="test-checkbox">测试选项</Checkbox>);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('测试选项');
      expect(label).toHaveAttribute('for', 'test-checkbox');
    });

    it('应该支持键盘操作', async () => {
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange}>键盘操作测试</Checkbox>);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(checkbox).toHaveFocus();

      // Radix Checkbox 通过原生按钮的空格激活行为切换状态，
      // jsdom 不会自动派发该行为，因此使用 userEvent 模拟真实键盘交互
      await userEvent.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  // 新增波纹效果测试
  describe('交互效果测试', () => {
    it('点击应产生波纹效果', () => {
      render(<Checkbox>测试选项</Checkbox>);
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox, { clientX: 10, clientY: 10 });
      expect(checkbox.querySelectorAll('.animate-ripple').length).toBe(1);
    });
  });

  // 新增键盘操作测试
  it('应支持键盘空格键切换', async () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange}>键盘测试</Checkbox>);

    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    // jsdom 不会自动派发原生按钮的空格激活行为，使用 userEvent 模拟真实键盘交互
    await userEvent.keyboard(' ');

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  // 新增波纹效果测试
  describe('波纹效果测试', () => {
    it('应该自动清理波纹元素', async () => {
      render(<Checkbox rippleDuration={100}>测试选项</Checkbox>);
      fireEvent.click(screen.getByRole('checkbox'));

      await waitFor(
        () => {
          expect(screen.queryByTestId('ripple')).toBeNull();
        },
        { timeout: 200 },
      );
    });
  });

  // 新增滑动操作测试
  describe('滑动操作测试', () => {
    it('向右滑动应触发回调', () => {
      const handleSwipe = vi.fn();
      render(<Checkbox onSwipe={handleSwipe}>滑动测试</Checkbox>);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.touchStart(checkbox, { touches: [{ clientX: 0, clientY: 0 }] });
      fireEvent.touchEnd(checkbox, { changedTouches: [{ clientX: 50, clientY: 0 }] });

      expect(handleSwipe).toHaveBeenCalledWith('right');
    });
  });
});
