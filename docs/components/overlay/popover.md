# Popover 浮层

> 点击触发器后弹出的浮层面板，适合承载筛选器、颜色选择器等轻量交互内容。

**导入**

```tsx
import { Popover } from '@easbot/ui';
```

## 基础用法

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@easbot/ui';

export default function App() {
  return (
    <Popover>
      <PopoverTrigger>选择颜色</PopoverTrigger>
      <PopoverContent>
        <p>在这里放置任意内容。</p>
      </PopoverContent>
    </Popover>
  );
}
```

配合内置输入框样式（`PopoverContent` 已为后代 `<input>` 提供背景 / 边框 / 聚焦样式）：

```tsx
<PopoverContent>
  <input type="text" placeholder="搜索…" />
</PopoverContent>
```

## 组成部分

| 子组件           | 说明                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| `Popover`        | 根组件，管理打开状态（对应 Radix `Popover.Root`）                                |
| `PopoverTrigger` | 触发器按钮，点击后打开浮层（对应 Radix `Popover.Trigger`）                       |
| `PopoverContent` | 内容容器，**已内置** `PopoverPrimitive.Portal`，并注入定位、动画与后代输入框样式 |

> 组件只导出以上 3 个子组件。Radix 的 `Popover.Anchor` / `Popover.Close` / `Popover.Title` / `Popover.Description` / `Popover.Arrow` **未被封装导出**，如需使用请自行从 `@radix-ui/react-popover` 引入。

## 变体

`PopoverContent` **未定义 `cva` 变体**，样式由固定的类名列表 + CSS 变量驱动。可通过 `className` 覆盖宽度、内边距等。

## 属性

### Popover（根组件）

| 属性           | 类型                      | 默认值  | 说明                                                                                       |
| -------------- | ------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `open`         | `boolean`                 | —       | 受控打开状态，来自 Radix primitives（`Popover.Root`）                                      |
| `defaultOpen`  | `boolean`                 | —       | 非受控模式下的初始打开状态，来自 Radix primitives（`Popover.Root`）                        |
| `onOpenChange` | `(open: boolean) => void` | —       | 打开状态变化回调，来自 Radix primitives（`Popover.Root`）                                  |
| `modal`        | `boolean`                 | `false` | 是否为模态浮层（`true` 时锁定焦点、禁用外部交互），来自 Radix primitives（`Popover.Root`） |
| `children`     | `React.ReactNode`         | —       | 子节点，来自 Radix primitives（`Popover.Root`）                                            |

### PopoverTrigger

| 属性       | 类型                                         | 默认值 | 说明                                                                             |
| ---------- | -------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`Popover.Trigger`）             |
| `onClick`  | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`Popover.Trigger`）     |
| `disabled` | `boolean`                                    | —      | 禁用触发按钮（原生 `<button>` 属性），来自 Radix primitives（`Popover.Trigger`） |

### PopoverContent

| 属性                     | 类型                                                                        | 默认值        | 说明                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `align`                  | `'start' \| 'center' \| 'end'`                                              | `'center'`    | 与触发器的对齐方式，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）                 |
| `side`                   | `'top' \| 'right' \| 'bottom' \| 'left'`                                    | `'bottom'`    | 浮层相对触发器的弹出方向，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）           |
| `sideOffset`             | `number`                                                                    | `4`           | 浮层与触发器之间的间距（像素），来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）     |
| `alignOffset`            | `number`                                                                    | `0`           | 对齐方向的偏移量（像素），来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）           |
| `avoidCollisions`        | `boolean`                                                                   | `true`        | 是否自动避免与视口边界碰撞，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）         |
| `collisionBoundary`      | `Element \| Element[] \| null`                                              | `[]`          | 碰撞检测的边界元素，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）                 |
| `collisionPadding`       | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `0`           | 碰撞检测的边界内边距，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）               |
| `arrowPadding`           | `number`                                                                    | `0`           | 箭头与触发器的内边距，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）               |
| `sticky`                 | `'partial' \| 'always'`                                                     | `'partial'`   | 碰撞时是否保持粘附在触发器上，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）       |
| `hideWhenDetached`       | `boolean`                                                                   | `false`       | 触发器被完全遮挡时是否隐藏浮层，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）     |
| `updatePositionStrategy` | `'optimized' \| 'always'`                                                   | `'optimized'` | 位置更新策略，来自 Radix primitives（`Popover.Content` 继承 `Popper.Content`）                       |
| `trapFocus`              | `boolean`                                                                   | `false`       | 是否把焦点锁定在浮层内，来自 Radix primitives（`Popover.Content`）                                   |
| `onOpenAutoFocus`        | `(event: Event) => void`                                                    | —             | 打开时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`Popover.Content`）     |
| `onCloseAutoFocus`       | `(event: Event) => void`                                                    | —             | 关闭时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`Popover.Content`）     |
| `onEscapeKeyDown`        | `(event: KeyboardEvent) => void`                                            | —             | 按下 `Escape` 时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Popover.Content`）   |
| `onPointerDownOutside`   | `(event: PointerDownOutsideEvent) => void`                                  | —             | 在浮层外按下指针时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Popover.Content`） |
| `onFocusOutside`         | `(event: FocusOutsideEvent) => void`                                        | —             | 焦点移出浮层时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Popover.Content`）     |
| `onInteractOutside`      | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void`             | —             | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`Popover.Content`）                     |
| `forceMount`             | `true`                                                                      | —             | 强制挂载，用于接管退出动画，来自 Radix primitives（`Popover.Content`）                               |
| `className`              | `string`                                                                    | —             | 自定义类名，合并到末位                                                                               |

本表只列组件自有属性；此外还透传 `<button>` / `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `PopoverContent` 渲染为 `role="dialog"`，非模态（`modal` 默认 `false`），不会锁定整个页面的焦点。
- 触发器与浮层之间通过 `aria-expanded` / `aria-controls` / `aria-haspopup="dialog"` 建立关联（由 Radix primitives 注入）。
- 键盘行为：`Escape` 关闭浮层；打开时焦点自动移入浮层内的第一个可聚焦元素，关闭后焦点回到触发元素。
- 点击浮层外部会关闭浮层（`onPointerDownOutside` 可阻止）。
- 由于本组件未封装 `Popover.Title` / `Popover.Description`，浮层默认**没有可访问名称**；建议自行补充 `aria-label`，或从 `@radix-ui/react-popover` 引入 `PopoverTitle` / `PopoverDescription`。
- 动画使用 `data-[state=open]` / `data-[state=closed]` 状态属性驱动，配合 `data-[side=*]` 实现从触发器方向滑入。

## 主题变量

| 变量                           | 说明                                           |
| ------------------------------ | ---------------------------------------------- |
| `--popover-z-index`            | 浮层层级                                       |
| `--popover-width`              | 浮层固定宽度                                   |
| `--popover-radius`             | 浮层圆角                                       |
| `--popover-padding`            | 浮层内边距                                     |
| `--popover-shadow`             | 浮层阴影                                       |
| `--popover-input-bg`           | 后代 `<input>` 背景色                          |
| `--popover-input-border`       | 后代 `<input>` 边框色                          |
| `--popover-input-text`         | 后代 `<input>` 文字色                          |
| `--popover-input-focus-border` | 后代 `<input>` 聚焦边框色                      |
| `--popover-input-focus-ring`   | 后代 `<input>` 聚焦光环                        |
| `--popover`                    | 浮层背景色（语义类 `bg-popover`）              |
| `--popover-foreground`         | 浮层文字色（语义类 `text-popover-foreground`） |

## 组合用法 / 注意事项

- **`PopoverContent` 已内置 Portal**：不要在其内部再次包裹 `PopoverPrimitive.Portal`，否则浮层会被渲染两次。
- **`align` / `sideOffset` 有内建默认值**：`align="center"`、`sideOffset={4}` 是组件在 props 中显式解构并透传给 Radix 的值，覆盖了 Radix 的自身默认值。
- **后代 `<input>` 样式通过 `[&_input]:` 变体选择器注入**：只对**后代** input 生效（不作用于浮层自身若为 input），如不需要可传 `className` 覆盖。
- **`modal` 默认为 `false`**：与 `Dialog` / `Sheet` 不同，Popover 不会自动锁定焦点，适合表单类轻量交互；若需模态行为请显式传 `modal`。
- **`className` 合并到末位**：自定义类名优先级最高，可覆盖 `--popover-width` 等内建样式。

## 导出

| 导出名                | 类型                              | 说明                                               |
| --------------------- | --------------------------------- | -------------------------------------------------- |
| `Popover`             | `React.FC<PopoverProps>`          | 浮层根组件（Radix `Popover.Root`）                 |
| `PopoverTrigger`      | `React.ForwardRefExoticComponent` | 触发器，ref 指向 `HTMLButtonElement`               |
| `PopoverContent`      | `React.ForwardRefExoticComponent` | 内容容器，ref 指向 `HTMLDivElement`                |
| `PopoverProps`        | `interface`                       | 根组件属性类型（来自 `@radix-ui/react-popover`）   |
| `PopoverTriggerProps` | `interface`                       | 触发器属性类型（来自 `@radix-ui/react-popover`）   |
| `PopoverContentProps` | `interface`                       | 内容容器属性类型（来自 `@radix-ui/react-popover`） |
