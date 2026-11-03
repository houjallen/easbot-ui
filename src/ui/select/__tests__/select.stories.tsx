/**
 * Select 组件 Stories
 *
 * @description
 * Select 组件用于从预定义的选项列表中选择一个选项。
 * 支持单选、分组等基本功能。
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Select } from '../select';

const meta: Meta<typeof Select> = {
  title: 'EASAI/Select',
  component: Select,
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
  },
  args: {
    // onChange: fn(), // onChange is handled by onValueChange in the component
    // onSearch: fn(), // onSearch is not applicable for standard Select
  },
} satisfies Meta<typeof Select>;

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
    const [value, setValue] = React.useState<string | undefined>(undefined);
    // N.B. The component itself uses `onValueChange` prop for Radix Select
    // Storybook's `onChange` arg (if defined in `meta.args`) would be for action logging.
    // Here, we directly use `onValueChange` for state management within the story.
    return <Select {...args} value={value} onValueChange={setValue} />;
  },
};

// 禁用状态
export const Disabled: Story = {
  args: {
    ...Basic.args,
    disabled: true,
  },
};

// 分组选项
export const Grouped: Story = {
  args: {
    groups: [
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

// 变体演示（错误/成功边框）
export const Variants: Story = {
  render: () => {
    const [errorValue, setErrorValue] = React.useState<string | undefined>(undefined);
    const [successValue, setSuccessValue] = React.useState<string | undefined>(undefined);
    return (
      <div className="flex w-[300px] flex-col gap-4">
        {/* 错误状态 */}
        <Select
          options={[
            { label: '错误选项1', value: '1' },
            { label: '错误选项2', value: '2' },
          ]}
          placeholder="错误状态"
          error
          value={errorValue}
          onValueChange={setErrorValue}
        />
        {/* 成功状态 */}
        <Select
          options={[
            { label: '成功选项1', value: '1' },
            { label: '成功选项2', value: '2' },
          ]}
          placeholder="成功状态"
          success
          value={successValue}
          onValueChange={setSuccessValue}
        />
      </div>
    );
  },
};
