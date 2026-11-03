# AlertDialog 警告对话框

> 弹出需要用户明确确认或取消的警告对话框，用于危险操作确认与关键决策打断。

**导入**

```tsx
import { AlertDialog } from '@easbot/ui';
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
          <AlertDialogTitle>确定要删除该项目吗？</AlertDialogTitle>
          <AlertDialogDescription>此操作无法撤销，相关数据将被永久清除。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## 组成部分

| 子组件                   | 说明                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `AlertDialog`            | 根组件，管理打开状态（对应 Radix `AlertDialog.Root`）           |
| `AlertDialogTrigger`     | 触发器按钮（对应 Radix `AlertDialog.Trigger`）                  |
| `AlertDialogPortal`      | 传送门（对应 Radix `AlertDialog.Portal`）                       |
| `AlertDialogOverlay`     | 遮罩层（对应 Radix `AlertDialog.Overlay`）                      |
| `AlertDialogContent`     | 内容容器，**已内置** `AlertDialogPortal` + `AlertDialogOverlay` |
| `AlertDialogHeader`      | 头部布局容器                                                    |
| `AlertDialogFooter`      | 底部布局容器                                                    |
| `AlertDialogTitle`       | 标题，渲染为 `<h2>`（对应 Radix `AlertDialog.Title`）           |
| `AlertDialogDescription` | 描述文本，渲染为 `<p>`（对应 Radix `AlertDialog.Description`）  |
| `AlertDialogAction`      | 确认按钮，点击后关闭对话框；支持 `loading` 与 `variant`         |
| `AlertDialogCancel`      | 取消按钮，样式为 `buttonVariants({ variant: 'outline' })`       |

### AlertDialogModal（高阶封装）

`AlertDialogModal` 是位于 `src/ui/alert-dialog/alert-dialog-modal.tsx` 的**独立封装组件**，用一套简化的 props 直接生成带图标、标题、描述与双按钮的警告框：

> ⚠️ **它当前未被导出**：`src/ui/alert-dialog/index.ts` 只 `export * from './alert-dialog'`，**没有**导出 `./alert-dialog-modal`；`src/index.ts` 也不包含它。因此 `import { AlertDialogModal } from '@easbot/ui'` **会失败**。消费方需自行从源码路径引入，或推动上游补齐导出。

```tsx
// 当前只能从源码路径引入（包根导出暂不可用）
import { AlertDialogModal } from '@easbot/ui/src/ui/alert-dialog/alert-dialog-modal';

export default function App() {
  return (
    <AlertDialogModal
      title="删除项目"
      content="此操作无法撤销，相关数据将被永久清除。"
      iconType="warning"
      okText="删除"
      cancelText="取消"
      onOk={() => console.log('已确认')}
      onCancel={() => console.log('已取消')}
    />
  );
}
```

| 属性           | 类型                                          | 默认值   | 说明                                                              |
| -------------- | --------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `title`        | `string`                                      | `''`     | 标题文本                                                          |
| `content`      | `React.ReactNode \| string`                   | —        | 描述内容；传入字符串时会以 **HTML** 渲染（见下方 XSS 警告）       |
| `onOk`         | `() => void`                                  | —        | 点击确认按钮的回调，随后会调用 `onOpenChange?.(false)` 关闭对话框 |
| `onCancel`     | `() => void`                                  | —        | 点击取消按钮的回调，随后会调用 `onOpenChange?.(false)` 关闭对话框 |
| `iconType`     | `'success' \| 'info' \| 'error' \| 'warning'` | `'info'` | 图标类型                                                          |
| `open`         | `boolean`                                     | `false`  | 受控打开状态                                                      |
| `onOpenChange` | `(open: boolean) => void`                     | —        | 打开状态变化回调                                                  |
| `okText`       | `string`                                      | `'确认'` | 确认按钮文案                                                      |
| `cancelText`   | `string`                                      | `'取消'` | 取消按钮文案                                                      |

> ⚠️ **XSS 风险警告**：`AlertDialogModal` 的 `content` 为字符串时，内部通过 `dangerouslySetInnerHTML` 渲染（`<span dangerouslySetInnerHTML={{ __html: content }} />`）。若 `content` 来自用户输入或任何不可信来源，将**存在跨站脚本（XSS）攻击风险**。请务必先做 HTML 转义 / 白名单过滤，或改用 `React.ReactNode` 传入已渲染好的元素。库内其它组件均不提供该能力，此为该组件独有设计。

## 变体

`AlertDialogContent` 的样式由组件内部的类名映射表定义（非 `cva`），共 2 个维度。

### variant（配色）

| 取值          | 说明                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `default`     | 使用 `--alert-dialog-default-border` / `--alert-dialog-default-background` / `--alert-dialog-default-foreground`，**默认值** |
| `destructive` | 使用 `--alert-dialog-destructive-border` / `--alert-dialog-destructive-background` / `--alert-dialog-destructive-foreground` |
| `success`     | 使用 `--alert-dialog-success-border` / `--alert-dialog-success-background` / `--alert-dialog-success-foreground`             |

### size（尺寸）

| 取值      | 说明                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `sm`      | 最大宽度 `--alert-dialog-sm-max-width`（24rem），内边距 `--alert-dialog-sm-padding`，间距 `--alert-dialog-sm-gap`                            |
| `default` | 最大宽度 `--alert-dialog-default-max-width`（28rem），内边距 `--alert-dialog-default-padding`，间距 `--alert-dialog-default-gap`，**默认值** |
| `lg`      | 最大宽度 `--alert-dialog-lg-max-width`（36rem），内边距 `--alert-dialog-lg-padding`，间距 `--alert-dialog-lg-gap`                            |

### iconType（`AlertDialogModal` 图标）

| 取值      | 图标          | 颜色类                      |
| --------- | ------------- | --------------------------- |
| `success` | `CheckCircle` | `text-green-500`            |
| `info`    | `Info`        | `text-blue-500`，**默认值** |
| `error`   | `XCircle`     | `text-red-500`              |
| `warning` | `AlertCircle` | `text-yellow-500`           |

## 属性

### AlertDialog（根组件）

| 属性           | 类型                      | 默认值 | 说明                                                                    |
| -------------- | ------------------------- | ------ | ----------------------------------------------------------------------- |
| `open`         | `boolean`                 | —      | 受控打开状态，来自 Radix primitives（`AlertDialog.Root`）               |
| `defaultOpen`  | `boolean`                 | —      | 非受控模式下的初始打开状态，来自 Radix primitives（`AlertDialog.Root`） |
| `onOpenChange` | `(open: boolean) => void` | —      | 打开状态变化回调，来自 Radix primitives（`AlertDialog.Root`）           |
| `children`     | `React.ReactNode`         | —      | 子节点，来自 Radix primitives（`AlertDialog.Root`）                     |

> 注意：Radix 的 `AlertDialog.Root` **不支持 `modal` 属性**（其类型显式 `Omit<DialogProps, 'modal'>`），警告对话框始终为强制交互模式。

### AlertDialogTrigger

| 属性       | 类型                                         | 默认值 | 说明                                                                                 |
| ---------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `asChild`  | `boolean`                                    | —      | 是否用 Slot 替换触发元素，来自 Radix primitives（`AlertDialog.Trigger`）             |
| `onClick`  | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`AlertDialog.Trigger`）     |
| `disabled` | `boolean`                                    | —      | 禁用触发按钮（原生 `<button>` 属性），来自 Radix primitives（`AlertDialog.Trigger`） |

### AlertDialogPortal / AlertDialogOverlay

| 属性         | 类型                  | 默认值          | 说明                                                                                              |
| ------------ | --------------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| `container`  | `HTMLElement \| null` | `document.body` | 内容挂载的容器元素，来自 Radix primitives（`AlertDialog.Portal`）                                 |
| `forceMount` | `true`                | —               | 强制挂载，用于接管退出动画，来自 Radix primitives（`AlertDialog.Portal` / `AlertDialog.Overlay`） |

### AlertDialogContent

| 属性               | 类型                                      | 默认值      | 说明                                                                                                 |
| ------------------ | ----------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `variant`          | `'default' \| 'destructive' \| 'success'` | `'default'` | 对话框配色变体                                                                                       |
| `size`             | `'sm' \| 'default' \| 'lg'`               | `'default'` | 对话框尺寸变体                                                                                       |
| `forceMount`       | `true`                                    | —           | 强制挂载，用于接管退出动画，来自 Radix primitives（`AlertDialog.Content`）                           |
| `onOpenAutoFocus`  | `(event: Event) => void`                  | —           | 打开时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`AlertDialog.Content`） |
| `onCloseAutoFocus` | `(event: Event) => void`                  | —           | 关闭时自动聚焦的事件回调（可 `preventDefault` 阻止），来自 Radix primitives（`AlertDialog.Content`） |
| `onEscapeKeyDown`  | `(event: KeyboardEvent) => void`          | —           | 按下 `Escape` 时的回调，来自 Radix primitives（`AlertDialog.Content`）                               |
| `className`        | `string`                                  | —           | 自定义类名，合并到末位                                                                               |

> Radix 的 `AlertDialog.Content` 类型已 `Omit` 掉 `onPointerDownOutside` 与 `onInteractOutside`，即**警告对话框不允许通过点击外部来关闭**。

### AlertDialogAction

| 属性      | 类型                                         | 默认值  | 说明                                                                                                         |
| --------- | -------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `loading` | `boolean`                                    | `false` | 是否显示加载状态；为 `true` 时按钮 `disabled` 且附加 `pointer-events-none opacity-75`，并渲染 `Spinner` 图标 |
| `variant` | `'default' \| 'destructive' \| 'success'`    | —       | 按钮变体，透传给 `buttonVariants`；不传时使用 `buttonVariants()` 的默认样式                                  |
| `onClick` | `React.MouseEventHandler<HTMLButtonElement>` | —       | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`AlertDialog.Action`）                              |

### AlertDialogCancel

| 属性        | 类型                                         | 默认值 | 说明                                                                            |
| ----------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| `onClick`   | `React.MouseEventHandler<HTMLButtonElement>` | —      | 点击事件（原生 `<button>` 属性），来自 Radix primitives（`AlertDialog.Cancel`） |
| `className` | `string`                                     | —      | 自定义类名，合并到末位                                                          |

### AlertDialogHeader / AlertDialogFooter / AlertDialogTitle / AlertDialogDescription

| 属性        | 类型      | 默认值 | 说明                                                                                               |
| ----------- | --------- | ------ | -------------------------------------------------------------------------------------------------- |
| `className` | `string`  | —      | 自定义类名，合并到末位                                                                             |
| `asChild`   | `boolean` | —      | 是否用 Slot 替换渲染元素，来自 Radix primitives（`AlertDialog.Title` / `AlertDialog.Description`） |

本表只列组件自有属性；此外还透传 `<div>` / `<h2>` / `<p>` / `<button>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- `AlertDialogContent` 渲染为 `role="alertdialog"`（比普通 `dialog` 语义更强），标题与描述由 Radix 通过 `aria-labelledby` / `aria-describedby` 自动关联。
- 警告对话框**强制模态**：焦点被锁定在内容区，页面其余部分被标记为 `aria-hidden`，用户无法通过点击外部或 `Tab` 离开。
- 键盘行为：`Escape` 可关闭对话框（可被 `onEscapeKeyDown` 阻止）；`Tab` / `Shift+Tab` 在内容内循环；`Enter` 在聚焦于确认按钮时触发确认。
- `AlertDialogAction` 在 `loading` 状态下会渲染 `Spinner`（`aria` 由 `Spinner` 自身提供），并把按钮置为 `disabled`，避免重复提交。
- `AlertDialogModal` 的描述通过 `AlertDialogDescription` 的 `asChild` 包裹在一个 `<div>` 中，图标为纯装饰（`lucide-react` 的 `svg` 默认无 `aria-hidden`，如需屏蔽请自行覆盖）。

## 主题变量

| 变量                                     | 说明                           |
| ---------------------------------------- | ------------------------------ |
| `--alert-dialog-overlay-z-index`         | 遮罩层层级                     |
| `--alert-dialog-content-z-index`         | 内容层层级                     |
| `--alert-dialog-overlay-background`      | 遮罩层背景色                   |
| `--alert-dialog-shadow`                  | 内容区阴影                     |
| `--alert-dialog-transition`              | 内容区过渡动画                 |
| `--alert-dialog-content-min-width`       | 内容区最小宽度                 |
| `--alert-dialog-content-max-width`       | 内容区最大宽度（基准值）       |
| `--alert-dialog-content-border-width`    | 内容区边框宽度                 |
| `--alert-dialog-backdrop-filter`         | 内容区背景模糊半径             |
| `--alert-dialog-sm-max-width`            | `size="sm"` 最大宽度           |
| `--alert-dialog-sm-padding`              | `size="sm"` 内边距             |
| `--alert-dialog-sm-gap`                  | `size="sm"` 元素间距           |
| `--alert-dialog-default-max-width`       | `size="default"` 最大宽度      |
| `--alert-dialog-default-padding`         | `size="default"` 内边距        |
| `--alert-dialog-default-gap`             | `size="default"` 元素间距      |
| `--alert-dialog-lg-max-width`            | `size="lg"` 最大宽度           |
| `--alert-dialog-lg-padding`              | `size="lg"` 内边距             |
| `--alert-dialog-lg-gap`                  | `size="lg"` 元素间距           |
| `--alert-dialog-default-border`          | `variant="default"` 边框色     |
| `--alert-dialog-default-background`      | `variant="default"` 背景色     |
| `--alert-dialog-default-foreground`      | `variant="default"` 文字色     |
| `--alert-dialog-destructive-border`      | `variant="destructive"` 边框色 |
| `--alert-dialog-destructive-background`  | `variant="destructive"` 背景色 |
| `--alert-dialog-destructive-foreground`  | `variant="destructive"` 文字色 |
| `--alert-dialog-success-border`          | `variant="success"` 边框色     |
| `--alert-dialog-success-background`      | `variant="success"` 背景色     |
| `--alert-dialog-success-foreground`      | `variant="success"` 文字色     |
| `--alert-dialog-header-gap`              | 头部元素间距                   |
| `--alert-dialog-footer-gap`              | 底部元素间距                   |
| `--alert-dialog-title-font-size`         | 标题字号                       |
| `--alert-dialog-title-font-weight`       | 标题字重                       |
| `--alert-dialog-title-line-height`       | 标题行高                       |
| `--alert-dialog-description-font-size`   | 描述字号                       |
| `--alert-dialog-description-color`       | 描述文字颜色                   |
| `--alert-dialog-description-line-height` | 描述行高                       |

## 组合用法 / 注意事项

- **`AlertDialogContent` 已内置 Portal 与 Overlay**：不要在其内部再次包裹 `AlertDialogPortal`，否则会出现两层遮罩。
- **与 `Dialog` 的区别**：`Dialog` 是通用模态对话框，可通过点击外部关闭；`AlertDialog` 是警告对话框，Radix 显式移除了 `onPointerDownOutside` / `onInteractOutside`，**无法通过点击外部关闭**，只能通过取消 / 确认 / `Escape` 关闭。
- **`AlertDialogModal` 的 `content` 字符串有 XSS 风险**：内部使用 `dangerouslySetInnerHTML` 渲染，请勿直接传入用户可控内容。
- **`AlertDialogAction` 的 `variant` 与 `AlertDialogContent` 的 `variant` 相互独立**：前者控制按钮配色（复用 `buttonVariants`），后者控制对话框配色。
- **`AlertDialogModal` 的 `onOk` / `onCancel` 回调后会自动调用 `onOpenChange?.(false)`**：若未传 `onOpenChange`，对话框不会自动关闭。

## 导出

| 导出名                    | 类型                                      | 说明                                                                        |
| ------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `AlertDialog`             | `React.FC<AlertDialogProps>`              | 警告对话框根组件（Radix `AlertDialog.Root`）                                |
| `AlertDialogPortal`       | `React.FC`                                | 传送门                                                                      |
| `AlertDialogOverlay`      | `React.ForwardRefExoticComponent`         | 遮罩层，ref 指向 `HTMLDivElement`                                           |
| `AlertDialogTrigger`      | `React.ForwardRefExoticComponent`         | 触发器，ref 指向 `HTMLButtonElement`                                        |
| `AlertDialogContent`      | `React.ForwardRefExoticComponent`         | 内容容器，ref 指向 `HTMLDivElement`                                         |
| `AlertDialogHeader`       | `React.FC`                                | 头部容器                                                                    |
| `AlertDialogFooter`       | `React.FC`                                | 底部容器                                                                    |
| `AlertDialogTitle`        | `React.ForwardRefExoticComponent`         | 标题，ref 指向 `HTMLHeadingElement`                                         |
| `AlertDialogDescription`  | `React.ForwardRefExoticComponent`         | 描述，ref 指向 `HTMLParagraphElement`                                       |
| `AlertDialogAction`       | `React.ForwardRefExoticComponent`         | 确认按钮，ref 指向 `HTMLButtonElement`                                      |
| `AlertDialogCancel`       | `React.ForwardRefExoticComponent`         | 取消按钮，ref 指向 `HTMLButtonElement`                                      |
| `AlertDialogVariant`      | `'default' \| 'destructive' \| 'success'` | 配色变体类型                                                                |
| `AlertDialogSize`         | `'sm' \| 'default' \| 'lg'`               | 尺寸变体类型                                                                |
| `AlertDialogContentProps` | `interface`                               | 内容容器属性接口（Radix `AlertDialog.Content` 属性 + `variant` / `size`）   |
| `AlertDialogActionProps`  | `interface`                               | 确认按钮属性接口（Radix `AlertDialog.Action` 属性 + `loading` / `variant`） |

### 未从包根导出的模块内导出

以下导出存在于 `src/ui/alert-dialog/alert-dialog-modal.tsx`，但**未**被 `src/ui/alert-dialog/index.ts` 与 `src/index.ts` 导出，因此无法通过 `import { ... } from '@easbot/ui'` 获得：

| 导出名                  | 类型                                          | 说明                                                |
| ----------------------- | --------------------------------------------- | --------------------------------------------------- |
| `AlertDialogModal`      | `React.FC<AlertDialogModalProps>`             | 高阶封装警告框组件（含图标 / 标题 / 描述 / 双按钮） |
| `AlertDialogModalProps` | `interface`                                   | `AlertDialogModal` 的属性接口                       |
| `IconType`              | `'success' \| 'info' \| 'error' \| 'warning'` | `AlertDialogModal` 的图标类型                       |
