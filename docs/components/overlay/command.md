# Command 命令面板

> 可搜索的命令列表，既能内嵌页面，也能以对话框形式唤起。

---

**导入**

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@easbot/ui';
```

## 基础用法

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@easbot/ui';

export default function App() {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="输入命令..." />
      <CommandList>
        <CommandEmpty>未找到结果</CommandEmpty>
        <CommandGroup heading="建议">
          <CommandItem onSelect={() => console.log('搜索')}>搜索...</CommandItem>
          <CommandItem onSelect={() => console.log('过滤')}>过滤...</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
```

以对话框形式唤起：

```tsx
import { useState } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@easbot/ui';

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        打开命令面板
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="输入命令..." />
        <CommandList>
          <CommandEmpty>未找到结果</CommandEmpty>
          <CommandGroup heading="建议">
            <CommandItem onSelect={() => setOpen(false)}>搜索...</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="设置">
            <CommandItem onSelect={() => setOpen(false)}>个人资料</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

## 无障碍

- 底层基于 `cmdk`：命令面板容器渲染为 `<div cmdk-root>`，输入框为原生 `<input>`（`role="combobox"` / `aria-expanded` / `aria-autocomplete="list"`），命令列表为 `role="listbox"`，命令项为 `role="option"` 并带 `aria-selected`。
- 键盘操作：输入框自动聚焦；`↑` / `↓` 在命令项之间移动，`Enter` 触发当前项，`Esc` 清空输入或关闭对话框。
- `CommandEmpty` 仅在过滤结果为空时渲染，语义上由 `cmdk` 负责隐藏 / 显示。
- `CommandGroup` 的 `heading` 渲染为分组标题，命令项在该分组内由 `cmdk` 统一管理 roving focus（`aria-activedescendant`）。
- `CommandDialog` 内部复用了 Dialog 的无障碍能力：渲染 `role="dialog"` + `aria-modal="true"`，标题与描述以 `sr-only` 的 `DialogHeader` 提供（供读屏关联）。
- `CommandInput` 自带搜索图标（`SearchIcon`，纯装饰），命令项内的图标统一为 `size-4` 且 `pointer-events-none`。

## 注意事项

- **`src/ui` 层几乎全是 re-export**：`Command` / `CommandEmpty` / `CommandGroup` / `CommandInput` / `CommandItem` / `CommandList` / `CommandSeparator` / `CommandShortcut` 直接等于设计系统层实现（`src/design-system/components/ui/command.tsx`），组件未新增自有属性，props 与 `cmdk` 对应部件一致（`value` / `onValueChange` / `shouldFilter` / `filter` / `loop` / `disabled` / `className` / `aria-*` / `data-*` 等）。
- **`CommandDialog` 有两个自有属性**：`title` / `description`（字符串），并在 Radix Dialog 属性之上追加 `UiMessageProps`（`locale` / `messages`）。
- **`CommandDialog` 做了文案层包装**：标题与描述的默认文案来自内置 `command` 文案域（zh-CN「命令面板」/「搜索要执行的命令...」，en-US `Command Palette` / `Search for a command to run...`），消费方可通过 `title` / `description` 覆盖。
- **`CommandDialog` 的标题与描述是 `sr-only` 的**：视觉上不显示，仅供读屏使用。
- **`CommandDialog` 内部用 `DialogContent` 包裹 `Command`**：面板背景为 `bg-popover`，内容区 `overflow-hidden p-0`（由 `Command` 自身的内边距承担）。
- **`CommandDialog` 接受 Dialog 的全部属性**：`open` / `onOpenChange` / `modal` / `onEscapeKeyDown` 等均可透传。
- **`CommandInput` 自带包裹容器**：外层是 `flex h-9 items-center gap-2 border-b px-3`（含搜索图标），内层 `<input>` 才是实际的输入控件 —— 自定义样式时请区分 `data-slot="command-input-wrapper"` 与 `data-slot="command-input"`。
- **`CommandList` 高度上限 `max-h-[300px]`** 并可滚动。
- **`CommandShortcut` 是纯文本**（`<span>` + `ml-auto`），仅作快捷键提示，不绑定任何按键。
- **过滤由 `cmdk` 内置完成**：默认按 `value` / `keywords` 匹配，命中规则由 `cmdk` 决定；如需自定义请使用 `Command` 的 `shouldFilter` / `filter` 属性。

## 导出

### 组件

| 导出名                  | 说明 |
| ----------------------- | ---- |
| `Command`               |      |
| `CommandDialog`         |      |
| `CommandDialogProps`    |      |
| `CommandEmpty`          |      |
| `CommandEmptyProps`     |      |
| `CommandGroup`          |      |
| `CommandGroupProps`     |      |
| `CommandInput`          |      |
| `CommandInputProps`     |      |
| `CommandItem`           |      |
| `CommandItemProps`      |      |
| `CommandList`           |      |
| `CommandListProps`      |      |
| `CommandProps`          |      |
| `CommandSeparator`      |      |
| `CommandSeparatorProps` |      |
| `CommandShortcut`       |      |
| `CommandShortcutProps`  |      |
