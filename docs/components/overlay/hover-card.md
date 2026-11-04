# HoverCard 悬停卡片

> 悬停触发的信息卡片，鼠标移入后自动展开，适合展示预览、简介等只读内容。

---

**导入**

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@easbot/ui';

export default function App() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">悬停查看</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <h4 className="font-semibold text-sm">提示信息</h4>
        <p className="text-sm">这是一个悬停卡片示例</p>
      </HoverCardContent>
    </HoverCard>
  );
}
```

## 无障碍

- 底层 Radix HoverCard 渲染为 `<div role="dialog">`，并注入 `aria-labelledby` / `aria-describedby` / `data-state`（`open` / `closed`）/ `data-side`（展开方向）。
- 触发器渲染为原生 `<button type="button">`，并注入 `aria-haspopup="dialog"` / `aria-expanded` / `aria-controls` / `data-state`。
- 浮层是**非模态**的：不使用 `aria-modal`，页面其余部分仍可交互。
- 键盘操作：焦点进入触发器时也会展开浮层（键盘用户不依赖鼠标悬停）；`Esc` 关闭，关闭后焦点归还触发元素。
- 焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。

## 注意事项

- **`src/ui` 层是纯 re-export**：`HoverCard` / `HoverCardTrigger` / `HoverCardContent` 直接等于设计系统层的实现（`src/design-system/components/ui/hover-card.tsx`），组件未新增自有属性，props 与 Radix `HoverCard` 对应部件完全一致（`open` / `defaultOpen` / `onOpenChange` / `openDelay` / `closeDelay` / `side` / `align` / `sideOffset` / `className` / `aria-*` / `data-*` 等）。
- **默认 `align="center"`、`sideOffset={4}`**：`HoverCardContent` 内置这两个默认值，消费方传入的值会覆盖。
- **悬停延迟由 Radix 控制**：打开 / 关闭有默认延迟（`openDelay` / `closeDelay`），可通过 `HoverCard` 根组件调整。
- **`HoverCardContent` 内部已自带 `HoverCardPrimitive.Portal`**，无需再手动包裹。
- **宽度固定为 `w-64`（256px）**：需要更宽请用 `className` 覆盖。
- **不提供 `HoverCardAnchor` 导出**：设计系统层未实现 `HoverCardAnchor`。
- **与 Tooltip 的区别**：`Tooltip` 承载的是简短文字说明（通常一行），`HoverCard` 承载的是可交互的富内容（可含标题、链接、按钮）。
- **Storybook 中的 `size` / `variant` 属性不存在**：源码未定义这两项，Story 里的用法带有 `@ts-expect-error` 注释，属于演示代码而非真实 API。

## 导出

### 组件

| 导出名                  | 说明 |
| ----------------------- | ---- |
| `HoverCard`             |      |
| `HoverCardContent`      |      |
| `HoverCardContentProps` |      |
| `HoverCardProps`        |      |
| `HoverCardTrigger`      |      |
| `HoverCardTriggerProps` |      |
