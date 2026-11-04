# Accordion 手风琴

> 可折叠的内容分组，支持单项展开、多项展开两种模式，用于 FAQ、设置面板等场景。

---

**导入**

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@easbot/ui';

export default function App() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>问题 1</AccordionTrigger>
        <AccordionContent>答案 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>问题 2</AccordionTrigger>
        <AccordionContent>答案 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

同时展开多项：

```tsx
<Accordion type="multiple">
  <AccordionItem value="item-1">
    <AccordionTrigger>问题 1</AccordionTrigger>
    <AccordionContent>答案 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

受控用法：

```tsx
import { useState } from 'react';

const [value, setValue] = useState('item-1');

<Accordion type="single" value={value} onValueChange={setValue}>
  <AccordionItem value="item-1">
    <AccordionTrigger>问题 1</AccordionTrigger>
    <AccordionContent>答案 1</AccordionContent>
  </AccordionItem>
</Accordion>;
```

`AccordionProps` / `AccordionItemProps` / `AccordionTriggerProps` / `AccordionContentProps` 均为 `React.ComponentProps<typeof 对应组件>` 的类型别名 —— **无自有成员**，全部继承 Radix `Accordion` 对应部件的原生属性。

## 无障碍

- `AccordionTrigger` 渲染为原生 `<button type="button">`，并注入 `aria-expanded`（当前展开状态）、`data-state`（`open` / `closed`）、`id`；`aria-controls`（指向对应内容面板）**仅在展开时**才写入。
- **`single` 模式且未开 `collapsible` 时，已展开项的触发器会被注入 `aria-disabled="true"`** —— 该项无法再次收起，读屏会播报「不可用」（这是「单项不可折叠」状态的可感知表达）。
- `AccordionContent` 渲染为 `<div role="region">`，并注入 `aria-labelledby`（指回触发器）、`data-orientation`（`vertical` / `horizontal`）、`data-state`；收起时带 `hidden`，不会出现在无障碍树中。
- 触发器外层被 `AccordionPrimitive.Header` 包裹，渲染为 `<h3>`（`data-slot="accordion-trigger"` 的兄弟节点），提供文档大纲层级。
- 键盘操作：`Home` / `End` 跳到首 / 末个触发器，方向键（`ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight`）在触发器之间移动焦点，`Enter` / `Space` 切换展开状态。
- 禁用的项使用原生 `disabled`，元素不可聚焦，屏幕阅读器播报「不可用」。
- 触发器末尾的 `ChevronDownIcon` 是纯装饰图标（`pointer-events-none`），状态语义由 `aria-expanded` 承担。
- 焦点样式使用 `focus-visible:border-ring` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Accordion` / `AccordionItem` / `AccordionTrigger` / `AccordionContent` 直接等于设计系统层 `src/design-system/components/ui/accordion.tsx` 的实现，props 与 Radix `Accordion` 对应部件完全一致。
- **`type` 是必填项**：取值只有 `single`（单项展开）与 `multiple`（多项展开）；不传会因缺少必填属性而类型报错。
- **`collapsible` 只在 `single` 模式下生效**：默认 `false`，即已展开的项无法再次收起；需要「点一下收起」必须显式传 `collapsible`。
- **`value` / `defaultValue` 的类型随 `type` 变化**：`single` 下是 `string`，`multiple` 下是 `string[]`；`onValueChange` 的回调参数同步变化。
- **触发器与项靠 `value` 关联**：`AccordionItem` 的 `value` 必填且在同一 `Accordion` 内唯一；不匹配的项永远不会被激活。
- **触发器自带下拉箭头**：`AccordionTrigger` 内部固定渲染 `ChevronDownIcon`，展开时通过 `[&[data-state=open]>svg]:rotate-180` 旋转 180°，无需自行添加图标。
- **`AccordionContent` 的 `className` 落在内层容器上**：外层是 `overflow-hidden` 的动画容器（`animate-accordion-up` / `animate-accordion-down`），内层 `<div>` 才是 `pt-0 pb-4` 的内容区，`className` 会合并到内层。
- **内容区默认无内边距上下沿**：`pt-0 pb-4`，需要额外留白请自行传 `className`。
- **项之间有分隔线**：`AccordionItem` 使用 `border-b last:border-b-0`，最后一项不带下边框。
- **支持嵌套**：内容区内部可以再放一层 `Accordion`（见 Storybook 的 `Nested` 示例）。
- **没有 `variant` / `size` 等样式变体**，也不消费任何主题 CSS 变量。

## 导出

### 组件

| 导出名                  | 说明 |
| ----------------------- | ---- |
| `Accordion`             |      |
| `AccordionContent`      |      |
| `AccordionContentProps` |      |
| `AccordionItem`         |      |
| `AccordionItemProps`    |      |
| `AccordionProps`        |      |
| `AccordionTrigger`      |      |
| `AccordionTriggerProps` |      |
