---
name: architecture-standard
description: 该规范定义 easbot-ui 组件库的架构契约，含七层源码布局与职责边界（ui / design-system / models / utils / hooks / providers / theme）、模块依赖方向与单向分层图、构建链路（tsup 单一入口 + Tailwind CSS 两步构建 + 消费方零配置）、发布产物与 exports 契约、测试与 Storybook 的工程化基线、TypeScript 严格项约定与 React 19 基线，以及 13 项扫描维度（每项含命令 + 判定 + 修正模式）。当新增目录、调整模块边界、修改构建配置或排查依赖方向违规时参考。
category: specification
version: 2.2.0
baseline-date: 2026-11-05
tags: [easbot-ui, architecture, directory, layering, build, tsup, tailwind, bundler, react19]
related:
  - spec-index.md
  - model-standard.md
  - component-standard.md
  - component-api-standard.md
  - react-performance-standard.md
  - css-standard.md
  - code-quality.md
  - testing-guidelines.md
---

# EASBot UI 组件库架构规范 (Architecture Standard)

> **真值源**：本规范以 [`src/index.ts`](../src/index.ts)、[`tsup.config.ts`](../tsup.config.ts)、
> [`package.json`](../package.json)、[`vitest.config.ts`](../vitest.config.ts)、
> [`.storybook/main.ts`](../.storybook/main.ts)、[`tsconfig.base.json`](../tsconfig.base.json)
> 与实际目录结构为唯一执行真值；规范与实现冲突时**规范改**。
>
> **与其它规范的分工**（**不重复**）：
>
> | 关注点                     | 归属文档                                                       | 本规范对应章节   |
> | -------------------------- | -------------------------------------------------------------- | ---------------- |
> | 组件怎么写                 | [`component-standard.md`](./component-standard.md)             | §2.1（仅层归属） |
> | 数据结构怎么定义           | [`model-standard.md`](./model-standard.md)                     | §4（仅层定位）   |
> | 样式与主题怎么写           | [`css-standard.md`](./css-standard.md)                         | §5（仅构建链路） |
> | 测试怎么写                 | [`testing-guidelines.md`](./testing-guidelines.md)             | §6（仅配置基线） |
> | Story 怎么写               | [`storybook-standard.md`](./storybook-standard.md)             | §7（仅配置基线） |
> | 注释与 JSDoc               | [`code-annotation-standard.md`](./code-annotation-standard.md) | —                |
> | 依赖分区 / lint / tsconfig | [`code-quality.md`](./code-quality.md)                         | §4 / §8          |
> | i18n 文案怎么组织          | [`i18n-standard.md`](./i18n-standard.md)                       | —                |

---

## 概述 (Overview)

本库是**独立的单包 React 组件库** `@easbot/ui` —— 基于 Radix UI + Tailwind CSS v4，
对外暴露组件、类型、数据契约与内置双语文案。

**核心约束**：

- ✅ **单一构建入口** —— `src/index.ts` 是 tsup 的**唯一** entry；
  未在此 barrel 导出的符号**不会**进入 `dist/`
- ✅ **消费方零配置** —— 样式在**构建期**编译成 `dist/styles.css`，
  消费方只需 `import '@easbot/ui/styles.css'`
- ✅ **单向分层** —— `ui` → `design-system` / `utils` / `hooks` / `models`，
  下层**不得**反向 import 上层
- ✅ **依赖分区严谨** —— `react` / Radix 在 `peerDependencies`，
  源码 import 的工具库在 `dependencies`，**且必须**同步 `tsup.config.ts` 的 `external`
- ❌ 禁止 tsconfig `paths` 别名与 `@/` 导入（**一律相对路径**）
- ❌ 禁止引入 `react-i18next` / `i18next` 外部 i18n 库
- ❌ 禁止把 `src/theme/`（资源层）当作运行时模块 import

---

## 1. 技术基线

| 项         | 选型                                              | 理由                                                              |
| ---------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| 包形态     | **单包**（非 monorepo，无 `packages/`）           | 独立发布，无跨包引用                                              |
| 构建工具   | **tsup 8.5**（esbuild + rollup dts）              | 组件库只需「源码 → lib + dts」，配置更少                          |
| 样式       | **Tailwind CSS v4**（`@tailwindcss/cli`）         | 构建期全量编译，消费方零配置                                      |
| 动画类     | **tw-animate-css 1.4**                            | v4 兼容的 `animate-in` / `animate-out`                            |
| 组件基座   | **Radix UI**（28 个 `@radix-ui/*`，peer）         | 无障碍行为由 Radix 保证                                           |
| 图标       | **lucide-react**（唯一图标库）                    | 见 [`component-standard.md`](./component-standard.md)             |
| 变体       | **class-variance-authority**（`cva`）             | 变体样式单一真值源                                                |
| 类名合并   | **clsx + tailwind-merge**                         | 冲突消解                                                          |
| 运行时校验 | **Zod 4.6.7**（`dependencies`）                   | 数据契约即真值源（见 [`model-standard.md`](./model-standard.md)） |
| 数据表     | **react-hook-form 7.91**                          | `Form` 组件的表单状态                                             |
| 图表       | **recharts 3.10**                                 | `Chart` 组件                                                      |
| 国际化     | **内置双语**（`src/utils/component-messages.ts`） | 21 个文案域 × zh-CN/en-US，不引外部库                             |
| **React**  | **React 19**（peer `^19.0.0`，实测 19.3.1）       | 见 §1.1                                                           |
| 测试       | **Vitest 5 + jsdom 30**                           | 见 §6                                                             |
| 文档       | **Storybook 10**（`@storybook/react-vite`）       | 见 §7                                                             |
| 代码规范   | **Biome 2.6.4** + **Prettier**（仅 md）           | 见 §8                                                             |
| 包管理     | **pnpm ≥10**                                      | 与 EASBot 家族一致                                                |
| Node       | **≥22.22.2**                                      | `package.json#engines`                                            |

### 1.1 React 19 基线（⛔ 硬性约束）

本库是 **React 19** 组件库 —— `peerDependencies.react: ^19.0.0`，
实测已安装 **19.3.1**。

| #   | 约束                                                                     | 理由                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **必须**用 React 19 **可用的** API 语义                                  | 消费方跑 React 19，本库**不能**依赖 React 18 的隐式行为                                                                                                                        |
| 2   | **必须**保留 `React.forwardRef` + `displayName` 契约                     | `forwardRef` 在 React 19 中**仍是官方推荐**的 ref 转发方式（外部「React 19 弃用 forwardRef」的说法**不成立**，见 [`component-standard.md`](./component-standard.md) §M+3 C7）  |
| 3   | **禁止**用**手写** `useEffect` + `useState` **模拟** React 19 的并发语义 | 应直接用 `useTransition` / `useDeferredValue` / `useOptimistic`（见 [`react-performance-standard.md`](./react-performance-standard.md) §1.5）                                  |
| 4   | `useContext` **继续**用于 Context 读取（本库 16 处，全在顶层）           | 组件顶层读取时 `useContext` **完全够用**；`use()` 的条件调用能力会**诱使**破坏「无条件订阅」语义（见 [`react-performance-standard.md`](./react-performance-standard.md) §1.3） |
| 5   | **禁止**引入 React 18 及以下的**已废弃** API                             | 避免消费方在 React 19 下触发警告                                                                                                                                               |

> 📌 **React 19 并发特性的现状** —— `use` / `useOptimistic` / `useActionState` /
> `useTransition` / `startTransition` / `useDeferredValue` / `<Activity>` **全部零使用**。
> 这**不是缺陷**：并发特性主要服务**应用层**场景（路由切换 / 流式渲染 / 大列表），
> 由**消费方**决定是否启用。本库的职责是**不拖慢**消费方 —— 即不用手工模式抵消其并发优化。
>
> 📌 **`useActionState` 明确不引入** —— 它面向**服务端动作 / 渐进增强**，
> 本库**无** action 端点；表单状态管理用 **`react-hook-form`**（既有方案，不引入第二套）。

> ⚠️ **Vite 只作为 `@storybook/react-vite` 的内部依赖存在** ——
> 本库**没有** `vite.config.ts` 作为构建配置（见 §5）。

---

## 2. 源码分层与职责边界

### 2.1 七层目录布局

```
easbot-ui/
├── src/                          # ⭐ 源码根（tsup 唯一入口在 src/index.ts）
│   ├── index.ts                  #   ⭐ 公开 API barrel（6 段导出）
│   │
│   ├── ui/                       # 公开组件层（56 个组件目录）—— 对外 API 的实现
│   │   ├── index.ts              #   barrel（55 条 export *）
│   │   ├── button/               #   扁平结构：实现 + index.ts + __tests__/
│   │   ├── table/                #   唯一「胖」组件：atoms / molecules / organisms /
│   │   │                         #   plugins / hooks / context / store / types / utils
│   │   └── ...                   #   其余 56 个组件目录
│   │
│   ├── design-system/            # 基础实现层（46 个组件 + Provider 组合）
│   │   ├── index.tsx             #   ⭐ barrel（只导出 DesignSystemProvider）
│   │   ├── components/ui/        #   46 个基础组件 .tsx（各自有 __tests__/）
│   │   ├── components/           #   mode-toggle.tsx（跨组件组合）
│   │   ├── hooks/                #   use-mobile
│   │   ├── lib/                  #   DS 局部 cn() / capitalize() / handleError()
│   │   └── styles/globals.css    #   ⚠️ 含未安装插件的死代码（§2.3）
│   │
│   ├── models/                   # 数据契约层（5 文件 / 13 个 Zod schema）
│   │   ├── index.ts              #   barrel
│   │   ├── axios.ts              #   上传请求契约
│   │   ├── data-store.ts         #   分页契约
│   │   ├── filter.ts             #   过滤契约（唯一递归 schema）
│   │   └── table.ts              #   表格动作类型枚举
│   │
│   ├── utils/                    # 通用工具层（10 文件）
│   │   ├── index.ts              #   barrel
│   │   ├── classnames.ts         #   ⭐ cn() 的**唯一实现**
│   │   ├── object.ts             #   deepMerge / isEmpty / deepValueEqual
│   │   ├── locale.ts             #   getLocaleOnClient
│   │   ├── ui-message.ts         #   i18n 处理引擎（processUiMessage）
│   │   ├── component-messages.ts #   ⭐ 21 个文案域（zh-CN + en-US）
│   │   ├── use-component-message.ts # React 侧文案 Hook
│   │   ├── validation-rule.ts    #   Zod schema + 运行时校验函数
│   │   ├── error.ts / clipboard.ts
│   │
│   ├── hooks/                    # 通用 React Hook（useDevice / useLocale / useTheme）
│   │   └── index.ts              #   barrel
│   │
│   ├── providers/                # 上下文 Provider（LocaleProvider / ThemeProvider）
│   │   ├── index.ts              #   barrel
│   │   ├── locale-provider.tsx   #   LocaleProvider（含 localStorage 持久化）
│   │   └── theme-provider.tsx    #   ThemeProvider（含 localStorage 持久化）
│   │                             #   ⚠️ NotifyProvider 组合 Toaster / toast()，
│   │                             #      归属 src/ui/toast/notify-provider.tsx（避免反向依赖 ui 层）
│   │
│   ├── components/               # 应用层组件（ThemeToggle / LocaleToggle；组合 ui 组件，不进 barrel 单独导出）
│   │
│   ├── theme/                    # 主题资源层（⭐ 唯一 CSS 编译入口在 styles.css）
│   │   ├── styles.css            #   ⭐ 编译入口（@source / @theme inline / @custom-variant）
│   │   ├── index.ts              #   Theme 类型（light / dark）
│   │   ├── themes/               #   主题变量（light.css / dark.css / variables.css + 5 套扩展）
│   │   ├── fonts/                #   字体资源（SourceHanSansCN / msyh + fonts.ts 生成器）
│   │   ├── images/svg/           #   SVG 图标资源
│   │   └── styles/               #   辅助样式（prefix.css / table.css / tokens.ts / iconfont）
│   │
│   └── types/                    # 类型声明（typings.d.ts，环境声明）
│
├── scripts/                      # 构建与版本脚本（零外部依赖；规范探针在 spec/scripts/）
│   ├── bump-version.ts           #   版本 bump（同步 README + 生成 CHANGELOG + 打 tag）
│   ├── check-i18n.ts             #   ⭐ i18n 规范扫描（维度 ①③④⑤⑥；已迁至 spec/scripts/）
│   ├── generate-changelog.ts     #   CHANGELOG 生成（conventional commits）
│   ├── pre-commit-version.ts     #   pre-commit 版本校验
│   ├── list-published-versions.ts#   查询 npm 已发布版本
│   ├── clean-test-fixtures.ts    #   清理测试残留（未挂 script）
│   ├── rewrite-imports.mjs       #   历史迁移工具（未挂 script）
│   ├── publish.sh / publish.ps1  #   发布脚本
│   └── lib/package-discovery.ts  #   共享 helper（包发现 / pnpm 调用）
│
├── tests/                        # Vitest 全局设置（非模块测试）
│   ├── setup.ts                  #   jest-dom matcher + RTL cleanup + polyfills 引入
│   └── polyfills.ts              #   jsdom 缺失的浏览器 API 共享 stub
│
├── .storybook/                   # Storybook 配置（main.ts / preview.tsx）
├── docs/                         # 消费方文档（组件文档 / getting-started / theming）
├── spec/                         # 开发规范（14 份，含探针脚本 spec/scripts/；见 spec-index.md）
├── biome.json                    # Biome 配置（代码 + 格式化）
├── prettier.config.mjs           # Prettier 配置（仅 md/mdx）
├── tsconfig.json / tsconfig.base.json
├── tsup.config.ts                # 构建配置（单入口 / 49 个 external）
├── vitest.config.ts              # 测试配置（jsdom）
└── package.json                  # 依赖分区 + 27 个 script
```

### 2.2 各层职责

| 层                   | 职责                                                  | **不得**包含                                      | 进公开 API                         |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------- | ---------------------------------- |
| `src/ui/`            | 对外暴露的组件实现（56 个目录）                       | 通用工具（放 `utils/`）、数据契约（放 `models/`） | ✅ 经 `src/index.ts` → `ui`        |
| `src/design-system/` | 基础组件 + `DesignSystemProvider` 组合                | 公开 API 的 props 类型（放 `ui/`）                | ✅ 仅 Provider 相关符号            |
| `src/models/`        | Zod schema + `z.infer` 类型                           | React 代码、运行时函数                            | ✅ 经 `src/index.ts` → `models`    |
| `src/utils/`         | 通用工具（`cn` / `object` / i18n 引擎）               | React 组件                                        | ✅ 经 `src/index.ts` → `utils`     |
| `src/hooks/`         | `useDevice` / `useLocale` / `useTheme`                | JSX 渲染                                          | ✅ 经 `src/index.ts` → `hooks`     |
| `src/providers/`     | `LocaleProvider` / `ThemeProvider` / `NotifyProvider` | 业务状态机                                        | ✅ 经 `src/index.ts` → `providers` |
| `src/theme/`         | 字体 / 主题 CSS / tokens（**资源**）                  | **被运行时 import 的代码**（§2.3）                | ❌ 不在 barrel                     |
| `src/types/`         | 环境类型声明（`typings.d.ts`）                        | 业务类型                                          | ❌ 环境声明                        |
| `scripts/`           | 构建期脚本（Node / tsx）                              | 被运行时 import 的代码                            | ❌                                 |
| `tests/`             | 全局设置与 polyfill                                   | 模块测试                                          | ❌                                 |

> ⚠️ **`src/design-system/components/ui/*` 不从 `src/design-system/index.tsx` 导出** ——
> 它们只能通过 `src/ui/` 的**深相对路径** import。
> 这不是遗漏，而是**分层设计**：公开 API 只暴露 `src/ui/` 的版本
> （它附带额外的 Props 类型）。
> 判定见 §M 维度 ④。

### 2.3 ⚠️ 死代码 / 残缺资产（已知，不进构建路径）

以下文件**存在但不会被编译**，改动它们对产物无影响。**清理前需先确认无引用**。

| 路径                                                     | 问题                                                                                            |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/design-system/styles/globals.css`                   | `@plugin '@tailwindcss/typography'` —— 该插件**未安装**，编译会失败                             |
| `src/theme/themes/variants/*.css`（5 套扩展主题）        | 不被入口 import —— **实际发布的是** `src/theme/themes/light.css` / `dark.css`                   |
| `src/theme/themes/safelist.{js,json}`                    | Tailwind v3 时代的 safelist（各 1.46 MB），**无任何引用**（v4 已由 `@source inline(...)` 取代） |
| `scripts/clean-test-fixtures.ts` / `rewrite-imports.mjs` | 未挂到任何 `package.json` script                                                                |

> 📌 **`src/theme/` 整体不在公开 API** —— `src/index.ts` 不导出它；
> 但**样式类产物**通过 `exports` map 暴露（`./styles.css` / `./fonts.css` /
> `./iconfont.css` / `./theme-light.css` / `./theme-dark.css`），
> 消费方可按需引入。详见 §5.1。

---

## 3. 公开 API 出口（`src/index.ts`）

```ts
/* ---------- 数据契约（Zod Schema） ---------- */
export * from './models';

/* ---------- 通用工具 ---------- */
export * from './utils';

/* ---------- UI 组件 ---------- */
export * from './ui';

/* ---------- 设计系统 Provider ---------- */
export * from './design-system';

/* ---------- 通用 Hook ---------- */
export * from './hooks';

/* ---------- 上下文 Provider ---------- */
export * from './providers';
```

**6 段导出，顺序固定**（`models` → `utils` → `ui` → `design-system` → `hooks` → `providers`）。

| #   | 规则                                                                            |
| --- | ------------------------------------------------------------------------------- |
| 1   | **必须**在 `src/index.ts` 导出 —— 否则不进 `dist/index.d.ts` / `dist/index.mjs` |
| 2   | **不得**在此文件写实现代码（只有 6 行 `export *`）                              |
| 3   | **不得**导出 `src/theme/`（资源层，无运行时 API）                               |
| 4   | **不得**导出 `src/types/`（环境声明）                                           |
| 5   | 组件 props / 导出名 / DOM 结构属于**公开 API** —— 变更需版本 bump               |

---

## 4. 模块依赖方向

### 4.1 分层图（实测，零例外）

```
src/index.ts (barrel)
    │
    ├──► src/models/         （纯叶子层：只 import zod + 兄弟模块）
    ├──► src/utils/          （只 import src/hooks/use-locale）
    ├──► src/ui/             （import design-system / utils / hooks / models）
    ├──► src/design-system/  （import utils / hooks / providers）
    ├──► src/hooks/          （import src/providers）
    └──► src/providers/      （纯 React，无内部依赖）
```

**允许的边**（下表之外的方向**全部禁止**）：

| 从                   | 到                                  | 性质       | 证据                                              |
| -------------------- | ----------------------------------- | ---------- | ------------------------------------------------- |
| `src/ui/`            | `src/design-system/components/ui/*` | **运行时** | `src/ui/accordion/accordion.tsx:9` 等约 20 个文件 |
| `src/ui/`            | `src/utils/`                        | 运行时     | `src/ui/button/button.tsx:22-25`                  |
| `src/ui/`            | `src/hooks/`                        | 运行时     | `src/ui/button/button.tsx:25`                     |
| `src/ui/`            | `src/models/`                       | **仅类型** | 全部 7 处均为 `import type`                       |
| `src/design-system/` | `src/utils/` / `src/hooks/`         | 运行时     | `src/design-system/components/mode-toggle.tsx:7`  |
| `src/utils/`         | `src/hooks/use-locale`              | 运行时     | `src/utils/use-component-message.ts:26`           |
| `src/hooks/`         | `src/providers/locale-provider`     | 运行时     | `src/hooks/use-locale.ts:21`                      |
| `src/hooks/`         | `src/providers/theme-provider`      | 运行时     | `src/hooks/use-theme.ts:24`                       |
| `src/models/`        | `zod` + 兄弟模块                    | 运行时     | `src/models/data-store.ts:12-13`                  |

> 📌 **`src/hooks/` → `src/providers/` 是**反向依赖**（Hook 从 Provider 读取 Context）——
> 这是**有意设计**：Provider 只依赖 React，Hook 依赖 Provider，
> 单向无环。**禁止**把 Hook 的实现搬回 Provider 文件（会造成循环依赖）。

### 4.2 五条硬约束

| #   | 约束                                                       | 违反后果                                |
| --- | ---------------------------------------------------------- | --------------------------------------- |
| 1   | `src/models/` **只** import `zod` + 兄弟模块               | 契约层依赖 UI → 循环依赖 + 打包体积失控 |
| 2   | `src/design-system/` **不得** import `src/ui/`             | 两层组件互相引用 → 初始化顺序不确定     |
| 3   | `src/ui/` → `src/models/` **必须**是 `import type`         | 运行时耦合 → 消费方 bundle 里多一份 Zod |
| 4   | `src/utils/` **不得** import `src/ui/`                     | 工具层反向依赖 → 工具无法独立复用       |
| 5   | `src/hooks/` 与 `src/providers/` **不得** import `src/ui/` | 基础设施污染 → 任何组件引入都拖进全库   |

### 4.3 `cn()` 的唯一实现

**`src/utils/classnames.ts` 是 `cn()` 的唯一真值源**：

```ts
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

> ⚠️ **`src/design-system/lib/utils.ts` 另有一份 `cn()`** —— 实现等价
> （`twMerge(clsx(inputs))`），但**不是**真值源。
> **新增代码一律用 `src/utils/classnames.ts`**；
> DS 层的局部 `cn()` 属存量，登记在 §M+2 豁免清单。

---

## 5. 构建链路

### 5.1 四步构建

```
src/index.ts  ──tsup──►  dist/index.mjs  (ESM)
                          dist/index.cjs  (CJS)
                          dist/index.d.ts (类型)
src/theme/styles.css ──tailwindcss CLI──►  dist/styles.css
src/theme/themes/light.css ─┐
src/theme/themes/dark.css  ─┴─(tsup onSuccess 复制)─►  dist/theme-light.css / theme-dark.css
src/theme/fonts/fonts.ts ──────────────(build:fonts)─►  dist/fonts.css
src/theme/styles/iconfont/icons.ts ─────┐
src/theme/styles/iconfont/iconfont.css ─┴─(build:icons)─►  dist/iconfont.css
```

`package.json` 的 `build` 脚本是
**`tsup && pnpm build:css && pnpm build:fonts && pnpm build:icons`** —— 四步**串联**。

> 📌 **CSS 不由 tsup 产出** —— tsup 的 `loader` 虽把 `.css` 映射为 `'file'`，
> 但 `src/theme/styles.css` **不被任何 TS 源码 import**，该 loader 对 CSS 入口**无效**。
> CSS 入口是 `@tailwindcss/cli`。
>
> 📌 **CSS 编译入口唯一** —— 是 `src/theme/styles.css`，
> **不是** `src/styles.css`（已迁走）。详见 [`css-standard.md`](./css-standard.md) §1。
>
> 📌 **字体产物独立成步** —— 字体是「CSS + 静态资源引用」两类产物，
> 由 `scripts/build-fonts.ts`（`pnpm build:fonts`）单独生成，**可单独重跑**。
> 字体对消费方是 **opt-in**（`exports` 的 `"./fonts.css"`），
> 详见 [`css-standard.md`](./css-standard.md) §1.7。
>
> 📌 **图标字体产物独立成步** —— 同理由 `scripts/build-icons.ts`（`pnpm build:icons`）生成。
> ⚠️ 该脚本**重新生成** CSS（而非复制）—— 源文件的字体路径相对自身，
> 直接复制到 `dist/` 会因层级不一致而断链。
> 对消费方同样是 **opt-in**（`exports` 的 `"./iconfont.css"`），
> 详见 [`css-standard.md`](./css-standard.md) §1.8。
>
> 📌 **字体二进制不进 npm 包** —— 字体是**静态资源**（浏览器按 URL 请求），
> 保留在仓库根的 `public/font/` 与 `public/icon/`，
> **与消费方的静态资源目录同名同结构** —— 产物按 `/font/xxx` / `/icon/xxx`
> 引用即自动对应。构建脚本只**校验**字体存在（缺失即早失败），**不复制**。

### 5.2 tsup 配置要点

| 配置项         | 值                                  | 理由                                     |
| -------------- | ----------------------------------- | ---------------------------------------- |
| `entry`        | `['src/index.ts']`（**唯一**）      | 单入口，杜绝多入口产生重复实例           |
| `format`       | `['esm', 'cjs']`                    | 双格式兼容                               |
| `outExtension` | `.mjs`（esm）/ `.cjs`（cjs）        | `package.json#type: module` 下需显式后缀 |
| `platform`     | `'browser'`                         | 浏览器组件库                             |
| `target`       | `'es2020'`                          | 兼容性基线                               |
| `dts`          | 开启（`ignoreDeprecations: '6.0'`） | 类型声明是组件库的核心产物               |
| `sourcemap`    | `true`                              | 消费方可调试                             |
| `minify`       | `false`                             | 压缩交给消费方 bundler                   |
| `splitting`    | `true`（ESM）                       | 代码分割                                 |
| `external`     | **49 个包**（见下）                 | 防止重复实例                             |

**`external` 的 49 个包**（React 4 + Radix 28 + 其他 17）：

| 组别              | 数量 | 包                                                                                                                                       |
| ----------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| React 运行时      | 4    | `react` / `react-dom` / `react/jsx-runtime` / `react/jsx-dev-runtime`                                                                    |
| Radix primitives  | 28   | 全部 `@radix-ui/react-*`                                                                                                                 |
| 样式 / 变体工具链 | 6    | `class-variance-authority` / `clsx` / `tailwind-merge` / `cmdk` / `react-hook-form` / `lucide-react`                                     |
| 数据契约          | 1    | `zod`                                                                                                                                    |
| 日期              | 2    | `dayjs` / `date-fns`                                                                                                                     |
| 交互基座          | 8    | `embla-carousel-react` / `input-otp` / `react-day-picker` / `react-moveable` / `react-resizable-panels` / `recharts` / `sonner` / `vaul` |

> 📌 **计数核验命令**（维度 ⑧ 的补充）：
>
> ```bash
> $t = Get-Content tsup.config.ts -Raw
> $idx = $t.IndexOf('const external'); $end = $t.IndexOf('];', $idx)
> $block = $t.Substring($idx, $end - $idx + 2)
> ([regex]::Matches($block, "'[^']+'")).Count   # 期望 49
> ```

> ⚠️ **漏配 `external` 的典型症状** —— 消费方拿到**重复实例**：
> Zod 的 `instanceof` 校验失败、Radix 的 Context 不共享（浮层不显示）。
> 判定见 §M 维度 ⑧。

### 5.3 消费方契约（零配置）

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs"
  },
  "./styles.css": "./dist/styles.css",
  "./package.json": "./package.json"
}
```

| 契约项        | 要求                                                               |
| ------------- | ------------------------------------------------------------------ |
| 样式引入      | `import '@easbot/ui/styles.css';` —— **唯一**需要的样式步骤        |
| Tailwind 配置 | 消费方**无需**安装或配置 Tailwind（构建期已编译）                  |
| `sideEffects` | `false` —— 消费方可安全 tree-shake                                 |
| `files`       | `['dist', 'CHANGELOG.md', 'README.md', 'README.en.md', 'LICENSE']` |
| 发布产物目录  | `dist/`（与家族「发布产物 = dist」约定一致）                       |

> 📌 **`exports` 暴露 6 个入口** —— `.`（JS + 类型）+ 5 个样式产物
> （`./styles.css` / `./fonts.css` / `./iconfont.css` /
> `./theme-light.css` / `./theme-dark.css`）。
> 后两个是**特别提供的可选产物** —— 主题变量**已内联**在 `styles.css` 里，
> 单独产出是为让消费方能**只覆盖主题变量**而保留自己的原子类。

---

## 6. 测试工程化基线

| 配置项              | 值                                                                             | 说明                               |
| ------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| `environment`       | `'jsdom'`                                                                      | React DOM 组件必须有 DOM 环境      |
| `globals`           | `true`                                                                         | 提供 `describe` / `it` / `expect`  |
| `include`           | `['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}']`                       | 与真实布局匹配                     |
| `exclude`           | `node_modules` / `dist` / `storybook-static`                                   | 排除构建产物                       |
| `setupFiles`        | `['./tests/setup.ts']`                                                         | **全局设置入口**                   |
| `css`               | `false`                                                                        | 样式靠类名断言，测试环境不处理 CSS |
| `reporters`         | `['verbose']`                                                                  | 逐用例输出                         |
| `pool`              | `'threads'`                                                                    | 无共享状态，并行更快               |
| `testTimeout`       | `30000`                                                                        | 涉及定时器 / 动画的用例留足余量    |
| `hookTimeout`       | `30000`                                                                        | 同上                               |
| `coverage.provider` | `'v8'`                                                                         | —                                  |
| `coverage.exclude`  | `**/*.stories.tsx` / `**/*.test.tsx` / `src/index.ts` / `src/theme/styles.css` | 排除非业务代码                     |
| `resolve.alias`     | `'@' → src`                                                                    | **仅历史兼容**，源码禁用（维度 ⑤） |

**测试文件位置**：`src/**/__tests__/<name>.test.tsx`（与被测实现**同目录**的 `__tests__/` 子目录）。

> 📌 **`tests/polyfills.ts` 由 `tests/setup.ts` 全局 import** ——
> jsdom 缺失的浏览器 API（`ResizeObserver` / `scrollIntoView` / `scrollTo` /
> 指针捕获 / `PointerEvent` / `matchMedia` / `URL.createObjectURL`）**全局生效**，
> 测试文件**禁止**逐个 import 或重复定义。

详见 [`testing-guidelines.md`](./testing-guidelines.md)。

---

## 7. Storybook 工程化基线

| 配置项             | 值                                                                                | 说明                       |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------- |
| `framework`        | `@storybook/react-vite`                                                           | Storybook 10 默认推荐      |
| `stories`          | `['../src/**/*.stories.@(ts\|tsx)']`                                              | **必须**匹配真实布局       |
| `addons`           | `addon-docs` / `addon-a11y` / `addon-themes` / `addon-links` / `addon-onboarding` | ❌ **不装** `addon-vitest` |
| `docs.defaultName` | `'Docs'`                                                                          | 文档页默认名               |
| `viteFinal`        | 注入 `@tailwindcss/vite` 插件 + `'@' → src` alias                                 | **必须**注入 Tailwind 插件 |

> ⚠️ **`viteFinal` 必须 push `tailwindcss()`** —— 否则 Tailwind 编译器不接管，
> **零个原子类生成**（story 里样式全丢）。这是 `.storybook/main.ts` 的硬要求。

**主题机制**（`.storybook/preview.tsx`）：

| 机制                                                                    | 作用                                                                   |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 内联装饰器 `document.documentElement.setAttribute('data-theme', theme)` | **真正驱动 CSS**（主题文件选择器是 `:root[data-theme='light\|dark']`） |
| `withThemeByClassName({ themes: { light: 'light', dark: 'dark' } })`    | 提供工具栏切换按钮（设的是 **class**）                                 |

> 📌 **两者并存不冲突** —— class 用于 addon-themes 的工具栏状态，
> attribute 才是驱动 CSS 的开关。

详见 [`storybook-standard.md`](./storybook-standard.md)。

---

## 8. TypeScript 严格项约定

`tsconfig.base.json` 的关键项：

| 配置项                       | 值           | 强制后果                                         |
| ---------------------------- | ------------ | ------------------------------------------------ |
| `verbatimModuleSyntax`       | `true`       | 类型**必须** `import type` 显式导入，否则 TS1484 |
| `moduleResolution`           | `'Bundler'`  | 扩展名省略的相对导入；**禁止** `.ts` 后缀        |
| `module`                     | `'Preserve'` | 保留 ESM 语法                                    |
| `strict`                     | `true`       | 全套严格检查                                     |
| `noUncheckedIndexedAccess`   | `true`       | 索引返回 `T \| undefined`                        |
| `noImplicitOverride`         | `true`       | 覆写方法必须带 `override`                        |
| `noFallthroughCasesInSwitch` | `true`       | switch 必须 break                                |
| `paths` / `baseUrl`          | **不存在**   | **禁止**路径别名，一律相对路径                   |
| `noEmit`                     | `true`       | 产物由 tsup 产出，不由 tsc 产出                  |

**`tsconfig.json` 的 `include`**：`.storybook/**/*` / `scripts/**/*` / `src/**/*` /
`tests/**/*` / `*.config.ts`。

> 📌 **`docs/` 与 `spec/` 不参与类型检查** —— 它们是 `.md`，由 Prettier 管格式。

---

## M. 13 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按文件分批跑**，模式必须**一次跑全库**。

### 维度 ① 七层目录必须齐全

**扫描命令**：

```bash
foreach ($d in @('src/ui','src/design-system','src/models','src/utils','src/hooks','src/providers','src/theme','src/types','scripts','tests','.storybook','docs','spec')) {
  if (-not (Test-Path $d)) { "MISSING dir: $d" }
}
```

**判定规则**：

- ❌ 违规：任一必需目录缺失
- ✅ 合规：无输出

### 维度 ② 依赖方向不得反向

**扫描命令**：

```bash
# 叶子层不得 import 上层
rg -n "from ['\"]\.\./(ui|design-system)/" src/models src/utils src/hooks src/providers
# design-system 不得 import ui
rg -n "from ['\"]\.\./\.\./ui/" src/design-system
```

**判定规则**：

- ❌ 违规：`models` / `utils` / `hooks` / `providers` import 了上层；
  或 `design-system` import 了 `src/ui/`
- ✅ 合规：无输出

### 维度 ③ `src/ui/` → `src/models/` 必须 `import type`

**扫描命令**：

```bash
rg -n "^import \{[^}]*\} from ['\"].*models" src/ui -g "*.ts" -g "*.tsx" | Where-Object { $_ -notmatch "import type" }
```

**判定规则**：

- ❌ 违规：命中任一行（运行时耦合 → 消费方 bundle 里多一份 Zod，§4.2 约束 3）
- ✅ 合规：无输出

### 维度 ④ 公开组件必须从 `src/ui/` 导出

**扫描命令**：

```bash
Get-ChildItem src/ui -Directory | ForEach-Object {
  $d = $_.Name
  if (-not (Test-Path "src/ui/$d/index.ts")) { "MISSING barrel: src/ui/$d/index.ts" }
}
```

**判定规则**：

- ❌ 违规：任一组件目录缺 `index.ts`
- ✅ 合规：无输出

### 维度 ⑤ 禁止 `@/` 导入与 tsconfig `paths`

**扫描命令**：

```bash
# 只扫源码（-g 排除 markdown）
rg -n 'from .@/' src scripts tests .storybook -g '!**/*.md'
# tsconfig 不得有 paths / baseUrl
rg -n '"(paths|baseUrl)"' tsconfig.json tsconfig.base.json
```

**判定规则**：

- ❌ 违规：命中任一行（本库**明确禁用**别名，一律相对路径）
- ✅ 合规：无输出

> 📌 **必须排除 `.md`** —— `src/ui/table/` 与 `src/ui/date/` 下的
> `README.md` / `docs/*.md` 里大量出现 `@/components/ui/...` 的**示例代码**，
> 那是**历史文档**（该目录结构已不存在），不是源码 import。
> 源码侧的判定是硬要求；文档侧属**待清理的历史债**（登记在 §M+2）。

### 维度 ⑥ `export default` 的分布约束

**扫描命令**：

```bash
$all = @(rg -n '^export default' src -g '*.tsx' -g '*.ts' -g '!*stories.tsx' -g '!**/__tests__/**')
"TOTAL: $($all.Count)"
"table/plugins:  $(@($all | Where-Object { $_ -match 'table\\plugins\\' }).Count)"
"table/examples: $(@($all | Where-Object { $_ -match 'table\\examples\\' }).Count)"
```

**判定规则**：

- ❌ 违规：**新增**代码出现 `export default`（公开组件 / 插件 / 工具一律具名导出）
- ⚠️ 存量豁免：命中数与 §M+1 基线一致即合规（当前 **57** 处 / 排除 `__tests__` 与 stories，分布：
  `src/ui/table/` 28（plugins 18 + examples 10）+ `src/ui/` 其他 17
  （edit 3 / file 2 / table atoms·components·molecules·organisms·hooks 10 / date·locale 1 / iconfont 1）
  - `typings.d.ts` 9（环境声明模块增强）+ `design-system/index.tsx` 1（G8）
  - `theme-provider.tsx` 1 + `utils/classnames.ts` 1（真值源受控例外））

> 📌 **`src/ui/table/` 内部大量使用 `export default`** —— 18 个插件 +
> 10 个示例文件都是 default export。这是**表格子系统的历史写法**，
> 与「公开组件禁止 default export」（[`component-standard.md`](./component-standard.md) §3.1）
> **不冲突** —— 那些文件不在 `src/ui/table/index.ts` 的 barrel 导出面里。
> **新增**表格内部文件时**应**用具名导出（与插件层一致）。
>
> 📌 **`src/utils/classnames.ts` 的 `export default cn`** 是**真值源**，
> 改动它会影响全库 —— 属**受控例外**，勿动。

### 维度 ⑦ `src/index.ts` 只含导出语句

**扫描命令**：

```bash
$barrel = Get-Content src/index.ts -Raw
$code = $barrel -split "`n" | Where-Object { $_ -notmatch '^\s*(/\*|\*|//|$)' -and $_ -notmatch "^export \* from" }
if ($code) { "IMPL CODE IN BARREL:"; $code }
```

**判定规则**：

- ❌ 违规：barrel 含实现代码（只有 6 行 `export *` + 注释）
- ✅ 合规：无输出

### 维度 ⑧ 依赖分区 + `external` 同步

**扫描命令**：

```bash
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.dependencies.PSObject.Properties.Name -contains 'react') { "VIOLATION: react 在 dependencies" }
if ($pkg.dependencies.PSObject.Properties.Name -contains 'react-dom') { "VIOLATION: react-dom 在 dependencies" }
$ext = Get-Content tsup.config.ts -Raw
foreach ($d in $pkg.dependencies.PSObject.Properties.Name) {
  if ($ext -notmatch [regex]::Escape("'$d'")) { "VIOLATION: $d 不在 external" }
}
```

**判定规则**：

- ❌ 违规：`react` / `react-dom` 在 `dependencies`（必须是 peer）；
  或任一 `dependencies` 未在 `external`（消费方拿到重复实例，§5.2）
- ✅ 合规：无输出

### 维度 ⑨ Radix primitives 必须在 `peerDependencies` 且 `optional`

**扫描命令**：

```bash
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$radixDeps = @($pkg.dependencies.PSObject.Properties.Name | Where-Object { $_ -like '@radix-ui/*' })
if ($radixDeps) { "VIOLATION: Radix 在 dependencies: $($radixDeps -join ', ')" }
$radixPeers = @($pkg.peerDependencies.PSObject.Properties.Name | Where-Object { $_ -like '@radix-ui/*' })
$notOptional = @($radixPeers | Where-Object { $pkg.peerDependenciesMeta.$_.optional -ne $true })
if ($notOptional) { "VIOLATION: Radix 未标 optional: $($notOptional -join ', ')" }
"Radix peer: $($radixPeers.Count) 个"
```

**判定规则**：

- ❌ 违规：Radix 在 `dependencies`；或 Radix peer 未标 `optional: true`
- ✅ 合规：输出 `Radix peer: 28 个`

### 维度 ⑩ 类型导入必须显式 `import type`

**扫描命令**：

```bash
rg -n "^import \{[^}]*\b(Props|Config|Options|Value|State|Context|Result|Type|Params)\b" src -g "*.ts" -g "*.tsx" | Where-Object { $_ -notmatch "import type" }
```

**判定规则**：

- ❌ 违规：命中任一行（`verbatimModuleSyntax: true` → TS1484）
- ✅ 合规：无输出

### 维度 ⑪ 测试与 Story 必须在 `__tests__/` 下

**扫描命令**：

```bash
Get-ChildItem src -Recurse -Include *.test.ts,*.test.tsx,*.stories.tsx | Where-Object {
  $_.FullName -notmatch 'node_modules|\\dist\\' -and
  $_.DirectoryName -notmatch '__tests__$' -and
  $_.FullName -notmatch '\\tests\\'
} | ForEach-Object {
  "NOT IN __tests__: $($_.FullName)"
}
```

**判定规则**：

- ❌ 违规：测试 / Story 文件直接放在源码目录
- ✅ 合规：无输出

### 维度 ⑫ 构建产物与 exports 契约

**扫描命令**：

```bash
pnpm build
foreach ($f in @('dist/index.mjs','dist/index.cjs','dist/index.d.ts','dist/styles.css')) {
  if (-not (Test-Path $f)) { "MISSING artifact: $f" }
}
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
foreach ($e in @('.','./styles.css')) {
  if (-not $pkg.exports.$e) { "MISSING export: $e" }
}
```

**判定规则**：

- ❌ 违规：产物缺失；或 `exports` 缺 `.` / `./styles.css`
- ✅ 合规：无输出

### 维度 ⑬ 禁止 barrel 运行时循环导入

> 📌 对应条文：§4「模块依赖方向」+ [`component-api-standard.md`](./component-api-standard.md) 维度 ⑦。

**扫描命令**：

```bash
# 列出从目录 index 的**运行时**（非 import type）导入（空 = 合规）
rg -n "^import \{[^}]*\} from '(\.\./)*(index|\.)'" -g "src/ui/**/*.tsx" --no-heading |
  Where-Object { $_ -notmatch 'import type' -and $_ -notmatch '__tests__' -and $_ -notmatch 'examples' }
```

**判定规则**：

- ❌ 违规：组件内部从目录 barrel 做**运行时**导入 → **循环依赖**
  （`src/ui/table/index.ts` 又 `export * from './atoms'` / `'./hooks'` → 初始化顺序不确定）
- ✅ 合规：0 命中
- ⚠️ **豁免**：`import type` 导入（编译期擦除，**无**运行时循环）；`examples/` 与 `__tests__/`（不进发布产物）

**修正模式**：

```tsx
// ❌ 违规（src/ui/table/atoms/CellValue.tsx:6）
import { useTableLogic } from '../index';

// ✅ 修正 —— 直连实际源模块
import { useTableLogic } from '../context/TableContext';
```

> 📌 **实测**：**2 处**运行时循环
> （`src/ui/table/atoms/TableCardContainer.tsx:1` / `src/ui/table/atoms/CellValue.tsx:6`）
> → 缺口 G-P2 / G-R4。

---

## M+1. 历史基准（2026-11-02 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                                 | 值                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| 包名 / 版本                          | `@easbot/ui` / **0.3.31**                                                                |
| **React 版本**                       | peer `^19.0.0` / 实测 **19.3.1**                                                         |
| 公开组件目录（`src/ui/`）            | **56**                                                                                   |
| 基础实现组件（DS 层）                | **46**                                                                                   |
| `src/ui/index.ts` 导出段数           | **55**                                                                                   |
| `src/index.ts` 导出段数              | **6**                                                                                    |
| `src/models/` 文件 / schema          | **5** / **13**                                                                           |
| `tsup` `external` 包数               | **49**（React 4 + Radix 28 + 其他 17）                                                   |
| `dependencies` / `peerDeps`          | **17** / **30**（28 Radix + react + react-dom）                                          |
| Radix peer 全部 `optional`           | ✅ **28 / 28**                                                                           |
| 主题变量 light / dark                | **706 / 706**，集合完全一致                                                              |
| 测试文件数                           | **123**（`src/**/*.{test.ts,test.tsx}`）                                                 |
| Story 文件数                         | **79**（`src/**/*.stories.tsx`）                                                         |
| `export default` 处数                | **57**（全 src，排除 `__tests__` / stories；分布见维度⑥ —— `src/ui` 实现 tsx 子集为 32） |
| `package.json` script 数             | **27**                                                                                   |
| `src/theme/` 变量文件数              | **7 套**（不发布，实际发布 light / dark 两套）                                           |
| 文案域数（`ComponentMessageDomain`） | **21**（另 `componentMessages` 聚合表 1 个）                                             |
| **React 19 并发 API 命中**           | **0**（`use` / `useTransition` / `useDeferredValue` / `useOptimistic` / `<Activity>`）   |
| `React.memo` 命中                    | **7**（全在 `src/ui/table/atoms/`）                                                      |
| 动态 `import()` 命中                 | **0**                                                                                    |
| **barrel 运行时循环导入**            | **2**（`TableCardContainer` / `CellValue`）                                              |

---

## M+2. 豁免清单

| 对象                                                                          | 豁免依据                                                                                                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/design-system/index.tsx` 的 `export default DesignSystemProvider`        | **barrel 不传播 default** —— 消费方从 `src/index.ts` 拿到的是具名导出（登记在 [`spec-index.md`](./spec-index.md) G8）                                                   |
| `src/design-system/lib/utils.ts` 的局部 `cn()`                                | DS 层历史自持实现，**与真值源等价**；新增代码一律用 `src/utils/classnames.ts`（§4.3）                                                                                   |
| `vitest.config.ts` / `.storybook/main.ts` 的 `'@' → src` alias                | **工具侧历史兼容**，源码禁用该别名（维度 ⑤ 只约束源码 import）                                                                                                          |
| `src/theme/styles.css` / `src/design-system/styles/globals.css`               | **死代码**，不进构建路径（§2.3）—— 清理前需确认无引用                                                                                                                   |
| `src/theme/` 整体不在 `src/index.ts` barrel                                   | **资源层**（字体 / CSS / tokens），无运行时 API（§2.2）                                                                                                                 |
| `src/types/typings.d.ts` 不进 barrel                                          | **环境声明**（模块增强），非运行时符号                                                                                                                                  |
| `src/ui/table/` 的原子/分子/有机体（atom/molecule/organism）分层              | 表格是**唯一**的「胖」组件，采用生物式分层；其余 53 个组件用扁平结构（§2.1）                                                                                            |
| `src/ui/typography/` 目录入口为 `index.tsx`（唯一例外，无 `index.ts`）        | `moduleResolution: 'Bundler'` 下 `.tsx` **优先解析**；`index.tsx` 内记录了 TS2308 冲突的规避说明（与 [`component-standard.md`](./component-standard.md) 维度⑫口径一致） |
| `src/ui/table/types/` 的纯 TypeScript 契约层                                  | 含大量**函数值 props**，Zod 校验不了（见 [`model-standard.md`](./model-standard.md) §4.2）                                                                              |
| `scripts/clean-test-fixtures.ts` / `rewrite-imports.mjs` 未挂 script          | 历史工具，按需手动执行                                                                                                                                                  |
| ~~`src/providers/notify-provider.tsx` 反向依赖 `src/ui/toast` / `use-toast`~~ | **已消除**（2026-11-05）：`notify-provider.tsx` 迁至 `src/ui/toast/`（`providers/index.ts` 不再导出，包根 API 不变）；**新增** providers / hooks 代码 MUST 遵守硬约束   |

---

## M+3. 冲突裁决

| #   | 冲突点                   | 旧写法 / 外部惯例                                                               | 本库裁决                                                                                                                                                |
| --- | ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | 构建产物目录             | `lib/` 或 `es/`                                                                 | **`dist/`**（与家族「发布产物 = dist」约定一致）                                                                                                        |
| C2  | 样式产出方式             | 由构建工具（vite / rollup）一并产出                                             | **两步构建**：`tsup` 出 JS，`@tailwindcss/cli` 出 CSS                                                                                                   |
| C3  | 组件分层                 | 单层 `components/`                                                              | **两层**：`ui/`（公开）+ `design-system/`（基础实现）                                                                                                   |
| C4  | `design-system` 的暴露   | 全部导出                                                                        | **只导出 Provider 相关符号**；基础组件经 `src/ui/` 暴露                                                                                                 |
| C5  | 路径别名                 | `tsconfig.paths` + `@/` 导入                                                    | **禁用**，一律相对路径（维度 ⑤）                                                                                                                        |
| C6  | 图标库                   | 多图标库并存                                                                    | **唯一** `lucide-react`（见 component 规范）                                                                                                            |
| C7  | 动画方案                 | `tailwindcss-animate`（v3 插件）                                                | **`tw-animate-css`**（v4 兼容）                                                                                                                         |
| C8  | 运行时日志               | 组件内 `console.*`                                                              | **无运行时日志**（纯组件库）；构建 / 脚本的 `console.*` 属开发期诊断                                                                                    |
| C9  | 测试覆盖率门槛           | 强制 80%                                                                        | **无门槛**（`vitest.config.ts` 未配 `thresholds`）                                                                                                      |
| C10 | React 19 的 `forwardRef` | 外部建议「React 19 弃用 `forwardRef`」                                          | **保留本库规范** —— 全库 **49** 处 `forwardRef` + `displayName`；外部规则的依据是「`use()` 替代 `useContext()`」，与 **ref 转发无关**（见 §1.1 约束 2） |
| C11 | React 19 并发 API        | 外部建议广泛采用 `use` / `useTransition` / `useDeferredValue` / `useOptimistic` | 全库**零**使用                                                                                                                                          | **不强制引入** —— 并发特性服务**应用层**场景，由**消费方**决定；本库的职责是**不拖慢**消费方（见 §1.1）    |
| C12 | 组件内部导入方式         | 外部建议「直接导入，避免 barrel」                                               | **必须**用 barrel 导出（`export *`）                                                                                                                    | **部分采纳** —— **对外**必须走 barrel（公开 API 契约）；**内部**运行时 barrel 导入会**循环依赖**（维度 ⑬） |
| C13 | 复合组件形态             | 外部倾向静态属性复合（`.Root` / `.Trigger`）                                    | 全库**零**静态属性挂载，一律扁平多导出                                                                                                                  | **保留本库规范** —— 详见 [`component-api-standard.md`](./component-api-standard.md) §M+3 C1                |
| C14 | 数据获取 / SSR           | 外部建议 `Promise.all` 并行 / `React.cache` 去重                                | 本库**无**数据获取层、**无** SSR 层                                                                                                                     | **不适用** —— 本库是**纯组件库**（见 `spec-index.md`「不存在的约定」）                                     |

---

## M+4. 模块检查清单

### 新增模块时

- [ ] 目录归属正确（§2.2）
- [ ] 未使用 `@/` 别名（维度 ⑤）
- [ ] 依赖方向向下（维度 ②）
- [ ] 有 barrel 出口（维度 ④）
- [ ] **无** barrel 运行时循环导入（维度 ⑬）
- [ ] 新增第三方依赖已同步 `package.json` 分区 + `tsup.config.ts` 的 `external`（维度 ⑧⑨）
- [ ] 类型导入用 `import type`（维度 ⑩）
- [ ] 测试 / Story 在 `__tests__/` 下（维度 ⑪）
- [ ] 文件头 JSDoc 完整（见 [`code-annotation-standard.md`](./code-annotation-standard.md) §3.1）
- [ ] 未用**手写** `useEffect` + `useState` 模拟 React 19 并发语义（§1.1 约束 3）

### 改架构时

- [ ] §2.1 目录树已同步更新
- [ ] §4.1 依赖图未产生环
- [ ] §3 的 barrel 导出段已更新
- [ ] 13 项维度全部重跑

### 发布前

- [ ] `pnpm build` 产物齐全（维度 ⑫）
- [ ] `pnpm test` / `pnpm type-check` / `pnpm lint` / `pnpm storybook:build` 全绿
- [ ] README / README.en.md 与 `package.json#version` 一致
- [ ] 导出变更已记入 CHANGELOG（见 [`code-quality.md`](./code-quality.md) §4.4）

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0 | 2026-11-02 | **全文重写 —— 对齐 `easbot-ui` 组件库真实实现**（原 v1.6.0 描述的是 `easbot-doc` 文档门户 —— Nextra 4 / Next.js 16 / Algolia / `content/<locale>/` / `sourceType` 判别式联合，与本库**完全无关**）。① 概述重写 —— 明确本库是**独立单包 React 组件库**（非文档门户、非 monorepo）；② §1 技术基线全换（tsup 8.5 / Tailwind v4 / Radix 28 peer / Zod 4.6.7 / Vitest 5 / Storybook 10 / Biome 2.6.4）；③ §2 目录树改为真实的**七层**布局（ui 54 / design-system 48 / models 5 / utils 10 / hooks 3 / providers 2 / theme / types），补 `src/theme/`「资源层，不进 barrel」的定位，新增 §2.2「各层职责 + 不得包含什么 + 是否进公开 API」三列表、§2.3「死代码 / 残缺资产」表（`src/theme/styles.css` 的 `../../../../repository/` 失效路径、`globals.css` 的未安装插件 `@tailwindcss/typography`、7 套未发布主题、2 个未挂 script 的历史脚本）；④ §3 新增「公开 API 出口」——`src/index.ts` 的 6 段导出（顺序固定）+ 5 条规则；⑤ §4 依赖方向全面重写 —— 给出**实测**的允许边表（含 `src/ui/` → `src/models/` 的 7 处**全为 `import type`**）+ **5 条硬约束** + §4.3 `cn()` 唯一实现（`src/utils/classnames.ts` vs DS 局部副本）；⑥ §5 构建链路改为**两步构建**（tsup 出 JS+dts / `@tailwindcss/cli` 出 CSS），补 tsup 12 项配置要点 + **49 个 external** 的 6 组分类 + 消费方零配置契约（`exports` 仅 3 条，**无 `./fonts.css`**）；⑦ §6 测试基线（jsdom / globals / `tests/setup.ts` / `css:false` / 30s 超时 / v8 覆盖率 + 7 类 polyfill 全局化）；⑧ §7 Storybook 基线（`@storybook/react-vite` / 5 addon / **不装 `addon-vitest`** / `viteFinal` 必须注入 `@tailwindcss/vite` + 主题双机制 `data-theme` 属性 vs class）；⑨ §8 TypeScript 严格项（`verbatimModuleSyntax` / `Bundler` / `noUncheckedIndexedAccess` / **无 `paths` 无 `baseUrl`** / `noEmit`）；⑩ 维度由 12 项（Nextra 专属）改为 **12 项**（全部对齐组件库）：目录齐全 / 依赖方向 / models 必须 `import type` / 组件 barrel / 禁 `@/` + 禁 `paths` / 禁 `export default` / barrel 只含导出 / 依赖分区 + external 同步 / Radix peer 全 optional / 类型导入显式化 / 测试与 Story 在 `__tests__/` / 构建产物与 exports 契约；⑪ §M+1 基线全换（0.3.31 / 54 组件 / 55+6 导出段 / 13 schema / 49 external / 18+30 依赖 / 692+692 变量 / 109 测试 / 81 Story / 21 script）；⑫ §M+2 豁免清单扩为 9 条（含 DS 局部 `cn()` / 工具侧 `@` alias / `src/theme/` 死代码 / 表格的生物式分层 / typography 双 barrel）；⑬ **新增 §M+3 冲突裁决 9 条**（产物目录 / 样式产出方式 / 组件分层 / DS 暴露面 / 路径别名 / 图标库 / 动画方案 / 运行时日志 / 覆盖率门槛）。**本规范从「文档门户架构规范」彻底转为「组件库架构规范」**。 |
| 2.0.1 | 2026-11-02 | **同步字体 / 图标字体的 opt-in 交付链路 + 主题 CSS 单独产出**。① §5.1 构建链路图由「两步构建」改为「**四步构建**」 —— `tsup && build:css && build:fonts && build:icons`；② **字体产物改为「只生成 CSS，不复制二进制」** —— 字体是**静态资源**，保留在仓库根的 `public/font/` 与 `public/icon/`（**与消费方的静态资源目录同名同结构**），产物按 `/font/xxx` / `/icon/xxx` 引用即自动对应；`src/` 下**只留 CSS 声明源**（`fonts.ts` / `iconfont.css` / `officefont.css` / `icons.ts`）；③ **`exports` 由 3 条扩为 7 条** —— 新增 `./fonts.css` / `./iconfont.css` / `./theme-light.css` / `./theme-dark.css`；④ §2.2 与 §5.3 中「`exports` 无 `./fonts.css`」「该注释目前是失效的」两处**失效声明作废**（已生效）；⑤ §M+1 基线同步（npm 包 23.9 MB → **1.5 MB**，`dist/` 内字体二进制 **0 个**）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.1.0 | 2026-11-04 | **新增 React 19 基线 + 维度 ⑬，基线数据全量校正**。① **新增 §1.1「React 19 基线（⛔ 硬性约束）」** —— 确立 5 条约束：① 必须用 React 19 可用的 API 语义；② **必须保留** `forwardRef` + `displayName`（明确外部「React 19 弃用 `forwardRef`」的说法**不成立** —— 那个规则的依据是「`use()` 替代 `useContext()`」，与 ref 转发**无关**）；③ **禁止**用手写 `useEffect` + `useState` **模拟** React 19 并发语义；④ `useContext` **继续**用于 Context 读取（本库 16 处全在顶层，`use()` 的条件调用能力会诱使破坏「无条件订阅」语义）；⑤ 禁止引入 React 18 及以下的已废弃 API；② **扫描维度由 12 项增至 13 项** —— 新增 ⑬「禁止 barrel 运行时循环导入」（**明确「对外走 barrel」与「内部不走 barrel」不矛盾**：前者是公开 API 契约，后者是循环依赖防护）；基线 **2 处**（`TableCardContainer.tsx:1` / `CellValue.tsx:6`）；③ **§M+1 基线全量校正** —— `external` 49（**此前误记 56**，实测 `tsup.config.ts` 为 React 4 + Radix 28 + 其他 17）/ `dependencies` **17**（此前误记 18）/ 测试文件 **123**（此前 111）/ Story **79**（此前 77）/ 新增 React 版本（19.3.1）/ 文案域 21 + 聚合表 1 / `React.memo` 7 / 动态 `import()` 0 / barrel 运行时循环 2；④ **§M+3 冲突裁决由 9 条增至 14 条（C10~C14）** —— **保留** `forwardRef`（C10）、**不强制引入** React 19 并发 API（C11，说明其服务**应用层**场景）、**部分采纳** barrel 建议（C12）、**保留**扁平多导出（C13）、**不适用**数据获取 / SSR 优化（C14，本库是纯组件库）；⑤ §M+4 检查清单新增「无 barrel 运行时循环导入」与「未用手写模式模拟并发语义」两条；⑥ frontmatter 补 2 份 `related` 与版本升 **2.1.0**。**规范条文本身不过期，只有数据基准会过期**。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.2.0 | 2026-11-05 | **全量评审修正 + 探针接入**。① **维度⑥判定修正** —— 「48 处全部在 …」的枚举与 §M+1 自相矛盾（列举仅 33 处），改为实测 **57 处**及真实分布（table 28 / ui 其他 17 / typings 9 / ds 1 / theme-provider 1 / classnames 1）；② **§M+1 基线校正** —— script 数 23 → **27**（`check:spec` / `probe` 等新增）；③ **typography 豁免行修正** —— 实测仅 `index.tsx` 存在（无 `index.ts`），与 component 维度⑫「Bundler 下 `.tsx` 优先解析」口径统一，消除「`index.ts` 胜出」的跨文档矛盾；④ **§2.1 目录树补实存的 `src/components/` 应用层**；⑤ **C10 行修复表格断裂**（多出的一列并入裁决）；⑥ **§M+2 登记 G-AR1** —— `notify-provider` 反向依赖 `src/ui/toast` / `use-toast`（硬约束 5 违规，`pnpm probe arch` 可复现，待修）；⑦ scripts 树更新 —— `check-i18n.ts` / `check-spec.ts` 迁至 `spec/scripts/`，`spec/` 计数 14 份。**规范条文本身不过期，只有数据基准会过期**。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`model-standard.md`](./model-standard.md) —— 数据契约规范（`src/models/` 的写法）
- [`component-standard.md`](./component-standard.md) —— 组件规范（`src/ui/` 的目录与实现）
- [`css-standard.md`](./css-standard.md) —— 样式与主题规范（`src/theme/styles.css` 与主题变量）
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试规范
- [`storybook-standard.md`](./storybook-standard.md) —— Storybook 规范
- [`code-quality.md`](./code-quality.md) —— 代码质量门禁（依赖分区 / lint / 发布自检）
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc 规范
- [`package.json`](../package.json) / [`tsup.config.ts`](../tsup.config.ts) / [`vitest.config.ts`](../vitest.config.ts) / [`biome.json`](../biome.json) —— 工程化配置真值源
