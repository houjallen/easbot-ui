/**
 * Command 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证选中态、禁用态、过滤结果
 * 3. 交互测试 - 验证输入过滤、方向键移动焦点与点击选中回调
 * 4. 无障碍测试 - 验证 combobox/listbox/option 语义角色、焦点管理
 * 5. 边界测试 - 验证受控模式、空结果、透传属性
 *
 * @remarks
 * `cmdk` 的 `CommandList` 通过 `ResizeObserver` 测量列表高度以计算滚动位置 ——
 * jsdom 未实现，必须引入共享 polyfill，否则渲染即抛错。
 * `cmdk` 的输入框是 `role="combobox"`，列表是 `role="listbox"`，选项是 `role="option"`。
 * 方向键移动选中项由 `cmdk` 内部实现，选中态通过 `data-selected` / `aria-selected` 暴露。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '../command';

describe('Command 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染命令面板结构', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandEmpty>未找到结果</CommandEmpty>
            <CommandGroup heading="建议">
              <CommandItem>打开设置</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>,
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('data-slot', 'command-input');
      expect(screen.getByRole('listbox')).toHaveAttribute('data-slot', 'command-list');
      expect(screen.getByRole('option', { name: '打开设置' })).toHaveAttribute('data-slot', 'command-item');
    });

    it('应该正确应用命令面板根节点类名', () => {
      const { container } = render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList />
        </Command>,
      );

      const root = container.querySelector('[data-slot="command"]');
      expect(root).toHaveClass('flex');
      expect(root).toHaveClass('h-full');
      expect(root).toHaveClass('w-full');
      expect(root).toHaveClass('flex-col');
      expect(root).toHaveClass('overflow-hidden');
      expect(root).toHaveClass('rounded-md');
      expect(root).toHaveClass('bg-popover');
      expect(root).toHaveClass('text-popover-foreground');
    });

    it('应该正确应用输入框包装层与输入框类名', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList />
        </Command>,
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('gap-2');
      expect(wrapper).toHaveClass('border-b');
      expect(wrapper).toHaveClass('px-3');

      const input = screen.getByRole('combobox');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-10');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('bg-transparent');
      expect(input).toHaveClass('py-3');
      expect(input).toHaveClass('text-sm');
    });

    it('应该正确应用命令项类名', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      const item = screen.getByRole('option', { name: '打开设置' });
      expect(item).toHaveClass('relative');
      expect(item).toHaveClass('flex');
      expect(item).toHaveClass('items-center');
      expect(item).toHaveClass('gap-2');
      expect(item).toHaveClass('rounded-sm');
      expect(item).toHaveClass('px-2');
      expect(item).toHaveClass('py-1.5');
      expect(item).toHaveClass('text-sm');
    });

    it('应该正确应用分组与分隔线类名', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandGroup heading="建议">
              <CommandItem>打开设置</CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>,
      );

      const group = document.querySelector('[data-slot="command-group"]');
      expect(group).toHaveClass('overflow-hidden');
      expect(group).toHaveClass('p-1');
      expect(group).toHaveClass('text-foreground');

      const separator = document.querySelector('[data-slot="command-separator"]');
      expect(separator).toHaveClass('h-px');
      expect(separator).toHaveClass('bg-border');
    });

    it('应该正确应用快捷键提示类名', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem>
              打开设置
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>,
      );

      const shortcut = screen.getByText('⌘,');
      expect(shortcut).toHaveAttribute('data-slot', 'command-shortcut');
      expect(shortcut).toHaveClass('ml-auto');
      expect(shortcut).toHaveClass('text-muted-foreground');
      expect(shortcut).toHaveClass('text-xs');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Command className="custom-root">
          <CommandInput className="custom-input" placeholder="搜索命令" />
          <CommandList className="custom-list">
            <CommandItem className="custom-item">打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      expect(screen.getByRole('combobox')).toHaveClass('custom-input');
      expect(screen.getByRole('listbox')).toHaveClass('custom-list');
      expect(screen.getByRole('option', { name: '打开设置' })).toHaveClass('custom-item');
    });
  });

  describe('状态测试', () => {
    it('应该默认选中第一个命令项', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
            <CommandItem>退出登录</CommandItem>
          </CommandList>
        </Command>,
      );

      await waitFor(() => {
        expect(screen.getByRole('option', { name: '打开设置' })).toHaveAttribute('data-selected', 'true');
      });
    });

    it('应该在禁用命令项上渲染 data-disabled 与 aria-disabled', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem disabled>禁用项</CommandItem>
          </CommandList>
        </Command>,
      );

      const item = screen.getByRole('option', { name: '禁用项' });
      expect(item).toHaveAttribute('data-disabled', 'true');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('应该在无匹配结果时渲染空状态', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandEmpty>未找到结果</CommandEmpty>
            <CommandGroup heading="建议">
              <CommandItem>打开设置</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>,
      );

      // `cmdk` 的 Empty 仅在过滤结果为空时渲染
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '不存在的命令' } });

      await waitFor(() => {
        expect(screen.getByText('未找到结果')).toBeInTheDocument();
      });
    });

    it('应该在输入不匹配关键词时隐藏命令项', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandEmpty>未找到结果</CommandEmpty>
            <CommandGroup heading="建议">
              <CommandItem>打开设置</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>,
      );

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '不存在的命令' } });

      await waitFor(() => {
        expect(screen.queryByRole('option', { name: '打开设置' })).not.toBeInTheDocument();
      });
      expect(screen.getByText('未找到结果')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在输入关键词时过滤命令项', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandGroup heading="建议">
              <CommandItem>打开设置</CommandItem>
              <CommandItem>退出登录</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>,
      );

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '退出' } });

      await waitFor(() => {
        expect(screen.queryByRole('option', { name: '打开设置' })).not.toBeInTheDocument();
      });
      expect(screen.getByRole('option', { name: '退出登录' })).toBeInTheDocument();
    });

    it('应该在点击命令项时触发选中回调', () => {
      const handleSelect = vi.fn();
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem onSelect={handleSelect}>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      fireEvent.click(screen.getByRole('option', { name: '打开设置' }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('应该在点击禁用命令项时不触发选中回调', () => {
      const handleSelect = vi.fn();
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem disabled onSelect={handleSelect}>
              禁用项
            </CommandItem>
          </CommandList>
        </Command>,
      );

      fireEvent.click(screen.getByRole('option', { name: '禁用项' }));

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('应该在按下 ArrowDown 键时移动选中项', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
            <CommandItem>退出登录</CommandItem>
          </CommandList>
        </Command>,
      );

      const input = screen.getByRole('combobox');
      input.focus();
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(screen.getByRole('option', { name: '退出登录' })).toHaveAttribute('data-selected', 'true');
      });
    });

    it('应该在按下 ArrowUp 键时移动选中项', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
            <CommandItem>退出登录</CommandItem>
          </CommandList>
        </Command>,
      );

      const input = screen.getByRole('combobox');
      input.focus();
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(screen.getByRole('option', { name: '退出登录' })).toHaveAttribute('data-selected', 'true');
      });

      fireEvent.keyDown(input, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(screen.getByRole('option', { name: '打开设置' })).toHaveAttribute('data-selected', 'true');
      });
    });

    it('应该在按下 Enter 键时触发选中回调', async () => {
      const handleSelect = vi.fn();
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem onSelect={handleSelect}>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      const input = screen.getByRole('combobox');
      input.focus();
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleSelect).toHaveBeenCalledTimes(1);
      });
    });

    it('应该在输入变化时触发搜索词变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <Command>
          <CommandInput value="" onValueChange={handleValueChange} placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '设置' } });

      expect(handleValueChange).toHaveBeenCalledWith('设置');
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 combobox 语义角色的输入框', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList />
        </Command>,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('应该暴露 listbox 与 option 语义角色', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '打开设置' })).toBeInTheDocument();
    });

    it('应该通过 aria-autocomplete 暴露输入框的自动补全语义', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList />
        </Command>,
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该通过 aria-selected 暴露当前选中项', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      const option = screen.getByRole('option', { name: '打开设置' });
      await waitFor(() => {
        expect(option).toHaveAttribute('aria-selected', 'true');
      });
      expect(option).toHaveAttribute('id');
    });

    it('应该支持输入框通过键盘获得焦点', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList />
        </Command>,
      );

      const input = screen.getByRole('combobox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('应该透传 label 到命令列表', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList label="命令列表">
            <CommandItem>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      expect(screen.getByRole('listbox', { name: '命令列表' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的搜索词', () => {
      render(
        <Command>
          <CommandInput value="设置" placeholder="搜索命令" />
          <CommandList>
            <CommandItem>打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      expect(screen.getByRole('combobox')).toHaveValue('设置');
    });

    it('应该允许渲染只有输入框的命令面板', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
        </Command>,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('应该允许渲染没有命令项的命令面板', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList />
        </Command>,
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });

    it('应该透传额外的 data-* 属性到命令项', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem data-custom="value">打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      expect(screen.getByRole('option', { name: '打开设置' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该允许通过 value 属性给命令项设置筛选值', async () => {
      render(
        <Command>
          <CommandInput placeholder="搜索命令" />
          <CommandList>
            <CommandItem value="settings">打开设置</CommandItem>
          </CommandList>
        </Command>,
      );

      const item = screen.getByRole('option', { name: '打开设置' });
      expect(item).toHaveAttribute('data-value', 'settings');
    });
  });
});
