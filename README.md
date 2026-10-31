[English](./README.en.md) | 中文

# @easbot/ui — React 通用组件库

> 基于 **Radix UI** + **Tailwind CSS v4** 的 React 组件库，34 个开箱即用的无障碍组件。

## 版本

v0.3.31

## 简介

`@easbot/ui` 是一个可被任意 React 项目（含 Next.js App Router）复用的组件库。

**特性**：

- **34 个组件** —— 覆盖表单、浮层、导航、数据展示全场景
- **无障碍优先** —— 全部基于 Radix UI primitives，内置 ARIA 语义与键盘导航
- **零配置样式** —— Tailwind 在构建期全量编译，消费方一行 `import` 即得完整样式
- **双格式产物** —— ESM + CJS + TypeScript 类型声明
- **主题可切换** —— CSS 变量驱动，运行时 light / dark 无需重建
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

## 组件清单（34 个）

| 分类         | 组件                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **表单**     | `Button` `Checkbox` `Form` `Input` `Label` `RadioGroup` `Select` `Slider` `Switch` `Textarea` `Toggle`                     |
| **浮层**     | `AlertDialog` `Command` `Dialog` `DropdownMenu` `HoverCard` `Menubar` `NavigationMenu` `Popover` `Sheet` `Toast` `Tooltip` |
| **数据展示** | `Alert` `Avatar` `Badge` `Card` `Progress` `Skeleton` `Spinner` `Table` `Tabs` `ScrollArea` `Separator`                    |
| **Hooks**    | `useToast`                                                                                                                 |

每个组件目录（`src/<component>/`）包含：

```
<component>.tsx          组件实现
<component>.test.tsx     Vitest 单元测试
<component>.stories.tsx  Storybook CSF3 story
index.ts                 导出入口
```

## 主题

主题通过 CSS 变量实现，共约 200 个 `--xxx` 自定义属性。

```html
<!-- 亮色（默认） -->
<html data-theme="light" />

<!-- 暗色 -->
<html data-theme="dark" />
```

主题文件位于 `src/theme-light.css` / `src/theme-dark.css`，构建后随包发布为
`dist/theme-light.css` / `dist/theme-dark.css`，可按需单独引入覆盖。

## 技术栈

| 分类     | 选型                                      |
| -------- | ----------------------------------------- |
| 框架     | React 19                                  |
| 无障碍   | Radix UI primitives                       |
| 样式     | Tailwind CSS v4 + CSS 变量主题            |
| 变体     | class-variance-authority (cva)            |
| 类名合并 | clsx + tailwind-merge                     |
| 构建     | tsup (esbuild)                            |
| 测试     | Vitest 4 + @testing-library/react + jsdom |
| 文档     | Storybook 10 (react-vite builder)         |
| 规范     | Biome 2                                   |
| 类型     | TypeScript 6                              |
| 包管理   | pnpm                                      |

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

## 开发命令

```bash
# 安装依赖
pnpm install

# 构建（JS + d.ts + CSS）
pnpm build
pnpm build:css        # 仅编译 Tailwind CSS

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

# Storybook
pnpm storybook        # 开发预览 (http://localhost:6006)
pnpm storybook:build  # 静态站点 → storybook-static/

# 版本管理
pnpm version:patch
pnpm version:minor
pnpm version:major

# 发布
pnpm publish:list     # 查看 npm 已发布版本
pnpm publish:npm      # 发布到 npm
```

## 依赖策略

| 类别               | 成员                                                                                       | 说明                                |
| ------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------- |
| `dependencies`     | `class-variance-authority` `clsx` `cmdk` `lucide-react` `react-hook-form` `tailwind-merge` | 源码直接 import，必须随包可解析     |
| `peerDependencies` | `react` `react-dom`                                                                        | 宿主项目提供，避免双 React 实例     |
| `peerDependencies` | `@radix-ui/react-*`（22 个，optional）                                                     | 版本对齐，避免 Radix 内部状态不同步 |

**Tailwind CSS** 在 `devDependencies`（构建期）+ 消费方可选安装（自行定制主题时）。

## 测试规范

- **框架**：Vitest 4 + jsdom
- **位置**：`src/<component>/<component>.test.tsx`（与组件源码同目录）
- **命名**：`<component>.test.tsx`
- **API**：使用 `vi.*`（非 `jest.*`）；matcher 由 `@testing-library/jest-dom/vitest` 全局注册
- **覆盖**：每个组件必须有对应单测，覆盖渲染 / 状态 / 交互 / 无障碍

```bash
# 跑单个文件
pnpm vitest run src/button/button.test.tsx

# 跑单个目录
pnpm vitest run src/button
```

## 开发规范（`spec/`）

`spec/` 是本库的**开发宪法** —— 7 份文档，每份含 **8-12 项可复跑的扫描维度**
（命令 + 判定 + 修正模式），**提交前必跑**。

| 文档                                                                     | 覆盖内容                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------- |
| [`spec/spec-index.md`](./spec/spec-index.md)                             | 规范索引 + 按场景导航 + 全库自检命令                  |
| [`spec/component-standard.md`](./spec/component-standard.md)             | 组件目录 4 件套 / 命名 / 导出 / 封装 / cva / `cn()`   |
| [`spec/css-standard.md`](./spec/css-standard.md)                         | CSS 变量 / 主题双文件 / `@theme inline` / `dark` 变体 |
| [`spec/testing-guidelines.md`](./spec/testing-guidelines.md)             | 测试配置 / 用例结构 / 断言选型 / polyfill             |
| [`spec/storybook-standard.md`](./spec/storybook-standard.md)             | CSF3 / meta / story / argTypes / 装饰器               |
| [`spec/code-annotation-standard.md`](./spec/code-annotation-standard.md) | 注释与 JSDoc 注解规范                                 |
| [`spec/code-quality.md`](./spec/code-quality.md)                         | Biome / TypeScript / 构建 / 依赖分区 / 发布自检       |

> **写组件前先读** [`spec/spec-index.md`](./spec/spec-index.md) —— 它按场景告诉你该读哪份。

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
│   ├── <component>/          # 34 个组件目录
│   ├── utils/classnames.ts   # cn() 类名合并工具
│   ├── styles.css            # Tailwind v4 样式入口（构建期扫描 src/）
│   ├── theme-light.css       # 亮色主题变量
│   ├── theme-dark.css        # 暗色主题变量
│   └── index.ts              # barrel 导出
├── tests/setup.ts            # Vitest 全局设置（jest-dom matcher 注册）
├── spec/                     # 开发规范（7 份，见 spec/spec-index.md）
├── scripts/                  # 版本管理 / CHANGELOG / 发布脚本
├── .storybook/               # Storybook 配置
├── tsup.config.ts            # 构建配置
└── vitest.config.ts          # 测试配置
```

## 许可证

MIT License
