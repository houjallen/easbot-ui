# Form 表单容器

> 基于 react-hook-form 的表单容器，提供字段绑定、错误提示与无障碍关联。

---

**导入**

```tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { useForm } from 'react-hook-form';
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@easbot/ui';

export default function App() {
  const form = useForm({ defaultValues: { username: '' } });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => console.log(values))} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder="请输入用户名" {...field} />
              </FormControl>
              <FormDescription>请输入您的用户名</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">登录</Button>
      </form>
    </Form>
  );
}
```

## 组成部分

- **`Form`** —— `react-hook-form` 的 `FormProvider` 别名，把表单方法下发到子树。
- **`FormField`** —— 基于 `Controller` 的字段包装器，提供 `name` 上下文与 `render` 回调。
- **`FormItem`** —— 单个字段的布局容器（`grid gap-2`），内部生成唯一 `id`。
- **`FormLabel`** —— 字段标签，自动关联到控件 `id`，有错误时变红。
- **`FormControl`** —— 字段控件包装器（Radix `Slot`），自动注入 `id` 与 `aria-describedby`。
- **`FormDescription`** —— 字段说明文案。
- **`FormMessage`** —— 字段错误文案，无错误时不渲染。
- **`useFormField`** —— 在字段内部读取当前字段状态（**必须在 `<FormField>` 内使用**）。
- **`useOptionalFormField`** —— 同上，但不抛异常；不在表单内时返回 `undefined`。

## 无障碍

- `FormControl` 自动为控件注入 `id`（形如 `<formItemId>-form-item`），`FormLabel` 通过该 `id` 建立 `htmlFor` 关联 —— 点击标签即可聚焦控件。
- `FormControl` 自动注入 `aria-describedby`：无错误时指向说明文案（`<id>-form-item-description`），有错误时同时指向说明文案与错误文案（`<id>-form-item-message`）。
- `FormControl` 在有错误时注入 `aria-invalid="true"`，屏幕阅读器会播报「无效」。
- `FormLabel` 在有错误时附加 `data-error="true"`，样式变为 `text-destructive`。
- `FormMessage` 无错误内容时返回 `null`，不会在 DOM 中留下空节点。

## 注意事项

- **`useFormField` 会在字段外抛错**：不在 `<FormField>` 内使用时抛出 `useFormField should be used within <FormField>`。
- **`useOptionalFormField` 是安全版本**：不在 `<Form>` / `<FormField>` 内时返回 `undefined`（不抛异常）。源码注释特别说明 —— **不能用 `try/catch` 包裹 `useFormField` 实现同等效果**，那会让 Hook 处于条件调用状态，违反 React Hooks 调用顺序规则。
- **`useOptionalFormField` 用 `getFieldState` 单参数形式**：源码注释说明这样无需 `useFormState`（后者在没有 `control` 时会抛异常）。
- **`FormControl` 使用 Radix `Slot`**：只接受**单个**可接收 `id` / `aria-*` 属性的元素作为子节点；传入普通 `<div>` 也能工作但语义不正确。
- **`FormMessage` 优先显示校验错误**：`body = error ? String(error?.message ?? '') : props.children` —— 有校验错误时传入的 `children` 会被忽略。
- **`Form` 是 `FormProvider` 别名**：`src/ui/form` 是对设计系统层的纯 re-export，API / 类型 / 样式与 `react-hook-form` 完全一致。
- **校验方案由消费方决定**：组件不内置校验规则，可配合 `zodResolver` 等使用（`@hookform/resolvers` 为 devDependency，需消费方自行安装）。

## 导出

### 组件

| 导出名            | 说明 |
| ----------------- | ---- |
| `Form`            |      |
| `FormControl`     |      |
| `FormDescription` |      |
| `FormField`       |      |
| `FormItem`        |      |
| `FormLabel`       |      |
| `FormMessage`     |      |

### 类型与工具函数

| 导出名                 | 说明 |
| ---------------------- | ---- |
| `useFormField`         |      |
| `useOptionalFormField` |      |
