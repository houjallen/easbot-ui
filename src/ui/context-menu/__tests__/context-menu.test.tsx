import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../context-menu';

/**
 * ContextMenu 组件测试
 *
 * @description
 * 右键菜单通过 `fireEvent.contextMenu` 在触发器上打开（Radix 监听
 * `onContextMenu`），菜单内容渲染到 Portal；关闭用 `{Escape}`
 * （Radix 打开浮层时给 body 加 `pointer-events: none`，
 * jsdom 中无法可靠模拟「点击外部」关闭）。
 */
describe('ContextMenu 组件', () => {
  test('右键触发器应打开菜单', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger className="inline-block p-2">右键区域</ContextMenuTrigger>
        <ContextMenuContent data-testid="content">
          <ContextMenuItem>菜单项</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByText('右键区域'));
    expect(await screen.findByTestId('content')).toBeVisible();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  test('禁用项应带 data-disabled 与 aria-disabled', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger className="inline-block p-2">右键区域</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled>禁用项</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('右键区域'));
    const item = await screen.findByText('禁用项');
    expect(item).toHaveAttribute('data-disabled');
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });

  /**
   * 弹层选项鼠标指针
   *
   * @description
   * 回归背景：ContextMenuItem 原为 `cursor-default` + 禁用项
   * `data-[disabled]:pointer-events-none`（违反规范 css-standard.md §4.9，
   * 鼠标穿透导致 not-allowed 光标永不生效）。
   * 统一契约与 Combobox option / SelectItem / DropdownMenuItem / MenubarItem 一致。
   */
  describe('弹层选项鼠标指针', () => {
    test('可用项应是 cursor-pointer，禁用项是 not-allowed 且不屏蔽指针事件', async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger className="inline-block p-2">右键区域</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>可用项</ContextMenuItem>
            <ContextMenuItem disabled>禁用项</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      fireEvent.contextMenu(screen.getByText('右键区域'));
      const enabled = (await screen.findByText('可用项')).closest('[role="menuitem"]');
      const disabled = screen.getByText('禁用项').closest('[role="menuitem"]');

      expect(enabled).toHaveClass('cursor-pointer');
      expect(enabled?.className).not.toContain('cursor-default');
      expect(disabled).toHaveClass('data-[disabled]:cursor-not-allowed');
      expect(disabled).toHaveClass('data-[disabled]:opacity-50');
      // 禁用态不得屏蔽指针事件；`[&_svg]:pointer-events-none` 属装饰性豁免
      expect(disabled).not.toHaveClass('data-[disabled]:pointer-events-none');
    });

    test('复选框 / 单选框 / 子菜单触发器应使用统一指针契约', async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger className="inline-block p-2">右键区域</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem checked>复选项</ContextMenuCheckboxItem>
            <ContextMenuRadioGroup value="a">
              <ContextMenuRadioItem value="a">单选项</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger>子菜单</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>子项</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>,
      );

      fireEvent.contextMenu(screen.getByText('右键区域'));
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
});
