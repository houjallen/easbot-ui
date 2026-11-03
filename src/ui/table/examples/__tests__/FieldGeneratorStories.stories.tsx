/**
 * 表格字段生成器 Storybook 示例
 * 展示 field-generator 支持的各种字段类型渲染效果
 */

import { Card } from '../../../card';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Input } from '../../../input';
import type { TableColumn } from '../../types';
import { renderBooleanInput, renderDateInput, renderEnumInput, renderListInput, renderNumberInput, renderObjectInput, renderTextInput, renderTextarea } from '../../utils/field-generator';

const meta: Meta<typeof Input> = {
  title: 'EASAI/Table/FieldGenerator',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '展示表格字段生成器支持的各种字段类型渲染效果',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: '字段当前值',
      table: {
        type: { summary: 'any' },
        defaultValue: { summary: "''" },
      },
    },
    onChange: {
      control: { disable: true },
      description: '值变更回调',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// 创建示例列配置
const createColumn = (overrides: Partial<TableColumn> = {}): TableColumn => ({
  name: 'field',
  title: '示例字段',
  dataIndex: 'field',
  ...overrides,
});

// 基础配置
const baseConfig = {
  onChange: fn(),
  placeholder: '请输入内容',
};

// 文本输入示例
export const TextInput: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">文本输入字段</h3>
        {renderTextInput(createColumn({ dataType: 'string' }), {
          ...baseConfig,
          value,
          onChange: setValue,
        })}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value || '(空)'}</div>
      </Card>
    );
  },
};

// 多行文本输入示例
export const Textarea: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">多行文本字段</h3>
        {renderTextarea(createColumn({ dataType: 'string' }), {
          ...baseConfig,
          value,
          onChange: setValue,
        })}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value || '(空)'}</div>
      </Card>
    );
  },
};

// 数字输入示例
export const NumberInput: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">数字输入字段</h3>
        {renderNumberInput(createColumn({ dataType: 'number' }), {
          ...baseConfig,
          value,
          onChange: setValue,
        })}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value !== null ? value : '(空)'}</div>
      </Card>
    );
  },
};

// 数字范围输入示例
export const NumberRangeInput: Story = {
  render: () => {
    const [value, setValue] = useState<[number | null, number | null]>([null, null]);
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">数字范围输入字段</h3>
        {renderNumberInput(createColumn({ dataType: 'number' }), {
          ...baseConfig,
          value,
          onChange: setValue,
          isRangeMode: true,
        })}
        <div className="mt-4 text-muted-foreground text-sm">
          当前值: [{value[0] !== null ? value[0] : '∞'}, {value[1] !== null ? value[1] : '∞'}]
        </div>
      </Card>
    );
  },
};

// 布尔值输入示例 (编辑模式)
export const BooleanInputEdit: Story = {
  render: () => {
    const [value, setValue] = useState(false);
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">布尔值字段 (编辑模式)</h3>
        {renderBooleanInput(createColumn({ dataType: 'boolean' }), {
          ...baseConfig,
          value,
          onChange: setValue,
          context: 'edit',
        })}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value ? '是' : '否'}</div>
      </Card>
    );
  },
};

// 布尔值输入示例 (过滤模式)
export const BooleanInputFilter: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">布尔值字段 (过滤模式)</h3>
        {renderBooleanInput(createColumn({ dataType: 'boolean' }), {
          ...baseConfig,
          value,
          onChange: setValue,
          context: 'filter',
        })}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value.length > 0 ? value.join(', ') : '(未选择)'}</div>
      </Card>
    );
  },
};

// 日期输入示例
export const DateInput: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">日期输入字段</h3>
        {renderDateInput(
          createColumn({
            dataType: 'date',
            dateType: 'date',
            format: 'YYYY-MM-DD',
          }),
          {
            ...baseConfig,
            value,
            onChange: setValue,
          },
        )}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value || '(未选择)'}</div>
      </Card>
    );
  },
};

// 日期范围输入示例
export const DateRangeInput: Story = {
  render: () => {
    const [value, setValue] = useState<[string, string]>(['', '']);
    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">日期范围输入字段</h3>
        {renderDateInput(
          createColumn({
            dataType: 'date',
            dateType: 'date-range',
            format: 'YYYY-MM-DD',
          }),
          {
            ...baseConfig,
            value,
            onChange: setValue,
            isRangeMode: true,
          },
        )}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value[0] && value[1] ? `${value[0]} 至 ${value[1]}` : '(未选择)'}</div>
      </Card>
    );
  },
};

// 枚举输入示例 (单选)
export const EnumInput: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');
    const options = [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' },
      { label: '选项3', value: 'option3' },
    ];

    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">枚举输入字段 (单选)</h3>
        {renderEnumInput(
          createColumn({
            dataType: 'enum',
            options,
            editConfig: { multiple: false },
          }),
          {
            ...baseConfig,
            value,
            onChange: setValue,
          },
        )}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value || '(未选择)'}</div>
      </Card>
    );
  },
};

// 枚举输入示例 (多选)
export const EnumMultiInput: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const options = [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' },
      { label: '选项3', value: 'option3' },
      { label: '选项4', value: 'option4' },
    ];

    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">枚举输入字段 (多选)</h3>
        {renderEnumInput(
          createColumn({
            dataType: 'enum',
            options,
            editConfig: { multiple: true },
          }),
          {
            ...baseConfig,
            value,
            onChange: setValue,
          },
        )}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {value.length > 0 ? value.join(', ') : '(未选择)'}</div>
      </Card>
    );
  },
};

// 列表输入示例
export const ListInput: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);

    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">列表输入字段</h3>
        {renderListInput(
          createColumn({
            dataType: 'list',
            editConfig: { itemType: 'string' },
          }),
          {
            ...baseConfig,
            value,
            onChange: setValue,
          },
        )}
        <div className="mt-4 text-muted-foreground text-sm">当前值: [{value.length > 0 ? value.join(', ') : '空列表'}]</div>
      </Card>
    );
  },
};

// 对象输入示例
export const ObjectInput: Story = {
  render: () => {
    const [value, setValue] = useState<Record<string, any>>({});

    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="mb-4 font-semibold">对象输入字段</h3>
        {renderObjectInput(
          createColumn({
            dataType: 'object',
          }),
          {
            ...baseConfig,
            value,
            onChange: setValue,
          },
        )}
        <div className="mt-4 text-muted-foreground text-sm">当前值: {JSON.stringify(value) || '{}'}</div>
      </Card>
    );
  },
};

// 不同上下文模式示例
export const ContextModes: Story = {
  render: () => {
    const [editValue, setEditValue] = useState('编辑模式');
    const [filterValue, setFilterValue] = useState('过滤模式');
    const [searchValue, setSearchValue] = useState('搜索模式');

    return (
      <div className="flex flex-col gap-6">
        <Card className="w-full max-w-md p-6">
          <h3 className="mb-4 font-semibold">编辑模式</h3>
          {renderTextInput(createColumn({ dataType: 'string' }), {
            ...baseConfig,
            value: editValue,
            onChange: setEditValue,
            context: 'edit',
          })}
          <div className="mt-2 text-muted-foreground text-sm">值: {editValue}</div>
        </Card>

        <Card className="w-full max-w-md p-6">
          <h3 className="mb-4 font-semibold">过滤模式</h3>
          {renderTextInput(createColumn({ dataType: 'string' }), {
            ...baseConfig,
            value: filterValue,
            onChange: setFilterValue,
            context: 'filter',
          })}
          <div className="mt-2 text-muted-foreground text-sm">值: {filterValue}</div>
        </Card>

        <Card className="w-full max-w-md p-6">
          <h3 className="mb-4 font-semibold">搜索模式</h3>
          {renderTextInput(createColumn({ dataType: 'string' }), {
            ...baseConfig,
            value: searchValue,
            onChange: setSearchValue,
            context: 'search',
          })}
          <div className="mt-2 text-muted-foreground text-sm">值: {searchValue}</div>
        </Card>
      </div>
    );
  },
};
