# Checkbox 复选框

> 多选框控件，支持中间态、标签 / 描述 / 错误文案与危险色变体。

---

**导入**

```tsx
import { Checkbox } from '@easbot/ui';
```

## 基础用法

```tsx
import { Checkbox } from '@easbot/ui';

export default function App() {
  return <Checkbox label="同意服务条款" />;
}
```

中间态、禁用态与描述文案：

```tsx
<Checkbox label="全部文件" indeterminate />
<Checkbox label="已禁用" disabled />
<Checkbox label="带描述" description="这是选项的补充说明" />
<Checkbox label="带错误" error="请先同意服务条款" />
```

受控用法：

```tsx
import { useState } from 'react';

const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);

<Checkbox checked={checked} onCheckedChange={setChecked} label="受控复选框" />;
```

## 变体

### variant

| 取值              | 说明                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| `default`（默认） | 默认样式，勾选态使用主题主色（primary）                                      |
| `destructive`     | 危险色，未选中时边框为 destructive，勾选后背景 / 文字 / 边框均为 destructive |

## 属性

继承自 `Omit<React.ComponentPropsWithoutRef<typeof DsCheckbox>, 'size' | 'children'>, VariantProps<typeof eunCheckboxVariants>`。

| 属性                    | 类型      | 默认值 | 说明                           |
| ----------------------- | --------- | ------ | ------------------------------ |
| `indeterminate?`        | `boolean` | —      | 中间态控制                     |
| `label?`                | `string`  | —      | 标签文本                       |
| `description?`          | `string`  | —      | 描述文本                       |
| `error?`                | `string`  | —      | 错误信息                       |
| `wrapperClassName?`     | `string`  | —      | 容器额外的 CSS 类名            |
| `labelClassName?`       | `string`  | —      | 标签文本额外的 CSS 类名        |
| `descriptionClassName?` | `string`  | —      | 描述文本额外的 CSS 类名        |
| `errorClassName?`       | `string`  | —      | 错误信息额外的 CSS 类名        |
| `isInvalid?`            | `boolean` | —      | 是否无效状态，用于显示错误样式 |

`CheckboxProps` 为 `EunCheckboxProps` 的别名。本表只列组件自有属性（`indeterminate` / `label` / `description` / `error` / `wrapperClassName` / `labelClassName` / `descriptionClassName` / `errorClassName` / `isInvalid`）；此外还透传 Radix Checkbox 的全部原生属性（`id` / `name` / `value` / `checked` / `defaultChecked` / `required` / `form` / `onCheckedChange` / `aria-*` / `data-*` 等）。

## 无障碍

- 底层 Radix Checkbox 渲染为 `<button type="button" role="checkbox">`，并注入 `aria-checked`（`true` / `false` / `mixed`）、`aria-required`、`data-state`（`checked` / `unchecked` / `indeterminate`）。
- 中间态时 `aria-checked="mixed"`，屏幕阅读器播报「部分选中」。
- 键盘操作：`Space` 切换勾选状态；`Enter` 被阻止默认行为（不触发提交）。
- 存在 `error` 或 `isInvalid` 时注入 `aria-invalid="true"`。
- 传入 `error` 且同时提供 `id` 时，自动生成 `aria-describedby` 指向错误文案（`<id>-error-text`）。
- 标签使用原生 `<label htmlFor={id}>`，点击文字即可切换勾选状态。
- 半选态的横杠图标标记 `aria-hidden="true"`，状态已由 `aria-checked` 表达。

## 注意事项

- **`indeterminate` 优先于 `checked`**：内部固定传 `checked={indeterminate ? 'indeterminate' : checked}`，同时传两者时以 `indeterminate` 为准。
- **不要用 `children` 传文案**：Props 接口已 `Omit<..., 'children'>`，文本请用 `label` / `description` / `error` 三个字符串属性传入。
- **错误文案依赖 `id`**：`aria-describedby` 仅在同时存在 `error` 与 `id` 时生成；缺少 `id` 时错误文案仍会显示，但不会被读屏关联。
- **`error` 与 `isInvalid` 都会触发红色样式**：`aria-invalid` 由两者任一为真决定，`label` 文本也会变红。
- **`size` 已被移除**：Props 接口 `Omit<..., 'size'>`，复选框尺寸固定为 `size-4`。
- **`destructive` 变体不依赖 `aria-invalid`**：无论是否处于错误态，都会强制应用危险色。
- **类名分层**：`wrapperClassName` 作用于外层容器，`labelClassName` / `descriptionClassName` / `errorClassName` 分别作用于对应文本节点，`className` 作用于复选框本体。

## 导出

### 组件

| 导出名             | 说明 |
| ------------------ | ---- |
| `Checkbox`         |      |
| `CheckboxProps`    |      |
| `CheckboxRef`      |      |
| `EunCheckboxProps` |      |
| `EunCheckboxRef`   |      |
