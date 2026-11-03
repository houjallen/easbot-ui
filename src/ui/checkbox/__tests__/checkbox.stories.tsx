/**
 * Checkbox 组件的 Storybook 示例文件
 *
 * 展示了Checkbox组件的各种使用场景和样式变体
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../label/label';
import { Checkbox } from '../checkbox';

const meta = {
  title: 'EASAI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
          Checkbox 组件用于在一组选项中进行多选。

          ## 特性
          - 支持中间态
          - 支持禁用状态
          - 支持标签和描述文本
          - 支持错误状态
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    indeterminate: {
      control: 'boolean',
      description: '是否为中间态',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    label: {
      control: 'text',
      description: '标签文本',
    },
    description: {
      control: 'text',
      description: '描述文本',
    },
    error: {
      control: 'text',
      description: '错误信息',
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: '颜色变体',
      table: {
        type: { summary: 'default | destructive' },
        defaultValue: { summary: 'default' },
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基础复选框示例
 */
export const Default: Story = {
  args: {
    label: '同意服务条款',
  },
};

/**
 * 状态示例
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="未选中状态" />
      <Checkbox label="选中状态" defaultChecked />
      <Checkbox label="中间态" indeterminate />
      <Checkbox label="禁用状态" disabled />
      <Checkbox label="禁用且选中" disabled checked />
    </div>
  ),
};

/**
 * 带文本示例
 */
export const WithText: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="带标签的复选框" />

      <Checkbox label="带描述的复选框" description="这是一段描述文本，用于解释该选项的更多信息" />

      <Checkbox label="带错误提示的复选框" error="这是一条错误信息" />

      <Checkbox label="完整示例" description="包含标签、描述和错误信息" error="请先同意服务条款" />
    </div>
  ),
};

/**
 * 组合示例
 */
export const Combinations: Story = {
  render: () => (
    <div className="space-y-6">
      {/* 基础表单组 */}
      <div className="space-y-4">
        <Label>基础选项组</Label>
        <div className="space-y-2">
          <Checkbox label="选项 1" />
          <Checkbox label="选项 2" />
          <Checkbox label="选项 3" />
        </div>
      </div>

      {/* 带描述的选项组 */}
      <div className="space-y-4">
        <Label>带描述的选项组</Label>
        <div className="space-y-2">
          <Checkbox label="选项 1" description="这是选项1的描述文本" />
          <Checkbox label="选项 2" description="这是选项2的描述文本" />
        </div>
      </div>

      {/* 树形结构 */}
      <div className="space-y-4">
        <Label>树形结构示例</Label>
        <div className="space-y-2">
          <Checkbox label="全部文件" indeterminate />
          <div className="ml-6 space-y-2">
            <Checkbox label="文档" />
            <Checkbox label="图片" />
            <Checkbox label="视频" />
          </div>
        </div>
      </div>

      {/* 不同状态组合 */}
      <div className="space-y-4">
        <Label>状态组合示例</Label>
        <div className="space-y-2">
          <Checkbox label="任务 1" checked description="已完成的任务" />
          <Checkbox label="任务 2" description="进行中的任务" />
          <Checkbox label="任务 3" disabled description="已取消的任务" />
        </div>
      </div>
    </div>
  ),
};

/**
 * 新增交互示例
 */
export const InteractiveDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="可滑动复选框" />
    </div>
  ),
};

/**
 * 颜色变体示例
 */
export const ColorVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Checkbox {...args} variant="default" label="默认变体 (Default)" id="checkbox-default" checked />
      <Checkbox {...args} variant="destructive" label="警示变体 (Destructive)" id="checkbox-destructive" checked />
      <Checkbox {...args} variant="destructive" label="警示变体未选中 (Destructive Unchecked)" id="checkbox-destructive-unchecked" />
      <Checkbox {...args} variant="destructive" label="警示变体禁用 (Destructive Disabled)" id="checkbox-destructive-disabled" disabled checked />
    </div>
  ),
};
