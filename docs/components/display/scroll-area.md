# ScrollArea 滚动区域

> 自定义样式的滚动容器，提供细窄滚动条，垂直方向默认启用、水平方向按需开启。

---

**导入**

```tsx
import { ScrollArea, ScrollBar } from '@easbot/ui';
```

## 基础用法

```tsx
import { ScrollArea } from '@easbot/ui';

export default function App() {
  return (
    <ScrollArea className="h-72 w-48 rounded-md border p-4">
      <div className="space-y-4">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm">
            标签 {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
```

开启水平滚动条：

```tsx
<ScrollArea className="w-96 whitespace-nowrap rounded-md border" withHorizontalScrollbar>
  <div className="flex w-max space-x-4 p-4">{items}</div>
</ScrollArea>
```

让滚动条常驻显示：

```tsx
<ScrollArea type="always" className="h-72 w-48 rounded-md border">
  <div style={{ height: '2000px' }}>长内容</div>
</ScrollArea>
```

`ScrollAreaProps` 是 Radix `ScrollAreaPrimitive.Root` 的属性类型，**无自有成员**，全部继承其原生属性（`type` / `dir` / `scrollHideDelay` / `nonce` / `className` / `aria-*` / `data-*` / `on*` 事件等）。

> 注意：`withHorizontalScrollbar` 是 `src/ui` 层自有的属性，**未包含在 `ScrollAreaProps` 类型别名中**（该类型直接 re-export 自 `@radix-ui/react-scroll-area`），但运行时可用。

## 无障碍

- 底层 Radix `ScrollAreaPrimitive.Root` 渲染为 `<div>`，视口渲染为 `<div data-radix-scroll-area-viewport>`；**不输出** `role="scrollbar"`，也没有 `aria-*` 注入。
- 视口可聚焦（Radix 为其注入 `tabIndex`），并带 `focus-visible:outline-1` + `focus-visible:ring-[3px]` 焦点样式 —— 键盘用户可通过方向键滚动内容。
- 滚动条本体是纯装饰（`touch-none select-none`），不承载可读文本。
- 若滚动区域内内容对读屏有意义，请确保内容本身可被读屏访问；滚动区域不会自动播报滚动位置。

## 注意事项

- **`src/ui` 层自行封装了 Radix ScrollArea**：与设计系统层不同，它额外支持 `withHorizontalScrollbar` 属性，并使用 `src/utils/classnames` 的 `cn()`。
- **垂直滚动条默认渲染**：源码中始终渲染一个 `<ScrollBar />`（`orientation="vertical"`）。
- **水平滚动条默认不渲染**：需显式传 `withHorizontalScrollbar={true}`；否则内容虽可横向滚动，但没有带样式的水平滚动条。
- **`ScrollBar` 也可单独使用**：支持 `orientation`（`vertical` / `horizontal`，默认 `vertical`），源码中直接 re-export 自 Radix，可放在任意 `ScrollAreaPrimitive` 容器内。
- **滚动条尺寸**：垂直 `w-2.5`（10px），水平 `h-2.5`（10px）；滑块为 `rounded-full bg-border`。
- **Radix 默认 `type="hover"`**：滚动条需在鼠标进入滚动区后才挂载，移出后按 `scrollHideDelay`（默认 600ms）隐藏。需要常驻显示请传 `type="always"`。
- **原生滚动条被隐藏**：Radix 会为视口注入 `scrollbar-width: none` 等样式，因此必须依靠组件自带的 `ScrollBar` 提供视觉反馈。
- **组件不带高度 / 宽度**：根容器只有 `relative`，需自行通过 `className` 设定尺寸（如 `h-72 w-48`），否则内容不会产生溢出。
- **视口尺寸为 `size-full`**：视口铺满根容器，根容器因此必须有确定高度。
- **圆角继承**：视口使用 `rounded-[inherit]`，会跟随根容器的圆角设置。

## 导出

### 组件

| 导出名            | 说明 |
| ----------------- | ---- |
| `ScrollArea`      |      |
| `ScrollAreaProps` |      |
| `ScrollBar`       |      |
