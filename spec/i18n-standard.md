# i18n 规范（组件库内置国际化）

> **本文档是组件库国际化（i18n）的唯一真值源**。
> 任何组件新增/修改用户可见文案、错误提示、日志文案前，**先读本文档**。

- **版本**：1.0.0
- **真值源**：`src/utils/ui-message.ts`（处理引擎）+ `src/utils/component-messages.ts`（内置文案表）
- **适用范围**：`src/ui/**`、`src/design-system/**`、`src/utils/**`、`src/hooks/**`

---

## 1. 核心原则

| 编号 | 原则                                        | 说明                                                                                     |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| P1   | **组件库自带文案，必须内置双语**            | 组件库是**可发布产物**，消费方不会为了显示一个「加载中...」去额外配 i18n 资源            |
| P2   | **只走 `src/utils/ui-message.ts` 内置模式** | **禁止**引入 `react-i18next` / `i18next` / 全局 store 等外部 i18n 方案                   |
| P3   | **语言由消费方注入**                        | 组件库**不持有**全局语言状态；通过 `LocaleProvider` / `locale` prop / `useLocale()` 传入 |
| P4   | **中文 + 英文必须同时提供**                 | 内置文案表必须同时包含 `zh-CN` 与 `en-US`，**不允许**只有一种语言                        |
| P5   | **文案与逻辑分离**                          | 文案写在消息表里，组件代码只通过 key 取值，**不内联字符串字面量**                        |
| P6   | **文案可被覆盖**                            | 消费方传入的 `messages` 优先于内置文案（见 §4）                                          |

---

## 2. 为什么不用全局 i18n

| 维度       | 说明                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| **依赖**   | 组件库的 `peerDependencies` 只允许 `react` / `react-dom` / Radix primitives；引入 i18n 库会强制消费方安装特定 i18n 方案 |
| **状态**   | 组件库是**无状态**的纯组件集合，不应持有全局 store（与 `LocaleProvider` 的设计一致）                                    |
| **运行时** | i18n 库通常带插件、loader、SSR 适配等运行时负担，对组件库是纯负担                                                       |
| **一致性** | 消费方可能用 `react-i18next`，也可能是自研方案；组件库只需暴露「按 locale 取文案」的能力                                |

> **组件库的 i18n 职责边界**：
> 组件库负责**自身产生的文案**（按钮文字、状态提示、错误信息）；
> 消费方的**业务文案**（"订单已提交"）由消费方自己管理。

---

## 3. 目录与职责

```
src/
├── utils/
│   ├── ui-message.ts              # ★ 处理引擎（纯函数，无 React 依赖）
│   │                              #   processUiMessage / createMessageProcessor
│   │                              #   createContextMessageProcessor / processBatchMessages
│   │                              #   hasMessage / getAvailableMessageKeys / mergeUiMessages
│   ├── component-messages.ts      # ★ 内置文案表（全库默认文案，zh-CN + en-US）
│   └── use-component-message.ts   # ★ React 侧入口 Hook
├── hooks/
│   └── use-locale.ts              # 读取当前语言（LocaleContext → locale prop → zh-CN）
└── providers/
    └── locale-provider.tsx        # 语言上下文 Provider（消费方注入语言）

scripts/
└── check-i18n.ts                  # ★ 规范扫描脚本（维度①③④⑤⑥）
```

---

## 4. 三种使用方式（按优先级）

### 4.1 组件内取文案（推荐）—— `useComponentMessage`

```tsx
import { useComponentMessage } from '../../utils/component-messages';

const Alert = ({ children }) => {
  const { t } = useComponentMessage('alert');
  return <button aria-label={t('closeLabel')}>{children}</button>;
};
```

- `t(key, params?)` —— key 支持点号路径（`'pagination.total'`）
- 缺省文案（key 未定义时）**回退到 key 本身**，不会渲染 `undefined`

### 4.2 纯函数场景（非 React 上下文）—— `processUiMessage`

适用于工具函数、事件处理器、`catch` 块等拿不到 Hook 的地方：

```tsx
import { processUiMessage } from '../../utils/ui-message';
import { tableMessages } from '../../utils/component-messages';

console.error(processUiMessage('reloadFailed', tableMessages, { error: String(err) }));
```

> `processUiMessage` 的 `options.messages` 参数接收**整张消息表**（形如 `{ 'zh-CN': {...}, 'en-US': {...} }`）。

> ⚠️ **必须透传 `locale`** —— 不传 `locale` 时文案恒为 `zh-CN` 兜底。
>
> - **纯函数 / 工具函数** → 增加可选 `locale` 参数，由调用方透传；
> - **Hook 内** → 用 `useLocale()` 取当前语言，并把 `locale` 加入 `useMemo` / `useCallback` 的依赖数组；
> - **组件内** → 用 `useLocale()` 取当前语言后传给 `processUiMessage`。
>
> ```tsx
> // ✅ 正确：随语言变化
> const { locale } = useLocale();
> const hint = processUiMessage('formatHint', { locale, messages: dateMessages }, { format });
>
> // ❌ 错误：恒为 zh-CN
> const hint = processUiMessage('formatHint', { messages: dateMessages }, { format });
> ```

### 4.3 消费方覆盖 —— `messages` prop / `useTableI18n` 的 `messages`

消费方传入的消息表**优先于**内置文案：

```tsx
<Alert messages={{ 'en-US': { closeLabel: 'Dismiss' } }} />
```

合并规则：**浅合并**（顶层 key 覆盖），不做深合并 —— 与 `useTableI18n` 现有行为一致。

---

## 5. 内置文案表规范（`src/utils/component-messages.ts`）

### 5.1 分组结构

按**组件域**分组，每个域一个导出常量：

```ts
export const alertMessages = {
  'zh-CN': { ... },
  'en-US': { ... },
} satisfies UiMessages;
```

导出清单（新增组件时同步追加）：

| 导出常量             | 覆盖组件域                                     |
| -------------------- | ---------------------------------------------- |
| `alertMessages`      | `alert` / `alert-dialog`                       |
| `buttonMessages`     | `button`                                       |
| `dateMessages`       | `date` 系（picker / range / time）             |
| `fileMessages`       | `file` 系（InputFile / InputImage / 上传下载） |
| `paginationMessages` | `pagination`                                   |
| `selectMessages`     | `select` / `combobox`                          |
| `tableMessages`      | `table` 系（表格状态 / 交互 / 插件）           |
| `toastMessages`      | `toast` / `use-toast` / `tag`                  |
| `treeMessages`       | `tree`                                         |
| `typographyMessages` | `typography`（`Static` 组件）                  |
| `iconMessages`       | `icon`（主题图标的 `aria-label` / `<title>`）  |
| `dialogMessages`     | `dialog`                                       |
| `drawerMessages`     | `drawer`                                       |
| `sheetMessages`      | `sheet`                                        |
| `sidebarMessages`    | `sidebar`                                      |
| `breadcrumbMessages` | `breadcrumb`                                   |
| `carouselMessages`   | `carousel`                                     |
| `commandMessages`    | `command`                                      |
| `editMessages`       | `edit`（ListEditor / ObjectEditor）            |
| `themeMessages`      | `theme`（mode-toggle）                         |

> 📌 **不建空表**：没有用户可见文案的组件**不占用文案域**
> （如 `card` / `form` 仅有纯布局与 `children`，无内置文案）——
> 建了却没人消费的表属于「僵尸表」，一律不建。

### 5.2 key 命名规则

| 规则                           | 示例                                         |
| ------------------------------ | -------------------------------------------- |
| **camelCase**                  | `noDataToExport` ✅ / `no_data_to_export` ❌ |
| **语义化命名**，不暴露实现细节 | `reloadFailed` ✅ / `err_0x1a` ❌            |
| **同类文案前缀一致**           | 所有"失败"文案统一以 `Failed` 结尾           |
| **占位符用 `{param}`**         | `'共 {total} 条'`                            |
| **层级不超过 2 层**            | `pagination.total` ✅ / `a.b.c.d` ❌         |

### 5.3 必备文案类别

每个组件域**至少**覆盖以下类别（按需增减）：

| 类别       | key 约定                             | 示例               |
| ---------- | ------------------------------------ | ------------------ |
| 加载态     | `loading`                            | `'加载中...'`      |
| 空状态     | `empty` / `noData`                   | `'暂无数据'`       |
| 错误态     | `loadFailed` / `error`               | `'加载失败'`       |
| 重试       | `retry`                              | `'重试'`           |
| 操作结果   | `<action>Success` / `<action>Failed` | `'exportFailed'`   |
| 无数据操作 | `noDataTo<action>`                   | `'noDataToExport'` |

---

## 6. 组件接入模板

### 6.1 组件 props 增加 `messages` 与 `locale`

**统一用 `UiMessageProps`（`src/utils/ui-message.ts`）扩展 props 接口**，避免每个组件重复声明：

```tsx
import type { UiMessageProps } from '../../utils/ui-message';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, UiMessageProps {
  closable?: boolean;
  // ...
}

export const Alert = ({ messages, locale, ...props }: AlertProps) => {
  const { t } = useComponentMessage('alert', { locale, messages });
  // ...
};
```

> `UiMessageProps` 的定义（`src/utils/ui-message.ts`）：
>
> ```ts
> export interface UiMessageProps {
>   /** 语言覆盖（优先级高于 LocaleProvider） */
>   locale?: string;
>   /** 自定义文案（优先级高于内置文案） */
>   messages?: UiMessages;
> }
> ```

> ⚠️ **组件必须把 `locale` / `messages` 从透传属性中摘出来**，
> 否则会作为未知属性透传到 DOM 元素（React 告警）。
> 组件内有子组件消费同一份文案时（如 `Toast` → `ToastClose`、`Tree` → `TreeNode`），
> 需通过 props 或 Context 把 `locale` / `messages` 继续向下传递。

### 6.2 `useComponentMessage` 签名

```ts
export interface UseComponentMessageOptions {
  /** 语言覆盖（优先级最高） */
  locale?: string;
  /** 消费方自定义文案（优先级高于内置） */
  messages?: UiMessages;
}

export interface UseComponentMessageReturn {
  /** 按 key 取文案，支持点号路径与 `{param}` 插值 */
  t: (key: string, params?: Record<string, unknown>) => string;
  /** 当前生效语言 */
  locale: string;
}

export function useComponentMessage(
  domain: ComponentMessageDomain,
  options?: UseComponentMessageOptions,
): UseComponentMessageReturn;
```

---

## 7. 扫描维度（可复跑）

> 每条维度都给出**命令 + 判定 + 修正模式**，评审时**必须**逐条跑。

### 维度① —— 硬编码中文文案

```bash
# 一键扫描（推荐）：覆盖维度①③④⑤⑥
npx tsx scripts/check-i18n.ts
```

**判定**：组件**实现文件**（非 `__tests__`、非 `*.stories.tsx`）中出现中文字符串字面量，且该文案是用户可见的（按钮文字、提示语、占位符、空状态、错误信息）。
**修正模式**：把文案提到 `src/utils/component-messages.ts` 对应域，组件内改用 `t('key')`。

> **豁免**：注释与 JSDoc 中的中文**不算违规**（注释规范要求中文）；
> 日期格式串（`'YYYY年MM月DD日'`）、业务枚举值（`'是'` / `'启用'`）等**数据判定字面量**也不算违规。

### 维度② —— 组件内联英文文案

```bash
Select-String -Path "src/ui/**/*.tsx" -Pattern "'[A-Z][a-z]+ [a-z]+" |
  Where-Object { $_.Line -notmatch "^\s*(//|\*)" -and $_.Line -notmatch "__tests__" } |
  Select-Object -First 50
```

**判定**：用户可见的英文文案（如 `'Retry'`、`'No data'`）硬编码在组件实现中。
**修正模式**：同维度①，加入对应语言的消息表。

### 维度③ —— 日志文案未走 i18n

```bash
# 已在 scripts/check-i18n.ts 中覆盖
```

**判定**：`console.error` / `console.warn` 的**第一个参数是硬编码字符串字面量**（含中文或英文固定文案），而不是 `processUiMessage(...)` 的返回值。
**修正模式**：

```tsx
// ❌ 违规
console.error('表格重新加载失败:', error);

// ✅ 合规
console.error(processUiMessage('reloadFailed', tableMessages, { error: String(error) }), error);
```

> **说明**：`console.debug` 用于开发期诊断，**不强制**走 i18n；`console.error` / `console.warn` 面向用户可见的错误反馈，**必须**走 i18n。

### 维度④ —— 消息表语言不完整

```bash
# 已在 scripts/check-i18n.ts 中覆盖
```

**判定**：任一 `*Messages` 常量缺少 `zh-CN` 或 `en-US` 键。
**修正模式**：补齐缺失语言的文案（**禁止**用英文占位符冒充中文翻译）。

### 维度⑤ —— key 不一致

```bash
# 已在 scripts/check-i18n.ts 中覆盖
```

**判定**：两语言的 key 集合不等。
**修正模式**：以 key 较少的一侧为准补齐，或删除多余 key。

### 维度⑥ —— 占位符不匹配

```bash
# 已在 scripts/check-i18n.ts 中覆盖
```

**判定**：同一 key 在两种语言里使用的 `{param}` 名称不一致。
**修正模式**：统一占位符名称（英文命名）。

### 维度⑦ —— 绕过内置引擎

```bash
Select-String -Path "src/**/*.{ts,tsx}" -Pattern "react-i18next|from 'i18next'|useTranslation"
```

**判定**：出现外部 i18n 库 import。
**修正模式**：改用 `src/utils/ui-message.ts` 的内置模式。

### 维度⑧ —— 引入全局 store 持有语言

```bash
Select-String -Path "src/**/*.{ts,tsx}" -Pattern "create\(|zustand|redux"
```

**判定**：组件库内部用全局 store 持有语言状态。
**修正模式**：语言由消费方通过 `LocaleProvider` 注入；组件库内部只用 `useLocale()` 读取。

---

## 8. 豁免清单

| 豁免项                           | 理由                                                        |
| -------------------------------- | ----------------------------------------------------------- |
| 注释 / JSDoc 中的中文            | 注释规范要求中文（见 `code-annotation-standard.md`）        |
| `__tests__/` 下的测试文件        | 测试断言可用固定字面量                                      |
| `*.stories.tsx` 演示文案         | Storybook 演示不面向终端用户                                |
| 开发期 `console.debug`           | 诊断日志，不属于用户可见反馈                                |
| 构建脚本 / `scripts/**` 中的文案 | 不进运行时产物                                              |
| 品牌名 / 技术名词                | `Table`、`CSV`、`JSON` 等不翻译                             |
| 用户数据（record 字段值）        | 数据不是文案                                                |
| 组件域自带的文案表               | `src/ui/date/locale/index.ts` 等本身就是文案表              |
| date-fns 日期格式串              | `'YYYY年MM月DD日'` 是格式，不是展示文案                     |
| 业务枚举值                       | `'是'` / `'否'` / `'启用'` 等用于**数据判定**，不是展示文案 |

---

## 9. 检查清单（提交前）

新增/修改组件文案时：

- [ ] 文案已提到 `src/utils/component-messages.ts`（不在组件内内联）
- [ ] `zh-CN` 与 `en-US` **都已提供**
- [ ] 两个语言的 **key 集合一致**
- [ ] `{param}` 占位符名称一致
- [ ] key 为 camelCase，语义化
- [ ] `console.error` / `console.warn` 的固定文案走 `processUiMessage`
- [ ] 组件支持 `locale` prop 与 `messages` 覆盖
- [ ] 未引入外部 i18n 库
- [ ] 维度①~⑧ 全部通过

---

## 10. 版本历史

| 版本  | 变更                                                      |
| ----- | --------------------------------------------------------- |
| 1.0.0 | 首版：确立组件库内置 i18n 规范（8 项扫描维度 + 豁免清单） |
