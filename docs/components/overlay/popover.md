# Popover 弹出层

> 点击触发的非模态浮层，适合承载筛选器、表单、详情卡片等富内容。

---

**导入**

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@easbot/ui';

export default function App() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">点击查看</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h4 className="font-medium leading-none">尺寸</h4>
        <p className="text-muted-foreground text-sm">设置您的尺寸偏好。</p>
      </PopoverContent>
    </Popover>
  );
}
```

指定弹出方向：

```tsx
<PopoverContent side="top" className="w-60">
  顶部内容
</PopoverContent>
```

## 无障碍

- 底层 Radix Popover 渲染为 `<div role="dialog">`，并注入 `aria-labelledby` / `aria-describedby` / `data-state`（`open` / `closed`）/ `data-side`（弹出方向）。
- 触发器渲染为原生 `<button type="button">`，并注入 `aria-haspopup="dialog"` / `aria-expanded` / `aria-controls` / `data-state`。
- 打开时焦点移入浮层内容，关闭后焦点归还触发元素。
- 键盘操作：`Enter` / `Space` 打开浮层，`Esc` 关闭，`Tab` 在浮层内循环移动焦点。
- 浮层是**非模态**的：不使用 `aria-modal`，页面其余部分仍可交互。
- 焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Popover` / `PopoverTrigger` / `PopoverContent` 直接等于设计系统层的实现（`src/design-system/components/ui/popover.tsx`），组件未新增自有属性，props 与 Radix `Popover` 对应部件完全一致（`open` / `defaultOpen` / `onOpenChange` / `modal` / `side` / `align` / `sideOffset` / `alignOffset` / `collisionPadding` / `disabled` / `className` / `aria-*` / `data-*` 等）。
- **默认 `align="center"`、`sideOffset={4}`**：`PopoverContent` 内置这两个默认值，消费方传入的值会覆盖。
- **内置位置修正**：`enablePositionFix` 默认 `true` —— 组件会监听 `style` / `data-state` 属性变化与窗口 `resize`，若浮层出现负坐标则把 `left` / `top` 修正为 `0`。可用 `enablePositionFix={false}` 关闭。
- **位置修正是内联 style 写入**：修正时直接改写 `element.style.left` / `element.style.top`，会与消费方传入的 `style` 相互影响。
- **`PopoverContent` 内部已自带 `PopoverPrimitive.Portal`**，无需再手动包裹。
- **宽度固定为 `w-72`（288px）**：需要更宽请用 `className` 覆盖（如 `className="w-80"`）。
- **不含 `PopoverAnchor` 导出**：设计系统层虽实现了 `PopoverAnchor`，但 `src/ui/popover/index.ts` 未导出它，消费方无法从包根 import。

## 导出

### 组件

| 导出名                | 说明 |
| --------------------- | ---- |
| `Popover`             |      |
| `PopoverContent`      |      |
| `PopoverContentProps` |      |
| `PopoverProps`        |      |
| `PopoverTrigger`      |      |
| `PopoverTriggerProps` |      |
