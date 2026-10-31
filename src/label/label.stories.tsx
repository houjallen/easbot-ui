import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from '../input/input';

const meta: Meta<typeof Label> = {
  title: 'EASAI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: '标签文本',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">邮箱</Label>
      <Input type="email" id="email" placeholder="请输入邮箱" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="username" required>
        用户名
      </Label>
      <Input type="text" id="username" required placeholder="请输入用户名" />
    </div>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="disabled-input" disabled>
        禁用标签
      </Label>
      <Input type="text" id="disabled-input" disabled />
    </div>
  ),
};

export const CustomStyle: Story = {
  render: () => <Label className="text-lg text-blue-600 font-bold">自定义样式标签</Label>,
};
