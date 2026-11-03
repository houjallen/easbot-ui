# Tabs 标签页

> 用于在同一区域内切换展示多组内容，基于 Radix `Tabs` primitive，支持受控 / 非受控模式与键盘导航。

**导入**

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@easbot/ui';
```

## 基础用法

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">账户</TabsTrigger>
    <TabsTrigger value="password">密码</TabsTrigger>
  </TabsList>
  <TabsContent value="account">账户设置内容</TabsContent>
  <TabsContent value="password">修改密码内容</TabsContent>
</Tabs>
```

## 组成部分

| 子组件        | 渲染元素   | 说明                                                                  |
| ------------- | ---------- | --------------------------------------------------------------------- |
| `Tabs`        | `<div>`    | 根容器，承载受控状态与方向上下文，固定 `w-full`                       |
| `TabsList`    | `<div>`    | 标签列表容器（Radix RovingFocus 容器），固定 `inline-flex` 且带下边框 |
| `TabsTrigger` | `<button>` | 标签页按钮，激活时显示底部指示条，支持 `disabled`                     |
| `TabsContent` | `<div>`    | 标签页内容区，非激活时 `opacity-0`（仍保留在 DOM 中）                 |

## 变体

本组件未使用 `cva`，没有 variant 维度。视觉变体（指示条颜色、间距等）由 CSS 变量控制。

## 属性

### Tabs

`Tabs` 的 props 类型为 `React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>`，即 Radix `Tabs.Root` 的全部属性：

| 属性             | 类型                         | 默认值         | 说明                                                       |
| ---------------- | ---------------------------- | -------------- | ---------------------------------------------------------- |
| `value`          | `string`                     | —              | 当前选中的标签值（受控模式）                               |
| `defaultValue`   | `string`                     | —              | 默认选中的标签值（非受控模式）                             |
| `onValueChange`  | `(value: string) => void`    | —              | 选中项变化回调                                             |
| `orientation`    | `'horizontal' \| 'vertical'` | `'horizontal'` | 标签排列方向，决定方向键导航方式（左/右 vs 上/下）         |
| `dir`            | `'ltr' \| 'rtl'`             | `'ltr'`        | 导航方向                                                   |
| `activationMode` | `'automatic' \| 'manual'`    | `'automatic'`  | 标签切换方式：自动（焦点即切换）或手动（需 Enter / Space） |
| `className`      | `string`                     | —              | 根节点自定义类名                                           |

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

### TabsList

| 属性        | 类型      | 默认值 | 说明                                    |
| ----------- | --------- | ------ | --------------------------------------- |
| `loop`      | `boolean` | —      | 方向键导航是否循环（Radix RovingFocus） |
| `className` | `string`  | —      | 自定义类名                              |

### TabsTrigger

| 属性        | 类型             | 默认值 | 说明                                         |
| ----------- | ---------------- | ------ | -------------------------------------------- |
| `value`     | `string`（必填） | —      | 与 `TabsContent` 的 `value` 对应标识         |
| `disabled`  | `boolean`        | —      | 禁用该标签页（样式含 `disabled:opacity-50`） |
| `className` | `string`         | —      | 自定义类名                                   |

### TabsContent

| 属性         | 类型             | 默认值 | 说明                                 |
| ------------ | ---------------- | ------ | ------------------------------------ |
| `value`      | `string`（必填） | —      | 与 `TabsTrigger` 的 `value` 对应标识 |
| `forceMount` | `true`           | —      | 强制挂载内容（用于自定义动画过渡）   |
| `className`  | `string`         | —      | 自定义类名                           |

本表只列组件自有属性；此外各子组件还透传对应原生元素（`<div>` / `<button>`）的全部原生属性。

## 导出

| 导出名             | 类型 | 说明                        |
| ------------------ | ---- | --------------------------- |
| `Tabs`             | 组件 | 根容器，`React.forwardRef`  |
| `TabsList`         | 组件 | 标签列表容器                |
| `TabsTrigger`      | 组件 | 标签页按钮                  |
| `TabsContent`      | 组件 | 标签页内容区                |
| `TabsProps`        | 类型 | `Tabs` 的 props 类型        |
| `TabsListProps`    | 类型 | `TabsList` 的 props 类型    |
| `TabsTriggerProps` | 类型 | `TabsTrigger` 的 props 类型 |
| `TabsContentProps` | 类型 | `TabsContent` 的 props 类型 |

## 无障碍

- Radix `Tabs` 采用 WAI-ARIA Tabs 模式：`TabsList` 渲染为 `role="tablist"`（带 `aria-orientation`），
  触发器渲染为 `role="tab"`（带 `aria-selected` 与 `aria-controls`），
  内容区渲染为 `role="tabpanel"`（带 `aria-labelledby` 指向对应触发器）。
- 触发器为原生 `<button type="button">`；`TabsList` 内部使用 RovingFocus，
  列表容器自身带 `tabindex="0"`，未激活的触发器为 `tabindex="-1"`，同一时刻只有一个触发器处于焦点位置。
- 方向键在触发器之间移动焦点：水平方向用 `←` / `→`，垂直方向用 `↑` / `↓`。
- `activationMode="automatic"`（默认）时，焦点移动即切换内容；`"manual"` 时需按 `Enter` / `Space` 才切换。
- `TabsTrigger` 设置 `disabled` 后不可聚焦、不可点击，样式为 `disabled:opacity-50`。
- `TabsContent` 内部带 `focus-visible:ring-2` 焦点环，便于键盘用户定位内容区域。
- `TabsContent` 未激活时仍保留在 DOM 中（`opacity-0`），若内容中包含可聚焦控件，
  建议配合 `forceMount` 自行控制，或确保未激活内容内无可聚焦元素。

## 主题变量

| 变量                      | 说明                        |
| ------------------------- | --------------------------- |
| `--tabs-border`           | 标签列表下边框颜色          |
| `--tabs-text`             | 未激活标签的文字颜色        |
| `--tabs-text-hover`       | 标签悬停时的文字颜色        |
| `--tabs-text-active`      | 激活标签 / 内容区的文字颜色 |
| `--tabs-indicator`        | 激活标签底部指示条颜色      |
| `--tabs-indicator-height` | 底部指示条高度              |
| `--tabs-gap`              | 标签之间的间距              |
| `--tabs-ring`             | 内容区聚焦时的焦点环颜色    |
| `--tabs-ring-offset`      | 内容区焦点环的外扩底色      |

## 组合用法 / 注意事项

1. **`value` 必须成对匹配**：`TabsTrigger` 的 `value` 与 `TabsContent` 的 `value` 相同即视为同一标签页，
   两者都不匹配会导致内容区空白。
2. **受控与非受控二选一**：受控用 `value` + `onValueChange`，非受控用 `defaultValue`；
   同时传 `value` 与 `defaultValue` 时 `value` 生效。
3. **垂直布局**：传 `orientation="vertical"` 后，方向键导航变为上下键；
   `TabsList` 需要自行改为纵向排列（`flex flex-col`），组件默认样式仍是横向 `inline-flex`。
4. **指示条实现**：`TabsTrigger` 用 `after:` 伪元素绘制底部指示条，
   激活态由 `data-[state=active]:after:bg-[var(--tabs-indicator)]` 控制。
5. **自定义动画**：需要内容切换动画时，给 `TabsContent` 传 `forceMount` 并自行控制显隐与过渡。
