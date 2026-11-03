import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Label } from '../../label';
import { Textarea } from '../textarea';

const meta = {
  title: 'EASAI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

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
      <Label htmlFor="message-2">您的消息</Label>
      <Textarea id="message-2" placeholder="请输入您的消息..." />
      <p className="text-muted-foreground text-sm">您可以 @提及 其他用户和组织。</p>
    </div>
  ),
};

export const FixedSize: Story = {
  name: '固定宽高',
  render: () => (
    <Textarea
      placeholder="固定宽度和高度 (w-96 h-32)"
      className="h-32 w-96 resize-none" // resize-none 禁用了用户手动调整大小
    />
  ),
};

export const MinMaxHeight: Story = {
  name: '最小/最大高度 (宽度100%)',
  render: () => (
    <Textarea
      placeholder="最小高度100px, 最大高度300px, 宽度100%"
      className="max-h-[300px] min-h-[100px] w-full resize-y" // resize-y 允许垂直调整大小
    />
  ),
};

// The original WithDescription story might have been incomplete in the prompt, restoring a basic version.
// If WithDescription had more specific content, it should be reviewed.
// For now, let's assume the user wants to add new stories after the existing ones.
// The following is a placeholder if WithDescription was the last one and was meant to be continued.
// If WithDescription was complete, this can be removed.
export const WithDescription2: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="feedback">反馈</Label>
      <Textarea id="feedback" placeholder="请分享您的想法..." />
      <p className="text-muted-foreground text-sm">您的反馈将帮助我们改进产品。</p>
    </div>
  ),
};

export const AutoResize: Story = {
  render: () => <Textarea placeholder="输入内容自动调整高度..." className="max-h-[300px] min-h-[100px]" />,
};

export const WithMaxLength: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="space-y-2">
        <Textarea placeholder="最多输入100字..." maxLength={100} value={value} onChange={(e) => setValue(e.target.value)} />
        <p className="text-muted-foreground text-sm">剩余字数：{100 - value.length}</p>
      </div>
    );
  },
};

// === 变体用例 ===
export const VariantDefault: Story = {
  name: '默认状态',
  render: () => <Textarea placeholder="默认状态..." />,
};

export const VariantError: Story = {
  name: '错误状态',
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-error">错误信息</Label>
      <Textarea id="textarea-error" placeholder="请输入内容..." error />
      <p className="text-destructive text-sm">内容不能为空</p>
    </div>
  ),
};

export const VariantSuccess: Story = {
  name: '成功状态',
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-success">成功信息</Label>
      <Textarea id="textarea-success" placeholder="内容已通过校验..." success />
      <p className="text-sm text-success">输入合法</p>
    </div>
  ),
};
