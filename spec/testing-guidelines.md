---
name: testing-guidelines
description: 该规范定义 easbot-ui 组件库的测试契约，含 Vitest 4 + jsdom 配置基线（environment / globals / include / setupFiles / css:false / pool / timeout / coverage）、测试文件位置与命名、用例结构（describe 三层定位 + it 中文命名）、四大覆盖维度（渲染 / 状态 / 交互 / 无障碍）、断言选型（语义化查询优先，toHaveClass 断言 CSS 变量任意值）、mock 与 polyfill 规范（jsdom 未实现的 ResizeObserver / scrollIntoView / matchMedia）、测试文件头注解四段式、断言与实现同源原则、10 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与新增组件测试检查清单。当编写组件单测、修复测试失败或评审测试覆盖率时参考。
category: specification
version: 1.0.0
baseline-date: 2026-10-31
tags: [easbot-ui, testing, vitest, vitest4, jsdom, rtl, mock, polyfill, coverage, bdd]
related:
  - spec-index.md
  - component-standard.md
  - css-standard.md
  - storybook-standard.md
  - code-annotation-standard.md
  - code-quality.md
---

# EASBot UI 测试规范 (Testing Guidelines)

> **真值源**：本规范以 [`vitest.config.ts`](../vitest.config.ts)、[`tests/setup.ts`](../tests/setup.ts)
> 与 `src/**/*.test.tsx` 的 34 个测试文件为唯一执行真值；规范与实现冲突时**规范改**。
>
> **与其它规范的分工**（三者**不重复**）：
>
> | 关注点                   | 归属文档                                           | 本规范对应章节         |
> | ------------------------ | -------------------------------------------------- | ---------------------- |
> | 组件目录 / 命名 / 导出   | [`component-standard.md`](./component-standard.md) | §1.2（仅测试文件位置） |
> | CSS 变量 / 语义类怎么写  | [`css-standard.md`](./css-standard.md)             | §5.3（仅断言什么）     |
> | Story 怎么写             | [`storybook-standard.md`](./storybook-standard.md) | —                      |
> | lint / type-check / 构建 | [`code-quality.md`](./code-quality.md)             | §2（仅门禁）           |
>
> **历史基准**：v1.0.0 锁定 2026-10-31 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本规范定义**组件单测怎么写、怎么跑、怎么判定**。本库是**单包**组件库（**不是** workspace monorepo），
测试链路是**一层**：`vitest.config.ts`（根）→ `tests/setup.ts` → `src/<component>/<component>.test.tsx`。

**核心约束**：

- ✅ 测试文件**必须**与组件源码同目录，命名 `<component>.test.tsx`
- ✅ 断言 API **必须**用 `vi.*`（**禁止** `jest.*`）
- ✅ matcher **必须**由 `tests/setup.ts` 全局注册，测试文件**禁止**逐个 import `@testing-library/jest-dom`
- ✅ 组件测试**必须**覆盖四类维度：**渲染 / 状态 / 交互 / 无障碍**（各至少一）
- ✅ 查询**必须**优先语义化（`getByRole` / `getByLabelText` / `getByText`），`getByTestId` 仅作最后手段
- ✅ jsdom 未实现的浏览器 API **必须**在测试文件内**局部 polyfill**，**禁止**污染全局 `setup.ts`
- ❌ 禁止 `vi.mock()` 模块级 mock（本库组件无外部依赖需要 mock）
- ❌ 禁止在测试里断言**未注册**的 Tailwind 语义类（会静默失效，见 `css-standard.md` §3.1）
- ❌ 禁止混用 `it(` 与 `test(`（同一文件内）

---

## 1. 测试文件契约

### 1.1 位置与命名

```
src/<component>/<component>.test.tsx
```

| 规则                                                         | 真值源                                       |
| ------------------------------------------------------------ | -------------------------------------------- |
| **必须**与组件源码同目录（**不是** `__tests__/` 子目录）     | 34 个测试文件全部在组件目录内                |
| **必须**命名 `<component>.test.tsx`（与实现同名）            | `src/button/button.test.tsx`                 |
| **禁止**集中到 `tests/` 目录                                 | `tests/` 只放 `setup.ts`                     |
| **禁止**集成测试 / e2e 单独命名（`.integration.` / `.e2e.`） | 本库**无**集成测试层（纯组件，无跨组件流程） |

### 1.2 vitest 配置基线

> **真值源**：[`vitest.config.ts`](../vitest.config.ts)

| 配置项              | 值                                                                       | 说明                                   |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------------- |
| `environment`       | `'jsdom'`                                                                | 组件是 React DOM 组件，必须有 DOM 环境 |
| `globals`           | `true`                                                                   | 提供 `describe` / `it` / `expect`      |
| `include`           | `['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}']`                 | 与真实布局匹配                         |
| `exclude`           | `node_modules` / `dist` / `storybook-static`                             | 排除构建产物                           |
| `setupFiles`        | `['./tests/setup.ts']`                                                   | **全局设置入口**                       |
| `css`               | `false`                                                                  | 样式靠类名断言，测试环境不处理 CSS     |
| `reporters`         | `['verbose']`                                                            | 逐用例输出                             |
| `pool`              | `'threads'`                                                              | 组件测试无共享状态，并行更快           |
| `testTimeout`       | `30000`                                                                  | 涉及定时器 / 动画的用例留足余量        |
| `hookTimeout`       | `30000`                                                                  | 同上                                   |
| `coverage.provider` | `'v8'`                                                                   | —                                      |
| `coverage.exclude`  | `**/*.stories.tsx` / `**/*.test.tsx` / `src/index.ts` / `src/styles.css` | 排除非业务代码                         |

> ⚠️ **`include` 的 glob 必须与真实布局一致** —— 历史上配过 `src/**/__tests__/**`，导致 `No test files found`。
>
> ⚠️ **`css: false` 是刻意的** —— Tailwind v4 的 CSS 处理在 jsdom 下无意义且拖慢测试。

### 1.3 全局设置

> **真值源**：[`tests/setup.ts`](../tests/setup.ts)

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**规则**：

| #   | 规则                                                                   |
| --- | ---------------------------------------------------------------------- |
| 1   | matcher **必须**在这里通过 `@testing-library/jest-dom/vitest` 全局注册 |
| 2   | **必须**注册 RTL `cleanup()` 的 `afterEach`（自动清理由 setup 承担）   |
| 3   | ❌ **禁止**在测试文件里逐个 `import '@testing-library/jest-dom'`       |
| 4   | ❌ **禁止**在 `setup.ts` 里放**组件专属** polyfill（见 §6.2）          |

> 📌 **v6+ 的子路径是 `/vitest`**：`@testing-library/jest-dom` 的 v6 已移除该子路径，v7 需写 `@testing-library/jest-dom/vitest`。

---

## 2. 命令

> **唯一真值源 = `package.json#scripts`**。

```bash
pnpm test                    # vitest run（单次，提交前主入口）
pnpm test:watch              # vitest（监听）
pnpm test:coverage           # vitest run --coverage
pnpm vitest run src/button                    # 单目录
pnpm vitest run src/button/button.test.tsx    # 单文件
```

> ⚠️ **本库**只有 `pnpm test`（不是 `pnpm test:run`）—— 与 easbot monorepo 的 `test:run` 命名**不同**，勿照搬。

---

## 3. 用例结构

### 3.1 文件头注解（四段式）

测试文件**必须**有文件头块注释，说明覆盖范围与手法：

```tsx
/**
 * Button 组件单元测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 状态测试 - 验证组件的各种状态表现
 * 3. 交互测试 - 验证组件的交互行为
 * 4. 图标测试 - 验证图标的展示
 * 5. 无障碍测试 - 验证组件的可访问性
 * 6. 移动端测试 - 验证移动端适配
 */
```

> 📌 **真值源**：[`src/button/button.test.tsx:1-14`](../src/button/button.test.tsx)、[`src/alert/alert.test.tsx:1-13`](../src/alert/alert.test.tsx)

### 3.2 describe 三层定位

顶层 describe **必须**是 `<Component> 组件`；内层按**测试维度**分组。

```tsx
// ✅ 正例（src/button/button.test.tsx:71-73）
describe('Button 组件', () => {
  describe('渲染测试', () => { ... });
  describe('状态测试', () => { ... });
  describe('交互测试', () => { ... });
  describe('无障碍测试', () => { ... });
});
```

**常见维度分组**（按需选用，不必全有）：

| 分组         | 验证内容                         |
| ------------ | -------------------------------- |
| `渲染测试`   | 默认渲染、变体、尺寸、自定义类名 |
| `状态测试`   | 禁用 / 加载 / 选中 / 展开 等状态 |
| `交互测试`   | 点击 / 键盘 / 展开收起 / 输入    |
| `无障碍测试` | `aria-*` 属性、`role`、焦点管理  |
| `组合测试`   | 变体 × 尺寸组合、子组件嵌套      |

> 📌 **真值源**：两种分组风格并存 —— 「测试维度」风格（`src/button/button.test.tsx`）与「功能」风格（`src/dialog/dialog.test.tsx:6` 的 `基础功能`）。
> **新增测试统一用「测试维度」风格**。

### 3.3 it 命名

**必须**中文，句式统一为 `应该<动作>` 或 `应<动作>`。同一文件内**必须**统一用一种。

```tsx
// ✅ 正例（src/button/button.test.tsx:78,89）
it('应该正确渲染默认按钮', () => { ... });
it('应该正确应用变体样式', () => { ... });

// ✅ 正例（src/spinner/spinner.test.tsx:43）
it('应正确组合尺寸和颜色变体', () => { ... });
```

| #   | 规则                                              |
| --- | ------------------------------------------------- |
| 1   | **必须**中文描述                                  |
| 2   | **必须**以行为/结果结尾，不用「测试」「检查」结尾 |
| 3   | 同一文件内**必须**统一 `应该` 或 `应` 句式        |
| 4   | ❌ **禁止** `it` 与 `test` 混用（同一文件）       |
| 5   | ❌ **禁止**空用例（`it('测试', () => {})`）       |

---

## 4. 断言规范

### 4.1 查询选型

| 优先级    | 方式                                 | 示例                                                         |
| --------- | ------------------------------------ | ------------------------------------------------------------ |
| 1（最高） | `getByRole`                          | `screen.getByRole('button', { name: '测试按钮' })`           |
| 2         | `getByLabelText`                     | `screen.getByLabelText('自定义加载提示')`                    |
| 3         | `getByText` / `getByPlaceholderText` | `screen.getByPlaceholderText('搜索...')`                     |
| 4         | `getByTestId`                        | `screen.getByTestId('loading-icon')` —— **仅当无语义锚点时** |

> ⚠️ **`getByTestId` 的使用边界**：仅当元素**没有**可访问名称 / 语义角色时使用（如纯装饰的加载图标）。
> 组件**新增** `data-testid` 时**必须**同时提供语义锚点（`role` / `aria-label`）。

### 4.2 matcher 选型

| 场景               | matcher                                                                         | 真值源                            |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------------- |
| 元素已渲染         | `toBeInTheDocument()`                                                           | `src/spinner/spinner.test.tsx:65` |
| 样式类名           | `toHaveClass(...)`                                                              | `src/button/button.test.tsx:93`   |
| 属性               | `toHaveAttribute('aria-disabled', 'true')`                                      | `src/dialog/dialog.test.tsx:69`   |
| 可见性             | `toBeVisible()`                                                                 | `src/dialog/dialog.test.tsx:23`   |
| 禁用态             | `toBeDisabled()`                                                                | `src/button/button.test.tsx:138`  |
| 焦点               | `toHaveFocus()`                                                                 | `src/button/button.test.tsx:262`  |
| 内联样式（动态值） | `toHaveStyle({ transform: 'scale(0.93)' })`                                     | `src/button/button.test.tsx:356`  |
| 回调触发           | `toHaveBeenCalled()` / `toHaveBeenCalledTimes(n)` / `toHaveBeenCalledWith(...)` | `src/button/button.test.tsx:137`  |
| 异步元素出现       | `await screen.findByRole(...)`                                                  | `src/dialog/dialog.test.tsx:22`   |

### 4.3 类名断言必须与 CSS 规范一致

**关键规则**：断言的类名**必须**是**实际会生成 CSS** 的类名。

| 类型            | ✅ 正确断言                                     | ❌ 错误断言                       |
| --------------- | ----------------------------------------------- | --------------------------------- |
| CSS 变量任意值  | `toHaveClass('bg-[var(--destructive)]')`        | —                                 |
| Tailwind 语义类 | `toHaveClass('border-primary')`（已注册 token） | 断言未注册的 token 类（静默失效） |

```tsx
// ✅ 正例（src/button/button.test.tsx:92-93）
// Tailwind v4：语义类已替换为 CSS 变量任意值
expect(button).toHaveClass('bg-[var(--destructive)]');
```

> 📌 **状态变体类名**（`data-[state=checked]:border-primary`）**整体断言**，不拆分前缀与基类（见 `src/checkbox/checkbox.test.tsx:40-42`）。

### 4.4 异步与 act

| 场景                  | 做法                                                                       |
| --------------------- | -------------------------------------------------------------------------- |
| 元素异步出现          | `await screen.findByRole(...)`                                             |
| 状态更新需要 act 包裹 | `await act(async () => { ... })`                                           |
| 定时器                | `vi.useFakeTimers()` + `vi.advanceTimersByTime(ms)` + `vi.useRealTimers()` |
| 重渲染                | 用 `render()` 返回的 `rerender` / `unmount`                                |

> 📌 **`rerender` 是首选**（比多次 `render` 更贴近真实）：`src/spinner/spinner.test.tsx:20`。

### 4.5 断言与实现同源原则

**单元测试第一准则**：断言的期望值**必须**能从**实现的真实来源**推导出来。

| #   | 规则                                                             |
| --- | ---------------------------------------------------------------- |
| 1   | 断言的类名**必须**来自组件源码里的**同一处**定义                 |
| 2   | 改实现**必须**同步改测试（**同一提交**内）                       |
| 3   | ❌ **禁止**为了让测试通过而**放宽断言**（删断言 / 改成宽松匹配） |
| 4   | ❌ **禁止**断言**未在组件中出现的**状态（凭空断言）              |
| 5   | 改 cva 变体名**必须**同步改对应断言                              |

> 📌 **反面信号**：测试失败时先怀疑**实现**，而不是先改测试。

---

## 5. 组件库特有的测试要点

### 5.1 Radix 组件的 portal

Radix 的 `Dialog` / `Popover` / `Tooltip` 等**渲染到 `document.body`**（portal），`container` 查询不到。

```tsx
// ✅ 正例（src/dialog/dialog.test.tsx:22）
expect(await screen.findByRole('dialog')).toBeInTheDocument();
```

> 📌 `screen` 查询的是 `document.body`，天然覆盖 portal 内容 —— **不要**改用 `container` 查询。

### 5.2 Radix 的 pointer 事件

部分 Radix 组件依赖 `PointerEvent`，jsdom **未实现** → 需 polyfill（见 §6.2）。

### 5.3 动画与状态断言

动画类（`animate-in` / `animate-out`）在 jsdom 下**不会真的播放**，因此**禁止**断言动画是否播放完成。

```tsx
// ✅ 断言状态属性（由 Radix 注入）
expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');

// ❌ 禁止 —— 断言动画类或 transitionend
expect(el).toHaveClass('animate-in');
```

> 📌 动画类名**可以**断言（它是静态类名），但**禁止**断言「动画已播放完毕」这类**时序行为**。

### 5.4 触摸 / 移动端

Button 的移动端能力（波纹 / 长按 / 滑动 / 压力感应）**必须**用**伪造的事件对象**测试，**禁止**依赖真实 UA。

```tsx
// ✅ 正例（src/button/button.test.tsx:28-69）—— 覆写 UA + 构造 Touch 事件
Object.defineProperty(navigator, 'userAgent', { value: '...iPhone...' });
const createTouchEvent = () => ({ touches: [...], targetTouches: [...], changedTouches: [...], bubbles: true });
```

---

## 6. mock 与 polyfill

### 6.1 mock 策略

| #   | 规则                                                                                  |
| --- | ------------------------------------------------------------------------------------- |
| 1   | ❌ **禁止** `vi.mock()` 模块级 mock —— 本库组件只依赖 Radix / lucide / cva，无需 mock |
| 2   | ✅ 回调类交互用 `vi.fn()` 断言是否被调用                                              |
| 3   | ✅ 浏览器 API 缺失用**局部 polyfill**（§6.2）                                         |
| 4   | ❌ **禁止**在 `tests/setup.ts` 里做组件专属 polyfill                                  |

### 6.2 polyfill 规范

jsdom **未实现**的浏览器 API **必须**在**需要它的测试文件内**局部定义。

**当前需要的 3 个**：

| API                      | 需要的组件                                    | 真值源                               |
| ------------------------ | --------------------------------------------- | ------------------------------------ |
| `ResizeObserver`         | command / navigation-menu / slider / textarea | `src/command/command.test.tsx:4-18`  |
| `Element.scrollIntoView` | command                                       | `src/command/command.test.tsx:20-25` |
| `matchMedia`             | select                                        | `src/select/select.test.tsx:196-203` |

**标准写法**：

```tsx
// ✅ 正例（src/command/command.test.tsx:6-18）
class ResizeObserverStub implements ResizeObserver {
  observe(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver =
  globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);
```

**规则**：

| #   | 规则                                                                            |
| --- | ------------------------------------------------------------------------------- |
| 1   | **必须**用 `globalThis.X = globalThis.X ?? <stub>` 形式（幂等，不覆盖已有实现） |
| 2   | **必须**写在**测试文件顶部**（组件作用域内），**禁止**放 `setup.ts`             |
| 3   | **必须**给 stub 加中文注释说明「为什么 jsdom 缺这个 API」                       |
| 4   | 同一 API 被多个测试文件需要时 —— **必须**抽到 `tests/` 下的共享 helper          |

> ⚠️ **`ResizeObserverStub` 当前在 4 个测试文件重复**（command / navigation-menu / slider / textarea）—— 按规则 4 **应当抽取**到共享 helper，
> 但**不阻塞**新测试（见 §M+2 豁免 H2）。

### 6.3 `vi` 的引入方式

**必须**显式 `import { vi } from 'vitest';`（即使 `globals: true` 已提供）。

```tsx
// ✅ 正例（src/button/button.test.tsx:19）
import { vi } from 'vitest';
```

> 📌 理由：显式 import 让**文件自包含**（不被 `globals` 配置意外影响），也让类型检查不依赖 `vitest/globals` 的全局声明。

---

## M. 10 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**。

### 维度 ① 测试文件与组件一一对应

**扫描命令**：

```bash
# 列出缺测试文件的组件目录（空 = 合规）
Get-ChildItem src -Directory | Where-Object {$_.Name -notin @('types','utils')} | ForEach-Object {
  $d = $_.Name
  if (-not (Test-Path "src/$d/$d.test.tsx")) { "MISSING test: src/$d/$d.test.tsx" }
}
```

**判定规则**：

- ❌ 违规：组件目录无对应 `<component>.test.tsx`
- ✅ 合规：输出为空

**修正模式**：

```bash
# ❌ 违规 —— src/date-picker/date-picker.tsx 存在但无测试
# ✅ 修正
#   新建 src/date-picker/date-picker.test.tsx
#   至少覆盖：渲染 / 状态 / 交互 / 无障碍 四类
```

### 维度 ② 禁止 `jest.*`

**扫描命令**：

```bash
rg -n "\bjest\." -g "src/**/*.test.tsx"
```

**判定规则**：

- ❌ 违规：出现 `jest.` 调用
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规
import { jest } from '@jest/globals';
jest.fn();
jest.useFakeTimers();

// ✅ 修正
import { vi } from 'vitest';
vi.fn();
vi.useFakeTimers();
```

### 维度 ③ 禁止逐文件 import jest-dom

**扫描命令**：

```bash
rg -n "from '@testing-library/jest-dom" -g "src/**/*.test.tsx"
```

**判定规则**：

- ❌ 违规：测试文件里 import matcher 库（应全局注册）
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规（src/button/button.test.tsx）
import '@testing-library/jest-dom';

// ✅ 修正 —— 删掉该行；matcher 由 tests/setup.ts 全局注册
import { render, screen } from '@testing-library/react';
```

### 维度 ④ 禁止混用 `it(` 与 `test(`

**扫描命令**：

```bash
Get-ChildItem src -Recurse -Filter "*.test.tsx" | ForEach-Object {
  $it = (Select-String -Path $_.FullName -Pattern "^\s*it\(" -AllMatches).Count
  $ts = (Select-String -Path $_.FullName -Pattern "^\s*test\(" -AllMatches).Count
  if ($it -gt 0 -and $ts -gt 0) { "$($_.Name)  it=$it test=$ts" }
}
```

**判定规则**：

- ❌ 违规：同一文件同时用 `it(` 与 `test(`
- ✅ 合规：输出为空

**修正模式**：

```tsx
// ❌ 违规（src/dialog/dialog.test.tsx）
it('应正确渲染对话框内容', () => { ... });
test('应支持不同尺寸', () => { ... });

// ✅ 修正 —— 统一为 it(
it('应支持不同尺寸', () => { ... });
```

### 维度 ⑤ `vi` 必须显式 import

**扫描命令**：

```bash
# 列出用了 vi. 但没 import vi 的测试文件（空 = 合规）
Get-ChildItem src -Recurse -Filter "*.test.tsx" | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  if ($t -match '\bvi\.' -and $t -notmatch "import\s*\{[^}]*\bvi\b[^}]*\}\s*from\s*'vitest'") { $_.Name }
}
```

**判定规则**：

- ❌ 违规：用了 `vi.` 但没显式 import
- ✅ 合规：输出为空

**修正模式**：

```tsx
// ❌ 违规
import { render } from '@testing-library/react';
const spy = vi.fn();

// ✅ 修正
import { render } from '@testing-library/react';
import { vi } from 'vitest';
const spy = vi.fn();
```

### 维度 ⑥ 禁止 `getByTestId` 滥用

**扫描命令**：

```bash
rg -c "getByTestId|queryByTestId" -g "src/**/*.test.tsx" | Where-Object { $_ -match "^(?!src/button/button.test.tsx|src/dialog/dialog.test.tsx)" }
```

**判定规则**：

- ⚠️ **需人工判定**：`getByTestId` 使用**必须**有「该元素无语义锚点」的理由
- ✅ 合规：每个 `getByTestId` 对应的元素都**没有** `role` / `aria-label` / 可见文本

**修正模式**：

```tsx
// ❌ 违规 —— 元素本可用语义查询
<span data-testid="loading-icon" aria-hidden="true" />

// ✅ 修正（src/button/button.test.tsx:394）
// 装饰性图标确实无语义锚点，保留 data-testid 合理
<Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-icon" aria-hidden="true" />
```

### 维度 ⑦ 禁止 `vi.mock()` 模块级 mock

**扫描命令**：

```bash
rg -n "vi\.mock\(" -g "src/**/*.test.tsx"
```

**判定规则**：

- ❌ 违规：本库组件测试中出现模块级 mock
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规
vi.mock('./utils', () => ({ cn: vi.fn() }));

// ✅ 修正 —— 用 vi.fn() 断言回调，不用模块 mock
const handleClick = vi.fn();
render(<Button onClick={handleClick}>点击</Button>);
fireEvent.click(screen.getByRole('button'));
expect(handleClick).toHaveBeenCalled();
```

### 维度 ⑧ 必须有文件头注解

**扫描命令**：

```bash
# 列出缺文件头块注释的测试文件（空 = 合规）
Get-ChildItem src -Recurse -Filter "*.test.tsx" | ForEach-Object {
  $head = (Get-Content $_.FullName -TotalCount 8) -join "`n"
  if ($head -notmatch '/\*\*') { $_.Name }
}
```

**判定规则**：

- ❌ 违规：测试文件头部无块注释
- ✅ 合规：输出为空
- ⚠️ 当前实测：**27 处违规**（存量，见 §M+2）—— **新增测试文件 MUST 达标，改动既有测试时 MUST 顺手补齐**

**修正模式**：

```tsx
// ❌ 违规 —— 直接进入 import
import { render, screen } from '@testing-library/react';

// ✅ 修正
/**
 * Button 组件单元测试
 *
 * @description
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 状态测试 - 验证组件的各种状态表现
 */
import { render, screen } from '@testing-library/react';
```

### 维度 ⑨ 四大覆盖维度齐全

**扫描命令**：

```bash
# 列出四类覆盖维度中缺失的（输出 = 缺失维度）
Get-ChildItem src -Recurse -Filter "*.test.tsx" | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  $miss = @()
  if ($t -notmatch '渲染|render|Render') { $miss += '渲染' }
  if ($t -notmatch '状态|disabled|loading|checked|open') { $miss += '状态' }
  if ($t -notmatch '交互|click|fireEvent|userEvent') { $miss += '交互' }
  if ($t -notmatch '无障碍|aria-|role|getByRole') { $miss += '无障碍' }
  if ($miss) { "$($_.Name) -> 缺: $($miss -join ',')" }
}
```

**判定规则**：

- ❌ 违规：缺任一维度
- ✅ 合规：输出为空

> 📌 命令是**关键词近似匹配**，命中数为 0 说明该维度**完全没测** —— 属 P0。

### 维度 ⑩ 断言的类名必须已注册为 token

**扫描命令**：

```bash
# 列出断言了未注册 Tailwind 语义类的测试（空 = 合规）
$theme = Get-Content src/styles.css -Raw
$registered = ([regex]::Matches($theme, '--color-([a-z0-9-]+):') | ForEach-Object { $_.Groups[1].Value }) + @('gray-50','gray-100','gray-200','gray-300','gray-400','gray-500','gray-600','gray-700','gray-800','gray-900')
$semantic = rg -o "toHaveClass\('(bg|text|border|ring)-(primary|secondary|destructive|success|warning|error|info|popover|accent|muted|background|foreground|card|input|ring)[a-z-]*'" -g "src/**/*.test.tsx" --no-filename -r '$1' 2>$null | Sort-Object -Unique
$bad = $semantic | Where-Object { $cls = $_ -replace '^(bg|text|border|ring)-',''; -not ($registered -contains $cls) }
if ($bad) { "UNREGISTERED: $($bad -join ', ')" } else { "OK" }
```

**判定规则**：

- ❌ 违规：断言的语义类未在 `@theme inline` 注册 → 该断言**恒真**，测不出任何东西
- ✅ 合规：输出 `OK`

**修正模式**：

```tsx
// ❌ 违规 —— bg-primary 未注册，断言恒真
expect(button).toHaveClass('bg-primary');

// ✅ 修正（src/button/button.test.tsx:93）
expect(button).toHaveClass('bg-[var(--destructive)]');
```

---

## M+1. 历史基准（2026-10-31 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                             | 数值                                    |
| -------------------------------- | --------------------------------------- |
| 测试文件数                       | 34                                      |
| 用例总数                         | **254**                                 |
| 单文件最多用例                   | 28（`src/button/button.test.tsx`）      |
| 单文件最少用例                   | 1（`src/use-toast/use-toast.test.tsx`） |
| `jest.*` 命中                    | 0                                       |
| 逐文件 import jest-dom 命中      | 0                                       |
| `vi.mock()` 命中                 | 0                                       |
| 混用 `it(` / `test(` 的文件      | 2（`command` / `dialog`）               |
| `getByTestId` 使用的文件         | 2（`button` / `dialog`）                |
| `ResizeObserver` polyfill 重复处 | 4 个文件                                |
| `pnpm test` 耗时                 | ~100s                                   |

### 重测命令

```bash
pnpm test
rg -c "^\s*(it|test)\(" -g "src/**/*.test.tsx" | Measure-Object
```

---

## M+2. 豁免清单

| 对象                                                                                | 豁免依据                                                                                                                           |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/use-toast/use-toast.test.tsx` 仅 1 个用例                                      | `useToast` 是**状态 Hook**，`Toaster` 的渲染与 toast 队列逻辑由 `src/toast/toast.test.tsx` 覆盖；本文件只验证「Hook 返回值与订阅」 |
| `ResizeObserverStub` 在 4 个测试文件重复定义                                        | **存量豁免**：当前 jsdom 缺失该 API，重复定义可接受。**新增**第 5 处时**必须**按 §6.2 规则 4 抽到 `tests/` 共享 helper             |
| `src/command/command.test.tsx` 与 `src/dialog/dialog.test.tsx` 混用 `it(` / `test(` | **存量豁免**：§M 维度 ④ 命中这两处；**新增**测试文件**禁止**混用（§3.3 规则 4）                                                    |
| 27 个测试文件缺文件头块注解（维度 ⑧）                                               | **存量豁免**：**新增**测试文件 MUST 达标；**改动**既有测试时 MUST 顺手补齐（`code-annotation-standard.md` §1.4「改动即补」原则）   |
| 部分测试未覆盖全部四维度（维度 ⑨）                                                  | **存量豁免**：维度 ⑨ 是**关键词近似匹配**（会漏判），命中项**需人工确认**后再判定；**新增**组件测试 MUST 覆盖四类                  |
| 组件测试**不覆盖**覆盖率阈值                                                        | 本库**无**覆盖率门槛（`vitest.config.ts` 未配 `thresholds`）；覆盖率用于**观察**，不作为**门禁**                                   |

---

## M+3. 冲突裁决

| #   | 冲突点                   | 旧规范声明（easbot monorepo 版）                                    | 实际情况（本库）                                    | 裁决                             |
| --- | ------------------------ | ------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------- |
| C1  | 测试命令名               | `pnpm test:run`（单次）/ `pnpm test`（监听）                        | 本库 `pnpm test` = `vitest run`（单次）             | **本库用 `pnpm test`**（§2）     |
| C2  | 测试目录分层             | `src/**/__tests__/` 与 `<pkg>/tests/{unit,integration,e2e}/` 双体系 | 本库**只有** `src/<component>/<component>.test.tsx` | **单体系**（§1.1）               |
| C3  | 覆盖率门槛               | buddy 包 80% 门槛                                                   | 本库**无** `thresholds`                             | **无门槛**（§M+2）               |
| C4  | `globals` 与显式 import  | 「显式 import 是约定，globals 是兜底」                              | 与本库一致                                          | **必须显式 import `vi`**（§6.3） |
| C5  | 环境差分测试（双 shell） | 双 grammar 差分是范本                                               | 本库是**浏览器组件**，无 shell 场景                 | **不适用**（本规范无对应维度）   |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审测试时的**自查**清单（不是任务列表，是合规性自检表）。

### 新增组件测试时

- [ ] 文件在 `src/<component>/<component>.test.tsx`
- [ ] 有文件头块注释（覆盖类别 + 手法说明）
- [ ] 顶层 `describe` 为 `<Component> 组件`，内层按测试维度分组
- [ ] `it` 中文命名，同文件内句式统一，未混用 `test(`
- [ ] 覆盖渲染 / 状态 / 交互 / 无障碍四类
- [ ] 查询优先语义化，`getByTestId` 有正当理由
- [ ] 需要的浏览器 API 已局部 polyfill（`globalThis.X = globalThis.X ?? stub`）
- [ ] `vi` 已显式 import，未用 `jest.*`，未用 `vi.mock()`
- [ ] 断言的类名**确实会生成 CSS**（`css-standard.md` §3.1）

### 评审测试时

- [ ] 维度 ① ~ ⑩ 已全跑（一次跑全库）
- [ ] `pnpm test` 全绿
- [ ] 改实现时已同步改断言（断言与实现同源）
- [ ] `pnpm type-check` 全绿（测试文件在 tsconfig `include` 内）

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-10-31 | **首版**。基于 `eas-dev-docs` 技能的 `spec.md` 模板 + 全库实测**重写**（原 `testing-guidelines.md` 是 easbot monorepo 残留，2127 行，约束 22 个 workspace 包的 `test.projects` 双层配置 / 双 grammar 差分测试 / `Instance.provide` 上下文控制 / buddy 包覆盖率门槛 —— 本库**均不适用**）：① 确立**单包 Vitest + jsdom** 配置基线（8 项关键配置逐条列出）；② 确立测试文件**与组件同目录**的单体系（废弃双体系）；③ 确立**四大覆盖维度**（渲染 / 状态 / 交互 / 无障碍）；④ 确立**局部 polyfill** 规范（3 个 jsdom 缺失 API，含标准写法）；⑤ 确立**断言与实现同源**原则与「改实现必须同步改测试」；⑥ 新增维度 ⑩「断言的类名必须已注册为 token」（针对**恒真断言**这一隐蔽失效模式）；⑦ 10 项扫描维度全部实跑验证 |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 命名 / 导出
- [`css-standard.md`](./css-standard.md) —— CSS 变量 / 语义类注册（断言类名的前提）
- [`storybook-standard.md`](./storybook-standard.md) —— Story 写法
- [`code-annotation-standard.md`](./code-annotation-standard.md) —— 注释与 JSDoc（含测试文件头注解）
- [`code-quality.md`](./code-quality.md) —— lint / type-check / 构建 / 依赖
- [`vitest.config.ts`](../vitest.config.ts) / [`tests/setup.ts`](../tests/setup.ts) —— 测试配置真值源
