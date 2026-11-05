# DropdownMenu 下拉菜单

> 点击触发的操作菜单，支持分组、复选项、单选项、子菜单与快捷键提示。

---

**导入**

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';
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
      <DropdownMenuTrigger asChild>
        <Button variant="outline">打开菜单</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>账户设置</DropdownMenuLabel>
        <DropdownMenuItem>个人资料</DropdownMenuItem>
        <DropdownMenuItem>安全设置</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>退出登录</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

复选项、单选项与子菜单：

```tsx
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@easbot/ui';

<DropdownMenu>
  <DropdownMenuTrigger>高级菜单</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem checked>
      复选项 A<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
    </DropdownMenuCheckboxItem>
    <DropdownMenuRadioGroup value="r2">
      <DropdownMenuRadioItem value="r1">单选项 1</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="r2">单选项 2</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>子菜单</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>子菜单项 1</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>;
```

## 无障碍

- 底层 Radix DropdownMenu 渲染为 `<div role="menu">`，菜单项渲染为 `<div role="menuitem">`；复选项为 `role="menuitemcheckbox"`，单选项为 `role="menuitemradio"`，分组为 `role="group"`，标签为 `role="presentation"`。
- 触发器渲染为原生 `<button type="button">`，并注入 `aria-haspopup="menu"` / `aria-expanded` / `aria-controls` / `data-state`。
- 键盘操作：`Enter` / `Space` 打开菜单，`Esc` 关闭，方向键在菜单项之间移动，`Enter` 触发选中项；子菜单用 `→` / `←` 展开 / 收起。
- 菜单项支持 `disabled`，此时注入 `data-disabled` 并附加 `cursor-not-allowed` + `opacity-50`（不屏蔽指针事件，禁用光标才能真正显示，见 `spec/css-standard.md` §4.9）。
- 复选 / 单选状态由 `data-state`（`checked` / `unchecked`）与 `ItemIndicator` 表达，指示图标为纯装饰。
- 焦点样式使用 `focus:bg-accent`，键盘与指针焦点均有可见反馈。

## 注意事项

- **`src/ui` 层是纯 re-export**：`DropdownMenu` 及全部子组件直接等于设计系统层的实现（`src/design-system/components/ui/dropdown-menu.tsx`），组件未新增自有属性，props 与 Radix `DropdownMenu` 对应部件一致（`open` / `defaultOpen` / `onOpenChange` / `modal` / `dir` / `side` / `align` / `sideOffset` / `loop` / `disabled` / `className` / `aria-*` / `data-*` 等）。
- **子组件清单**：`DropdownMenu` / `DropdownMenuPortal` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuGroup` / `DropdownMenuLabel` / `DropdownMenuItem` / `DropdownMenuCheckboxItem` / `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` / `DropdownMenuSeparator` / `DropdownMenuShortcut` / `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent`。
- **`DropdownMenuItem` 支持两个自有属性**：`inset`（布尔，缩进对齐，用于与带图标的项对齐）与 `variant`（`'default' | 'destructive'`，危险项用 destructive 配色，会渲染 `data-variant="destructive"`）。`DropdownMenuLabel` / `DropdownMenuSubTrigger` 也支持 `inset`。
- **`DropdownMenuContent` 默认 `sideOffset={4}`**，最小宽度 `min-w-[8rem]`，最大高度受 `--radix-dropdown-menu-content-available-height` 约束并可滚动。
- **`DropdownMenuContent` 内部已自带 `DropdownMenuPrimitive.Portal`**，无需再手动包裹 `DropdownMenuPortal`。
- **`DropdownMenuShortcut` 是纯文本**（`<span>` + `ml-auto`），右对齐显示快捷键，组件本身**不绑定任何键盘快捷键** —— 需消费方自行实现。
- **`DropdownMenuSeparator` 渲染为 `<div role="separator">`**，仅作视觉分隔。
- **`DropdownMenuSubTrigger` 自带右箭头**（`ChevronRightIcon`），无需自行添加。
- **Storybook 中的 `size` / `variant`（content 级）不存在**：源码未在 `DropdownMenuContent` 上定义这两项，Story 里的用法带有 `@ts-expect-error` 注释，属于演示代码而非真实 API。
- **菜单项鼠标指针统一 `cursor-pointer`**（禁用项 `data-[disabled]:cursor-not-allowed`，与 Combobox / Select 选项共用一套契约，真值源 `src/design-system/lib/overlay-item-interaction.ts`，见 `spec/css-standard.md` §4.9.1）。

## 导出

### 组件

| 导出名                          | 说明 |
| ------------------------------- | ---- |
| `DropdownMenu`                  |      |
| `DropdownMenuCheckboxItem`      |      |
| `DropdownMenuCheckboxItemProps` |      |
| `DropdownMenuContent`           |      |
| `DropdownMenuContentProps`      |      |
| `DropdownMenuGroup`             |      |
| `DropdownMenuGroupProps`        |      |
| `DropdownMenuItem`              |      |
| `DropdownMenuItemProps`         |      |
| `DropdownMenuLabel`             |      |
| `DropdownMenuLabelProps`        |      |
| `DropdownMenuPortal`            |      |
| `DropdownMenuPortalProps`       |      |
| `DropdownMenuProps`             |      |
| `DropdownMenuRadioGroup`        |      |
| `DropdownMenuRadioGroupProps`   |      |
| `DropdownMenuRadioItem`         |      |
| `DropdownMenuRadioItemProps`    |      |
| `DropdownMenuSeparator`         |      |
| `DropdownMenuSeparatorProps`    |      |
| `DropdownMenuShortcut`          |      |
| `DropdownMenuShortcutProps`     |      |
| `DropdownMenuSub`               |      |
| `DropdownMenuSubContent`        |      |
| `DropdownMenuSubContentProps`   |      |
| `DropdownMenuSubProps`          |      |
| `DropdownMenuSubTrigger`        |      |
| `DropdownMenuSubTriggerProps`   |      |
| `DropdownMenuTrigger`           |      |
| `DropdownMenuTriggerProps`      |      |
