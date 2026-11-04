# Edit 数据编辑器

> 三种面向结构化数据的编辑器：`EnumEditor`（枚举）、`ListEditor`（列表）、`ObjectEditor`（对象）。

---

**导入**

```tsx
import { EnumEditor, ListEditor, ObjectEditor } from '@easbot/ui';
```

## 基础用法

枚举编辑器（单选）：

```tsx
import { useState } from 'react';
import { EnumEditor } from '@easbot/ui';

export default function App() {
  const [value, setValue] = useState<string | number | undefined>(undefined);

  return (
    <EnumEditor
      value={value}
      onChange={(val) => setValue(val as string | number | undefined)}
      options={[
        { label: '选项 1', value: 'option1' },
        { label: '选项 2', value: 'option2', disabled: true },
      ]}
      placeholder="请选择一个选项"
    />
  );
}
```

枚举编辑器（多选，限制数量）：

```tsx
const [values, setValues] = useState<string[]>([]);

<EnumEditor
  multiple
  maxCount={3}
  value={values}
  onChange={(val) => setValues(val as string[])}
  options={options}
  placeholder="最多选择 3 个"
/>;
```

列表编辑器：

```tsx
import { useState } from 'react';
import { ListEditor } from '@easbot/ui';

export default function App() {
  const [value, setValue] = useState<any[]>(['项目 1', '项目 2']);

  return (
    <ListEditor
      value={value}
      onChange={(val) => setValue(val as any[])}
      itemType="string"
      sortable
      minItems={1}
      maxItems={5}
      addButtonText="添加项目"
    />
  );
}
```

对象编辑器：

```tsx
import { useState } from 'react';
import { ObjectEditor } from '@easbot/ui';

export default function App() {
  const [value, setValue] = useState<Record<string, any>>({ name: '张三', age: 25 });

  return (
    <ObjectEditor
      value={value}
      onChange={(val) => setValue(val as Record<string, any>)}
      keyPlaceholder="属性名"
      valuePlaceholder="属性值"
      predefinedKeys={['username', 'email']}
      addButtonText="添加属性"
    />
  );
}
```

## 属性

| 属性           | 类型                                                        | 默认值 | 说明                     |
| -------------- | ----------------------------------------------------------- | ------ | ------------------------ |
| `value?`       | `string \| number \| (string \| number)[]`                  | —      | 当前值                   |
| `onChange`     | `(value: string \| number \| (string \| number)[]) => void` | —      | 值变更回调               |
| `options`      | `EnumOption[]`                                              | —      | 选项列表                 |
| `multiple?`    | `boolean`                                                   | —      | 是否多选                 |
| `placeholder?` | `string`                                                    | —      | 占位符                   |
| `disabled?`    | `boolean`                                                   | —      | 是否禁用                 |
| `readOnly?`    | `boolean`                                                   | —      | 是否只读                 |
| `className?`   | `string`                                                    | —      | 自定义样式类名           |
| `searchable?`  | `boolean`                                                   | —      | 是否可搜索               |
| `maxCount?`    | `number`                                                    | —      | 最大选择数量（多选模式） |

## 属性（ListEditorProps）

| 属性                   | 类型                                                                                                          | 默认值 | 说明                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| `value?`               | `any[]`                                                                                                       | —      | 当前值                                             |
| `onChange`             | `(value: any[]) => void`                                                                                      | —      | 值变更回调                                         |
| `name?`                | `string`                                                                                                      | —      | 字段名（用于表单场景，即使暂不使用也需按规范接收） |
| `itemType?`            | `'string' \| 'number' \| 'object'`                                                                            | —      | 列表项类型                                         |
| `placeholder?`         | `string`                                                                                                      | —      | 占位符                                             |
| `disabled?`            | `boolean`                                                                                                     | —      | 是否禁用                                           |
| `readOnly?`            | `boolean`                                                                                                     | —      | 是否只读                                           |
| `className?`           | `string`                                                                                                      | —      | 自定义样式类名                                     |
| `maxItems?`            | `number`                                                                                                      | —      | 最大项目数量                                       |
| `minItems?`            | `number`                                                                                                      | —      | 最小项目数量                                       |
| `sortable?`            | `boolean`                                                                                                     | —      | 是否支持排序                                       |
| `addButtonText?`       | `string`                                                                                                      | —      | 添加按钮文本                                       |
| `itemRenderer?`        | `(item: ListItem, index: number, onUpdate: (newValue: any) => void, onRemove: () => void) => React.ReactNode` | —      | 自定义项目渲染器                                   |
| `popoverContentStyle?` | `React.CSSProperties`                                                                                         | —      | 弹层内容的自定义样式                               |
| `locale?`              | `string`                                                                                                      | —      | 语言环境                                           |

## 属性（ObjectEditorProps）

| 属性                   | 类型                                   | 默认值 | 说明                                               |
| ---------------------- | -------------------------------------- | ------ | -------------------------------------------------- |
| `value?`               | `Record<string, any>`                  | —      | 当前值                                             |
| `onChange`             | `(value: Record<string, any>) => void` | —      | 值变更回调                                         |
| `name?`                | `string`                               | —      | 字段名（用于表单场景，即使暂不使用也需按规范接收） |
| `keyPlaceholder?`      | `string`                               | —      | 占位符                                             |
| `valuePlaceholder?`    | `string`                               | —      | —                                                  |
| `disabled?`            | `boolean`                              | —      | 是否禁用                                           |
| `readOnly?`            | `boolean`                              | —      | 是否只读                                           |
| `className?`           | `string`                               | —      | 自定义样式类名                                     |
| `maxProperties?`       | `number`                               | —      | 最大属性数量                                       |
| `minProperties?`       | `number`                               | —      | 最小属性数量                                       |
| `addButtonText?`       | `string`                               | —      | 添加按钮文本                                       |
| `predefinedKeys?`      | `string[]`                             | —      | 预定义的键列表                                     |
| `popoverContentStyle?` | `React.CSSProperties`                  | —      | 弹层内容的自定义样式                               |
| `locale?`              | `string`                               | —      | 语言环境                                           |
| `schema?`              | `any`                                  | —      | 结构化 schema（保留以便上层透传，即使当前未使用）  |

三个编辑器都是**完全受控**组件：`value` 与 `onChange` 必配（`EnumEditorProps.onChange` / `ListEditorProps.onChange` / `ObjectEditorProps.onChange` 均为必填），组件自身不持有业务值。

## 无障碍

- `ListEditor` / `ObjectEditor` 都用 `PopoverTrigger asChild` 包裹触发器容器，因此 **Popover 的触发语义落在外层 `<div>` 上**（带 `aria-haspopup="dialog"` / `aria-expanded` / `data-state`）；真正可聚焦、可读的是内部的 `readOnly` 原生 `<input>`，点击它会打开弹层（`disabled` 时不打开）。
- 弹层内容由 `PopoverContent` 渲染（`role="dialog"`，打开时焦点移入内容区并锁定，`Esc` 关闭，关闭后焦点归还触发器）。
- 列表 / 对象编辑器弹层内的每一项是原生 `<input>`（可聚焦、可输入），删除按钮是原生 `<button>`（`Button` 组件渲染的图标按钮形态）。
- `ListEditor` / `ObjectEditor` 的删除按钮使用 `Button` 组件渲染 —— `Button` 会注入 `role="button"`；其 `rightIcon` 传的是本库 `Icon` 组件，因此图标**不会**被 `Button` 标记为 `aria-hidden`（`Button` 只对非 `Icon` 元素加 `aria-hidden`），但图标本身不含可读文本。
- `ListEditor` / `ObjectEditor` 的「添加」按钮文本来自内置文案（zh-CN「添加项目」/「添加属性」，en-US `Add item` / `Add property`），弹层底部的「确定」按钮同理（zh-CN「确定」/ en-US `Confirm`）。
- 触发器 `Input` 的后缀是一个 `function` 图标（`Icon` 组件），不含可读文本 —— 语义由 `Input` 的可读值 / 占位符承担。
- `EnumEditor` 内部是 `Combobox`：触发器为原生 `<button type="button">`，并注入 `role="combobox"` / `aria-expanded` / `aria-controls` / `aria-haspopup="dialog"`；选项列表由 cmdk 渲染，使用 `role="listbox"` / `role="option"` 语义。
- 三个组件都**不注入** `aria-label` / `aria-describedby` —— 表单场景请在外层用 `<Label>` 或 `aria-label` 关联。

## 注意事项

- **`src/ui` 层是独立实现**：`edit/` 目录下的三个编辑器**不是**设计系统层的 re-export，而是本库自有实现（依赖 `Combobox` / `Input` / `Button` / `Popover` / `Icon`）。
- **`EnumEditor` 基于 `Combobox`**：`options` 会被强制转成 `Combobox` 的选项格式（`options as any`），`multiple` / `searchable` / `placeholder` / `disabled` 直接透传。
- **`EnumEditor` 会归一化 `value` 的形状**：多选时把标量转成数组，单选时把数组取首项 —— 因此 `value` 的类型（标量 / 数组）与 `multiple` 不一致时也能正常工作。
- **`EnumEditor` 的 `readOnly` 等价于 `disabled`**：内部传 `disabled={disabled || readOnly}`，只读态下无法打开下拉。
- **`EnumEditor` 的 `maxCount` 只在多选生效**：新增选择后若数组长度超过 `maxCount`，**直接 return 且不触发 `onChange`** —— 超限时用户的选择被静默丢弃，界面也不会给出提示，请自行在外部做校验反馈。
- **`EnumOption.description` 当前不会被渲染**：`Combobox` 的选项结构只消费 `label` / `value` / `disabled`，`description` 字段虽在类型中声明但不会出现在界面上。
- **`EnumEditor` 的 `className` 合并到末位**（`w-full` + 自定义类名），自定义类名优先级最高。
- **`ListEditor` 的 `itemType` 决定新增项的初始值**：`string` → `''`，`number` → `0`，`object` → `{}`。
- **`ListEditor` 的 `itemType="object"` 用 JSON 文本编辑**：输入框显示 `JSON.stringify(item.value)`，解析失败时**静默忽略**（保持原值），因此编辑过程中的中间态字符串不会写回。
- **`ListEditor` 的 `sortable` 依赖 HTML5 拖拽**：使用 `draggable` + `onDragStart` / `onDragOver` / `onDrop` 实现；**无障碍性较弱**（键盘用户无法拖拽排序），需键盘排序请自行通过 `itemRenderer` 实现。
- **`ListEditor` 的拖拽在 `disabled` / `readOnly` 下被禁用**：此时不渲染拖拽手柄（`grip-vertical` 图标），项目也不带 `draggable`。
- **`ListEditor` 的显示值有截断规则**：前 3 项以逗号连接展示，超过 3 项追加 `... (N 项)`；`itemType="object"` 时只显示「N 个属性」。
- **`ListEditor` 的 `minItems` 阻止删除**：`items.length <= minItems` 时删除按钮不渲染，`handleRemove` 也会直接 return。
- **`ListEditor` 的 `maxItems` 阻止新增**：达到上限后「添加」按钮不再渲染。
- **`ListEditor` 的 `name` 传给触发器 `Input`**：用于表单场景的原生表单提交；`itemType` 之外没有其它字段名语义。
- **`ObjectEditor` 的键改名是「移动 + 删除」**：改键会把值搬到新键并删除旧键；若新键已存在，**旧值会覆盖新键的值**。
- **`ObjectEditor` 的新增键名会自动避让**：依次尝试 `property` / `property1` / `property2` …，跳过已存在的键。
- **`ObjectEditor` 的值会自动推断类型**：先尝试数字，再尝试布尔（`true` / `false`，大小写不敏感），再尝试 `{...}` / `[...]` 开头的 JSON，否则按字符串处理。
- **`ObjectEditor` 的 `predefinedKeys` 使用 `<datalist>` 实现**：datalist 的 `id` 固定为 `predefined-keys` —— **同一页面放多个 `ObjectEditor` 且都传了 `predefinedKeys` 时会冲突**（浏览器行为未定义）。
- **`ObjectEditor` 的 `schema` 当前未被使用**：源码注释说明是「保留以便上层透传」，传入不会产生任何效果。
- **`ListEditor` / `ObjectEditor` 的 `locale` 默认是 `'zh-CN'`**：不传 `locale` 时不会跟随 `LocaleProvider`，始终使用内置中文文案；需要跟随全局语言请显式传入。
- **`ListEditor` / `ObjectEditor` 的弹层内容高度上限 `max-h-80`**（约 320px），超出后内部滚动。
- **`ListEditor` / `ObjectEditor` 的 `popoverContentStyle` 直接写到 `PopoverContent` 的 `style`**：可用于覆盖弹层的宽度等。
- **三个组件都不消费本库的主题 CSS 变量。**

## 导出

### 组件

| 导出名              | 说明 |
| ------------------- | ---- |
| `EnumEditor`        |      |
| `EnumEditorProps`   |      |
| `EnumOption`        |      |
| `ListEditor`        |      |
| `ListEditorProps`   |      |
| `ListItem`          |      |
| `ObjectEditor`      |      |
| `ObjectEditorProps` |      |
| `ObjectProperty`    |      |
