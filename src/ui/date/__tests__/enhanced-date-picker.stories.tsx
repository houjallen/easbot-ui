import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DatePicker } from '../date-picker';
import { EmbeddedDatePicker } from '../embedded-date-picker';
import { EnhancedDatePicker } from '../enhanced-date-picker';
import { InputDate } from '../input-date';
import { InputDateRange } from '../input-date-range';
import { InputDateTime } from '../input-date-time';
import { InputDateTimeRange } from '../input-date-time-range';
import { InputTime } from '../input-time';
import { InputTimeRange } from '../input-time-range';
import { CombinedShortcutView, MonthRangeView, ShortcutView, TimeRangeView, YearRangeView } from '../view';

const meta: Meta<typeof EnhancedDatePicker> = {
  title: 'EASAI/date/DatePicker Components',
  component: EnhancedDatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '一套完整的日期时间选择器组件，支持多种视图模式、时间约束、范围选择等功能。',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EnhancedDatePicker>;

// 基础用法
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} />;
  },
};

// 多视图模式
export const MultipleViews: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} allowedViews={['days', 'months', 'years']} />;
  },
};

// 季度视图
export const QuarterView: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} viewMode="quarters" allowedViews={['quarters', 'days']} showQuarterView={true} />;
  },
};

// 时间选择
export const TimeView: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} viewMode="time" showTimeView={true} showSeconds={true} />;
  },
};

// 日期时间组合
export const DateTimeView: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} allowedViews={['days', 'months', 'years']} showTimeView={true} showSeconds={true} />;
  },
};

// 时间约束
export const TimeConstraints: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <EnhancedDatePicker
        value={value}
        onChange={setValue}
        showTimeView={true}
        timeConstraints={{
          hours: { min: 9, max: 18, step: 1 },
          minutes: { min: 0, max: 59, step: 15 },
          seconds: { min: 0, max: 59, step: 30 },
        }}
        showSeconds={true}
      />
    );
  },
};

// 快捷选择功能
export const WithShortcuts: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} showShortcuts={true} />;
  },
};

// 基础日期选择器
export const BasicDatePicker: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium">基础日期选择器</h3>
          <DatePicker selected={selected} onSelect={setSelected} showShortcuts={true} />
        </div>

        <div>
          <h3 className="mb-2 font-medium">无快捷选择</h3>
          <DatePicker selected={selected} onSelect={setSelected} showShortcuts={false} />
        </div>

        <div className="mt-4 rounded bg-gray-50 p-4">
          <p className="text-gray-600 text-sm">选择的日期: {selected ? selected.toLocaleDateString() : '未选择'}</p>
        </div>
      </div>
    );
  },
};

// 日期范围限制
export const DateRange: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    return <EnhancedDatePicker value={value} onChange={setValue} minDate={minDate} maxDate={maxDate} />;
  },
};

// 禁用特定日期
export const DisabledDates: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();

    const isWeekend = (date: Date) => {
      const day = date.getDay();
      return day === 0 || day === 6; // 周日或周六
    };

    return <EnhancedDatePicker value={value} onChange={setValue} disabledDate={isWeekend} />;
  },
};

// 自定义格式
export const CustomFormat: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} format="YYYY年MM月DD日" />;
  },
};

// 年份选择器
export const YearOnly: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} viewMode="years" allowedViews={['years']} format="YYYY年" />;
  },
};

// 月份选择器
export const MonthOnly: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <EnhancedDatePicker value={value} onChange={setValue} viewMode="months" allowedViews={['months', 'years']} format="YYYY年MM月" />;
  },
};

// InputDate 基础输入组件
export const InputDateBasic: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">InputDate 基础日期输入</h3>
        <InputDate value={value} onChange={(val) => setValue(val || '')} format="YYYY-MM-DD" />
        <p className="text-muted-foreground text-sm">当前值: {value || '无'}</p>
      </div>
    );
  },
};

// InputTime 时间输入组件
export const InputTimeBasic: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">InputTime 时间输入</h3>
        <InputTime value={value} onChange={(val) => setValue(val || '')} showSeconds={true} />
        <p className="text-muted-foreground text-sm">当前值: {value || '无'}</p>
      </div>
    );
  },
};

// InputDateTime 日期时间输入组件
export const InputDateTimeBasic: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">InputDateTime 日期时间输入</h3>
        <InputDateTime
          value={value}
          onChange={(dateStr) => {
            if (dateStr) {
              setValue(dayjs(dateStr).toDate());
            } else {
              setValue(undefined);
            }
          }}
          showSeconds={true}
          timeConstraints={{
            hours: { min: 0, max: 23, step: 1 },
            minutes: { min: 0, max: 59, step: 15 },
          }}
        />
        <p className="text-muted-foreground text-sm">当前值: {value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '无'}</p>
      </div>
    );
  },
};

// InputDateRange 日期范围输入组件
export const InputDateRangeBasic: Story = {
  render: () => {
    const [value, setValue] = useState<[string, string] | undefined>();
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">InputDateRange 日期范围输入</h3>
        <InputDateRange value={value} onChange={setValue} separator={' 至 '} />
        <p className="text-muted-foreground text-sm">当前值: {value ? `${value[0]} 至 ${value[1]}` : '无'}</p>
      </div>
    );
  },
};

// InputTimeRange 时间范围输入组件
export const InputTimeRangeBasic: Story = {
  render: () => {
    const [value, setValue] = useState<[string, string] | undefined>();
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">InputTimeRange 时间范围输入</h3>
        <InputTimeRange value={value} onChange={setValue} showSeconds={false} separator={' ~ '} />
        <p className="text-muted-foreground text-sm">当前值: {value ? `${value[0]} ~ ${value[1]}` : '无'}</p>
      </div>
    );
  },
};

// InputDateTimeRange 日期时间范围输入组件
export const InputDateTimeRangeBasic: Story = {
  render: () => {
    const [value, setValue] = useState<[Date?, Date?]>([]);
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">InputDateTimeRange 日期时间范围输入</h3>
        <InputDateTimeRange
          value={value}
          onChange={setValue}
          showSeconds={true}
          separator={' ~ '}
          timeConstraints={{
            hours: { min: 0, max: 23, step: 1 },
            minutes: { min: 0, max: 59, step: 30 },
          }}
        />
        <p className="text-muted-foreground text-sm">当前值: {value[0] && value[1] ? `${dayjs(value[0]).format('YYYY-MM-DD HH:mm:ss')} ~ ${dayjs(value[1]).format('YYYY-MM-DD HH:mm:ss')}` : '无'}</p>
      </div>
    );
  },
};

// EmbeddedDatePicker 嵌入式日期选择器
export const EmbeddedDatePickerBasic: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">EmbeddedDatePicker 嵌入式日期选择器</h3>
        <EmbeddedDatePicker value={value} onChange={setValue} allowedViews={['days', 'months', 'years']} showTimeView={false} showQuarterView={true} showShortcuts={true} isMobile={false} />
        <p className="text-muted-foreground text-sm">当前值: {value ? dayjs(value).format('YYYY-MM-DD') : '无'}</p>
      </div>
    );
  },
};

// 范围视图组件展示
export const RangeViewsDemo: Story = {
  render: () => {
    const [yearRange, setYearRange] = useState<[Date?, Date?]>([]);
    const [monthRange, setMonthRange] = useState<[Date?, Date?]>([]);
    const [timeRange, setTimeRange] = useState<[Date?, Date?]>([]);
    const viewDate = dayjs();

    return (
      <div className="space-y-8">
        <h3 className="font-medium text-lg">范围视图组件展示</h3>

        {/* 年份范围选择 */}
        <div className="space-y-4">
          <h4 className="font-medium">年份范围选择</h4>
          <div className="w-fit rounded-lg border p-4">
            <YearRangeView
              viewDate={viewDate}
              selectedStartDate={yearRange[0] ? dayjs(yearRange[0]) : undefined}
              selectedEndDate={yearRange[1] ? dayjs(yearRange[1]) : undefined}
              onStartSelect={(date) => setYearRange([date.toDate(), yearRange[1]])}
              onEndSelect={(date) => setYearRange([yearRange[0], date.toDate()])}
            />
          </div>
          <p className="text-muted-foreground text-sm">选择范围: {yearRange[0] && yearRange[1] ? `${dayjs(yearRange[0]).format('YYYY年')} - ${dayjs(yearRange[1]).format('YYYY年')}` : '未选择'}</p>
        </div>

        {/* 月份范围选择 */}
        <div className="space-y-4">
          <h4 className="font-medium">月份范围选择</h4>
          <div className="w-fit rounded-lg border p-4">
            <MonthRangeView
              viewDate={viewDate}
              selectedStartDate={monthRange[0] ? dayjs(monthRange[0]) : undefined}
              selectedEndDate={monthRange[1] ? dayjs(monthRange[1]) : undefined}
              onStartSelect={(date) => setMonthRange([date.toDate(), monthRange[1]])}
              onEndSelect={(date) => setMonthRange([monthRange[0], date.toDate()])}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            选择范围: {monthRange[0] && monthRange[1] ? `${dayjs(monthRange[0]).format('YYYY年MM月')} - ${dayjs(monthRange[1]).format('YYYY年MM月')}` : '未选择'}
          </p>
        </div>

        {/* 时间范围选择 */}
        <div className="space-y-4">
          <h4 className="font-medium">时间范围选择</h4>
          <div className="w-fit rounded-lg border p-4">
            <TimeRangeView
              selectedStartDate={timeRange[0] ? dayjs(timeRange[0]) : undefined}
              selectedEndDate={timeRange[1] ? dayjs(timeRange[1]) : undefined}
              onStartSelect={(date) => setTimeRange([date.toDate(), timeRange[1]])}
              onEndSelect={(date) => setTimeRange([timeRange[0], date.toDate()])}
              showSeconds={true}
            />
          </div>
          <p className="text-muted-foreground text-sm">选择范围: {timeRange[0] && timeRange[1] ? `${dayjs(timeRange[0]).format('HH:mm:ss')} - ${dayjs(timeRange[1]).format('HH:mm:ss')}` : '未选择'}</p>
        </div>
      </div>
    );
  },
};

// 快捷选择组件
export const ShortcutComponents: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedRange, setSelectedRange] = useState<[Date, Date] | undefined>();
    const [selectedTime, setSelectedTime] = useState<Date | undefined>();

    return (
      <div className="space-y-6">
        <h3 className="font-medium text-lg">快捷选择组件示例</h3>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 组合快捷选择 */}
          <div className="space-y-4">
            <h4 className="font-medium">组合快捷选择</h4>
            <div className="w-fit rounded-lg border">
              <CombinedShortcutView
                onDateSelect={(shortcut) => {
                  const date = shortcut.value();
                  setSelectedDate(date);
                  console.log('单选:', shortcut.label);
                }}
                onRangeSelect={(shortcut) => {
                  const range = shortcut.value();
                  setSelectedRange(range);
                  console.log('范围选择:', shortcut.label);
                }}
                mode="both"
                dateTitle="单日期"
                rangeTitle="日期范围"
                minWidth="min-w-36"
              />
            </div>
            <div className="space-y-1 text-muted-foreground text-xs">
              <p>单日期: {selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : '未选择'}</p>
              <p>日期范围: {selectedRange ? `${dayjs(selectedRange[0]).format('MM-DD')} 至 ${dayjs(selectedRange[1]).format('MM-DD')}` : '未选择'}</p>
            </div>
          </div>
        </div>

        {/* 自定义快捷选择 */}
        <div className="space-y-4">
          <h4 className="font-medium">自定义快捷选择</h4>
          <div className="w-fit rounded-lg border">
            <ShortcutView
              shortcuts={[
                {
                  label: '30天前',
                  value: () => dayjs().subtract(30, 'day').toDate(),
                },
                {
                  label: '60天前',
                  value: () => dayjs().subtract(60, 'day').toDate(),
                },
                {
                  label: '90天前',
                  value: () => dayjs().subtract(90, 'day').toDate(),
                },
                {
                  label: '明年今日',
                  value: () => dayjs().add(1, 'year').toDate(),
                },
              ]}
              onSelect={(shortcut) => {
                const date = shortcut.value();
                setSelectedDate(date);
                console.log('自定义选择:', shortcut.label, date);
              }}
              show={true}
              title="自定义快选"
              className="bg-slate-50"
            />
          </div>
        </div>
      </div>
    );
  },
};

// 综合应用场景
export const ComprehensiveExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      birthday: '',
      workTime: '',
      meetingDateTime: undefined as Date | undefined,
      projectDateRange: undefined as [string, string] | undefined,
      workTimeRange: undefined as [string, string] | undefined,
      eventDateTimeRange: [] as [Date?, Date?],
    });

    return (
      <div className="max-w-2xl space-y-6">
        <h3 className="font-medium text-lg">综合应用场景示例</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 生日选择 */}
          <div className="space-y-2">
            <span className="font-medium text-sm">生日</span>
            <InputDate value={formData.birthday} onChange={(value) => setFormData((prev) => ({ ...prev, birthday: value || '' }))} disabledDate={(date) => date > new Date()} />
          </div>

          {/* 工作时间 */}
          <div className="space-y-2">
            <span className="font-medium text-sm">上班时间</span>
            <InputTime value={formData.workTime} onChange={(value) => setFormData((prev) => ({ ...prev, workTime: value || '' }))} showSeconds={false} />
          </div>
        </div>

        {/* 表单数据展示 */}
        <div className="mt-6 rounded-lg bg-muted p-4">
          <h4 className="mb-2 font-medium">表单数据</h4>
          <pre className="overflow-auto text-xs">
            {JSON.stringify(
              {
                birthday: formData.birthday,
                workTime: formData.workTime,
                meetingDateTime: formData.meetingDateTime ? dayjs(formData.meetingDateTime).format('YYYY-MM-DD HH:mm:ss') : null,
                projectDateRange: formData.projectDateRange || null,
                workTimeRange: formData.workTimeRange,
                eventDateTimeRange: formData.eventDateTimeRange.map((date) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : null)),
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    );
  },
};
