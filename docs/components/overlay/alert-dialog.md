# AlertDialog 确认对话框

> 需要用户明确确认的模态对话框，用于危险操作、不可逆变更等关键决策场景。

---

**导入**

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@easbot/ui';
```

## 基础用法

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>删除项目</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>删除后不可恢复，确定继续吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>确认删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

尺寸、关闭按钮与语义变体：

```tsx
<AlertDialogContent size="sm" showCloseButton={false} variant="destructive">
  <AlertDialogHeader>
    <AlertDialogTitle>重要操作确认</AlertDialogTitle>
    <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
  </AlertDialogHeader>
  <AlertDialogFooter>
    <AlertDialogCancel>取消</AlertDialogCancel>
    <AlertDialogAction>确认</AlertDialogAction>
  </AlertDialogFooter>
</AlertDialogContent>
```

高阶封装 `AlertDialogModal`（自带图标、标题与确认 / 取消按钮）：

```tsx
import { useState } from 'react';
import { AlertDialogModal } from '@easbot/ui';

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        打开对话框
      </button>
      <AlertDialogModal
        title="操作确认"
        content="您确定要执行此操作吗？"
        variant="warning"
        open={open}
        onOpenChange={setOpen}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
```

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                               |
| ----------------- | -------------------------------------------------- |
| `default`（默认） | 主色实心按钮，`AlertDialogAction` 的默认样式       |
| `destructive`     | 危险色实心按钮                                     |
| `outline`         | 边框样式、透明背景，`AlertDialogCancel` 的默认样式 |
| `secondary`       | 次色实心按钮                                       |
| `ghost`           | 幽灵按钮，hover 时显示背景                         |
| `link`            | 链接样式，主色文字 + hover 下划线                  |

### size

| 取值              | 说明                                      |
| ----------------- | ----------------------------------------- |
| `default`（默认） | 默认，`h-9 px-4 py-2`（36px）             |
| `sm`              | 小，`h-8 gap-1.5 rounded-md px-3`（32px） |
| `lg`              | 大，`h-10 rounded-md px-6`（40px）        |
| `icon`            | 图标按钮，正方形 `size-9`（36px）         |

## 属性

继承自 `React.ComponentPropsWithoutRef<typeof DSAlertDialogContent>, UiMessageProps`。

| 属性                   | 类型                        | 默认值 | 说明                     |
| ---------------------- | --------------------------- | ------ | ------------------------ |
| `className?`           | `string`                    | —      | —                        |
| `size?`                | `'sm' \| 'default' \| 'lg'` | —      | —                        |
| `showCloseButton?`     | `boolean`                   | —      | // 内容区域大小          |
| `closeAriaLabel?`      | `string`                    | —      | // 是否显示关闭按钮      |
| `closeOnOverlayClick?` | `boolean`                   | —      | // 关闭按钮的 aria-label |
| `variant?`             | `AlertDialogVariants`       | —      | // 点击遮罩层是否关闭    |
| `children?`            | `React.ReactNode`           | —      | // 新增：关闭按钮的变体  |

## 属性（AlertDialogModalProps）

继承自 `UiMessageProps`。

| 属性               | 类型                        | 默认值 | 说明 |
| ------------------ | --------------------------- | ------ | ---- |
| `title?`           | `string`                    | —      | —    |
| `content`          | `React.ReactNode \| string` | —      | —    |
| `onOk?`            | `() => void`                | —      | —    |
| `onCancel?`        | `() => void`                | —      | —    |
| `variant?`         | `AlertDialogVariants`       | —      | —    |
| `open?`            | `boolean`                   | —      | —    |
| `onOpenChange?`    | `(open: boolean) => void`   | —      | —    |
| `okText?`          | `string`                    | —      | —    |
| `cancelText?`      | `string`                    | —      | —    |
| `showCloseButton?` | `boolean`                   | —      | —    |
| `closeAriaLabel?`  | `string`                    | —      | —    |
| `children?`        | `React.ReactNode`           | —      | —    |

## 属性（EunAlertDialogProps）

继承自 `React.ComponentPropsWithoutRef<typeof DSAlertDialog>`。

| 属性            | 类型                      | 默认值 | 说明                  |
| --------------- | ------------------------- | ------ | --------------------- |
| `children?`     | `React.ReactNode`         | —      | —                     |
| `className?`    | `string`                  | —      | // 明确添加 children  |
| `open?`         | `boolean`                 | —      | // 明确添加 className |
| `onOpenChange?` | `(open: boolean) => void` | —      | // 明确添加 open      |

`EunAlertDialogContentProps` 是 `AlertDialogContent` 的实际 Props 类型（`src/ui/alert-dialog/alert-dialog.tsx`）；`AlertDialogModalProps` 是高阶封装 `AlertDialogModal` 的属性接口；`EunAlertDialogProps` 是根组件 `AlertDialog` 的属性接口。

本表只列组件自有属性；此外还透传 Radix AlertDialog 对应部件的全部原生属性（`open` / `defaultOpen` / `onOpenChange` / `onEscapeKeyDown` / `onPointerDownOutside` / `disabled` / `className` / `aria-*` / `data-*` 等），并继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。

## 无障碍

- 底层 Radix AlertDialog 渲染为 `<div role="alertdialog" aria-modal="true">`，并注入 `aria-labelledby`（指向 `AlertDialogTitle`）/ `aria-describedby`（指向 `AlertDialogDescription`）/ `data-state`（`open` / `closed`）。
- 打开时焦点自动移入内容区并锁定（focus trap），关闭后焦点归还触发元素。
- 键盘操作：`Esc` 关闭对话框；`Tab` / `Shift+Tab` 在内容区内的可聚焦元素之间循环。
- 右上角关闭按钮是 `CloseButton` 组件渲染的原生 `<button>`，带 `aria-label`（内置文案「关闭」/ `Close`），图标为纯装饰。
- `AlertDialogAction` / `AlertDialogCancel` 渲染为原生 `<button>`，可直接被读屏定位与键盘触发。

## 注意事项

- **与 Dialog 的核心差异**：`AlertDialog` 是**强制决策**语义 —— 点击遮罩层不会关闭，必须通过「确认 / 取消」按钮明确表态；`Dialog` 是通用模态框。
- **`variant` 有两套语义，别混淆**：`AlertDialogContent` 的 `variant` 取值是 `AlertDialogVariants`（`default` / `destructive` / `success` / `warning` / `info`），它**只作用于右上角关闭按钮的配色**（传给内部 `CloseButton`），不影响内容区配色；上表的 `ds_variant` 是设计系统层 `buttonVariants` 的取值，供 `AlertDialogAction` / `AlertDialogCancel` 使用。
- **`AlertDialogVariants` 的取值**：`default` / `destructive` / `success` / `warning` / `info`（`src/ui/alert-dialog/alert-dialog.tsx` 中以联合类型声明）。
- **`size` 只影响内容区最大宽度**：`sm` → `sm:max-w-sm`，`default` → `sm:max-w-lg`，`lg` → `sm:max-w-xl`，默认 `'default'`。
- **`showCloseButton` 默认 `true`**：关闭按钮以 `AlertDialogCancel asChild` 包裹 `CloseButton` 渲染 —— `asChild` 场景下设计系统层**不会**注入 `buttonVariants`，只透传 `className`，因此按钮保持图标按钮的紧凑形态。
- **`closeOnOverlayClick` 当前不生效**：源码中该分支的处理代码被注释掉，`false` 时既不会阻止 `onEscapeKeyDown` 也不会阻止 `onPointerDownOutside` —— 请改用 Radix 的 `onPointerDownOutside` / `onEscapeKeyDown` 自行拦截。
- **关闭按钮形状为 `rounded-xs`（方角）**：源码注释说明此前用的是 `rounded-full`（圆形），与 Dialog / Drawer 不一致，现统一到 Dialog 基准（`overlayCloseIconButtonClass`）。
- **`AlertDialogModal` 的文案兜底**：`okText` / `cancelText` / `closeAriaLabel` 未传时取内置 `alert` 文案域（zh-CN「确认」/「取消」/「关闭」，en-US `Confirm` / `Cancel` / `Close`）。
- **`AlertDialogModal` 的图标由 `variant` 推导**：`warning` → `AlertCircle`（destructive 色）、`success` → `CheckCircle`（success 色）、`destructive` → `XCircle`（destructive 色）、其余 → `Info`（primary 色）。
- **`AlertDialogModal` 的确认 / 取消会主动关闭**：`onOk` 与 `onCancel` 执行后都会调用 `onOpenChange?.(false)`。
- **`AlertDialogModal` 的 `content` 传字符串时会被包进 `<span>`**，传 `ReactNode` 则原样渲染。
- **`AlertDialogOverlay` 的层级**：使用内联 `zIndex: var(--eas-z-index-dialog-overlay)`（1300）；调用方传入的 `style` 在后，可覆盖该层级。
- **根组件的 `className` 不会生效**：设计系统层的 `AlertDialog` 把 `className` 解构出来后**没有**传给 Radix Root —— `AlertDialog` 根组件不渲染 DOM 元素，因此 `className` 无处落地。请把样式写在 `AlertDialogContent` 上。
- **`AlertDialogAction` / `AlertDialogCancel` 支持 `asChild`**，可把内部按钮替换成自定义元素（如 `Button`）。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--eas-z-index-dialog-overlay`

## 导出

### 组件

| 导出名                       | 说明 |
| ---------------------------- | ---- |
| `AlertDialog`                |      |
| `AlertDialogAction`          |      |
| `AlertDialogCancel`          |      |
| `AlertDialogContent`         |      |
| `AlertDialogContentProps`    |      |
| `AlertDialogDescription`     |      |
| `AlertDialogFooter`          |      |
| `AlertDialogHeader`          |      |
| `AlertDialogModal`           |      |
| `AlertDialogModalProps`      |      |
| `AlertDialogOverlay`         |      |
| `AlertDialogPortal`          |      |
| `AlertDialogTitle`           |      |
| `AlertDialogTrigger`         |      |
| `AlertDialogVariants`        |      |
| `EunAlertDialogContentProps` |      |
