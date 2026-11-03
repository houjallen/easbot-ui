# Command 命令面板

> 基于 [cmdk](https://cmdk.paco.me/) 构建的命令面板，提供模糊搜索、键盘导航与分组过滤能力。

**导入**

```tsx
import { Command } from '@easbot/ui';
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
    <Command>
      <CommandInput placeholder="输入命令…" />
      <CommandList>
        <CommandEmpty>没有找到结果。</CommandEmpty>
        <CommandGroup heading="文件">
          <CommandItem>新建文件</CommandItem>
          <CommandItem>重命名</CommandItem>
        </CommandGroup>
        <CommandGroup heading="操作">
          <CommandItem>复制</CommandItem>
          <CommandItem>粘贴</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
```

以对话框形式打开：

```tsx
import { Command, CommandDialog, CommandInput, CommandItem, CommandList } from '@easbot/ui';

export default function App() {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="搜索命令…" />
      <CommandList>
        <CommandItem onSelect={() => console.log('已触发')}>执行命令</CommandItem>
      </CommandList>
    </CommandDialog>
  );
}
```

## 组成部分

| 子组件             | 说明                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| `Command`          | 根组件，管理搜索词与选中项（对应 cmdk `Command`）                           |
| `CommandDialog`    | 对话框形式的命令面板，基于本库 `Dialog` 封装，额外支持 `loading` / `loader` |
| `CommandInput`     | 搜索输入框，外层带 `Search` 图标与分隔线（对应 cmdk `Command.Input`）       |
| `CommandList`      | 结果列表容器（对应 cmdk `Command.List`）                                    |
| `CommandEmpty`     | 无结果时的空状态提示（对应 cmdk `Command.Empty`）                           |
| `CommandGroup`     | 分组容器，可带分组标题（对应 cmdk `Command.Group`）                         |
| `CommandSeparator` | 分隔线（对应 cmdk `Command.Separator`）                                     |
| `CommandItem`      | 命令项，支持 `onSelect` 回调与悬停高亮（对应 cmdk `Command.Item`）          |
| `CommandShortcut`  | 快捷键提示文本（右对齐的 `<span>`）                                         |

## 变体

本组件**未定义 `cva` 变体**，样式由固定的类名列表 + CSS 变量驱动。

## 属性

### Command（根组件）

| 属性                      | 类型                                                             | 默认值  | 说明                                                                                     |
| ------------------------- | ---------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `label`                   | `string`                                                         | —       | 命令面板的无障碍标签（不显示在界面上），来自 cmdk `Command`                              |
| `shouldFilter`            | `boolean`                                                        | `true`  | 是否启用内置过滤与排序；设为 `false` 时需自行按搜索词条件渲染，来自 cmdk `Command`       |
| `filter`                  | `(value: string, search: string, keywords?: string[]) => number` | —       | 自定义过滤函数，返回 0 ~ 1 的匹配分数（1 为最佳匹配，0 为完全隐藏），来自 cmdk `Command` |
| `defaultValue`            | `string`                                                         | —       | 初始选中的项的值，来自 cmdk `Command`                                                    |
| `value`                   | `string`                                                         | —       | 受控的选中项值，来自 cmdk `Command`                                                      |
| `onValueChange`           | `(value: string) => void`                                        | —       | 选中项变化回调，来自 cmdk `Command`                                                      |
| `loop`                    | `boolean`                                                        | `false` | 方向键导航是否循环回绕，来自 cmdk `Command`                                              |
| `disablePointerSelection` | `boolean`                                                        | `false` | 是否禁用指针选中（仅允许键盘选择），来自 cmdk `Command`                                  |
| `vimBindings`             | `boolean`                                                        | `true`  | 是否启用 `ctrl+n` / `ctrl+j` / `ctrl+p` / `ctrl+k` 快捷键，来自 cmdk `Command`           |
| `asChild`                 | `boolean`                                                        | —       | 是否用 Slot 替换根元素，来自 cmdk `Command`                                              |
| `className`               | `string`                                                         | —       | 自定义类名，合并到末位                                                                   |

### CommandDialog

继承本库 `Dialog` 的全部 `DialogProps`（即 `open` / `defaultOpen` / `onOpenChange` / `modal` / `children`），并额外支持：

| 属性           | 类型                      | 默认值  | 说明                                                             |
| -------------- | ------------------------- | ------- | ---------------------------------------------------------------- |
| `loading`      | `boolean`                 | `false` | 是否显示加载遮罩；为 `true` 时在内容区叠加半透明遮罩与加载指示器 |
| `loader`       | `React.ReactNode`         | —       | 自定义加载指示器；不传时使用本库的 `Spinner`（`h-8 w-8`）        |
| `open`         | `boolean`                 | —       | 受控打开状态，来自本库 `Dialog`（`Dialog.Root`）                 |
| `defaultOpen`  | `boolean`                 | —       | 非受控模式下的初始打开状态，来自本库 `Dialog`（`Dialog.Root`）   |
| `onOpenChange` | `(open: boolean) => void` | —       | 打开状态变化回调，来自本库 `Dialog`（`Dialog.Root`）             |
| `modal`        | `boolean`                 | `true`  | 是否为模态对话框，来自本库 `Dialog`（`Dialog.Root`）             |
| `className`    | `string`                  | —       | 自定义类名，合并到末位（作用于内部 `DialogContent`）             |

### CommandInput

| 属性            | 类型                       | 默认值 | 说明                                                           |
| --------------- | -------------------------- | ------ | -------------------------------------------------------------- |
| `value`         | `string`                   | —      | 受控的搜索词，来自 cmdk `Command.Input`                        |
| `onValueChange` | `(search: string) => void` | —      | 搜索词变化回调，来自 cmdk `Command.Input`                      |
| `placeholder`   | `string`                   | —      | 占位提示文本（原生 `<input>` 属性），来自 cmdk `Command.Input` |
| `autoFocus`     | `boolean`                  | —      | 是否自动聚焦（原生 `<input>` 属性），来自 cmdk `Command.Input` |
| `disabled`      | `boolean`                  | —      | 禁用输入框（原生 `<input>` 属性），来自 cmdk `Command.Input`   |
| `className`     | `string`                   | —      | 自定义类名，合并到末位                                         |

### CommandList

| 属性        | 类型     | 默认值 | 说明                                                             |
| ----------- | -------- | ------ | ---------------------------------------------------------------- |
| `label`     | `string` | —      | 结果列表的无障碍标签（不显示在界面上），来自 cmdk `Command.List` |
| `className` | `string` | —      | 自定义类名，合并到末位                                           |

### CommandEmpty

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

### CommandGroup

| 属性         | 类型              | 默认值 | 说明                                                                 |
| ------------ | ----------------- | ------ | -------------------------------------------------------------------- |
| `heading`    | `React.ReactNode` | —      | 分组标题（渲染为 `cmdk-group-heading`），来自 cmdk `Command.Group`   |
| `value`      | `string`          | —      | 分组的唯一值；未提供 `heading` 时**必填**，来自 cmdk `Command.Group` |
| `forceMount` | `boolean`         | —      | 是否强制渲染（不受过滤影响），来自 cmdk `Command.Group`              |
| `className`  | `string`          | —      | 自定义类名，合并到末位                                               |

### CommandSeparator

| 属性           | 类型      | 默认值 | 说明                                                              |
| -------------- | --------- | ------ | ----------------------------------------------------------------- |
| `alwaysRender` | `boolean` | —      | 是否始终渲染（搜索词非空时也显示），来自 cmdk `Command.Separator` |
| `className`    | `string`  | —      | 自定义类名，合并到末位                                            |

### CommandItem

| 属性         | 类型                      | 默认值 | 说明                                                                                                                                                           |
| ------------ | ------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onSelect`   | `(value: string) => void` | —      | 选中时的回调；**注意**本组件额外在根层包裹了一个覆盖热区，点击该热区时会以 `children` 为字符串时取其文本作为 `value` 调用 `onSelect`，来自 cmdk `Command.Item` |
| `value`      | `string`                  | —      | 项的唯一值；未提供时由 `children` 或渲染后的 `textContent` 推断，来自 cmdk `Command.Item`                                                                      |
| `keywords`   | `string[]`                | —      | 额外的匹配关键词，用于过滤，来自 cmdk `Command.Item`                                                                                                           |
| `disabled`   | `boolean`                 | —      | 禁用该命令项，来自 cmdk `Command.Item`                                                                                                                         |
| `forceMount` | `boolean`                 | —      | 是否强制渲染（不受过滤影响），来自 cmdk `Command.Item`                                                                                                         |
| `className`  | `string`                  | —      | 自定义类名，合并到末位                                                                                                                                         |

### CommandShortcut

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

本表只列组件自有属性；此外还透传 `<div>` / `<input>` / `<span>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `Command` 渲染为 `role="combobox"` 的容器结构，`CommandInput` 为真正的 `<input>`，屏幕阅读器可朗读输入内容。
- `CommandList` 渲染为 `role="listbox"`，`CommandItem` 渲染为 `role="option"` 并通过 `aria-selected` 标记当前高亮项。
- `CommandGroup` 渲染为 `role="group"`，其标题通过 `aria-labelledby` 与组内项关联。
- `CommandEmpty` 渲染为 `role="presentation"`，仅在过滤后无结果时出现。
- 键盘行为：`↑` / `↓` 在命令项之间移动；`Enter` 选中当前项；`Esc` 关闭 `CommandDialog`；`ctrl+n` / `ctrl+j` / `ctrl+p` / `ctrl+k` 可用于 vim 风格导航（可通过 `vimBindings={false}` 关闭）。
- `CommandItem` 内部的悬停热区覆盖层标记了 `aria-hidden="true"`，对辅助技术隐藏，不影响语义。
- `CommandDialog` 基于本库 `Dialog`：渲染为 `role="dialog"`，默认模态，焦点被锁定在面板内，关闭后焦点回到触发元素。

## 主题变量

| 变量                                 | 说明                         |
| ------------------------------------ | ---------------------------- |
| `--command-background`               | 面板背景色                   |
| `--command-foreground`               | 面板文字色                   |
| `--command-border`                   | 输入框底部分隔线颜色         |
| `--command-input-height`             | 输入框高度                   |
| `--command-input-bg`                 | 输入框背景色                 |
| `--command-input-placeholder`        | 输入框占位文字颜色           |
| `--command-item-bg`                  | 命令项背景色                 |
| `--command-item-hover-bg`            | 命令项 hover / 选中背景色    |
| `--command-item-hover-fg`            | 命令项 hover / 选中文字色    |
| `--command-item-hover-shadow`        | 命令项 hover / 选中阴影      |
| `--command-item-disabled-opacity`    | 命令项禁用透明度             |
| `--command-item-padding`             | 命令项内边距                 |
| `--command-item-transition-duration` | 命令项过渡动画时长           |
| `--command-item-transition-timing`   | 命令项过渡缓动函数           |
| `--command-empty-text`               | 空状态文字颜色               |
| `--command-group-heading-color`      | 分组标题颜色                 |
| `--command-separator-color`          | 分隔线颜色                   |
| `--command-dialog-content-padding`   | `CommandDialog` 内容区内边距 |
| `--command-dialog-shadow`            | `CommandDialog` 内容区阴影   |
| `--command-loading-bg`               | 加载遮罩背景色               |
| `--command-loading-bg-opacity`       | 加载遮罩透明度               |

## 组合用法 / 注意事项

- **`CommandDialog` 内置了 `DialogContent`（含 Portal 与 Overlay）**：不要在其内部再嵌套 `Dialog`。
- **`CommandItem` 的点击行为有两条路径**：cmdk 原生的 `onSelect`（键盘选择与真实点击）+ 组件额外添加的 `absolute inset-0` 覆盖热区。该热区在点击时会 `preventDefault` 并以 `children` 为字符串时取其文本作为 `value` 调用 `onSelect`；若 `children` 不是字符串（如 JSX 元素），则传入空字符串 `''`。因此**依赖 `onSelect` 参数值时，请显式传 `value`**。
- **覆盖热区会拦截指针事件**：它位于命令项之上（`z-10`），意味着项内的按钮 / 链接无法直接点击，需要自行调整层级或改用 `className` 提升内容层级。
- **`CommandItem` 需要稳定的 `value`**：若渲染文本会随状态变化，必须显式传 `value`，否则 cmdk 的选中态会错乱。
- **`CommandEmpty` 必须放在 `CommandList` 内**：cmdk 仅在列表上下文中才会显示空状态。
- **禁用内置过滤时需自行渲染**：`shouldFilter={false}` 后，cmdk 不会自动隐藏不匹配的项，需根据搜索词自行条件渲染。
- **`CommandDialog` 的 `loading` 遮罩使用内联 style**：`backgroundColor` / `opacity` 读取 `--command-loading-bg` 与 `--command-loading-bg-opacity`，是本库中少数使用内联 style 的地方（动态计算值允许内联）。

## 导出

| 导出名               | 类型                              | 说明                                                                        |
| -------------------- | --------------------------------- | --------------------------------------------------------------------------- |
| `Command`            | `React.ForwardRefExoticComponent` | 命令面板根组件，ref 指向 `HTMLDivElement`                                   |
| `CommandDialog`      | `React.FC<CommandDialogProps>`    | 对话框形式的命令面板                                                        |
| `CommandEmpty`       | `React.ForwardRefExoticComponent` | 空状态提示，ref 指向 `HTMLDivElement`                                       |
| `CommandGroup`       | `React.ForwardRefExoticComponent` | 分组容器，ref 指向 `HTMLDivElement`                                         |
| `CommandInput`       | `React.ForwardRefExoticComponent` | 搜索输入框，ref 指向 `HTMLInputElement`                                     |
| `CommandItem`        | `React.ForwardRefExoticComponent` | 命令项，ref 指向 `HTMLDivElement`                                           |
| `CommandList`        | `React.ForwardRefExoticComponent` | 结果列表，ref 指向 `HTMLDivElement`                                         |
| `CommandSeparator`   | `React.ForwardRefExoticComponent` | 分隔线，ref 指向 `HTMLDivElement`                                           |
| `CommandShortcut`    | `React.FC`                        | 快捷键提示（`<span>`）                                                      |
| `CommandProps`       | `type`                            | 根组件属性类型（`React.ComponentPropsWithoutRef<typeof CommandPrimitive>`） |
| `CommandDialogProps` | `interface`                       | 对话框属性接口（继承 `DialogProps` + `loading` / `loader`）                 |
