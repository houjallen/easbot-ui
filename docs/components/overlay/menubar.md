# Menubar 桌面菜单栏

> 桌面端顶部的常驻菜单栏，含多个顶级菜单与下拉面板。

---

**导入**

```tsx
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>文件</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            新建 <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            打开 <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            保存 <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>编辑</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>撤销</MenubarItem>
          <MenubarItem disabled>重做</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

## 无障碍

- 底层 Radix Menubar 渲染为 `<div role="menubar">`，每个顶级菜单为 `<div role="menu">`，菜单项为 `<div role="menuitem">`；复选项为 `role="menuitemcheckbox"`，单选项为 `role="menuitemradio"`，分组为 `role="group"`。
- 触发器渲染为原生 `<button type="button">`，并注入 `aria-haspopup="menu"` / `aria-expanded` / `aria-controls` / `data-state`。
- 键盘操作：`Enter` / `Space` 打开菜单，方向键在菜单项之间移动，`Esc` 关闭；`Alt`（Windows 为 `Alt`、macOS 为 `Ctrl`）可快速聚焦菜单栏。
- 菜单项支持 `disabled`，此时注入 `data-disabled` 并附加 `cursor-not-allowed` + `opacity-50`（不屏蔽指针事件，禁用光标才能真正显示，见 `spec/css-standard.md` §4.9）。
- 复选 / 单选状态由 `data-state`（`checked` / `unchecked`）与 `ItemIndicator` 表达，指示图标为纯装饰。
- 焦点样式使用 `focus:bg-accent`，键盘与指针焦点均有可见反馈。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Menubar` 及全部子组件直接等于设计系统层的实现（`src/design-system/components/ui/menubar.tsx`），组件未新增自有属性，props 与 Radix `Menubar` 对应部件一致（`open` / `defaultOpen` / `onOpenChange` / `modal` / `dir` / `loop` / `value` / `onValueChange` / `className` / `aria-*` / `data-*` 等）。
- **子组件清单**：`Menubar` / `MenubarMenu` / `MenubarTrigger` / `MenubarContent` / `MenubarItem` / `MenubarSeparator` / `MenubarLabel` / `MenubarCheckboxItem` / `MenubarRadioGroup` / `MenubarRadioItem` / `MenubarPortal` / `MenubarSub` / `MenubarSubTrigger` / `MenubarSubContent` / `MenubarShortcut` / `MenubarGroup`。
- **`MenubarItem` 支持两个自有属性**：`inset`（布尔，缩进对齐）与 `variant`（`'default' | 'destructive'`，危险项用 destructive 配色，会渲染 `data-variant="destructive"`）。`MenubarLabel` / `MenubarSubTrigger` 也支持 `inset`。
- **`MenubarContent` 内部已自带 `MenubarPortal`**，无需再手动包裹 `MenubarPortal`。
- **`MenubarContent` 有三个内置默认值**：`align="start"`、`alignOffset={-4}`、`sideOffset={8}`，消费方传入的值会覆盖。
- **最小宽度 `min-w-[12rem]`**（比 DropdownMenu 的 `8rem` 更宽，适配菜单栏场景）。
- **`MenubarShortcut` 是纯文本**（`<span>` + `ml-auto`），组件本身**不绑定任何键盘快捷键** —— 需消费方自行实现。
- **`MenubarSubTrigger` 自带右箭头**（`ChevronRightIcon`），无需自行添加。
- **菜单栏本体有固定高度 `h-9`**，内边距 `p-1`，圆角 `rounded-md`。
- **与 DropdownMenu 的差异**：`Menubar` 是常驻在页面顶部的多顶级菜单结构（`Menubar` → `MenubarMenu` → `MenubarTrigger`），而 `DropdownMenu` 是单个触发器的下拉菜单。
- **菜单项鼠标指针统一 `cursor-pointer`**（禁用项 `data-[disabled]:cursor-not-allowed`，与 Combobox / Select 选项共用一套契约，真值源 `src/design-system/lib/overlay-item-interaction.ts`，见 `spec/css-standard.md` §4.9.1）。

## 导出

### 组件

| 导出名                     | 说明 |
| -------------------------- | ---- |
| `Menubar`                  |      |
| `MenubarCheckboxItem`      |      |
| `MenubarCheckboxItemProps` |      |
| `MenubarContent`           |      |
| `MenubarContentProps`      |      |
| `MenubarGroup`             |      |
| `MenubarGroupProps`        |      |
| `MenubarItem`              |      |
| `MenubarItemProps`         |      |
| `MenubarLabel`             |      |
| `MenubarLabelProps`        |      |
| `MenubarMenu`              |      |
| `MenubarMenuProps`         |      |
| `MenubarPortal`            |      |
| `MenubarPortalProps`       |      |
| `MenubarProps`             |      |
| `MenubarRadioGroup`        |      |
| `MenubarRadioGroupProps`   |      |
| `MenubarRadioItem`         |      |
| `MenubarRadioItemProps`    |      |
| `MenubarSeparator`         |      |
| `MenubarSeparatorProps`    |      |
| `MenubarShortcut`          |      |
| `MenubarShortcutProps`     |      |
| `MenubarSub`               |      |
| `MenubarSubContent`        |      |
| `MenubarSubContentProps`   |      |
| `MenubarSubProps`          |      |
| `MenubarSubTrigger`        |      |
| `MenubarSubTriggerProps`   |      |
| `MenubarTrigger`           |      |
| `MenubarTriggerProps`      |      |
