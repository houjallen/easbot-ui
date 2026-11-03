/**
 * Separator 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证分隔线的方向类名与自定义类名
 * 2. 状态测试 - 验证 data-orientation 状态属性
 * 3. 无障碍测试 - 验证装饰性与语义化分隔线的角色差异
 *
 * 说明：非装饰性分隔线才暴露 `separator` 语义角色，
 * 装饰性分隔线（decorative 默认值）会被 Radix 渲染为 `role="none"`。
 */

import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

import { Separator } from '../separator';

describe('Separator 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应正确渲染水平分隔线', () => {
      const { container } = render(<Separator orientation="horizontal" decorative={false} />);
      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('data-[orientation=horizontal]:h-px');
      expect(separator).toHaveClass('data-[orientation=horizontal]:w-full');
      expect(container.firstChild).toBe(separator);
    });

    it('应正确渲染垂直分隔线', () => {
      render(<Separator orientation="vertical" decorative={false} />);
      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('data-[orientation=vertical]:w-px');
      expect(separator).toHaveClass('data-[orientation=vertical]:h-full');
    });

    it('应应用自定义类名', () => {
      const { container } = render(<Separator className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应默认渲染为水平方向', () => {
      const { container } = render(<Separator decorative={false} />);
      expect(container.firstChild).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('应渲染垂直方向的状态属性', () => {
      const { container } = render(<Separator orientation="vertical" decorative={false} />);
      expect(container.firstChild).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应支持装饰性分隔线', () => {
      render(<Separator decorative />);
      expect(screen.getByRole('none')).toBeInTheDocument();
    });

    it('非装饰性分隔线应暴露separator语义角色', () => {
      render(<Separator decorative={false} />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });
});
