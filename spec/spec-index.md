---
name: spec-index
description: 该文档是 easbot-ui spec/ 目录的唯一索引与导航入口，列出全部 7 份规范文档并按主题分类，提供按场景的「该读哪份」建议、全库可复跑的规范自检命令，以及文档维护的防腐规则。当需要查找某项规范、开始编写组件、或做提交前自检时参考本索引。
category: specification
version: 5.0.0
baseline-date: 2026-10-31
tags: [easbot-ui, spec, index, navigation, checklist]
related:
  - component-standard.md
  - css-standard.md
  - testing-guidelines.md
  - storybook-standard.md
  - code-annotation-standard.md
  - code-quality.md
---

# EASBot UI 规范文档索引 (Specification Documents Index)

> **本索引是 `spec/` 目录的唯一真值源**，列出全部规范文档并按主题分类。
>
> **v5.0.0 变更**（2026-10-31）：**规范体系重建** —— 原索引声明「31 份规范文档」，但目录实际只有 5 份，
> 且这 5 份全部是 **easbot monorepo 的残留物**（约束 `packages/**`、引用 22 个不存在的 workspace 包、
> 指向 26 份不存在的文档、`docs/decisions/` ADR 体系本仓库并无）。
> 本次**彻底重建**为组件库口径的 **7 份文档**，全部引用本仓库真实真值源，每份含 8-12 项可复跑扫描维度。

---

## 概述 (Overview)

`spec/` 是本库的**开发宪法**：定义「必须怎么做 / 禁止怎么做 / 怎么检查 / 怎么改」。

**与其它文档体系的分工**：

| 产物类型                 | 归属                                       | 关注点                   |
| ------------------------ | ------------------------------------------ | ------------------------ |
| **项目级规范**（本目录） | `spec/`                                    | 「必须 / 禁止 / 怎么查」 |
| 任务级规格               | `.easbot/knowledge/docs/dev/<topic>/`      | 「这次要做什么」         |
| 决策记录                 | **本仓库无**（无 `docs/decisions/`）       | 「为什么这么选」         |
| 项目入口                 | `README.md` / `README.en.md` / `AGENTS.md` | 「这个项目是什么」       |

> 📌 **本仓库没有 ADR 体系** —— 因此 `spec/` 各文档的 frontmatter **不含** `adrs` 字段，
> 规范里也**不引用**决策编号（这同时是 [`code-annotation-standard.md`](./code-annotation-standard.md) §2.2 的要求）。

---

## 文档分类 (Document Categories)

### 1. 组件开发

| 文档                                               | 用途                                                                                                                   | 唯一真值源 / 核验                      |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| [`component-standard.md`](./component-standard.md) | **组件开发规范**：目录 4 件套 / 命名 / 导出 / `forwardRef` / props / `cva` / `cn()` / 图标库 / barrel（**11 项维度**） | `src/<component>/` 34 个目录的真实结构 |
| [`css-standard.md`](./css-standard.md)             | **样式与主题规范**：构建链路 / CSS 变量命名 / 主题双文件 / `@theme inline` / `dark` 变体 / 层叠层顺序（**11 项维度**） | `src/styles.css` + `src/theme-*.css`   |

### 2. 质量保障

| 文档                                               | 用途                                                                                      | 唯一真值源 / 核验                               |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [`testing-guidelines.md`](./testing-guidelines.md) | **测试规范**：Vitest+jsdom 配置 / 用例结构 / 断言选型 / mock 与 polyfill（**10 项维度**） | `vitest.config.ts` + `tests/setup.ts`           |
| [`storybook-standard.md`](./storybook-standard.md) | **Storybook 规范**：CSF3 / meta / story / argTypes / 装饰器 / 主题切换（**9 项维度**）    | `.storybook/main.ts` + `.storybook/preview.tsx` |

### 3. 工程化

| 文档                                                           | 用途                                                                               | 唯一真值源 / 核验                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`code-annotation-standard.md`](./code-annotation-standard.md) | **注释与 JSDoc 规范**：注解四要素 / ⛔ 7 类禁止内容 / 3 类头部模板（**9 项维度**） | `src/**/*.tsx` 的真实注解                          |
| [`code-quality.md`](./code-quality.md)                         | **代码质量门禁**：Biome / TypeScript / 构建 / 依赖分区 / 发布自检（**11 项维度**） | `biome.json` + `tsconfig*.json` + `tsup.config.ts` |

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

### 写样式 / 调主题

1. [`css-standard.md`](./css-standard.md) §2 变量命名规则
2. [`css-standard.md`](./css-standard.md) §3 —— **三个高危坑**（token 注册 / `dark` 变体 / 未定义变量）
3. [`css-standard.md`](./css-standard.md) §4 选型规则（语义类 vs `var(--xxx)`）

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
# ① 组件 4 件套（component-standard 维度 ①）
Get-ChildItem src -Directory | Where-Object {$_.Name -notin @('types','utils')} | ForEach-Object {
  $d = $_.Name
  $miss = @()
  if (-not (Test-Path "src/$d/$d.tsx")) { $miss += 'impl' }
  if (-not (Test-Path "src/$d/$d.test.tsx")) { $miss += 'test' }
  if (-not (Test-Path "src/$d/$d.stories.tsx")) { $miss += 'story' }
  if (-not (Test-Path "src/$d/index.ts")) { $miss += 'index' }
  if ($miss) { "$d -> MISSING: $($miss -join ',')" }
}

# ② 实现文件禁止 export default（component-standard 维度 ②）
rg -n "^export default" -g "src/*/*.tsx" -g "!*stories.tsx"

# ③ 测试禁止 jest.*（testing 维度 ②）
rg -n "\bjest\." -g "src/**/*.test.tsx"

# ④ 注解禁止项（annotation 维度 ①~⑦）
rg -n --pcre2 '\b(老侯|侯剑|小莫)\b|(ADR\s*\d{4}|决策\s*\d{4})|(spec/[a-z-]+\.md|spec\s*§)' src -g '*.ts' -g '*.tsx'

# ⑤ 主题变量集合一致性（css 维度 ⑤）
$l = (Select-String -Path src/theme-light.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$d = (Select-String -Path src/theme-dark.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
"only-light: $((Compare-Object $l $d | Where-Object {$_.SideIndicator -eq '<='}).InputObject -join ', ')"
"only-dark:  $((Compare-Object $l $d | Where-Object {$_.SideIndicator -eq '=>'}).InputObject -join ', ')"

# ⑥ 语义类必须生成 CSS（css 维度 ⑨）
pnpm build:css > $null 2>&1
$css = Get-Content dist/styles.css -Raw
if ($css -match 'prefers-color-scheme') { "VIOLATION: dark 变体走系统偏好" } else { "OK: dark 走 data-theme" }
if ($css -match '\.bg-primary\{') { "OK: 语义类已生成" } else { "VIOLATION: 语义类未生成" }

# ⑦ 依赖分区（code-quality 维度 ⑧⑨）
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.dependencies.PSObject.Properties.Name -contains 'react') { "VIOLATION: react 在 dependencies" }
```

> 📌 **每条命令的完整判定规则与修正模式**，见对应文档的 §M 章节。

---

## 全库现状（2026-10-31 基线）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。完整数据见各文档的 §M+1。

| 维度                                                       | 现状                           | 详情                               |
| ---------------------------------------------------------- | ------------------------------ | ---------------------------------- |
| 组件目录 / 4 件套                                          | 34 / **34 齐全**               | `component-standard.md` §M+1       |
| 测试文件 / 用例                                            | 34 / **254 全绿**              | `testing-guidelines.md` §M+1       |
| Story 文件 / stories                                       | 34 / **237**                   | `storybook-standard.md` §M+1       |
| 实现文件 `export default`                                  | **0**                          | `component-standard.md` §M+1       |
| `forwardRef` + `displayName`                               | **100%**（`use-toast` 豁免）   | `component-standard.md` §M+1       |
| 主题变量 light/dark                                        | 689 / 689，**集合完全一致**    | `css-standard.md` §M+1             |
| 语义基类未生成数                                           | **0**（修复前 32）             | `css-standard.md` §M+1             |
| 注解 ⛔ 7 类命中                                           | **0**                          | `code-annotation-standard.md` §M+1 |
| `jest.*` 命中                                              | **0**                          | `testing-guidelines.md` §M+1       |
| 规范维度总数                                               | **62 项**（11+11+10+9+11+9+1） | 各文档 §M                          |
| CSF3 标注合规率（`Meta<typeof X>` + `StoryObj<typeof X>`） | **34/34**                      | `storybook-standard.md` §M+1       |

---

## 已知缺口（待补齐）

| #   | 缺口                                                                                                          | 涉及文档                              | 状态                                   |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------- |
| G1  | `src/alert-dialog/alert-dialog-modal.tsx` 未纳入 barrel 导出，且无 test / stories                             | `component-standard.md` §M+2 H2       | 待单独排期                             |
| G2  | `src/button/index.ts` 的 `declare module` 增强声明了实现中不存在的字段（`swipeThreshold` / `pressureConfig`） | `component-standard.md` §M+2 H4       | 待单独排期（类型契约与实现不一致）     |
| G3  | 6 个实现文件缺文件头块注释                                                                                    | `code-annotation-standard.md` §M+2 H2 | 存量豁免（改动即补）                   |
| G4  | `ResizeObserverStub` 在 4 个测试文件重复定义                                                                  | `testing-guidelines.md` §M+2          | 存量豁免（第 5 处须抽取）              |
| G5  | `src/command/command.test.tsx` 与 `src/dialog/dialog.test.tsx` 混用 `it(` / `test(`                           | `testing-guidelines.md` §M+2          | 存量豁免                               |
| G6  | 27 个测试文件缺文件头块注释                                                                                   | `testing-guidelines.md` §M+2          | 存量豁免（新增文件必填）               |
| G7  | 部分测试未覆盖「状态 / 交互 / 无障碍」全部四维度                                                              | `testing-guidelines.md` §M+2          | 存量豁免（关键词近似判定，需人工确认） |

> 📌 **本次已修复（原为缺口，现已消除）**：
> `src/menubar/index.ts` 缺 `export type` 行、`src/select/select.stories.tsx` 缺 `tags: ['autodocs']`、
> 全部 34 个 story 文件的 CSF3 类型标注（`Meta<typeof X>` + `StoryObj<typeof X>`）、
> `navigationMenuTriggerStyle` 未遵循 `<component>Variants` 命名。
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
- ❌ Zod schema `.strict()` 规范（`src/` 实现代码 0 处使用 zod）
- ❌ 覆盖率门槛 / 强制 2 人 review / `codeowners`
- ❌ ESLint / commitlint / SonarQube / CodeClimate
- ❌ monorepo 的 `changeset` / 固定版本组发布流程
- ❌ 服务端渲染（SSR）专用组件与 hydration 约定
- ❌ 国际化（i18n）运行时机制 —— 组件库**不内置**文案多语言

---

## 文档维护 (Maintenance)

### 同步原则

| #   | 规则                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | 文档改动**必须**与代码同步（同一提交）                                      |
| 2   | 版本号 `major.minor.patch`（本索引当前 `5.0.0`）                            |
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

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.0.0 | 2026-10-31 | **规范体系重建**。原 v4.0.2 索引声明「31 份规范文档」而目录实存 5 份，且这 5 份全是 easbot monorepo 残留。重建为 **7 份**组件库口径文档（新增 `component-standard.md` / `css-standard.md` / `storybook-standard.md`，删除 `coding-standards.md`），全部引用本仓库真实真值源，每份含 8-12 项可复跑扫描维度；索引新增「规范自检命令」「全库现状」「已知缺口」「不存在的约定」四节 |
| 4.0.2 | 2026-10-30 | （easbot monorepo 版）`code-annotation-standard.md` 升 v1.1.1 —— 收紧外链规则                                                                                                                                                                                                                                                                                                   |
| 4.0.1 | 2026-10-30 | （easbot monorepo 版）`code-annotation-standard.md` 升 v1.1.0 —— 修正扫描口径缺陷                                                                                                                                                                                                                                                                                               |
| 4.0.0 | 2026-10-30 | （easbot monorepo 版）新增 `code-annotation-standard.md`，规范文档总数 30 → 31                                                                                                                                                                                                                                                                                                  |
| 3.0.0 | 2026-10-19 | （easbot monorepo 版）全量评审，删除 4 份僵尸 spec；索引升级为「带真值源锚定的导航表」                                                                                                                                                                                                                                                                                          |

---

## 相关文档 (Related Documents)

- [`README.md`](../README.md) / [`README.en.md`](../README.en.md) —— 项目入口
- [`AGENTS.md`](../AGENTS.md) —— Agent 协作指南
- [`src/index.ts`](../src/index.ts) —— 组件公开 API barrel
- [`vitest.config.ts`](../vitest.config.ts) / [`biome.json`](../biome.json) / [`tsup.config.ts`](../tsup.config.ts) —— 工程化配置真值源
- `.easbot/knowledge/docs/dev/<topic>/` —— dev-* 技能产出（**不进 git**）
