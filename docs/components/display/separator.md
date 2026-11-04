# Separator 分隔线

> 在相邻内容之间绘制一条细线，用于划分区块。

---

**导入**

```tsx
import { Separator } from '@easbot/ui';
```

## 基础用法

```tsx
import { Separator } from '@easbot/ui';

export default function App() {
  return (
    <div>
      <p>上方内容</p>
      <Separator />
      <p>下方内容</p>
    </div>
  );
}
```

垂直分隔线：

```tsx
<div className="flex items-center gap-4">
  <span>左侧</span>
  <Separator orientation="vertical" className="h-4" />
  <span>右侧</span>
</div>
```

语义化分隔线（`decorative={false}`）：

```tsx
<Separator decorative={false} />
```

`SeparatorProps` 是 `Separator` 的属性类型（`React.ComponentProps<typeof DSSeparator>`），**无自有成员**，全部继承 Radix `SeparatorPrimitive.Root` 的原生属性（`orientation` / `decorative` / `className` / `aria-*` / `data-*` 等）。

## 无障碍

- 底层 Radix `SeparatorPrimitive.Root` 在 `decorative` 为真（默认）时渲染为 `role="none"`，读屏会完全跳过该元素。
- `decorative={false}` 时渲染为 `role="separator"`，并注入 `aria-orientation`（`horizontal` / `vertical`），读屏会播报「分隔线」及其方向。
- 组件**不注入** `aria-hidden`，语义完全由 `decorative` 决定。
- 分隔线不可聚焦，无键盘交互。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Separator` 直接等于设计系统层 `src/design-system/components/ui/separator.tsx` 的实现，props 与 Radix `Separator` 完全一致。
- **`decorative` 默认为 `true`**：默认渲染为装饰性分隔线（`role="none"`）。仅当分隔线**确实**划分了有意义的两块内容时才传 `decorative={false}`。
- **`orientation` 默认为 `horizontal`**：水平分隔线为 `w-full h-px`，垂直分隔线为 `h-full w-px`。
- **垂直分隔线需要显式高度**：垂直方向的类名是 `h-full`，父容器若无确定高度则分隔线高度为 0 —— 请传 `className="h-4"` 之类的高度。
- **方向由 `data-orientation` 属性驱动样式**（`data-[orientation=horizontal]:h-px` 等），切换方向无需额外写类名。
- **配色为 `bg-border`**（边框色），是一条 1px 的实心线。
- **`className` 合并到末位**，自定义类名优先级最高。

## 导出

### 组件

| 导出名           | 说明 |
| ---------------- | ---- |
| `Separator`      |      |
| `SeparatorProps` |      |
