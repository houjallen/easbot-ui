# Alert 提示条

> 在页面内联展示重要提示信息，支持 5 种语义状态、自动图标、可关闭与自定义图标。

---

**导入**

```tsx
import { Alert, AlertDescription, AlertTitle } from '@easbot/ui';
```

## 基础用法

```tsx
import { Alert, AlertDescription, AlertTitle } from '@easbot/ui';

export default function App() {
  return (
    <Alert>
      <AlertTitle>提示</AlertTitle>
      <AlertDescription>这是一条提示信息</AlertDescription>
    </Alert>
  );
}
```

语义状态与可关闭：

```tsx
import { Alert, AlertDescription, AlertTitle } from '@easbot/ui';

export default function App() {
  return (
    <Alert variant="success" closable onClose={() => console.log('已关闭')}>
      <AlertTitle>操作成功</AlertTitle>
      <AlertDescription>数据已保存至云端</AlertDescription>
    </Alert>
  );
}
```

自定义图标：

```tsx
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@easbot/ui';

<Alert icon={<Info className="h-4 w-4" />}>
  <AlertTitle>自定义图标</AlertTitle>
  <AlertDescription>传入 icon 后将覆盖按 variant 推导的默认图标</AlertDescription>
</Alert>;
```

关闭图标可单独定制：

```tsx
<Alert closable closeAriaLabel="关闭重要通知">
  <AlertTitle>无障碍示例</AlertTitle>
  <AlertDescription>关闭按钮带自定义 aria-label</AlertDescription>
</Alert>
```

## 变体

### variant

| 取值              | 说明                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| `default`（默认） | 默认样式，完全使用设计系统的默认配色（`bg-card` / `text-card-foreground`），无默认图标 |
| `destructive`     | 危险提示，红色边框 + 浅红底 + destructive 文字色，图标为 `XCircle`                     |
| `success`         | 成功提示，绿色边框 + 浅绿底 + 深绿文字色，图标为 `CheckCircle`                         |
| `warning`         | 警告提示，黄色边框 + 浅黄底 + 深黄文字色，图标为 `AlertTriangle`                       |
| `info`            | 信息提示，蓝色边框 + 浅蓝底 + 深蓝文字色，图标为 `Info`                                |

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `default`（默认） | 设计系统层的默认配色（`bg-card` / `text-card-foreground`）                                                    |
| `destructive`     | 设计系统层的危险配色（`border-destructive` + `bg-destructive/10` + `text-destructive`），暗色主题下反转前景色 |

## 属性

继承自 `React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof eunAlertVariants>, UiMessageProps`。

| 属性              | 类型              | 默认值 | 说明 |
| ----------------- | ----------------- | ------ | ---- |
| `closable?`       | `boolean`         | —      | —    |
| `onClose?`        | `() => void`      | —      | —    |
| `icon?`           | `React.ReactNode` | —      | —    |
| `closeAriaLabel?` | `string`          | —      | —    |
| `showIcon?`       | `boolean`         | —      | —    |

`AlertProps` 是 `Alert` 的属性接口，额外继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。
`AlertTitle` / `AlertDescription` 的属性接口（`AlertTitleProps` / `AlertDescriptionProps`）仅继承 `<div>` 的原生属性，无自有成员。

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性（`id` / `className` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 底层设计系统层的 `Alert` 渲染为 `<div role="alert">`，屏幕阅读器会在内容变化时播报该区域。
- 关闭按钮是原生 `<button type="button">`，带 `aria-label`（内置 `alert` 文案域的「关闭提示」/ `Dismiss alert`，可用 `closeAriaLabel` 或 `messages` 覆盖）。
- 关闭按钮可用 `Tab` 键聚焦，焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。
- 默认图标由 `lucide-react` 渲染，自身带 `aria-hidden="true"`，是纯装饰元素；语义由 `AlertTitle` / `AlertDescription` 的文本承担。
- `AlertTitle` / `AlertDescription` 均为 `<div>`（不是标题标签），需要语义层级时请自行包裹 `h3` 等标签。

## 注意事项

- **`icon` 优先级最高**：渲染逻辑为 `icon || (showIcon && variant ? variantIconMap[variant] : null)` —— 传入 `icon` 时即使 `showIcon={false}` 也会渲染自定义图标；`showIcon={false}` 只屏蔽「按 variant 推导的默认图标」。
- **`default` 变体没有默认图标**：`variantIconMap.default` 为 `null`，需要图标请显式传 `icon`。
- **`variant` 会向下转换成设计系统层的取值**：`success` / `warning` / `info` 传给底层时统一降级为 `default`，其配色完全由 `src/ui` 层的 `eunAlertVariants` 覆盖提供。
- **关闭按钮的配色跟随 `variant`**：`closable` 时内部使用 `CloseButton` 并把 `variant` 透传给它，因此 `success` / `warning` / `info` 会命中 `closeButtonVariants` 的对应取值。
- **组件不会自动隐藏**：`closable` 只负责渲染关闭按钮与触发 `onClose`，显隐状态需由调用方自行控制。
- **关闭按钮定位为绝对定位**：`absolute top-2 right-2`，会覆盖提示条右上角的内容，必要时请为内容预留空间。
- **`AlertTitle` 单行截断**：设计系统层给标题加了 `line-clamp-1 min-h-4`，超长标题会被截断（换行请放到 `AlertDescription`）。
- **描述区是 grid 布局**：`AlertDescription` 使用 `grid justify-items-start gap-1`，其子元素左对齐，块级子元素（如 `<p>` / `<ul>`）不会撑满宽度。
- **`className` 合并到末位**，自定义类名优先级最高。

## 导出

### 组件

| 导出名             | 说明 |
| ------------------ | ---- |
| `Alert`            |      |
| `AlertDescription` |      |
| `AlertProps`       |      |
| `AlertTitle`       |      |
