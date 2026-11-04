# Dialog 对话框

> 模态对话框，用于在当前页面之上展示需要用户专注处理的内容。

---

**导入**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">编辑个人资料</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
          <DialogDescription>请完善您的个人信息，点击保存后立即生效。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

受控用法：

```tsx
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>受控对话框</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>;
```

支持最大化 / 还原：

```tsx
<DialogContent maximizable>
  <DialogHeader>
    <DialogTitle>支持最大化的对话框</DialogTitle>
  </DialogHeader>
</DialogContent>
```

## 属性

继承自 `React.ComponentProps<typeof DsDialogContent>, UiMessageProps`。

| 属性           | 类型      | 默认值 | 说明               |
| -------------- | --------- | ------ | ------------------ |
| `maximizable?` | `boolean` | —      | 是否显示最大化按钮 |

`EunDialogContentProps` 是 `DialogContent` 的实际 Props 类型（`src/ui/dialog/dialog.tsx`）。本表只列组件自有属性（`maximizable`）；此外还透传 Radix Dialog Content 的全部原生属性（`open` / `onOpenChange` / `onEscapeKeyDown` / `onPointerDownOutside` / `onInteractOutside` / `forceMount` / `className` / `aria-*` / `data-*` 等），并继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。

其余子组件（`Dialog` / `DialogTrigger` / `DialogPortal` / `DialogOverlay` / `DialogClose` / `DialogHeader` / `DialogFooter` / `DialogTitle` / `DialogDescription`）的 props 与 Radix `Dialog` 对应部件一致，组件未新增自有属性。

## 无障碍

- 底层 Radix Dialog 渲染为 `<div role="dialog" aria-modal="true">`，并注入 `aria-labelledby`（指向 `DialogTitle`）/ `aria-describedby`（指向 `DialogDescription`）/ `data-state`（`open` / `closed`）。
- 打开时焦点自动移入内容区并锁定（focus trap），关闭后焦点归还触发元素。
- 键盘操作：`Esc` 关闭对话框；`Tab` / `Shift+Tab` 在内容区内的可聚焦元素之间循环。
- 点击遮罩层（`onPointerDownOutside`）或点击内容区外部（`onInteractOutside`）默认关闭，可通过对应回调拦截。
- 右上角关闭按钮是内容区内的原生 `<button>`，内含 `<span class="sr-only">` 提供读屏可读名称（内置文案「关闭」/ `Close`），图标本身为纯装饰。
- 最大化按钮是原生 `<button type="button">`，带 `aria-label`（内置文案「最大化」/「还原」/ `Maximize` / `Restore`）与 `sr-only` 文本，图标为纯装饰。
- 焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。

## 注意事项

- **内容必须挂在 `DialogContent` 内**：`DialogContent` 内部已自带 `DialogPortal` + `DialogOverlay`，无需再手动包裹 `DialogPortal`。
- **`DialogContent` 与 `EunDialogContent` 是同一个组件**：源码里 `EunDialogContent` 被 `export { ... EunDialogContent as DialogContent ... }` 重命名导出，因此两个名字都可从包根 import（`EunDialogContentProps` / `DialogContentProps` 同样是同一个类型的两个别名）。
- **`DialogContent` 默认带关闭按钮**：设计系统层在内容区右上角渲染关闭按钮，消费方无需自行添加；如需隐藏请覆盖 `className`。
- **`maximizable` 只在 `EunDialogContent` 上生效**：传入 `maximizable` 后会在内容区右上角追加一个最大化 / 还原按钮（位于关闭按钮左侧），最大化时通过 `!max-w-none !w-full !h-full !top-0 !left-0 !translate-x-0 !translate-y-0 fixed inset-0` 覆盖布局类。
- **最大化状态是组件内部状态**：切换后 `className` 会被组件的 `maximized` 类覆盖在前、`className` 在后（`cn` 末位优先），因此消费方自定义类名优先级最高。
- **关闭按钮文案走内置文案表**：`dialog` 文案域提供 zh-CN「关闭」/ en-US `Close`（键名 `closeAriaLabel`），可用 `locale` / `messages` 覆盖。
- **层级由主题变量控制**：内容用 `--eas-z-index-dialog`（1400），遮罩用 `--eas-z-index-dialog-overlay`（1300）。
- **标题区右侧预留 `pr-10`**：标题不得被右上角关闭按钮压住（`overlayHeaderPrClass` 硬约束）。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--eas-z-index-dialog`
- `--eas-z-index-dialog-overlay`

## 导出

### 组件

| 导出名                   | 说明 |
| ------------------------ | ---- |
| `Dialog`                 |      |
| `DialogClose`            |      |
| `DialogCloseProps`       |      |
| `DialogContent`          |      |
| `DialogContentProps`     |      |
| `DialogDescription`      |      |
| `DialogDescriptionProps` |      |
| `DialogFooter`           |      |
| `DialogFooterProps`      |      |
| `DialogHeader`           |      |
| `DialogHeaderProps`      |      |
| `DialogOverlay`          |      |
| `DialogOverlayProps`     |      |
| `DialogPortal`           |      |
| `DialogPortalProps`      |      |
| `DialogProps`            |      |
| `DialogTitle`            |      |
| `DialogTitleProps`       |      |
| `DialogTrigger`          |      |
| `DialogTriggerProps`     |      |
| `EunDialogContent`       |      |
| `EunDialogContentProps`  |      |
