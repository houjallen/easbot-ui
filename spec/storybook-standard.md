---
name: storybook-standard
description: 该规范定义 easbot-ui 组件库的 Storybook 契约，含 CSF3 写法（meta satisfies Meta / StoryObj / export default meta）、meta 必填字段（title 前缀 EASAI/ / component / tags autodocs / parameters）、story 导出命名规则与覆盖维度（Default / Variants / Sizes / 状态 / 组合）、argTypes 写法（control / options / description / table.defaultValue）、装饰器规范（全局主题装饰器与局部包裹装饰器）、主题切换机制（withThemeByClassName 与 data-theme 的对齐）、Storybook 配置基线（react-vite builder / stories glob / addon 清单 / viteFinal alias）、9 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与新增组件 story 检查清单。当编写组件 story、配置 Storybook 或排查 story 不显示时参考。
category: specification
version: 1.0.0
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

| 配置项             | 值                                                                                | 说明                                                 |
| ------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `framework`        | `@storybook/react-vite`                                                           | Storybook 10 默认推荐；**无需**额外 `vite.config.ts` |
| `stories`          | `['../src/**/*.stories.@(ts\|tsx)']`                                              | glob **必须**匹配真实布局                            |
| `addons`           | `addon-docs` / `addon-a11y` / `addon-themes` / `addon-links` / `addon-onboarding` | ❌ **不装** `addon-vitest`                           |
| `docs.defaultName` | `'Docs'`                                                                          | 文档页默认名                                         |
| `viteFinal`        | 注入 `@` → `src/` 的 alias                                                        | 与 `vitest.config.ts` 的 alias 一致                  |

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

---

## M. 9 项扫描维度（评审必跑）

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
rg -n "addon-vitest" package.json .storybook/main.ts
```

**判定规则**：

- ❌ 违规：出现 `addon-vitest`
- ✅ 合规：0 命中

**理由**：它走浏览器模式（需 playwright 浏览器二进制），CI 沉重且与现有 jsdom 单测链路**重复建设**。

**修正模式**：

```json
// ❌ 违规
"devDependencies": { "@storybook/addon-vitest": "^10.6.5" }

// ✅ 修正 —— 用独立的 pnpm test 链路
"scripts": { "test": "vitest run" }
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

- [ ] 维度 ① ~ ⑨ 已全跑（一次跑全库）
- [ ] `pnpm storybook:build` exit 0
- [ ] light / dark 两种主题下样式都正常（`data-theme` 生效）
- [ ] 移动端场景声明了 `viewport`

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测**新建**：① 确立 **CSF3** 写法（`satisfies Meta` + `export default meta`）为唯一标准；② 确立 meta 四项必填（`title` 前缀 `EASAI/` / `component` / `tags: ['autodocs']` / `parameters`）；③ 确立 story 导出命名表（`Default` / `Variants` / `Sizes` / `Combination` / `Playground` 等）与 PascalCase 硬要求；④ 确立 `argTypes` 五项结构（`control` / `options` / `description` / `table.defaultValue`）与 `fn()` 桩规范；⑤ 确立**主题机制对齐**要求（装饰器设 `data-theme`，与主题文件 CSS 选择器一致）；⑥ 9 项扫描维度全部实跑验证（现状：33/34 声明 autodocs、9 个有 argTypes、2 个有 decorators） |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 命名 / 导出
- [`css-standard.md`](./css-standard.md) —— CSS 变量 / 主题机制（`data-theme`）
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试写法（与 story 的分工）
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc
- [`code-quality.md`](./code-quality.md) —— lint / type-check / 构建 / 依赖
- [`.storybook/main.ts`](../.storybook/main.ts) / [`.storybook/preview.tsx`](../.storybook/preview.tsx) —— 配置真值源
