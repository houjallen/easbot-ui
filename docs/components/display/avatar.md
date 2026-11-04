# Avatar 头像

> 展示用户 / 对象的圆形或方形头像，支持图片、回退文本与在线状态指示点。

---

**导入**

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@easbot/ui';
```

## 基础用法

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@easbot/ui';

export default function App() {
  return (
    <Avatar>
      <AvatarImage src="/avatar.png" alt="用户头像" />
      <AvatarFallback>FB</AvatarFallback>
    </Avatar>
  );
}
```

方形头像与状态指示点：

```tsx
import { Avatar, AvatarFallback } from '@easbot/ui';

export default function App() {
  return (
    <Avatar shape="square" showStatus statusPosition="bottom-right" statusColor="var(--success)">
      <AvatarFallback>FB</AvatarFallback>
    </Avatar>
  );
}
```

## 属性

继承自 `React.ComponentProps<typeof DSAvatar>`。

| 属性              | 类型                                                           | 默认值 | 说明                                       |
| ----------------- | -------------------------------------------------------------- | ------ | ------------------------------------------ |
| `shape?`          | `'circle' \| 'square'`                                         | —      | 头像形状，默认圆形                         |
| `statusColor?`    | `string`                                                       | —      | 状态指示点颜色，仅扩展用（如在线、离线等） |
| `statusPosition?` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | —      | 状态指示点位置，默认为右下角               |
| `showStatus?`     | `boolean`                                                      | —      | 是否显示状态点                             |

`AvatarProps` 是 `Avatar` 的属性接口，继承设计系统层 `Avatar`（Radix `AvatarPrimitive.Root`）的全部原生属性。

本表只列组件自有属性；此外还透传 `<span>` 的全部原生属性（`id` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 底层基于 Radix `AvatarPrimitive.Root`，渲染为 `<span>`，**不提供** `img` 语义角色；可访问名称需由调用方通过 `aria-label` 补充。
- `AvatarImage` 只在图片**加载成功**后才渲染 `<img>`，加载失败或未加载时自动回退到 `AvatarFallback` 的内容。
- `AvatarImage` 的 `alt` 由调用方提供；`AvatarFallback` 的文本内容会作为可读文本被读屏播报（如缩写「FB」）。
- 状态指示点是纯装饰 `<span>`，无文本、无 `aria-*`；若它承载了「在线 / 离线」语义，请自行补充可读文案或 `aria-label`。

## 注意事项

- **`src/ui` 层是设计系统层的再封装**：主题样式与尺寸（`size-8`）全部由设计系统层 `Avatar` 控制，`src/ui` 只额外提供 `shape` 与状态点扩展。
- **`shape` 只改圆角**：默认 `'circle'` 渲染 `rounded-full`；`'square'` 渲染 `rounded-[var(--radius-md)]`（使用主题圆角变量），不会改变组件尺寸。
- **`shape` 与 `statusPosition` 不会透传给底层**：这两个属性在 `src/ui` 层被消费掉，最终落到 DOM 上的只有 `className` 与其余原生属性。
- **`className` 作用于外层包裹 `<span>`**（`relative inline-block align-middle`），而不是内部的头像本体 —— 需要给本体加样式请使用 `AvatarImage` / `AvatarFallback` 上的 `className`。
- **状态点尺寸使用 `em` 单位**（`0.6em`），会随父级字号缩放；其描边使用 `box-shadow: 0 0 0 2px var(--background)`，因此在非 `--background` 底色上可能出现色差。
- **状态点默认颜色为 `var(--success)`**，需要表达其他状态请显式传 `statusColor`。
- **状态点位置四个取值**：`top-left` / `top-right` / `bottom-left` / `bottom-right`，默认 `'bottom-right'`。
- **组件不渲染 `children` 以外的任何默认内容**：`Avatar` 内部只负责容器与状态点，图片与回退内容需自行传入。
- **头像尺寸固定为 `size-8`（32px）**：需要更大 / 更小的头像请通过 `className` 覆盖。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--background`
- `--border`
- `--radius-md`
- `--success`

## 导出

### 组件

| 导出名           | 说明 |
| ---------------- | ---- |
| `Avatar`         |      |
| `AvatarFallback` |      |
| `AvatarImage`    |      |
| `AvatarProps`    |      |
