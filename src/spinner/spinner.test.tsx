/**
 * Spinner 组件单元测试
 */

import { render, screen } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Spinner 组件', () => {
  // 基础渲染测试
  it('应该正确渲染默认样式', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    // Tailwind v4：语义类已替换为 CSS 变量任意值
    expect(spinner).toHaveClass('h-[var(--spinner-size-md)] w-[var(--spinner-size-md)]');
    expect(spinner).toHaveClass('text-[var(--spinner-primary)]');
  });

  // 尺寸测试
  it('应该正确应用尺寸样式', () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('h-[var(--spinner-size-sm)] w-[var(--spinner-size-sm)]');

    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('h-[var(--spinner-size-lg)] w-[var(--spinner-size-lg)]');
  });

  // 颜色变体测试
  it('应该正确应用颜色变体', () => {
    render(<Spinner variant="destructive" />);
    expect(screen.getByRole('status')).toHaveClass('text-[var(--spinner-destructive)]');
  });

  // 无障碍测试
  it('应该包含正确的ARIA属性', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
  });

  // 新增组合测试
  describe('组合测试', () => {
    it('应正确组合尺寸和颜色变体', () => {
      render(<Spinner size="lg" variant="success" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-[var(--spinner-size-lg)] w-[var(--spinner-size-lg)]');
      expect(spinner).toHaveClass('text-[var(--spinner-success)]');
    });

    it('应正确应用自定义类名', () => {
      render(<Spinner className="custom-class" />);
      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });
  });

  // 新增动画属性测试
  it('应正确应用动画属性', () => {
    render(<Spinner className="animate-ping" />);
    expect(screen.getByRole('status')).toHaveClass('animate-ping');
  });

  // 新增无障碍标签测试
  it('应支持自定义无障碍标签', () => {
    render(<Spinner aria-label="自定义加载提示" />);
    expect(screen.getByLabelText('自定义加载提示')).toBeInTheDocument();
  });
});
