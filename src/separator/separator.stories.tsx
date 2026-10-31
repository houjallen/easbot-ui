import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'EASAI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">标题</h4>
        <p className="text-sm text-muted-foreground">这是一个分隔线示例。</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>设置</div>
        <Separator orientation="vertical" />
        <div>消息</div>
        <Separator orientation="vertical" />
        <div>账户</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>设置</div>
      <Separator orientation="vertical" />
      <div>消息</div>
      <Separator orientation="vertical" />
      <div>账户</div>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-4">
      <div>上方内容</div>
      <Separator />
      <div>下方内容</div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="relative">
      <Separator className="my-8" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">或</div>
    </div>
  ),
};

export const Decorative: Story = {
  args: {
    decorative: true,
    className: 'my-8 bg-blue-500 h-[2px]',
  },
  render: (args) => (
    <div className="space-y-4">
      <div>上方内容区域</div>
      <Separator {...args} />
      <div>下方内容区域</div>
    </div>
  ),
};
