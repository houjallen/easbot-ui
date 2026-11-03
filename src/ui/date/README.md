# DatePicker 日期时间选择器组件套件

一个功能完整、高度可定制的 React 日期时间选择器组件套件，支持多种视图模式、时区处理、移动端适配等高级功能。

## 功能特性

### ✅ 已完成功能

- **🚀 快捷选择功能** - 支持今天、昨天、本周等常用快捷选择
- **📅 多种视图模式** - 年、季度、月、日、时间视图切换
- **⏰ 时间约束配置** - 小时、分钟、秒的范围和步长限制
- **📱 移动端适配** - 响应式设计，触摸友好的交互
- **🔍 输入验证和格式化** - 智能解析、实时验证、格式化提示
- **✅ 确认模式支持** - 可选的确认/取消操作模式
- **🌍 UTC 时间处理** - 完整的时区转换和 UTC 时间支持
- **🚀 增强的错误处理** - 安全的日期解析和格式化，完善的错误提示
- **🔧 强大的工具函数** - 提供丰富的日期处理工具函数
- **🎨 灵活的禁用配置** - 支持多种禁用条件组合

### 🔄 待开发功能

- **📋 日程安排显示** - 在日历中显示事件和日程

## 组件列表

### 基础组件

- `DatePicker` - 基础日期选择器
- `InputDate` - 日期输入组件
- `InputTime` - 时间输入组件
- `InputDateTime` - 日期时间输入组件
- `InputDateRange` - 日期范围选择组件
- `InputTimeRange` - 时间范围选择组件

### 增强组件

- `EnhancedDatePicker` - 增强日期选择器（支持多视图模式）
- `EmbeddedDatePicker` - 嵌入式日期选择器（无弹窗模式）

### 视图组件

- `ViewSelectorHeader` - 视图选择器头部
- `YearView` / `YearRangeView` - 年份选择视图（单选/范围）
- `MonthView` / `MonthRangeView` - 月份选择视图（单选/范围）
- `QuarterView` / `QuarterRangeView` - 季度选择视图（单选/范围）
- `DayView` / `DayRangeView` - 日期选择视图（单选/范围）
- `TimeView` / `TimeRangeView` - 时间选择视图（单选/范围）

## 使用示例

### 基础用法

```tsx
import { InputDate } from '@/components/ui/date-picker';

function BasicExample() {
  const [date, setDate] = useState<Date>();

  return <InputDate value={date} onChange={setDate} placeholder="请选择日期" />;
}
```

### 增强日期选择器

```tsx
import { EnhancedDatePicker } from '@/components/ui/date-picker';

function EnhancedExample() {
  const [date, setDate] = useState<Date>();

  return (
    <EnhancedDatePicker
      value={date}
      onChange={setDate}
      allowedViews={['days', 'months', 'years']}
      showTimeView={true}
      showQuarterView={true}
      requireConfirm={true}
      timeConstraints={{
        hours: { min: 9, max: 18 },
        minutes: { step: 15 },
      }}
    />
  );
}
```

### 移动端适配

```tsx
import { EmbeddedDatePicker, useIsMobile } from '@/components/ui/date-picker';

function MobileExample() {
  const [date, setDate] = useState<Date>();
  const isMobile = useIsMobile();

  return (
    <EmbeddedDatePicker value={date} onChange={setDate} isMobile={isMobile} showShortcuts={true} />
  );
}
```

### 时区处理

```tsx
import { InputDate, useTimezone } from '@/components/ui/date-picker';

function TimezoneExample() {
  const [date, setDate] = useState<Date>();
  const { formatDate, parseDate, currentTimezone } = useTimezone({
    timezone: 'Asia/Shanghai',
    displayTimezone: true,
  });

  return (
    <div>
      <p>当前时区: {currentTimezone}</p>
      <InputDate value={date} onChange={setDate} format="YYYY-MM-DD HH:mm:ss" />
    </div>
  );
}
```

### 日期范围选择

```tsx
import { InputDateRange } from '@/components/ui/date-picker';

function DateRangeExample() {
  const [dateRange, setDateRange] = useState<[Date?, Date?]>([]);

  return (
    <InputDateRange
      value={dateRange}
      onChange={setDateRange}
      showShortcuts={true}
      separator=" 至 "
    />
  );
}
```

## 工具函数

### 安全的日期处理

```tsx
import {
  safeDateFormat,
  safeDateParse,
  validateDateRange,
  smartDateParse,
  detectDateFormat,
  combineDisabledDate,
  commonDisabledDates,
} from '@/components/ui/date-picker';

// 安全的日期格式化
const formatResult = safeDateFormat(new Date(), 'YYYY年MM月DD日');
if (formatResult.isValid) {
  console.log(formatResult.formatted); // "2024年01月01日"
} else {
  console.log(formatResult.error);
}

// 安全的日期解析
const parseResult = safeDateParse('2024-01-01', 'YYYY-MM-DD');
if (parseResult.isValid && parseResult.date) {
  console.log(parseResult.date);
} else {
  console.log(parseResult.error);
}

// 智能日期解析（自动检测格式）
const smartResult = smartDateParse('2024/01/01');
if (smartResult.isValid) {
  console.log('自动解析成功:', smartResult.date);
}

// 日期范围验证
const rangeResult = validateDateRange(
  new Date('2024-06-01'),
  new Date('2024-01-01'), // 最小日期
  new Date('2024-12-31'), // 最大日期
);

// 组合禁用日期条件
const combinedDisabled = combineDisabledDate(
  commonDisabledDates.disablePast, // 禁用过去
  commonDisabledDates.disableWeekends, // 禁用周末
  (date) => date.getDate() === 13, // 禁用13号
);
```

### 高级日期计算和比较

```tsx
import { dateCalculations, dateComparisons, DATE_FORMATS } from '@/components/ui/date-picker';

// 日期计算示例
const today = new Date();
const tomorrow = new Date('2024-01-02');

// 获取日期范围的所有日期
const dateRange = dateCalculations.getDateRange(today, tomorrow);
console.log('日期范围:', dateRange);

// 计算天数差
const daysDiff = dateCalculations.getDaysDifference(today, tomorrow);
console.log('相差天数:', daysDiff);

// 获取工作日数量
const workingDays = dateCalculations.getWorkingDays(today, tomorrow);
console.log('工作日数量:', workingDays);

// 获取月份范围
const monthStart = dateCalculations.getMonthStart(today);
const monthEnd = dateCalculations.getMonthEnd(today);
console.log('月初:', monthStart, '月末:', monthEnd);

// 获取季度和年份范围
const quarterStart = dateCalculations.getQuarterStart(today);
const yearStart = dateCalculations.getYearStart(today);

// 获取下一个/上一个工作日
const nextWorkingDay = dateCalculations.getNextWorkingDay(today);
const prevWorkingDay = dateCalculations.getPreviousWorkingDay(today);

// 日期比较示例
const isToday = dateComparisons.isToday(new Date());
const isYesterday = dateComparisons.isYesterday(new Date());
const isThisWeek = dateComparisons.isThisWeek(new Date());
const isWorkingDay = dateComparisons.isWorkingDay(new Date());
const isLeapYear = dateComparisons.isLeapYear(new Date());

console.log({
  isToday,
  isYesterday,
  isThisWeek,
  isWorkingDay,
  isLeapYear,
});
```

### 验证和格式化

```tsx
import { validateDate, formatDate, parseDate, DATE_FORMATS } from '@/components/ui/date-picker';

// 验证日期
const result = validateDate('2024-01-01', {
  format: DATE_FORMATS.DATE,
  minDate: new Date('2024-01-01'),
  maxDate: new Date('2024-12-31'),
});

// 格式化日期
const formatted = formatDate(new Date(), {
  format: 'YYYY年MM月DD日',
});

// 解析日期
const parsed = parseDate('2024-01-01', {
  format: DATE_FORMATS.DATE,
});
```

### 时区转换

```tsx
import { convertToTimezone, convertToUTC, TimezoneConverter } from '@/components/ui/date-picker';

// 时区转换
const shanghaiTime = convertToTimezone(new Date(), 'Asia/Shanghai');
const utcTime = convertToUTC(new Date(), 'Asia/Shanghai');

// 使用转换器
const converter = new TimezoneConverter('UTC', 'Asia/Shanghai');
const convertedDate = converter.convert(new Date());
```

### 移动端检测

```tsx
import { useIsMobile, useBreakpoint, detectMobileDevice } from '@/components/ui/date-picker';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  const deviceInfo = detectMobileDevice();

  return (
    <div>
      <p>是否移动端: {isMobile ? '是' : '否'}</p>
      <p>当前断点: {breakpoint.current}</p>
      <p>设备类型: {deviceInfo.deviceType}</p>
    </div>
  );
}
```

## 配置选项

### 日期格式

```tsx
import { DATE_FORMATS } from '@/components/ui/date-picker';

const formats = {
  date: DATE_FORMATS.DATE, // YYYY-MM-DD
  dateCN: DATE_FORMATS.DATE_CN, // YYYY年MM月DD日
  datetime: DATE_FORMATS.DATETIME, // YYYY-MM-DD HH:mm:ss
  time: DATE_FORMATS.TIME, // HH:mm:ss
  month: DATE_FORMATS.MONTH, // YYYY-MM
  year: DATE_FORMATS.YEAR, // YYYY
  quarter: DATE_FORMATS.QUARTER, // YYYY-Q1
};
```

### 时区配置

```tsx
import { COMMON_TIMEZONES } from '@/components/ui/date-picker';

const timezoneConfig = {
  utc: false,
  timezone: 'Asia/Shanghai',
  displayTimezone: true,
  autoDetectTimezone: true,
};
```

### 移动端配置

```tsx
import { getMobileOptimizedConfig } from '@/components/ui/date-picker';

const mobileConfig = getMobileOptimizedConfig(true);
// {
//   buttonSize: 'lg',
//   spacing: 'p-4',
//   showAllViews: false,
//   maxShortcuts: 6,
//   fullscreen: true,
//   autoClose: true
// }
```

## 样式定制

组件使用 Tailwind CSS 类名，可以通过 `className` 属性进行样式定制：

```tsx
<InputDate className="w-full" inputClassName="border-blue-500" popoverClassName="shadow-lg" />
```

## 国际化支持

组件内置中文界面，支持通过 dayjs 的本地化功能扩展其他语言：

```tsx
import dayjs from 'dayjs';
import 'dayjs/locale/en';

dayjs.locale('en');
```

## 无障碍访问

- 支持键盘导航
- 提供 ARIA 标签
- 支持屏幕阅读器
- 高对比度模式兼容

## 性能优化

- 使用 React.memo 优化重渲染
- 懒加载视图组件
- 虚拟滚动支持（大数据量）
- 防抖输入处理

## 浏览器兼容性

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88
- 移动端浏览器支持

## 更新日志

### v1.0.0 (2024-01-01)

- ✅ 完成基础日期选择器组件
- ✅ 添加快捷选择功能
- ✅ 支持多种视图模式
- ✅ 实现时间约束配置
- ✅ 完成移动端适配
- ✅ 添加输入验证和格式化
- ✅ 支持确认模式
- ✅ 实现 UTC 时间处理

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进组件功能。

## 许可证

MIT License
