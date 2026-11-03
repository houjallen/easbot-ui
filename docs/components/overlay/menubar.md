# Menubar 菜单栏

> 桌面端水平菜单栏，用于承载应用级的顶级导航与操作分组。

**导入**

```tsx
import { Menubar } from '@easbot/ui';
```

## 基础用法

```tsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>文件</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>新建</MenubarItem>
          <MenubarItem>打开</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>退出</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

## 组成部分

| 子组件                | 说明                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `Menubar`             | 菜单栏根容器，管理当前激活的菜单与 `roving focus`（对应 Radix `Menubar.Root`）                 |
| `MenubarMenu`         | 单个顶级菜单容器（对应 Radix `Menubar.Menu`）                                                  |
| `MenubarTrigger`      | 顶级菜单触发按钮（对应 Radix `Menubar.Trigger`）                                               |
| `MenubarContent`      | 菜单内容，**已内置** `MenubarPrimitive.Portal`（对应 Radix `Menubar.Content`）                 |
| `MenubarItem`         | 菜单项，支持 `inset` 缩进（对应 Radix `Menubar.Item`）                                         |
| `MenubarCheckboxItem` | 复选项，左侧带 `Check` 指示器（对应 Radix `Menubar.CheckboxItem`）                             |
| `MenubarRadioItem`    | 单选项，左侧带 `Circle` 指示器（对应 Radix `Menubar.RadioItem`）                               |
| `MenubarRadioGroup`   | 单选组容器（对应 Radix `Menubar.RadioGroup`）                                                  |
| `MenubarLabel`        | 分组标题，支持 `inset` 缩进（对应 Radix `Menubar.Label`）                                      |
| `MenubarSeparator`    | 分隔线（对应 Radix `Menubar.Separator`）                                                       |
| `MenubarShortcut`     | 快捷键提示文本（右对齐的 `<span>`）                                                            |
| `MenubarPortal`       | 传送门（对应 Radix `Menubar.Portal`）                                                          |
| `MenubarGroup`        | 分组容器（对应 Radix `Menubar.Group`）                                                         |
| `MenubarSub`          | 子菜单容器（对应 Radix `Menubar.Sub`）                                                         |
| `MenubarSubContent`   | 子菜单内容（对应 Radix `Menubar.SubContent`）                                                  |
| `MenubarSubTrigger`   | 子菜单触发器，右侧带 `ChevronRight` 箭头，支持 `inset` 缩进（对应 Radix `Menubar.SubTrigger`） |

## 变体

`Menubar` 系列组件**未定义 `cva` 变体**，样式由固定的类名列表 + CSS 变量驱动。

## 属性

### Menubar（根容器）

| 属性            | 类型                      | 默认值 | 说明                                                                                        |
| --------------- | ------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `value`         | `string`                  | —      | 当前激活的菜单值，来自 Radix primitives（`Menubar.Root`）                                   |
| `defaultValue`  | `string`                  | —      | 非受控模式下的初始激活菜单值，来自 Radix primitives（`Menubar.Root`）                       |
| `onValueChange` | `(value: string) => void` | —      | 激活菜单变化回调，来自 Radix primitives（`Menubar.Root`）                                   |
| `loop`          | `boolean`                 | —      | 键盘导航是否循环回绕，来自 Radix primitives（`Menubar.Root`，继承 `RovingFocusGroup.Root`） |
| `dir`           | `'ltr' \| 'rtl'`          | —      | 文本方向，来自 Radix primitives（`Menubar.Root`，继承 `RovingFocusGroup.Root`）             |
| `className`     | `string`                  | —      | 自定义类名，合并到末位                                                                      |

### MenubarMenu

| 属性       | 类型              | 默认值 | 说明                                                      |
| ---------- | ----------------- | ------ | --------------------------------------------------------- |
| `value`    | `string`          | —      | 该菜单的唯一标识，来自 Radix primitives（`Menubar.Menu`） |
| `children` | `React.ReactNode` | —      | 子节点，来自 Radix primitives（`Menubar.Menu`）           |

### MenubarTrigger

| 属性       | 类型                                         | 默认值 | 说明                                                                             |
| ---------- | -------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`Menubar.Trigger`）             |
| `onClick`  | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`Menubar.Trigger`）     |
| `disabled` | `boolean`                                    | —      | 禁用触发按钮（原生 `<button>` 属性），来自 Radix primitives（`Menubar.Trigger`） |

### MenubarContent

| 属性                     | 类型                                                                        | 默认值        | 说明                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `align`                  | `'start' \| 'center' \| 'end'`                                              | `'start'`     | 与触发器的对齐方式，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                                   |
| `alignOffset`            | `number`                                                                    | `-4`          | 对齐方向的偏移量（像素），来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                             |
| `side`                   | `'top' \| 'right' \| 'bottom' \| 'left'`                                    | `'bottom'`    | 菜单相对触发器的弹出方向，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                             |
| `sideOffset`             | `number`                                                                    | `8`           | 菜单与触发器之间的间距（像素），来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                       |
| `avoidCollisions`        | `boolean`                                                                   | `true`        | 是否自动避免与视口边界碰撞，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                           |
| `collisionBoundary`      | `Element \| Element[] \| null`                                              | `[]`          | 碰撞检测的边界元素，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                                   |
| `collisionPadding`       | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `0`           | 碰撞检测的边界内边距，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                                 |
| `arrowPadding`           | `number`                                                                    | `0`           | 箭头与触发器的内边距，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                                 |
| `sticky`                 | `'partial' \| 'always'`                                                     | `'partial'`   | 碰撞时是否保持粘附在触发器上，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                         |
| `hideWhenDetached`       | `boolean`                                                                   | `false`       | 触发器被完全遮挡时是否隐藏菜单，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                       |
| `updatePositionStrategy` | `'optimized' \| 'always'`                                                   | `'optimized'` | 位置更新策略，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                                         |
| `loop`                   | `boolean`                                                                   | `false`       | 键盘导航是否循环回绕，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                                 |
| `onCloseAutoFocus`       | `(event: Event) => void`                                                    | —             | 关闭时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`） |
| `onEscapeKeyDown`        | `(event: KeyboardEvent) => void`                                            | —             | 按下 `Escape` 时的回调，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                               |
| `onPointerDownOutside`   | `(event: PointerDownOutsideEvent) => void`                                  | —             | 在浮层外按下指针时的回调，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                             |
| `onFocusOutside`         | `(event: FocusOutsideEvent) => void`                                        | —             | 焦点移出浮层时的回调，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                                 |
| `onInteractOutside`      | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void`             | —             | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`Menubar.Content` 继承 `Menu.Content`）                 |
| `forceMount`             | `true`                                                                      | —             | 强制挂载，用于接管退出动画，来自 Radix primitives（`Menubar.Content`）                                               |
| `className`              | `string`                                                                    | —             | 自定义类名，合并到末位                                                                                               |

### MenubarItem

| 属性        | 类型                     | 默认值  | 说明                                                            |
| ----------- | ------------------------ | ------- | --------------------------------------------------------------- |
| `inset`     | `boolean`                | `false` | 是否缩进显示（追加 `pl-8`）                                     |
| `disabled`  | `boolean`                | `false` | 禁用该菜单项，来自 Radix primitives（`Menubar.Item`）           |
| `textValue` | `string`                 | —       | 用于键盘搜索匹配的文本，来自 Radix primitives（`Menubar.Item`） |
| `onSelect`  | `(event: Event) => void` | —       | 选中时的回调，来自 Radix primitives（`Menubar.Item`）           |
| `className` | `string`                 | —       | 自定义类名，合并到末位                                          |

### MenubarCheckboxItem

| 属性              | 类型                         | 默认值  | 说明                                                              |
| ----------------- | ---------------------------- | ------- | ----------------------------------------------------------------- |
| `checked`         | `boolean \| 'indeterminate'` | —       | 选中状态，来自 Radix primitives（`Menubar.CheckboxItem`）         |
| `onCheckedChange` | `(checked: boolean) => void` | —       | 选中状态变化回调，来自 Radix primitives（`Menubar.CheckboxItem`） |
| `disabled`        | `boolean`                    | `false` | 禁用该菜单项，来自 Radix primitives（`Menubar.CheckboxItem`）     |
| `onSelect`        | `(event: Event) => void`     | —       | 选中时的回调，来自 Radix primitives（`Menubar.CheckboxItem`）     |
| `className`       | `string`                     | —       | 自定义类名，合并到末位                                            |

### MenubarRadioItem

| 属性        | 类型                     | 默认值  | 说明                                                                 |
| ----------- | ------------------------ | ------- | -------------------------------------------------------------------- |
| `value`     | `string`                 | —       | 单选项的值（**必填**），来自 Radix primitives（`Menubar.RadioItem`） |
| `disabled`  | `boolean`                | `false` | 禁用该菜单项，来自 Radix primitives（`Menubar.RadioItem`）           |
| `onSelect`  | `(event: Event) => void` | —       | 选中时的回调，来自 Radix primitives（`Menubar.RadioItem`）           |
| `className` | `string`                 | —       | 自定义类名，合并到末位                                               |

### MenubarRadioGroup

| 属性            | 类型                      | 默认值 | 说明                                                          |
| --------------- | ------------------------- | ------ | ------------------------------------------------------------- |
| `value`         | `string`                  | —      | 当前选中的值，来自 Radix primitives（`Menubar.RadioGroup`）   |
| `onValueChange` | `(value: string) => void` | —      | 选中值变化回调，来自 Radix primitives（`Menubar.RadioGroup`） |

### MenubarLabel

| 属性        | 类型      | 默认值  | 说明                        |
| ----------- | --------- | ------- | --------------------------- |
| `inset`     | `boolean` | `false` | 是否缩进显示（追加 `pl-8`） |
| `className` | `string`  | —       | 自定义类名，合并到末位      |

### MenubarSubTrigger

| 属性        | 类型                     | 默认值  | 说明                                                                  |
| ----------- | ------------------------ | ------- | --------------------------------------------------------------------- |
| `inset`     | `boolean`                | `false` | 是否缩进显示（追加 `pl-8`）                                           |
| `disabled`  | `boolean`                | `false` | 禁用该子菜单触发项，来自 Radix primitives（`Menubar.SubTrigger`）     |
| `textValue` | `string`                 | —       | 用于键盘搜索匹配的文本，来自 Radix primitives（`Menubar.SubTrigger`） |
| `onSelect`  | `(event: Event) => void` | —       | 选中时的回调，来自 Radix primitives（`Menubar.SubTrigger`）           |
| `className` | `string`                 | —       | 自定义类名，合并到末位                                                |

### MenubarSub

| 属性           | 类型                      | 默认值 | 说明                                                               |
| -------------- | ------------------------- | ------ | ------------------------------------------------------------------ |
| `open`         | `boolean`                 | —      | 受控展开状态，来自 Radix primitives（`Menubar.Sub`）               |
| `defaultOpen`  | `boolean`                 | —      | 非受控模式下的初始展开状态，来自 Radix primitives（`Menubar.Sub`） |
| `onOpenChange` | `(open: boolean) => void` | —      | 展开状态变化回调，来自 Radix primitives（`Menubar.Sub`）           |

### MenubarSubContent

| 属性                   | 类型                                                                        | 默认值      | 说明                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `side`                 | `'top' \| 'right' \| 'bottom' \| 'left'`                                    | `'right'`   | 子菜单相对触发项的弹出方向，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                  |
| `sideOffset`           | `number`                                                                    | `0`         | 子菜单与触发项之间的间距（像素），来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）            |
| `align`                | `'start' \| 'end'`                                                          | `'start'`   | 与触发项的对齐方式（子菜单不支持 `center`），来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`） |
| `alignOffset`          | `number`                                                                    | `0`         | 对齐方向的偏移量（像素），来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                    |
| `avoidCollisions`      | `boolean`                                                                   | `true`      | 是否自动避免与视口边界碰撞，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                  |
| `collisionBoundary`    | `Element \| Element[] \| null`                                              | `[]`        | 碰撞检测的边界元素，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                          |
| `collisionPadding`     | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `0`         | 碰撞检测的边界内边距，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                        |
| `sticky`               | `'partial' \| 'always'`                                                     | `'partial'` | 碰撞时是否保持粘附在触发项上，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                |
| `hideWhenDetached`     | `boolean`                                                                   | `false`     | 触发项被完全遮挡时是否隐藏子菜单，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）            |
| `loop`                 | `boolean`                                                                   | `false`     | 键盘导航是否循环回绕，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                        |
| `onEscapeKeyDown`      | `(event: KeyboardEvent) => void`                                            | —           | 按下 `Escape` 时的回调，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                      |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void`                                  | —           | 在浮层外按下指针时的回调，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                    |
| `onFocusOutside`       | `(event: FocusOutsideEvent) => void`                                        | —           | 焦点移出浮层时的回调，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）                        |
| `onInteractOutside`    | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void`             | —           | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`Menubar.SubContent` 继承 `Menu.SubContent`）        |
| `forceMount`           | `true`                                                                      | —           | 强制挂载，用于接管退出动画，来自 Radix primitives（`Menubar.SubContent`）                                         |
| `className`            | `string`                                                                    | —           | 自定义类名，合并到末位                                                                                            |

### MenubarSeparator / MenubarShortcut

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

本表只列组件自有属性；此外还透传 `<div>` / `<button>` / `<span>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `Menubar` 渲染为 `role="menubar"`，`MenubarContent` 渲染为 `role="menu"`，`MenubarItem` 渲染为 `role="menuitem"`，复选项为 `role="menuitemcheckbox"`，单选项为 `role="menuitemradio"`。
- 根容器基于 Radix 的 `RovingFocusGroup`：整个菜单栏在 Tab 序列中只占一个停靠点，进入后用 `←` / `→` 在顶级菜单之间移动。
- 键盘行为：`Enter` / `Space` / `↓` 打开菜单；`↑` / `↓` 在菜单项间移动；`→` 打开子菜单、`←` 返回父菜单；`Escape` 关闭菜单并把焦点还给触发器。
- 菜单打开时焦点被锁定在菜单内，关闭后焦点回到对应触发器。
- 禁用项通过 `data-[disabled]` 状态属性设置 `pointer-events-none` 与半透明，并从键盘导航序列中跳过。
- `MenubarShortcut` 只是视觉提示，不会注册真实的键盘快捷键。

## 主题变量

| 变量                          | 说明                 |
| ----------------------------- | -------------------- |
| `--menubar-height`            | 菜单栏高度           |
| `--menubar-radius`            | 菜单栏圆角           |
| `--menubar-item-radius`       | 菜单项圆角           |
| `--menubar-item-font-size`    | 菜单项字号           |
| `--menubar-content-min-width` | 菜单内容最小宽度     |
| `--menubar-content-radius`    | 菜单内容圆角         |
| `--menubar-submenu-radius`    | 子菜单圆角           |
| `--menubar-padding`           | 菜单栏内边距         |
| `--menubar-item-spacing`      | 顶级菜单项之间的间距 |
| `--menubar-item-padding-x`    | 菜单项左右内边距     |
| `--menubar-item-padding-y`    | 菜单项上下内边距     |
| `--menubar-submenu-min-width` | 子菜单最小宽度       |
| `--menubar-submenu-padding`   | 子菜单内边距         |
| `--menubar-content-padding`   | 菜单内容内边距       |

## 组合用法 / 注意事项

- **每个顶级菜单需要 `MenubarMenu`**：`MenubarTrigger` 必须放在 `MenubarMenu` 内部，否则点击不会展开菜单。
- **`MenubarContent` 已内置 Portal**：不要在其内部再次包裹 `MenubarPrimitive.Portal`。
- **`MenubarSubContent` 没有内置 Portal**：如需脱离父级溢出裁剪，请自行包裹 `MenubarPrimitive.Portal`。
- **`align` / `alignOffset` / `sideOffset` 有内建默认值**：`align="start"`、`alignOffset={-4}`、`sideOffset={8}` 是组件显式解构后透传给 Radix 的值。
- **样式变量覆盖不完整**：`MenubarItem` / `MenubarSubTrigger` / `MenubarCheckboxItem` / `MenubarRadioItem` / `MenubarLabel` / `MenubarSeparator` / `MenubarShortcut` 使用的是**硬编码** Tailwind 类（如 `rounded-sm px-2 py-1.5 text-sm`、`bg-muted`），未走 CSS 变量；只有 `Menubar` 根容器、`MenubarTrigger`、`MenubarContent`、`MenubarSubContent` 使用了 `--menubar-*` 变量。
- **适合桌面端**：`Menubar` 是水平布局的桌面菜单，移动端请改用 `Sheet` 或 `DropdownMenu`。

## 导出

| 导出名                     | 类型                              | 说明                                               |
| -------------------------- | --------------------------------- | -------------------------------------------------- |
| `Menubar`                  | `React.ForwardRefExoticComponent` | 菜单栏根容器，ref 指向 `HTMLDivElement`            |
| `MenubarMenu`              | `React.FC<MenubarMenuProps>`      | 顶级菜单容器                                       |
| `MenubarTrigger`           | `React.ForwardRefExoticComponent` | 顶级菜单触发器，ref 指向 `HTMLButtonElement`       |
| `MenubarContent`           | `React.ForwardRefExoticComponent` | 菜单内容，ref 指向 `HTMLDivElement`                |
| `MenubarItem`              | `React.ForwardRefExoticComponent` | 菜单项，ref 指向 `HTMLDivElement`                  |
| `MenubarSeparator`         | `React.ForwardRefExoticComponent` | 分隔线，ref 指向 `HTMLDivElement`                  |
| `MenubarLabel`             | `React.ForwardRefExoticComponent` | 分组标题，ref 指向 `HTMLDivElement`                |
| `MenubarCheckboxItem`      | `React.ForwardRefExoticComponent` | 复选项，ref 指向 `HTMLDivElement`                  |
| `MenubarRadioGroup`        | `React.FC`                        | 单选组容器                                         |
| `MenubarRadioItem`         | `React.ForwardRefExoticComponent` | 单选项，ref 指向 `HTMLDivElement`                  |
| `MenubarPortal`            | `React.FC`                        | 传送门                                             |
| `MenubarSubContent`        | `React.ForwardRefExoticComponent` | 子菜单内容，ref 指向 `HTMLDivElement`              |
| `MenubarSubTrigger`        | `React.ForwardRefExoticComponent` | 子菜单触发器，ref 指向 `HTMLDivElement`            |
| `MenubarGroup`             | `React.FC`                        | 分组容器                                           |
| `MenubarSub`               | `React.FC`                        | 子菜单容器                                         |
| `MenubarShortcut`          | `React.FC`                        | 快捷键提示（`<span>`）                             |
| `MenubarProps`             | `interface`                       | 根容器属性类型（来自 `@radix-ui/react-menubar`）   |
| `MenubarTriggerProps`      | `interface`                       | 触发器属性类型（来自 `@radix-ui/react-menubar`）   |
| `MenubarContentProps`      | `interface`                       | 菜单内容属性类型（来自 `@radix-ui/react-menubar`） |
| `MenubarItemProps`         | `interface`                       | 菜单项属性类型（来自 `@radix-ui/react-menubar`）   |
| `MenubarCheckboxItemProps` | `interface`                       | 复选项属性类型（来自 `@radix-ui/react-menubar`）   |
| `MenubarRadioItemProps`    | `interface`                       | 单选项属性类型（来自 `@radix-ui/react-menubar`）   |
