/**
 * Spinner 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Spinner 的默认样式与自定义类名
 * 2. 状态测试 - 验证不同尺寸与颜色变体的类名
 * 3. 无障碍测试 - 验证 role / aria 属性与自定义无障碍标签
 */

import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

import { Spinner } from '../spinner';

describe('Spinner 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染默认样式', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
      expect(spinner).toHaveClass('h-[var(--eas-size-sm)]');
      expect(spinner).toHaveClass('w-[var(--eas-size-sm)]');
      expect(spinner).toHaveClass('text-[var(--foreground)]');
    });

    it('应正确应用自定义类名', () => {
      render(<Spinner className="custom-class" />);
      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });

    it('应正确应用动画属性', () => {
      render(<Spinner className="animate-ping" />);
      expect(screen.getByRole('status')).toHaveClass('animate-ping');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应该正确应用尺寸样式', () => {
      const { rerender } = render(<Spinner size="sm" />);
      expect(screen.getByRole('status')).toHaveClass('h-[var(--eas-size-xs)]');

      rerender(<Spinner size="lg" />);
      expect(screen.getByRole('status')).toHaveClass('h-[var(--eas-size-md)]');
    });

    it('应该正确应用颜色变体', () => {
      render(<Spinner variant="destructive" />);
      expect(screen.getByRole('status')).toHaveClass('text-[var(--destructive)]');
    });

    it('应正确组合尺寸和颜色变体', () => {
      render(<Spinner size="lg" variant="success" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-[var(--eas-size-md)]');
      expect(spinner).toHaveClass('text-[var(--success)]');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该包含正确的ARIA属性', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });

    it('应支持自定义无障碍标签', () => {
      render(<Spinner aria-label="自定义加载提示" />);
      expect(screen.getByLabelText('自定义加载提示')).toBeInTheDocument();
    });
  });
});
