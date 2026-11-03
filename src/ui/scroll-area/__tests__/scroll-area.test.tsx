import { render, screen } from '@testing-library/react';
import { ScrollArea } from '../scroll-area';

/**
 * ScrollArea 组件测试
 *
 * @description
 * ScrollArea 基于 Radix `ScrollArea` 封装：
 * - 默认 `type="hover"`，滚动条需在鼠标进入滚动区后才挂载；
 * - Radix 的 ScrollArea **不会**输出 `role="scrollbar"`，
 *   因此这里通过 `data-slot="scroll-area-scrollbar"` 定位滚动条；
 * - jsdom 无布局引擎，尺寸恒为 0，Radix 无法计算溢出，
 *   因此需要 `type="always"` 让滚动条常驻挂载。
 */
describe('ScrollArea 组件', () => {
  test('应正确渲染内容', () => {
    render(
      <ScrollArea>
        <div data-testid="content">测试内容</div>
      </ScrollArea>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  test('应应用自定义类名', () => {
    const { container } = render(<ScrollArea className="custom-scroll-area" />);
    expect(container.firstChild).toHaveClass('custom-scroll-area');
  });

  test('应渲染视口与滚动条', () => {
    const { container } = render(
      <ScrollArea type="always">
        <div style={{ height: '2000px' }}>长内容</div>
      </ScrollArea>,
    );

    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeInTheDocument();
  });

  test('滚动条应为纵向且可见', () => {
    const { container } = render(
      <ScrollArea type="always">
        <div style={{ height: '2000px' }}>长内容</div>
      </ScrollArea>,
    );

    const scrollbar = container.querySelector('[data-slot="scroll-area-scrollbar"]');
    expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
    expect(scrollbar).toHaveAttribute('data-state', 'visible');
  });
});
