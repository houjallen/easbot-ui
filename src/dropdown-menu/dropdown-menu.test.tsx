import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';
import { Button } from '../button';

describe('DropdownMenu 组件', () => {
  test('应正确打开/关闭菜单', async () => {
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

    // 点击触发显示（Radix DropdownMenuTrigger 通过 onPointerDown 打开菜单）
    fireEvent.pointerDown(screen.getByText('打开菜单'), { button: 0, ctrlKey: false });
    expect(await screen.findByTestId('content')).toBeVisible();

    // 点击外部关闭
    fireEvent.pointerDown(document.body, { button: 0, ctrlKey: false });
    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  test('应支持不同尺寸', async () => {
    const { rerender } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>触发</DropdownMenuTrigger>
        <DropdownMenuContent size="sm" data-testid="content" />
      </DropdownMenu>,
    );

    fireEvent.pointerDown(screen.getByText('触发'), { button: 0, ctrlKey: false });
    // Tailwind v4：尺寸使用 CSS 变量任意值
    expect(await screen.findByTestId('content')).toHaveClass('min-w-[var(--dropdown-menu-sm-min-width)]');

    rerender(
      <DropdownMenu>
        <DropdownMenuTrigger>触发</DropdownMenuTrigger>
        <DropdownMenuContent size="lg" data-testid="content" />
      </DropdownMenu>,
    );
    expect(await screen.findByTestId('content')).toHaveClass('min-w-[var(--dropdown-menu-lg-min-width)]');
  });

  test('应支持键盘导航', async () => {
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

    // Radix 支持通过 Enter/空格键打开菜单
    fireEvent.keyDown(screen.getByText('打开菜单'), { key: 'Enter' });
    const items = await screen.findAllByRole('menuitem');
    expect(items).toHaveLength(2);
  });
});

describe('无障碍测试', () => {
  test('应具有正确的 ARIA 属性', async () => {
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

    fireEvent.pointerDown(screen.getByRole('button'), { button: 0, ctrlKey: false });
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    expect(menu).toHaveAttribute('aria-labelledby');
  });
});

describe('样式变体测试', () => {
  test('应正确应用 dark 主题', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>打开</DropdownMenuTrigger>
        <DropdownMenuContent variant="dark" data-testid="content">
          <DropdownMenuItem>测试项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    fireEvent.pointerDown(screen.getByText('打开'), { button: 0, ctrlKey: false });
    const content = await screen.findByTestId('content');
    expect(content).toHaveClass('bg-gray-800');
    expect(content).toHaveClass('text-gray-100');
  });
});
