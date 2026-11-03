// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Bold, Italic } from 'lucide-react';
import { Toggle } from '../toggle';

const meta = {
  title: 'EASAI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Toggle>默认样式</Toggle>
      <Toggle variant="outline">轮廓样式</Toggle>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Toggle>
        <Bold className="mr-2 h-4 w-4" />
        加粗
      </Toggle>
      <Toggle variant="outline">
        <Italic className="mr-2 h-4 w-4" />
        斜体
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Toggle size="sm">小尺寸</Toggle>
      <Toggle>默认尺寸</Toggle>
      <Toggle size="lg">大尺寸</Toggle>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <Toggle>默认状态</Toggle>
        <Toggle variant="outline">轮廓样式</Toggle>
      </div>
      <div className="flex space-x-4">
        <Toggle disabled>禁用状态</Toggle>
        <Toggle disabled variant="outline">
          禁用轮廓
        </Toggle>
      </div>
      <div className="flex space-x-4">
        <Toggle defaultChecked>已选中</Toggle>
        <Toggle defaultChecked variant="outline">
          已选中轮廓
        </Toggle>
      </div>
    </div>
  ),
};

export const Grouped: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <Toggle>选项1</Toggle>
        <Toggle>选项2</Toggle>
        <Toggle>选项3</Toggle>
      </div>
      <div className="flex space-x-2">
        <Toggle variant="outline">选项A</Toggle>
        <Toggle variant="outline">选项B</Toggle>
        <Toggle variant="outline">选项C</Toggle>
      </div>
    </div>
  ),
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
