# Calendar 日历

> 基于 `react-day-picker` v10 的日期选择日历，支持单选 / 多选 / 区间三种选择模式。

---

**导入**

```tsx
import { Calendar } from '@easbot/ui';
```

## 基础用法

```tsx
import { Calendar } from '@easbot/ui';

export default function App() {
  return (
    <div className="w-full max-w-sm">
      <Calendar mode="single" selected={new Date()} />
    </div>
  );
}
```

区间选择：

```tsx
<Calendar mode="range" defaultMonth={new Date()} />
```

禁用指定日期：

```tsx
<Calendar
  mode="single"
  selected={new Date()}
  disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
```

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `default`（默认） | 设计系统层按钮的默认配色（`bg-primary` + `text-primary-foreground`） |
| `destructive`     | 危险色实心按钮（`bg-destructive` + `text-white`）                    |
| `outline`         | 边框样式、透明背景 —— 日历的「上月 / 下月」导航按钮使用此取值        |
| `secondary`       | 次色实心按钮（`bg-secondary` + `text-secondary-foreground`）         |
| `ghost`           | 幽灵按钮，hover 时显示背景 —— 日历的日期按钮使用此取值               |
| `link`            | 链接样式，主色文字 + hover 下划线                                    |

### size

| 取值              | 说明                                      |
| ----------------- | ----------------------------------------- |
| `default`（默认） | 默认，`h-9 px-4 py-2`（36px）             |
| `sm`              | 小，`h-8 gap-1.5 rounded-md px-3`（32px） |
| `lg`              | 大，`h-10 rounded-md px-6`（40px）        |
| `icon`            | 图标按钮，正方形 `size-9`（36px）         |

`CalendarProps` 是 `React.ComponentProps<typeof Calendar>` 的类型别名 —— **无自有成员**。

> ⚠️ **props 来源说明**：`Calendar` 是 `react-day-picker` v10 的 `DayPicker` 封装，**全部属性都来自第三方库**，包括 `mode`（`single` / `multiple` / `range`）、`selected`、`defaultMonth`、`month`、`onSelect`、`onMonthChange`、`disabled`、`excludeDisabled`、`numberOfMonths`、`captionLayout`、`weekStartsOn`、`locale`、`formatters`、`components`、`classNames`、`styles`、`showOutsideDays`、`hideWeekdays`、`fixedWeeks`、`startMonth`、`endMonth`、`required`、`animate`、`dir`、`lang`、`id`、`nonce`、`title` 等。本库**未新增**任何自有属性，具体语义请参考 [`react-day-picker` 官方文档](https://daypicker.dev)。

## 无障碍

- 月份网格渲染为 `<table role="grid">`，并注入 `aria-label`（当前月份的年月描述）与 `aria-multiselectable`（`multiple` / `range` 模式为 `true`）。
- 星期表头渲染为 `<th scope="col">`，带 `aria-label`（完整星期名）。
- 日期单元格渲染为 `<td role="gridcell">`，带 `aria-selected`；单元格内的日期按钮是原生 `<button type="button">`，带 `aria-label` 与受控的 `tabIndex`（仅焦点目标为 `0`，其余为 `-1`）。
- 被禁用的日期按钮使用原生 `disabled`（当前处于焦点目标时改为 `aria-disabled`），不可被键盘激活。
- 月份标题渲染为 `role="status"` + `aria-live="polite"` 的元素，翻月时读屏会礼貌播报新的年月。
- 「上月 / 下月」按钮是原生 `<button type="button">`，带 `aria-label`（如「前往上一月」）；到达边界时注入 `aria-disabled="true"` 并把 `tabIndex` 设为 `-1`（从键盘顺序中移除）。
- 区间选择额外使用 `day-range-start` / `day-range-end` 类名做视觉区分（配合 `aria-selected`）。
- 组件**不注入** `role="application"` 或 `aria-modal`。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Calendar` 直接等于设计系统层 `src/design-system/components/ui/calendar.tsx` 的实现，未新增任何自有属性。
- **基于 `react-day-picker` v10**：v10 的类名键由 `UI` 枚举常量定义（如 `UI.MonthCaption` 对应 `month_caption`），并把 `caption` 拆分为 `month_caption` / `caption_label` —— 自定义 `classNames` 时请使用 v10 的键名，不要照搬 v8 / v9 写法。
- **`showOutsideDays` 默认是 `true`**：组件显式设置了这个默认值（与 `react-day-picker` 的默认值一致），显示上下月补位的日期。
- **`classNames` 会与内置样式合并**：消费方传入的 `classNames` 展开在对象末尾（`...classNames`），**同名键会覆盖内置样式**；未覆盖的键仍走内置样式。
- **`className` 落在根容器上**：根容器带 `p-3` 内边距。
- **日期按钮与翻月按钮复用设计系统层的 `buttonVariants`**：日期按钮取 `variant="ghost"`（`size-8` 方块），翻月按钮取 `variant="outline"`（`size-7`、半透明背景、hover 恢复不透明）。
- **导航图标被统一覆盖**：组件通过 `components.Chevron` 把 `left` 方向换成 `ChevronLeft`、`right` 方向换成 `ChevronRight`（其余方向回退为 `ChevronLeft`）。
- **区间模式会改变日期单元格样式**：`mode === 'range'` 时单元格的圆角规则与单选模式不同（起止日分别用左右圆角），因此切换模式需要重新渲染。
- **`components` 属性会被完全覆盖**：组件传入的 `components` 对象在 `{...props}` **之前**，因此调用方传入的 `components` 会整体替换掉内置的 `Chevron` 覆盖 —— 需要自定义导航图标时请自行提供 `Chevron` 实现。
- **组件不消费任何主题 CSS 变量**（配色全部走 Tailwind 语义类）。

## 导出

### 组件

| 导出名          | 说明 |
| --------------- | ---- |
| `Calendar`      |      |
| `CalendarProps` |      |
