import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { EnumEditor } from '../EnumEditor';

const meta: Meta<typeof EnumEditor> = {
  title: 'EASAI/Edit/EnumEditor',
  component: EnumEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '枚举编辑器，支持单选和多选模式',
      },
    },
  },
  argTypes: {
    multiple: {
      control: 'boolean',
      description: '是否多选模式',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    readOnly: {
      control: 'boolean',
      description: '是否只读',
    },
    searchable: {
      control: 'boolean',
      description: '是否可搜索',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnumEditor>;

const sampleOptions = [
  { label: '选项1', value: 'option1', description: '这是选项1的描述' },
  { label: '选项2', value: 'option2', description: '这是选项2的描述' },
  { label: '选项3', value: 'option3', description: '这是选项3的描述' },
  { label: '选项4', value: 'option4', description: '这是选项4的描述' },
  { label: '选项5', value: 'option5', description: '这是选项5的描述' },
];

// 单选模式
export const SingleSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | undefined>(undefined);
    return (
      <div className="w-80">
        <EnumEditor value={value} onChange={(val) => setValue(val as string | number | undefined)} options={sampleOptions} placeholder="请选择一个选项" />
        <div className="mt-4 text-muted-foreground text-sm">当前选择: {value || '未选择'}</div>
      </div>
    );
  },
};

// 多选模式
export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[] | number[]>([]);
    return (
      <div className="w-80">
        <EnumEditor value={value} onChange={(val) => setValue(val as string[] | number[])} options={sampleOptions} multiple placeholder="请选择多个选项" />
        <div className="mt-4 text-muted-foreground text-sm">当前选择: {Array.isArray(value) && value.length > 0 ? value.join(', ') : '未选择'}</div>
      </div>
    );
  },
};

// 禁用状态
export const Disabled: Story = {
  args: {
    value: 'option2',
    options: sampleOptions,
    disabled: true,
    placeholder: '禁用状态',
  },
};

// 只读状态
export const ReadOnly: Story = {
  args: {
    value: 'option3',
    options: sampleOptions,
    readOnly: true,
    placeholder: '只读状态',
  },
};

// 不可搜索
export const NonSearchable: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | undefined>(undefined);
    return (
      <div className="w-80">
        <EnumEditor value={value} onChange={(val) => setValue(val as string | number | undefined)} options={sampleOptions} searchable={false} placeholder="不可搜索的选择器" />
        <div className="mt-4 text-muted-foreground text-sm">当前选择: {value || '未选择'}</div>
      </div>
    );
  },
};

// 带最大选择数量限制的多选
export const MultiSelectWithLimit: Story = {
  render: () => {
    const [value, setValue] = useState<string[] | number[]>(['option1', 'option2']);
    return (
      <div className="w-80">
        <EnumEditor value={value} onChange={(val) => setValue(val as string[] | number[])} options={sampleOptions} multiple maxCount={3} placeholder="最多选择3个选项" />
        <div className="mt-4 text-muted-foreground text-sm">
          当前选择: {Array.isArray(value) && value.length > 0 ? value.join(', ') : '未选择'} ({Array.isArray(value) ? value.length : 0}/3)
        </div>
      </div>
    );
  },
};
