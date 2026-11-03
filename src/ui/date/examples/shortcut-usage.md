# 快捷选择组件使用示例

## 概述

快捷选择组件（ShortcutView）提供了一个可复用的日期和时间快捷选择功能，可以与任何日期选择器组件配合使用。

## 组件类型

### 1. ShortcutView - 单选快捷选择

用于单个日期的快捷选择。

```tsx
import { ShortcutView } from '@/components/ui/date';
import { dateShortcuts } from '@/components/ui/date/shortcuts';

function DatePickerWithShortcuts() {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <div className="flex">
      <ShortcutView
        shortcuts={dateShortcuts}
        onSelect={(shortcut) => {
          const date = shortcut.value();
          setSelectedDate(date);
        }}
        show={true}
        title="快捷选择"
      />
      <div className="flex-1 p-4">
        {/* 你的日历组件 */}
        <Calendar selected={selectedDate} onSelect={setSelectedDate} />
      </div>
    </div>
  );
}
```

### 2. ShortcutRangeView - 范围选择快捷选择

用于日期范围的快捷选择。

```tsx
import { ShortcutRangeView } from '@/components/ui/date';
import { dateRangeShortcuts } from '@/components/ui/date/shortcuts';

function DateRangePickerWithShortcuts() {
  const [selectedRange, setSelectedRange] = useState<[Date, Date]>();

  return (
    <div className="flex">
      <ShortcutRangeView
        shortcuts={dateRangeShortcuts}
        onSelect={(shortcut) => {
          const range = shortcut.value();
          setSelectedRange(range);
        }}
        show={true}
        title="范围选择"
        minWidth="w-32"
      />
      <div className="flex-1 p-4">
        {/* 你的日期范围选择组件 */}
        选择的范围:{' '}
        {selectedRange &&
          `${selectedRange[0].toLocaleDateString()} - ${selectedRange[1].toLocaleDateString()}`}
      </div>
    </div>
  );
}
```

### 3. CombinedShortcutView - 组合快捷选择

同时支持单选和范围选择。

```tsx
import { CombinedShortcutView } from '@/components/ui/date';
import { dateShortcuts, dateRangeShortcuts } from '@/components/ui/date/shortcuts';

function FlexibleDatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedRange, setSelectedRange] = useState<[Date, Date]>();
  const [mode, setMode] = useState<'date' | 'range'>('date');

  return (
    <div className="flex">
      <CombinedShortcutView
        dateShortcuts={dateShortcuts}
        rangeShortcuts={dateRangeShortcuts}
        onDateSelect={(shortcut) => {
          setSelectedDate(shortcut.value());
          setMode('date');
        }}
        onRangeSelect={(shortcut) => {
          setSelectedRange(shortcut.value());
          setMode('range');
        }}
        mode="both"
        dateTitle="单日期"
        rangeTitle="日期范围"
      />
      <div className="flex-1 p-4">
        <div className="mb-4">
          <button onClick={() => setMode('date')} className={mode === 'date' ? 'active' : ''}>
            单选模式
          </button>
          <button onClick={() => setMode('range')} className={mode === 'range' ? 'active' : ''}>
            范围模式
          </button>
        </div>

        {mode === 'date' ? (
          <div>选择的日期: {selectedDate?.toLocaleDateString()}</div>
        ) : (
          <div>
            选择的范围:{' '}
            {selectedRange &&
              `${selectedRange[0].toLocaleDateString()} - ${selectedRange[1].toLocaleDateString()}`}
          </div>
        )}
      </div>
    </div>
  );
}
```

## 自定义快捷选择

你可以创建自定义的快捷选择选项：

```tsx
import { ShortcutView } from '@/components/ui/date';
import dayjs from 'dayjs';

function CustomShortcuts() {
  const customShortcuts = [
    {
      label: '30天前',
      value: () => dayjs().subtract(30, 'day').toDate(),
    },
    {
      label: '3个月前',
      value: () => dayjs().subtract(3, 'month').toDate(),
    },
    {
      label: '1年前',
      value: () => dayjs().subtract(1, 'year').toDate(),
    },
    {
      label: '明年今日',
      value: () => dayjs().add(1, 'year').toDate(),
    },
  ];

  return (
    <ShortcutView
      shortcuts={customShortcuts}
      onSelect={(shortcut) => {
        console.log('选择了:', shortcut.label, shortcut.value());
      }}
      title="自定义快选"
      className="bg-gray-50"
    />
  );
}
```

## 属性说明

### ShortcutView Props

- `shortcuts`: DateShortcut[] - 快捷选择选项数组
- `onSelect`: (shortcut: DateShortcut) => void - 选择回调函数
- `show?`: boolean - 是否显示组件，默认true
- `className?`: string - 额外的CSS类名
- `title?`: string - 标题，默认使用国际化配置
- `minWidth?`: string - 最小宽度，默认'w-28'

### ShortcutRangeView Props

与 ShortcutView 类似，但使用 DateRangeShortcut 类型。

### CombinedShortcutView Props

- `dateShortcuts?`: DateShortcut[] - 单选快捷选择选项
- `rangeShortcuts?`: DateRangeShortcut[] - 范围选择快捷选择选项
- `onDateSelect?`: (shortcut: DateShortcut) => void - 单选回调
- `onRangeSelect?`: (shortcut: DateRangeShortcut) => void - 范围选择回调
- `mode?`: 'date' | 'range' | 'both' - 显示模式，默认'both'
- `dateTitle?`: string - 单选分组标题
- `rangeTitle?`: string - 范围选择分组标题
- 其他与 ShortcutView 相同的属性

## 与现有组件集成

新的快捷选择组件可以无缝集成到现有的日期输入组件中：

```tsx
// 在 InputDate 组件中使用
<Popover>
  <PopoverTrigger>
    <Input />
  </PopoverTrigger>
  <PopoverContent>
    <div className="flex">
      <ShortcutView shortcuts={dateShortcuts} onSelect={handleShortcutSelect} />
      <Calendar />
    </div>
  </PopoverContent>
</Popover>
```

这样就可以完全复用快捷选择逻辑，避免代码重复。
