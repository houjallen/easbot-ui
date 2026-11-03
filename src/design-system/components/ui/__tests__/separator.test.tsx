/**
 * Separator 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与方向类名
 * 2. 状态测试 - 验证装饰性 / 语义性分隔线状态
 * 3. 交互测试 - 验证点击与属性透传
 * 4. 无障碍测试 - 验证 separator 语义与 aria 属性
 * 5. 边界测试 - 验证缺省方向、缺省装饰性、className 合并
 *
 * @remarks
 * Radix 的 `Separator` 默认为 `decorative={true}` —— 此时元素渲染为
 * `role="none"`，**不暴露** `separator` 语义角色（仅作视觉分隔）。
 * 需要语义分隔时必须显式传 `decorative={false}`。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Separator } from '../separator';

describe('Separator 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染分隔线', () => {
      render(<Separator decorative={false} />);

      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('data-slot', 'separator-root');
    });

    it('应该正确应用基础类名', () => {
      render(<Separator decorative={false} />);

      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('shrink-0');
      expect(separator).toHaveClass('bg-border');
    });

    it('应该正确应用水平方向的类名', () => {
      render(<Separator decorative={false} orientation="horizontal" />);

      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveClass('data-[orientation=horizontal]:h-px');
      expect(separator).toHaveClass('data-[orientation=horizontal]:w-full');
    });

    it('应该正确应用垂直方向的类名', () => {
      render(<Separator decorative={false} orientation="vertical" />);

      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveClass('data-[orientation=vertical]:h-full');
      expect(separator).toHaveClass('data-[orientation=vertical]:w-px');
    });

    it('应该正确合并自定义类名', () => {
      render(<Separator decorative={false} className="custom-separator" />);

      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('custom-separator');
      expect(separator).toHaveClass('bg-border');
    });
  });

  describe('状态测试', () => {
    it('应该在装饰性模式下不暴露 separator 语义', () => {
      render(<Separator data-testid="decorative" />);

      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
      expect(screen.getByTestId('decorative')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('应该在语义性模式下暴露 separator 角色', () => {
      render(<Separator decorative={false} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('应该正确透传 data-state 状态属性', () => {
      render(<Separator decorative={false} data-state="collapsed" />);

      expect(screen.getByRole('separator')).toHaveAttribute('data-state', 'collapsed');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Separator decorative={false} onClick={handleClick} data-testid="separator" />);

      fireEvent.click(screen.getByTestId('separator'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在更新方向后重新渲染对应属性', () => {
      const { rerender } = render(<Separator decorative={false} />);
      expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal');

      rerender(<Separator decorative={false} orientation="vertical" />);
      expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 separator 语义角色', () => {
      render(<Separator decorative={false} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Separator decorative={false} aria-label="内容分隔" />);

      expect(screen.getByRole('separator', { name: '内容分隔' })).toBeInTheDocument();
    });

    it('应该透传 aria-orientation 属性', () => {
      render(<Separator decorative={false} aria-orientation="vertical" />);

      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('边界测试', () => {
    it('应该在缺省方向时使用水平方向', () => {
      render(<Separator decorative={false} />);

      expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('应该在缺省装饰性时使用装饰性模式', () => {
      render(<Separator />);

      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(<Separator decorative={false} className="bg-primary" />);

      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('bg-primary');
      expect(separator).not.toHaveClass('bg-border');
    });
  });
});
