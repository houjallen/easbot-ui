import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './toggle';
import { Bold, Italic, Underline } from 'lucide-react';

const meta: Meta<typeof Toggle> = {
  title: 'EASAI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => <Toggle>加粗</Toggle>,
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex space-x-2">
      <Toggle aria-label="切换加粗">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="切换斜体">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="切换下划线">
        <Underline className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <Toggle disabled>禁用状态</Toggle>,
};

export const Outline: Story = {
  render: () => <Toggle variant="outline">轮廓样式</Toggle>,
};

export const Small: Story = {
  render: () => <Toggle size="sm">小尺寸</Toggle>,
};

export const Large: Story = {
  render: () => <Toggle size="lg">大尺寸</Toggle>,
};

export const Group: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle size="sm">小号</Toggle>
      <Toggle variant="outline">轮廓</Toggle>
      <Toggle size="lg">大号</Toggle>
    </div>
  ),
};
