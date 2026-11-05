# Combobox 组合框

> 可搜索的下拉选择框，支持单选 / 多选、分组、加载态与内置中英文文案。

---

**导入**

```tsx
import { Combobox } from '@easbot/ui';
```

## 基础用法

```tsx
import { Combobox } from '@easbot/ui';

export default function App() {
  return (
    <Combobox
      options={[
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '橙子', value: 'orange' },
      ]}
      placeholder="请选择"
    />
  );
}
```

可搜索与多选：

```tsx
import { useState } from 'react';

const [selected, setSelected] = useState<string[]>([]);

<Combobox
  searchable
  multiple
  options={[
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
  ]}
  value={selected}
  onChange={(value) => setSelected(value as string[])}
  placeholder="请搜索选择"
/>;
```

分组选项与禁用项：

```tsx
<Combobox
  options={[
    {
      label: '水果',
      options: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana', disabled: true },
      ],
    },
  ]}
/>
```

带标签 / 描述 / 错误态：

```tsx
<Combobox label="所属项目" description="选择该项目下的资源" error options={options} />
```

带错误文案：

```tsx
<Combobox error errorMessage="请选择有效选项" options={options} />
```

> `error` 是**布尔值**，只控制边框高亮；错误文案由 `errorMessage` 提供 ——
> 传入后在触发器下方以 `text-destructive` 样式展示。

## 变体

### variant

| 取值              | 说明                                    |
| ----------------- | --------------------------------------- |
| `default`（默认） | 默认样式，边框使用 `border-input`       |
| `error`           | 错误态，边框与焦点环使用 destructive 色 |
| `success`         | 成功态，边框与焦点环使用 success 色     |

## 属性

继承自 `Omit<React.ComponentPropsWithoutRef<'button'>, 'value' | 'onChange' | 'size'>, Omit<VariantProps<typeof selectVariants>, 'size'>, UiMessageProps`。

| 属性                       | 类型                                                        | 默认值    | 说明                                                          |
| -------------------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------- |
| `triggerClassName?`        | `string`                                                    | —         | 触发按钮的自定义 className                                    |
| `popoverContentClassName?` | `string`                                                    | —         | 弹层内容的自定义 className                                    |
| `popoverContentStyle?`     | `React.CSSProperties`                                       | —         | 弹层内容的自定义样式                                          |
| `variant?`                 | `VariantProps<typeof selectVariants>['variant']`            | `default` | 组合框的变体样式（兼容旧用法，推荐使用 error/success 布尔值） |
| `error?`                   | `boolean`                                                   | —         | 错误状态，边框高亮为错误色                                    |
| `errorMessage?`            | `string`                                                    | —         | 错误信息文案（渲染在触发器下方，`text-destructive` 样式）     |
| `success?`                 | `boolean`                                                   | —         | 成功状态，边框高亮为成功色                                    |
| `options`                  | `(SelectOption \| SelectGroup)[]`                           | —         | 选项列表                                                      |
| `value?`                   | `string \| number \| (string \| number)[]`                  | —         | 当前选中值                                                    |
| `onChange?`                | `(value: string \| number \| (string \| number)[]) => void` | —         | 值变化回调                                                    |
| `placeholder?`             | `string`                                                    | —         | 占位文本                                                      |
| `disabled?`                | `boolean`                                                   | —         | 禁用状态                                                      |
| `loading?`                 | `boolean`                                                   | —         | 加载状态                                                      |
| `multiple?`                | `boolean`                                                   | —         | 是否多选                                                      |
| `searchable?`              | `boolean`                                                   | —         | 是否可搜索                                                    |
| `onSearch?`                | `(value: string) => void`                                   | —         | 搜索回调                                                      |
| `label?`                   | `string`                                                    | —         | 标签文本                                                      |
| `description?`             | `string`                                                    | —         | 描述文本                                                      |

`ComboboxProps` 为 `EunComboboxProps` 的别名。本表只列组件自有属性（`triggerClassName` / `popoverContentClassName` / `popoverContentStyle` / `variant` / `error` / `errorMessage` / `success` / `options` / `value` / `onChange` / `placeholder` / `disabled` / `loading` / `multiple` / `searchable` / `onSearch` / `label` / `description`）；此外还透传 `<button>` 的全部原生属性（`id` / `name` / `type` / `onClick` / `aria-*` / `data-*` 等），并继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。

## 无障碍

- 触发器渲染为原生 `<button type="button">`，并注入 `role="combobox"` / `aria-expanded` / `aria-controls` / `aria-haspopup="dialog"`。
- `loading` 时注入 `aria-busy="true"`；`error` 时注入 `aria-invalid="true"`。
- 搜索框由 cmdk 的 `CommandInput` 渲染（原生 `<input>`），`placeholder` 走内置文案表（zh-CN「搜索选项」/ en-US「Search options」）。
- 移除已选项的控件使用 `<span role="button" tabIndex={0} aria-label={t('removeOption')}>`，键盘可达 —— `Enter` 与 `Space` 均可触发移除。
- 移除控件内的 `X` 图标标记 `aria-hidden="true"`，是纯装饰。
- 选项列表由 cmdk 渲染，使用 `role="listbox"` / `role="option"` 语义；选中项以 `Check` 图标标记（`aria-hidden`）。

## 注意事项

- **`error` / `success` 优先于 `variant`**：源码计算 `variant: !error && !success ? variant : error ? 'error' : 'success'`，因此同时传 `error` 与 `variant="success"` 时按错误态渲染。
- **`error` 与 `errorMessage` 职责分离**：`error`（布尔）只控制边框高亮与 `aria-invalid`；`errorMessage`（字符串）提供错误文案，渲染在触发器下方。未传 `errorMessage` 时不渲染错误文案段落。
- **`className` 作用于外层容器**：`className` 合并到组件外层 wrapper（`grid w-full gap-1.5`）；触发器（内层 `<button>`）的样式请用 `triggerClassName`，两者互补不重叠。
- **多选值的显示是「首个 + 数量」**：选中超过一项时只展示第一个标签，剩余以 `+N` 呈现，且只给第一个标签提供移除控件。
- **单选选中后自动关闭面板**；多选时面板保持打开，可连续选择。
- **非受控多选需要内部状态**：`value` 为 `undefined` 时组件用内部 `uncontrolledValues` 累积选择结果；受控时以 `value` 为准。
- **搜索过滤是大小写不敏感的子串匹配**：命中 `label` 的选项才会保留；分组内无命中时整个分组被隐藏。
- **`searchable` 为假时禁用 cmdk 内置过滤**：`Command` 上的 `shouldFilter={!searchable}`，过滤完全由组件自身的 `searchValue` 逻辑完成。
- **空搜索且无结果时不显示空状态**：`CommandEmpty` 仅在 `searchValue` 非空且过滤结果为空时渲染。
- **`label` / `description` / `error` 由组件自绘**：使用原生 `<label htmlFor={id}>`，其中 `id` 由 `React.useId()` 生成。
- **触发器不用 `Button` 组件**：源码注释说明 `Button` 会把 children 包进 `justify-center` 容器，导致左右分布布局失效 —— 因此直接用原生 `<button>`。
- **弹层宽度跟随触发器**：使用 `w-[var(--radix-popover-trigger-width)]`。
- **右侧箭头的悬停反馈**：触发器带 `group`，箭头为 `opacity-50 transition-opacity` + `group-hover:opacity-100`（正常态悬停提亮），`disabled` / `loading` 时不拼该 hover 类。不能给箭头直接写 `hover:opacity-100`：`selectVariants` 有 `[&_svg]:pointer-events-none`，svg 自身收不到 `:hover`（见 `spec/css-standard.md` §4.9.5）。
- **`disabled` / `loading` 时多选标签的移除 X 同步禁用**：触发器是 `<button>`，移除控件不能嵌套 button，因此是 `<span role="button">`；禁用态须显式 `aria-disabled`、`tabIndex={-1}`、`cursor-not-allowed` 并在 click / keydown 内早退，否则键盘 Enter/Space 仍能改值（见 `spec/css-standard.md` §4.9.2）。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--destructive`
- `--gray-100`
- `--radix-popover-trigger-width`
- `--success`

## 导出

### 组件

| 导出名           | 说明 |
| ---------------- | ---- |
| `Combobox`       |      |
| `ComboboxGroup`  |      |
| `ComboboxOption` |      |
| `ComboboxProps`  |      |
| `ComboboxRef`    |      |
| `SelectVariant`  |      |
