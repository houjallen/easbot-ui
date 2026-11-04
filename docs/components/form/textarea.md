# Textarea 多行输入

> 多行文本输入控件，随内容自动调整高度，支持错误态 / 成功态与长度限制。

---

**导入**

```tsx
import { Textarea } from '@easbot/ui';
```

## 基础用法

```tsx
import { Textarea } from '@easbot/ui';

export default function App() {
  return <Textarea placeholder="请输入内容..." />;
}
```

配合标签与描述：

```tsx
import { Label, Textarea } from '@easbot/ui';

export default function App() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">消息</Label>
      <Textarea id="message" placeholder="请输入您的消息..." />
      <p className="text-muted-foreground text-sm">您可以 @提及 其他用户和组织。</p>
    </div>
  );
}
```

限制最大长度：

```tsx
<Textarea maxLength={100} placeholder="最多输入100字..." />
```

## 属性

继承自 `React.ComponentProps<typeof DsTextarea>`。

| 属性       | 类型      | 默认值 | 说明                       |
| ---------- | --------- | ------ | -------------------------- |
| `error?`   | `boolean` | —      | 错误状态，边框高亮为错误色 |
| `success?` | `boolean` | —      | 成功状态，边框高亮为成功色 |

`TextareaProps` 为 `EunTextareaProps` 的别名。本表只列组件自有属性（`error` / `success`）；此外还透传 `<textarea>` 的全部原生属性（`id` / `name` / `value` / `defaultValue` / `placeholder` / `rows` / `required` / `readOnly` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- `error` 为真时注入 `aria-invalid="true"`，屏幕阅读器会播报「无效」；未开启错误态时**不渲染**该属性。
- 禁用态使用原生 `disabled`，元素不可聚焦、不可编辑。
- 焦点样式使用 `focus-visible:border-ring` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。
- 高度自适应由 CSS `field-sizing-content` 实现，不改变 DOM 结构，屏幕阅读器读取到的仍是普通 `<textarea>`。

## 注意事项

- **状态优先级**：`error > success > 默认`。同时传 `error` 与 `success` 时按错误态渲染。
- **自动高度依赖浏览器支持**：底层样式使用 `field-sizing-content`（Chrome / Edge 123+ 等原生支持），不支持的浏览器需自行通过 `className` 设定固定高度或 `max-h`。
- **最小高度为 `min-h-16`**：内容少时也保留约 4rem 高度。
- **默认字号随断点变化**：`text-base` → `md:text-sm`。
- **无独立的 `variant` / `size` 变体**：状态只有 `error` / `success` 两个布尔开关。
- **历史实现已移除**：源码注释明确 —— 早期的自定义 `autoSize` JS 逻辑、`ScrollAreaPrimitive` 包裹与 `cva` 变体均已移除，改由设计系统层统一处理。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--destructive`
- `--success`

## 导出

### 组件

| 导出名          | 说明 |
| --------------- | ---- |
| `Textarea`      |      |
| `TextareaProps` |      |
