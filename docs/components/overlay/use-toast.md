# useToast 通知调用

> 以命令式方式触发、更新与关闭轻提示的 React Hook，配合 [`Toast`](./toast.md) 容器渲染。

---

**导入**

```tsx
import { useToast } from '@easbot/ui';
```

## 基础用法

> `useToast` **只维护状态队列，本身不渲染任何 DOM**。必须配合 [`Toaster`](./toast.md) 容器把队列渲染为通知。

```tsx
import { Button } from '@easbot/ui';
import { Toaster, useToast } from '@easbot/ui';

export default function App() {
  const { toast } = useToast();

  return (
    <>
      <Button onClick={() => toast({ title: '保存成功', description: '更改已同步。' })}>
        保存
      </Button>
      <Toaster />
    </>
  );
}
```

指定变体、位置与时长：

```tsx
toast({
  title: '操作失败',
  description: '请稍后重试',
  variant: 'destructive',
  position: 'top-right',
  duration: 10000,
});
```

在 React 之外关闭通知（模块级函数）：

```tsx
import { dismiss } from '@easbot/ui';

dismiss(); // 关闭全部
dismiss('3'); // 关闭指定 id
```

`State` 是 `use-toast/use-toast.tsx` 中导出的接口，描述 Hook 维护的队列结构（`toasts: ToasterToast[]`）。`toast()` 的入参类型是 `Omit<ToasterToast, 'id'>`，包含 `title` / `description` / `variant` / `duration` / `position` / `className` / `style` 等字段（`ToastOptions` 是同源的 `Pick` 类型别名）。

本表只列组件自有属性；此外 `toast()` 还接受 `open` / `onOpenChange` / `onClose` / `onPause` / `onResume` / `action` 等运行时字段（由内部状态注入或消费方按需覆盖）。

## 无障碍

- `useToast` 本身不产生任何 DOM，因此**不涉及**焦点、role 或 aria 属性；这些由 `Toast` / `ToastViewport` 组件（Radix primitives）负责。
- 队列中的每条通知都带有 `onOpenChange` 回调，Radix 在通知关闭（`open` 变为 `false`）时触发它，从而自动调用 `dismiss` 完成状态同步。
- 屏幕阅读器播报依赖 `Toast` 组件内部的隐藏 `role="status"` live region；`useToast` 只负责数据分发。
- 若渲染方忘记传入 `t.onOpenChange`，通知关闭后队列状态不会同步更新，会残留一条 `open: false` 的记录。

## 注意事项

- **全局单例队列**：`useToast` 使用模块级的 `memoryState` 与 `listeners` 数组，因此**所有** `useToast()` 调用共享同一个队列；在任意组件中调用 `toast()` 都会把通知推入同一个队列。
- **队列上限为 1**：`TOAST_LIMIT = 1`，`ADD_TOAST` 时使用 `[action.toast, ...state.toasts].slice(0, TOAST_LIMIT)` —— 同时最多显示 1 条通知，新的会挤掉旧的。
- **默认展示时长 5000ms**：`TOAST_DEFAULT_DURATION` 在此集中定义，`variant` / `duration` / `position` 三项的默认值与覆盖优先级都收口在 `toast()` 内部，避免「Provider 层一份、组件层一份」的双轨。
- **`duration` 在 `toast()` 兜底**：`Infinity` 表示**不自动关闭**（由消费方显式传入，Radix 支持 `Infinity` 语义）。
- **`position` 刻意不设默认值**：保持 `undefined`，让 `Toaster` 能回退到自己的 `position` —— 若在 `toast()` 里写死 `'bottom-right'`，`Toaster position="top-center"` 这类全局配置将完全失效。
- **关闭后延迟 300ms 移除**：`TOAST_REMOVE_DELAY = 300`（毫秒），让 Radix 的退出动画播完，否则会出现「瞬间消失」的生硬观感。
- **`dismiss` 只是标记关闭**：`dismiss(toastId)` 会把通知置为 `open: false` 并加入移除队列，实际从队列移除还要等 `TOAST_REMOVE_DELAY`；不传 `toastId` 时关闭全部通知。
- **`toast()` 返回 `{ id, dismiss, update }`**：`update(props)` 可更新已入队通知的数据（`UPDATE_TOAST` 会按 `id` 合并）。
- **不注入内联 `maxWidth` / `gap` / `padding`**：这三项已由 `Toast` 组件的 class 用 token 表达 —— 内联 style 优先级高于 class，一旦注入就会静默覆盖组件样式；消费方仍可通过 `style` 传自定义值覆盖。
- **`reducer` 与 `toast` 也被导出**：`reducer`（纯函数状态 reducer）与 `toast`（独立触发函数，可在 React 组件之外调用）均可从包根导入。
- **`ToastOptions` 是类型别名而非运行时值**：它从 `ToasterToast` 中 `Pick` 而来（`style` 只存在于 `ToasterToast`），适合消费方自定义封装时作为类型参考。
- **`ToastStyle` 支持 Toast 专属 CSS 变量**：包含 `--toast-background` / `--toast-foreground` / `--toast-border` / `--toast-shadow` / `--toast-max-width` / `--toast-z-index` / `--toast-gap` / `--toast-padding` 以及各 `destructive` / `success` / `warning` / `info` 前缀的变量。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--eas-gap-lg`
- `--eas-gap-sm`
- `--toast-max-width`
- `--toast-min-width`

## 导出

### 组件

| 导出名          | 说明 |
| --------------- | ---- |
| `State`         |      |
| `ToastOptions`  |      |
| `ToastPosition` |      |
| `ToastStyle`    |      |
| `ToasterToast`  |      |

### 类型与工具函数

| 导出名     | 说明 |
| ---------- | ---- |
| `dismiss`  |      |
| `reducer`  |      |
| `toast`    |      |
| `useToast` |      |
