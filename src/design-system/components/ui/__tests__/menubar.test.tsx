/**
 * Menubar 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态、选中态、禁用态
 * 3. 交互测试 - 验证打开菜单与菜单项选择回调
 * 4. 无障碍测试 - 验证 menubar/menu/menuitem 语义角色、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空菜单
 *
 * @remarks
 * Radix 的 `MenubarTrigger` 通过 `onPointerDown`（且 `button === 0`、`ctrlKey === false`）
 * 打开菜单，也支持 `Enter` / `空格` / `ArrowDown` 键，因此测试以 `pointerDown` 为主路径。
 * 菜单内容渲染到 `document.body`（portal），必须用 `screen.findByRole(...)` 查询。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../menubar';

/**
 * 打开菜单栏菜单
 *
 * @description
 * Radix 的 `MenubarTrigger` 通过 `onPointerDown`（`button === 0` 且 `ctrlKey === false`）
 * 打开菜单，而不是 `onClick`。
 */
const openMenu = (trigger: HTMLElement): void => {
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
};

describe('Menubar 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染菜单栏根节点与触发器', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
          </MenubarMenu>
        </Menubar>,
      );

      expect(screen.getByRole('menubar')).toHaveAttribute('data-slot', 'menubar');
      expect(screen.getByRole('menuitem', { name: '文件' })).toHaveAttribute('data-slot', 'menubar-trigger');
    });

    it('应该正确应用菜单栏根节点类名', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
          </MenubarMenu>
        </Menubar>,
      );

      const menubar = screen.getByRole('menubar');
      expect(menubar).toHaveClass('flex');
      expect(menubar).toHaveClass('h-9');
      expect(menubar).toHaveClass('items-center');
      expect(menubar).toHaveClass('rounded-md');
      expect(menubar).toHaveClass('border');
      expect(menubar).toHaveClass('bg-background');
      expect(menubar).toHaveClass('p-1');
    });

    it('应该正确应用触发器类名', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
          </MenubarMenu>
        </Menubar>,
      );

      const trigger = screen.getByRole('menuitem', { name: '文件' });
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('rounded-sm');
      expect(trigger).toHaveClass('px-2');
      expect(trigger).toHaveClass('py-1');
      expect(trigger).toHaveClass('font-medium');
      expect(trigger).toHaveClass('text-sm');
      expect(trigger).toHaveClass('focus:bg-accent');
      expect(trigger).toHaveClass('data-[state=open]:bg-accent');
    });

    it('应该正确渲染菜单内容结构', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarLabel>分组标题</MenubarLabel>
                <MenubarItem>新建</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>退出</MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const menu = await screen.findByRole('menu');
      expect(menu).toHaveAttribute('data-slot', 'menubar-content');
      expect(screen.getByText('分组标题')).toHaveAttribute('data-slot', 'menubar-label');
      expect(screen.getByRole('menuitem', { name: '新建' })).toHaveAttribute('data-slot', 'menubar-item');
    });

    it('应该正确应用菜单内容类名', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>内容</MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const menu = await screen.findByRole('menu');
      expect(menu).toHaveClass('z-50');
      expect(menu).toHaveClass('min-w-[12rem]');
      expect(menu).toHaveClass('rounded-md');
      expect(menu).toHaveClass('border');
      expect(menu).toHaveClass('bg-popover');
      expect(menu).toHaveClass('p-1');
      expect(menu).toHaveClass('shadow-md');
    });

    it('应该正确应用分隔线与快捷键提示类名', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                新建
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const shortcut = await screen.findByText('⌘N');
      expect(shortcut).toHaveAttribute('data-slot', 'menubar-shortcut');
      expect(shortcut).toHaveClass('ml-auto');
      expect(shortcut).toHaveClass('text-muted-foreground');

      const separator = document.querySelector('[data-slot="menubar-separator"]');
      expect(separator).toHaveClass('h-px');
      expect(separator).toHaveClass('bg-border');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="custom-trigger">文件</MenubarTrigger>
            <MenubarContent className="custom-content">
              <MenubarItem className="custom-item">新建</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      expect(screen.getByRole('menuitem', { name: '文件' })).toHaveClass('custom-trigger');

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      expect(await screen.findByRole('menu')).toHaveClass('custom-content');
      expect(await screen.findByRole('menuitem', { name: '新建' })).toHaveClass('custom-item');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
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

      expect(screen.getByRole('menuitem', { name: '文件' })).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('应该在打开后渲染打开状态', async () => {
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

      const trigger = screen.getByRole('menuitem', { name: '文件' });
      openMenu(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByRole('menu')).toHaveAttribute('data-state', 'open');
    });

    it('应该在禁用菜单项上渲染 data-disabled 与 aria-disabled', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>禁用项</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const item = await screen.findByRole('menuitem', { name: '禁用项' });
      expect(item).toHaveAttribute('data-disabled');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('应该在破坏性菜单项上渲染 data-variant', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem variant="destructive">删除</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const item = await screen.findByRole('menuitem', { name: '删除' });
      expect(item).toHaveAttribute('data-variant', 'destructive');
      expect(item).toHaveClass('data-[variant=destructive]:text-destructive');
    });

    it('应该在 checked 复选项上渲染 data-state 为 checked', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>显示网格</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '视图' }));

      const item = await screen.findByRole('menuitemcheckbox', { name: '显示网格' });
      expect(item).toHaveAttribute('data-state', 'checked');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在单选项上渲染 aria-checked', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="grid">
                <MenubarRadioItem value="grid">网格</MenubarRadioItem>
                <MenubarRadioItem value="list">列表</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '视图' }));

      const grid = await screen.findByRole('menuitemradio', { name: '网格' });
      const list = await screen.findByRole('menuitemradio', { name: '列表' });
      expect(grid).toHaveAttribute('aria-checked', 'true');
      expect(list).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时打开菜单', async () => {
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

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该在点击菜单项时触发选择回调', async () => {
      const handleSelect = vi.fn();
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={handleSelect}>新建</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '新建' }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('应该在点击复选项时触发选中状态回调', async () => {
      const handleCheckedChange = vi.fn();
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked={false} onCheckedChange={handleCheckedChange}>
                显示网格
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '视图' }));
      fireEvent.click(await screen.findByRole('menuitemcheckbox', { name: '显示网格' }));

      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    });

    it('应该在点击单选项时触发值变更回调', async () => {
      const handleValueChange = vi.fn();
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="grid" onValueChange={handleValueChange}>
                <MenubarRadioItem value="list">列表</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '视图' }));
      fireEvent.click(await screen.findByRole('menuitemradio', { name: '列表' }));

      expect(handleValueChange).toHaveBeenCalledWith('list');
    });

    it('应该在点击禁用菜单项时不触发选择回调', async () => {
      const handleSelect = vi.fn();
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled onSelect={handleSelect}>
                禁用项
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '禁用项' }));

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('应该在按下 ArrowDown 键时打开菜单', async () => {
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

      const trigger = screen.getByRole('menuitem', { name: '文件' });
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该在按下 Enter 键时打开菜单', async () => {
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

      const trigger = screen.getByRole('menuitem', { name: '文件' });
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 menubar 语义角色', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
          </MenubarMenu>
        </Menubar>,
      );

      expect(screen.getByRole('menubar')).toBeInTheDocument();
    });

    it('应该暴露 menu 语义角色', async () => {
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

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该暴露 menuitemcheckbox 与 menuitemradio 语义角色', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem>显示网格</MenubarCheckboxItem>
              <MenubarRadioGroup>
                <MenubarRadioItem value="grid">网格</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '视图' }));

      expect(await screen.findByRole('menuitemcheckbox', { name: '显示网格' })).toBeInTheDocument();
      expect(await screen.findByRole('menuitemradio', { name: '网格' })).toBeInTheDocument();
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
          </MenubarMenu>
        </Menubar>,
      );

      const trigger = screen.getByRole('menuitem', { name: '文件' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该在打开时把焦点移入菜单', async () => {
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

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const menu = await screen.findByRole('menu');
      await waitFor(() => {
        // Radix 打开菜单时把焦点移入菜单容器内部
        expect(menu.contains(document.activeElement)).toBe(true);
      });
    });

    it('应该透传 aria-label 到菜单项', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem aria-label="新建文件">新建</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      expect(await screen.findByRole('menuitem', { name: '新建文件' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的展开值', async () => {
      const handleValueChange = vi.fn();
      render(
        <Menubar value="" onValueChange={handleValueChange}>
          <MenubarMenu value="file">
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>新建</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('file');
      });
      // 受控模式下展开值由外部决定，组件本身不会自行变更
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('应该允许渲染没有菜单项的菜单', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent />
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该渲染子菜单触发器与子菜单内容', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>更多</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>子项</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const subTrigger = await screen.findByRole('menuitem', { name: '更多' });
      expect(subTrigger).toHaveAttribute('data-slot', 'menubar-sub-trigger');
      expect(subTrigger).toHaveClass('data-[state=open]:bg-accent');
    });

    it('应该透传额外的 data-* 属性到菜单栏根节点', () => {
      render(
        <Menubar data-custom="value">
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
          </MenubarMenu>
        </Menubar>,
      );

      expect(screen.getByRole('menubar')).toHaveAttribute('data-custom', 'value');
    });

    it('应该在菜单项上渲染 data-inset 属性', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem inset>缩进项</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>,
      );

      openMenu(screen.getByRole('menuitem', { name: '文件' }));

      const item = await screen.findByRole('menuitem', { name: '缩进项' });
      expect(item).toHaveAttribute('data-inset', 'true');
      expect(item).toHaveClass('data-[inset]:pl-8');
    });
  });
});
