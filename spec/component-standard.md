---
name: component-standard
description: 该规范定义 easbot-ui 组件库的组件开发契约，含目录 4 件套要求（实现 / 测试 / Story / barrel 导出）、目录与文件命名规则、组件命名规则、导出方式（named export + forwardRef + displayName）、props 类型定义（interface + cva 变体联合类型）、cva 变体定义与命名、类名合并（cn）、图标库规范（唯一使用 lucide-react，具名导入，禁止命名空间导入与引入第二图标库）、barrel 导出规范与公开 API 契约、组件实现 11 项扫描维度（每项含 rg / 脚本命令 + 判定规则 + 真实代码反例→正例）、豁免清单与新增组件检查清单。当新增组件、重构组件实现、评审组件代码或检查组件目录完整性时参考。
category: specification
version: 1.1.0
baseline-date: 2026-10-31
tags: [easbot-ui, component, convention, naming, export, cva, forwardref, barrel, code-review]
related:
  - spec-index.md
  - css-standard.md
  - testing-guidelines.md
  - storybook-standard.md
  - code-annotation-standard.md
  - code-quality.md
---

# EASBot UI 组件开发规范 (Component Standard)

> **真值源**：本规范以 `src/` 下 34 个组件目录的实际实现为唯一执行真值（如 [`src/button/button.tsx`](../src/button/button.tsx)、
> [`src/dialog/dialog.tsx`](../src/dialog/dialog.tsx)）；规范与实现冲突时**规范改**（先改规范再改实现，不留双轨）。
>
> **与其它规范的分工**（四者**不重复**）：
>
> | 关注点                              | 归属文档                                                       | 本规范对应章节           |
> | ----------------------------------- | -------------------------------------------------------------- | ------------------------ |
> | CSS 变量 / 主题 / Tailwind 类怎么写 | [`css-standard.md`](./css-standard.md)                         | §3.6（仅类名合并入口）   |
> | 测试怎么写 / 断言 / mock            | [`testing-guidelines.md`](./testing-guidelines.md)             | §2.1（仅目录位置）       |
> | Story 怎么写                        | [`storybook-standard.md`](./storybook-standard.md)             | §2.1（仅目录位置）       |
> | 注释 / JSDoc 怎么写                 | [`code-annotation-standard.md`](./code-annotation-standard.md) | —                        |
> | lint / type-check / 构建 / 依赖     | [`code-quality.md`](./code-quality.md)                         | §4（仅导出与依赖的影响） |
>
> **历史基准**：v1.0.0 锁定 2026-10-31 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本规范定义**一个 React 组件从目录到公开 API** 的完整契约。它回答四个问题：这个组件该长什么样（目录）、叫什么（命名）、
对外暴露什么（导出）、代码怎么封装（实现约定）。

**核心约束**：

- ✅ 每个组件**必须**是自包含目录，**必须**含 4 件套：`实现.tsx` + `测试.test.tsx` + `故事.stories.tsx` + `barrel.ts`
- ✅ 组件实现**必须** named export（`export { X }`），**禁止** `export default`
- ✅ 组件**必须**用 `React.forwardRef` 封装 + 设置 `displayName`
- ✅ props 类型**必须**用 `export interface XxxProps`；变体取值**必须**导出为独立联合类型
- ✅ 样式变体**必须**用 `cva` 定义，常量名**必须**为 `<component>Variants`
- ✅ 类名合并**必须**用 `cn()`（`src/utils/classnames.ts`），**禁止**字符串拼接
- ✅ 组件实现里的 `className` **必须**透传给调用方，且排在 `cn()` 最后一个参数位
- ❌ 禁止在 `src/index.ts` 手工列举导出项（必须用 `export *`）
- ❌ 禁止组件目录内出现与组件名无关的文件（例外：`types.ts` 共享类型）

---

## 1. 目录契约

### 1.1 4 件套（硬性）

每个组件目录**必须**恰好包含以下 4 类文件：

```
src/<component>/
├── <component>.tsx          # 组件实现
├── <component>.test.tsx     # Vitest 单元测试
├── <component>.stories.tsx  # Storybook CSF3 story
└── index.ts                 # 组件级 barrel 导出
```

> **真值源**：34 个组件目录全部满足此结构（§M+1 维度 ① 实测 0 违规）。

### 1.2 命名规则

| 元素              | 规则                                                       | 示例                                          |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------- |
| **目录名**        | kebab-case，**必须**与组件导出名对应（kebab → PascalCase） | `dropdown-menu` → `DropdownMenu`              |
| **实现文件名**    | `<目录名>.tsx`，与目录同名                                 | `src/dropdown-menu/dropdown-menu.tsx`         |
| **测试文件名**    | `<目录名>.test.tsx`                                        | `src/dropdown-menu/dropdown-menu.test.tsx`    |
| **story 文件名**  | `<目录名>.stories.tsx`                                     | `src/dropdown-menu/dropdown-menu.stories.tsx` |
| **hook 组件目录** | `use-` 前缀，文件用 `.tsx`（含 Hook 逻辑）                 | `src/use-toast/use-toast.tsx`                 |
| **共享类型文件**  | `types.ts`（**唯一允许**的额外文件）                       | `src/toast/types.ts`                          |

> ⚠️ **导入不写扩展名**：`import { Button } from './button';` —— `moduleResolution: 'Bundler'` 由 bundler 解析（[`tsconfig.base.json`](../tsconfig.base.json)）。
>
> ⚠️ **`.js` / `.jsx` 禁止**：源码统一 `.ts` / `.tsx`（`tsconfig.base.json` 的 `allowJs: true` 是为消费方构建产物留的，源码目录不使用）。

### 1.3 目录内的例外

| 情况                 | 判定                                                      | 处置                                                                           |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 组件有多个子组件     | 子组件在同一 `.tsx` 内定义（如 `dialog.tsx` 含 9 个导出） | 优先同文件；跨文件时用 `<component>-<part>.tsx`（如 `alert-dialog-modal.tsx`） |
| 组件有跨文件共享类型 | 类型被 `index.ts` 显式重导出（如 `toast/types.ts`）       | 允许 `types.ts`                                                                |
| 组件需要额外文件     | 其他任何文件名                                            | ❌ 违规 —— 除非该文件**同样**具备 test + stories 且纳入 barrel                 |

> 📌 **`alert-dialog-modal.tsx` 是当前唯一的多文件组件目录**，且它**未纳入 barrel 导出**、**无 test / stories** —— 属已知缺口（§M+2 豁免 H2）。

### 1.4 根级目录

```
src/
├── <component>/          # 34 个组件目录
├── utils/classnames.ts   # cn() 工具（唯一 utils）
├── types/css.d.ts        # CSS 模块类型声明
├── styles.css            # Tailwind v4 入口
├── theme-light.css       # 亮色主题变量
├── theme-dark.css        # 暗色主题变量
└── index.ts              # 根 barrel
```

> ⚠️ **`src/utils/` 只允许放 `classnames.ts` 这类跨组件工具**；组件私有逻辑**必须**留在组件目录内。
>
> ⚠️ **`src/types/css.d.ts` 不可删除** —— 它解决 TS2882（CSS side-effect import 无法解析），删除后 `pnpm type-check` 立即失败。

---

## 2. 命名契约

### 2.1 组件命名

| 规则                                   | ✅ 正例          | ❌ 反例         |
| -------------------------------------- | ---------------- | --------------- |
| 组件导出名 = 目录名的 PascalCase 形式  | `DropdownMenu`   | `Dropdownmenu`  |
| 组件名**必须**是名词短语               | `DialogContent`  | `OpenDialogBtn` |
| 子组件用父组件名做前缀                 | `DialogTitle`    | `Title`         |
| Radix 封装的组件**必须**保留原名       | `DialogPortal`   | `Portal`        |
| 多词组件**必须**用完整词，**禁止**缩写 | `NavigationMenu` | `NavMenu`       |

> 📌 **真值源**：[`src/dialog/dialog.tsx:120`](../src/dialog/dialog.tsx) 一次性导出 `Dialog` / `DialogPortal` / `DialogOverlay` / `DialogTrigger` /
> `DialogContent` / `DialogHeader` / `DialogFooter` / `DialogTitle` / `DialogDescription` —— 父名前缀 + Radix 原名保留。

### 2.2 标识符命名

| 元素         | 规则                                     | 示例                           |
| ------------ | ---------------------------------------- | ------------------------------ |
| 组件         | PascalCase                               | `DialogContent`                |
| props 接口   | `<Component>Props`（`export interface`） | `ButtonProps`                  |
| 变体常量     | `<component>Variants`（camelCase）       | `buttonVariants`               |
| 变体联合类型 | `<Component>Variant` / `<Component>Size` | `SelectVariant` / `SelectSize` |
| Hook         | `use` 前缀 + camelCase                   | `useToast`                     |
| 回调 prop    | `on` + 事件名                            | `onLongPress` / `onSwipe`      |
| 布尔 prop    | `is` / `has` / `can` / `enable` 前缀     | `isDisabled` / `enableRipple`  |
| 常量         | UPPER_SNAKE                              | `TOAST_LIMIT`                  |

### 2.3 组件名与变体名的关系

- 变体常量名**必须**是组件名的 camelCase + `Variants` 后缀：`buttonVariants` / `selectVariants` / `dialogContentVariants`
- ⚠️ **例外**：当一个组件有**多个独立的变体组**时，用 `<component><Aspect>Variants`：`dialogContentVariants`（见 [`src/dialog/dialog.tsx:22`](../src/dialog/dialog.tsx)）

---

## 3. 实现契约

### 3.1 导出方式

**必须** named export，**禁止** `export default`。

```tsx
// ✅ 正例（src/dialog/dialog.tsx:120）
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

// ❌ 反例
export default Dialog;
```

> 📌 **真值源**：全库 34 个实现文件 `export default` 命中 **0** 处（§M+1 基线）。
>
> 📌 **唯一允许 `export default` 的地方是 `.stories.tsx`**（Storybook CSF3 要求 `export default meta`）。

### 3.2 forwardRef + displayName

组件**必须**用 `React.forwardRef` 封装，并**必须**设置 `displayName`。

```tsx
// ✅ 正例（src/spinner/spinner.tsx:50, 66）
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({ className, ...props }, ref) => (
  <svg ref={ref} className={cn(spinnerVariants({ size, variant, className }))} {...props} />
));
Spinner.displayName = 'Spinner';
```

```tsx
// ❌ 反例 —— 缺 forwardRef，消费方拿不到 ref
const Spinner = ({ className }: SpinnerProps) => <svg className={className} />;
```

**displayName 的两种合法写法**：

| 场景           | 写法                                                               | 真值源                                                     |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 自研组件       | `Spinner.displayName = 'Spinner';`                                 | [`src/spinner/spinner.tsx:66`](../src/spinner/spinner.tsx) |
| Radix 封装组件 | `DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;` | [`src/dialog/dialog.tsx:20`](../src/dialog/dialog.tsx)     |

**ref 类型的两种合法写法**：

```tsx
// 原生元素
React.forwardRef<HTMLButtonElement, ButtonProps>; // src/button/button.tsx:140
React.forwardRef<SVGSVGElement, SpinnerProps>; // src/spinner/spinner.tsx:50

// Radix 元素
React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>; // src/dialog/dialog.tsx:53
```

> ⚠️ **`use-toast` 是 Hook 不适用 forwardRef** —— 这是唯一豁免（§M+2 豁免 H1）。

### 3.3 props 类型定义

**必须** `export interface XxxProps`。

```tsx
// ✅ 正例（src/button/button.tsx:73）
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** 是否作为子元素渲染 */
  asChild?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
}
```

**必须**：`export interface`（可被 `extends` 扩展，利于消费方做接口合并）。

**允许**：`export type` —— 仅当类型是**纯别名**（无扩展需求）时：

```tsx
// ✅ 正例（src/tooltip/tooltip.tsx:39）—— Radix props 的直通别名
export type TooltipProps = React.ComponentProps<typeof Tooltip>;
```

**Props 字段注解**：每个字段**必须**带中文单行 JSDoc + `@default`（默认值存在时）。

```tsx
// ✅ 正例（src/alert/alert.tsx:55）
/** 是否可关闭 @default false */
closable?: boolean;
```

### 3.4 变体联合类型

若组件的变体取值需要被消费方引用（如 `Select` 的 `variant` 属性），**必须**导出独立联合类型：

```tsx
// ✅ 正例（src/select/select.tsx:71-72）
export type SelectVariant = NonNullable<VariantProps<typeof selectVariants>['variant']>;
export type SelectSize = NonNullable<VariantProps<typeof selectVariants>['size']>;
```

> 📌 **真值源**：`NonNullable<VariantProps<...>['key']>` 是从 cva 定义**派生**的唯一正确写法 —— 手写 `'default' | 'secondary'` 会与 cva 定义漂移（[`src/input/input.tsx:13`](../src/input/input.tsx) 是反例）。

### 3.5 cva 变体定义

**必须**用 `class-variance-authority` 定义样式变体。

```tsx
// ✅ 正例（src/button/button.tsx:28-70）
const buttonVariants = cva('inline-flex items-center justify-center ...', {
  variants: {
    variant: { default: '...', secondary: '...', destructive: '...' },
    size: { default: 'h-10 px-4 py-2 text-sm', sm: 'h-9 px-3 rounded-md text-xs' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
```

**规则**：

| #   | 规则                                                                           | 真值源                                               |
| --- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 1   | 常量名**必须** `<component>Variants`（多组时 `<component><Aspect>Variants`）   | §2.3                                                 |
| 2   | **必须**声明 `defaultVariants`                                                 | `src/button/button.tsx:65`                           |
| 3   | `variants` 的键**必须**是 `variant` / `size`（可扩展 `rounded` / `maximized`） | `src/badge/badge.tsx:51`、`src/dialog/dialog.tsx:35` |
| 4   | 变体值**必须**是**字符串**或**字符串数组**（**禁止**函数式）                   | `src/select/select.tsx:32-49`                        |
| 5   | 基础样式**必须**是字符串或字符串数组（数组用 `.join(' ')`）                    | `src/alert/alert.tsx:23-30`                          |
| 6   | 组件**必须**把 `className` 透传给 cva（或 `cn()`）                             | §3.6                                                 |

> ⚠️ **变体键命名**：值**必须**用小写单词（`default` / `secondary` / `destructive` / `outline` / `ghost` / `link` / `success` / `warning` / `info` / `error`）。
> 尺寸**必须**用 `default` / `sm` / `md` / `lg` / `xl` / `icon` 等语义档位，**禁止** `small` / `medium` / `large` 混用。

### 3.6 类名合并（cn）

**必须**用 `cn()`，**禁止**字符串拼接。

```tsx
// ✅ 正例（src/button/button.tsx:378）
className={cn(buttonVariants({ variant, size: finalSize, className }), 'relative overflow-hidden')}

// ✅ 正例 —— 条件对象式（src/select/select.tsx:323）
cn('text-sm font-medium leading-none', { 'cursor-not-allowed opacity-70': disabled, 'text-destructive': error })
```

**`className` 透传规则**（**必须**遵守）：

| #   | 规则                                                                | 真值源                       |
| --- | ------------------------------------------------------------------- | ---------------------------- |
| 1   | `className` **必须**从 props 解构出来，**不得**留在 `...props` 里   | `src/button/button.tsx:143`  |
| 2   | `className` **必须**出现在 `cn()` 的调用链中                        | §M 维度 ⑤                    |
| 3   | **必须**允许调用方的 `className` 覆盖组件默认样式（`twMerge` 保证） | `src/utils/classnames.ts:15` |
| 4   | 组件内部追加的类名放在 `className` **之后**（保证调用方优先级更高） | `src/button/button.tsx:378`  |

> ⚠️ **`cloneElement` 时**同样**必须**保留调用方的 `className`（[`src/textarea/textarea.tsx`](../src/textarea/textarea.tsx) 已修复）。

### 3.7 属性透传

**必须**把未消费的 props 透传给根元素。

```tsx
// ✅ 正例（src/dialog/dialog.tsx:59-62）
<DialogPrimitive.Content
  ref={ref}
  className={cn(dialogContentVariants({...}), className)}
  {...props}
/>
```

**无障碍要求**：

| #   | 规则                                                                              | 真值源                                        |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------- |
| 1   | 交互元素**必须**键盘可达                                                          | `src/dialog/dialog.tsx:67`（`type="button"`） |
| 2   | 可点击的非语义元素**必须**补 `role` / `tabIndex` / `onKeyDown`                    | `src/select/select.tsx:337-340`               |
| 3   | 装饰性图标**必须** `aria-hidden="true"`                                           | `src/button/button.tsx:394`                   |
| 4   | 状态**必须**通过 `aria-*` 暴露（`aria-disabled` / `aria-busy` / `aria-selected`） | `src/button/button.tsx:177-182`               |

### 3.7.1 图标库：**唯一使用 `lucide-react`**

本库**统一使用 [`lucide-react`](https://lucide.dev) 作为图标库**，**不引入**其他图标库
（`react-icons` / `@heroicons/react` / `iconify` 等）。

| #   | 规则                                                                                                                          | 真值源                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | **必须**从 `lucide-react` **直接具名导入**图标组件                                                                            | `src/button/button.tsx:24`（`Loader2`）      |
| 2   | ❌ **禁止** `import * as Icons from 'lucide-react'` 后动态取用（全量打包 + 丢失 tree-shaking）                                | —                                            |
| 3   | ❌ **禁止**把图标**内联复制**为 SVG path（本库已有唯一图标源）                                                                | —                                            |
| 4   | 图标**必须**通过 props 透传给调用方（`icon` / `prefix` / `suffix` 槽位），**不写死**在组件内部                                | `src/input/input.tsx`（`prefix` / `suffix`） |
| 5   | 图标**必须**加 `aria-hidden="true"`（装饰性）或 `aria-label`（语义性）                                                        | `src/button/button.tsx:394`                  |
| 6   | 图标尺寸**必须**用 `size` prop 或 `className` 的 `h-*` / `w-*` 控制，**禁止**写死 `width` / `height` 属性                     | `src/alert/alert.tsx`                        |
| 7   | 图标颜色**必须**走 CSS 变量（`currentColor` / `text-primary`），**禁止**硬编码                                                | —                                            |
| 8   | ❌ **禁止**把 `lucide-react` 的图标**从 `src/index.ts` 根 barrel 再导出** —— 消费方应直接从 `lucide-react` 导入，避免二次包装 | `src/index.ts`（**无** lucide 导出）         |

> 📌 **依赖分区**：`lucide-react` 在 **`dependencies`**（不是 `peerDependencies`）
> —— 组件的默认图标是**库的运行时行为**，消费方无需自行安装。
> 同时它**必须**在 `tsup.config.ts` 的 `external` 列表里（已配置），
> 避免被打进 bundle 导致图标重复。
>
> 📌 **不设独立图标文档** —— 图标相关规则**只在本节**维护；
> `css-standard.md` / `storybook-standard.md` 不重复定义图标规范。

### 3.8 barrel 导出

**组件级** `src/<component>/index.ts`：

```tsx
// ✅ 正例（src/button/index.ts:1-7）
export * from './button';
export type { ButtonProps, SwipeDirection, PressureSensitiveConfig } from './button';
```

| #   | 规则                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **必须** `export * from './<component>';`                                                                                    |
| 2   | **必须**额外 `export type { ... } from './<component>';` 显式重导出类型（`export *` 已含类型，此行是**类型契约的显式声明**） |
| 3   | 类型来自 `types.ts` 时，`export type` **必须**指向 `./types`                                                                 |
| 4   | ❌ **禁止** `declare module` 模块增强声明（本仓库**无**该模式，见 §M+2 豁免 H3）                                             |

**根级** `src/index.ts`：

```tsx
// ✅ 正例（src/index.ts:3-36）—— 按字母序，一行一个
export * from './alert';
export * from './alert-dialog';
export * from './avatar';
// ...
export * from './use-toast';
```

| #   | 规则                                                             |
| --- | ---------------------------------------------------------------- |
| 1   | **必须**用 `export * from './<dir>';`                            |
| 2   | **必须**按目录名字母序排列                                       |
| 3   | ❌ **禁止**手工列举导出项（`export { Button } from './button'`） |
| 4   | **必须**在新增组件目录的**同一提交**内更新                       |

### 3.9 公开 API 契约

组件的 **props / 导出名 / DOM 结构** 属于**公开 API**。变更**必须**走：

1. 更新 `README.md` + `README.en.md`（导出清单）
2. 更新 `CHANGELOG.md`
3. `pnpm version:patch|minor|major`（版本 bump）

> 📌 **破坏性变更**（删导出 / 改 props 类型 / 改 DOM 结构）**必须**走 `minor` 或 `major`，**禁止**用 `patch`。

---

## 4. 依赖与构建影响

### 4.1 新增依赖时

| #   | 规则                                                              | 验证                                |
| --- | ----------------------------------------------------------------- | ----------------------------------- |
| 1   | 源码 `import` 的包**必须**在 `dependencies` 或 `peerDependencies` | `code-quality.md` §M 维度 ⑨         |
| 2   | Radix primitives → `peerDependencies` + `optional`                | `package.json#peerDependenciesMeta` |
| 3   | `react` / `react-dom` → **只能**在 `peerDependencies`             | `package.json#peerDependencies`     |

### 4.2 CSS 变量依赖

组件用到的 CSS 变量**必须**在 `src/theme-light.css` 与 `src/theme-dark.css` **两处**同步定义。

> 📌 **详细规则与扫描命令见 [`css-standard.md`](./css-standard.md)** —— 本规范不重复。

---

## M. 11 项扫描维度（评审必跑）

> **目的**：新增 / 修改组件前**必须**跑的检查。本节是**验证契约**（不是任务清单，是自动扫描器的手册）。
>
> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**（按组件分批扫描必然漏）。

### 维度 ① 组件 4 件套完整性

**扫描命令**：

```bash
# 列出缺件套的组件目录（空 = 全部齐全）
Get-ChildItem src -Directory | Where-Object {$_.Name -notin @('types','utils')} | ForEach-Object {
  $d = $_.Name
  $miss = @()
  if (-not (Test-Path "src/$d/$d.tsx")) { $miss += 'impl' }
  if (-not (Test-Path "src/$d/$d.test.tsx")) { $miss += 'test' }
  if (-not (Test-Path "src/$d/$d.stories.tsx")) { $miss += 'story' }
  if (-not (Test-Path "src/$d/index.ts")) { $miss += 'index' }
  if ($miss) { "$d -> MISSING: $($miss -join ',')" }
}
```

**判定规则**：

- ❌ 违规：任一组件目录缺 `impl` / `test` / `story` / `index` 任一项
- ✅ 合规：输出为空

**修正模式**：

```bash
# ❌ 违规：新建了 src/date-picker/date-picker.tsx，但没建 test / stories / index
# ✅ 修正：补齐 3 个文件，并在 src/index.ts 加一行 export
```

### 维度 ② 实现文件禁止 `export default`

**扫描命令**：

```bash
rg -n "^export default" -g "src/*/*.tsx" -g "!*stories.tsx"
```

**判定规则**：

- ❌ 违规：实现文件出现 `export default`
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规（src/<component>/<component>.tsx）
export default Dialog;

// ✅ 修正
export { Dialog, DialogContent, DialogTitle };
```

### 维度 ③ `forwardRef` 必须配 `displayName`

**扫描命令**：

```bash
# 列出用了 forwardRef 但没设 displayName 的文件（空 = 合规）
Get-ChildItem src -Recurse -Filter "*.tsx" |
  Where-Object {$_.Name -notlike "*.stories.tsx" -and $_.Name -notlike "*.test.tsx"} |
  ForEach-Object {
    $t = Get-Content $_.FullName -Raw
    if ($t -match 'forwardRef' -and $t -notmatch 'displayName\s*=') { $_.FullName }
  }
```

**判定规则**：

- ❌ 违规：文件含 `forwardRef` 但无 `displayName =`
- ✅ 合规：输出为空

**修正模式**：

```tsx
// ❌ 违规
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <button ref={ref} {...props} />
));

// ✅ 修正
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <button ref={ref} {...props} />
));
Button.displayName = 'Button';
```

### 维度 ④ cva 常量命名

**扫描命令**：

```bash
rg -n "^const \w+ = cva\(" -g "src/**/*.tsx" | Where-Object { $_ -notmatch "Variants = cva\(" }
```

**判定规则**：

- ❌ 违规：cva 常量名不以 `Variants` 结尾
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规（src/navigation-menu/navigation-menu.tsx:54）
const navigationMenuTriggerStyle = cva('...');

// ✅ 修正
const navigationMenuTriggerVariants = cva('...');
```

### 维度 ⑤ `className` 必须透传

**扫描命令**：

```bash
# 列出含 forwardRef 但未解构 className 的文件（空 = 合规）
Get-ChildItem src -Recurse -Filter "*.tsx" |
  Where-Object {$_.Name -notlike "*.stories.tsx" -and $_.Name -notlike "*.test.tsx"} |
  ForEach-Object {
    $t = Get-Content $_.FullName -Raw
    if ($t -match 'forwardRef' -and $t -notmatch 'className\s*[,}]' -and $t -notmatch 'className\s*,') { $_.FullName }
  }
```

**判定规则**：

- ❌ 违规：`forwardRef` 组件未解构 `className` → 调用方的类名被丢弃
- ✅ 合规：输出为空

**修正模式**：

```tsx
// ❌ 违规 —— props.className 被 {...props} 透传，cn() 拿不到
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <button ref={ref} className={buttonVariants({ variant: props.variant })} {...props} />
));

// ✅ 修正（src/button/button.tsx:140-143）
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, className }))} {...props} />
  ),
);
```

### 维度 ⑥ 组件级 barrel 必须显式导出类型

**扫描命令**：

```bash
# 列出缺 export type 的组件级 index.ts（空 = 合规）
Get-ChildItem src -Directory | Where-Object {$_.Name -notin @('types','utils')} | ForEach-Object {
  $f = "src/$($_.Name)/index.ts"
  if (-not (Select-String -Path $f -Pattern "export type" -Quiet)) { $f }
}
```

**判定规则**：

- ❌ 违规：组件级 `index.ts` 无 `export type` 行 → 类型契约不显式
- ✅ 合规：输出为空

**修正模式**：

```tsx
// ❌ 违规（src/menubar/index.ts）
export * from './menubar';

// ✅ 修正
export * from './menubar';
export type { MenubarProps, MenubarTriggerProps, MenubarContentProps } from './menubar';
```

### 维度 ⑦ 根 barrel 必须导出全部组件

**扫描命令**：

```bash
# 列出未被根 index.ts 导出的组件目录（空 = 合规）
$dirs = Get-ChildItem src -Directory | Where-Object {$_.Name -notin @('types','utils')} | ForEach-Object {$_.Name}
$idx = Get-Content src/index.ts -Raw
$dirs | Where-Object { $idx -notmatch "'./$_'" } | ForEach-Object { "MISSING in src/index.ts: $_" }
```

**判定规则**：

- ❌ 违规：组件目录未在根 `src/index.ts` 出现 → 消费方拿不到
- ✅ 合规：输出为空

**修正模式**：

```ts
// ❌ 违规 —— 新增了 src/date-picker/ 但没加进 barrel
// ✅ 修正（src/index.ts，按字母序插入）
export * from './date-picker';
```

### 维度 ⑧ 禁止 `React.FC` / `FunctionComponent`

**扫描命令**：

```bash
rg -n "React\.FC|React\.FunctionComponent" -g "src/**/*.tsx"
```

**判定规则**：

- ❌ 违规：使用 `React.FC` / `React.FunctionComponent`
- ✅ 合规：0 命中

**理由**：`React.FC` 的隐式 `children` 与 React 19 的类型变化存在冲突，且无法表达 `forwardRef` 的 ref 类型。

**修正模式**：

```tsx
// ❌ 违规
const Spinner: React.FC<SpinnerProps> = ({ className }) => <svg className={className} />;

// ✅ 修正（src/spinner/spinner.tsx:50）
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({ className, ...props }, ref) => (
  <svg ref={ref} className={cn(spinnerVariants({ className }))} {...props} />
));
Spinner.displayName = 'Spinner';
```

### 维度 ⑨ props 接口必须是 `export interface`

**扫描命令**：

```bash
rg -n "^export type \w+Props" -g "src/**/*.tsx"
```

**判定规则**：

- ❌ **违规**：组件的主 props 类型用 `export type` 定义 **且** 其它地方需要 `extends` 它
- ✅ **合规**：`export type XxxProps = React.ComponentProps<typeof Xxx>` 这类**纯别名**（无扩展需求）
- ✅ **合规**：`export interface XxxProps extends ...`

**判定细则**：

| 形态                                                          | 判定 | 真值源                                          |
| ------------------------------------------------------------- | ---- | ----------------------------------------------- |
| `export interface XxxProps extends React.HTMLAttributes<...>` | ✅   | `src/button/button.tsx:73`                      |
| `export type XxxProps = React.ComponentProps<typeof Xxx>`     | ✅   | `src/tooltip/tooltip.tsx:39`                    |
| `export type XxxProps = ((A & B) \| (C & D)) & { ... }`       | ✅   | `src/card/card.tsx:47`（判别联合，必须用 type） |
| `export type XxxProps = { ... }`（手写对象字面量）            | ❌   | —                                               |

**修正模式**：

```tsx
// ❌ 违规
export type ButtonProps = {
  variant?: 'default' | 'secondary';
  className?: string;
};

// ✅ 修正
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** 是否作为子元素渲染 */
  asChild?: boolean;
}
```

### 维度 ⑩ `className` 必须排在 `cn()` 末位

**扫描命令**：

```bash
# 列出把 className 放在 cn() 中间位置的用法（空 = 合规）
rg -n "cn\(className," -g "src/**/*.tsx"
```

**判定规则**：

- ❌ 违规：`cn(className, ...)` —— 调用方类名在前，组件默认类在后 → 调用方**无法覆盖**组件默认样式
- ✅ 合规：`cn(组件默认类, className)`

**修正模式**：

```tsx
// ❌ 违规
className={cn(className, 'flex items-center')}

// ✅ 修正（src/dialog/dialog.tsx:61）
className={cn(dialogContentVariants({ size, variant }), className)}
```

> 📌 `twMerge` 会按**后出现**的类覆盖冲突项 —— `cn()` 的参数顺序即优先级顺序（[`src/utils/classnames.ts:15`](../src/utils/classnames.ts)）。

### 维度 ⑪ 图标库必须是 `lucide-react`

**扫描命令**：

```bash
# ① 禁止引入其他图标库（react-icons / heroicons / iconify / feather 等）
rg -n "from ['\"](react-icons|@heroicons|@iconify|feather-icons|react-feather)['\"]" -g "src/**/*.tsx"

# ② 禁止命名空间导入（丢失 tree-shaking + 全量打包）
rg -n "import\s+\*\s+as\s+\w+\s+from\s+['\"]lucide-react['\"]" -g "src/**/*.tsx"

# ③ 根 barrel 不得再导出 lucide 图标（消费方应直接从 lucide-react 导入）
rg -n "lucide" src/index.ts

# ④ lucide-react 必须在 dependencies + tsup external
Select-String -Path package.json -Pattern '"lucide-react"' | ForEach-Object { "deps: " + $_.Line.Trim() }
Select-String -Path tsup.config.ts -Pattern "'lucide-react'" | ForEach-Object { "external: OK" }
```

**判定规则**：

- ❌ 违规 1：引入了 `lucide-react` **以外**的图标库
- ❌ 违规 2：`import * as Icons from 'lucide-react'` 命名空间导入
- ❌ 违规 3：`src/index.ts` 里出现 `lucide`
- ❌ 违规 4：`lucide-react` 不在 `dependencies` 或不在 `tsup.config.ts` 的 `external`
- ✅ 合规：四条均 0 命中（依赖项两条各有 1 命中）

**修正模式**：

```tsx
// ❌ 违规 —— 命名空间导入，全量打包
import * as Icons from 'lucide-react';
const icon = Icons[name];

// ❌ 违规 —— 引入第二个图标库
import { FaBell } from 'react-icons/fa';

// ✅ 修正（src/button/button.tsx:24）—— 具名导入
import { Loader2 } from 'lucide-react';
```

---

## M+1. 历史基准（2026-10-31 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                               | 数值                             |
| ---------------------------------- | -------------------------------- |
| 组件目录数                         | 34                               |
| 4 件套齐全率                       | 34/34（100%）                    |
| 测试文件数 / 用例数                | 34 / 254                         |
| Storybook stories 数               | 237（34 个 stories 文件）        |
| 实现文件 `export default` 命中     | 0                                |
| `forwardRef` 使用率                | 33/34（`use-toast` 豁免）        |
| `cva` 使用的组件数                 | 19                               |
| `cn()` 使用的实现文件数            | 33/34（`use-toast` 豁免）        |
| 主题 CSS 变量数（light / dark）    | 689 / 689（集合完全一致）        |
| 实现文件中 `var(--xxx)` 任意值引用 | 752 处                           |
| 实现文件中 Tailwind 语义类引用     | ~97 处（详见 `css-standard.md`） |

### 重测命令

```bash
# 组件数与 4 件套
Get-ChildItem src -Directory | Where-Object {$_.Name -notin @('types','utils')} | Measure-Object
# 用例数
rg -c "^\s*(it|test)\(" -g "src/**/*.test.tsx" | Measure-Object
```

---

## M+2. 豁免清单

| 对象                                                              | 豁免依据                                                                                                                                                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/use-toast/use-toast.tsx` 不使用 forwardRef / `cn()`          | 该目录导出的是 **Hook**（`useToast`）与状态函数（`toast`），不渲染 DOM，无 ref 与类名可言                                                                                                          |
| `src/alert-dialog/alert-dialog-modal.tsx` 未纳入 barrel（维度 ⑦） | **已知缺口**：`AlertDialogModal` 已实现（`src/alert-dialog/alert-dialog-modal.tsx:39`）但 `src/alert-dialog/index.ts:1-2` 未导出，且该文件无 test / stories。补齐需单独排期，不在本次规范重建范围  |
| `src/button/index.ts` 的 `declare module` 增强（§3.8 规则 4）     | **存量豁免**：该增强声明的 `swipeThreshold` / `pressureConfig` 字段在实现（`src/button/button.tsx:73-96`）中**不存在** —— 是**类型契约与实现不一致的真实缺陷**，已登记待修。新增组件**禁止**此模式 |

---

## M+3. 冲突裁决

| #   | 冲突点           | 旧规范声明                                                    | 实际情况                                         | 裁决                                            |
| --- | ---------------- | ------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| C1  | 组件目录结构     | `spec-index.md` 未定义                                        | 34 个组件全部是「实现 + test + stories + index」 | **4 件套为硬性契约**（本规范 §1.1）             |
| C2  | 导出方式         | `coding-standards.md` 写「具名导出优先，不用 default export」 | 实现文件 0 处 `export default`                   | **named export 为硬性要求**（本规范 §3.1）      |
| C3  | `data-slot` 属性 | 未提及                                                        | 全库 **0 处** 使用                               | **不引入** `data-slot`（保持与 Radix 惯例一致） |
| C4  | 变体联合类型来源 | 未提及                                                        | `src/input/input.tsx:13` 手写联合类型            | **必须从 cva 派生**（本规范 §3.4）              |
| C5  | 主题变量命名     | `code-quality.md` 未覆盖                                      | 组件私有变量用 `<component>-<role>` 前缀         | **归 `css-standard.md`**                        |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审组件时的**自查**清单（不是任务列表，是合规性自检表）。

### 新增组件 `<component>` 时

- [ ] 目录 `src/<component>/` 下有 4 件套（实现 / test / stories / index）
- [ ] 实现用 named export + `React.forwardRef` + `displayName`
- [ ] props 用 `export interface <Component>Props extends ...`
- [ ] 样式变体用 `cva`，常量名 `<component>Variants`，且声明了 `defaultVariants`
- [ ] `className` 已解构并透传，放在 `cn()` 末位
- [ ] 用到的 CSS 变量已在 `theme-light.css` 与 `theme-dark.css` **两处**定义
- [ ] `src/index.ts` 已按字母序加 `export * from './<component>';`
- [ ] 测试覆盖渲染 / 状态 / 交互 / 无障碍四类；Story 覆盖各变体与尺寸

### 评审组件时

- [ ] 维度 ① ~ ⑪ 已全跑（一次跑全库，非按组件分批）
- [ ] 新增的 `export` 已同步 `README.md` + `README.en.md`
- [ ] 破坏性变更走了 `minor` / `major` 版本 bump

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测重建：① 原 `coding-standards.md`（easbot monorepo 残留，含 Zod strict / NamedError / 22 包 workspace 体系）**重命名并重写**为组件库口径的 `component-standard.md`；② 确立**组件 4 件套**为硬性契约；③ 确立 named export / forwardRef + displayName / `export interface` props / cva 派生联合类型 / `cn()` 末位透传 五条实现契约；④ 10 项扫描维度全部实跑验证（命令可一键复跑）；⑤ 豁免清单 4 条（含 2 条真实缺口登记：`alert-dialog-modal` 未导出、`button/index.ts` 幽灵字段增强） |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`css-standard.md`](./css-standard.md) —— CSS 变量 / 主题 / token / Tailwind 用法
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试写法与断言
- [`storybook-standard.md`](./storybook-standard.md) —— Story 写法与装饰器
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc
- [`code-quality.md`](./code-quality.md) —— lint / type-check / 构建 / 依赖
- [`src/utils/classnames.ts`](../src/utils/classnames.ts) —— `cn()` 实现
