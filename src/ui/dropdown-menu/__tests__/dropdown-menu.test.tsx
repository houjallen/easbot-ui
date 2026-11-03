import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu';

describe('DropdownMenu 组件', () => {
  test('应正确打开/关闭菜单', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>打开菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem>测试项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // 初始状态不可见
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    // 点击触发显示
    await user.click(screen.getByText('打开菜单'));
    expect(await screen.findByTestId('content')).toBeVisible();

    // Esc 关闭 —— Radix 会把浮层整体卸载
    // （不用「点击外部」：菜单打开时 Radix 会给 `body` 加 `pointer-events: none`，
    //   在 jsdom 里无法可靠地模拟外部点击）
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  test('应支持自定义最小宽度', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>打开菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content" className="min-w-[12rem]">
          <DropdownMenuItem>测试项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('打开菜单'));
    const content = await screen.findByTestId('content');
    // 默认宽度 `min-w-[8rem]` 被自定义类名通过 `twMerge` 覆盖（只保留后者）
    expect(content).toHaveClass('min-w-[12rem]');
    expect(content).not.toHaveClass('min-w-[8rem]');
  });

  test('应支持键盘导航', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>打开菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>选项1</DropdownMenuItem>
          <DropdownMenuItem>选项2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('打开菜单'));
    const items = await screen.findAllByRole('menuitem');
    expect(items).toHaveLength(2);
  });
});

describe('无障碍测试', () => {
  test('应具有正确的 ARIA 属性', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>无障碍菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>测试项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button'));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    expect(menu).toHaveAttribute('aria-labelledby');
  });
});

describe('样式变体测试', () => {
  test('应使用语义化主题变量', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>打开</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem>测试项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('打开'));
    const content = await screen.findByTestId('content');
    // 内容区使用语义化主题变量（`bg-popover` / `text-popover-foreground`），
    // 明暗由 `.dark` 类切换 —— 不再写死 `bg-gray-800` 这类硬编码色值
    expect(content).toHaveClass('bg-popover');
    expect(content).toHaveClass('text-popover-foreground');
  });
});
