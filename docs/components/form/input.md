# Input 输入框

> 单行文本输入控件，支持多种状态与尺寸、前后缀图标、错误态与加载态。

**导入**

```tsx
import { Input } from '@easbot/ui';
```

## 基础用法

```tsx
import { Input } from '@easbot/ui';

export default function App() {
  return <Input placeholder="请输入" />;
}
```

带前后缀图标：

```tsx
import { Search } from 'lucide-react';
import { Input } from '@easbot/ui';

export default function App() {
  return <Input prefix={<Search />} placeholder="搜索..." />;
}
```

## 变体

### variant（状态变体）

| 取值      | 说明                                                |
| --------- | --------------------------------------------------- |
| `default` | 默认样式，hover / focus 时使用默认边框与背景变量    |
| `error`   | 错误态，红色边框与背景，focus 时显示 1px 错误色描边 |
| `success` | 成功态，绿色边框与背景，focus 时显示 1px 成功色描边 |

### size（尺寸变体）

| 取值      | 说明                        |
| --------- | --------------------------- |
| `sm`      | 小号，`h-8 px-3 text-sm`    |
| `default` | 默认，`h-10 px-4 text-base` |
| `lg`      | 大号，`h-12 px-5 text-lg`   |

## 属性

| 属性               | 类型                                | 默认值      | 说明                                         |
| ------------------ | ----------------------------------- | ----------- | -------------------------------------------- |
| `variant`          | `'default' \| 'error' \| 'success'` | `'default'` | 状态变体，由 `cva` 定义                      |
| `size`             | `'sm' \| 'default' \| 'lg'`         | `'default'` | 尺寸变体，由 `cva` 定义                      |
| `prefix`           | `React.ReactNode`                   | —           | 前缀内容（图标或文本），绝对定位在输入框左侧 |
| `suffix`           | `React.ReactNode`                   | —           | 后缀内容（图标或文本），绝对定位在输入框右侧 |
| `error`            | `boolean`                           | —           | 错误状态，优先级高于 `success`               |
| `success`          | `boolean`                           | —           | 成功状态                                     |
| `loading`          | `boolean`                           | —           | 加载状态（自动禁用输入）                     |
| `wrapperClassName` | `string`                            | —           | 包装容器类名（外层 `div`）                   |
| `iconSize`         | `string`                            | `'1rem'`    | 自定义图标尺寸，同时决定前后缀占位框大小     |
| `transition`       | `boolean`                           | `true`      | 过渡动画开关                                 |
| `type`             | `string`                            | `'text'`    | 原生 `input` 的 `type` 属性                  |
| `disabled`         | `boolean`                           | —           | 禁用状态                                     |

本表只列组件自有属性；此外还透传 `<input>` 的全部原生属性，如 `id` / `name` / `value` / `defaultValue` / `placeholder` / `required` / `readOnly` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- 错误态自动设置 `aria-invalid={error}`（未传 `error` 时不渲染该属性），屏幕阅读器会播报「无效」。
- 加载态自动设置 `aria-busy={loading}`。
- 禁用态使用原生 `disabled` 属性，元素不可聚焦，屏幕阅读器会播报「不可用」。
- 焦点样式使用 `focus:border` + `focus:bg` + `focus:text` 组合（`focus:ring-0`），避免默认外发光影响边框观感。
- `readOnly` 状态使用 `read-only:cursor-default`，与 `disabled` 的 `cursor-not-allowed` 区分。

## 主题变量

| 变量                          | 说明         |
| ----------------------------- | ------------ |
| `--form-input-bg`             | 输入框背景色 |
| `--form-input-border`         | 输入框边框色 |
| `--form-input-text`           | 输入框文字色 |
| `--form-input-placeholder`    | 占位符文字色 |
| `--form-input-radius`         | 输入框圆角   |
| `--form-input-hover-bg`       | hover 背景色 |
| `--form-input-hover-border`   | hover 边框色 |
| `--form-input-focus-bg`       | focus 背景色 |
| `--form-input-focus-border`   | focus 边框色 |
| `--form-input-focus-text`     | focus 文字色 |
| `--form-input-error-bg`       | 错误态背景色 |
| `--form-input-error-border`   | 错误态边框色 |
| `--form-input-error-text`     | 错误态文字色 |
| `--form-input-success-bg`     | 成功态背景色 |
| `--form-input-success-border` | 成功态边框色 |
| `--form-input-success-text`   | 成功态文字色 |

## 组合用法 / 注意事项

- **状态优先级**：`error > success > variant`。传入 `error` 时，即使同时设置了 `variant="success"`，实际渲染的仍是 `error` 样式。
- **`loading` 会自动禁用**：`disabled={disabled || loading}`，输入框在加载期间不可编辑。
- **`prefix` / `suffix` 必须是单个 React 元素**：内部使用 `React.cloneElement` 注入 `className` 与 `style`，传入字符串或数组会报错；图标需自行设置尺寸，组件通过 `iconSize` 统一控制占位框大小。
- **前后缀会撑开输入内边距**：存在 `prefix` 时自动追加 `pl-8`，存在 `suffix` 时自动追加 `pr-8`。
- **`wrapperClassName` 与 `className` 作用层级不同**：`wrapperClassName` 作用于外层 `div`，`className` 作用于 `<input>` 本身。

## 导出

| 导出名          | 类型                                | 说明                                    |
| --------------- | ----------------------------------- | --------------------------------------- |
| `Input`         | `React.ForwardRefExoticComponent`   | 输入框组件，ref 指向 `HTMLInputElement` |
| `inputVariants` | `ReturnType<typeof cva>`            | 输入框 `cva` 变体定义                   |
| `InputProps`    | `interface`                         | 输入框属性接口                          |
| `InputVariant`  | `'default' \| 'error' \| 'success'` | 状态变体类型                            |
| `InputSize`     | `'sm' \| 'default' \| 'lg'`         | 尺寸变体类型                            |
