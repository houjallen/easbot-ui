# ScrollArea 滚动区域

> 用于在固定尺寸容器内提供自定义样式的滚动区域，基于 Radix `ScrollArea` primitive，自带纵横两条滚动条。

**导入**

```tsx
import { ScrollArea, ScrollBar } from '@easbot/ui';
```

## 基础用法

```tsx
<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">很长很长很长的内容……</div>
</ScrollArea>
```

渲染结构：根节点为 Radix `ScrollArea.Root`（`<div>`，固定 `relative overflow-hidden`），
内部依次为 `ScrollArea.Viewport`（`<div>`，承载 `children`）、垂直 `ScrollBar`、水平 `ScrollBar`
以及 `ScrollArea.Corner`（两个滚动条交汇处的占位块）。

## 组成部分

| 子组件      | 渲染元素 | 说明                                                             |
| ----------- | -------- | ---------------------------------------------------------------- |
| `ScrollBar` | `<div>`  | 自定义滚动条，内部包含一个 `ScrollArea.Thumb` 滑块，默认垂直方向 |

`ScrollArea` 组件内部已经自动渲染了**两条**滚动条（垂直 + 水平）与一个 `Corner`，
通常无需手动使用 `ScrollBar`。

## 变体

### ScrollBar 的 orientation

| 取值           | 说明                                                   |
| -------------- | ------------------------------------------------------ |
| `'vertical'`   | 垂直滚动条（默认值），宽度由 `--scroll-bar-width` 决定 |
| `'horizontal'` | 水平滚动条，高度由 `--scroll-bar-width` 决定           |

## 属性

### ScrollArea

`ScrollArea` 的 props 类型为 `React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>`，即 Radix `ScrollArea.Root` 的全部属性：

| 属性              | 类型                                        | 默认值    | 说明                                          |
| ----------------- | ------------------------------------------- | --------- | --------------------------------------------- |
| `type`            | `'auto' \| 'always' \| 'scroll' \| 'hover'` | `'hover'` | 滚动条显示策略：自动 / 常驻 / 滚动时 / 悬停时 |
| `dir`             | `'ltr' \| 'rtl'`                            | `'ltr'`   | 滚动方向                                      |
| `scrollHideDelay` | `number`                                    | `600`     | 滚动条隐藏延时（毫秒）                        |
| `className`       | `string`                                    | —         | 根节点自定义类名                              |

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

### ScrollBar

`ScrollBar` 的 props 类型为 `React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>`，即 Radix `ScrollAreaScrollbar` 的全部属性：

| 属性          | 类型                         | 默认值       | 说明                               |
| ------------- | ---------------------------- | ------------ | ---------------------------------- |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 滚动条方向                         |
| `forceMount`  | `true`                       | —            | 强制挂载滚动条（自定义动画时使用） |
| `className`   | `string`                     | —            | 滚动条自定义类名                   |

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性。

## 导出

| 导出名            | 类型 | 说明                                              |
| ----------------- | ---- | ------------------------------------------------- |
| `ScrollArea`      | 组件 | 滚动区域根组件，`React.forwardRef` 到根 `<div>`   |
| `ScrollBar`       | 组件 | 自定义滚动条组件                                  |
| `ScrollAreaProps` | 类型 | 直接复用 Radix `ScrollAreaProps` 类型（重新导出） |

> 注意：本目录**没有**导出 `ScrollBarProps` 类型。

## 无障碍

- Radix `ScrollArea` **不会**自动添加 `role="region"` / `aria-label` 等语义属性，
  根节点只是带 `dir` 与 `relative overflow-hidden` 的 `<div>`。
  如需让屏幕阅读器识别出这是一个可滚动区域，请自行传入 `role="region"` 与 `aria-label`。
- 视口（`data-radix-scroll-area-viewport`）带 `overflow-x: scroll` / `overflow-y: scroll`，
  并通过内联 `<style>` 隐藏原生滚动条（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`），
  滚动能力完全由 Radix 的自定义滚动条提供。
- 根节点未设置 `tabIndex`，视口也未设置 `tabIndex`，键盘用户无法通过 Tab 直接聚焦滚动区域；
  需要时可通过 `className` 或原生属性补齐 `tabIndex={0}`。
- 滚动条通过 `ScrollAreaThumb` 渲染为可拖拽滑块，支持鼠标拖动与触控滚动；
  滑块本身不是 `role="scrollbar"` 语义元素。
- `type="hover"`（默认）时滚动条在鼠标离开后自动隐藏，不影响内容的键盘可访问性。

## 主题变量

| 变量                             | 说明                               |
| -------------------------------- | ---------------------------------- |
| `--scroll-bar-width`             | 滚动条厚度（垂直为宽、水平为高）   |
| `--scroll-bar-padding`           | 滚动条内边距                       |
| `--scroll-bar-thumb-radius`      | 滑块圆角                           |
| `--scroll-bar-thumb-color`       | 滑块默认颜色                       |
| `--scroll-bar-thumb-hover-color` | 滑块悬停颜色                       |
| `--scroll-bar-thumb-max-size`    | 滑块最大尺寸（垂直为高、水平为宽） |
| `--scroll-bar-hover-bg`          | 滚动条悬停背景色                   |

## 组合用法 / 注意事项

1. **必须显式设置高度**：`ScrollArea` 的视口为 `h-full w-full`，容器没有高度时内容不会被裁剪、也不会出现滚动条。
   请通过 `className` 传 `h-72`、`max-h-[400px]` 等高度约束。
2. **两条滚动条已内置**：垂直与水平滚动条都由 `ScrollArea` 内部自动渲染，
   额外的 `ScrollBar` 仅用于自定义样式或替换默认滚动条。
3. **水平滚动条高度写法**：源码中水平方向的类是 `h-[var(--scroll-bar-width)] w-full`
   （即高度取滚动条宽度变量），请留意这一实现细节。
4. **滑块不会占满轨道**：垂直滑块有 `max-h-[var(--scroll-bar-thumb-max-size)]`、
   水平滑块有 `max-w-[var(--scroll-bar-thumb-max-size)]`，避免短内容时滑块铺满整条轨道。
5. **与 `Textarea` 组合**：`Textarea` 自带 `useScrollArea` 开关，
   若已在外层套了 `ScrollArea`，请把 `Textarea` 的 `useScrollArea` 设为 `false`，避免嵌套两层滚动区域。
