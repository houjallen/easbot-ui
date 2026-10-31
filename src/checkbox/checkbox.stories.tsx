/**
 * Checkbox 组件的 Storybook 示例文件
 *
 * 展示了Checkbox组件的各种使用场景和样式变体
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';
import { Label } from '../label/label';

const meta: Meta<typeof Checkbox> = {
  title: 'EASAI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
          Checkbox 组件用于在一组选项中进行多选。
          
          ## 特性
          - 支持多种样式变体：默认、成功、警告、危险等
          - 支持不同尺寸
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
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive'],
      description: '复选框变体样式',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: '复选框尺寸',
    },
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
    rippleDuration: {
      control: 'number',
      description: '波纹动画时长 (ms)',
      defaultValue: 600,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/**
 * 基础复选框示例
 */
export const Default: Story = {
  args: {
    children: '同意服务条款',
  },
};

/**
 * 复选框变体示例
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox variant="default">默认复选框</Checkbox>
      <Checkbox variant="success">成功复选框</Checkbox>
      <Checkbox variant="warning">警告复选框</Checkbox>
      <Checkbox variant="destructive">危险复选框</Checkbox>
    </div>
  ),
};

/**
 * 尺寸示例
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox size="sm">小号复选框</Checkbox>
      <Checkbox size="default">默认尺寸</Checkbox>
      <Checkbox size="lg">大号复选框</Checkbox>
    </div>
  ),
};

/**
 * 状态示例
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox>未选中状态</Checkbox>
      <Checkbox defaultChecked>选中状态</Checkbox>
      <Checkbox indeterminate>中间态</Checkbox>
      <Checkbox disabled>禁用状态</Checkbox>
      <Checkbox disabled checked>
        禁用且选中
      </Checkbox>
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
          <Checkbox>选项 1</Checkbox>
          <Checkbox>选项 2</Checkbox>
          <Checkbox>选项 3</Checkbox>
        </div>
      </div>

      {/* 带描述的选项组 */}
      <div className="space-y-4">
        <Label>带描述的选项组</Label>
        <div className="space-y-2">
          <Checkbox description="这是选项1的描述文本">选项 1</Checkbox>
          <Checkbox description="这是选项2的描述文本">选项 2</Checkbox>
        </div>
      </div>

      {/* 树形结构 */}
      <div className="space-y-4">
        <Label>树形结构示例</Label>
        <div className="space-y-2">
          <Checkbox indeterminate>全部文件</Checkbox>
          <div className="ml-6 space-y-2">
            <Checkbox>文档</Checkbox>
            <Checkbox>图片</Checkbox>
            <Checkbox>视频</Checkbox>
          </div>
        </div>
      </div>

      {/* 不同状态组合 */}
      <div className="space-y-4">
        <Label>状态组合示例</Label>
        <div className="space-y-2">
          <Checkbox variant="success" checked description="已完成的任务">
            任务 1
          </Checkbox>
          <Checkbox variant="warning" description="进行中的任务">
            任务 2
          </Checkbox>
          <Checkbox variant="destructive" disabled description="已取消的任务">
            任务 3
          </Checkbox>
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
      <Checkbox rippleColor="#ff0000">带波纹效果</Checkbox>
      <Checkbox onSwipe={(dir) => alert(`滑动方向: ${dir}`)}>可滑动复选框</Checkbox>
    </div>
  ),
};

/**
 * 新增状态组合示例
 */
export const StateCombinations: Story = {
  render: () => (
    <div className="grid gap-4">
      <Checkbox variant="success" checked>
        已完成
      </Checkbox>
      <Checkbox variant="warning" indeterminate>
        进行中
      </Checkbox>
      <Checkbox variant="destructive" disabled>
        已禁用
      </Checkbox>
    </div>
  ),
};

/**
 * 新增配置示例
 */
export const ConfigurableRipple: Story = {
  args: {
    children: '可配置波纹效果',
    rippleColor: '#3b82f6',
    rippleDuration: 800,
  },
};
