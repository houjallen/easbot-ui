# Progress 进度条

> 用于可视化展示操作进度，基于 Radix `Progress` primitive，支持确定进度与不确定进度两种状态。

**导入**

```tsx
import { Progress } from '@easbot/ui';
```

## 基础用法

```tsx
<Progress value={60} />
```

渲染结构：根节点为 Radix `Progress.Root`（`<div role="progressbar">`），内部是一个
Radix `Progress.Indicator`（`<div>`），通过 `transform: translateX(-N%)` 实现进度位移。

## 组成部分

`Progress` 为单组件，无子组件。

## 变体

本组件未使用 `cva`，没有 variant 维度。颜色变体通过 `indicatorClassName` 传入自定义类名实现：

```tsx
<Progress value={60} indicatorClassName="bg-[var(--progress-indicator-success)]" />
```

## 属性

| 属性                 | 类型     | 默认值 | 说明                                   |
| -------------------- | -------- | ------ | -------------------------------------- |
| `value`              | `number` | —      | 进度值（0-100），内部会 clamp 到 0-100 |
| `indicatorClassName` | `string` | —      | 进度指示条自定义样式                   |
| `className`          | `string` | —      | 根节点自定义类名                       |

本表只列组件自有属性；此外还透传 Radix `Progress.Root`（`<div>`）的全部原生属性与 Radix 自身属性：

| 属性            | 类型                                     | 默认值 | 说明                                                                    |
| --------------- | ---------------------------------------- | ------ | ----------------------------------------------------------------------- |
| `max`           | `number`                                 | `100`  | 进度最大值（Radix 内置）                                                |
| `getValueLabel` | `(value: number, max: number) => string` | —      | 生成 `aria-valuetext` 文案（Radix 内置）；因 `value` 未透传，实际不生效 |

## 导出

| 导出名          | 类型 | 说明                                             |
| --------------- | ---- | ------------------------------------------------ |
| `Progress`      | 组件 | 进度条组件，`React.forwardRef` 到根 `<div>`      |
| `ProgressProps` | 类型 | `Progress` 的 props 类型（`ProgressProps` 接口） |

## 无障碍

- 根节点由 Radix 渲染为 `role="progressbar"`，并自动输出 `aria-valuemin="0"` 与 `aria-valuemax`。
- **注意**：本组件把 `value` 从 `props` 中解构出来，**没有**透传给 Radix `Progress.Root`。
  因此 Radix 收到的 `value` 为 `null`，根节点上**不会**出现 `aria-valuenow` 与 `aria-valuetext`，
  `data-state` 恒为 `indeterminate`，`data-value` 也不会输出。
  实际进度只体现在指示条的 `transform` 上。若需要正确的无障碍语义，需在业务层补齐。
- `max` 未被组件显式处理时，Radix 默认取 `100`（`data-max="100"`）。
- 进度条本身不是交互元素，无需键盘聚焦；若需播报进度，建议在业务层用 `aria-live` 包裹百分比文本。

## 主题变量

| 变量                             | 说明                       |
| -------------------------------- | -------------------------- |
| `--progress-background`          | 进度条轨道背景色           |
| `--progress-indicator`           | 进度指示条颜色（默认主色） |
| `--progress-height`              | 进度条高度                 |
| `--progress-border-radius`       | 进度条圆角                 |
| `--progress-transition-duration` | 进度位移过渡时长           |
| `--progress-transition-timing`   | 进度位移过渡缓动函数       |

以下变量**未**被组件源码直接引用，但已在主题中定义，可通过 `indicatorClassName` 使用：
`--progress-indicator-success` / `--progress-indicator-warning` / `--progress-indicator-error`。

## 组合用法 / 注意事项

1. **`value` 会被 clamp**：源码用 `Math.min(Math.max(value || 0, 0), 100)` 计算百分比，
   传入 `120` 等于 `100`，传入 `-10` 等于 `0`。
2. **位移靠 `translateX` 实现**：指示条宽度恒为 `100%`，通过 `transform: translateX(-${100 - percentage}%)`
   向左平移，因此过渡动画只需调整 `transform`，不会触发重排。
3. **不确定进度**：不传 `value` 时进度条为空槽（Radix 标记 `data-state="indeterminate"`）；
   如需展示动态条纹动画，需自行通过 `indicatorClassName` 添加动画样式。
4. **调整高度**：用 `className` 传 `h-2` / `h-3` 等类名覆盖默认高度（`className` 合并在末位，优先级最高）。
5. **百分比文案需自行渲染**：组件不显示数字，如需展示请在外部配合文本节点。
6. **`value` 未透传给 Radix**：组件只把 `value` 用于计算 `translateX` 位移，
   Radix `Progress.Root` 收到的 `value` 为 `null`，
   因此根节点缺失 `aria-valuenow`、`data-state` 恒为 `indeterminate`。
   这是源码实现现状，若对屏幕阅读器语义有要求需在业务层补齐。
