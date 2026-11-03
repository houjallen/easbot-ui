# 快速开始

> 安装 `@easbot/ui`、引入样式、在 React / Next.js 中使用。

---

## 安装

```bash
npm install @easbot/ui
# 或
pnpm add @easbot/ui
# 或
yarn add @easbot/ui
```

### 环境要求

| 依赖        | 版本    | 说明                             |
| ----------- | ------- | -------------------------------- |
| `react`     | `>= 19` | `peerDependency`，由宿主项目提供 |
| `react-dom` | `>= 19` | `peerDependency`，由宿主项目提供 |

> Radix UI primitives（22 个 `@radix-ui/react-*`）以 **optional peerDependency** 声明。
> 只用到哪个组件，就只需安装对应的 Radix 包；全部安装也可以。

```bash
# 只用 Button（内部不依赖任何 Radix 包）—— 无需额外安装
# 用 Dialog —— 安装对应的 Radix 包
pnpm add @radix-ui/react-dialog
```

---

## 样式引入（必须）

```tsx
import '@easbot/ui/styles.css';
```

组件样式在**组件库构建期**已由 Tailwind v4 全量编译为 `dist/styles.css`（纯 CSS）。
消费方**无需**安装 Tailwind，**无需**配置 `content` 路径。

### 引入位置

| 框架                 | 位置             | 说明                     |
| -------------------- | ---------------- | ------------------------ |
| Vite / CRA           | 应用入口文件     | `main.tsx` / `index.tsx` |
| Next.js App Router   | `app/layout.tsx` | 根布局                   |
| Next.js Pages Router | `pages/_app.tsx` | 自定义 `_app`            |
| Remix                | `root.tsx`       | 根文档                   |
| Astro                | 布局组件         | 引入一次即可             |

### Next.js App Router 示例

```tsx
// app/layout.tsx
import '@easbot/ui/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
```

---

## 第一个组件

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@easbot/ui';
import '@easbot/ui/styles.css';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>标题</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">点击</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 主题切换

组件颜色全部由 CSS 变量驱动，通过 `<html>` 上的 `data-theme` 属性切换，**无需重新构建**：

```tsx
// 亮色（默认）
<html data-theme="light" />

// 暗色
<html data-theme="dark" />
```

```tsx
// 运行时切换
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return <Button onClick={toggle}>切换到{theme === 'light' ? '暗色' : '亮色'}</Button>;
}
```

> ⚠️ **不要**使用 Tailwind 默认的 `dark:` 变体做主题切换 ——
> 本库已通过 `@custom-variant dark` 把 `dark:` 重定向到 `[data-theme='dark']`，
> 与主题文件的选择器约定一致。详见 [主题定制](./theming.md)。

---

## 表单集成

`Form` 组件基于 [`react-hook-form`](https://react-hook-form.com/)：

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const schema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符'),
});

export function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '' },
  });

  return (
    <Form {...form}>
      <FormField
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>用户名</FormLabel>
            <FormControl>
              <Input placeholder="请输入用户名" {...field} />
            </FormControl>
            <FormDescription>这是公开显示的名称</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">提交</Button>
    </Form>
  );
}
```

---

## TypeScript

组件库自带完整类型声明（`dist/index.d.ts`），**无需**额外安装 `@types`：

```tsx
import type { ButtonProps, DialogContentProps, ToastProps } from '@easbot/ui';
```

所有 `Props` 接口都从包根导出，命名规则为 `<Component>Props`。

---

## 常见问题

### 样式不生效？

1. 确认**已引入** `@easbot/ui/styles.css`；
2. 确认引入在**应用根布局/入口**（不要放在单个组件里）；
3. 检查是否被消费方自己的 CSS 覆盖 —— 本库样式使用 CSS 变量，
   可通过覆盖变量解决，而非覆盖类名。详见 [主题定制](./theming.md#覆盖主题变量)。

### 组件报「找不到模块」？

本库把 Radix primitives 声明为 **optional peerDependency**。
若你使用了 `Dialog` 但没装 `@radix-ui/react-dialog`，会报模块缺失。
按需安装即可：

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-avatar @radix-ui/react-tooltip
```

### 支持 React 18 吗？

不支持。`peerDependencies` 要求 `react >= 19`，因为本库使用了 React 19 的相关特性。

---

## 下一步

- 逐个组件的完整属性表 → [组件文档索引](./README.md#组件清单34-个)
- 定制颜色 / 圆角 / 尺寸 → [主题定制](./theming.md)
- 交互式在线预览 → [Storybook](https://houjallen.github.io/easbot-ui/)
