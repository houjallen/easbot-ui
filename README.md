[English](./README.en.md) | 中文

# @easbot/ui — React 通用组件库

> 基于 **Radix UI** + **Tailwind CSS v4** 的 React 组件库，56 个开箱即用的无障碍组件。

## 版本

v0.3.31

## 简介

`@easbot/ui` 是一个可被任意 React 项目（含 Next.js App Router）复用的组件库。

**特性**：

- **56 个组件** —— 覆盖表单、浮层、导航、数据展示全场景
- **无障碍优先** —— 全部基于 Radix UI primitives，内置 ARIA 语义与键盘导航
- **零配置样式** —— Tailwind 在构建期全量编译，消费方一行 `import` 即得完整样式
- **双格式产物** —— ESM + CJS + TypeScript 类型声明
- **主题可切换** —— CSS 变量驱动，运行时 light / dark 无需重建
- **内置国际化** —— 组件文案自带 zh-CN / en-US 双语，语言由消费方注入
- **数据契约内置** —— Zod Schema 随包发布，消费方配置对象开箱即用运行时校验
- **完整工程化** —— Vitest 单测 + Storybook 文档 + Biome 规范 + CI/CD

## 快速开始

### 安装

```bash
npm install @easbot/ui
# 或
pnpm add @easbot/ui
```

### 使用

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

> ⚠️ **必须引入样式**：`import '@easbot/ui/styles.css';`
> 组件样式在**组件库构建期**已编译成纯 CSS，消费方**无需**安装或配置 Tailwind。

### Next.js App Router

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

## 组件清单（56 个）

组件实现位于 `src/ui/<component>/`，每个目录含实现文件 + `index.ts` barrel。

| 分类          | 组件                                                                                                                                                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **表单**      | `Button` `Checkbox` `Combobox` `Edit` `Form` `Input` `InputOtp` `Label` `RadioGroup` `Select` `Slider` `Switch` `Textarea` `Toggle` `ToggleGroup`                                                                                                         |
| **浮层**      | `AlertDialog` `Command` `ContextMenu` `Dialog` `Drawer` `DropdownMenu` `HoverCard` `Menubar` `NavigationMenu` `Popover` `Sheet` `Toast` `Tooltip`                                                                                                         |
| **数据展示**  | `Accordion` `Alert` `AspectRatio` `Avatar` `Badge` `Breadcrumb` `Calendar` `Card` `Carousel` `Chart` `Collapsible` `Date` `Icon` `Pagination` `Progress` `ScrollArea` `Separator` `Sidebar` `Skeleton` `Spinner` `Table` `Tabs` `Tag` `Tree` `Typography` |
| **数据录入**  | `File`                                                                                                                                                                                                                                                    |
| **导航布局**  | `Resizable`                                                                                                                                                                                                                                               |
| **应用组件**  | `ThemeToggle` `LocaleToggle`                                                                                                                                                                                                                              |
| **Hooks**     | `useToast` `useTheme`                                                                                                                                                                                                                                     |
| **Providers** | `LocaleProvider` `NotifyProvider` `ThemeProvider`                                                                                                                                                                                                         |

> 上表按**消费方可见的组件族**归类；`src/ui/` 下共 **56** 个组件目录，
> 其中部分目录导出多个子组件（如 `Dialog` 系列、`Table` 系列、`Date` 系列）。
> `ThemeToggle` / `LocaleToggle` 是面向应用层的现成组件（非 `src/ui/` 目录），
> 分别用于切换主题与语言。

每个组件目录（`src/ui/<component>/`）包含：

```
<component>/               # 组件目录
├── <component>.tsx        # 组件实现（部分组件有多个实现文件）
├── __tests__/             # 测试与 Story 统一收纳目录
│   ├── <component>.test.tsx
│   └── <component>.stories.tsx
└── index.ts               # export * from './<component>' + 类型导出
```

> ⚠️ **测试与 Story 一律放在 `__tests__/` 子目录** —— 与组件源码分离，避免与实现文件混杂。

## 主题

主题通过 CSS 变量实现，共 **706** 个 `--xxx` 自定义属性（light / dark 两份文件集合完全一致）。

```html
<!-- 亮色（默认） -->
<html data-theme="light" />

<!-- 暗色 -->
<html data-theme="dark" />
```

主题文件位于 `src/theme/themes/light.css` / `src/theme/themes/dark.css`，构建后随包发布为
`dist/theme-light.css` / `dist/theme-dark.css`，可按需单独引入覆盖。

## 国际化（i18n）

组件库**内置**双语文案（`zh-CN` / `en-US`），共 **21** 个组件文案域 —— 按钮、表格、分页、
日期、文件、弹窗等用户可见文案**开箱即用**，消费方**无需**安装任何 i18n 库。

- **文案表**：`src/utils/component-messages.ts`（按组件域分组，每域含 `zh-CN` + `en-US`）
- **React 侧 Hook**：`useComponentMessage(domain, { locale, messages })`
- **处理引擎**：`src/utils/ui-message.ts`（纯函数 `processUiMessage`，支持点号路径与 `{param}` 插值）

### 切换语言

通过 `LocaleProvider` 全局切换，或用组件的 `locale` prop 按实例覆盖（优先级更高）：

```tsx
import { LocaleProvider, Pagination } from '@easbot/ui';

// 中文（缺省）
export function ZhApp() {
  return (
    <LocaleProvider locale="zh-CN">
      <Pagination />
    </LocaleProvider>
  );
}

// 英文 —— 组件默认文案自动切换
export function EnApp() {
  return (
    <LocaleProvider locale="en-US">
      <Pagination />
    </LocaleProvider>
  );
}

// 单个组件覆盖语言（优先级高于 LocaleProvider）
export function SingleComponent() {
  return <Pagination locale="en-US" />;
}
```

### 覆盖内置文案

消费方可通过 `messages` prop 覆盖内置文案（**浅合并**，按 locale 匹配）：

```tsx
export function CustomCopy() {
  return <Pagination messages={{ 'en-US': { prev: 'Back', next: 'Forward' } }} />;
}
```

### 消费方 Hook

```tsx
import { useComponentMessage } from '@easbot/ui';

function TableToolbar() {
  const { t } = useComponentMessage('table');
  return <span>{t('totalRows', { count: 42 })}</span>; // 总计：42 行 / Total: 42 rows
}
```

> ⚠️ **组件库不持有全局语言状态** —— 语言由消费方通过 `LocaleProvider` / `locale` prop 注入；
> 组件库**不引入** `react-i18next` / `i18next` 等外部 i18n 库。
> 完整规范见 [`spec/i18n-standard.md`](./spec/i18n-standard.md)。

## 通知（Notify）

`NotifyProvider` 提供**语义化通知**能力，把 `notify.success('保存成功')` 这类简短调用
映射为库内 `toast()` 的完整参数（标题 / 描述 / 变体）。

```tsx
import { NotifyProvider, useNotify } from '@easbot/ui';

function SaveButton() {
  const { notify, close } = useNotify();
  return (
    <button
      onClick={() =>
        notify.success('配置已保存', {
          title: '保存完成', // 覆盖语义默认标题
          duration: 8000, // 覆盖停留时长（毫秒）
          variant: 'info', // 覆盖 Toast 变体
          position: 'top-right', // 覆盖显示位置
        })
      }
    >
      保存
    </button>
  );
}

// 应用根部
export function App() {
  return (
    <NotifyProvider position="bottom-right" duration={5000}>
      <SaveButton />
    </NotifyProvider>
  );
}
```

### 参数优先级

| 参数       | 优先级（高 → 低）                                                             |
| ---------- | ----------------------------------------------------------------------------- |
| `title`    | `options.title` → 语义内置文案（提示 / 成功 / 警告 / 错误）                   |
| `variant`  | `options.variant` → 语义映射变体（`error` → `destructive`）                   |
| `duration` | `options.duration` → `NotifyProvider` 的 `duration` → 组件默认 5000ms         |
| `position` | `options.position` → `NotifyProvider` 的 `position` → 组件默认 `bottom-right` |

> 📌 **定位由组件内部控制** —— 每条通知按自己的 `position` 定位到对应角落，
> **无需消费方传 CSS 类名**；通知宽度由 `--toast-min-width`（240px）/
> `--toast-max-width`（350px）约束，兼顾移动端。

## 技术栈

| 分类     | 选型                                             |
| -------- | ------------------------------------------------ |
| 框架     | React 19                                         |
| 无障碍   | Radix UI primitives                              |
| 样式     | Tailwind CSS v4 + CSS 变量主题                   |
| 变体     | class-variance-authority (cva)                   |
| 类名合并 | clsx + tailwind-merge                            |
| 数据契约 | Zod 4（`z.infer` 推导类型 + 运行时校验）         |
| 国际化   | 内置双语（zh-CN / en-US）+ `useComponentMessage` |
| 构建     | tsup (esbuild)                                   |
| 测试     | Vitest 4 + @testing-library/react + jsdom        |
| 文档     | Storybook 10 (react-vite builder)                |
| 规范     | Biome 2                                          |
| 类型     | TypeScript 6                                     |
| 包管理   | pnpm                                             |

## 工具链说明（为什么是 tsup 而不是 vite）

| 环节           | 工具                                     | 理由                                                         |
| -------------- | ---------------------------------------- | ------------------------------------------------------------ |
| npm 包构建     | **tsup**（esbuild）                      | 组件库只需「源码 → lib + dts」，esbuild 打包快、配置少       |
| Storybook 预览 | `@storybook/react-vite`（内部自带 Vite） | Storybook 需要 dev server + HMR + CSS 处理，正是 Vite 强项   |
| 单元测试       | Vitest 4（自带 Vite 管线）               | 不要求项目内有 `vite.config.ts`，读自己的 `vitest.config.ts` |
| 消费方工具链   | 消费方自带（Vite / Next.js / CRA 均可）  | 组件库只产出标准 npm 包                                      |

**结论**：本仓库**不需要** `vite.config.ts` 作为构建工具。tsup 是构建真值源，
Vite 仅作为 Storybook 的内部实现细节存在。

## Tailwind 说明

组件样式完全依赖 Tailwind 原子类 + CSS 变量，因此 **Tailwind 是必需的**。但：

- Tailwind 是**构建期**工具，不进 npm 运行时依赖；
- 组件库在**构建期**扫描 `src/` 全量编译成 `dist/styles.css`（纯 CSS）；
- 消费方**无需**安装 Tailwind，**无需**配置 content 路径。

若消费方希望覆盖主题，只用自己的 CSS 变量覆盖 `dist/styles.css` 中的 `:root` 变量即可。

## 字体资源（opt-in）

样式与字体 CSS **一起导出**，但**是否启用自定义字体由应用层决定**。

| 产物              | 内容                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `dist/styles.css` | 主题变量 + 原子类；`--font-sans` 带**完整回退栈**（未启用字体时退回系统字体） |
| `dist/fonts.css`  | 7 个 `@font-face`（思源黑体 7 个字重）+ `--font-source-han-sans` 变量声明     |

**用法** —— 不引入即用系统字体，引入即启用自定义字体：

```ts
// 方案 A：不引入 fonts.css —— 保持系统字体（默认）
import '@easbot/ui/styles.css';

// 方案 B：引入 fonts.css —— 启用思源黑体（应用层显式确认）
import '@easbot/ui/styles.css';
import '@easbot/ui/fonts.css';
```

> ⚠️ **不要**把 `fonts.css` 打进自己的样式入口里「顺带引入」——
> 字体文件每个字重约 **8 MB**，需由应用层**显式**决定是否加载。
>
> 覆盖字体栈：直接覆盖 `--font-sans` 或 `--font-source-han-sans` 即可，
> 无需改组件库源码。

### ⚠️ 字体文件需自行放置到 `public/font/`

**字体二进制不随 npm 包发布**（否则每个消费方都要多装 60 MB），
需**由应用层复制到自己的静态资源目录**，路径约定与 CSS 里的引用一致：

```
public/
└── font/
    ├── SourceHanSansCN-ExtraLight.otf   # weight 200
    ├── SourceHanSansCN-Light.otf        # weight 300
    ├── SourceHanSansCN-Normal.otf       # weight 400
    ├── SourceHanSansCN-Regular.otf      # weight 450
    ├── SourceHanSansCN-Medium.otf       # weight 500
    ├── SourceHanSansCN-Bold.otf         # weight 700
    ├── SourceHanSansCN-Heavy.otf        # weight 900
    └── LICENSE.txt                       # SIL OFL 1.1 授权声明（必须保留）
```

`dist/fonts.css` 里的 `@font-face` 按 `/font/xxx` 引用它们 ——
Vite / Next.js 等约定 `public/` 映射到站点根路径，故**无需改任何配置**。

> 📌 **字重必须一一对应** —— CSS 的 `font-weight` 取自字体自身的
> `OS/2.usWeightClass`（读 OTF 头表实测），**不套用 CSS 关键字近似值**，
> 否则浏览器会做「合成加粗」（faux bold），字形发虚。
>
> 📌 **Next.js 用户** —— 可用 `next/font/local` 自行托管字体，
> 并把 CSS 变量挂到 `<html>` 上（**不要**再引 `fonts.css`，避免重复声明）：
>
> ```tsx
> // app/layout.tsx
> import localFont from 'next/font/local';
>
> const sourceHanSans = localFont({
>   src: [
>     { path: './SourceHanSansCN/SourceHanSansCN-Regular.otf', weight: '400', style: 'normal' },
>   ],
>   display: 'swap',
>   variable: '--font-source-han-sans',
> });
>
> export default function RootLayout({ children }: { children: React.ReactNode }) {
>   return (
>     <html className={sourceHanSans.variable} data-theme="light">
>       <body>{children}</body>
>     </html>
>   );
> }
> ```
>
> 组件库的 `--font-sans` 会自动跟随 `--font-source-han-sans`，无需其他改动。

## 图标字体（opt-in）

`Icon` 组件的 `type="class"` 模式需要图标字体提供字形，同样**由应用层决定是否启用**。

| 产物                | 内容                                              |
| ------------------- | ------------------------------------------------- |
| `dist/iconfont.css` | 796 个图标类的 `content` 映射 + `@font-face` 声明 |

### 1. 放置字体文件

**图标字体二进制不随 npm 包发布**，需复制到静态资源目录：

```
public/
└── icon/
    ├── iconfont.woff      # 主格式（覆盖 IE11+ 全部现代浏览器）
    ├── iconfont.ttf       # 兜底格式（老 Safari）
    ├── symbol.ttf         # officefont 的 Symbol 家族
    └── wingding.ttf       # officefont 的 Wingdings 家族
```

`dist/iconfont.css` 里的 `@font-face` 按约定路径 `/icon/xxx` 引用字体文件。

### 2. 引入 CSS

```ts
import '@easbot/ui/styles.css';
import '@easbot/ui/iconfont.css'; // ← 启用图标字体
```

### 3. 使用

```tsx
import { Icon, iconfontClassNames } from '@easbot/ui';

<Icon type="class" clazzName="iconfont icon-search" size={24} />;

// 796 个可用类名，可直接取用
console.log(iconfontClassNames.length); // 796
```

> ⚠️ **不引入 `iconfont.css` 时 `class` 模式渲染为空白** ——
> `name` / `url` 模式不受影响。
> 详见 [`spec/css-standard.md`](./spec/css-standard.md) §1.8。

## 主题变量单独引入（可选）

`dist/styles.css` **已包含** light / dark 两套主题变量。
若只想**覆盖主题变量**、保留自己已有的原子类，可单独引入：

```ts
import '@easbot/ui/theme-light.css'; // 或 theme-dark.css
```

| 产物                   | 内容                                 |
| ---------------------- | ------------------------------------ |
| `dist/theme-light.css` | `:root[data-theme='light']` 主题变量 |
| `dist/theme-dark.css`  | `:root[data-theme='dark']` 主题变量  |

> 这两个文件是**特别提供**的可选产物 —— 常规用法只需 `import '@easbot/ui/styles.css';`。

## 开发命令

```bash
# 安装依赖
pnpm install

# 构建（JS + d.ts + CSS）
pnpm build
pnpm build:css        # 仅编译 Tailwind CSS
pnpm build:fonts      # 仅生成字体 CSS（dist/fonts.css，字体文件不随包发布）
pnpm build:icons      # 仅生成图标字体 CSS（dist/iconfont.css，字体文件不随包发布）

# 测试
pnpm test             # 单次运行
pnpm test:watch       # 监听模式
pnpm test:coverage    # 覆盖率

# 类型检查
pnpm type-check

# 代码规范
pnpm lint             # 检查
pnpm lint:fix         # 自动修复
pnpm lint:report      # summary 报告

# i18n 规范扫描
pnpm check:i18n       # 扫描硬编码文案 / 消息表一致性（0 违规 = 通过）

# Storybook
pnpm storybook        # 开发预览 (http://localhost:6006)
pnpm storybook:build  # 静态站点 → storybook-static/

# 版本管理
pnpm version:patch
pnpm version:minor
pnpm version:major

# 发布
pnpm publish:list     # 查看 npm 已发布版本
pnpm publish:npm      # 发布到 npm（macOS / Linux / Git Bash）
pnpm publish:npm:win  # 发布到 npm（Windows PowerShell）
```

## 数据契约（Zod Schema）

组件库把「消费方需要传入的配置对象」定义为 **Zod Schema**，schema 即运行时校验器，
类型通过 `z.infer` 推导 —— 避免类型定义与校验逻辑双轨维护。

```tsx
import { DataStorePageSchema, FilterRuleSchema } from '@easbot/ui';

// 运行时校验 —— 配置写错会立刻报错，而不是静默失效
const page = DataStorePageSchema.parse(rawPage);

// 类型推导 —— 无需手写 interface
type Page = z.infer<typeof DataStorePageSchema>;
```

Schema 分组（位于 `src/models/` 与 `src/utils/validation-rule.ts`）：

| 模块                    | Schema                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `models/table`          | `TableActionTypeSchema` `TableColumnActionTypeSchema` `TableCellActionTypeSchema` `TableRowActionTypeSchema` |
| `models/filter`         | `FilterOperatorSchema` `FilterDataTypeSchema` `FilterExpressionSchema` `FilterRuleSchema`（递归）            |
| `models/data-store`     | `DataStoreFieldSchema` `DataStoreSortingSchema` `DataStorePageSchema`                                        |
| `models/axios`          | `UploadFileParamsSchema` `UploadRequestConfigSchema`                                                         |
| `utils/validation-rule` | `ValidationFormatSchema` `ValidationRuleSchema`                                                              |

## 依赖策略

| 类别               | 成员                                                                                                                                                                                                                                           | 说明                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `dependencies`     | `class-variance-authority` `clsx` `cmdk` `date-fns` `dayjs` `embla-carousel-react` `input-otp` `lucide-react` `react-day-picker` `react-hook-form` `react-moveable` `react-resizable-panels` `recharts` `sonner` `tailwind-merge` `vaul` `zod` | 源码直接 import，必须随包可解析     |
| `peerDependencies` | `react` `react-dom`                                                                                                                                                                                                                            | 宿主项目提供，避免双 React 实例     |
| `peerDependencies` | `@radix-ui/react-*`（28 个，**全部 optional**）                                                                                                                                                                                                | 版本对齐，避免 Radix 内部状态不同步 |

**Tailwind CSS** 在 `devDependencies`（构建期）+ 消费方可选安装（自行定制主题时）。

> ⚠️ **新增依赖必须同步 `tsup.config.ts` 的 `external`** —— 漏配会把该包打进 bundle，
> 导致产物体积膨胀，且消费方可能拿到重复实例（典型症状：Zod 的 `instanceof` 校验在消费方失败）。

## 测试规范

- **框架**：Vitest 4 + jsdom
- **位置**：`src/ui/<component>/__tests__/<component>.test.tsx`（测试与 Story 统一收纳在 `__tests__/` 子目录）
- **命名**：`<component>.test.tsx`
- **API**：使用 `vi.*`（非 `jest.*`）；matcher 由 `@testing-library/jest-dom/vitest` 全局注册
- **polyfill**：jsdom 缺失的浏览器 API（`ResizeObserver` / `scrollIntoView`）统一从 `tests/polyfills.ts` 导入
- **覆盖**：每个组件必须有对应单测，覆盖渲染 / 状态 / 交互 / 无障碍

```bash
# 跑单个文件
pnpm vitest run src/ui/button/__tests__/button.test.tsx

# 跑单个目录
pnpm vitest run src/ui/button
```

## 开发规范（`spec/`）

`spec/` 是本库的**开发宪法** —— 8 份文档，每份含 **8-12 项可复跑的扫描维度**
（命令 + 判定 + 修正模式），**提交前必跑**。

| 文档                                                                     | 覆盖内容                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------- |
| [`spec/spec-index.md`](./spec/spec-index.md)                             | 规范索引 + 按场景导航 + 全库自检命令                  |
| [`spec/component-standard.md`](./spec/component-standard.md)             | 组件目录 / 命名 / 导出 / 封装 / cva / `cn()`          |
| [`spec/css-standard.md`](./spec/css-standard.md)                         | CSS 变量 / 主题双文件 / `@theme inline` / `dark` 变体 |
| [`spec/testing-guidelines.md`](./spec/testing-guidelines.md)             | 测试配置 / 用例结构 / 断言选型 / polyfill             |
| [`spec/storybook-standard.md`](./spec/storybook-standard.md)             | CSF3 / meta / story / argTypes / 装饰器               |
| [`spec/code-annotation-standard.md`](./spec/code-annotation-standard.md) | 注释与 JSDoc 注解规范                                 |
| [`spec/code-quality.md`](./spec/code-quality.md)                         | Biome / TypeScript / 构建 / 依赖分区 / 发布自检       |
| [`spec/i18n-standard.md`](./spec/i18n-standard.md)                       | 内置 i18n / 三层用法 / 文案表规范 / 豁免清单          |

> **写组件前先读** [`spec/spec-index.md`](./spec/spec-index.md) —— 它按场景告诉你该读哪份。

## 消费方文档（`docs/`）

面向**使用组件库**的开发者，与 `spec/`（面向**开发组件库**）职责不同：

| 文档                                                   | 用途                                         |
| ------------------------------------------------------ | -------------------------------------------- |
| [`docs/README.md`](./docs/README.md)                   | 文档索引                                     |
| [`docs/getting-started.md`](./docs/getting-started.md) | 安装与上手                                   |
| [`docs/theming.md`](./docs/theming.md)                 | 主题定制与 CSS 变量覆盖                      |
| [`docs/components/`](./docs/components/)               | 各组件的用法说明（按表单 / 浮层 / 展示分类） |

## Git 工作流

- **commit message**：`<type>(<scope>): <description>`，summary ≤ 72 字符
- **type**：`feat | fix | docs | test | chore | refactor | perf | ci`
- **scope**：组件名（`button` / `dialog` / `toast` …）或 `build` / `test` / `ci` / `deps` / `docs`
- **自动化**：husky `pre-commit` 跑 lint-staged（biome check + format）；`commit-msg` 校验消息格式
- **版本**：通过 `pnpm version:patch|minor|major` 统一 bump，打 tag `easbot-ui@<version>`

## 目录结构

```
.
├── src/
│   ├── index.ts              # 公开 API 出口（tsup 唯一构建入口）
│   ├── ui/                   # 公开组件层（56 个组件目录）
│   │   └── <component>/      # 实现文件 + __tests__/ + index.ts
│   ├── components/           # 应用层组件（ThemeToggle / LocaleToggle）
│   ├── design-system/        # 设计系统层（48 个基础组件 + Provider + hooks）
│   ├── models/               # 数据契约层（Zod Schema）
│   ├── utils/                # 通用工具层（cn / object / locale / validation-rule …）
│   │   ├── ui-message.ts         # i18n 处理引擎（processUiMessage）
│   │   ├── component-messages.ts # 内置文案表（21 个文案域，双语）
│   │   └── use-component-message.ts # React 侧文案 Hook
│   ├── hooks/                # 通用 React Hook（useDevice / useLocale / useTheme）
│   ├── providers/            # 上下文 Provider（LocaleProvider / ThemeProvider / NotifyProvider）
│   ├── theme/                # 主题资源层（唯一 CSS 入口 / 字体 / 多套主题 / tokens）
│   │   ├── styles.css            # ⭐ Tailwind v4 唯一编译入口（构建期扫描 src/）
│   │   └── themes/               #   light.css（706 个）/ dark.css（706 个）+ 5 套扩展主题
│   └── types/                # 类型声明（typings.d.ts）
├── tests/
│   ├── setup.ts              # Vitest 全局设置（jest-dom matcher 注册 + RTL cleanup）
│   └── polyfills.ts          # jsdom 缺失的浏览器 API 共享 polyfill
├── public/                   # 本地静态资源（**不随 npm 包发布**）
│   ├── font/                 #   思源黑体 OTF + SIL OFL 授权（映射到 /font/**）
│   └── icon/                 #   图标字体 woff/ttf（映射到 /icon/**）
├── docs/                     # 消费方文档（组件文档 / getting-started / theming）
├── spec/                     # 开发规范（8 份，见 spec/spec-index.md）
├── scripts/                  # 版本管理 / CHANGELOG / 发布 / i18n 扫描脚本
├── .storybook/               # Storybook 配置
├── tsup.config.ts            # 构建配置
└── vitest.config.ts          # 测试配置
```

## 许可证

MIT License
