# RadioGroup 单选组

> 一组互斥的单选按钮，基于 Radix RadioGroup 实现，支持标签、描述、错误提示与键盘导航。

**导入**

```tsx
import { RadioGroup, RadioGroupItem } from '@easbot/ui';
```

## 基础用法

```tsx
import { RadioGroup, RadioGroupItem } from '@easbot/ui';

export default function App() {
  return (
    <RadioGroup defaultValue="daily">
      <RadioGroupItem value="daily" label="日报" />
      <RadioGroupItem value="weekly" label="周报" />
      <RadioGroupItem value="monthly" label="月报" />
    </RadioGroup>
  );
}
```

受控用法与描述、错误提示：

```tsx
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@easbot/ui';

export default function App() {
  const [value, setValue] = useState('daily');

  return (
    <RadioGroup value={value} onValueChange={setValue} orientation="vertical">
      <RadioGroupItem
        value="daily"
        label="日报"
        description="每天 09:00 推送"
        error={value === '' ? '请选择一种频率' : undefined}
      />
    </RadioGroup>
  );
}
```

## 组成部分

| 组成部分         | 用途         | 说明                                                                 |
| ---------------- | ------------ | -------------------------------------------------------------------- |
| `RadioGroup`     | 单选组根容器 | 渲染 Radix `RadioGroup.Root`，负责状态管理、键盘导航与方向键行为     |
| `RadioGroupItem` | 单个单选项   | 渲染 Radix `RadioGroup.Item`，内含指示器，并可附带标签 / 描述 / 错误 |

### RadioGroup 属性

| 属性            | 类型                         | 默认值 | 说明                         |
| --------------- | ---------------------------- | ------ | ---------------------------- |
| `className`     | `string`                     | —      | 自定义类名                   |
| `value`         | `string`                     | —      | 当前选中值（受控模式）       |
| `defaultValue`  | `string`                     | —      | 默认选中值（非受控模式）     |
| `onValueChange` | `(value: string) => void`    | —      | 选中值变化回调               |
| `name`          | `string`                     | —      | 表单字段名                   |
| `disabled`      | `boolean`                    | —      | 禁用整组                     |
| `orientation`   | `'horizontal' \| 'vertical'` | —      | 排列方向，影响方向键导航行为 |
| `dir`           | `'ltr' \| 'rtl'`             | —      | 文字方向                     |
| `loop`          | `boolean`                    | —      | 方向键导航是否循环           |
| `required`      | `boolean`                    | —      | 是否必选（原生表单校验）     |

本表只列组件自有属性；此外还透传 Radix `RadioGroup.Root` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

### RadioGroupItem 属性

| 属性          | 类型      | 默认值 | 说明                               |
| ------------- | --------- | ------ | ---------------------------------- |
| `label`       | `string`  | —      | 标签文本                           |
| `description` | `string`  | —      | 描述文本                           |
| `error`       | `string`  | —      | 错误信息                           |
| `disabled`    | `boolean` | —      | 禁用状态                           |
| `value`       | `string`  | —      | 选项值（必填）                     |
| `id`          | `string`  | —      | 选项 `id`，标签的 `htmlFor` 依赖它 |
| `className`   | `string`  | —      | 自定义类名                         |

本表只列组件自有属性；此外还透传 Radix `RadioGroup.Item` 的全部原生属性，如 `name` / `required` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- 基于 Radix `RadioGroup`，组容器渲染为 `role="radiogroup"`，每个选项渲染为 `role="radio"`，选中项带 `aria-checked="true"`。
- 方向键（`ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight`）在组内移动焦点与选中项，`Home` / `End` 跳到首尾；`orientation` 决定生效的方向轴。
- 传入 `error` 时自动设置 `aria-invalid={!!error}`。
- 焦点样式使用 `focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--radio-focus-ring)]` + `focus-visible:ring-offset-2`。
- 选项标签使用原生 `<label htmlFor={props.id}>`，需要提供 `id` 才能点击标签选中选项。
- 禁用态使用原生 `disabled` 属性并降低透明度。

## 主题变量

| 变量                        | 说明                                          |
| --------------------------- | --------------------------------------------- |
| `--radio-gap`               | 组内选项间距（`grid gap-[var(--radio-gap)]`） |
| `--radio-size`              | 单选按钮直径（高 / 宽）                       |
| `--radio-background`        | 单选按钮背景色                                |
| `--radio-border`            | 未选中时的边框色                              |
| `--radio-hover-border`      | hover 边框色                                  |
| `--radio-hover-bg`          | hover 背景色                                  |
| `--radio-focus-border`      | focus 边框色                                  |
| `--radio-focus-ring`        | focus 焦点环颜色                              |
| `--radio-focus-ring-offset` | focus 焦点环偏移底色                          |
| `--radio-checked-border`    | 选中态边框色                                  |
| `--radio-checked-bg`        | 选中态背景色                                  |
| `--radio-indicator`         | 选中指示点颜色（`Circle` 图标的填充与描边）   |
| `--radio-indicator-size`    | 选中指示点尺寸                                |
| `--radio-disabled-opacity`  | 禁用态透明度                                  |

> 标签、描述、错误文本使用 Tailwind 语义类 `text-muted-foreground` 与 `text-destructive`，分别对应 `--muted-foreground` 与 `--destructive`。

## 组合用法 / 注意事项

- **必须放在 `RadioGroup` 内使用**：`RadioGroupItem` 依赖 `RadioGroup` 提供的上下文，独立渲染会抛出上下文缺失错误。
- **`value` 为必填**：Radix `RadioGroup.Item` 要求 `value` 属性，缺失会导致运行时报错。
- **`id` 决定标签关联**：`htmlFor={props.id}` 直接取自 `props.id`，不传 `id` 时标签不会与单选按钮关联。
- **文本区域可选渲染**：只有 `label` / `description` / `error` 三者全部为空时，才不渲染右侧文本容器，此时选项只有圆点。
- **横向排列未内置**：根容器固定为 `grid` 布局（纵向排列），`orientation` 属性只传递给 Radix 用于键盘导航方向，不改变视觉排列。

## 导出

| 导出名                         | 类型                              | 说明                                                                 |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------------- |
| `RadioGroup`                   | `React.ForwardRefExoticComponent` | 单选组根组件，ref 指向 Radix `RadioGroup.Root`                       |
| `RadioGroupItem`               | `React.ForwardRefExoticComponent` | 单选项组件，ref 指向 Radix `RadioGroup.Item`                         |
| `RadioGroupItemWithLabelProps` | `interface`                       | 带标签能力的单选项属性接口                                           |
| `RadioGroupProps`              | `type`                            | 直接复用 `@radix-ui/react-radio-group` 的 `RadioGroupProps` 类型     |
| `RadioGroupItemProps`          | `type`                            | 直接复用 `@radix-ui/react-radio-group` 的 `RadioGroupItemProps` 类型 |
