# RadioGroup 单选组

> 一组互斥的单选项，支持标签 / 描述 / 错误文案与危险色指示点。

---

**导入**

```tsx
import { Label, RadioGroup, RadioGroupItem } from '@easbot/ui';
```

## 基础用法

```tsx
import { Label, RadioGroup, RadioGroupItem } from '@easbot/ui';

export default function App() {
  return (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">选项一</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">选项二</Label>
      </div>
    </RadioGroup>
  );
}
```

受控用法：

```tsx
import { useState } from 'react';

const [value, setValue] = useState('male');

<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="male" id="male" label="男" />
  <RadioGroupItem value="female" id="female" label="女" />
</RadioGroup>;
```

## 变体

### variant

| 取值              | 说明                                 |
| ----------------- | ------------------------------------ |
| `default`（默认） | 指示点使用主题主色（text-primary）   |
| `destructive`     | 指示点使用危险色（text-destructive） |

## 属性

继承自 `Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'children'>, VariantProps<typeof radioGroupItemIndicatorVariants>`。

| 属性                    | 类型      | 默认值 | 说明                           |
| ----------------------- | --------- | ------ | ------------------------------ |
| `label?`                | `string`  | —      | 标签文本                       |
| `description?`          | `string`  | —      | 描述文本                       |
| `error?`                | `string`  | —      | 错误信息                       |
| `isInvalid?`            | `boolean` | —      | 是否无效状态，用于显示错误样式 |
| `wrapperClassName?`     | `string`  | —      | 容器额外的 CSS 类名            |
| `labelClassName?`       | `string`  | —      | 标签文本额外的 CSS 类名        |
| `descriptionClassName?` | `string`  | —      | 描述文本额外的 CSS 类名        |
| `errorClassName?`       | `string`  | —      | 错误信息额外的 CSS 类名        |

`RadioGroupProps` / `RadioGroupItemProps` 分别是 `EunRadioGroupProps` / `EunRadioGroupItemProps` 的别名。`RadioGroup` 全部继承自 Radix `RadioGroupPrimitive.Root`，无自有成员；`RadioGroupItem` 除下表成员外还继承 Radix `RadioGroupPrimitive.Item`（`value` / `disabled` / `required` / `onValueChange` 等），并 `Omit` 掉了 `children`。

本表只列组件自有属性；此外还透传 Radix RadioGroup 的全部原生属性（`id` / `name` / `form` / `orientation` / `dir` / `loop` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 组容器渲染为 `role="radiogroup"`，并注入 `aria-required`（`required`）与 `aria-orientation`（`orientation`）。
- 单项渲染为 `<button type="button" role="radio">`，注入 `aria-checked`、`data-state`（`checked` / `unchecked`）。
- 键盘操作：方向键（`ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight`）在组内移动焦点并**同时选中**该项；`Enter` 被阻止默认行为（不触发提交）。
- 存在 `error` 或 `isInvalid` 时注入 `aria-invalid="true"`，配合 `aria-invalid:border-destructive` 显示红色边框。
- 传入 `error` 且同时提供 `id` 时，自动生成 `aria-describedby` 指向错误文案（`<id>-error-text`）。
- 标签使用原生 `<label htmlFor={id}>`，点击文字即可选中该项。
- 指示点图标（`CircleIcon`）为纯装饰，状态由 `aria-checked` 表达。

## 注意事项

- **`variant` 只作用于指示点**：`radioGroupItemIndicatorVariants` 仅设置指示圆点的文字色（配合 `fill-current` 上色），单选框本体的边框 / 背景仍是默认主题色。
- **`label` / `description` / `error` 需配 `id`**：文案使用原生 `<label htmlFor={id}>`，不传 `id` 时标签无法与单选框建立关联，点击不会选中。
- **错误文案依赖 `id`**：`aria-describedby` 仅在同时存在 `error` 与 `id` 时生成。
- **`error` 与 `isInvalid` 都会触发红色样式**：两者任一为真即注入 `aria-invalid`，标签文本也会变红。
- **组件不渲染 `children`**：Props 接口已 `Omit<..., 'children'>`，文案请用 `label` / `description` / `error` 三个字符串属性传入。
- **布局类由容器承担**：组容器默认 `grid gap-3`（纵向排列），横向排列需自行传 `className="flex gap-4"`。
- **类名分层**：`wrapperClassName` 作用于外层容器，`labelClassName` / `descriptionClassName` / `errorClassName` 分别作用于对应文本节点，`className` 作用于单选框本体。

## 导出

### 组件

| 导出名                   | 说明 |
| ------------------------ | ---- |
| `EunRadioGroupItemProps` |      |
| `EunRadioGroupItemRef`   |      |
| `EunRadioGroupProps`     |      |
| `EunRadioGroupRef`       |      |
| `RadioGroup`             |      |
| `RadioGroupItem`         |      |
| `RadioGroupItemProps`    |      |
| `RadioGroupItemRef`      |      |
| `RadioGroupProps`        |      |
| `RadioGroupRef`          |      |
