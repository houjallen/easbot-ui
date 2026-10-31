import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress 组件', () => {
  test('应正确显示进度值', () => {
    const { container } = render(<Progress value={60} />);
    // Tailwind v4：语义类已替换为 CSS 变量任意值
    const indicator = container.querySelector('.bg-\\[var\\(--progress-indicator\\)\\]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-40%)' });
  });

  test('应处理不确定状态', () => {
    const { container } = render(<Progress value={undefined} />);
    const indicator = container.querySelector('.bg-\\[var\\(--progress-indicator\\)\\]');
    expect(indicator).toHaveClass('w-full'); // 不确定状态全宽
  });

  test('应应用自定义样式', () => {
    render(<Progress value={50} className="custom-bg" indicatorClassName="custom-indicator" />);

    const root = screen.getByRole('progressbar');
    const indicator = root.querySelector('.custom-indicator');

    expect(root).toHaveClass('custom-bg');
    expect(indicator).toHaveClass('custom-indicator');
  });
});
