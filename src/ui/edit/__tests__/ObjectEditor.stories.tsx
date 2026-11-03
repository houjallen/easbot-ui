import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ObjectEditor } from '../ObjectEditor';

const meta: Meta<typeof ObjectEditor> = {
  title: 'EASAI/Edit/ObjectEditor',
  component: ObjectEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '对象编辑器，支持键值对形式的对象编辑',
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    readOnly: {
      control: 'boolean',
      description: '是否只读',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ObjectEditor>;

// 基本对象编辑
export const BasicObject: Story = {
  render: () => {
    const [value, setValue] = useState<Record<string, any>>({
      name: '张三',
      age: 25,
      city: '北京',
    });
    return (
      <div className="w-96">
        <ObjectEditor value={value} onChange={(val) => setValue(val as Record<string, any>)} keyPlaceholder="属性名" valuePlaceholder="属性值" addButtonText="添加属性" />
        <div className="mt-4 text-muted-foreground text-sm">
          <div className="font-medium">当前对象:</div>
          <pre className="mt-1 text-xs">{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

// 带预定义键的对象编辑
export const ObjectWithPredefinedKeys: Story = {
  render: () => {
    const [value, setValue] = useState<Record<string, any>>({
      username: 'user123',
      email: 'user@example.com',
    });
    return (
      <div className="w-96">
        <ObjectEditor
          value={value}
          onChange={(val) => setValue(val as Record<string, any>)}
          keyPlaceholder="属性名"
          valuePlaceholder="属性值"
          predefinedKeys={['username', 'email', 'phone', 'address', 'age']}
          addButtonText="添加属性"
        />
        <div className="mt-4 text-muted-foreground text-sm">
          <div className="font-medium">当前对象:</div>
          <pre className="mt-1 text-xs">{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

// 带数量限制的对象编辑
export const LimitedObject: Story = {
  render: () => {
    const [value, setValue] = useState<Record<string, any>>({
      prop1: 'value1',
      prop2: 'value2',
    });
    return (
      <div className="w-96">
        <ObjectEditor
          value={value}
          onChange={(val) => setValue(val as Record<string, any>)}
          keyPlaceholder="属性名"
          valuePlaceholder="属性值"
          minProperties={1}
          maxProperties={5}
          addButtonText="添加属性"
        />
        <div className="mt-4 text-muted-foreground text-sm">
          <div className="font-medium">当前对象 ({Object.keys(value).length}/5):</div>
          <pre className="mt-1 text-xs">{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

// 禁用状态
export const DisabledObject: Story = {
  args: {
    value: {
      name: '李四',
      age: 30,
      department: '技术部',
    },
    disabled: true,
    keyPlaceholder: '属性名',
    valuePlaceholder: '属性值',
    addButtonText: '添加属性',
  },
};

// 只读状态
export const ReadOnlyObject: Story = {
  args: {
    value: {
      id: '001',
      created: '2023-01-01',
      status: 'active',
    },
    readOnly: true,
    keyPlaceholder: '属性名',
    valuePlaceholder: '属性值',
    addButtonText: '添加属性',
  },
};

// 空对象
export const EmptyObject: Story = {
  render: () => {
    const [value, setValue] = useState<Record<string, any>>({});
    return (
      <div className="w-96">
        <ObjectEditor value={value} onChange={(val) => setValue(val as Record<string, any>)} keyPlaceholder="属性名" valuePlaceholder="属性值" addButtonText="添加第一个属性" />
        <div className="mt-4 text-muted-foreground text-sm">
          <div className="font-medium">当前对象:</div>
          <pre className="mt-1 text-xs">{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

// 复杂对象（包含嵌套对象）
export const ComplexObject: Story = {
  render: () => {
    const [value, setValue] = useState<Record<string, any>>({
      user: '{"name":"张三","age":25}',
      settings: '{"theme":"dark","notifications":true}',
      tags: '["tag1","tag2","tag3"]',
    });
    return (
      <div className="w-96">
        <ObjectEditor value={value} onChange={(val) => setValue(val as Record<string, any>)} keyPlaceholder="配置项" valuePlaceholder="配置值（支持JSON格式）" addButtonText="添加配置项" />
        <div className="mt-4 text-muted-foreground text-sm">
          <div className="font-medium">当前对象:</div>
          <pre className="mt-1 text-xs">{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};
