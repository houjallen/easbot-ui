# Separator 分隔线

> 用于在内容区域之间做视觉分割，基于 Radix `Separator` primitive，支持水平与垂直两种方向。

**导入**

```tsx
import { Separator } from '@easbot/ui';
```

## 基础用法

```tsx
<Separator />
```

渲染结构：单个 `<div>`，水平方向为 `h-1 w-full`，垂直方向为 `h-full w-px`。

## 组成部分

`Separator` 为单组件，无子组件。

## 变体

### orientation

| 取值           | 说明                                                              |
| -------------- | ----------------------------------------------------------------- |
| `'horizontal'` | 水平分隔线（默认值），高度由 `--separator-horizontal-height` 决定 |
| `'vertical'`   | 垂直分隔线，宽度由 `--separator-vertical-width` 决定              |

### decorative

| 取值    | 说明                                                        |
| ------- | ----------------------------------------------------------- |
| `true`  | 纯装饰：渲染 `role="none"`，从无障碍树中移除（默认值）      |
| `false` | 语义分隔：渲染 `role="separator"` 并输出 `aria-orientation` |

## 属性

| 属性          | 类型                         | 默认值         | 说明             |
| ------------- | ---------------------------- | -------------- | ---------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 分隔线方向       |
| `decorative`  | `boolean`                    | `true`         | 是否为纯装饰元素 |
| `className`   | `string`                     | —              | 自定义类名       |

本表只列组件自有属性；此外还透传 Radix `Separator.Root`（`<div>`）的全部原生属性，
如 `id` / `aria-*` / `data-*` / `on*` 事件。

组件 props 类型为 `React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>`，等价于 Radix 的 `SeparatorProps`。

## 导出

| 导出名           | 类型 | 说明                                             |
| ---------------- | ---- | ------------------------------------------------ |
| `Separator`      | 组件 | 分隔线组件，`React.forwardRef` 到 `<div>`        |
| `SeparatorProps` | 类型 | 直接复用 Radix `SeparatorProps` 类型（重新导出） |

## 无障碍

- `decorative={true}`（默认）时，Radix 输出 `role="none"`，分隔线从无障碍树中移除，
  屏幕阅读器不会朗读它，适合纯视觉分割。
- `decorative={false}` 时，Radix 输出 `role="separator"` 与 `aria-orientation="horizontal" | "vertical"`，
  适合在语义上确实是分组边界的场景。
- 分隔线不是交互元素，不进入 Tab 序列。

## 主题变量

| 变量                            | 说明             |
| ------------------------------- | ---------------- |
| `--separator-background`        | 分隔线颜色       |
| `--separator-horizontal-height` | 水平分隔线的高度 |
| `--separator-vertical-width`    | 垂直分隔线的宽度 |

## 组合用法 / 注意事项

1. **方向由 `orientation` 决定**：组件据此切换尺寸类，
   水平为 `h-[var(--separator-horizontal-height)] w-full`，垂直为 `h-full w-[var(--separator-vertical-width)]`。
2. **垂直分隔线需要父容器有高度**：垂直方向的类包含 `h-full`，
   若父容器高度由内容撑开，垂直分隔线可能不可见，建议给父容器显式设置高度或使用 `items-stretch`。
3. **默认是装饰性的**：多数分割场景无需改动 `decorative`；
   仅当分隔线两侧内容在语义上构成独立分组时才设为 `false`。
4. **自定义颜色**：用 `className` 覆盖背景即可，例如 `className="bg-primary"`（末位合并，优先级最高）。
