/**
 * ContextMenu 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态、选中态、禁用态
 * 3. 交互测试 - 验证右键打开菜单与菜单项选择回调
 * 4. 无障碍测试 - 验证 menu/menuitem 语义角色、aria-checked、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空菜单
 *
 * @remarks
 * Radix 的 `ContextMenuTrigger` 通过 `onContextMenu` 打开菜单，
 * 因此测试必须派发 `fireEvent.contextMenu(...)`（右键事件）。
 * 另外 Radix 的 `ContextMenu` **不支持 `defaultOpen`**（内部默认值硬编码为 false），
 * 所以每个用例都要先右键打开菜单再断言。
 * 菜单内容渲染到 `document.body`（portal），必须用 `screen.findByRole(...)` 查询。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../context-menu';

/**
 * 打开右键菜单
 *
 * @description
 * Radix 的 `ContextMenuTrigger` 通过 `onContextMenu` 打开菜单，
 * 触摸/触控笔走长按逻辑（jsdom 中不稳定），因此测试统一使用右键事件。
 */
const openMenu = (trigger: HTMLElement): void => {
  fireEvent.contextMenu(trigger);
};

/**
 * 渲染并右键打开右键菜单
 *
 * @description
 * Radix 的 `ContextMenu` 不支持 `defaultOpen`，只能通过右键事件打开，
 * 因此这里统一封装「渲染 + 打开」两步，方便各用例复用。
 */
const renderOpenMenu = (children: React.ReactNode): HTMLElement => {
  render(
    <ContextMenu>
      <ContextMenuTrigger>右键区域</ContextMenuTrigger>
      <ContextMenuContent>{children}</ContextMenuContent>
    </ContextMenu>,
  );
  openMenu(screen.getByText('右键区域'));
  return screen.getByText('右键区域');
};

describe('ContextMenu 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发区域', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>右键区域</ContextMenuTrigger>
        </ContextMenu>,
      );

      const trigger = screen.getByText('右键区域');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'context-menu-trigger');
    });

    it('应该正确渲染菜单内容结构', async () => {
      renderOpenMenu(
        <ContextMenuGroup>
          <ContextMenuLabel>分组标题</ContextMenuLabel>
          <ContextMenuItem>菜单项一</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>菜单项二</ContextMenuItem>
        </ContextMenuGroup>,
      );

      const menu = await screen.findByRole('menu');
      expect(menu).toHaveAttribute('data-slot', 'context-menu-content');
      expect(screen.getByText('分组标题')).toHaveAttribute('data-slot', 'context-menu-label');
      expect(screen.getByRole('menuitem', { name: '菜单项一' })).toHaveAttribute('data-slot', 'context-menu-item');
    });

    it('应该正确应用菜单内容类名', async () => {
      renderOpenMenu('内容');

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
      renderOpenMenu(<ContextMenuItem>菜单项</ContextMenuItem>);

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
      renderOpenMenu(
        <>
          <ContextMenuItem>
            菜单项
            <ContextMenuShortcut>⌘K</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
        </>,
      );

      const shortcut = await screen.findByText('⌘K');
      expect(shortcut).toHaveAttribute('data-slot', 'context-menu-shortcut');
      expect(shortcut).toHaveClass('ml-auto');
      expect(shortcut).toHaveClass('text-muted-foreground');

      const separator = document.querySelector('[data-slot="context-menu-separator"]');
      expect(separator).toHaveClass('h-px');
      expect(separator).toHaveClass('bg-border');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>右键区域</ContextMenuTrigger>
          <ContextMenuContent className="custom-content">
            <ContextMenuItem className="custom-item">菜单项</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );
      openMenu(screen.getByText('右键区域'));

      expect(await screen.findByRole('menu')).toHaveClass('custom-content');
      expect(await screen.findByRole('menuitem', { name: '菜单项' })).toHaveClass('custom-item');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>右键区域</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>菜单项</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      expect(screen.getByText('右键区域')).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('应该在右键打开后渲染打开状态', async () => {
      const trigger = renderOpenMenu(<ContextMenuItem>菜单项</ContextMenuItem>);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByRole('menu')).toHaveAttribute('data-state', 'open');
    });

    it('应该在禁用菜单项上渲染 data-disabled 与 aria-disabled', async () => {
      renderOpenMenu(<ContextMenuItem disabled>禁用项</ContextMenuItem>);

      const item = await screen.findByRole('menuitem', { name: '禁用项' });
      expect(item).toHaveAttribute('data-disabled');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('应该在破坏性菜单项上渲染 data-variant', async () => {
      renderOpenMenu(<ContextMenuItem variant="destructive">删除</ContextMenuItem>);

      const item = await screen.findByRole('menuitem', { name: '删除' });
      expect(item).toHaveAttribute('data-variant', 'destructive');
      expect(item).toHaveClass('data-[variant=destructive]:text-destructive');
    });

    it('应该在默认菜单项上渲染 data-variant 为 default', async () => {
      renderOpenMenu(<ContextMenuItem>普通项</ContextMenuItem>);

      const item = await screen.findByRole('menuitem', { name: '普通项' });
      expect(item).toHaveAttribute('data-variant', 'default');
    });

    it('应该在 checked 复选项上渲染 data-state 为 checked', async () => {
      renderOpenMenu(<ContextMenuCheckboxItem checked>显示网格</ContextMenuCheckboxItem>);

      const item = await screen.findByRole('menuitemcheckbox', { name: '显示网格' });
      expect(item).toHaveAttribute('data-state', 'checked');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在单选项上渲染 aria-checked', async () => {
      renderOpenMenu(
        <ContextMenuRadioGroup value="grid">
          <ContextMenuRadioItem value="grid">网格</ContextMenuRadioItem>
          <ContextMenuRadioItem value="list">列表</ContextMenuRadioItem>
        </ContextMenuRadioGroup>,
      );

      const grid = await screen.findByRole('menuitemradio', { name: '网格' });
      const list = await screen.findByRole('menuitemradio', { name: '列表' });
      expect(grid).toHaveAttribute('aria-checked', 'true');
      expect(list).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('交互测试', () => {
    it('应该在右键触发器时打开菜单', async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>右键区域</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>菜单项</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      openMenu(screen.getByText('右键区域'));

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该在点击菜单项时触发选择回调', async () => {
      const handleSelect = vi.fn();
      renderOpenMenu(<ContextMenuItem onSelect={handleSelect}>菜单项</ContextMenuItem>);

      fireEvent.click(await screen.findByRole('menuitem', { name: '菜单项' }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('应该在点击复选项时触发选中状态回调', async () => {
      const handleCheckedChange = vi.fn();
      renderOpenMenu(
        <ContextMenuCheckboxItem checked={false} onCheckedChange={handleCheckedChange}>
          显示网格
        </ContextMenuCheckboxItem>,
      );

      fireEvent.click(await screen.findByRole('menuitemcheckbox', { name: '显示网格' }));

      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    });

    it('应该在点击单选项时触发值变更回调', async () => {
      const handleValueChange = vi.fn();
      renderOpenMenu(
        <ContextMenuRadioGroup value="grid" onValueChange={handleValueChange}>
          <ContextMenuRadioItem value="list">列表</ContextMenuRadioItem>
        </ContextMenuRadioGroup>,
      );

      fireEvent.click(await screen.findByRole('menuitemradio', { name: '列表' }));

      expect(handleValueChange).toHaveBeenCalledWith('list');
    });

    it('应该在点击禁用菜单项时不触发选择回调', async () => {
      const handleSelect = vi.fn();
      renderOpenMenu(
        <ContextMenuItem disabled onSelect={handleSelect}>
          禁用项
        </ContextMenuItem>,
      );

      fireEvent.click(await screen.findByRole('menuitem', { name: '禁用项' }));

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('应该在点击菜单项后关闭菜单', async () => {
      renderOpenMenu(<ContextMenuItem>菜单项</ContextMenuItem>);

      fireEvent.click(await screen.findByRole('menuitem', { name: '菜单项' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('应该在右键时触发打开状态回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <ContextMenu onOpenChange={handleOpenChange}>
          <ContextMenuTrigger>右键区域</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>菜单项</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      openMenu(screen.getByText('右键区域'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 menu 语义角色', async () => {
      renderOpenMenu(<ContextMenuItem>菜单项</ContextMenuItem>);

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该暴露 menuitem 语义角色', async () => {
      renderOpenMenu(<ContextMenuItem>菜单项</ContextMenuItem>);

      expect(await screen.findByRole('menuitem', { name: '菜单项' })).toBeInTheDocument();
    });

    it('应该暴露 menuitemcheckbox 与 menuitemradio 语义角色', async () => {
      renderOpenMenu(
        <>
          <ContextMenuCheckboxItem>显示网格</ContextMenuCheckboxItem>
          <ContextMenuRadioGroup>
            <ContextMenuRadioItem value="grid">网格</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </>,
      );

      expect(await screen.findByRole('menuitemcheckbox', { name: '显示网格' })).toBeInTheDocument();
      expect(await screen.findByRole('menuitemradio', { name: '网格' })).toBeInTheDocument();
    });

    it('应该在打开时把焦点移入菜单', async () => {
      renderOpenMenu(<ContextMenuItem>菜单项</ContextMenuItem>);

      const menu = await screen.findByRole('menu');
      await waitFor(() => {
        // Radix 打开菜单时把焦点移入菜单容器内部
        expect(menu.contains(document.activeElement)).toBe(true);
      });
    });

    it('应该透传 aria-label 到菜单项', async () => {
      renderOpenMenu(<ContextMenuItem aria-label="删除项目">删除</ContextMenuItem>);

      expect(await screen.findByRole('menuitem', { name: '删除项目' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <ContextMenu open={false} onOpenChange={handleOpenChange}>
          <ContextMenuTrigger>右键区域</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>菜单项</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      openMenu(screen.getByText('右键区域'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('应该允许渲染没有菜单项的菜单', async () => {
      renderOpenMenu(null);

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该渲染子菜单触发器与子菜单内容', async () => {
      renderOpenMenu(
        <ContextMenuSub>
          <ContextMenuSubTrigger>更多</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>子项</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>,
      );

      const subTrigger = await screen.findByRole('menuitem', { name: '更多' });
      expect(subTrigger).toHaveAttribute('data-slot', 'context-menu-sub-trigger');
      expect(subTrigger).toHaveClass('data-[state=open]:bg-accent');
    });

    it('应该透传额外的 data-* 属性到触发区域', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger data-custom="value">右键区域</ContextMenuTrigger>
        </ContextMenu>,
      );

      expect(screen.getByText('右键区域')).toHaveAttribute('data-custom', 'value');
    });

    it('应该在菜单项上渲染 data-inset 属性', async () => {
      renderOpenMenu(<ContextMenuItem inset>缩进项</ContextMenuItem>);

      const item = await screen.findByRole('menuitem', { name: '缩进项' });
      expect(item).toHaveAttribute('data-inset', 'true');
      expect(item).toHaveClass('data-[inset]:pl-8');
    });
  });
});
