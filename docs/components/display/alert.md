# Alert 提示条

> 用于在页面内联展示重要提示信息，支持 5 种语义状态、默认图标、可关闭与自定义图标。

**导入**

```tsx
import { Alert, AlertTitle, AlertDescription } from '@easbot/ui';
```

## 基础用法

```tsx
<Alert>
  <AlertTitle>提示</AlertTitle>
  <AlertDescription>这是一条提示信息</AlertDescription>
</Alert>
```

渲染结构：外层为 `<div role="alert" aria-live="polite">`，内部包一层 `<div>` 承载 `children`，
可选的默认图标以 `<svg>` 形式作为外层第一个子元素。

## 组成部分

| 子组件             | 说明                                                  |
| ------------------ | ----------------------------------------------------- |
| `AlertTitle`       | 提示标题，渲染为 `<h5>`，带标题字号 / 字重 / 行高样式 |
| `AlertDescription` | 提示描述，渲染为 `<div>`，使用 `text-sm` 与弱化前景色 |

## 变体

### variant

| 取值          | 说明                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| `default`     | 默认样式，边框 / 背景 / 文字使用默认提示色，图标为 `muted-foreground` 色 |
| `destructive` | 危险提示，10% 透明度的 `destructive` 背景，图标为 `XCircle`              |
| `success`     | 成功提示，10% 透明度的 `success` 背景，图标为 `CheckCircle`              |
| `warning`     | 警告提示，10% 透明度的 `warning` 背景，图标为 `AlertTriangle`            |
| `info`        | 信息提示，10% 透明度的 `info` 背景，图标为 `Info`                        |

默认值：`default`。

### showIcon

| 取值    | 说明                                             |
| ------- | ------------------------------------------------ |
| `true`  | 按 `variant` 显示对应的默认图标（默认值）        |
| `false` | 不显示任何图标（传入 `icon` 时仍以 `icon` 为准） |

### closable

| 取值    | 说明                                   |
| ------- | -------------------------------------- |
| `true`  | 右上角渲染关闭按钮，点击触发 `onClose` |
| `false` | 不渲染关闭按钮（默认值）               |

## 属性

| 属性             | 类型                                                             | 默认值       | 说明                                               |
| ---------------- | ---------------------------------------------------------------- | ------------ | -------------------------------------------------- |
| `variant`        | `'default' \| 'destructive' \| 'success' \| 'warning' \| 'info'` | `'default'`  | 提示条视觉变体                                     |
| `closable`       | `boolean`                                                        | `false`      | 是否显示关闭按钮                                   |
| `onClose`        | `() => void`                                                     | —            | 关闭回调函数                                       |
| `icon`           | `React.ReactNode`                                                | —            | 自定义图标（覆盖默认图标）                         |
| `closeAriaLabel` | `string`                                                         | `'关闭提示'` | 关闭按钮的 ARIA 标签                               |
| `showIcon`       | `boolean`                                                        | `true`       | 是否显示默认图标                                   |
| `className`      | `string`                                                         | —            | 自定义类名，合并到最外层 `<div>`                   |
| `children`       | `React.ReactNode`                                                | —            | 提示内容，通常为 `AlertTitle` + `AlertDescription` |

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

`AlertTitle` 与 `AlertDescription` 的属性类型分别是 `React.HTMLAttributes<HTMLHeadingElement>`
与 `React.HTMLAttributes<HTMLParagraphElement>`，即仅继承原生属性（`className` / `id` / `style` 等），
没有额外自有属性。

## 导出

| 导出名             | 类型 | 说明                                        |
| ------------------ | ---- | ------------------------------------------- |
| `Alert`            | 组件 | 提示条主组件，`React.forwardRef` 到 `<div>` |
| `AlertTitle`       | 组件 | 标题子组件，渲染为 `<h5>`                   |
| `AlertDescription` | 组件 | 描述子组件，渲染为 `<div>`                  |
| `AlertProps`       | 类型 | `Alert` 的 props 类型                       |

## 无障碍

- 外层容器固定设置 `role="alert"` 与 `aria-live="polite"`，屏幕阅读器会在内容变化时礼貌播报。
- `closable` 为 `true` 时，关闭按钮为原生 `<button type="button">`，可通过 Tab 键聚焦。
- 关闭按钮带 `aria-label={closeAriaLabel}`（默认「关闭提示」），可用 `closeAriaLabel` 定制文案。
- 关闭按钮获得焦点时显示 `focus:ring-2` 焦点环，并带 `focus:ring-offset-2`。
- 图标为纯装饰元素，默认图标的颜色跟随 `variant`；自定义图标请自行添加 `aria-hidden`。

## 主题变量

| 变量                                     | 说明                                       |
| ---------------------------------------- | ------------------------------------------ |
| `--alert-dialog-shadow`                  | 提示条阴影                                 |
| `--alert-dialog-default-padding`         | 提示条内边距                               |
| `--alert-dialog-default-border`          | `default` 变体的边框颜色                   |
| `--alert-dialog-default-background`      | `default` 变体的背景颜色                   |
| `--alert-dialog-default-foreground`      | `default` 变体的文字颜色                   |
| `--alert-dialog-title-font-size`         | 标题字号                                   |
| `--alert-dialog-title-font-weight`       | 标题字重                                   |
| `--alert-dialog-title-line-height`       | 标题行高                                   |
| `--alert-dialog-header-gap`              | 标题与后续内容的间距                       |
| `--alert-dialog-description-line-height` | 描述行高                                   |
| `--radius`                               | 提示条圆角                                 |
| `--muted-foreground`                     | 描述文字颜色 / `default` 变体的图标颜色    |
| `--destructive`                          | `destructive` 变体的边框 / 文字 / 图标颜色 |
| `--success`                              | `success` 变体的边框 / 文字 / 图标颜色     |
| `--warning`                              | `warning` 变体的边框 / 文字 / 图标颜色     |
| `--info`                                 | `info` 变体的边框 / 文字 / 图标颜色        |
| `--ring`                                 | 关闭按钮聚焦时的焦点环颜色                 |
| `--background`                           | 关闭按钮焦点环的外扩底色                   |

## 组合用法 / 注意事项

1. `icon` 与 `showIcon` 的优先级为 `icon` > `showIcon` > `variant` 默认图标：传入 `icon` 时即使
   `showIcon={false}` 也会渲染自定义图标。
2. 关闭按钮的点击会调用 `preventDefault()` 与 `stopPropagation()`，因此不会触发外层容器的点击事件；
   但组件本身**不会**自动隐藏，`onClose` 回调里需要自行控制显隐状态。
3. `Alert` 的 `variant` 决定默认图标：`default` 变体**没有**默认图标，需要图标请显式传 `icon`。
4. 图标统一使用 `lucide-react` 且必须具名导入，自定义图标建议加 `className="h-4 w-4"` 与视觉尺寸保持一致。
