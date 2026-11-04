# Date 日期时间选择

> 基于 `dayjs` + `react-day-picker` v10 的日期时间选择组件族，包含 7 个输入组件、3 个选择器壳、12 个视图组件与一批工具函数 / Hook。

---

**导入**

```tsx
import {
  InputDate,
  InputTime,
  InputDateTime,
  InputDateRange,
  InputTimeRange,
  InputDateTimeRange,
  DatePicker,
} from '@easbot/ui';
```

> 本篇是**总览页**。视图组件（`DayView` / `MonthView` / `YearView` / `QuarterView` / `TimeView` / `ShortcutView` 等）见 [视图组件篇](./date-views.md)；工具函数与 Hook（`date-utils` / `validation` / `shortcuts` / `timezone-utils` / `mobile-utils` / `locale` / `hooks`）见 [工具函数与 Hook 篇](./date-utils.md)。

## 基础用法

`InputDate` —— 单个日期输入（输入框 + 弹层选择器）：

```tsx
import { useState } from 'react';
import { InputDate } from '@easbot/ui';

export default function App() {
  const [date, setDate] = useState<string>();

  return <InputDate value={date} onChange={setDate} placeholder="请选择日期" />;
}
```

`InputTime` —— 单个时间输入：

```tsx
import { InputTime } from '@easbot/ui';

<InputTime value={time} onChange={setTime} showSeconds />;
```

`InputDateTime` —— 日期 + 时间（弹层内分「日期 / 时间」两个标签页）：

```tsx
import { InputDateTime } from '@easbot/ui';

<InputDateTime value={dateTime} onChange={setDateTime} />;
```

`InputDateRange` —— 日期范围（左右双列，各自独立选）：

```tsx
import { InputDateRange } from '@easbot/ui';

<InputDateRange value={range} onChange={setRange} separator=" ~ " />;
```

`InputTimeRange` —— 时间范围：

```tsx
import { InputTimeRange } from '@easbot/ui';

<InputTimeRange value={timeRange} onChange={setTimeRange} />;
```

`InputDateTimeRange` —— 日期时间范围（左右各嵌一个 `InputDateTime`）：

```tsx
import { InputDateTimeRange } from '@easbot/ui';

<InputDateTimeRange value={dtRange} onChange={setDtRange} />;
```

`DatePicker` —— 按钮式选择器（不是输入框）：

```tsx
import { DatePicker } from '@easbot/ui';

<DatePicker selected={date} onSelect={setDate} />;
```

## 组件选型表

| 场景                                               | 组件                 | 值类型             | 回调签名                                         |
| -------------------------------------------------- | -------------------- | ------------------ | ------------------------------------------------ |
| 表单里的单个日期                                   | `InputDate`          | `string \| Date`   | `(value: string \| undefined) => void`           |
| 表单里的单个时间                                   | `InputTime`          | `string`           | `(value: string \| undefined) => void`           |
| 表单里的单个日期时间                               | `InputDateTime`      | `string \| Date`   | `(value: string \| undefined) => void`           |
| 表单里的日期范围                                   | `InputDateRange`     | `[string, string]` | `(value: [string, string] \| undefined) => void` |
| 表单里的时间范围                                   | `InputTimeRange`     | `[string, string]` | `(value: [string, string] \| undefined) => void` |
| 表单里的日期时间范围                               | `InputDateTimeRange` | `[Date?, Date?]`   | `(value: [Date?, Date?]) => void`                |
| 只读展示 / 按钮触发弹层的日期选择                  | `DatePicker`         | `Date`             | `(date: Date \| undefined) => void`              |
| 需要多视图（日 / 月 / 年 / 季度 / 时间）+ 确认模式 | `EnhancedDatePicker` | `Date`             | `(date: Date \| undefined) => void`              |
| 需要**内嵌**（无弹层）的选择面板                   | `EmbeddedDatePicker` | `Date`             | `(date: Date \| undefined) => void`              |

**关键差异**：

- **7 个 `Input*` 组件**的值都是**字符串**（`InputDateRange` / `InputTimeRange` 是 `[string, string]`），只有 `InputDateTimeRange` 用 `Date` 对象。
- `InputDate` / `InputTime` / `InputDateTime` 在**手动输入可解析时立即触发** `onChange`；范围类组件解析失败时**不触发**，等到失焦才处理。
- `DatePicker` / `EnhancedDatePicker` / `EmbeddedDatePicker` 用的是 `Date` 对象。

## 三种选择模式（`mode`）

`InputDate` / `InputDateRange` / `DatePicker` 支持 `mode`：

| mode            | 初始视图 | 交互行为                                               |
| --------------- | -------- | ------------------------------------------------------ |
| `'day'`（默认） | `days`   | 年 → 月 → 日逐级下钻；**在日视图选中即返回**并关闭弹层 |
| `'month'`       | `months` | 年 → 月逐级下钻；**在月视图选中即返回**并关闭弹层      |
| `'year'`        | `years`  | **在年视图选中即返回**并关闭弹层                       |

> 📌 **`InputDate` 的快捷选择区只在 `mode === 'day'` 时渲染** —— 月 / 年模式下弹层里没有左侧快捷栏。

## `disabledDate` 的视图粒度语义

`disabledDate`（以及内部的 `isValidDate`）在**不同视图粒度**下收到的日期**不同** ——
组件会先把日期**归一到该粒度的起点**（尾部清零），再交给回调判定：

| 当前视图 | 传给回调的日期                | 说明                          |
| -------- | ----------------------------- | ----------------------------- |
| 日视图   | 当天 `00:00:00`               | `startOf('day')`              |
| 月视图   | 当月 **1 日** `00:00:00`      | `startOf('month')`            |
| 季度视图 | 季度首月 **1 日** `00:00:00`  | `startOf('month')` + 季度首月 |
| 年视图   | 当年 **1 月 1 日** `00:00:00` | `startOf('year')`             |

> 📌 **为什么要归零**：dayjs 的 `month()` / `year()` **保留原 `viewDate` 的日与时分秒**。
> 若不归零，当 `viewDate` 是 3 月 20 日时，判定 1 月实际传入的是「1 月 20 日」——
> 消费方写 `d.month() === 0`（只允许 1 月）会因为粒度错位而**误禁用 1 月**。

```tsx
// ✅ 推荐：按粒度判定 —— 归零后语义天然对齐
<InputDate mode="month" disabledDate={(d) => d.month() === 0} />   // 只允许 1 月
<InputDate mode="year" disabledDate={(d) => d.year() === 2024} />  // 只允许 2024 年

// ⚠️ 依赖具体日期的写法需复核
<InputDate mode="month" disabledDate={(d) => d.date() === 20} />
// 收到的是「1 日」而非「20 日」；要「每月 20 日不可选」请用日视图或在回调内自行判断
```

> 📌 该语义由 `truncateToGranularity(date, granularity)` 统一承载（已从 `src/ui/date/view/granularity.ts` 导出，
> 但**未从包根 barrel 导出**）。
> 详见 [ADR 0001 · BC-2](../../../decisions/0001-src-ui-defect-remediation.md)。

## 视图切换头部（`ViewSelectorHeader`）

所有选择器顶部都有一条「视图切换头部」，由 `ViewSelectorHeader` 提供：

- **左右箭头**：按当前视图模式翻页 —— `days` 翻 1 个月、`months` / `quarters` 翻 1 年、`years` 翻 12 年。
- **中间标题**：点击可**逐级上钻**（日 → 月 → 年；月 → 年；季度 → 年）。`time` 模式标题不可点击。
- **边界控制**：传了 `minDate` / `maxDate` 时，到达边界的一侧箭头会被禁用。

## 快捷选择

`InputDate` / `InputDateTime` / `DatePicker` / `EnhancedDatePicker` / `EmbeddedDatePicker` 都支持 `showShortcuts`（默认 `true`）与自定义 `shortcuts`。

默认快捷项由内部的 `useDefaultDateShortcuts()`（随当前语言生成，**该 Hook 未从包根导出**）提供：今天 / 昨天 / 明天 / 本周开始 / 本月开始 / 本季度开始 / 今年开始。需要同样的文案，可用已导出的 `createDateShortcuts(locale)` 自行生成（见 [工具函数与 Hook 篇](./date-utils.md)）。

```tsx
import { InputDate } from '@easbot/ui';
import type { DateShortcut } from '@easbot/ui';

const shortcuts: DateShortcut[] = [
  { label: '最近 7 天', value: () => new Date(Date.now() - 6 * 86400000) },
];

<InputDate shortcuts={shortcuts} />;
```

> `DateShortcut` 的类型在包根导出清单中记录为 `type DateShortcut`（即**类型导出**，非值导出）—— `import type { DateShortcut } from '@easbot/ui'` 可用。

## 确认模式

`EnhancedDatePicker` / `EmbeddedDatePicker` 支持 `requireConfirm`：

```tsx
<EnhancedDatePicker
  value={date}
  onChange={setDate}
  requireConfirm
  onConfirm={(d) => console.log('确认', d)}
  onCancel={() => console.log('取消')}
/>
```

开启后，选中操作只写入内部临时值，**必须**点击「确认」才触发 `onChange` + `onConfirm`；「取消」恢复原值并触发 `onCancel`。

## 时间约束

`timeConstraints` 统一约束时 / 分 / 秒的可选范围：

```tsx
<InputDateTime
  timeConstraints={{
    hours: { min: 9, max: 18 },
    minutes: { step: 15 },
    seconds: { min: 0, max: 30, step: 5 },
  }}
/>
```

- `hours` 默认 `0~23`，`minutes` / `seconds` 默认 `0~59`，`step` 默认 `1`。
- 约束通过 `TimeView` 生效 —— 超出范围的选项**根本不渲染**（不是禁用态）。

## 国际化

组件库内置 `date` 文案域（zh-CN + en-US），语言来源优先级：

```
组件 locale prop  >  LocaleProvider 注入  >  默认 zh-CN
```

- `EnhancedDatePicker` 支持 `locale` prop（宽松 `string`，内部经 `resolveLocale` 收敛为 `'zh-CN' | 'en-US'`）。
- 其余组件不接 `locale` prop，跟随 `LocaleProvider`。
- 日期**显示格式**随语言变化：中文用 `YYYY年MM月DD日`，英文用 `MM/DD/YYYY`（见 `DatePickerLocale.formats`）。

```tsx
import { LocaleProvider } from '@easbot/ui';

<LocaleProvider locale="en-US">
  <InputDate />
</LocaleProvider>;
```

## 属性

### 输入组件

## 属性

| 属性                   | 类型                                     | 默认值 | 说明                                            |
| ---------------------- | ---------------------------------------- | ------ | ----------------------------------------------- |
| `value?`               | `string \| Date`                         | —      | 日期值                                          |
| `onChange?`            | `(value: string \| undefined) => void`   | —      | 值变化回调                                      |
| `placeholder?`         | `string`                                 | —      | 占位符文本                                      |
| `format?`              | `string`                                 | —      | 日期格式                                        |
| `disabled?`            | `boolean`                                | —      | 是否禁用                                        |
| `readOnly?`            | `boolean`                                | —      | 是否只读                                        |
| `error?`               | `boolean`                                | —      | 错误状态                                        |
| `errorMessage?`        | `string`                                 | —      | 错误信息                                        |
| `validate?`            | `(value: string) => string \| undefined` | —      | 验证函数                                        |
| `disabledDate?`        | `(date: Date) => boolean`                | —      | 禁用的日期判断函数                              |
| `showShortcuts?`       | `boolean`                                | —      | 是否显示快捷选择                                |
| `shortcuts?`           | `DateShortcut[]`                         | —      | 自定义快捷选择选项                              |
| `mode?`                | `'day' \| 'month' \| 'year'`             | —      | 选择模式：day=日选择，month=月选择，year=年选择 |
| `className?`           | `string`                                 | —      | 额外的 CSS 类名                                 |
| `name?`                | `string`                                 | —      | 输入框名称                                      |
| `required?`            | `boolean`                                | —      | 是否必填                                        |
| `popoverContentStyle?` | `React.CSSProperties`                    | —      | 弹层内容的自定义样式                            |

## 属性

| 属性                   | 类型                                   | 默认值 | 说明                 |
| ---------------------- | -------------------------------------- | ------ | -------------------- |
| `value?`               | `string`                               | —      | 时间值               |
| `onChange?`            | `(value: string \| undefined) => void` | —      | 值变化回调           |
| `placeholder?`         | `string`                               | —      | 占位符文本           |
| `format?`              | `string`                               | —      | 时间格式             |
| `disabled?`            | `boolean`                              | —      | 是否禁用             |
| `readOnly?`            | `boolean`                              | —      | 是否只读             |
| `error?`               | `boolean`                              | —      | 错误状态             |
| `showMinutes?`         | `boolean`                              | —      | 是否显示分钟         |
| `showSeconds?`         | `boolean`                              | —      | 是否显示秒           |
| `timeConstraints?`     | `TimeConstraints`                      | —      | 时间约束             |
| `className?`           | `string`                               | —      | 额外的 CSS 类名      |
| `name?`                | `string`                               | —      | 输入框名称           |
| `required?`            | `boolean`                              | —      | 是否必填             |
| `popoverContentStyle?` | `React.CSSProperties`                  | —      | 弹层内容的自定义样式 |

## 属性

| 属性                   | 类型                                                                                                                                                                     | 默认值 | 说明                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------------------- |
| `value?`               | `string \| Date`                                                                                                                                                         | —      | 日期时间值           |
| `onChange?`            | `(value: string \| undefined) => void`                                                                                                                                   | —      | 值变化回调           |
| `placeholder?`         | `string`                                                                                                                                                                 | —      | 占位符文本           |
| `format?`              | `string`                                                                                                                                                                 | —      | 日期时间格式         |
| `disabled?`            | `boolean`                                                                                                                                                                | —      | 是否禁用             |
| `readOnly?`            | `boolean`                                                                                                                                                                | —      | 是否只读             |
| `error?`               | `boolean`                                                                                                                                                                | —      | 错误状态             |
| `errorMessage?`        | `string`                                                                                                                                                                 | —      | 错误信息             |
| `validate?`            | `(value: string) => string \| undefined`                                                                                                                                 | —      | 验证函数             |
| `disabledDate?`        | `(date: Date) => boolean`                                                                                                                                                | —      | 禁用的日期判断函数   |
| `showShortcuts?`       | `boolean`                                                                                                                                                                | —      | 是否显示快捷选择     |
| `shortcuts?`           | `DateShortcut[]`                                                                                                                                                         | —      | 自定义快捷选择选项   |
| `showSeconds?`         | `boolean`                                                                                                                                                                | —      | 是否显示秒           |
| `timeConstraints?`     | `{ hours?: { min: number; max: number; step?: number }; minutes?: { min: number; max: number; step?: number }; seconds?: { min: number; max: number; step?: number }; }` | —      | 时间约束             |
| `className?`           | `string`                                                                                                                                                                 | —      | 额外的 CSS 类名      |
| `name?`                | `string`                                                                                                                                                                 | —      | 输入框名称           |
| `required?`            | `boolean`                                                                                                                                                                | —      | 是否必填             |
| `popoverContentStyle?` | `React.CSSProperties`                                                                                                                                                    | —      | 弹层内容的自定义样式 |

## 属性

| 属性                   | 类型                                             | 默认值 | 说明                       |
| ---------------------- | ------------------------------------------------ | ------ | -------------------------- |
| `value?`               | `[string, string] \| undefined`                  | —      | 日期范围值                 |
| `onChange?`            | `(value: [string, string] \| undefined) => void` | —      | 值变化回调                 |
| `placeholder?`         | `string`                                         | —      | 占位符文本                 |
| `format?`              | `string`                                         | —      | 日期格式                   |
| `mode?`                | `'day' \| 'month' \| 'year'`                     | —      | 选择器模式，控制选择的精度 |
| `disabled?`            | `boolean`                                        | —      | 是否禁用                   |
| `readOnly?`            | `boolean`                                        | —      | 是否只读                   |
| `error?`               | `boolean`                                        | —      | 错误状态                   |
| `disabledDate?`        | `(date: Date) => boolean`                        | —      | 禁用的日期判断函数         |
| `separator?`           | `string`                                         | —      | 分隔符                     |
| `className?`           | `string`                                         | —      | 额外的 CSS 类名            |
| `name?`                | `string`                                         | —      | 输入框名称                 |
| `required?`            | `boolean`                                        | —      | 是否必填                   |
| `popoverContentStyle?` | `React.CSSProperties`                            | —      | 弹层内容的自定义样式       |

## 属性

| 属性                   | 类型                                             | 默认值 | 说明                 |
| ---------------------- | ------------------------------------------------ | ------ | -------------------- |
| `value?`               | `[string, string] \| undefined`                  | —      | 时间范围值           |
| `onChange?`            | `(value: [string, string] \| undefined) => void` | —      | 值变化回调           |
| `placeholder?`         | `string`                                         | —      | 占位符文本           |
| `format?`              | `string`                                         | —      | 时间格式             |
| `disabled?`            | `boolean`                                        | —      | 是否禁用             |
| `readOnly?`            | `boolean`                                        | —      | 是否只读             |
| `error?`               | `boolean`                                        | —      | 错误状态             |
| `showMinutes?`         | `boolean`                                        | —      | 是否显示分钟         |
| `showSeconds?`         | `boolean`                                        | —      | 是否显示秒           |
| `timeConstraints?`     | `TimeConstraints`                                | —      | 时间约束             |
| `separator?`           | `string`                                         | —      | 分隔符               |
| `className?`           | `string`                                         | —      | 额外的 CSS 类名      |
| `name?`                | `string`                                         | —      | 输入框名称           |
| `required?`            | `boolean`                                        | —      | 是否必填             |
| `popoverContentStyle?` | `React.CSSProperties`                            | —      | 弹层内容的自定义样式 |

## 属性

| 属性                   | 类型                                                                                                                                                                     | 默认值 | 说明                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------------------- |
| `value?`               | `[Date?, Date?]`                                                                                                                                                         | —      | 日期时间范围值       |
| `onChange?`            | `(value: [Date?, Date?]) => void`                                                                                                                                        | —      | 值变化回调           |
| `placeholder?`         | `string`                                                                                                                                                                 | —      | 占位符文本           |
| `format?`              | `string`                                                                                                                                                                 | —      | 日期时间格式         |
| `disabled?`            | `boolean`                                                                                                                                                                | —      | 是否禁用             |
| `readOnly?`            | `boolean`                                                                                                                                                                | —      | 是否只读             |
| `error?`               | `boolean`                                                                                                                                                                | —      | 错误状态             |
| `errorMessage?`        | `string`                                                                                                                                                                 | —      | 错误信息             |
| `validate?`            | `(value: [Date?, Date?]) => string \| undefined`                                                                                                                         | —      | 验证函数             |
| `disabledDate?`        | `(date: Date) => boolean`                                                                                                                                                | —      | 禁用的日期判断函数   |
| `showSeconds?`         | `boolean`                                                                                                                                                                | —      | 是否显示秒           |
| `timeConstraints?`     | `{ hours?: { min: number; max: number; step?: number }; minutes?: { min: number; max: number; step?: number }; seconds?: { min: number; max: number; step?: number }; }` | —      | 时间约束             |
| `separator?`           | `string`                                                                                                                                                                 | —      | 分隔符               |
| `className?`           | `string`                                                                                                                                                                 | —      | 额外的 CSS 类名      |
| `name?`                | `string`                                                                                                                                                                 | —      | 输入框名称           |
| `required?`            | `boolean`                                                                                                                                                                | —      | 是否必填             |
| `popoverContentStyle?` | `React.CSSProperties`                                                                                                                                                    | —      | 弹层内容的自定义样式 |

### 选择器壳

## 属性

| 属性                   | 类型                                | 默认值 | 说明                                            |
| ---------------------- | ----------------------------------- | ------ | ----------------------------------------------- |
| `selected?`            | `Date`                              | —      | 选中的日期                                      |
| `onSelect?`            | `(date: Date \| undefined) => void` | —      | 日期选择回调                                    |
| `placeholder?`         | `string`                            | —      | 占位符文本                                      |
| `format?`              | `string`                            | —      | 日期格式                                        |
| `disabled?`            | `boolean`                           | —      | 是否禁用                                        |
| `disabledDate?`        | `(date: Date) => boolean`           | —      | 禁用的日期判断函数                              |
| `showShortcuts?`       | `boolean`                           | —      | 是否显示快捷选择                                |
| `shortcuts?`           | `DateShortcut[]`                    | —      | 自定义快捷选择选项                              |
| `mode?`                | `'day' \| 'month' \| 'year'`        | —      | 选择模式：day=日选择，month=月选择，year=年选择 |
| `className?`           | `string`                            | —      | 额外的 CSS 类名                                 |
| `popoverContentStyle?` | `React.CSSProperties`               | —      | 弹层内容的自定义样式                            |

## 属性

| 属性                | 类型                                                                                                                                                                     | 默认值 | 说明            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------- |
| `value?`            | `Date`                                                                                                                                                                   | —      | —               |
| `onChange?`         | `(date: Date \| undefined) => void`                                                                                                                                      | —      | —               |
| `format?`           | `string`                                                                                                                                                                 | —      | —               |
| `placeholder?`      | `string`                                                                                                                                                                 | —      | —               |
| `disabled?`         | `boolean`                                                                                                                                                                | —      | —               |
| `className?`        | `string`                                                                                                                                                                 | —      | —               |
| `popoverClassName?` | `string`                                                                                                                                                                 | —      | —               |
| `locale?`           | `string`                                                                                                                                                                 | —      | —               |
| `viewMode?`         | `ViewMode`                                                                                                                                                               | —      | // 视图模式相关 |
| `allowedViews?`     | `ViewMode[]`                                                                                                                                                             | —      | —               |
| `showTimeView?`     | `boolean`                                                                                                                                                                | —      | —               |
| `showQuarterView?`  | `boolean`                                                                                                                                                                | —      | —               |
| `timeConstraints?`  | `{ hours?: { min: number; max: number; step?: number }; minutes?: { min: number; max: number; step?: number }; seconds?: { min: number; max: number; step?: number }; }` | —      | // 时间约束     |
| `showSeconds?`      | `boolean`                                                                                                                                                                | —      | —               |
| `minDate?`          | `Date`                                                                                                                                                                   | —      | // 日期约束     |
| `maxDate?`          | `Date`                                                                                                                                                                   | —      | —               |
| `disabledDate?`     | `(date: Date) => boolean`                                                                                                                                                | —      | —               |
| `showShortcuts?`    | `boolean`                                                                                                                                                                | —      | // 快捷选择     |
| `shortcuts?`        | `DateShortcut[]`                                                                                                                                                         | —      | —               |
| `requireConfirm?`   | `boolean`                                                                                                                                                                | —      | // 确认模式     |
| `onConfirm?`        | `(date: Date) => void`                                                                                                                                                   | —      | —               |
| `onCancel?`         | `() => void`                                                                                                                                                             | —      | —               |

## 属性

| 属性               | 类型                                                                                                                                                                     | 默认值 | 说明            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------- |
| `value?`           | `Date`                                                                                                                                                                   | —      | —               |
| `onChange?`        | `(date: Date \| undefined) => void`                                                                                                                                      | —      | —               |
| `className?`       | `string`                                                                                                                                                                 | —      | —               |
| `viewMode?`        | `ViewMode`                                                                                                                                                               | —      | // 视图模式相关 |
| `allowedViews?`    | `ViewMode[]`                                                                                                                                                             | —      | —               |
| `showTimeView?`    | `boolean`                                                                                                                                                                | —      | —               |
| `showQuarterView?` | `boolean`                                                                                                                                                                | —      | —               |
| `timeConstraints?` | `{ hours?: { min: number; max: number; step?: number }; minutes?: { min: number; max: number; step?: number }; seconds?: { min: number; max: number; step?: number }; }` | —      | // 时间约束     |
| `showSeconds?`     | `boolean`                                                                                                                                                                | —      | —               |
| `minDate?`         | `Date`                                                                                                                                                                   | —      | // 日期约束     |
| `maxDate?`         | `Date`                                                                                                                                                                   | —      | —               |
| `disabledDate?`    | `(date: Date) => boolean`                                                                                                                                                | —      | —               |
| `showShortcuts?`   | `boolean`                                                                                                                                                                | —      | // 快捷选择     |
| `shortcuts?`       | `DateShortcut[]`                                                                                                                                                         | —      | —               |
| `isMobile?`        | `boolean`                                                                                                                                                                | —      | // 移动端适配   |
| `requireConfirm?`  | `boolean`                                                                                                                                                                | —      | // 确认模式     |
| `onConfirm?`       | `(date: Date) => void`                                                                                                                                                   | —      | —               |
| `onCancel?`        | `() => void`                                                                                                                                                             | —      | —               |

本表只列组件自有属性；此外 `Input*` 系列还会把**剩余属性透传给内部的 `Input`**（如 `id` / `onFocus` / `aria-*` / `data-*`）。

## 导出概览

> 完整导出清单（74 项）由 `src/ui/date/index.ts` 自动生成。下表按模块归类说明各导出的用途。

| 模块         | 主要导出                                                                                                                                                                                                                                                                         | 用途                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **输入组件** | `InputDate` / `InputTime` / `InputDateTime` / `InputDateRange` / `InputTimeRange` / `InputDateTimeRange`                                                                                                                                                                         | 表单场景的 6 个输入组件                                                       |
| **选择器壳** | `DatePicker` / `EnhancedDatePicker` / `EmbeddedDatePicker`                                                                                                                                                                                                                       | 按钮式 / 多视图 / 内嵌式三种选择器                                            |
| **视图组件** | `DayView` / `MonthView` / `YearView` / `QuarterView` / `TimeView` + 各自的 Range 版本 + `ShortcutView` / `ShortcutRangeView` / `CombinedShortcutView` / `ViewSelectorHeader`                                                                                                     | 可自由拼装的日历 / 时间 / 快捷选择面板 —— 详见 [视图组件篇](./date-views.md)  |
| **视图类型** | `ViewMode` / `BaseViewProps` / `BaseRangeViewProps` / `ViewSelectorHeaderProps` / `TimeConstraints` / `TimeViewProps` / `TimeRangeViewProps` / `BaseShortcutViewProps` / `ShortcutViewProps` / `ShortcutRangeViewProps` / `CombinedShortcutViewProps` / `ViewComponentStructure` | 视图层的类型契约                                                              |
| **快捷选择** | `DateShortcut` / `DateRangeShortcut` / `createDateShortcuts` / `createDateRangeShortcuts` / `createTimeShortcuts`                                                                                                                                                                | 快捷项类型与工厂函数                                                          |
| **国际化**   | `DatePickerLocale` / `zhCN` / `enUS` / `localeMap` / `getDatePickerLocale` / `useDatePickerLocale` / `useDatePickerFormatters`                                                                                                                                                   | 日期组件的文案配置与 Hook —— 详见 [工具函数与 Hook 篇](./date-utils.md)       |
| **工具函数** | `safeDateFormat` / `safeDateParse` / `validateDateRange` / `detectDateFormat` / `smartDateParse` / `combineDisabledDate` / `commonDisabledDates` / `dateCalculations` / `dateComparisons` / `DATE_FORMATS` / `getDateFormats` / `FormatResult` / `ParseResult`                   | 日期格式化 / 解析 / 校验 / 计算 —— 详见 [工具函数与 Hook 篇](./date-utils.md) |
| **Hook**     | `useDebouncedDateInput` / `useDateCache` / `useDateComparisons` / `useDateVirtualization` / `useDateSuggestions` / `useDateValidation`                                                                                                                                           | 性能优化与输入辅助 Hook —— 详见 [工具函数与 Hook 篇](./date-utils.md)         |

> ⚠️ **`src/ui/date/` 下还有 3 个模块未从包根导出**：`validation.ts`（`parseDate` / `validateDate` / `formatDate` / `validateTimeRange` / `normalizeInput` / `getFormatHint` / `formatInputOnType` 等）、`timezone-utils.ts`（`convertToTimezone` / `TimezoneConverter` / `useTimezone` 等）、`mobile-utils.ts`（`useIsMobile` / `useBreakpoint` / `detectMobileDevice` 等）。这些函数**不能**从 `@easbot/ui` import。

## 无障碍

- 所有 `Input*` 组件的输入框是**原生 `<input>`**（经 `Input` 组件渲染），天然键盘可达、可被读屏识别；`name` / `required` / `readOnly` / `disabled` 均为原生属性。
- 后缀图标（`calendar` / `clock`）是**纯装饰**（lucide 自带 `aria-hidden`），点击它只是打开弹层，键盘用户通过聚焦输入框 + `Enter` / `Space` 触发（`PopoverTrigger` 包裹整个输入区域）。
- 弹层由 Radix `Popover` 渲染，具备焦点陷阱、`Escape` 关闭与关闭后的焦点回收。
- 日历网格由 `react-day-picker` v10 渲染，日期单元格是原生 `<button type="button">`（详见 [Calendar 文档](../data-entry/calendar.md)）。
- 时间选项（`TimeView`）是原生 `<button type="button">`，数值以 `padStart(2, '0')` 补零显示（如 `09`），无 `aria-label`。
- 视图切换头部的标题是 `Button`；当视图模式不可上钻时（如 `time` 模式）按钮被 `disabled`，**读屏会感知到禁用状态**。
- 范围视图的「开始 / 结束」标记是纯视觉的圆形角标（文本为 `始` / `终`，zh-CN；`S` / `E`，en-US），**不带 `aria-label`**。
- **组件库不管理焦点**：切换视图 / 选择日期后焦点不会自动移动到新位置。
- `InputDate` / `InputDateTime` / `InputDateTimeRange` 的错误信息渲染为 `<div class="mt-1 text-red-500 text-xs">`，**没有 `role="alert"` / `aria-live`** —— 读屏不会自动播报校验失败。

## 注意事项

- **所有值都是字符串**：`InputDate` 的 `onChange` 回传的是**已格式化的字符串**（如 `'2026-11-04'`），不是 `Date` 对象；只有 `InputDateTimeRange` 回传 `Date` 对象数组。
- **受控 + 内部 state 双轨**：`value` 变化会同步进内部状态；组件同时通过 `onChange` 回传 —— 典型写法是 `value={date} onChange={setDate}`。
- **`format` 决定一切**：`format`（`dayjs` 格式串）同时用于「输入框显示」「解析输入」「回传值」三处。默认 `YYYY-MM-DD`（日期）/ `HH:mm:ss`（时间）/ `YYYY-MM-DD HH:mm:ss`（日期时间）。`InputTime` 的默认格式**由 `showMinutes` / `showSeconds` 动态推导**（`HH` / `HH:mm` / `HH:mm:ss`）。
- **`InputDate` / `InputDateTime` 用严格解析**：`dayjs(str, format, true)`，格式不匹配**不会**触发 `onChange`，失焦时显示「日期格式不正确，格式示例 YYYY-MM-DD」。
- **`InputTime` / `InputTimeRange` 解析失败时清空输入框**（失焦后 `setInputValue('')` + `onChange(undefined)`），而 `InputDate` 失焦时**保留原文本**并显示错误提示 —— 两者行为不同。
- **范围值会「自动交换」**：`InputDateRange` / `InputTimeRange` / `InputDateTimeRange` 在确认时若结束值早于开始值，**自动交换两者**并同步更新显示。
- **`InputDateRange` 的 `format` 是唯一真值源**：`format` 传入时**所有模式**（`day` / `month` / `year`）均按此格式解析与输出；未传时才按 `mode` 取默认格式（`day` → `'YYYY-MM-DD'` · `month` → `'YYYY-MM'` · `year` → `'YYYY'`）。手动输入解析同样使用该格式。
- **`separator` 是解析的分隔符**：`InputDateRange` / `InputTimeRange` / `InputDateTimeRange` 用 `value.split(separator)` 解析输入（默认 `' ~ '`）。**改 `separator` 必须同时改手动输入的写法**，否则解析失败。
- **`disabledDate` 与 `minDate` / `maxDate` 是两套机制**：`InputDate` 系列只有 `disabledDate`（无 `minDate` / `maxDate`）；`EnhancedDatePicker` / `EmbeddedDatePicker` 三者都有 —— 且 `minDate` / `maxDate` **只在日视图生效**（`MonthView` / `YearView` / `QuarterView` 收到的 `minDate` / `maxDate` 也参与禁用判定，但粒度分别是「月」/「年」/「季度」）。
- **`InputDate` 的 `disabledDate` 只在日视图生效**：源码只给 `DayView` 传了 `isValidDate`，`MonthView` / `YearView` **没有传** —— 即「禁用 13 号」在月 / 年视图里不生效。
- **`EnhancedDatePicker` 的 `showShortcuts` 默认为 `false`**（其余组件默认 `true`）。
- **`EnhancedDatePicker` 不自动关闭弹层**：只有 `viewMode === 'days'` 且 `showTimeView === false` 时才会 `setIsOpen(false)`；其他情况需手动关闭。
- **`EmbeddedDatePicker` 的 `isMobile` 是纯布局开关**：只影响内边距（`px-2` / `px-3`）、快捷区样式（移动端改为横向滚动按钮组）与最大宽度（`max-w-sm`），**不做设备检测** —— 需自行用 `useIsMobile`（未导出）判断。
- **`EmbeddedDatePicker` 的 `onChange` 在非确认模式下会连续触发**：每选一次日期就触发一次（不像 `InputDate` 那样选完即关）。
- **`DatePicker` 的快捷区同样只在 `mode === 'day'` 时渲染**。
- **弹层内容宽度固定**：日期区带 `shrink-0`，快捷区变宽时由 `Popover` 整体变宽，不会压缩日历区。
- **`InputDate` / `InputDateTime` 的错误提示优先级**：`errorMessage` prop > 内部校验错误（`validate` 返回值 / `disabledDate` 命中 / 格式错误）。
- **组件库不消费任何主题 CSS 变量**（`src/ui/date/` 下无 `var(--*)` 引用），配色全部走 Tailwind 语义类。

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
