/**
 * InputDateTimeRange组件故事书
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { InputDateTimeRange } from '../input-date-time-range';

const meta: Meta<typeof InputDateTimeRange> = {
  title: 'EASAI/date/InputDateTimeRange',
  component: InputDateTimeRange,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '日期时间范围输入组件，使用双列面板选择开始和结束日期时间。支持多种选择精度模式：time(时间模式)、day(日模式)、month(月模式)、year(年模式)。每种模式显示对应的时间单位选择器。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'text',
      description: '日期时间格式',
    },
    showSeconds: {
      control: 'boolean',
      description: '是否显示秒',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    readOnly: {
      control: 'boolean',
      description: '是否只读',
    },
    separator: {
      control: 'text',
      description: '分隔符',
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 受控组件包装器
function ControlledWrapper(props: any) {
  const [value, setValue] = useState<[Date?, Date?]>([undefined, undefined]);

  return <InputDateTimeRange {...props} value={value} onChange={setValue} />;
}

/**
 * 基础使用示例
 * 展示双列面板布局：左列选择开始日期时间，右列选择结束日期时间
 * 按时间单位从小到大排序：时间、日、月、年
 * 默认显示最小的时间单位（时间）选择器
 */
export const Default: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
  },
};

/**
 * 时间单位选择示例
 * 展示四个时间单位标签页：时间、日、月、年
 * 用户可以根据需要选择不同精度的时间范围
 */
export const TimeUnitSelection: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '选择时间范围（支持多种时间单位）',
    format: 'YYYY-MM-DD HH:mm:ss',
  },
};

/**
 * 时间模式（默认）
 * 显示时间、日、月、年标签页，适用于精确时间选择
 */
export const TimeMode: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '选择日期时间范围（时间模式）',
  },
};

/**
 * 日模式
 * 只显示日、月、年标签页，不包含时间选择
 */
export const DayMode: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '选择日期时间范围（日模式）',
  },
};

/**
 * 月模式
 * 只显示月、年标签页，适用于月份统计
 */
export const MonthMode: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '选择日期时间范围（月模式）',
  },
};

/**
 * 年模式
 * 只显示年标签页，适用于年度统计
 */
export const YearMode: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '选择日期时间范围（年模式）',
  },
};

/**
 * 不显示秒的时间选择
 * 全局标签页切换，双列同步显示
 */
export const WithoutSeconds: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    showSeconds: false,
    format: 'YYYY-MM-DD HH:mm',
  },
};

/**
 * 自定义分隔符
 */
export const CustomSeparator: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    separator: ' 至 ',
  },
};

/**
 * 预设值示例
 */
export const WithPresetValue: Story = {
  render: (args) => {
    const [value, setValue] = useState<[Date?, Date?]>([new Date(2024, 0, 1, 9, 0, 0), new Date(2024, 0, 2, 18, 30, 0)]);

    return <InputDateTimeRange {...args} value={value} onChange={setValue} />;
  },
  args: {
    placeholder: '请选择日期时间范围',
  },
};

/**
 * 禁用状态
 */
export const Disabled: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    disabled: true,
  },
};

/**
 * 只读状态
 */
export const ReadOnly: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    readOnly: true,
  },
};

/**
 * 错误状态
 */
export const WithError: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    error: true,
    errorMessage: '日期时间范围不能为空',
  },
};

/**
 * 带时间约束
 */
export const WithTimeConstraints: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    timeConstraints: {
      hours: { min: 8, max: 18 }, // 工作时间：8:00-18:00
    },
  },
};

/**
 * 禁用特定日期
 */
export const WithDisabledDates: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    disabledDate: (date: Date) => {
      // 禁用周末
      const day = date.getDay();
      return day === 0 || day === 6;
    },
  },
};

/**
 * 自定义验证
 */
export const WithValidation: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    placeholder: '请选择日期时间范围',
    validate: (value: [Date?, Date?]) => {
      if (!value[0] || !value[1]) return '请选择完整的日期时间范围';

      const diffMs = value[1].getTime() - value[0].getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours > 24 * 7) {
        return '日期时间范围不能超过7天';
      }

      return undefined;
    },
  },
};
