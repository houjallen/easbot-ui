# Select 选择器

> 从预设选项列表中选择一项，支持分组、禁用项与内置中英文占位文案。

---

**导入**

```tsx
import { Select } from '@easbot/ui';
```

## 基础用法

```tsx
import { Select } from '@easbot/ui';

export default function App() {
  return (
    <Select
      options={[
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' },
      ]}
      placeholder="请选择"
    />
  );
}
```

受控用法与分组选项：

```tsx
import { useState } from 'react';

const [value, setValue] = useState<string>();

<Select
  value={value}
  onValueChange={setValue}
  groups={[
    {
      label: '分组1',
      options: [
        { label: '选项1-1', value: '1-1' },
        { label: '选项1-2', value: '1-2' },
      ],
    },
  ]}
  placeholder="请选择"
/>;
```

错误态 / 成功态：

```tsx
<Select options={options} error placeholder="错误状态" />
<Select options={options} success placeholder="成功状态" />
```

## 属性

继承自 `UiMessageProps`。

| 属性                       | 类型                      | 默认值 | 说明                                          |
| -------------------------- | ------------------------- | ------ | --------------------------------------------- |
| `options?`                 | `SelectOption[]`          | —      | —                                             |
| `groups?`                  | `SelectGroup[]`           | —      | —                                             |
| `value?`                   | `string`                  | —      | —                                             |
| `defaultValue?`            | `string`                  | —      | —                                             |
| `onValueChange?`           | `(value: string) => void` | —      | —                                             |
| `placeholder?`             | `string`                  | —      | —                                             |
| `disabled?`                | `boolean`                 | —      | —                                             |
| `className?`               | `string`                  | —      | —                                             |
| `contentClassName?`        | `string`                  | —      | —                                             |
| `popoverContentClassName?` | `string`                  | —      | —                                             |
| `popoverContentStyle?`     | `React.CSSProperties`     | —      | —                                             |
| `size?`                    | `'sm' \| 'default'`       | —      | —                                             |
| `name?`                    | `string`                  | —      | —                                             |
| `required?`                | `boolean`                 | —      | —                                             |
| `error?`                   | `boolean`                 | —      | —                                             |
| `success?`                 | `boolean`                 | —      | —                                             |
| `aria-label?`              | `string`                  | —      | 无障碍标签 —— 透传到触发器（combobox）        |
| `aria-labelledby?`         | `string`                  | —      | 无障碍描述关联 id —— 透传到触发器（combobox） |
| `aria-describedby?`        | `string`                  | —      | 无障碍描述 id —— 透传到触发器（combobox）     |

`SelectProps` 为 `EunSelectProps` 的别名，对外还导出 `SelectOption` / `SelectGroup` 两个数据类型。本表只列组件自有属性；此外还透传 Radix Select Root 的全部原生属性（`open` / `onOpenChange` / `dir` / `name` / `required` 等），并继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。

## 无障碍

- 触发器由 Radix `SelectPrimitive.Trigger` 渲染，注入 `role="combobox"` / `aria-expanded` / `aria-controls` / `aria-required` / `aria-autocomplete`，并通过 `data-placeholder` 标记占位态。
- 下拉面板由 Radix `SelectPrimitive.Content` 渲染到 Portal，容器带 `role="listbox"`，选项带 `role="option"` 与 `aria-selected`。
- 键盘操作：`Enter` / `Space` 打开面板，方向键在选项间移动，`Enter` 选中，`Esc` 关闭。
- 存在 `error` 时注入 `aria-invalid="true"`。
- 支持 `aria-label` / `aria-labelledby` / `aria-describedby` 透传到触发器 —— Radix Select 的 Root 不渲染 DOM，这些属性必须落在 `SelectTrigger` 上，否则会被丢弃。

## 注意事项

- **占位符有内置双语文案**：未传 `placeholder` 时使用内置文案表（zh-CN「请选择」/ en-US「Please select」），可通过 `locale` / `messages` 覆盖。
- **`options` 与 `groups` 可同时传入**：两者都会渲染到下拉面板中（`options` 在前，`groups` 在后）。
- **状态优先级**：`error > success > 默认`。同时传 `error` 与 `success` 时按错误态渲染。
- **右侧箭头的悬停反馈**：触发器带 `group`，箭头为 `opacity-50 transition-opacity` + `group-hover:opacity-100` —— 正常态悬停提亮，`disabled` 时不拼该 hover 类（无反馈）。之所以不能给箭头直接写 `hover:opacity-100`：触发器基类有 `[&_svg]:pointer-events-none`，svg 自身收不到 `:hover`（见 `spec/css-standard.md` §4.9.5）。
- **表单内会自动感知校验状态**：在 `<Form>` + `<FormField>` 内使用时，未显式传 `error` / `success` 会自动读取表单状态 —— `error = !!invalid`，`success = isTouched && !invalid`；显式传入的值优先级更高。
- **`contentClassName` 与 `popoverContentClassName` 作用一致**：两者都会合并到下拉面板的 `className` 上。
- **`className` 作用于触发器**，`popoverContentStyle` 作用于下拉面板（行内样式）。
- **`size` 只有两档**：`'sm'`（`h-8`）与 `'default'`（`h-9`），默认 `'default'`。
- **`SelectOption` / `SelectGroup` 是类型**：`SelectOption` 含 `label` / `value` / `disabled?`，`SelectGroup` 含 `label` / `options`。
- **弹层鼠标指针**：选项与滚动按钮使用 `cursor-pointer`（与 Combobox 的选项一致）；禁用选项使用 `data-[disabled]:cursor-not-allowed`，**不得**使用 `data-[disabled]:pointer-events-none` —— 元素对鼠标透明后命中的是下层 `body`，`not-allowed` 光标永不生效（见 `spec/css-standard.md` §4.9）。Radix 已在 `onClick` / `onPointerUp` 中拦截禁用项，移除指针事件屏蔽不会导致误选。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--destructive`
- `--radix-select-trigger-height`
- `--radix-select-trigger-width`
- `--success`

## 导出

### 组件

| 导出名           | 说明 |
| ---------------- | ---- |
| `EunSelectProps` |      |
| `Select`         |      |
| `SelectGroup`    |      |
| `SelectOption`   |      |
| `SelectProps`    |      |
