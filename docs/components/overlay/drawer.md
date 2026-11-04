# Drawer 底部抽屉

> 支持手势拖拽的移动端抽屉，默认从底部滑入，适合表单、操作面板等场景。

---

**导入**

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">打开抽屉</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>抽屉标题</DrawerTitle>
          <DrawerDescription>这是一个抽屉示例</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button">关闭</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

从指定方向滑入（`side`）：

```tsx
<DrawerContent side="left">
  <DrawerHeader>
    <DrawerTitle>左侧抽屉</DrawerTitle>
  </DrawerHeader>
</DrawerContent>
```

## 无障碍

- 底层基于 `vaul`（Radix Dialog 的衍生实现），渲染为 `<div role="dialog" aria-modal="true">`，并注入 `aria-labelledby`（指向 `DrawerTitle`）/ `aria-describedby`（指向 `DrawerDescription`）/ `data-state`（`open` / `closed`）。
- 打开时焦点自动移入内容区并锁定（focus trap），关闭后焦点归还触发元素。
- 键盘操作：`Esc` 关闭抽屉；`Tab` / `Shift+Tab` 在内容区内的可聚焦元素之间循环。
- 底部方向支持**手势下拉关闭**（`vaul` 的 `drag` 能力）；拖拽指示条是纯装饰元素。
- 右上角关闭按钮是原生 `<button>`，内含 `<span class="sr-only">` 提供读屏可读名称（内置文案「关闭」/ `Close`），图标为纯装饰。
- 焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。

## 注意事项

- **`side` 有四个取值**：`'top'` / `'right'` / `'bottom'` / `'left'`，默认 `'bottom'`；`top` / `bottom` 为 `max-h-[80vh]` 并带 `mt-24` / `mb-24` 的安全间距，`left` / `right` 为 `w-3/4 sm:max-w-sm`。
- **props 与 `vaul` 一致**：`Drawer` / `DrawerTrigger` / `DrawerClose` / `DrawerOverlay` / `DrawerHeader` / `DrawerFooter` / `DrawerTitle` / `DrawerDescription` 均是 `vaul` 对应部件的薄封装，props 完全一致；`DrawerContent` 在 `vaul` `Drawer.Content` 之上扩展了两个自有属性 —— `side`（方向）与 `UiMessageProps`（`locale` / `messages`，供关闭按钮文案国际化）。
- **拖拽指示条只在 `side="bottom"` 时显示**（`side === 'bottom' && 'block'`），其它方向隐藏。
- **圆角随方向变化**：`bottom` → `rounded-t-lg`，`top` → `rounded-b-lg`。
- **`DrawerContent` 内部已自带 `DrawerPortal` + `DrawerOverlay`**，无需再手动包裹 `DrawerPortal`。
- **`DrawerContent` 默认带关闭按钮**：位置 `absolute top-4 right-4` + `rounded-xs`（方角）——源码注释说明此前用的是 `top-8 right-4`（为拖拽条让位），与 Dialog 不一致，现已统一到 Dialog 基准。
- **`locale` / `messages` 只对 `DrawerContent` 生效**：关闭按钮文案通过 `DrawerContent` 透传给设计系统层。
- **与 Sheet 的区别**：`Drawer` 基于 `vaul`（有手势拖拽与 `snapToHeight` 等能力），`Sheet` 基于 Radix Dialog primitives（无手势）。
- **标题区右侧预留 `pr-10`**：标题不得被右上角关闭按钮压住（`overlayHeaderPrClass` 硬约束）。
- **`DrawerHeader` / `DrawerFooter` 的内边距为 `p-6`**：与 Dialog / AlertDialog / Sheet 一致；`DrawerFooter` 带 `mt-auto`，会贴到底部。
- **遮罩层与内容层用固定 `z-50`**：`Drawer` 未使用 `--eas-z-index-dialog` 系列主题变量。

## 导出

### 组件

| 导出名                   | 说明 |
| ------------------------ | ---- |
| `Drawer`                 |      |
| `DrawerClose`            |      |
| `DrawerCloseProps`       |      |
| `DrawerContent`          |      |
| `DrawerContentProps`     |      |
| `DrawerDescription`      |      |
| `DrawerDescriptionProps` |      |
| `DrawerFooter`           |      |
| `DrawerFooterProps`      |      |
| `DrawerHeader`           |      |
| `DrawerHeaderProps`      |      |
| `DrawerOverlay`          |      |
| `DrawerOverlayProps`     |      |
| `DrawerProps`            |      |
| `DrawerTitle`            |      |
| `DrawerTitleProps`       |      |
| `DrawerTrigger`          |      |
| `DrawerTriggerProps`     |      |
