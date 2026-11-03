/**
 * Label 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证禁用态与表单关联状态
 * 3. 交互测试 - 验证点击标签聚焦关联控件
 * 4. 无障碍测试 - 验证 label 语义、可访问名称与属性透传
 * 5. 边界测试 - 验证空 children、缺省 htmlFor、className 合并
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Label } from '../label';

describe('Label 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染标签', () => {
      render(<Label>用户名</Label>);

      const label = screen.getByText('用户名');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('data-slot', 'label');
    });

    it('应该正确应用基础类名', () => {
      render(<Label>用户名</Label>);

      const label = screen.getByText('用户名');
      expect(label).toHaveClass('flex');
      expect(label).toHaveClass('select-none');
      expect(label).toHaveClass('items-center');
      expect(label).toHaveClass('font-medium');
    });

    it('应该正确合并自定义类名', () => {
      render(<Label className="custom-label">自定义</Label>);

      const label = screen.getByText('自定义');
      expect(label).toHaveClass('custom-label');
      expect(label).toHaveClass('flex');
    });
  });

  describe('状态测试', () => {
    it('应该正确透传 data-disabled 状态', () => {
      render(<Label data-disabled="true">不可用标签</Label>);

      expect(screen.getByText('不可用标签')).toHaveAttribute('data-disabled', 'true');
    });

    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(<Label className="flex-row">冲突</Label>);

      const label = screen.getByText('冲突');
      expect(label).toHaveClass('flex-row');
      expect(label).not.toHaveClass('flex-col');
    });
  });

  describe('交互测试', () => {
    it('应该在标签与输入框建立 htmlFor 关联', () => {
      render(
        <>
          <Label htmlFor="username">用户名</Label>
          <input id="username" type="text" />
        </>,
      );

      const input = screen.getByRole('textbox', { name: '用户名' });
      expect(input).toHaveAttribute('id', 'username');
      expect(screen.getByText('用户名')).toHaveAttribute('for', 'username');
    });

    it('应该在点击标签时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Label onClick={handleClick}>可点击标签</Label>);

      fireEvent.click(screen.getByText('可点击标签'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 label 语义并关联表单控件', () => {
      render(
        <>
          <Label htmlFor="email">邮箱</Label>
          <input id="email" type="email" />
        </>,
      );

      expect(screen.getByLabelText('邮箱')).toBe(screen.getByRole('textbox'));
    });

    it('应该透传 aria-label 属性', () => {
      render(<Label aria-label="自定义标签">#</Label>);

      expect(screen.getByLabelText('自定义标签')).toBeInTheDocument();
    });

    it('应该透传 data-* 属性', () => {
      render(<Label data-testid="custom-label">自定义</Label>);

      expect(screen.getByTestId('custom-label')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的标签', () => {
      render(<Label aria-label="空标签" />);

      expect(screen.getByLabelText('空标签')).toBeInTheDocument();
    });

    it('应该在缺省 htmlFor 时不设置 for 属性', () => {
      render(<Label>无关联</Label>);

      expect(screen.getByText('无关联')).not.toHaveAttribute('for');
    });

    it('应该允许渲染不带 children 的标签', () => {
      render(<Label />);

      expect(document.querySelector('[data-slot="label"]')).toBeInTheDocument();
    });
  });
});
