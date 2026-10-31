---
name: css-standard
description: 该规范定义 easbot-ui 组件库的样式与主题契约，含 Tailwind CSS v4 构建期编译链路（src/styles.css 入口 / @source 扫描 / dist/styles.css 交付）、构建与开发两条编译路径都必须启用 Tailwind 编译器（Storybook 侧漏注册 @tailwindcss/vite 会导致零个原子类生成、样式全丢）、CSS 变量命名规则（全局语义变量 / 组件私有前缀变量 / 状态后缀）、主题双文件机制（theme-light.css 与 theme-dark.css 必须同步且变量集合完全一致）、@theme inline 语义 token 注册规则（不注册则 bg-primary 等语义类静默失效）、灰阶变量必须用 hsl() 包裹（主题文件存的是裸 HSL 分量）、@custom-variant dark 对齐 data-theme 机制（默认 dark 走 prefers-color-scheme 与显式切换冲突）、层叠层顺序与优先级规则（theme < base < components < utilities，原子类优先于 preflight）、CSS 变量 vs Tailwind 任意值的选型规则、样式 11 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与新增样式变量检查清单。当编写组件样式、新增主题变量、排查样式不生效或主题切换异常时参考。
category: specification
version: 1.1.0
baseline-date: 2026-10-31
tags: [easbot-ui, css, tailwind, theme, design-token, dark-mode, style, code-review]
related:
  - spec-index.md
  - component-standard.md
  - testing-guidelines.md
  - code-annotation-standard.md
  - code-quality.md
---

# EASBot UI 样式与主题规范 (CSS Standard)

> **真值源**：本规范以 [`src/styles.css`](../src/styles.css)、[`src/theme-light.css`](../src/theme-light.css)、[`src/theme-dark.css`](../src/theme-dark.css)
> 与 `package.json#scripts#build:css` 为唯一执行真值；规范与实现冲突时**规范改**（先改规范再改实现，不留双轨）。
>
> **与其它规范的分工**（三者**不重复**）：
>
> | 关注点                               | 归属文档                                           | 本规范对应章节     |
> | ------------------------------------ | -------------------------------------------------- | ------------------ |
> | 组件目录 / 命名 / 导出 / `cn()` 合并 | [`component-standard.md`](./component-standard.md) | §3.6（仅类名写法） |
> | 测试断言里的类名写法                 | [`testing-guidelines.md`](./testing-guidelines.md) | §4.3（仅断言什么） |
> | lint / 构建命令 / 依赖               | [`code-quality.md`](./code-quality.md)             | §1（仅 build:css） |
>
> **历史基准**：v1.0.0 锁定 2026-10-31 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本库是**构建期编译 Tailwind** 的组件库：样式在库构建时全部编译成 `dist/styles.css`，消费方只需
`import '@easbot/ui/styles.css';`，**无需**安装或配置 Tailwind。

这带来一条**区别于普通项目**的核心约束：**样式写错不会报错，只会静默失效**。
本规范存在的唯一目的，就是把这类「静默失效」变成**可扫描、可判定**的问题。

**核心约束**：

- ✅ 组件样式**必须**通过 CSS 变量取值（`var(--xxx)` 或 `bg-[var(--xxx)]`），**禁止**硬编码颜色值
- ✅ 新增 CSS 变量**必须**在 `theme-light.css` 与 `theme-dark.css` **两处**同步定义，且**变量集合必须完全一致**
- ✅ 主题变量**必须**在 `@theme inline` 中注册为 `--color-*` token，否则语义类（`bg-primary`）**不生成任何 CSS**
- ✅ 灰阶变量（`--gray-*`，裸 HSL 分量）**必须**写成 `hsl(var(--gray-500))`
- ✅ `dark:` 变体**必须**走 `@custom-variant dark`（对齐 `data-theme`），**禁止**依赖 `@media (prefers-color-scheme)`
- ✅ **构建路径**（`pnpm build:css`）与**开发路径**（Storybook）**必须都启用 Tailwind 编译器** —— 否则 Storybook 里**零个原子类**生成，样式全丢（§1.4）
- ✅ 样式**必须**落在 Tailwind 的 `utilities` 层（原子类）—— 优先级**高于** `base` 层的 preflight（§3.5）
- ✅ 所有 CSS 变更**必须**在 `src/styles.css` 里通过 `@import` / `@theme` / `@utility` 声明，**禁止**在组件里写 `<style>`
- ❌ 禁止在组件源码里硬编码 `hsl(...)` / `#fff` / `rgb(...)` 等颜色字面量
- ❌ 禁止引用**未在主题文件中定义**的 CSS 变量
- ❌ 禁止用 `!important` 覆盖样式

---

## 1. 构建链路

### 1.1 三段式编译

```
src/styles.css  ──(tailwindcss CLI, 构建期扫描 src/)──>  dist/styles.css
   ↑                                                  ↑
   ├─ @import 'tailwindcss'                           └─ 消费方唯一需要的产物
   ├─ @import 'tw-animate-css'
   ├─ @import './theme-light.css'
   ├─ @import './theme-dark.css'
   ├─ @source './**/*.{ts,tsx}'
   ├─ @custom-variant dark (...)
   └─ @theme inline { ... }
```

**命令**（真值源 = `package.json#scripts`）：

```bash
pnpm build:css    # tailwindcss -i ./src/styles.css -o ./dist/styles.css --minify
pnpm build        # tsup（JS + d.ts）+ build:css
```

> ⚠️ **Tailwind 是构建期工具，不进运行时依赖** —— 它在 `devDependencies`，消费方不需要安装。

### 1.2 `@source` 扫描范围

```css
@source './**/*.{ts,tsx}'; /* src/styles.css:33 */
```

| 事实                                       | 说明                                      |
| ------------------------------------------ | ----------------------------------------- |
| 扫描范围**相对 `src/styles.css` 所在目录** | 即 `src/` 全部 `.ts` / `.tsx`             |
| stories 文件**也在扫描范围内**             | `src/**/*.stories.tsx` 的类名**会**进产物 |
| 主题文件自身**不在扫描范围内**             | 但通过 `@import` 进入产物                 |

> 📌 **推论**：stories 里用的类名会进最终产物。这不是 bug（Storybook 需要样式一致），但**必须**知道 —— stories 里写错的类名同样不会报错。

### 1.3 交付物

| 产物                   | 来源                           | 消费方用法                                   |
| ---------------------- | ------------------------------ | -------------------------------------------- |
| `dist/styles.css`      | `src/styles.css` 编译          | `import '@easbot/ui/styles.css'`             |
| `dist/theme-light.css` | `src/theme-light.css` 原样复制 | 已被 `styles.css` `@import` 内联，无需单独引 |
| `dist/theme-dark.css`  | `src/theme-dark.css` 原样复制  | 同上                                         |

> 📌 主题文件由 `tsup.config.ts` 的 `onSuccess` 钩子复制到 `dist/`（供调试与单独覆盖使用）。

### 1.4 两条编译路径（**必须都启用 Tailwind 编译器**）

同样的 `src/styles.css`，有两条编译路径：

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

> ⚠️ **本仓库没有 `vite.config.ts`** —— 靠 Storybook 的 `viteFinal` 注入。
> 若将来新增根 `vite.config.ts`，**必须**在其中也注册该插件，否则会退回「样式全丢」的状态。

---

## 2. 主题机制

### 2.1 双文件 + `data-theme` 选择器

```css
/* src/theme-light.css:1 */
:root[data-theme='light'] { --background: hsl(0 0% 100%); ... }

/* src/theme-dark.css:1 */
:root[data-theme='dark'] { --background: hsl(240 10% 4%); ... }
```

**切换方式**：`<html data-theme="light|dark">`。

> 📌 **由消费方控制** —— 组件库不注入任何主题脚本，只提供两套变量与选择器约定。
> Storybook 的切换机制见 [`storybook-standard.md`](./storybook-standard.md) §4。

### 2.2 变量集合必须完全一致

**硬性要求**：`theme-light.css` 与 `theme-dark.css` 的变量名集合**必须一一对应**。

- 两文件当前各 **689** 个变量，集合差异 **0**
- ⚠️ **漏定义的后果**：某变量只在 light 里有 → dark 模式下该属性**失效**（浏览器解析为无效值），且**无任何报错**

### 2.3 变量命名规则

| 类别             | 规则                                                                             | 示例                                                                 |
| ---------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **全局语义变量** | 裸名，无前缀                                                                     | `--background` / `--foreground` / `--primary` / `--muted-foreground` |
| **灰阶分量**     | `--gray-<50..900>`，存**裸 HSL 分量**                                            | `--gray-500: 240 4% 50%;`                                            |
| **圆角**         | `--radius-<sm                                                                    | md                                                                   | lg  | full>`+`--radius` | `--radius-sm: 0.375rem;` |
| **组件私有变量** | `<component>-<role>` 前缀                                                        | `--button-default-hover` / `--dialog-content-bg`                     |
| **状态派生**     | `-hover` / `-active` / `-disabled` / `-focus` / `-foreground` / `-readonly` 后缀 | `--input-border-focus-color`                                         |

**组件私有变量前缀对照**（真值源 = `theme-*.css`）：

| 组件        | 前缀               | 组件       | 前缀             |
| ----------- | ------------------ | ---------- | ---------------- |
| Button      | `--button-*`       | Form       | `--form-input-*` |
| Card        | `--card-*`         | Command    | `--command-*`    |
| Dialog      | `--dialog-*`       | Toast      | `--toast-*`      |
| Select      | `--select-*`       | Spinner    | `--spinner-*`    |
| AlertDialog | `--alert-dialog-*` | ScrollArea | `--scroll-bar-*` |
| Badge       | `--badge-*`        | Menubar    | `--menubar-*`    |
| HoverCard   | `--hover-card-*`   | Popover    | `--popover-*`    |

### 2.4 灰阶变量的特殊性

主题文件里 `--gray-*` 存的是**裸 HSL 分量**（供 `hsl(var(--gray-500))` 组合用）：

```css
/* src/theme-light.css:16 */
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

**修正**（[`src/styles.css`](../src/styles.css) 的 `@theme inline` 块）：

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
因此 `<html data-theme="dark">` 切换时**无需重新构建**。

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

| 变量                      | 使用位置                | 后果           |
| ------------------------- | ----------------------- | -------------- |
| `--card-hover-shadow`     | `src/card/card.tsx:24`  | 悬停阴影不生效 |
| `--card-disabled-opacity` | `src/card/card.tsx:190` | 禁用态无透明度 |
| `--card-ripple-color`     | `src/card/card.tsx:210` | 波纹色无色值   |

**修正**（light / dark **两处**都加）：

```css
/* src/theme-light.css */
--card-hover-shadow: 0 4px 12px hsl(var(--gray-900) / 12%);
--card-disabled-opacity: 0.5;
--card-ripple-color: var(--foreground);

/* src/theme-dark.css */
--card-hover-shadow: 0 4px 12px hsl(0 0% 0% / 40%);
--card-disabled-opacity: 0.5;
--card-ripple-color: var(--foreground);
```

> ⚠️ **同时修正了取值格式**：`src/card/card.tsx:210` 原本写 `rgb(var(--card-ripple-color))`，
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
| 3   | **同名层会合并**，不是覆盖 —— 本库在 `src/styles.css` 里再写 `@layer base` / `@layer utilities`，**不会**改变层间优先级                                     |
| 4   | **同层内按源码顺序** —— 本库自定义的 `@layer utilities`（滚动条样式）在 Tailwind 原子类**之后**，因此**优先级更高**（符合预期：自定义工具类应能覆盖原子类） |
| 5   | 本库 `@layer base` 里的 `* { border-color: var(--border) }` **只设 `border-color`**，**不设** `border-width` / `border-style` → 永远不会把边框「归零」      |

> 📌 **推论（自检维度 ⑪）**：若发现组件「边框消失 / 圆角消失 / 样式全丢」，
> **先查层叠层，再查类名**：
>
> | 检查项                                                             | 期望                                            |
> | ------------------------------------------------------------------ | ----------------------------------------------- |
> | 产物里有 `@tailwind utilities;` **字面量**                         | **不应存在** → Tailwind 编译器没接管（见 §1.4） |
> | 产物里 `.border` / `.rounded-md` 等类规则**数量为 0**              | **不应为 0** → 原子类没生成                     |
> | `border-width` 计算值是 `0px` 但类名里有 `border`                  | 检查是否有更高优先级的规则设了 `border-width:0` |
> | `border-color` 计算值是 `rgb(228,228,231)`（正常）但**看不到边框** | 是 `border-width` 问题，**不是**颜色问题        |

---

## 4. 样式写法规则

### 4.1 CSS 变量 vs Tailwind 任意值

| 场景                                | 写法                                                          | 真值源                              |
| ----------------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| **组件私有变量**（组件专用）        | `bg-[var(--button-default)]`                                  | `src/button/button.tsx:37`          |
| **全局语义变量**（跨组件）          | `bg-[var(--background)]`                                      | `src/button/button.tsx:44`          |
| **Tailwind 语义类**（已注册 token） | `bg-primary`                                                  | `src/checkbox/checkbox.tsx:17`      |
| **内联 style（动态值）**            | `style={{ backgroundColor: 'var(--command-loading-bg)' }}`    | `src/command/command.tsx:51`        |
| **运行时读取变量**                  | `getComputedStyle(...).getPropertyValue('--toast-max-width')` | `src/use-toast/use-toast.tsx:11-19` |

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

**真值源**：`src/button/button.tsx:418-423`（波纹）、`src/card/card.tsx:206-211`（波纹）、`src/button/button.tsx:266-272`（压力缩放）。

### 4.3 类名合并

**必须**用 `cn()`（`src/utils/classnames.ts`）：

```tsx
// ✅ 正例（src/button/button.tsx:378）
cn(buttonVariants({ variant, size: finalSize, className }), 'relative overflow-hidden');
```

> 📌 **详细规则见 [`component-standard.md`](./component-standard.md) §3.6** —— 本规范不重复。

### 4.4 `data-*` 状态变体

Radix 组件的状态通过 `data-*` 属性暴露，样式**必须**用 Tailwind 的 `data-[...]` 变体消费：

```tsx
// ✅ 正例（src/dialog/dialog.tsx:14）
'fixed inset-0 z-50 bg-[...] data-[state=open]:animate-in data-[state=closed]:animate-out ...';

// ✅ 正例（src/checkbox/checkbox.tsx:17）
'data-[state=checked]:border-primary data-[state=checked]:bg-primary';
```

**常见状态属性**：

| 属性            | 组件                                 | 真值源                                       |
| --------------- | ------------------------------------ | -------------------------------------------- |
| `data-state`    | dialog / checkbox / switch / tabs 等 | `src/dialog/dialog.tsx:14`                   |
| `data-disabled` | command item                         | `src/command/command.tsx:152`                |
| `data-side`     | popover / dropdown-menu（弹出方向）  | `src/menubar/menubar.tsx:75`                 |
| `data-active`   | navigation-menu                      | `src/navigation-menu/navigation-menu.tsx:85` |

### 4.5 动画类

`animate-in` / `fade-in-*` / `zoom-in-*` / `slide-in-from-*` 等 v3 插件类**由 `tw-animate-css` 提供**（v4 兼容）。

自定义动画**必须**用 `@utility` 声明（[`src/styles.css:73`](../src/styles.css)）：

```css
@utility animate-ripple {
  animation: ripple 0.6s ease-out;
}
```

> ⚠️ **禁止**使用 `tailwindcss-animate`（v3 插件，v4 下不提供这些类）。

### 4.6 深浅色对比类

实现文件中 `dark:` 前缀**必须**指向 `data-theme`（§3.2），**禁止**依赖系统偏好。

```tsx
// ✅ 正例（src/checkbox/checkbox.tsx:21）
default: 'border-gray-400 hover:border-gray-600 hover:bg-accent/20 active:bg-accent/30 dark:border-gray-500 dark:hover:border-gray-300',
```

---

## M. 11 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**。

### 维度 ① 语义 token 必须注册

**扫描命令**：

```bash
# 检查 @theme inline 是否注册了关键语义 token（缺一项 = 违规）
$required = @('primary','primary-foreground','secondary','destructive','success','warning','info','popover','accent','muted','muted-foreground','background','foreground','border','input','ring')
$theme = Get-Content src/styles.css -Raw
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
rg -n -- "--color-gray-\d+:\s*var\(" src/styles.css
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
rg -n -- "--radius-[a-z]+:\s*var\(--radius-" src/styles.css
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
rg -n "@custom-variant dark" src/styles.css
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
$l = (Select-String -Path src/theme-light.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$d = (Select-String -Path src/theme-dark.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
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
/* src/theme-light.css */
--card-hover-shadow: 0 4px 12px hsl(var(--gray-900) / 12%);

/* ✅ 修正 —— 两处都定义 */
```

### 维度 ⑥ 组件引用的变量必须已定义

**扫描命令**：

```bash
$defined = (Select-String -Path src/theme-light.css -Pattern '^\s*(--[a-z0-9-]+)\s*:' -AllMatches).Matches.Groups | Where-Object {$_.Name -eq '1'} | ForEach-Object {$_.Value}
$used = rg -o "var\(--[a-z0-9-]+\)" -g "src/**/*.tsx" --no-filename | ForEach-Object { $_ -replace 'var\(','' -replace '\)','' } | Sort-Object -Unique
# 排除 Radix 运行时注入的变量
$missing = $used | Where-Object { $_ -notin $defined -and $_ -notlike '--radix-*' }
if ($missing) { "MISSING: $($missing -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：变量既不在主题文件、也不是 `--radix-*` 前缀
- ✅ 合规：输出 `OK`

**修正模式**：

```css
/* ❌ 违规 —— src/card/card.tsx 引用了未定义的变量 */
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

**例外**：`src/badge/badge.stories.tsx` 里的 `'#ff00ff'` 是**演示自定义色值**（story 演示 `style` 透传能力），不违规。

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
rg -n "!important" -g "src/**/*.tsx" -g "src/**/*.css"
```

**判定规则**：

- ❌ 违规：出现 `!important`
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

// ✅ 修正（src/button/button.tsx:418-423）—— 只保留动态坐标
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
> （CLI vs Vite 插件），注册其一不影响其二（详见 §1.4）。

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

---

## M+1. 历史基准（2026-10-31 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                                      | 修复前               | 修复后                           |
| ----------------------------------------- | -------------------- | -------------------------------- |
| 33 个语义基类未生成数                     | **32**               | **0**                            |
| 产物中 `prefers-color-scheme` 出现次数    | 1                    | **0**                            |
| 产物中 `data-theme` 出现次数              | 0                    | **203**                          |
| light / dark 变量数                       | 689 / 689            | 689 / 689                        |
| light / dark 变量集合差异                 | 0                    | 0                                |
| 组件引用但未定义的变量                    | **7**                | **0**（3 个由 Radix 运行时注入） |
| `dist/styles.css` 体积                    | 162.8 KB             | 169.7 KB                         |
| **Storybook 侧原子类规则数**              | **0**                | **285**                          |
| **Storybook 侧 `@tailwind` 字面量**       | **1**（`utilities`） | **0**                            |
| **Storybook 侧 `@tailwindcss/vite` 注册** | **未注册**           | **已注册**                       |

### 重测命令

```bash
pnpm build:css
$css = Get-Content dist/styles.css -Raw
Write-Output "prefers-color-scheme: $(([regex]::Matches($css,'prefers-color-scheme')).Count)"
Write-Output "体积: $([math]::Round((Get-Item dist/styles.css).Length/1KB,1)) KB"
```

---

## M+2. 豁免清单

| 对象                                                            | 豁免依据                                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `--radix-popover-trigger-width` 等 3 个变量不在主题文件中       | **Radix 运行时注入**（inline style），真值源见 §3.4                                     |
| `src/badge/badge.stories.tsx` 的 `'#ff00ff'`                    | **演示用途**：story 展示 `style` 属性透传自定义色值的能力，非组件默认样式               |
| `src/card/card.stories.tsx` 的 `'#ff0000'`                      | 同上                                                                                    |
| 组件实现里的 `dark:` 前缀（`src/button/button.tsx:44` 等 7 处） | **存量豁免**：修正后 `dark:` 已对齐 `data-theme`，无需改代码；**新增代码**必须遵循 §3.2 |

---

## M+3. 冲突裁决

| #   | 冲突点                  | 旧规范声明                   | 实际情况                                      | 裁决                                                           |
| --- | ----------------------- | ---------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| C1  | Tailwind 语义类是否可用 | `code-quality.md` 未涉及     | 修复前 32/33 语义基类**未生成 CSS**           | **必须经 `@theme inline` 注册**（本规范 §3.1）                 |
| C2  | `dark:` 的判定依据      | 未涉及                       | Tailwind 默认走 `prefers-color-scheme`        | **必须用 `@custom-variant dark` 对齐 `data-theme`**（§3.2）    |
| C3  | 样式取值方式            | `coding-standards.md` 未涉及 | 实现文件 `var(--xxx)` 752 处 vs 语义类 ~97 处 | **语义类优先，组件私有用 `var(--<component>-<role>)`**（§4.1） |
| C4  | 主题文件的位置          | 原在 `.storybook/css/`       | 属库源码而非 Storybook 专属                   | **迁至 `src/theme-*.css`**，由 `styles.css` `@import`          |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审样式时的**自查**清单（不是任务列表，是合规性自检表）。

### 新增 CSS 变量时

- [ ] `theme-light.css` 与 `theme-dark.css` **两处**都定义，变量名一致
- [ ] 命名符合分类规则（全局语义 / `--gray-*` / `--radius-*` / `<component>-<role>`）
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

- [ ] 维度 ① ~ ⑪ 已全跑（一次跑全库）
- [ ] 主题切换在 `data-theme="light"` 与 `data-theme="dark"` 下都正常
- [ ] `pnpm test` 全绿（类名断言可能因 token 注册而变化）
- [ ] **Storybook 里样式正常**（维度 ⑪ —— 编译器没接管时**构建产物正常但 Storybook 全丢**）

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测新建：① 确立**构建期全量编译**链路（`src/styles.css` → `dist/styles.css`）；② 确立**主题双文件变量集合必须完全一致**（当前各 689 个）；③ 确立 CSS 变量命名三类规则（全局语义 / 灰阶分量 / 组件私有前缀）；④ **新增 §3 三个高危坑**（`@theme inline` token 注册缺失 → 语义类静默失效 / `dark:` 走 `prefers-color-scheme` 与 `data-theme` 冲突 / 组件引用未定义变量），并给出修复后的实测数据；⑤ 确立「语义类优先、组件私有用 `var(--<component>-<role>)`」的选型规则；⑥ 10 项扫描维度全部实跑验证                                                                                              |
| 1.1.0 | 2026-10-31 | **新增坑四 + 维度 ⑪**。实测发现 **Storybook 侧漏注册 `@tailwindcss/vite` 插件** → Vite 把 `src/styles.css` 当普通 CSS 处理 → `@import 'tailwindcss'` 展开的 `@layer utilities { @tailwind utilities; }` 编译期指令**原样保留（inert）** → **零个原子类生成** → Storybook 里所有组件「无边框、无圆角、样式全丢」（而 `pnpm build:css` 产物正常，极易误判为「组件 bug」）。修复：`.storybook/main.ts` 的 `viteFinal` 注册插件。同步新增 §1.4「两条编译路径」、§3.5「层叠层顺序与优先级」（解释为何 preflight 的 `border:0 solid` 不会覆盖 `.border`）、维度 ⑪（同时查构建路径与开发路径）。实测：Storybook 侧类规则 0 → **285**，`@tailwind` 字面量 1 → **0** |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 命名 / 导出 / `cn()`
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试写法与类名断言
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc
- [`code-quality.md`](./code-quality.md) —— lint / type-check / 构建 / 依赖
- [`src/styles.css`](../src/styles.css) —— 样式入口（`@theme inline` / `@custom-variant dark`）
- [`src/theme-light.css`](../src/theme-light.css) / [`src/theme-dark.css`](../src/theme-dark.css) —— 主题变量
