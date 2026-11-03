# Spinner 加载指示器

> 用于表示加载状态的旋转指示器，支持 3 种尺寸与 5 种颜色变体。

**导入**

```tsx
import { Spinner } from '@easbot/ui';
```

## 基础用法

```tsx
<Spinner />
```

渲染结构：单个内联 `<svg>`（`viewBox="0 0 24 24"`），内含一个 `stroke` 圆环与一条 `fill` 旋转弧线。

## 组成部分

`Spinner` 为单组件，无子组件。

## 变体

### size

| 取值 | 说明                        |
| ---- | --------------------------- |
| `sm` | 小号（`--spinner-size-sm`） |
| `md` | 中号（`--spinner-size-md`） |
| `lg` | 大号（`--spinner-size-lg`） |

默认值：`md`。

### variant

| 取值          | 说明                                       |
| ------------- | ------------------------------------------ |
| `default`     | 默认色（`--spinner-primary`）              |
| `primary`     | 主色前景（`--spinner-primary-foreground`） |
| `destructive` | 危险色（`--spinner-destructive`）          |
| `success`     | 成功色（`--spinner-success`）              |
| `warning`     | 警告色（`--spinner-warning`）              |

默认值：`default`。

## 属性

| 属性        | 类型                                                                | 默认值      | 说明           |
| ----------- | ------------------------------------------------------------------- | ----------- | -------------- |
| `size`      | `'sm' \| 'md' \| 'lg'`                                              | `'md'`      | 指示器尺寸     |
| `variant`   | `'default' \| 'primary' \| 'destructive' \| 'success' \| 'warning'` | `'default'` | 指示器颜色变体 |
| `className` | `string`                                                            | —           | 自定义类名     |

本表只列组件自有属性；此外还透传 `<svg>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

组件 props 类型为 `React.HTMLAttributes<SVGSVGElement> & VariantProps<typeof spinnerVariants>`。

## 导出

| 导出名            | 类型 | 说明                                          |
| ----------------- | ---- | --------------------------------------------- |
| `Spinner`         | 组件 | 加载指示器，`React.forwardRef` 到 `<svg>`     |
| `spinnerVariants` | 常量 | `cva` 变体定义（`size` / `variant` 两个维度） |
| `SpinnerProps`    | 类型 | `Spinner` 的 props 类型                       |

## 无障碍

- `<svg>` 固定设置 `role="status"`、`aria-live="polite"` 与 `aria-busy="true"`，
  屏幕阅读器会把加载区域识别为状态区域并在内容变化时礼貌播报。
- 组件内部**没有**可见文字，若需要「加载中…」等提示，请在外层补充可见文案并与 `<svg>` 关联
  （例如用 `aria-label` 覆盖或把文字放进同一容器）。
- 图标为内联 SVG 路径，不是 `lucide-react` 图标（`Spinner` 是本库少数不使用 `lucide-react` 的组件）。
- 旋转动画基于 CSS `animate-spin`；若系统开启了「减少动态效果」偏好，可在 `className` 中传入
  `motion-reduce:animate-none` 关闭动画。

## 主题变量

| 变量                           | 说明                           |
| ------------------------------ | ------------------------------ |
| `--spinner-size-sm`            | `size="sm"` 的宽高             |
| `--spinner-size-md`            | `size="md"` 的宽高             |
| `--spinner-size-lg`            | `size="lg"` 的宽高             |
| `--spinner-primary`            | `variant="default"` 的颜色     |
| `--spinner-primary-foreground` | `variant="primary"` 的颜色     |
| `--spinner-destructive`        | `variant="destructive"` 的颜色 |
| `--spinner-success`            | `variant="success"` 的颜色     |
| `--spinner-warning`            | `variant="warning"` 的颜色     |

## 组合用法 / 注意事项

1. **颜色跟随 `currentColor`**：SVG 内部使用 `stroke="currentColor"` 与 `fill="currentColor"`，
   变体只是给 `<svg>` 设置 `text-*` 颜色，因此也可用 `className="text-red-500"` 自由覆盖。
2. **调整旋转速度**：通过 `className` 传任意值类名覆盖动画时长即可，例如
   `className="[animation-duration:2s]"`。
3. **与按钮组合**：按钮内使用请加 `size="sm"`，并让 `<svg>` 与文字保持 `gap` 间距，避免图标过大挤压布局。
4. **不要用 `Spinner` 代替骨架屏**：整块区域加载用 [`Skeleton`](./skeleton.md) 更合适，
   `Spinner` 适合表示「某个独立动作正在进行」。
