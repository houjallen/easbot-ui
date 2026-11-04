# Toast 通知容器

> 短暂浮现在页面角落的通知，用于告知操作结果、错误信息或系统状态。

---

**导入**

```tsx
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
} from '@easbot/ui';
```

## 基础用法

> 推荐直接使用 `Toaster` 容器 —— 它把 `useToast()` 维护的内存状态渲染为 DOM，并自动处理位置、时长与默认标题。调用侧的用法见 [`useToast` 文档](./use-toast.md)。

```tsx
import { Button } from '@easbot/ui';
import { Toaster, useToast } from '@easbot/ui';

export default function App() {
  const { toast } = useToast();

  return (
    <>
      <Button
        onClick={() =>
          toast({
            title: '操作成功',
            description: '数据已保存',
            variant: 'success',
          })
        }
      >
        显示成功提示
      </Button>
      <Toaster />
    </>
  );
}
```

设置全局默认位置与时长：

```tsx
<Toaster position="top-center" duration={10000} />
```

带操作按钮：

```tsx
toast({
  title: '待处理',
  description: '有一个新的待处理任务',
  action: (
    <Button variant="outline" size="sm">
      查看详情
    </Button>
  ),
});
```

完全手写通知（不走 `Toaster`）：

```tsx
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@easbot/ui';

export default function App() {
  return (
    <ToastProvider>
      <ToastViewport />
      <Toast variant="success" position="bottom-right">
        <ToastTitle>保存成功</ToastTitle>
        <ToastDescription>你的更改已同步。</ToastDescription>
        <ToastAction altText="撤销保存操作">撤销</ToastAction>
      </Toast>
    </ToastProvider>
  );
}
```

> Radix 的 `Toast` **必须**挂在 `ToastViewport` 之内，否则会返回 `null`（不渲染任何内容）。
> 关闭按钮由 `Toast` 组件自动渲染，无需手动添加 `ToastClose`。

## 变体

### variant

| 取值              | 说明                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| `default`（默认） | 使用 card 配色（`bg-card` / `text-card-foreground`），描述与图标跟随前景色 |
| `destructive`     | 危险配色，红色边框 + 红底 + destructive 文字色                             |
| `success`         | 成功配色，绿色边框 + 浅绿底 + 深绿文字色                                   |
| `warning`         | 警告配色，黄色边框 + 浅黄底 + 深黄文字色                                   |
| `info`            | 信息配色，蓝色边框 + 浅蓝底 + 深蓝文字色                                   |

## 属性

继承自 `UiMessageProps`。

| 属性         | 类型            | 默认值 | 说明                                                |
| ------------ | --------------- | ------ | --------------------------------------------------- |
| `position?`  | `ToastPosition` | —      | 通知默认显示位置                                    |
| `duration?`  | `number`        | —      | 通知默认停留时长（毫秒）；`Infinity` 表示不自动关闭 |
| `className?` | `string`        | —      | 每条通知的默认样式类名                              |

## 属性（ToastProps）

继承自 `UiMessageProps`。

| 属性           | 类型              | 默认值 | 说明                          |
| -------------- | ----------------- | ------ | ----------------------------- |
| `title?`       | `React.ReactNode` | —      | 标题                          |
| `description?` | `React.ReactNode` | —      | 描述内容                      |
| `variant?`     | `ToastVariant`    | —      | 样式变体                      |
| `duration?`    | `number`          | —      | 显示时长（毫秒）              |
| `position?`    | `ToastPosition`   | —      | 显示位置                      |
| `onClose?`     | `() => void`      | —      | 关闭回调                      |
| `onPause?`     | `() => void`      | —      | 暂停事件处理 (Radix 实际类型) |
| `onResume?`    | `() => void`      | —      | 恢复事件处理 (Radix 实际类型) |
| `action?`      | `React.ReactNode` | —      | 操作按钮                      |
| `className?`   | `string`          | —      | 自定义类名                    |

## 属性（ToastCloseProps）

| 属性         | 类型           | 默认值 | 说明       |
| ------------ | -------------- | ------ | ---------- |
| `className?` | `string`       | —      | 自定义类名 |
| `variant?`   | `ToastVariant` | —      | 变体样式   |

`ToasterProps` 是通知容器 `Toaster` 的属性接口；`ToastProps` 是单条通知的属性接口（来自 `src/ui/toast/types.ts`）；`ToastCloseProps` 是 `ToastClose` 的属性接口。

本表只列组件自有属性；此外还透传 Radix Toast 对应部件的全部原生属性（`open` / `defaultOpen` / `onOpenChange` / `type` / `onEscapeKeyDown` / `onSwipeStart` / `onSwipeMove` / `onSwipeCancel` / `onSwipeEnd` / `forceMount` / `className` / `aria-*` / `data-*` 等），并继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。

## 无障碍

- `ToastViewport` 渲染为 `<ol>`，带 `role="region"` 与 `aria-label`（Radix 默认 `Notifications (F8)`），按 `F8` 可把焦点快速移动到视口。
- 单条 `Toast` 渲染为 `<li>`（`tabIndex={0}`），可通过键盘聚焦。
- Radix 会额外渲染一个隐藏的 `role="status"` live region，`aria-live` 按 `type` 决定：`foreground` → `assertive`，`background` → `polite`。
- 关闭按钮是原生 `<button>`，带 `aria-label`（内置 `toast` 文案域的「关闭通知」/ `Dismiss notification`），图标为纯装饰。
- 键盘行为：`Escape` 关闭通知；指针悬停在通知上时**暂停自动关闭计时**，移开后恢复。
- 焦点样式使用 `focus-visible:ring-2`（`CloseButton` 基础类），仅键盘可见焦点才显示。

## 注意事项

- **定位下沉到「每条通知」**：`position` 由每条通知自身的定位类决定（`toastPositionClassMap`），`ToastViewport` 退化为「全屏透明容器」，仅提供 `fixed` 包含块与 Radix 的焦点代理 / 键盘导航 —— 否则单条通知的 `position` 无处生效。
- **`ToastViewport` 的 `position` 属性已废弃**：源码标注 `@deprecated`，保留仅为向后兼容，请改用 `toast({ position })`。
- **`Toast` 会自行渲染 `title` / `description`**：内部把它们包进 `ToastTitle` / `ToastDescription`，并把 `children`（`action`）渲染在内容区之后 —— 无需再手动使用 `ToastTitle` / `ToastDescription`。
- **`Toast` 的 `title` / `description` 来自原生 `<li>` 属性冲突的处理**：Radix Root 继承原生 `li` 属性，其 `title` / `description` 是 HTML 字符串属性，源码显式 `Omit` 后由 `ToastProps` 接管，因此这里支持 `ReactNode`。
- **`Toast` 会覆盖外部的 `onOpenChange`**：组件内部注入 `onOpenChange={(open) => !open && onClose?.()}`，外部传入的同名属性会被覆盖；`onClose` 在通知关闭时触发。
- **`onClose` 只在关闭时触发**：源码注释明确 —— `onClose` 是「关闭回调」，`onPause` / `onResume` 是计时暂停 / 恢复回调。
- **`Toaster` 的默认标题走内置文案表**：未显式传 `title` 时按 `variant` 取语义化标题（`default` → `info` / 「提示」，`destructive` → `error` / 「错误」，`success` → 「成功」，`warning` → 「警告」，`info` → 「提示」）。
- **单条通知的优先级高于全局默认**：`position` 与 `duration` 都是「单条通知 → `Toaster` 默认」的回退顺序。
- **手势滑动方向由 Provider 决定**：Radix 的 `swipeDirection` 是 Provider 级属性，源码按当前唯一可见通知（列表首项）的位置推导滑动方向。
- **通知宽度区间为 240px ~ 350px**：由 `--toast-min-width` / `--toast-max-width` 约束，超出部分换行；内容区用 `min-w-0 flex-1` 允许收缩。
- **不使用 `w-full`**：通知是 `fixed` 定位，`w-full` 会撑满视口并覆盖 min/max 区间。
- **关闭按钮位于右侧居中**（`self-center`，参与 flex 布局），而非右上角绝对定位 —— 这与 Dialog 的 `absolute top-4 right-4` 定位策略不同，两者形状 / 尺寸一致（`rounded-xs` + `size-6`）。
- **不注入内联 `maxWidth` / `gap` / `padding`**：这三项已由 `Toast` 的 class 用 token 表达（内联 style 优先级高于 class，一旦注入会静默覆盖组件样式）；消费方仍可通过 `style` 传入自定义值。
- **圆角为 `rounded-lg`**：与 Dialog / AlertDialog / Drawer / Card / Alert 一致。
- **关闭按钮的 `aria-label` 走内置文案表**：`toast` 文案域提供 zh-CN「关闭通知」/ en-US `Dismiss notification`（键名 `closeAriaLabel`），可用 `locale` / `messages` 覆盖。
- **关闭按钮由 `Toast` 自动渲染**：`Toast` 内部已渲染 `ToastClose`（并把 `variant` 透传给它），无需再手动添加 `ToastClose` 子元素。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--eas-gap-lg`
- `--eas-gap-sm`
- `--eas-z-index-toast`
- `--toast-max-width`
- `--toast-min-width`

## 导出

### 组件

| 导出名               | 说明 |
| -------------------- | ---- |
| `Toast`              |      |
| `ToastAction`        |      |
| `ToastActionElement` |      |
| `ToastClose`         |      |
| `ToastDescription`   |      |
| `ToastProps`         |      |
| `ToastProvider`      |      |
| `ToastTitle`         |      |
| `ToastViewport`      |      |
| `Toaster`            |      |
| `ToasterProps`       |      |
