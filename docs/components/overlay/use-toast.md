# useToast 提示调用

> 以命令式方式触发、更新与关闭轻提示的 React Hook，配合 [`Toast`](./toast.md) 组件渲染。

**导入**

```tsx
import { useToast } from '@easbot/ui';
```

## 基础用法

> `useToast` **只维护状态队列，本身不渲染任何 DOM**。必须配合一个 "Toaster" 组件把 `toasts` 队列渲染为 `Toast`，并把 `ToastProvider` → `ToastViewport` 挂在它们之上。

```tsx
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToast,
} from '@easbot/ui';

function Toaster() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          duration={t.duration}
          open={t.open}
          onOpenChange={t.onOpenChange}
        >
          <ToastTitle>{t.title}</ToastTitle>
          <ToastDescription>{t.description}</ToastDescription>
        </Toast>
      ))}
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ToastViewport />
      <Toaster />
    </ToastProvider>
  );
}
```

在任意组件中触发：

```tsx
import { useToast } from '@easbot/ui';

export default function SaveButton() {
  const { toast } = useToast();

  return (
    <button type="button" onClick={() => toast({ title: '保存成功', description: '更改已同步。' })}>
      保存
    </button>
  );
}
```

## 组成部分

`useToast` 是 **Hook 而非组件**，没有子组件。它的组成部分是返回对象中的各项能力：

| 成员      | 说明                                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `toast`   | 触发一条提示的函数，返回 `{ id, dismiss, update }`                                                                                     |
| `dismiss` | 关闭（收起）指定提示的函数；不传 `id` 时关闭全部提示                                                                                   |
| `toasts`  | 当前提示队列数组，每项包含 `id` / `title` / `description` / `variant` / `duration` / `position` / `open` / `onOpenChange` / `style` 等 |

### 相关模块

| 名称            | 说明                                                              |
| --------------- | ----------------------------------------------------------------- |
| `ToastProvider` | Radix 全局提供者，需挂在 `ToastViewport` 之上（来自 `../toast`）  |
| `ToastViewport` | Radix 视口容器，`Toast` 必须位于其内部才会渲染（来自 `../toast`） |

## 变体

`toast()` 的 `variant` 支持三种取值：

| 取值          | 说明                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| `default`     | 默认配色，使用 `--toast-border` / `--toast-background` / `--toast-foreground` |
| `destructive` | 危险操作配色，使用 `--toast-destructive-*` 变量                               |
| `success`     | 成功配色，使用 `--toast-success-*` 变量                                       |

> 这些变量由 `Toast` 组件的 `cva` 消费；`useToast` 只负责把 `variant` 放进队列数据，需由渲染方传给 `<Toast variant={...}>` 才会生效。

### position（显示位置）

`position` 支持以下六种取值：

| 取值            | 说明               |
| --------------- | ------------------ |
| `top-left`      | 左上角             |
| `top-center`    | 顶部居中           |
| `top-right`     | 右上角             |
| `bottom-left`   | 左下角             |
| `bottom-center` | 底部居中           |
| `bottom-right`  | **默认值**，右下角 |

> ⚠️ **位置的实际表现由 `ToastViewport` 决定**：`useToast` 内部只把 `position` 原样存入队列数据，**不生成任何定位样式**。`ToastViewport` 的响应式类（`sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[var(--toast-max-width)]`）把提示固定在**右下角**（移动端为底部、纵向反序）。因此 `top-left` 等其余五种位置**在当前实现下不会生效**，需要自行改写 `ToastViewport` 的定位类来实现。

## 属性

### toast(options)

触发一条提示。参数类型为 `Toast`（即 `Omit<ToasterToast, 'id'>`），包含 `ToastProps` 的全部字段加上 `open` / `onOpenChange` / `style`：

| 参数           | 类型                                                                                                                                           | 默认值           | 说明                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------- |
| `title`        | `React.ReactNode`                                                                                                                              | —                | 标题内容                                                      |
| `description`  | `React.ReactNode`                                                                                                                              | —                | 描述内容                                                      |
| `variant`      | `'default' \| 'destructive' \| 'success'`                                                                                                      | —                | 样式变体                                                      |
| `duration`     | `number`                                                                                                                                       | —                | 显示时长（毫秒）；不传时使用 `ToastProvider` 的默认值（5000） |
| `position`     | `ToastPosition`                                                                                                                                | `'bottom-right'` | 显示位置（六种取值之一）                                      |
| `onClose`      | `() => void`                                                                                                                                   | —                | 关闭回调                                                      |
| `onPause`      | `(event: React.SyntheticEvent) => void`                                                                                                        | —                | 计时暂停回调                                                  |
| `onResume`     | `(event: React.SyntheticEvent) => void`                                                                                                        | —                | 计时恢复回调                                                  |
| `action`       | `React.ReactElement`                                                                                                                           | —                | 操作按钮元素                                                  |
| `className`    | `string`                                                                                                                                       | —                | 自定义类名                                                    |
| `style`        | `React.CSSProperties & { '--toast-background'?: string; '--toast-foreground'?: string; '--toast-border'?: string; '--toast-shadow'?: string }` | —                | 自定义样式，支持覆盖主题变量                                  |
| `open`         | `boolean`                                                                                                                                      | `true`           | 是否展开（内部自动设置）                                      |
| `onOpenChange` | `(open: boolean) => void`                                                                                                                      | —                | 展开状态变化回调（内部自动设置：`false` 时触发 dismiss）      |

返回值：

| 返回值    | 类型                            | 说明                                   |
| --------- | ------------------------------- | -------------------------------------- |
| `id`      | `string`                        | 本条提示的唯一标识（自增数字转字符串） |
| `dismiss` | `() => void`                    | 收起本条提示                           |
| `update`  | `(props: ToasterToast) => void` | 更新本条提示的数据                     |

### dismiss(toastId?)

| 参数      | 类型     | 默认值 | 说明                                    |
| --------- | -------- | ------ | --------------------------------------- |
| `toastId` | `string` | —      | 要关闭的提示 id；**不传时关闭全部提示** |

> `dismiss` 只是把提示标记为 `open: false`（收起动画），实际从队列中移除还要经过 `TOAST_REMOVE_DELAY`（10000 毫秒）的延迟。

### toasts

`ToasterToast[]` 数组，每项结构：

| 字段                   | 类型                                                                                                                                           | 说明                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `id`                   | `string`                                                                                                                                       | 提示的唯一标识                                                                |
| `title`                | `React.ReactNode`                                                                                                                              | 标题内容                                                                      |
| `description`          | `React.ReactNode`                                                                                                                              | 描述内容                                                                      |
| `variant`              | `'default' \| 'destructive' \| 'success'`                                                                                                      | 样式变体                                                                      |
| `duration`             | `number`                                                                                                                                       | 显示时长（毫秒）                                                              |
| `position`             | `ToastPosition`                                                                                                                                | 显示位置                                                                      |
| `onClose`              | `() => void`                                                                                                                                   | 关闭回调                                                                      |
| `onPause` / `onResume` | `(event: React.SyntheticEvent) => void`                                                                                                        | 计时暂停 / 恢复回调                                                           |
| `action`               | `React.ReactElement`                                                                                                                           | 操作按钮元素                                                                  |
| `className`            | `string`                                                                                                                                       | 自定义类名                                                                    |
| `open`                 | `boolean`                                                                                                                                      | 是否展开                                                                      |
| `onOpenChange`         | `(open: boolean) => void`                                                                                                                      | 展开状态变化回调                                                              |
| `style`                | `React.CSSProperties & { '--toast-background'?: string; '--toast-foreground'?: string; '--toast-border'?: string; '--toast-shadow'?: string }` | 内联样式，已注入 `maxWidth` / `zIndex` / `gap` / `padding`（读取自 CSS 变量） |

### ToastOptions

`src/ui/use-toast/use-toast.tsx` 中导出的独立类型，用于描述可选的提示配置：

| 字段        | 类型                                                                                                                                           | 说明                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `duration`  | `number`                                                                                                                                       | 持续时间（毫秒）         |
| `className` | `string`                                                                                                                                       | 自定义类名               |
| `position`  | `ToastPosition`                                                                                                                                | 显示位置                 |
| `variant`   | `'default' \| 'destructive' \| 'success'`                                                                                                      | 样式变体                 |
| `style`     | `React.CSSProperties & { '--toast-background'?: string; '--toast-foreground'?: string; '--toast-border'?: string; '--toast-shadow'?: string }` | 自定义样式，支持主题变量 |

> `ToastOptions` 在当前源码中**只是类型声明**，未被 `toast()` 函数直接使用（`toast()` 的参数类型是 `Toast = Omit<ToasterToast, 'id'>`，字段更全）。它可作为消费方自定义封装时的类型参考。

## 无障碍

- `useToast` 本身不产生任何 DOM，因此**不涉及**焦点、role 或 aria 属性；这些由 `Toast` / `ToastViewport` 组件（Radix primitives）负责。
- 队列中的每条提示都带有 `onOpenChange` 回调，Radix 在提示关闭（`open` 变为 `false`）时触发它，从而自动调用 `dismiss` 完成状态同步。
- 若渲染方忘记传入 `t.onOpenChange`，提示关闭后队列状态不会同步更新，会残留一条 `open: false` 的记录。
- 屏幕阅读器播报依赖 `Toast` 组件内部的隐藏 `role="status"` 区域；`useToast` 只负责数据分发。

## 主题变量

`useToast` 在触发提示时会通过 `getComputedStyle(document.documentElement)` **读取**以下 CSS 变量，并写入到提示的 `style` 中：

| 变量                | 说明                                                  |
| ------------------- | ----------------------------------------------------- |
| `--toast-max-width` | 读取后写入 `style.maxWidth`                           |
| `--toast-z-index`   | 读取后写入 `style.zIndex`（`Number.parseInt` 转数字） |
| `--toast-gap`       | 读取后写入 `style.gap`                                |
| `--toast-padding`   | 读取后写入 `style.padding`                            |

> 这四个变量需要定义在 `:root`（即 `document.documentElement`）上，否则读取结果为空字符串。

## 组合用法 / 注意事项

- **必须自建 "Toaster" 渲染层**：`useToast` 只维护队列，不渲染任何内容。没有渲染层就看不到任何提示。可参考上方「基础用法」中的 `Toaster` 组件。
- **挂载位置要求**：`ToastProvider` → `ToastViewport` → （`Toaster` 渲染的 `Toast`）。Radix 的 `Toast.Root` 在找不到 `viewport` 时返回 `null`，提示不会渲染。
- **全局单例队列**：`useToast` 使用模块级的 `memoryState` 与 `listeners` 数组，因此**所有** `useToast()` 调用共享同一个队列；在任意组件中调用 `toast()` 都会把提示推入同一个队列。
- **队列上限为 1**：`TOAST_LIMIT = 1`，`ADD_TOAST` 时使用 `[action.toast, ...state.toasts].slice(0, TOAST_LIMIT)`，即**同时最多显示 1 条提示**，新的会挤掉旧的。
- **移除延迟 10 秒**：提示被 `dismiss` 后只是收起，队列中的记录要等 `TOAST_REMOVE_DELAY`（10000 毫秒）后才真正移除。
- **`duration` 缺省时使用 `ToastProvider` 的值**：`ToastProvider` 未设置时为 5000 毫秒；也可单条传入 `duration` 覆盖。
- **`position` 六种取值目前只有 `bottom-right` 生效**：真正的定位由 `ToastViewport` 的类名决定，详见「变体 / position」说明。
- **`style` 会覆盖内联样式**：`toast()` 内部写入的 `maxWidth` / `zIndex` / `gap` / `padding` 会与调用方传入的 `style` **合并**（调用方的 `style` 在前，内置值在后覆盖同名项），因此调用方**无法**覆盖这四个内置内联值，但可以追加其它内联样式与 `--toast-*` 主题变量。
- **`reducer` 与 `toast` 也被导出**：`reducer`（纯函数状态 reducer）与 `toast`（独立触发函数，可在 React 组件之外调用）均可从包根导入。

## 导出

| 导出名          | 类型                                                                                              | 说明                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `useToast`      | `() => { toasts; toast; dismiss }`                                                                | 提示调用 Hook，返回队列与触发 / 关闭方法                                    |
| `toast`         | `(options: Toast) => { id; dismiss; update }`                                                     | 独立触发函数，可在 React 组件外调用                                         |
| `reducer`       | `(state: State, action: Action) => State`                                                         | 队列状态 reducer（纯函数）                                                  |
| `ToastOptions`  | `type`                                                                                            | 提示配置类型（`duration` / `className` / `position` / `variant` / `style`） |
| `ToastPosition` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | 显示位置类型                                                                |
