# Label 表单标签

> 表单字段的文本标签，基于 Radix Label 实现，支持必填标记、禁用态与 `htmlFor` 关联。

**导入**

```tsx
import { Label } from '@easbot/ui';
```

## 基础用法

```tsx
import { Input, Label } from '@easbot/ui';

export default function App() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="username">用户名</Label>
      <Input id="username" placeholder="请输入用户名" />
    </div>
  );
}
```

必填标记与禁用态：

```tsx
import { Label } from '@easbot/ui';

export default function App() {
  return (
    <>
      <Label required>邮箱</Label>
      <Label disabled>已停用的字段</Label>
    </>
  );
}
```

## 变体

`Label` 没有 `cva` 变体维度，样式由固定类名 + 状态类名决定：

| 状态            | 说明                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------- |
| 默认            | `text-sm font-medium leading-none text-[var(--label-text)]`                                       |
| `peer-disabled` | 通过相邻兄弟选择器 `peer-disabled:` 降低透明度并禁用光标                                          |
| `disabled`      | 组件自身 `disabled` 为 `true` 时追加 `opacity-50 cursor-not-allowed text-[var(--label-disabled)]` |
| `required`      | 在 children 后追加 `*` 标记（`aria-hidden="true"`）                                               |

## 属性

| 属性        | 类型              | 默认值  | 说明                                    |
| ----------- | ----------------- | ------- | --------------------------------------- |
| `required`  | `boolean`         | `false` | 是否必填标记（渲染 `*`，`aria-hidden`） |
| `disabled`  | `boolean`         | `false` | 禁用状态，同时输出 `data-disabled` 属性 |
| `className` | `string`          | —       | 自定义类名                              |
| `children`  | `React.ReactNode` | —       | 标签文本内容                            |
| `htmlFor`   | `string`          | —       | 关联的表单控件 `id`                     |

本表只列组件自有属性；此外还透传 Radix `Label.Root` 的全部原生属性，如 `id` / `form` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- 基于 Radix `Label.Root` 渲染为原生 `<label>`，点击标签文本会聚焦 / 激活关联的表单控件（需通过 `htmlFor` 或包裹控件建立关联）。
- 必填标记 `*` 标记了 `aria-hidden="true"`，不会被屏幕阅读器朗读；如需朗读「必填」，请自行在可见文本中补充说明。
- 禁用态输出 `data-disabled` 属性，便于外部通过 CSS 属性选择器定制样式。
- `peer-disabled:` 变体用于「控件禁用、标签独立」的布局：把 `peer` 类加到关联控件上，标签会自动降低透明度并禁用光标。

## 主题变量

| 变量               | 说明           |
| ------------------ | -------------- |
| `--label-text`     | 标签默认文字色 |
| `--label-disabled` | 禁用态文字色   |

## 组合用法 / 注意事项

- **`disabled` 只是视觉状态**：组件不会阻止点击标签去聚焦控件，若要真正禁用请同时设置关联控件的 `disabled`。
- **`required` 与原生 `required` 不同**：`required` 属性仅渲染视觉标记，不设置 HTML `required` 属性，也不参与表单校验。
- **`className` 合并到末位**：自定义类名优先级最高，可覆盖默认文字色与字号。
- **与 `Form` 组合**：`FormLabel` 内部复用 `Label`，会自动注入 `htmlFor={formItemId}`，在 `FormItem` 内使用 `FormLabel` 可省去手动关联。

## 导出

| 导出名       | 类型                              | 说明                                                  |
| ------------ | --------------------------------- | ----------------------------------------------------- |
| `Label`      | `React.ForwardRefExoticComponent` | 表单标签组件，ref 指向 `<label>` 元素                 |
| `LabelProps` | `type`                            | 直接复用 `@radix-ui/react-label` 的 `LabelProps` 类型 |
