# Tag 标签

> 紧凑的圆角标签，用于标记分类、状态或枚举值，支持 7 种配色、3 种尺寸与自定义颜色。

---

**导入**

```tsx
import { Tag, TagSize, TagVariant } from '@easbot/ui';
```

## 基础用法

```tsx
import { Tag } from '@easbot/ui';

export default function App() {
  return <Tag>默认标签</Tag>;
}
```

配色与尺寸：

```tsx
<Tag variant="success">成功</Tag>
<Tag variant="warning">警告</Tag>
<Tag variant="info">信息</Tag>
<Tag variant="error">错误</Tag>
<Tag variant="secondary">次要</Tag>
<Tag variant="outline">轮廓</Tag>

<Tag size="sm">小</Tag>
<Tag size="md">中</Tag>
<Tag size="lg">大</Tag>
```

带图标与可关闭：

```tsx
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Tag } from '@easbot/ui';

export default function App() {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Tag icon={<CheckCircle size={14} />} variant="success">
        成功
      </Tag>
      {visible && (
        <Tag closable onClose={() => setVisible(false)}>
          可关闭标签
        </Tag>
      )}
    </>
  );
}
```

自定义颜色：

```tsx
<Tag color="#722ed1">自定义紫色</Tag>
```

## 属性

继承自 `React.HTMLAttributes<HTMLSpanElement>, UiMessageProps`。

| 属性        | 类型                            | 默认值 | 说明                             |
| ----------- | ------------------------------- | ------ | -------------------------------- |
| `children?` | `React.ReactNode`               | —      | 标签文本内容                     |
| `variant?`  | `TagVariant`                    | —      | 主题变体                         |
| `size?`     | `TagSize`                       | —      | 尺寸                             |
| `closable?` | `boolean`                       | —      | 是否可关闭                       |
| `onClose?`  | `(e: React.MouseEvent) => void` | —      | 关闭事件                         |
| `icon?`     | `React.ReactNode`               | —      | 图标                             |
| `color?`    | `string`                        | —      | 自定义颜色（优先级高于 variant） |
| `asChild?`  | `boolean`                       | —      | 是否作为子元素渲染               |

`TagProps` 是 `Tag` 的属性接口，继承 `React.HTMLAttributes<HTMLSpanElement>` 与 `UiMessageProps`（`locale` / `messages`，用于覆盖关闭按钮文案）。

本表只列组件自有属性；此外还透传 `<span>` 的全部原生属性（`id` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

### 变体映射表（非 cva）

`Tag` **不使用 `cva`**，配色与尺寸由两张普通映射表决定：

**`tagVariantClass`（配色）**

| variant     | 类名                                                    |
| ----------- | ------------------------------------------------------- |
| `default`   | `bg-gray-100 text-gray-800 border border-gray-200`      |
| `success`   | `bg-green-50 text-green-700 border border-green-200`    |
| `warning`   | `bg-yellow-50 text-yellow-700 border border-yellow-200` |
| `info`      | `bg-blue-50 text-blue-700 border border-blue-200`       |
| `error`     | `bg-red-50 text-red-700 border border-red-200`          |
| `secondary` | `bg-gray-200 text-gray-700 border border-gray-300`      |
| `outline`   | `bg-transparent text-gray-800 border border-gray-300`   |

**`tagSizeClass`（尺寸）**

| size | 类名                            |
| ---- | ------------------------------- |
| `sm` | `text-xs px-2 py-0.5 h-6`       |
| `md` | `text-sm px-3 py-1 h-8`（默认） |
| `lg` | `text-base px-4 py-1.5 h-10`    |

## 无障碍

- 组件渲染为 `<span>`，本身不设置 `role`；可通过 `aria-label` 等属性补充语义。
- 可关闭时内部渲染一个原生 `<button type="button">`，带 `aria-label`（内置 `toast` 文案域的「关闭通知」/ `Dismiss notification`，可用 `messages` 覆盖），图标为纯装饰。
- 关闭按钮显式设置 `tabIndex={0}`，可用 `Tab` 键聚焦；焦点样式使用 `focus:ring-2 focus:ring-primary`。
- 图标容器（`<span class="mr-1 flex-shrink-0">`）是纯装饰，无文本、无 `aria-*`。
- 标签文字被包在独立 `<span>` 中，因此 `className` 上的 `[&>span]:max-w-24` 等选择器会作用在**文字节点**上（而非图标容器）。

## 注意事项

- **`Tag` 不使用 `cva`**：配色与尺寸查 `tagVariantClass` / `tagSizeClass` 两张普通对象表，表本身**未导出**，消费方无法从包根 import。
- **`color` 优先级高于 `variant`**：传入 `color` 时会以内联样式覆盖背景色、边框色与文字色（文字固定为 `#fff`），此时 `variant` 的配色完全失效。
- **`color` 的内联样式会覆盖 `style` 中的同名属性**：源码先展开 `...style` 再写入 `backgroundColor` / `borderColor` / `color`。
- **文字固定包裹一层 `<span>`**：源码渲染 `{children}` 时恒定包一层 `<span>`，因此 `children` 传字符串或节点都可，但外层始终多一个元素。
- **图标在前、文字在后**：图标容器带 `mr-1` 间距。
- **`asChild` 可用**：Radix `Slot` 要求**单个** React 元素子节点，因此本组件在 `asChild` 分支把「图标 / 文字 / 关闭按钮」三部分内容包装进**一个** `<span className="inline-flex items-center">` 后再交给 `Slot` —— 修复前直接渲染 3 个子节点会抛 `Slot failed to slot onto its children`。注意包装后 DOM 多一层 `<span>`，`className` 会落在该包装层上。
- **关闭按钮不阻止事件冒泡**：`onClose` 触发后事件仍会冒泡到外层容器。
- **配色是硬编码的 Tailwind 灰色系**：不随主题切换（不走 CSS 变量），暗色主题下需要自行用 `className` 覆盖。
- **`className` 合并到末位**，自定义类名优先级最高。

## 导出

### 组件

| 导出名       | 说明 |
| ------------ | ---- |
| `Tag`        |      |
| `TagProps`   |      |
| `TagSize`    |      |
| `TagVariant` |      |
