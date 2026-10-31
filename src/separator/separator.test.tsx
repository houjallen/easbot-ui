import { render, screen } from '@testing-library/react';
import { Separator } from './separator';

describe('Separator 组件', () => {
  test('应正确渲染水平分隔线', () => {
    render(<Separator orientation="horizontal" decorative={false} />);
    const separator = screen.getByRole('separator');
    // Tailwind v4：语义类已替换为 CSS 变量任意值
    expect(separator).toHaveClass('h-[var(--separator-horizontal-height)] w-full');
  });

  test('应正确渲染垂直分隔线', () => {
    render(<Separator orientation="vertical" decorative={false} />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('h-full w-[var(--separator-vertical-width)]');
  });

  test('应应用自定义类名', () => {
    const { container } = render(<Separator className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('应支持装饰性分隔线', () => {
    render(<Separator decorative />);
    // decorative=true 时 Radix 输出 role="none"（非语义分隔线）
    const separator = screen.getByRole('none');
    expect(separator).toBeInTheDocument();
  });
});
