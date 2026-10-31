import { render, screen } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton 组件', () => {
  test('应正确渲染基础骨架', () => {
    render(<Skeleton data-testid="skeleton" />);
    // 骨架屏使用 before 伪元素承载 shimmer 动画（而非 animate-pulse）
    expect(screen.getByTestId('skeleton')).toHaveClass('before:animate-[shimmer_var(--skeleton-animation-duration)_infinite]');
    expect(screen.getByTestId('skeleton')).toHaveClass('bg-[var(--skeleton-background)]');
  });

  test('应应用自定义类名', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('应支持响应式尺寸', () => {
    render(<Skeleton className="md:w-1/2" data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('md:w-1/2');
  });
});
