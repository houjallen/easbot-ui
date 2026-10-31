import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { Label } from '../label';
import React from 'react';

const meta: Meta<typeof Textarea> = {
  title: 'EASAI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => <Textarea placeholder="请输入内容..." />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">消息</Label>
      <Textarea id="message" placeholder="请输入您的消息..." />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <Textarea placeholder="禁用状态..." disabled />,
};

export const WithDescription: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="feedback">反馈</Label>
      <Textarea id="feedback" placeholder="请分享您的想法..." />
      <p className="text-sm text-muted-foreground">您的反馈将帮助我们改进产品。</p>
    </div>
  ),
};

export const AutoResize: Story = {
  render: () => <Textarea placeholder="输入内容自动调整高度..." className="min-h-[100px] max-h-[300px]" />,
};

export const WithMaxLength: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="space-y-2">
        <Textarea placeholder="最多输入100字..." maxLength={100} value={value} onChange={(e) => setValue(e.target.value)} />
        <p className="text-sm text-muted-foreground">剩余字数：{100 - value.length}</p>
      </div>
    );
  },
};
