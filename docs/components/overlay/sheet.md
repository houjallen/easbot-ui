# Sheet 侧边抽屉

> 从屏幕边缘滑入的面板，用于承载设置、详情等次级内容，不打断当前页面上下文。

---

**导入**

```tsx
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">打开设置</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>设置</SheetTitle>
          <SheetDescription>在这里管理您的账户设置和偏好。</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">保存更改</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

从指定方向滑入（`side`）：

```tsx
<SheetContent side="left">
  <SheetHeader>
    <SheetTitle>左侧抽屉</SheetTitle>
  </SheetHeader>
</SheetContent>
```

## 无障碍

- 底层基于 Radix Dialog primitives，渲染为 `<div role="dialog" aria-modal="true">`，并注入 `aria-labelledby`（指向 `SheetTitle`）/ `aria-describedby`（指向 `SheetDescription`）/ `data-state`（`open` / `closed`）。
- 打开时焦点自动移入内容区并锁定（focus trap），关闭后焦点归还触发元素。
- 键盘操作：`Esc` 关闭抽屉；`Tab` / `Shift+Tab` 在内容区内的可聚焦元素之间循环。
- 点击遮罩层（`onPointerDownOutside`）默认关闭，可通过对应回调拦截。
- 右上角关闭按钮是原生 `<button>`，内含 `<span class="sr-only">` 提供读屏可读名称（内置文案「关闭」/ `Close`），图标为纯装饰。
- 焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。

## 注意事项

- **`side` 有四个取值**：`'top'` / `'right'` / `'bottom'` / `'left'`，默认 `'right'`；分别对应不同的滑入 / 滑出方向与定位类（`right` / `left` 为全高，`w-3/4 sm:max-w-sm`；`top` / `bottom` 为 `h-auto`）。
- **props 与 Radix Dialog 一致**：`Sheet` / `SheetTrigger` / `SheetClose` / `SheetHeader` / `SheetFooter` / `SheetTitle` / `SheetDescription` 均是 Radix Dialog 对应部件的薄封装，props 完全一致；`SheetContent` 在 Radix `Dialog.Content` 之上扩展了两个自有属性 —— `side`（方向）与 `UiMessageProps`（`locale` / `messages`，供关闭按钮文案国际化）。
- **`SheetContent` 内部已自带 `SheetPortal` + `SheetOverlay`**，无需再手动包裹 `SheetPortal`。
- **`SheetContent` 默认带关闭按钮**：设计系统层在内容区右上角渲染关闭按钮（`overlayCloseButtonClass`，`absolute top-4 right-4` + `rounded-xs` 方角）。
- **`locale` / `messages` 只对 `SheetContent` 生效**：关闭按钮文案通过 `SheetContent` 透传给设计系统层，`Sheet` / `SheetTrigger` 等不接收 `UiMessageProps`。
- **与 Drawer 的区别**：`Sheet` 基于 Radix Dialog primitives（无手势拖拽），`Drawer` 基于 `vaul`（支持手势下拉关闭）。
- **标题区右侧预留 `pr-10`**：标题不得被右上角关闭按钮压住（`overlayHeaderPrClass` 硬约束）。
- **`SheetHeader` / `SheetFooter` 的内边距为 `p-6`**：与 Dialog / AlertDialog / Drawer 一致（此前是 `p-4`）；`SheetFooter` 带 `mt-auto`，会贴到底部。
- **遮罩层与内容层用固定 `z-50`**：`Sheet` 未使用 `--eas-z-index-dialog` 系列主题变量。

## 导出

### 组件

| 导出名                  | 说明 |
| ----------------------- | ---- |
| `Sheet`                 |      |
| `SheetClose`            |      |
| `SheetContent`          |      |
| `SheetContentProps`     |      |
| `SheetDescription`      |      |
| `SheetDescriptionProps` |      |
| `SheetFooter`           |      |
| `SheetFooterProps`      |      |
| `SheetHeader`           |      |
| `SheetHeaderProps`      |      |
| `SheetProps`            |      |
| `SheetTitle`            |      |
| `SheetTitleProps`       |      |
| `SheetTrigger`          |      |
