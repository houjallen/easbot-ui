/**
 * Label 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证标签文本与自定义类名
 * 2. 状态测试 - 验证必填星号与禁用态样式
 * 3. 交互测试 - 验证与输入框的关联关系
 * 4. 无障碍测试 - 验证 for / id 关联与装饰性星号的隐藏属性
 */

import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

import { Label } from '../label';

describe('Label 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应正确渲染标签文本', () => {
      render(<Label>测试标签</Label>);
      expect(screen.getByText('测试标签')).toBeInTheDocument();
    });

    it('应应用自定义类名', () => {
      render(<Label className="custom-class">自定义标签</Label>);
      expect(screen.getByText('自定义标签')).toHaveClass('custom-class');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应显示必填星号', () => {
      render(<Label required>必填项</Label>);
      expect(screen.getByText('*')).toHaveClass('text-destructive');
    });

    it('应正确处理禁用状态', () => {
      render(<Label disabled>禁用标签</Label>);
      const label = screen.getByText('禁用标签');
      expect(label).toHaveClass('opacity-50');
      expect(label).toHaveClass('cursor-not-allowed');
      expect(label).toHaveAttribute('data-disabled', 'true');
    });

    it('应处理禁用+必填状态', () => {
      render(
        <Label disabled required>
          组合状态
        </Label>,
      );

      const label = screen.getByText('组合状态');
      expect(label).toHaveClass('opacity-50');
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应正确关联输入元素', () => {
      render(
        <div>
          <Label htmlFor="test-input">测试输入</Label>
          <input id="test-input" type="text" />
        </div>,
      );

      const input = screen.getByRole('textbox');
      const label = screen.getByText('测试输入');

      // 通过 for / id 建立语义关联
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应包含正确的无障碍属性', () => {
      render(
        <>
          <Label htmlFor="a11y-input" required>
            无障碍标签
          </Label>
          <input id="a11y-input" />
        </>,
      );

      const label = screen.getByText('无障碍标签');
      const input = screen.getByRole('textbox');

      // 检查关联关系
      expect(label).toHaveAttribute('for', 'a11y-input');
      expect(input).toHaveAttribute('id', 'a11y-input');

      // 检查必填标记的隐藏属性
      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
