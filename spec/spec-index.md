---
name: spec-index
description: 该文档是 easbot-ui spec/ 目录的唯一索引与导航入口，列出全部 14 份规范文档并按主题分类，提供按场景的「该读哪份」建议、全库可复跑的规范自检命令（探针脚本），以及文档维护的防腐规则。当需要查找某项规范、开始编写组件、或做提交前自检时参考本索引。
category: specification
version: 8.2.0
baseline-date: 2026-11-05
tags: [easbot-ui, spec, index, navigation, checklist]
related:
  - component-standard.md
  - css-standard.md
  - architecture-standard.md
  - model-standard.md
  - testing-guidelines.md
  - storybook-standard.md
  - code-annotation-standard.md
  - code-quality.md
  - i18n-standard.md
  - a11y-interaction-standard.md
  - component-api-standard.md
  - react-performance-standard.md
  - probe-script-standard.md
---

# EASBot UI 规范文档索引 (Specification Documents Index)

> **本索引是 `spec/` 目录的唯一真值源**，列出全部规范文档并按主题分类。
>
> **v8.0.0 变更**（2026-11-04）：**新增 3 份规范** ——
> [`a11y-interaction-standard.md`](./a11y-interaction-standard.md)（无障碍与交互）、
> [`component-api-standard.md`](./component-api-standard.md)（公开 API 设计）、
> [`react-performance-standard.md`](./react-performance-standard.md)（React 渲染与性能）；
> 并同步修正 **5 份**既有规范（`css` / `component` / `architecture` / `testing` / `i18n`），
> 扫描维度总数由 **97** 增至 **136** 项。

---

## 概述 (Overview)

`spec/` 是本库的**开发宪法**：定义「必须怎么做 / 禁止怎么做 / 怎么检查 / 怎么改」。

### 源码分层（真值源）

本库采用**两层组件架构** + **四层支撑模块** + **一个资源层**：

```
src/
├── ui/                 # 公开组件层（56 个组件目录）—— 对外 API 的实现
├── design-system/      # 基础实现层（46 个组件 + Provider + hooks + lib）
├── models/             # 数据契约层（Zod Schema，5 文件 / 13 个 schema）
├── utils/              # 通用工具层
├── hooks/              # 通用 React Hook
├── providers/          # 上下文 Provider
├── theme/              # 主题资源层（styles.css 编译入口 / themes/ 变量 / fonts/ 字体 / images/ 图标 / styles/ 辅助样式）
└── types/              # 类型声明
```

| 层                   | 职责                                                            | 是否进公开 API                                            |
| -------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `src/ui/`            | 对外暴露的组件实现                                              | ✅ 经 `src/index.ts` → `src/ui`                           |
| `src/design-system/` | 基础组件 + `DesignSystemProvider` 组合                          | ✅ 仅导出 Provider 相关符号                               |
| `src/models/`        | Zod Schema（运行时校验器）+ `z.infer` 类型                      | ✅ 经 `src/index.ts` → `models`                           |
| `src/utils/`         | 通用工具（`cn` / `object` / `locale` …）                        | ✅ 经 `src/index.ts` → `utils`                            |
| `src/hooks/`         | `useDevice` / `useLocale`                                       | ✅ 经 `src/index.ts` → `hooks`                            |
| `src/providers/`     | `LocaleProvider`                                                | ✅ 经 `src/index.ts` → `providers`                        |
| `src/theme/`         | 主题资源（**唯一 CSS 入口** `styles.css` / 变量 / 字体 / 图标） | ❌ 资源层，无运行时 API（`index.ts` 的 `Theme` 类型除外） |

> ⚠️ **`src/index.ts` 是 tsup 的唯一构建入口** —— 任何组件 / 类型 / Schema 若未在此 barrel 导出，
> **不会**进入 `dist/index.d.ts` 与 `dist/index.mjs`。
>
> ⚠️ **`src/ui/` 与 `src/design-system/components/ui/` 存在同名组件** —— 两者都进入 bundle，
> 但只有 `src/ui/` 的版本从 barrel 导出（它附带额外的 Props 类型）。
>
> ⚠️ **CSS 编译入口唯一** —— 是 [`src/theme/styles.css`](./css-standard.md)，**不是** `src/styles.css`。
> 详见 [`css-standard.md`](./css-standard.md) §1。
>
> 📌 **完整的层职责、依赖方向图与构建链路**见
> [`architecture-standard.md`](./architecture-standard.md)。

**与其它文档体系的分工**：

| 产物类型                 | 归属                                       | 关注点                   |
| ------------------------ | ------------------------------------------ | ------------------------ |
| **项目级规范**（本目录） | `spec/`                                    | 「必须 / 禁止 / 怎么查」 |
| **消费方文档**           | `docs/`                                    | 「怎么用这个组件」       |
| 任务级规格               | `.easbot/knowledge/docs/dev/<topic>/`      | 「这次要做什么」         |
| 决策记录                 | `docs/decisions/`（ADR，现有 0001 号）     | 「为什么这么选」         |
| 项目入口                 | `README.md` / `README.en.md` / `AGENTS.md` | 「这个项目是什么」       |

> 📌 **ADR 体系（`docs/decisions/`）仅用于破坏性变更记录**（现有 `0001-src-ui-defect-remediation.md`）。
> `spec/` 各文档的 frontmatter **不含** `adrs` 字段；源码注释**不引用** ADR / 决策编号
> （[`code-annotation-standard.md`](./code-annotation-standard.md) §2.2 的要求）——
> 引用决策请在 commit message 或 PR 描述中说明。

---

## 文档分类 (Document Categories)

### 1. 组件开发

| 文档                                               | 用途                                                                                                                                           | 唯一真值源 / 核验                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`component-standard.md`](./component-standard.md) | **组件开发规范**：目录 / 命名 / 导出 / `forwardRef` / props / `cva` / `cn()` / 图标库 / barrel（**12 项维度**）                                | `src/ui/<component>/` 56 个目录的真实结构    |
| [`css-standard.md`](./css-standard.md)             | **样式与主题规范**：构建链路 / `src/theme/` 目录布局 / CSS 变量命名 / 主题双文件 / `@theme inline` / `dark` 变体 / 层叠层顺序（**17 项维度**） | `src/theme/styles.css` + `src/theme/themes/` |

### 2. 架构与契约

| 文档                                                     | 用途                                                                                             | 唯一真值源 / 核验                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [`architecture-standard.md`](./architecture-standard.md) | **架构规范**：七层源码布局 / 模块依赖方向 / 构建链路 / exports 契约 / TS 严格项（**13 项维度**） | `src/index.ts` + `tsup.config.ts` + `package.json` + `vitest.config.ts` |
| [`model-standard.md`](./model-standard.md)               | **数据契约规范**：Zod schema 写法 / 递归结构 / Zod 与 TS 分工（**10 项维度**）                   | `src/models/` 的 5 个文件（13 个 schema）                               |

### 3. 质量保障

| 文档                                               | 用途                                                                                                           | 唯一真值源 / 核验                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [`testing-guidelines.md`](./testing-guidelines.md) | **测试规范**：Vitest+jsdom 配置 / 用例结构 / 断言选型 / **无障碍断言专项** / mock 与 polyfill（**11 项维度**） | `vitest.config.ts` + `tests/setup.ts`           |
| [`storybook-standard.md`](./storybook-standard.md) | **Storybook 规范**：CSF3 / meta / story / argTypes / 装饰器 / 主题切换（**11 项维度**）                        | `.storybook/main.ts` + `.storybook/preview.tsx` |

### 4. 交互与体验

| 文档                                                               | 用途                                                                                                                                     | 唯一真值源 / 核验                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`a11y-interaction-standard.md`](./a11y-interaction-standard.md)   | **无障碍与交互规范**：可访问名称 / 语义与键盘可达 / 焦点管理 / ARIA 状态 / 表单标签 / 动效降级 / 触屏手势 / 文案排版（**12 项维度**）    | `src/ui/**` 的 `aria-*` / `tabIndex` / `focus-visible` 实测 |
| [`component-api-standard.md`](./component-api-standard.md)         | **公开 API 设计规范**：布尔 prop 分级治理 / 复合组件形态 / `children` 与插槽优先 / Context 分层 / props 细则 / API 演进（**10 项维度**） | `src/ui/**` 的 props 定义 + `src/ui/table/context/`         |
| [`react-performance-standard.md`](./react-performance-standard.md) | **React 渲染与性能规范**：React 19 API 边界 / memoization 策略 / 重渲染控制 / 渲染期副作用禁令 / 加载成本 / 长列表（**10 项维度**）      | `src/ui/**` 的 hooks 使用 + `tsup.config.ts`                |

### 5. 工程化

| 文档                                                           | 用途                                                                                                             | 唯一真值源 / 核验                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`code-annotation-standard.md`](./code-annotation-standard.md) | **注释与 JSDoc 规范**：注解四要素 / ⛔ 7 类禁止内容 / 3 类头部模板（**9 项维度**）                               | `src/**/*.tsx` 的真实注解                                                                    |
| [`code-quality.md`](./code-quality.md)                         | **代码质量门禁**：Biome / TypeScript / 构建 / 依赖分区 / 发布自检（**11 项维度**）                               | `biome.json` + `tsconfig*.json` + `tsup.config.ts`                                           |
| [`i18n-standard.md`](./i18n-standard.md)                       | **内置 i18n 规范**：三层用法 / 文案表规范 / **文案排版** / 豁免清单 / 检查清单（**10 项维度**）                  | `src/utils/ui-message.ts` + `src/utils/component-messages.ts` + `spec/scripts/check-i18n.ts` |
| [`probe-script-standard.md`](./probe-script-standard.md)       | **探针脚本规范**：`spec/scripts/` 目录契约 / 硬性约束 / 判定语义与豁免 / 维度映射同步 / 基线刷新（**9 项维度**） | `spec/scripts/probe.ts` + `check-i18n.ts` + `check-spec.ts`                                  |

---

## 按场景选文档 (Selection Guide)

### 开始一个新组件

1. [`component-standard.md`](./component-standard.md) §1 目录契约 —— **先建 4 件套的目录骨架**
2. [`component-standard.md`](./component-standard.md) §3 实现契约 —— 导出 / forwardRef / props / cva / `cn()`
3. [`component-api-standard.md`](./component-api-standard.md) §1~§3 —— **props 形状**（布尔 ≤ 5 / 复合形态 / 插槽）
4. [`css-standard.md`](./css-standard.md) §3 —— 样式与 CSS 变量（**先确认变量已定义**）
5. [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §1~§5 —— **可访问名称 / 键盘可达 / ARIA / 表单标签**
6. [`testing-guidelines.md`](./testing-guidelines.md) §3 —— 测试骨架
7. [`storybook-standard.md`](./storybook-standard.md) §2 —— Story 骨架
8. [`code-annotation-standard.md`](./code-annotation-standard.md) §3.1 —— 文件头 JSDoc

> 📌 **一站式检查**：`component-standard.md` §M+4「新增组件检查清单」+ `testing-guidelines.md` §M+4 + `storybook-standard.md` §M+4。

### 修改已有组件

1. [`component-standard.md`](./component-standard.md) §M（12 项维度）
2. [`css-standard.md`](./css-standard.md) §M（17 项维度）—— 改了类名尤其必跑
3. [`testing-guidelines.md`](./testing-guidelines.md) §4.5 —— **改实现必须同步改断言**
4. [`code-annotation-standard.md`](./code-annotation-standard.md) §1.4 —— 改动即补注解

### 组件要显示固定文案 / 要支持中英切换

1. [`i18n-standard.md`](./i18n-standard.md) §1 核心原则 —— **P1~P6**（双语必配 / 语言由消费方注入 / 文案可覆盖）
2. [`i18n-standard.md`](./i18n-standard.md) §4 三种使用方式 —— `useComponentMessage` / `processUiMessage` / `messages` 覆盖
3. [`i18n-standard.md`](./i18n-standard.md) §5 内置文案表规范 —— 域分组 / key 命名 / 必备文案类别 / **§5.4 省略号 `…`** / **§5.5 `aria-label` 走 i18n**
4. [`i18n-standard.md`](./i18n-standard.md) §6 组件接入模板 —— `locale` 与 `messages` 两个 props
5. [`i18n-standard.md`](./i18n-standard.md) §9 检查清单 —— 提交前逐项打勾

> 📌 **新组件接入 i18n 的顺序**：先在 `src/utils/component-messages.ts` 补域（zh-CN + en-US 双语），
> 再在组件内 `useComponentMessage('<domain>', { locale, messages })` 取文案，最后跑 `pnpm check:i18n`。

### 组件有交互行为 / 要支持键盘与读屏

1. [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §1 —— **可访问名称**（图标按钮必须有 `aria-label`）
2. [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §2 —— **语义与键盘可达**（`role` + `tabIndex` + `onKeyDown` 三件套）
3. [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §3 —— **焦点管理**（`focus-visible` + `outline`）
4. [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §4 —— **ARIA 状态**（`aria-expanded` / `aria-selected` / `aria-busy` / `aria-live`）
5. [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §5 —— **表单标签关联**（`htmlFor` + `id` / `aria-describedby`）
6. [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §6 —— **动效降级**（`prefers-reduced-motion`）
7. [`testing-guidelines.md`](./testing-guidelines.md) §5A —— **无障碍断言**（`getByRole(..., { name })`）

> 📌 **最快的自检**：组件能否被**纯键盘**操作完整？图标按钮能否被**读屏**念出名字？

### 设计组件的 props / 收敛布尔 / 引入组合方式

1. [`component-api-standard.md`](./component-api-standard.md) §1 —— **布尔 prop 分级阈值**（≤ 5）与三种收敛策略
2. [`component-api-standard.md`](./component-api-standard.md) §2 —— **复合组件形态**（本库裁定扁平多导出）+ `asChild` 义务
3. [`component-api-standard.md`](./component-api-standard.md) §3 —— **`children` 与插槽优先于 `renderXxx`**
4. [`component-api-standard.md`](./component-api-standard.md) §4 —— **Context 三层**（Provider 独占状态 / 消费 Hook 抛错 / `state`-`actions`-`meta` 分离）
5. [`component-api-standard.md`](./component-api-standard.md) §5 —— **props 细则**（受控非受控配对 / cva 派生 / 回调命名）
6. [`component-api-standard.md`](./component-api-standard.md) §6 —— **API 演进**（变更分级 + 迁移指引格式）

### 组件渲染慢 / 重渲染多 / 包体积大

1. [`react-performance-standard.md`](./react-performance-standard.md) §1 —— **React 19 API 边界**（该用什么 / 不该用什么）
2. [`react-performance-standard.md`](./react-performance-standard.md) §2 —— **memoization 策略**（该用 / 不该用 + `memo` 的三个必要条件）
3. [`react-performance-standard.md`](./react-performance-standard.md) §3 —— **重渲染控制**（Context 订阅粒度 / 派生优于 effect）
4. [`react-performance-standard.md`](./react-performance-standard.md) §4 —— **渲染期副作用禁令**（禁 DOM 测量）
5. [`react-performance-standard.md`](./react-performance-standard.md) §5 —— **加载成本**（barrel / 命名空间导入 / 动态 import）
6. [`react-performance-standard.md`](./react-performance-standard.md) §6 —— **长列表虚拟化**（阈值 50）

> 📌 **先测再改** —— 用 React DevTools Profiler 确认「哪些子树真的重渲染了」，
> 再决定是否加 `memo`。**盲目加 `memo` 往往无效**（props 引用不稳 → 恒失效）。

### 写样式 / 调主题

1. [`css-standard.md`](./css-standard.md) §2 变量命名规则
2. [`css-standard.md`](./css-standard.md) §3 —— **三个高危坑**（token 注册 / `dark` 变体 / 未定义变量）
3. [`css-standard.md`](./css-standard.md) §4 选型规则（语义类 vs `var(--xxx)`）

### 定义数据结构 / 接后端契约

1. [`model-standard.md`](./model-standard.md) §4.1 **判定决策树** —— **先判断该不该用 Zod**
2. [`model-standard.md`](./model-standard.md) §2.1 标准模板 + §2.2 关键约定
3. [`model-standard.md`](./model-standard.md) §2.3 递归结构（`z.lazy` + `z.ZodType<T>`）
4. [`architecture-standard.md`](./architecture-standard.md) §4.2 五条硬约束 —— 确认依赖方向没破

> 📌 **最常见的误解** —— 「所有数据结构都用 Zod」。本库**不是**这样：
> 组件 props（含大量函数值）一律用**纯 TypeScript**，
> 只有**跨进程边界**或**需运行时校验**的结构才进 `src/models/`。
> 详见 [`model-standard.md`](./model-standard.md) §4。

### 新增目录 / 调整分层 / 改构建配置

1. [`architecture-standard.md`](./architecture-standard.md) §2.1 七层目录布局
2. [`architecture-standard.md`](./architecture-standard.md) §2.2 各层职责 + §4.1 依赖方向图
3. [`architecture-standard.md`](./architecture-standard.md) §5 构建链路（tsup 49 external + Tailwind 两步）
4. [`architecture-standard.md`](./architecture-standard.md) §8 TypeScript 严格项

### 排查「样式不生效」

按顺序排查：

| 步骤 | 检查                                                    | 依据                             |
| ---- | ------------------------------------------------------- | -------------------------------- |
| 1    | 类名是否**已注册为 token**？（`bg-primary` 这类语义类） | `css-standard.md` §3.1 / 维度 ①⑨ |
| 2    | CSS 变量是否**在主题文件里定义**？（light / dark 两处） | `css-standard.md` §3.3 / 维度 ⑤⑥ |
| 3    | 灰阶变量是否用了 `hsl()` 包裹？                         | `css-standard.md` §3.1 / 维度 ②  |
| 4    | `dark:` 变体是否走 `data-theme`（而非系统偏好）？       | `css-standard.md` §3.2 / 维度 ④  |
| 5    | `pnpm build:css` 后产物里**真的生成了**这条规则吗？     | `css-standard.md` 维度 ⑨         |

### 排查「交互不可达 / 读屏念不出」

按顺序排查：

| 步骤 | 检查                                                                 | 依据                                         |
| ---- | -------------------------------------------------------------------- | -------------------------------------------- |
| 1    | 图标按钮有 `aria-label` 吗？（`title` **不算**）                     | `a11y-interaction-standard.md` §1.1 / 维度 ① |
| 2    | 非语义元素的 `onClick` 补齐 `role` + `tabIndex` + `onKeyDown` 了吗？ | 同文 §2.2 / 维度 ⑦                           |
| 3    | 焦点圈还在吗？（`outline-none` 无 `focus-visible` 替代）             | 同文 §3.2 / 维度 ②                           |
| 4    | Tab 能到达所有交互元素吗？（正数 `tabIndex` 会打乱顺序）             | 同文 §2.3 / 维度 ⑧                           |
| 5    | 状态变化有 ARIA 暴露吗？（`aria-expanded` / `aria-selected`）        | 同文 §4.1                                    |
| 6    | 异步内容有 `aria-live` 吗？                                          | 同文 §4.2                                    |

### 排查「重渲染过多 / 包体积大」

| 步骤 | 检查                                                         | 依据                                 |
| ---- | ------------------------------------------------------------ | ------------------------------------ |
| 1    | `memo` 组件的 props 引用**稳定**吗？（不稳 → `memo` 恒失效） | `react-performance-standard.md` §2.2 |
| 2    | Context 值按 `state` / `actions` / `config` 分层了吗？       | 同文 §3.1                            |
| 3    | 有没有用 `useEffect` 同步**本可派生**的状态？                | 同文 §3.4                            |
| 4    | 组件在模块级定义吗？（函数体内定义 → 子树重挂载）            | 同文 §3.3                            |
| 5    | 第三方库是具名导入吗？（命名空间 → 丢 tree-shaking）         | 同文 §5.2                            |
| 6    | 重组件（图表 / 日历 / 轮播）需要懒加载吗？                   | 同文 §5.3                            |

### 提交前自检

```bash
pnpm build && pnpm test && pnpm type-check && pnpm lint && pnpm storybook:build
```

> 详细清单见 [`code-quality.md`](./code-quality.md) §4.4。
> **规范维度自检**见下方 §「规范自检命令」。

### 发布新版本

1. [`code-quality.md`](./code-quality.md) §4.2 依赖红线
2. [`code-quality.md`](./code-quality.md) §4.3 `exports` / `files` 契约
3. [`code-quality.md`](./code-quality.md) §4.4 发布前自检
4. [`component-standard.md`](./component-standard.md) §3.9 公开 API 契约（导出变更 → README + CHANGELOG + 版本 bump）

---

## 规范自检命令（一次跑全库）

> ⛔ **执行纪律**：**禁止按文档 / 按组件分批跑** —— 分批扫描必然漏。模式必须**一次跑全库**。
>
> 每份规范文档的 §M 章节有**该文档专属**的维度命令（命令 + 判定 + 修正模式三件套）。
> 下面是**跨文档的汇总入口**。

### 快速总览（一眼看出是否有违规）

全部探针已沉淀为 [`spec/scripts/probe.ts`](./scripts/probe.ts)（**零外部依赖**，tsx 直跑，PowerShell 友好 —— 不依赖 `rg` / GNU grep）：

```bash
# 一键全跑（推荐 —— 等价于依次执行下表全部探针）
pnpm probe all

# 按域单跑（名称见下表）
pnpm probe <name>
```

| 探针名              | 覆盖维度                                                                             | 对应规范                                       |
| ------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `component`         | 维度 ①②（目录四件套 / `export default`）                                             | `component-standard.md`                        |
| `css`               | 维度 ⑤⑥⑫（主题变量集合 / 编译入口唯一）；`--with-build` 时加维度 ⑨（产物检查）       | `css-standard.md`                              |
| `arch`              | 维度 ②③⑤⑥⑧（依赖方向 / models `import type` / `@/` 别名 / external 同步 / 依赖分区） | `architecture-standard.md` + `code-quality.md` |
| `model`             | 维度 ①③④⑧⑨⑩                                                                          | `model-standard.md`                            |
| `testing`           | 维度 ②（`jest.*`）+ polyfill 重复定义                                                | `testing-guidelines.md`                        |
| `annotation`        | 维度 ①⑧ 可自动判定部分（文件头块注释 / 人称称呼 / spec 路径 / ADR 引用）             | `code-annotation-standard.md`                  |
| `baseline`          | 输出本节「全库现状」的全部基线数字（一键刷新数据基准）                               | 本索引 §「全库现状」                           |
| `api` `a11y` `perf` | ——                                                                                   | 由 `pnpm check:spec` 覆盖（探针自动转发）      |
| `i18n`              | 维度 ①③④⑤⑥                                                                           | 由 `pnpm check:i18n` 覆盖（探针自动转发）      |

```bash
# 既有检查脚本（probe all 亦会调用）
pnpm check:i18n   # i18n 维度 ①③④⑤⑥ —— 当前 0 违规
pnpm check:spec   # a11y / component-api / react-performance / css⑮⑯⑰ —— 当前 0 ERROR（G-A3 / G-A7 已消除）
```

> 📌 **每条维度的完整判定规则与修正模式**，见对应文档的 §M 章节。
> 📌 `rg` 在部分 Windows 环境不可用 —— **探针是唯一保证可复跑的口径**；
> 各文档 §M 内的手工命令仅作规则说明（人工深挖时可选用）。

---

## 全库现状（2026-11-05 基线）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。完整数据见各文档的 §M+1。

| 维度                                               | 现状                                                                                                                    | 详情                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 公开组件目录（`src/ui/`）                          | **56**                                                                                                                  | `architecture-standard.md` §M+1      |
| 基础实现组件（`src/design-system/components/ui/`） | **46**                                                                                                                  | `architecture-standard.md` §M+1      |
| 测试文件（`src/**/*.{test.ts,test.tsx}`）          | **123**                                                                                                                 | `testing-guidelines.md` §M+1         |
| Story 文件（`src/**/*.stories.tsx`）               | **79**                                                                                                                  | `storybook-standard.md` §M+1         |
| Zod Schema 数                                      | **15**（`models/` 13 + `utils/` 2）                                                                                     | `model-standard.md` §M+1             |
| 实现文件 `export default`                          | **32** 处 / 32 文件（`src/ui` 实现 tsx，排除 `__tests__` / stories / examples；全 src 口径 57 —— 见 architecture §M+1） | `architecture-standard.md` §M+1      |
| 主题变量 light/dark                                | 706 / 706，**集合完全一致**                                                                                             | `css-standard.md` §M+1               |
| `jest.*` 命中                                      | **0**（已全量迁移 `vi.*`，G6 已消除）                                                                                   | `testing-guidelines.md` §M+1         |
| TS1484（类型导入未显式标记）命中                   | **0**（已全量修复）                                                                                                     | `code-quality.md` §M+1               |
| 组件文案域数（`ComponentMessageDomain`）           | **21**（+ 1 个聚合表 `componentMessages`）                                                                              | `i18n-standard.md` §5.1              |
| 内置文案表数（`src/utils/component-messages.ts`）  | **21**（每表 zh-CN + en-US 双语）                                                                                       | `i18n-standard.md` §5.1              |
| i18n 扫描违规数（`pnpm check:i18n`）               | **0**（维度①③④⑤⑥ 全通过）                                                                                               | `i18n-standard.md` §7                |
| **React 版本**                                     | peer `^19.0.0` / 实测 **19.3.1**                                                                                        | `architecture-standard.md` §1.1      |
| `React.memo` 命中                                  | **7**（全在 `src/ui/table/atoms/`）                                                                                     | `react-performance-standard.md` §M+1 |
| 动态 `import()` 命中                               | **0**                                                                                                                   | `react-performance-standard.md` §M+1 |
| 布尔 prop 声明                                     | **140** 处 / 59 文件（`src/ui`，ts+tsx，排除 `__tests__` / stories）                                                    | `component-api-standard.md` §M+1     |
| `focus-visible` 命中                               | **90** 行 / 42 文件（`src/` 全域，按行计数）                                                                            | `a11y-interaction-standard.md` §M+1  |
| `transition-all` 命中                              | **12** 处（实现文件，排除 `__tests__` / stories）                                                                       | `a11y-interaction-standard.md` §M+1  |
| `prefers-reduced-motion` 命中                      | `styles.css` 全局兜底已补（2026-11-05，G-A3 已消除）                                                                    | `a11y-interaction-standard.md` §M+1  |
| `check:spec` 现状                                  | **0 ERROR**（2026-11-05：a11y⑥ / a11y⑩·i18n⑨ 全部消除）                                                                 | `spec/scripts/check-spec.ts` 实跑    |
| **规范维度总数**                                   | **145 项**（14 份文档，见下方分解）                                                                                     | 各文档 §M                            |
| `tsup` external 包数                               | **49**（含 28 个 Radix）                                                                                                | `architecture-standard.md` §M+1      |

### 规范维度分解（136 项）

| 规范                                | 维度数  | 变化                    |
| ----------------------------------- | ------- | ----------------------- |
| `component-standard.md`             | 12      | —                       |
| `css-standard.md`                   | 17      | **14 → 17**（新增 ⑮⑯⑰） |
| `architecture-standard.md`          | 13      | **12 → 13**（新增 ⑬）   |
| `model-standard.md`                 | 10      | —                       |
| `testing-guidelines.md`             | 11      | **10 → 11**（新增 ⑪）   |
| `storybook-standard.md`             | 11      | —                       |
| `code-annotation-standard.md`       | 9       | —                       |
| `code-quality.md`                   | 11      | —                       |
| `i18n-standard.md`                  | 10      | **8 → 10**（新增 ⑨⑩）   |
| **`a11y-interaction-standard.md`**  | **12**  | **新增**                |
| **`component-api-standard.md`**     | **10**  | **新增**                |
| **`react-performance-standard.md`** | **10**  | **新增**                |
| **`probe-script-standard.md`**      | **9**   | **新增**（v8.1.0）      |
| **合计**                            | **145** | **97 → 145**（+48）     |

---

## 已知缺口（待补齐）

> 📌 **缺口分两类**：
>
> - **G1~G10** —— 既有文档登记的存量缺口（原有编号，保留）；
> - **G-A1~A12 / G-P1~P6 / G-R1~R5** —— 三份新规范登记的缺口（按域前缀区分）。
>
> **完整明细见各规范文档的 §M+2** —— 本表只做汇总导航。

| #                       | 缺口                                                                                                                                                                                                                                             | 涉及文档                                                               | 状态                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------- |
| G1                      | `src/ui/alert-dialog/alert-dialog-modal.tsx` 未纳入 barrel 导出，且无 test / stories                                                                                                                                                             | `component-standard.md` §M+2 H2                                        | 待单独排期                             |
| G2                      | `src/ui/button/index.ts` 的 `declare module` 增强声明了实现中不存在的字段（`swipeThreshold` / `pressureConfig`）                                                                                                                                 | `component-standard.md` §M+2 H4                                        | 待单独排期（类型契约与实现不一致）     |
| G3                      | **116** 个实现文件缺文件头块注释（2026-11-05 实测；探针 WARN）                                                                                                                                                                                   | `code-annotation-standard.md` §M+2                                     | 存量豁免（改动即补）                   |
| G4                      | `tests/polyfills.ts` 共享 helper 已建立，但仍有测试文件重复定义 `ResizeObserverStub`                                                                                                                                                             | `testing-guidelines.md` §M+2                                           | 存量豁免（第 5 处须抽取）              |
| G5                      | `src/ui/command/` 与 `src/ui/dialog/` 的测试混用 `it(` / `test(`                                                                                                                                                                                 | `testing-guidelines.md` §M+2                                           | 存量豁免                               |
| G6                      | ~~14 个测试文件仍用 `jest.*` API~~ —— **已消除**（2026-11-05 实测全库 **0** 命中）                                                                                                                                                               | `testing-guidelines.md` §M+2                                           | 已消除                                 |
| G7                      | 部分测试未覆盖「状态 / 交互 / 无障碍」全部四维度                                                                                                                                                                                                 | `testing-guidelines.md` §M+2                                           | 存量豁免（关键词近似判定，需人工确认） |
| G8                      | `src/design-system/index.tsx` 使用 `export default DesignSystemProvider`                                                                                                                                                                         | `component-standard.md` §M+2                                           | 存量豁免（barrel 不传播 default）      |
| G9                      | ~~`date` 域的 `processUiMessage` 调用**未透传 `locale`**~~ —— **已修复**（`validation.ts` / `date-utils.ts` / `timezone-utils.ts` / `mobile-utils.ts` / `hooks/use-date-optimization.ts` / `view/*` 全部透传 `locale`）                          | `i18n-standard.md` §4.2                                                | 已消除                                 |
| G10                     | ~~已接 `useComponentMessage` 但**未透出 `locale` / `messages` props** 的组件~~ —— **已修复**（`alert` / `alert-dialog` / `combobox` / `select` / `tag` / `toast` / `tree` / `typography` / `icon` 均已透出；`card` / `form` 两个**空域已删除**） | `i18n-standard.md` §6.1                                                | 已消除                                 |
| **G-A10**               | ~~18 处图标按钮缺可访问名称 + 6 处日期后缀图标键盘不可达~~ —— **已消除**（2026-11-05 补 `aria-label` + 键盘三件套）                                                                                                                              | `a11y-interaction-standard.md` §M+2                                    | ✅ 已消除                              |
| **G-A11**               | ~~6 处非语义元素 `onClick` 键盘不可达~~ —— **已消除**（2026-11-05 补 `role`/`tabIndex`/`onKeyDown`）                                                                                                                                             | `a11y-interaction-standard.md` §M+2                                    | ✅ 已消除                              |
| **G-A3**                | ~~animate-ripple / animate-gradient / animate-spin 无 reduced-motion 兜底~~ —— **已消除**（2026-11-05 `styles.css` 补全局兜底）                                                                                                                  | `a11y-interaction-standard.md` §M+2                                    | ✅ 已消除                              |
| **G-A4**                | `transition-all` **12** 处存量待收窄为具体属性（`check:spec` a11y⑤/css⑮ 已列存量豁免）                                                                                                                                                           | `a11y-interaction-standard.md` §M+2                                    | ⚠️ 改动即补                            |
| **G-A7**                | ~~文案中 `...` 三点 40 处~~ —— **已消除**（2026-11-05 全量改 `…`）                                                                                                                                                                               | `a11y-interaction-standard.md` §M+2                                    | ✅ 已消除                              |
| **G-A2**                | `input` / `textarea` / `switch` **无内建 label 关联**（完全依赖调用方传 `aria-label`）                                                                                                                                                           | `a11y-interaction-standard.md` §M+2                                    | ❌ **P1 待修**                         |
| **G-A5**                | 全库**零** `overscroll-behavior` —— 浮层滚动穿透                                                                                                                                                                                                 | `a11y-interaction-standard.md` §M+2                                    | ❌ P2 待修                             |
| **G-A9**                | 深色主题**无** `color-scheme: dark` —— 滚动条 / 原生控件仍是浅色                                                                                                                                                                                 | `css-standard.md` §2.5 + `a11y-interaction-standard.md` §M+2（双登记） | ❌ P2 待修                             |
| **G-A8**                | `src/ui/date/` **零** `Intl.*` —— 默认日期格式不随 locale 变                                                                                                                                                                                     | `a11y-interaction-standard.md` §M+2                                    | ❌ P2 待修                             |
| **G-A1 / G-A6 / G-A12** | Toast / Table 异步态无 live region / 列宽拖拽缺键盘替代 / `alt="card"` 无意义 alt                                                                                                                                                                | `a11y-interaction-standard.md` §M+2                                    | ❌ P2 待修                             |
| **G-P2**                | ~~barrel 运行时循环导入 2 处~~ —— **已消除**（2026-11-05 改直连源模块）                                                                                                                                                                          | `component-api-standard.md` §M+2                                       | ✅ 已消除                              |
| **G-P1**                | **52 / 56** 个组件**不暴露** `asChild`                                                                                                                                                                                                           | `component-api-standard.md` §M+2                                       | ⚠️ 逐步补齐（需版本 bump）             |
| **G-P3 / G-P4**         | `file/types.ts` 布尔 **6** 个 / `TableFixedColumn.tsx` 布尔 **6** 个                                                                                                                                                                             | `component-api-standard.md` §M+2                                       | ⚠️ 下次破坏性窗口处理                  |
| **G-P5**                | `memo` 仅 **7** 个组件（全在 `src/ui/table/atoms/`）—— 与 G-R3 同源                                                                                                                                                                              | `component-api-standard.md` §M+2                                       | ℹ️ 可选优化                            |
| **G-P6**                | 零动态 `import()` —— 56 个组件 + `recharts` / `react-day-picker` / `embla` / `vaul` 全部静态耦合（与 G-R1 同源）                                                                                                                                 | `component-api-standard.md` §M+2                                       | ⚠️ 需消费方文档示范                    |
| **G-AR1**               | ~~notify-provider 反向依赖 src/ui/toast~~ —— **已消除**（2026-11-05 迁至 `src/ui/toast/notify-provider.tsx`，包根 API 不变）                                                                                                                     | `architecture-standard.md` §M+2                                        | ✅ 已消除                              |
| **G-N1**                | 注解存量违规 **26** 处（决策编号引用 21 + spec 路径引用 5）—— annotation 维度②⑦，`pnpm probe annotation` 可复现                                                                                                                                  | `code-annotation-standard.md` §M+1                                     | ⚠️ 改动即补                            |
| **G-R1 / G-R4**         | 零代码分割（同 G-P6）/ ~~barrel 运行时循环~~（G-P2 已消除）                                                                                                                                                                                      | `react-performance-standard.md` §M+2                                   | ⚠️ G-R1 待修 / G-R4 已消除             |
| **G-R2 / G-R3**         | `useCallback` 212 / `useMemo` 110（含简单表达式 memo 化）/ `memo` 仅 7 个组件                                                                                                                                                                    | `react-performance-standard.md` §M+2                                   | ℹ️ 可选优化                            |
| **G-R5**                | React 19 并发 API 零使用                                                                                                                                                                                                                         | `react-performance-standard.md` §M+2                                   | ℹ️ 由消费方决定                        |

> 📌 **本次已修复（原为缺口，现已消除）**：
> `src/ui/menubar/index.ts` 缺 `export type` 行、`src/ui/select/__tests__/select.stories.tsx` 缺 `tags: ['autodocs']`、
> 全部 Story 文件的 CSF3 类型标注（`Meta<typeof X>` + `StoryObj<typeof X>`）、
> `navigationMenuTriggerStyle` 未遵循 `<component>Variants` 命名、
> **`src/index.ts` 空 barrel**（补齐 `models` / `utils` / `ui` / `design-system` / `hooks` / `providers` 六层导出）、
> **`tsup` external 遗漏**（补齐 `zod` / `dayjs` / `recharts` 等 38 个包 + `@radix-ui/react-accordion`）、
> **79 处 TS1484**（全量改 `import type`）、
> **`src/ui/typography` 未导出** / **`src/utils/error.ts` 未导出**（已补进 barrel）、
> **G9 / G10**（`date` 域 `locale` 透传 + 9 个组件透出 `locale` / `messages` props + 删除 `card` / `form` 两个空文案域）。
>
> 📌 **缺口登记在对应文档的豁免清单里** —— 改代码前**先看豁免清单**，避免重复劳动。

---

## 不存在的约定 (Non-Existent Conventions)

以下在本库**没有实现**，规范文档一律不得引用：

- ❌ 通用工作流引擎 / 分布式基础设施 / 通用 Agent 生命周期抽象
- ❌ `I` 前缀接口 / `Async` 后缀函数 / `Service` 后缀类
- ❌ `packages/` workspace 多包结构与跨包引用
- ❌ `node_modules` 之外的「全局工具库」优先级（`@easbot/utils` 之类）
- ❌ 日志框架（`pino` / `winston`）与运行时日志规范 —— **本库是纯组件库，无运行时日志**
- ❌ 错误体系分层（`NamedError` / `ServiceError` / `errorMeta`）
- ❌ 覆盖率门槛 / 强制 2 人 review / `codeowners`
- ❌ ESLint / commitlint / SonarQube / CodeClimate
- ❌ monorepo 的 `changeset` / 固定版本组发布流程
- ❌ 服务端渲染（SSR）专用组件与 hydration 约定

> ⚠️ **已从本列表移除**：`Zod schema .strict()` 规范 —— 本库**已引入** Zod 数据契约层
> （`src/models/` 共 13 个 Schema + `src/utils/validation-rule.ts` 的 2 个 = 15 个，
> 见 [`model-standard.md`](./model-standard.md) §1.1）。
> 契约层的具体写法由 [`model-standard.md`](./model-standard.md) 管辖。
>
> ⚠️ **已从本列表移除**：「国际化（i18n）运行时机制」—— 本库**已内置**双语文案
> （`src/utils/component-messages.ts` 共 **21** 个文案域，每域含 `zh-CN` + `en-US`），
> 配套 [`i18n-standard.md`](./i18n-standard.md)（**10** 项扫描维度）。
> **仍不引入**的只有外部 i18n 库（`react-i18next` / `i18next`）与全局 store 持有语言状态 ——
> 语言由消费方通过 `LocaleProvider` / `locale` prop 注入。
>
> ⚠️ **仍在本列表**（本次重写**再次确认**不适用于本库）：
>
> - 「Nextra / Next.js / Algolia / `content/<locale>/` 内容树」——
>   那是 `easbot-doc`（文档门户）的架构，与本组件库无关
> - `z.discriminatedUnion` 判别式联合—— 本库**零使用**
>   （见 [`model-standard.md`](./model-standard.md) §M+3 C4）

> ⚠️ **2026-11-04 新增 —— 外部最佳实践中的「不适用」条目**：
>
> | 外部规则                                                  | 为何**不适用**于本库                                                          |
> | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
> | 「URL 反映状态（筛选 / 分页进 query params）」            | 本库**不持有路由** —— URL 同步是**消费方**责任                                |
> | 「`Promise.all` 并行 / `React.cache()` 去重 / waterfall」 | 本库是**纯组件**，**无**数据获取层                                            |
> | 「`useActionState` 表单动作」                             | 面向**服务端动作 / 渐进增强**；本库**无** action 端点，用 `react-hook-form`   |
> | 「`next/dynamic` 代码分割」                               | `next/dynamic` 是 **Next.js 专用**；本库改为「**提供懒加载入口**」            |
> | 「`useSyncExternalStore` 订阅外部 store」                 | 本库**不引入**全局 store（i18n 规范维度⑧ 明确禁止）                           |
> | 「静态属性复合组件（`Dialog.Content`）」                  | 本库**裁定扁平多导出** —— 避免双命名与 TS2308 冲突                            |
> | 「React 19 弃用 `forwardRef`」                            | **不成立** —— `forwardRef` 仍是官方推荐的 ref 转发方式                        |
> | 「`use()` 替代 `useContext()`」                           | **不作为默认替换** —— 本库 Context 消费全在顶层，`use()` 会诱使破坏无条件订阅 |
> | 「自动播放动效需暂停 / 停止控制」                         | 本库**无**自动播放动效（`animate-ripple` 是交互反馈，非内容动效）             |
> | 「服务端渲染（SSR）专用约定」                             | 本库**无** SSR 层（见本节原有条目）                                           |
>
> 📌 **完整裁定见**三份新规范的 §M+3：
> [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) §M+3（C1~C15）、
> [`component-api-standard.md`](./component-api-standard.md) §M+3（C1~C15）、
> [`react-performance-standard.md`](./react-performance-standard.md) §M+3（C1~C15）——
> **共 45 条逐条裁定**，明确哪些**采纳**、哪些**保留本库规范**、哪些**不适用**。

---

## 文档维护 (Maintenance)

### 同步原则

| #   | 规则                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | 文档改动**必须**与代码同步（同一提交）                                      |
| 2   | 版本号 `major.minor.patch`（本索引当前 `8.1.0`）                            |
| 3   | 规范条文**不过期**，只有**数据基准**会过期 → 数据**必须**带 `baseline-date` |
| 4   | **规范与实现冲突时改规范**（规范是契约，代码是实现）                        |

### 防腐规则

速查型规范最容易腐化的原因是「裸抄清单、无真值源锚定」。因此：

1. **每个清单节 MUST 标注唯一真值源**（哪个文件决定了它）
2. **每个清单节 SHOULD 附核验命令**（一条可复跑的 `rg` / 脚本）
3. **清单与代码不一致时，改代码前先改 spec**
4. **删除优先于标记**：僵尸规范直接删除 + 在本页登记，不留 deprecated 壳
5. **禁止引入不存在的锚点**（失效路径 / 失效 ADR / 失效命令）—— 见 §「不存在的约定」

### 版本历史

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.0.0 | 2026-11-04 | **新增 3 份规范 + 同步修正 5 份既有规范，扫描维度 97 → 136 项**。① **新增 [`a11y-interaction-standard.md`](./a11y-interaction-standard.md)**（**12 项维度**）—— 无障碍与交互的**唯一真值源**：可访问名称 / 语义与键盘可达 / 焦点管理 / ARIA 状态 / 表单标签关联 / 动效降级 / 触屏手势 / 文案排版 / 视觉与布局；含 **15 条冲突裁决**（裁定外部 Web Interface Guidelines 与本库既有规范的冲突，如「保留 `outline` 焦点范式」「不适用 URL 状态同步」）；② **新增 [`component-api-standard.md`](./component-api-standard.md)**（**10 项维度**）—— 公开 API 设计：布尔 prop **分级阈值**（≤ 5）+ 三种收敛策略 / 复合组件形态（**裁定扁平多导出**）/ `children` 与插槽优先于 `renderXxx` / Context 三层分离 / 受控非受控配对 / API 变更分级与迁移指引；③ **新增 [`react-performance-standard.md`](./react-performance-standard.md)**（**10 项维度**）—— React 19 API 边界（**裁定不强制引入并发特性**）/ memoization 该用与不该用 / 重渲染控制 / 渲染期副作用禁令 / 加载成本 / 长列表虚拟化；④ **同步修正 5 份既有规范** —— `css-standard`（v2.2.0：焦点「优先 outline」加严 + **新增 §4.7.1 动效降级** + **新增 §2.5 `color-scheme`**，维度 14 → 17）/ `component-standard`（v2.1.0：**新增 §3.11 API 设计契约 + §3.12 无障碍与性能实现约束**，仲裁 5 → 12 条）/ `architecture-standard`（v2.1.0：**新增 §1.1 React 19 基线** + 维度 ⑬ barrel 运行时循环，基线数据校正 —— `external` 49 / `dependencies` 17 / 测试 123 / Story 79）/ `testing-guidelines`（v2.1.0：**新增 §5A 无障碍断言专项**，维度 10 → 11）/ `i18n-standard`（v1.1.0：**新增 §5.4 省略号 `…` / §5.5 `aria-label` 走 i18n / §5.6 品牌名 `translate="no"`**，维度 8 → 10）；⑤ **本索引新增 3 个场景导航**（「组件有交互行为 / 要支持键盘与读屏」「设计组件的 props / 收敛布尔 / 引入组合方式」「组件渲染慢 / 重渲染多 / 包体积大」）+ **2 个排查流程**（「交互不可达 / 读屏念不出」「重渲染过多 / 包体积大」）；⑥ **全库现状基线更新至 2026-11-04**，新增 **规范维度分解表**（136 项逐文档拆分）；⑦ **已知缺口表扩为 26 行** —— 新增 G-A1~A12 / G-P1~P6 / G-R1~R5 三域前缀编号，并**标注 P0 优先级**（G-A10 图标按钮缺名 / G-A11 键盘不可达）。**规范条文本身不过期，只有数据基准会过期** |
| 8.2.0 | 2026-11-05 | **P0 / P1 缺口全量消除**。① **G-A10**（18 处图标按钮缺可访问名称 + 6 处日期后缀图标键盘不可达）：`FileList` / `TableSortButton` / `TableColumnFilter` / `Toolbar` / `RowActionCell` / `ColumnHeaderActionCell` 补 `aria-label`（走内置文案表）；6 处日期后缀图标包 `role="button"` + `tabIndex` + `onKeyDown`（Enter/Space 打开面板，图标降级 `aria-hidden`）。② **G-A11**（6 处非语义元素 `onClick` 键盘不可达）：可点击 `TableRow` / `Dropzone` 两分支 / 文件 `Badge` 补键盘三件套；design-system `Card` 传 `onClick` 时自动补 `role="button"` + `tabIndex={0}` + Enter/Space（消费方可覆盖）。③ **G-A3**：`styles.css` 末尾补全局 `prefers-reduced-motion` 兜底（css-standard §4.7.1 写法 B）。④ **G-A7**：`component-messages.ts` 40 处 `...` 全量改 `…`，同步测试断言 / `date` locale / `useTableI18n` / stories。⑤ **G-AR1**：`notify-provider.tsx` 由 `src/providers/` 迁至 `src/ui/toast/`（`providers` 层不再反向依赖 ui，包根 API 不变，`.storybook` 导入同步修正）。⑥ **G-P2 / G-R4 / G-N1**：barrel 运行时循环 2 处改直连源模块；26 处注解违规（ADR 编号 / spec 路径引用）全量清除。**当前 `check:spec` 0 ERROR、`check:i18n` 0 违规、`pnpm probe all` 探针 ERROR 全部清零（annotation 仅剩 116 个文件头 WARN 存量豁免）、测试全绿**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8.1.0 | 2026-11-05 | **全量评审修正 + 探针脚本沉淀**。① **事实核验修正**：`export default` 48→42/42、`jest.*` 14→**0**（G6 消除）、布尔 prop 126/50→140/59（ts+tsx 口径）、`focus-visible` 142/34→90/42（按行口径）、`prefers-reduced-motion` 2 处位置标注（`src/theme/` 为 0）；修正「本仓库无 `docs/decisions/`」错误断言（实存 0001 号 ADR）；分类表维度数同步（css 17 / architecture 13）；Maintenance 版本号 6.1.0→8.1.0；i18n「8 项维度」→10 项。② **缺口表补登**：G-A4（transition-all 12 处）/ G-P5（memo 仅 7 个），当前 **28 行**；G-A9 标注双登记；G-P6 指向已补登的 `component-api-standard.md` §M+2。③ **探针脚本沉淀**：新增 [`spec/scripts/`](./scripts/README.md)（`probe.ts` 零依赖统一入口：7 自有域 + 2 转发域 + baseline 基线探针 + README）；`check-i18n.ts` / `check-spec.ts` 迁入 `spec/scripts/`（`check-spec.ts` 修复 `EXEMPTIONS` 重复键 TS1117，曾导致 `pnpm type-check` 失败）；「规范自检命令」改为探针入口（不再依赖 `rg` / GNU grep，PowerShell 可直跑）；新增第 14 份规范 [`probe-script-standard.md`](./probe-script-standard.md)（9 项维度），维度总数 136 → **145**。④ **14 份规范文档全量评审**：各文档过时数字 / 断裂锚点 / 自相矛盾处逐一修正（详见各文档修订记录）。⑤ **缺口表补登 G-AR1**（notify-provider 反向依赖 ui，实探发现）/ **G-N1**（注解存量违规 26 处），当前 **30 行**。**当前 `check:spec` 41 ERROR（G-A3 / G-A7 未修）、`check:i18n` 0 违规、`pnpm probe all` RED（G-AR1 / G-N1 / G-A3 / G-A7）、`pnpm type-check` 通过**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 6.2.0 | 2026-11-01 | **G9 / G10 缺口消除**。`date` 域全部 `processUiMessage` / `getUiMessageObject` 调用补齐 `locale` 透传（`date-utils.ts` / `validation.ts` / `timezone-utils.ts` / `mobile-utils.ts` / `hooks/use-date-optimization.ts` / `view/*`），错误文案不再恒为 `zh-CN`；`alert` / `alert-dialog` / `combobox` / `select` / `tag` / `toast` / `tree` / `typography` / `icon` 九个组件统一经 `UiMessageProps` 透出 `locale` / `messages` props；删除 `card` / `form` 两个**无组件消费**的空文案域（组件仅有纯布局与 `children`，无用户可见文案），文案域数由 **22** 降为 **20**；`i18n-standard.md` §4.2 补「必须透传 `locale`」判定规则、§6.1 补 `UiMessageProps` 统一写法、§5.1 补「不建空表」原则与完整导出清单                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 6.1.0 | 2026-11-01 | **新增内置 i18n 规范**。新增 [`i18n-standard.md`](./i18n-standard.md)（8 项扫描维度 + 豁免清单 + 检查清单），组件库**内置**双语文案（`src/utils/component-messages.ts` 共 **22** 个文案域，每域 `zh-CN` + `en-US`），配套处理引擎 `src/utils/ui-message.ts` 与 React 侧 Hook `src/utils/use-component-message.ts`；自检命令新增第 ⑨ 条 `pnpm check:i18n`（覆盖维度①③④⑤⑥，当前 **0** 违规）；「不存在的约定」移除「i18n 运行时机制」条目；已知缺口登记 G9（date 域未透传 `locale`）/ G10（部分组件未透出 `locale` / `messages` props）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 6.0.0 | 2026-11-01 | **目录布局与组件规模同步**。`src/ui/` 两层架构落地（公开组件层 54 个目录 + `src/design-system/` 基础实现层 48 个组件）；测试与 Story 统一收纳到 `__tests__/` 子目录；新增 Zod 数据契约层（`src/models/`，14 个 Schema）。索引新增「源码分层」节；全部 7 份文档的真值源路径 / 数量 / 扫描命令同步到新布局；自检命令新增「类型导入显式化」与「external 同步」两项维度                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 5.0.0 | 2026-10-31 | **规范体系重建**。原 v4.0.2 索引声明「31 份规范文档」而目录实存 5 份，且这 5 份全是 easbot monorepo 残留。重建为 **7 份**组件库口径文档（新增 `component-standard.md` / `css-standard.md` / `storybook-standard.md`，删除 `coding-standards.md`），全部引用本仓库真实真值源，每份含 8-12 项可复跑扫描维度；索引新增「规范自检命令」「全库现状」「已知缺口」「不存在的约定」四节                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 4.0.2 | 2026-10-30 | （easbot monorepo 版）`code-annotation-standard.md` 升 v1.1.1 —— 收紧外链规则                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 4.0.1 | 2026-10-30 | （easbot monorepo 版）`code-annotation-standard.md` 升 v1.1.0 —— 修正扫描口径缺陷                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 4.0.0 | 2026-10-30 | （easbot monorepo 版）新增 `code-annotation-standard.md`，规范文档总数 30 → 31                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 3.0.0 | 2026-10-19 | （easbot monorepo 版）全量评审，删除 4 份僵尸 spec；索引升级为「带真值源锚定的导航表」                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

## 相关文档 (Related Documents)

- [`README.md`](../README.md) / [`README.en.md`](../README.en.md) —— 项目入口
- [`AGENTS.md`](../AGENTS.md) —— Agent 协作指南
- [`src/index.ts`](../src/index.ts) —— 组件公开 API barrel
- [`vitest.config.ts`](../vitest.config.ts) / [`biome.json`](../biome.json) / [`tsup.config.ts`](../tsup.config.ts) —— 工程化配置真值源
- `.easbot/knowledge/docs/dev/<topic>/` —— dev-* 技能产出（**不进 git**）
