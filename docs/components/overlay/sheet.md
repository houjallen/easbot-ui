# Sheet 侧边抽屉

> 从屏幕边缘滑出的抽屉面板，用于承载移动端导航、筛选表单或详情信息。

**导入**

```tsx
import { Sheet } from '@easbot/ui';
```

## 基础用法

```tsx
import {
  Sheet,
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
      <SheetTrigger>打开抽屉</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>筛选条件</SheetTitle>
          <SheetDescription>选择后立即生效。</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <button type="button">重置</button>
          <button type="button">应用</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

从左侧滑出：

```tsx
<SheetContent side="left">左侧抽屉</SheetContent>
```

## 组成部分

| 子组件             | 说明                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `Sheet`            | 根组件，管理打开状态（对应 Radix `Dialog.Root`）                          |
| `SheetTrigger`     | 触发器按钮（对应 Radix `Dialog.Trigger`）                                 |
| `SheetClose`       | 关闭按钮（对应 Radix `Dialog.Close`）                                     |
| `SheetPortal`      | 传送门（对应 Radix `Dialog.Portal`）                                      |
| `SheetOverlay`     | 遮罩层（对应 Radix `Dialog.Overlay`）                                     |
| `SheetContent`     | 内容容器，**已内置** `SheetPortal` + `SheetOverlay`，并渲染右上角关闭按钮 |
| `SheetHeader`      | 头部布局容器                                                              |
| `SheetFooter`      | 底部布局容器                                                              |
| `SheetTitle`       | 标题，渲染为 `<h2>`（对应 Radix `Dialog.Title`）                          |
| `SheetDescription` | 描述文本，渲染为 `<p>`（对应 Radix `Dialog.Description`）                 |

> `Sheet` 内部复用 `@radix-ui/react-dialog` 的 primitives（并非独立的 `@radix-ui/react-sheet`），因此其原生属性与 `Dialog` 完全一致。

## 变体

`SheetContent` 的样式由内部 `cva`（`sheetVariants`）定义，共 1 个维度。

### side（弹出方向）

| 取值     | 说明                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------ |
| `top`    | 从顶部滑入，`inset-x-0 top-0` + `border-b`，进场 `slide-in-from-top`、退场 `slide-out-to-top`          |
| `bottom` | 从底部滑入，`inset-x-0 bottom-0` + `border-t`，进场 `slide-in-from-bottom`、退场 `slide-out-to-bottom` |
| `left`   | 从左侧滑入，`inset-y-0 left-0 h-full w-3/4 border-r`，`sm` 断点起 `max-w-sm`                           |
| `right`  | 从右侧滑入，`inset-y-0 right-0 h-full w-3/4 border-l`，`sm` 断点起 `max-w-sm`，**默认值**              |

## 属性

### Sheet（根组件）

| 属性           | 类型                      | 默认值 | 说明                                                                                      |
| -------------- | ------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| `open`         | `boolean`                 | —      | 受控打开状态，来自 Radix primitives（`Dialog.Root`）                                      |
| `defaultOpen`  | `boolean`                 | —      | 非受控模式下的初始打开状态，来自 Radix primitives（`Dialog.Root`）                        |
| `onOpenChange` | `(open: boolean) => void` | —      | 打开状态变化回调，来自 Radix primitives（`Dialog.Root`）                                  |
| `modal`        | `boolean`                 | `true` | 是否为模态抽屉（`true` 时锁定焦点、禁用外部交互），来自 Radix primitives（`Dialog.Root`） |
| `children`     | `React.ReactNode`         | —      | 子节点，来自 Radix primitives（`Dialog.Root`）                                            |

### SheetTrigger / SheetClose

| 属性       | 类型                                         | 默认值 | 说明                                                                                 |
| ---------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `asChild`  | `boolean`                                    | —      | 是否用 Slot 替换渲染元素，来自 Radix primitives（`Dialog.Trigger` / `Dialog.Close`） |
| `onClick`  | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives                              |
| `disabled` | `boolean`                                    | —      | 禁用按钮（原生 `<button>` 属性），来自 Radix primitives                              |

### SheetPortal

| 属性         | 类型                  | 默认值          | 说明                                                                 |
| ------------ | --------------------- | --------------- | -------------------------------------------------------------------- |
| `container`  | `HTMLElement \| null` | `document.body` | 内容挂载的容器元素，来自 Radix primitives（`Dialog.Portal`）         |
| `forceMount` | `true`                | —               | 强制挂载，用于接管退出动画，来自 Radix primitives（`Dialog.Portal`） |

### SheetOverlay

| 属性         | 类型     | 默认值 | 说明                                                                  |
| ------------ | -------- | ------ | --------------------------------------------------------------------- |
| `forceMount` | `true`   | —      | 强制挂载，用于接管退出动画，来自 Radix primitives（`Dialog.Overlay`） |
| `className`  | `string` | —      | 自定义类名，合并到末位                                                |

### SheetContent

| 属性                   | 类型                                                            | 默认值    | 说明                                                                                                |
| ---------------------- | --------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `side`                 | `'top' \| 'bottom' \| 'left' \| 'right'`                        | `'right'` | 抽屉弹出方向，由 `cva` 定义                                                                         |
| `open`                 | `boolean`                                                       | —         | 受控打开状态，来自 Radix primitives（`Dialog.Content`）                                             |
| `forceMount`           | `true`                                                          | —         | 强制挂载，用于接管退出动画，来自 Radix primitives（`Dialog.Content`）                               |
| `onOpenAutoFocus`      | `(event: Event) => void`                                        | —         | 打开时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`Dialog.Content`）     |
| `onCloseAutoFocus`     | `(event: Event) => void`                                        | —         | 关闭时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`Dialog.Content`）     |
| `onEscapeKeyDown`      | `(event: KeyboardEvent) => void`                                | —         | 按下 `Escape` 时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Dialog.Content`）   |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void`                      | —         | 在浮层外按下指针时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Dialog.Content`） |
| `onFocusOutside`       | `(event: FocusOutsideEvent) => void`                            | —         | 焦点移出浮层时的回调（可 `preventDefault` 阻止关闭），来自 Radix primitives（`Dialog.Content`）     |
| `onInteractOutside`    | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void` | —         | 浮层外发生指针按下或焦点移出时的回调，来自 Radix primitives（`Dialog.Content`）                     |
| `className`            | `string`                                                        | —         | 自定义类名，合并到末位                                                                              |

### SheetHeader / SheetFooter

| 属性        | 类型     | 默认值 | 说明                   |
| ----------- | -------- | ------ | ---------------------- |
| `className` | `string` | —      | 自定义类名，合并到末位 |

### SheetTitle / SheetDescription

| 属性        | 类型      | 默认值 | 说明                                                                                     |
| ----------- | --------- | ------ | ---------------------------------------------------------------------------------------- |
| `className` | `string`  | —      | 自定义类名，合并到末位                                                                   |
| `asChild`   | `boolean` | —      | 是否用 Slot 替换渲染元素，来自 Radix primitives（`Dialog.Title` / `Dialog.Description`） |

本表只列组件自有属性；此外还透传 `<div>` / `<h2>` / `<p>` / `<button>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `SheetContent` 渲染为 `role="dialog"`，标题渲染为 `role="heading"`、描述渲染为 `role="paragraph"`，由 Radix 通过 `aria-labelledby` / `aria-describedby` 自动关联。
- 默认 `modal` 为 `true`：焦点被锁定在抽屉内，外部页面不可交互，关闭后焦点回到触发元素。
- 键盘行为：`Escape` 关闭抽屉；`Tab` / `Shift+Tab` 在抽屉内容内循环移动焦点。
- 内置关闭按钮带 `aria-label="关闭抽屉"`，屏幕阅读器可读出用途。
- `SheetTitle` 与 `SheetDescription` 为**建议必填**：缺少标题会导致抽屉缺少可访问名称。

## 主题变量

| 变量                                 | 说明             |
| ------------------------------------ | ---------------- |
| `--sheet-overlay`                    | 遮罩层背景色     |
| `--sheet-background`                 | 抽屉背景色       |
| `--sheet-foreground`                 | 抽屉文字色       |
| `--sheet-border`                     | 抽屉边框色       |
| `--sheet-shadow`                     | 抽屉阴影         |
| `--sheet-close-button-border-radius` | 关闭按钮圆角     |
| `--sheet-close-button-size`          | 关闭按钮图标尺寸 |

## 组合用法 / 注意事项

- **`SheetContent` 已内置 Portal 与 Overlay**：不要在其内部再次包裹 `SheetPortal`，否则会出现两层遮罩。
- **`Sheet` 复用 `Dialog` primitives**：所有 `open` / `defaultOpen` / `onOpenChange` / `modal` 语义与 `Dialog` 完全一致；`Sheet` 也**没有** `SheetClose` 之外的额外关闭入口。
- **左右抽屉的响应式宽度**：`left` / `right` 方向使用 `w-3/4` + `sm:max-w-sm`，即移动端占屏幕 3/4，桌面端最大 24rem。
- **`className` 合并到末位**：`cn(sheetVariants({ side }), className)`，自定义类名优先级最高，可覆盖内建的定位与尺寸。
- **底部抽屉无宽度限制**：`top` / `bottom` 方向使用 `inset-x-0`，宽度铺满；`left` / `right` 方向使用 `h-full` 高度铺满。

## 导出

| 导出名              | 类型                              | 说明                                                     |
| ------------------- | --------------------------------- | -------------------------------------------------------- |
| `Sheet`             | `React.FC<DialogProps>`           | 抽屉根组件（Radix `Dialog.Root`）                        |
| `SheetPortal`       | `React.FC`                        | 传送门                                                   |
| `SheetOverlay`      | `React.ForwardRefExoticComponent` | 遮罩层，ref 指向 `HTMLDivElement`                        |
| `SheetTrigger`      | `React.ForwardRefExoticComponent` | 触发器，ref 指向 `HTMLButtonElement`                     |
| `SheetClose`        | `React.ForwardRefExoticComponent` | 关闭按钮，ref 指向 `HTMLButtonElement`                   |
| `SheetContent`      | `React.ForwardRefExoticComponent` | 内容容器，ref 指向 `HTMLDivElement`                      |
| `SheetHeader`       | `React.FC`                        | 头部容器                                                 |
| `SheetFooter`       | `React.FC`                        | 底部容器                                                 |
| `SheetTitle`        | `React.ForwardRefExoticComponent` | 标题，ref 指向 `HTMLHeadingElement`                      |
| `SheetDescription`  | `React.ForwardRefExoticComponent` | 描述，ref 指向 `HTMLParagraphElement`                    |
| `SheetContentProps` | `interface`                       | 内容容器属性接口（Radix `Dialog.Content` 属性 + `side`） |
