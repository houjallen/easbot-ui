# Textarea 多行文本输入框

> 多行文本输入控件，支持自适应高度、自定义滚动条、长度限制与错误/成功状态。

**导入**

```tsx
import { Textarea } from '@easbot/ui';
```

## 基础用法

```tsx
import { Textarea } from '@easbot/ui';

export default function App() {
  return <Textarea placeholder="请输入内容" />;
}
```

自适应高度并限制最大高度：

```tsx
import { Textarea } from '@easbot/ui';

export default function App() {
  return <Textarea autoSize maxHeight={200} placeholder="内容自动撑高，最多 200px" />;
}
```

## 变体

### variant（状态变体）

| 取值      | 说明                                                |
| --------- | --------------------------------------------------- |
| `default` | 默认样式，hover / focus 使用默认边框与背景变量      |
| `error`   | 错误态，红色边框与背景，focus 时显示 1px 错误色描边 |
| `success` | 成功态，绿色边框与背景，focus 时显示 1px 成功色描边 |

### size（尺寸变体）

| 取值      | 说明                  |
| --------- | --------------------- |
| `sm`      | 小号，`p-2 text-sm`   |
| `default` | 默认，`p-3 text-base` |
| `lg`      | 大号，`p-4 text-lg`   |

## 属性

| 属性            | 类型                                | 默认值      | 说明                                              |
| --------------- | ----------------------------------- | ----------- | ------------------------------------------------- |
| `variant`       | `'default' \| 'error' \| 'success'` | `'default'` | 状态变体，由 `cva` 定义                           |
| `size`          | `'sm' \| 'default' \| 'lg'`         | `'default'` | 尺寸变体，由 `cva` 定义                           |
| `className`     | `string`                            | —           | 自定义类名                                        |
| `disabled`      | `boolean`                           | —           | 禁用状态                                          |
| `maxLength`     | `number`                            | —           | 最大输入长度                                      |
| `error`         | `boolean`                           | —           | 错误状态，优先级高于 `success`                    |
| `success`       | `boolean`                           | —           | 成功状态                                          |
| `autoSize`      | `boolean`                           | `false`     | 是否启用自动调整高度                              |
| `maxHeight`     | `number \| string`                  | —           | 最大高度，`autoSize` 启用时生效；数字按 `px` 处理 |
| `useScrollArea` | `boolean`                           | `true`      | 是否使用自定义滚动条（Radix ScrollArea）          |

本表只列组件自有属性；此外还透传 `<textarea>` 的全部原生属性，如 `id` / `name` / `value` / `defaultValue` / `placeholder` / `rows` / `required` / `readOnly` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- 错误态自动设置 `aria-invalid={error}`（未传 `error` 时不渲染该属性）。
- 禁用态使用原生 `disabled` 属性，元素不可聚焦。
- 焦点样式使用 `focus-visible:outline-none focus-visible:ring-0`，由边框色变化表达焦点态，避免默认外发光。
- 使用 `useScrollArea` 时，真实焦点仍在 `<textarea>` 上；组件在 `onFocus` / `onBlur` 时给外层容器添加 / 移除 `textarea-focused` 类，用于同步边框高亮。
- 占位符颜色由 `--form-input-placeholder` 控制。

## 主题变量

| 变量                             | 说明                                     |
| -------------------------------- | ---------------------------------------- |
| `--form-input-radius`            | 输入框圆角                               |
| `--form-input-bg`                | 输入框背景色                             |
| `--form-input-border`            | 输入框边框色                             |
| `--form-input-text`              | 输入框文字色                             |
| `--form-input-placeholder`       | 占位符文字色                             |
| `--form-input-hover-bg`          | hover 背景色                             |
| `--form-input-hover-border`      | hover 边框色                             |
| `--form-input-focus-bg`          | focus 背景色                             |
| `--form-input-focus-border`      | focus 边框色                             |
| `--form-input-focus-text`        | focus 文字色                             |
| `--form-input-error-bg`          | 错误态背景色                             |
| `--form-input-error-border`      | 错误态边框色                             |
| `--form-input-error-text`        | 错误态文字色                             |
| `--form-input-success-bg`        | 成功态背景色                             |
| `--form-input-success-border`    | 成功态边框色                             |
| `--form-input-success-text`      | 成功态文字色                             |
| `--textarea-padding`             | ScrollArea 包裹时的内边距，缺省 `0.5rem` |
| `--scroll-bar-width`             | 自定义滚动条宽度                         |
| `--scroll-bar-padding`           | 自定义滚动条内边距                       |
| `--scroll-bar-hover-bg`          | 自定义滚动条 hover 背景色                |
| `--scroll-bar-thumb-radius`      | 自定义滑块圆角                           |
| `--scroll-bar-thumb-color`       | 自定义滑块颜色                           |
| `--scroll-bar-thumb-hover-color` | 自定义滑块 hover 颜色                    |
| `--scroll-bar-thumb-max-size`    | 自定义滑块最大尺寸                       |

## 组合用法 / 注意事项

- **`useScrollArea` 与 `autoSize` 互斥**：当 `autoSize` 为 `true` 时，即使 `useScrollArea` 为 `true` 也会直接渲染原生 `<textarea>`（不套 ScrollArea）；反之 `useScrollArea={false}` 且 `autoSize={false}` 时渲染原生 `<textarea>` 并使用原生滚动条。
- **`autoSize` 依赖内容变化**：组件在 `onInput` 时重算 `scrollHeight` 并写入 `style.height`；挂载时也会延迟 0ms 计算一次初始高度，因此初始有内容时高度正确。
- **`maxHeight` 超限后出现滚动条**：内容高度超过 `maxHeight` 时写入 `style.overflowY = 'auto'` 并提前返回，否则设置 `overflowY = 'hidden'`。
- **状态优先级**：`error > success > variant`。
- **`useScrollArea` 场景下 `className` 会被保留**：ScrollArea 包裹时通过 `cloneElement` 合并类名，源码中显式保留调用方的 `className`，不会被覆盖丢失。
- **ScrollArea 场景下的样式差异**：内部 `<textarea>` 会被改写为透明背景、无边框、`padding: 0`、`resize: none`，实际内边距由外层 `div` 的 `p-[var(--textarea-padding,0.5rem)]` 提供。

## 导出

| 导出名             | 类型                              | 说明                                               |
| ------------------ | --------------------------------- | -------------------------------------------------- |
| `Textarea`         | `React.ForwardRefExoticComponent` | 多行文本输入框组件，ref 指向 `HTMLTextAreaElement` |
| `textareaVariants` | `ReturnType<typeof cva>`          | 多行文本输入框 `cva` 变体定义                      |
| `TextareaProps`    | `interface`                       | 多行文本输入框属性接口                             |
