# NavigationMenu 导航菜单

> 站点级响应式导航菜单，支持悬停展开的大型内容视口与普通链接项混排。

**导入**

```tsx
import { NavigationMenu } from '@easbot/ui';
```

## 基础用法

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="/">首页</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>产品</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              <li>
                <NavigationMenuLink href="/product/a">产品 A</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/product/b">产品 B</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

## 组成部分

| 子组件                   | 说明                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `NavigationMenu`         | 根容器，管理激活项、方向与展开模式；**已内置** `NavigationMenuViewport`（对应 Radix `NavigationMenu.Root`） |
| `NavigationMenuList`     | 菜单项列表容器，渲染为 `<ul>`（对应 Radix `NavigationMenu.List`）                                           |
| `NavigationMenuItem`     | 单个菜单项，渲染为 `<li>`（对应 Radix `NavigationMenu.Item`）                                               |
| `NavigationMenuTrigger`  | 触发器按钮，右侧带 `ChevronDown` 箭头（对应 Radix `NavigationMenu.Trigger`）                                |
| `NavigationMenuLink`     | 链接项，渲染为 `<a>`（对应 Radix `NavigationMenu.Link`）                                                    |
| `NavigationMenuContent`  | 展开内容区（对应 Radix `NavigationMenu.Content`）                                                           |
| `NavigationMenuViewport` | 视口容器，包裹实际显示的内容面板（对应 Radix `NavigationMenu.Viewport`）                                    |

> 组件只导出以上 7 个成员。Radix 的 `NavigationMenu.Sub` / `NavigationMenu.Indicator` **未被封装导出**。另外 `NavigationMenu` 根组件**自动渲染**了一个 `NavigationMenuViewport`，若手动再放一个会出现两个视口。

## 变体

`navigationMenuTriggerVariants` 是导出的 `cva` 变体常量（**无 variants 维度**，仅一组基础类名），供二次封装触发器样式时复用。

| 导出常量                        | 说明                                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navigationMenuTriggerVariants` | `NavigationMenuTrigger` 的基础类名集合：高度、圆角、背景、内边距、字号、`hover` / `focus` / `disabled` / `data-[active]` / `data-[state=open]` 状态样式 |

## 属性

### NavigationMenu（根容器）

| 属性                | 类型                         | 默认值         | 说明                                                                                                                                   |
| ------------------- | ---------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `value`             | `string`                     | —              | 当前激活项的值，来自 Radix primitives（`NavigationMenu.Root`）                                                                         |
| `defaultValue`      | `string`                     | —              | 非受控模式下的初始激活项，来自 Radix primitives（`NavigationMenu.Root`）                                                               |
| `onValueChange`     | `(value: string) => void`    | —              | 激活项变化回调，来自 Radix primitives（`NavigationMenu.Root`）                                                                         |
| `dir`               | `'ltr' \| 'rtl'`             | `'ltr'`        | 文本方向，来自 Radix primitives（`NavigationMenu.Root`）                                                                               |
| `orientation`       | `'horizontal' \| 'vertical'` | `'horizontal'` | 菜单方向，来自 Radix primitives（`NavigationMenu.Root`）                                                                               |
| `delayDuration`     | `number`                     | `200`          | 指针进入触发器到内容展开的延迟（毫秒）；`activationMode="manual"` 时忽略，来自 Radix primitives（`NavigationMenu.Root`）               |
| `skipDelayDuration` | `number`                     | `300`          | 用户可直接进入另一个触发器而不再次延迟的时间（毫秒）；`activationMode="manual"` 时忽略，来自 Radix primitives（`NavigationMenu.Root`） |
| `activationMode`    | `'automatic' \| 'manual'`    | `'automatic'`  | 展开模式：`automatic` 悬停 / 聚焦即展开，`manual` 需点击触发器，来自 Radix primitives（`NavigationMenu.Root`）                         |
| `className`         | `string`                     | —              | 自定义类名，合并到末位                                                                                                                 |

### NavigationMenuList

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

### NavigationMenuItem

| 属性        | 类型     | 默认值 | 说明                                                           |
| ----------- | -------- | ------ | -------------------------------------------------------------- |
| `value`     | `string` | —      | 该项的唯一标识，来自 Radix primitives（`NavigationMenu.Item`） |
| `className` | `string` | —      | 自定义类名，合并到末位                                         |

### NavigationMenuTrigger

| 属性        | 类型                                         | 默认值 | 说明                                                                                    |
| ----------- | -------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `asChild`   | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`NavigationMenu.Trigger`）             |
| `onClick`   | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`NavigationMenu.Trigger`）     |
| `disabled`  | `boolean`                                    | —      | 禁用触发按钮（原生 `<button>` 属性），来自 Radix primitives（`NavigationMenu.Trigger`） |
| `className` | `string`                                     | —      | 自定义类名，合并到末位                                                                  |

### NavigationMenuLink

| 属性        | 类型                     | 默认值 | 说明                                                                                               |
| ----------- | ------------------------ | ------ | -------------------------------------------------------------------------------------------------- |
| `active`    | `boolean`                | —      | 是否处于激活状态（Radix 会据此注入 `data-active`），来自 Radix primitives（`NavigationMenu.Link`） |
| `onSelect`  | `(event: Event) => void` | —      | 选中时的回调，来自 Radix primitives（`NavigationMenu.Link`）                                       |
| `href`      | `string`                 | —      | 链接地址（原生 `<a>` 属性），来自 Radix primitives（`NavigationMenu.Link`）                        |
| `target`    | `string`                 | —      | 链接打开目标（原生 `<a>` 属性），来自 Radix primitives（`NavigationMenu.Link`）                    |
| `className` | `string`                 | —      | 自定义类名，合并到末位                                                                             |

### NavigationMenuContent

| 属性                   | 类型                                                            | 默认值 | 说明                                                                                    |
| ---------------------- | --------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `forceMount`           | `true`                                                          | —      | 强制挂载，用于接管退出动画，来自 Radix primitives（`NavigationMenu.Content`）           |
| `onEscapeKeyDown`      | `(event: KeyboardEvent) => void`                                | —      | 按下 `Escape` 时的回调，来自 Radix primitives（`NavigationMenu.Content`）               |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void`                      | —      | 在浮层外按下指针时的回调，来自 Radix primitives（`NavigationMenu.Content`）             |
| `onFocusOutside`       | `(event: FocusOutsideEvent) => void`                            | —      | 焦点移出浮层时的回调，来自 Radix primitives（`NavigationMenu.Content`）                 |
| `onInteractOutside`    | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void` | —      | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`NavigationMenu.Content`） |
| `className`            | `string`                                                        | —      | 自定义类名，合并到末位                                                                  |

### NavigationMenuViewport

| 属性         | 类型     | 默认值 | 说明                                                                           |
| ------------ | -------- | ------ | ------------------------------------------------------------------------------ |
| `forceMount` | `true`   | —      | 强制挂载，用于接管退出动画，来自 Radix primitives（`NavigationMenu.Viewport`） |
| `className`  | `string` | —      | 自定义类名，合并到末位                                                         |

本表只列组件自有属性；此外还透传 `<nav>` / `<ul>` / `<li>` / `<button>` / `<a>` / `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `NavigationMenu` 渲染为 `<nav>`，内部列表渲染为 `<ul>`、菜单项渲染为 `<li>`，具备完整的列表语义。
- `NavigationMenuTrigger` 带 `aria-expanded` / `aria-controls`，展开状态由 Radix 注入；`NavigationMenuLink` 通过 `aria-current="page"` 标记当前页（由 `active` 状态驱动）。
- 键盘行为：`Enter` / `Space` 打开展开项；`Tab` 在菜单项之间移动；`Escape` 关闭展开的内容区。
- `activationMode="manual"` 时仅响应点击，忽略悬停与聚焦，适合触屏或需要精确操作的场景。
- 焦点管理使用 Radix 的 `VisuallyHidden` focus proxy：内容区关闭后焦点会平滑回到触发器。
- `NavigationMenuContent` 的动画由 `data-[motion=from-*]` / `data-[motion=to-*]` 状态属性驱动（Radix 在展开 / 收起时写入）。

## 主题变量

| 变量                                      | 说明                                                  |
| ----------------------------------------- | ----------------------------------------------------- |
| `--nav-menu-z-index`                      | 导航菜单层级                                          |
| `--nav-menu-item-spacing`                 | 菜单项之间的间距                                      |
| `--nav-menu-trigger-height`               | 触发器高度                                            |
| `--nav-menu-trigger-radius`               | 触发器圆角                                            |
| `--nav-menu-trigger-padding-x`            | 触发器左右内边距                                      |
| `--nav-menu-trigger-padding-y`            | 触发器上下内边距                                      |
| `--nav-menu-trigger-font-size`            | 触发器字号                                            |
| `--nav-menu-viewport-margin`              | 视口与触发器的垂直间距                                |
| `--nav-menu-viewport-radius`              | 视口圆角                                              |
| `--nav-menu-viewport-shadow`              | 视口阴影                                              |
| `--radix-navigation-menu-viewport-height` | 视口高度（由 `@radix-ui/react-navigation-menu` 注入） |
| `--radix-navigation-menu-viewport-width`  | 视口宽度（由 `@radix-ui/react-navigation-menu` 注入） |

## 组合用法 / 注意事项

- **`NavigationMenu` 已内置 `NavigationMenuViewport`**：根组件在 `children` 之后会自动渲染一个视口。**不要**再手动放置 `NavigationMenuViewport`，否则会出现两个视口导致内容重复显示。
- **`NavigationMenuViewport` 自己包了一层 `<div>`**：内层是 Radix 的 Viewport，外层是绝对定位的 `left-0 top-full flex justify-center` 容器；自定义 `className` 作用在**内层** Viewport 上。
- **`activationMode` 决定交互模式**：`automatic`（默认）悬停即展开，`manual` 需点击触发器；后者会同时忽略 `delayDuration` / `skipDelayDuration`。
- **响应式布局由内容区类名承担**：`NavigationMenuContent` 使用 `md:absolute md:w-auto`，移动端为相对定位、桌面端才绝对定位。
- **视口尺寸由 Radix 注入**：容器高度 / 宽度分别来自 `--radix-navigation-menu-viewport-height` 与 `--radix-navigation-menu-viewport-width`，这两个变量由 Radix 在运行时写入元素本身（而非主题文件），因此**不可**在主题中静态覆盖。
- **未封装 `NavigationMenu.Sub` 与 `NavigationMenu.Indicator`**：需要多级嵌套导航或下划线指示器时，请自行从 `@radix-ui/react-navigation-menu` 引入。

## 导出

| 导出名                          | 类型                              | 说明                                                                  |
| ------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `navigationMenuTriggerVariants` | `ReturnType<typeof cva>`          | 触发器 `cva` 变体定义（无 variants 维度，仅基础类名），可用于二次封装 |
| `NavigationMenu`                | `React.ForwardRefExoticComponent` | 导航菜单根容器，ref 指向 `HTMLElement`                                |
| `NavigationMenuList`            | `React.ForwardRefExoticComponent` | 菜单列表容器，ref 指向 `HTMLUListElement`                             |
| `NavigationMenuItem`            | `React.ForwardRefExoticComponent` | 菜单项，ref 指向 `HTMLLIElement`                                      |
| `NavigationMenuContent`         | `React.ForwardRefExoticComponent` | 内容区，ref 指向 `HTMLDivElement`                                     |
| `NavigationMenuTrigger`         | `React.ForwardRefExoticComponent` | 触发器，ref 指向 `HTMLButtonElement`                                  |
| `NavigationMenuLink`            | `React.ForwardRefExoticComponent` | 链接项，ref 指向 `HTMLAnchorElement`                                  |
| `NavigationMenuViewport`        | `React.ForwardRefExoticComponent` | 视口容器，ref 指向 `HTMLDivElement`                                   |
| `NavigationMenuProps`           | `interface`                       | 根容器属性类型（来自 `@radix-ui/react-navigation-menu`）              |
| `NavigationMenuTriggerProps`    | `interface`                       | 触发器属性类型（来自 `@radix-ui/react-navigation-menu`）              |
| `NavigationMenuContentProps`    | `interface`                       | 内容区属性类型（来自 `@radix-ui/react-navigation-menu`）              |
| `NavigationMenuLinkProps`       | `interface`                       | 链接项属性类型（来自 `@radix-ui/react-navigation-menu`）              |
| `NavigationMenuViewportProps`   | `interface`                       | 视口属性类型（来自 `@radix-ui/react-navigation-menu`）                |
