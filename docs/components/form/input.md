# Input 输入框

> 单行文本输入控件，支持前后缀图标、错误 / 成功 / 加载状态。

---

**导入**

```tsx
import { Input } from '@easbot/ui';
```

## 基础用法

```tsx
import { Input } from '@easbot/ui';

export default function App() {
  return <Input placeholder="请输入内容" />;
}
```

带前缀 / 后缀图标：

```tsx
import { Search } from 'lucide-react';
import { Input } from '@easbot/ui';

export default function App() {
  return <Input prefix={<Search />} placeholder="搜索..." />;
}
```

错误态 / 成功态 / 加载态：

```tsx
<Input error placeholder="输入有误" />
<Input success placeholder="输入正确" />
<Input loading placeholder="校验中..." />
```

## 属性

继承自 `Omit<React.ComponentProps<typeof DsInput>, 'size' | 'prefix'>`。

| 属性                | 类型              | 默认值   | 说明                           |
| ------------------- | ----------------- | -------- | ------------------------------ |
| `prefix?`           | `React.ReactNode` | —        | 前缀内容（通常是图标或文本）。 |
| `suffix?`           | `React.ReactNode` | —        | 后缀内容（通常是图标或文本）。 |
| `error?`            | `boolean`         | `false`  | 错误状态。                     |
| `success?`          | `boolean`         | `false`  | 成功状态。                     |
| `loading?`          | `boolean`         | `false`  | 加载状态。                     |
| `wrapperClassName?` | `string`          | —        | 外部包裹 `div` 的 CSS 类名。   |
| `iconSize?`         | `string`          | `'1rem'` | 前缀/后缀图标的尺寸。          |

`InputProps` 为 `EunInputProps` 的别名。本表只列组件自有属性（`prefix` / `suffix` / `error` / `success` / `loading` / `wrapperClassName` / `iconSize`）；此外还透传 `<input>` 的全部原生属性（`id` / `name` / `value` / `defaultValue` / `placeholder` / `required` / `readOnly` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- `error` 为真时注入 `aria-invalid="true"`，屏幕阅读器会播报「无效」；未开启错误态时**不渲染**该属性。
- `loading` 为真时注入 `aria-busy="true"`。
- 加载态会强制禁用输入框（原生 `disabled`），元素不可聚焦、不可编辑，屏幕阅读器播报「不可用」。
- 焦点样式使用 `focus-visible:border-ring` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。
- 前后缀容器是纯装饰（无文本、无 `aria-*`），输入语义由 `placeholder` 或调用方传入的 `aria-label` 承担。

## 注意事项

- **状态优先级**：`error > success > 默认`。同时传 `error` 与 `success` 时按错误态渲染。
- **`loading` 会强制禁用**：`disabled={disabled || loading}`，无法通过 `disabled={false}` 覆盖。
- **原生 `size` 属性被排除**：组件内部 `Omit<..., 'size' | 'prefix'>` 去掉了原生 `size`，传入不生效。
- **前后缀会撑开输入内边距**：存在 `prefix` 时追加 `pl-10`，存在 `suffix` 时追加 `pr-10`（固定 2.5rem 预留位）。
- **`iconSize` 只改图标大小，不改预留位**：默认 `'1rem'`，仅注入到前后缀元素的 `fontSize` / `width` / `height`，占位框始终是 `w-10`。
- **前后缀必须是单个 React 元素**：内部用 `React.cloneElement` 注入尺寸；传入字符串 / 数组不会被克隆（可渲染，但不受尺寸控制）。
- **两个类名作用层级不同**：`wrapperClassName` 作用于外层包裹 `div`，`className` 作用于 `<input>` 本身。
- **`aria-*` 可被覆盖**：`aria-invalid` / `aria-busy` 写在 `{...props}` 之前，调用方显式传入的值优先。
- **无 `warning` 状态**：源码注释说明警告态的视觉反馈建议由外层表单项组件处理。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--destructive`
- `--success`

## 导出

### 组件

| 导出名       | 说明 |
| ------------ | ---- |
| `Input`      |      |
| `InputProps` |      |
| `InputRef`   |      |
