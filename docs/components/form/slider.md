# Slider 滑块

> 在给定区间内拖动选择数值，支持单点与区间两种模式。

---

**导入**

```tsx
import { Slider } from '@easbot/ui';
```

## 基础用法

```tsx
import { Slider } from '@easbot/ui';

export default function App() {
  return <Slider defaultValue={[50]} max={100} step={1} />;
}
```

受控用法与区间选择：

```tsx
import { useState } from 'react';

const [value, setValue] = useState([20, 80]);

<Slider value={value} onValueChange={setValue} max={100} step={1} />;
```

垂直方向：

```tsx
<Slider orientation="vertical" className="h-full" value={[50]} max={100} step={1} />
```

## 变体

### variant

| 取值              | 说明                                                          |
| ----------------- | ------------------------------------------------------------- |
| `default`（默认） | 默认样式，已选区间与滑块圆点使用主题主色                      |
| `destructive`     | 危险色，已选区间、滑块边框与滑块焦点环均改用 destructive 配色 |

`SliderProps` 继承自 Radix `SliderPrimitive.Root` 并叠加 `eunSliderVariants`，props 与 Radix Slider 一致（`value` / `defaultValue` / `min` / `max` / `step` / `orientation` / `disabled` / `onValueChange` / `onValueCommit` / `aria-*` / `data-*` 等），组件未新增自有属性。

## 无障碍

- 底层 Radix Slider 渲染为 `role="slider"` 的 `<span>`，并注入 `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-orientation` / `aria-disabled`。
- 键盘操作：方向键按 `step` 递增 / 递减，`PageUp` / `PageDown` 按较大步长跳转，`Home` / `End` 跳到区间端点。
- 区间模式（`value` / `defaultValue` 传入两个数字）会渲染**两个**滑块圆点，各自可独立键盘操作。
- 禁用态由 Radix 注入 `data-disabled` / `aria-disabled`，圆点不可聚焦；同时整条轨道附加 `data-[disabled]:opacity-50`。Root / Track / Thumb 均为 `<span>`，**没有**原生 `disabled` 属性，故禁用态样式一律使用 `data-[disabled]:` 变体（`disabled:` 变体的 `:disabled` 伪类在这里永不匹配）。
- 焦点样式使用 `focus-visible:ring-4`，仅键盘可见焦点才显示。

## 注意事项

- **`value` / `defaultValue` 必须是数组**：单点模式传 `[50]`，区间模式传 `[20, 80]`；传非数组会失效。
- **默认区间是 `[min, max]`**：未传 `value` / `defaultValue` 时，滑块圆点数量按 `[min, max]` 计算，即默认渲染两个圆点；单点场景请显式传 `[value]`。
- **`min` / `max` 默认 `0` / `100`**：底层实现已设置默认值。
- **`variant` 只改配色**：通过 `[&_[data-slot=slider-range]]` / `[&_[data-slot=slider-thumb]]` 选择器覆盖内部子元素，不改变结构。
- **垂直方向需要显式高度**：源码注释说明垂直模式下容器高度依赖 `h-full` 与最小高度 `min-h-44`，需由调用方通过 `className` 提供。
- **`src/ui` 层是薄封装**：内部结构（轨道 / 已选区间 / 圆点）由设计系统层 `DSSlider` 渲染。
- **鼠标指针**：可用态轨道与圆点统一 `cursor-pointer`（全库交互控件同一语义，不使用 `cursor-grab`）；禁用态为 `data-[disabled]:cursor-not-allowed`，并关闭圆点的 `hover:ring-4` 反馈。禁用态保留 `pointer-events`，不使用 `pointer-events-none`（见 `spec/css-standard.md` §4.9）。

## 导出

### 组件

| 导出名         | 说明 |
| -------------- | ---- |
| `EunSliderRef` |      |
| `Slider`       |      |
| `SliderProps`  |      |
| `SliderRef`    |      |
