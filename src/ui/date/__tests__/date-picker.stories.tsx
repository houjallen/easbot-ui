import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DatePicker, InputDate, InputDateRange, InputDateTime, InputDateTimeRange, InputTime, InputTimeRange } from '../index';

const meta = {
  title: 'EASAI/date/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '日期选择器组件集合，支持日、月、年模式选择，具有视图选择器头部和直接返回机制。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ==================== DatePicker 组件示例 ====================

export const DatePickerBasic: Story = {
  name: 'DatePicker - 基础日选择',
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">基础日期选择器</h3>
          <DatePicker selected={date} onSelect={setDate} />
        </div>
        <div className="mt-4 text-gray-600 text-sm">选中的日期：{date ? date.toLocaleDateString('zh-CN') : '未选择'}</div>
      </div>
    );
  },
};

export const DatePickerDayMode: Story = {
  name: 'DatePicker - 日模式',
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">日模式（默认）</h3>
          <DatePicker mode="day" selected={date} onSelect={setDate} />
        </div>
        <div className="mt-4 text-gray-600 text-sm">选中的日期：{date ? date.toLocaleDateString('zh-CN') : '未选择'}</div>
      </div>
    );
  },
};

export const DatePickerMonthMode: Story = {
  name: 'DatePicker - 月模式',
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">月模式</h3>
          <DatePicker mode="month" selected={date} onSelect={setDate} format="YYYY-MM" />
        </div>
        <div className="mt-4 text-gray-600 text-sm">
          选中的月份：
          {date
            ? date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
              })
            : '未选择'}
        </div>
      </div>
    );
  },
};

export const DatePickerYearMode: Story = {
  name: 'DatePicker - 年模式',
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">年模式</h3>
          <DatePicker mode="year" selected={date} onSelect={setDate} format="YYYY" />
        </div>
        <div className="mt-4 text-gray-600 text-sm">{date ? date.getFullYear() + '年' : '未选择'}</div>
      </div>
    );
  },
};

export const DatePickerWithoutShortcuts: Story = {
  name: 'DatePicker - 不显示快捷选择',
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">隐藏快捷选择</h3>
          <DatePicker selected={date} onSelect={setDate} showShortcuts={false} />
        </div>
        <div className="mt-4 text-gray-600 text-sm">选中的日期：{date ? date.toLocaleDateString('zh-CN') : '未选择'}</div>
      </div>
    );
  },
};

// ==================== InputDate 组件示例 ====================

export const InputDateBasic: Story = {
  name: 'InputDate - 基础日选择',
  render: () => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">基础日期输入</h3>
          <InputDate value={value} onChange={setValue} />
        </div>
        <div className="mt-4 text-gray-600 text-sm">输入的日期：{value || '未输入'}</div>
      </div>
    );
  },
};

export const InputDateDayMode: Story = {
  name: 'InputDate - 日模式',
  render: () => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">日模式（默认）</h3>
          <InputDate mode="day" value={value} onChange={setValue} />
        </div>
        <div className="mt-4 text-gray-600 text-sm">输入的日期：{value || '未输入'}</div>
      </div>
    );
  },
};

export const InputDateMonthMode: Story = {
  name: 'InputDate - 月模式',
  render: () => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">月模式</h3>
          <InputDate mode="month" value={value} onChange={setValue} format="YYYY-MM" />
        </div>
        <div className="mt-4 text-gray-600 text-sm">输入的月份：{value || '未输入'}</div>
      </div>
    );
  },
};

export const InputDateYearMode: Story = {
  name: 'InputDate - 年模式',
  render: () => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">年模式</h3>
          <InputDate mode="year" value={value} onChange={setValue} format="YYYY" />
        </div>
        <div className="mt-4 text-gray-600 text-sm">输入的年份：{value || '未输入'}</div>
      </div>
    );
  },
};

export const InputDateWithValidation: Story = {
  name: 'InputDate - 带验证',
  render: () => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">带验证的日期输入</h3>
          <InputDate
            value={value}
            onChange={setValue}
            disabledDate={(date) => date <= new Date()}
            validate={(value) => {
              if (value && new Date(value) <= new Date()) {
                return '请选择未来的日期';
              }
              return;
            }}
          />
        </div>
        <div className="mt-4 text-gray-600 text-sm">输入的日期：{value || '未输入'}</div>
      </div>
    );
  },
};

export const InputDateReadOnly: Story = {
  name: 'InputDate - 只读模式',
  render: () => {
    const [value] = React.useState<string>('2024-01-15');
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">只读模式</h3>
          <InputDate value={value} readOnly />
        </div>
        <div className="mt-4 text-gray-600 text-sm">输入的日期：{value || '未输入'}</div>
      </div>
    );
  },
};

// ==================== 模式对比示例 ====================

export const ModeComparison: Story = {
  name: '模式对比 - 日月年',
  render: () => {
    const [dayValue, setDayValue] = React.useState<string>();
    const [monthValue, setMonthValue] = React.useState<string>();
    const [yearValue, setYearValue] = React.useState<string>();

    const [dayDate, setDayDate] = React.useState<Date>();
    const [monthDate, setMonthDate] = React.useState<Date>();
    const [yearDate, setYearDate] = React.useState<Date>();

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 日模式 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">日模式</h3>

          <div>
            <span className="mb-2 block font-medium text-sm">InputDate</span>
            <InputDate mode="day" value={dayValue} onChange={setDayValue} />
            <p className="mt-1 text-gray-500 text-xs">格式：YYYY-MM-DD</p>
          </div>

          <div>
            <span className="mb-2 block font-medium text-sm">DatePicker</span>
            <DatePicker mode="day" selected={dayDate} onSelect={setDayDate} />
          </div>

          <div className="text-gray-600 text-sm">
            <p>InputDate: {dayValue || '未选择'}</p>
            <p>DatePicker: {dayDate ? dayDate.toLocaleDateString('zh-CN') : '未选择'}</p>
          </div>
        </div>

        {/* 月模式 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">月模式</h3>

          <div>
            <span className="mb-2 block font-medium text-sm">InputDate</span>
            <InputDate mode="month" value={monthValue} onChange={setMonthValue} format="YYYY-MM" />
            <p className="mt-1 text-gray-500 text-xs">格式：YYYY-MM</p>
          </div>

          <div>
            <span className="mb-2 block font-medium text-sm">DatePicker</span>
            <DatePicker mode="month" selected={monthDate} onSelect={setMonthDate} format="YYYY-MM" />
          </div>

          <div className="text-gray-600 text-sm">
            <p>InputDate: {monthValue || '未选择'}</p>
            <p>
              DatePicker:{' '}
              {monthDate
                ? monthDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                  })
                : '未选择'}
            </p>
          </div>
        </div>

        {/* 年模式 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">年模式</h3>

          <div>
            <span className="mb-2 block font-medium text-sm">InputDate</span>
            <InputDate mode="year" value={yearValue} onChange={setYearValue} format="YYYY" />
            <p className="mt-1 text-gray-500 text-xs">格式：YYYY</p>
          </div>

          <div>
            <span className="mb-2 block font-medium text-sm">DatePicker</span>
            <DatePicker mode="year" selected={yearDate} onSelect={setYearDate} format="YYYY" />
          </div>

          <div className="text-gray-600 text-sm">
            <p>InputDate: {yearValue || '未选择'}</p>
            <p>{yearDate ? yearDate.getFullYear() + '年' : '未选择'}</p>
          </div>
        </div>
      </div>
    );
  },
};

// ==================== 原有的其他组件示例 ====================

// 保留原有的基础示例（重命名）
export const Basic: Story = DatePickerBasic;
export const InputDateExample: Story = InputDateBasic;

export const InputTimeExample: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>();
    return <InputTime value={value} onChange={setValue} showSeconds />;
  },
};

export const InputDateTimeExample: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>();
    return <InputDateTime value={value} onChange={setValue} />;
  },
};

export const InputDateRangeExample: Story = {
  render: () => {
    const [value, setValue] = React.useState<[string, string]>();
    return <InputDateRange value={value} onChange={setValue} />;
  },
};

// ==================== InputDateRange 模式示例 ====================

export const InputDateRangeDayMode: Story = {
  name: 'InputDateRange - 日期区间模式',
  render: () => {
    const [value, setValue] = React.useState<[string, string]>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">日期区间模式（默认）</h3>
          <InputDateRange mode="day" value={value} onChange={setValue} format="YYYY-MM-DD" />
        </div>
        <div className="mt-4 text-gray-600 text-sm">选择的日期区间：{value ? `${value[0]} ~ ${value[1]}` : '未选择'}</div>
      </div>
    );
  },
};

export const InputDateRangeMonthMode: Story = {
  name: 'InputDateRange - 月份区间模式',
  render: () => {
    const [value, setValue] = React.useState<[string, string]>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">月份区间模式</h3>
          <InputDateRange mode="month" value={value} onChange={setValue} format="YYYY-MM-DD" />
        </div>
        <div className="mt-4 text-gray-600 text-sm">选择的月份区间：{value ? `${value[0]} ~ ${value[1]}` : '未选择'}</div>
      </div>
    );
  },
};

export const InputDateRangeYearMode: Story = {
  name: 'InputDateRange - 年份区间模式',
  render: () => {
    const [value, setValue] = React.useState<[string, string]>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-sm">年份区间模式</h3>
          <InputDateRange mode="year" value={value} onChange={setValue} format="YYYY-MM-DD" />
        </div>
        <div className="mt-4 text-gray-600 text-sm">选择的年份区间：{value ? `${value[0]} ~ ${value[1]}` : '未选择'}</div>
      </div>
    );
  },
};

export const InputDateRangeModeComparison: Story = {
  name: 'InputDateRange - 模式对比',
  render: () => {
    const [dayValue, setDayValue] = React.useState<[string, string]>();
    const [monthValue, setMonthValue] = React.useState<[string, string]>();
    const [yearValue, setYearValue] = React.useState<[string, string]>();

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 日期区间模式 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">日期区间模式</h3>
          <div>
            <span className="mb-2 block font-medium text-sm">日期范围选择</span>
            <InputDateRange mode="day" value={dayValue} onChange={setDayValue} format="YYYY-MM-DD" />
            <p className="mt-1 text-gray-500 text-xs">返回格式：['YYYY-MM-DD', 'YYYY-MM-DD']</p>
          </div>
          <div className="text-gray-600 text-sm">
            <p>选择的区间：</p>
            <p className="break-all">{dayValue ? `${dayValue[0]} ~ ${dayValue[1]}` : '未选择'}</p>
          </div>
        </div>

        {/* 月份区间模式 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">月份区间模式</h3>
          <div>
            <span className="mb-2 block font-medium text-sm">月份范围选择</span>
            <InputDateRange mode="month" value={monthValue} onChange={setMonthValue} format="YYYY-MM-DD" />
            <p className="mt-1 text-gray-500 text-xs">返回格式：['YYYY-MM', 'YYYY-MM']</p>
          </div>
          <div className="text-gray-600 text-sm">
            <p>选择的区间：</p>
            <p className="break-all">{monthValue ? `${monthValue[0]} ~ ${monthValue[1]}` : '未选择'}</p>
          </div>
        </div>

        {/* 年份区间模式 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">年份区间模式</h3>
          <div>
            <span className="mb-2 block font-medium text-sm">年份范围选择</span>
            <InputDateRange mode="year" value={yearValue} onChange={setYearValue} format="YYYY-MM-DD" />
            <p className="mt-1 text-gray-500 text-xs">返回格式：['YYYY', 'YYYY']</p>
          </div>
          <div className="text-gray-600 text-sm">
            <p>选择的区间：</p>
            <p className="break-all">{yearValue ? `${yearValue[0]} ~ ${yearValue[1]}` : '未选择'}</p>
          </div>
        </div>
      </div>
    );
  },
};

export const InputTimeRangeExample: Story = {
  render: () => {
    const [value, setValue] = React.useState<[string, string]>();
    return <InputTimeRange value={value} onChange={setValue} showSeconds />;
  },
};

export const InputDateTimeRangeExample: Story = {
  render: () => {
    const [value, setValue] = React.useState<[Date?, Date?]>();
    return <InputDateTimeRange value={value} onChange={setValue} />;
  },
};
