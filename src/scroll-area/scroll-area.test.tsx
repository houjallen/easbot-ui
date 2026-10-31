import { render, screen } from '@testing-library/react';
import { ScrollArea } from './scroll-area';

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

  test('应显示滚动条', () => {
    const { container } = render(
      <ScrollArea>
        <div style={{ height: '2000px' }}>长内容</div>
      </ScrollArea>,
    );
    // 注意：Radix ScrollArea 仅在内容真正溢出时才会渲染滚动条，
    // 而 jsdom 不执行布局（尺寸恒为 0），因此这里断言视口与滚动条容器已挂载。
    const viewport = container.querySelector('[data-radix-scroll-area-viewport]');
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveClass('h-full', 'w-full');
  });
});
