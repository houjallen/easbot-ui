---
name: storybook-standard
description: 该规范定义 easbot-ui 组件库的 Storybook 契约，含 CSF3 写法（meta satisfies Meta / StoryObj / export default meta）、meta 必填字段（title 前缀 EASAI/ / component / tags autodocs / parameters）、story 导出命名规则与覆盖维度（Default / Variants / Sizes / 状态 / 组合）、argTypes 写法（control / options / description / table.defaultValue）、装饰器规范（全局主题装饰器与局部包裹装饰器）、主题切换机制（withThemeByClassName 与 data-theme 的对齐）、本地 addon 规范（eas-addon-locale 语言切换：双入口 exports / 绝对路径注册 / globals 通道 / 装饰器唯一挂载点）、Storybook 配置基线（react-vite builder / stories glob / addon 清单 / viteFinal alias）、10 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与新增组件 story 检查清单。当编写组件 story、配置 Storybook、扩展本地 addon 或排查 story 不显示时参考。
category: specification
version: 1.1.0
baseline-date: 2026-10-31
tags: [easbot-ui, storybook, csf3, story, argtypes, decorator, docs, code-review]
related:
  - spec-index.md
  - component-standard.md
  - css-standard.md
  - testing-guidelines.md
  - code-annotation-standard.md
  - code-quality.md
---

# EASBot UI Storybook 规范 (Storybook Standard)

> **真值源**：本规范以 [`.storybook/main.ts`](../.storybook/main.ts)、[`.storybook/preview.tsx`](../.storybook/preview.tsx)
> 与 `src/ui/<component>/__tests__/*.stories.tsx` 的 story 文件为唯一执行真值；规范与实现冲突时**规范改**。
>
> **与其它规范的分工**（三者**不重复**）：
>
> | 关注点                   | 归属文档                                           | 本规范对应章节     |
> | ------------------------ | -------------------------------------------------- | ------------------ |
> | 组件目录 / 命名 / 导出   | [`component-standard.md`](./component-standard.md) | §1.2（仅文件位置） |
> | 测试怎么写               | [`testing-guidelines.md`](./testing-guidelines.md) | —                  |
> | CSS 变量 / 主题 / 语义类 | [`css-standard.md`](./css-standard.md)             | §4（仅主题切换）   |
> | lint / 构建              | [`code-quality.md`](./code-quality.md)             | §2（仅命令）       |
>
> **历史基准**：v1.0.0 锁定 2026-10-31 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。
>
> **目录约定**：story 文件统一放在组件目录的 `__tests__/` 子目录中，Storybook 的 `stories` glob 仍为 `../src/**/*.stories.@(ts|tsx)`，因此不会影响加载。

---

## 概述 (Overview)

Storybook 是本库的**可视化文档与人工验收场**。它与单测的分工是明确的：

| 关注点             | 归属        | 能回答的问题                     |
| ------------------ | ----------- | -------------------------------- |
| **行为正确性**     | Vitest 单测 | 「回调是否触发」「状态是否正确」 |
| **视觉与交互体验** | Storybook   | 「看起来对不对」「组合是否协调」 |

**核心约束**：

- ✅ story 文件**必须**在 `src/ui/<component>/__tests__/<component>.stories.tsx`
- ✅ **必须**用 **CSF3** 写法（`const meta: Meta<typeof X> = {...}; export default meta; type Story = StoryObj<typeof X>;`）
- ✅ meta `title` **必须**是 `EASAI/<Component>`
- ✅ meta **必须**声明 `tags: ['autodocs']`
- ✅ story 导出名**必须** PascalCase（`Default` / `Variants` / `Sizes` …）
- ✅ 每个变体 / 尺寸**必须**有对应 story
- ✅ 回调类 props **必须**用 `fn()` 桩（来自 `storybook/test`）
- ❌ 禁止在 story 里写**硬编码颜色**（主题变量已提供）
- ❌ 禁止 `meta` 缺少 `title`（Storybook 会拒绝加载）
- ❌ 禁止依赖 `addon-vitest`（浏览器模式，CI 沉重且与 jsdom 单测重复建设）

---

## 1. 文件与配置契约

### 1.1 story 文件位置

```
src/ui/<component>/__tests__/<component>.stories.tsx
```

**与测试文件同目录**（`__tests__/`），与组件源码分离：

```
src/ui/button/
├── button.tsx
├── __tests__/
│   ├── button.test.tsx
│   └── button.stories.tsx
└── index.ts
```

### 1.2 Storybook 配置基线

> **真值源**：[`.storybook/main.ts`](../.storybook/main.ts)

| 配置项             | 值                                                                                                              | 说明                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `framework`        | `@storybook/react-vite`                                                                                         | Storybook 10 默认推荐；**无需**额外 `vite.config.ts` |
| `stories`          | `['../src/**/*.stories.@(ts\|tsx)']`                                                                            | glob **必须**匹配真实布局                            |
| `addons`           | `addon-docs` / `addon-a11y` / `addon-themes` / `addon-links` / `addon-onboarding` + **本地** `eas-addon-locale` | ❌ **不装** `addon-vitest`                           |
| `docs.defaultName` | `'Docs'`                                                                                                        | 文档页默认名                                         |
| `viteFinal`        | 注入 `@` → `src/` 的 alias                                                                                      | 与 `vitest.config.ts` 的 alias 一致                  |

> ⚠️ **`stories` glob 必须是 `../src/**/*.stories.@(ts|tsx)`** —— 历史上配过 `../src/components/ui/**`（该目录不存在），
> 导致 Storybook **启动即匹配不到任何 story**。
>
> ⚠️ **禁止 `addon-vitest`** —— 它走 `@vitest/browser` + playwright，需下载浏览器二进制，CI 沉重且与现有 jsdom 单测链路**重复建设**。

### 1.3 全局 preview

> **真值源**：[`.storybook/preview.tsx`](../.storybook/preview.tsx)

```tsx
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', theme);
      });
      return (
        <div className="p-8">
          <Story />
        </div>
      );
    },
    withThemeByClassName({ themes: { light: 'light', dark: 'dark' }, defaultTheme: 'light' }),
  ],
};
```

| #   | 规则                                                                             |
| --- | -------------------------------------------------------------------------------- |
| 1   | **必须** `import '../src/theme/styles.css';` —— 否则 story 里样式全无            |
| 2   | **必须**有主题装饰器（设置 `<html data-theme>`）                                 |
| 3   | ❌ **禁止** import 本仓库不存在的模块（原配置引用了 5 个孤儿模块，导致启动即崩） |

---

## 2. CSF3 写法

### 2.1 标准骨架

```tsx
/**
 * Spinner 组件 Storybook 示例
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'EASAI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: { description: { component: '用于表示加载状态的旋转指示器组件' } },
  },
  tags: ['autodocs'],
  argTypes: {/* ... */},
};

export default meta;
type Story = StoryObj<typeof Spinner>;
```

**规则**：

| #   | 规则                                                                                         |
| --- | -------------------------------------------------------------------------------------------- |
| 1   | **必须**用 `const meta: Meta<typeof X> = {...};`（显式标注）                                 |
| 2   | **必须** `export default meta;`（**唯一**允许 default export 的地方）                        |
| 3   | **必须** `type Story = StoryObj<typeof X>;`（标注组件本体，**不是** `typeof meta`）          |
| 4   | ❌ **禁止** `export default { ... }`（CSF2 写法）                                            |
| 5   | ❌ **禁止** `type Story = StoryObj<typeof meta>;`（见下方「⚠️ 为什么不能用 `typeof meta`」） |

> ⚠️ **为什么 Story 必须标注组件本体而不是 `typeof meta`**
>
> `StoryObj<typeof meta>` 会把 meta 里声明的 `component` 的**必填 props** 提升为
> story 的**必填 `args`**。当组件含有必填 props 时（如 `Form` 的 `children`、
> `Select` 的 `options`），只写 `render` 而不写 `args` 的 story 会报 `TS2322`：
>
> ```
> Property 'args' is missing in type '{ render: () => React.JSX.Element; }'
> but required in type '{ args: { children: ...; options: ... } }'.
> ```
>
> `StoryObj<typeof X>`（组件本体）只约束 `args` 的**类型**，
> 而**不要求** story 必须提供 `args`，因此 `render` 形式的 story 可正常通过类型检查。
>
> 该结论由 4 变体矩阵实测得出（`satisfies` × `StoryObj<typeof meta>` / `StoryObj<typeof Component>`），
> 唯一全绿写法即为「meta 显式标注 + Story 标注组件本体」。

> 📌 **真值源**：[`src/ui/spinner/spinner.stories.tsx:8-47`](../src/ui/spinner/spinner.stories.tsx)（标准骨架）、
> [`src/ui/form/form.stories.tsx:21-31`](../src/ui/form/form.stories.tsx)（含必填 props 的组件范例）。

### 2.2 meta 必填字段

| 字段         | 必填    | 规则                                           |
| ------------ | ------- | ---------------------------------------------- |
| `title`      | ✅ 必须 | **必须**是 `EASAI/<Component>`（全库统一前缀） |
| `component`  | ✅ 必须 | 指向组件本体（供 controls 自动推断）           |
| `tags`       | ✅ 必须 | **必须**含 `'autodocs'`（生成文档页）          |
| `parameters` | 可选    | `layout` / `docs.description` / `controls` 等  |
| `argTypes`   | 可选    | 变体类组件**必须**声明（见 §3）                |
| `decorators` | 可选    | 局部包裹装饰器（见 §4.2）                      |

### 2.3 story 导出命名

**必须** PascalCase，**必须**表达「这个 story 展示什么」。

| 用途     | 命名                           | 真值源                                      |
| -------- | ------------------------------ | ------------------------------------------- |
| 默认形态 | `Default`                      | `src/ui/spinner/spinner.stories.tsx:50`     |
| 变体集合 | `Variants`                     | `src/ui/spinner/spinner.stories.tsx:72`     |
| 尺寸集合 | `Sizes`                        | `src/ui/spinner/spinner.stories.tsx:58`     |
| 状态     | `Loading` / `Disabled`         | `src/ui/button/button.stories.tsx:151`      |
| 组合     | `Combination` / `Combinations` | `src/ui/spinner/spinner.stories.tsx:87`     |
| 尺寸变体 | `SizeVariants`                 | `src/ui/dialog/dialog.stories.tsx:58`       |
| 主题变体 | `ThemeVariants`                | `src/ui/dialog/dialog.stories.tsx:86`       |
| 复杂交互 | `Playground`                   | `src/ui/use-toast/use-toast.stories.tsx:53` |

**规则**：

| #   | 规则                                            |
| --- | ----------------------------------------------- |
| 1   | **必须** PascalCase                             |
| 2   | **必须**是 `export const Xxx: Story = { ... };` |
| 3   | ❌ **禁止**小写开头 / 数字开头 / 中文名         |
| 4   | ❌ **禁止**用 story 名表达「测试」              |

### 2.4 story 内容写法

**优先**用 `args` 覆盖（让 controls 可交互）；**需要组合展示**时用 `render`。

```tsx
// ✅ 正例 —— args 覆盖（src/ui/spinner/spinner.stories.tsx:50-55）
export const Default: Story = {
  args: { size: 'md', variant: 'default' },
};

// ✅ 正例 —— render 组合展示（src/ui/spinner/spinner.stories.tsx:58-69）
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
```

**受控组件**（如 `Select` 的多选）**必须**在 `render` 内用 `useState` 管理：

```tsx
// ✅ 正例（src/ui/select/select.stories.tsx:75-78）
render: (args) => {
  const [value, setValue] = React.useState<string[]>([]);
  return <Select {...args} value={value} onChange={setValue} />;
},
```

### 2.5 Trigger / Close 类组件与 `asChild`

> ⛔ **本节是 DOM 合法性的硬约束** —— 违反会触发 React 的
> 「In HTML, `<button>` cannot be a descendant of `<button>`」hydration 警告。

Radix / vaul 的 `Trigger` / `Close` / `SubTrigger` 类组件**自身会渲染一个交互元素**
（多数是 `<button>`）。若在其 children 里再放一个 `<button>` / `<a>`，
就会形成 **`<button>` 嵌套 `<button>`** 的非法 DOM 结构 ——
React 抛 hydration 警告，且点击行为在部分浏览器下异常。

**正确做法**：加 `asChild`，让 Radix 把自己的 props（`onClick` / `onContextMenu` / `aria-*` / `data-*`）
**合并到子元素**上，而**不额外渲染包裹节点**。

```tsx
// ❌ 违规 —— DrawerTrigger 自身渲染 <button>，内部又放一个 <button>
<DrawerTrigger>
  <button type="button">打开抽屉</button>
</DrawerTrigger>

// ✅ 正确 —— asChild 合并到子元素，DOM 只有一层 <button>
<DrawerTrigger asChild>
  <button type="button" className={triggerClass}>
    打开抽屉
  </button>
</DrawerTrigger>
```

⚠️ **`asChild` 的子元素必须是**单个**可交互元素** ——
传多个子节点会让 Radix `Slot` 抛
「Slot failed to slot onto its children. Expected a single React element child or `Slottable`」。

⚠️ **组件库自身的 children 也必须满足单子元素约束** ——
若组件内部渲染多个并列子节点（如图标 + 文本 + 关闭按钮），
在 `asChild` 分支必须把它们**包装进单个元素**。
参考 `src/ui/tag/tag.tsx` 与 `src/ui/button/button.tsx` 的处理。

**例外**：`ContextMenuTrigger` 底层渲染的是 `<span>`（非 `<button>`），
不加 `asChild` **不构成非法 DOM**，但**仍应加** ——
否则触发区与按钮外观脱节（`<span>` 无 `display:inline-block`、无边框内边距、`cursor` 非 `context-menu`）。

---

## 3. argTypes 规范

变体类组件**必须**声明 `argTypes`，让文档页能展示可用取值。

```tsx
// ✅ 正例（src/ui/spinner/spinner.stories.tsx:20-38）
argTypes: {
  size: {
    control: 'select',
    options: ['sm', 'md', 'lg'],
    description: '组件尺寸',
    table: {
      type: { summary: 'sm | md | lg' },
      defaultValue: { summary: 'md' },
    },
  },
},
```

| #   | 规则                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------- |
| 1   | **必须**用 `control: 'select'` 列举**枚举型** props 的取值                                           |
| 2   | **必须**写 `description`（中文）                                                                     |
| 3   | **必须**在 `table.defaultValue.summary` 写默认值                                                     |
| 4   | `control` 可选值：`'select'` / `'boolean'` / `'number'` / `'text'` / `'color'` / `{ disable: true }` |
| 5   | **回调类** props **必须**用 `{ control: { disable: true } }`（配合 `fn()` 桩）                       |
| 6   | ❌ **禁止**在 argTypes 里写**未在组件中实现**的 prop 名                                              |

**回调桩规范**：

```tsx
// ✅ 正例（src/ui/select/select.stories.tsx:11,57-58）
import { fn } from 'storybook/test';

args: { onSearch: fn(), onChange: fn() },
```

> ⚠️ **`fn()` 来自 `storybook/test`**，**不是** `@storybook/test`（Storybook 10 的包路径已调整）。

---

## 4. 装饰器与主题

### 4.1 全局装饰器（主题）

`.storybook/preview.tsx` 的装饰器负责**主题切换** + **基础留白**：

| #   | 规则                                                                               |
| --- | ---------------------------------------------------------------------------------- |
| 1   | **必须**通过 `document.documentElement.setAttribute('data-theme', theme)` 设置主题 |
| 2   | **必须**用 `requestAnimationFrame` 包裹（确保在下一帧更新）                        |
| 3   | **必须**保留 `withThemeByClassName`（提供工具栏切换按钮）                          |

> 📌 **机制对齐**：主题文件的 CSS 选择器是 `:root[data-theme='light|dark']`（见 [`css-standard.md`](./css-standard.md) §2.1），
> 装饰器设置的属性**必须**是 `data-theme` —— 两者**必须**一致，否则主题切换**失效**。
>
> ⚠️ **`withThemeByClassName` 设置的是 class，装饰器设置的是 attribute** —— 二者并存不冲突：
> class 用于 addon-themes 的工具栏状态，attribute 才是真正驱动 CSS 的开关。

### 4.2 局部装饰器

需要在 story 里限定**容器尺寸 / 布局**时**必须**用 `decorators`（**不要**在 `render` 里套无意义的 `div`）。

```tsx
// ✅ 正例（src/ui/select/select.stories.tsx:27-33）
decorators: [
  (Story) => (
    <div style={{ width: '300px' }}>
      <Story />
    </div>
  ),
],
```

| #   | 规则                                                              |
| --- | ----------------------------------------------------------------- |
| 1   | 局部装饰器**必须**只做**布局包裹**（限定宽高 / 对齐）             |
| 2   | ❌ **禁止**在局部装饰器里做**业务逻辑**（应放 story 的 `render`） |
| 3   | **必须**优先用 Tailwind 类（`w-[300px]`）而非内联 `style`         |

### 4.3 story 级 parameters

```tsx
// ✅ 正例（src/ui/button/button.stories.tsx:247-256）
parameters: {
  docs: { description: { story: '...' } },
  viewport: { defaultViewport: 'mobile1' },
},
```

**规则**：

| #   | 规则                                                              |
| --- | ----------------------------------------------------------------- |
| 1   | 移动端场景**必须**声明 `viewport: { defaultViewport: 'mobile1' }` |
| 2   | `controls: { exclude: ['xxx'] }` 用于「固定展示某维度」的 story   |
| 3   | `docs.description.story` **必须**中文                             |

### 4.4 本地 addon —— 语言切换（`eas-addon-locale`）

> **真值源**：[`.storybook/addon/eas-addon-locale/`](../.storybook/addon/eas-addon-locale/)

本库**自带**一个本地 Storybook addon，在工具栏提供**中英文切换**，用于验收内置 i18n
（见 [`i18n-standard.md`](./i18n-standard.md)）的双语文案。

#### 目录与入口映射

```
.storybook/addon/eas-addon-locale/
├── constants.ts        # manager / preview 共用常量（全局键、支持语言、标签）
├── manager.tsx         # 工具栏端（esbuild + classic JSX）
├── preview.tsx         # 预览端（Vite + automatic JSX）
└── package.json        # exports 映射 ./manager 与 ./preview
```

`package.json` **必须**通过 `exports` 声明双入口 —— Storybook 靠它把 addon 拆成
manager（工具栏）与 preview（iframe）两端：

```json
{
  "name": "eas-addon-locale",
  "private": true,
  "type": "module",
  "exports": {
    "./manager": "./manager.tsx",
    "./preview": "./preview.tsx"
  }
}
```

#### 注册方式（**必须**用绝对路径）

```ts
// .storybook/main.ts
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveLocalAddon(value: string): string {
  return join(dirname(fileURLToPath(import.meta.url)), value);
}

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-docs',
    // ...
    resolveLocalAddon('./addon/eas-addon-locale'),
  ],
};
```

| #   | 规则                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 1   | **必须**用**绝对路径**注册本地 addon —— 相对路径会被 Storybook 当作**包名**解析并**静默跳过**（无任何报错） |
| 2   | ❌ **禁止**把 helper 函数命名为 `getAbsolutePath` —— 它是 Storybook **保留名**（见下方「⚠️」）              |
| 3   | **必须**只让 helper 服务于本地 addon 这一处，**不要**用它包裹 `addons` 里的包名                             |

> ⚠️ **为什么 helper 不能叫 `getAbsolutePath`**
>
> Storybook 通过**函数名**（`getAbsolutePathWrapperName`）识别该保留名，一旦命中：
>
> 1. 会把 `addons` 数组里**所有**字符串（含 `@storybook/addon-docs` 等包名）都改写成 `getAbsolutePath(...)` 调用；
> 2. 其官方实现用 `import.meta.resolve(value + '/package.json')` —— 对**包名**解析失败，
>    导致那些 addon 被**静默跳过**，并打印误导性的
>    `Could not resolve addon "...", skipping. Is it installed?` 告警；
> 3. 触发 `storybook add` 的自动改写逻辑，往 `addons` 里**塞进** `@storybook/addon-vitest`
>    —— 直接违反维度 ⑨。
>
> 故本库使用自定义名 `resolveLocalAddon`（见 `.storybook/main.ts`）。

#### 通信通道 —— globals

| 端      | API                                | 职责                                     |
| ------- | ---------------------------------- | ---------------------------------------- |
| manager | `useGlobals()` / `updateGlobals()` | 读写 globals，把选中语言写入 `easLocale` |
| preview | `useGlobals()`                     | 读取 globals，注入 `LocaleProvider`      |

| #   | 规则                                                                                     |
| --- | ---------------------------------------------------------------------------------------- |
| 1   | globals 键**必须**是 `easLocale` —— ❌ **禁止**用 `locale` / `theme`（Storybook 保留键） |
| 2   | **必须**用 globals 双向通道，**不要**用自定义事件（单向、且丢失 story 级覆盖能力）       |
| 3   | **必须**在 `constants.ts` 集中定义键名 —— manager 与 preview 两端**必须**共用同一常量    |
| 4   | **必须**在 `preview.tsx` 导出 `initialGlobals` 与 `globalTypes`                          |

#### 装饰器挂载点（**有且仅有一处**）

> ⚠️ addon 的 preview 入口**不要**导出 `decorators` —— Storybook 会把 addon 的 preview
> 入口当作 preview annotation 自动加载，其 `decorators` 会与 `.storybook/preview.tsx`
> 的装饰器**合并**，导致 `withLocale` 被应用**两次**（两个嵌套 `LocaleProvider`）。
>
> 故约定：**addon 只导出 `withLocale` 本体** 与 globals 配置，**不导出** `decorators`。

**本项目的实际做法**：在 `.storybook/preview.tsx` 的主题装饰器里**直接**包
`LocaleProvider` —— 从 `useGlobals()` 取语言、`setLocale` 桥接回 globals。
因此 `withLocale` **未被挂载**（避免两层嵌套），它保留为**可复用的备选实现**
（其他项目可直接 `decorators: [withLocale, ...]` 一行挂载）。

```tsx
// .storybook/preview.tsx
import { useGlobals } from 'storybook/preview-api';
import { GLOBAL_KEY, normalizeLocale } from './addon/eas-addon-locale/constants';
import { LocaleProvider } from '../src/providers';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const [globals, updateGlobals] = useGlobals();
      const locale = normalizeLocale(
        (globals[GLOBAL_KEY] ?? context.globals?.[GLOBAL_KEY]) as string | undefined,
      );

      return (
        <ThemeProvider theme={context.globals.theme || 'light'}>
          {/* 📌 唯一挂载点；`setLocale` 桥接 globals 实现双向同步 */}
          <LocaleProvider
            locale={locale}
            setLocale={(next: string) => {
              updateGlobals({ [GLOBAL_KEY]: normalizeLocale(next) });
            }}
          >
            <Story />
          </LocaleProvider>
        </ThemeProvider>
      );
    },
    withThemeByClassName({ themes: { light: 'light', dark: 'dark' }, defaultTheme: 'light' }),
  ],
};
```

| #   | 规则                                                                                     |
| --- | ---------------------------------------------------------------------------------------- |
| 1   | `LocaleProvider` **必须**有且仅有一处挂载点 —— 嵌套两层会导致 `setLocale` 被内层屏蔽     |
| 2   | **必须**把 `setLocale` **桥接回 globals** —— 否则 story 内的 `LocaleToggle` 切不动工具栏 |
| 3   | **必须**用 `normalizeLocale` 归一化 globals 值 —— 工具栏可能写入 `zh` / `en-GB`          |

#### ⛔ story 内**禁止**嵌套 Provider

> 📌 **真值源**：`src/components/theme-toggle/__tests__/theme-toggle.stories.tsx` 与
> `src/components/locale-toggle/__tests__/locale-toggle.stories.tsx` 的文件头注释。

`.storybook/preview.tsx` 已挂载**全局** `ThemeProvider`（受控，`theme={globals.theme}`）
与 `LocaleProvider`（受控，`locale={globals.easLocale}`）。
**story 内不得再嵌套 Provider** —— 否则出现两类问题：

| Provider | 嵌套后的症状                                                                                           | 根因                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 主题     | 「示例显示的主题」与「实际渲染的主题」不一致 —— 图标与背景对不上（截图表现为深色圆 + 深色图标）        | 两个 Provider **争抢同一个 `<html data-theme>` 属性**，最终值取决于 effect 执行顺序 |
| 语言     | 受控模式（`locale="zh-CN"`）下工具栏切换语言**无效**；非受控模式（`defaultLocale`）多一层无谓 Provider | 内层 Provider **屏蔽**了全局 Provider 的注入                                        |

**正确做法**：主题 / 语言统一走 **Storybook 工具栏**（`globals.theme` / `globals.easLocale`），
story 里**只渲染组件本身**：

```tsx
// ❌ 违规 —— 嵌套 Provider，与全局 Provider 争抢 data-theme
export const Default: Story = {
  render: (args) => (
    <ThemeProvider defaultTheme="dark">
      <ThemeToggle {...args} />
    </ThemeProvider>
  ),
};

// ✅ 正确 —— 主题由工具栏控制
export const Default: Story = {
  render: (args) => <ThemeToggle {...args} />,
};
```

> ⚠️ 需要展示「另一种主题 / 另一种语言」时，用**独立 story + `globals` 参数**表达，
> 并在 `parameters.docs.description.story` 里说明「请在工具栏切换到 XXX 查看」。

#### ⛔ `useGlobals()` 只能在 story render / decorator 里调用

Storybook 的 preview hooks（`useGlobals` / `useArgs` / `useEffect` …）**只能**在
**decorator** 与 **story 的 render 函数**中调用，**不能**在普通 React 组件里调用：

```tsx
// ❌ 违规 —— 普通组件里调 preview hook
function StoryThemeProvider({ children }) {
  const [globals, updateGlobals] = useGlobals(); // ❌ 抛「preview hooks can only be called inside decorators and story functions」
  return <ThemeProvider>{children}</ThemeProvider>;
}

// ✅ 正确 —— 在 story 的 render 函数里直接调用
export const Default: Story = {
  render: (args) => {
    const [globals, updateGlobals] = useGlobals();
    return <ThemeToggle {...args} />;
  },
};
```

#### ⛔ 受控 Provider 必须桥接回 globals

全局装饰器里的 `ThemeProvider` 是**受控模式**（`theme={globals.theme}`），
其 `setTheme` **不会**自行修改内部 state，只触发 `onThemeChange`。
同理 `LocaleProvider` 的 `setLocale` 只触发 `onLocaleChange` / `setLocale` 回调。

因此**受控 Provider 若不把变更桥接回 globals**，story 内的切换组件就**毫无反应**：

| 缺口                                 | 症状                                       | 修正                                                          |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------------------------- |
| `ThemeProvider` 未传 `onThemeChange` | story 内 `ThemeToggle` 点击后主题**不变**  | `onThemeChange={(next) => updateGlobals({ theme: next })}`    |
| `LocaleProvider` 未传 `setLocale`    | story 内 `LocaleToggle` 选择后语言**不变** | `setLocale={(next) => updateGlobals({ [GLOBAL_KEY]: next })}` |

> 📌 两处桥接**必须同时存在**，才能实现「工具栏 ↔ 示例」双向同步。

#### manager 端约束

| #   | 规则                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **必须**显式 `import * as React from 'react'` —— manager bundle 用 **classic JSX**（`jsxFactory: React.createElement`）            |
| 2   | **必须**用 Storybook 官方 `Select` 组件（`storybook/internal/components`），**不要**手写 DOM 下拉                                  |
| 3   | 图标**必须**用本库 `EasLanguageIcon`（`src/ui/icon/svg/eas-icon`）                                                                 |
| 4   | ❌ **禁止**从 `src/utils/component-messages.ts` import —— manager bundle **不在** Vite 模块图内，会把 61KB 文案表拖进工具栏 bundle |
| 5   | 支持语言列表**必须**在 `constants.ts` 手工同步（不 import `src/`），并在注释中标注同步来源                                         |

#### 支持语言与归一化

| 语言    | 标签     |
| ------- | -------- |
| `zh-CN` | 简体中文 |
| `en-US` | English  |

`normalizeLocale()` **必须**把 `zh` / `en` / `zh-Hans` 等短码与地区变体**归一化**到上表取值，
并回退到 `zh-CN`（`DEFAULT_LOCALE`）。

#### story 级参数

| 参数                                  | 作用                                 |
| ------------------------------------- | ------------------------------------ |
| `parameters.easLocale.disable`        | `true` → 隐藏工具栏语言控件          |
| `parameters.easLocale.localeOverride` | 固定语言（story 级）→ 隐藏工具栏控件 |

---

## 5. 本地 addon 开发规范

> **适用场景**：需要在本库 Storybook 工具栏里加**新的**全局能力（主题、语言、密度、缩放…）时，
> 按本章的骨架新建 addon。**已实现的** `eas-addon-locale` 见 §4.4（使用约定）。

### 5.1 双端架构 —— 先搞清「谁在哪跑」

Storybook addon 天然分为**两个运行环境**，二者**构建方式不同**，这是所有 addon 开发的第一步认知。

| 端        | 运行环境               | 构建方式                 | 职责                                 |
| --------- | ---------------------- | ------------------------ | ------------------------------------ |
| `manager` | 工具栏（浏览器外壳）   | esbuild，**classic JSX** | 注册工具栏控件、读写 globals         |
| `preview` | iframe（story 预览区） | Vite，**automatic JSX**  | 读取 globals、注入 Provider / 装饰器 |

```ts
// manager bundle 的 JSX 工厂是 classic runtime —— 必须显式引入 React
import * as React from 'react';
```

| #   | 规则                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | manager 端**必须** `import * as React from 'react'`（classic JSX 需 `React` 在作用域内）                               |
| 2   | preview 端**不要**显式 import React（automatic JSX 由 Vite 注入）                                                      |
| 3   | 两端**共用**的常量（全局键、枚举、标签）**必须**抽到 `constants.ts` —— 键名不一致时工具栏点击**不触发** preview 重渲染 |

### 5.2 目录骨架

```
.storybook/addon/<addon-name>/
├── constants.ts     # 双端共用常量（全局键、枚举、标签、归一化函数）
├── manager.tsx      # 工具栏端：addons.register + addons.add
├── preview.tsx      # 预览端：withXxx 装饰器 + initialGlobals + globalTypes
└── package.json     # exports 双入口映射
```

| #   | 规则                                                                                        |
| --- | ------------------------------------------------------------------------------------------- |
| 1   | addon 名**必须**以 `eas-` 前缀（避免与官方 addon 混淆）                                     |
| 2   | `package.json` **必须** `private: true`（本地 addon 不发布）                                |
| 3   | `package.json` **必须**声明 `type: "module"`                                                |
| 4   | `exports` **必须**同时声明 `./manager` 与 `./preview`                                       |
| 5   | **禁止**在 addon 内 `import` 本库**运行时**逻辑模块（如 `component-messages.ts`）—— 见 §5.5 |

### 5.3 通信机制 —— globals 优先

**首选：Storybook globals**（`UPDATE_GLOBALS` 事件通道）。

```ts
// manager 端
const [{ easLocale: current }, updateGlobals] = useGlobals();
updateGlobals({ easLocale: next });

// preview 端
const [globals] = useGlobals();
const value = globals.easLocale;
```

| #   | 规则                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **必须**用 globals 做双端通信 —— 它是官方推荐的双向通道，且保留 story 级覆盖能力                                                                      |
| 2   | globals 键**必须**加本库前缀（如 `easLocale` / `easDensity`）—— ❌ **禁止**占用 Storybook 保留键（`locale` / `theme` / `viewport` / `background` 等） |
| 3   | **必须**在 preview 端导出 `initialGlobals` 与 `globalTypes` —— 前者给初值，后者让 Storybook 知道该 global 合法（支持 URL 持久化与「恢复默认值」）     |
| 4   | ❌ **禁止**用自定义 DOM 事件做双端通信 —— 单向、需额外 `useChannel` 订阅、丢失 story 级覆盖能力                                                       |

**备选：`useChannel` + `useAddonState`** —— 仅当需要在**同一端**（如 manager 内部跨面板）传递富结构状态时使用。

### 5.4 manager 端骨架

```tsx
// .storybook/addon/eas-addon-locale/manager.tsx
import * as React from 'react';

import { Select } from 'storybook/internal/components';
import { addons, types, useGlobals, useParameter } from 'storybook/manager-api';

import {
  ADDON_ID,
  DEFAULT_LOCALE,
  GLOBAL_KEY,
  LOCALE_LABELS,
  PARAM_KEY,
  SUPPORTED_LOCALES,
} from './constants';

const LocaleSwitcher = React.memo(function LocaleSwitcher() {
  const [{ [GLOBAL_KEY]: current }, updateGlobals] = useGlobals();
  const parameters = useParameter<Partial<EasLocaleParameters>>(PARAM_KEY, {});

  if (parameters.disable || parameters.localeOverride) return null;

  const active = current ?? DEFAULT_LOCALE;

  return (
    <Select
      ariaLabel="语言 / Language"
      tooltip="切换语言 / Switch language"
      icon={<EasLanguageIcon width={16} height={16} />}
      defaultOptions={active}
      options={SUPPORTED_LOCALES.map((locale) => ({ title: LOCALE_LABELS[locale], value: locale }))}
      onSelect={(selected) => updateGlobals({ [GLOBAL_KEY]: selected })}
    />
  );
});

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    title: '语言 / Language',
    type: types.TOOL,
    match: ({ viewMode, tabId }) => !!viewMode?.match(/^(story|docs)$/) && !tabId,
    render: LocaleSwitcher,
    paramKey: PARAM_KEY,
  });
});
```

| #   | 规则                                                                                               |
| --- | -------------------------------------------------------------------------------------------------- |
| 1   | **必须**用 `addons.register(ADDON_ID, () => {...})` + `addons.add(TOOL_ID, {...})`                 |
| 2   | 工具控件**必须**用 Storybook 官方组件（`Select` / `Toggle` / `Button`）—— ❌ **禁止**手写 DOM 下拉 |
| 3   | `match` **必须**限定只在 `story` / `docs` 视图显示，且排除带 `tabId` 的附加面板                    |
| 4   | **必须**用 `useParameter(PARAM_KEY, {})` 支持 story 级参数（禁用 / 锁定）                          |
| 5   | **必须**支持「参数生效时隐藏控件」—— 返回 `null` 而非禁用态（与官方 addon 一致）                   |
| 6   | 图标**必须**用本库 `src/ui/icon/svg/eas-icon` 中的图标（`EasLanguageIcon` 等）                     |

### 5.5 bundle 体积控制 —— manager 不在 Vite 模块图内

> ⚠️ **这是本地 addon 最容易踩的坑**：manager bundle 由 esbuild 独立打包，
> **不经过 Vite 的模块图与 tree-shaking 优化策略**。从 `src/` import 的模块
> 会**整块**进 manager bundle。

| #   | 规则                                                                                            |
| --- | ----------------------------------------------------------------------------------------------- |
| 1   | ❌ **禁止**从 `src/utils/component-messages.ts` import —— 会把 **61KB** 文案表拖进工具栏 bundle |
| 2   | 需要复用的枚举 / 标签**必须**在 `constants.ts` 手工同步，并在注释中标注同步来源                 |
| 3   | manager bundle 体积**必须**控制在 **数十 KB** 量级（`eas-addon-locale` 实测 **4.7KB**）         |
| 4   | 图标**可以**直接从 `src/` import —— SVG path 极小，tree-shaking 后仅数 KB                       |

**验证命令**：

```bash
# 构建后检查 manager bundle 体积与是否拖入文案表
Get-ChildItem storybook-static/sb-addons/<addon-name>-*/manager-bundle.js | Select-Object Name,Length
Select-String -Path storybook-static/sb-addons/<addon-name>-*/manager-bundle.js -Pattern "useComponentMessage|processUiMessage"
# 第二条命令应 0 命中
```

### 5.6 preview 端骨架

```tsx
// .storybook/addon/eas-addon-locale/preview.tsx
import { useEffect } from 'react';
import { useGlobals } from 'storybook/preview-api';

import { LocaleProvider } from '../../../src/providers';
import { GLOBAL_KEY, normalizeLocale } from './constants';

export const withLocale = (
  Story: () => React.ReactElement,
  context: { globals?: Record<string, unknown> },
) => {
  const [globals, updateGlobals] = useGlobals();

  const rawLocale = (globals[GLOBAL_KEY] ?? context.globals?.[GLOBAL_KEY]) as string | undefined;
  const locale = normalizeLocale(rawLocale);

  // 回写规范化后的值，避免「工具栏显示 A、组件渲染 B」
  useEffect(() => {
    if (rawLocale && rawLocale !== locale) {
      updateGlobals({ [GLOBAL_KEY]: locale });
    }
  }, [rawLocale, locale, updateGlobals]);

  return (
    <LocaleProvider
      locale={locale}
      setLocale={(next) => updateGlobals({ [GLOBAL_KEY]: normalizeLocale(next) })}
    >
      <Story />
    </LocaleProvider>
  );
};

export const initialGlobals = { [GLOBAL_KEY]: 'zh-CN' };
export const globalTypes = {
  [GLOBAL_KEY]: {
    name: 'Language',
    description: '组件库内置 i18n 的当前语言',
    defaultValue: 'zh-CN',
  },
};
```

| #   | 规则                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **必须**导出 `withXxx` 装饰器本体 —— 作为**可复用的备选实现**（本项目未挂载，见 §5.7 方式 A）                                                                        |
| 2   | ❌ **禁止**导出 `decorators` —— Storybook 会把 addon preview 入口当 preview annotation 自动加载，其 `decorators` 与 `preview.tsx` 的**合并**，导致装饰器应用**两次** |
| 3   | **必须**对 global 值做**归一化**（`normalizeLocale`）并**回写**，保证两侧取值一致                                                                                    |
| 4   | `useGlobals` **必须**在装饰器**顶层**调用 —— 不能放进嵌套组件里再调（拿不到 story context）                                                                          |
| 5   | **必须**导出 `initialGlobals` 与 `globalTypes`                                                                                                                       |

### 5.7 装饰器挂载点 —— 有且仅有一处

> 📌 **两种合法挂载方式**，选其一，**不可同时用**：

**方式 A（推荐，本项目采用）** —— 在 `preview.tsx` 的装饰器里**直接**包 Provider：

```tsx
// .storybook/preview.tsx
import { useGlobals } from 'storybook/preview-api';
import { GLOBAL_KEY, normalizeLocale } from './addon/eas-addon-locale/constants';
import { LocaleProvider } from '../src/providers';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const [globals, updateGlobals] = useGlobals();
      const locale = normalizeLocale(
        (globals[GLOBAL_KEY] ?? context.globals?.[GLOBAL_KEY]) as string | undefined,
      );

      return (
        <ThemeProvider theme={context.globals.theme || 'light'}>
          {/* 📌 唯一挂载点；`setLocale` 桥接 globals 实现双向同步 */}
          <LocaleProvider
            locale={locale}
            setLocale={(next: string) => {
              updateGlobals({ [GLOBAL_KEY]: normalizeLocale(next) });
            }}
          >
            <Story />
          </LocaleProvider>
        </ThemeProvider>
      );
    },
    withThemeByClassName({ themes: { light: 'light', dark: 'dark' }, defaultTheme: 'light' }),
  ],
};
```

**方式 B** —— 挂载 addon 提供的 `withLocale`（适合「一行搞定」的场景）：

```tsx
// .storybook/preview.tsx
import { withLocale } from './addon/eas-addon-locale/preview';

const preview: Preview = {
  decorators: [
    withLocale, // ← 唯一挂载点；且挂在最外层
    (Story, context) => {
      /* 主题装饰器 */
    },
    withThemeByClassName({ themes: { light: 'light', dark: 'dark' }, defaultTheme: 'light' }),
  ],
};
```

| #   | 规则                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------- |
| 1   | Provider **有且仅有一处**挂载点 —— 嵌套两层会导致 `setLocale` 被内层屏蔽                                       |
| 2   | 方式 A **必须**把 `setLocale` **桥接回 globals** —— 否则 story 内的切换组件切不动工具栏                        |
| 3   | Provider **必须**包在 Theme / Notify 等 Provider **之内**，让它们也在语言上下文之内                            |
| 4   | Provider **必须**把状态**收敛到本库的 Provider**（`LocaleProvider` / `ThemeProvider`），**不要**另造局部 state |

### 5.8 注册方式 —— 必须绝对路径

见 §4.4「注册方式（**必须**用绝对路径）」。要点复述：

| #   | 规则                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------- |
| 1   | **必须**用**绝对路径**注册 —— 相对路径被当**包名**解析，addon **静默跳过**（无报错）                           |
| 2   | ❌ **禁止** helper 命名为 `getAbsolutePath` —— Storybook **保留名**，会污染 `addons` 数组并注入 `addon-vitest` |
| 3   | **必须**只让 helper 服务于本地 addon 这一处，**不要**用它包裹 `addons` 里的包名                                |

### 5.9 与本库 Provider 的协同

本地 addon 的 preview 端**必须**复用本库公开的 Provider，而非自造状态。

| Provider                                                 | 位置                                | 提供的上下文                                                     |
| -------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| [`LocaleProvider`](../src/providers/locale-provider.tsx) | `src/providers/locale-provider.tsx` | `locale` + `setLocale`（含 localStorage 持久化）                 |
| [`ThemeProvider`](../src/providers/theme-provider.tsx)   | `src/providers/theme-provider.tsx`  | `theme` + `resolvedTheme` + `setTheme`（含 localStorage 持久化） |

| #   | 规则                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------ |
| 1   | **必须**复用本库 Provider —— Storybook 侧等于**同时验证了消费方的真实接入方式**                        |
| 2   | `setLocale` **必须**桥接到 globals —— 让 story 内组件调用 `useLocale().setLocale()` 也能驱动工具栏状态 |
| 3   | Provider 内的 `localStorage` 持久化**必须**保留 —— 刷新 Storybook 后语言不丢，与线上体验一致           |
| 4   | 持久化键名**必须**加 `eas-` 前缀（如 `eas-ui-locale`）—— 避免与消费方自身的键冲突                      |

### 5.10 新增 addon 检查清单

- [ ] 目录名以 `eas-` 前缀，位于 `.storybook/addon/`
- [ ] `package.json`：`private: true` + `type: "module"` + `exports` 含 `./manager` 与 `./preview`
- [ ] `constants.ts` 集中定义全局键 / 枚举 / 标签 / 归一化函数，双端共用
- [ ] globals 键加 `eas-` 前缀，未占用 Storybook 保留键
- [ ] manager 端显式 `import * as React from 'react'`
- [ ] manager 端用官方组件（`Select` / `Toggle` / `Button`），未手写 DOM
- [ ] manager 端 `match` 限定 `story` / `docs` 视图
- [ ] manager bundle 未拖入运行时模块（`component-messages.ts` 等），体积在数十 KB 量级
- [ ] preview 端导出 `withXxx` / `initialGlobals` / `globalTypes`，**未**导出 `decorators`
- [ ] 装饰器在 `.storybook/preview.tsx` 有且仅有一处挂载点，且挂在最外层
- [ ] preview 端复用本库 Provider，`setLocale` 桥接 globals
- [ ] global 值已归一化并回写
- [ ] `pnpm storybook:build` exit 0，产物含 `sb-addons/<addon-name>-*/manager-bundle.js`
- [ ] `pnpm type-check` / `pnpm lint` 通过

---

## M. 11 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**。

### 维度 ① story 文件与组件一一对应

**扫描命令**：

```bash
# 列出缺 story 文件的组件目录（空 = 合规）
Get-ChildItem src -Directory | Where-Object {$_.Name -notin @('types','utils')} | ForEach-Object {
  $d = $_.Name
  if (-not (Test-Path "src/$d/$d.stories.tsx")) { "MISSING story: src/$d/$d.stories.tsx" }
}
```

**判定规则**：

- ❌ 违规：组件目录无对应 `<component>.stories.tsx`
- ✅ 合规：输出为空

### 维度 ② meta `title` 前缀必须是 `EASAI/`

**扫描命令**：

```bash
rg -n "^\s{2}title:\s*'(?!EASAI/)" -g "src/**/*.stories.tsx" -P
```

**判定规则**：

- ❌ 违规：meta 的 `title` 不以 `EASAI/` 开头
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规
const meta = { title: 'Button', component: Button } satisfies Meta<typeof Button>;

// ✅ 修正（src/ui/button/button.stories.tsx:19）
const meta: Meta<typeof Button> = { title: 'EASAI/Button', component: Button };
```

> ⚠️ **正则必须锚定 meta 层级**（`^\s{2}title:`）—— story 的 `args` 里也可能有 `title` 字段（如 Toast 的标题），不锚定会误报。

### 维度 ③ meta 必须声明 `autodocs`

**扫描命令**：

```bash
# 列出缺 autodocs 的 story 文件（空 = 合规）
Get-ChildItem src -Recurse -Filter "*.stories.tsx" | ForEach-Object {
  if (-not (Select-String -Path $_.FullName -Pattern "autodocs" -Quiet)) { $_.FullName }
}
```

**判定规则**：

- ❌ 违规：meta 未声明 `tags: ['autodocs']` → 无自动文档页
- ✅ 合规：输出为空

**修正模式**：

```tsx
// ❌ 违规
const meta: Meta<typeof Select> = { title: 'EASAI/Select', component: Select };

// ✅ 修正
const meta: Meta<typeof Select> = {
  title: 'EASAI/Select',
  component: Select,
  tags: ['autodocs'],
};
```

### 维度 ④ 必须用 CSF3 写法（meta 显式标注 + Story 标注组件本体）

**扫描命令**：

```bash
# 列出未显式标注 Meta<typeof X> 的 story 文件（空 = 合规）
Get-ChildItem src -Recurse -Filter "*.stories.tsx" | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  if ($t -notmatch 'const\s+meta\s*:\s*Meta<typeof\s+\w+>\s*=') { $_.Name }
}

# 列出仍使用 StoryObj<typeof meta> 的 story 文件（空 = 合规）
Get-ChildItem src -Recurse -Filter "*.stories.tsx" | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  if ($t -match 'StoryObj<typeof\s+meta>') { $_.Name }
}
```

**判定规则**：

- ❌ 违规 1：meta 未用 `const meta: Meta<typeof X> = {...};` 显式标注
- ❌ 违规 2：`type Story = StoryObj<typeof meta>;`（会让含必填 props 的组件在 `render` 形式 story 上报 TS2322）
- ✅ 合规：两条命令输出均为空

**修正模式**：

```tsx
// ❌ 违规 A —— Story 用 typeof meta，含必填 props 的组件会报 TS2322
const meta: Meta<typeof Form> = { title: 'EASAI/Form', component: Form, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;

// ❌ 违规 B —— meta 未标注，args 类型无校验
const meta = { title: 'EASAI/Button', component: Button } satisfies Meta<typeof Button>;

// ✅ 修正
const meta: Meta<typeof Form> = { title: 'EASAI/Form', component: Form, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Form>;
```

### 维度 ⑤ story 导出名必须 PascalCase

**扫描命令**：

```bash
rg -n "^export const [a-z]" -g "src/**/*.stories.tsx"
```

**判定规则**：

- ❌ 违规：story 导出名小写开头
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规
export const default: Story = { args: {} };

// ✅ 修正（src/ui/spinner/spinner.stories.tsx:50）
export const Default: Story = { args: { size: 'md' } };
```

### 维度 ⑥ 回调 props 必须用 `fn()` 桩

**扫描命令**：

```bash
# 列出 args 里传了裸函数的 story 文件（空 = 合规）
rg -n "^\s+(on[A-Z]\w+):\s*\(\)\s*=>" -g "src/**/*.stories.tsx"
```

**判定规则**：

- ❌ 违规：story 的 `args` 里用裸函数当回调（每次渲染新函数 → controls 不稳定）
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规
args: {
  onChange: () => console.log('changed');
}

// ✅ 修正（src/ui/select/select.stories.tsx:11,57-58）
import { fn } from 'storybook/test';
args: {
  onChange: fn();
}
```

> 📌 `console.log` 在 story 里属于**交互演示**，不属于「运行时日志」—— 但仍**必须**用 `fn()` 桩替代（维度 ⑥）。

### 维度 ⑦ 禁止硬编码颜色

**扫描命令**：

```bash
rg -n "#[0-9a-fA-F]{3,8}\b" -g "src/**/*.stories.tsx"
```

**判定规则**：

- ❌ 违规：story 里硬编码颜色（主题变量已提供，改主题时不生效）
- ✅ 合规：0 命中
- ⚠️ **例外**：`src/ui/badge/badge.stories.tsx:262` 的 `'#ff00ff'` 是**演示 `style` 透传自定义色值**的能力，属正当用途

**修正模式**：

```tsx
// ❌ 违规
<div className="bg-[#ff0000]" />

// ✅ 修正
<div className="bg-[var(--destructive)]" />
```

### 维度 ⑧ Storybook 配置必须指向真实布局

**扫描命令**：

```bash
# 检查 stories glob 与 framework
rg -n "stories:|framework:|@storybook/react" .storybook/main.ts
# 检查 preview 是否引入样式（入口 = src/theme/styles.css）
rg -n "src/theme/style\.css" .storybook/preview.tsx
```

**判定规则**：

- ❌ 违规：`stories` glob 不指向 `../src/**/*.stories.@(ts|tsx)`；或 framework 不是 `@storybook/react-vite`；或 preview 未 `import '../src/theme/styles.css'`
- ✅ 合规：三条均满足

**修正模式**：

```ts
// ❌ 违规 —— glob 指向不存在的目录
const config: StorybookConfig = {
  stories: ['../src/components/ui/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: { name: '@storybook/react' },
};

// ✅ 修正（.storybook/main.ts:21-26）
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: { name: '@storybook/react-vite', options: {} },
};
```

### 维度 ⑨ 禁止安装 `addon-vitest`

**扫描命令**：

```bash
rg -n "addon-vitest" package.json .storybook/main.ts | rg -v ":\s*(\*|//|/\*)"
```

> 📌 **必须排除注释行** —— `main.ts` 的 JSDoc 里会**引用**该 addon 名来说明「为什么不用它」
> （解释 Storybook 保留名 `getAbsolutePath` 的副作用）。
> 那是**说明文字**，不是依赖声明 —— 不过滤会把合规代码误判为违规。

**判定规则**：

- ❌ 违规：**非注释行**出现 `addon-vitest`（即真的装了这个包 / 注册了这个 addon）
- ✅ 合规：过滤注释后 0 命中

**理由**：它走浏览器模式（需 playwright 浏览器二进制），CI 沉重且与现有 jsdom 单测链路**重复建设**。

**修正模式**：

```json
// ❌ 违规
"devDependencies": { "@storybook/addon-vitest": "^10.6.5" }

// ✅ 修正 —— 用独立的 pnpm test 链路
"scripts": { "test": "vitest run" }
```

> ⚠️ **同源禁止项**：`@vitest/browser-playwright` / `playwright` / `@vitest/coverage-v8`
> 之外的**浏览器模式**依赖（`@vitest/browser*` / `playwright`）同样禁止 ——
> 用 `rg -n "browser-playwright|\"playwright\"" package.json` 核对，0 命中为合规。
> （`@vitest/coverage-v8` **允许** —— `test:coverage` 脚本与 CI 的 `coverage/lcov.info` 上传需要它。）

### 维度 ⑩ 本地 addon 必须正确注册

**扫描命令**：

```bash
# 1) addon 目录与双入口映射
Get-ChildItem .storybook/addon -Directory | ForEach-Object {
  $pkg = "$($_.FullName)/package.json"
  if (-not (Test-Path $pkg)) { "MISSING package.json: $($_.Name)"; return }
  $j = Get-Content $pkg -Raw | ConvertFrom-Json
  if (-not $j.exports.'./manager' -or -not $j.exports.'./preview') { "MISSING exports: $($_.Name)" }
}

# 2) main.ts 的 addons 数组不得出现保留名 getAbsolutePath
#    （Storybook 按**函数名**识别，故只看代码行，排除注释）
rg -n "getAbsolutePath" .storybook/main.ts | rg -v "^\d+:\s*(\*|//)"

# 3) 本地 addon 必须以绝对路径注册
rg -n "resolveLocalAddon" .storybook/main.ts
```

**判定规则**：

- ❌ 违规 1：addon 目录缺 `package.json`，或 `exports` 缺 `./manager` / `./preview`
- ❌ 违规 2：`main.ts` 出现 `getAbsolutePath`（保留名 → 会污染 `addons` 数组并注入 `addon-vitest`）
- ❌ 违规 3：`main.ts` 未用绝对路径注册本地 addon（相对路径 → addon 被**静默跳过**）
- ✅ 合规：三条均满足

**修正模式**：

```ts
// ❌ 违规 —— 保留名 + 相对路径（addon 静默失效）
function getAbsolutePath(value: string): string {
  return join(dirname(fileURLToPath(import.meta.url)), value);
}
addons: ['./addon/eas-addon-locale'];

// ✅ 修正（.storybook/main.ts）
function resolveLocalAddon(value: string): string {
  return join(dirname(fileURLToPath(import.meta.url)), value);
}
addons: [resolveLocalAddon('./addon/eas-addon-locale')];
```

### 维度 ⑪ Trigger / Close 类组件必须用 `asChild`

> 📌 对应条文：§2.5「Trigger / Close 类组件与 `asChild`」。

**扫描命令**：

```bash
# 找出 Trigger / Close / SubTrigger 的 JSX 使用点（不含 asChild 的）
rg -n "<(Drawer|Dialog|AlertDialog|Sheet|Popover|Tooltip|HoverCard|DropdownMenu|ContextMenu|Select|Tabs)[A-Za-z]*(Trigger|Close|SubTrigger)\b(?![^>]*asChild)" \
  -g "src/**/*.stories.tsx" --pcre2
```

**判定规则**：

- ❌ 违规：Trigger / Close 类组件的 JSX 开标签**缺 `asChild`**，且其 children 内含 `<button>` / `<a>` 等交互元素
- ✅ 合规：加了 `asChild`（Radix 会把 props 合并到子元素，不额外渲染包裹节点）
- ⚠️ **例外**：`ContextMenuTrigger` 底层渲染 `<span>`（非 `<button>`），不加 `asChild` **不构成非法 DOM**，但仍**应加** —— 否则触发区与按钮外观脱节（`<span>` 无 `display:inline-block`、无边框内边距、`cursor` 非 `context-menu`）

**修正模式**：

```tsx
// ❌ 违规 —— Trigger 自身渲染交互元素，内部再放 <button> → <button> 嵌套 <button>
<DrawerTrigger>
  <button type="button">打开</button>
</DrawerTrigger>

// ✅ 修正 —— asChild 让 Radix 把 props 合并到子元素
<DrawerTrigger asChild>
  <button type="button" className={triggerClass}>
    打开
  </button>
</DrawerTrigger>
```

---

## M+1. 历史基准（2026-11-01 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                                     | 数值                        |
| ---------------------------------------- | --------------------------- |
| story 文件数                             | **82**                      |
| story 文件全部在 `__tests__/` 下         | **82 / 82（100%）**         |
| `title` 前缀全部为 `EASAI/`              | 82/82                       |
| 声明 `autodocs` 的文件                   | 82/82                       |
| 显式标注 `Meta<typeof X>` 的文件         | 82/82                       |
| `StoryObj<typeof X>`（非 `typeof meta`） | 82/82                       |
| `pnpm storybook:build` 产物              | `storybook-static/`，exit 0 |

### 重测命令

```bash
pnpm storybook:build
```

---

## M+2. 豁免清单

| 对象                                                                      | 豁免依据                                                                                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/badge/__tests__/badge.stories.tsx` 的 `'#ff00ff'`                 | **演示用途**：展示 `style` 属性透传自定义色值的能力（维度 ⑦ 例外）                                                                            |
| `src/ui/button/__tests__/button.stories.tsx` 的 `parameters.themes`       | **并存写法**：与全局 `withThemeByClassName` 并行使用，不冲突；**新增** story 不必重复声明                                                     |
| `src/ui/alert-dialog/alert-dialog-modal.tsx` 无 story                     | **已知缺口**：该文件是 `alert-dialog` 目录内的第二实现，未纳入 barrel、也无 test / stories。补齐需单独排期（见 `component-standard.md` §M+2） |
| `src/ui/button/__tests__/button.stories.tsx` 的 `'#ffffff'` / `'#1a1a1a'` | **工具栏色板声明**：Storybook 主题切换器的颜色预览值，属**工具配置**而非组件样式（维度 ⑦ 例外）                                               |

---

## M+3. 冲突裁决

| #   | 冲突点            | 旧规范声明（easbot monorepo 版） | 实际情况（本库）                                               | 裁决                                            |
| --- | ----------------- | -------------------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| C1  | Storybook builder | `addon-vitest`（浏览器模式）     | `addon-docs` / `a11y` / `themes` / `links` / `onboarding`      | **不装 `addon-vitest`**（维度 ⑨）               |
| C2  | story 文件位置    | 未涉及                           | `src/ui/<component>/__tests__/<component>.stories.tsx`         | **与测试文件同目录**（§1.1）                    |
| C3  | 主题机制          | 未涉及                           | `data-theme` attribute + `withThemeByClassName`                | **两者并存**（§4.1）                            |
| C4  | meta 类型标注     | 未涉及                           | 全库 82/82 用 `Meta<typeof X>` 显式标注 + `StoryObj<typeof X>` | **必须显式标注 + Story 标注组件本体**（维度 ④） |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审 story 时的**自查**清单（不是任务列表，是合规性自检表）。

### 新增组件 story 时

- [ ] 文件在 `src/ui/<component>/__tests__/<component>.stories.tsx`
- [ ] 用 CSF3 写法（`const meta: Meta<typeof X> = {...}` + `export default meta` + `type Story = StoryObj<typeof X>`）
- [ ] `title` 是 `EASAI/<Component>`
- [ ] `tags: ['autodocs']`
- [ ] 有 `Default` story
- [ ] 每个变体 / 尺寸都有对应 story（`Variants` / `Sizes`）
- [ ] 状态类有对应 story（`Loading` / `Disabled`）
- [ ] 枚举型 props 声明了 `argTypes`（`control` / `options` / `description` / `table.defaultValue`）
- [ ] 回调 props 用 `fn()` 桩
- [ ] 无硬编码颜色

### 评审 story 时

- [ ] 维度 ① ~ ⑩ 已全跑（一次跑全库）
- [ ] `pnpm storybook:build` exit 0
- [ ] light / dark 两种主题下样式都正常（`data-theme` 生效）
- [ ] 移动端场景声明了 `viewport`
- [ ] 工具栏语言下拉可切换，story 内 i18n 文案随之切换（zh-CN / en-US）

### 评审本地 addon 时

- [ ] addon 目录含 `package.json`，`exports` 同时声明 `./manager` 与 `./preview`
- [ ] `main.ts` 用**绝对路径**注册（`resolveLocalAddon`），**未**使用保留名 `getAbsolutePath`
- [ ] globals 键为 `easLocale`，未占用 Storybook 保留键（`locale` / `theme`）
- [ ] `LocaleProvider` **有且仅有一处**挂载点（`.storybook/preview.tsx`），且 `setLocale` 已桥接 globals
- [ ] manager 端显式 `import * as React from 'react'`
- [ ] manager bundle 未拖入 `src/utils/component-messages.ts`（体积应在数 KB 量级）
- [ ] `pnpm storybook:build` 产出 `storybook-static/sb-addons/eas-addon-locale-*/manager-bundle.js`

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测**新建**：① 确立 **CSF3** 写法（`satisfies Meta` + `export default meta`）为唯一标准；② 确立 meta 四项必填（`title` 前缀 `EASAI/` / `component` / `tags: ['autodocs']` / `parameters`）；③ 确立 story 导出命名表（`Default` / `Variants` / `Sizes` / `Combination` / `Playground` 等）与 PascalCase 硬要求；④ 确立 `argTypes` 五项结构（`control` / `options` / `description` / `table.defaultValue`）与 `fn()` 桩规范；⑤ 确立**主题机制对齐**要求（装饰器设 `data-theme`，与主题文件 CSS 选择器一致）；⑥ 9 项扫描维度全部实跑验证（现状：33/34 声明 autodocs、9 个有 argTypes、2 个有 decorators） |
| 1.1.0 | 2026-11-03 | **新增本地 addon 规范**。配合内置 i18n 验收落地 `eas-addon-locale`（工具栏中英文切换）：① 新增 §4.4「本地 addon —— 语言切换」，确立**双入口 `exports` 映射**（`./manager` + `./preview`）、**绝对路径注册**（相对路径会被当包名**静默跳过**）、**globals 通道**（键 `easLocale`）、**装饰器唯一挂载点**（addon 不导出 `decorators`，避免与 `preview.tsx` 合并导致 `withLocale` 应用两次）、**manager 端 classic JSX** 约束与 bundle 体积控制（不 import `component-messages.ts`）；② 新增**维度 ⑩**「本地 addon 必须正确注册」；③ 修订记录表 §M+4 增补「评审本地 addon 时」自查项                                                                                 |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 命名 / 导出
- [`css-standard.md`](./css-standard.md) —— CSS 变量 / 主题机制（`data-theme`）
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试写法（与 story 的分工）
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc
- [`code-quality.md`](./code-quality.md) —— lint / type-check / 构建 / 依赖
- [`.storybook/main.ts`](../.storybook/main.ts) / [`.storybook/preview.tsx`](../.storybook/preview.tsx) —— 配置真值源
