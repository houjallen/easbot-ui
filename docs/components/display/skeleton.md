# Skeleton 骨架屏

> 在数据加载完成前占位的灰色块，用于保持页面布局稳定、避免内容跳动。

---

**导入**

```tsx
import { Skeleton } from '@easbot/ui';
```

## 基础用法

```tsx
import { Skeleton } from '@easbot/ui';

export default function App() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
```

卡片骨架：

```tsx
<div className="flex flex-col space-y-3">
  <Skeleton className="h-[125px] w-[250px] rounded-xl" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>
```

`SkeletonProps` 是 `Skeleton` 的属性类型（`React.ComponentProps<typeof DSSkeleton>`），**无自有成员**，全部继承 `<div>` 的原生属性（`id` / `className` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 骨架屏渲染为普通 `<div>`，**不设置** `role` / `aria-*`，读屏会直接跳过。
- 组件**不会**自动播报「加载中」；请在容器上用 `aria-busy="true"` 与 `aria-live` 表达加载状态，或搭配 `Spinner` / `Progress`。
- 骨架块是纯视觉占位，不承载可交互内容；若希望读屏感知加载，请自行补充可读文案。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Skeleton` 直接等于设计系统层 `src/design-system/components/ui/skeleton.tsx` 的实现，未新增任何自有属性。
- **尺寸完全由 `className` 决定**：组件没有内置尺寸，骨架块默认没有宽高（会塌陷成 0），必须显式传 `h-*` / `w-*`。
- **默认圆角为 `rounded-md`**：需要圆形头像位请传 `rounded-full`，需要更方的卡片位请传 `rounded-xl`。
- **默认配色为 `bg-accent`**（弱化背景色），暗色主题下同样跟随主题变量。
- **动画为 `animate-pulse`**（呼吸闪烁），由组件内置，无需额外配置。
- **主题变量 `--skeleton-border-radius` 不由本组件直接引用**：组件使用 Tailwind 的 `rounded-md` 而非该变量。
- **组件不感知加载状态**：骨架屏的显示 / 隐藏完全由调用方控制。

## 导出

### 组件

| 导出名          | 说明 |
| --------------- | ---- |
| `Skeleton`      |      |
| `SkeletonProps` |      |
