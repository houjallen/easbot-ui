# Form 表单

> 基于 react-hook-form 的表单容器与字段绑定体系，提供标签、控件、描述、错误提示的自动关联。

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@easbot/ui';
import { Input } from '@easbot/ui';
import { useForm } from 'react-hook-form';

export default function App() {
  const form = useForm({ defaultValues: { username: '' } });

  return (
    <Form {...form}>
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
    </Form>
  );
}
```

配合校验器使用：

```tsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@easbot/ui';
import { Input } from '@easbot/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ password: z.string().min(6, '密码至少 6 个字符') });

export default function App() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>密码</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

## 组成部分

| 组成部分          | 用途       | 说明                                                           |
| ----------------- | ---------- | -------------------------------------------------------------- |
| `Form`            | 表单根容器 | 渲染 `FormProvider` + 原生 `<form>`，向下提供表单上下文        |
| `FormField`       | 字段绑定器 | 包装 react-hook-form 的 `Controller`，把 `name` 写入字段上下文 |
| `FormItem`        | 字段容器   | 生成唯一 `id` 上下文，提供垂直 / 水平布局与密度变体            |
| `FormLabel`       | 字段标签   | 自动 `htmlFor` 关联控件，错误时显示破坏色文字                  |
| `FormControl`     | 控件包装   | 通过 Radix `Slot` 注入 `id` / `aria-*` 属性，支持加载态        |
| `FormDescription` | 字段描述   | 渲染辅助说明文本，自动生成 `id` 供 `aria-describedby` 引用     |
| `FormMessage`     | 错误消息   | 优先渲染校验错误信息，否则渲染子节点                           |

## 变体

### FormItem 的 variant（布局变体）

| 取值         | 说明                                                 |
| ------------ | ---------------------------------------------------- |
| `default`    | 默认垂直布局（`space-y-2`）                          |
| `horizontal` | 水平布局（`flex items-center gap-4 [&>div]:flex-1`） |

### FormItem 的 density（密度变体）

| 取值          | 说明                          |
| ------------- | ----------------------------- |
| `compact`     | 紧凑模式，`space-y-1`         |
| `normal`      | 常规模式（默认），`space-y-2` |
| `comfortable` | 宽松模式，`space-y-3`         |

## 属性

### Form 属性

| 属性          | 类型                                                                                 | 默认值   | 说明                                         |
| ------------- | ------------------------------------------------------------------------------------ | -------- | -------------------------------------------- |
| `touchAction` | `React.CSSProperties['touchAction']`                                                 | `'none'` | 触摸行为控制，同时写入表单上下文供子组件消费 |
| `context`     | `UseFormReturn<TFieldValues> & { touchAction?: React.CSSProperties['touchAction'] }` | —        | 上下文扩展，传入时会被合并 `touchAction`     |
| `className`   | `string`                                                                             | —        | 自定义类名（作用于内部 `<form>`）            |
| `onSubmit`    | `(e: React.FormEvent<HTMLFormElement>) => void`                                      | —        | 表单提交处理函数                             |
| `children`    | `React.ReactNode`                                                                    | —        | 子元素                                       |

此外还透传 `react-hook-form` 的 `FormProviderProps`（如 `form` / `children`）。

### FormField 属性

| 属性               | 类型                                           | 默认值 | 说明                                 |
| ------------------ | ---------------------------------------------- | ------ | ------------------------------------ |
| `control`          | `Control<TFieldValues>`                        | —      | react-hook-form 的 `control`（必填） |
| `name`             | `TName`                                        | —      | 字段名（必填）                       |
| `render`           | `(props: FieldRenderProps) => React.ReactNode` | —      | 渲染函数（必填）                     |
| `rules`            | `RegisterOptions<TFieldValues, TName>`         | —      | 校验规则                             |
| `disabled`         | `boolean`                                      | —      | 是否禁用该字段                       |
| `shouldUnregister` | `boolean`                                      | —      | 卸载时是否注销字段                   |

### FormItem 属性

| 属性        | 类型                                     | 默认值      | 说明                    |
| ----------- | ---------------------------------------- | ----------- | ----------------------- |
| `variant`   | `'default' \| 'horizontal'`              | `'default'` | 布局变体，由 `cva` 定义 |
| `density`   | `'compact' \| 'normal' \| 'comfortable'` | `'normal'`  | 密度变体，由 `cva` 定义 |
| `className` | `string`                                 | —           | 自定义类名              |

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性，如 `id` / `style` / `aria-*` / `data-*` / `on*` 事件。

### FormLabel 属性

| 属性        | 类型              | 默认值 | 说明       |
| ----------- | ----------------- | ------ | ---------- |
| `className` | `string`          | —      | 自定义类名 |
| `children`  | `React.ReactNode` | —      | 标签文本   |

`htmlFor` 会自动注入为 `formItemId`，如需覆盖可显式传入（显式传入优先级更高）。

### FormControl 属性

| 属性        | 类型              | 默认值 | 说明                                         |
| ----------- | ----------------- | ------ | -------------------------------------------- |
| `isLoading` | `boolean`         | —      | 加载状态，为 `true` 时在控件前渲染 `Spinner` |
| `children`  | `React.ReactNode` | —      | 被包装的表单控件                             |

本表只列组件自有属性；此外还透传 Radix `Slot` 的全部属性，如 `className` / `id` / `on*` 事件。

### FormDescription 属性

| 属性        | 类型              | 默认值 | 说明       |
| ----------- | ----------------- | ------ | ---------- |
| `className` | `string`          | —      | 自定义类名 |
| `children`  | `React.ReactNode` | —      | 描述文本   |

### FormMessage 属性

| 属性        | 类型              | 默认值 | 说明               |
| ----------- | ----------------- | ------ | ------------------ |
| `className` | `string`          | —      | 自定义类名         |
| `children`  | `React.ReactNode` | —      | 无错误时的兜底文案 |

## 无障碍

- **自动 id 关联**：`FormItem` 通过 `React.useId()` 生成唯一 `id`，并派生出 `formItemId`（`{id}-form-item`）、`formDescriptionId`（`{id}-form-item-description`）、`formMessageId`（`{id}-form-item-message`）。
- `FormLabel` 的 `htmlFor` 指向 `formItemId`，`FormControl` 通过 `Slot` 把 `id={formItemId}` 注入到真实控件上，点击标签即可聚焦控件。
- `FormControl` 自动注入 `aria-describedby`：无错误时指向 `formDescriptionId`；有错误时同时指向 `formDescriptionId formMessageId`。
- `FormControl` 自动注入 `aria-invalid={!!error}`，错误状态对屏幕阅读器可见。
- `FormControl` 自动注入 `aria-busy={isLoading}`，加载状态可被播报。
- `FormMessage` 在没有错误且无子节点时**不渲染**（返回 `null`），避免产生空的无障碍节点。
- `FormLabel` 在存在错误时追加 `text-destructive` 破坏色，与错误消息形成视觉呼应。

## 主题变量

| 变量                           | 说明                                           |
| ------------------------------ | ---------------------------------------------- |
| `--form-label-font-size`       | 标签字号                                       |
| `--form-label-font-weight`     | 标签字重                                       |
| `--form-label-line-height`     | 标签行高                                       |
| `--form-description-font-size` | 描述字号                                       |
| `--form-description-color`     | 描述文字色（同时用于无错误时的 `FormMessage`） |
| `--form-message-font-size`     | 消息字号                                       |
| `--form-message-font-weight`   | 消息字重                                       |
| `--form-message-error-color`   | 错误消息文字色                                 |
| `--form-message-error-bg`      | 错误消息背景色                                 |
| `--form-message-error-border`  | 错误消息边框色                                 |
| `--radius-sm`                  | 错误消息圆角                                   |

## 组合用法 / 注意事项

- **必须按 `Form → FormField → FormItem → FormControl` 顺序嵌套**：`useFormField` 依赖 `FormFieldContext`（字段名）与 `FormItemContext`（`id`），缺少 `FormField` 或 `FormItem` 会导致关联失败。
- **`Form` 已经渲染了一个 `<form>`**：若还需要自行控制提交行为，请把 `<form onSubmit={...}>` 写在 `Form` 的**内部**之前并不再额外嵌套 `<form>`；直接写两个 `<form>` 会产生非法的嵌套表单结构。
- **`FormControl` 使用 Radix `Slot`**：只能包裹**单个**能接收 `id` 与 `aria-*` 属性的原生元素（或支持 `asChild` 的组件）。包裹多个子元素或自定义组件未透传 props 时，属性注入会失效。
- **`FormMessage` 优先显示错误**：`error` 存在时渲染 `String(error.message)`，忽略 `children`；没有错误时才渲染 `children`。
- **`FormItem` 的 `id` 是自动生成的**：不要手动传 `id`，否则会与上下文派生的 `formItemId` 冲突。
- **`useFormField` 只能在 `Form` 内使用**：它调用 `useFormContext()`，脱离 `Form`（即脱离 `FormProvider`）会抛出错误。

## 导出

| 导出名                  | 类型                                                                            | 说明                         |
| ----------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| `Form`                  | `<TFieldValues>(props: FormProps<TFieldValues>) => JSX.Element`                 | 表单根容器                   |
| `FormField`             | `<TFieldValues, TName>(props: ControllerProps) => JSX.Element`                  | 字段绑定器                   |
| `FormItem`              | `React.ForwardRefExoticComponent`                                               | 字段容器，ref 指向 `<div>`   |
| `FormLabel`             | `React.ForwardRefExoticComponent`                                               | 字段标签，ref 指向 `<label>` |
| `FormControl`           | `React.ForwardRefExoticComponent`                                               | 控件包装，ref 指向被包装元素 |
| `FormDescription`       | `React.ForwardRefExoticComponent`                                               | 字段描述，ref 指向 `<p>`     |
| `FormMessage`           | `React.ForwardRefExoticComponent`                                               | 错误消息，ref 指向 `<p>`     |
| `useFormField`          | `() => FieldState & { id, name, formItemId, formDescriptionId, formMessageId }` | 读取当前字段状态的 hook      |
| `FormProps`             | `type`                                                                          | 表单根容器属性类型           |
| `FormItemProps`         | `type`                                                                          | 字段容器属性类型             |
| `FormLabelProps`        | `type`                                                                          | 字段标签属性类型             |
| `FormControlProps`      | `type`                                                                          | 控件包装属性类型             |
| `FormDescriptionProps`  | `type`                                                                          | 字段描述属性类型             |
| `FormMessageProps`      | `type`                                                                          | 错误消息属性类型             |
| `FormFieldProps`        | `type`                                                                          | 字段绑定器属性类型           |
| `FormFieldContextValue` | `type`                                                                          | 字段上下文数据类型           |
