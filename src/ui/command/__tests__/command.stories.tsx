// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useToast } from '../../use-toast';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../command';

const meta = {
  title: 'EASAI/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { toast } = useToast();

    return (
      <Command className="rounded-lg border shadow-md" {...args}>
        <CommandInput placeholder="输入命令…" />
        <CommandList>
          <CommandEmpty>未找到结果</CommandEmpty>
          <CommandGroup heading="建议">
            <CommandItem
              onSelect={() => {
                toast({
                  title: '搜索',
                  description: '您点击了搜索命令',
                  variant: 'default',
                });
              }}
            >
              搜索…
            </CommandItem>
            <CommandItem
              onSelect={() => {
                toast({
                  title: '过滤',
                  description: '您点击了过滤命令',
                  variant: 'success',
                });
              }}
            >
              过滤…
            </CommandItem>
            <CommandItem
              onSelect={() => {
                toast({
                  title: '设置',
                  description: '您点击了设置命令',
                  variant: 'destructive',
                });
              }}
            >
              设置…
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
  },
};

export const WithDialog: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { toast } = useToast();

    return (
      <div className="flex flex-col items-center gap-4">
        <button type="button" onClick={() => setOpen(true)} className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          打开命令面板
        </button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="输入命令…" />
          <CommandList>
            <CommandEmpty>未找到结果</CommandEmpty>
            <CommandGroup heading="建议">
              <CommandItem
                onSelect={() => {
                  toast({
                    title: '搜索',
                    description: '您点击了搜索命令',
                    variant: 'default',
                  });
                  setOpen(false);
                }}
              >
                搜索…
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  toast({
                    title: '过滤',
                    description: '您点击了过滤命令',
                    variant: 'success',
                  });
                  setOpen(false);
                }}
              >
                过滤…
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  toast({
                    title: '设置',
                    description: '您点击了设置命令',
                    variant: 'destructive',
                  });
                  setOpen(false);
                }}
              >
                设置…
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="设置">
              <CommandItem
                onSelect={() => {
                  toast({
                    title: '个人资料',
                    description: '您点击了个人资料命令',
                    variant: 'default',
                  });
                  setOpen(false);
                }}
              >
                个人资料
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  toast({
                    title: '偏好设置',
                    description: '您点击了偏好设置命令',
                    variant: 'success',
                  });
                  setOpen(false);
                }}
              >
                偏好设置
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    );
  },
};

export const LoadingState: Story = {
  render: () => (
    <CommandDialog>
      <CommandInput placeholder="正在加载…" />
      <CommandList>
        <CommandEmpty>加载中…</CommandEmpty>
      </CommandList>
    </CommandDialog>
  ),
};

export const Filtering: Story = {
  render: () => (
    <Command>
      <CommandInput placeholder="搜索水果…" />
      <CommandList>
        <CommandGroup heading="水果">
          <CommandItem>苹果</CommandItem>
          <CommandItem>香蕉</CommandItem>
          <CommandItem>橙子</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
