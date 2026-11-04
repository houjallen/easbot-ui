# EASBot UI — Agent 指南

> **本文档是 Agentic Coding Agent 的项目入口地图**：定义核心规则、命令、目录结构与项目边界。
> 详细信息一律索引到 [`README.md`](./README.md) / [`README.en.md`](./README.en.md) / `src/`，
> 本文档**不重复**详细说明。

> **项目定位**：`@easbot/ui` 是一个**独立的单包 React 组件库**（56 个公开组件，基于 Radix UI + Tailwind CSS v4），
> 不是 monorepo，不含 `packages/` / `skills/` 目录。
>
> **规范体系**：`spec/` 是本库的**开发宪法**（14 份文档 + 探针脚本 `spec/scripts/`），
> 入口见 [`spec/spec-index.md`](./spec/spec-index.md) —— 新增组件 / 改样式 / 写测试前**先读对应规范**。

> **版本对齐**：与 `package.json` 一致（当前 `0.3.31`），详见 [`README.md`](./README.md) § 版本。

---

## 项目边界（必须遵守）

1. **组件库定位**：只做 React UI 组件与配套工程化（测试 / 文档 / 构建 / 发布）。
   **不引入**后端、CLI、Agent 运行时、数据库等领域逻辑。
2. **对外契约稳定**：组件的 props / 导出名 / DOM 结构属于**公开 API**。
   变更需走 **ADR 记录 + CHANGELOG + 版本 bump**（见「Git 工作流」）。
3. **消费方零配置**：样式必须在**组件库构建期**编译完成（`dist/styles.css`），
   消费方只需 `import '@easbot/ui/styles.css';`，**不得**要求消费方安装或配置 Tailwind。
4. **依赖分区严谨**：
   - `react` / `react-dom` → `peerDependencies`（宿主提供，避免双 React 实例）
   - Radix primitives → `peerDependencies` + `optional`（版本对齐）
   - 源码直接 import 的工具库 → `dependencies`
   - **凡是源码 `import` 的包，绝不能只放在 `devDependencies`**（否则发布后运行时找不到模块）
   - **凡是源码 `import` 的包，必须同步 `tsup.config.ts` 的 `external`**（否则被打进 bundle，消费方拿到重复实例）
5. **i18n / 日志 / 注释**：
   - **开发注释 / JSDoc** 使用**完整规范的中文**（技术名词可保留英文）。
   - **代码命名** 一律英文；**MD 文档** 中文，技术术语保留英文。
   - 本库**无运行时日志需求**（纯组件，不产生业务日志）；构建/脚本中的 `console.*` 属开发期诊断。
6. **内置国际化**：组件库**自带**用户可见文案的双语默认文案（内置 i18n），
   **不引入** `react-i18next` / `i18next` 等外部 i18n 库；
   语言由消费方通过 `LocaleProvider` / `locale` prop 注入。
   详见 [`spec/i18n-standard.md`](./spec/i18n-standard.md)。
7. **TODO 约束**：所有**未决策 / 待设计 / 占位**实现必须使用 `// TODO: ...` 注释明确标注
   （含来源、待完成事项、决策路径）。
8. **测试用例同步**：每个**新功能 / Bug 修复 / 重构**必须配套单元测试（Vitest 5），
   覆盖核心路径 + 边界 + 异常。**提交前必须补齐**测试覆盖。
9. **README 同步**：任何**导出变更 / 新增组件 / CLI 命令 / 数据结构 / 开发命令**变更，
   MUST 在提交前同步更新 [`README.md`](./README.md) + [`README.en.md`](./README.en.md)。
10. **规范优先**：写组件 / 改样式 / 写测试前**先读** [`spec/spec-index.md`](./spec/spec-index.md) 里对应的规范；
    每份规范含**可复跑的扫描维度**（命令 + 判定 + 修正模式），
    **提交前 MUST 跑完**相关维度 —— 规范与实现冲突时**改规范**，不留双轨。
11. **类型导入**：项目开启 `verbatimModuleSyntax` —— **类型必须用 `import type` 显式导入**，
    否则 `pnpm type-check` 报 TS1484。**禁止**用 `@/` 路径别名，一律用**相对路径**。

---

## 核心命令（与 `package.json` scripts 对齐）

```bash
# 安装与构建
pnpm install
pnpm build                # tsup（JS + d.ts）+ Tailwind CSS 编译
pnpm build:css            # 仅编译 Tailwind CSS → dist/styles.css
pnpm clean                # 删除 dist/

# 测试（Vitest 5 + jsdom）
pnpm test                 # 单次运行
pnpm test:watch           # 监听模式
pnpm test:coverage        # 覆盖率
pnpm vitest run src/ui/button            # 单目录
pnpm vitest run src/ui/button/__tests__/button.test.tsx   # 单文件

# 类型检查与代码规范
pnpm type-check           # tsc --noEmit
pnpm lint                 # biome check .
pnpm lint:fix             # biome check --write .
pnpm lint:report          # biome check --reporter=summary .
pnpm format               # biome format + prettier（md）
pnpm format:fix           # 自动格式化

# i18n 规范扫描（spec/i18n-standard.md 维度①③④⑤⑥）
pnpm check:i18n           # tsx scripts/check-i18n.ts（0 违规 = 通过）

# Storybook
pnpm storybook            # 开发预览 → http://localhost:6006
pnpm storybook:build      # 静态站点 → storybook-static/

# 版本管理（统一 bump，打 tag easbot-ui@<version>）
pnpm version:patch
pnpm version:minor
pnpm version:major
pnpm version:pre-commit   # pre-commit 版本校验

# 发布
pnpm publish:list         # 查询 npm 已发布版本
pnpm publish:npm          # 发布到 npm（需先 npm login，bash / Git Bash）
pnpm publish:npm:win      # 发布到 npm（Windows PowerShell）
```

> **命令源真相**：以根 `package.json` scripts 为准；本文档若与脚本冲突，根 package.json 优先。

---

## 目录结构

```
.
├── src/
│   ├── index.ts              # 公开 API 出口（tsup 唯一构建入口）
│   ├── ui/                   # 公开组件层（56 个组件目录）
│   │   └── <component>/      # 实现文件 + __tests__/ + index.ts
│   ├── components/           # 应用层组件（ThemeToggle / LocaleToggle）
│   ├── design-system/        # 设计系统层（46 个基础组件 + Provider + hooks + lib）
│   ├── models/               # 数据契约层（Zod Schema：table / filter / data-store / axios）
│   ├── utils/                # 通用工具层（cn / object / locale / error / validation-rule …）
│   │   ├── ui-message.ts         # i18n 处理引擎（processUiMessage 等纯函数）
│   │   ├── component-messages.ts # 内置文案表（21 个文案域，zh-CN + en-US）
│   │   └── use-component-message.ts # React 侧文案 Hook（useComponentMessage）
│   ├── hooks/                # 通用 React Hook（useDevice / useLocale / useTheme）
│   ├── providers/            # 上下文 Provider（LocaleProvider / ThemeProvider / NotifyProvider）
│   ├── theme/                # 主题资源层（唯一 CSS 入口 / 字体 / 多套主题 / tokens）
│   │   ├── styles.css            # ⭐ Tailwind v4 唯一编译入口（@source 扫描 src/）
│   │   └── themes/               #   light.css（706 个）/ dark.css（706 个）+ 5 套扩展主题
│   └── types/                # 类型声明（typings.d.ts）
├── tests/
│   ├── setup.ts              # Vitest 全局设置（jest-dom/vitest matcher 注册 + RTL cleanup）
│   └── polyfills.ts          # jsdom 缺失的浏览器 API 共享 polyfill
├── docs/                     # 消费方文档（组件文档 / getting-started / theming）
├── spec/                     # 开发规范（8 份，见 spec/spec-index.md）
│   ├── spec-index.md         #   规范索引 + 按场景导航 + 全库自检命令
│   ├── component-standard.md #   组件目录 / 命名 / 导出 / 封装 / cva / cn
│   ├── css-standard.md       #   CSS 变量 / 主题 / token / Tailwind 用法
│   ├── testing-guidelines.md #   Vitest 配置 / 用例结构 / 断言 / polyfill
│   ├── storybook-standard.md #   CSF3 / meta / story / argTypes / 装饰器
│   ├── code-annotation-standard.md # 注释与 JSDoc 注解规范
│   ├── code-quality.md       # Biome / TypeScript / 构建 / 依赖分区
│   └── i18n-standard.md      # 内置 i18n 规范 / 三层用法 / 文案表 / 豁免清单
├── scripts/                  # 版本管理 / CHANGELOG / 发布 / i18n 扫描脚本（零外部依赖）
│   ├── check-i18n.ts         # i18n 规范扫描脚本（维度①③④⑤⑥）
│   └── lib/package-discovery.ts  # 脚本共享的 package.json 发现逻辑
├── .storybook/               # Storybook 配置（main.ts / preview.tsx）
├── .husky/                   # pre-commit / commit-msg hook
├── .github/workflows/        # ci.yml / release.yml
├── tsup.config.ts            # 构建配置（platform: browser，external 56 个包）
└── vitest.config.ts          # 测试配置（environment: jsdom）
```

---

## 组件开发规范

> **完整规范见 [`spec/`](./spec/spec-index.md)**（**唯一真值源**），本节仅速查；冲突时以 `spec/` 为准。
> 每份规范含 **8-12 项可复跑扫描维度**（命令 + 判定 + 修正模式），评审**必须**跑。

### 目录约定

每个组件必须是**自包含目录**（位于 `src/ui/` 下）：

```
src/ui/<component>/
├── <component>.tsx          # 组件实现（named export + forwardRef + displayName）
├── __tests__/
│   ├── <component>.test.tsx     # Vitest 单测
│   └── <component>.stories.tsx  # Storybook CSF3 story
└── index.ts                 # export * from './<component>' + 类型导出
```

> 📌 **测试与 Story 一律放在 `__tests__/` 子目录** —— 与组件源码分离。
> 部分组件有多个实现文件（`<component>-<part>.tsx`）或子目录（`hooks/` `locale/` `view/` 等），
> 详见 [`spec/component-standard.md`](./spec/component-standard.md) §1。

> 详见 [`spec/component-standard.md`](./spec/component-standard.md) §1。

### 组件实现约定

| 约定         | 说明                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **导出方式** | **named export**（禁止 `export default`）+ `React.forwardRef` + `displayName`                                                                            |
| **props**    | `export interface XxxProps`；变体取值用 `NonNullable<VariantProps<...>>` 派生                                                                            |
| **样式**     | Tailwind 原子类 + `var(--xxx)` CSS 变量；**不写内联 style**（除动态计算值）                                                                              |
| **类名合并** | 一律用 `cn()`（`src/utils/classnames.ts`），`className` 放**末位**                                                                                       |
| **变体**     | 用 `cva`（class-variance-authority）定义 `variants` + `defaultVariants`，常量名 `<component>Variants`                                                    |
| **图标**     | **唯一使用 `lucide-react`**；**必须**具名导入（`import { Loader2 } from 'lucide-react'`），**禁止**命名空间导入 / 引入第二图标库 / 内联 SVG path         |
| **无障碍**   | 基于 Radix primitives；透传 `aria-*` / `data-*` 属性；交互元素必须有键盘可达性                                                                           |
| **主题**     | 新增样式变量必须在 `src/theme/themes/light.css` 与 `src/theme/themes/dark.css` **两处**同步定义（当前各 706 个变量）                                     |
| **语义类**   | `bg-primary` 等语义类**必须**经 `@theme inline` 注册，否则**静默失效**                                                                                   |
| **类型导入** | `verbatimModuleSyntax` 开启 —— 类型**必须**用 `import type` 显式导入（否则 TS1484）                                                                      |
| **路径**     | **禁止** `@/` 路径别名，一律用**相对路径**                                                                                                               |
| **数据契约** | 消费方传入的配置对象**必须**用 Zod Schema 定义（`src/models/`），类型经 `z.infer` 推导                                                                   |
| **国际化**   | 用户可见文案必须走 `useComponentMessage('<domain>')`，文案定义在 `src/utils/component-messages.ts`（zh-CN + en-US 双语）；**禁止**内联中英文字符串字面量 |

> 详见 [`spec/component-standard.md`](./spec/component-standard.md) §3 与 [`spec/css-standard.md`](./spec/css-standard.md) §3
> 与 [`spec/i18n-standard.md`](./spec/i18n-standard.md) §6（组件接入模板）。

### 测试约定

| 约定         | 说明                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **API**      | 用 `vi.*`（**不是** `jest.*`）                                                                     |
| **matcher**  | 由 `tests/setup.ts` 通过 `@testing-library/jest-dom/vitest` 全局注册，测试文件**不要**逐个 import  |
| **环境**     | `jsdom`（vitest.config.ts 已配置），组件无需自建环境                                               |
| **位置**     | `src/ui/<component>/__tests__/<component>.test.tsx`（测试与 Story 统一收纳在 `__tests__/` 子目录） |
| **polyfill** | jsdom 缺失的浏览器 API（`ResizeObserver` / `scrollIntoView`）**必须**从 `tests/polyfills.ts` 导入  |
| **断言风格** | 优先语义化查询（`getByRole` / `getByLabelText`），避免 `getByTestId`                               |
| **覆盖维度** | 渲染 / 状态 / 交互 / 无障碍 四类至少各一                                                           |
| **同步原则** | 改实现**必须**同步改断言（断言与实现同源）                                                         |

> 详见 [`spec/testing-guidelines.md`](./spec/testing-guidelines.md)。

### Storybook 约定

| 约定         | 说明                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **写法**     | CSF3（`const meta: Meta<typeof X> = {...}` + `export default meta` + `type Story = StoryObj<typeof X>`）                 |
| **title**    | `EASAI/<Component>`（保持全库统一前缀）                                                                                  |
| **tags**     | `['autodocs']`（生成文档页）                                                                                             |
| **variants** | 每个变体 / 尺寸都应有对应 story                                                                                          |
| **主题**     | 由 `preview.tsx` 的 `withThemeByClassName` 提供 light / dark                                                             |
| **样式**     | `.storybook/main.ts` **必须**注册 `@tailwindcss/vite` 插件 —— 否则 Tailwind 编译器不接管，**零个原子类生成**（样式全丢） |

> 详见 [`spec/storybook-standard.md`](./spec/storybook-standard.md)。

---

## 工具链决策（勿反复推翻）

| 决策         | 结论                                        | 理由                                                               |
| ------------ | ------------------------------------------- | ------------------------------------------------------------------ |
| **构建工具** | **tsup**，不引入 `vite.config.ts` 作为构建  | 组件库只需「源码 → lib + dts」；esbuild 更快、配置更少             |
| **Vite**     | 仅作为 `@storybook/react-vite` 内部依赖存在 | Storybook 需要 dev server + HMR + CSS 处理                         |
| **样式方案** | Tailwind v4，**构建期全量编译**             | 消费方零配置；Tailwind 是构建期工具，不进运行时依赖                |
| **动画类**   | `tw-animate-css`（v4 兼容）                 | 原 `tailwindcss-animate` 是 v3 插件，v4 下不提供 `animate-in` 等类 |
| **测试框架** | Vitest 5 + jsdom，**不引入** addon-vitest   | addon-vitest 走浏览器模式（需 playwright），CI 重且重复建设        |
| **数据契约** | Zod 4（schema 即运行时校验器）              | 类型与校验同源，避免双轨维护；消费方配置开箱即用                   |
| **国际化**   | 内置双语文案 + `useComponentMessage`        | 不引入 `react-i18next` / `i18next`；组件库无状态，语言由消费方注入 |
| **压缩**     | 不压缩，保留 sourcemap                      | 压缩交给消费方 bundler；组件库需可调试                             |

---

## Git 工作流

### 提交规范

1. **commit message**：`<type>(<scope>): <description>`，summary ≤ 72 字符
   - type：`feat | fix | docs | test | chore | refactor | perf | ci`
   - scope：组件名（`button` / `dialog` / `toast` …）或 `build` / `test` / `ci` / `deps` / `docs`
   - description 用中文，说明**做了什么**（不写「更新代码」这类空话）
   - body 可选：解释**为什么**这么改、影响面、迁移指引
2. **分支**：从 `main` 拉 `feature/<scope>-<name>` / `fix/<scope>-<name>` / `chore/<scope>-<name>` /
   `docs/<scope>-<name>` / `refactor/<scope>-<name>`，合并回 `main`（无 develop 分支）。
3. **自动化**：
   - husky `pre-commit` → `lint-staged`（biome check + format 处理代码；prettier 处理 md）
   - husky `commit-msg` → 手写 POSIX shell + `grep -qE` 校验消息格式（**不使用 commitlint**）
   - **无需手跑** `pnpm lint && pnpm type-check`（CI 会跑）
4. **版本管理**：`pnpm version:patch|minor|major`（脚本 `scripts/bump-version.ts`），
   自动同步 `package.json` + README 版本段 + CHANGELOG，打 tag `easbot-ui@<version>`。

### 提交前的「影响面 → 文档」对照

**改了 `src/ui/<component>/` 就必须同步 `docs/components/**/<component>.md`。**
提交前按改动类型对照下表，缺一项就别提交：

| 改动类型                                           | 必须同步的位置                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| props 增删 / 改名 / 类型变化                       | 对应组件文档的「属性」表                                                                            |
| 行为语义变化（默认值、判定规则、错误处理）         | 对应组件文档的「注意事项」+ 正文说明                                                                |
| 导出面变化（新增 / 删除 / 重命名导出）             | 对应组件文档的「导出」章节 + `docs/README.md` + 根 `README.md` / `README.en.md`                     |
| 主题变量增删                                       | `src/theme/themes/light.css` **与** `dark.css` 同步 + `docs/theming.md`                             |
| 内置文案增删                                       | `src/utils/component-messages.ts`（zh-CN + en-US **同步**）+ `docs/getting-started.md` 的文案域清单 |
| 组件目录增删                                       | `docs/README.md` 组件清单 + 根 `README.md` / `README.en.md` 的组件数量                              |
| **破坏性变更**（props 语义 / DOM 结构 / 导出形状） | `docs/decisions/` 新增 ADR + `CHANGELOG.md` + 版本 bump                                             |

> 📌 **组件数量 / 导出数量 / 文案域数量**是三个**必须与代码一致**的数字，
> 改动后用脚本核对（勿手数）：
>
> ```bash
> (Get-ChildItem src/ui -Directory).Count                                    # 组件目录数
> pnpm build && grep -c 'export' dist/index.d.ts                             # 导出总数（构建后）
> grep -cE '^\s{2}[a-zA-Z]+:\s*[a-zA-Z]+Messages,' src/utils/component-messages.ts  # 文案域数
> ```

### 提交粒度

- ✅ **一个提交 = 一件事** —— 修缺陷 / 加功能 / 改文档分开提交，便于回滚与 bisect。
- ✅ **代码与测试同提交** —— 修复必须带回归用例（AGENTS.md 第 8 条）。
- ✅ **代码与其对应文档同提交** —— 不留「代码已改、文档待补」的中间态。
- ❌ **不提交无关改动** —— 格式化 / import 排序等噪声单独一笔 `chore` 提交。
- ❌ **不把 `dist/`、`.env`、凭据文件纳入版本库**。

### Agent 安全红线

- ❌ NEVER 修改 git config / 跳过 hooks（`--no-verify` / `--no-gpg-sign`）/ `push --force` main+master
- ❌ NEVER `git commit` 除非用户**显式要求**
- ❌ NEVER `git add -A` / `git add .`（可能误纳 `.env` / 凭据文件）
- ❌ NEVER 未经用户确认就执行 `pnpm publish:npm`（不可逆的公开操作）
- ✅ `git add <精确文件>` + `git commit -m "..."`

---

## 发布流程

```
pnpm version:patch        # 1. bump 版本 + 同步 README + 生成 CHANGELOG + 打 tag
git add package.json README.md README.en.md CHANGELOG.md
git commit -m "chore(release): easbot-ui@0.3.32"
git push && git push --tags
pnpm publish:npm          # 2. 本地发布到 npm（需先 npm login）
```

**GitHub Release**：推送 `easbot-ui@*` tag 会触发 `.github/workflows/release.yml`，
自动创建 Release 并附带 npm tarball。

**发布前自检**（`pnpm build && pnpm test && pnpm type-check && pnpm lint && pnpm check:i18n && pnpm storybook:build` 全绿）：

- [ ] `dist/index.mjs` / `dist/index.cjs` / `dist/index.d.ts` / `dist/styles.css` 均存在
- [ ] `dist/index.mjs` 中 react / radix / zod 保持 `import`（未被打进 bundle）
- [ ] `npm pack --dry-run` 产物不含 `src/` `tests/` `.storybook/`
- [ ] README 版本号与 `package.json` 一致
- [ ] README 组件清单数量与 `src/ui/` 实际目录数一致
- [ ] `pnpm check:i18n` 输出 **0** 违规（i18n 维度①③④⑤⑥）

---

## 依赖管理红线

改动 `package.json` 依赖时 MUST 核对：

1. 源码中 `import` 的每个包 → 必须在 `dependencies` 或 `peerDependencies`
   （**只在 `devDependencies`** = 发布后运行时崩溃）
2. `react` / `react-dom` → 只能在 `peerDependencies`
3. Radix primitives → `peerDependencies` + `peerDependenciesMeta.optional`
4. 仅测试 / story / 构建使用 → `devDependencies`
5. 新增依赖后 MUST 实跑 `pnpm install` 确认 `pnpm-lock.yaml` 已同步
6. 新增依赖后 MUST 同步 `tsup.config.ts` 的 `external` 数组
   （漏配 = 被打进 bundle → 消费方拿到重复实例，典型症状：Zod `instanceof` 校验失败）

### 数据契约约定（Zod）

| 约定            | 说明                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| **Schema 位置** | 消费方传入的配置对象 → `src/models/<domain>.ts`；通用校验规则 → `src/utils/validation-rule.ts`            |
| **写法**        | `export const XxxSchema = z.object({...})`，类型用 `z.infer<typeof XxxSchema>` 导出，**不手写 interface** |
| **递归 schema** | 必须显式声明 interface + `z.ZodType<T>` 标注（否则 TS7022 / TS2502 / TS2456 循环推导报错）                |
| **Zod v4 差异** | `.args()` / `.returns()` 已移除 → 用 `z.function({ input: [...], output: ... })`                          |
| **公开 API**    | Schema 随 `src/index.ts` barrel 导出，消费方可直接 `.parse()` 做运行时校验                                |
