# Card 卡片

> 用于承载一组相关内容的容器组件，支持语义变体、尺寸、可点击形态、加载态、水波纹与滑动回调。

**导入**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@easbot/ui';
```

## 基础用法

```tsx
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>这是一段描述文本</CardDescription>
  </CardHeader>
  <CardContent>卡片的主要内容区域</CardContent>
  <CardFooter>
    <Button>确认</Button>
  </CardFooter>
</Card>
```

## 组成部分

| 子组件            | 说明                                                      |
| ----------------- | --------------------------------------------------------- |
| `CardHeader`      | 卡片头部容器，渲染为 `<div>`，固定 `p-6` 内边距与纵向间距 |
| `CardTitle`       | 卡片标题，渲染为 `<h3>`                                   |
| `CardDescription` | 卡片描述，渲染为 `<p>`，使用 `text-sm` 与弱化色           |
| `CardContent`     | 卡片内容区，渲染为 `<div>`，固定 `p-6 pt-0` 内边距        |
| `CardFooter`      | 卡片底部操作区，渲染为 `<div>`，固定 `p-6 pt-0` 内边距    |

## 变体

### variant

| 取值          | 说明                                                        |
| ------------- | ----------------------------------------------------------- |
| `default`     | 默认样式（`border-border`）                                 |
| `destructive` | 危险样式，边框 / 文字为 `destructive`，悬停时 5% 透明度背景 |
| `success`     | 成功样式，边框 / 文字为 `success`，悬停时 5% 透明度背景     |
| `warning`     | 警告样式，边框 / 文字为 `warning`，悬停时 5% 透明度背景     |
| `info`        | 信息样式，边框 / 文字为 `info`，悬停时 5% 透明度背景        |

默认值：`default`。

### hover

| 取值    | 说明                                                            |
| ------- | --------------------------------------------------------------- |
| `true`  | 悬停时显示阴影过渡（`hover:shadow-[var(--card-hover-shadow)]`） |
| `false` | 不显示悬停阴影（默认值）                                        |

> 实现细节：实际生效的值是 `isInteractive || hover`。只要卡片**可交互**（未禁用且 `clickable` 为 `true`
> 或传入了 `onClick`），悬停阴影就会自动启用，无需手动传 `hover`。

### size

| 取值      | 说明              |
| --------- | ----------------- |
| `sm`      | 小号卡片（`p-4`） |
| `default` | 默认卡片（`p-6`） |
| `lg`      | 大号卡片（`p-8`） |

默认值：`default`。

> 注意：`size` 只作用于 `Card` 根节点的内边距，`CardHeader` / `CardContent` / `CardFooter` 内部
> 写死了 `p-6` / `p-6 pt-0`，不会跟随 `size` 变化。

### clickable

| 取值    | 说明                                                              |
| ------- | ----------------------------------------------------------------- |
| `true`  | 渲染为 `<button>`，可键盘聚焦、可触发 `onClick`，支持 `type` 属性 |
| `false` | 渲染为 `<div>`，不可聚焦（默认）                                  |

## 属性

`CardProps` 是一个**联合类型**，根据 `clickable` 的取值决定可用的属性集合：

```ts
export type CardProps = (BaseCardProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { clickable: true })
    | (React.HTMLAttributes<HTMLDivElement> & { clickable?: false })
  )) & {
  loading?: boolean;
  rippleColor?: string;
  disabled?: boolean;
  rippleDuration?: number;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  swipeThreshold?: number;
  enableRipple?: boolean;
};
```

| 属性             | 类型                                                             | 默认值           | 说明                                                            |
| ---------------- | ---------------------------------------------------------------- | ---------------- | --------------------------------------------------------------- |
| `variant`        | `'default' \| 'destructive' \| 'success' \| 'warning' \| 'info'` | `'default'`      | 卡片视觉变体                                                    |
| `hover`          | `boolean`                                                        | `false`          | 是否显示悬停阴影（可交互时自动开启）                            |
| `size`           | `'sm' \| 'default' \| 'lg'`                                      | `'default'`      | 卡片内边距尺寸                                                  |
| `clickable`      | `boolean`                                                        | —                | 是否渲染为 `<button>`                                           |
| `loading`        | `boolean`                                                        | —                | 加载状态，为 `true` 时根节点加 `animate-pulse`                  |
| `disabled`       | `boolean`                                                        | —                | 禁用状态，为 `true` 时不触发点击且加 `pointer-events-none`      |
| `rippleColor`    | `string`                                                         | `'currentColor'` | 点击水波纹的颜色                                                |
| `rippleDuration` | `number`                                                         | `600`            | 波纹动画时长（ms），同时决定波纹元素的清理时机                  |
| `enableRipple`   | `boolean`                                                        | `false`          | 是否启用水波纹效果                                              |
| `onSwipe`        | `(direction: 'left' \| 'right' \| 'up' \| 'down') => void`       | —                | 滑动回调                                                        |
| `swipeThreshold` | `number`                                                         | `30`             | 滑动灵敏度阈值（px）                                            |
| `onClick`        | `React.MouseEventHandler`                                        | —                | 点击回调（`clickable` 为 `true` 时来自 `ButtonHTMLAttributes`） |
| `type`           | `'button' \| 'submit' \| 'reset'`                                | —                | 仅 `clickable={true}` 时可用；组件**未设置默认值**              |
| `className`      | `string`                                                         | —                | 自定义类名                                                      |
| `children`       | `React.ReactNode`                                                | —                | 卡片内容                                                        |

本表只列组件自有属性；此外还透传对应原生元素（`<button>` 或 `<div>`）的全部原生属性，
如 `id` / `aria-*` / `data-*` / `on*` 事件。

`CardHeader` / `CardContent` / `CardFooter` 的属性类型为 `React.HTMLAttributes<HTMLDivElement>`，
`CardTitle` 为 `React.HTMLAttributes<HTMLHeadingElement>`，`CardDescription` 为 `React.HTMLAttributes<HTMLParagraphElement>`，
即仅继承原生属性，没有额外自有属性。

## 导出

| 导出名            | 类型 | 说明                             |
| ----------------- | ---- | -------------------------------- |
| `Card`            | 组件 | 卡片根组件，`React.forwardRef`   |
| `CardHeader`      | 组件 | 头部容器                         |
| `CardTitle`       | 组件 | 标题                             |
| `CardDescription` | 组件 | 描述                             |
| `CardContent`     | 组件 | 内容区                           |
| `CardFooter`      | 组件 | 底部操作区                       |
| `CardProps`       | 类型 | `Card` 的 props 类型（联合类型） |

## 无障碍

- `clickable={true}` 时渲染为原生 `<button>`，天然可聚焦、支持 Enter / Space 键触发 `onClick`；
  `clickable={false}` 时渲染为 `<div>`，**不具备**焦点能力与键盘可达性。
- `disabled={true}` 时会设置 `aria-disabled="true"`，并附加 `opacity` 与 `pointer-events-none` 样式。
- 禁用态下 `handleClick` 会直接 `return`，不会触发 `onClick`。
- 卡片本身不设置 `role`；`CardTitle` 渲染为 `<h3>`，可被屏幕阅读器作为标题导航。
- 波纹动画元素是纯装饰 `<span>`，不带 `aria-hidden`，但也没有文本内容。

## 主题变量

| 变量                      | 说明                       |
| ------------------------- | -------------------------- |
| `--card-background`       | 卡片背景色                 |
| `--card-foreground`       | 卡片文字颜色               |
| `--card-border`           | 卡片边框颜色               |
| `--card-hover-shadow`     | 悬停时的阴影               |
| `--card-title`            | 标题文字颜色               |
| `--card-description`      | 描述文字颜色               |
| `--card-content`          | 内容区文字颜色             |
| `--card-disabled-opacity` | 禁用态透明度（默认 `0.5`） |
| `--card-ripple-color`     | 水波纹默认颜色             |

## 组合用法 / 注意事项

1. **`clickable` 决定渲染元素**：`true` → `<button>`，否则 → `<div>`。`<button>` 在 HTML 中默认 `type="submit"`，
   组件**未显式设置** `type` 默认值（实测渲染出的 `<button>` 上没有 `type` 属性，浏览器仍按 `submit` 处理），
   因此**放在 `<form>` 内时请显式传 `type="button"`**，避免意外提交表单。
2. **`disabled` 与元素类型**：`clickable={false}` 时组件渲染为 `<div>`，源码仍会把 `disabled` 作为属性写到
   `<div>` 上（HTML 语义上无效的 `disabled=""`），实际禁用效果来自 `aria-disabled="true"` 与 `pointer-events-none`；
   `clickable={true}` 时则是原生 `<button disabled>`，行为完全符合预期。
3. **水波纹默认关闭**：`enableRipple` 默认为 `false`，此时波纹元素虽会被创建，但带有 `hidden` 类不可见；
   需要展示时传 `enableRipple`。
4. **`rippleDuration` 双重作用**：既是波纹动画时长，也是波纹元素在内存中被清理的延时（毫秒）。
5. **滑动方向判定**：横向位移绝对值大于纵向时判定为 `left` / `right`，否则判定为 `up` / `down`；
   任意方向位移绝对值超过 `swipeThreshold`（默认 `30`px）即触发 `onSwipe`。
6. **阴影只加在可交互卡片上**：`hover` 显式传 `false` 也无法关闭可交互卡片的悬停阴影，
   因为源码使用的是 `isInteractive || hover`。
7. **`size` 不影响子组件内边距**：`CardHeader` / `CardContent` / `CardFooter` 写死了 `p-6` / `p-6 pt-0`，
   只有 `Card` 根节点的内边距随 `size` 变化。
