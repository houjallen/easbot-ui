# HoverCard 悬停卡片

> 鼠标悬停（或键盘聚焦）时自动展开的信息卡片，适合展示用户资料、预览与快捷操作。

**导入**

```tsx
import { HoverCard } from '@easbot/ui';
```

## 基础用法

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@easbot/ui';

export default function App() {
  return (
    <HoverCard>
      <HoverCardTrigger href="/users/xiaoming">@xiaoming</HoverCardTrigger>
      <HoverCardContent>
        <p>产品设计师 · 上海</p>
        <p>关注他</p>
      </HoverCardContent>
    </HoverCard>
  );
}
```

## 组成部分

| 子组件             | 说明                                                      |
| ------------------ | --------------------------------------------------------- |
| `HoverCard`        | 根组件，管理展开状态与延迟（对应 Radix `HoverCard.Root`） |
| `HoverCardTrigger` | 触发元素，渲染为 `<a>`（对应 Radix `HoverCard.Trigger`）  |
| `HoverCardContent` | 内容卡片，渲染为浮层面板并带缩放淡入动画                  |

> 组件只导出以上 3 个子组件。Radix 的 `HoverCard.Anchor` / `HoverCard.Portal` / `HoverCard.Title` / `HoverCard.Description` / `HoverCard.Arrow` **未被封装导出**。另外本组件**没有**内置 `Portal`（`HoverCardContent` 直接渲染在触发器同级），如需脱离父级溢出裁剪请自行引入 `HoverCardPrimitive.Portal`。

## 变体

`HoverCardContent` 的样式由内部 `cva`（`hoverCardVariants`）定义，共 2 个维度。

### size（尺寸）

| 取值 | 说明                                              |
| ---- | ------------------------------------------------- |
| `sm` | 宽度 `--hover-card-sm-width`（12rem）             |
| `md` | 宽度 `--hover-card-md-width`（16rem），**默认值** |
| `lg` | 宽度 `--hover-card-lg-width`（20rem）             |

### variant（配色）

| 取值      | 说明                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| `default` | 使用 `--hover-card-bg` / `--hover-card-fg`，**默认值**                             |
| `dark`    | 使用 `--hover-card-dark-bg` / `--hover-card-dark-fg`（固定深色配色，不随主题切换） |

## 属性

### HoverCard（根组件）

| 属性           | 类型                      | 默认值 | 说明                                                                              |
| -------------- | ------------------------- | ------ | --------------------------------------------------------------------------------- |
| `open`         | `boolean`                 | —      | 受控展开状态，来自 Radix primitives（`HoverCard.Root`）                           |
| `defaultOpen`  | `boolean`                 | —      | 非受控模式下的初始展开状态，来自 Radix primitives（`HoverCard.Root`）             |
| `onOpenChange` | `(open: boolean) => void` | —      | 展开状态变化回调，来自 Radix primitives（`HoverCard.Root`）                       |
| `openDelay`    | `number`                  | `700`  | 指针进入触发器到卡片展开的延迟（毫秒），来自 Radix primitives（`HoverCard.Root`） |
| `closeDelay`   | `number`                  | `300`  | 指针离开后卡片收起的延迟（毫秒），来自 Radix primitives（`HoverCard.Root`）       |
| `children`     | `React.ReactNode`         | —      | 子节点，来自 Radix primitives（`HoverCard.Root`）                                 |

### HoverCardTrigger

| 属性      | 类型                                         | 默认值 | 说明                                                                          |
| --------- | -------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| `asChild` | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`HoverCard.Trigger`）        |
| `href`    | `string`                                     | —      | 链接地址（原生 `<a>` 属性），来自 Radix primitives（`HoverCard.Trigger`）     |
| `target`  | `string`                                     | —      | 链接打开目标（原生 `<a>` 属性），来自 Radix primitives（`HoverCard.Trigger`） |
| `onClick` | `React.MouseEventHandler<HTMLAnchorElement>` | —      | 点击事件（原生 `<a>` 属性），来自 Radix primitives（`HoverCard.Trigger`）     |

### HoverCardContent

| 属性                     | 类型                                                                        | 默认值        | 说明                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `size`                   | `'sm' \| 'md' \| 'lg'`                                                      | `'md'`        | 卡片宽度变体，由 `cva` 定义                                                                            |
| `variant`                | `'default' \| 'dark'`                                                       | `'default'`   | 卡片配色变体，由 `cva` 定义                                                                            |
| `align`                  | `'start' \| 'center' \| 'end'`                                              | `'center'`    | 与触发器的对齐方式，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）                 |
| `side`                   | `'top' \| 'right' \| 'bottom' \| 'left'`                                    | `'bottom'`    | 卡片相对触发器的弹出方向，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）           |
| `sideOffset`             | `number`                                                                    | `4`           | 卡片与触发器之间的间距（像素），来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）     |
| `alignOffset`            | `number`                                                                    | `0`           | 对齐方向的偏移量（像素），来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）           |
| `avoidCollisions`        | `boolean`                                                                   | `true`        | 是否自动避免与视口边界碰撞，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）         |
| `collisionBoundary`      | `Element \| Element[] \| null`                                              | `[]`          | 碰撞检测的边界元素，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）                 |
| `collisionPadding`       | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `0`           | 碰撞检测的边界内边距，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）               |
| `arrowPadding`           | `number`                                                                    | `0`           | 箭头与触发器的内边距，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）               |
| `sticky`                 | `'partial' \| 'always'`                                                     | `'partial'`   | 碰撞时是否保持粘附在触发器上，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）       |
| `hideWhenDetached`       | `boolean`                                                                   | `false`       | 触发器被完全遮挡时是否隐藏卡片，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）     |
| `updatePositionStrategy` | `'optimized' \| 'always'`                                                   | `'optimized'` | 位置更新策略，来自 Radix primitives（`HoverCard.Content` 继承 `Popper.Content`）                       |
| `onEscapeKeyDown`        | `(event: KeyboardEvent) => void`                                            | —             | 按下 `Escape` 时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`HoverCard.Content`）   |
| `onPointerDownOutside`   | `(event: PointerDownOutsideEvent) => void`                                  | —             | 在浮层外按下指针时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`HoverCard.Content`） |
| `onFocusOutside`         | `(event: FocusOutsideEvent) => void`                                        | —             | 焦点移出浮层时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`HoverCard.Content`）     |
| `onInteractOutside`      | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void`             | —             | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`HoverCard.Content`）                     |
| `forceMount`             | `true`                                                                      | —             | 强制挂载，用于接管退出动画，来自 Radix primitives（`HoverCard.Content`）                               |
| `className`              | `string`                                                                    | —             | 自定义类名，合并到末位                                                                                 |

本表只列组件自有属性；此外还透传 `<a>` / `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `HoverCardTrigger` 渲染为 `<a>`，具备原生链接语义（可通过 `asChild` 换成其它元素）。
- `HoverCardContent` 渲染为 `role="dialog"`，非模态；Radix 通过 `aria-expanded` / `aria-controls` 关联触发器与卡片。
- 键盘行为：焦点进入触发器时展开卡片；`Escape` 关闭卡片；焦点移出浮层时收起卡片。
- 悬停展开有 `openDelay`（默认 700ms）与 `closeDelay`（默认 300ms）缓冲，避免鼠标掠过时频繁闪烁。
- 由于本组件未封装 `HoverCard.Title` / `HoverCard.Description`，卡片默认**没有可访问名称**；建议自行补充 `aria-label`。
- 动画使用 `data-[state=open]` / `data-[state=closed]` 状态属性驱动，缩放 + 淡入淡出。

## 主题变量

| 变量                    | 说明                    |
| ----------------------- | ----------------------- |
| `--hover-card-radius`   | 卡片圆角                |
| `--hover-card-border`   | 卡片边框                |
| `--hover-card-bg`       | 卡片背景色              |
| `--hover-card-fg`       | 卡片文字色              |
| `--hover-card-padding`  | 卡片内边距              |
| `--hover-card-shadow`   | 卡片阴影                |
| `--hover-card-sm-width` | `size="sm"` 宽度        |
| `--hover-card-md-width` | `size="md"` 宽度        |
| `--hover-card-lg-width` | `size="lg"` 宽度        |
| `--hover-card-dark-bg`  | `variant="dark"` 背景色 |
| `--hover-card-dark-fg`  | `variant="dark"` 文字色 |

## 组合用法 / 注意事项

- **`HoverCardContent` 未包裹 Portal**：卡片直接渲染在触发器所在位置，若父级设置了 `overflow: hidden` 或 `transform`，卡片可能被裁剪；此时需自行从 `@radix-ui/react-hover-card` 引入 `HoverCardPortal` 包裹。
- **`align` / `sideOffset` 有内建默认值**：`align="center"`、`sideOffset={4}` 是组件显式解构后透传给 Radix 的值，覆盖了 Radix 自身默认值。
- **触发器是 `<a>` 而非 `<button>`**：若不需要链接语义，请通过 `asChild` 包裹一个 `<button>`，否则屏幕阅读器会朗读为链接。
- **延迟由根组件控制**：需要调整展开 / 收起节奏请设置 `HoverCard` 的 `openDelay` / `closeDelay`，而不是 `HoverCardContent`。
- **`className` 合并到末位**：自定义类名优先级最高，可覆盖内建的宽度与配色。

## 导出

| 导出名                  | 类型                              | 说明                                                                                  |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| `HoverCard`             | `React.FC<HoverCardProps>`        | 悬停卡片根组件（Radix `HoverCard.Root`）                                              |
| `HoverCardTrigger`      | `React.ForwardRefExoticComponent` | 触发器，ref 指向 `HTMLAnchorElement`                                                  |
| `HoverCardContent`      | `React.ForwardRefExoticComponent` | 内容卡片，ref 指向 `HTMLDivElement`                                                   |
| `HoverCardProps`        | `type`                            | 根组件属性类型（`React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>`）    |
| `HoverCardTriggerProps` | `type`                            | 触发器属性类型（`React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>`） |
| `HoverCardContentProps` | `type`                            | 内容卡片属性类型（Radix `HoverCard.Content` 属性 + `size` / `variant`）               |
