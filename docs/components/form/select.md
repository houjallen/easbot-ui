# Select 下拉选择

> 从预定义选项中选择一个或多个值的下拉控件，基于 Popover 自研实现，支持搜索过滤与分组选项。

**导入**

```tsx
import { Select } from '@easbot/ui';
```

## 基础用法

```tsx
import { Select } from '@easbot/ui';

const options = [
  { label: '设计部', value: 'design' },
  { label: '研发部', value: 'rd' },
  { label: '市场部', value: 'market' },
];

export default function App() {
  return <Select options={options} placeholder="请选择部门" />;
}
```

多选与搜索：

```tsx
import { useState } from 'react';
import { Select } from '@easbot/ui';

const options = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
];

export default function App() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <Select
      options={options}
      value={value}
      onChange={(next) => setValue(next as string[])}
      multiple
      searchable
    />
  );
}
```

## 变体

### variant（状态变体）

| 取值      | 说明                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `default` | 默认样式，使用 `--form-input-*` 变量                                    |
| `error`   | 错误态，红色边框与焦点环（`border-destructive focus:ring-destructive`） |
| `success` | 成功态，绿色边框与焦点环（`border-success focus:ring-success`）         |

### size（尺寸变体）

| 取值      | 说明                             |
| --------- | -------------------------------- |
| `sm`      | 小号，`h-8 px-2 py-1 text-xs`    |
| `default` | 默认，`h-10 px-3 py-2 text-sm`   |
| `lg`      | 大号，`h-12 px-4 py-3 text-base` |

## 属性

| 属性          | 类型                                  | 默认值      | 说明                                           |
| ------------- | ------------------------------------- | ----------- | ---------------------------------------------- |
| `options`     | `(SelectOption \| SelectGroup)[]`     | —           | 选项列表（必填），可传扁平选项或分组对象       |
| `value`       | `string \| string[]`                  | —           | 当前选中值，仅在首次渲染时用于初始化内部状态   |
| `onChange`    | `(value: string \| string[]) => void` | —           | 值变化回调：单选传 `string`，多选传 `string[]` |
| `placeholder` | `string`                              | `'请选择'`  | 占位文本                                       |
| `disabled`    | `boolean`                             | `false`     | 禁用状态                                       |
| `loading`     | `boolean`                             | `false`     | 加载状态（显示旋转图标并禁用触发器）           |
| `multiple`    | `boolean`                             | `false`     | 是否多选                                       |
| `searchable`  | `boolean`                             | `false`     | 是否可搜索（在弹出层顶部渲染搜索框）           |
| `onSearch`    | `(value: string) => void`             | —           | 搜索回调（内部同时做本地过滤）                 |
| `label`       | `string`                              | —           | 标签文本                                       |
| `description` | `string`                              | —           | 描述文本                                       |
| `error`       | `string`                              | —           | 错误信息                                       |
| `variant`     | `'default' \| 'error' \| 'success'`   | `'default'` | 状态变体，由 `cva` 定义                        |
| `size`        | `'sm' \| 'default' \| 'lg'`           | `'default'` | 尺寸变体，由 `cva` 定义                        |
| `className`   | `string`                              | —           | 自定义类名                                     |

本表只列组件自有属性；此外还透传 `<button>` 的全部原生属性（如 `id` / `type` / `name` / `aria-*` / `data-*` / `on*` 事件），注意 `value` 与 `onChange` 已被组件重定义。

### 数据结构

| 类型           | 字段                      | 说明             |
| -------------- | ------------------------- | ---------------- |
| `SelectOption` | `label: string`           | 选项显示文本     |
| `SelectOption` | `value: string`           | 选项值           |
| `SelectOption` | `disabled?: boolean`      | 是否禁用该选项   |
| `SelectGroup`  | `label: string`           | 分组标题         |
| `SelectGroup`  | `options: SelectOption[]` | 分组下的选项列表 |

## 无障碍

- 触发器渲染为原生 `<button role="combobox">`，带 `aria-controls`（指向列表 `id`）、`aria-expanded`（展开状态）、`aria-invalid`（存在 `error` 时为 `true`）。
- 弹出层的选项列表容器渲染为 `role="listbox"`，多选时附加 `aria-multiselectable="true"`。
- 每个选项渲染为 `role="option"`，带 `aria-selected`（是否选中）与 `aria-disabled`（是否禁用）。
- 键盘可达性：选项可获得焦点（`tabIndex={0}`，禁用项为 `-1`），按下 `Enter` 或 `Space` 选中该项。
- 禁用选项附加 `pointer-events-none` 与降透明度，鼠标无法点击。
- 加载态与禁用态下触发器使用原生 `disabled` 属性。
- **标签关联**：内部 `label` 元素通过 `htmlFor={id}` 关联触发器，`id` 由 `React.useId()` 自动生成。

## 主题变量

| 变量                                  | 说明                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `--form-input-border`                 | 触发器边框色                                                           |
| `--form-input-radius`                 | 触发器圆角                                                             |
| `--form-input-bg`                     | 触发器背景色                                                           |
| `--form-input-text`                   | 触发器文字色                                                           |
| `--form-input-placeholder`            | 触发器占位符文字色                                                     |
| `--form-input-focus-border`           | 触发器 focus 边框色                                                    |
| `--form-input-focus-bg`               | 触发器 focus 背景色                                                    |
| `--form-input-focus-text`             | 触发器 focus 文字色                                                    |
| `--form-input-hover-border`           | 触发器 hover 边框色                                                    |
| `--form-input-hover-bg`               | 触发器 hover 背景色                                                    |
| `--select-placeholder-color`          | 未选中时占位文本颜色                                                   |
| `--select-group-label-color`          | 分组标题颜色                                                           |
| `--select-option-height`              | 选项行高度                                                             |
| `--select-option-padding-x`           | 选项行水平内边距                                                       |
| `--select-option-padding-y`           | 选项行垂直内边距                                                       |
| `--select-option-hover-background`    | 选项 hover 背景色                                                      |
| `--select-option-hover-foreground`    | 选项 hover 文字色                                                      |
| `--select-option-selected-background` | 选中选项背景色（也用于多选标签）                                       |
| `--select-option-selected-foreground` | 选中选项文字色                                                         |
| `--select-option-disabled-opacity`    | 禁用选项透明度                                                         |
| `--select-dropdown-background`        | 弹出层背景色                                                           |
| `--select-dropdown-border-color`      | 弹出层边框色                                                           |
| `--select-dropdown-shadow`            | 弹出层阴影                                                             |
| `--select-dropdown-max-height`        | 选项列表最大高度                                                       |
| `--select-search-height`              | 搜索框高度                                                             |
| `--select-search-background`          | 搜索区域背景色                                                         |
| `--select-search-border-color`        | 搜索区域边框色                                                         |
| `--select-search-border-width`        | 搜索区域边框宽度                                                       |
| `--select-search-placeholder-color`   | 搜索框占位符颜色                                                       |
| `--select-search-icon-color`          | 搜索图标颜色                                                           |
| `--select-icon-size`                  | 搜索图标尺寸                                                           |
| `--select-empty-text-color`           | 「无匹配结果」文本颜色                                                 |
| `--scroll-bar-thumb-color`            | 列表滚动条滑块颜色                                                     |
| `--radix-popover-trigger-width`       | 弹出层宽度跟随触发器（**由 Radix Popper 运行时注入**，非主题文件定义） |

> 错误 / 成功边框色分别使用 Tailwind 语义类 `border-destructive` 与 `border-success`，对应 `--destructive` 与 `--success`；描述文本使用 `text-muted-foreground`（`--muted-foreground`）。

## 组合用法 / 注意事项

- **`value` 只在初始化时生效**：内部 `selectedValues` 由 `useState` 的初始值函数从 `value` 计算，后续修改 `value` 不会同步到内部状态。需要在外部改变选中值时，请改用 `onChange` 驱动自身状态并配合 `key` 强制重挂载。
- **`onChange` 的类型随 `multiple` 变化**：单选传 `string`（未选中任何项时传空字符串 `''`），多选传 `string[]`，使用 TypeScript 时需做类型断言。
- **搜索是本地过滤 + 外部回调**：`onSearch` 用于把关键词交给服务端过滤，但组件内部**同时**按 `label` 做了一次本地过滤（大小写不敏感）；服务端返回前，本地过滤结果仍会生效。
- **多选标签的删除按钮**：`X` 图标点击会调用 `handleSelect` 移除该值，并 `stopPropagation` 阻止触发弹层开关。
- **弹层按需渲染**：只有 `open` 为 `true` 时才渲染 `PopoverContent` 与选项列表。
- **`disabled` 与 `loading` 合并生效**：触发器的 `disabled` 为 `disabled || loading`。
- **加载态不显示已选值**：加载时触发器只渲染旋转的 `Loader2` 图标。

## 导出

| 导出名          | 类型                                | 说明                                    |
| --------------- | ----------------------------------- | --------------------------------------- |
| `Select`        | `React.ForwardRefExoticComponent`   | 下拉选择组件，ref 指向触发器 `<button>` |
| `SelectProps`   | `interface`                         | 下拉选择属性接口                        |
| `SelectOption`  | `interface`                         | 单个选项数据结构                        |
| `SelectGroup`   | `interface`                         | 分组数据结构                            |
| `SelectVariant` | `'default' \| 'error' \| 'success'` | 状态变体类型                            |
| `SelectSize`    | `'sm' \| 'default' \| 'lg'`         | 尺寸变体类型                            |
