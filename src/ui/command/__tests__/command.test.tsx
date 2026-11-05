import { fireEvent, render, screen } from '@testing-library/react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../command';

describe('Command 组件', () => {
  describe('基础功能', () => {
    it('应正确渲染输入框', () => {
      render(
        <Command>
          <CommandInput placeholder="搜索..." />
        </Command>,
      );
      // cmdk 的输入框语义角色是 `combobox`（带 `aria-autocomplete`），不是 `textbox`
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
    });

    it('CommandDialog 应渲染默认标题与描述', () => {
      render(
        <CommandDialog open>
          <CommandInput />
        </CommandDialog>,
      );
      // 标题 / 描述为 `sr-only`，来自内置文案表（见 spec/i18n-standard.md）
      expect(screen.getByText('命令面板')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应过滤命令项', async () => {
      render(
        <Command>
          <CommandInput />
          <CommandList>
            <CommandGroup heading="测试">
              <CommandItem>苹果</CommandItem>
              <CommandItem>香蕉</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>,
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: '苹果' } });
      expect(screen.getByText('苹果')).toBeVisible();
      expect(screen.queryByText('香蕉')).not.toBeInTheDocument();
    });

    it('无匹配项时应显示空状态', async () => {
      render(
        <Command>
          <CommandInput />
          <CommandList>
            <CommandEmpty>没有匹配结果</CommandEmpty>
            <CommandGroup heading="测试">
              <CommandItem>苹果</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>,
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: '不存在的关键词' } });
      expect(await screen.findByText('没有匹配结果')).toBeVisible();
    });
  });

  /**
   * 弹层选项鼠标指针（cmdk 与 Radix 的禁用态差异）
   *
   * @description
   * cmdk 的 Command.Item 输出 `"data-disabled": !!disabled` ——
   * **可用项也会渲染 `data-disabled="false"`**（属性恒存在）。
   * 因此禁用样式必须用 `data-[disabled=true]:` 按属性值精确匹配；
   * 若误用 `data-[disabled]:`（属性存在即匹配），禁用样式会误伤所有可用项。
   */
  describe('弹层选项鼠标指针', () => {
    it('可用项应是 cursor-pointer，且不被恒存在的 data-disabled 属性误伤', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>可用命令</CommandItem>
          </CommandList>
        </Command>,
      );

      const item = screen.getByRole('option');
      // cmdk 对可用项也输出 data-disabled="false"（属性恒存在）
      expect(item).toHaveAttribute('data-disabled', 'false');
      expect(item).toHaveClass('cursor-pointer');
      expect(item.className).not.toContain('cursor-default');
      // 关键：不得使用「属性存在即匹配」的裸 data-[disabled]: 禁用样式
      expect(item.className).not.toMatch(/(^|\s)data-\[disabled\]:(cursor|opacity)/);
    });

    it('禁用项应精确匹配 data-disabled=true 并显示 not-allowed', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem disabled>禁用命令</CommandItem>
          </CommandList>
        </Command>,
      );

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('data-disabled', 'true');
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(item).toHaveClass('data-[disabled=true]:cursor-not-allowed');
      expect(item).toHaveClass('data-[disabled=true]:opacity-50');
      // 禁用态不得屏蔽指针事件（规范 css-standard.md §4.9）
      expect(item.className).not.toMatch(/data-\[disabled([^\]]*)\]:pointer-events-none/);
    });
  });
});
