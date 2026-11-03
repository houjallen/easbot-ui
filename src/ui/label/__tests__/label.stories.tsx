import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../input/input';
import { Label } from '../label';

const meta = {
  title: 'EASAI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

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
  render: () => <Label className="font-bold text-blue-600 text-lg">自定义样式标签</Label>,
};
