# AspectRatio 宽高比容器

> 把子元素约束在固定宽高比的容器内，常用于图片、视频与卡片占位。

---

**导入**

```tsx
import { AspectRatio } from '@easbot/ui';
```

## 基础用法

```tsx
import { AspectRatio } from '@easbot/ui';

export default function App() {
  return (
    <div className="w-[320px]">
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://picsum.photos/800/450"
          alt="示例图片"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}
```

配合「外层撑高」技巧铺满容器：

```tsx
<div className="relative w-full" style={{ paddingBottom: `${(9 / 16) * 100}%` }}>
  <AspectRatio ratio={16 / 9} className="absolute inset-0">
    <div className="rounded-lg bg-muted">16:9 比例</div>
  </AspectRatio>
</div>
```

`AspectRatioProps` 是 `React.ComponentProps<typeof AspectRatio>` 的类型别名 —— **无自有成员**，props 与 Radix `AspectRatio` 一致（`ratio` / `className` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 组件**不注入** `role` 与任何 `aria-*` 属性，只是纯粹的布局容器。
- 内部渲染两层元素：外层 `<div data-radix-aspect-ratio-wrapper>`（负责撑高），内层是渲染用户内容的 `<div>`（绝对定位铺满）。
- 内容语义完全由子元素承担（例如 `<img>` 的 `alt`、`<video>` 的字幕轨）；组件不会替你补 `alt`。
- 组件本身不可聚焦。

## 注意事项

- **`src/ui` 层是纯 re-export**：`AspectRatio` 直接等于设计系统层 `src/design-system/components/ui/aspect-ratio.tsx` 的实现，props 与 Radix `AspectRatio` 一致。
- **默认值是 `1`（正方形）**：`ratio` 不传时按 `1 / 1` 计算 —— 传 `ratio={16 / 9}` 表示宽 : 高 = 16 : 9。
- **组件会生成两层 DOM**：外层包裹 div 使用 `position: relative; width: 100%; padding-bottom: <100/ratio>%`，内层使用 `position: absolute; inset: 0`。`className` 落在**内层**（承载 children 的元素）上。
- **内层的 `style` 与 Radix 注入的定位样式合并**：组件把用户的 `style` 与 `position/top/right/bottom/left` 一起写入，用户自定义的 `position` 会被覆盖。
- **组件不带任何默认样式**：没有圆角、没有边框、没有背景色，`className` 追加在末位。
- **宽度由父元素决定**：组件只固定宽高比，宽度始终是 `100%`，需要显式给父级宽度。
- **不消费任何主题 CSS 变量。**

## 导出

### 组件

| 导出名             | 说明 |
| ------------------ | ---- |
| `AspectRatio`      |      |
| `AspectRatioProps` |      |
