---
name: a11y-interaction-standard
description: 该规范定义 easbot-ui 组件库的无障碍（a11y）与交互契约，含可访问名称（图标按钮必须有 aria-label / 装饰性图标必须 aria-hidden）、语义元素优先（禁止 div/span onClick 而不用 button）、键盘可达性（非 button 交互元素必须有 role + tabIndex + onKeyDown）、焦点管理（focus-visible 唯一焦点触发器 / outline 而非 ring / ring 必须配 offset）、表单标签关联（label htmlFor + id / aria-describedby 错误提示）、ARIA 状态暴露（aria-expanded / aria-selected / aria-busy / aria-live）、动效偏好（prefers-reduced-motion 必须有降级变体）、触屏与手势（touch-action / overscroll-behavior）、文案排版规范（省略号用 … 而非 ... / 数字列用 tabular-nums / 长文本 truncate）、以及 12 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与无障碍评审检查清单。当编写组件交互、补无障碍属性、修复键盘导航问题或评审组件可访问性时参考。
category: specification
version: 1.1.0
baseline-date: 2026-11-05
tags:
  [easbot-ui, a11y, accessibility, aria, keyboard, focus, wcag, motion, interaction, code-review]
related:
  - spec-index.md
  - component-standard.md
  - css-standard.md
  - i18n-standard.md
  - testing-guidelines.md
---

# EASBot UI 无障碍与交互规范 (A11y & Interaction Standard)

> **真值源**：本规范以 `src/ui/**`（56 个公开组件目录）与
> `src/design-system/components/ui/**`（46 个基础实现组件）的真实实现为唯一执行真值；
> 规范与实现冲突时**规范改**（先改规范再改实现，不留双轨）。
>
> **与其它规范的分工**（四者**不重复**）：
>
> | 关注点                            | 归属文档                                           | 本规范对应章节             |
> | --------------------------------- | -------------------------------------------------- | -------------------------- |
> | 组件目录 / 命名 / 导出 / `cn()`   | [`component-standard.md`](./component-standard.md) | §3.7（仅无障碍条目引用）   |
> | 焦点态的**样式写法**（`outline`） | [`css-standard.md`](./css-standard.md)             | §6（仅交叉引用）           |
> | 文案**双语表结构**                | [`i18n-standard.md`](./i18n-standard.md)           | §5.4（仅 aria-label 来源） |
> | 无障碍**断言怎么写**              | [`testing-guidelines.md`](./testing-guidelines.md) | §7（仅交叉引用）           |
>
> **历史基准**：v1.0.0 锁定 2026-11-04 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本库是**组件库**——组件会被消费方放进任意业务页面。组件库交付的**每一个交互元素**，
都是消费方页面的**无障碍责任边界**。消费方无法进入本库源码去补 `aria-label`，
因此「组件有没有暴露可访问名称」必须在**本库**解决。

本规范的存在理由只有一条：**把无障碍从「评审时靠人眼扫」变成「可扫描、可判定、可复跑」**。

**核心约束**：

- ✅ **图标按钮必须有可访问名称** —— `aria-label` 或 `sr-only` 文本；**禁止**「只有图标没有名字」
- ✅ **交互元素必须是原生语义元素** —— 用 `<button>` / `<a>`；`<div onClick>` **必须**补 `role` + `tabIndex` + `onKeyDown`
- ✅ **焦点指示唯一触发器是 `focus-visible:`** —— 且**必须**有可见替代（`outline` 或 `ring` + `offset`）
- ✅ **表单控件必须有可访问名称** —— `<label htmlFor>` / `aria-label` / `aria-labelledby` 三者至少其一
- ✅ **状态变化必须通过 ARIA 暴露** —— `aria-expanded` / `aria-selected` / `aria-busy` / `aria-live`
- ✅ **动效必须响应 `prefers-reduced-motion`** —— 动画类**必须**配 `motion-reduce:` 降级
- ✅ **触屏交互元素必须声明 `touch-action`** —— 避免 300ms 双击缩放延迟
- ✅ **长文本容器必须处理溢出** —— `truncate` / `line-clamp-*` / `break-words`；Flex 子项**必须** `min-w-0`
- ❌ 禁止 `user-scalable=no` / `maximum-scale=1`（本库不产出 viewport meta，但消费方文档**必须**警示）
- ❌ 禁止 `outline-none` / `focus:outline-none` 而**无** `focus-visible:` 替代
- ❌ 禁止 `transition-all`（必须显式列出属性）
- ❌ 禁止用 `...` 三点表示省略（必须用 `…`）
- ❌ 禁止硬编码日期 / 数字格式（必须走 `Intl.*` 或 `dayjs` + locale）

---

## 1. 可访问名称 (Accessible Name)

> ⛔ **这是本规范的第一优先级** —— 没有可访问名称的交互元素对屏幕阅读器**完全不存在**。

### 1.1 图标按钮（icon-only）

**纯图标按钮**（`IconButton` / `CloseButton` / `Button size="icon"` / `Button` 仅含 `leftIcon`/`rightIcon`）
**必须**有可访问名称。三种合法写法：

| #   | 写法                                                            | 真值源                                             |
| --- | --------------------------------------------------------------- | -------------------------------------------------- |
| 1   | `aria-label="关闭"`（**首选**）                                 | `src/ui/alert/alert.tsx:94`                        |
| 2   | `title="关闭"` + `aria-label`（`title` 单独**不算**可访问名称） | `src/ui/table/atoms/TableRowExpandButton.tsx:76`   |
| 3   | 内置 `<span className="sr-only">` 视觉隐藏文本                  | `src/design-system/components/ui/carousel.tsx:161` |

```tsx
// ✅ 正例 —— IconButton 调用方
<IconButton icon="eye" aria-label={t('previewLabel')} onClick={handlePreview} />

// ❌ 反例 —— 只有图标，屏幕阅读器读作「按钮」
<IconButton icon="eye" onClick={handlePreview} />
```

> 📌 **`title` 不是可访问名称的可靠来源** —— 多数屏幕阅读器不读 `title`，
> 且它只在鼠标悬停时出现（触屏用户看不到）。**必须**用 `aria-label`。

> 📌 **组件自身**不得为图标按钮**编造**默认 `aria-label` ——
> 「关闭」「删除」「预览」在不同上下文含义不同，编造默认值比缺失更危险（会读错）。
> `CloseButton` **可以**提供「关闭」默认值（语义唯一），但 `IconButton` **不可以**。

### 1.2 装饰性图标

**装饰性**图标（不承载信息）**必须** `aria-hidden="true"`：

```tsx
// ✅ 正例（src/ui/button/button.tsx:254）
<Loader2
  className={cn('animate-spin', sizeToken?.iconSize || 'size-4')}
  data-testid="loading-icon"
  aria-hidden="true"
/>
```

> 📌 判定标准：**移除这个图标后，语义信息会丢失吗？**
>
> | 情况                                        | 判定       | 处理                            |
> | ------------------------------------------- | ---------- | ------------------------------- |
> | 按钮里唯一的图标                            | **信息性** | 父元素必须有 `aria-label`       |
> | 按钮文字前的装饰箭头 / 加载圈 / 分隔符      | **装饰性** | `aria-hidden="true"`            |
> | 有 `title` 的主题图标（`Icon type="name"`） | 信息性     | 由 `Icon` 组件注入 `aria-label` |

### 1.3 主题图标的 `alt` 退化

`src/ui/icon/icon.tsx:139` 的 `type="url"` 模式写 `alt = name || 'icon'` ——
**「icon」是无意义的 alt**（屏幕阅读器会读出 "icon" 这个词）。

**规则**：`type="url"` 模式下，**必须**由调用方传 `alt`（有意义的内容描述），
否则**必须** `aria-hidden="true"`（纯装饰）。

### 1.4 `<img>` 必须有 `alt`

| 场景     | `alt` 取值                            |
| -------- | ------------------------------------- |
| 内容图片 | **有意义**的描述（`alt={file.name}`） |
| 纯装饰   | `alt=""`（**空字符串**，不是省略）    |

> 📌 真值源：`src/ui/file/FileList.tsx:239`（`alt={file.name}`）、
> `src/ui/typography/typography.tsx:233`（`alt={imageName || t('imageAlt')}`）——
> 后者是**正确范式**：有 fallback 到 i18n 文案，而不是硬编码英文。

> ❌ **反例**：`src/ui/table/organisms/TableCardView.tsx:132` 的 `alt="card"` ——
> 「card」是**元素类型**不是**内容描述**，对屏幕阅读器零价值。

---

## 2. 语义与键盘可达性

### 2.1 原生语义元素优先

**动作**用 `<button>`，**导航**用 `<a>` / `<Link>`。

```tsx
// ✅ 正例
<button type="button" onClick={handleClick}>删除</button>
<a href="/detail/1">查看详情</a>

// ❌ 反例 —— div onClick 对键盘完全不可达
<div onClick={handleClick}>删除</div>
```

### 2.2 非语义元素做交互的**三件套**

**确实无法**用 `<button>` 时（如 `<tr>` 行点击、`<span>` 内嵌删除），
**必须同时**补齐三项，缺一即违规：

| #   | 必备项         | 作用                   |
| --- | -------------- | ---------------------- |
| 1   | `role`         | 告诉辅助技术这是什么   |
| 2   | `tabIndex={0}` | 让它**可被 Tab 聚焦**  |
| 3   | `onKeyDown`    | 让键盘能**触发**该动作 |

```tsx
// ✅ 正例（src/ui/combobox/combobox.tsx:330-346）
<span
  role="button"
  tabIndex={0}
  aria-label={t('removeOption')}
  onClick={handleRemove}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRemove();
    }
  }}
>
  <X />
</span>
```

> 📌 **键盘键位**：`Enter` 与 `Space`（`' '`）**必须**都处理。
> `Space` 必须 `preventDefault()` —— 否则会滚动页面。

### 2.3 禁止正数 `tabIndex`

**禁止** `tabIndex > 0` —— 它会打乱 Tab 顺序（用户必须按 N 次 Tab 才能到下一个元素）。

```tsx
// ❌ 违规
<div tabIndex={5} onClick={...}>

// ✅ 正确 —— 0（可聚焦）或 -1（仅程序聚焦）
<div tabIndex={0} onClick={...} onKeyDown={...}>
<div tabIndex={-1}>  {/* roving tabindex，如 tree / sidebar */}
```

> 📌 **roving tabindex 模式**（`tabIndex={0}` / `tabIndex={-1}` 随选中态切换）
> 是**合法**的 —— 真值源 `src/ui/tree/tree.tsx:151`。
> 它让整个列表**只占一个 Tab 位**，内部用方向键导航。

---

## 3. 焦点管理 (Focus Management)

> 📌 **本库已有焦点态约定**（`css-standard.md` §4.7）—— 焦点指示**必须**用 `outline`
> 而非 `ring`，**禁止**表现为「描边」。本节只补**语义侧**的要求。

### 3.1 `focus-visible:` 是唯一焦点触发器

**禁止**用 `focus:` 表达焦点 —— 鼠标点击也会触发，焦点圈常驻 → 误读为「选中态」。

```tsx
// ❌ 违规
'focus:ring-2 focus:ring-ring';

// ✅ 正确
'outline-none focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2';
```

### 3.2 `outline-none` 必须有替代

**禁止**「移除焦点框却不给替代」：

| 写法                                        | 判定                                |
| ------------------------------------------- | ----------------------------------- |
| `outline-none` + `focus-visible:outline-*`  | ✅ 合规                             |
| `outline-none` + `focus-visible:ring-*`     | ✅ 合规（**必须**配 `ring-offset`） |
| `outline-none` + **无** `focus-visible:*`   | ❌ 违规（WCAG 2.4.7 焦点可见性）    |
| `focus:outline-none` + 无 `focus-visible:*` | ❌ 违规                             |

> 📌 **真值源**：`src/ui/icon/icon-button.tsx:81` 是标准范式。

### 3.3 `ring` 必须配 `offset`

用 `ring` 表达焦点时，**必须**同时给 `ring-offset`（留出空隙），
否则与元素边缘重合 → 视觉等同描边 → 违反 `css-standard.md` §4.7。

> ⚠️ **实测**：**21 个文件**使用 `focus-visible:ring-*` 但**未配** `focus-visible:ring-offset-*`
> （`design-system` 的 `button` / `badge` / `checkbox` / `input` / `accordion` / `tabs` / `slider` /
> `switch` / `select` / `sidebar` / `toggle` / `radio-group` / `navigation-menu` / `scroll-area` /
> `resizable` + `src/ui` 的 `button/close-button` / `combobox` / `radio-group` / `scroll-area` / `switch`）。
> 详见 §M+2 豁免清单 H3。

### 3.4 焦点不得被浮层遮挡

浮层（Dialog / Drawer / Sheet / Popover）打开时，**焦点必须**移入浮层；
关闭时**必须**回到触发元素。**这是 Radix 的默认行为** —— 本库组件**禁止**用
`autoFocus` 破坏它（见 §4.4）。

---

## 4. ARIA 状态与语义

### 4.1 状态必须通过 ARIA 暴露

| 状态        | 属性            | 典型组件                             |
| ----------- | --------------- | ------------------------------------ |
| 展开 / 折叠 | `aria-expanded` | Accordion / Select / Combobox / Tree |
| 选中        | `aria-selected` | Tabs / Select / Calendar / Tree      |
| 禁用        | `aria-disabled` | Button / Tree / 自定义控件           |
| 忙碌中      | `aria-busy`     | Button（loading） / Table            |
| 当前项      | `aria-current`  | Breadcrumb / Pagination              |
| 必填        | `aria-required` | Form 控件                            |
| 校验错误    | `aria-invalid`  | Input / Form 控件                    |

> 📌 **真值源**：`src/ui/button/button.tsx:203-206`（`aria-busy` + `aria-disabled`）、
> `src/ui/tree/tree.tsx:154`（`aria-disabled`）。
>
> ⚠️ **Radix 组件自带 ARIA** —— Tabs / Accordion / Select / Dialog 等**不要**手工加
> `aria-expanded` / `aria-selected` / `role`（会与 Radix 内部注入的**重复**，甚至冲突）。
> **只有自研组件**（Table / Tree / Combobox / IconButton）才需要手工暴露。

### 4.2 动态内容必须用 live region

**异步更新**（toast / 加载完成 / 校验错误 / 表格刷新）**必须**有 `aria-live` 区域：

| 场景        | 属性                                   | 真值源                                         |
| ----------- | -------------------------------------- | ---------------------------------------------- |
| 加载中      | `role="status"` + `aria-live="polite"` | `src/ui/spinner/spinner.tsx:59-60`             |
| 按钮加载态  | `aria-live="polite"`                   | `src/ui/button/button.tsx:205`                 |
| 错误 / 警告 | `role="alert"`                         | `src/design-system/components/ui/alert.tsx:24` |

> ⚠️ **实测**：Toast / Table 的异步态**尚无** live region —— 屏幕阅读器用户**收不到**加载完成通知。
> 登记在 §M+2 缺口 G-A1。

### 4.3 `role` 取值必须语义正确

已用取值（真值源）：

| `role`         | 位置                                                           | 判定             |
| -------------- | -------------------------------------------------------------- | ---------------- |
| `button`       | `src/ui/tree/tree.tsx:153`、`src/ui/combobox/combobox.tsx:331` | ✅               |
| `combobox`     | `src/ui/combobox/combobox.tsx:448`                             | ✅               |
| `status`       | `src/ui/spinner/spinner.tsx:59`                                | ✅               |
| `region`       | `src/design-system/components/ui/carousel.tsx:114`             | ✅               |
| `group`        | `src/design-system/components/ui/carousel.tsx:137`             | ✅               |
| `alert`        | `src/design-system/components/ui/alert.tsx:24`                 | ✅               |
| `presentation` | `src/design-system/components/ui/breadcrumb.tsx:41`            | ✅（装饰性语义） |

> ❌ **禁止**用 `role="button"` 包裹**本身已是 `<button>`** 的元素（双重角色）。

### 4.4 `autoFocus` 必须有正当理由

**禁止**无理由的 `autoFocus`：

| 场景                      | 判定    | 说明                                         |
| ------------------------- | ------- | -------------------------------------------- |
| 移动端 / 触屏弹窗自动聚焦 | ❌ 禁止 | 会弹出软键盘遮挡内容，**且**移动端无物理键盘 |
| 页面加载即聚焦某个输入框  | ⚠️ 谨慎 | 仅当页面**唯一**主输入且是桌面端             |
| 表单弹窗第一个字段        | ⚠️ 谨慎 | Radix 的 `DialogContent` **已内置**自动聚焦  |

> 📌 Radix 的 `Dialog` / `AlertDialog` **默认**把焦点移入内容区 ——
> **禁止**再叠加 `autoFocus`（会二次聚焦，导致初始焦点落在错误元素）。

> ⚠️ **实测**：全库 `autoFocus` 仅 **3 处**，全在表格插件的弹窗配置里 —— 属存量豁免（§M+2 H4）。

---

## 5. 表单与输入

### 5.1 表单控件必须有可访问名称

`<input>` / `<textarea>` / `<select>` **必须**满足三者之一：

| #   | 方式                                    | 真值源                                                                               |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | `<label htmlFor={id}>` + 控件 `id={id}` | `src/ui/checkbox/checkbox.tsx:127`、`src/design-system/components/ui/form.tsx:71+77` |
| 2   | `aria-label="..."`                      | `src/design-system/components/ui/pagination.tsx:50`                                  |
| 3   | `aria-labelledby={id}` 指向可见文本     | `src/ui/combobox/combobox.tsx:413`（`<label htmlFor>` + `id`）                       |

> ⚠️ **实测缺口**：`src/ui/input/input.tsx`、`src/ui/textarea/textarea.tsx`、
> `src/ui/switch/switch.tsx` **组件内不生成 `id`、不渲染 `<label>`** ——
> 完全依赖调用方手工传 `aria-label`。登记在 §M+2 缺口 G-A2。
>
> 📌 **规范要求**：组件**必须**支持「内建 label 关联」或「自动生成 `id` 并用 `useId()` 绑定 label」二选一 ——
> 详见 [`component-standard.md`](./component-standard.md) §3.11。

### 5.2 错误提示必须被关联

校验错误信息**必须**通过 `aria-describedby` 关联到控件：

```tsx
// ✅ 正例（src/ui/checkbox/checkbox.tsx:119）
<input id={id} aria-describedby={errorId} aria-invalid={!!error} />;
{
  error && (
    <p id={errorId} role="alert">
      {error}
    </p>
  );
}
```

> 📌 真值源：`src/design-system/components/ui/form.tsx:77`（`FormControl` 统一注入 `aria-describedby`）。

### 5.3 占位符不是标签

`placeholder` **不得**作为唯一标签 —— 它在输入后就消失，且屏幕阅读器支持不一致。

- **必须**：`<label>`（可见或 `sr-only`）+ `placeholder`（仅示例）
- `placeholder` **必须**以 `…` 结尾并体现**示例形态**（如 `'搜索订单号…'`）

> 📌 **本库现状**：placeholder 用 `...` 的命中 **0 处** —— 合规。

### 5.4 `aria-label` 的文案必须走 i18n

`aria-label` 是**用户可见文案**（屏幕阅读器会读）→ **必须**走
`useComponentMessage('<domain>')`，**禁止**硬编码中英文字面量。

> 📌 真值源：`src/ui/icon/icon.tsx` 的主题图标通过 `iconMessages` 域注入 `aria-label`。
> 详见 [`i18n-standard.md`](./i18n-standard.md) §6。

### 5.5 输入类型必须明确

| 场景   | `type` / `inputMode`                                                                      |
| ------ | ----------------------------------------------------------------------------------------- |
| 邮箱   | `type="email"` + `inputMode="email"`                                                      |
| 电话   | `type="tel"` + `inputMode="tel"`                                                          |
| 网址   | `type="url"` + `inputMode="url"`                                                          |
| 数字   | `type="text"` + `inputMode="numeric"`（**不用** `type="number"` —— 有步进箭头且滚轮误改） |
| 验证码 | `spellCheck={false}` + `autoComplete="one-time-code"`                                     |

> 📌 `spellCheck={false}` **必须**加在：邮箱 / 验证码 / 用户名 / 代号类字段。

---

## 6. 动效与交互反馈

### 6.1 `prefers-reduced-motion` 必须有降级

**任何**动画 / 过渡 / 位移效果**必须**提供降级变体。

**两种合法写法**（二选一，全库统一）：

```tsx
// ✅ 写法 A —— Tailwind `motion-reduce:` 变体（组件内，优先）
'transition-all motion-reduce:transition-none';
```

```css
/* ✅ 写法 B —— CSS 媒体查询（自定义 @utility 动画，必须用这个） */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

> ⚠️ **实测缺口**：`src/theme/styles.css:206-234` 的 `animate-ripple` / `animate-gradient`
> **均无** reduced-motion 兜底；`animate-spin`（`src/ui/spinner/spinner.tsx:19`）**也无**。
> 登记在 §M+2 缺口 G-A3。
>
> 📌 **写法 B 必须放在 `@theme/styles.css`**（唯一编译入口）——
> 放组件目录里的 CSS **不进产物**。

### 6.2 `transition-all` 必须收窄为具体属性

`transition-all` 会**动画化所有可动画属性**（含 `width` / `height` / `box-shadow`），
触发**非预期的布局重排**（performance）与**意外的中间态**。

```tsx
// ❌ 违规
'transition-all duration-200';

// ✅ 正确 —— 显式列出属性
'transition-[color,box-shadow] duration-200';
'transition-colors duration-200';
```

> ⚠️ **实测**：全库 `transition-all` **12 处**（`design-system` 的 `switch` / `sidebar` /
> `button` / `navigation-menu` / `progress` / `accordion` / `input-otp` +
> `src/ui` 的 `button` / `toast` / `table` 的 `TableColumnResizer` / `TableCard` / `TableRow`）。
> 登记在 §M+2 缺口 G-A4。

### 6.3 动画属性只用 `transform` / `opacity`

**必须**动画化 `transform` 与 `opacity`（合成器友好，不触发重排 / 重绘）。
❌ 禁止动画化 `width` / `height` / `top` / `left` / `margin`。

> 📌 真值源：`src/ui/button/button.tsx:418-423`（波纹用 `left` / `top` / `transform`）——
> ⚠️ 其中 `left` / `top` 属**布局属性**，虽是一次性定位（不是过渡），可接受；
> 但**过渡**（`transition`）**不得**作用于它们。

### 6.4 悬停态不是唯一反馈

交互元素**必须**有 `hover:` 反馈；同时 `focus-visible:` **必须**有独立可见指示。

> ⚠️ **纯触屏设备无 hover** —— 关键操作**不能**只靠 hover 暴露（见 §8.2）。

---

## 7. 触屏与手势

### 7.1 `touch-action` 必须声明

可点击 / 可拖拽的元素**必须**声明 `touch-action`，否则移动端有 **300ms 双击缩放延迟**。

| 场景       | `touch-action`               |
| ---------- | ---------------------------- |
| 普通按钮   | `touch-action: manipulation` |
| 可拖拽手柄 | `touch-action: none`         |

```tsx
// ✅ 正例
'style={{ touchAction: 'manipulation' }}
```

> 📌 **Tailwind 写法**：`touch-manipulation` / `touch-none`。

### 7.2 浮层必须阻断滚动穿透

Modal / Drawer / Sheet 的内容容器**必须** `overscroll-behavior: contain` ——
否则滚动到底会带动**下层页面**一起滚。

> 📌 **实测**：全库 `overscroll-behavior` 命中 **0 处** —— 登记在 §M+2 缺口 G-A5。

### 7.3 拖拽必须有键盘替代

拖拽 / 滑动手势**必须**提供**键盘**与**点击**替代路径。

> 📌 真值源：`src/ui/table/atoms/TableColumnResizer.tsx` 的列宽拖拽手柄
> —— 需确认是否有键盘调整路径（登记在 §M+2 缺口 G-A6）。

---

## 8. 文案与排版

### 8.1 省略号必须用 `…`

**必须**用 U+2026（`…`），**禁止**用三个 ASCII 点（`...`）。

```tsx
// ❌ 违规
loading: '加载中...';

// ✅ 正确
loading: '加载中…';
```

> ⚠️ **实测**：`src/utils/component-messages.ts` 中 **`...` 命中 40 处**（中英双语都有）——
> 登记在 §M+2 缺口 G-A7（**必须**中英同步改）。

### 8.2 加载态文案必须以 `…` 结尾

加载 / 处理中状态的文案**必须**以 `…` 结尾（表达「进行中」）：

```tsx
loading: '加载中…'; // ✅
saving: '保存中…'; // ✅
loading: 'Loading...'; // ❌
```

### 8.3 数字列必须用 `tabular-nums`

**数值列**（表格、统计、时间）**必须** `font-variant-numeric: tabular-nums` ——
否则数字宽度不一致，**跳动**难读。

```tsx
// ✅ 正例
'font-variant-numeric tabular-nums';
```

### 8.4 长文本容器必须处理溢出

| 场景      | 处理                                       |
| --------- | ------------------------------------------ |
| 单行截断  | `truncate`（需父容器 `min-w-0`）           |
| 多行截断  | `line-clamp-1` / `line-clamp-2`            |
| 允许断词  | `break-words`                              |
| Flex 子项 | **必须** `min-w-0`（否则 `truncate` 失效） |

> 📌 **Flex/Grid 陷阱**：Flex 子项默认 `min-width: auto`，
> 长内容会**撑破**容器 —— `truncate` 看起来「没生效」。**必须** `min-w-0`。

### 8.5 标题必须平衡换行

标题 / 大字号文本**必须** `text-balance`（避免末行只剩一两个字的「孤字」）：

```tsx
// ✅ 正例
<h2 className="text-balance text-2xl font-semibold">
```

### 8.6 硬编码日期 / 数字格式必须走 locale

**禁止**硬编码 `'YYYY-MM-DD'` 之类格式串作为**用户可见**的展示格式。

| 用途       | 正确做法                                                                         |
| ---------- | -------------------------------------------------------------------------------- |
| 展示给用户 | `Intl.DateTimeFormat(locale, {...})` 或 `dayjs(date).locale(locale).format(...)` |
| 传给后端   | ISO 8601（`toISOString()`）—— **不受 locale 影响**                               |

> 📌 本库 `src/ui/date/` 大量使用 `dayjs(date).format(format)` 且 `format` 由调用方传入 ——
> 这是**合理的**（格式由消费方决定）；但**组件内置**的默认格式**必须**随 `locale` 变化。
>
> ⚠️ **实测**：`src/ui/date/` 内**零** `Intl.DateTimeFormat` 调用 ——
> 默认格式**恒为** ISO 风格，不随 `locale` 变。登记在 §M+2 缺口 G-A8。

### 8.7 品牌名与代码 token 不翻译

品牌名、技术代号、标识符**必须**包 `translate="no"`（防止浏览器自动翻译搞乱）：

```tsx
<span translate="no">EASBot</span>
<code translate="no">TableColumnProps</code>
```

> 📌 真值源：`src/utils/component-messages.ts` 的「品牌名 / 技术名词不翻译」豁免规则。

---

## 9. 视觉与布局

### 9.1 图片必须有显式尺寸

`<img>` **必须**有 `width` / `height`（或等价的 aspect-ratio）—— 否则**布局抖动**（CLS）。

### 9.2 不得禁止用户缩放

**禁止**在文档 / 示例中产出 `user-scalable=no` 或 `maximum-scale=1`。

> 本库**不产出** `<meta name="viewport">`（那是消费方的责任），
> 但**消费方文档**（`docs/getting-started.md`）**必须**警示这一点。

### 9.3 深色主题需要 `color-scheme`

深色主题**必须**声明 `color-scheme: dark`，否则浏览器的滚动条 / 原生控件
（`<select>` / 日期选择器 / 复选框）**仍是浅色**，与主题割裂。

```css
/* src/theme/themes/dark.css */
:root[data-theme='dark'] {
  color-scheme: dark;
  /* ... */
}
```

> ⚠️ **实测**：本库主题文件**零** `color-scheme` 声明 —— 登记在 §M+2 缺口 G-A9。

### 9.4 原生 `<select>` 必须显式设背景色与文字色

Windows 深色模式下，原生 `<select>` **必须**显式 `background-color` + `color`，
否则下拉列表**不可读**（白底黑字被反色）。

---

## M. 12 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**。

### 维度 ① 图标按钮必须有可访问名称

**扫描命令**：

```bash
# 列出「纯图标按钮」但无 aria-label 的文件（空 = 合规）
# 判定启发式：同文件内出现 IconButton / size="icon" / h-8 w-8 p-0 等图标按钮特征，
# 且全文无 aria-label
Get-ChildItem src -Recurse -Include *.tsx | Where-Object {
  $_.FullName -notmatch '__tests__' -and $_.Name -notlike '*.stories.tsx'
} | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  $hasIconButton = $t -match 'IconButton|size="icon"|h-\d+ w-\d+ p-0'
  if ($hasIconButton -and $t -notmatch 'aria-label' -and $t -notmatch 'sr-only') {
    $_.FullName.Replace("$PWD\","").Replace("\","/")
  }
}
```

**判定规则**：

- ❌ 违规：文件含图标按钮特征，但**全文无** `aria-label` / `sr-only`
- ✅ 合规：输出为空
- ⚠️ 本维度是**启发式**，命中项**必须人工确认**（可能由上层传入 `aria-label`）

**修正模式**：

```tsx
// ❌ 违规（src/ui/date/view/view-selector-header.tsx:171）
<Button className="h-8 w-8 p-0" onClick={prev}><ChevronLeft /></Button>

// ✅ 修正
<Button className="h-8 w-8 p-0" aria-label={t('prevMonth')} onClick={prev}><ChevronLeft /></Button>
```

### 维度 ② 禁止 `outline-none` 无替代

**扫描命令**：

```bash
# 列出用了 outline-none / focus:outline-none 但无 focus-visible 替代的文件（空 = 合规）
Get-ChildItem src -Recurse -Include *.tsx | Where-Object {
  $_.FullName -notmatch '__tests__' -and $_.Name -notlike '*.stories.tsx'
} | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  if (($t -match '(?<!focus-visible:)outline-none' -or $t -match 'focus:outline-none') -and
      $t -notmatch 'focus-visible:(outline|ring)') {
    $_.FullName.Replace("$PWD\","").Replace("\","/")
  }
}
```

**判定规则**：

- ❌ 违规：移除焦点框却无 `focus-visible:` 替代（违反 WCAG 2.4.7）
- ✅ 合规：输出为空
- 📌 **实测基线**：**2 处**（`design-system/components/ui/input-otp.tsx` / `menubar.tsx`）→ 见 §M+2 H5

**修正模式**：

```tsx
// ❌ 违规
'outline-none';

// ✅ 修正
'outline-none focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2';
```

### 维度 ③ 禁止 `focus:` 表达焦点

**扫描命令**：

```bash
rg -n "focus:(ring|border|outline|bg-)" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：出现 `focus:ring-*` / `focus:border-*` / `focus:outline-*` / `focus:bg-*`
- ✅ 合规：0 命中
- ⚠️ **例外**：菜单**项**的 `focus:bg-accent` 属 Radix 键盘导航高亮语义
  （与 `css-standard.md` §4.7 例外一致）

**修正模式**：

```tsx
// ❌ 违规：focus: 是鼠标点击也会触发的伪类，不能表达「键盘焦点」
<div className="focus:ring-2 focus:ring-ring" />

// ✅ 修正：一律 focus-visible:（并按维度④配 ring-offset）
<div className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
```

### 维度 ④ `focus-visible:ring` 必须配 `ring-offset`

**扫描命令**：

```bash
# 列出用 ring 表达焦点但未配 offset 的文件（空 = 合规）
Get-ChildItem src -Recurse -Include *.tsx | Where-Object {
  $_.FullName -notmatch '__tests__' -and $_.Name -notlike '*.stories.tsx'
} | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  if ($t -match 'focus-visible:ring' -and $t -notmatch 'focus-visible:ring-offset') {
    $_.FullName.Replace("$PWD\","").Replace("\","/")
  }
}
```

**判定规则**：

- ❌ 违规：用 `ring` 表达焦点但无 `offset` → 视觉等同描边（违反 `css-standard.md` §4.7）
- ✅ 合规：输出为空
- 📌 **实测基线**：**21 个文件** → 见 §M+2 H3

**修正模式**：

```tsx
// ❌ 违规
'focus-visible:ring-[3px] focus-visible:ring-ring/50';

// ✅ 修正
'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2';
```

### 维度 ⑤ 禁止 `transition-all`

**扫描命令**：

```bash
rg -n "transition-all" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：`transition-all` —— 动画化所有属性（含布局属性）
- ✅ 合规：0 命中
- 📌 **实测基线**：**12 处** → 见 §M+2 H6

**修正模式**：

```tsx
// ❌ 违规
'transition-all duration-200';

// ✅ 正确
'transition-[color,box-shadow] duration-200';
```

### 维度 ⑥ 动效必须有 reduced-motion 降级

**扫描命令**：

```bash
# ① 自定义动画必须有 media 兜底（animate-ripple / animate-gradient 在 styles.css）
rg -n "@utility animate-|@keyframes" src/theme/styles.css
Select-String -Path src/theme/styles.css -Pattern "prefers-reduced-motion" | ForEach-Object { "OK: " + $_.Line.Trim() }

# ② 组件内的动效类必须配 motion-reduce
rg -n "transition-\[|animate-" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading |
  Where-Object { $_ -notmatch 'motion-reduce:' }
```

**判定规则**：

- ❌ 违规 1：`styles.css` 的 `@utility` 动画无 `prefers-reduced-motion` 兜底
- ❌ 违规 2：组件内动效类未配 `motion-reduce:`
- ✅ 合规：两条均通过

**修正模式**：

```css
/* ✅ 修正 —— src/theme/styles.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 维度 ⑦ 交互元素必须键盘可达

**扫描命令**：

```bash
# 列出「非 button 元素带 onClick」且无 role/tabIndex/onKeyDown 的文件（空 = 合规）
rg -n "<(div|span|li|td|tr|i|img)[^>]*onClick" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：非语义元素带 `onClick` 而**无** `role` + `tabIndex` + `onKeyDown`
- ✅ 合规：每个命中项都有完整的**三件套**
- ⚠️ 本维度**需人工确认**（命令只列出候选）

**修正模式**：

```tsx
// ❌ 违规（src/ui/date/input-date.tsx:320）
<Icon onClick={openPicker} />

// ✅ 修正
<button type="button" aria-label={t('openPicker')} onClick={openPicker}>
  <Icon aria-hidden="true" />
</button>
```

### 维度 ⑧ 禁止正数 `tabIndex`

**扫描命令**：

```bash
rg -n "tabIndex=\{[1-9]" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：`tabIndex` 为正数 —— 打乱 Tab 顺序
- ✅ 合规：0 命中（`0` 与 `-1` 均合法）

**修正模式**：

```tsx
// ❌ 违规：用正 tabIndex 强行前置 —— DOM 顺序才是可预期的 Tab 顺序
<div tabIndex={1} onClick={...} />

// ✅ 修正：调整 DOM 顺序实现优先级；确实需脱离 Tab 流时用 -1（配合键盘监听三件套，§2）
```

### 维度 ⑨ 表单控件必须有可访问名称

**扫描命令**：

```bash
# 列出含 <input / <textarea / <select 但无 label / aria-label / aria-labelledby 的文件（空 = 合规）
Get-ChildItem src/ui -Recurse -Include *.tsx | Where-Object {
  $_.FullName -notmatch '__tests__' -and $_.Name -notlike '*.stories.tsx'
} | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  if ($t -match '<(input|textarea|select)\b' -and
      $t -notmatch 'aria-label' -and $t -notmatch 'aria-labelledby' -and $t -notmatch '<label') {
    $_.FullName.Replace("$PWD\","").Replace("\","/")
  }
}
```

**判定规则**：

- ❌ 违规：含表单控件但无任何可访问名称来源
- ✅ 合规：输出为空
- ⚠️ **需人工确认**（组件可能通过 `...props` 让调用方传 `aria-label`）

### 维度 ⑩ 禁止 `...` 三点省略号

**扫描命令**：

```bash
# 文案表中的 ... 必须为 …
rg -n "'[^']*\.\.\.[^']*'" src/utils/component-messages.ts --no-heading
```

**判定规则**：

- ❌ 违规：用户可见文案含三个 ASCII 点
- ✅ 合规：0 命中
- 📌 **实测基线**：**40 处** → 见 §M+2 G-A7
- ⚠️ **排除**：日期格式串（`'YYYY-MM-DD HH:mm:ss'`）不是省略号

### 维度 ⑪ 禁止 `aria-label` 硬编码文案

**扫描命令**：

```bash
# aria-label 的值若是中英文字面量（而非变量 / t() 调用）即违规
rg -n "aria-label=['\"][^'\"]{2,}['\"]" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：`aria-label="关闭"` 这类硬编码
- ✅ 合规：全部走 `t('xxx')` / 变量
- ⚠️ **例外**：纯装饰性元素的 `aria-label=""`（空值）

**修正模式**：

```tsx
// ❌ 违规
<IconButton icon="eye" aria-label="预览" />

// ✅ 修正
<IconButton icon="eye" aria-label={t('previewLabel')} />
```

### 维度 ⑫ 禁止 `user-scalable=no` / `maximum-scale`

**扫描命令**：

```bash
rg -n "user-scalable|maximum-scale|minimum-scale" -g "src/**" -g "docs/**" --no-heading
```

**判定规则**：

- ❌ 违规：出现禁用缩放的 viewport 配置
- ✅ 合规：0 命中

**修正模式**：

```html
<!-- ❌ 违规：禁用缩放剥夺低视力用户放大能力（iOS Safari 10+ 会忽略但仍是违规契约） -->
<meta name="viewport" content="width=device-width, user-scalable=no, maximum-scale=1" />

<!-- ✅ 修正 -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## M+1. 历史基准（2026-11-04 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                                                      | 值                                        | 判定          |
| --------------------------------------------------------- | ----------------------------------------- | ------------- |
| `focus-visible` 命中                                      | **142** 次 / 34 文件                      | ✅ 基础建立   |
| `outline-none` 命中                                       | **58** 处 / 34 文件（**成对使用为主**）   | ✅ 基本合规   |
| `outline-none` **无** `focus-visible` 替代                | **2** 个文件                              | ❌ 需修复     |
| `focus-visible:ring` **未配** `ring-offset`               | **21** 个文件                             | ❌ 需修复     |
| `transition-all` 命中                                     | **12** 处 / 12 文件                       | ❌ 需修复     |
| `prefers-reduced-motion` / `motion-reduce` 命中           | **2** 处（仅 `button.tsx` + `table.css`） | ❌ 严重不足   |
| `aria-live` 命中                                          | **4** 次 / 2 文件                         | ⚠️ 覆盖不足   |
| `aria-hidden="true"` 命中                                 | **19** 次 / 13 文件                       | ✅ 良好       |
| `aria-label` 命中（源码）                                 | **约 20** 处 / 约 12 个实现文件           | ⚠️ 覆盖不足   |
| `aria-expanded` 命中                                      | **1** 处                                  | ⚠️ 多靠 Radix |
| 图标按钮缺可访问名称                                      | **18** 处 + 6 处日期后缀图标              | ❌ 需修复     |
| `onClick` 在非语义元素上                                  | **9** 处（其中 **6** 处键盘不可达）       | ❌ 需修复     |
| `tabIndex` 正数                                           | **0**                                     | ✅ 合规       |
| `role` 取值                                               | 7 种（全部语义正确）                      | ✅ 合规       |
| `autoFocus`                                               | **3** 处（全在表格插件弹窗）              | ✅ 豁免       |
| `touch-action` / `overscroll-behavior`                    | **0**                                     | ❌ 缺失       |
| `tabular-nums` / `text-balance` / `text-pretty`           | **0**（`min-w-0` 有）                     | ❌ 缺失       |
| 文案中 `...` 三点                                         | **40** 处（`component-messages.ts`）      | ❌ 需修复     |
| `Intl.DateTimeFormat` / `Intl.NumberFormat`               | **2**（仅取时区，非格式化）               | ❌ 缺失       |
| `color-scheme` 声明                                       | **0**                                     | ❌ 缺失       |
| `<img>` 缺 `alt`                                          | **0**（5 处全部有 `alt`）                 | ✅ 合规       |
| `outline-none` 无替代 / ring 无 offset / `transition-all` | 维度 ② / ④ / ⑤ 已覆盖                     | —             |

---

## M+2. 豁免清单与缺口登记

### 豁免清单（存量豁免，新增代码 MUST 达标）

| #   | 对象                                                                | 豁免依据                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | `focus:outline-none` + `focus-visible:ring-*` 的 5 处               | **有意设计** —— 避免鼠标点击后焦点圈常驻；且**已配** `focus-visible` 替代。取值见 `close-button.tsx` / `tree.tsx` / `tag.tsx` / `toast.tsx` / `navigation-menu.tsx`（与 H7 同义，合并归 H1） |
| H2  | `design-system` 层用 `focus-visible:ring-[3px]` 的 14 个文件        | **DS 层是「基础实现」**，其样式由 `src/ui/` 封装层决定焦点表现（`src/ui` 层**已**统一为 `outline` 范式）。**新增** `src/ui/` 代码**必须**用 `outline`                                        |
| H3  | `focus-visible:ring` 未配 `offset` 的 **21 个文件**                 | **存量豁免** —— Radix / shadcn 上游沿用。**改动**这些文件时 MUST 顺手补 `focus-visible:ring-offset-2`；**新增**代码**禁止**此写法                                                            |
| H4  | `autoFocus` 的 3 处（表格插件弹窗配置）                             | Radix `DialogContent` 已内置焦点管理，额外 `autoFocus` **不改**最终焦点位置。**新增**代码**禁止**无理由 `autoFocus`                                                                          |
| H5  | `outline-none` 无替代的 2 个文件（`input-otp.tsx` / `menubar.tsx`） | **存量豁免** —— `menubar.tsx` 的焦点由 Radix `Menu` 的 roving tabindex 管理；`input-otp.tsx` 为 Radix 内部实现。**改动**时 MUST 补 `focus-visible:` 替代                                     |
| H6  | `transition-all` 的 12 处                                           | **存量豁免** —— 全部在 `design-system` 与 `src/ui/table` 的既有组件。**新增**代码**禁止**；**改动**时 MUST 收窄为具体属性                                                                    |

### 缺口登记（需排期修复）

| #     | 缺口                                                                                                                                                                                                                                                   | 涉及维度 | 影响                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------- |
| G-A1  | Toast / Table 异步态**无 live region**                                                                                                                                                                                                                 | §4.2     | 屏幕阅读器用户**收不到**加载完成通知   |
| G-A2  | `input` / `textarea` / `switch` **无内建 label 关联**                                                                                                                                                                                                  | 维度 ⑨   | 调用方忘传 `aria-label` → 控件**无名** |
| G-A3  | `animate-ripple` / `animate-gradient` / `animate-spin` **无** reduced-motion 兜底；且 `src/theme/styles.css` **缺全局** `prefers-reduced-motion` 兜底（实测兜底仅在 `src/ui/table/style/table.css` + 1 个测试文件 —— `check:spec` a11y⑥ 当前 1 ERROR） | 维度 ⑥   | 前庭功能障碍用户会看到强制动画         |
| G-A4  | `transition-all` 12 处                                                                                                                                                                                                                                 | 维度 ⑤   | 触发非预期布局重排                     |
| G-A5  | 全库**零** `overscroll-behavior`                                                                                                                                                                                                                       | §7.2     | 浮层滚动穿透到下层                     |
| G-A6  | 列宽拖拽手柄**可能缺**键盘替代路径                                                                                                                                                                                                                     | §7.3     | 纯键盘用户无法调整列宽                 |
| G-A7  | 文案中 `...` 三点 **40 处**                                                                                                                                                                                                                            | 维度 ⑩   | 与排版规范不符                         |
| G-A8  | `src/ui/date/` **零** `Intl.*`，默认格式不随 locale 变                                                                                                                                                                                                 | §8.6     | 非中文语言下日期格式仍是 ISO 风格      |
| G-A9  | 深色主题**无** `color-scheme: dark`                                                                                                                                                                                                                    | §9.3     | 滚动条 / 原生控件仍是浅色              |
| G-A10 | 图标按钮缺可访问名称 **18 处** + 日期后缀图标 **6 处**                                                                                                                                                                                                 | 维度 ①   | 交互元素对屏幕阅读器**完全不存在**     |
| G-A11 | 6 处非语义元素 `onClick` **键盘不可达**                                                                                                                                                                                                                | 维度 ⑦   | 纯键盘用户无法完成该操作               |
| G-A12 | `alt="card"` 等**无意义 alt**                                                                                                                                                                                                                          | §1.4     | 屏幕阅读器读出元素类型而非内容         |

---

## M+3. 冲突裁决

> **外部规则（Vercel Web Interface Guidelines / React 最佳实践）与本库既有规范的冲突裁决。**

| #   | 冲突点                    | 外部规则                                      | 本库既有规范                                                      | 裁决                                                                                                                                                                                                              |
| --- | ------------------------- | --------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | 焦点指示的视觉形态        | `focus-visible:ring-*` 或等效                 | **必须用 `outline`，禁止 `ring`**（`css-standard.md` §4.7）       | **保留本库规范** —— `outline` 绘制在元素之外，天然与元素分离；`ring` 紧贴边缘会被误读为「选中态」。外部规则的 `ring` **仅在配 `offset` 时**才可接受（维度 ④）                                                     |
| C2  | 焦点触发器                | `:focus-visible` 优于 `:focus`                | `css-standard.md` §4.7 已同                                       | **一致，直接采纳**                                                                                                                                                                                                |
| C3  | `outline-none`            | 「禁止 `outline: none` 而无替代」             | 同                                                                | **一致，直接采纳**（维度 ②）                                                                                                                                                                                      |
| C4  | `transition: all`         | 「禁止，必须显式列出属性」                    | 未涉及                                                            | **采纳**（维度 ⑤）—— 外部规则的理由（compositor-friendly）与本库的构建期 CSS 约束一致                                                                                                                             |
| C5  | `prefers-reduced-motion`  | 「必须提供降级变体或禁用」                    | 未涉及                                                            | **采纳**（维度 ⑥）—— 但**例外**：`tw-animate-css` 提供的 `animate-in` / `animate-out`（Radix 弹层动画）**不逐个降级**，改由 `styles.css` 的**全局 media 查询**统一兜底                                            |
| C6  | 组件命名 / 组合式 API     | 复合组件（`.Root` / `.Trigger` 静态属性）     | **扁平多导出**（`DialogContent` / `DialogTitle`）                 | **保留本库规范** —— 本库走「扁平多导出 + 父名前缀」，与 Radix 上游的静态属性风格**刻意不同**（避免 `Dialog.Content` 与 `DialogContent` 双命名并存）。详见 [`component-standard.md`](./component-standard.md) §3.8 |
| C7  | `asChild` 覆盖            | 复合组件普遍提供 `asChild`                    | 仅 Button / Tag / Badge / AlertDialog 提供                        | **采纳为方向，但不改现有 API** —— `asChild` 是**公开 API**，新增需走版本 bump；本规范**只要求**新增的复合组件**必须**提供 `asChild`                                                                               |
| C8  | 布尔 prop 扩散            | 「避免布尔 prop 扩散，用组合替代」            | 未涉及（`component-standard.md` §2.2 规定 `is`/`has`/`can` 前缀） | **采纳为方向** —— 但**不强制**立即重构既有 API（破坏性变更）。详见 [`component-standard.md`](./component-standard.md) §3.12                                                                                       |
| C9  | `renderX` vs `children`   | 「优先 `children` 而非 render props」         | 未涉及                                                            | **采纳** —— **新增**组件**必须**优先 `children` / 插槽 prop；既有 `render*`（表格子系统 9 处）属存量豁免                                                                                                          |
| C10 | 数值 / 日期格式化         | 「用 `Intl.*` 而非硬编码格式」                | `i18n-standard.md` 只管文案不管格式                               | **采纳并扩展**（§8.6）—— 但**不强制**替换既有 `dayjs().format()`（格式由消费方传入，是合理设计）                                                                                                                  |
| C11 | URL 反映状态              | 「筛选 / 分页 / 展开态应进 query params」     | 未涉及（组件库无路由）                                            | **不适用** —— 本库**不持有路由**；URL 同步是**消费方**责任。本规范**不引入**此维度                                                                                                                                |
| C12 | 破坏性操作需确认 / 可撤销 | 「destructive 动作需确认弹窗或撤销窗口」      | 部分组件有 `AlertDialog`                                          | **采纳为消费方指引** —— 组件库提供 `AlertDialog` / `Toast` 能力；**是否**用是消费方决策。本规范**不强制**组件内置确认                                                                                             |
| C13 | 动效 > 5 秒需暂停 / 停止  | 「自动播放动效需提供暂停控制」                | 未涉及                                                            | **不适用于本库** —— 本库**无自动播放动效**（`animate-ripple` / `animate-gradient` 是交互反馈，非内容动效）                                                                                                        |
| C14 | 大列表虚拟化              | 「> 50 项需虚拟化」                           | 表格有 `VirtualList`                                              | **已落地** —— `src/ui/table/atoms/virtual-list/` 已实现；**新增**长列表组件**必须**虚拟化                                                                                                                         |
| C15 | `autoFocus` 谨慎使用      | 「autoFocus sparingly —— 桌面端、单一主输入」 | 未涉及                                                            | **采纳**（§4.4）—— 且**加严**：移动端**禁止** autoFocus（外部规则未提移动端）                                                                                                                                     |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审组件时的**自查**清单（不是任务列表，是合规性自检表）。

### 新增交互组件时

- [ ] 图标按钮有 `aria-label`（或 `sr-only` 文本）；装饰性图标有 `aria-hidden="true"`
- [ ] 交互用 `<button type="button">` / `<a>`；非语义元素补齐 `role` + `tabIndex={0}` + `onKeyDown`（Enter + Space）
- [ ] 焦点样式：`focus-visible:` + `outline`（或 `ring` + `offset`），**无**裸 `outline-none`
- [ ] 表单控件有可访问名称（`<label htmlFor>` / `aria-label` / `aria-labelledby`）
- [ ] 错误提示通过 `aria-describedby` 关联控件
- [ ] 状态变化用 ARIA 暴露（`aria-expanded` / `aria-selected` / `aria-busy`）；**不重复** Radix 已注入的
- [ ] 异步内容有 `aria-live="polite"`（或 `role="status"` / `role="alert"`）
- [ ] 动效有 `motion-reduce:` 降级（或由 `styles.css` 的全局 media 兜底）
- [ ] 过渡用具体属性（`transition-[color,box-shadow]`），**不用** `transition-all`
- [ ] 可点击元素声明 `touch-action: manipulation`；浮层内容有 `overscroll-behavior: contain`
- [ ] 文案省略号用 `…`；`aria-label` 走 i18n `t()`
- [ ] 长文本容器 `truncate` / `line-clamp-*` + 父级 `min-w-0`；标题加 `text-balance`
- [ ] 数值列加 `tabular-nums`
- [ ] `<img>` 有 `alt`（装饰用 `alt=""`）+ 显式 `width` / `height`
- [ ] 未引入 `user-scalable=no` / `maximum-scale`

### 评审交互时

- [ ] 维度 ① ~ ⑫ 已全跑（一次跑全库，非按组件分批）
- [ ] 键盘走查：Tab 能到达所有交互元素；Enter / Space 能触发；焦点指示始终可见
- [ ] 深色主题下原生控件（滚动条 / `<select>` / 复选框）可读
- [ ] `prefers-reduced-motion: reduce` 下无强制动画
- [ ] 组件文档已说明所需的可访问名称（消费方接入指引）

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-11-04 | **首版**。基于 `vercel-react-best-practices` / `vercel-composition-patterns` / `web-design-guidelines` 三个技能提炼，**结合本库真实实现**裁定，不照搬外部规则。① 确立 **9 章条文**：可访问名称（§1）/ 语义与键盘可达性（§2）/ 焦点管理（§3）/ ARIA 状态（§4）/ 表单与输入（§5）/ 动效与交互反馈（§6）/ 触屏与手势（§7）/ 文案与排版（§8）/ 视觉与布局（§9）；② **12 项扫描维度**（每项含命令 + 判定 + 修正模式），其中维度 ①⑤⑥⑩⑪⑫ 为**本库实测新增**（外部规则无对应扫描器）；③ **§M+3 冲突裁决 15 条（C1~C15）** —— 逐条裁定外部规则与本库既有规范的冲突：**保留**本库的 `outline` 焦点范式（C1）、**保留**扁平多导出而非静态属性复合组件（C6）、**不适用** URL 状态同步与路由（C11，因组件库不持有路由）、**不适用** 自动播放动效暂停（C13）、**加严** `autoFocus` 规则（移动端禁止，C15）；**采纳** `transition-all` 禁用（C4）、`prefers-reduced-motion` 降级（C5）、`Intl.*` 格式化（C10，仅约束组件内置默认格式）；④ **§M+2 豁免清单 7 条**（H1~H7）+ **缺口登记 12 条**（G-A1~G-A12），全部带**实测基线数字**（图标按钮缺名 18 处 / 键盘不可达 6 处 / `transition-all` 12 处 / `ring` 无 offset 21 文件 / reduced-motion 仅 2 处 / `...` 40 处 / `overscroll-behavior` 0 处 / `color-scheme` 0 处）；⑤ **§M+1 基线**逐项给出「值 + 判定」两列 —— 明确区分「✅ 已合规」与「❌ 需修复」，**不粉饰现状**。 |
| 1.1.0 | 2026-11-05 | **全量评审修正**。① **维度③⑧⑫补修正模式**（原仅有命令 + 判定，缺 §M 三件套的最后一件）；② **G-A1 涉及维度修正** —— live region 属 **§4.2** 条文，原标「维度⑫」（viewport 缩放，张冠李戴）；③ **G-A3 扩充** —— 登记实测新发现：`src/theme/styles.css` **缺全局** `prefers-reduced-motion` 兜底（兜底仅在 `src/ui/table/style/table.css` + 1 个测试文件，`check:spec` a11y⑥ 当前 1 ERROR）；④ **H1 / H7 去重** —— 同一豁免（`focus:` 配对）删除 H7 行，归 H1。**规范条文本身不过期，只有数据基准会过期**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 命名 / 导出 / `cn()` 合并
- [`css-standard.md`](./css-standard.md) —— 焦点态样式规范（§4.7）/ 动画类 / 主题变量
- [`i18n-standard.md`](./i18n-standard.md) —— 内置双语文案（`aria-label` 的文案来源）
- [`testing-guidelines.md`](./testing-guidelines.md) —— 无障碍断言怎么写
- [`src/ui/icon/icon-button.tsx`](../src/ui/icon/icon-button.tsx) —— 焦点态约定的范式来源
- [`src/ui/combobox/combobox.tsx`](../src/ui/combobox/combobox.tsx) —— 键盘可达性三件套的范式来源
