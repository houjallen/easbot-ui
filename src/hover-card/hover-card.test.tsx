import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { Button } from '../button';

describe('HoverCard 组件', () => {
  test('应正确显示/隐藏内容', async () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>悬停触发</Button>
        </HoverCardTrigger>
        <HoverCardContent data-testid="content">
          <div>测试内容</div>
        </HoverCardContent>
      </HoverCard>,
    );

    // 初始状态不可见
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    // 悬停触发显示（Radix HoverCardTrigger 通过 onPointerEnter 打开）
    fireEvent.pointerEnter(screen.getByRole('button'), { pointerType: 'mouse' });
    expect(await screen.findByTestId('content')).toBeVisible();

    // 移出后隐藏
    fireEvent.pointerLeave(screen.getByRole('button'), { pointerType: 'mouse' });
    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  test('应支持不同尺寸', async () => {
    const { rerender } = render(
      <HoverCard>
        <HoverCardTrigger>触发</HoverCardTrigger>
        <HoverCardContent size="sm" data-testid="content" />
      </HoverCard>,
    );

    fireEvent.pointerEnter(screen.getByText('触发'), { pointerType: 'mouse' });
    // Tailwind v4：尺寸使用 CSS 变量任意值
    expect(await screen.findByTestId('content')).toHaveClass('w-[var(--hover-card-sm-width)]');

    rerender(
      <HoverCard>
        <HoverCardTrigger>触发</HoverCardTrigger>
        <HoverCardContent size="lg" data-testid="content" />
      </HoverCard>,
    );
    expect(await screen.findByTestId('content')).toHaveClass('w-[var(--hover-card-lg-width)]');
  });

  test('应支持主题切换', async () => {
    render(
      <HoverCard>
        <HoverCardTrigger>触发</HoverCardTrigger>
        <HoverCardContent variant="dark" data-testid="content">
          暗色内容
        </HoverCardContent>
      </HoverCard>,
    );

    fireEvent.pointerEnter(screen.getByText('触发'), { pointerType: 'mouse' });
    const content = await screen.findByTestId('content');
    // Tailwind v4：暗色主题使用 CSS 变量任意值
    expect(content).toHaveClass('bg-[var(--hover-card-dark-bg)]');
    expect(content).toHaveClass('text-[var(--hover-card-dark-fg)]');
  });
});
