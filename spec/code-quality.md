---
name: code-quality
description: 该规范定义 easbot-ui 组件库的代码质量门禁与工程化契约，含 Biome 2 配置基线（格式化参数 / 规则归属表 / 刻意关闭的规则）、TypeScript 配置基线（strict / verbatimModuleSyntax / noUncheckedIndexedAccess / jsx react-jsx）、构建链路（tsup 浏览器库模式 + Tailwind CSS 构建期编译 + 产物契约）、依赖三分区（dependencies / peerDependencies / peerDependenciesMeta.optional）与红线、exports 字段与 files 字段、发布前自检清单、11 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与门禁清单。当配置 lint / type-check / 构建、调整依赖、发布新版本或排查 CI 失败时参考。
category: specification
version: 1.0.0
baseline-date: 2026-10-31
tags: [easbot-ui, quality, biome, typescript, tsup, build, dependency, release, ci]
related:
  - spec-index.md
  - component-standard.md
  - css-standard.md
  - testing-guidelines.md
  - storybook-standard.md
  - code-annotation-standard.md
---

# EASBot UI 代码质量规范 (Code Quality Standard)

> **真值源**：本规范以 [`biome.json`](../biome.json)、[`tsconfig.base.json`](../tsconfig.base.json)、
> [`tsconfig.json`](../tsconfig.json)、[`tsup.config.ts`](../tsup.config.ts)、[`package.json`](../package.json)
> 与 [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) 为唯一执行真值；规范与实现冲突时**规范改**。
>
> **与其它规范的分工**（三者**不重复**）：
>
> | 关注点                        | 归属文档                                                       | 本规范对应章节     |
> | ----------------------------- | -------------------------------------------------------------- | ------------------ |
> | 组件目录 / 命名 / 导出 / 封装 | [`component-standard.md`](./component-standard.md)             | —                  |
> | CSS 变量 / 主题 / Tailwind 类 | [`css-standard.md`](./css-standard.md)                         | §3（仅 build:css） |
> | 测试怎么写                    | [`testing-guidelines.md`](./testing-guidelines.md)             | §2（仅门禁）       |
> | 注释与 JSDoc                  | [`code-annotation-standard.md`](./code-annotation-standard.md) | —                  |
>
> **历史基准**：v1.0.0 锁定 2026-10-31 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本规范定义**组件库的工程化门禁**：用什么工具检查、怎么构建、依赖怎么分区、发布前检查什么。

**核心约束**：

- ✅ 代码检查与格式化**必须**用 **Biome 2**（**无 ESLint**），markdown 走 prettier
- ✅ 类型检查**必须** `strict: true` + `verbatimModuleSyntax: true`
- ✅ 构建**必须**用 **tsup**（`platform: 'browser'`）+ Tailwind CSS CLI，**不引入** `vite.config.ts`
- ✅ 源码 `import` 的每个包**必须**在 `dependencies` 或 `peerDependencies`
- ✅ `react` / `react-dom` **只能**在 `peerDependencies`；Radix primitives **必须**是 optional peer
- ✅ 样式**必须**在**构建期**编译成 `dist/styles.css`，消费方零配置
- ❌ 禁止把源码 `import` 的包**只**放在 `devDependencies`
- ❌ 禁止压缩产物（保留 sourcemap，压缩交给消费方 bundler）
- ❌ 禁止引入 `addon-vitest` / 覆盖率门槛等重复建设项

---

## 1. 命令清单

> **唯一真值源 = `package.json#scripts`**。文档与脚本冲突时**以 `package.json` 为准**。

```bash
# 安装与构建
pnpm install
pnpm build                # tsup（JS + d.ts）+ build:css
pnpm build:css            # 仅编译 Tailwind CSS → dist/styles.css
pnpm clean                # 删除 dist/

# 测试
pnpm test                 # vitest run（单次）
pnpm test:watch           # vitest（监听）
pnpm test:coverage        # vitest run --coverage
pnpm vitest run src/button            # 单目录
pnpm vitest run src/button/button.test.tsx   # 单文件

# 类型检查与代码规范
pnpm type-check           # tsc --noEmit
pnpm lint                 # biome check .
pnpm lint:fix             # biome check --write .
pnpm lint:report          # biome check --reporter=summary .
pnpm format               # biome format . + prettier --check
pnpm format:fix           # 自动格式化

# Storybook
pnpm storybook            # 开发预览 → http://localhost:6006
pnpm storybook:build      # 静态站点 → storybook-static/

# 版本管理与发布
pnpm version:patch
pnpm version:minor
pnpm version:major
pnpm publish:list         # 查询 npm 已发布版本
pnpm publish:npm          # 发布到 npm（需先 npm login）
```

> ⚠️ **本库的命令名与 easbot monorepo 不同** —— 本库用 `pnpm test`（单次），**不是** `pnpm test:run`；
> 也**没有** `pnpm biome-lint` / `pnpm biome-fix` 这类分项命令（统一为 `pnpm lint` / `pnpm lint:fix`）。

---

## 2. Biome（代码检查与格式化）

### 2.1 配置文件

- **唯一真值源 = 根 [`biome.json`](../biome.json)**（schema v2，biome 2.5.5）
- **本库是单包**，**无**子包 `biome.json`

### 2.2 格式化基线

> 真值源：`biome.json#formatter` + `biome.json#javascript.formatter`

| 项目     | 值                         |
| -------- | -------------------------- |
| 缩进     | 2 空格                     |
| 行宽     | 200                        |
| 换行     | LF                         |
| 引号     | 单引号（JSX 双引号）       |
| 分号     | 始终                       |
| 尾随逗号 | 多行对象/数组全部          |
| 括号间距 | `{ foo: 'bar' }`           |
| 箭头括号 | 始终（`arrowParentheses`） |

**markdown 例外**：`biome.json#files.includes` 含 `!**/*.md` → **markdown 不走 biome**，由 `prettier.config.mjs` 处理
（lint-staged 的 `*.{md,mdx} → prettier --write`）。

### 2.3 规则归属：TS 规则 vs Biome 规则

**易错点**：以下规则**属于 `tsconfig.base.json`（TypeScript 编译器），不是 biome 规则**，biome 中**根本不存在**同名项：

| 规则                         | 真实来源             | 状态      |
| ---------------------------- | -------------------- | --------- |
| `noImplicitAny`              | `strict: true`       | ✅ 生效   |
| `useUnknownInCatchVariables` | `strict: true`       | ✅ 生效   |
| `noUncheckedIndexedAccess`   | `tsconfig.base.json` | ✅ `true` |
| `noImplicitOverride`         | `tsconfig.base.json` | ✅ `true` |
| `noFallthroughCasesInSwitch` | `tsconfig.base.json` | ✅ `true` |
| `verbatimModuleSyntax`       | `tsconfig.base.json` | ✅ `true` |

### 2.4 刻意关闭的 Biome 规则（勿误认为强制）

> 真值源：`biome.json#linter.rules`

| 规则                            | 状态   | 备注                                     |
| ------------------------------- | ------ | ---------------------------------------- |
| `assist.source.organizeImports` | `off`  | **import 顺序靠人工 / 编辑器保证**       |
| `style.useImportType`           | `off`  | 类型导入**建议**用 `import type`，不强制 |
| `style.useExportType`           | `off`  | —                                        |
| `style.useTemplate`             | `off`  | —                                        |
| `style.useNodejsImportProtocol` | `off`  | —                                        |
| `style.useAsConstAssertion`     | `off`  | —                                        |
| `style.noNonNullAssertion`      | `off`  | 允许 `!` 非空断言                        |
| `suspicious.noConsole`          | `off`  | 本库**无运行时日志需求**（纯组件）       |
| `suspicious.noExplicitAny`      | `off`  | —                                        |
| `complexity.noForEach`          | `off`  | 允许 `.forEach`                          |
| `correctness.noUnusedImports`   | `warn` | —                                        |

### 2.5 实际启用的高价值规则

- `nursery.noFloatingPromises: error` —— **禁止**未处理的 Promise
- `correctness.useHookAtTopLevel: error` —— Hook 调用位置
- `correctness.useJsxKeyInIterable: error` —— 列表 key
- `correctness.noUndeclaredVariables: error`
- `correctness.noUnusedImports: warn`
- `correctness.useExhaustiveDependencies: warn` —— **依赖数组完整性**
- `correctness.useIsNan: error`
- `a11y.noStaticElementInteractions: warn` / `a11y.useKeyWithMouseEvents: warn` / `a11y.useSemanticElements: warn`
- `security.noDangerouslySetInnerHtmlWithChildren: error`

### 2.6 Biome globals

`biome.json#javascript.globals` **必须**包含 vitest 全局：

```json
"globals": ["window", "process", "describe", "it", "test", "expect", "beforeEach", "afterEach", "beforeAll", "afterAll", "vi", "vitest"]
```

> ⚠️ **漏了会导致 762 个 `noUndeclaredVariables` 错误** —— 这是历史上的一次真实事故。

### 2.7 Biome 排除项

`biome.json#files.includes` **必须**排除：

| 排除项                  | 原因                                                     |
| ----------------------- | -------------------------------------------------------- |
| `!**/dist/`             | 构建产物                                                 |
| `!**/node_modules/`     | 依赖                                                     |
| `!**/*.md`              | markdown 走 prettier                                     |
| `!**/storybook-static/` | Storybook 静态产物（**117 个生成文件**，会让 lint 卡死） |
| `!**/coverage/`         | 覆盖率报告                                               |
| `!**/.easbot/`          | L3 开发产物（不进 git）                                  |

---

## 3. TypeScript 与构建

### 3.1 tsconfig 基线

> 真值源：[`tsconfig.base.json`](../tsconfig.base.json) + [`tsconfig.json`](../tsconfig.json)

| 字段                         | 值          | 说明                                   |
| ---------------------------- | ----------- | -------------------------------------- |
| `target`                     | `ESNext`    | —                                      |
| `module`                     | `Preserve`  | —                                      |
| `moduleResolution`           | `Bundler`   | **import 不写扩展名**                  |
| `jsx`                        | `react-jsx` | **无需** `import React`                |
| `strict`                     | `true`      | —                                      |
| `verbatimModuleSyntax`       | `true`      | 类型导入**必须**显式标记               |
| `noUncheckedIndexedAccess`   | `true`      | 数组 / 索引访问返回 `T                 | undefined` |
| `noImplicitOverride`         | `true`      | —                                      |
| `noFallthroughCasesInSwitch` | `true`      | —                                      |
| `noEmit`                     | `true`      | **类型检查不发产物**（产物由 tsup 出） |

**`tsconfig.json` 的增量配置**：

| 字段      | 值                                                                             | 说明                       |
| --------- | ------------------------------------------------------------------------------ | -------------------------- |
| `types`   | `["node", "vitest/globals", "@testing-library/jest-dom"]`                      | **必须**含 vitest 全局类型 |
| `include` | `[".storybook/**/*", "scripts/**/*", "src/**/*", "tests/**/*", "*.config.ts"]` | 含测试与配置               |
| `exclude` | `["node_modules", "dist", "storybook-static"]`                                 | —                          |

> ⚠️ **`types` 漏 `vitest/globals` 会导致 200+ `Cannot find name 'expect'` 错误** —— 历史上的一次真实事故。
>
> ⚠️ **`src/types/css.d.ts` 不可删除** —— 它解决 TS2882（CSS side-effect import 无法解析）。

### 3.2 构建链路

```
源码 src/
   ├── tsup        → dist/index.mjs (ESM) + dist/index.cjs (CJS) + dist/index.d.ts
   └── build:css   → dist/styles.css + dist/theme-light.css + dist/theme-dark.css
```

> ⚠️ **ESM 产物是 `index.mjs` 而不是 `index.js`** —— 由 tsup 的 `outExtension` 决定，
> 因此 `package.json` 的 `module` / `exports.import` **必须**写 `./dist/index.mjs`（见 §M 维度 ⑩）。

**tsup 配置基线**（真值源：[`tsup.config.ts`](../tsup.config.ts)）：

| 字段           | 值                                                                                                    | 说明                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `platform`     | `'browser'`                                                                                           | ❌ **不是** `'node'` —— 这是浏览器组件库                |
| `format`       | `['esm', 'cjs']`                                                                                      | 双格式                                                  |
| `outExtension` | ESM → `.mjs` / CJS → `.cjs`                                                                           | **决定产物文件名** —— `package.json` 必须对齐（维度 ⑩） |
| `minify`       | `false`                                                                                               | **不压缩**，保留可调试性                                |
| `sourcemap`    | `true`                                                                                                | 保留 sourcemap                                          |
| `dts`          | `{ resolve: ['./src/index.ts'] }`                                                                     | 只解析入口                                              |
| `external`     | react / react-dom / 22 个 Radix / cva / clsx / tailwind-merge / cmdk / react-hook-form / lucide-react | 全部**不打包**                                          |
| `onSuccess`    | 复制 `theme-*.css` 到 `dist/`                                                                         | 便于调试与单独覆盖                                      |

> ⛔ **禁止在 `tsup.config.ts` 里出现重复键** —— 对象字面量的重复键会**静默取最后一个**，
> 前面的配置被无声吞掉（实测踩过：`minify` / `sourcemap` / `clean` 各写两次，
> 实际生效的是 `minify: true`，与「组件库不压缩」的设计决策相反）。
> 自检见 §M 维度 ⑪。

> ⚠️ **`external` 漏一个包 = 该包被打进 bundle** → 消费方可能拿到**双 React 实例**（严重问题）。
> 新增依赖**必须**同步 `external`（见 §M 维度 ⑨）。

### 3.3 为什么是 tsup 而不是 Vite

| 决策         | 结论                                              | 理由                                                   |
| ------------ | ------------------------------------------------- | ------------------------------------------------------ |
| **构建工具** | **tsup**，**不引入** `vite.config.ts`             | 组件库只需「源码 → lib + dts」；esbuild 更快、配置更少 |
| **Vite**     | 仅作为 `@storybook/react-vite` 内部依赖存在       | Storybook 需要 dev server + HMR + CSS 处理             |
| **测试**     | Vitest 自带 Vite 管线，**不需要**项目级 vite 配置 | `vitest.config.ts` 直接接 `defineConfig`               |
| **压缩**     | 不压缩，保留 sourcemap                            | 压缩交给消费方 bundler；组件库需可调试                 |

> 📌 **样式方案**：Tailwind v4，**构建期全量编译** —— Tailwind 是构建期工具，不进运行时依赖。

---

## 4. 依赖与发布

### 4.1 依赖三分区

| 分区               | 成员                                                                                       | 规则                                |
| ------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------- |
| `dependencies`     | `class-variance-authority` `clsx` `cmdk` `lucide-react` `react-hook-form` `tailwind-merge` | 源码直接 `import`                   |
| `peerDependencies` | `react` `react-dom`                                                                        | **宿主提供**，避免双 React 实例     |
| `peerDependencies` | `@radix-ui/react-*`（22 个，**全部 optional**）                                            | 版本对齐，避免 Radix 内部状态不同步 |
| `devDependencies`  | Biome / tsup / vitest / storybook / tailwindcss / testing-library                          | **仅**构建 / 测试 / story 使用      |

### 4.2 依赖红线

| #   | 规则                                                                             | 验证                        |
| --- | -------------------------------------------------------------------------------- | --------------------------- |
| 1   | 源码 `import` 的每个包**必须**在 `dependencies` 或 `peerDependencies`            | `code-quality.md` §M 维度 ⑨ |
| 2   | `react` / `react-dom` **只能**在 `peerDependencies`                              | §M 维度 ⑧                   |
| 3   | Radix primitives **必须**在 `peerDependencies` + `peerDependenciesMeta.optional` | §M 维度 ⑧                   |
| 4   | 新增依赖后 **MUST** 实跑 `pnpm install` 确认 `pnpm-lock.yaml` 已同步             | 提交前自检                  |
| 5   | ❌ **禁止**把源码 `import` 的包**只**放在 `devDependencies`                      | 发布后运行时崩溃            |

### 4.3 `exports` 与 `files`

> 真值源：`package.json#exports` / `#files`

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json"
  },
  "sideEffects": false,
  "files": ["dist", "CHANGELOG.md", "README.md", "README.en.md", "LICENSE"]
}
```

| #   | 规则                                                         |
| --- | ------------------------------------------------------------ |
| 1   | **必须**暴露 `./styles.css` 子路径（消费方零配置的关键）     |
| 2   | **必须**保留 `./package.json` 子路径（工具链会读它）         |
| 3   | `sideEffects: false` —— 组件无副作用（**CSS 是单独子路径**） |
| 4   | `files` **必须**排除 `src/` / `tests/` / `.storybook/`       |
| 5   | ❌ **禁止**把 `src/` 打进发布产物                            |

### 4.4 发布前自检

```bash
pnpm build && pnpm test && pnpm type-check && pnpm lint && pnpm storybook:build
```

- [ ] `dist/index.mjs` / `dist/index.cjs` / `dist/index.d.ts` / `dist/styles.css` 均存在
- [ ] `dist/index.mjs` 中 react / radix 保持 `import`（**未被打进 bundle**）
- [ ] `npm pack --dry-run` 产物**不含** `src/` `tests/` `.storybook/`
- [ ] README 版本号与 `package.json` 一致
- [ ] `CHANGELOG.md` 已更新

---

## M. 11 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按文件分批跑**，模式必须**一次跑全仓**。

### 维度 ① Biome 排除项完整

**扫描命令**：

```bash
rg -n '"!\*\*/(storybook-static|coverage|dist|node_modules)/"' biome.json
```

**判定规则**：

- ❌ 违规：缺任一排除项（尤其 `storybook-static/` —— 会让 lint 扫描 117 个生成文件而卡死）
- ✅ 合规：4 项齐全

**修正模式**：

```json
// ❌ 违规 —— 缺 storybook-static 排除
"includes": ["**/*.ts", "**/*.tsx", "!**/dist/", "!**/node_modules/", "!**/*.md"]

// ✅ 修正
"includes": [
  "**/*.ts",
  "**/*.tsx",
  "**/*.js",
  "**/*.jsx",
  "**/*.json",
  "!**/dist/",
  "!**/node_modules/",
  "!**/*.md",
  "!**/storybook-static/",
  "!**/coverage/"
]
```

### 维度 ② Biome globals 必须含 vitest 全局

**扫描命令**：

```bash
$globals = (Get-Content biome.json -Raw | ConvertFrom-Json).javascript.globals
$required = @('describe','it','test','expect','beforeEach','afterEach','beforeAll','afterAll','vi')
$missing = $required | Where-Object { $_ -notin $globals }
if ($missing) { "MISSING globals: $($missing -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：缺任一 vitest 全局
- ✅ 合规：输出 `OK`

**修正模式**：

```json
// ❌ 违规 —— 缺 vitest 全局 → 762 个 noUndeclaredVariables 错误
"globals": ["window", "process"]

// ✅ 修正
"globals": ["window", "process", "describe", "it", "test", "expect", "beforeEach", "afterEach", "beforeAll", "afterAll", "vi", "vitest"]
```

### 维度 ③ tsconfig types 必须含 vitest / jest-dom

**扫描命令**：

```bash
$types = (Get-Content tsconfig.json -Raw | ConvertFrom-Json).compilerOptions.types
$required = @('node','vitest/globals','@testing-library/jest-dom')
$missing = $required | Where-Object { $_ -notin $types }
if ($missing) { "MISSING types: $($missing -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：缺任一项（`vitest/globals` 缺失 → 200+ 类型错误）
- ✅ 合规：输出 `OK`

### 维度 ④ `strict` 必须为 true

**扫描命令**：

```bash
$base = Get-Content tsconfig.base.json -Raw
foreach ($k in @('"strict": true','"verbatimModuleSyntax": true','"noUncheckedIndexedAccess": true')) {
  if ($base -notmatch [regex]::Escape($k)) { "VIOLATION: 缺少 $k" }
}
```

**判定规则**：

- ❌ 违规：`strict` / `verbatimModuleSyntax` / `noUncheckedIndexedAccess` 任一不为 `true`
- ✅ 合规：无输出

### 维度 ⑤ tsup `platform` 必须是 `browser`

**扫描命令**：

```bash
rg -n "platform:" tsup.config.ts
```

**判定规则**：

- ❌ 违规：`platform: 'node'`
- ✅ 合规：`platform: 'browser'`

**修正模式**：

```ts
// ❌ 违规
export default defineConfig({ platform: 'node', ... });

// ✅ 修正
export default defineConfig({ platform: 'browser', ... });
```

### 维度 ⑥ 产物不得压缩

**扫描命令**：

```bash
rg -n "minify:" tsup.config.ts
```

**判定规则**：

- ❌ 违规：`minify: true`
- ✅ 合规：`minify: false`

### 维度 ⑦ `dist/index.mjs` 中 react / radix 必须保持 `import`

**扫描命令**：

```bash
pnpm build > $null 2>&1
$js = Get-Content dist/index.mjs -Raw
if ($js -match 'from\s+["'']react["'']') { "OK: react 保持 import" } else { "VIOLATION: react 可能被打进 bundle" }
if ($js -match '@radix-ui') { "OK: radix 保持 import" } else { "VIOLATION: radix 可能被打进 bundle" }
```

**判定规则**：

- ❌ 违规：react 或 radix 未以 `import` 形式出现（被打进 bundle）
- ✅ 合规：两条均 `OK`

### 维度 ⑧ 依赖分区正确

**扫描命令**：

```bash
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
# react 只能在 peerDependencies
if ($pkg.dependencies.PSObject.Properties.Name -contains 'react') { "VIOLATION: react 在 dependencies" }
if ($pkg.dependencies.PSObject.Properties.Name -contains 'react-dom') { "VIOLATION: react-dom 在 dependencies" }
# 所有 Radix peer 必须是 optional
$pkg.peerDependencies.PSObject.Properties.Name | Where-Object { $_ -like '@radix-ui/*' } | ForEach-Object {
  if (-not $pkg.peerDependenciesMeta.$_.optional) { "VIOLATION: $_ 未标记 optional" }
}
```

**判定规则**：

- ❌ 违规：react / react-dom 在 `dependencies`；或任一 Radix peer 未标 `optional`
- ✅ 合规：无输出

### 维度 ⑨ 源码 import 的包必须有对应依赖声明

**扫描命令**：

```bash
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$declared = @($pkg.dependencies.PSObject.Properties.Name) + @($pkg.peerDependencies.PSObject.Properties.Name)
$imported = rg -o "from ['\"]([^'\"]+)['\"]" -g "src/**/*.tsx" -g "src/**/*.ts" --no-filename -r '$1' 2>$null |
  Where-Object { $_ -notlike './*' -and $_ -notlike 'react' -and $_ -notlike 'react-dom' } |
  ForEach-Object { if ($_ -like '@*/*') { ($_ -split '/')[0..1] -join '/' } else { ($_ -split '/')[0] } } |
  Sort-Object -Unique
$missing = $imported | Where-Object { $_ -notin $declared -and $_ -notlike 'node:*' }
if ($missing) { "MISSING dependency: $($missing -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：源码 import 了未声明的包 → **发布后运行时崩溃**
- ✅ 合规：输出 `OK`

### 维度 ⑩ `package.json` 声明的产物必须真实存在

> ⛔ **这是发布正确性的终局检查** —— 声明与产物不一致 = 消费方 `import '@easbot/ui'` **直接失败**。

**扫描命令**：

```bash
pnpm build > $null 2>&1
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$declared = @($pkg.main, $pkg.module, $pkg.types)
$declared += $pkg.exports.'.'.import
$declared += $pkg.exports.'.'.require
$declared += $pkg.exports.'.'.types
$declared += $pkg.exports.'./styles.css'
$declared = $declared | Where-Object { $_ } | Sort-Object -Unique
$missing = $declared | Where-Object { -not (Test-Path $_) }
if ($missing) { "MISSING: $($missing -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：`package.json` 声明的任一路径在 `dist/` 中**不存在**
- ✅ 合规：输出 `OK`

> 📌 **实测踩过的坑**：tsup 的 `outExtension` 把 ESM 产物命名为 `index.mjs`，
> 而 `package.json` 写的是 `./dist/index.js` → **文件不存在** → 消费方 import 失败。
> **改了 `outExtension` 或 `exports` 后 MUST 跑本维度**。

### 维度 ⑪ `tsup.config.ts` 禁止重复键

**扫描命令**：

```bash
# 列出 tsup.config.ts 中出现多次的顶层配置键（重复 = 后者覆盖前者，静默失效）
$keys = Select-String -Path tsup.config.ts -Pattern '^\s{4}(\w+):' -AllMatches |
  ForEach-Object { $_.Matches.Groups[1].Value } |
  Where-Object { $_ -notin @('js','import','type','case','default') }
$keys | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { "DUPLICATE: $($_.Name) x$($_.Count)" }
```

**判定规则**：

- ❌ 违规：同一配置键出现多次（JS 对象字面量**后者覆盖前者**，前面的值**静默失效**）
- ✅ 合规：0 命中

**修正模式**：

```ts
// ❌ 违规 —— minify 出现两次，实际生效的是最后一个
minify: true,
sourcemap: false,
clean: true,
minify: false,
sourcemap: true,

// ✅ 修正 —— 每个键只保留一处
minify: false,
sourcemap: true,
```

---

## M+1. 历史基准（2026-10-31 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                        | 数值                       |
| --------------------------- | -------------------------- |
| Biome 版本                  | 2.5.5（schema v2）         |
| TypeScript 版本             | 6.0.3                      |
| tsup 版本                   | 8.5.1                      |
| Vitest 版本                 | 4.1.6                      |
| Storybook 版本              | 10.6.5                     |
| Tailwind 版本               | 4.3.3                      |
| Node 要求                   | `>=22.22.2`                |
| pnpm 要求                   | `>=10.0.0`                 |
| `dist/index.mjs`（ESM）体积 | ~129 KB（`minify: false`） |
| `dist/index.cjs`（CJS）体积 | ~141 KB（`minify: false`） |
| `dist/index.d.ts` 体积      | ~48 KB                     |
| `dist/styles.css` 体积      | ~171 KB                    |
| `npm pack --dry-run` 体积   | ~251 KB                    |
| `pnpm lint` 扫描文件数      | 156                        |
| `pnpm test` 用例数          | 254                        |

### 重测命令

```bash
pnpm build && pnpm test && pnpm type-check && pnpm lint && pnpm storybook:build
npm pack --dry-run
```

---

## M+2. 豁免清单

| 对象                                            | 豁免依据                                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `suspicious.noConsole: off`                     | **刻意关闭**：本库是**纯组件库**，无运行时日志需求（构建/脚本里的 `console.*` 属开发期诊断）                                                             |
| `style.useImportType: off`                      | **刻意关闭**：类型导入**建议**用 `import type`，但不强制（`verbatimModuleSyntax` 已保证运行期正确性）                                                    |
| `assist.source.organizeImports: off`            | **刻意关闭**：import 顺序靠人工 / 编辑器保证                                                                                                             |
| `correctness.noUnusedImports: warn`（非 error） | **降级为 warn**：避免未使用导入阻断提交                                                                                                                  |
| `zod` 在 `devDependencies`                      | **不在 `dependencies`**：源码 `src/` **0 处** import zod，仅 `src/form/form.test.tsx:19` 与 `form.stories.tsx:15` 使用 → 属**正确的 devDependency 归置** |
| 本库**无**覆盖率门槛                            | `vitest.config.ts` 未配 `thresholds` —— 覆盖率用于**观察**，不作**门禁**                                                                                 |

---

## M+3. 冲突裁决

| #   | 冲突点                           | 旧规范声明（easbot monorepo 版）       | 实际情况（本库）                                                                      | 裁决                                              |
| --- | -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| C1  | 配置层级                         | 根 `vitest.config.ts` + 22 个包级配置  | **只有根 `vitest.config.ts`**（单包）                                                 | **单层配置**（§3.1）                              |
| C2  | tsconfig 别名                    | 无 `paths`，靠 pnpm workspace 符号链接 | 根 `tsconfig.json` 有 `@` alias（`vitest.config.ts` / `.storybook/main.ts` 各自定义） | **本库有 `@` alias**（Vitest / Storybook 各自配） |
| C3  | 构建平台                         | `platform: 'node'`                     | 浏览器组件库                                                                          | **`platform: 'browser'`**（§3.2）                 |
| C4  | `tsconfig.base.json` 的 `noEmit` | monorepo 里发 `dist`                   | 本库产物由 tsup 出                                                                    | **`noEmit: true`**（类型检查不发产物）            |
| C5  | 日志规范                         | 有 `logging-standard.md`（8 项维度）   | 本库**无运行时日志**                                                                  | **不适用**（本规范无对应维度）                    |

---

## M+4. 模块检查清单

> **目的**：改动工程化配置时的**自查**清单（不是任务列表，是合规性自检表）。

### 改动依赖时

- [ ] 源码 import 的每个包已在 `dependencies` 或 `peerDependencies`（维度 ⑨）
- [ ] `react` / `react-dom` 只在 `peerDependencies`（维度 ⑧）
- [ ] 新增的 Radix peer 已加 `peerDependenciesMeta.optional`
- [ ] `tsup.config.ts` 的 `external` 已同步（维度 ⑦）
- [ ] 已实跑 `pnpm install`，`pnpm-lock.yaml` 已同步

### 改动构建配置时

- [ ] `platform: 'browser'`（维度 ⑤）
- [ ] `minify: false`（维度 ⑥）
- [ ] `dist/index.mjs` 中 react / radix 保持 `import`（维度 ⑦）

### 改动 lint / tsconfig 时

- [ ] Biome `globals` 含全部 vitest 全局（维度 ②）
- [ ] Biome `includes` 排除 `storybook-static/` / `coverage/`（维度 ①）
- [ ] `tsconfig.json` 的 `types` 含 `vitest/globals` / `@testing-library/jest-dom`（维度 ③）
- [ ] `strict` / `verbatimModuleSyntax` / `noUncheckedIndexedAccess` 均为 `true`（维度 ④）

### 发布前

- [ ] 五项门禁全绿（`build` / `test` / `type-check` / `lint` / `storybook:build`）
- [ ] `npm pack --dry-run` 产物不含 `src/` `tests/` `.storybook/`
- [ ] README 版本号与 `package.json` 一致
- [ ] `CHANGELOG.md` 已更新

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测**重写**（原 `code-quality.md` 189 行，引用 22 个子包 / `tsconfig.base.json` 的 `paths` 别名 / `easbot-build-commands.md` / `error-handling-standard.md` / `logging-standard.md` —— 本库**均不适用**）：① 确立**单包**工程化基线（Biome 2.5.5 / TS 6.0.3 / tsup 8.5.1 / Vitest 4.1.6 / Storybook 10.6.5 / Tailwind 4.3.3）；② 确立**构建链路**（tsup browser 库模式 + Tailwind CSS 构建期编译）与「为什么是 tsup 不是 Vite」的决策表；③ 确立**依赖三分区**与 5 条红线 + `exports` / `files` 契约；④ 确立 **11 项扫描维度**（新增「产物不得压缩」「产物中 react/radix 必须保持 import」「源码 import 必须有依赖声明」「**package.json 声明的产物必须真实存在**」「**tsup.config.ts 禁止重复键**」五项**面向发布正确性**的维度）；⑤ 全部维度**实测跑通** |

> 📌 **v1.0.0 期间实测修复的两个发布级缺陷**（已修，规范同步记录）：
> ① `package.json` 声明 `./dist/index.js`，但 tsup `outExtension` 产出的是 `index.mjs` → **文件不存在** → 消费方 import 失败。已把 `module` / `exports.import` 改为 `./dist/index.mjs`，并新增维度 ⑩ 防止复发。
> ② `tsup.config.ts` 存在**重复键**（`minify` / `sourcemap` / `clean` 各出现两次，前者被后者静默覆盖）。已去重，并新增维度 ⑪。 |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 命名 / 导出
- [`css-standard.md`](./css-standard.md) —— CSS 变量 / 主题 / token
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试写法
- [`storybook-standard.md`](./storybook-standard.md) —— Story 写法
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc
- [`package.json`](../package.json) / [`biome.json`](../biome.json) / [`tsup.config.ts`](../tsup.config.ts) —— 配置真值源
