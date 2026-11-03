# Skeleton 骨架屏

> 用于数据加载时的占位展示，通过 `before` 伪元素承载微光扫过（shimmer）动画。

**导入**

```tsx
import { Skeleton } from '@easbot/ui';
```

## 基础用法

```tsx
<Skeleton className="h-4 w-[250px]" />
```

渲染结构：单个 `<div>`，内部用 `before` 伪元素绘制一条从左向右扫过的高光渐变。

## 组成部分

`Skeleton` 为单组件，无子组件。

## 变体

本组件未使用 `cva`，没有 variant 维度。尺寸与形状完全由 `className` 控制
（常用 `h-*` / `w-*` / `rounded-full` / `rounded-xl`）。

## 属性

| 属性        | 类型              | 默认值 | 说明                               |
| ----------- | ----------------- | ------ | ---------------------------------- |
| `className` | `string`          | —      | 自定义类名（尺寸 / 圆角 / 背景等） |
| `children`  | `React.ReactNode` | —      | 子节点（一般留空）                 |

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

组件 props 类型为 `React.HTMLAttributes<HTMLDivElement>`，导出别名 `SkeletonProps`。

## 导出

| 导出名          | 类型 | 说明                                        |
| --------------- | ---- | ------------------------------------------- |
| `Skeleton`      | 组件 | 骨架屏组件，`React.forwardRef` 到 `<div>`   |
| `SkeletonProps` | 类型 | `React.HTMLAttributes<HTMLDivElement>` 别名 |

## 无障碍

- `Skeleton` 是一个空的 `<div>`，**不设置** `role` / `aria-*`，本身不播报任何信息。
- 组件**没有**内置 `aria-hidden` / `aria-busy`，加载态语义需由业务层补充：
  - 外层容器加 `aria-busy="true"`，并用 `aria-live="polite"` 播报「加载中」；
  - 或给骨架块加 `aria-hidden="true"`，避免屏幕阅读器逐个朗读无意义的占位元素。
- 建议骨架块数量与真实内容的可读节点数量保持一致，避免加载完成前后焦点顺序大幅变化。

## 主题变量

| 变量                            | 说明                               |
| ------------------------------- | ---------------------------------- |
| `--skeleton-background`         | 骨架块背景色                       |
| `--skeleton-highlight`          | 微光扫过动画的高光渐变中间色       |
| `--skeleton-border-radius`      | 骨架块默认圆角                     |
| `--skeleton-animation-duration` | 微光扫过动画的单次时长（无限循环） |

## 组合用法 / 注意事项

1. **动画由 `before` 伪元素承载**：骨架块本体是纯色块，高光由 `before` 伪元素的
   `linear-gradient(transparent → var(--skeleton-highlight) → transparent)` 叠加 `animate-[shimmer_...]` 实现。
   因此不要给骨架块设置会覆盖伪元素的 `overflow` 相关样式，否则动画会被裁掉。
2. **`shimmer` 关键帧未在库内定义**：组件引用了 `animate-[shimmer_var(--skeleton-animation-duration)_infinite]`，
   但本库 `src/theme/styles.css` 与 `tw-animate-css` 中**都没有** `@keyframes shimmer` 定义
   （构建产物 `dist/styles.css` 的 `@keyframes` 仅包含 `bounce` / `enter` / `exit` / `gradient` / `ping` / `pulse` / `ripple` / `spin`）。
   实际渲染时浏览器会因找不到关键帧而回退为无动画，只显示静态高光渐变。
   若需要真正的扫过效果，需在消费方自行补充 `@keyframes shimmer`。
3. **默认圆角来自变量**：默认 `rounded-[var(--skeleton-border-radius)]`，
   需要圆形头像占位请传 `className="rounded-full"`（末位合并，优先级最高）。
4. **`data-state="loading"` 联动**：组件额外注册了 `data-[state=loading]:before:animate-[...]`，
   当祖先或自身带 `data-state="loading"` 时同样会触发微光动画，可用于与 Radix 组件的状态联动。
5. **微光动画不自动停止**：组件没有内置「加载完成后停止动画」的逻辑，
   请在数据到达后直接卸载骨架屏（或用 `data-state` 控制）。
6. **配合 `Card` 使用**：`Card` 的 `loading` 属性会让卡片整体 `animate-pulse`，
   若卡片内已放置 `Skeleton`，会出现两层动画叠加，建议二选一。
