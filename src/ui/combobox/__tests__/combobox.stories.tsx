/**
 * Combobox 组件 Stories
 *
 * @description
 * Combobox 组件用于从预定义的选项列表中进行选择，并支持通过文本输入进行搜索和过滤。
 * 它提供了单选、多选、分组、禁用、加载以及不同视觉状态（如错误、成功）等功能。
 */

import { Button } from '../../button';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import React from 'react';
import { Combobox } from '../combobox';

const meta: Meta<typeof Combobox> = {
  title: 'EASAI/Combobox',
  component: Combobox,
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
    variant: {
      control: {
        type: 'select',
      },
      options: ['default', 'error', 'success'],
      description: '组合框的变体样式',
      defaultValue: 'default',
    },
  },
  args: {
    onSearch: fn(),
    onChange: fn(),
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof Combobox>;

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
    return <Combobox {...args} value={value} onChange={(newValue) => setValue(newValue as string | string[] | undefined)} />;
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
    return <Combobox {...args} value={value} onChange={(newValue) => setValue(newValue as string | string[] | undefined)} />;
  },
};

// 可搜索
export const Searchable: Story = {
  args: {
    ...Basic.args, // 注意：Basic.args 可能包含 options，如果 Searchable 需要不同的 options，应在此覆盖
    searchable: true,
    placeholder: '请搜索选择',
    onSearch: fn(),
    // multiple: false, // 默认或根据需要设置
  },
  render: (args) => {
    // 根据 args.multiple 和 args.value 初始化本地 state 'value'
    const initialValue = args.multiple ? (args.value as string[] | undefined) || [] : (args.value as string | undefined);
    const [value, setValue] = React.useState<string | string[] | undefined>(initialValue);

    console.log('[Story] Render (Searchable): Combobox is being rendered. Current "value" prop for Combobox:', value);

    return (
      <Combobox
        {...args}
        value={value} // 使用本地 state 'value'
        onChange={(newValue) => {
          console.log("[Story] onChange (Searchable): Combobox's onChange CALLED. New proposed value:", newValue);
          setValue(newValue as any); // 更新本地 state 'value'
          // 如果 args 中定义了 onChange (通常是 fn() 用于 Actions 面板)，也调用它
          if (typeof args.onChange === 'function') {
            args.onChange(newValue);
          }
        }}
      />
    );
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
    // multiple: false, // 默认或根据需要设置
  },
  render: (args) => {
    // 根据 args.multiple 和 args.value 初始化本地 state 'value'
    const initialValue = args.multiple ? (args.value as string[] | undefined) || [] : (args.value as string | undefined);
    const [value, setValue] = React.useState<string | string[] | undefined>(initialValue);

    console.log('[Story] Render (Grouped): Combobox is being rendered. Current "value" prop for Combobox:', value);

    return (
      <Combobox
        {...args}
        value={value} // 使用本地 state 'value'
        onChange={(newValue) => {
          console.log("[Story] onChange (Grouped): Combobox's onChange CALLED. New proposed value:", newValue);
          setValue(newValue as any); // 更新本地 state 'value'
          // 如果 args 中定义了 onChange (通常是 fn() 用于 Actions 面板)，也调用它
          if (typeof args.onChange === 'function') {
            args.onChange(newValue);
          }
        }}
      />
    );
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
  render: (args) => {
    const initialValue = args.multiple ? (args.value as string[] | undefined) || [] : (args.value as string | undefined);
    const [value, setValue] = React.useState<string | string[] | undefined>(initialValue);
    return (
      <Combobox
        {...args}
        value={value}
        onChange={(newValue) => {
          setValue(newValue as any);
          if (typeof args.onChange === 'function') {
            args.onChange(newValue);
          }
        }}
      />
    );
  },
};

// 多选+搜索
export const MultipleSearchable: Story = {
  args: {
    options: [
      {
        label: '这是一个非常长的选项文本，用于测试水平滚动条是否正常工作',
        value: '1',
      },
      {
        label: '另一个长文本选项，包含很多文字以确保内容会超出容器宽度',
        value: '2',
      },
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
    return <Combobox {...args} value={value} onChange={(val) => setValue(val as string[])} />;
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
        <Combobox options={options} multiple value={value} onChange={(val) => setValue(val as string[])} placeholder="选择关联项目" />
        <Button disabled={value.length === 0} onClick={() => alert(`已提交选择：${value.join(', ')}`)}>
          提交
        </Button>
      </div>
    );
  },
};

// 错误状态
export const ErrorState: Story = {
  args: {
    ...Basic.args,
    variant: 'error',
    placeholder: '错误状态',
  },
  render: (args) => {
    const [value, setValue] = React.useState<string | string[] | undefined>(args.multiple ? [] : undefined);
    return <Combobox {...args} value={value} onChange={(newValue) => setValue(newValue as string | string[] | undefined)} />;
  },
};

// 成功状态
export const SuccessState: Story = {
  args: {
    ...Basic.args,
    variant: 'success',
    placeholder: '成功状态',
  },
  render: (args) => {
    const [value, setValue] = React.useState<string | string[] | undefined>(args.multiple ? [] : undefined);
    return <Combobox {...args} value={value} onChange={(newValue) => setValue(newValue as string | string[] | undefined)} />;
  },
};
