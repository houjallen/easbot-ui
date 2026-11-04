---
name: component-api-standard
description: 该规范定义 easbot-ui 组件库的公开 API 设计契约，含布尔 prop 扩散治理（阈值分级 + 收敛策略）、复合组件形态选型（扁平多导出 vs 静态属性复合 vs 插槽组合，本库裁定扁平多导出）、children 与插槽优先于 render props（renderX 仅限表格等数据渲染场景）、Context 接口分层（Context Provider 独占状态 / 消费 Hook 抛错守卫 / 状态 actions 与 meta 分离）、props 命名约定（is/has/can 前缀、variant/size 枚举化）、受控与非受控配对（value/defaultValue）、以及 10 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与 API 设计评审检查清单。当设计新组件的 props、重构布尔 prop、引入 render props 或 Context、或评审组件公开 API 时参考。
category: specification
version: 1.1.0
baseline-date: 2026-11-05
tags:
  [
    easbot-ui,
    component-api,
    props,
    boolean-props,
    compound-components,
    render-props,
    context,
    slots,
    code-review,
  ]
related:
  - spec-index.md
  - component-standard.md
  - architecture-standard.md
  - a11y-interaction-standard.md
  - testing-guidelines.md
---

# EASBot UI 组件 API 设计规范 (Component API Standard)

> **真值源**：本规范以 `src/ui/**` 的**真实 props 定义**为唯一执行真值
> （[`src/ui/button/button.tsx`](../src/ui/button/button.tsx)、
> [`src/ui/table/types/base.ts`](../src/ui/table/types/base.ts)、
> [`src/ui/tree/tree.tsx`](../src/ui/tree/tree.tsx)、
> [`src/ui/table/context/TableContext.tsx`](../src/ui/table/context/TableContext.tsx)）；
> 规范与实现冲突时**规范改**（先改规范再改实现，不留双轨）。
>
> **与其它规范的分工**（四者**不重复**）：
>
> | 关注点                                              | 归属文档                                                         | 本规范对应章节        |
> | --------------------------------------------------- | ---------------------------------------------------------------- | --------------------- |
> | 组件**目录 / 命名 / 导出 / 封装**                   | [`component-standard.md`](./component-standard.md)               | §3.11（仅交叉引用）   |
> | 组件**状态管理 / Context 分层**                     | [`architecture-standard.md`](./architecture-standard.md)         | §4（仅 Context 归属） |
> | **无障碍**相关的 props 语义                         | [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) | §5.3（仅交叉引用）    |
> | props 的**类型写法**（`interface` / `import type`） | [`component-standard.md`](./component-standard.md)               | §3.3（仅交叉引用）    |
>
> **历史基准**：v1.0.0 锁定 2026-11-04 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本规范管的是**组件对外暴露什么**——即**公开 API**。
[`component-standard.md`](./component-standard.md) 管的是「组件**怎么写**」（目录 / 导出 / `cn()`），
本规范管的是「组件**对外长什么样**」（props 形状 / 组合方式 / 状态边界）。

组件库的 props 是**公开契约**（见 [`component-standard.md`](./component-standard.md) §3.9），
一旦发布就被消费方依赖。因此 props 的设计**不是自由裁量**，而是**需要论证的决策**。

**核心约束**：

- ✅ **布尔 prop 有阈值** —— 单组件布尔 prop **必须 ≤ 5 个**；超过**必须**收敛为 `variant` 或配置对象
- ✅ **布尔 prop 必须成对** —— 有 `onXxx` 回调**必须**有对应的 `xxx` 布尔；无回调的布尔**必须**有明确语义
- ✅ **`children` 与插槽优先** —— **禁止**用 `renderX` prop 做**结构**组合；`renderX` 仅限**数据项**渲染
- ✅ **复合组件走「扁平多导出」** —— 本库**不**采用静态属性复合（`Dialog.Content`）
- ✅ **Context 状态由 Provider 独占** —— 消费 Hook **必须**抛错守卫，**禁止**返回 `undefined` 让消费方判空
- ✅ **Context 必须分离 state / actions / meta** —— 便于消费方按需订阅
- ✅ **受控与非受控必须配对** —— 有 `value` **必须**有 `defaultValue`
- ✅ **`variant` / `size` 用 cva 派生** —— **禁止**手写联合类型
- ❌ 禁止「一个布尔表达一个功能开关」的**无节制扩散**
- ❌ 禁止 `renderX` 与 `children` **同时**表达同一位置的渲染权
- ❌ 禁止在组件内 `useContext` 后**不做空值守卫**（消费方拿到 `undefined` 会在深层炸掉）
- ❌ 禁止**已发布**的 props 改名 / 删除（须走版本 bump + CHANGELOG）

---

## 1. 布尔 prop 治理

### 1.1 为什么管这件事

布尔 prop 的成本**不在数量**，而在**组合爆炸**与**语义歧义**：

| 问题         | 表现                                                       |
| ------------ | ---------------------------------------------------------- |
| **组合爆炸** | 5 个布尔 = 32 种状态组合，其中大量是**无效组合**（互斥态） |
| **语义歧义** | `showLabel` 与 `hideLabel` 同时为 `true` 时，谁赢？        |
| **不可演进** | 新增一个布尔 = 新增一条分支；重构 = 破坏性变更             |
| **文档膨胀** | 每个布尔都要在文档表里占一行并说明互斥关系                 |

### 1.2 分级阈值（本库裁定）

| 布尔 prop 数 | 判定      | 处置                                                         |
| ------------ | --------- | ------------------------------------------------------------ |
| **0 ~ 3**    | ✅ 良好   | 无需处理                                                     |
| **4 ~ 5**    | ⚠️ 可接受 | 新增布尔**必须**在 PR 说明里论证「为何不能用现有能力表达」   |
| **6 ~ 8**    | ❌ 需收敛 | **必须**收敛为配置对象或 `variant`（**下次破坏性窗口**处理） |
| **≥ 9**      | ⛔ 严重   | **必须**立即收敛（视为技术债，登记缺口）                     |

> 📌 **实测基线**（2026-11-04）：
>
> | 组件                                                | 布尔 prop 数 | 判定       |
> | --------------------------------------------------- | ------------ | ---------- |
> | `table/types/base.ts`（表格**配置契约**，非单组件） | **23**       | ⚠️ 见 §1.4 |
> | `file/types.ts`（InputFile / InputImage 共用）      | **6**        | ❌         |
> | `table/atoms/TableFixedColumn.tsx`                  | **6**        | ❌         |
> | `date/embedded-date-picker.tsx`                     | **5**        | ⚠️         |
> | `date/enhanced-date-picker.tsx`                     | **4**        | ⚠️         |
> | 其余 **44 个** 组件                                 | **≤ 3**      | ✅ 良好    |
>
> 📌 **全库布尔 prop 声明共 126 处**，其中 `show*` 前缀**占主导**
> （`showLabel` × 11 / `showInMore` × 6 / `showSeconds` × 5 / `showShortcuts` × 5 /
> `showIcon` × 3 / `showConfirm` × 3 / `showCancel` × 2）。
> **命名高度一致**是**好事** —— 收敛时可按前缀成组迁移。

### 1.3 收敛策略（按优先级）

#### 策略 A：合并为语义化 `variant`（**首选**）

互斥的布尔**必须**收敛为枚举：

```tsx
// ❌ 反例 —— 互斥布尔，组合无意义
interface TableToolbarProps {
  showLabel?: boolean;
  showIcon?: boolean;
  showSeparator?: boolean;
}

// ✅ 正例 —— 语义枚举
interface TableToolbarProps {
  display?: 'full' | 'compact' | 'icon-only';
}
```

#### 策略 B：合并为配置对象（次选）

**非互斥**但同属一个功能域的布尔**必须**收敛为对象：

```tsx
// ❌ 反例
interface FileListProps {
  showRemove?: boolean;
  showDownload?: boolean;
  showPreview?: boolean;
}

// ✅ 正例
interface FileListProps {
  actions?: {
    remove?: boolean;
    download?: boolean;
    preview?: boolean;
  };
}
```

#### 策略 C：提升为子组件（**结构性**问题才用）

若「某个布尔控制的是一整块内容」，**必须**用子组件 / 插槽表达，
而不是布尔：

```tsx
// ❌ 反例 —— 布尔控制整块结构
<TableRow expandable={hasChildren} expandedContent={<Detail/>} />

// ✅ 正例 —— 插槽表达结构
<TableRow>
  <TableRow.Expandable>
    <Detail />
  </TableRow.Expandable>
</TableRow>
```

> 📌 本库**实际采用**的是**扁平多导出**的子组件形态（非静态属性）——
> 见 §2.1。

### 1.4 表格子系统的**豁免**（受控例外）

`src/ui/table/types/base.ts` 的 **23 个布尔**属**表格配置契约**（不是单组件 props），
且表格是本库**唯一**的「胖」组件（生物式分层）。

**裁定**：**不强制**收敛 —— 理由：

1. 该文件是**类型契约层**（`zod` 校验不了大量函数值 props，见 [`model-standard.md`](./model-standard.md) §4.2），
   布尔是「配置开关」而非「组件 API 开关」；
2. 收敛会触及表格**全部**插件（18 个）+ 全部消费方 → **破坏性变更**；
3. 表格配置本质是**特性开关集合**（`showSizeChanger` / `showQuickJumper` / `showTotal` …），
   语义上与「组件 props」不同类。

> 📌 **但必须守三条底线**：
>
> | #   | 规则                                                               |
> | --- | ------------------------------------------------------------------ |
> | 1   | **不得**新增 `show*` 布尔 —— 新能力**必须**走 `variant` 或配置对象 |
> | 2   | 互斥的布尔**必须**在 JSDoc 里注明「与 X 互斥」                     |
> | 3   | 表格**新增**组件（不是配置契约）**必须**遵守 §1.2 阈值             |

### 1.5 布尔 prop 的命名与配对

| #   | 规则                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 布尔 prop **必须**用 `is` / `has` / `can` / `enable` 前缀（**禁止** `show` / `hide` / `with` / `allow`）—— `show*` 是**表格历史**，**新增**代码禁止 |
| 2   | 有 `onXxx` 回调**必须**同时有对应的 `xxx` 布尔（如 `onOpenChange` + `open`）                                                                        |
| 3   | 无回调的布尔**必须**在 JSDoc 写明**副作用**（用户如何感知它生效）                                                                                   |
| 4   | 布尔**必须**有 `@default` 标注（默认值的语义）                                                                                                      |
| 5   | ❌ **禁止** `xxx` 与 `!xxx` 同时存在（`showLabel` / `hideLabel`）                                                                                   |
| 6   | ❌ **禁止**布尔**链式**（`isDisabledAndLoading`）—— 拆成两个                                                                                        |

> ⚠️ **实测**：`show*` 前缀布尔共 **约 35 处**（表格 23 + 日期 12 + 文件 6 + 其它）——
> 登记在 §M+2 豁免清单 H1（存量豁免，新增禁用）。

---

## 2. 复合组件形态

### 2.1 本库裁定：**扁平多导出**（不采用静态属性复合）

**外部惯例**（Radix / shadcn）用**静态属性复合**：

```tsx
// 外部惯例 —— 本库不采用
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Content />
</Dialog.Root>
```

**本库采用扁平多导出**：

```tsx
// ✅ 本库范式（真值源：src/ui/dialog/dialog.tsx:120）
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader>
      <DialogTitle />
      <DialogDescription />
    </DialogHeader>
    <DialogFooter />
  </DialogContent>
</Dialog>
```

**裁定理由**：

| #   | 理由                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **命名唯一性** —— 静态属性复合会引入 `Dialog.Content` 与 `DialogContent` **两套命名**，一旦同时进入 barrel 会触发 TS2308「重复导出」 |
| 2   | **barrel 友好** —— 扁平导出可被 `export *` 直接传播；静态属性**必须**显式赋值 + 显式重导出，barrel 里极易漏                          |
| 3   | **类型推导简单** —— 扁平导出每个都是独立的 `forwardRef` + `displayName`；静态属性需额外维护 `typeof X` 关系                          |
| 4   | **与既有 56 个组件一致** —— 全库零 `Object.assign` / 零 `.Root =` 静态属性挂载                                                       |

> 📌 **唯一的例外**：`src/ui/typography/typography.tsx:430-459` 导出 `Typography` 聚合对象
> （`{ H1, H2, ..., ListItem, Separator }`）—— 这是**平行子组件集合**（同级），
> **不是**层级结构（父子），语义上与静态属性复合不同，故保留。

### 2.2 子组件命名的三种前缀

| 前缀                | 用途                             | 示例                             |
| ------------------- | -------------------------------- | -------------------------------- |
| **父组件名 + 角色** | 层级子组件（属于父组件的一部分） | `DialogContent` / `DialogTitle`  |
| **原名保留**        | Radix 原生包装                   | `DialogPortal` / `DialogOverlay` |
| **无前缀**          | 独立组件（不属于任何父组件）     | `Separator` / `Typography`       |

> 📌 真值源：[`src/ui/dialog/dialog.tsx:120`](../src/ui/dialog/dialog.tsx) 一次性导出
> `Dialog` / `DialogPortal` / `DialogOverlay` / `DialogTrigger` / `DialogContent` /
> `DialogHeader` / `DialogFooter` / `DialogTitle` / `DialogDescription`。
>
> 📌 **详细命名规则见** [`component-standard.md`](./component-standard.md) §2.1。

### 2.3 `asChild` 的提供义务

**新增**的复合组件**必须**提供 `asChild` prop（让消费方能把 Radix 包装器透传进来）：

```tsx
// ✅ 正例 —— 消费方想把 Button 渲染成 <Link>
<Button asChild>
  <Link to="/detail">查看详情</Link>
</Button>
```

> 📌 **实测**：`asChild` **仅** Button / Tag / Badge / AlertDialog **4 个**组件自有；
> 其余 52 个组件**不暴露** `asChild`（消费方无法把 Radix wrapper 透传进来）。
> 这是**已知缺口**，登记在 §M+2 G-P1。
>
> ⚠️ **注意**：`asChild` 是**公开 API** —— 给既有组件**新增** `asChild` 属**向后兼容**的
> **能力扩展**（可走 `minor`），但**改名 / 移除**属**破坏性变更**（`major`）。

### 2.4 插槽（slot）优先于布尔

**用布尔控制「一整块内容」**是**结构性错误** —— **必须**改用插槽：

```tsx
// ❌ 违规 —— 布尔控制结构
<Alert closable showIcon iconPosition="left" />

// ✅ 正确 —— 插槽表达内容
<Alert closable>
  <AlertIcon />
  文本
</Alert>
```

> 📌 真值源：`src/ui/alert/alert.tsx` 导出 `Alert` / `AlertTitle` / `AlertDescription`；
> `src/ui/input/input.tsx:76-119` 用 `prefix` / `suffix` **插槽 prop**（而非 `hasPrefix` 布尔）
> —— 这是本库的**正确范式**。

---

## 3. `children` 与插槽优先于 render props

### 3.1 判定标准

| 渲染权表达方式          | 判定        | 允许场景                                 |
| ----------------------- | ----------- | ---------------------------------------- |
| `children`              | ✅ **首选** | 结构组合                                 |
| **具名插槽 prop**       | ✅ **首选** | 结构组合（`prefix` / `suffix` / `icon`） |
| `renderXxx`             | ⚠️ **受限** | **数据项**渲染（每条记录一个元素）       |
| `as` / `component` prop | ⚠️ **受限** | 元素类型替换（`asChild` 已覆盖大半）     |

### 3.2 `renderXxx` 的**唯一**合法场景

`renderXxx` **仅**在「对**数据集合**的每一项**渲染一个元素」时合法：

```tsx
// ✅ 合法 —— 每条记录一个卡片（src/ui/table/types/base.ts:746）
renderCard?: (record: TableRecord, context?: unknown, action?: unknown) => ReactNode;
```

```tsx
// ❌ 违规 —— 用 render prop 做结构组合
renderHeader?: () => ReactNode;   // ← 应该用 children 或插槽
```

> 📌 **实测**：全库**真正的** `render*` prop 声明 **9 处**，
> **全部集中在表格子系统**（`renderEmpty` / `renderTableRow` / `renderRow` /
> `renderExpandedRowContent` / `renderCard` ×2 / `renderItem` ×2）——
> **全部符合**「数据项渲染」的场景，**无违规**。
>
> 📌 其余 32 处 `render` 命中是**普通函数命名**（`renderTextInput` / `renderBooleanInput` 等
> 字段渲染器实现），**不是** render prop。

### 3.3 禁止 `renderXxx` 与 `children` 争同一位置

**禁止**同时提供 `children` 与 `renderXxx` 表达**同一位置**的渲染权 ——
消费方无法判断谁优先，运行时行为**不可预期**。

```tsx
// ❌ 违规 —— 同一个位置两个渲染权
interface AlertProps {
  children?: ReactNode;
  renderContent?: () => ReactNode;
}
```

### 3.4 `cloneElement` 的使用约束

用 `cloneElement` 注入 props（如 `prefix` / `suffix` 槽位）**必须**：

| #   | 规则                                                             |
| --- | ---------------------------------------------------------------- |
| 1   | **必须**先 `React.isValidElement()` 判断                         |
| 2   | **必须**保留调用方传入的 `className`（合并而非覆盖）             |
| 3   | **必须**避免 `React.Children.only()` —— 它对**多个兄弟节点**抛错 |

> 📌 **实测**：`React.Children.only` 仅 **1 处**（`src/ui/table/atoms/TableFixedColumn.tsx:184`）——
> 那里是**刻意的强约束**（强制单子节点），属**合法**用法。
>
> 📌 **历史教训**：`src/ui/tag/tag.tsx` 曾因 `Children.count(children) === 1` 判定导致
> `asChild` 分支在多兄弟节点时抛错（ADR 0001 / D-1 回归重点）——
> **禁止**在 `asChild` 分支使用 `Children.only`。

---

## 4. Context 接口分层

### 4.1 三层职责

| 层               | 职责                                                    | 真值源                                       |
| ---------------- | ------------------------------------------------------- | -------------------------------------------- |
| **Provider**     | **独占**状态管理（`useState` / `useReducer`）与状态派生 | `src/ui/table/context/TableContext.tsx:761+` |
| **Context 对象** | 只承载**数据**，不持有逻辑                              | `src/providers/locale-provider.tsx:45`       |
| **消费 Hook**    | 读取 Context + **抛错守卫**                             | `src/ui/tree/tree.tsx:60`（`useTree`）       |

### 4.2 消费 Hook **必须**抛错守卫

```tsx
// ✅ 正例（src/ui/tree/tree.tsx:60-63）
const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) throw new Error('useTree 必须在 Tree 组件内部使用');
  return context;
};
```

```tsx
// ❌ 反例 —— 返回 undefined，消费方在深层才炸
const useTree = () => useContext(TreeContext);
```

> 📌 **理由**：Context 未被正确包裹时，**在消费点立即报错**比「拿到 `undefined`
> 后在渲染深处报 `Cannot read property of undefined`」**定位成本低一个数量级**。
>
> 📌 **例外**：`src/providers/notify-provider.tsx:162` 的 `useContext(NotifyContext)`
> **无守卫** —— Provider 是**可选**的（`NotifyContextValue | null`），
> 属**有意设计**。但**必须**在类型上体现可空（`| null`），
> 让消费方**在类型层面**被迫判空。

### 4.3 Context 必须分离 `state` / `actions` / `meta`

Context 值**必须**按**可变性**分层，使消费方能**按需订阅**：

```tsx
// ✅ 正例结构（src/ui/table/context/TableContext.tsx:1187）
interface TableContextValue {
  state: TableState; // 数据（会变）
  actions: TableActions; // 操作（稳定引用）
  tableLogic: TableLogic; // 派生逻辑（稳定引用）
  config: TableConfig; // 配置（几乎不变）
}
```

**收益**（本库已验证）：

| #   | 收益                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | `actions` 用 `useCallback` 稳定 → 消费方的 `useEffect` 依赖**不会**每次重跑 |
| 2   | `config` 不变 → 不触发无谓重渲染                                            |
| 3   | 状态更新**只**影响订阅 `state` 的消费方                                     |

> 📌 真值源：`src/ui/table/context/TableContext.tsx` 提供 **7 个**消费 Hook
> （`useTableContext` / `useTableState` / `useHasTableContext` / `useTableLogic` /
> `useTableStateSelectors` / `useTableActions` / `useTableConfig`）——
> **按需订阅**的完整范式。

### 4.4 Context 的归属层

| Context 类型           | 归属层                            | 理由                             |
| ---------------------- | --------------------------------- | -------------------------------- |
| **跨组件域**的全局状态 | `src/providers/`                  | 语言 / 主题 / 通知 —— 消费方注入 |
| **组件树内部**的状态   | 组件目录内（如 `table/context/`） | 组件私有，不进公开 API           |
| **design-system 层**的 | `src/design-system/`              | 基础实现层私有                   |

> 📌 **实测**：12 个 `createContext` 中，`src/ui/**` **仅 2 个**
> （`TreeContext` / `TableContext`），其余 10 个在 `src/providers/`（3）与
> `src/design-system/components/ui/`（7）。
> → **组件层用 Context 极少**，状态主要靠 props 下钻 —— 这是**良好实践**
> （Context 是「跨多层传递」的手段，不是默认选项）。

### 4.5 Context 必须是模块私有的（除非有明确理由）

Context 对象**默认不导出** —— 导出它等于把「内部状态形状」变成公开 API。

```tsx
// ✅ 正确 —— Context 私有，只导出消费 Hook
const TreeContext = createContext<TreeContextType | undefined>(undefined);
// 消费方用 useTree()
```

> ⚠️ **例外**：`src/providers/` 的 3 个 Context **必须导出** ——
> 消费方需要直接 `useContext(LocaleContext)`（不想用 Hook 的场景）。
>
> 📌 **实测**：12 个 Context 中，**3 个导出**（`providers/` 层）、**9 个私有** —— 比例合理。

---

## 5. props 设计细则

### 5.1 受控与非受控必须配对

**有 `value` / `open` / `checked` 等受控 prop 时，必须**同时提供**非受控默认值：

```tsx
// ✅ 正例
interface SelectProps {
  value?: string; // 受控
  defaultValue?: string; // 非受控
  onValueChange?: (value: string) => void;
}
```

**规则**：

| #   | 规则                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | 有受控 prop **必须**有对应的 `defaultXxx`                                   |
| 2   | **必须**在 JSDoc 写明「同时提供 `value` 与 `defaultValue` 时 `value` 优先」 |
| 3   | **必须**在实现里处理「两者都没给」的默认行为                                |
| 4   | ❌ **禁止**同时提供 `value` 与 `defaultValue` 却**不定义**优先级            |

> 📌 真值源：`src/ui/select/select.tsx:103`
> （`value={value} defaultValue={defaultValue} onValueChange={onValueChange}`）。

### 5.2 `variant` / `size` 必须用 cva 派生

```tsx
// ✅ 正例（src/ui/button/button.tsx —— 从 buttonVariants 派生）
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;
```

> ❌ **禁止**手写联合类型（会与 cva 定义漂移）——
> 真值源反例：`src/ui/select/select.tsx:38`（手写 `size?: 'sm' | 'default'`，未从 `selectVariants` 派生）。
> 详细规则见 [`component-standard.md`](./component-standard.md) §3.4。

### 5.3 事件回调命名

| #   | 规则                                                                     |
| --- | ------------------------------------------------------------------------ |
| 1   | **必须** `on` + 事件名（`onValueChange` / `onOpenChange`）               |
| 2   | **必须** `on` + **过去式**表达「已发生」（`onOpenChange` 而非 `onOpen`） |
| 3   | 回调**必须**是**可选**的（组件库不强制消费方监听）                       |
| 4   | ❌ **禁止** `onChange`（语义过宽，DOM 原生同名会混淆）                   |

### 5.4 布尔 prop 与回调的配对（重复强调）

见 §1.5 规则 2。**举例**：

```tsx
// ❌ 反例 —— 有回调但无对应布尔（消费方无法知道当前是受控还是非受控）
interface ComboboxProps {
  onSearchChange?: (value: string) => void;
}

// ✅ 正确
interface ComboboxProps {
  searchValue?: string; // 受控
  defaultSearchValue?: string; // 非受控
  onSearchChange?: (value: string) => void; // 变更回调
}
```

### 5.5 透传属性必须能被消费方覆盖

组件**必须**把未消费的 props 透传给根元素，且 `className` 排在 `cn()` **末位**
（见 [`component-standard.md`](./component-standard.md) §3.6 规则 4）。

---

## 6. API 演进

### 6.1 变更分级

| 变更类型                                   | 分级        | 处置                                    |
| ------------------------------------------ | ----------- | --------------------------------------- |
| **新增**可选 prop                          | 向后兼容    | `minor`                                 |
| **新增**必填 prop                          | ⚠️ 破坏性   | `major`                                 |
| **删除** prop / **改名** prop              | ⛔ 破坏性   | `major` + CHANGELOG + 迁移指引          |
| 改 props 的**类型**（`string` → 联合类型） | ⛔ 破坏性   | `major`                                 |
| 改 props 的**语义**（含义变了）            | ⛔ 破坏性   | `major` + **必须**在 CHANGELOG 显著标注 |
| 改 **DOM 结构**（元素 / 层级）             | ⛔ 破坏性   | `major`                                 |
| 改**默认值**                               | ⚠️ 行为变更 | `minor` + CHANGELOG 说明                |
| **收敛**布尔 prop（§1.3）                  | ⛔ 破坏性   | `major` + **必须**提供迁移指引          |
| 改**样式类名**（不影响 DOM / props）       | ✅ 非破坏性 | `patch`                                 |

### 6.2 收敛的迁移指引要求

布尔 prop 收敛（§1.3）**必须**提供**迁移指引**，格式：

```md
### `showLabel` / `showIcon` 已收敛为 `display`

- 旧：`<TableToolbar showLabel showIcon />`
- 新：`<TableToolbar display="full" />`

| 旧组合               | 新值                  |
| -------------------- | --------------------- |
| `showLabel showIcon` | `display="full"`      |
| `showLabel`          | `display="compact"`   |
| `showIcon`           | `display="icon-only"` |
| 都不传               | `display="label"`     |
```

### 6.3 变更前必须查「对外可见性」

**改 props 前**必须确认：

| #   | 检查项                                                  |
| --- | ------------------------------------------------------- |
| 1   | 该组件是否**已导出**到 `src/index.ts`（= 公开 API）     |
| 2   | 组件文档（`docs/components/**`）是否需同步              |
| 3   | `README.md` / `README.en.md` 的导出清单是否需同步       |
| 4   | 是否有**其它组件内部**依赖了这个 prop（内部也会 break） |
| 5   | 是否需走 `pnpm version:minor                            | major`+`CHANGELOG.md` |

> 📌 **第 4 条最易漏** —— 改一个组件的 props，可能 break **库内部**其它组件对它的使用。
> 判定命令见 §M 维度 ⑦。

---

## M. 10 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**。

### 维度 ① 单组件布尔 prop 数量超阈值

**扫描命令**：

```bash
# 列出布尔 prop > 5 个的组件文件（空 = 合规）
Get-ChildItem src/ui -Recurse -Include *.tsx | Where-Object {
  $_.FullName -notmatch '__tests__' -and $_.Name -notlike '*.stories.tsx' -and
  $_.FullName -notmatch '\\types\\' -and $_.FullName -notmatch '\\table\\'
} | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  $m = [regex]::Matches($t, '(?m)^\s{2}(is|has|can|enable|show|hide|with|allow)[A-Z]\w*\??:\s*boolean')
  if ($m.Count -gt 5) { "$($m.Count)  $($_.FullName.Replace("$PWD\","").Replace("\","/"))" }
}
```

**判定规则**：

- ❌ 违规：单组件布尔 prop **> 5 个**
- ✅ 合规：输出为空
- ⚠️ **豁免**：`src/ui/table/**`（表格配置契约，见 §1.4）

**修正模式**：

```tsx
// ❌ 违规 —— 6 个布尔
interface FileListProps {
  showRemove?: boolean;
  showDownload?: boolean;
  showPreview?: boolean;
  showUploadButton?: boolean;
  showList?: boolean;
  withCredentials?: boolean;
}

// ✅ 修正 —— 收敛为配置对象
interface FileListProps {
  actions?: { remove?: boolean; download?: boolean; preview?: boolean };
  withCredentials?: boolean;
}
```

### 维度 ② 禁止 `show*` / `hide*` 布尔前缀

**扫描命令**：

```bash
rg -n "^\s{2}(show|hide|with|allow)[A-Z]\w*\??:\s*boolean" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：新代码使用 `show*` / `hide*` / `with*` / `allow*` 前缀布尔
- ✅ 合规：0 命中
- ⚠️ **豁免**：`src/ui/table/**`（存量，见 §M+2 H1）

**修正模式**：

```tsx
// ❌ 违规（新增代码）
showLabel?: boolean;

// ✅ 正确
isLabelVisible?: boolean;   // 或收敛进 variant / 配置对象
```

### 维度 ③ 禁止互斥布尔并存

**扫描命令**：

```bash
# 列出同时含 Xxx 与 hideXxx / !Xxx 形态的组件
rg -n "(show|hide)(Label|Icon|Separator|Confirm|Cancel)" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：同一组件同时暴露 `showXxx` 与 `hideXxx`
- ✅ 合规：0 命中

### 维度 ④ 受控 / 非受控必须配对

**扫描命令**：

```bash
# 列出有 value/open/checked 但缺 defaultValue/defaultOpen/defaultChecked 的文件
Get-ChildItem src/ui -Recurse -Include *.tsx | Where-Object {
  $_.FullName -notmatch '__tests__' -and $_.Name -notlike '*.stories.tsx'
} | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  $controlled = $t -match '^\s{2}(value|open|checked)\??:'
  $default   = $t -match '^\s{2}default(Value|Open|Checked)\??:'
  if ($controlled -and -not $default) {
    $_.FullName.Replace("$PWD\","").Replace("\","/")
  }
}
```

**判定规则**：

- ❌ 违规：有受控 prop 但无对应的 `defaultXxx`
- ✅ 合规：输出为空
- ⚠️ **需人工确认**：部分组件的受控值来自**必填** prop（如 `Combobox` 的 `options`）

### 维度 ⑤ `renderXxx` 不得与 `children` 争同一位置

**扫描命令**：

```bash
# 列出同时声明 children 与 renderXxx 的文件
Get-ChildItem src/ui -Recurse -Include *.tsx | Where-Object {
  $_.FullName -notmatch '__tests__' -and $_.Name -notlike '*.stories.tsx'
} | ForEach-Object {
  $t = Get-Content $_.FullName -Raw
  if ($t -match 'render[A-Z]\w*\??:' -and $t -match 'children\??:') {
    $_.FullName.Replace("$PWD\","").Replace("\","/")
  }
}
```

**判定规则**：

- ❌ 违规：同组件同时用 `children` 与 `renderXxx` 表达同一位置
- ✅ 合规：输出为空
- ⚠️ **需人工确认**：`children` 与 `renderXxx` 表达**不同位置**时是合法的

**修正模式**：

```tsx
// ❌ 违规：同一插槽两套 API —— 消费方无所适从，渲染优先级歧义
interface TableProps {
  children?: React.ReactNode;
  renderCell?: (item: Row) => React.ReactNode;
}

// ✅ 修正：数据渲染插槽用 renderXxx（表格域豁免 H3），结构性内容用 children，二选一
interface TableProps {
  children?: React.ReactNode; // 结构性插槽
  renderRow?: (item: Row) => React.ReactNode; // 数据项渲染（合法场景，§3.2）
}
```

### 维度 ⑥ 消费 Context 必须抛错守卫

**扫描命令**：

```bash
# 列出 useContext 调用后无空值守卫的文件（空 = 合规）
rg -n "useContext\(" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading |
  ForEach-Object {
    $parts = $_ -split ':', 3
    $file = $parts[0]; $line = [int]$parts[1]
    $lines = Get-Content $file
    $ctx = $lines[($line-1)..([Math]::Min($line+4, $lines.Count-1))] -join "`n"
    if ($ctx -notmatch 'throw' -and $ctx -notmatch '\?\?') { "$file`:$line" }
  }
```

**判定规则**：

- ❌ 违规：`useContext` 后**既不抛错也不兜底** → 消费方拿到 `undefined`
- ✅ 合规：每处都有抛错守卫**或** `??` 兜底
- ⚠️ **例外**：`src/providers/notify-provider.tsx`（Context 类型为 `| null`，可空是**有意设计**）

**修正模式**：

```tsx
// ❌ 违规
const useTree = () => useContext(TreeContext);

// ✅ 正确（src/ui/tree/tree.tsx:60-63）
const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) throw new Error('useTree 必须在 Tree 组件内部使用');
  return context;
};
```

### 维度 ⑦ 禁止 barrel 运行时循环导入

**扫描命令**：

```bash
# 列出从目录 index 的**运行时**（非 import type）导入（空 = 合规）
rg -n "^import \{[^}]*\} from '(\.\./)*(index|\.)'" -g "src/ui/**/*.tsx" --no-heading |
  Where-Object { $_ -notmatch 'import type' -and $_ -notmatch '__tests__' -and $_ -notmatch 'examples' }
```

**判定规则**：

- ❌ 违规：组件内部从目录 barrel 做**运行时**导入 → 循环依赖
- ✅ 合规：0 命中（`import type` 不产生运行时循环，**豁免**）

> 📌 **实测**：**2 处**运行时循环（`src/ui/table/atoms/TableCardContainer.tsx:1`、
> `src/ui/table/atoms/CellValue.tsx:6`）→ 见 §M+2 G-P2。
> 详见 [`architecture-standard.md`](./architecture-standard.md) §M 维度 ②。

**修正模式**：

```tsx
// ❌ 违规（src/ui/table/atoms/CellValue.tsx:6）
import { useTableLogic } from '../index';

// ✅ 修正 —— 直连实际源模块
import { useTableLogic } from '../context/TableContext';
```

### 维度 ⑧ 禁止 `Children.only` 出现在 `asChild` 分支

**扫描命令**：

```bash
rg -n "Children\.only" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：`Children.only` 出现在 `asChild` 分支 → 多兄弟节点时抛错
- ✅ 合规：0 命中，或用在**刻意强约束**处（如 `TableFixedColumn`，豁免 H4）
- 📌 **历史教训**：`src/ui/tag/tag.tsx` 曾因此抛错（决策记录 `docs/decisions/0001`）

**修正模式**：

```tsx
// ❌ 违规：asChild 分支断言唯一子节点 —— Fragment 包两个元素即崩溃
if (asChild) {
  const child = React.Children.only(children);
  return React.cloneElement(child, props);
}

// ✅ 修正：遍历校验或干脆不做 asChild（本库 52/56 组件不暴露 asChild，缺口 G-P1）
if (asChild && React.isValidElement(children)) {
  return React.cloneElement(children, props);
}
```

### 维度 ⑨ 组件 props 必须可从 barrel 导出

**扫描命令**：

```bash
# 列出有 export interface XxxProps 但组件级 index.ts 未 export type 的文件
Get-ChildItem src/ui -Directory | ForEach-Object {
  $dir = $_
  $impl = Get-ChildItem $dir.FullName -Filter "*.tsx" -File | Where-Object { $_.Name -ne 'index.tsx' }
  $hasProps = $impl | Where-Object {
    (Get-Content $_.FullName -Raw) -match 'export interface \w+Props'
  }
  if ($hasProps) {
    $idx = Join-Path $dir.FullName "index.ts"
    if (-not (Test-Path $idx)) { "MISSING index.ts: $($dir.Name)"; return }
    $t = Get-Content $idx -Raw
    if ($t -notmatch 'export type') { "MISSING export type: $($dir.Name)" }
  }
}
```

**判定规则**：

- ❌ 违规：组件定义了 `export interface XxxProps` 但 barrel 未 `export type` → 类型契约不显式
- ✅ 合规：输出为空
- 📌 详细规则见 [`component-standard.md`](./component-standard.md) §3.8 规则 2

### 维度 ⑩ 禁止 `renderXxx` 做结构组合

**扫描命令**：

```bash
# 列出 renderXxx prop（排除表格子系统 —— 它是唯一合法的「数据项渲染」场景）
rg -n "^\s{2}render[A-Z]\w*\??:" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading |
  Where-Object { $_ -notmatch '\\table\\' }
```

**判定规则**：

- ❌ 违规：非表格组件用 `renderXxx` 做结构组合
- ✅ 合规：0 命中
- ⚠️ **豁免**：`src/ui/table/**`（数据项渲染，§3.2）

---

## M+1. 历史基准（2026-11-05 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。
> 一键刷新：`pnpm probe baseline`（口径注记：`useCallback` / `useMemo` 等指标以
> [`react-performance-standard.md`](./react-performance-standard.md) §M+1 为准）。

| 指标                                                                          | 值                                                                              | 判定                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------- |
| 布尔 prop 声明总数（`src/ui`，ts+tsx，排除 `__tests__` / stories / examples） | **117** 处 / 49 文件                                                            | —                       |
| `show*` 前缀布尔                                                              | **约 35** 处                                                                    | ⚠️ 存量                 |
| 布尔 prop **> 5** 的组件文件                                                  | **3** 个（`file/types.ts` 6 / `TableFixedColumn` 6 / `embedded-date-picker` 5） | ⚠️ 可接受               |
| 布尔 prop **> 5** 的配置契约                                                  | **1** 个（`table/types/base.ts` **23**）                                        | ⚠️ 受控豁免             |
| 布尔 prop **≤ 3** 的组件                                                      | **44 / 56** 个                                                                  | ✅ 良好                 |
| `Object.assign` 静态属性复合                                                  | **1** 处（`field-generator.tsx:1636`，样式合并，**非**复合组件）                | ✅ 合规                 |
| `.Root =` / `.Trigger =` 静态属性挂载                                         | **0**                                                                           | ✅ 合规（走扁平多导出） |
| 聚合对象导出（`Typography`）                                                  | **1** 处（28 个平行子组件）                                                     | ✅ 合规                 |
| 自有 `asChild` prop                                                           | **4** 个组件（Button / Tag / Badge / AlertDialog）                              | ❌ 缺口                 |
| `render*` prop 声明                                                           | **9** 处（**全部**在 `src/ui/table/`）                                          | ✅ 合规                 |
| `render*` 非表格命中                                                          | **0**（其余 32 处是普通函数命名）                                               | ✅ 合规                 |
| `createContext` 总数                                                          | **12** 个                                                                       | —                       |
| Context 导出 / 私有                                                           | **3** 导出（`providers/`）/ **9** 私有                                          | ✅ 比例合理             |
| `src/ui/**` 内的 Context                                                      | **2** 个（`TreeContext` / `TableContext`）                                      | ✅ 良好                 |
| `useContext` 调用                                                             | **16** 处 / 11 文件                                                             | —                       |
| `useContext` **无守卫**                                                       | **1** 处（`notify-provider.tsx`，Context 类型 `                                 | null`，**有意可空**）   | ✅ 合规 |
| `React.Children.only`                                                         | **1** 处（`TableFixedColumn.tsx:184`，刻意强约束）                              | ✅ 合规                 |
| `cloneElement` / `isValidElement`                                             | **13** 处 / 6 文件                                                              | ✅ 合规                 |
| barrel 运行时循环导入                                                         | **2** 处（`TableCardContainer` / `CellValue`）                                  | ❌ 需修复               |
| barrel `import type` 导入                                                     | **30+** 处（编译期擦除，**无**运行时循环）                                      | ✅ 合规                 |

---

## M+2. 豁免清单与缺口登记

### 豁免清单（存量豁免，新增代码 MUST 达标）

| #   | 对象                                                         | 豁免依据                                                                                                                 |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| H1  | `show*` 前缀布尔（约 35 处）                                 | **存量豁免** —— `show*` 在表格 / 日期 / 文件三个域**命名高度一致**，批量迁移成本高于收益。**新增**代码**禁止**（维度 ②） |
| H2  | `src/ui/table/types/base.ts` 的 23 个布尔                    | **受控例外** —— 表格**配置契约层**，非单组件 props；收敛会 break 18 个插件 + 全部消费方（§1.4）                          |
| H3  | `src/ui/table/` 的 `render*` prop（9 处）                    | **合法例外** —— 「数据项渲染」是 `renderXxx` 的**唯一**合法场景（§3.2）                                                  |
| H4  | `src/ui/table/atoms/TableFixedColumn.tsx` 的 `Children.only` | **刻意强约束** —— 该组件语义上要求**单个**子节点，抛错是**期望行为**                                                     |
| H5  | `src/providers/notify-provider.tsx` 的无守卫 `useContext`    | Context 类型为 `                                                                                                         | null` —— Provider **可选**，可空是**有意设计**（§4.2） |
| H6  | `src/ui/typography/typography.tsx` 的 `Typography` 聚合对象  | **平行子组件集合**（同级），非层级结构 —— 与静态属性复合语义不同（§2.1）                                                 |
| H7  | `src/ui/table/` 从 barrel 的 `import type` 导入（30+ 处）    | **编译期擦除** —— 不产生运行时循环。**禁止**新增**运行时** barrel 导入（维度 ⑦）                                         |

### 缺口登记（需排期修复）

| #    | 缺口                                                                                                                                                                                | 涉及维度 | 影响                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| G-P1 | **52 / 56** 个组件**不暴露** `asChild`                                                                                                                                              | §2.3     | 消费方无法把 Radix wrapper 透传进来                                                     |
| G-P2 | barrel **运行时**循环导入 **2** 处                                                                                                                                                  | 维度 ⑦   | 初始化顺序不确定（`CellValue` / `TableCardContainer`）                                  |
| G-P3 | `file/types.ts` 布尔 **6** 个（`showList` / `showRemove` / `showDownload` / `showPreview` / `showUploadButton` / `withCredentials`）                                                | 维度 ①   | 组合爆炸 + 语义歧义                                                                     |
| G-P4 | `TableFixedColumn.tsx` 布尔 **6** 个                                                                                                                                                | 维度 ①   | 同上                                                                                    |
| G-P5 | `React.memo` 仅 **7** 处（全在表格原子组件）                                                                                                                                        | —        | 长列表场景的重渲染成本（详见 [`architecture-standard.md`](./architecture-standard.md)） |
| G-P6 | 零动态 `import()` —— 56 个组件 + `recharts` / `react-day-picker` / `embla` / `vaul` 全部静态耦合（与 [`react-performance-standard.md`](./react-performance-standard.md) G-R1 同源） | 维度 ⑥   | 全量 `recharts` 打进首屏（消费方侧）                                                    |

---

## M+3. 冲突裁决

> **外部规则（Vercel Composition Patterns / React 最佳实践）与本库既有规范的冲突裁决。**

| #   | 冲突点                    | 外部规则                                                                                      | 本库既有规范                                            | 裁决                                                                                                                                                                                                                                                  |
| --- | ------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | 复合组件形态              | 静态属性复合（`.Root` / `.Trigger`）                                                          | 扁平多导出（`DialogContent` / `DialogTitle`）           | **保留本库规范**（§2.1）—— 静态属性会引入双命名与 TS2308 冲突，且本库 56 个组件**全部**是扁平多导出，改动面 = 全库公开 API                                                                                                                            |
| C2  | 避免布尔 prop 扩散        | 「不要用布尔 prop 定制行为，用组合替代」                                                      | `component-standard.md` §2.2 规定 `is`/`has`/`can` 前缀 | **采纳，但分级落地**（§1.2）—— 设**阈值**而非一刀切；既有 API 收敛是**破坏性变更**，须走 `major` + 迁移指引（§6.2）                                                                                                                                   |
| C3  | `renderXxx` vs `children` | 「优先 `children`，不用 render props」                                                        | 未涉及                                                  | **采纳**（§3）—— 但**保留**表格子系统的 `render*`（数据项渲染是**唯一**合法场景，§3.2），不照搬「全面禁用」                                                                                                                                           |
| C4  | `asChild` / Slot          | 复合组件普遍提供 `asChild`                                                                    | 仅 4 个组件提供                                         | **采纳为新增义务**（§2.3）—— 新增复合组件**必须**提供 `asChild`；既有组件**逐步补齐**（缺口 G-P1），**不强制**立即改                                                                                                                                  |
| C5  | Context 接口分层          | 「Provider 是唯一知道状态如何管理的地方」+「state/actions/meta 分离」+「提升状态到 Provider」 | 未涉及（Context 分散在各组件）                          | **采纳**（§4）—— 本库 `TableContext` **已**符合（`state` / `actions` / `tableLogic` / `config` 四层 + 7 个按需订阅 Hook），是**现成范式**，值得推广                                                                                                   |
| C6  | 消费 Context 的守卫       | 外部规则未明确                                                                                | 未涉及                                                  | **本库加严**（§4.2）—— 消费 Hook **必须**抛错守卫；返回 `undefined` 让消费方在深层炸掉，定位成本高一个数量级                                                                                                                                          |
| C7  | `React.forwardRef`        | 「React 19 不要用 `forwardRef`」                                                              | **必须** `forwardRef` + `displayName`                   | **保留本库规范** —— 外部规则的依据是「用 `use()` 替代 `useContext()`」，但 `forwardRef` 是**另一件事**：它转发 DOM ref，与 `use()` 无关。`forwardRef` 在 React 19 中**仍是官方推荐**的 ref 转发方式。本库的 `forwardRef` + `displayName` 契约**不动** |
| C8  | `React.memo` 覆盖率       | 「提取昂贵计算到 memo 化组件」                                                                | 未涉及                                                  | **采纳为方向**（缺口 G-P5）—— 本库 `memo` 仅 7 处（全在表格原子）。但**不强制**全库铺开：组件库的价值在**可组合**而非极致性能                                                                                                                         |
| C9  | `useMemo` / `useCallback` | 「不要为简单值 memo 化」「依赖用原始值而非派生值」                                            | 未涉及                                                  | **采纳** —— 本库 `useCallback` 212 处 / `useMemo` 110 处，其中 `useMemo(() => x.total)` 这类**简单表达式** memo 属**过度优化**，登记为可选清理项                                                                                                      |
| C10 | 组件内定义组件            | 「不要在组件内部定义组件」                                                                    | 未涉及                                                  | **采纳**（§3.2 配套）—— 内联定义的组件**每次渲染都是新类型**，会导致子树**完全重挂载**。本库 `src/ui/**` 实测**无**此反模式（组件均在模块级定义）—— **已合规**                                                                                        |
| C11 | 派生状态而非 effect       | 「在渲染期派生，不要用 effect 同步状态」                                                      | 未涉及                                                  | **采纳为方向** —— 本库 `src/ui/table/hooks/useTableStorePage.ts:190-193` 有 `useMemo(() => context.state.pagination                                                                                                                                   |     | EMPTY_OBJECT, [...])` 形态（**正是**「派生而非 effect」的范式）。**已合规**，无需改 |
| C12 | `defaultValue` vs `value` | 「优先非受控输入」                                                                            | 未涉及（仅规范了 `value` / `defaultValue` 命名）        | **采纳**（§5.1）—— 补「两者都没给」的默认行为与优先级定义                                                                                                                                                                                             |
| C13 | barrel 导入               | 「直接导入，避免 barrel 文件」                                                                | **必须**用 barrel 导出（`export *`）                    | **部分采纳**（维度 ⑦）—— **对外**必须走 barrel（公开 API 契约）；但**组件内部**从 barrel 运行时导入会**循环依赖**，必须直连源模块。本库已有 2 处违规（缺口 G-P2）                                                                                     |
| C14 | 状态提升到 Provider       | 「把状态提升到 Provider 供兄弟组件访问」                                                      | 组件层 Context 极少（`src/ui/**` 仅 2 个）              | **采纳为原则，不强制推广**（§4.4）—— Context 是「跨多层传递」的手段，**不是默认选项**；能用 props 下钻就**不该**上 Context。本库现状（组件层仅 2 个 Context）**是良好实践**，不需改                                                                   |
| C15 | 代码分割 / 动态 import    | 「重组件用 `next/dynamic`」                                                                   | 单 barrel 入口 + `splitting: true`                      | **不适用 `next/dynamic`**（本库不是 Next.js 应用），但**「按需加载」的诉求成立** —— 见 §M+2 G-P6（零动态 `import()`，56 个组件 + recharts / react-day-picker / embla / vaul 全部静态耦合）                                                            |

---

## M+4. 模块检查清单

> **目的**：设计 / 评审组件 API 时的**自查**清单（不是任务列表，是合规性自检表）。

### 设计新组件的 props 时

- [ ] 布尔 prop **≤ 5 个**；超阈值已收敛为 `variant` 或配置对象
- [ ] 布尔用 `is` / `has` / `can` / `enable` 前缀（**不用** `show` / `hide`）
- [ ] 无互斥布尔并存；有 `onXxx` 回调**必**有对应 `xxx` 布尔
- [ ] 每个布尔都有中文 JSDoc + `@default` + **副作用说明**
- [ ] 结构组合用 `children` / 插槽；**不用** `renderXxx`
- [ ] `renderXxx` 只用于「数据项渲染」，且**不与** `children` 争同一位置
- [ ] 复合组件走**扁平多导出**（`XxxContent` / `XxxTitle`），**不用**静态属性复合
- [ ] 新增复合组件提供 `asChild`
- [ ] 有受控 prop **必**有 `defaultXxx`，且定义了二者优先级
- [ ] `variant` / `size` 类型**从 cva 派生**（`NonNullable<VariantProps<...>['variant']>`）
- [ ] 回调命名 `on` + 过去式事件名；回调**可选**
- [ ] 未消费的 props 透传根元素；`className` 在 `cn()` 末位
- [ ] Context：Provider 独占状态；消费 Hook 抛错守卫；`state` / `actions` / `meta` 分离
- [ ] props 有变更分级意识（新增可选 = `minor`；删除 / 改名 / 改语义 = `major`）

### 评审组件 API 时

- [ ] 维度 ① ~ ⑩ 已全跑（一次跑全库，非按组件分批）
- [ ] 文档表格里的 props 与实现**逐项一致**
- [ ] 内部其它组件对该 props 的依赖已确认（§6.3 第 4 条）
- [ ] 破坏性变更已写迁移指引（§6.2 格式）
- [ ] `README.md` / `README.en.md` / `CHANGELOG.md` 已同步

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-11-04 | **首版**。基于 `vercel-composition-patterns` 技能提炼，**结合本库真实实现**裁定。① 确立 **6 章条文**：布尔 prop 治理（§1，含**分级阈值** ≤3 良好 / 4-5 可接受 / 6-8 需收敛 / ≥9 严重 / 三种收敛策略 / 表格配置契约受控豁免）、复合组件形态（§2，**裁定扁平多导出**并给出 4 条理由 / `asChild` 提供义务 / 插槽优先于布尔）、`children` 与插槽优先于 render props（§3，含 `renderXxx` 的**唯一**合法场景判定）、Context 接口分层（§4，Provider 独占状态 / 消费 Hook 抛错守卫 / `state`-`actions`-`meta` 分离 / 归属层 / 默认私有）、props 设计细则（§5，受控非受控配对 / cva 派生 / 回调命名 / 布尔回调配对 / 透传覆盖）、API 演进（§6，**变更分级表** + 收敛迁移指引格式 + 对外可见性 5 项检查）；② **10 项扫描维度**（每项含命令 + 判定 + 修正模式）；③ **§M+3 冲突裁决 15 条（C1~C15）** —— 逐条裁定：**保留**本库扁平多导出（C1，对抗外部静态属性复合惯例）、**保留** `forwardRef` + `displayName` 契约（C7，说明外部规则的 `use()` 与 `forwardRef` 是两件事）、**保留**组件层 Context 稀薄（C14，Context 不是默认选项）；**采纳**布尔分级阈值而非一刀切（C2）、`renderXxx` 仅限数据项渲染（C3）、Context 三层分离（C5）、`defaultValue` 配对（C12）、禁止 barrel 运行时导入（C13 的**内部**部分）；**加严**消费 Context 守卫（C6）；**不适用** `next/dynamic`（C15，注明但作为缺口 G-P6 登记）；④ **§M+2 豁免清单 7 条**（H1~H7）+ **缺口登记 5 条**（G-P1~G-P5），全部带实测数字（布尔 126 处 / `show*` 约 35 处 /                                                                                                           | 1.1.0 | 2026-11-05 | **全量评审修正**。① **§M+2 补登 G-P6** —— 「零动态 `import()`」缺口此前仅在 v1.0.0 修订记录与 spec-index 被引用，缺口登记表**实际缺失**，本版补齐（与 `react-performance-standard.md` G-R1 同源）；② **§5.2 锚点修正** —— 正例 `select.tsx:71-72` 实为**手写联合类型**（恰是反例），换成真实的 `button.tsx` cva 派生；反例 `input.tsx:13`（实为 JSDoc）换 `select.tsx:38`；③ **维度⑤⑧补修正模式**（补齐 §M 三件套）；④ **§M+1 基线刷新** —— 布尔 prop 126/50 → **117/49**（ts+tsx，排除 `__tests__` / stories / examples，2026-11-05 实测）。**规范条文本身不过期，只有数据基准会过期** |
| 1.0.0 | 2026-11-04 | **首版**。基于 `vercel-composition-patterns` 技能提炼，**结合本库真实实现**裁定。① 确立 **6 章条文**：布尔 prop 治理（§1，含**分级阈值** ≤3 良好 / 4-5 可接受 / 6-8 需收敛 / ≥9 严重 / 三种收敛策略 / 表格配置契约受控豁免）、复合组件形态（§2，**裁定扁平多导出**并给出 4 条理由 / `asChild` 提供义务 / 插槽优先于布尔）、`children` 与插槽优先于 render props（§3，含 `renderXxx` 的**唯一**合法场景判定）、Context 接口分层（§4，Provider 独占状态 / 消费 Hook 抛错守卫 / `state`-`actions`-`meta` 分离 / 归属层 / 默认私有）、props 设计细则（§5，受控非受控配对 / cva 派生 / 回调命名 / 布尔回调配对 / 透传覆盖）、API 演进（§6，**变更分级表** + 收敛迁移指引格式 + 对外可见性 5 项检查）；② **10 项扫描维度**（每项含命令 + 判定 + 修正模式）；③ **§M+3 冲突裁决 15 条（C1~C15）** —— 逐条裁定：**保留**本库扁平多导出（C1，对抗外部静态属性复合惯例）、**保留** `forwardRef` + `displayName` 契约（C7，说明外部规则的 `use()` 与 `forwardRef` 是两件事）、**保留**组件层 Context 稀薄（C14，Context 不是默认选项）；**采纳**布尔分级阈值而非一刀切（C2）、`renderXxx` 仅限数据项渲染（C3）、Context 三层分离（C5）、`defaultValue` 配对（C12）、禁止 barrel 运行时导入（C13 的**内部**部分）；**加严**消费 Context 守卫（C6）；**不适用** `next/dynamic`（C15，注明但作为缺口 G-P6 登记）；④ **§M+2 豁免清单 7 条**（H1~H7）+ **缺口登记 5 条**（G-P1~G-P5），全部带实测数字（布尔 126 处 / `show*` 约 35 处 / `asChild` 仅 4 个 / barrel 运行时循环 2 处 / `memo` 仅 7 处）；⑤ **§M+1 基线**逐项给出「值 + 判定」两列。 |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 命名 / 导出 / `cn()` 合并 / `forwardRef`
- [`architecture-standard.md`](./architecture-standard.md) —— 分层 / 依赖方向 / barrel 契约
- [`a11y-interaction-standard.md`](./a11y-interaction-standard.md) —— props 的无障碍语义（`aria-label` / 键盘可达）
- [`testing-guidelines.md`](./testing-guidelines.md) —— props 变更后测试同步
- [`src/ui/table/context/TableContext.tsx`](../src/ui/table/context/TableContext.tsx) —— Context 四层分离的范式来源
- [`src/ui/tree/tree.tsx`](../src/ui/tree/tree.tsx) —— 消费 Hook 抛错守卫的范式来源
- [`src/ui/input/input.tsx`](../src/ui/input/input.tsx) —— 插槽 prop（`prefix` / `suffix`）的范式来源
