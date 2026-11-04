# Collapsible 折叠面板

> 单一区域的展开 / 收起控件，常用于「查看详情」「展开更多」这类单块内容。

---

**导入**

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@easbot/ui';

export default function App() {
  return (
    <Collapsible>
      <CollapsibleTrigger>点击展开</CollapsibleTrigger>
      <CollapsibleContent>这是可折叠的内容区域</CollapsibleContent>
    </Collapsible>
  );
}
```

受控用法：

```tsx
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger>详细信息</CollapsibleTrigger>
  <CollapsibleContent>更多内容</CollapsibleContent>
</Collapsible>;
```

初始展开：

```tsx
<Collapsible defaultOpen>
  <CollapsibleTrigger>默认展开</CollapsibleTrigger>
  <CollapsibleContent>内容</CollapsibleContent>
</Collapsible>
```

`CollapsibleProps` / `CollapsibleTriggerProps` / `CollapsibleContentProps` 均为 `React.ComponentProps<typeof 对应组件>` 的类型别名 —— **无自有成员**，全部继承 Radix `Collapsible` 对应部件的原生属性（`open` / `defaultOpen` / `onOpenChange` / `disabled` / `className` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- `CollapsibleTrigger` 渲染为原生 `<button type="button">`，并注入 `aria-expanded`（当前展开状态）、`data-state`（`open` / `closed`）；`aria-controls`（指向对应内容面板）**仅在展开时**才写入。
- 收起时 `CollapsibleContent` 带 `hidden` 属性，不出现在无障碍树中；展开时内容才被渲染进 DOM。
- 键盘操作：`Enter` / `Space` 触发原生 `<button>` 的点击，从而切换展开状态。
- 禁用态使用原生 `disabled`（由根组件的 `disabled` 向下传递），元素不可聚焦，屏幕阅读器播报「不可用」。
- 组件**不注入** `role` —— 内容区是普通 `<div>`，语义由内容自身承担。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` 直接等于设计系统层 `src/design-system/components/ui/collapsible.tsx` 的实现，未新增任何自有属性。
- **组件完全没有内置样式**：设计系统层只透传 `data-slot`，不加任何类名 —— 内容区默认既无边框、无背景、无内边距，也**没有展开 / 收起动画**。需要视觉样式请自行通过 `className` 添加。
- **与 Accordion 的关系**：`Accordion` 底层就是一组 `Collapsible`；如果只是单块内容，用 `Collapsible` 更轻量。需要多组互斥展开请用 `Accordion`。
- **`CollapsibleContent` 收起时会卸载内容**：内部通过 `Presence` 控制渲染，收起后子元素从 DOM 中移除（若需保持状态请自行把状态提到外部）。
- **内容区会写入两个 CSS 变量**：Radix 在内容元素上注入 `--radix-collapsible-content-height` / `--radix-collapsible-content-width`，可用于自定义高度动画。
- **`CollapsibleContent` 支持 `forceMount`**：传 `forceMount` 可让内容常驻 DOM（配合 `hidden` 控制可见性），便于自行实现动画。
- **触发器的 `onClick` 不会被覆盖**：Radix 通过 `composeEventHandlers` 把它与内部的切换逻辑组合起来，调用方自己的 `onClick` 依然会执行。
- **默认收起**：`defaultOpen` 默认 `false`。

## 导出

### 组件

| 导出名                    | 说明 |
| ------------------------- | ---- |
| `Collapsible`             |      |
| `CollapsibleContent`      |      |
| `CollapsibleContentProps` |      |
| `CollapsibleProps`        |      |
| `CollapsibleTrigger`      |      |
| `CollapsibleTriggerProps` |      |
