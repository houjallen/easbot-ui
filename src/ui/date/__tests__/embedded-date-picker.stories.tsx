import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { EmbeddedDatePicker } from '../embedded-date-picker';

const meta: Meta<typeof EmbeddedDatePicker> = {
  title: 'EASAI/date/DatePicker Embedded',
  component: EmbeddedDatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '嵌入式日期选择器组件，支持多种视图模式、时间选择、快捷选择等功能。',
      },
    },
  },
  argTypes: {
    value: {
      control: 'date',
      description: '当前选中的日期',
    },
    viewMode: {
      control: 'select',
      options: ['days', 'months', 'years', 'quarters', 'time'],
      description: '初始视图模式',
    },
    allowedViews: {
      control: 'check',
      options: ['days', 'months', 'years', 'quarters', 'time'],
      description: '允许的视图模式',
    },
    showTimeView: {
      control: 'boolean',
      description: '是否显示时间视图',
    },
    showQuarterView: {
      control: 'boolean',
      description: '是否显示季度视图',
    },
    showSeconds: {
      control: 'boolean',
      description: '是否显示秒',
    },
    showShortcuts: {
      control: 'boolean',
      description: '是否显示快捷选择',
    },
    isMobile: {
      control: 'boolean',
      description: '是否为移动端模式',
    },
    requireConfirm: {
      control: 'boolean',
      description: '是否需要确认按钮',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmbeddedDatePicker>;

// 基础示例
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'days',
    allowedViews: ['days', 'months', 'years'],
    showShortcuts: true,
  },
};

// 带时间选择
export const WithTime: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'days',
    allowedViews: ['days', 'months', 'years', 'time'],
    showTimeView: true,
    showSeconds: true,
    showShortcuts: true,
  },
};

// 季度选择器
export const QuarterPicker: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'quarters',
    allowedViews: ['quarters', 'years'],
    showQuarterView: true,
    showShortcuts: true,
  },
};

// 月份选择器
export const MonthPicker: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'months',
    allowedViews: ['months', 'years'],
    showShortcuts: false,
  },
};

// 年份选择器
export const YearPicker: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'years',
    allowedViews: ['years'],
    showShortcuts: false,
  },
};

// 时间选择器
export const TimePicker: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'time',
    allowedViews: ['time'],
    showTimeView: true,
    showSeconds: true,
    showShortcuts: false,
  },
};

// 带约束条件
export const WithConstraints: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'days',
    allowedViews: ['days', 'months', 'years'],
    minDate: new Date(2020, 0, 1),
    maxDate: new Date(2030, 11, 31),
    showShortcuts: true,
    disabledDate: (date: Date) => {
      // 禁用周末
      const day = date.getDay();
      return day === 0 || day === 6;
    },
  },
};

// 移动端模式
export const Mobile: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return (
      <div className="w-full max-w-sm">
        <EmbeddedDatePicker {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    viewMode: 'days',
    allowedViews: ['days', 'months', 'years'],
    showShortcuts: true,
    isMobile: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// 需要确认的选择器
export const WithConfirm: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return (
      <EmbeddedDatePicker
        {...args}
        value={value}
        onChange={setValue}
        onConfirm={(date) => {
          console.log('确认选择:', date);
        }}
        onCancel={() => {
          console.log('取消选择');
        }}
      />
    );
  },
  args: {
    viewMode: 'days',
    allowedViews: ['days', 'months', 'years'],
    showShortcuts: true,
    requireConfirm: true,
  },
};

// 自定义时间约束
export const CustomTimeConstraints: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <EmbeddedDatePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    viewMode: 'time',
    allowedViews: ['time'],
    showTimeView: true,
    showSeconds: false,
    timeConstraints: {
      hours: { min: 9, max: 18, step: 1 }, // 工作时间 9-18点
      minutes: { min: 0, max: 59, step: 15 }, // 15分钟间隔
    },
    showShortcuts: false,
  },
};

// 完整功能展示
export const FullFeatures: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return (
      <EmbeddedDatePicker
        {...args}
        value={value}
        onChange={setValue}
        onConfirm={(date) => {
          console.log('确认选择:', date);
        }}
        onCancel={() => {
          console.log('取消选择');
        }}
      />
    );
  },
  args: {
    viewMode: 'days',
    allowedViews: ['days', 'months', 'years', 'quarters', 'time'],
    showTimeView: true,
    showQuarterView: true,
    showSeconds: true,
    showShortcuts: true,
    requireConfirm: true,
    timeConstraints: {
      hours: { min: 0, max: 23, step: 1 },
      minutes: { min: 0, max: 59, step: 5 },
      seconds: { min: 0, max: 59, step: 1 },
    },
  },
};
