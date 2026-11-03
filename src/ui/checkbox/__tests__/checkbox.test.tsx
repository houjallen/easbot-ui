/**
 * Checkbox 组件单元测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 状态测试 - 验证不同状态的展示
 * 3. 交互测试 - 验证用户交互行为
 * 4. 无障碍测试 - 验证 ARIA 语义
 *
 * 中间态的视觉指示器为 `aria-hidden` 的装饰性 SVG（状态由 `aria-checked="mixed"` 表达），
 * 因此断言走 `data-slot="checkbox-indicator"` 而非 `role="img"`。
 * 键盘交互走 `@testing-library/user-event` —— 空格键激活原生 button 的行为 jsdom 不会自动模拟。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, vi } from 'vitest';
import { Checkbox } from '../checkbox';

describe('Checkbox 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染基础复选框', () => {
      render(<Checkbox label="测试选项" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('测试选项')).toBeInTheDocument();
    });

    it('应该正确渲染带描述的复选框', () => {
      render(<Checkbox label="测试选项" description="这是描述文本" />);
      expect(screen.getByText('这是描述文本')).toBeInTheDocument();
    });

    it('应该正确渲染错误状态', () => {
      render(<Checkbox label="测试选项" error="这是错误信息" />);
      expect(screen.getByText('这是错误信息')).toHaveClass('text-destructive');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('禁用状态应该有正确的样式', () => {
      render(<Checkbox label="禁用选项" disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('disabled:opacity-50');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('点击应该触发状态变化', () => {
      const handleChange = vi.fn();
      render(<Checkbox label="可点击选项" onCheckedChange={handleChange} />);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('中间态应该正确显示和切换', () => {
      const handleChange = vi.fn();
      const { container } = render(<Checkbox label="父选项" indeterminate onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      // 中间态由 aria-checked="mixed" 表达
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
      // 视觉指示器（装饰性 SVG）
      expect(container.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument();

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('禁用状态应该阻止交互', () => {
      const handleChange = vi.fn();
      render(<Checkbox label="禁用选项" disabled onCheckedChange={handleChange} />);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的ARIA属性', () => {
      render(<Checkbox label="测试选项" aria-label="无障碍标签" aria-describedby="checkbox-desc" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', '无障碍标签');
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-desc');
    });

    it('标签应该与复选框关联', () => {
      render(<Checkbox id="test-checkbox" label="测试选项" />);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('测试选项');
      expect(label).toHaveAttribute('for', 'test-checkbox');
    });

    it('应该支持键盘操作', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox label="键盘操作测试" onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.tab();
      expect(checkbox).toHaveFocus();

      // 空格键激活复选框
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
