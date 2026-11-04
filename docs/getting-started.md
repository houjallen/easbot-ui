# 快速开始

> 安装 `@easbot/ui`、引入样式、在 React / Next.js 中使用，并配置内置国际化。

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

| 依赖        | 版本      | 说明                             |
| ----------- | --------- | -------------------------------- |
| `react`     | `^19.0.0` | `peerDependency`，由宿主项目提供 |
| `react-dom` | `^19.0.0` | `peerDependency`，由宿主项目提供 |

> **Node.js**：`>= 22.22.2`　**pnpm**：`>= 10.0.0`（见 `package.json` 的 `engines`）

> Radix UI primitives（**30** 个 `@radix-ui/react-*`）以 **optional peerDependency** 声明。
> 只用到哪个组件，就只需安装对应的 Radix 包；全部安装也可以。

```bash
# 只用 Button（内部只依赖 @radix-ui/react-slot）—— 需安装 slot
pnpm add @radix-ui/react-slot

# 用 Dialog —— 安装对应的 Radix 包
pnpm add @radix-ui/react-dialog
```

### 运行时依赖

以下包是**普通依赖**（`dependencies`），安装 `@easbot/ui` 时自动装好，**无需**额外操作：

`class-variance-authority` · `clsx` · `cmdk` · `date-fns` · `dayjs` · `embla-carousel-react` · `input-otp` · `lucide-react` · `react-day-picker` · `react-hook-form` · `react-moveable` · `react-resizable-panels` · `recharts` · `sonner` · `tailwind-merge` · `vaul` · `zod`

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

### 可选的独立产物

除 `styles.css` 外，包内还提供 3 个**独立**产物，需按需显式引入：

| 产物                   | 内容                                   | 引入方式                              |
| ---------------------- | -------------------------------------- | ------------------------------------- |
| `dist/fonts.css`       | 7 个 `@font-face`（思源黑体 7 个字重） | `import '@easbot/ui/fonts.css'`       |
| `dist/iconfont.css`    | 796 个图标类的 `content` 映射          | `import '@easbot/ui/iconfont.css'`    |
| `dist/theme-light.css` | `:root[data-theme='light']` 主题变量   | `import '@easbot/ui/theme-light.css'` |
| `dist/theme-dark.css`  | `:root[data-theme='dark']` 主题变量    | `import '@easbot/ui/theme-dark.css'`  |

> ⚠️ 字体与图标字体**二进制不随 npm 包发布**，需自行放到 `public/font/` 与 `public/icon/`。
> 详见 [主题定制](./theming.md#字体opt-in)。

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

## 国际化

组件库**自带**用户可见文案的双语默认文案（zh-CN / en-US），
**不引入** `react-i18next` / `i18next` 等外部 i18n 库。语言由消费方通过 `LocaleProvider` 注入。

### 全局注入

```tsx
import { LocaleProvider } from '@easbot/ui';

export function App() {
  return <LocaleProvider locale="zh-CN">{/* ... */}</LocaleProvider>;
}
```

### 语言切换

```tsx
import { useLocale } from '@easbot/ui';

function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')}>
      {locale === 'zh-CN' ? 'Switch to English' : '切换到中文'}
    </button>
  );
}
```

`LocaleProvider` 的行为：

| 场景                 | 生效值                                                  |
| -------------------- | ------------------------------------------------------- |
| 传入 `locale`        | **受控模式**，该值优先于持久化与自动推断                |
| 未传 `locale`        | 已存语言 → `defaultLocale` → 浏览器语言推断 → `zh-CN`   |
| 语言持久化           | 写入 `localStorage`（键名 `eas-ui-locale`），刷新后保持 |
| `reloadPageOnChange` | 传 `true` 时切换语言后刷新页面（默认 `false`）          |

> 📌 持久化**不区分受控 / 非受控** —— 生效值由外部决定，但用户偏好始终被记住。

### 单组件覆盖

每个内置文案的组件都接受 `locale` 与 `messages` 两个属性（优先级高于 `LocaleProvider`）：

```tsx
import { Alert } from '@easbot/ui';

<Alert locale="en-US" />

<Alert
  locale="zh-CN"
  messages={{ 'zh-CN': { closeAriaLabel: '关闭这条提示' } }}
/>
```

### 内置文案域

内置文案表覆盖 **21** 个组件域：

`alert` · `breadcrumb` · `button` · `carousel` · `command` · `date` · `dialog` · `drawer` · `edit` · `file` · `icon` · `locale` · `pagination` · `select` · `sheet` · `sidebar` · `table` · `theme` · `toast` · `tree` · `typography`

> 完整文案表见 `src/utils/component-messages.ts`。

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

### 用 ThemeProvider 接管

需要持久化主题、或让组件库管理主题状态时，使用 `ThemeProvider`：

```tsx
import { ThemeProvider } from '@easbot/ui';

<ThemeProvider defaultTheme="light">
  <App />
</ThemeProvider>;
```

`DesignSystemProvider` 会一次性组合主题、Tooltip 与 Toast 三个 Provider：

```tsx
import { DesignSystemProvider } from '@easbot/ui';

<DesignSystemProvider defaultTheme="light">
  <App />
</DesignSystemProvider>;
```

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

> `@hookform/resolvers` 与 `zod` 是**消费方**的依赖，需自行安装。

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

> `resizable` 组件**已从包根导出**（`ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle`），
> 详见 [Resizable 可调整面板](./components/navigation/resizable.md)。

### 支持 React 18 吗？

不支持。`peerDependencies` 要求 `react ^19.0.0`，因为本库使用了 React 19 的相关特性。

### `Icon` 的 `class` 模式渲染空白？

`type="class"` 依赖图标字体，需额外引入 `@easbot/ui/iconfont.css` 并把字体文件放到 `public/icon/`。
详见 [Icon 图标](./components/data-entry/icon.md)。

---

## 下一步

- 逐个组件的完整属性表 → [组件文档索引](./README.md#组件清单)
- 定制颜色 / 圆角 / 尺寸 → [主题定制](./theming.md)
- 交互式在线预览 → [Storybook](https://houjallen.github.io/easbot-ui/)
