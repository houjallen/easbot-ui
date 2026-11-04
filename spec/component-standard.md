---
name: component-standard
description: 该规范定义 easbot-ui 组件库的组件开发契约，含目录结构要求（实现 / __tests__ 测试与 Story / barrel 导出）、目录与文件命名规则、组件命名规则、导出方式（named export + forwardRef + displayName）、props 类型定义（interface + cva 变体联合类型）、cva 变体定义与命名、类名合并（cn）、类型导入显式化（import type，verbatimModuleSyntax）、图标库规范（唯一使用 lucide-react，具名导入，禁止命名空间导入与引入第二图标库）、barrel 导出规范与公开 API 契约、组件实现 12 项扫描维度（每项含 rg / 脚本命令 + 判定规则 + 真实代码反例→正例）、豁免清单与新增组件检查清单。当新增组件、重构组件实现、评审组件代码或检查组件目录完整性时参考。
category: specification
version: 2.2.0
baseline-date: 2026-11-05
tags: [easbot-ui, component, convention, naming, export, cva, forwardref, barrel, code-review]
related:
  - spec-index.md
  - css-standard.md
  - component-api-standard.md
  - a11y-interaction-standard.md
  - react-performance-standard.md
  - testing-guidelines.md
  - storybook-standard.md
  - code-annotation-standard.md
  - code-quality.md
---

# EASBot UI 组件开发规范 (Component Standard)

> **真值源**：本规范以 `src/ui/` 下 **56 个组件目录**的实际实现为唯一执行真值
> （如 [`src/ui/button/button.tsx`](../src/ui/button/button.tsx)、
> [`src/ui/dialog/dialog.tsx`](../src/ui/dialog/dialog.tsx)）；
> 规范与实现冲突时**规范改**（先改规范再改实现，不留双轨）。
>
> **与其它规范的分工**（四者**不重复**）：
>
> | 关注点                              | 归属文档                                                       | 本规范对应章节           |
> | ----------------------------------- | -------------------------------------------------------------- | ------------------------ |
> | CSS 变量 / 主题 / Tailwind 类怎么写 | [`css-standard.md`](./css-standard.md)                         | §3.6（仅类名合并入口）   |
> | 测试怎么写 / 断言 / mock            | [`testing-guidelines.md`](./testing-guidelines.md)             | §1.1（仅目录位置）       |
> | Story 怎么写                        | [`storybook-standard.md`](./storybook-standard.md)             | §1.1（仅目录位置）       |
> | 注释 / JSDoc 怎么写                 | [`code-annotation-standard.md`](./code-annotation-standard.md) | —                        |
> | lint / type-check / 构建 / 依赖     | [`code-quality.md`](./code-quality.md)                         | §4（仅导出与依赖的影响） |
>
> **历史基准**：v2.0.0 锁定 2026-11-01 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本规范定义**一个 React 组件从目录到公开 API** 的完整契约。它回答四个问题：这个组件该长什么样（目录）、叫什么（命名）、
对外暴露什么（导出）、代码怎么封装（实现约定）。

**核心约束**：

- ✅ 每个组件**必须**是 `src/ui/` 下的自包含目录，**必须**含：实现 `.tsx` + `__tests__/` 子目录 + `index.ts` barrel
- ✅ 组件实现**必须** named export（`export { X }`），**禁止** `export default`
- ✅ 组件**必须**用 `React.forwardRef` 封装 + 设置 `displayName`
- ✅ props 类型**必须**用 `export interface XxxProps`；变体取值**必须**导出为独立联合类型
- ✅ 样式变体**必须**用 `cva` 定义，常量名**必须**为 `<component>Variants`
- ✅ 类名合并**必须**用 `cn()`（`src/utils/classnames.ts`），**禁止**字符串拼接
- ✅ 组件实现里的 `className` **必须**透传给调用方，且排在 `cn()` 最后一个参数位
- ✅ 类型导入**必须**显式 `import type`（`verbatimModuleSyntax` 开启，否则 TS1484）
- ❌ 禁止在 `src/index.ts` 手工列举导出项（必须用 `export *`）
- ❌ 禁止使用 `@/` 路径别名（必须用相对路径）
- ❌ 禁止组件目录内出现与组件名无关的文件（例外：`types.ts` 共享类型）

---

## 1. 目录契约

### 1.1 目录结构（硬性）

每个组件目录**必须**包含以下内容：

```
src/ui/<component>/
├── <component>.tsx          # 组件实现
├── __tests__/
│   ├── <component>.test.tsx     # Vitest 单元测试
│   └── <component>.stories.tsx  # Storybook CSF3 story
└── index.ts                 # 组件级 barrel 导出
```

> 📌 **测试与 Story 一律放在 `__tests__/` 子目录** —— 与组件源码分离，避免实现与测试代码混杂。
> 该约定由 `src/ui/**/__tests__/` 与 `src/design-system/components/ui/__tests__/` 全库统一遵守。

> ⚠️ **测试与 Story 是「应该存在」而非「必须存在」** —— 部分组件仅有 story 无 test
> （如 `accordion` / `calendar` / `carousel` / `chart` / `icon` / `pagination` / `resizable` /
> `sidebar` / `tag` / `typography` / `aspect-ratio` / `breadcrumb` / `collapsible` / `context-menu` / `drawer`）。
> 缺口登记见 `spec-index.md` §「已知缺口」。

### 1.2 命名规则

| 元素              | 规则                                                       | 示例                                                       |
| ----------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| **目录名**        | kebab-case，**必须**与组件导出名对应（kebab → PascalCase） | `dropdown-menu` → `DropdownMenu`                           |
| **实现文件名**    | `<目录名>.tsx`，与目录同名                                 | `src/ui/dropdown-menu/dropdown-menu.tsx`                   |
| **测试文件名**    | `<目录名>.test.tsx`，置于 `__tests__/` 下                  | `src/ui/dropdown-menu/__tests__/dropdown-menu.test.tsx`    |
| **story 文件名**  | `<目录名>.stories.tsx`，置于 `__tests__/` 下               | `src/ui/dropdown-menu/__tests__/dropdown-menu.stories.tsx` |
| **hook 组件目录** | `use-` 前缀，文件用 `.tsx`（含 Hook 逻辑）                 | `src/ui/use-toast/use-toast.tsx`                           |
| **共享类型文件**  | `types.ts`（**唯一允许**的额外文件）                       | `src/ui/toast/types.ts`                                    |

> ⚠️ **导入不写扩展名**：`import { Button } from './button';` —— `moduleResolution: 'Bundler'` 由 bundler 解析（[`tsconfig.base.json`](../tsconfig.base.json)）。
>
> ⚠️ **`.js` / `.jsx` 禁止**：源码统一 `.ts` / `.tsx`（`tsconfig.base.json` 的 `allowJs: true` 是为消费方构建产物留的，源码目录不使用）。

### 1.3 目录内的例外

| 情况                 | 判定                                                                   | 处置                                                                           |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 组件有多个子组件     | 子组件在同一 `.tsx` 内定义（如 `dialog.tsx` 含 9 个导出）              | 优先同文件；跨文件时用 `<component>-<part>.tsx`（如 `alert-dialog-modal.tsx`） |
| 组件有跨文件共享类型 | 类型被 `index.ts` 显式重导出（如 `toast/types.ts`）                    | 允许 `types.ts`                                                                |
| 组件有内部子目录     | 组件私有逻辑按职责分层（如 `date/hooks/` `date/locale/` `date/view/`） | 允许，但子目录**不得**有自己的 barrel 以外的顶层导出                           |
| 组件需要额外文件     | 其他任何文件名                                                         | ❌ 违规 —— 除非该文件**同样**具备 test + stories 且纳入 barrel                 |

> 📌 **`alert-dialog-modal.tsx` 是当前唯一的多文件组件目录**，且它**未纳入 barrel 导出**、**无 test / stories** —— 属已知缺口（§M+2 豁免 H2）。

### 1.4 根级目录

```
src/
├── index.ts              # 公开 API 出口（tsup 唯一构建入口）
├── ui/                   # 公开组件层（56 个组件目录）
├── design-system/        # 基础实现层（46 个组件 + Provider + hooks + lib）
├── models/               # 数据契约层（Zod Schema）
├── utils/                # 通用工具层（classnames / object / locale / error / validation-rule …）
├── hooks/                # 通用 React Hook（useDevice / useLocale）
├── providers/            # 上下文 Provider（LocaleProvider）
├── theme/                # 主题资源层（唯一 CSS 入口 / 字体 / 主题 CSS / tokens）
│   ├── styles.css            # ⭐ Tailwind v4 唯一编译入口
│   └── themes/               #   light.css（706 个）/ dark.css（706 个）
├── types/                # 类型声明（typings.d.ts）
```

> ⚠️ **`src/utils/` 只允许放跨组件工具**；组件私有逻辑**必须**留在组件目录内。
>
> ⚠️ **`src/types/typings.d.ts` 不可删除** —— 它解决 TS2882（CSS side-effect import 无法解析），删除后 `pnpm type-check` 立即失败。

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

> 📌 **真值源**：[`src/ui/dialog/dialog.tsx:120`](../src/ui/dialog/dialog.tsx) 一次性导出 `Dialog` / `DialogPortal` / `DialogOverlay` / `DialogTrigger` /
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
- ⚠️ **例外**：当一个组件有**多个独立的变体组**时，用 `<component><Aspect>Variants`：`dialogContentVariants`（见 [`src/ui/dialog/dialog.tsx:22`](../src/ui/dialog/dialog.tsx)）

---

## 3. 实现契约

### 3.1 导出方式

**必须** named export，**禁止** `export default`。

```tsx
// ✅ 正例（src/ui/dialog/dialog.tsx:120）
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

> 📌 **真值源**：`src/ui/**` 实现文件 `export default` 命中 **0** 处（§M+1 基线）。
>
> 📌 **唯一允许 `export default` 的地方是 `.stories.tsx`**（Storybook CSF3 要求 `export default meta`）。
>
> 📌 **存量豁免**：`src/design-system/index.tsx` 的 `export default DesignSystemProvider` —— 见 §M+2 H4。

### 3.2 forwardRef + displayName

组件**必须**用 `React.forwardRef` 封装，并**必须**设置 `displayName`。

```tsx
// ✅ 正例（src/ui/spinner/spinner.tsx:50, 66）
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

| 场景           | 写法                                                               | 真值源                                                           |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 自研组件       | `Spinner.displayName = 'Spinner';`                                 | [`src/ui/spinner/spinner.tsx:66`](../src/ui/spinner/spinner.tsx) |
| Radix 封装组件 | `DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;` | [`src/ui/dialog/dialog.tsx:20`](../src/ui/dialog/dialog.tsx)     |

**ref 类型的两种合法写法**：

```tsx
// 原生元素
React.forwardRef<HTMLButtonElement, ButtonProps>; // src/ui/button/button.tsx:140
React.forwardRef<SVGSVGElement, SpinnerProps>; // src/ui/spinner/spinner.tsx:50

// Radix 元素
React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>; // src/ui/dialog/dialog.tsx:53
```

> ⚠️ **`use-toast` 是 Hook 不适用 forwardRef** —— 这是唯一豁免（§M+2 豁免 H1）。

### 3.3 props 类型定义

**必须** `export interface XxxProps`。

```tsx
// ✅ 正例（src/ui/button/button.tsx:73）
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
// ✅ 正例（src/ui/tooltip/tooltip.tsx:39）—— Radix props 的直通别名
export type TooltipProps = React.ComponentProps<typeof Tooltip>;
```

**Props 字段注解**：每个字段**必须**带中文单行 JSDoc + `@default`（默认值存在时）。

```tsx
// ✅ 正例（src/ui/alert/alert.tsx:55）
/** 是否可关闭 @default false */
closable?: boolean;
```

### 3.4 变体联合类型

若组件的变体取值需要被消费方引用（如 `Select` 的 `variant` 属性），**必须**导出独立联合类型：

```tsx
// ✅ 正例（src/ui/select/select.tsx:71-72）
export type SelectVariant = NonNullable<VariantProps<typeof selectVariants>['variant']>;
export type SelectSize = NonNullable<VariantProps<typeof selectVariants>['size']>;
```

> 📌 **真值源**：`NonNullable<VariantProps<...>['key']>` 是从 cva 定义**派生**的唯一正确写法 —— 手写 `'sm' | 'default'` 会与 cva 定义漂移（[`src/ui/select/select.tsx:38`](../src/ui/select/select.tsx) 是反例）。

### 3.5 cva 变体定义

**必须**用 `class-variance-authority` 定义样式变体。

```tsx
// ✅ 正例（src/ui/button/button.tsx:28-70）
const buttonVariants = cva('inline-flex items-center justify-center ...', {
  variants: {
    variant: { default: '...', secondary: '...', destructive: '...' },
    size: { default: 'h-10 px-4 py-2 text-sm', sm: 'h-9 px-3 rounded-md text-xs' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
```

**规则**：

| #   | 规则                                                                           | 真值源                                                     |
| --- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 1   | 常量名**必须** `<component>Variants`（多组时 `<component><Aspect>Variants`）   | §2.3                                                       |
| 2   | **必须**声明 `defaultVariants`                                                 | `src/ui/button/button.tsx:65`                              |
| 3   | `variants` 的键**必须**是 `variant` / `size`（可扩展 `rounded` / `maximized`） | `src/ui/badge/badge.tsx:51`、`src/ui/dialog/dialog.tsx:35` |
| 4   | 变体值**必须**是**字符串**或**字符串数组**（**禁止**函数式）                   | `src/ui/select/select.tsx:32-49`                           |
| 5   | 基础样式**必须**是字符串或字符串数组（数组用 `.join(' ')`）                    | `src/ui/alert/alert.tsx:23-30`                             |
| 6   | 组件**必须**把 `className` 透传给 cva（或 `cn()`）                             | §3.6                                                       |

> ⚠️ **变体键命名**：值**必须**用小写单词（`default` / `secondary` / `destructive` / `outline` / `ghost` / `link` / `success` / `warning` / `info` / `error`）。
> 尺寸**必须**用 `default` / `sm` / `md` / `lg` / `xl` / `icon` 等语义档位，**禁止** `small` / `medium` / `large` 混用。

### 3.6 类名合并（cn）

**必须**用 `cn()`，**禁止**字符串拼接。

```tsx
// ✅ 正例（src/ui/button/button.tsx:378）
className={cn(buttonVariants({ variant, size: finalSize, className }), 'relative overflow-hidden')}

// ✅ 正例 —— 条件对象式（src/ui/select/select.tsx:323）
cn('text-sm font-medium leading-none', { 'cursor-not-allowed opacity-70': disabled, 'text-destructive': error })
```

**`className` 透传规则**（**必须**遵守）：

| #   | 规则                                                                | 真值源                         |
| --- | ------------------------------------------------------------------- | ------------------------------ |
| 1   | `className` **必须**从 props 解构出来，**不得**留在 `...props` 里   | `src/ui/button/button.tsx:143` |
| 2   | `className` **必须**出现在 `cn()` 的调用链中                        | §M 维度 ⑤                      |
| 3   | **必须**允许调用方的 `className` 覆盖组件默认样式（`twMerge` 保证） | `src/utils/classnames.ts:15`   |
| 4   | 组件内部追加的类名放在 `className` **之后**（保证调用方优先级更高） | `src/ui/button/button.tsx:378` |

> ⚠️ **`cloneElement` 时**同样**必须**保留调用方的 `className`（[`src/ui/textarea/textarea.tsx`](../src/ui/textarea/textarea.tsx) 已修复）。

### 3.7 属性透传

**必须**把未消费的 props 透传给根元素。

```tsx
// ✅ 正例（src/ui/dialog/dialog.tsx:59-62）
<DialogPrimitive.Content
  ref={ref}
  className={cn(dialogContentVariants({...}), className)}
  {...props}
/>
```

**无障碍要求**：

| #   | 规则                                                                              | 真值源                                           |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | 交互元素**必须**键盘可达                                                          | `src/ui/dialog/dialog.tsx:67`（`type="button"`） |
| 2   | 可点击的非语义元素**必须**补 `role` / `tabIndex` / `onKeyDown`                    | `src/ui/select/select.tsx:337-340`               |
| 3   | 装饰性图标**必须** `aria-hidden="true"`                                           | `src/ui/button/button.tsx:394`                   |
| 4   | 状态**必须**通过 `aria-*` 暴露（`aria-disabled` / `aria-busy` / `aria-selected`） | `src/ui/button/button.tsx:177-182`               |

### 3.7.1 图标库：**唯一使用 `lucide-react`**

本库**统一使用 [`lucide-react`](https://lucide.dev) 作为图标库**，**不引入**其他图标库
（`react-icons` / `@heroicons/react` / `iconify` 等）。

| #   | 规则                                                                                                                          | 真值源                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | **必须**从 `lucide-react` **直接具名导入**图标组件                                                                            | `src/ui/button/button.tsx:24`（`Loader2`）      |
| 2   | ❌ **禁止** `import * as Icons from 'lucide-react'` 后动态取用（全量打包 + 丢失 tree-shaking）                                | —                                               |
| 3   | ❌ **禁止**把图标**内联复制**为 SVG path（本库已有唯一图标源）                                                                | —                                               |
| 4   | 图标**必须**通过 props 透传给调用方（`icon` / `prefix` / `suffix` 槽位），**不写死**在组件内部                                | `src/ui/input/input.tsx`（`prefix` / `suffix`） |
| 5   | 图标**必须**加 `aria-hidden="true"`（装饰性）或 `aria-label`（语义性）                                                        | `src/ui/button/button.tsx:394`                  |
| 6   | 图标尺寸**必须**用 `size` prop 或 `className` 的 `h-*` / `w-*` 控制，**禁止**写死 `width` / `height` 属性                     | `src/ui/alert/alert.tsx`                        |
| 7   | 图标颜色**必须**走 CSS 变量（`currentColor` / `text-primary`），**禁止**硬编码                                                | —                                               |
| 8   | ❌ **禁止**把 `lucide-react` 的图标**从 `src/index.ts` 根 barrel 再导出** —— 消费方应直接从 `lucide-react` 导入，避免二次包装 | `src/index.ts`（**无** lucide 导出）            |

> 📌 **依赖分区**：`lucide-react` 在 **`dependencies`**（不是 `peerDependencies`）
> —— 组件的默认图标是**库的运行时行为**，消费方无需自行安装。
> 同时它**必须**在 `tsup.config.ts` 的 `external` 列表里（已配置），
> 避免被打进 bundle 导致图标重复。
>
> 📌 **不设独立图标文档** —— 图标相关规则**只在本节**维护；
> `css-standard.md` / `storybook-standard.md` 不重复定义图标规范。

### 3.8 barrel 导出

**组件级** `src/ui/<component>/index.ts`：

```tsx
// ✅ 正例（src/ui/button/index.ts:1-7）
export * from './button';
export type { ButtonProps, SwipeDirection, PressureSensitiveConfig } from './button';
```

| #   | 规则                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **必须** `export * from './<component>';`                                                                                    |
| 2   | **必须**额外 `export type { ... } from './<component>';` 显式重导出类型（`export *` 已含类型，此行是**类型契约的显式声明**） |
| 3   | 类型来自 `types.ts` 时，`export type` **必须**指向 `./types`                                                                 |
| 4   | ❌ **禁止** `declare module` 模块增强声明（本仓库**无**该模式，见 §M+2 豁免 H3）                                             |

**组件层 barrel** `src/ui/index.ts`：

```tsx
// ✅ 正例（src/ui/index.ts:1-60）—— 按目录名字母序，一行一个
export * from './accordion';
export * from './alert';
export * from './alert-dialog';
// ...
export * from './typography';
export * from './use-toast';
```

| #   | 规则                                                             |
| --- | ---------------------------------------------------------------- |
| 1   | **必须**用 `export * from './<dir>';`                            |
| 2   | **必须**按目录名字母序排列                                       |
| 3   | ❌ **禁止**手工列举导出项（`export { Button } from './button'`） |
| 4   | **必须**在新增组件目录的**同一提交**内更新                       |

**根级** `src/index.ts`（**tsup 唯一构建入口**）：

```tsx
// ✅ 正例（src/index.ts:22-40）—— 按层分组，每组用 barrel 转发
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

| #   | 规则                                                                            |
| --- | ------------------------------------------------------------------------------- |
| 1   | **必须**按**层**分组（models / utils / ui / design-system / hooks / providers） |
| 2   | **必须**用 `export * from './<layer>';` 转发到各层 barrel                       |
| 3   | ❌ **禁止**手工列举导出项（`export { Button } from './ui/button'`）             |
| 4   | ❌ **禁止**在此文件写组件实现 —— 它**只**做转发                                 |
| 5   | **必须**在新增组件 / 类型 / Schema 的**同一提交**内更新                         |

> ⚠️ **根 barrel 是「组件能否被消费方用」的唯一开关** —— 未在此导出的符号
> **不会**进入 `dist/index.d.ts` 与 `dist/index.mjs`。
> 历史上 `src/index.ts` 曾为空文件，导致全部 54 个组件与 Zod Schema 均未进入公开 API。

### 3.9 公开 API 契约

组件的 **props / 导出名 / DOM 结构** 属于**公开 API**。变更**必须**走：

1. 更新 `README.md` + `README.en.md`（导出清单）
2. 更新 `CHANGELOG.md`
3. `pnpm version:patch|minor|major`（版本 bump）

> 📌 **破坏性变更**（删导出 / 改 props 类型 / 改 DOM 结构）**必须**走 `minor` 或 `major`，**禁止**用 `patch`。

### 3.10 类型导入与路径

项目开启 `verbatimModuleSyntax`（[`tsconfig.base.json`](../tsconfig.base.json)），
**类型必须显式标记** —— 否则 `pnpm type-check` 报 `TS1484`。

```tsx
// ✅ 正例 —— 纯类型导入
import type { TableColumn, TableContextValue } from '../types';
import type { ReactNode } from 'react';

// ❌ 反例 —— TS1484: 'TableColumn' is a type and must be imported using a type-only import
import { TableColumn, TableContextValue } from '../types';
```

| #   | 规则                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | **必须**类型用 `import type { ... }` 显式导入                               |
| 2   | 混合导入（值 + 类型）**必须**拆成两条：`import { X }` + `import type { Y }` |
| 3   | ❌ **禁止**用 `import { type X }` 内联修饰符混在值导入里（可读性差）        |
| 4   | ❌ **禁止**使用 `@/` 路径别名 —— **必须**相对路径                           |
| 5   | **必须**避免自引用 barrel（从 `./index` 导入）—— 直连实际源模块             |

> 📌 **实测**：全库曾有 **79 处** TS1484（`src/ui/table` 占 68 处），
> 已于 2026-11-01 全量修复；自引用 barrel 导致 rollup 报
> `No matching export in "src/ui/table/index.ts" for import "Button"` 也一并修正。

```tsx
// ❌ 反例 —— 自引用 barrel（barrel 里并没有该导出）
import { Button } from '../index';

// ✅ 正例 —— 直连实际源模块
import { Button } from '../../button';
```

### 3.11 公开 API 的设计契约（⛔ 跨文档引用）

> 📌 **完整的 API 设计规范见** [`component-api-standard.md`](./component-api-standard.md)。
> 本节只列**与本规范直接耦合**的硬性要求。

| #   | 要求                                                                 | 归属章节                                                           |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | **布尔 prop ≤ 5 个**；超出**必须**收敛为 `variant` 或配置对象        | `component-api-standard.md` §1.2                                   |
| 2   | 复合组件走**扁平多导出**（`XxxContent`），**不用**静态属性复合       | `component-api-standard.md` §2.1                                   |
| 3   | 结构组合用 `children` / 插槽；`renderXxx` 仅限「数据项渲染」         | `component-api-standard.md` §3                                     |
| 4   | 有受控 prop **必**有 `defaultXxx`，且定义了二者优先级                | `component-api-standard.md` §5.1                                   |
| 5   | Context：Provider 独占状态；消费 Hook **抛错守卫**                   | `component-api-standard.md` §4.2                                   |
| 6   | **禁止**从目录 barrel 做**运行时**导入（循环依赖）                   | `component-api-standard.md` 维度 ⑦                                 |
| 7   | 组件**内部**不得从 barrel 运行时导入（与 §3.8 的对外 barrel 不冲突） | [`architecture-standard.md`](./architecture-standard.md) §M 维度 ② |

> 📌 **「对外走 barrel」与「内部不走 barrel」不矛盾**：
> **对外**（`src/index.ts` → `src/ui/index.ts` → 组件 `index.ts`）**必须**走 barrel —— 这是**公开 API 契约**；
> **内部**（组件 A 引用组件 B）**必须**直连源模块 —— 否则产生**运行时循环依赖**。

### 3.12 无障碍与性能的实现约束（⛔ 跨文档引用）

> 📌 **完整的规范见** [`a11y-interaction-standard.md`](./a11y-interaction-standard.md)
> 与 [`react-performance-standard.md`](./react-performance-standard.md)。本节只列**实现层**的硬性要求。

| #   | 要求                                                                  | 归属章节                                      |
| --- | --------------------------------------------------------------------- | --------------------------------------------- |
| 1   | 图标按钮**必须**有 `aria-label` / `sr-only` 文本                      | `a11y-interaction-standard.md` §1.1           |
| 2   | 装饰性图标**必须** `aria-hidden="true"`                               | `a11y-interaction-standard.md` §1.2           |
| 3   | 非语义元素做交互**必须**补 `role` + `tabIndex` + `onKeyDown`          | `a11y-interaction-standard.md` §2.2           |
| 4   | 焦点样式**必须** `focus-visible:` + `outline`（或 `ring` + `offset`） | [`css-standard.md`](./css-standard.md) §4.7   |
| 5   | `aria-label` 的文案**必须**走 `useComponentMessage`                   | [`i18n-standard.md`](./i18n-standard.md) §4.1 |
| 6   | 组件**必须**在**模块级**定义（不在渲染函数体内）                      | `react-performance-standard.md` §3.3          |
| 7   | 渲染期**禁止** DOM 测量（`getBoundingClientRect` / `offsetHeight`）   | `react-performance-standard.md` §4.1          |

---

## 4. 依赖与构建影响

### 4.1 新增依赖时

| #   | 规则                                                              | 验证                                |
| --- | ----------------------------------------------------------------- | ----------------------------------- |
| 1   | 源码 `import` 的包**必须**在 `dependencies` 或 `peerDependencies` | `code-quality.md` §M 维度 ⑨         |
| 2   | Radix primitives → `peerDependencies` + `optional`                | `package.json#peerDependenciesMeta` |
| 3   | `react` / `react-dom` → **只能**在 `peerDependencies`             | `package.json#peerDependencies`     |

### 4.2 CSS 变量依赖

组件用到的 CSS 变量**必须**在 `src/theme/themes/light.css` 与 `src/theme/themes/dark.css` **两处**同步定义。

> 📌 **详细规则与扫描命令见 [`css-standard.md`](./css-standard.md)** —— 本规范不重复。

---

## M. 12 项扫描维度（评审必跑）

> **目的**：新增 / 修改组件前**必须**跑的检查。本节是**验证契约**（不是任务清单，是自动扫描器的手册）。
>
> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**（按组件分批扫描必然漏）。

### 维度 ① 组件 4 件套完整性

**扫描命令**：

```bash
pnpm probe component
```

> 手工等价命令（仅列目录缺件，PowerShell 可直跑）：
>
> ```powershell
> Get-ChildItem src/ui -Directory | ForEach-Object {
>   $d = $_.Name
>   $miss = @()
>   if (-not (Test-Path "src/ui/$d/index.ts") -and -not (Test-Path "src/ui/$d/index.tsx")) { $miss += 'index' }
>   if (-not (Get-ChildItem "src/ui/$d" -Filter '*.tsx' -Recurse -File | Where-Object { $_.FullName -notmatch '__tests__' -and $_.Name -notmatch '\.stories\.|\.test\.' })) { $miss += 'impl' }
>   if (Get-ChildItem "src/ui/$d" -Include '*.test.*','*.stories.*' -Recurse -File | Where-Object { $_.FullName -notmatch '__tests__' }) { $miss += 'misplaced' }
>   if ($miss) { "$d -> MISSING: $($miss -join ',')" }
> }
> ```

**判定规则**（探针自动判定）：

- ❌ 违规：组件目录缺 barrel 入口（`index.ts` / `index.tsx`）或缺实现 tsx；
  测试 / Story 出现在 `__tests__/` 之外
- ✅ 合规：`[probe:component]` 无 ERROR（存量 `export default` 以 WARN 呈现，属维度②）

**修正模式**：

```bash
# ❌ 违规：新建了 src/ui/date-picker/，只有 date-picker.tsx
# ✅ 修正：补齐 4 件套 —— 实现 + index.ts + __tests__/date-picker.test.tsx + __tests__/date-picker.stories.tsx
#          并在 src/index.ts 加 export * from './ui/date-picker'
```

### 维度 ② 实现文件禁止 `export default`

**扫描命令**：

```bash
pnpm probe component
```

> 手工等价命令：
>
> ```powershell
> Get-ChildItem src/ui -Recurse -Filter *.tsx -File |
>   Where-Object { $_.FullName -notmatch '__tests__|examples' -and $_.Name -notmatch '\.stories\.|\.test\.' } |
>   Select-String -Pattern '^\s*export\s+default\s'
> ```

**判定规则**：

- ❌ 违规（**新增文件**）：实现文件出现 `export default` —— 必须改 named export
- ⚠️ 存量 **32 处 / 32 文件**（`src/ui`，排除 `__tests__` / stories / examples）已登记豁免
  —— 探针以 **WARN** 呈现（消息标注「改动即改」），不阻塞退出码
- ✅ 合规（新增文件）：0 新增命中

**修正模式**：

```tsx
// ❌ 违规（src/ui/<component>/<part>.tsx）
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
// ❌ 违规（src/ui/navigation-menu/navigation-menu.tsx:54）
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

// ✅ 修正（src/ui/button/button.tsx:140-143）
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
// ❌ 违规（src/ui/menubar/index.ts）
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

// ✅ 修正（src/ui/spinner/spinner.tsx:50）
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

| 形态                                                          | 判定 | 真值源                                             |
| ------------------------------------------------------------- | ---- | -------------------------------------------------- |
| `export interface XxxProps extends React.HTMLAttributes<...>` | ✅   | `src/ui/button/button.tsx:73`                      |
| `export type XxxProps = React.ComponentProps<typeof Xxx>`     | ✅   | `src/ui/tooltip/tooltip.tsx:39`                    |
| `export type XxxProps = ((A & B) \| (C & D)) & { ... }`       | ✅   | `src/ui/card/card.tsx:47`（判别联合，必须用 type） |
| `export type XxxProps = { ... }`（手写对象字面量）            | ❌   | —                                                  |

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

// ✅ 修正（src/ui/dialog/dialog.tsx:61）
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

// ✅ 修正（src/ui/button/button.tsx:24）—— 具名导入
import { Loader2 } from 'lucide-react';
```

### 维度 ⑫ 组件目录必须有**唯一** barrel 入口

> 📌 对应条文：§1「目录约定」。

**扫描命令**：

```bash
# 找出同时存在 index.ts 与 index.tsx 的组件目录（双入口 = 隐患）
Get-ChildItem src/ui -Directory | ForEach-Object {
  $ts = Join-Path $_.FullName "index.ts"
  $tsx = Join-Path $_.FullName "index.tsx"
  if ((Test-Path $ts) -and (Test-Path $tsx)) { "DOUBLE ENTRY: $($_.Name)" }
}

# 检查组件目录是否缺少 barrel 入口
Get-ChildItem src/ui -Directory | ForEach-Object {
  if (-not (Test-Path (Join-Path $_.FullName "index.ts")) -and
      -not (Test-Path (Join-Path $_.FullName "index.tsx"))) {
    "MISSING BARREL: $($_.Name)"
  }
}
```

**判定规则**：

- ❌ 违规 1：同一组件目录下**同时**存在 `index.ts` 与 `index.tsx`
  —— TypeScript 在 `moduleResolution: Bundler` 下优先解析 `.tsx`，`index.ts` 成为**永不生效的死文件**。
  维护者极可能误改那个「看起来才是标准入口」的文件，导致改动无效且无人察觉。
- ❌ 违规 2：组件目录**缺少** barrel 入口（`index.ts` / `index.tsx` 二者至少有一个）
- ✅ 合规：两条均 0 命中

**修正模式**：

```bash
# ❌ 违规 —— 双入口，index.ts 是死文件
src/ui/typography/index.ts    # ← 删除这个
src/ui/typography/index.tsx   # ← 保留这个（唯一入口）
```

> 📌 **本库的历史教训**：`src/ui/typography/` 曾同时存在 `index.ts`（`export * from './typography'`，
> 平铺导出）与 `index.tsx`（只导出聚合对象 `Typography` / `Static`）。
> 实际生效的是 `index.tsx` —— 因为裸组件名 `Table` / `Separator` / `ListItem`
> 与 `src/ui/table` / `src/ui/separator` / `src/ui/edit` **同名**，
> 若平铺导出会触发 TS2308「重复导出」冲突并导致整个 barrel 无法编译。
> 详见 [ADR 0001](../../docs/decisions/0001-src-ui-defect-remediation.md)。

---

## M+1. 历史基准（2026-11-05 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。
> 一键刷新：`pnpm probe baseline`。

| 指标                                                 | 数值                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 公开组件目录数（`src/ui/`）                          | 56                                                                                          |
| 基础实现组件数（`src/design-system/components/ui/`） | 46                                                                                          |
| 组件目录含 barrel 入口率                             | 56/56（100%；`typography` 用 `index.tsx`，其余 `index.ts`）                                 |
| 测试文件数（`src/**/*.test.tsx`）                    | 123                                                                                         |
| Storybook stories 文件数                             | 79                                                                                          |
| 实现文件 `export default` 命中                       | 32 处 / 32 文件（`src/ui`，排除 `__tests__` / stories / examples）—— 存量豁免（维度② WARN） |
| 主题 CSS 变量数（light / dark）                      | 706 / 706（集合完全一致）                                                                   |

### 重测命令

```bash
pnpm probe baseline      # 一键输出上表全部数字
pnpm probe component     # 维度①②合规状态
```

---

## M+2. 豁免清单

| 编号 | 对象                                                                 | 豁免依据                                                                                                                                                                                                               |
| ---- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1   | `src/ui/use-toast/use-toast.tsx` 不使用 forwardRef / `cn()`          | 该目录导出的是 **Hook**（`useToast`）与状态函数（`toast`），不渲染 DOM，无 ref 与类名可言                                                                                                                              |
| H2   | `src/ui/alert-dialog/alert-dialog-modal.tsx` 未纳入 barrel（维度 ⑦） | **已知缺口**（spec-index G1）：`AlertDialogModal` 已实现（`src/ui/alert-dialog/alert-dialog-modal.tsx:39`）但 `src/ui/alert-dialog/index.ts:1-2` 未导出，且该文件无 test / stories。补齐需单独排期                     |
| H3   | `src/ui/button/index.ts` 的 `declare module` 增强（§3.8 规则 4）     | **存量豁免**：该增强声明的 `swipeThreshold` / `pressureConfig` 字段在实现（`src/ui/button/button.tsx:73-96`）中**不存在** —— 是**类型契约与实现不一致的真实缺陷**（spec-index G2），已登记待修。新增组件**禁止**此模式 |
| H4   | `src/design-system/index.tsx` 的 `export default`（§3.1）            | **存量豁免**：`DesignSystemProvider` 是 Provider 组合入口，保留 default 导出便于消费方 `import DesignSystemProvider from ...`。`export *` **不传播** default，故不影响 `src/index.ts` barrel                           |
| H5   | 维度② `export default` 存量 **32 处**（`src/ui` 实现文件）           | **存量豁免**：探针以 WARN 呈现；**改动触及某文件时必须顺手改为 named export**，新增文件一律 MUST named export（spec-index 无独立编号，见 §M+1）                                                                        |

---

## M+3. 冲突裁决

| #   | 冲突点               | 旧规范声明                                                    | 实际情况                                                                    | 裁决                                                                                                                                                     |
| --- | -------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | 组件目录结构         | `spec-index.md` 未定义                                        | `src/ui/` 下 56 个组件目录含实现 + `index.ts`，测试与 Story 在 `__tests__/` | **目录结构为硬性契约**（本规范 §1.1）                                                                                                                    |
| C2  | 导出方式             | `coding-standards.md` 写「具名导出优先，不用 default export」 | 实现文件 0 处 `export default`（`design-system/index.tsx` 除外）            | **named export 为硬性要求**（本规范 §3.1）                                                                                                               |
| C3  | `data-slot` 属性     | 未提及                                                        | 全库 **0 处** 使用                                                          | **不引入** `data-slot`（保持与 Radix 惯例一致）                                                                                                          |
| C4  | 变体联合类型来源     | 未提及                                                        | `src/ui/select/select.tsx:38` 手写联合类型                                  | **必须从 cva 派生**（本规范 §3.4）                                                                                                                       |
| C5  | 主题变量命名         | `code-quality.md` 未覆盖                                      | 组件私有变量用 `<component>-<role>` 前缀                                    | **归 `css-standard.md`**                                                                                                                                 |
| C6  | 复合组件形态         | 外部惯例用静态属性复合（`Dialog.Content`）                    | 全库**零** `Object.assign` / 零 `.Root =`，一律扁平多导出                   | **保留本库规范** —— 静态属性会引入双命名与 TS2308 冲突（见 [`component-api-standard.md`](./component-api-standard.md) §M+3 C1）                          |
| C7  | `forwardRef`         | 外部 React 19 最佳实践建议「不用 `forwardRef`」               | **必须** `forwardRef` + `displayName`                                       | **保留本库规范** —— 外部规则的依据是「`use()` 替代 `useContext()`」，与 **ref 转发无关**；`forwardRef` 在 React 19 中**仍是官方推荐**方式                |
| C8  | 布尔 prop 扩散       | 外部建议「用组合替代布尔」                                    | 未涉及；布尔 126 处，`show*` 主导                                           | **采纳为方向，分级落地** —— 设**阈值**而非一刀切；既有 API 收敛是**破坏性变更**（见 [`component-api-standard.md`](./component-api-standard.md) §M+3 C2） |
| C9  | `renderXxx`          | 外部建议「优先 `children`」                                   | 表格子系统有 9 处 `render*` prop                                            | **采纳** —— 但**保留**表格的 `render*`（「数据项渲染」是唯一合法场景，见 [`component-api-standard.md`](./component-api-standard.md) §M+3 C3）            |
| C10 | `asChild` 覆盖       | 外部建议复合组件普遍提供 `asChild`                            | 仅 4 个组件提供                                                             | **采纳为新增义务** —— 新增复合组件**必须**提供；既有组件**逐步补齐**（缺口 G-P1）                                                                        |
| C11 | barrel 导入          | 外部建议「直接导入，避免 barrel」                             | **必须**用 barrel 导出（`export *`）                                        | **部分采纳** —— **对外**必须走 barrel（公开 API 契约）；**内部**运行时 barrel 导入会**循环依赖**（缺口 G-P2）                                            |
| C12 | 图标按钮的可访问名称 | 外部规范要求 icon-only 按钮必须有 `aria-label`                | 全库 **18 处** 图标按钮缺名 + 6 处日期后缀图标不可键盘访问                  | **采纳** —— 新增 [`a11y-interaction-standard.md`](./a11y-interaction-standard.md)，缺口 G-A10 / G-A11                                                    |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审组件时的**自查**清单（不是任务列表，是合规性自检表）。

### 新增组件 `<component>` 时

- [ ] 目录 `src/ui/<component>/` 下有实现 `.tsx` + `index.ts` barrel
- [ ] 测试与 Story 在 `src/ui/<component>/__tests__/` 下
- [ ] 实现用 named export + `React.forwardRef` + `displayName`
- [ ] props 用 `export interface <Component>Props extends ...`
- [ ] 类型导入用 `import type`（`verbatimModuleSyntax`）
- [ ] 样式变体用 `cva`，常量名 `<component>Variants`，且声明了 `defaultVariants`
- [ ] `className` 已解构并透传，放在 `cn()` 末位
- [ ] 用到的 CSS 变量已在 `src/theme/themes/light.css` 与 `src/theme/themes/dark.css` **两处**定义
- [ ] `src/ui/index.ts` 已按字母序加 `export * from './<component>';`
- [ ] 测试覆盖渲染 / 状态 / 交互 / 无障碍四类；Story 覆盖各变体与尺寸
- [ ] 消费方配置对象（若有）已用 Zod Schema 定义于 `src/models/`
- [ ] **布尔 prop ≤ 5 个**；超阈值已收敛为 `variant` 或配置对象（[`component-api-standard.md`](./component-api-standard.md) §1.2）
- [ ] 结构组合用 `children` / 插槽；复合组件走**扁平多导出**并提供 `asChild`
- [ ] 图标按钮有 `aria-label`；装饰性图标有 `aria-hidden="true"`；非语义元素交互补齐 `role` + `tabIndex` + `onKeyDown`
- [ ] 焦点样式用 `focus-visible:` + `outline`（或 `ring` + `offset`）
- [ ] 组件在**模块级**定义；渲染期**无** DOM 测量

### 评审组件时

- [ ] 维度 ① ~ ⑫ 已全跑（一次跑全库，非按组件分批）
- [ ] 新增的 `export` 已同步 `README.md` + `README.en.md`
- [ ] 破坏性变更走了 `minor` / `major` 版本 bump
- [ ] 跨规范自检已跑：[`a11y-interaction-standard.md`](./a11y-interaction-standard.md) 12 项 / [`component-api-standard.md`](./component-api-standard.md) 10 项 / [`react-performance-standard.md`](./react-performance-standard.md) 10 项

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测重建：① 原 `coding-standards.md`（easbot monorepo 残留，含 Zod strict / NamedError / 22 包 workspace 体系）**重命名并重写**为组件库口径的 `component-standard.md`；② 确立**组件 4 件套**为硬性契约；③ 确立 named export / forwardRef + displayName / `export interface` props / cva 派生联合类型 / `cn()` 末位透传 五条实现契约；④ 10 项扫描维度全部实跑验证（命令可一键复跑）；⑤ 豁免清单 4 条（含 2 条真实缺口登记：`alert-dialog-modal` 未导出、`button/index.ts` 幽灵字段增强）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2.1.0 | 2026-11-04 | **接入三份新规范，消除跨规范盲区**。① **新增 §3.11「公开 API 的设计契约」** —— 跨文档引用 [`component-api-standard.md`](./component-api-standard.md) 的 7 条硬性要求（布尔 prop ≤ 5 / 扁平多导出 / `children` 优先 / 受控非受控配对 / Context 抛错守卫 / 禁 barrel 运行时导入），并**明确「对外走 barrel」与「内部不走 barrel」不矛盾**（前者是公开 API 契约，后者是循环依赖防护）；② **新增 §3.12「无障碍与性能的实现约束」** —— 跨文档引用 [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) 与 [`react-performance-standard.md`](./react-performance-standard.md) 的 7 条实现层要求（`aria-label` / `aria-hidden` / 键盘三件套 / 焦点样式 / i18n 文案来源 / 模块级定义 / 禁渲染期 DOM 测量）；③ **§M+3 冲突裁决由 5 条增至 12 条（C6~C12）** —— 逐条裁定外部规范：**保留**扁平多导出（C6）、**保留** `forwardRef` + `displayName`（C7，说明外部规则的 `use()` 与 ref 转发**无关**）、**采纳**布尔分级阈值（C8）、**采纳** `children` 优先但**保留**表格 `render*`（C9）、**采纳** `asChild` 新增义务（C10）、**部分采纳** barrel 建议（C11）、**采纳**图标按钮可访问名称（C12）；④ §M+4 检查清单新增 6 项（布尔阈值 / 组合方式 / a11y 三条 / 焦点样式 / 模块级定义 + 跨规范自检）；⑤ frontmatter 补 3 份 `related` 与版本升 **2.1.0**。**规范条文本身不过期，只有数据基准会过期**。 |
| 2.2.0 | 2026-11-05 | **全量评审修正**。① **维度①命令修正** —— 原命令检查组件根目录的 `$d.test.tsx` / `$d.stories.tsx`（与 §1.1 `__tests__/` 契约自相矛盾）且扫描范围误含非组件目录，改为 `pnpm probe component`（口径：`src/ui`、barrel 允许 `index.ts` / `index.tsx`、测试与 Story 必须在 `__tests__/`）；② **维度②接入探针**并登记存量豁免 H5（`export default` 实测 32 处 / 32 文件，WARN 呈现，改动即改）；③ **§M+1 基线刷新**（组件 56 / 基础组件 46 / 测试 123 / Story 79 / barrel 56/56），重测命令改 `pnpm probe baseline`；④ **豁免清单补编号列 H1~H5**（正文 §1.x 的 H1~H4 引用由此可追溯）；⑤ **失效锚点修正**：变体联合类型反例 `input.tsx:13`（实为 JSDoc）→ `select.tsx:38`；`src/textarea` 路径笔误 → `src/ui/textarea`。**规范条文本身不过期，只有数据基准会过期**。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`css-standard.md`](./css-standard.md) —— CSS 变量 / 主题 / token / Tailwind 用法
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试写法与断言
- [`storybook-standard.md`](./storybook-standard.md) —— Story 写法与装饰器
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc
- [`code-quality.md`](./code-quality.md) —— lint / type-check / 构建 / 依赖
- [`src/utils/classnames.ts`](../src/utils/classnames.ts) —— `cn()` 实现
