---
name: css-standard
description: 该规范定义 easbot-ui 组件库的样式与主题契约，含 Tailwind CSS v4 构建期编译链路（src/theme/styles.css 单一入口 / @source '../**/*.{ts,tsx}' 扫描 src/ 且排除 .md / dist/styles.css 交付）、src/theme/ 目录布局与文件归属（styles.css 入口 / themes/ 主题变量 / fonts/ 字体 / images/ 图标 / styles/ 辅助样式）、构建与开发两条编译路径都必须启用 Tailwind 编译器（Storybook 侧漏注册 @tailwindcss/vite 会导致零个原子类生成、样式全丢）、CSS 变量命名规则（全局语义变量 / 组件私有前缀变量 / 状态后缀）、主题双文件机制（src/theme/themes/light.css 与 dark.css 必须同步且变量集合完全一致）、@theme inline 语义 token 注册规则（不注册则 bg-primary 等语义类静默失效）、灰阶变量必须用 hsl() 包裹（主题文件存的是裸 HSL 分量）、@custom-variant dark 对齐 data-theme 机制、层叠层顺序与优先级规则、CSS 变量 vs Tailwind 任意值的选型规则、样式 12 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与新增样式变量检查清单。当编写组件样式、新增主题变量、排查样式不生效或主题切换异常时参考。
category: specification
version: 2.1.1
baseline-date: 2026-11-02
tags: [easbot-ui, css, tailwind, theme, design-token, dark-mode, style, code-review]
related:
  - spec-index.md
  - architecture-standard.md
  - component-standard.md
  - testing-guidelines.md
  - storybook-standard.md
  - code-annotation-standard.md
  - code-quality.md
---

# EASBot UI 样式与主题规范 (CSS Standard)

> **真值源**：本规范以 [`src/theme/styles.css`](../src/theme/styles.css)、
> [`src/theme/themes/light.css`](../src/theme/themes/light.css)、
> [`src/theme/themes/dark.css`](../src/theme/themes/dark.css)
> 与 `package.json#scripts#build:css` 为唯一执行真值；
> 规范与实现冲突时**规范改**（先改规范再改实现，不留双轨）。
>
> **与其它规范的分工**（四者**不重复**）：
>
> | 关注点                               | 归属文档                                                 | 本规范对应章节     |
> | ------------------------------------ | -------------------------------------------------------- | ------------------ |
> | 组件目录 / 命名 / 导出 / `cn()` 合并 | [`component-standard.md`](./component-standard.md)       | §3.6（仅类名写法） |
> | 测试断言里的类名写法                 | [`testing-guidelines.md`](./testing-guidelines.md)       | §4.3（仅断言什么） |
> | lint / 构建命令 / 依赖               | [`code-quality.md`](./code-quality.md)                   | §1（仅 build:css） |
> | 层归属 / 依赖方向 / 构建链路         | [`architecture-standard.md`](./architecture-standard.md) | §1（仅入口位置）   |

> **历史基准**：v2.0.0 锁定 2026-11-02 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本库是**构建期编译 Tailwind** 的组件库：样式在库构建时全部编译成 `dist/styles.css`，消费方只需
`import '@easbot/ui/styles.css';`，**无需**安装或配置 Tailwind。

这带来一条**区别于普通项目**的核心约束：**样式写错不会报错，只会静默失效**。
本规范存在的唯一目的，就是把这类「静默失效」变成**可扫描、可判定**的问题。

**核心约束**：

- ✅ **单一 CSS 入口** —— 编译入口**唯一**是 [`src/theme/styles.css`](../src/theme/styles.css)；
  `src/` 根目录**不再**放 `styles.css` / `theme-light.css` / `theme-dark.css`
- ✅ 组件样式**必须**通过 CSS 变量取值（`var(--xxx)` 或 `bg-[var(--xxx)]`），**禁止**硬编码颜色值
- ✅ 新增 CSS 变量**必须**在 `src/theme/themes/light.css` 与 `src/theme/themes/dark.css` **两处**同步定义，且**变量集合必须完全一致**
- ✅ 主题变量**必须**在 `@theme inline` 中注册为 `--color-*` token，否则语义类（`bg-primary`）**不生成任何 CSS**
- ✅ 灰阶变量（`--gray-*`，裸 HSL 分量）**必须**写成 `hsl(var(--gray-500))`
- ✅ `dark:` 变体**必须**走 `@custom-variant dark`（对齐 `data-theme`），**禁止**依赖 `@media (prefers-color-scheme)`
- ✅ **`@source` 必须相对入口重算** —— 入口在 `src/theme/`（两级深），故用 `'../**/*.{ts,tsx}'`（= `src/`），
  并显式 `@source not '../../**/*.md'` 排除文档（否则扫到仓库根，产物膨胀 14 倍 + 优化器告警）（§1.4）
- ✅ **构建路径**（`pnpm build:css`）与**开发路径**（Storybook）**必须都启用 Tailwind 编译器** —— 否则 Storybook 里**零个原子类**生成，样式全丢（§1.6）
- ✅ 样式**必须**落在 Tailwind 的 `utilities` 层（原子类）—— 优先级**高于** `base` 层的 preflight（§3.5）
- ✅ 所有 CSS 变更**必须**在 `src/theme/` 下通过 `@import` / `@theme` / `@utility` 声明，**禁止**在组件里写 `<style>`
- ❌ 禁止在组件源码里硬编码 `hsl(...)` / `#fff` / `rgb(...)` 等颜色字面量
- ❌ 禁止引用**未在主题文件中定义**的 CSS 变量
- ❌ 禁止用 `!important` 覆盖样式（存量豁免见 §M+2）

---

## 1. 构建链路

### 1.1 单一入口的三段式编译

```
src/theme/styles.css  ──(tailwindcss CLI, 构建期扫描 src/)──>  dist/styles.css
   ↑                                                       ↑
   ├─ @import 'tailwindcss'                                └─ 消费方唯一需要的产物
   ├─ @import 'tw-animate-css'
   ├─ @import './themes/light.css'
   ├─ @import './themes/dark.css'
   ├─ @source '../../**/*.{ts,tsx}'
   ├─ @custom-variant dark (...)
   └─ @theme inline { ... }
```

**命令**（真值源 = `package.json#scripts`）：

```bash
pnpm build:css    # tailwindcss -i ./src/theme/styles.css -o ./dist/styles.css --minify
pnpm build        # tsup（JS + d.ts）+ build:css
```

> ⚠️ **Tailwind 是构建期工具，不进运行时依赖** —— 它在 `devDependencies`，消费方不需要安装。

### 1.2 `src/theme/` 目录布局

```
src/theme/
├── styles.css             # ⭐ 唯一编译入口（@source / @theme inline / @custom-variant / @utility）
├── index.ts               # 主题类型导出（Theme / themes）
├── themes/                # 主题变量层
│   ├── light.css          #   ⭐ 亮色变量（:root[data-theme='light']，702 个）
│   ├── dark.css           #   ⭐ 暗色变量（:root[data-theme='dark']，702 个）
│   ├── variables.css      #   @theme 块（--font-sans / --radius-* / --eas-* 尺寸与层级）
│   ├── index.ts           #   7 套主题的导入与类型
│   └── variants/          #   额外 5 套主题（独立选择器，不被入口 import）
│       ├── high-contrast.css
│       ├── soft.css
│       ├── deep-ocean.css
│       ├── forest.css
│       └── eye-care.css
├── fonts/                 # 字体 CSS 声明源（二进制在 public/font/）
│   ├── fonts.ts           #   @font-face 生成器（buildFontFace / buildFontsCss）
│   └── index.ts
├── images/svg/            # SVG 图标资源（language.svg / refresh.svg）
└── styles/                # 辅助样式（非编译入口）
    ├── prefix.css         #   层级兜底 / eas-* 工具类
    ├── tokens.ts          #   调色板常量（TS）
    └── iconfont/          #   iconfont / officefont 的 CSS 声明源（二进制在 public/icon/）
        ├── icons.ts       #     字体清单与 CSS 生成函数（唯一真值源）
        ├── iconfont.css   #     796 个 .icon-xxx:before 的 content 映射
        └── officefont.css #     Symbol / Wingdings 家族声明
```

> 📌 **静态资源在仓库根的 `public/`**（**不进 npm 包**）——
> 与消费方的静态资源目录**同名同结构**：

```
public/
├── font/                  # 思源黑体 7 个字重（.otf）+ SIL OFL 1.1 LICENSE
│   ├── SourceHanSansCN-ExtraLight.otf   # weight 200
│   ├── SourceHanSansCN-Light.otf        # weight 300
│   ├── SourceHanSansCN-Normal.otf       # weight 400
│   ├── SourceHanSansCN-Regular.otf      # weight 450
│   ├── SourceHanSansCN-Medium.otf       # weight 500
│   ├── SourceHanSansCN-Bold.otf         # weight 700
│   ├── SourceHanSansCN-Heavy.otf        # weight 900
│   └── LICENSE.txt
└── icon/                  # 图标字体（woff + ttf + 2 个 officefont）
    ├── iconfont.woff
    ├── iconfont.ttf
    ├── symbol.ttf
    └── wingding.ttf
```

> 📌 **职责划分** —— 字体二进制是**静态资源**（浏览器按 URL 请求）→ `public/`；
> CSS 声明源是**源码**（参与构建）→ `src/`。详见 §1.7 / §1.8。

| 文件                             | 角色                                  | 是否编译入口                | 消费方可见                                      |
| -------------------------------- | ------------------------------------- | --------------------------- | ----------------------------------------------- |
| `styles.css`                     | **唯一** Tailwind 入口                | ✅                          | 经 `dist/styles.css` 内联                       |
| `themes/light.css`               | 亮色主题变量                          | ❌（被 import）             | 经 `dist/styles.css` 内联                       |
| `themes/dark.css`                | 暗色主题变量                          | ❌（被 import）             | 经 `dist/styles.css` 内联                       |
| `themes/variables.css`           | `@theme` 块（尺寸 / 层级）            | ❌（被 import）             | 经 `dist/styles.css` 内联                       |
| `styles/prefix.css`              | 层级兜底 / `eas-*` 工具类             | ❌（被 import）             | 经 `dist/styles.css` 内联                       |
| `../ui/table/style/table.css`    | Table 组件样式（`eas-table-*`）       | ❌（被 import，**跨目录**） | 经 `dist/styles.css` 内联                       |
| `fonts/fonts.ts`                 | `@font-face` 生成器（TS）             | ❌                          | 经 `dist/fonts.css` 导出（**opt-in**，§1.7）    |
| `styles/iconfont/icons.ts`       | 图标字体声明源（TS）                  | ❌                          | 经 `dist/iconfont.css` 导出（**opt-in**，§1.8） |
| `styles/iconfont/iconfont.css`   | 图标字体源 CSS（**含 content 映射**） | ❌                          | 由 `build:icons` **重新生成**（路径改写，§1.8） |
| `styles/iconfont/officefont.css` | officefont 家族声明                   | ❌                          | 由 `build:icons` **重新生成**（§1.8）           |

> 📌 **`styles/prefix.css` 已被入口 import**（v2.0.0 补齐）——
> 它提供 `eas-sm-hidden` / `eas-badge-dot` / `eas-close-btn` / `eas-main-scroll`
> 与 Radix 弹层层级兜底（`z-index: var(--eas-z-index-*)`）。
> v1.x 时代该文件存在却**未被任何入口引用**，等于写了不用。
> ⚠️ import 顺序有讲究：**必须在原子类之后**（utilities 层内按源码顺序生效），
> 否则会被 Tailwind 生成的 `z-50` 等工具类覆盖。

> 📌 **Table 组件样式是**「跨目录 import」**（v2.0.2 补齐）** ——
> `src/ui/table/style/table.css` 提供 **49 个 `eas-table-*` 选择器**
> （sticky header / bordered / density / striped / fullscreen / scroll / 静态表单），
> 而组件源码（`src/ui/table/atoms/TableCell.tsx` / `TableRow.tsx` / `TableHeader.tsx` /
> `TableContainer.tsx`）**确实在用**这些类名。
> v2.0.2 之前该文件**未被任何入口引用** → 表格核心样式**全部静默失效**。
> ⚠️ 同样**必须排在原子类之后**，才能覆盖 `border-b` / `text-left` 等工具类。

> 📌 **入口位置的历史沿革** —— v1.x 的入口是 `src/styles.css`（在 `src/` 根），
> 主题变量是 `src/theme-light.css` / `src/theme-dark.css`（也在 `src/` 根）。
> v2.0.0 起**全部收敛到 `src/theme/`** —— 理由见 §1.3。

### 1.3 为什么收敛到 `src/theme/`

| #   | 理由                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **主题资源与主题变量物理同区** —— 字体 / 主题变量 / 图标 / 辅助样式原本散在 `src/theme/`（字体等）与 `src/` 根（变量）两处                       |
| 2   | **`src/` 根只留「代码」** —— `src/index.ts` / `src/styles.css` / `src/theme-*.css` 混在根目录时，无法一眼看出哪个是入口                          |
| 3   | **入口唯一化** —— 避免「`src/styles.css` 与 `src/theme/styles.css` 并存」导致**编译入口歧义**（两个都像入口）                                    |
| 4   | **`@source` 路径更短** —— 入口从 `src/` 根移到 `src/theme/` 后，扫描路径由 `'./**/*.{ts,tsx}'` 变为 `'../../**/*.{ts,tsx}'`（仍覆盖整个 `src/`） |

> ⚠️ **迁移是**「移动」不是「复制」** —— 旧的 `src/styles.css` / `src/theme-light.css` /
> `src/theme-dark.css` **必须删除**，否则出现两个入口、两套变量来源。

### 1.4 `@source` 扫描范围

```css
/* src/theme/styles.css */
@source '../**/*.{ts,tsx}'; /* ① 扫描 src/ 全部 ts/tsx */
@source not '../../**/*.md'; /* ② 排除仓库内 Markdown */
```

| #   | 事实                                                   | 说明                                                 |
| --- | ------------------------------------------------------ | ---------------------------------------------------- |
| ①   | 扫描范围**相对入口文件所在目录**                       | 入口在 `src/theme/`（**两级深**），`../` = `src/`    |
| ②   | 必须**排除 `.md`**                                     | Tailwind v4 会**自动探测**仓库内的 `.md`（见下方⛔） |
| ③   | stories 文件**也在扫描范围内**                         | `src/**/*.stories.tsx` 的类名**会**进产物            |
| ④   | 主题文件自身**不在扫描范围内**                         | 但通过 `@import` 进入产物                            |
| ⑤   | `src/theme/` 下的 `.ts`（如 `fonts.ts`）**也在范围内** | 其中的类名会进产物                                   |

> ⛔ **`../` vs `../../` —— 一个字符的致命差异**
>
> 入口从 `src/styles.css`（1 级深）迁到 `src/theme/styles.css`（**2 级深**）后，
> `@source` 的相对基准随之改变：
>
> | 写法           | 解析结果       | 后果                                                    |
> | -------------- | -------------- | ------------------------------------------------------- |
> | `'../**/*'`    | `src/`         | ✅ 正确 —— 只扫 `src/`                                  |
> | `'../../**/*'` | **仓库根目录** | ❌ 扫到 `docs/` / `node_modules/` / `storybook-static/` |
>
> 实测（`../../`）：产物多出 **64 个文档噪声类**
> （`h-[var(--switch-sm-height)]` / `bg-[#ff0000]` / `animate-out` / `animate-ripple` /
> `border-[var(--toggle-outline-border)]` / `space-y-1.5` …），
> 并触发 CSS 优化器告警 `Unexpected token Delim('<')`。
> **正确扫描的类集合是「bug 状态」的严格子集**（差集为 0）—— 即修掉它**零丢失**。
>
> 📌 **判定命令**（见 §M 维度 ⑫）：
>
> ```bash
> # 入口在 src/theme/（两级深）→ ../ 才是 src/，../../ 是仓库根
> grep -n "@source" src/theme/styles.css
> ```

> ⛔ **必须排除 `.md`** —— Tailwind v4 会把仓库内 `.md` 也当作**候选类来源**：
> `docs/components/form/switch.md` 里的**字面量类名示例**
> （`translate-x-[calc(var(--switch-<size>-width)_-_var(--switch-<size>-height))]`）
> 会被解析成候选类 → 触发优化器告警 `Unexpected token Delim('<')`。
> 该告警在 git HEAD 即已存在（属**存量问题**），v2.0.1 起通过
> `@source not '../../**/*.md'` 消除（`not` 的路径同样相对入口，故需上跳两级）。

> 📌 **推论**：stories 里用的类名会进最终产物。这不是 bug（Storybook 需要样式一致），但**必须**知道 —— stories 里写错的类名同样不会报错。

### 1.5 交付物

| 产物                   | 来源                                  | 消费方用法                                       |
| ---------------------- | ------------------------------------- | ------------------------------------------------ |
| `dist/styles.css`      | `src/theme/styles.css` 编译           | `import '@easbot/ui/styles.css'`                 |
| `dist/theme-light.css` | `src/theme/themes/light.css` 原样复制 | `import '@easbot/ui/theme-light.css'`（可选）    |
| `dist/theme-dark.css`  | `src/theme/themes/dark.css` 原样复制  | `import '@easbot/ui/theme-dark.css'`（可选）     |
| `dist/fonts.css`       | `scripts/build-fonts.ts` 生成         | `import '@easbot/ui/fonts.css'`（**opt-in**）    |
| `dist/iconfont.css`    | `scripts/build-icons.ts` 生成         | `import '@easbot/ui/iconfont.css'`（**opt-in**） |

> 📌 **`dist/` 内不含任何字体二进制** —— 字体资源**保留在仓库的 `public/` 目录**，
> **不进 npm 包**（见 §1.7 / §1.8）。产物的 `@font-face` 按约定路径
> `/font/xxx` / `/icon/xxx` 引用它们 —— **与消费方的 `public/` 目录同名同结构**。
>
> 📌 主题文件由 `tsup.config.ts` 的 `onSuccess` 钩子复制到 `dist/`。
> **复制源路径必须同步改为 `src/theme/themes/`**（见 §M 维度 ⑫）。
> 两者**已内联在 `styles.css`**（`@import`）—— 单独产出是为了让消费方能
> **只覆盖主题变量**而保留自己的原子类。
>
> 📌 **字体产物由独立脚本 `scripts/build-fonts.ts` 负责**（`pnpm build:fonts`）——
> 字体是「CSS + 静态资源引用」两类产物，与纯 CSS 复制分开更清晰，也可单独重跑。
> 📌 **图标字体产物由独立脚本 `scripts/build-icons.ts` 负责**（`pnpm build:icons`）——
> 理由同上（CSS + 静态资源引用，且 CSS 需**重写路径**，见 §1.9）。
> `pnpm build` 的串联顺序：
> `tsup && pnpm build:css && pnpm build:fonts && pnpm build:icons`。

### 1.6 两条编译路径（**必须都启用 Tailwind 编译器**）

同样的 `src/theme/styles.css`，有两条编译路径：

| 路径                  | 编译器                   | 入口                                | 产物                        |
| --------------------- | ------------------------ | ----------------------------------- | --------------------------- |
| **构建（消费方）**    | `tailwindcss` CLI        | `pnpm build:css`                    | `dist/styles.css`           |
| **开发（Storybook）** | `@tailwindcss/vite` 插件 | `.storybook/main.ts` 的 `viteFinal` | Vite 内存产物（dev server） |

> ⛔ **两条路径必须产出等价的原子类** —— 否则「Storybook 里好看、消费方线上崩」。
> 实测踩过：**Storybook 侧漏注册 `@tailwindcss/vite` 插件**，导致 Vite 把 `styles.css`
> 当**普通 CSS** 处理，`@import 'tailwindcss'` 展开成 `node_modules/tailwindcss/index.css` 原文，
> 其末尾的 `@layer utilities { @tailwind utilities; }` 是 **Tailwind 编译期指令**，
> Vite 不认识 → **原样保留（inert）** → **零个原子类被生成** →
> Storybook 里所有组件「没有边框、没有圆角、样式全丢」。
>
> **判别特征**（见到即查这条）：
>
> | 现象                                              | 说明                                    |
> | ------------------------------------------------- | --------------------------------------- |
> | 产物里出现 `@tailwind utilities;` **字面量**      | Tailwind 编译器**没接管**该文件（致命） |
> | 产物里 `.border` / `.rounded-md` 等**类规则为 0** | 原子类**根本没生成**                    |
> | 页面只剩浏览器默认样式                            | 上述两条的**外在表现**                  |
>
> **修正**：在 `.storybook/main.ts` 的 `viteFinal` 里注册插件
> （真值源：[`.storybook/main.ts`](../.storybook/main.ts)）
>
> ```ts
> import tailwindcss from '@tailwindcss/vite';
> // ...
> viteFinal: async (viteConfig) => {
>   viteConfig.plugins = viteConfig.plugins ?? [];
>   viteConfig.plugins.push(tailwindcss());
>   // ...
> },
> ```
>
> ⚠️ **本仓库没有 `vite.config.ts`** —— 靠 Storybook 的 `viteFinal` 注入。
> 若将来新增根 `vite.config.ts`，**必须**在其中也注册该插件，否则会退回「样式全丢」的状态。
>
> ⚠️ **`.storybook/preview.tsx` 的样式 import 路径必须同步** ——
> 入口移到 `src/theme/styles.css` 后，preview 里要写 `'../src/theme/styles.css'`。

### 1.7 字体资源（`public/font/`）—— **opt-in 交付**

字体**独立于主 CSS 交付**，消费方**按需启用**。

#### 目录职责（**CSS 与二进制分离**）

| 类别           | 位置                       | 理由                                        |
| -------------- | -------------------------- | ------------------------------------------- |
| **字体二进制** | `public/font/*.otf`        | 静态资源 —— 要能被浏览器按 **URL** 直接请求 |
| **CSS 声明源** | `src/theme/fonts/fonts.ts` | 源码 —— 要参与构建（产出 `dist/fonts.css`） |

> 📌 **`public/` 与消费方的静态资源目录同名同结构** ——
> 消费方把 `public/font/` 原样拷过去，产物的 `@font-face` 按 `/font/xxx`
> 引用即**自动对应**，**无需任何额外配置**（Vite / Next.js 约定 `public/` 映射到站点根路径）。
>
> ⚠️ **`public/` 不进 npm 包**（`package.json#files` 只含 `dist` 等）——
> 字体二进制**仅供维护者本地构建与自测**，不随包发布。

#### 交付物

| 产物             | 来源                          | 消费方用法                      |
| ---------------- | ----------------------------- | ------------------------------- |
| `dist/fonts.css` | `scripts/build-fonts.ts` 生成 | `import '@easbot/ui/fonts.css'` |

> ⚠️ **字体文件不随 npm 包发布** —— 产物只有 CSS（**不含** `@font-face` 指向的二进制）。
> 字体资源保留在仓库的 `public/font/`，由**应用层**自行放置到其 `public/font/`
> （见下方「消费方用法」）。

#### 消费方用法

**第 1 步**：把字体文件放到应用的 **`public/font/`** 目录
（Vite / Next.js 等约定 `public/` 部署到站点根路径）：

```
public/
└── font/
    ├── SourceHanSansCN-ExtraLight.otf   # 250
    ├── SourceHanSansCN-Light.otf        # 300
    ├── SourceHanSansCN-Normal.otf       # 350
    ├── SourceHanSansCN-Regular.otf      # 400
    ├── SourceHanSansCN-Medium.otf       # 500
    ├── SourceHanSansCN-Bold.otf         # 700
    ├── SourceHanSansCN-Heavy.otf        # 900
    └── LICENSE.txt                       # SIL OFL 1.1 授权声明（必须保留）
```

**第 2 步**：引入 CSS（三选一）

```ts
// A. Next.js next/font/local —— variable 写 --font-source-han-sans
import { sourceHanSans } from './fonts'; // 见下方「next/font/local 注意」
import '@easbot/ui/fonts.css'; // ← 提供 @font-face 与兜底栈

// B. 直接用本库的 @font-face（字体放到 public/font/ 即自动对应）
import '@easbot/ui/fonts.css';

// C. 完全自定义 —— 覆盖 --font-sans 或 --font-source-han-sans
```

**引入后**：`--font-source-han-sans` 被定义 → `--font-sans` 自动切到思源黑体。
**不引入**：变量未定义 → `--font-sans` 走**兜底栈**（系统字体）→ **不报错、不白屏**。

#### ⛔ 关键约束：`var()` 必须带兜底值

```css
/* ❌ 断链 —— 变量缺失时整条声明失效（IACVT），连 system-ui 都拿不到 */
--font-sans: var(--font-source-han-sans), system-ui, -apple-system, …;

/* ✅ 兜底值形式 —— 变量不存在时用回退栈 */
--font-sans: var(--font-source-han-sans, system-ui, -apple-system, …);
```

> 📌 **CSS 规范**：无兜底值的 `var()` 在变量缺失时会让**整条声明失效**
> （属性变 `unset`），而非「跳过这一项继续用后面的值」。
> 两种写法的产物差异**肉眼不可见**（都是 sans-serif），
> 但**有兜底值**才能保证「未引入 fonts.css」时拿到完整系统字体栈。
> 本库 `styles.css`（`@layer base`）与 `themes/variables.css`（`@theme`）**两处**都必须是兜底值形式。

#### 字重取值来自字体自身（`OS/2.usWeightClass`）

| 文件                             | usWeightClass | CSS `font-weight` |
| -------------------------------- | ------------- | ----------------- |
| `SourceHanSansCN-ExtraLight.otf` | 250           | 200               |
| `SourceHanSansCN-Light.otf`      | 300           | 300               |
| `SourceHanSansCN-Normal.otf`     | 350           | 400               |
| `SourceHanSansCN-Regular.otf`    | 400           | 450               |
| `SourceHanSansCN-Medium.otf`     | 500           | 500               |
| `SourceHanSansCN-Bold.otf`       | 700           | 700               |
| `SourceHanSansCN-Heavy.otf`      | 900           | 900               |

> ⚠️ **不套用 CSS 关键字近似值** —— 家族名与字重必须一一对应，
> 否则浏览器做「合成加粗」（faux bold），字形发虚。
>
> 📌 **字重范围由应用层决定** —— 字体文件**不在 npm 包内**，
> 消费方可按需只放 1~2 个常用字重（每个 OTF 约 8 MB，
> `font-display: swap` 下**每个字重都是独立下载**），多余的字重会拖慢首屏。
>
> 📌 **需要更多字重** → 消费方自行放入 `public/font/`
> 并声明 `@font-face`，再覆盖 `--font-source-han-sans` 接入。

#### 为什么用标准 `@font-face` 而非 `next/font/local`

本库同时支持 Next.js 与纯 React 应用，字体**不能绑定框架专属 API**。
标准 `@font-face` + CSS 变量在两边都能工作。

> 📌 **与 `easbot-doc` 的关系** —— 应用层若已有自己的字体方案
> （如 `easbot-doc/src/styles/fonts.css` 声明 `@font-face` + 覆盖 `--font-source-han-sans`），
> **无需**引入 `@easbot/ui/fonts.css` —— 直接覆盖同名变量即可接管。
> 两种方式**互斥**，不要同时引入（会重复声明 `@font-face`）。

### 1.8 图标字体资源（`public/icon/` + `src/theme/styles/iconfont/`）—— **opt-in 交付**

图标字体**独立于主 CSS 交付**，消费方**按需启用**。
`Icon` 组件的 `type="class"` 模式依赖它提供字形；`name` / `url` 模式**不受影响**。

#### 目录职责（**CSS 与二进制分离**）

| 类别                           | 位置                                     | 理由                                           |
| ------------------------------ | ---------------------------------------- | ---------------------------------------------- |
| **字体二进制**                 | `public/icon/*.woff` `*.ttf`             | 静态资源 —— 要能被浏览器按 **URL** 直接请求    |
| **CSS 声明源**（content 映射） | `src/theme/styles/iconfont/iconfont.css` | 源码 —— 要参与构建（产出 `dist/iconfont.css`） |
| **声明清单 / 生成函数**        | `src/theme/styles/iconfont/icons.ts`     | 源码 —— 字体清单的唯一真值源                   |

> 📌 **同 §1.7** —— `public/` 与消费方的静态资源目录同名同结构，
> 产物按 `/icon/xxx` 引用即**自动对应**；`public/` **不进 npm 包**。

#### 交付物

| 产物                | 来源                          | 消费方用法                         |
| ------------------- | ----------------------------- | ---------------------------------- |
| `dist/iconfont.css` | `scripts/build-icons.ts` 生成 | `import '@easbot/ui/iconfont.css'` |

> ⚠️ **字体二进制不随 npm 包发布** —— 产物只有 CSS。
> 消费方需把 `public/icon/` 原样拷到其 `public/icon/`。

#### 消费方用法

**第 1 步**：放置字体文件到应用的 **`public/icon/`**：

```
public/
└── icon/
    ├── iconfont.woff      # 主格式（覆盖 IE11+ 全部现代浏览器）
    ├── iconfont.ttf       # 兜底格式（老 Safari）
    ├── symbol.ttf         # officefont 的 Symbol 家族
    └── wingding.ttf       # officefont 的 Wingdings 家族
```

**第 2 步**：引入 CSS（**一行**）

```ts
import '@easbot/ui/styles.css';
import '@easbot/ui/iconfont.css'; // ← 启用图标字体
```

```tsx
<Icon type="class" clazzName="iconfont icon-search" size={24} />
```

**引入后**：`.iconfont` 类声明 `font-family: iconfont` → 796 个 `.icon-xxx:before` 提供字形。
**不引入**：`class` 模式**渲染为空白**（`name` / `url` 模式正常）。

> 📌 **类名清单可从包内取** —— `import { iconfontClassNames } from '@easbot/ui'`
> 导出全部 **796** 个类名（`src/ui/icon/font/iconfont-classnames.ts`），
> 供消费方做「图标选择器」等 UI。

#### ⛔ 关键约束：CSS 必须**重写路径**，不能直接复制

源文件 `src/theme/styles/iconfont/iconfont.css` 的字体路径是**相对自身**的：

```css
/* ❌ 源文件写法 —— 直接复制到 dist/ 会断链 */
src: url(iconfont.eot);
```

产物里 CSS 在 `dist/iconfont.css`、字体在**消费方的 `/icon/`** → 路径不一致 → 404。

故 `scripts/build-icons.ts` **重新生成** CSS（不复制），把路径改为 `/icon/xxx`：

```css
/* ✅ 产物写法 —— 与消费方 public/icon/ 自动对应 */
src:
  url('/icon/iconfont.woff') format('woff'),
  url('/icon/iconfont.ttf') format('truetype');
```

> 📌 **同款坑**：`officefont.css` 的 `url(font/symbol.ttf)` →
> 产物为 `url('/icon/symbol.ttf')`。

#### 只保留 `woff` + `ttf` 两个格式

| 格式   | 体积   | 保留理由                                         |
| ------ | ------ | ------------------------------------------------ |
| `woff` | 113 KB | **主格式** —— 覆盖 IE11+ 全部现代浏览器          |
| `ttf`  | 192 KB | **兜底** —— 老 Safari 不支持 woff                |
| `eot`  | 174 KB | 仅 IE8- 需要，现代浏览器**完全不用** → 已删除    |
| `svg`  | 694 KB | SVG 字体已被 WOFF2 取代，**且体积最大** → 已删除 |

删除 `eot` + `svg` 共省 **868 KB**，不损失任何现代浏览器支持。

#### 声明源在 `icons.ts`（唯一真值源）

`src/theme/styles/iconfont/icons.ts` 导出**字体清单**与**CSS 生成函数**，
`scripts/build-icons.ts` 只负责「读源文件 → 解析 content 映射 → 生成 CSS → 校验字体存在」。

> 📌 **content 映射从源 CSS 解析**，不是硬编码在脚本里 ——
> 保证「源文件加一个图标类 → 产物自动带上」，**零手工同步**。
> 实测：源 796 个类 → 产物 796 个类，**逐类 content 比对全部一致**（零丢失）。
>
> 📌 **字体二进制只校验、不复制** —— 字体**不进 npm 包**（§1.8），
> 脚本在构建时校验 `public/icon/` 下的文件**存在**，缺失即**早失败**
> （避免产出指向不存在文件的坏路径）。

#### Storybook 必须显式引入

`.storybook/preview.tsx` 需额外引源文件（**不走** `styles.css`）：

```ts
import '../src/theme/styles.css';
import '../src/theme/styles/iconfont/iconfont.css';
import '../src/theme/styles/iconfont/officefont.css';
```

> ⚠️ **漏引的后果很隐蔽** —— Storybook 能正常启动、所有组件正常渲染，
> 只有 `iconfont` / `officefont` 两个 story 的图标**是空白**，
> 极易被误判为「字体没生成」而查错方向。
>
> 📌 **字体文件由 `staticDirs` 映射的 `public/` 提供** —— 详见
> `.storybook/main.ts` 的 `staticDirs` 配置（映射到 `/font` 与 `/icon`）。

### 1.9 ⚠️ 死代码 / 残缺资产（v2.0.0 清理后）

| 路径                                                                   | 状态                                                                                                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/theme/styles/globals.css`                                         | ✅ **已删除** —— `@plugin '@tailwindcss/typography'`（插件未安装）+ `@import` 指向不存在的 `../../../../repository/`                                   |
| `src/theme/styles/tailwind.css`                                        | ✅ **已删除** —— 历史遗留，内容与入口重复                                                                                                              |
| `src/theme/styles/table.css`                                           | ✅ **已删除** —— 与 `src/ui/table/style/table.css` **完全同源**（均 36727 字节 / 59 处 `!important`）；组件侧那份**已由入口 import**，无副本必要       |
| `src/ui/table/plugins/row/static-form.css`                             | ✅ **已删除** —— 内容是 `src/ui/table/style/table.css` 第 1217+ 段的**冗余副本**（组件用的 `eas-static-form*` 类名由 table.css 提供）                  |
| `src/theme/themes/safelist.js` / `safelist.json`                       | ✅ **已删除** —— 各 1.46 MB 的 Tailwind v3 时代 safelist；**无任何代码引用**，v4 已由 `@source inline(...)` 取代                                       |
| `src/theme/fonts/msyh/`（3 个 `.ttc`）                                 | ✅ **已删除**（46 MB）—— 全库**无任何引用**（源码 / 文档 / 产物均无），纯死资源                                                                        |
| `src/theme/fonts/SourceHanSansCN/`（整个目录，7 个 OTF / 60 MB）       | ✅ **已删除**（v2.1.1）—— 字体二进制**统一迁到 `public/font/`**（§1.7），`src/` 下**只留 CSS 声明源**（`fonts.ts`）—— **CSS 是源码，二进制是静态资源** |
| `src/theme/styles/iconfont/font/`（4 个字体文件）                      | ✅ **已删除**（v2.1.1）—— 同上，字体二进制**统一迁到 `public/icon/`**（§1.8）                                                                          |
| `src/theme/styles/iconfont/iconfont.eot`                               | ✅ **已删除**（174 KB）—— 仅 IE8- 需要，现代浏览器**完全不用**；产物只保留 woff + ttf（§1.8）                                                          |
| `src/theme/styles/iconfont/iconfont.svg`                               | ✅ **已删除**（694 KB）—— SVG 字体已被 WOFF2 取代，且**体积最大**（§1.8）                                                                              |
| `src/theme/themes/{high-contrast,soft,deep-ocean,forest,eye-care}.css` | ⚠️ **仍在**，已移入 `themes/variants/` —— 不被入口 import，**不进产物**                                                                                |
| `src/theme/index.ts` vs `src/theme/themes/index.ts`                    | ⚠️ **仍在** —— 前者导出 `Theme`（2 值，公开 API），后者导出 `ResourceTheme`（7 值，资源层），已重命名区分                                              |

> 📌 **清理原则** —— 删除前**必须**确认「① 无引用 ② ② 有同源副本保留 ③ 不进构建路径」。
> 本轮的四次删除均满足：`globals.css` / `tailwind.css` / `safelist.{js,json}` 无引用且无副本；
> `styles/table.css` 与 `src/ui/table/style/table.css` **字节级同源**（保留组件侧那份）。
>
> 📌 **`src/ui/table/style/table.css` 的 59 处 `!important` 属存量** ——
> 该文件**不被任何入口引用**（表格样式走 Tailwind 原子类），
> 保留在组件目录备查，**不纳入**维度 ⑧ 的扫描范围（`src/**/*.css` 命中但已在豁免清单）。

---

## 2. 主题机制

### 2.1 双文件 + `data-theme` 选择器

```css
/* src/theme/themes/light.css:1 */
:root[data-theme='light'] { --background: hsl(0 0% 100%); ... }

/* src/theme/themes/dark.css:1 */
:root[data-theme='dark'] { --background: hsl(240 10% 4%); ... }
```

**切换方式**：`<html data-theme="light|dark">`。

> 📌 **由消费方控制** —— 组件库不注入任何主题脚本，只提供两套变量与选择器约定。
> Storybook 的切换机制见 [`storybook-standard.md`](./storybook-standard.md) §4。

### 2.2 变量集合必须完全一致

**硬性要求**：`themes/light.css` 与 `themes/dark.css` 的变量名集合**必须一一对应**。

- 两文件当前各 **702** 个变量，集合差异 **0**
- ⚠️ **漏定义的后果**：某变量只在 light 里有 → dark 模式下该属性**失效**（浏览器解析为无效值），且**无任何报错**

### 2.3 变量命名规则

| 类别             | 规则                                                                             | 示例                                                                 |
| ---------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **全局语义变量** | 裸名，无前缀                                                                     | `--background` / `--foreground` / `--primary` / `--muted-foreground` |
| **灰阶分量**     | `--gray-<50..900>`，存**裸 HSL 分量**                                            | `--gray-500: 240 4% 50%;`                                            |
| **圆角**         | `--radius-<sm\|md\|lg\|full>` + `--radius`                                       | `--radius-sm: 0.375rem;`                                             |
| **组件私有变量** | `<component>-<role>` 前缀                                                        | `--button-default-hover` / `--dialog-content-bg`                     |
| **状态派生**     | `-hover` / `-active` / `-disabled` / `-focus` / `-foreground` / `-readonly` 后缀 | `--input-border-focus-color`                                         |
| **设计 token**   | `--eas-*` 前缀（尺寸 / 间距 / z-index / 表格）                                   | `--eas-size-md` / `--eas-gap-sm` / `--eas-z-index-dialog`            |

**组件私有变量前缀对照**（真值源 = `themes/light.css`）：

| 组件        | 前缀               | 组件       | 前缀             |
| ----------- | ------------------ | ---------- | ---------------- |
| Button      | `--button-*`       | Form       | `--form-input-*` |
| Card        | `--card-*`         | Command    | `--command-*`    |
| Dialog      | `--dialog-*`       | Toast      | `--toast-*`      |
| Select      | `--select-*`       | Spinner    | `--spinner-*`    |
| AlertDialog | `--alert-dialog-*` | ScrollArea | `--scroll-bar-*` |
| Badge       | `--badge-*`        | Menubar    | `--menubar-*`    |
| HoverCard   | `--hover-card-*`   | Popover    | `--popover-*`    |

> 📌 **`--eas-*` token 的定义位置** —— `src/theme/themes/variables.css` 的 `@theme` 块
> （`--eas-size-*` / `--eas-gap-*` / `--eas-z-index-*` / `--eas-table-*`）。
> 它**不是**主题变量（两套主题共用同一份），因此**不进** light/dark 双文件的变量集合。

### 2.4 灰阶变量的特殊性

主题文件里 `--gray-*` 存的是**裸 HSL 分量**（供 `hsl(var(--gray-500))` 组合用）：

```css
/* src/theme/themes/light.css */
--gray-500: 240 4% 50%;
```

⚠️ **因此**：

- 组件里**不能**写 `color: var(--gray-500)` —— 那是非法 CSS
- `@theme` 注册时**必须**包一层 `hsl()`
- 组件里**优先**用 `border-gray-500`（语义类）而不是 `border-[var(--gray-500)]`

---

## 3. Tailwind v4 关键机制（本库踩过的四个坑）

> ⛔ **以下四条是本规范最重要的部分** —— 它们都导致**样式静默失效**（无报错、无警告）。

### 3.1 ⛔ 坑一：主题变量必须注册为 `@theme` token

**问题**：Tailwind v4 **不认识**自定义 CSS 变量。主题文件里的 `--primary` 对 Tailwind 而言是**未知名字**，
因此 `bg-primary` / `text-destructive` / `border-success` 这类**语义类根本不会生成 CSS 规则**。

**实测（2026-10-31）**：修复前 33 个语义基类中 **32 个未生成任何 CSS**。

**修正**（[`src/theme/styles.css`](../src/theme/styles.css) 的 `@theme inline` 块）：

```css
@theme inline {
  /* 语义色：主题文件里已是完整颜色值，可直接 var() 引用 */
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-destructive: var(--destructive);
  /* ... */

  /* 灰阶：主题文件里是裸 HSL 分量，必须用 hsl() 包裹 */
  --color-gray-500: hsl(var(--gray-500));
}
```

**规则**：

| #   | 规则                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | **必须**用 `@theme inline`（不是 `@theme`）—— `inline` 让值**内联**为 `var(--primary)`，从而**跟随主题运行时切换** |
| 2   | 语义色**必须**写 `--color-<name>: var(--<name>);`                                                                  |
| 3   | 灰阶**必须**写 `--color-gray-<n>: hsl(var(--gray-<n>));`                                                           |
| 4   | ❌ **禁止**注册 `--radius-*: var(--radius-*)` —— 会产生**自引用**，Tailwind 内置的 `--radius-sm` 已可用            |

**验证**：`@theme inline` 产出的规则形如 `.bg-primary{background-color:var(--primary)}` —— 值是 `var()` 而非字面量，
→ 因此 `<html data-theme="dark">` 切换时**无需重新构建**。

### 3.2 ⛔ 坑二：`dark:` 变体必须对齐 `data-theme`

**问题**：Tailwind 默认的 `dark:` 变体走 `@media (prefers-color-scheme: dark)`（**跟随操作系统**）。
而本库的主题机制是**显式**的 `<html data-theme="dark">`。两者冲突：

- 用户设置 `data-theme="light"`（浅色）→ 系统是深色 → `dark:` 样式**依然生效** → **主题错乱**
- 实测：修复前产物中 `prefers-color-scheme` 出现 1 次，`data-theme` 出现 **0** 次

**修正**：

```css
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
```

**修正后实测**：`prefers-color-scheme` **归零**，`data-theme` 出现 **203** 次。

### 3.3 ⛔ 坑三：组件引用的变量必须在主题文件中定义

**问题**：组件里写 `var(--card-hover-shadow)`，但主题文件没这个变量 → 属性**失效**，**无报错**。

**实测发现 3 处**（已修）：

| 变量                      | 使用位置                   | 后果           |
| ------------------------- | -------------------------- | -------------- |
| `--card-hover-shadow`     | `src/ui/card/card.tsx:24`  | 悬停阴影不生效 |
| `--card-disabled-opacity` | `src/ui/card/card.tsx:190` | 禁用态无透明度 |
| `--card-ripple-color`     | `src/ui/card/card.tsx:210` | 波纹色无色值   |

**修正**（light / dark **两处**都加）：

```css
/* src/theme/themes/light.css */
--card-hover-shadow: 0 4px 12px hsl(var(--gray-900) / 12%);
--card-disabled-opacity: 0.5;
--card-ripple-color: var(--foreground);

/* src/theme/themes/dark.css */
--card-hover-shadow: 0 4px 12px hsl(0 0% 0% / 40%);
--card-disabled-opacity: 0.5;
--card-ripple-color: var(--foreground);
```

> ⚠️ **同时修正了取值格式**：`src/ui/card/card.tsx:210` 原本写 `rgb(var(--card-ripple-color))`，
> 而变量值是**完整颜色** → `rgb(240 4% 50%)` 是**非法 CSS**。已改为 `var(--card-ripple-color)`。

### 3.4 Radix 运行时注入的变量

**合法例外**：`--radix-*` 前缀的变量**由 Radix 在运行时注入**（inline style），**不需要**在主题文件里定义。

已确认的 3 个（真值源 = `node_modules/@radix-ui/*/dist/index.mjs`）：

| 变量                                      | 注入方                            |
| ----------------------------------------- | --------------------------------- |
| `--radix-popover-trigger-width`           | `@radix-ui/react-popover`         |
| `--radix-navigation-menu-viewport-width`  | `@radix-ui/react-navigation-menu` |
| `--radix-navigation-menu-viewport-height` | `@radix-ui/react-navigation-menu` |

> 📌 **扫描维度 ⑥ 的排除规则**：`--radix-*` **不算**「未定义的变量」。

### 3.5 ⛔ 坑四：层叠层（`@layer`）顺序与优先级

Tailwind v4 把所有产物放进 **4 个级联层**，层间优先级由**首次声明顺序**决定：

```
theme  <  base  <  components  <  utilities
（低）                                    （高）
```

| 层           | 内容                                               | 谁写的                               |
| ------------ | -------------------------------------------------- | ------------------------------------ |
| `theme`      | `:root` 上的 CSS 变量（`--color-*` 等）            | Tailwind 内置 + 本库 `@theme inline` |
| `base`       | **preflight**（`border:0 solid` 等重置）+ 本库兜底 | Tailwind 内置 + 本库 `@layer base`   |
| `components` | 组件级样式（本库**未使用**）                       | —                                    |
| `utilities`  | **原子类**（`.border` / `.rounded-md` …）          | Tailwind 编译产出                    |

**关键规则**：

| #   | 规则                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **原子类永远在 `utilities` 层** → 优先级**高于** `base` 层的 preflight                                                                                      |
| 2   | preflight 的 `border:0 solid`（`base`）**不会**覆盖 `.border`（`utilities`）的 `border-width:1px`                                                           |
| 3   | **同名层会合并**，不是覆盖 —— 本库在 `src/theme/styles.css` 里再写 `@layer base` / `@layer utilities`，**不会**改变层间优先级                               |
| 4   | **同层内按源码顺序** —— 本库自定义的 `@layer utilities`（滚动条样式）在 Tailwind 原子类**之后**，因此**优先级更高**（符合预期：自定义工具类应能覆盖原子类） |
| 5   | 本库 `@layer base` 里的 `* { border-color: var(--border) }` **只设 `border-color`**，**不设** `border-width` / `border-style` → 永远不会把边框「归零」      |

> 📌 **推论（自检维度 ⑪）**：若发现组件「边框消失 / 圆角消失 / 样式全丢」，
> **先查层叠层，再查类名**：
>
> | 检查项                                                             | 期望                                            |
> | ------------------------------------------------------------------ | ----------------------------------------------- |
> | 产物里有 `@tailwind utilities;` **字面量**                         | **不应存在** → Tailwind 编译器没接管（见 §1.6） |
> | 产物里 `.border` / `.rounded-md` 等类规则**数量为 0**              | **不应为 0** → 原子类没生成                     |
> | `border-width` 计算值是 `0px` 但类名里有 `border`                  | 检查是否有更高优先级的规则设了 `border-width:0` |
> | `border-color` 计算值是 `rgb(228,228,231)`（正常）但**看不到边框** | 是 `border-width` 问题，**不是**颜色问题        |

---

## 4. 样式写法规则

### 4.1 CSS 变量 vs Tailwind 任意值

| 场景                                | 写法                                                          | 真值源                                 |
| ----------------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| **组件私有变量**（组件专用）        | `bg-[var(--button-default)]`                                  | `src/ui/button/button.tsx:37`          |
| **全局语义变量**（跨组件）          | `bg-[var(--background)]`                                      | `src/ui/button/button.tsx:44`          |
| **Tailwind 语义类**（已注册 token） | `bg-primary`                                                  | `src/ui/checkbox/checkbox.tsx:17`      |
| **内联 style（动态值）**            | `style={{ backgroundColor: 'var(--command-loading-bg)' }}`    | `src/ui/command/command.tsx:51`        |
| **运行时读取变量**                  | `getComputedStyle(...).getPropertyValue('--toast-max-width')` | `src/ui/use-toast/use-toast.tsx:11-19` |

**选型规则**：

| #   | 规则                                                                     |
| --- | ------------------------------------------------------------------------ |
| 1   | **优先**用 Tailwind 语义类（`bg-primary`）—— 短、可被 `twMerge` 正确合并 |
| 2   | 组件私有样式**必须**用 `var(--<component>-<role>)` 形式                  |
| 3   | 主题变量**必须**经 `@theme inline` 注册后才可用作语义类                  |
| 4   | ❌ **禁止**硬编码颜色字面量（`#fff` / `hsl(0 0% 100%)` / `rgb(0,0,0)`）  |
| 5   | ❌ **禁止** `!important`                                                 |

### 4.2 动态值才允许内联 style

内联 `style` **仅**允许用于**运行时才能确定**的值：

| 允许                                     | 禁止                   |
| ---------------------------------------- | ---------------------- |
| 波纹坐标（`left` / `top` / `transform`） | 静态颜色 / 间距 / 字号 |
| 动画时长（`animationDuration`）          | 静态布局               |
| 压力感应缩放（`transform: scale(...)`）  | 静态背景               |

**真值源**：`src/ui/button/button.tsx:418-423`（波纹）、`src/ui/card/card.tsx:206-211`（波纹）、`src/ui/button/button.tsx:266-272`（压力缩放）。

### 4.3 类名合并

**必须**用 `cn()`（`src/utils/classnames.ts`）：

```tsx
// ✅ 正例（src/ui/button/button.tsx:378）
cn(buttonVariants({ variant, size: finalSize, className }), 'relative overflow-hidden');
```

> 📌 **详细规则见 [`component-standard.md`](./component-standard.md) §3.6** —— 本规范不重复。

### 4.4 `data-*` 状态变体

Radix 组件的状态通过 `data-*` 属性暴露，样式**必须**用 Tailwind 的 `data-[...]` 变体消费：

```tsx
// ✅ 正例（src/ui/dialog/dialog.tsx:14）
'fixed inset-0 z-50 bg-[...] data-[state=open]:animate-in data-[state=closed]:animate-out ...';

// ✅ 正例（src/ui/checkbox/checkbox.tsx:17）
'data-[state=checked]:border-primary data-[state=checked]:bg-primary';
```

**常见状态属性**：

| 属性            | 组件                                 | 真值源                                          |
| --------------- | ------------------------------------ | ----------------------------------------------- |
| `data-state`    | dialog / checkbox / switch / tabs 等 | `src/ui/dialog/dialog.tsx:14`                   |
| `data-disabled` | command item                         | `src/ui/command/command.tsx:152`                |
| `data-side`     | popover / dropdown-menu（弹出方向）  | `src/ui/menubar/menubar.tsx:75`                 |
| `data-active`   | navigation-menu                      | `src/ui/navigation-menu/navigation-menu.tsx:85` |

### 4.5 动画类

`animate-in` / `fade-in-*` / `zoom-in-*` / `slide-in-from-*` 等 v3 插件类**由 `tw-animate-css` 提供**（v4 兼容）。

自定义动画**必须**用 `@utility` 声明（[`src/theme/styles.css`](../src/theme/styles.css)）：

```css
@utility animate-ripple {
  animation: ripple 0.6s ease-out;
}
```

> ⚠️ **禁止**使用 `tailwindcss-animate`（v3 插件，v4 下不提供这些类）。

### 4.6 深浅色对比类

实现文件中 `dark:` 前缀**必须**指向 `data-theme`（§3.2），**禁止**依赖系统偏好。

```tsx
// ✅ 正例（src/ui/checkbox/checkbox.tsx:21）
default: 'border-gray-400 hover:border-gray-600 hover:bg-accent/20 active:bg-accent/30 dark:border-gray-500 dark:hover:border-gray-300',
```

---

## M. 12 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**。

### 维度 ① 语义 token 必须注册

**扫描命令**：

```bash
# 检查 @theme inline 是否注册了关键语义 token（缺一项 = 违规）
$required = @('primary','primary-foreground','secondary','destructive','success','warning','info','popover','accent','muted','muted-foreground','background','foreground','border','input','ring')
$theme = Get-Content src/theme/styles.css -Raw
$missing = $required | Where-Object { $theme -notmatch ('--color-{0}:' -f $_) }
if ($missing) { "MISSING token: $($missing -join ', ')" } else { "OK" }
```

> ⚠️ **PowerShell 插值注意**：`$_` 后面紧跟 `:` 会被解析成「驱动器限定符」而报语法错误
> （`"--color-$_:"` ❌）—— 必须写成 `'--color-{0}:' -f $_` ✅ 或 `"--color-$($_):"`。

**判定规则**：

- ❌ 违规：任一语义 token 未在 `@theme inline` 注册
- ✅ 合规：输出 `OK`

**修正模式**：

```css
/* ❌ 违规 —— 组件用了 bg-primary，但没注册 token → 语义类静默失效 */
@theme inline {
  --color-primary: var(--primary);
}

/* ✅ 修正 —— 补齐全部语义 token */
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... */
}
```

### 维度 ② 灰阶 token 必须 `hsl()` 包裹

**扫描命令**：

```bash
# 列出未用 hsl() 包裹的灰阶 token（空 = 合规）
rg -n -- "--color-gray-\d+:\s*var\(" src/theme/styles.css
```

**判定规则**：

- ❌ 违规：`--color-gray-N: var(--gray-N)` —— 生成非法颜色值
- ✅ 合规：0 命中

**修正模式**：

```css
/* ❌ 违规 */
--color-gray-500: var(--gray-500);

/* ✅ 修正 */
--color-gray-500: hsl(var(--gray-500));
```

### 维度 ③ 禁止 radius 自引用

**扫描命令**：

```bash
rg -n -- "--radius-[a-z]+:\s*var\(--radius-" src/theme/styles.css
```

**判定规则**：

- ❌ 违规：`--radius-sm: var(--radius-sm)` 之类自引用
- ✅ 合规：0 命中（Tailwind 内置 `--radius-*` 已可用，**不需**注册）

**修正模式**：

```css
/* ❌ 违规 */
--radius-sm: var(--radius-sm);

/* ✅ 修正 —— 删掉该行，Tailwind 内置的 --radius-sm 已可用 */
```

### 维度 ④ `dark:` 变体必须用 `@custom-variant`

**扫描命令**：

```bash
# 检查 dark 变体定义 + 检查产物里是否残留 prefers-color-scheme
rg -n "@custom-variant dark" src/theme/styles.css
pnpm build:css > $null 2>&1
$css = Get-Content dist/styles.css -Raw
if ($css -match 'prefers-color-scheme') { "VIOLATION: 产物含 prefers-color-scheme" } else { "OK" }
```

**判定规则**：

- ❌ 违规：缺 `@custom-variant dark`，**或**产物含 `prefers-color-scheme`
- ✅ 合规：两条命令均通过

**修正模式**：

```css
/* ❌ 违规 —— dark: 走系统偏好，与 data-theme 冲突 */
@import 'tailwindcss';

/* ✅ 修正 */
@import 'tailwindcss';
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
```

### 维度 ⑤ 主题双文件变量集合必须一致

**扫描命令**：

```bash
$l = (Select-String -Path src/theme/themes/light.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$d = (Select-String -Path src/theme/themes/dark.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
Write-Output "light=$($l.Count) dark=$($d.Count)"
Write-Output "only-light: $((Compare-Object $l $d | Where-Object {$_.SideIndicator -eq '<='}).InputObject -join ', ')"
Write-Output "only-dark:  $((Compare-Object $l $d | Where-Object {$_.SideIndicator -eq '=>'}).InputObject -join ', ')"
```

**判定规则**：

- ❌ 违规：`only-light` 或 `only-dark` 非空 → 某变量在另一主题下缺失
- ✅ 合规：两行均为空

**修正模式**：

```css
/* ❌ 违规 —— --card-hover-shadow 只在 light 定义，dark 模式下悬停阴影失效 */
/* src/theme/themes/light.css */
--card-hover-shadow: 0 4px 12px hsl(var(--gray-900) / 12%);

/* ✅ 修正 —— 两处都定义 */
```

### 维度 ⑥ 组件引用的变量必须已定义

**扫描命令**：

```bash
# 变量来源有三处：主题双文件（light/dark）+ @theme inline 注册的 --color-* token + variables.css 的 --eas-* token
$defined = @()
$defined += (Select-String -Path src/theme/themes/light.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$defined += (Select-String -Path src/theme/themes/dark.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$defined += (Select-String -Path src/theme/themes/variables.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$defined += (Select-String -Path src/theme/styles.css -Pattern '--color-([a-z0-9-]+):' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object { "--color-$($_.Value)" }

$used = rg -o "var\(--[a-z0-9-]+\)" -g "src/**/*.tsx" --no-filename | ForEach-Object { $_ -replace 'var\(','' -replace '\)','' } | Sort-Object -Unique
# 排除 Radix 运行时注入的变量 + Tailwind v4 内置调色板（--color-<色>-<档位>）
$missing = $used | Where-Object {
  $_ -notin $defined -and
  $_ -notlike '--radix-*' -and
  $_ -notmatch '^--color-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d+$'
}
if ($missing) { "MISSING: $($missing -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：变量既不在主题双文件 / `variables.css` / `@theme inline` 注册表，
  也不是 `--radix-*` 前缀
- ✅ 合规：输出 `OK`

> 📌 **变量来源有五处** —— 只查 `themes/light.css` 会**大量误报**：
>
> | 来源                            | 变量形态                   | 示例                                                      |
> | ------------------------------- | -------------------------- | --------------------------------------------------------- |
> | `themes/light.css` / `dark.css` | 全局语义 / 灰阶 / 组件私有 | `--background` / `--gray-500` / `--button-default`        |
> | `themes/variables.css`          | 设计 token（`@theme` 块）  | `--eas-size-md` / `--eas-gap-sm` / `--eas-z-index-dialog` |
> | `styles.css` 的 `@theme inline` | Tailwind 语义 token        | `--color-primary` / `--color-gray-500`                    |
> | Tailwind v4 **内置调色板**      | `--color-<色>-<档位>`      | `--color-blue-400` / `--color-red-50`                     |
> | Radix 运行时注入                | `--radix-*`                | `--radix-popover-trigger-width`                           |
>
> ⚠️ **`--color-*` 不都是主题变量** ——
> `--color-primary` / `--color-gray-500` 来自本库的 `@theme inline` 注册，
> 而 `--color-blue-400` / `--color-red-50` 是 **Tailwind v4 内置调色板**（自动可用）。
> 组件里写 `var(--color-blue-400)` 是**合法的**，不能按「主题文件里没定义」判违规。
>
> 📌 **实测踩过的坑** —— 迁移期发现 **10 个 `--sidebar-*` 变量被组件引用但从未定义**
> （`src/design-system/components/ui/sidebar.tsx`）→ 侧边栏配色**静默失效**。
> 已补进 light / dark 双文件，并注册 8 个 `--color-sidebar-*` token。
> **这类「引用了但没定义」的变量，正是本维度存在的意义。**

### 层级尺度（z-index）

层级 token 单点定义在 [`src/theme/themes/variables.css`](../src/theme/themes/variables.css)
（**两套主题共用**，故 light.css / dark.css 中**不得**重复定义）：

| 变量                           | 值       | 用途                                                                                                              |
| ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `--eas-z-index-base`           | 10       | 基础层级（固定列、粘性表头）                                                                                      |
| `--eas-z-index-dropdown`       | 200      | 下拉菜单                                                                                                          |
| `--eas-z-index-popover`        | 900      | Popover / Tooltip                                                                                                 |
| `--eas-z-index-context-menu`   | 950      | 右键菜单                                                                                                          |
| `--eas-z-index-modal`          | 1000     | Modal 弹窗                                                                                                        |
| `--eas-z-index-toast`          | 1200     | Toast 通知                                                                                                        |
| `--eas-z-index-dialog-overlay` | 1300     | Dialog 蒙板                                                                                                       |
| `--eas-z-index-dialog`         | 1400     | Dialog 内容                                                                                                       |
| **`--eas-z-index-popper`**     | **1450** | **Radix Popper 弹层**（Select / Combobox / Popover / DropdownMenu / ContextMenu / Menubar / HoverCard / Tooltip） |
| `--eas-z-index-max`            | 1500     | 预留最高层级                                                                                                      |

**不变量**（由 [`tests/theme-z-index.test.ts`](../../tests/theme-z-index.test.ts) 守护）：

1. `--eas-z-index-popper` **必须 > `--eas-z-index-dialog`** ——
   这些弹层常从 Dialog / Drawer / Sheet **内部**触发，
   层级低于 Dialog 内容会被面板压住（表现为「弹层被裁切 / 看不见」）。
2. popper wrapper 与 menu content 层**必须同层级** ——
   内容层若低于 wrapper，会被 wrapper 自身背景遮挡。
3. `prefix.css` 中**与 Radix 内联 `z-index` 竞争**的规则
   （`[data-radix-popper-content-wrapper]` / `[data-radix-menu-content]`）
   **必须带 `!important`** —— Radix 把 `z-index` 写在 **inline style** 上，
   选择器优先级再高也压不住。

> ⚠️ **裸 `important`（缺 `!`）是非法 CSS** —— 浏览器**静默丢弃整条声明**
> 且**不报任何错**。历史事故：`prefix.css` 的 popper 规则写成裸 `important`，
> 导致 wrapper 保留 Radix 内联的 `z-index: 50`，
> 低于宿主页面的高层级容器（Storybook `#storybook-root` 为 `z-index: 1300`）——
> 表现为「弹层透底，能看见下层文字」。
> **扫描时必须同时排查裸 `important`。**

**修正模式**：

```css
/* ❌ 违规 —— src/ui/card/card.tsx 引用了未定义的变量 */
--card-hover-shadow: 0 4px 12px hsl(var(--gray-900) / 12%);
--card-disabled-opacity: 0.5;
--card-ripple-color: var(--foreground);
```

### 维度 ⑦ 禁止硬编码颜色字面量

**扫描命令**：

```bash
# 排除注释行后，检查组件源码里的颜色字面量
rg -n "#[0-9a-fA-F]{3,8}\b|hsla?\(|rgba?\(" -g "src/**/*.tsx" -g "!*stories.tsx" | Where-Object { $_ -notmatch '^\s*\*' -and $_ -notmatch '//' }
```

**判定规则**：

- ❌ 违规：组件实现里出现颜色字面量
- ✅ 合规：0 命中

**例外**：`src/ui/badge/badge.stories.tsx` 里的 `'#ff00ff'` 是**演示自定义色值**（story 演示 `style` 透传能力），不违规。

**修正模式**：

```tsx
// ❌ 违规
<span className="bg-[#ff0000]" />

// ✅ 修正
<span className="bg-[var(--destructive)]" />
```

### 维度 ⑧ 禁止 `!important`

**扫描命令**：

```bash
# 只扫编译入口与组件实现 —— 排除组件目录内的历史样式文件
rg -n "!important" src/theme/styles.css src/theme/themes/ src/theme/styles/prefix.css -g "*.css"
rg -n "!important" -g "src/**/*.tsx" -g "!*stories.tsx"
```

**判定规则**：

- ❌ 违规：命中任一行
- ✅ 合规：0 命中

**修正模式**：

```css
/* ❌ 违规 */
.bg-primary {
  background-color: var(--primary) !important;
}

/* ✅ 修正 —— 靠选择器权重或 @layer 顺序解决 */
.bg-primary {
  background-color: var(--primary);
}
```

> ⚠️ **例外 1**：`src/theme/styles/prefix.css` 的层级兜底用了 **8 处** `!important` ——
> 那是**与 Radix 内联 `z-index` 竞争**的必要手段（Radix 把 `z-index` 写在 inline style 上，
> inline style 优先级高于任何选择器）。
> 该文件**已接入编译入口**（v2.0.0 起），故在此**显式登记豁免**。
>
> 📌 **`!important` 必须带感叹号** —— 写成裸 `important`（缺 `!`）是**非法 CSS**，
> 浏览器会**整条丢弃该声明**且**不报错**（无控制台告警）。
> 典型症状：Radix 弹层 wrapper 保留内联 `z-index: 50`，
> 低于宿主页面的高层级容器（Storybook `#storybook-root` 为 `z-index: 1300`），
> 弹层被压在下层元素之下 —— 表现为「弹层透底，能看见下层文字」。
> 扫描时需**同时**排查裸 `important`：
>
> ```bash
> # 裸 important（非法）—— 排除注释行
> rg -n "[^!]\bimportant\b" src/theme/styles/prefix.css -g "*.css" | rg -v "^\s*\d+:\s*\*"
> ```
>
> ⚠️ **例外 2**：`src/ui/table/style/table.css` 的 **59 处** `!important` ——
> 该文件**不被任何入口引用**（表格样式走 Tailwind 原子类），
> 与 `src/theme/styles/table.css` 字节级同源，**保留组件侧那份**备查。
> 因不在编译路径上，不影响产物。

### 维度 ⑨ 语义类必须能生成 CSS

**扫描命令**：

```bash
pnpm build:css > $null 2>&1
$css = Get-Content dist/styles.css -Raw
# 语义基类清单（已注册 token 的那批）
$classes = @('bg-primary','text-primary-foreground','bg-destructive','text-destructive','bg-success','bg-warning','bg-info','bg-popover','text-popover-foreground','bg-accent','text-accent-foreground','bg-muted','text-muted-foreground','bg-background','text-foreground','border-primary','border-destructive','border-success','border-warning','border-info','border-muted','border-input','ring-ring','ring-destructive','ring-success','border-gray-400','border-gray-500','bg-card')
$missing = $classes | Where-Object { -not ($css -match "\.$_[{,\s]") }
if ($missing) { "NOT GENERATED: $($missing -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：任一语义基类未在产物中生成规则
- ✅ 合规：输出 `OK`

> 📌 这是**维度 ① 的终局验证** —— 维度 ① 查「注册了没」，本维度查「真的生成了没」。

### 维度 ⑩ 内联 style 只能是动态值

**扫描命令**：

```bash
rg -n "style=\{\{" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：内联 style 承载**静态**样式（颜色 / 间距 / 字号 / 布局）
- ✅ 合规：内联 style 只承载**运行时计算值**（坐标 / 时长 / 缩放）
- ⚠️ 本维度**需人工判定**（命令只列出全部内联 style，判定靠逐条看）

**修正模式**：

```tsx
// ❌ 违规 —— 静态颜色应走 CSS 变量
<span style={{ backgroundColor: 'var(--primary)', padding: '8px' }} />

// ✅ 修正（src/ui/button/button.tsx:418-423）—— 只保留动态坐标
<span style={{ left: ripple.x, top: ripple.y, transform: 'translate(-50%, -50%)' }} />
```

### 维度 ⑪ Tailwind 编译器必须接管（原子类真的生成了）

**扫描命令**：

```bash
# ① 构建产物（CLI 路径）
pnpm build:css > $null 2>&1
$css = Get-Content dist/styles.css -Raw

# ①-1 产物里不应出现 @tailwind 字面量（Tailwind 编译器没接管 = 致命）
if ($css -match '@tailwind\s+(base|components|utilities)') { "VIOLATION: 产物含 @tailwind 字面量" } else { "OK: 无 @tailwind 字面量" }

# ①-2 原子类规则数必须 > 0
$n = ([regex]::Matches($css, '\.[a-zA-Z][\w-]*\s*\{')).Count
if ($n -lt 100) { "VIOLATION: 类规则仅 $n 条（原子类未生成）" } else { "OK: 类规则 $n 条" }

# ② Storybook 路径（dev server）—— 确认 vite 插件已注册
Select-String -Path .storybook/main.ts -Pattern "@tailwindcss/vite|tailwindcss\(\)" | ForEach-Object { "OK: " + $_.Line.Trim() }
```

**判定规则**：

- ❌ 违规 1：产物含 `@tailwind utilities;` 等**字面量** → Tailwind 编译器**没接管**该文件
- ❌ 违规 2：产物类规则数 **< 100** → 原子类**根本没生成**（Storybook 里表现为「样式全丢」）
- ❌ 违规 3：`.storybook/main.ts` **未注册** `@tailwindcss/vite` 插件 → 开发期必然样式全丢
- ✅ 合规：三条均 OK

> ⚠️ **本维度必须同时查「构建路径」和「开发路径」** —— 两条路径用**不同的编译器**
> （CLI vs Vite 插件），注册其一不影响其二（详见 §1.6）。

**修正模式**：

```ts
// ❌ 违规 —— .storybook/main.ts 未注册 Tailwind 插件
import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = {
  // ...
  viteFinal: async (viteConfig) => viteConfig, // 没有 Tailwind 插件
};

// ✅ 修正（.storybook/main.ts）
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
const config: StorybookConfig = {
  // ...
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};
```

### 维度 ⑫ 编译入口唯一性

**扫描命令**：

```bash
# ① src/ 根不得再有 CSS 入口 / 主题变量文件
foreach ($f in @('src/styles.css','src/theme-light.css','src/theme-dark.css')) {
  if (Test-Path $f) { "VIOLATION: 旧入口仍存在: $f" }
}

# ② 唯一入口必须存在且被 build:css 引用
if (-not (Test-Path 'src/theme/styles.css')) { "VIOLATION: 缺唯一入口 src/theme/styles.css" }
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.scripts.'build:css' -notmatch 'src/theme/styles\.css') { "VIOLATION: build:css 未指向 src/theme/styles.css" }

# ③ 主题变量文件必须落在 src/theme/themes/
foreach ($f in @('src/theme/themes/light.css','src/theme/themes/dark.css')) {
  if (-not (Test-Path $f)) { "VIOLATION: 缺主题文件 $f" }
}

# ④ Storybook preview 必须 import 新入口
Select-String -Path .storybook/preview.tsx -Pattern "src/theme/styles\.css" | ForEach-Object { "OK: " + $_.Line.Trim() }

# ⑤ @source 扫描范围必须锁定 src/（入口在 src/theme/，两级深 → ../ 才是 src/）
$src = Get-Content src/theme/styles.css -Raw
if ($src -notmatch "@source '\.\./\*\*/\*\.\{ts,tsx\}'") { "VIOLATION: @source 必须为 '../**/*.{ts,tsx}'（../../ 会扫到仓库根目录）" }
if ($src -notmatch "@source not '\.\./\.\./\*\*/\*\.md'") { "VIOLATION: 缺 @source not '../../**/*.md'（docs/ 的字面量类名会被解析）" }

# ⑥ 组件级 CSS 必须被入口 import（Table 是最典型的漏引用案例）
if ($src -notmatch "@import '\.\./ui/table/style/table\.css'") { "VIOLATION: 入口未 import table.css —— Table 核心样式会静默失效" }
foreach ($k in @('.eas-table-cell','.eas-table-row','.eas-table-header','.eas-table-bordered','.eas-table-sticky-header')) {
  if (-not (Get-Content dist/styles.css -Raw).Contains($k)) { "VIOLATION: 产物缺 Table 样式 $k" }
}

# ⑦ 产物不得含仅存在于 docs/ 的噪声类（抽样几个典型）
# ⚠️ 三个坑：
#   (1) 样本必须选**非 Tailwind 内置调色板**的类 —— `border-blue-500` / `text-yellow-500`
#       是 Tailwind v4 自带的 `--color-blue-500` 等，**任何时候都会生成**，不能当噪声样本；
#   (2) 必须匹配**独立的类选择器**（`.xxx{`）—— `animate-out` 在 src/ 里只以
#       `data-[state=closed]:animate-out` 形式出现，产物里是带前缀的版本，
#       用子串匹配会误报；
#   (3) 样本必须是**普通类名**，不能用任意值类 —— `bg-[var(--xxx)]` 这类
#       Tailwind **不会**从 `.md` 里解析生成（实测两种状态都不产出），无法作检测器。
$css = Get-Content dist/styles.css -Raw
foreach ($k in @('inset-4','my-2','animate-out','animate-ripple','animate-gradient','px-5')) {
  if ($css.Contains(".$k{")) { "VIOLATION: 产物含 docs/ 噪声类 .$k" }
}
```

**判定规则**：

- ❌ 违规：旧入口文件仍存在；或 `build:css` 未指向新入口；或主题变量文件不在 `src/theme/themes/`；
  或 Storybook preview 未 import 新入口；或 `@source` 扫描范围越界（扫到仓库根）；
  或缺 `@source not '*.md'`；或**组件级 CSS 未被入口 import**；或产物含 docs/ 噪声类
- ✅ 合规：七条均通过

> 📌 **本维度是 v2.0.0 新增** —— 迁移期最容易出的错是「**新旧入口并存**」
> （旧的 `src/styles.css` 还在，新入口也建了）→ 维护者改错文件，
> 或 Storybook 与构建产物**用了两套变量来源**。

**修正模式**：

```bash
# ❌ 违规 —— 旧入口仍在
src/styles.css
src/theme-light.css
src/theme-dark.css

# ✅ 修正 —— 删除旧文件，只保留 src/theme/ 下的新结构
```

---

## M+1. 历史基准（2026-11-02 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                                       | 值                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| 编译入口                                   | **1 个**（`src/theme/styles.css`）                                                      |
| `src/` 根的 CSS 文件                       | **0 个**（旧 `styles.css` / `theme-*.css` 已迁走）                                      |
| `src/theme/` 子目录                        | **4 个**（`themes/` / `fonts/` / `images/` / `styles/`）+ 根文件                        |
| light / dark 变量数                        | **702 / 702**，集合差异 **0**                                                           |
| 语义 token 注册数（`@theme inline`）       | **36**（26 语义色 + 8 sidebar + 灰阶 50~900）                                           |
| 产物中 `prefers-color-scheme` 出现次数     | **0**                                                                                   |
| 产物中 `data-theme` 出现次数               | **329**                                                                                 |
| 产物中 `@tailwind` 字面量                  | **0**                                                                                   |
| 产物类选择器数                             | **877**（727 来自 `src/` + 150 内置/变体）                                              |
| 产物中 CSS 变量声明总数                    | **6564**                                                                                |
| `dist/styles.css` 体积                     | **228.8 KB**（`--minify` 后）                                                           |
| 产物中 `eas-table-*` 选择器数              | **49**（Table 组件样式，v2.0.2 修复漏引用；源码 50 个，其中 `eas-table-grid` 仅为注释） |
| 产物中**仅 `docs/` 出现**的噪声类          | **0**（`@source not '../../**/*.md'` 生效）                                             |
| 产物中 `--sidebar-*` 语义类                | **8 个全部生成**（v2.0.0 修复的 bug）                                                   |
| `dist/fonts.css` 体积                      | **2.7 KB**（7 个 `@font-face` + 1 条变量声明）                                          |
| `dist/iconfont.css` 体积                   | **38.6 KB**（796 个图标类 + 3 个 `@font-face`）                                         |
| `dist/` 内的字体二进制                     | **0 个** —— 字体**不进 npm 包**（v2.0.4）                                               |
| `public/font/` 字体文件                    | **7 个 OTF / 60 MB**（200/300/400/450/500/700/900，**仅供本地构建**）                   |
| `public/icon/` 字体文件                    | **4 个 / 0.44 MB**（woff + ttf + 2 个 officefont，**仅供本地构建**）                    |
| npm 包体积                                 | **1.5 MB**（打包）/ **8.4 MB**（解包），15 文件                                         |
| 迁移前后 `src/` 来源类数量                 | **727 → 727**（**零丢失**，已逐类比对）                                                 |
| 组件引用但未定义的变量                     | **0**（3 个由 Radix 运行时注入）                                                        |
| Storybook 侧原子类规则数                   | **285**                                                                                 |
| Storybook 侧 `@tailwind` 字面量            | **0**                                                                                   |
| `src/theme/styles/globals.css` 状态        | ✅ **已删除**（未安装插件 + 失效 import）                                               |
| `src/theme/styles/tailwind.css` 状态       | ✅ **已删除**（历史遗留，内容与入口重复）                                               |
| `src/theme/styles/table.css` 状态          | ✅ **已删除**（与组件侧那份字节级同源）                                                 |
| `src/theme/themes/safelist.{js,json}` 状态 | ✅ **已删除**（各 1.46 MB，v3 时代遗留，无引用）                                        |
| `src/theme/fonts/msyh/` 状态               | ✅ **已删除**（3 个 `.ttc` / 46 MB，零引用死资源）                                      |
| `src/theme/fonts/SourceHanSansCN/` 状态    | ✅ **已删除**（v2.1.1）—— 字体二进制迁到 `public/font/`（§1.7）                         |

> 📌 **体积说明** —— v1.x 的「170 KB」与 v2.0.0 初稿的「2934.5 KB」**都是过期数据**：
>
> | 阶段                                | 体积         | 原因                                          |
> | ----------------------------------- | ------------ | --------------------------------------------- |
> | v1.x 记录的基线                     | 170 KB       | 主题变量未补全 + 扫描范围较窄                 |
> | v2.0.0 初稿（`@source '../../**'`） | 2934.5 KB    | **误扫仓库根目录**（含 `node_modules/` 等）   |
> | v2.0.1 修正后                       | 200.4 KB     | `@source '../**/*.{ts,tsx}'` + 排除 `.md`     |
> | **v2.0.2（补 Table 样式后）**       | **228.8 KB** | + `src/ui/table/style/table.css`（68 选择器） |
>
> ⚠️ **2934.5 KB 那个数字是「bug 状态」的产物**，不是正确基线。
> 📌 **体积不是可靠判据** —— 误扫仓库根目录时多出来的大小**取决于当时
> `node_modules/` / `storybook-static/` 的体量**（会随开发进度剧烈波动）：
> v2.0.1 复测同一份 bug 配置时产物仅 **236 KB**（vs 正确 229 KB），
> 与初稿记录的 2934.5 KB 差 12 倍。**故判定必须看「类集合差集」，不能看体积。**
>
> 📌 **零丢失的证明方式**（可复跑）：
>
> 1. 分别编译「`@source '../../**'`（bug 态）」与「正确入口」两份产物；
> 2. 提取两份产物的全部 class 选择器并**逐类比对**；
> 3. 结果：**正确态的类集合是 bug 态的严格子集（差集 = 0）**，
>    bug 态多出 **64 个**类经核对**全部仅存在于 `docs/`**
>    （`h-[var(--switch-sm-height)]` / `bg-[#ff0000]` / `animate-out` / `animate-ripple` …）。
>
> 📌 **迁移前后的对比同理** —— git HEAD 的旧入口（`src/styles.css`）重编后为 **202.3 KB**，
> 与 v2.0.1 的 200.4 KB 相当（差值来自 `prefix.css` 与新增的 `--sidebar-*` token）。

### 重测命令

```bash
pnpm build:css
$css = Get-Content dist/styles.css -Raw
Write-Output "prefers-color-scheme: $(([regex]::Matches($css,'prefers-color-scheme')).Count)"
Write-Output "类规则数: $(([regex]::Matches($css, '\.[a-zA-Z][\w-]*\s*\{')).Count)"
Write-Output "体积: $([math]::Round((Get-Item dist/styles.css).Length/1KB,1)) KB"
```

---

## M+2. 豁免清单

| 对象                                                                | 豁免依据                                                                                                                                                                                                                           |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--radix-popover-trigger-width` 等 3 个变量不在主题文件中           | **Radix 运行时注入**（inline style），真值源见 §3.4                                                                                                                                                                                |
| `src/ui/badge/badge.stories.tsx` 的 `'#ff00ff'`                     | **演示用途**：story 展示 `style` 属性透传自定义色值的能力，非组件默认样式                                                                                                                                                          |
| `src/ui/card/card.stories.tsx` 的 `'#ff0000'`                       | 同上                                                                                                                                                                                                                               |
| 组件实现里的 `dark:` 前缀（`src/ui/button/button.tsx:44` 等 7 处）  | **存量豁免**：修正后 `dark:` 已对齐 `data-theme`，无需改代码；**新增代码**必须遵循 §3.2                                                                                                                                            |
| `src/theme/styles/prefix.css` 的 `!important`（6 处）               | 与 Radix **inline style** 的 `z-index` 竞争 —— inline style 优先级高于任何选择器；**必须**用 `!important` 才能覆盖（§1.2）                                                                                                         |
| `src/ui/table/style/table.css` 的 `!important`（59 处）             | **存量豁免**：该文件**已进产物**（入口 `@import`），但 `!important` 是为覆盖 Radix inline style 与 Tailwind 工具类而写；**新代码禁止**在 `src/ui/` 下新增此类 CSS                                                                  |
| `src/theme/styles/iconfont/iconfont.css` 的 `!important`（1 处）    | 图标字体声明的固有写法（`font-family: iconfont !important`），第三方资源；**该文件不进 `styles.css`**，仅由 `build:icons` 重新生成为 `dist/iconfont.css`（§1.8）                                                                   |
| `src/theme/fonts/fonts.ts` 的字重声明                               | **已修复**（v2.0.3）—— 原声明 7 个字重（`'200'`~`'900'`）且生成的文件名 `SourceHanSansCN-{weight}.otf` 与真实文件名（`Regular`/`Medium`/`Bold`）**无一匹配**，是零引用死代码；现已对齐真实文件并由 `pnpm build:fonts` 落地（§1.7） |
| `src/theme/index.ts` 与 `src/theme/themes/index.ts` 双 `Theme` 定义 | 根目录版只导出 2 个主题（`light` / `dark`），`themes/` 版导出 7 个；**前者是公开 API**，后者是资源层（§M+3 C3）                                                                                                                    |
| `--color-blue-400` 等 Tailwind v4 内置调色板变量                    | **不是主题变量** —— Tailwind 内置自动可用，不能按「主题文件里没定义」判违规（维度 ⑥）                                                                                                                                              |
| `public/` 下的字体二进制（`font/` 60 MB + `icon/` 0.44 MB）         | **不进 npm 包**（`package.json#files` 只含 `dist` 等）—— 仅供维护者本地构建与自测；**由应用层**自行放置到其 `public/` 静态资源目录（§1.7 / §1.8）                                                                                  |

---

## M+3. 冲突裁决

| #   | 冲突点                             | 旧规范声明                                                    | 实际情况                                                            | 裁决                                                                                                               |
| --- | ---------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| C1  | Tailwind 语义类是否可用            | `code-quality.md` 未涉及                                      | 修复前 32/33 语义基类**未生成 CSS**                                 | **必须经 `@theme inline` 注册**（本规范 §3.1）                                                                     |
| C2  | `dark:` 的判定依据                 | 未涉及                                                        | Tailwind 默认走 `prefers-color-scheme`                              | **必须用 `@custom-variant dark` 对齐 `data-theme`**（§3.2）                                                        |
| C3  | 主题类型定义的归属                 | 未涉及                                                        | `src/theme/index.ts` 与 `src/theme/themes/index.ts` **各有一份**    | **根目录版是公开 API**（2 主题）；`themes/` 版是资源层（7 主题），不导出                                           |
| C4  | 样式取值方式                       | `coding-standards.md` 未涉及                                  | 实现文件 `var(--xxx)` 752 处 vs 语义类 ~97 处                       | **语义类优先，组件私有用 `var(--<component>-<role>)`**（§4.1）                                                     |
| C5  | 主题文件的位置                     | v1.x 在 `src/` 根                                             | 散落在 `src/` 根与 `src/theme/` 两处                                | **收敛到 `src/theme/`**（本规范 §1.2 / §1.3）                                                                      |
| C6  | 编译入口的数量                     | v1.x 是 `src/styles.css`                                      | 迁移期可能出现新旧入口并存                                          | **入口唯一**（本规范 §1.1 / 维度 ⑫）                                                                               |
| C7  | `@source` 的相对基准               | v1.x 入口在 `src/`（1 级深），`@source './**'`                | 入口迁到 `src/theme/`（2 级深）后，`../../` 会扫到**仓库根目录**    | **`@source` 必须相对入口重算** —— `../` = `src/`，并显式 `@source not '../../**/*.md'`（§1.4 / 维度 ⑫）            |
| C8  | 字体二进制放 `src/` 还是 `public/` | v2.0.3 前放 `src/theme/fonts/` + `src/theme/styles/iconfont/` | 字体是**静态资源**（浏览器按 URL 请求），CSS 是**源码**（参与构建） | **二进制进 `public/`，CSS 声明源留在 `src/`** —— 职责分离；`public/` 与消费方静态资源目录同名同结构（§1.7 / §1.8） |
| C9  | 主题 CSS 是否需要单独产出          | v2.0.3 记「已被 `styles.css` 内联，无需单独引」               | 消费方可能需要**只覆盖主题变量**而保留自己的原子类                  | **保留 `dist/theme-{light,dark}.css`** 并在 `exports` 暴露 —— 可选产物（§1.5）                                     |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审样式时的**自查**清单（不是任务列表，是合规性自检表）。

### 新增 CSS 变量时

- [ ] `src/theme/themes/light.css` 与 `dark.css` **两处**都定义，变量名一致
- [ ] 命名符合分类规则（全局语义 / `--gray-*` / `--radius-*` / `<component>-<role>` / `--eas-*`）
- [ ] 若需在组件里用作语义类，已在 `@theme inline` 注册为 `--color-*`
- [ ] 灰阶变量已用 `hsl()` 包裹
- [ ] 未与既有变量重名

### 新增组件样式时

- [ ] 全部颜色 / 间距走 CSS 变量，无硬编码字面量
- [ ] 组件私有变量用 `<component>-<role>` 前缀，且已在两处主题文件定义
- [ ] 类名合并用 `cn()`，`className` 在末位
- [ ] 状态样式用 `data-[...]` 变体
- [ ] 内联 style 只承载动态值
- [ ] `pnpm build:css` 后产物中相关类**确实生成**（维度 ⑨）

### 评审样式时

- [ ] 维度 ① ~ ⑫ 已全跑（一次跑全库）
- [ ] 主题切换在 `data-theme="light"` 与 `data-theme="dark"` 下都正常
- [ ] `pnpm test` 全绿（类名断言可能因 token 注册而变化）
- [ ] **Storybook 里样式正常**（维度 ⑪ —— 编译器没接管时**构建产物正常但 Storybook 全丢**）
- [ ] 编译入口唯一（维度 ⑫ —— 无新旧入口并存）

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测新建：① 确立**构建期全量编译**链路（`src/styles.css` → `dist/styles.css`）；② 确立**主题双文件变量集合必须完全一致**（当前各 692 个）；③ 确立 CSS 变量命名三类规则（全局语义 / 灰阶分量 / 组件私有前缀）；④ **新增 §3 三个高危坑**（`@theme inline` token 注册缺失 → 语义类静默失效 / `dark:` 走 `prefers-color-scheme` 与 `data-theme` 冲突 / 组件引用未定义变量），并给出修复后的实测数据；⑤ 确立「语义类优先、组件私有用 `var(--<component>-<role>)`」的选型规则；⑥ 10 项扫描维度全部实跑验证                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 1.1.0 | 2026-10-31 | **新增坑四 + 维度 ⑪**。实测发现 **Storybook 侧漏注册 `@tailwindcss/vite` 插件** → Vite 把 `src/styles.css` 当普通 CSS 处理 → `@import 'tailwindcss'` 展开的 `@layer utilities { @tailwind utilities; }` 编译期指令**原样保留（inert）** → **零个原子类生成** → Storybook 里所有组件「无边框、无圆角、样式全丢」（而 `pnpm build:css` 产物正常，极易误判为「组件 bug」）。修复：`.storybook/main.ts` 的 `viteFinal` 注册插件。同步新增 §1.4「两条编译路径」、§3.5「层叠层顺序与优先级」（解释为何 preflight 的 `border:0 solid` 不会覆盖 `.border`）、维度 ⑪（同时查构建路径与开发路径）。实测：Storybook 侧类规则 0 → **285**，`@tailwind` 字面量 1 → **0**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2.0.0 | 2026-11-02 | **样式资源收敛到 `src/theme/`（编译入口唯一化）**。① 概述新增「**单一 CSS 入口**」为核心约束；② §1.1 编译入口由 `src/styles.css` 改为 **`src/theme/styles.css`**；③ **新增 §1.2「`src/theme/` 目录布局」** —— 完整目录树 + 「是否编译入口 / 是否消费方可见」双列对照表；④ **新增 §1.3「为什么收敛到 `src/theme/`」** —— 4 条理由，并强调「迁移是**移动**不是复制」；⑤ §1.4 `@source` 扫描范围改写（相对入口文件所在目录）；⑥ §1.5 交付物的**复制源路径**改为 `src/theme/themes/`；⑦ **新增 §1.7「字体资源」**；⑧ **新增 §1.8「死代码 / 残缺资产」**；⑨ **新增 §1.6 的 Storybook import 路径同步要求**；⑩ §2.3 变量命名规则新增 **「设计 token `--eas-*`」** 一类；⑪ **新增维度 ⑫「编译入口唯一性」** —— 6 条检查；⑫ 维度 ①~④⑤⑥ 的扫描路径全部改指 `src/theme/`；⑬ 维度 ⑧ 补 `prefix.css` 的 `!important` 豁免；⑭ §M+2 豁免清单扩为 11 条；⑮ **新增 §M+3 冲突裁决 C3 / C5 / C6 / C7**；⑯ §M+1 基线更新为 v2 口径                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.0.1 | 2026-11-02 | **修正 `@source` 相对基准 + 排除 `.md`（实测发现两处扫描越界）**。① §1.4 `@source` 由 `'../../**/*.{ts,tsx}'` 改为 **`'../**/*.{ts,tsx}'`** —— 入口迁到 `src/theme/`（**两级深**）后，`../../` 解析到**仓库根目录**而非 `src/`，实测产物膨胀到 **2934 KB**（正确值 205 KB）并多出 37+ 个**文档噪声类**（`bg-[var(--xxx)]` / `border-blue-500` / `h-[var(--switch-sm-height)]`）；② **新增 `@source not '../../**/*.md'`** —— Tailwind v4 的自动内容探测是**叠加式**的，仍会扫描仓库内 `.md`，导致 `docs/components/form/switch.md` 里的**字面量类名示例**被当作候选类解析，触发优化器告警 `Unexpected token Delim('<')`（该告警在 git HEAD 即已存在，属**存量问题**）；③ §1.4 新增 ⛔ 专段说明「`../` vs `../../`」与「必须排除 `.md`」两个坑；④ 维度 ⑫ 增补 2 条检查（`@source` 范围 + 产物无 docs 噪声类），判定规则由「四条」改为「六条」；⑤ **新增 §M+3 冲突裁决 C7**（`@source` 的相对基准）；⑥ §M+1 基线全面修正 —— 体积 2934.5 → **200.4 KB**（并注明 2934.5 是「bug 状态」产物，比正确值大 14.6 倍）、类选择器 877（727 来自 `src/` + 150 内置/变体）、主题变量 692 → **702**、token 28 → **36**；⑦ §M+1 补充「迁移零丢失的证明方式」（重编 git HEAD 旧入口 → 逐类比对 → `src/` 来源类 **727 → 727 完全一致**）；⑧ §1.2 修正 `styles/prefix.css` 行 —— v2.0.0 已把该文件补进入口 import（此前「写了不用」），并说明 import 顺序要求；⑨ §M+2 豁免清单补 `table.css` / `iconfont.css` / Tailwind 内置调色板 3 条；⑩ §1.8 补记 **删除 `src/theme/themes/safelist.{js,json}`**（各 1.46 MB 的 v3 时代遗留，无引用）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2.0.2 | 2026-11-02 | **入口重命名为 `styles.css` + 补齐 Table 组件样式 import**。① **入口由 `src/theme/style.css` 重命名为 `src/theme/styles.css`**（与产物 `dist/styles.css` 同名，减少心智负担；避免与 `src/theme/styles/` 目录混淆）；② **修复 Table 样式未进产物的缺陷** —— `src/ui/table/style/table.css`（1361 行 / 68 个 `eas-table-*` 选择器 / 427 条规则）此前**未被任何入口引用**，而组件源码（`TableCell.tsx` / `TableRow.tsx` / `TableHeader.tsx` / `TableContainer.tsx`）**确实在用**这些类名 → 表格的 sticky header / bordered / density / striped / fullscreen / scroll **全部失效**。修复：入口新增 `@import '../ui/table/style/table.css';`（排在原子类之后，才能覆盖 `border-b` / `text-left` 等工具类）。实测产物 205.2 → **228.8 KB**，`eas-table-*` 选择器 68 个全部进产物；③ §1.2 目录树与文件表同步 `styles.css` 与 `table.css` 的归属；④ §M+1 基线补记「Table 样式已进产物」与体积 228.8 KB；⑤ §M+2 豁免清单中 `table.css` 的「不被任何入口引用」表述**作废**（已进产物），仅保留 `!important` 存量豁免                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.0.3 | 2026-11-02 | **字体链路打通（opt-in 交付）+ 修复 `--font-sans` 断链 + 清理 77 MB 死资源**。① **字体从「死代码」变为「可用交付物」** —— `src/theme/fonts/fonts.ts` 原本声明 7 个字重（`'200'`~`'900'`）并生成 `SourceHanSansCN-{weight}.otf`，而磁盘上的真实文件名是 `Regular` / `Medium` / `Bold` / `ExtraLight` / `Light` / `Normal` / `Heavy` → **7 个生成名无一命中**，且 `fonts.ts` **零引用**、注释里写的 `import '@easbot/ui/fonts.css'` 在 `exports` 中**根本不存在**、字体文件（101.9 MB）**从未进 `dist/`**。修复：`fonts.ts` 重写（字重与文件名对齐真实文件、导出 `FONT_FAMILY` / `FONT_SANS_VARIABLE` / `FONT_DIR` / `buildFontFace` / `buildFontStack` / `buildFontsCss`）；新增 `scripts/build-fonts.ts`（由 `pnpm build:fonts` 执行，生成 `dist/fonts.css` + 复制 OTF + 复制 SIL OFL 授权文件）；`package.json#exports` 新增 `"./fonts.css": "./dist/fonts.css"`；`pnpm build` 串联 `tsup && build:css && build:fonts`；② **字重收敛为 3 个（400 / 500 / 700）** —— 每个 OTF 约 8 MB 且 `font-display: swap` 下**每个字重独立下载**，多余字重显著拖慢首屏；③ **删除 77 MB 死资源** —— `src/theme/fonts/msyh/`（3 个 `.ttc` / 46 MB，零引用）+ `SourceHanSansCN` 的 ExtraLight/Heavy/Light/Normal（31 MB）；④ **修复 `--font-sans` 断链（IACVT）** —— `src/theme/styles.css` 的 `@layer base` 与 `src/theme/themes/variables.css` 的 `@theme` 此前写 `var(--font-source-han-sans), system-ui, …`，变量缺失时**整条声明失效**（连 `system-ui` 都拿不到）；改为 **`var(--font-source-han-sans, <完整回退栈>)` 兜底值形式**；⑤ §1.7 由「字体资源」重写为「**字体资源 —— opt-in 交付**」，明确「样式与字体 CSS **一起导出**、由**应用层决定是否启用**」的消费方契约；⑥ §1.5 交付物表新增 `dist/fonts.css` / `dist/fonts/*.otf`；⑦ §1.8 补记 2 项删除；⑧ §M+1 基线补记字体产物（`fonts.css` 0.9 KB / 3 个 OTF 24.1 MB / npm 包 23.5 MB）；⑨ §M+2 中 `fonts.ts` 的「注释已标注失效」条目**作废并替换**为「已修复」记录                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2.1.0 | 2026-11-02 | **图标字体链路打通（opt-in 交付）+ 修复 Storybook 图标空白 + 清理 868 KB 冗余格式**。① **发现 iconfont 整条链路从未生效** —— `src/theme/styles/iconfont/` 下的 4 个字体文件（eot / ttf / woff / svg）+ 2 个 officefont ttf **从未进 `dist/`**，`iconfont.css` **未被任何入口引用** → `Icon` 的 `type="class"` 模式在消费方**全是空白图标**（`name` / `url` 模式不受影响）；② **新增 `src/theme/styles/iconfont/icons.ts`** —— 图标字体的**唯一声明源**（导出 `ICONFONT_FAMILY` / `ICONFONT_DIR` / `ICONFONT_FACES` / `OFFICEFONT_FACES` / `buildIconfontFaces` / `buildOfficefontFaces` / `parseIconfontContentMap` / `buildIconfontContentRules`）；③ **新增 `scripts/build-icons.ts`**（`pnpm build:icons`）—— 读源 CSS → **解析** 796 个 `.icon-xxx:before` 的 content 映射 → **重新生成** `dist/iconfont.css`（**不复制**，因路径需改写）→ 复制 4 个字体文件到 `dist/iconfont/`；④ **⛔ 关键约束：CSS 必须重写路径** —— 源文件 `url(iconfont.eot)` 相对自身，产物里 CSS 在 `dist/` 而字体在 `dist/iconfont/` → 层级不一致 → 404；产物改为 `url('./iconfont/iconfont.woff')`；officefont 同理（`url(font/symbol.ttf)` → `url('./iconfont/font/symbol.ttf')`）；⑤ **只保留 woff + ttf** —— 删除 `eot`（174 KB，仅 IE8- 需要）+ `svg`（694 KB，已被 WOFF2 取代），**省 868 KB**，不损失任何现代浏览器支持；⑥ **`package.json#exports` 新增 `"./iconfont.css"`**，`pnpm build` 串联 `tsup && build:css && build:fonts && build:icons`；⑦ **修复 Storybook 图标空白** —— `.storybook/preview.tsx` 此前**只引** `styles.css`，而 iconfont 是 opt-in 产物**不在 `styles.css` 内** → `iconfont` / `officefont` 两个 story 的图标全是空白（story 注释却写着「已全局引入」，极易误判）；现补引两个源 CSS；⑧ **修复 `.officefont` 类缺 `font-family`** —— `officefont-demo.css` 只声明了 `content` 码点，`.officefont` 类**没声明 `font-family`** → 退回默认字体，码点不在字符集里 → 只显示方块；现补 `font-family: 'Wingdings', 'Symbol', sans-serif`；⑨ **`iconfontClassNames` 转为公开 API** —— `src/ui/icon/index.ts` 新增 `export { default as iconfontClassNames }`，消费方可直接取全部 796 个类名做「图标选择器」；⑩ **新增 §1.8「图标字体资源 —— opt-in 交付」**，原「死代码清单」顺延为 §1.9；⑪ §1.5 交付物表新增 `dist/iconfont.css` / `dist/iconfont/*`；⑫ §1.2 文件表补 4 行 iconfont 归属；⑬ §1.9 补记 eot / svg 删除；⑭ §M+1 基线补记图标产物（`iconfont.css` 39.5 KB / 796 个图标类 / 4 个字体 0.44 MB / npm 包 23.9 MB）；⑮ §M+2 豁免清单中 iconfont 的 `!important` 条目补注「不进 `styles.css`」 |
| 2.1.1 | 2026-11-02 | **字体二进制迁到 `public/`（职责分离）+ 主题 CSS 单独产出并在 `exports` 暴露**。① **目录职责分离** —— 字体二进制是**静态资源**（浏览器按 URL 请求），CSS 声明源是**源码**（参与构建）→ 二进制统一迁到 `public/font/`（7 个 OTF）与 `public/icon/`（4 个文件），**与消费方的静态资源目录同名同结构**，产物按 `/font/xxx` / `/icon/xxx` 引用即**自动对应**；**删除** `src/theme/fonts/SourceHanSansCN/`（7 个 OTF / 60 MB）与 `src/theme/styles/iconfont/font/`（4 个文件）—— `src/` 下**只留 CSS 声明源**（`fonts.ts` / `iconfont.css` / `officefont.css` / `icons.ts`）；② **构建脚本改为「只生成 CSS，不复制字体」** —— `scripts/build-fonts.ts` / `scripts/build-icons.ts` 只产出 CSS + **校验字体存在**（缺失即早失败），npm 包体积 23.9 → **1.5 MB**；③ **字重由 3 个扩为 7 个** —— 字体不进包后，**字重范围由应用层决定**，本库提供全部 7 个（200 / 300 / 400 / 450 / 500 / 700 / 900）的 `@font-face`，消费方可按需只放 1~2 个；④ **`package.json#exports` 新增 `"./theme-light.css"` / `"./theme-dark.css"`** —— 这两个文件**已内联在 `styles.css`**（`@import`），单独产出是为让消费方能**只覆盖主题变量**而保留自己的原子类（**特别提供的可选产物**）；⑤ **新增 §M+3 冲突裁决 C8 / C9**；⑥ §1.7 / §1.8 各新增「目录职责（CSS 与二进制分离）」表；⑦ §1.9 补记两个目录的删除记录；⑧ §M+1 基线更新（npm 包 23.9 MB → **1.5 MB**，`dist/` 内字体二进制 **0 个**）；⑨ §M+2 豁免清单补 `public/` 字体二进制（不进 npm 包）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
