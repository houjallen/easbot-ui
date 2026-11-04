# Date 视图组件

> `src/ui/date/view/` 提供的可自由拼装的日历 / 时间 / 快捷选择面板 —— 12 个视图组件 + 1 个视图切换头部。

---

**导入**

```tsx
import {
  ViewSelectorHeader,
  DayView,
  DayRangeView,
  MonthView,
  MonthRangeView,
  YearView,
  YearRangeView,
  QuarterView,
  QuarterRangeView,
  TimeView,
  TimeRangeView,
  ShortcutView,
  ShortcutRangeView,
  CombinedShortcutView,
} from '@easbot/ui';
```

> 本篇是 [Date 总览页](./date.md) 的子页。工具函数与 Hook 见 [工具函数与 Hook 篇](./date-utils.md)。

## 基础用法

视图组件是**纯展示 + 回调**的受控组件 —— 它们不持有选中状态（`DayRangeView` 除外），全部由消费方通过 props 传入：

```tsx
import { useState } from 'react';
import dayjs from 'dayjs';
import { DayView, ViewSelectorHeader } from '@easbot/ui';
import type { ViewMode } from '@easbot/ui';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('days');
  const [viewDate, setViewDate] = useState(dayjs());
  const [selected, setSelected] = useState<dayjs.Dayjs>();

  return (
    <div className="w-72 rounded-lg border">
      <ViewSelectorHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        viewDate={viewDate}
        onViewDateChange={setViewDate}
      />
      {viewMode === 'days' && (
        <DayView viewDate={viewDate} selectedDate={selected} onSelect={setSelected} />
      )}
    </div>
  );
}
```

## 视图组件总览

| 组件                   | 视图粒度              | 选择模型 | 网格布局                                  | 快捷选择区 |
| ---------------------- | --------------------- | -------- | ----------------------------------------- | ---------- |
| `DayView`              | 日                    | 单选     | `react-day-picker` 日历                   | —          |
| `DayRangeView`         | 日                    | 范围     | `react-day-picker` 日历（`mode="range"`） | —          |
| `MonthView`            | 月                    | 单选     | 3 列 × 4 行                               | —          |
| `MonthRangeView`       | 月                    | 范围     | 3 列 × 4 行                               | —          |
| `YearView`             | 年（12 年一屏）       | 单选     | 3 列 × 4 行                               | —          |
| `YearRangeView`        | 年（12 年一屏）       | 范围     | 3 列 × 4 行                               | —          |
| `QuarterView`          | 季度                  | 单选     | 2 列 × 2 行                               | —          |
| `QuarterRangeView`     | 季度                  | 范围     | 2 列 × 2 行                               | —          |
| `TimeView`             | 时 / 分 / 秒          | 单选     | 3 个滚动列                                | —          |
| `TimeRangeView`        | 时 / 分 / 秒          | 范围     | 左右两组 3 列                             | —          |
| `ShortcutView`         | 快捷项（单选）        | —        | 纵向按钮列表                              | ✅         |
| `ShortcutRangeView`    | 快捷项（范围）        | —        | 纵向按钮列表                              | ✅         |
| `CombinedShortcutView` | 快捷项（单选 + 范围） | —        | 两组纵向按钮列表                          | ✅         |
| `ViewSelectorHeader`   | 翻页 + 视图切换       | —        | 头部条                                    | —          |

## 单选视图 vs 范围视图

**单选视图**（`DayView` / `MonthView` / `YearView` / `QuarterView` / `TimeView`）：

- 只有一个 `onSelect(date: Dayjs)` 回调。
- `selectedDate` 命中项用 `variant="default"`（主色实心）渲染。
- **当前月 / 当前年 / 当前季度**（未选中时）用 `ring-1 ring-primary/50` 标记。
- 被禁用的项用 `disabled` + `opacity-40`。

**范围视图**（`DayRangeView` / `MonthRangeView` / `YearRangeView` / `QuarterRangeView` / `TimeRangeView`）：

- 有 `onStartSelect` / `onEndSelect` 两个回调。
- 起止项用 `variant="default"`，**区间内的项**用 `variant="secondary"` + `bg-primary/10`。
- 起止项右上角有**圆形角标**标记（文案来自 `locale.rangeMarkers`，zh-CN 为 `始` / `终`，en-US 为 `S` / `E`）。
- **自动交换**：若点击的结束项早于开始项，组件会**交换**两者（先 `onEndSelect(旧的开始)` 再 `onStartSelect(新的开始)`）。
- 已选完一整段后再次点击 → **开始新一轮选择**（`onStartSelect` 重置起点）。

## `ViewSelectorHeader`（视图切换头部）

所有选择器的顶部条，负责**翻页**与**视图上钻**：

```tsx
<ViewSelectorHeader
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  viewDate={viewDate}
  onViewDateChange={setViewDate}
  selectedDate={selected}
  minDate={minDate}
  maxDate={maxDate}
  showTimeView={showTimeView}
  showQuarterView={showQuarterView}
/>
```

| `viewMode`   | 翻页步长 | 标题文案                       | 标题点击后上钻到 |
| ------------ | -------- | ------------------------------ | ---------------- |
| `'days'`     | ± 1 个月 | `2026年11月` / `November 2026` | `'months'`       |
| `'months'`   | ± 1 年   | `2026年` / `2026`              | `'years'`        |
| `'quarters'` | ± 1 年   | `2026年` / `2026`              | `'years'`        |
| `'years'`    | ± 12 年  | `2024 - 2035`                  | 不可上钻         |
| `'time'`     | —        | —                              | 不可上钻         |

> 📌 **标题格式随语言变化**：中文用 `YYYY年` / `YYYY年MM月`（来自内置 `date` 文案域的 `formatPatterns`），英文用 date-fns 风格的 `MMMM YYYY` / `YYYY`。英文语言下 `months` / `quarters` 视图的标题**只显示年份**（不带月份）。

**边界禁用**：传了 `minDate` / `maxDate` 时，源码按视图模式计算能否继续翻页 —— `years` 视图按 12 年分组的首尾年份比较，`months` / `quarters` 按年份比较，`days` 按月份比较。到达边界时对应箭头按钮被 `disabled`。

## `DayView` / `DayRangeView`

基于 `react-day-picker` v10 的 `Calendar` 封装：

```tsx
<DayView
  viewDate={viewDate}
  selectedDate={selected}
  onSelect={handleSelect}
  minDate={minDate}
  maxDate={maxDate}
  isValidDate={(d) => d.day() !== 0 && d.day() !== 6}
/>
```

- 传 `minDate` / `maxDate` → 按**天**比较（`isBefore(minDate, 'day')` / `isAfter(maxDate, 'day')`）。
- 传 `isValidDate` → 返回 `false` 的日期被禁用。
- **隐藏了 `react-day-picker` 自带的月份标题与翻页箭头**（`MonthCaption` 与 `Nav` 都被替换为空组件）—— 翻页由 `ViewSelectorHeader` 统一提供。**不要**单独使用 `DayView` 而不配 `ViewSelectorHeader`，否则用户无法翻月。

`DayRangeView` 额外：

- 内部维护 `selecting` 状态（`'start'` / `'end'`），并在顶部显示当前应选「开始日期」还是「结束日期」的提示。
- 顶部双列显示已选的开始 / 结束日期（`YYYY-MM-DD` 硬编码格式，不随语言变化）。
- 清除选择时（`onSelect` 收到 `undefined`）会把起止都重置为 `dayjs()`。

## `MonthView` / `YearView` / `QuarterView`

三个网格视图的实现高度相似：

| 组件          | 一屏内容                           | 列数 × 行数 | 每项高度 | 选中粒度                       |
| ------------- | ---------------------------------- | ----------- | -------- | ------------------------------ |
| `MonthView`   | 12 个月                            | 3 × 4       | `h-10`   | `startOf('month')`             |
| `YearView`    | 12 年（`viewDate` 所在 12 年分组） | 3 × 4       | `h-10`   | `startOf('year')`              |
| `QuarterView` | 4 个季度                           | 2 × 2       | `h-16`   | 季度起始月（`month((q-1)*3)`） |

- `YearView` 的年份分组算法：`Math.floor(viewDate.year() / 12) * 12` —— 即 **从 0 年起算的 12 年分组**（`0-11` / `12-23` / … / `2016-2027` / `2028-2039`），**不是**常规的「以 2000 / 2010 为界」的分组。
- `MonthView` / `YearView` 的选中判定**要求年份与 `viewDate` 相同**（`selectedDate.year() === viewDate.year()`），因此翻到别的年份后原选中项不再高亮。
- `QuarterView` 每项显示两行：季度名（`Q1`）+ 季度描述（中文 `1-3月`，英文 `Jan-Mar`）。
- 禁用判定粒度分别是「月」/「年」/「季度」：`minDate` / `maxDate` 比较时用 `isBefore(min, 'month')` 等对应单位。

## `TimeView` / `TimeRangeView`

三列滚动选择器（时 / 分 / 秒）：

```tsx
<TimeView
  selectedDate={selected}
  onSelect={handleSelect}
  showMinutes
  showSeconds
  timeConstraints={{ hours: { min: 9, max: 18 }, minutes: { step: 15 } }}
/>
```

- 每列是一个 `max-h-40 w-16 overflow-y-auto` 的滚动容器，选项是原生 `<button type="button">`。
- **数值补零显示**（`padStart(2, '0')`，如 `09` / `05`）。
- 选中项用 `bg-primary text-primary-foreground`。
- `showMinutes` 默认 `true`，`showSeconds` 默认 `false`（秒列不渲染）。
- **超出约束的选项根本不渲染**（不是禁用态）—— `timeConstraints.hours` 默认 `0~23`，`minutes` / `seconds` 默认 `0~59`，`step` 默认 `1`。
- **自动滚动到选中项**：组件挂载 / 选中值变化后延迟 **150ms** 执行滚动，把选中项定位到容器中央（按固定 28px 行高估算）。
- `TimeView` 未传 `selectedDate` 时以 `dayjs()`（当前时刻）为基准。
- `TimeRangeView` 左右各一组三列，中间有一条竖分隔线；两端都未选时以 `00:00:00` 为基准。

## `ShortcutView` / `ShortcutRangeView` / `CombinedShortcutView`

```tsx
<ShortcutView
  shortcuts={shortcuts}
  onSelect={(s) => console.log(s.label, s.value())}
  title="快捷选择"
  minWidth="min-w-28"
/>
```

| 组件                   | 快捷项类型                                 | 回调                                    | `minWidth` 默认 |
| ---------------------- | ------------------------------------------ | --------------------------------------- | --------------- |
| `ShortcutView`         | `DateShortcut[]`                           | `(shortcut: DateShortcut) => void`      | `'min-w-28'`    |
| `ShortcutRangeView`    | `DateRangeShortcut[]`                      | `(shortcut: DateRangeShortcut) => void` | `'min-w-28'`    |
| `CombinedShortcutView` | 两者（`dateShortcuts` + `rangeShortcuts`） | `onDateSelect` + `onRangeSelect`        | `'min-w-32'`    |

- **`show` 为 `false` 或列表为空时返回 `null`**（整个面板不渲染）。
- `CombinedShortcutView` 的 `mode` 控制显示哪一组：`'date'` / `'range'` / `'both'`（默认 `'both'`）；两组都为空时同样返回 `null`。
- `CombinedShortcutView` 的**主标题仅在显式传 `title` 时渲染**（不传则不显示标题行）；`dateTitle` / `rangeTitle` 缺省分别为 `locale.viewModes.day` 与 `locale.placeholderRange`。
- 快捷项本身是 `Button variant="ghost" size="sm"`，点击后由消费方的 `onSelect` 决定行为（内置选择器收到后通常直接关闭弹层）。

### 自定义快捷项

```tsx
import type { DateShortcut, DateRangeShortcut } from '@easbot/ui';

const dateShortcuts: DateShortcut[] = [
  { label: '今天', value: () => new Date() },
  { label: '30 天前', value: () => new Date(Date.now() - 30 * 86400000) },
];

const rangeShortcuts: DateRangeShortcut[] = [
  {
    label: '最近 7 天',
    value: () => [new Date(Date.now() - 6 * 86400000), new Date()],
  },
];
```

- `DateShortcut.value()` 返回 `Date`；`DateRangeShortcut.value()` 返回 `[Date, Date]`。
- `value` 是**函数**而非固定值 —— 每次点击都会重新求值（内置快捷项正是靠这一点实现「今天」的动态性）。

## 属性

## 属性

| 属性            | 类型                       | 默认值 | 说明 |
| --------------- | -------------------------- | ------ | ---- |
| `viewDate`      | `Dayjs`                    | —      | —    |
| `selectedDate?` | `Dayjs`                    | —      | —    |
| `onSelect`      | `(date: Dayjs) => void`    | —      | —    |
| `minDate?`      | `Dayjs`                    | —      | —    |
| `maxDate?`      | `Dayjs`                    | —      | —    |
| `isValidDate?`  | `(date: Dayjs) => boolean` | —      | —    |
| `className?`    | `string`                   | —      | —    |

## 属性

| 属性                 | 类型                       | 默认值 | 说明 |
| -------------------- | -------------------------- | ------ | ---- |
| `viewDate`           | `Dayjs`                    | —      | —    |
| `selectedStartDate?` | `Dayjs`                    | —      | —    |
| `selectedEndDate?`   | `Dayjs`                    | —      | —    |
| `onStartSelect`      | `(date: Dayjs) => void`    | —      | —    |
| `onEndSelect`        | `(date: Dayjs) => void`    | —      | —    |
| `minDate?`           | `Dayjs`                    | —      | —    |
| `maxDate?`           | `Dayjs`                    | —      | —    |
| `isValidDate?`       | `(date: Dayjs) => boolean` | —      | —    |
| `className?`         | `string`                   | —      | —    |

## 属性

| 属性               | 类型                       | 默认值  | 说明                                     |
| ------------------ | -------------------------- | ------- | ---------------------------------------- |
| `viewMode`         | `ViewMode`                 | —       | —                                        |
| `onViewModeChange` | `(mode: ViewMode) => void` | —       | —                                        |
| `viewDate`         | `Dayjs`                    | —       | —                                        |
| `onViewDateChange` | `(date: Dayjs) => void`    | —       | —                                        |
| `minDate?`         | `Dayjs`                    | —       | —                                        |
| `maxDate?`         | `Dayjs`                    | —       | —                                        |
| `showTimeView?`    | `boolean`                  | `false` | 开启后标题可从「年」进入「时间」视图     |
| `showQuarterView?` | `boolean`                  | `false` | 开启后标题从「月」进入「季度」而非「年」 |
| `className?`       | `string`                   | —       | —                                        |

> 📌 `selectedDate` / `isValidDate` 已从 `ViewSelectorHeaderProps` 中移除 ——
> 视图头部**不持有选中状态**，日期校验请传给 `MonthView` / `YearView` / `QuarterView` 的 `isValidDate`。

## 属性

继承自 `Omit<BaseViewProps, 'viewDate' | 'minDate' | 'maxDate'>`。

| 属性               | 类型              | 默认值 | 说明 |
| ------------------ | ----------------- | ------ | ---- |
| `showMinutes?`     | `boolean`         | —      | —    |
| `showSeconds?`     | `boolean`         | —      | —    |
| `timeConstraints?` | `TimeConstraints` | —      | —    |

## 属性

继承自 `Omit<BaseRangeViewProps, 'viewDate' | 'minDate' | 'maxDate'>`。

| 属性               | 类型              | 默认值 | 说明 |
| ------------------ | ----------------- | ------ | ---- |
| `showMinutes?`     | `boolean`         | —      | —    |
| `showSeconds?`     | `boolean`         | —      | —    |
| `timeConstraints?` | `TimeConstraints` | —      | —    |
| `separator?`       | `string`          | —      | —    |

## 属性

| 属性         | 类型      | 默认值 | 说明             |
| ------------ | --------- | ------ | ---------------- |
| `show?`      | `boolean` | —      | 是否显示快捷选择 |
| `className?` | `string`  | —      | 额外的 CSS 类名  |
| `title?`     | `string`  | —      | 标题             |
| `minWidth?`  | `string`  | —      | 最小宽度         |

## 属性

继承自 `BaseShortcutViewProps`。

| 属性        | 类型                               | 默认值 | 说明         |
| ----------- | ---------------------------------- | ------ | ------------ |
| `shortcuts` | `DateShortcut[]`                   | —      | 快捷选择选项 |
| `onSelect`  | `(shortcut: DateShortcut) => void` | —      | 选择回调     |

## 属性

继承自 `BaseShortcutViewProps`。

| 属性        | 类型                                    | 默认值 | 说明         |
| ----------- | --------------------------------------- | ------ | ------------ |
| `shortcuts` | `DateRangeShortcut[]`                   | —      | 快捷选择选项 |
| `onSelect`  | `(shortcut: DateRangeShortcut) => void` | —      | 选择回调     |

## 属性

继承自 `BaseShortcutViewProps`。

| 属性              | 类型                                    | 默认值 | 说明                 |
| ----------------- | --------------------------------------- | ------ | -------------------- |
| `dateShortcuts?`  | `DateShortcut[]`                        | —      | 单选快捷选择选项     |
| `rangeShortcuts?` | `DateRangeShortcut[]`                   | —      | 范围选择快捷选择选项 |
| `onDateSelect?`   | `(shortcut: DateShortcut) => void`      | —      | 单选选择回调         |
| `onRangeSelect?`  | `(shortcut: DateRangeShortcut) => void` | —      | 范围选择回调         |
| `dateTitle?`      | `string`                                | —      | 分组标题             |
| `rangeTitle?`     | `string`                                | —      | —                    |
| `mode?`           | `'date' \| 'range' \| 'both'`           | —      | 显示模式             |

> 📌 `TimeViewProps` 继承 `Omit<BaseViewProps, 'viewDate' | 'minDate' | 'maxDate'>` —— **没有 `viewDate`**（时间视图不翻页），也**不接受 `minDate` / `maxDate`**。`TimeRangeViewProps` 同理继承 `Omit<BaseRangeViewProps, 'viewDate' | 'minDate' | 'maxDate'>`。

## 无障碍

- 所有视图选项都是原生 `<button type="button">`，天然键盘可达（`Tab` 可聚焦）。
- `DayView` / `DayRangeView` 内部的日历网格由 `react-day-picker` v10 渲染，日期单元格带 `role="gridcell"` / `aria-selected`，月份标题带 `role="status"` + `aria-live="polite"`（详见 [Calendar 文档](../data-entry/calendar.md)）。
- **网格视图（年 / 月 / 季度）没有 `role="grid"` 语义** —— 它们是一组普通按钮，读屏会逐个念出「2026」「11月」等文本，但没有行列关系信息。
- **`ViewSelectorHeader` 的标题在不可上钻时被 `disabled`**（`time` / `years` 模式），读屏会播报「不可用」。
- **快捷选择项是 `Button`**，有可见文本（`shortcut.label`），读屏可正常朗读。
- **范围视图的起止角标是纯视觉**（圆形小徽标，内含 `始` / `终` 或 `S` / `E`），**没有 `aria-label`** —— 读屏只能读到角标内的单字。
- **时间选项没有 `aria-label`**，读屏读到的是补零后的数字（如「09」），不知晓这是「时」—— 列标题（`locale.timeUnits.hour` 等）是普通 `<span>`，**不是 `<label>`**，因此与选项列**无程序性关联**。
- **`DayRangeView` 的选择阶段提示**（`selectionHints.selectStartDate` / `selectEndDate`）是普通 `<p>`，**没有 `aria-live`** —— 切换到「请选择结束日期」时读屏不会播报。
- **组件库不管理焦点**：切换视图后焦点不会自动落到新视图。

## 注意事项

- **视图组件不持有选中状态**（`DayRangeView` 除外，它只持有「正在选开始还是结束」的阶段状态）—— 必须由消费方持有 `selectedDate` / `selectedStartDate` / `selectedEndDate` 并回传。
- **`DayView` 单独使用会「无法翻月」**：源码刻意隐藏了 `react-day-picker` 自带的 `MonthCaption` 与 `Nav`（后者在 `MonthCaption` 为空时会飘到两侧且点击失效），翻页**必须**由 `ViewSelectorHeader` 提供。
- **`react-day-picker` v10 的组件键是 `MonthCaption`**（v9 及更早叫 `Caption`）—— 源码已按 v10 写死。
- **`DayView` 的 `selectedDate` 需要是 `viewDate` 所在月份内的日期**，否则日历不会显示高亮。
- **`YearView` 的 12 年分组从 0 年起算**：`Math.floor(year / 12) * 12` —— 2026 年所在分组是 `2016 - 2027`（与直觉中的「2024-2035」不同）。
- **`YearView` / `MonthView` 的选中判定含年份比较**：翻年后原选中项不再高亮（这是有意为之，避免「在 2025 年选中 5 月，翻到 2026 年仍高亮 5 月」的歧义）。
- **`QuarterView` 依赖 `dayjs/plugin/quarterOfYear`**（源码在模块顶层 `dayjs.extend(quarterOfYear)`）。
- **`TimeView` 的 `timeConstraints` 会改变渲染的选项数量** —— 例如 `minutes: { step: 15 }` 时只渲染 `00 / 15 / 30 / 45`。
- **`TimeView` 的滚动定位按固定 28px 行高估算**，与实际渲染高度不符时会偏移（源码中的注释已说明这是估算值）。
- **`TimeView` 的滚动有 150ms 延迟**：弹层刚打开瞬间列表还没定位到选中项。
- **`TimeRangeView` 的 `separator` 属性未被渲染**：类型上声明了 `separator?`，但组件**从不使用**它（起止两端是左右分栏显示，不靠分隔符连接）。
- **`ShortcutView` 的容器宽度自适应内容**（`w-fit` + `flex flex-col`）：英文长文案（如 "This Quarter Start"）能撑开容器，不会溢出；`minWidth` 只是下限。
- **`ShortcutView` / `ShortcutRangeView` 的 `minWidth` 必须是 Tailwind 的 `min-w-*` 类**（如 `'min-w-28'`）—— 源码把它直接放进 `cn()`。
- **`CombinedShortcutView` 的 `title` 缺省也有值**（`locale.shortcuts.title`），但**只有显式传 `title` 时才渲染标题行** —— 不传 `title` 则该行的标题不显示（分组小标题仍然显示）。
- **`ViewSelectorHeader` 的标题点击导航受 `showQuarterView` / `showTimeView` 约束**：`days → months`；`months → quarters`（开启 `showQuarterView` 时）或 `→ years`；`quarters → years`；`years → time`（需开启 `showTimeView`）。`years` 视图仅在开启 `showTimeView` 后标题才可点击。
- **`ViewSelectorHeader` 不再接受 `selectedDate` / `isValidDate`**：这两个 prop 已从 `ViewSelectorHeaderProps` 中移除 —— 视图头部不持有选中状态，日期校验请传给 `MonthView` / `YearView` / `QuarterView` 的 `isValidDate`。
- **类名合并到末位**，自定义类名优先级最高。

## 导出

### 组件

| 导出名                      | 说明 |
| --------------------------- | ---- |
| `BaseRangeViewProps`        |      |
| `BaseShortcutViewProps`     |      |
| `BaseViewProps`             |      |
| `CombinedShortcutView`      |      |
| `CombinedShortcutViewProps` |      |
| `DATE_FORMATS`              |      |
| `DatePicker`                |      |
| `DatePickerLocale`          |      |
| `DatePickerProps`           |      |
| `DateRangeShortcut`         |      |
| `DateShortcut`              |      |
| `DayRangeView`              |      |
| `DayView`                   |      |
| `EmbeddedDatePicker`        |      |
| `EmbeddedDatePickerProps`   |      |
| `EnhancedDatePicker`        |      |
| `EnhancedDatePickerProps`   |      |
| `FormatResult`              |      |
| `InputDate`                 |      |
| `InputDateProps`            |      |
| `InputDateRange`            |      |
| `InputDateRangeProps`       |      |
| `InputDateTime`             |      |
| `InputDateTimeProps`        |      |
| `InputDateTimeRange`        |      |
| `InputTime`                 |      |
| `InputTimeProps`            |      |
| `InputTimeRange`            |      |
| `InputTimeRangeProps`       |      |
| `MonthRangeView`            |      |
| `MonthView`                 |      |
| `ParseResult`               |      |
| `QuarterRangeView`          |      |
| `QuarterView`               |      |
| `ShortcutRangeView`         |      |
| `ShortcutRangeViewProps`    |      |
| `ShortcutView`              |      |
| `ShortcutViewProps`         |      |
| `TimeConstraints`           |      |
| `TimeRangeView`             |      |
| `TimeRangeViewProps`        |      |
| `TimeView`                  |      |
| `TimeViewProps`             |      |
| `ViewComponentStructure`    |      |
| `ViewMode`                  |      |
| `ViewSelectorHeader`        |      |
| `ViewSelectorHeaderProps`   |      |
| `YearRangeView`             |      |
| `YearView`                  |      |

### 类型与工具函数

| 导出名                     | 说明 |
| -------------------------- | ---- |
| `combineDisabledDate`      |      |
| `commonDisabledDates`      |      |
| `createDateRangeShortcuts` |      |
| `createDateShortcuts`      |      |
| `createTimeShortcuts`      |      |
| `dateCalculations`         |      |
| `dateComparisons`          |      |
| `detectDateFormat`         |      |
| `enUS`                     |      |
| `getDateFormats`           |      |
| `getDatePickerLocale`      |      |
| `localeMap`                |      |
| `safeDateFormat`           |      |
| `safeDateParse`            |      |
| `smartDateParse`           |      |
| `useDateCache`             |      |
| `useDateComparisons`       |      |
| `useDatePickerFormatters`  |      |
| `useDatePickerLocale`      |      |
| `useDateSuggestions`       |      |
| `useDateValidation`        |      |
| `useDateVirtualization`    |      |
| `useDebouncedDateInput`    |      |
| `validateDateRange`        |      |
| `zhCN`                     |      |
