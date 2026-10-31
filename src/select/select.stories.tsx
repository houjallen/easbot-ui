/**
 * Select 组件 Stories
 *
 * @description
 * Select 组件用于从预定义的选项列表中选择一个或多个选项。
 * 支持单选、多选、搜索、分组等基本功能。
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';
import { fn } from 'storybook/test';
import React from 'react';
import { Button } from '../button';

const meta: Meta<typeof Select> = {
  title: 'EASAI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        inline: true,
        iframeHeight: 400,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    placeholder: {
      control: 'text',
      description: '占位文本',
      defaultValue: '请选择',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
      defaultValue: false,
    },
    multiple: {
      control: 'boolean',
      description: '是否多选',
      defaultValue: false,
    },
    searchable: {
      control: 'boolean',
      description: '是否可搜索',
      defaultValue: false,
    },
  },
  args: {
    onSearch: fn(),
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// 基础示例
export const Basic: Story = {
  args: {
    options: [
      { label: '选项1', value: '1' },
      { label: '选项2', value: '2' },
      { label: '选项3', value: '3' },
    ],
    placeholder: '请选择',
  },
  render: (args) => {
    const [value, setValue] = React.useState<string | string[] | undefined>(args.multiple ? [] : undefined);
    return <Select {...args} value={value} onChange={setValue} />;
  },
};

// 禁用状态
export const Disabled: Story = {
  args: {
    ...Basic.args,
    disabled: true,
  },
};

// 多选模式
export const Multiple: Story = {
  args: {
    ...Basic.args,
    multiple: true,
    placeholder: '请选择(可多选)',
  },
  render: (args) => {
    const [value, setValue] = React.useState<string | string[] | undefined>(args.multiple ? [] : undefined);
    return <Select {...args} value={value} onChange={setValue} />;
  },
};

// 可搜索
export const Searchable: Story = {
  args: {
    ...Basic.args,
    searchable: true,
    placeholder: '请搜索选择',
    onSearch: fn(),
  },
};

// 分组选项
export const Grouped: Story = {
  args: {
    options: [
      {
        label: '分组1',
        options: [
          { label: '选项1-1', value: '1-1' },
          { label: '选项1-2', value: '1-2' },
        ],
      },
      {
        label: '分组2',
        options: [
          { label: '选项2-1', value: '2-1' },
          { label: '选项2-2', value: '2-2' },
        ],
      },
    ],
    placeholder: '分组选项',
  },
};

// 禁用选项
export const DisabledOptions: Story = {
  args: {
    options: [
      { label: '选项1', value: '1' },
      { label: '选项2', value: '2', disabled: true },
      { label: '选项3', value: '3' },
    ],
    placeholder: '包含禁用选项',
  },
};

// 多选+搜索
export const MultipleSearchable: Story = {
  args: {
    options: [
      { label: '这是一个非常长的选项文本，用于测试水平滚动条是否正常工作', value: '1' },
      { label: '另一个长文本选项，包含很多文字以确保内容会超出容器宽度', value: '2' },
      { label: '第三个长选项，这个文本足够长以测试滚动条功能', value: '3' },
      { label: '选项4 - 这是一个测试选项，带有一些额外的描述信息', value: '4' },
      { label: '选项5 - 包含一些详细说明的较长选项文本', value: '5' },
      { label: '选项6 - 这是另一个测试长文本的例子', value: '6' },
      { label: '选项7', value: '7' },
      { label: '选项8', value: '8' },
      { label: '选项9', value: '9' },
      { label: '选项10', value: '10' },
    ],
    multiple: true,
    searchable: true,
    placeholder: '多选+搜索（含长文本）',
  },
  render: (args) => {
    const [value, setValue] = React.useState<string[]>([]);
    return <Select {...args} value={value} onChange={(val) => setValue(val as string[])} />;
  },
};

// 新增表单集成示例
export const FormIntegration: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([]);
    const options = [
      { label: '项目1', value: '1' },
      { label: '项目2', value: '2' },
      { label: '项目3', value: '3' },
    ];
    return (
      <div className="space-y-4">
        <Select options={options} multiple value={value} onChange={(val) => setValue(val as string[])} placeholder="选择关联项目" />
        <Button disabled={value.length === 0} onClick={() => alert(`已提交选择：${value.join(', ')}`)}>
          提交
        </Button>
      </div>
    );
  },
};
