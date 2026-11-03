# Dialog 对话框

> 在当前页面之上弹出模态对话框，用于承载需要用户集中注意力处理的表单、确认或详情内容。

**导入**

```tsx
import { Dialog } from '@easbot/ui';
```

## 基础用法

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

export default function App() {
  return (
    <Dialog>
      <DialogTrigger>打开对话框</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
          <DialogDescription>修改后会立即同步到你的账号。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button type="button">取消</button>
          <button type="button">保存</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

受控模式（自行管理打开状态）：

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@easbot/ui';

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>受控对话框</DialogTitle>
        <button type="button" onClick={() => setOpen(false)}>
          关闭
        </button>
      </DialogContent>
    </Dialog>
  );
}
```

## 组成部分

| 子组件              | 说明                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| `Dialog`            | 根组件，管理打开状态（对应 Radix `Dialog.Root`）                              |
| `DialogTrigger`     | 触发器按钮，点击后打开对话框（对应 Radix `Dialog.Trigger`）                   |
| `DialogPortal`      | 传送门，把内容渲染到 `document.body`（对应 Radix `Dialog.Portal`）            |
| `DialogOverlay`     | 遮罩层，覆盖整屏并提供淡入淡出动画（对应 Radix `Dialog.Overlay`）             |
| `DialogContent`     | 内容容器，**已内置** `DialogPortal` + `DialogOverlay`，并渲染最大化与关闭按钮 |
| `DialogHeader`      | 头部布局容器（纵向排列、`sm` 断点起左对齐）                                   |
| `DialogFooter`      | 底部布局容器（移动端纵向反序、`sm` 断点起横向右对齐）                         |
| `DialogTitle`       | 标题，渲染为 `<h2>`（对应 Radix `Dialog.Title`）                              |
| `DialogDescription` | 描述文本，渲染为 `<p>`（对应 Radix `Dialog.Description`）                     |

## 变体

`DialogContent` 的样式由内部 `cva`（`dialogContentVariants`）定义，共 3 个维度。

### size（尺寸）

| 取值 | 说明                                                  |
| ---- | ----------------------------------------------------- |
| `sm` | 最大宽度 `--dialog-sm-max-width`（400px）             |
| `md` | 最大宽度 `--dialog-md-max-width`（600px），**默认值** |
| `lg` | 最大宽度 `--dialog-lg-max-width`（800px）             |

### variant（配色）

| 取值      | 说明                                                                       |
| --------- | -------------------------------------------------------------------------- |
| `default` | 使用 `--dialog-content-bg` / `--dialog-content-fg`，**默认值**             |
| `dark`    | 使用 `--dialog-dark-bg` / `--dialog-dark-fg`（固定深色配色，不随主题切换） |

### maximized（最大化）

| 取值    | 说明                                                        |
| ------- | ----------------------------------------------------------- |
| `true`  | 覆盖为 `fixed inset-4` 贴边铺满，取消最大宽高限制与居中位移 |
| `false` | 不启用最大化，**默认值**                                    |

> `maximized` 是 `DialogContent` 内部的**受控状态**：`maximizable` 为 `true` 时才渲染最大化按钮，点击后在 `true` / `false` 之间切换；外部传入的 `maximized` 会被内部状态覆盖。

## 属性

### Dialog（根组件）

| 属性           | 类型                      | 默认值 | 说明                                                                                        |
| -------------- | ------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                 | —      | 受控打开状态，来自 Radix primitives（`Dialog.Root`）                                        |
| `defaultOpen`  | `boolean`                 | —      | 非受控模式下的初始打开状态，来自 Radix primitives（`Dialog.Root`）                          |
| `onOpenChange` | `(open: boolean) => void` | —      | 打开状态变化回调，来自 Radix primitives（`Dialog.Root`）                                    |
| `modal`        | `boolean`                 | `true` | 是否为模态对话框（`true` 时锁定焦点、禁用外部交互），来自 Radix primitives（`Dialog.Root`） |
| `children`     | `React.ReactNode`         | —      | 子节点，来自 Radix primitives（`Dialog.Root`）                                              |

### DialogTrigger

| 属性       | 类型                                         | 默认值 | 说明                                                                            |
| ---------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`Dialog.Trigger`）             |
| `onClick`  | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`Dialog.Trigger`）     |
| `disabled` | `boolean`                                    | —      | 禁用触发按钮（原生 `<button>` 属性），来自 Radix primitives（`Dialog.Trigger`） |

### DialogPortal

| 属性         | 类型                  | 默认值          | 说明                                                                 |
| ------------ | --------------------- | --------------- | -------------------------------------------------------------------- |
| `container`  | `HTMLElement \| null` | `document.body` | 内容挂载的容器元素，来自 Radix primitives（`Dialog.Portal`）         |
| `forceMount` | `true`                | —               | 强制挂载，用于接管退出动画，来自 Radix primitives（`Dialog.Portal`） |

### DialogOverlay

| 属性         | 类型     | 默认值 | 说明                                                                  |
| ------------ | -------- | ------ | --------------------------------------------------------------------- |
| `forceMount` | `true`   | —      | 强制挂载，用于接管退出动画，来自 Radix primitives（`Dialog.Overlay`） |
| `className`  | `string` | —      | 自定义类名，合并到末位                                                |

### DialogContent

| 属性                   | 类型                                                            | 默认值      | 说明                                                                                                |
| ---------------------- | --------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `size`                 | `'sm' \| 'md' \| 'lg'`                                          | `'md'`      | 内容最大宽度变体，由 `cva` 定义                                                                     |
| `variant`              | `'default' \| 'dark'`                                           | `'default'` | 内容配色变体，由 `cva` 定义                                                                         |
| `maximizable`          | `boolean`                                                       | `false`     | 是否显示最大化按钮；为 `true` 时额外渲染一个切换最大化的按钮                                        |
| `open`                 | `boolean`                                                       | —           | 受控打开状态，来自 Radix primitives（`Dialog.Content`）                                             |
| `forceMount`           | `true`                                                          | —           | 强制挂载，用于接管退出动画，来自 Radix primitives（`Dialog.Content`）                               |
| `onOpenAutoFocus`      | `(event: Event) => void`                                        | —           | 打开时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`Dialog.Content`）     |
| `onCloseAutoFocus`     | `(event: Event) => void`                                        | —           | 关闭时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`Dialog.Content`）     |
| `onEscapeKeyDown`      | `(event: KeyboardEvent) => void`                                | —           | 按下 `Escape` 时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Dialog.Content`）   |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void`                      | —           | 在浮层外按下指针时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Dialog.Content`） |
| `onFocusOutside`       | `(event: FocusOutsideEvent) => void`                            | —           | 焦点移出浮层时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Dialog.Content`）     |
| `onInteractOutside`    | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void` | —           | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`Dialog.Content`）                     |
| `className`            | `string`                                                        | —           | 自定义类名，合并到末位                                                                              |

### DialogHeader / DialogFooter

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

### DialogTitle / DialogDescription

| 属性        | 类型      | 默认值 | 说明                                                                                     |
| ----------- | --------- | ------ | ---------------------------------------------------------------------------------------- |
| `className` | `string`  | —      | 自定义类名，合并到末位                                                                   |
| `asChild`   | `boolean` | —      | 是否用 Slot 替换渲染元素，来自 Radix primitives（`Dialog.Title` / `Dialog.Description`） |

本表只列组件自有属性；此外还透传 `<div>` / `<h2>` / `<p>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `DialogContent` 渲染为 `role="dialog"` 的元素，标题渲染为 `role="heading"`，描述渲染为 `role="paragraph"`（Radix primitives 内部通过 `aria-labelledby` / `aria-describedby` 自动关联）。
- `modal` 为 `true`（默认）时，Radix 会锁定焦点（`trapFocus`）并禁用浮层外的指针交互；关闭后焦点自动回到触发元素。
- 键盘行为：`Escape` 关闭对话框；`Tab` / `Shift+Tab` 在内容区域内循环移动焦点。
- 右上角关闭按钮带 `<span class="sr-only">关闭</span>`，最大化按钮带 `<span class="sr-only">最大化</span>` / `还原`，屏幕阅读器可读出按钮用途。
- `DialogTitle` 与 `DialogDescription` 为**建议必填**：缺少标题会导致对话框缺少可访问名称。

## 主题变量

| 变量                               | 说明                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `--dialog-overlay-bg`              | 遮罩层底色（与 `--dialog-overlay-opacity` 混合）                         |
| `--dialog-overlay-opacity`         | 遮罩层透明度                                                             |
| `--dialog-content-bg`              | 内容区背景色                                                             |
| `--dialog-content-fg`              | 内容区文字色                                                             |
| `--dialog-content-border`          | 内容区边框                                                               |
| `--dialog-content-shadow`          | 内容区阴影                                                               |
| `--dialog-content-gap`             | 内容区元素间距（同时用于 `DialogHeader` 间距与 `DialogFooter` 横向间距） |
| `--dialog-content-padding`         | 内容区内边距                                                             |
| `--dialog-content-radius`          | 内容区圆角                                                               |
| `--dialog-sm-max-width`            | `size="sm"` 最大宽度                                                     |
| `--dialog-md-max-width`            | `size="md"` 最大宽度                                                     |
| `--dialog-lg-max-width`            | `size="lg"` 最大宽度                                                     |
| `--dialog-transition-duration`     | 内容区过渡动画时长                                                       |
| `--dialog-transition-timing`       | 内容区过渡缓动函数                                                       |
| `--dialog-close-opacity`           | 关闭 / 最大化按钮默认透明度                                              |
| `--dialog-close-hover-opacity`     | 关闭 / 最大化按钮 hover 透明度                                           |
| `--dialog-close-focus-ring`        | 关闭 / 最大化按钮焦点环颜色                                              |
| `--dialog-close-focus-ring-offset` | 关闭 / 最大化按钮焦点环偏移底色                                          |
| `--dialog-title-font-size`         | 标题字号                                                                 |
| `--dialog-title-font-weight`       | 标题字重                                                                 |
| `--dialog-title-line-height`       | 标题行高                                                                 |
| `--dialog-title-tracking`          | 标题字距                                                                 |
| `--dialog-description-color`       | 描述文字颜色                                                             |
| `--dialog-description-font-size`   | 描述字号                                                                 |
| `--dialog-dark-bg`                 | `variant="dark"` 背景色                                                  |
| `--dialog-dark-fg`                 | `variant="dark"` 文字色                                                  |

## 组合用法 / 注意事项

- **`DialogContent` 已内置 Portal 与 Overlay**：不要在其内部再次包裹 `DialogPortal`，否则会出现两层遮罩。若需要自定义挂载容器，请改用 `DialogPortal` + 裸 `DialogPrimitive.Content` 的组合。
- **`maximizable` 与 `maximized` 的关系**：`maximizable` 只是"允许最大化"的开关，真正生效的是 `DialogContent` 内部的 `isMaximized` 状态；外部传入 `maximized` 无效。
- **必须提供 `DialogTitle`**：Radix 会用它生成 `aria-labelledby`，缺失时对话框对屏幕阅读器没有名称。
- **`className` 合并到末位**：`cn(dialogContentVariants(...), 'data-[state=open]:animate-in ...', className)`，自定义类名优先级最高，可覆盖内建的最大宽高与定位。

## 导出

| 导出名                   | 类型                              | 说明                                                                                 |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------------------------ |
| `Dialog`                 | `React.FC<DialogProps>`           | 对话框根组件（Radix `Dialog.Root`）                                                  |
| `DialogTrigger`          | `React.ForwardRefExoticComponent` | 触发器，ref 指向 `HTMLButtonElement`                                                 |
| `DialogPortal`           | `React.FC<DialogPortalProps>`     | 传送门                                                                               |
| `DialogOverlay`          | `React.ForwardRefExoticComponent` | 遮罩层，ref 指向 `HTMLDivElement`                                                    |
| `DialogContent`          | `React.ForwardRefExoticComponent` | 内容容器，ref 指向 `HTMLDivElement`                                                  |
| `DialogHeader`           | `React.FC`                        | 头部容器                                                                             |
| `DialogFooter`           | `React.FC`                        | 底部容器                                                                             |
| `DialogTitle`            | `React.ForwardRefExoticComponent` | 标题，ref 指向 `HTMLHeadingElement`                                                  |
| `DialogDescription`      | `React.ForwardRefExoticComponent` | 描述，ref 指向 `HTMLParagraphElement`                                                |
| `DialogProps`            | `type`                            | 根组件属性别名（`React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>`）      |
| `DialogContentProps`     | `interface`                       | 内容容器属性接口（Radix `Dialog.Content` 属性 + `size` / `variant` / `maximizable`） |
| `DialogTitleProps`       | `type`                            | 标题属性别名（`React.HTMLAttributes<HTMLHeadingElement>`）                           |
| `DialogDescriptionProps` | `type`                            | 描述属性别名（`React.HTMLAttributes<HTMLParagraphElement>`）                         |
| `DialogHeaderProps`      | `type`                            | 头部属性别名（`React.HTMLAttributes<HTMLDivElement>`）                               |
| `DialogFooterProps`      | `type`                            | 底部属性别名（`React.HTMLAttributes<HTMLDivElement>`）                               |
