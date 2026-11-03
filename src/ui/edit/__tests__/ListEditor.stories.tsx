import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ListEditor } from '../ListEditor';

const meta: Meta<typeof ListEditor> = {
  title: 'EASAI/Edit/ListEditor',
  component: ListEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '列表编辑器，支持动态添加、删除、排序列表项',
      },
    },
  },
  argTypes: {
    itemType: {
      control: 'radio',
      options: ['string', 'number', 'object'],
      description: '列表项类型',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    readOnly: {
      control: 'boolean',
      description: '是否只读',
    },
    sortable: {
      control: 'boolean',
      description: '是否支持排序',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ListEditor>;

// 字符串列表
export const StringList: Story = {
  render: () => {
    const [value, setValue] = useState<any[]>(['项目1', '项目2', '项目3']);
    return (
      <div className="w-80">
        <ListEditor value={value} onChange={(val) => setValue(val as any[])} itemType="string" placeholder="请输入内容" addButtonText="添加项目" />
        <div className="mt-4 text-muted-foreground text-sm">当前列表: [{value.join(', ')}]</div>
      </div>
    );
  },
};

// 数字列表
export const NumberList: Story = {
  render: () => {
    const [value, setValue] = useState<any[]>([10, 20, 30]);
    return (
      <div className="w-80">
        <ListEditor value={value} onChange={(val) => setValue(val as any[])} itemType="number" placeholder="请输入数字" addButtonText="添加数字" />
        <div className="mt-4 text-muted-foreground text-sm">当前列表: [{value.join(', ')}]</div>
      </div>
    );
  },
};

// 可排序的字符串列表
export const SortableStringList: Story = {
  render: () => {
    const [value, setValue] = useState<any[]>(['项目A', '项目B', '项目C', '项目D']);
    return (
      <div className="w-80">
        <ListEditor value={value} onChange={(val) => setValue(val as any[])} itemType="string" placeholder="请输入内容" sortable addButtonText="添加项目" />
        <div className="mt-4 text-muted-foreground text-sm">当前列表: [{value.join(', ')}]</div>
      </div>
    );
  },
};

// 带数量限制的列表
export const LimitedList: Story = {
  render: () => {
    const [value, setValue] = useState<any[]>(['项目1', '项目2']);
    return (
      <div className="w-80">
        <ListEditor value={value} onChange={(val) => setValue(val as any[])} itemType="string" placeholder="请输入内容" minItems={1} maxItems={5} addButtonText="添加项目" />
        <div className="mt-4 text-muted-foreground text-sm">
          当前列表: [{value.join(', ')}] ({value.length}/5)
        </div>
      </div>
    );
  },
};

// 禁用状态
export const DisabledList: Story = {
  args: {
    value: ['项目1', '项目2', '项目3'],
    itemType: 'string',
    disabled: true,
    placeholder: '禁用状态',
    addButtonText: '添加项目',
  },
};

// 只读状态
export const ReadOnlyList: Story = {
  args: {
    value: ['项目1', '项目2', '项目3'],
    itemType: 'string',
    readOnly: true,
    placeholder: '只读状态',
    addButtonText: '添加项目',
  },
};

// 空列表状态
export const EmptyList: Story = {
  render: () => {
    const [value, setValue] = useState<any[]>([]);
    return (
      <div className="w-80">
        <ListEditor value={value} onChange={(val) => setValue(val as any[])} itemType="string" placeholder="请输入内容" minItems={0} addButtonText="添加第一个项目" />
        <div className="mt-4 text-muted-foreground text-sm">当前列表: [{value.length === 0 ? '空列表' : value.join(', ')}]</div>
      </div>
    );
  },
};
