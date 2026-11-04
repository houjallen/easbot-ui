# ContextMenu 右键菜单

> 右键（或长按）触发的上下文菜单，与 DropdownMenu 能力一致但触发方式不同。

---

**导入**

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-40 w-full rounded-md border border-dashed">
        在此区域右键点击
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>复制</ContextMenuItem>
        <ContextMenuItem>粘贴</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>删除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

复选项、单选项与子菜单：

```tsx
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@easbot/ui';

<ContextMenu>
  <ContextMenuTrigger>目标区域</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuCheckboxItem checked>显示网格</ContextMenuCheckboxItem>
    <ContextMenuRadioGroup value="z">
      <ContextMenuRadioItem value="z">按名称排序</ContextMenuRadioItem>
      <ContextMenuRadioItem value="m">按修改时间排序</ContextMenuRadioItem>
    </ContextMenuRadioGroup>
    <ContextMenuSub>
      <ContextMenuSubTrigger>更多</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>子菜单项</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>;
```

## 无障碍

- 底层 Radix ContextMenu 渲染为 `<div role="menu">`，菜单项渲染为 `<div role="menuitem">`；复选项为 `role="menuitemcheckbox"`，单选项为 `role="menuitemradio"`，分组为 `role="group"`。
- 触发区域渲染为 `<span>`（Radix 默认 `ContextMenuTrigger` 不渲染 `<button>`），并注入 `data-state`（`open` / `closed`）。
- 键盘操作：菜单打开后方向键在菜单项之间移动，`Enter` 触发选中项，`Esc` 关闭；子菜单用 `→` / `←` 展开 / 收起。
- 菜单项支持 `disabled`，此时注入 `data-disabled` 并附加 `pointer-events-none` + `opacity-50`。
- 复选 / 单选状态由 `data-state`（`checked` / `unchecked`）与 `ItemIndicator` 表达，指示图标为纯装饰。
- 焦点样式使用 `focus:bg-accent`，键盘与指针焦点均有可见反馈。

## 注意事项

- **`src/ui` 层是纯 re-export**：`ContextMenu` 及全部子组件直接等于设计系统层的实现（`src/design-system/components/ui/context-menu.tsx`），组件未新增自有属性，props 与 Radix `ContextMenu` 对应部件一致（`open` / `defaultOpen` / `onOpenChange` / `modal` / `dir` / `side` / `align` / `loop` / `disabled` / `className` / `aria-*` / `data-*` 等）。
- **子组件清单**：`ContextMenu` / `ContextMenuTrigger` / `ContextMenuContent` / `ContextMenuGroup` / `ContextMenuPortal` / `ContextMenuSub` / `ContextMenuSubTrigger` / `ContextMenuSubContent` / `ContextMenuRadioGroup` / `ContextMenuItem` / `ContextMenuCheckboxItem` / `ContextMenuRadioItem` / `ContextMenuLabel` / `ContextMenuSeparator` / `ContextMenuShortcut`。
- **`ContextMenuItem` 支持两个自有属性**：`inset`（布尔，缩进对齐）与 `variant`（`'default' | 'destructive'`，危险项用 destructive 配色，会渲染 `data-variant="destructive"`）。`ContextMenuLabel` / `ContextMenuSubTrigger` 也支持 `inset`。
- **`ContextMenuContent` 内部已自带 `ContextMenuPrimitive.Portal`**，无需再手动包裹 `ContextMenuPortal`。
- **最小宽度 `min-w-[8rem]`**，最大高度受 `--radix-context-menu-content-available-height` 约束并可滚动。
- **`ContextMenuShortcut` 是纯文本**（`<span>` + `ml-auto`），组件本身**不绑定任何键盘快捷键**。
- **`ContextMenuSubTrigger` 自带右箭头**（`ChevronRightIcon`），无需自行添加。
- **与 DropdownMenu 的差异**：触发方式不同（右键 vs 点击），其余能力（分组 / 复选 / 单选 / 子菜单 / 快捷键提示）完全一致。
- **不提供 `ContextMenuTrigger` 的 `asChild` 语义说明**：Radix 的 `ContextMenuTrigger` 支持 `asChild`，可用于自定义触发区域。

## 导出

### 组件

| 导出名                         | 说明 |
| ------------------------------ | ---- |
| `ContextMenu`                  |      |
| `ContextMenuCheckboxItem`      |      |
| `ContextMenuCheckboxItemProps` |      |
| `ContextMenuContent`           |      |
| `ContextMenuContentProps`      |      |
| `ContextMenuGroup`             |      |
| `ContextMenuGroupProps`        |      |
| `ContextMenuItem`              |      |
| `ContextMenuItemProps`         |      |
| `ContextMenuLabel`             |      |
| `ContextMenuLabelProps`        |      |
| `ContextMenuPortal`            |      |
| `ContextMenuPortalProps`       |      |
| `ContextMenuProps`             |      |
| `ContextMenuRadioGroup`        |      |
| `ContextMenuRadioGroupProps`   |      |
| `ContextMenuRadioItem`         |      |
| `ContextMenuRadioItemProps`    |      |
| `ContextMenuSeparator`         |      |
| `ContextMenuSeparatorProps`    |      |
| `ContextMenuShortcut`          |      |
| `ContextMenuShortcutProps`     |      |
| `ContextMenuSub`               |      |
| `ContextMenuSubContent`        |      |
| `ContextMenuSubContentProps`   |      |
| `ContextMenuSubProps`          |      |
| `ContextMenuSubTrigger`        |      |
| `ContextMenuSubTriggerProps`   |      |
| `ContextMenuTrigger`           |      |
| `ContextMenuTriggerProps`      |      |
