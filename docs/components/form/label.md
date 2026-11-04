# Label 表单标签

> 表单元素的文本标签，支持必填星号标记与禁用态。

---

**导入**

```tsx
import { Label } from '@easbot/ui';
```

## 基础用法

```tsx
import { Input, Label } from '@easbot/ui';

export default function App() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">邮箱</Label>
      <Input type="email" id="email" placeholder="请输入邮箱" />
    </div>
  );
}
```

必填标记与禁用态：

```tsx
<Label htmlFor="username" required>
  用户名
</Label>

<Label htmlFor="disabled-input" disabled>
  禁用标签
</Label>
```

`LabelProps` 为 `EunLabelProps` 的别名。本表只列组件自有属性（`required` / `disabled`）；此外还透传 `<label>` 的全部原生属性（`htmlFor` / `id` / `children` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 基于 Radix `LabelPrimitive.Root`，渲染为语义化 `<label>` 元素；点击标签会把焦点移交给 `htmlFor` 指向的表单控件。
- 必填星号渲染为 `<span aria-hidden="true">*</span>`，是**纯装饰** —— 状态由关联控件的 `required` / `aria-required` 表达，屏幕阅读器不会重复播报。
- `disabled` 时只输出 `data-disabled`，并附加 `cursor-not-allowed opacity-50`。
- 关联控件被禁用时（`peer-disabled:`）标签自动变为禁用观感；父级 `fieldset` 禁用时（`group-data-[disabled=true]:`）同样生效。

## 注意事项

- **`disabled` 不透传给 DOM**：该属性被组件消费并转换为 `data-disabled`（原生 `<label>` 本就没有 `disabled` 语义），不会生成非法属性。
- **`disabled` 与关联控件状态相互独立**：源码注释明确 —— 标签自身的 `disabled` 与「关联控件被禁用」「父级 Fieldset 禁用」是三条独立通路，不会互相覆盖。
- **必填星号是视觉提示**：组件只画星号，**不会**给关联控件补 `required`，需要时请自行给控件传 `required`。
- **`className` 合并到末位**，自定义类名优先级最高。

## 导出

### 组件

| 导出名       | 说明 |
| ------------ | ---- |
| `Label`      |      |
| `LabelProps` |      |
| `LabelRef`   |      |
