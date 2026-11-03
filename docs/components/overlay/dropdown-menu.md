# DropdownMenu 下拉菜单

> 点击触发器后弹出的操作菜单，支持子菜单、复选项、单选项、分组与快捷键提示。

**导入**

```tsx
import { DropdownMenu } from '@easbot/ui';
```

## 基础用法

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>操作</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>我的账号</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>个人资料</DropdownMenuItem>
        <DropdownMenuItem>账单</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>退出登录</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

复选项与单选项：

```tsx
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>显示选项</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked={true}>显示状态栏</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="grid">
          <DropdownMenuRadioItem value="grid">网格</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="list">列表</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuItem>重置</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 组成部分

| 子组件                     | 说明                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `DropdownMenu`             | 根组件，管理打开状态（对应 Radix `DropdownMenu.Root`）                                              |
| `DropdownMenuTrigger`      | 触发器按钮（对应 Radix `DropdownMenu.Trigger`）                                                     |
| `DropdownMenuContent`      | 菜单内容，**已内置** `DropdownMenuPrimitive.Portal`，并注入尺寸 / 配色变体                          |
| `DropdownMenuItem`         | 菜单项（对应 Radix `DropdownMenu.Item`），支持 `inset` 缩进                                         |
| `DropdownMenuCheckboxItem` | 复选项，左侧带 `Check` 指示器（对应 Radix `DropdownMenu.CheckboxItem`）                             |
| `DropdownMenuRadioItem`    | 单选项，左侧带 `Circle` 指示器（对应 Radix `DropdownMenu.RadioItem`）                               |
| `DropdownMenuLabel`        | 分组标题，支持 `inset` 缩进（对应 Radix `DropdownMenu.Label`）                                      |
| `DropdownMenuSeparator`    | 分隔线（对应 Radix `DropdownMenu.Separator`）                                                       |
| `DropdownMenuShortcut`     | 快捷键提示文本（右对齐的 `<span>`）                                                                 |
| `DropdownMenuGroup`        | 分组容器（对应 Radix `DropdownMenu.Group`）                                                         |
| `DropdownMenuPortal`       | 传送门（对应 Radix `DropdownMenu.Portal`）                                                          |
| `DropdownMenuRadioGroup`   | 单选组容器（对应 Radix `DropdownMenu.RadioGroup`）                                                  |
| `DropdownMenuSub`          | 子菜单容器（对应 Radix `DropdownMenu.Sub`）                                                         |
| `DropdownMenuSubContent`   | 子菜单内容（对应 Radix `DropdownMenu.SubContent`）                                                  |
| `DropdownMenuSubTrigger`   | 子菜单触发器，右侧带 `ChevronRight` 箭头，支持 `inset` 缩进（对应 Radix `DropdownMenu.SubTrigger`） |

## 变体

`DropdownMenuContent` 的样式由内部 `cva`（`dropdownMenuVariants`）定义，共 2 个维度。

### size（尺寸）

| 取值 | 说明                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| `sm` | 最小宽度 `--dropdown-menu-sm-min-width`（6rem），字号 `--dropdown-menu-sm-font-size`（0.75rem）              |
| `md` | 最小宽度 `--dropdown-menu-md-min-width`（8rem），字号 `--dropdown-menu-md-font-size`（0.875rem），**默认值** |
| `lg` | 最小宽度 `--dropdown-menu-lg-min-width`（10rem），字号 `--dropdown-menu-lg-font-size`（1rem）                |

### variant（配色）

| 取值      | 说明                                                                   |
| --------- | ---------------------------------------------------------------------- |
| `default` | 追加语义类 `bg-popover`（配合基础的 `--dropdown-menu-bg`），**默认值** |
| `dark`    | 固定深色配色 `bg-gray-800 text-gray-100`（不随主题切换）               |

## 属性

### DropdownMenu（根组件）

| 属性           | 类型                      | 默认值  | 说明                                                                                            |
| -------------- | ------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                 | —       | 受控打开状态，来自 Radix primitives（`DropdownMenu.Root`）                                      |
| `defaultOpen`  | `boolean`                 | —       | 非受控模式下的初始打开状态，来自 Radix primitives（`DropdownMenu.Root`）                        |
| `onOpenChange` | `(open: boolean) => void` | —       | 打开状态变化回调，来自 Radix primitives（`DropdownMenu.Root`）                                  |
| `modal`        | `boolean`                 | `true`  | 是否为模态菜单（`true` 时锁定焦点、禁用外部交互），来自 Radix primitives（`DropdownMenu.Root`） |
| `dir`          | `'ltr' \| 'rtl'`          | `'ltr'` | 文本方向，来自 Radix primitives（`DropdownMenu.Root`）                                          |
| `children`     | `React.ReactNode`         | —       | 子节点，来自 Radix primitives（`DropdownMenu.Root`）                                            |

### DropdownMenuTrigger

| 属性       | 类型                                         | 默认值 | 说明                                                                                  |
| ---------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`DropdownMenu.Trigger`）             |
| `onClick`  | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`DropdownMenu.Trigger`）     |
| `disabled` | `boolean`                                    | —      | 禁用触发按钮（原生 `<button>` 属性），来自 Radix primitives（`DropdownMenu.Trigger`） |

### DropdownMenuContent

| 属性                     | 类型                                                                        | 默认值        | 说明                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `size`                   | `'sm' \| 'md' \| 'lg'`                                                      | `'md'`        | 菜单尺寸变体，由 `cva` 定义                                                                                                   |
| `variant`                | `'default' \| 'dark'`                                                       | `'default'`   | 菜单配色变体，由 `cva` 定义                                                                                                   |
| `side`                   | `'top' \| 'right' \| 'bottom' \| 'left'`                                    | `'bottom'`    | 菜单相对触发器的弹出方向，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                 |
| `sideOffset`             | `number`                                                                    | `0`           | 菜单与触发器之间的间距（像素），来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                           |
| `align`                  | `'start' \| 'center' \| 'end'`                                              | `'center'`    | 与触发器的对齐方式，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                       |
| `alignOffset`            | `number`                                                                    | `0`           | 对齐方向的偏移量（像素），来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                 |
| `avoidCollisions`        | `boolean`                                                                   | `true`        | 是否自动避免与视口边界碰撞，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                               |
| `collisionBoundary`      | `Element \| Element[] \| null`                                              | `[]`          | 碰撞检测的边界元素，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                       |
| `collisionPadding`       | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `0`           | 碰撞检测的边界内边距，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                     |
| `arrowPadding`           | `number`                                                                    | `0`           | 箭头与触发器的内边距，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                     |
| `sticky`                 | `'partial' \| 'always'`                                                     | `'partial'`   | 碰撞时是否保持粘附在触发器上，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                             |
| `hideWhenDetached`       | `boolean`                                                                   | `false`       | 触发器被完全遮挡时是否隐藏菜单，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                           |
| `updatePositionStrategy` | `'optimized' \| 'always'`                                                   | `'optimized'` | 位置更新策略，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                             |
| `loop`                   | `boolean`                                                                   | `false`       | 键盘导航是否循环回绕，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                                     |
| `onCloseAutoFocus`       | `(event: Event) => void`                                                    | —             | 关闭时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）     |
| `onEscapeKeyDown`        | `(event: KeyboardEvent) => void`                                            | —             | 按下 `Escape` 时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）   |
| `onPointerDownOutside`   | `(event: PointerDownOutsideEvent) => void`                                  | —             | 在浮层外按下指针时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`） |
| `onFocusOutside`         | `(event: FocusOutsideEvent) => void`                                        | —             | 焦点移出浮层时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）     |
| `onInteractOutside`      | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void`             | —             | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`DropdownMenu.Content` 继承 `Menu.Content`）                     |
| `forceMount`             | `true`                                                                      | —             | 强制挂载，用于接管退出动画，来自 Radix primitives（`DropdownMenu.Content`）                                                   |
| `className`              | `string`                                                                    | —             | 自定义类名，合并到末位                                                                                                        |

### DropdownMenuItem

| 属性        | 类型                     | 默认值  | 说明                                                                 |
| ----------- | ------------------------ | ------- | -------------------------------------------------------------------- |
| `inset`     | `boolean`                | `false` | 是否缩进显示（追加 `pl-8`），与图标列对齐                            |
| `disabled`  | `boolean`                | `false` | 禁用该菜单项，来自 Radix primitives（`DropdownMenu.Item`）           |
| `textValue` | `string`                 | —       | 用于键盘搜索匹配的文本，来自 Radix primitives（`DropdownMenu.Item`） |
| `onSelect`  | `(event: Event) => void` | —       | 选中时的回调，来自 Radix primitives（`DropdownMenu.Item`）           |
| `className` | `string`                 | —       | 自定义类名，合并到末位                                               |

### DropdownMenuCheckboxItem

| 属性              | 类型                         | 默认值  | 说明                                                                   |
| ----------------- | ---------------------------- | ------- | ---------------------------------------------------------------------- |
| `checked`         | `boolean \| 'indeterminate'` | —       | 选中状态，来自 Radix primitives（`DropdownMenu.CheckboxItem`）         |
| `onCheckedChange` | `(checked: boolean) => void` | —       | 选中状态变化回调，来自 Radix primitives（`DropdownMenu.CheckboxItem`） |
| `disabled`        | `boolean`                    | `false` | 禁用该菜单项，来自 Radix primitives（`DropdownMenu.CheckboxItem`）     |
| `onSelect`        | `(event: Event) => void`     | —       | 选中时的回调，来自 Radix primitives（`DropdownMenu.CheckboxItem`）     |
| `className`       | `string`                     | —       | 自定义类名，合并到末位                                                 |

### DropdownMenuRadioItem

| 属性        | 类型                     | 默认值  | 说明                                                                      |
| ----------- | ------------------------ | ------- | ------------------------------------------------------------------------- |
| `value`     | `string`                 | —       | 单选项的值（**必填**），来自 Radix primitives（`DropdownMenu.RadioItem`） |
| `disabled`  | `boolean`                | `false` | 禁用该菜单项，来自 Radix primitives（`DropdownMenu.RadioItem`）           |
| `onSelect`  | `(event: Event) => void` | —       | 选中时的回调，来自 Radix primitives（`DropdownMenu.RadioItem`）           |
| `className` | `string`                 | —       | 自定义类名，合并到末位                                                    |

### DropdownMenuRadioGroup

| 属性            | 类型                      | 默认值 | 说明                                                               |
| --------------- | ------------------------- | ------ | ------------------------------------------------------------------ |
| `value`         | `string`                  | —      | 当前选中的值，来自 Radix primitives（`DropdownMenu.RadioGroup`）   |
| `onValueChange` | `(value: string) => void` | —      | 选中值变化回调，来自 Radix primitives（`DropdownMenu.RadioGroup`） |

### DropdownMenuLabel

| 属性        | 类型      | 默认值  | 说明                        |
| ----------- | --------- | ------- | --------------------------- |
| `inset`     | `boolean` | `false` | 是否缩进显示（追加 `pl-8`） |
| `className` | `string`  | —       | 自定义类名，合并到末位      |

### DropdownMenuSubTrigger

| 属性        | 类型                     | 默认值  | 说明                                                                       |
| ----------- | ------------------------ | ------- | -------------------------------------------------------------------------- |
| `inset`     | `boolean`                | `false` | 是否缩进显示（追加 `pl-8`）                                                |
| `disabled`  | `boolean`                | `false` | 禁用该子菜单触发项，来自 Radix primitives（`DropdownMenu.SubTrigger`）     |
| `textValue` | `string`                 | —       | 用于键盘搜索匹配的文本，来自 Radix primitives（`DropdownMenu.SubTrigger`） |
| `onSelect`  | `(event: Event) => void` | —       | 选中时的回调，来自 Radix primitives（`DropdownMenu.SubTrigger`）           |
| `className` | `string`                 | —       | 自定义类名，合并到末位                                                     |

### DropdownMenuSub

| 属性           | 类型                      | 默认值 | 说明                                                                    |
| -------------- | ------------------------- | ------ | ----------------------------------------------------------------------- |
| `open`         | `boolean`                 | —      | 受控展开状态，来自 Radix primitives（`DropdownMenu.Sub`）               |
| `defaultOpen`  | `boolean`                 | —      | 非受控模式下的初始展开状态，来自 Radix primitives（`DropdownMenu.Sub`） |
| `onOpenChange` | `(open: boolean) => void` | —      | 展开状态变化回调，来自 Radix primitives（`DropdownMenu.Sub`）           |

### DropdownMenuSubContent

| 属性                   | 类型                                                                        | 默认值      | 说明                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `side`                 | `'top' \| 'right' \| 'bottom' \| 'left'`                                    | `'right'`   | 子菜单相对触发项的弹出方向，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                  |
| `sideOffset`           | `number`                                                                    | `0`         | 子菜单与触发项之间的间距（像素），来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）            |
| `align`                | `'start' \| 'end'`                                                          | `'start'`   | 与触发项的对齐方式（子菜单不支持 `center`），来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`） |
| `alignOffset`          | `number`                                                                    | `0`         | 对齐方向的偏移量（像素），来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                    |
| `avoidCollisions`      | `boolean`                                                                   | `true`      | 是否自动避免与视口边界碰撞，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                  |
| `collisionBoundary`    | `Element \| Element[] \| null`                                              | `[]`        | 碰撞检测的边界元素，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                          |
| `collisionPadding`     | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `0`         | 碰撞检测的边界内边距，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                        |
| `sticky`               | `'partial' \| 'always'`                                                     | `'partial'` | 碰撞时是否保持粘附在触发项上，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                |
| `hideWhenDetached`     | `boolean`                                                                   | `false`     | 触发项被完全遮挡时是否隐藏子菜单，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）            |
| `loop`                 | `boolean`                                                                   | `false`     | 键盘导航是否循环回绕，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                        |
| `onEscapeKeyDown`      | `(event: KeyboardEvent) => void`                                            | —           | 按下 `Escape` 时的回调，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                      |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void`                                  | —           | 在浮层外按下指针时的回调，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                    |
| `onFocusOutside`       | `(event: FocusOutsideEvent) => void`                                        | —           | 焦点移出浮层时的回调，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）                        |
| `onInteractOutside`    | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void`             | —           | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`DropdownMenu.SubContent` 继承 `Menu.SubContent`）        |
| `forceMount`           | `true`                                                                      | —           | 强制挂载，用于接管退出动画，来自 Radix primitives（`DropdownMenu.SubContent`）                                         |
| `className`            | `string`                                                                    | —           | 自定义类名，合并到末位                                                                                                 |

### DropdownMenuSeparator / DropdownMenuShortcut

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

本表只列组件自有属性；此外还透传 `<button>` / `<div>` / `<span>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `DropdownMenuContent` 渲染为 `role="menu"`，`DropdownMenuItem` 渲染为 `role="menuitem"`，复选项为 `role="menuitemcheckbox"`，单选项为 `role="menuitemradio"`，`DropdownMenuLabel` 渲染为 `role="presentation"`。
- `DropdownMenuTrigger` 带 `aria-haspopup="menu"` / `aria-expanded` / `aria-controls`，由 Radix 注入。
- 键盘行为：`Enter` / `Space` 打开菜单；`↑` / `↓` 在菜单项间移动焦点；`→` 打开子菜单、`←` 返回父菜单；`Escape` 关闭；`Home` / `End` 跳到首 / 末项；字母键可按 `textValue` 快速跳转。
- 默认 `modal` 为 `true`：菜单打开时焦点锁定在菜单内，外部内容不可交互，关闭后焦点回到触发器。
- 禁用项通过 `data-[disabled]` 状态属性设置 `pointer-events-none` 与半透明，Radix 同时会将其从键盘导航序列中跳过。
- 指示器（`Check` / `Circle` 图标）位于 `DropdownMenuPrimitive.ItemIndicator` 内，仅在对应项被选中时渲染。

## 主题变量

| 变量                                    | 说明                      |
| --------------------------------------- | ------------------------- |
| `--dropdown-menu-min-width`             | 子菜单最小宽度            |
| `--dropdown-menu-bg`                    | 菜单背景色                |
| `--dropdown-menu-fg`                    | 菜单文字色                |
| `--dropdown-menu-border`                | 菜单边框                  |
| `--dropdown-menu-radius`                | 菜单圆角                  |
| `--dropdown-menu-padding`               | 菜单内边距                |
| `--dropdown-menu-shadow`                | 菜单阴影                  |
| `--dropdown-menu-sm-min-width`          | `size="sm"` 最小宽度      |
| `--dropdown-menu-md-min-width`          | `size="md"` 最小宽度      |
| `--dropdown-menu-lg-min-width`          | `size="lg"` 最小宽度      |
| `--dropdown-menu-sm-font-size`          | `size="sm"` 字号          |
| `--dropdown-menu-md-font-size`          | `size="md"` 字号          |
| `--dropdown-menu-lg-font-size`          | `size="lg"` 字号          |
| `--dropdown-menu-item-radius`           | 菜单项圆角                |
| `--dropdown-menu-item-padding-x`        | 菜单项左右内边距          |
| `--dropdown-menu-item-padding-y`        | 菜单项上下内边距          |
| `--dropdown-menu-item-hover-bg`         | 菜单项聚焦 / hover 背景色 |
| `--dropdown-menu-item-hover-fg`         | 菜单项聚焦 / hover 文字色 |
| `--dropdown-menu-item-disabled-opacity` | 菜单项禁用透明度          |
| `--dropdown-menu-label-font-weight`     | 分组标题字重              |
| `--dropdown-menu-separator-bg`          | 分隔线背景色              |
| `--dropdown-menu-shortcut-opacity`      | 快捷键提示透明度          |
| `--dropdown-menu-shortcut-font-size`    | 快捷键提示字号            |
| `--dropdown-menu-sub-content-shadow`    | 子菜单阴影                |

## 组合用法 / 注意事项

- **`DropdownMenuContent` 已内置 Portal**：不要在其内部再次包裹 `DropdownMenuPrimitive.Portal`。
- **`DropdownMenuSubContent` 没有内置 Portal**：如需脱离父级溢出裁剪，请自行包裹 `DropdownMenuPrimitive.Portal`。
- **`size` 只影响 `DropdownMenuContent`**：`DropdownMenuSubContent` 使用固定的 `--dropdown-menu-min-width`，不继承 `size` / `variant`。
- **`DropdownMenuShortcut` 只是视觉提示**：它不会注册真实的键盘快捷键，需要自行绑定事件。
- **`inset` 只影响左内边距**：`DropdownMenuItem` / `DropdownMenuLabel` / `DropdownMenuSubTrigger` 的 `inset` 为 `true` 时追加 `pl-8`，用于与图标列对齐。
- **`className` 合并到末位**：自定义类名优先级最高，可覆盖内建的宽度与配色。

## 导出

| 导出名                          | 类型                              | 说明                                                                      |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| `DropdownMenu`                  | `React.FC<DropdownMenuProps>`     | 菜单根组件（Radix `DropdownMenu.Root`）                                   |
| `DropdownMenuTrigger`           | `React.ForwardRefExoticComponent` | 触发器，ref 指向 `HTMLButtonElement`                                      |
| `DropdownMenuContent`           | `React.ForwardRefExoticComponent` | 菜单内容，ref 指向 `HTMLDivElement`                                       |
| `DropdownMenuItem`              | `React.ForwardRefExoticComponent` | 菜单项，ref 指向 `HTMLDivElement`                                         |
| `DropdownMenuCheckboxItem`      | `React.ForwardRefExoticComponent` | 复选项，ref 指向 `HTMLDivElement`                                         |
| `DropdownMenuRadioItem`         | `React.ForwardRefExoticComponent` | 单选项，ref 指向 `HTMLDivElement`                                         |
| `DropdownMenuLabel`             | `React.ForwardRefExoticComponent` | 分组标题，ref 指向 `HTMLDivElement`                                       |
| `DropdownMenuSeparator`         | `React.ForwardRefExoticComponent` | 分隔线，ref 指向 `HTMLDivElement`                                         |
| `DropdownMenuShortcut`          | `React.FC`                        | 快捷键提示（`<span>`）                                                    |
| `DropdownMenuGroup`             | `React.FC`                        | 分组容器                                                                  |
| `DropdownMenuPortal`            | `React.FC`                        | 传送门                                                                    |
| `DropdownMenuSub`               | `React.FC`                        | 子菜单容器                                                                |
| `DropdownMenuSubContent`        | `React.ForwardRefExoticComponent` | 子菜单内容，ref 指向 `HTMLDivElement`                                     |
| `DropdownMenuSubTrigger`        | `React.ForwardRefExoticComponent` | 子菜单触发器，ref 指向 `HTMLDivElement`                                   |
| `DropdownMenuRadioGroup`        | `React.FC`                        | 单选组容器                                                                |
| `DropdownMenuProps`             | `type`                            | 根组件属性类型（`React.ComponentProps<typeof DropdownMenu>`）             |
| `DropdownMenuTriggerProps`      | `type`                            | 触发器属性类型（`React.ComponentProps<typeof DropdownMenuTrigger>`）      |
| `DropdownMenuContentProps`      | `type`                            | 菜单内容属性类型（`React.ComponentProps<typeof DropdownMenuContent>`）    |
| `DropdownMenuItemProps`         | `type`                            | 菜单项属性类型（Radix `DropdownMenu.Item` 属性 + `inset`）                |
| `DropdownMenuCheckboxItemProps` | `type`                            | 复选项属性类型（`React.ComponentProps<typeof DropdownMenuCheckboxItem>`） |
| `DropdownMenuRadioItemProps`    | `type`                            | 单选项属性类型（`React.ComponentProps<typeof DropdownMenuRadioItem>`）    |
| `DropdownMenuLabelProps`        | `type`                            | 分组标题属性类型（`React.ComponentProps<typeof DropdownMenuLabel>`）      |
| `DropdownMenuSeparatorProps`    | `type`                            | 分隔线属性类型（`React.ComponentProps<typeof DropdownMenuSeparator>`）    |
