import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../hover-card';

/**
 * HoverCard 组件测试
 *
 * @description
 * HoverCard 属于 Radix 浮层类组件，由 `hover` 事件触发，
 * 因此统一使用 `@testing-library/user-event` 的 `user.hover` 展开浮层。
 *
 * 说明：`HoverCardContent` 当前直接透传 Radix `HoverCard.Content` 的原生 props，
 * **不支持** `size` / `variant`（宽度固定为 `w-64`，主题跟随 CSS 变量），
 * 因此本文件不包含尺寸 / 变体相关的用例。
 */
describe('HoverCard 组件', () => {
  test('应正确显示/隐藏内容', async () => {
    const user = userEvent.setup();
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

    // 悬停触发显示
    await user.hover(screen.getByRole('button'));
    expect(await screen.findByTestId('content')).toBeVisible();

    // 移出后隐藏
    await user.unhover(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  test('内容区应使用语义化主题变量', async () => {
    const user = userEvent.setup();
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

    await user.hover(screen.getByRole('button'));
    const content = await screen.findByTestId('content');
    // 明暗主题由 `.dark` 类切换 —— 不写死 `bg-gray-800` 这类硬编码色值
    expect(content).toHaveClass('bg-popover');
    expect(content).toHaveClass('text-popover-foreground');
  });
});
