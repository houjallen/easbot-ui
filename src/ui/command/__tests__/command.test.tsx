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
});
