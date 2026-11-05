import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '../menubar';

/**
 * Menubar 组件测试
 *
 * @description
 * Menubar 的子菜单由 Radix `onPointerDown` 路径展开，
 * 因此使用 `@testing-library/user-event` 的 `user.click` 打开菜单，
 * 并用 `user.keyboard('{Escape}')` 关闭（Radix 会给 body 加 `pointer-events: none`，
 * jsdom 中无法可靠模拟「点击外部」关闭）。
 */
describe('Menubar 组件', () => {
  test('应正确渲染菜单项', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>文件</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>新建</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByText('文件')).toBeInTheDocument();
  });

  test('应展开子菜单', async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>编辑</MenubarTrigger>
          <MenubarContent data-testid="content">
            <MenubarItem>复制</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await user.click(screen.getByText('编辑'));
    expect(await screen.findByTestId('content')).toBeVisible();

    // Esc 关闭浮层
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  test('应处理禁用状态', async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>设置</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>禁用项</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await user.click(screen.getByText('设置'));
    const item = await screen.findByText('禁用项');
    expect(item).toHaveAttribute('data-disabled');
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });
});

/**
 * 弹层选项鼠标指针
 *
 * @description
 * 回归背景：MenubarItem 原为 `cursor-default` + 禁用项
 * `data-[disabled]:pointer-events-none`（违反规范 css-standard.md §4.9，
 * 鼠标穿透导致 not-allowed 光标永不生效）。
 * 统一契约与 Combobox option / SelectItem / DropdownMenuItem 一致。
 */
describe('弹层选项鼠标指针', () => {
  test('可用菜单项应是 cursor-pointer，禁用项是 not-allowed 且不屏蔽指针事件', async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>视图</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>可用项</MenubarItem>
            <MenubarItem disabled>禁用项</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await user.click(screen.getByText('视图'));
    const enabled = (await screen.findByText('可用项')).closest('[role="menuitem"]');
    const disabled = screen.getByText('禁用项').closest('[role="menuitem"]');

    expect(enabled).toHaveClass('cursor-pointer');
    expect(enabled?.className).not.toContain('cursor-default');
    expect(disabled).toHaveClass('data-[disabled]:cursor-not-allowed');
    expect(disabled).toHaveClass('data-[disabled]:opacity-50');
    // 禁用态不得屏蔽指针事件；`[&_svg]:pointer-events-none` 属装饰性豁免
    expect(disabled).not.toHaveClass('data-[disabled]:pointer-events-none');
  });
});
