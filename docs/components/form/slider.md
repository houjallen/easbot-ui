# Slider 滑块

> 在给定区间内选择数值的滑块，基于 Radix Slider 实现，支持单点、范围、垂直方向与步进。

**导入**

```tsx
import { Slider } from '@easbot/ui';
```

## 基础用法

```tsx
import { Slider } from '@easbot/ui';

export default function App() {
  return <Slider defaultValue={[50]} min={0} max={100} step={1} />;
}
```

范围选择与受控用法：

```tsx
import { useState } from 'react';
import { Slider } from '@easbot/ui';

export default function App() {
  const [range, setRange] = useState([20, 80]);

  return <Slider value={range} onValueChange={setRange} min={0} max={100} step={1} />;
}
```

## 变体

`Slider` 没有 `cva` 变体维度，仅通过 `orientation` 属性切换布局：

| 取值                 | 说明                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `horizontal`（默认） | 水平排列，轨道 `h-[var(--slider-track-height)] w-full`，根节点 `w-full items-center`          |
| `vertical`           | 垂直排列，轨道 `h-full w-[var(--slider-track-height)]`，根节点 `h-full flex-col items-center` |

## 属性

| 属性                    | 类型                         | 默认值         | 说明                                         |
| ----------------------- | ---------------------------- | -------------- | -------------------------------------------- |
| `value`                 | `number[]`                   | —              | 当前值数组（受控模式），数组长度决定滑块数量 |
| `defaultValue`          | `number[]`                   | —              | 默认值数组（非受控模式）                     |
| `onValueChange`         | `(value: number[]) => void`  | —              | 值变化回调                                   |
| `onValueCommit`         | `(value: number[]) => void`  | —              | 拖拽结束（提交）回调                         |
| `min`                   | `number`                     | —              | 最小值                                       |
| `max`                   | `number`                     | —              | 最大值                                       |
| `step`                  | `number`                     | —              | 步进间隔                                     |
| `minStepsBetweenThumbs` | `number`                     | —              | 两个滑块之间的最小步进数（范围模式）         |
| `orientation`           | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向，同时影响方向键导航行为             |
| `dir`                   | `'ltr' \| 'rtl'`             | —              | 文字方向                                     |
| `disabled`              | `boolean`                    | —              | 禁用状态                                     |
| `inverted`              | `boolean`                    | —              | 是否反转数值方向                             |
| `name`                  | `string`                     | —              | 表单字段名                                   |
| `className`             | `string`                     | —              | 自定义类名                                   |

本表只列组件自有属性；此外还透传 Radix `Slider.Root` 的全部原生属性，如 `id` / `aria-label` / `aria-valuetext` / `data-*` / `on*` 事件。

## 无障碍

- 基于 Radix `Slider.Root`，渲染为 `role="slider"` 的元素，每个滑块（Thumb）都是独立的 `role="slider"`，带 `aria-valuemin` / `aria-valuemax` / `aria-valuenow`。
- 支持方向键（`ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight`）调整数值，`Home` / `End` 跳到最小 / 最大值；`orientation` 决定生效的方向轴。
- 范围模式下两个滑块都可获得焦点，Tab 键可在滑块之间切换。
- 焦点样式使用 `focus-visible:ring-2 focus-visible:ring-[var(--slider-thumb-focus-ring)] focus-visible:ring-offset-2`。
- 禁用态使用 `disabled:pointer-events-none` + `disabled:opacity-[var(--slider-disabled-opacity)]`。
- **建议提供可访问名称**：通过 `aria-label` 或 `aria-labelledby` 补充说明当前滑块的含义。

## 主题变量

| 变量                        | 说明                                       |
| --------------------------- | ------------------------------------------ |
| `--slider-track-height`     | 轨道高度（垂直模式下为宽度）               |
| `--slider-track-background` | 轨道背景色                                 |
| `--slider-range-background` | 已选中区间（Range）背景色                  |
| `--slider-thumb-size`       | 滑块尺寸                                   |
| `--slider-thumb-background` | 滑块背景色                                 |
| `--slider-thumb-border`     | 滑块边框色                                 |
| `--slider-thumb-focus-ring` | 滑块焦点环颜色                             |
| `--slider-disabled-opacity` | 禁用态透明度                               |
| `--background`              | 焦点环偏移底色（`ring-offset-background`） |

## 组合用法 / 注意事项

- **滑块数量由数组长度决定**：组件读取 `props.value || props.defaultValue || [0]`，数组有几个元素就渲染几个 Thumb；受控模式下应始终保持数组长度不变。
- **垂直方向需显式设定容器高度**：垂直模式下根节点使用 `h-full`，父容器必须有确定高度，否则轨道高度为 0。
- **样式全部使用 `var(--xxx)` 硬编码**：没有 `cva` 变体入口，颜色与尺寸只能通过覆盖 CSS 变量来调整。
- **轨道不可直接访问**：`SliderPrimitive.Track` 与 `Range` 未透传额外 props，定制轨道样式请通过覆盖主题变量实现。
- **`step` 与 `min` / `max` 需自行传入**：组件不提供默认值，Radix 会按自身默认规则处理。

## 导出

| 导出名        | 类型                              | 说明                                                    |
| ------------- | --------------------------------- | ------------------------------------------------------- |
| `Slider`      | `React.ForwardRefExoticComponent` | 滑块组件，ref 指向 Radix `Slider.Root`                  |
| `SliderProps` | `type`                            | 直接复用 `@radix-ui/react-slider` 的 `SliderProps` 类型 |
