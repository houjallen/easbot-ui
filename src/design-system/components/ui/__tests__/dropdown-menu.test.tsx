/**
 * DropdownMenu 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态、选中态、禁用态
 * 3. 交互测试 - 验证点击菜单项与复选项/单选项的回调
 * 4. 无障碍测试 - 验证 menu/menuitem 语义角色、aria-checked、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空菜单
 *
 * @remarks
 * Radix 的 `DropdownMenuTrigger` 通过 `onPointerDown`（且 `button === 0`、`ctrlKey === false`）
 * 打开菜单，而不是 `onClick` —— 因此测试必须派发 `pointerDown`。
 * 菜单内容渲染到 `document.body`（portal），必须用 `screen.findByRole(...)` 查询。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu';

/**
 * 打开下拉菜单
 *
 * @description
 * Radix 的 `DropdownMenuTrigger` 通过 `onPointerDown`（`button === 0` 且 `ctrlKey === false`）
 * 切换菜单展开状态，而不是 `onClick`。
 */
const openMenu = (trigger: HTMLElement): void => {
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
};

describe('DropdownMenu 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发器', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
        </DropdownMenu>,
      );

      const trigger = screen.getByRole('button', { name: '操作菜单' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
    });

    it('应该正确渲染菜单内容结构', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>分组标题</DropdownMenuLabel>
              <DropdownMenuItem>菜单项一</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>菜单项二</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const menu = await screen.findByRole('menu');
      expect(menu).toHaveAttribute('data-slot', 'dropdown-menu-content');
      expect(screen.getByText('分组标题')).toHaveAttribute('data-slot', 'dropdown-menu-label');
      expect(screen.getByRole('menuitem', { name: '菜单项一' })).toHaveAttribute('data-slot', 'dropdown-menu-item');
    });

    it('应该正确应用菜单内容类名', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>内容</DropdownMenuContent>
        </DropdownMenu>,
      );

      const menu = await screen.findByRole('menu');
      expect(menu).toHaveClass('z-50');
      expect(menu).toHaveClass('min-w-[8rem]');
      expect(menu).toHaveClass('rounded-md');
      expect(menu).toHaveClass('border');
      expect(menu).toHaveClass('bg-popover');
      expect(menu).toHaveClass('p-1');
      expect(menu).toHaveClass('shadow-md');
    });

    it('应该正确应用菜单项类名', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = await screen.findByRole('menuitem', { name: '菜单项' });
      expect(item).toHaveClass('flex');
      expect(item).toHaveClass('items-center');
      expect(item).toHaveClass('rounded-sm');
      expect(item).toHaveClass('px-2');
      expect(item).toHaveClass('py-1.5');
      expect(item).toHaveClass('text-sm');
      expect(item).toHaveClass('focus:bg-accent');
      expect(item).toHaveClass('focus:text-accent-foreground');
    });

    it('应该正确应用分隔线与快捷键提示类名', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              菜单项
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const shortcut = await screen.findByText('⌘K');
      expect(shortcut).toHaveAttribute('data-slot', 'dropdown-menu-shortcut');
      expect(shortcut).toHaveClass('ml-auto');
      expect(shortcut).toHaveClass('text-muted-foreground');

      const separator = document.querySelector('[data-slot="dropdown-menu-separator"]');
      expect(separator).toHaveClass('h-px');
      expect(separator).toHaveClass('bg-border');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem className="custom-item">菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(await screen.findByRole('menu')).toHaveClass('custom-content');
      expect(await screen.findByRole('menuitem', { name: '菜单项' })).toHaveClass('custom-item');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(screen.getByRole('button', { name: '操作菜单' })).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('应该在 defaultOpen 时渲染打开状态', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByRole('button', { name: '操作菜单', hidden: true });
      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByRole('menu')).toHaveAttribute('data-state', 'open');
    });

    it('应该在禁用菜单项上渲染 data-disabled 与 aria-disabled', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>禁用项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = await screen.findByRole('menuitem', { name: '禁用项' });
      expect(item).toHaveAttribute('data-disabled');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('应该在破坏性菜单项上渲染 data-variant', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive">删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = await screen.findByRole('menuitem', { name: '删除' });
      expect(item).toHaveAttribute('data-variant', 'destructive');
      expect(item).toHaveClass('data-[variant=destructive]:text-destructive');
    });

    it('应该在默认菜单项上渲染 data-variant 为 default', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>普通项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = await screen.findByRole('menuitem', { name: '普通项' });
      expect(item).toHaveAttribute('data-variant', 'default');
    });

    it('应该在 checked 复选项上渲染 data-state 为 checked', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>显示网格</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = await screen.findByRole('menuitemcheckbox', { name: '显示网格' });
      expect(item).toHaveAttribute('data-state', 'checked');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在单选项上渲染 aria-checked', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="grid">
              <DropdownMenuRadioItem value="grid">网格</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="list">列表</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const grid = await screen.findByRole('menuitemradio', { name: '网格' });
      const list = await screen.findByRole('menuitemradio', { name: '列表' });
      expect(grid).toHaveAttribute('aria-checked', 'true');
      expect(list).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时打开菜单', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      openMenu(screen.getByRole('button', { name: '操作菜单' }));

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该在点击菜单项时触发选择回调', async () => {
      const handleSelect = vi.fn();
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      fireEvent.click(await screen.findByRole('menuitem', { name: '菜单项' }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('应该在点击复选项时触发选中状态回调', async () => {
      const handleCheckedChange = vi.fn();
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={handleCheckedChange}>
              显示网格
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = await screen.findByRole('menuitemcheckbox', { name: '显示网格' });
      fireEvent.click(item);

      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    });

    it('应该在点击单选项时触发值变更回调', async () => {
      const handleValueChange = vi.fn();
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="grid" onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="list">列表</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      fireEvent.click(await screen.findByRole('menuitemradio', { name: '列表' }));

      expect(handleValueChange).toHaveBeenCalledWith('list');
    });

    it('应该在点击禁用菜单项时不触发选择回调', async () => {
      const handleSelect = vi.fn();
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect}>
              禁用项
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      fireEvent.click(await screen.findByRole('menuitem', { name: '禁用项' }));

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('应该在点击菜单项后关闭菜单', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      fireEvent.click(await screen.findByRole('menuitem', { name: '菜单项' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('应该在按下 ArrowDown 键时打开菜单', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByRole('button', { name: '操作菜单' });
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该在按下 Enter 键时打开菜单', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByRole('button', { name: '操作菜单' });
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 menu 语义角色', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该暴露 menuitem 语义角色', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(await screen.findByRole('menuitem', { name: '菜单项' })).toBeInTheDocument();
    });

    it('应该暴露 menuitemcheckbox 与 menuitemradio 语义角色', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>显示网格</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="grid">网格</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(await screen.findByRole('menuitemcheckbox', { name: '显示网格' })).toBeInTheDocument();
      expect(await screen.findByRole('menuitemradio', { name: '网格' })).toBeInTheDocument();
    });

    it('应该通过 aria-haspopup 暴露触发器的菜单语义', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByRole('button', { name: '操作菜单' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在打开时把焦点移入菜单', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const menu = await screen.findByRole('menu');
      await waitFor(() => {
        // Radix 打开菜单时把焦点移入菜单容器内部
        expect(menu.contains(document.activeElement)).toBe(true);
      });
    });

    it('应该透传 aria-label 到菜单项', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem aria-label="删除项目">删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(await screen.findByRole('menuitem', { name: '删除项目' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <DropdownMenu open onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>菜单项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(await screen.findByRole('menu')).toBeInTheDocument();

      openMenu(screen.getByRole('button', { name: '操作菜单', hidden: true }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该允许渲染没有菜单项的菜单', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent />
        </DropdownMenu>,
      );

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该渲染子菜单触发器与子菜单内容', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>更多</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>子项</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const subTrigger = await screen.findByRole('menuitem', { name: '更多' });
      expect(subTrigger).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger');
      expect(subTrigger).toHaveClass('data-[state=open]:bg-accent');
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-custom="value">操作菜单</DropdownMenuTrigger>
        </DropdownMenu>,
      );

      expect(screen.getByRole('button', { name: '操作菜单' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该在菜单项上渲染 data-inset 属性', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>操作菜单</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>缩进项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = await screen.findByRole('menuitem', { name: '缩进项' });
      expect(item).toHaveAttribute('data-inset', 'true');
      expect(item).toHaveClass('data-[inset]:pl-8');
    });
  });
});
