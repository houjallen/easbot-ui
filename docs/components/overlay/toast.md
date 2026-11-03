# Toast 轻提示

> 短暂浮现在页面角落的通知，用于告知操作结果、错误信息或系统状态。

**导入**

```tsx
import { Toast } from '@easbot/ui';
```

## 基础用法

> Radix 的 `Toast` **必须**挂在 `ToastViewport` 之下，否则 `Toast` 组件会返回 `null`（不渲染任何内容）。请确保 `ToastProvider` → `ToastViewport` → `Toast` 的层级顺序。

```tsx
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@easbot/ui';

export default function App() {
  return (
    <ToastProvider>
      <ToastViewport />
      <Toast>
        <ToastTitle>保存成功</ToastTitle>
        <ToastDescription>你的更改已同步。</ToastDescription>
      </Toast>
    </ToastProvider>
  );
}
```

带操作按钮与关闭按钮：

```tsx
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@easbot/ui';

export default function App() {
  return (
    <ToastProvider>
      <ToastViewport />
      <Toast>
        <ToastTitle>操作已撤销</ToastTitle>
        <ToastDescription>文件已恢复到回收站。</ToastDescription>
        <ToastAction altText="撤销恢复操作">撤销</ToastAction>
        <ToastClose />
      </Toast>
    </ToastProvider>
  );
}
```

## 组成部分

| 子组件             | 说明                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| `ToastProvider`    | 全局提供者，管理默认时长、滑动方向与播报容器（对应 Radix `Toast.Provider`）     |
| `ToastViewport`    | 视口容器，渲染为 `<ol>`，负责 Toast 的定位与堆叠（对应 Radix `Toast.Viewport`） |
| `Toast`            | 单条提示，渲染为 `<li>`（对应 Radix `Toast.Root`）                              |
| `ToastTitle`       | 标题（对应 Radix `Toast.Title`）                                                |
| `ToastDescription` | 描述（对应 Radix `Toast.Description`）                                          |
| `ToastAction`      | 操作按钮（对应 Radix `Toast.Action`），**必须**传 `altText`                     |
| `ToastClose`       | 关闭按钮（对应 Radix `Toast.Close`）                                            |

## 变体

`Toast` 的样式由内部 `cva`（`toastVariants`）定义，共 1 个维度。

### variant（配色）

| 取值          | 说明                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `default`     | 使用 `--toast-border` / `--toast-background` / `--toast-foreground`，**默认值**                         |
| `destructive` | 使用 `--toast-destructive-border` / `--toast-destructive-background` / `--toast-destructive-foreground` |
| `success`     | 使用 `--toast-success-border` / `--toast-success-background` / `--toast-success-foreground`             |

> `variant="destructive"` 时还会额外命中 `group-[.destructive]:` 系列样式（作用于 `ToastAction` 与 `ToastClose`），例如 `ToastClose` 的文字色会切换为 `--toast-close-destructive-text`。**注意**：该选择器要求 Toast 根元素自身带有 `.destructive` 类名，而当前实现的 `toastVariants` 只输出 CSS 变量类，**并未**输出 `.destructive` 类名，因此这组 `group-[.destructive]:` 样式在当前实现下**不会生效**。

## 属性

### ToastProvider

| 属性                 | 类型                                  | 默认值           | 说明                                                                                        |
| -------------------- | ------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `label`              | `string`                              | `'Notification'` | 供屏幕阅读器关联通知的本地化标签，来自 Radix primitives（`Toast.Provider`）                 |
| `duration`           | `number`                              | `5000`           | 每条提示的默认显示时长（毫秒），来自 Radix primitives（`Toast.Provider`）                   |
| `swipeDirection`     | `'up' \| 'down' \| 'left' \| 'right'` | `'right'`        | 触发关闭的指针滑动方向，来自 Radix primitives（`Toast.Provider`）                           |
| `swipeThreshold`     | `number`                              | `50`             | 触发关闭所需的滑动距离（像素），来自 Radix primitives（`Toast.Provider`）                   |
| `announcerContainer` | `Element \| DocumentFragment`         | `document.body`  | 提示播报内容挂载的容器（焦点陷阱场景下需要指定），来自 Radix primitives（`Toast.Provider`） |
| `children`           | `React.ReactNode`                     | —                | 子节点，来自 Radix primitives（`Toast.Provider`）                                           |

### ToastViewport

| 属性        | 类型       | 默认值                       | 说明                                                                                         |
| ----------- | ---------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `hotkey`    | `string[]` | `['F8']`                     | 将焦点移动到视口的键盘快捷键，来自 Radix primitives（`Toast.Viewport`）                      |
| `label`     | `string`   | `'Notifications ({hotkey})'` | 视口的无障碍标签，`{hotkey}` 会被替换为实际快捷键，来自 Radix primitives（`Toast.Viewport`） |
| `className` | `string`   | —                            | 自定义类名，合并到末位                                                                       |

### Toast

| 属性              | 类型                                                                                              | 默认值         | 说明                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `variant`         | `'default' \| 'destructive' \| 'success'`                                                         | `'default'`    | 提示配色变体，由 `cva` 定义                                                                              |
| `title`           | `React.ReactNode`                                                                                 | —              | 标题内容（**本组件不渲染**，需自行用 `ToastTitle` 渲染）                                                 |
| `description`     | `React.ReactNode`                                                                                 | —              | 描述内容（**本组件不渲染**，需自行用 `ToastDescription` 渲染）                                           |
| `duration`        | `number`                                                                                          | `5000`         | 显示时长（毫秒），覆盖 `ToastProvider` 的设置，来自 Radix primitives（`Toast.Root`）                     |
| `position`        | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | —              | 显示位置（详见下方「注意事项」）                                                                         |
| `onClose`         | `() => void`                                                                                      | —              | 提示关闭回调；组件内部通过 `onOpenChange` 转发触发                                                       |
| `onPause`         | `() => void`                                                                                      | —              | 提示计时暂停回调（指针悬停在视口内时触发），来自 Radix primitives（`Toast.Root`）                        |
| `onResume`        | `() => void`                                                                                      | —              | 提示计时恢复回调，来自 Radix primitives（`Toast.Root`）                                                  |
| `action`          | `React.ReactNode`                                                                                 | —              | 操作按钮（**本组件不渲染**，需自行用 `ToastAction` 渲染）                                                |
| `className`       | `string`                                                                                          | —              | 自定义类名，合并到末位                                                                                   |
| `open`            | `boolean`                                                                                         | —              | 受控展开状态，来自 Radix primitives（`Toast.Root`）                                                      |
| `defaultOpen`     | `boolean`                                                                                         | —              | 非受控模式下的初始展开状态，来自 Radix primitives（`Toast.Root`）                                        |
| `onOpenChange`    | `(open: boolean) => void`                                                                         | —              | 展开状态变化回调，来自 Radix primitives（`Toast.Root`）                                                  |
| `forceMount`      | `true`                                                                                            | —              | 强制挂载，用于接管退出动画，来自 Radix primitives（`Toast.Root`）                                        |
| `type`            | `'foreground' \| 'background'`                                                                    | `'foreground'` | 播报级别（`foreground` 为 `assertive`，`background` 为 `polite`），来自 Radix primitives（`Toast.Root`） |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void`                                                                  | —              | 按下 `Escape` 时的回调，来自 Radix primitives（`Toast.Root`）                                            |
| `onSwipeStart`    | `(event: SwipeEvent) => void`                                                                     | —              | 开始滑动时的回调，来自 Radix primitives（`Toast.Root`）                                                  |
| `onSwipeMove`     | `(event: SwipeEvent) => void`                                                                     | —              | 滑动过程中的回调，来自 Radix primitives（`Toast.Root`）                                                  |
| `onSwipeCancel`   | `(event: SwipeEvent) => void`                                                                     | —              | 滑动被取消时的回调，来自 Radix primitives（`Toast.Root`）                                                |
| `onSwipeEnd`      | `(event: SwipeEvent) => void`                                                                     | —              | 滑动结束时的回调，来自 Radix primitives（`Toast.Root`）                                                  |

### ToastTitle / ToastDescription / ToastClose

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

### ToastAction

| 属性        | 类型     | 默认值 | 说明                                                                                |
| ----------- | -------- | ------ | ----------------------------------------------------------------------------------- |
| `altText`   | `string` | —      | 供屏幕阅读器朗读的替代操作描述（**必填**），来自 Radix primitives（`Toast.Action`） |
| `className` | `string` | —      | 自定义类名，合并到末位                                                              |

本表只列组件自有属性；此外还透传 `<li>` / `<div>` / `<button>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `Toast` 渲染为 `<li>`（`tabIndex={0}`），可通过键盘聚焦。
- Radix 会额外渲染一个隐藏的 `role="status"` 播报区域，其中 `aria-live` 属性按 `type` 决定：`foreground` → `assertive`，`background` → `polite`。
- `ToastViewport` 渲染为 `<ol>`，带 `role="region"` 与 `aria-label="Notifications (F8)"`（可通过 `label` 修改），按 `F8` 可将焦点快速移动到视口。
- 键盘行为：`Escape` 关闭提示；提示关闭后焦点若仍在提示内，会自动移动到视口。
- `ToastAction` 的 `altText` 为**必填**：屏幕阅读器用户难以定位到该按钮，`altText` 用于提供操作目的的替代描述（如 `altText="撤销恢复操作"`）。
- `ToastClose` 默认 `opacity-0`，通过 `group-hover` 或聚焦时显示，避免常驻视觉噪音，但**始终可聚焦**。
- 提示在指针悬停于视口内时会**暂停自动关闭计时**，移开后恢复。

## 主题变量

| 变量                                    | 说明                                     |
| --------------------------------------- | ---------------------------------------- |
| `--toast-z-index`                       | 提示层层级                               |
| `--toast-padding`                       | 提示内边距（同时用于视口内边距）         |
| `--toast-gap`                           | 提示之间的间距                           |
| `--toast-shadow`                        | 提示阴影                                 |
| `--toast-max-width`                     | 提示最大宽度（视口 `md` 断点起生效）     |
| `--toast-border`                        | `variant="default"` 边框色               |
| `--toast-background`                    | `variant="default"` 背景色               |
| `--toast-foreground`                    | `variant="default"` 文字色               |
| `--toast-destructive-border`            | `variant="destructive"` 边框色           |
| `--toast-destructive-background`        | `variant="destructive"` 背景色           |
| `--toast-destructive-foreground`        | `variant="destructive"` 文字色           |
| `--toast-success-border`                | `variant="success"` 边框色               |
| `--toast-success-background`            | `variant="success"` 背景色               |
| `--toast-success-foreground`            | `variant="success"` 文字色               |
| `--toast-close-text`                    | 关闭按钮文字色（`/50` 透明度）           |
| `--toast-close-hover-text`              | 关闭按钮 hover 文字色                    |
| `--toast-close-destructive-text`        | `destructive` 变体关闭按钮文字色         |
| `--toast-close-destructive-hover-text`  | `destructive` 变体关闭按钮 hover 文字色  |
| `--toast-close-destructive-ring`        | `destructive` 变体关闭按钮焦点环颜色     |
| `--toast-close-destructive-ring-offset` | `destructive` 变体关闭按钮焦点环偏移底色 |

## 组合用法 / 注意事项

- **`Toast` 必须位于 `ToastViewport` 之内**：Radix 的 `Toast.Root` 在找不到 `viewport` 时会直接返回 `null`，一条提示都不会渲染。
- **`Toast` 不渲染 `title` / `description` / `action`**：这三个属性只是本库 `ToastProps` 的数据字段，`Toast` 组件**不消费**它们（只把 `position` / `onClose` 取出后不渲染）。要显示标题 / 描述 / 操作按钮，必须显式使用 `ToastTitle` / `ToastDescription` / `ToastAction` 作为子元素。
- **`position` 属性不控制实际位置**：`Toast` 组件本身**不渲染任何位置样式**，`position` 只被 `useToast` 内部读取并透传到 toast 队列数据中。真正的定位由 `ToastViewport` 的响应式类（`sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[var(--toast-max-width)]`）承担——即视口固定在**右下角**（移动端为底部、纵向反序）。若需要 `top-left` 等六种位置，需自行改写 `ToastViewport` 的定位类。
- **`onClose` 通过 `onOpenChange` 转发**：组件内部把 `onOpenChange={(open) => !open && onClose?.()}` 注入 Radix，因此外部传入的 `onOpenChange` 会被覆盖。
- **`ToastAction` 的 `altText` 必填**：不传会导致 TypeScript 报错；这是 Radix 的强制要求，用于无障碍。
- **`ToastClose` 需要 `toast-close=""` 属性**：源码中已显式注入，Radix 用它判断是否为"自定义关闭按钮"以便正确处理焦点。

## 导出

| 导出名               | 类型                              | 说明                                                                                                                     |
| -------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ToastProvider`      | `React.FC<ToastProviderProps>`    | 全局提供者（Radix `Toast.Provider`）                                                                                     |
| `ToastViewport`      | `React.ForwardRefExoticComponent` | 视口容器，ref 指向 `HTMLOListElement`                                                                                    |
| `Toast`              | `React.ForwardRefExoticComponent` | 单条提示，ref 指向 `HTMLLIElement`                                                                                       |
| `ToastTitle`         | `React.ForwardRefExoticComponent` | 标题，ref 指向 `HTMLDivElement`                                                                                          |
| `ToastDescription`   | `React.ForwardRefExoticComponent` | 描述，ref 指向 `HTMLDivElement`                                                                                          |
| `ToastClose`         | `React.ForwardRefExoticComponent` | 关闭按钮，ref 指向 `HTMLButtonElement`                                                                                   |
| `ToastAction`        | `React.ForwardRefExoticComponent` | 操作按钮，ref 指向 `HTMLButtonElement`                                                                                   |
| `ToastProps`         | `interface`                       | 提示属性接口（来自 `src/ui/toast/types.ts`）                                                                             |
| `ToastActionElement` | `interface`                       | 操作按钮描述接口：`{ altText: string; onClick: () => void; children?: React.ReactNode }`（来自 `src/ui/toast/types.ts`） |

> **同名类型冲突说明**：`src/ui/toast/toast.tsx` 中另有一个同名的 `ToastActionElement`（`React.ReactElement<typeof ToastAction>`），但 `src/ui/toast/index.ts` 中的显式具名再导出 `export type { ToastProps, ToastActionElement } from './types'` **优先级高于** `export * from './toast'`，因此包根实际导出的是 `types.ts` 版本（接口形态），而非 `toast.tsx` 版本。
>
> `src/ui/toast/types.ts` 中另有一组仅限模块内部使用、**未被 `index.ts` 导出**的类型：`ToastPosition`、`ToastVariant`、`ToastType`、`ToastContextValue`。其中 `ToastPosition` 由 `src/ui/use-toast/index.ts` 单独导出（见 [useToast 文档](./use-toast.md)）。
