/**
 * Spinner 组件 Storybook 示例
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../spinner';

const meta = {
  title: 'EASAI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '用于表示加载状态的旋转指示器组件',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '组件尺寸',
      table: {
        type: { summary: 'sm | md | lg' },
        defaultValue: { summary: 'md' },
      },
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning'],
      description: '颜色变体',
      table: {
        type: { summary: 'default | destructive | success | warning' },
        defaultValue: { summary: 'default' },
      },
    },
    className: {
      control: 'text',
      description: '自定义类名',
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// 默认示例
export const Default: Story = {
  args: {
    size: 'md',
    variant: 'default',
  },
};

// 尺寸示例
export const Sizes: Story = {
  parameters: {
    controls: { exclude: ['size'] },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

// 颜色变体示例
export const Variants: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner variant="default" />
      <Spinner variant="destructive" />
      <Spinner variant="success" />
      <Spinner variant="warning" />
    </div>
  ),
};

// 组合示例
export const Combination: Story = {
  args: {
    size: 'lg',
    variant: 'success',
    className: 'border rounded-full p-2',
  },
  parameters: {
    docs: {
      description: {
        story: '组合使用尺寸和自定义样式的示例',
      },
    },
  },
};

// 自定义动画示例
export const CustomAnimation: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="animate-pulse" />
      <Spinner className="animate-bounce" />
    </div>
  ),
};

// 新增速度控制示例
export const SpeedControl: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Spinner className="[animation-duration:0.5s]" />
      <Spinner className="[animation-duration:1s]" />
      <Spinner className="[animation-duration:2s]" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '通过自定义动画时长控制旋转速度',
      },
    },
  },
};

// 新增组合应用场景
export const InButton: Story = {
  render: () => (
    <button type="button" className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
      <Spinner size="sm" className="text-inherit" />
      加载中...
    </button>
  ),
};
