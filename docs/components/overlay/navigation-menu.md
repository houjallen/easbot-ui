# NavigationMenu 站点导航

> 站点级导航菜单，顶级项展开后展示富内容面板（含链接列表、卡片网格等）。

---

**导入**

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@easbot/ui';
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
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger value="products">产品</NavigationMenuTrigger>
          <NavigationMenuContent className="h-auto w-auto overflow-auto">
            <ul className="grid max-h-[240px] w-[320px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="/overview">
                    <div className="font-medium">产品概览</div>
                    <div className="text-muted-foreground text-xs">
                      了解我们产品的主要功能和优势。
                    </div>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

## 无障碍

- 底层 Radix NavigationMenu 渲染为 `<nav>` 语义容器（`NavigationMenu` 根节点带 `aria-label` 由消费方传入），菜单列表为 `<ul>`，项为 `<li>`。
- 触发器渲染为原生 `<button type="button">`，并注入 `aria-expanded` / `aria-controls` / `data-state`（`open` / `closed`）。
- 展开状态下的内容区带 `data-motion`（`from-start` / `from-end` / `to-start` / `to-end`），用于驱动进出场动画。
- 链接项渲染为原生 `<a>`，并注入 `data-active`（当前路由命中时为 `true`）用于高亮。
- 键盘操作：`Enter` / `Space` 展开顶级项，方向键在导航项之间移动，`Esc` 收起展开的内容；焦点进入链接后可通过 `Tab` 在链接列表中移动。
- 触发器自带下箭头（`ChevronDownIcon`，`aria-hidden="true"`），展开时旋转 180°，是纯装饰。
- 焦点样式使用 `focus-visible:outline-1` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。

## 注意事项

- **`src/ui` 层是纯 re-export**：`NavigationMenu` 及全部子组件直接等于设计系统层的实现（`src/design-system/components/ui/navigation-menu.tsx`），组件未新增自有属性，props 与 Radix `NavigationMenu` 对应部件一致（`value` / `defaultValue` / `onValueChange` / `delayDuration` / `skipDelayDuration` / `orientation` / `dir` / `className` / `aria-*` / `data-*` 等）。
- **子组件清单**：`NavigationMenu` / `NavigationMenuList` / `NavigationMenuItem` / `NavigationMenuContent` / `NavigationMenuTrigger` / `NavigationMenuLink` / `NavigationMenuViewport` / `navigationMenuTriggerStyle`。
- **`viewport` 默认 `true`**：根组件默认自动渲染一个 `NavigationMenuViewport`（共享的大浮层容器）。若每个菜单项要独立展开自己的面板，传 `viewport={false}`（Storybook 示例即采用此写法）。
- **`NavigationMenuIndicator` 未从 `src/ui` 导出**：设计系统层实现了该组件，但 `src/ui/navigation-menu/index.ts` 未导出它，消费方无法从包根 import。
- **`navigationMenuTriggerStyle` 是可复用的 `cva` 样式函数**：从包根导出，供自定义触发器时复用同一套视觉规范；它只有基础类，没有 `variants` 分组。
- **内容区尺寸由 CSS 变量决定**：`NavigationMenuViewport` 的高度取 `var(--radix-navigation-menu-viewport-height)`、宽度取 `var(--radix-navigation-menu-viewport-width)`，由 Radix 在展开时写入实际值。
- **`NavigationMenuLink` 支持 `asChild`**：可把链接内容替换成自定义元素（如 `<a>`），但**禁用态需自行处理** —— Storybook 示例中使用了 `@ts-expect-error` 绕过类型检查，属于演示代码而非真实 API。
- **根节点自带 `position: relative` 与 `max-w-max`**：源码注释说明这是为了保证浮层内容正常显示；如需自定义容器样式请通过 `className` 覆盖。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--radix-navigation-menu-viewport-height`
- `--radix-navigation-menu-viewport-width`

## 导出

### 组件

| 导出名                        | 说明 |
| ----------------------------- | ---- |
| `NavigationMenu`              |      |
| `NavigationMenuContent`       |      |
| `NavigationMenuContentProps`  |      |
| `NavigationMenuItem`          |      |
| `NavigationMenuItemProps`     |      |
| `NavigationMenuLink`          |      |
| `NavigationMenuLinkProps`     |      |
| `NavigationMenuList`          |      |
| `NavigationMenuListProps`     |      |
| `NavigationMenuProps`         |      |
| `NavigationMenuTrigger`       |      |
| `NavigationMenuTriggerProps`  |      |
| `NavigationMenuViewport`      |      |
| `NavigationMenuViewportProps` |      |

### 类型与工具函数

| 导出名                       | 说明 |
| ---------------------------- | ---- |
| `navigationMenuTriggerStyle` |      |
