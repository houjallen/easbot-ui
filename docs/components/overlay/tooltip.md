# Tooltip 文字提示

> 悬停或聚焦时显示的短文本提示，用于补充说明按钮、图标或截断文本的完整内容。

**导入**

```tsx
import { Tooltip } from '@easbot/ui';
```

## 基础用法

> `TooltipProvider` 必须包裹 `Tooltip`，否则 Radix 会抛出「`Tooltip` must be used within `TooltipProvider`」错误。

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@easbot/ui';

export default function App() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>删除</TooltipTrigger>
        <TooltipContent>永久删除该文件</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

自定义延迟：

```tsx
<TooltipProvider delayDuration={300} skipDelayDuration={100}>
  <Tooltip>
    <TooltipTrigger>立即显示</TooltipTrigger>
    <TooltipContent>无需等待</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## 组成部分

| 子组件            | 说明                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| `TooltipProvider` | 全局提供者，管理展开延迟与"跳过延迟"策略（对应 Radix `Tooltip.Provider`）        |
| `Tooltip`         | 根组件，管理单个提示的展开状态（对应 Radix `Tooltip.Root`）                      |
| `TooltipTrigger`  | 触发元素，渲染为 `<button>`（对应 Radix `Tooltip.Trigger`）                      |
| `TooltipContent`  | 提示内容容器，**已内置** `TooltipPrimitive.Portal`，并注入淡入缩放与方向滑入动画 |

> 组件只导出以上 4 个子组件。Radix 的 `Tooltip.Arrow` / `Tooltip.Portal` **未被封装导出**（`TooltipContent` 已内置 Portal）。

## 变体

`TooltipContent` **未定义 `cva` 变体**，样式由固定的类名列表 + CSS 变量驱动。方位通过 Radix 的 `side` 属性切换，动画方向由 `data-[side=*]` 状态属性自动匹配。

## 属性

### TooltipProvider

| 属性                      | 类型              | 默认值  | 说明                                                                                                        |
| ------------------------- | ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| `delayDuration`           | `number`          | `700`   | 指针进入触发器到提示展开的延迟（毫秒），来自 Radix primitives（`Tooltip.Provider`）                         |
| `skipDelayDuration`       | `number`          | `300`   | 用户有多长时间可以直接进入另一个触发器而不再触发延迟（毫秒），来自 Radix primitives（`Tooltip.Provider`）   |
| `disableHoverableContent` | `boolean`         | `false` | 为 `true` 时悬停提示内容本身会关闭提示（不允许鼠标移入提示内），来自 Radix primitives（`Tooltip.Provider`） |
| `children`                | `React.ReactNode` | —       | 子节点（**必填**），来自 Radix primitives（`Tooltip.Provider`）                                             |

### Tooltip（根组件）

| 属性                      | 类型                      | 默认值  | 说明                                                                               |
| ------------------------- | ------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `open`                    | `boolean`                 | —       | 受控展开状态，来自 Radix primitives（`Tooltip.Root`）                              |
| `defaultOpen`             | `boolean`                 | —       | 非受控模式下的初始展开状态，来自 Radix primitives（`Tooltip.Root`）                |
| `onOpenChange`            | `(open: boolean) => void` | —       | 展开状态变化回调，来自 Radix primitives（`Tooltip.Root`）                          |
| `delayDuration`           | `number`                  | `700`   | 覆盖 `TooltipProvider` 的同名属性（毫秒），来自 Radix primitives（`Tooltip.Root`） |
| `disableHoverableContent` | `boolean`                 | `false` | 覆盖 `TooltipProvider` 的同名属性，来自 Radix primitives（`Tooltip.Root`）         |
| `children`                | `React.ReactNode`         | —       | 子节点，来自 Radix primitives（`Tooltip.Root`）                                    |

### TooltipTrigger

| 属性       | 类型                                         | 默认值 | 说明                                                                             |
| ---------- | -------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`Tooltip.Trigger`）             |
| `onClick`  | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`Tooltip.Trigger`）     |
| `disabled` | `boolean`                                    | —      | 禁用触发按钮（原生 `<button>` 属性），来自 Radix primitives（`Tooltip.Trigger`） |

### TooltipContent

| 属性                     | 类型                                                                        | 默认值        | 说明                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `side`                   | `'top' \| 'right' \| 'bottom' \| 'left'`                                    | `'top'`       | 提示相对触发器的显示方向，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）           |
| `sideOffset`             | `number`                                                                    | `4`           | 提示与触发器之间的间距（像素），来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）     |
| `align`                  | `'start' \| 'center' \| 'end'`                                              | `'center'`    | 与触发器的对齐方式，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）                 |
| `alignOffset`            | `number`                                                                    | `0`           | 对齐方向的偏移量（像素），来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）           |
| `avoidCollisions`        | `boolean`                                                                   | `true`        | 是否自动避免与视口边界碰撞，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）         |
| `collisionBoundary`      | `Element \| Element[] \| null`                                              | `[]`          | 碰撞检测的边界元素，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）                 |
| `collisionPadding`       | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `0`           | 碰撞检测的边界内边距，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）               |
| `arrowPadding`           | `number`                                                                    | `0`           | 箭头与触发器的内边距，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）               |
| `sticky`                 | `'partial' \| 'always'`                                                     | `'partial'`   | 碰撞时是否保持粘附在触发器上，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）       |
| `hideWhenDetached`       | `boolean`                                                                   | `false`       | 触发器被完全遮挡时是否隐藏提示，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）     |
| `updatePositionStrategy` | `'optimized' \| 'always'`                                                   | `'optimized'` | 位置更新策略，来自 Radix primitives（`Tooltip.Content` 继承 `Popper.Content`）                       |
| `aria-label`             | `string`                                                                    | —             | 无障碍用途的更具描述性标签，来自 Radix primitives（`Tooltip.Content`）                               |
| `onEscapeKeyDown`        | `(event: KeyboardEvent) => void`                                            | —             | 按下 `Escape` 时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Tooltip.Content`）   |
| `onPointerDownOutside`   | `(event: PointerDownOutsideEvent) => void`                                  | —             | 在浮层外按下指针时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Tooltip.Content`） |
| `forceMount`             | `true`                                                                      | —             | 强制挂载，用于接管退出动画，来自 Radix primitives（`Tooltip.Content`）                               |
| `className`              | `string`                                                                    | —             | 自定义类名，合并到末位                                                                               |

本表只列组件自有属性；此外还透传 `<button>` / `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `TooltipTrigger` 渲染为 `<button>`，聚焦时自动展开提示，**支持纯键盘操作**。
- `TooltipContent` 通过 `aria-describedby` 与触发器关联，屏幕阅读器在聚焦触发器时会朗读提示文本。
- 触发器本身**没有可访问名称**（无可见文字时），需要为图标按钮补充 `aria-label`。
- 键盘行为：`Escape` 关闭提示；焦点移出触发器后提示自动收起。
- 触摸设备上 Tooltip 不触发（Radix 仅响应指针悬停与聚焦），移动端请改用 `Popover` 或 `Sheet`。
- 动画使用 `data-[state=closed]` 与 `data-[side=*]` 状态属性驱动，缩放 + 淡入淡出 + 方向滑入。

## 主题变量

| 变量                     | 说明                 |
| ------------------------ | -------------------- |
| `--tooltip-z-index`      | 提示层层级           |
| `--tooltip-background`   | 提示背景色           |
| `--tooltip-foreground`   | 提示文字色           |
| `--tooltip-border`       | 提示边框             |
| `--tooltip-shadow`       | 提示阴影             |
| `--tooltip-padding-x`    | 提示左右内边距       |
| `--tooltip-padding-y`    | 提示上下内边距       |
| `--tooltip-slide-offset` | 方向滑入动画的位移量 |
| `--tooltip-font-size`    | 提示字号             |

## 组合用法 / 注意事项

- **`TooltipProvider` 不可省略**：Radix 的 `Tooltip` 必须位于 `TooltipProvider` 之内，否则运行时报错。应用根部放一个 `TooltipProvider` 即可覆盖全部提示。
- **`TooltipContent` 已内置 Portal**：不要在其内部再次包裹 `TooltipPrimitive.Portal`。
- **`sideOffset` 有内建默认值**：组件显式解构出 `sideOffset = 4` 并透传，覆盖了 Radix 自身默认值。
- **`delayDuration` 的优先级**：`Tooltip` 上的 `delayDuration` 会覆盖 `TooltipProvider` 上的同名属性。
- **不要把关键信息只放在 Tooltip 里**：Tooltip 仅鼠标悬停 / 键盘聚焦可见，触屏用户无法访问；重要内容应同时提供可见文本或使用 `Popover`。
- **`className` 合并到末位**：自定义类名优先级最高，可覆盖内建的背景、圆角与内边距。

## 导出

| 导出名                | 类型                              | 说明                                                              |
| --------------------- | --------------------------------- | ----------------------------------------------------------------- |
| `TooltipProvider`     | `React.FC<TooltipProviderProps>`  | 全局提供者（Radix `Tooltip.Provider`）                            |
| `Tooltip`             | `React.FC<TooltipProps>`          | 提示根组件（Radix `Tooltip.Root`）                                |
| `TooltipTrigger`      | `React.ForwardRefExoticComponent` | 触发器，ref 指向 `HTMLButtonElement`                              |
| `TooltipContent`      | `React.ForwardRefExoticComponent` | 提示内容，ref 指向 `HTMLDivElement`                               |
| `TooltipProps`        | `type`                            | 根组件属性类型（`React.ComponentProps<typeof Tooltip>`）          |
| `TooltipContentProps` | `type`                            | 提示内容属性类型（`React.ComponentProps<typeof TooltipContent>`） |
