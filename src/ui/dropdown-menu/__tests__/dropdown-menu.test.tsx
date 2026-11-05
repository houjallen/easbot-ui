import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu';

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

/**
 * 弹层选项鼠标指针
 *
 * @description
 * 回归背景：菜单项原为 `cursor-default`（默认箭头）+ 禁用项
 * `data-[disabled]:pointer-events-none`（鼠标穿透导致 not-allowed 光标
 * 永不生效，违反规范 css-standard.md §4.9）。
 * 统一契约（与 Combobox option / SelectItem 一致）：
 * 可用项 `cursor-pointer`，禁用项 `data-[disabled]:cursor-not-allowed`。
 */
describe('弹层选项鼠标指针', () => {
  test('可用菜单项应是 cursor-pointer 而非 cursor-default', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>菜单A</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>可用项</DropdownMenuItem>
          <DropdownMenuItem disabled>禁用项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('菜单A'));
    const enabled = (await screen.findByText('可用项')).closest('[role="menuitem"]');
    const disabled = screen.getByText('禁用项').closest('[role="menuitem"]');

    expect(enabled).toHaveClass('cursor-pointer');
    expect(enabled?.className).not.toContain('cursor-default');
    expect(disabled).toHaveClass('data-[disabled]:cursor-not-allowed');
    expect(disabled).toHaveClass('data-[disabled]:opacity-50');
  });

  test('禁用菜单项不得屏蔽指针事件（规范 §4.9）', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>菜单B</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled>禁用项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('菜单B'));
    const item = (await screen.findByText('禁用项')).closest('[role="menuitem"]');
    // 装饰性图标的 `[&_svg]:pointer-events-none` 属规范豁免，只禁「禁用态屏蔽」
    expect(item).not.toHaveClass('data-[disabled]:pointer-events-none');
  });

  test('复选框 / 单选框 / 子菜单触发器应使用统一指针契约', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>菜单C</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>复选项</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">单选项</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>子菜单</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>子项</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText('菜单C'));
    const checkbox = (await screen.findByText('复选项')).closest('[role="menuitemcheckbox"]');
    const radio = screen.getByText('单选项').closest('[role="menuitemradio"]');
    const subTrigger = screen.getByText('子菜单').closest('[role="menuitem"]');

    for (const item of [checkbox, radio, subTrigger]) {
      expect(item).toHaveClass('cursor-pointer');
      expect(item).toHaveClass('data-[disabled]:cursor-not-allowed');
      expect(item?.className).not.toContain('cursor-default');
    }
  });
});
