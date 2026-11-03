---
name: spec-index
description: 该文档是 easbot-ui spec/ 目录的唯一索引与导航入口，列出全部 10 份规范文档并按主题分类，提供按场景的「该读哪份」建议、全库可复跑的规范自检命令，以及文档维护的防腐规则。当需要查找某项规范、开始编写组件、或做提交前自检时参考本索引。
category: specification
version: 7.0.0
baseline-date: 2026-11-02
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
---

# EASBot UI 规范文档索引 (Specification Documents Index)

> **本索引是 `spec/` 目录的唯一真值源**，列出全部规范文档并按主题分类。
>
> **v7.0.0 变更**（2026-11-02）：**架构与数据契约两份规范重写** ——
> [`architecture-standard.md`](./architecture-standard.md) 与 [`model-standard.md`](./model-standard.md)
> 原为 `easbot-doc`（Nextra 文档门户）项目残留，与本库**完全不符**；
> 本次按 `easbot-ui` 组件库真实实现**全文重写**，
> 并纳入本索引的「架构与契约」分类（此前两份文档是**孤儿**，未被索引引用）。

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
| 决策记录                 | **本仓库无**（无 `docs/decisions/`）       | 「为什么这么选」         |
| 项目入口                 | `README.md` / `README.en.md` / `AGENTS.md` | 「这个项目是什么」       |

> 📌 **本仓库没有 ADR 体系** —— 因此 `spec/` 各文档的 frontmatter **不含** `adrs` 字段，
> 规范里也**不引用**决策编号（这同时是 [`code-annotation-standard.md`](./code-annotation-standard.md) §2.2 的要求）。

---

## 文档分类 (Document Categories)

### 1. 组件开发

| 文档                                               | 用途                                                                                                                                           | 唯一真值源 / 核验                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`component-standard.md`](./component-standard.md) | **组件开发规范**：目录 / 命名 / 导出 / `forwardRef` / props / `cva` / `cn()` / 图标库 / barrel（**11 项维度**）                                | `src/ui/<component>/` 56 个目录的真实结构    |
| [`css-standard.md`](./css-standard.md)             | **样式与主题规范**：构建链路 / `src/theme/` 目录布局 / CSS 变量命名 / 主题双文件 / `@theme inline` / `dark` 变体 / 层叠层顺序（**12 项维度**） | `src/theme/styles.css` + `src/theme/themes/` |

### 2. 架构与契约

| 文档                                                     | 用途                                                                                             | 唯一真值源 / 核验                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [`architecture-standard.md`](./architecture-standard.md) | **架构规范**：七层源码布局 / 模块依赖方向 / 构建链路 / exports 契约 / TS 严格项（**12 项维度**） | `src/index.ts` + `tsup.config.ts` + `package.json` + `vitest.config.ts` |
| [`model-standard.md`](./model-standard.md)               | **数据契约规范**：Zod schema 写法 / 递归结构 / Zod 与 TS 分工（**10 项维度**）                   | `src/models/` 的 5 个文件（13 个 schema）                               |

### 3. 质量保障

| 文档                                               | 用途                                                                                      | 唯一真值源 / 核验                               |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [`testing-guidelines.md`](./testing-guidelines.md) | **测试规范**：Vitest+jsdom 配置 / 用例结构 / 断言选型 / mock 与 polyfill（**10 项维度**） | `vitest.config.ts` + `tests/setup.ts`           |
| [`storybook-standard.md`](./storybook-standard.md) | **Storybook 规范**：CSF3 / meta / story / argTypes / 装饰器 / 主题切换（**9 项维度**）    | `.storybook/main.ts` + `.storybook/preview.tsx` |

### 4. 工程化

| 文档                                                           | 用途                                                                               | 唯一真值源 / 核验                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [`code-annotation-standard.md`](./code-annotation-standard.md) | **注释与 JSDoc 规范**：注解四要素 / ⛔ 7 类禁止内容 / 3 类头部模板（**9 项维度**） | `src/**/*.tsx` 的真实注解                                                               |
| [`code-quality.md`](./code-quality.md)                         | **代码质量门禁**：Biome / TypeScript / 构建 / 依赖分区 / 发布自检（**11 项维度**） | `biome.json` + `tsconfig*.json` + `tsup.config.ts`                                      |
| [`i18n-standard.md`](./i18n-standard.md)                       | **内置 i18n 规范**：三层用法 / 文案表规范 / 豁免清单 / 检查清单（**8 项维度**）    | `src/utils/ui-message.ts` + `src/utils/component-messages.ts` + `scripts/check-i18n.ts` |

---

## 按场景选文档 (Selection Guide)

### 开始一个新组件

1. [`component-standard.md`](./component-standard.md) §1 目录契约 —— **先建 4 件套的目录骨架**
2. [`component-standard.md`](./component-standard.md) §3 实现契约 —— 导出 / forwardRef / props / cva / `cn()`
3. [`css-standard.md`](./css-standard.md) §3 —— 样式与 CSS 变量（**先确认变量已定义**）
4. [`testing-guidelines.md`](./testing-guidelines.md) §3 —— 测试骨架
5. [`storybook-standard.md`](./storybook-standard.md) §2 —— Story 骨架
6. [`code-annotation-standard.md`](./code-annotation-standard.md) §3.1 —— 文件头 JSDoc

> 📌 **一站式检查**：`component-standard.md` §M+4「新增组件检查清单」+ `testing-guidelines.md` §M+4 + `storybook-standard.md` §M+4。

### 修改已有组件

1. [`component-standard.md`](./component-standard.md) §M（10 项维度）
2. [`css-standard.md`](./css-standard.md) §M（10 项维度）—— 改了类名尤其必跑
3. [`testing-guidelines.md`](./testing-guidelines.md) §4.5 —— **改实现必须同步改断言**
4. [`code-annotation-standard.md`](./code-annotation-standard.md) §1.4 —— 改动即补注解

### 组件要显示固定文案 / 要支持中英切换

1. [`i18n-standard.md`](./i18n-standard.md) §1 核心原则 —— **P1~P6**（双语必配 / 语言由消费方注入 / 文案可覆盖）
2. [`i18n-standard.md`](./i18n-standard.md) §4 三种使用方式 —— `useComponentMessage` / `processUiMessage` / `messages` 覆盖
3. [`i18n-standard.md`](./i18n-standard.md) §5 内置文案表规范 —— 域分组 / key 命名 / 必备文案类别
4. [`i18n-standard.md`](./i18n-standard.md) §6 组件接入模板 —— `locale` 与 `messages` 两个 props
5. [`i18n-standard.md`](./i18n-standard.md) §9 检查清单 —— 提交前逐项打勾

> 📌 **新组件接入 i18n 的顺序**：先在 `src/utils/component-messages.ts` 补域（zh-CN + en-US 双语），
> 再在组件内 `useComponentMessage('<domain>', { locale, messages })` 取文案，最后跑 `pnpm check:i18n`。

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

```bash
# ① 组件目录结构（component-standard 维度 ①）
#   要求：src/ui/<c>/ 有实现 + index.ts；测试与 story 在 __tests__/ 下
Get-ChildItem src/ui -Directory | ForEach-Object {
  $d = $_.Name
  $miss = @()
  if (-not (Test-Path "src/ui/$d/index.ts")) { $miss += 'index' }
  if (-not (Get-ChildItem "src/ui/$d" -Filter "*.tsx" -File)) { $miss += 'impl' }
  if ($miss) { "$d -> MISSING: $($miss -join ',')" }
}

# ② 实现文件禁止 export default（component-standard 维度 ②）
rg -n "^export default" -g "src/ui/**/*.tsx" -g "!*stories.tsx"

# ③ 测试禁止 jest.*（testing 维度 ②）
rg -n "\bjest\." -g "src/**/*.test.tsx"

# ④ 类型导入必须显式 import type（TS1484）
rg -n "^import \{[^}]*\b(Props|Config|Options|Value|State|Context)\b" -g "src/**/*.tsx" -g "src/**/*.ts"

# ⑤ 注解禁止项（annotation 维度 ①~⑦）
rg -n --pcre2 '\b(老侯|侯剑|小莫)\b|(ADR\s*\d{4}|决策\s*\d{4})|(spec/[a-z-]+\.md|spec\s*§)' src -g '*.ts' -g '*.tsx'

# ⑥ 主题变量集合一致性（css 维度 ⑤）
$l = (Select-String -Path src/theme/themes/light.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$d = (Select-String -Path src/theme/themes/dark.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
"only-light: $((Compare-Object $l $d | Where-Object {$_.SideIndicator -eq '<='}).InputObject -join ', ')"
"only-dark:  $((Compare-Object $l $d | Where-Object {$_.SideIndicator -eq '=>'}).InputObject -join ', ')"

# ⑥-2 编译入口唯一性（css 维度 ⑫）
foreach ($f in @('src/styles.css','src/theme-light.css','src/theme-dark.css')) {
  if (Test-Path $f) { "VIOLATION: 旧入口仍存在: $f" }
}
if (-not (Test-Path 'src/theme/styles.css')) { "VIOLATION: 缺唯一入口 src/theme/styles.css" }

# ⑦ 语义类必须生成 CSS（css 维度 ⑨）
pnpm build:css > $null 2>&1
$css = Get-Content dist/styles.css -Raw
if ($css -match 'prefers-color-scheme') { "VIOLATION: dark 变体走系统偏好" } else { "OK: dark 走 data-theme" }
if ($css -match '\.bg-primary\{') { "OK: 语义类已生成" } else { "VIOLATION: 语义类未生成" }

# ⑧ 依赖分区 + external 同步（code-quality 维度 ⑧⑨）
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.dependencies.PSObject.Properties.Name -contains 'react') { "VIOLATION: react 在 dependencies" }
$ext = Get-Content tsup.config.ts -Raw
foreach ($d in $pkg.dependencies.PSObject.Properties.Name) {
  if ($ext -notmatch [regex]::Escape("'$d'")) { "VIOLATION: $d 不在 external" }
}

# ⑨ i18n 规范扫描（i18n 维度 ①③④⑤⑥）
pnpm check:i18n
#   覆盖：① 硬编码中文文案 / ③ console.error、console.warn 固定文案
#         ④ 消息表语言不完整 / ⑤ 两语言 key 不一致 / ⑥ 占位符不匹配
#   退出码 0 = 全部通过；1 = 存在违规

# ⑩ 架构规范扫描（architecture 维度 ②③⑤⑥⑧）
#   依赖方向 + models 必须 import type + 禁 @/ 别名 + external 同步
rg -n 'from .\.\./(ui|design-system)/' src/models src/utils src/hooks src/providers
rg -n '^import \{[^}]*\} from .*models' src/ui -g '*.ts' -g '*.tsx' | Where-Object { $_ -notmatch 'import type' }
rg -n 'from .@/' src scripts tests .storybook -g '!**/*.md'
$ext = Get-Content tsup.config.ts -Raw
foreach ($d in (Get-Content package.json -Raw | ConvertFrom-Json).dependencies.PSObject.Properties.Name) {
  if ($ext -notmatch [regex]::Escape("'$d'")) { "VIOLATION: $d 不在 external" }
}

# ⑪ 数据契约规范扫描（model 维度 ①③④⑧⑨⑩）
rg -n '^export interface ' src/models        # 只应命中 FilterRule（递归锚点）
rg -n '\.strict\(\)|\.strictObject\(\)' src  # 应为空
rg -n '\.nullable\(\)' src                    # 应为空
rg -n 'JSON\.parse\(JSON\.stringify\(' src -g '!**/docs/**' -g '!**/*.md' |
  Where-Object { $_ -notmatch ':\s*\*' }       # 应为空（排除注释与 markdown）
```

> 📌 **每条命令的完整判定规则与修正模式**，见对应文档的 §M 章节。

---

## 全库现状（2026-11-02 基线）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。完整数据见各文档的 §M+1。

| 维度                                               | 现状                                   | 详情                            |
| -------------------------------------------------- | -------------------------------------- | ------------------------------- |
| 公开组件目录（`src/ui/`）                          | **56**                                 | `architecture-standard.md` §M+1 |
| 基础实现组件（`src/design-system/components/ui/`） | **46**                                 | `architecture-standard.md` §M+1 |
| 测试文件（`src/**/__tests__/*.test.tsx`）          | **111**                                | `testing-guidelines.md` §M+1    |
| Story 文件（`src/**/*.stories.tsx`）               | **77**                                 | `storybook-standard.md` §M+1    |
| Zod Schema 数                                      | **15**（`models/` 13 + `utils/` 2）    | `model-standard.md` §M+1        |
| 实现文件 `export default`                          | **48**（`src/ui/table/` 28 + 其他 20） | `architecture-standard.md` §M+1 |
| 主题变量 light/dark                                | 702 / 702，**集合完全一致**            | `css-standard.md` §M+1          |
| `jest.*` 命中                                      | **14**（存量待迁移，见 §M+2）          | `testing-guidelines.md` §M+1    |
| TS1484（类型导入未显式标记）命中                   | **0**（已全量修复）                    | `code-quality.md` §M+1          |
| 组件文案域数（`ComponentMessageDomain`）           | **20**                                 | `i18n-standard.md` §5.1         |
| 内置文案表数（`src/utils/component-messages.ts`）  | **20**（每表 zh-CN + en-US 双语）      | `i18n-standard.md` §5.1         |
| i18n 扫描违规数（`pnpm check:i18n`）               | **0**（维度①③④⑤⑥ 全通过）              | `i18n-standard.md` §7           |
| 规范维度总数                                       | **92 项**（11+11+12+10+10+9+11+9+8+1） | 各文档 §M                       |
| `tsup` external 包数                               | **49**（含 28 个 Radix）               | `architecture-standard.md` §M+1 |

---

## 已知缺口（待补齐）

| #   | 缺口                                                                                                                                                                                                                                             | 涉及文档                              | 状态                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | -------------------------------------- |
| G1  | `src/ui/alert-dialog/alert-dialog-modal.tsx` 未纳入 barrel 导出，且无 test / stories                                                                                                                                                             | `component-standard.md` §M+2 H2       | 待单独排期                             |
| G2  | `src/ui/button/index.ts` 的 `declare module` 增强声明了实现中不存在的字段（`swipeThreshold` / `pressureConfig`）                                                                                                                                 | `component-standard.md` §M+2 H4       | 待单独排期（类型契约与实现不一致）     |
| G3  | 6 个实现文件缺文件头块注释                                                                                                                                                                                                                       | `code-annotation-standard.md` §M+2 H2 | 存量豁免（改动即补）                   |
| G4  | `tests/polyfills.ts` 共享 helper 已建立，但仍有测试文件重复定义 `ResizeObserverStub`                                                                                                                                                             | `testing-guidelines.md` §M+2          | 存量豁免（第 5 处须抽取）              |
| G5  | `src/ui/command/` 与 `src/ui/dialog/` 的测试混用 `it(` / `test(`                                                                                                                                                                                 | `testing-guidelines.md` §M+2          | 存量豁免                               |
| G6  | 14 个测试文件仍用 `jest.*` API（含 `@jest/globals` import）                                                                                                                                                                                      | `testing-guidelines.md` §M+2          | 存量豁免（新增文件必用 `vi.*`）        |
| G7  | 部分测试未覆盖「状态 / 交互 / 无障碍」全部四维度                                                                                                                                                                                                 | `testing-guidelines.md` §M+2          | 存量豁免（关键词近似判定，需人工确认） |
| G8  | `src/design-system/index.tsx` 使用 `export default DesignSystemProvider`                                                                                                                                                                         | `component-standard.md` §M+2          | 存量豁免（barrel 不传播 default）      |
| G9  | ~~`date` 域的 `processUiMessage` 调用**未透传 `locale`**~~ —— **已修复**（`validation.ts` / `date-utils.ts` / `timezone-utils.ts` / `mobile-utils.ts` / `hooks/use-date-optimization.ts` / `view/*` 全部透传 `locale`）                          | `i18n-standard.md` §4.2               | 已消除                                 |
| G10 | ~~已接 `useComponentMessage` 但**未透出 `locale` / `messages` props** 的组件~~ —— **已修复**（`alert` / `alert-dialog` / `combobox` / `select` / `tag` / `toast` / `tree` / `typography` / `icon` 均已透出；`card` / `form` 两个**空域已删除**） | `i18n-standard.md` §6.1               | 已消除                                 |

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
- ❌ 决策日志目录（`docs/decisions/`）与 ADR 编号体系
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
> （`src/utils/component-messages.ts` 共 **20** 个文案域，每域含 `zh-CN` + `en-US`），
> 配套 [`i18n-standard.md`](./i18n-standard.md)（8 项扫描维度）。
> **仍不引入**的只有外部 i18n 库（`react-i18next` / `i18next`）与全局 store 持有语言状态 ——
> 语言由消费方通过 `LocaleProvider` / `locale` prop 注入。
>
> ⚠️ **仍在本列表**（本次重写**再次确认**不适用于本库）：
>
> - 「Nextra / Next.js / Algolia / `content/<locale>/` 内容树」——
>   那是 `easbot-doc`（文档门户）的架构，与本组件库无关
> - 「`z.discriminatedUnion` 判别式联合」—— 本库**零使用**
>   （见 [`model-standard.md`](./model-standard.md) §M+3 C4）

---

## 文档维护 (Maintenance)

### 同步原则

| #   | 规则                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | 文档改动**必须**与代码同步（同一提交）                                      |
| 2   | 版本号 `major.minor.patch`（本索引当前 `6.1.0`）                            |
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

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6.2.0 | 2026-11-01 | **G9 / G10 缺口消除**。`date` 域全部 `processUiMessage` / `getUiMessageObject` 调用补齐 `locale` 透传（`date-utils.ts` / `validation.ts` / `timezone-utils.ts` / `mobile-utils.ts` / `hooks/use-date-optimization.ts` / `view/*`），错误文案不再恒为 `zh-CN`；`alert` / `alert-dialog` / `combobox` / `select` / `tag` / `toast` / `tree` / `typography` / `icon` 九个组件统一经 `UiMessageProps` 透出 `locale` / `messages` props；删除 `card` / `form` 两个**无组件消费**的空文案域（组件仅有纯布局与 `children`，无用户可见文案），文案域数由 **22** 降为 **20**；`i18n-standard.md` §4.2 补「必须透传 `locale`」判定规则、§6.1 补 `UiMessageProps` 统一写法、§5.1 补「不建空表」原则与完整导出清单 |
| 6.1.0 | 2026-11-01 | **新增内置 i18n 规范**。新增 [`i18n-standard.md`](./i18n-standard.md)（8 项扫描维度 + 豁免清单 + 检查清单），组件库**内置**双语文案（`src/utils/component-messages.ts` 共 **22** 个文案域，每域 `zh-CN` + `en-US`），配套处理引擎 `src/utils/ui-message.ts` 与 React 侧 Hook `src/utils/use-component-message.ts`；自检命令新增第 ⑨ 条 `pnpm check:i18n`（覆盖维度①③④⑤⑥，当前 **0** 违规）；「不存在的约定」移除「i18n 运行时机制」条目；已知缺口登记 G9（date 域未透传 `locale`）/ G10（部分组件未透出 `locale` / `messages` props）                                                                                                                                                                  |
| 6.0.0 | 2026-11-01 | **目录布局与组件规模同步**。`src/ui/` 两层架构落地（公开组件层 54 个目录 + `src/design-system/` 基础实现层 48 个组件）；测试与 Story 统一收纳到 `__tests__/` 子目录；新增 Zod 数据契约层（`src/models/`，14 个 Schema）。索引新增「源码分层」节；全部 7 份文档的真值源路径 / 数量 / 扫描命令同步到新布局；自检命令新增「类型导入显式化」与「external 同步」两项维度                                                                                                                                                                                                                                                                                                                                    |
| 5.0.0 | 2026-10-31 | **规范体系重建**。原 v4.0.2 索引声明「31 份规范文档」而目录实存 5 份，且这 5 份全是 easbot monorepo 残留。重建为 **7 份**组件库口径文档（新增 `component-standard.md` / `css-standard.md` / `storybook-standard.md`，删除 `coding-standards.md`），全部引用本仓库真实真值源，每份含 8-12 项可复跑扫描维度；索引新增「规范自检命令」「全库现状」「已知缺口」「不存在的约定」四节                                                                                                                                                                                                                                                                                                                        |
| 4.0.2 | 2026-10-30 | （easbot monorepo 版）`code-annotation-standard.md` 升 v1.1.1 —— 收紧外链规则                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 4.0.1 | 2026-10-30 | （easbot monorepo 版）`code-annotation-standard.md` 升 v1.1.0 —— 修正扫描口径缺陷                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 4.0.0 | 2026-10-30 | （easbot monorepo 版）新增 `code-annotation-standard.md`，规范文档总数 30 → 31                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3.0.0 | 2026-10-19 | （easbot monorepo 版）全量评审，删除 4 份僵尸 spec；索引升级为「带真值源锚定的导航表」                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

## 相关文档 (Related Documents)

- [`README.md`](../README.md) / [`README.en.md`](../README.en.md) —— 项目入口
- [`AGENTS.md`](../AGENTS.md) —— Agent 协作指南
- [`src/index.ts`](../src/index.ts) —— 组件公开 API barrel
- [`vitest.config.ts`](../vitest.config.ts) / [`biome.json`](../biome.json) / [`tsup.config.ts`](../tsup.config.ts) —— 工程化配置真值源
- `.easbot/knowledge/docs/dev/<topic>/` —— dev-* 技能产出（**不进 git**）
