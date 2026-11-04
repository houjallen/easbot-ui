---
name: react-performance-standard
description: 该规范定义 easbot-ui 组件库的 React 渲染与性能契约，含 React 19 API 采用策略（use / useOptimistic / useTransition / useDeferredValue / Activity 的适用边界与禁用场景）、memoization 策略（memo / useMemo / useCallback 的该用与不该用、依赖数组规则、派生状态优于 effect 同步）、重渲染控制（稳定引用来源、Context 订阅粒度、避免内联组件定义）、渲染期副作用禁令（禁止在 render 期做 DOM 测量 / 布局读取）、事件处理与长列表优化（虚拟化阈值、content-visibility）、打包与加载成本（barrel 导入代价、命名空间导入、动态 import、external 契约）、以及 10 项扫描维度（每项含命令 + 判定 + 修正模式）、豁免清单与性能评审检查清单。当优化组件性能、排查重渲染、引入 React 19 新 API 或评审渲染写法时参考。
category: specification
version: 1.1.0
baseline-date: 2026-11-05
tags:
  [
    easbot-ui,
    react,
    performance,
    rerender,
    memo,
    useMemo,
    useCallback,
    react19,
    bundle,
    virtualize,
    code-review,
  ]
related:
  - spec-index.md
  - architecture-standard.md
  - component-standard.md
  - component-api-standard.md
  - code-quality.md
---

# EASBot UI React 渲染与性能规范 (React Performance Standard)

> **真值源**：本规范以 `src/ui/**` 与 `src/design-system/components/ui/**` 的真实实现、
> [`tsup.config.ts`](../tsup.config.ts) 与 [`package.json`](../package.json) 为唯一执行真值；
> 规范与实现冲突时**规范改**（先改规范再改实现，不留双轨）。
>
> **与其它规范的分工**（三者**不重复**）：
>
> | 关注点                         | 归属文档                                                   | 本规范对应章节        |
> | ------------------------------ | ---------------------------------------------------------- | --------------------- |
> | 组件 **props 形状 / 组合方式** | [`component-api-standard.md`](./component-api-standard.md) | §6（仅 Context 订阅） |
> | **构建 / 依赖分区 / external** | [`architecture-standard.md`](./architecture-standard.md)   | §5（仅加载成本）      |
> | **类名写法 / 样式**            | [`css-standard.md`](./css-standard.md)                     | —                     |
>
> **历史基准**：v1.0.0 锁定 2026-11-04 数据，详见 §M+1。**规范条文本身不过期**，只有数据基准会过期。

---

## 概述 (Overview)

本规范管的是**组件怎么渲染**——即在 React 19 下，组件库应当**如何**组织渲染工作。

**本库的特殊性**：这是一个**组件库**，不是应用。因此性能取向与业务应用**不同**：

| 关注点   | 业务应用             | 组件库（本库）                                         |
| -------- | -------------------- | ------------------------------------------------------ |
| 首要目标 | 首屏快 / 交互流畅    | **组合自由** + **可组合** + **不拖慢消费方**           |
| 渲染量   | 由业务复杂度决定     | 由**消费方**的使用方式决定 —— 组件库不应**强加**重渲染 |
| 优化手段 | 大量 `memo` + 虚拟化 | **提供**能力（虚拟化 / 稳定引用），**不强制**消费方    |
| 度量单位 | 页面级 LCP / INP     | **单组件**的渲染开销与**包体积**                       |

**核心约束**：

- ✅ **派生状态优于 effect 同步** —— 能在渲染期算出来的，**不要**用 `useEffect` 同步到 state
- ✅ **memo 只用于「昂贵」的子树** —— **不是**「所有导出组件」的默认动作
- ✅ **`useMemo` / `useCallback` 的依赖数组必须完整** —— 依赖不全 = 陈旧闭包 = 隐性 bug
- ✅ **Context 按 `state` / `actions` / `meta` 分层** —— 消费方**按需订阅**
- ✅ **重组件（图表 / 日历 / 轮播 / 抽屉）必须提供懒加载入口** —— 消费方按需 `import()`
- ✅ **长列表必须虚拟化** —— > 50 项
- ❌ 禁止在**渲染期**做 DOM 测量（`getBoundingClientRect` / `offsetHeight` / `scrollTop`）
- ❌ 禁止**在组件内部**定义组件（每次渲染新类型 → 子树完全重挂载）
- ❌ 禁止**无差别**铺 `memo` / `useMemo` / `useCallback`（徒增复杂度与内存，无收益）
- ❌ 禁止第三方库的**命名空间导入**（丢失 tree-shaking）

---

## 1. React 19 API 采用策略

### 1.1 现状

本库 **peer 依赖 React 19**（`peerDependencies.react: ^19.0.0`，实测已安装 **19.3.1**），
但 **React 19 的并发特性零使用**：

| API                    | 命中数 | 说明                            |
| ---------------------- | ------ | ------------------------------- |
| `use()`                | **0**  | 读取 Context / Promise 的新方式 |
| `useOptimistic`        | **0**  | 乐观更新（表单 / 列表）         |
| `useActionState`       | **0**  | 表单动作状态                    |
| `useTransition`        | **0**  | 非紧急更新标记                  |
| `startTransition`      | **0**  | 同上                            |
| `useDeferredValue`     | **0**  | 延迟重渲染                      |
| `<Activity>`           | **0**  | 隐藏但保留状态的子树            |
| `useSyncExternalStore` | **0**  | 订阅外部 store                  |

> 📌 **这不是缺陷** —— React 19 的并发特性主要服务于**应用层**的
> 「大列表 / 路由切换 / 流式渲染」场景。本库是组件库，
> 这些场景由**消费方**决定是否启用。
>
> 📌 **但有一条必须落地**：组件库是 React 19 的**peer 消费者**，
> 若本库自己用旧模式写（手工 `useMemo` 模拟并发），会**抵消**消费方的并发优化。
> 详见 §1.3。

### 1.2 适用边界

| API                | 适用场景（本库）                             | 本库裁定              |
| ------------------ | -------------------------------------------- | --------------------- |
| `use()`            | 读取 Context（替代 `useContext`）            | ⚠️ **谨慎**（§1.3）   |
| `useTransition`    | 大列表筛选 / Tab 切换的**非紧急**更新        | ✅ **推荐**           |
| `useDeferredValue` | 保留旧内容直到新内容渲染完（如搜索结果）     | ✅ **推荐**           |
| `useOptimistic`    | 乐观更新（如「删除后立即消失，失败再回滚」） | ✅ **推荐**           |
| `useActionState`   | 表单提交状态                                 | ❌ **不适用**（§1.4） |
| `<Activity>`       | 保留弹层状态但隐藏（切 Tab 不丢表单）        | ⚠️ **谨慎**           |

### 1.3 `use()` 替代 `useContext` 的**限制**

外部最佳实践建议「React 19 用 `use()` 替代 `useContext()`」——
理由是 `use()` **可以**在条件分支 / 循环中调用，而 `useContext` 不能。

**本库裁定：⚠️ 谨慎，不作为默认替换。**

| #   | 理由                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 本库的 Context 消费**全部**在**组件顶层**（无条件分支 / 循环内调用）—— `useContext` **完全够用**                                                                              |
| 2   | `use()` 读取 Context 时**未定义**会**抛错**（而非返回 `undefined`）—— 与本库「抛错守卫」的范式（[`component-api-standard.md`](./component-api-standard.md) §4.2）**天然一致** |
| 3   | `use()` 引入的**条件调用**能力会**诱使**开发者写出条件化的 Context 读取，**破坏** Context 的「无条件订阅」语义 —— 那会导致订阅关系在运行时变化，**违反 React 规则**           |
| 4   | 本库 peer 声明是 `^19.0.0` —— `use()` 在 Context 上的行为在 19.0 与 19.3 间**有细节差异**，而 `useContext` **全版本稳定**                                                     |

> 📌 **裁定结论**：
>
> | 场景                                             | 写法                                                         |
> | ------------------------------------------------ | ------------------------------------------------------------ |
> | 组件**顶层**读取 Context（**本库 100% 的场景**） | **继续用 `useContext`**                                      |
> | 确需条件 / 循环内读取                            | 可用 `use()`，但**必须**在 JSDoc 说明为何不能用 `useContext` |
>
> ⚠️ **实测**：本库 `useContext` **16** 处 / 11 文件，**全部**在组件顶层或自定义 Hook 顶层 —— **零**违规。

### 1.4 `useActionState` 不适用

`useActionState` 是 **React 19 的表单动作 API**（服务端动作 / 渐进增强）。
本库**不是**应用层，**没有** action 端点，**无**渐进增强需求。

**裁定**：❌ **不引入**。表单状态管理本库用 **`react-hook-form`**（`Form` 组件的既有方案）。

### 1.5 「不模拟并发」原则

**禁止**用**手写**的 `useEffect` + `useState` 组合去**模拟** React 19 的并发语义。

```tsx
// ❌ 违规 —— 手写「延迟更新」模拟 useDeferredValue
const [deferred, setDeferred] = useState(value);
useEffect(() => {
  const t = setTimeout(() => setDeferred(value), 0);
  return () => clearTimeout(t);
}, [value]);

// ✅ 正确 —— 直接用 React 19 的原生能力
const deferred = useDeferredValue(value);
```

**同理**，**禁止**手写「乐观更新」（先改 state 再回滚）—— **必须**用 `useOptimistic`。

---

## 2. memoization 策略

### 2.1 该用与不该用

| 手段                    | ✅ 该用                                                     | ❌ 不该用                                                            |
| ----------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `memo(Component)`       | 组件渲染**昂贵**（大表格 / 图表 / 长列表）**且** props 稳定 | 「保险起见」包一层；props 每渲染都变（对象 / 数组字面量 / 箭头函数） |
| `useMemo(fn, deps)`     | 计算**昂贵**（排序 / 过滤 / 大数组变换）                    | 简单算术 / 属性访问（`a + b` / `obj.x`）                             |
| `useCallback(fn, deps)` | 传给 `memo` 子组件 / 作为 `useEffect` 依赖                  | 只是「为了稳定」而包一层                                             |

> 📌 **典型反模式**（外部规则点名）：
>
> ```tsx
> // ❌ 反模式 —— 简单表达式的 memo 毫无收益，只增加内存与比较开销
> const total = useMemo(() => a + b, [a, b]);
>
> // ✅ 正确
> const total = a + b;
> ```
>
> 📌 本库实测：`src/ui/table/atoms/virtual-list/utils.ts:12-13` 的
> `getScrollProp` 是**模块级函数**（而非组件内的 `useMemo`）——
> 这是**更优**的形态（零分配、零依赖数组）。见 §2.4。

### 2.2 `memo` 的**必要条件**

给组件加 `memo` **必须**同时满足：

| #   | 条件                                                            | 不满足的后果                         |
| --- | --------------------------------------------------------------- | ------------------------------------ |
| 1   | 组件渲染**确实昂贵**（> 1ms 或子树节点数 > 100）                | `memo` 的比较开销 > 渲染收益         |
| 2   | 全部 props **引用稳定**（基本类型 / `useMemo` / `useCallback`） | props 每渲染都变 → `memo` **恒失效** |
| 3   | 组件**不依赖**父组件的隐式上下文变化                            | 行为可能过期                         |

> ⚠️ **「`memo` 恒失效」是最常见的失败** —— 给组件包了 `memo`，
> 但调用方传的是**对象 / 数组字面量**或**内联箭头函数**，
> 每次渲染引用都变 → `memo` **完全无效**，只留下心智负担。
>
> **判定**：加 `memo` 前**必须**确认调用方传的 props 引用稳定。

### 2.3 依赖数组必须完整

`useMemo` / `useCallback` / `useEffect` 的依赖数组**必须**包含**所有**在回调内引用的
**外部变量**。

**违反的后果不是「性能问题」，而是「陈旧闭包」** —— 回调捕获了**旧值**，
在**不该**更新的时刻更新（或永远不更新）。

```tsx
// ❌ 违规 —— 漏了 locale，文案不会随语言切换
const t = useCallback((key: string) => messages[locale][key], [messages]);
```

> 📌 本库 i18n 规范**已强制**这条 —— 见
> [`i18n-standard.md`](./i18n-standard.md) §4.2：「Hook 内 → 把 `locale` 加入
> `useMemo` / `useCallback` 的依赖数组」。

### 2.4 优先「模块级」而非「组件内 memo」

能提到**模块级**的纯计算**必须**提到模块级 —— 零分配、零依赖数组、零比较开销。

```tsx
// ✅ 正例 —— 模块级纯函数（src/ui/table/atoms/virtual-list/utils.ts:12）
export const getScrollProp = (direction: VirtualDirection): 'scrollTop' | 'scrollLeft' => {
  return direction === 'vertical' ? 'scrollTop' : 'scrollLeft';
};

// ❌ 反模式 —— 组件内包一层 useMemo，只为同样的结果
const scrollProp = useMemo(() => getScrollProp(direction), [direction]);
```

**规则**：**模块级函数 + 组件内直接调用** > **模块级函数 + `useMemo` 包裹** > **组件内 `useMemo` 内联实现**。

### 2.5 本库 `memo` 覆盖率现状

**实测**：`React.memo` 仅 **7** 处，**全部**在 `src/ui/table/atoms/`：

| 文件                                              | 行  |
| ------------------------------------------------- | --- |
| `src/ui/table/atoms/TableCell.tsx`                | 14  |
| `src/ui/table/atoms/TableBody.tsx`                | 14  |
| `src/ui/table/atoms/TableRow.tsx`                 | 16  |
| `src/ui/table/atoms/TableHeader.tsx`              | 14  |
| `src/ui/table/atoms/TableContainer.tsx`           | 48  |
| `src/ui/table/atoms/TableGrid.tsx`                | 10  |
| `src/ui/table/atoms/virtual-list/VirtualList.tsx` | 15  |

> 📌 **这个分布是健康的** —— 团队已认知到「长列表 / 表格需要 `memo`」，
> 且**只**在真正需要的地方用。其余 49 个组件**零 `memo`** —— 符合 §2.1 原则。
>
> ⚠️ **但**：`TableRow` / `TableCell` 的 `memo` **是否真的生效**，
> 取决于 `BaseTable.tsx` 传给它们的 props 引用是否稳定 ——
> `src/ui/table/organisms/BaseTable.tsx` 有 **21** 处 `useMemo` / `useCallback`
> （全库最多），说明**已在刻意维护引用稳定性**。这是**正确范式**，值得推广。

### 2.6 `useCallback` 的正当用途

`useCallback` 在本库的**正当**用途只有两类：

| #   | 用途                                    | 真值源                                                        |
| --- | --------------------------------------- | ------------------------------------------------------------- |
| 1   | 传给 **`memo` 化**的子组件              | `src/ui/table/atoms/TableRow.tsx:16`                          |
| 2   | 作为 **`useEffect` / `useMemo` 的依赖** | `src/ui/table/hooks/useTablePlugin.ts`（10 处 `useCallback`） |

**其它场景**（只是「传下去」）**不需要** `useCallback` —— 除非下游是 `memo` 组件。

> 📌 **实测**：本库 `useCallback` **212** 处（`src/ui/**`）/ `useMemo` **110** 处。
> 数量**不低**，但**集中**在 `src/ui/table/`（21 + 11 + 15 + 10 + 8 + 10 + 10 + 10 …）——
> 即**长列表 / 复杂表格**场景，这正是 `useCallback` 的**正当用途**。

---

## 3. 重渲染控制

### 3.1 Context 订阅粒度

Context 的**任何值变化**都会让**所有**消费者重渲染 —— 与 `memo` 无关。

**因此 Context 值必须分层**：

```tsx
// ✅ 正例（src/ui/table/context/TableContext.tsx:1187）
interface TableContextValue {
  state: TableState; // 变化频繁
  actions: TableActions; // useCallback 稳定
  tableLogic: TableLogic; // useMemo 稳定
  config: TableConfig; // 几乎不变
}
```

**规则**：

| #   | 规则                                                                            |
| --- | ------------------------------------------------------------------------------- |
| 1   | Context 值**必须**按「变化频率」分层（`state` / `actions` / `config`）          |
| 2   | `actions` **必须**用 `useCallback` 稳定                                         |
| 3   | **必须**提供**按需订阅**的消费 Hook（`useTableActions` / `useTableConfig` / …） |
| 4   | **禁止**把「所有状态塞进一个 Context」让消费者整包接收                          |

> 📌 **本库已有完整范式** —— `TableContext.tsx` 提供 **7 个**消费 Hook：
> `useTableContext` / `useTableState` / `useHasTableContext` / `useTableLogic` /
> `useTableStateSelectors`（对象含 `useData` / `useColumns` / `useSelectedRowKeys` / `useSelectedCount`）/
> `useTableActions` / `useTableConfig`。详见 [`component-api-standard.md`](./component-api-standard.md) §4.3。

### 3.2 props 引用稳定性是**消费方**的责任

组件库**无法控制**消费方传什么。但**必须**：

| #   | 规则                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | **必须**在文档中标注「数组 / 对象类 props 建议 `useMemo`」                  |
| 2   | **必须**提供**稳定引用**的 props（`actions` / `handlers` 用 `useCallback`） |
| 3   | ❌ **禁止**在组件内部对 props 做无谓的 `useMemo`（只是换个地方创建新对象）  |

**第 3 条的反模式**：

```tsx
// ❌ 反模式 —— memo 的还是「每次新建的对象」，毫无收益
const style = useMemo(() => ({ width: size }), [size]);
return <div style={style} />;

// ✅ 正确 —— 直接内联，React 会对比属性值
return <div style={{ width: size }} />;
```

> 📌 React 对**内联对象样式**做的是**浅比较**（逐属性），
> 不是引用比较 —— 内联**不慢**。`useMemo` 包裹对象样式是**常见误优化**。

### 3.3 禁止在组件内部定义组件

**禁止**在渲染函数内部定义组件 —— 每次渲染都是**新类型**，React 会**卸载并重挂载**整棵子树
（**丢失所有状态**、**重跑所有 effect**）。

```tsx
// ❌ 违规 —— 每次渲染都是新组件类型
function Parent() {
  const Row = ({ data }: { data: Item }) => <li>{data.name}</li>;
  return (
    <ul>
      {items.map((it) => (
        <Row key={it.id} data={it} />
      ))}
    </ul>
  );
}

// ✅ 正确 —— 提到模块级
const Row = ({ data }: { data: Item }) => <li>{data.name}</li>;
function Parent() {
  return (
    <ul>
      {items.map((it) => (
        <Row key={it.id} data={it} />
      ))}
    </ul>
  );
}
```

> 📌 **实测**：本库 `src/ui/**` **零**此反模式 —— 所有组件均在**模块级**定义。**已合规**。

### 3.4 派生状态优于 effect 同步

**能在渲染期算出来的值**，**不要**用 `useEffect` 同步到 `useState` —— 那会多一次渲染。

```tsx
// ❌ 违规 —— 多一次渲染，且有「一帧不一致」
const [visible, setVisible] = useState(open && items.length > 0);
useEffect(() => {
  setVisible(open && items.length > 0);
}, [open, items.length]);

// ✅ 正确 —— 渲染期直接派生
const visible = open && items.length > 0;
```

> 📌 **实测**：本库 `src/ui/table/hooks/useTableStorePage.ts:190-193` 正是
> **「派生而非 effect」**的范式：
>
> ```tsx
> const pagination = useMemo(
>   () => context.state.pagination || EMPTY_OBJECT,
>   [context.state.pagination],
> );
> ```
>
> ✅ **已合规**。

### 3.5 事件处理逻辑放事件处理器

**禁止**把「点击后要做什么」放进 `useEffect` 监听状态变化 —— **放进事件处理器**。

```tsx
// ❌ 违规 —— 副作用与状态耦合，触发时机不精确
useEffect(() => {
  if (value > max) onError();
}, [value]);

// ✅ 正确
const handleChange = (v: number) => {
  if (v > max) onError();
  onChange(v);
};
```

---

## 4. 渲染期副作用禁令

### 4.1 禁止在渲染期做 DOM 测量

**渲染期**（render 函数体内）**禁止**读取布局信息：

| ❌ 禁止                        | 原因                                     |
| ------------------------------ | ---------------------------------------- |
| `getBoundingClientRect()`      | 触发**强制同步布局**（layout thrashing） |
| `offsetHeight` / `offsetWidth` | 同上                                     |
| `scrollTop` / `scrollLeft`     | 同上                                     |
| `window.getComputedStyle()`    | 同上                                     |

**正确做法**：

```tsx
// ✅ 正确 —— 测量放在 effect 里（渲染后）
useLayoutEffect(() => {
  const rect = elRef.current?.getBoundingClientRect();
  setPosition({ x: rect?.left ?? 0, y: rect?.bottom ?? 0 });
}, [deps]);
```

> 📌 **实测**：本库 `getBoundingClientRect` **仅 1 处** ——
> `src/design-system/components/ui/popover.tsx:13` 的 `fixPopoverPosition`，
> 它在**位置修正 Hook** 内被调用（**effect 路径**），**不是**渲染期直接调用。
> ✅ **已合规**。
>
> ⚠️ 但 `src/ui/table/atoms/TableCell.tsx:72` 的 `offsetWidth` 在**事件处理器**内
> （列宽拖拽起点测量）—— ✅ 合规（事件期测量是允许的）。

### 4.2 批量 DOM 读写

**必须**「先全部读，再全部写」—— 交错会触发**多次**强制布局。

```tsx
// ❌ 违规 —— 读 → 写 → 读 → 写，每次都强制重排
items.forEach((el) => {
  const h = el.offsetHeight;
  el.style.height = `${h}px`;
});

// ✅ 正确 —— 先全部读
const heights = items.map((el) => el.offsetHeight);
// 再全部写
items.forEach((el, i) => {
  el.style.height = `${heights[i]}px`;
});
```

---

## 5. 加载成本与包体积

### 5.1 barrel 导入的代价

本库是**单 barrel 入口**（`src/index.ts` → `src/ui/index.ts` 聚合 **56** 个组件目录）。
这意味着 `dist/index.mjs` 是**单一入口**，消费方的 tree-shaking **完全依赖**下游 bundler。

**规则**：

| #   | 规则                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 消费方**必须**用 `import { Button } from '@easbot/ui'`（具名），**禁止** `import * as UI`                                                  |
| 2   | 本库**禁止**在**组件内部**从目录 barrel 做**运行时**导入（循环依赖，见 [`component-api-standard.md`](./component-api-standard.md) 维度 ⑦） |
| 3   | 本库**禁止**命名空间导入**第三方**库（丢失 tree-shaking）                                                                                  |

### 5.2 命名空间导入的代价

```tsx
// ❌ 违规 —— 整包进 bundle
import * as RechartsPrimitive from 'recharts';

// ✅ 正确
import { LineChart, Line } from 'recharts';
```

> 📌 **实测**：全库 `import * as` 共 **129** 处 / 97 文件，其中：
>
> | 目标                                            | 数量  | 判定                                                                                                                                                                                           |
> | ----------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `import * as React from 'react'`                | ~85   | ✅ **安全** —— React 是 peer external，且 `import * as React` 是 React **官方推荐**写法，不影响 tree-shaking                                                                                   |
> | `import * as XxxPrimitive from '@radix-ui/*'`   | ~20   | ✅ **安全** —— Radix 是 peer external，命名空间导入是其**官方推荐**用法                                                                                                                        |
> | `import * as RechartsPrimitive from 'recharts'` | **1** | ⚠️ **风险** —— `src/design-system/components/ui/chart.tsx:4`。`recharts` 虽在 external（不进本库 bundle），但**消费方** bundler 面对整个命名空间，tree-shaking 效果取决于其对 CJS/ESM 的兼容性 |
> | `import * as UiBarrel from '../../index'`       | 1     | ✅ 测试文件（验证 barrel 导出面），**不进产物**                                                                                                                                                |
>
> ⚠️ **裁定**：`recharts` 的命名空间导入**豁免** ——
> 图表组件**天然**需要 `recharts` 的**大部分** API，且 `recharts` 是 peer external。
> 但**新增**其它第三方库的命名空间导入**禁止**。

### 5.3 零代码分割的现状

**实测**：全库**零**动态 `import()`。56 个组件（含 `recharts` / `react-day-picker` /
`embla-carousel-react` / `vaul` / `react-moveable`）全部静态耦合在**同一条**依赖图上。

**后果**：消费方**只用一个** `Button`，也要**下载**整个 `recharts` + `react-day-picker`。

**规则**：

| #   | 规则                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | **重组件**（图表 / 日历 / 轮播 / 抽屉 / 可拖拽）**必须**提供**懒加载入口**（消费方用 `React.lazy` + 动态 `import()`） |
| 2   | 消费方文档**必须**给出懒加载示例                                                                                      |
| 3   | ❌ **禁止**在**组件内部**写动态 `import()`（会破坏 SSR 兼容性）                                                       |

> 📌 **本库已具备懒加载条件** —— `tsup.config.ts` 配置了 `splitting: true`（ESM），
> 消费方的 bundler 能据此分割 chunk。**缺的只是消费方侧的用法示范**。
> 登记在 §M+2 缺口 G-R1。

### 5.4 `external` 契约是性能红线

**漏配 `external` 的后果不是体积问题，而是「重复实例」** ——
消费方拿到两份 Zod（`instanceof` 校验失败）、两份 Radix Context（浮层不显示）。

**判定**：见 [`architecture-standard.md`](./architecture-standard.md) §M 维度 ⑧。

> 📌 **实测**：`tsup.config.ts` 的 `external` 共 **49** 个包
> （React 4 + Radix 28 + 样式工具链 6 + Zod 1 + 日期 2 + 交互基座 8），
> 与 `package.json` 的 `dependencies`（17）/ `peerDependencies`（30）**完全对齐**，无遗漏。

---

## 6. 长列表与大内容

### 6.1 虚拟化阈值

**超过 50 项**的列表**必须**虚拟化。

**本库已提供**：`src/ui/table/atoms/virtual-list/`（含 `VirtualList.tsx` + `hooks.ts` + `utils.ts` + `types.ts`）。

**规则**：

| #   | 规则                                                                     |
| --- | ------------------------------------------------------------------------ |
| 1   | **新增**长列表组件**必须**提供虚拟化能力或**必须**接入既有 `VirtualList` |
| 2   | 虚拟列表的**行高必须固定或可预估** —— 否则无法计算可视区                 |
| 3   | 表格**必须**提供 `virtualized` 开关                                      |

### 6.2 `content-visibility` 兜底

**不能**虚拟化时（如 CMS 渲染的长列表），**必须**用 `content-visibility: auto` 让浏览器跳过屏外渲染：

```tsx
// ✅ 正例
<ul>
  {items.map((it) => (
    <li key={it.id} className="[content-visibility:auto]">
      {/* ... */}
    </li>
  ))}
</ul>
```

### 6.3 表格的性能设计

表格是本库**最重**的组件，其性能设计**必须**遵守：

| #   | 规则                                                                                             |
| --- | ------------------------------------------------------------------------------------------------ |
| 1   | `BaseTable` **必须**用 `useMemo` 稳定 `visibleColumns` 等派生数组（真值源：`BaseTable.tsx:246`） |
| 2   | 单元格**必须**用 `memo` 化（`TableCell` / `TableRow` / `TableBody` / `TableHeader`）             |
| 3   | 事件回调**必须**用 `useCallback` 稳定                                                            |
| 4   | 单元格内**禁止**创建新的对象 / 数组字面量作为 props 传递（除 `memo` 组件外）                     |

---

## M. 10 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按组件分批跑**，模式必须**一次跑全库**。

### 维度 ① 禁止在组件内部定义组件

**扫描命令**：

```bash
# 列出「函数体内定义组件」的候选（需人工确认）
rg -n "^  (const|function) [A-Z]\w+ = \(|^\s{2}const [A-Z]\w+ = \(\{" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：组件函数体内定义**大写开头**的组件（每次渲染新类型 → 子树重挂载）
- ✅ 合规：0 命中，或仅定义**非组件**的辅助函数（小写开头）
- ⚠️ **需人工确认**：`useMemo(() => <X/>, [])` 这类「工厂函数」不在此列

### 维度 ② 禁止渲染期 DOM 测量

**扫描命令**：

```bash
rg -n "getBoundingClientRect\(\)|offsetHeight|offsetWidth|\.scrollTop|\.scrollLeft" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：在**渲染函数体内**（非 effect / 非事件处理器）调用
- ✅ 合规：调用点在 `useEffect` / `useLayoutEffect` / 事件处理器内
- ⚠️ **需人工确认**（命令只列调用点）

### 维度 ③ 禁止第三方库命名空间导入

**扫描命令**：

```bash
# 排除 react / @radix-ui（两者是 peer external 且官方推荐命名空间用法）
rg -n "import\s+\*\s+as\s+\w+\s+from\s+['\"](?!react['\"]|@radix-ui/)[^'\"]+['\"]" \
  -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading --pcre2
```

**判定规则**：

- ❌ 违规：第三方库用命名空间导入（丢失 tree-shaking）
- ✅ 合规：0 命中
- ⚠️ **豁免**：`recharts`（`chart.tsx`）—— 图表天然需要大部分 API，且是 peer external

### 维度 ④ `useMemo` / `useCallback` 依赖数组完整性（关键词提示）

**扫描命令**：

```bash
# 列出 useCallback / useMemo 中引用了 locale 但依赖里没有 locale 的文件（i18n 场景）
rg -n "useCallback\(|useMemo\(" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading |
  Where-Object { $_ -match 'locale' }
```

**判定规则**：

- ❌ 违规：回调内引用 `locale` 但依赖数组缺 `locale` → **陈旧闭包**（文案不随语言切换）
- ✅ 合规：依赖数组包含 `locale`
- ⚠️ **需人工确认**（命令只列候选）

**修正模式**：

```tsx
// ❌ 违规
const t = useCallback((key: string) => messages[locale][key], [messages]);

// ✅ 正确（见 i18n-standard.md §4.2）
const t = useCallback((key: string) => messages[locale][key], [messages, locale]);
```

### 维度 ⑤ 禁止「派生状态用 effect 同步」

**扫描命令**：

```bash
# 列出 useEffect 内调用 setXxx 且依赖是 props/state 的候选（需人工确认）
rg -n -U "useEffect\(\(\) => \{[\s\S]{0,200}?set[A-Z]\w+\(" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：`useEffect` 里把 props / state **同步**到另一个 state（渲染期可派生）
- ✅ 合规：`useEffect` 只做**订阅 / 计时器 / DOM 测量 / 副作用**
- ⚠️ **需人工确认**（命令只列候选）

### 维度 ⑥ `memo` 组件的 props 引用稳定性

**扫描命令**：

```bash
# 列出 memo 化组件的文件（人工核对其 props 是否引用稳定）
rg -l "React\.memo\(|\bmemo\(" -g "src/ui/**/*.tsx" -g "!*stories.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：`memo` 组件的某个 prop 由调用方传入**对象 / 数组字面量**或**内联箭头函数**
- ✅ 合规：全部 props 引用稳定（基本类型 / `useMemo` / `useCallback`）
- ⚠️ **需人工确认**

### 维度 ⑦ 禁止 `useMemo` 包裹简单表达式

**扫描命令**：

```bash
# 列出 useMemo 内是简单算术 / 属性访问的候选
rg -n "useMemo\(\(\) => [a-zA-Z_$][\w.$]*\s*[+\-*/]\s*[a-zA-Z_$]" -g "src/ui/**/*.tsx" --no-heading
```

**判定规则**：

- ❌ 违规：`useMemo` 内是简单表达式（徒增比较开销，无收益）
- ✅ 合规：0 命中

**修正模式**：

```tsx
// ❌ 违规
const total = useMemo(() => a + b, [a, b]);

// ✅ 正确
const total = a + b;
```

### 维度 ⑧ 禁止 `useMemo` 包裹内联对象样式

**扫描命令**：

```bash
rg -n -U "useMemo\(\(\) => \(\{[\s\S]{0,120}?\}\)," -g "src/ui/**/*.tsx" --no-heading |
  Where-Object { $_ -match 'style' }
```

**判定规则**：

- ❌ 违规：`useMemo` 的返回值是**内联对象**（React 对样式做浅比较，内联不慢）
- ✅ 合规：0 命中

### 维度 ⑨ Context 必须按变化频率分层

**扫描命令**：

```bash
# 列出 createContext 的 Context 值类型（人工核对是否分层）
rg -n -A 8 "createContext<" -g "src/**/*.tsx" -g "!*stories.tsx" --no-heading |
  Where-Object { $_ -match 'state|actions|config|value' }
```

**判定规则**：

- ❌ 违规：Context 值是**扁平大对象**（所有状态混在一起 → 全量重渲染）
- ✅ 合规：按 `state` / `actions` / `config` 分层
- ⚠️ **例外**：`src/providers/` 的 3 个 Context（`ThemeContextValue` 等）
  —— 全局状态本身简单，无需分层

### 维度 ⑩ 长列表虚拟化能力

**扫描命令**：

```bash
# 列出渲染 .map() 且无虚拟化迹象的组件（人工核对数据量上限）
rg -n "\.map\(" -g "src/ui/**/*.tsx" -g "!*stories.tsx" -g "!*examples*" --no-heading |
  Where-Object { $_ -notmatch 'virtual|Virtual' }
```

**判定规则**：

- ❌ 违规：渲染**无上限**的 `.map()` 且无虚拟化 / `content-visibility`
- ✅ 合规：有虚拟化，或数据量**有明确上限**（并在文档中说明）
- ⚠️ **需人工确认**（命令只列候选）

---

## M+1. 历史基准（2026-11-05 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                             | 值                                                                                                        | 判定        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------- |
| React 版本（peer / 已安装）      | `^19.0.0` / **19.3.1**                                                                                    | ✅ React 19 |
| React 19 并发 API 命中           | **0**（`use` / `useOptimistic` / `useTransition` / `useDeferredValue` / `<Activity>` / `useActionState`） | ⚠️ 未采用   |
| `React.memo` 命中                | **7** 处（**全部**在 `src/ui/table/atoms/`）                                                              | ✅ 健康     |
| `useCallback` 命中               | **235** 处 / 66 文件（`src/ui/**` **212**）                                                               | ⚠️ 偏多     |
| `useMemo` 命中                   | **118** 处 / 44 文件（`src/ui/**` **110**）                                                               | ⚠️ 偏多     |
| `useRef` 命中                    | **45** 处 / 21 文件                                                                                       | ✅ 合理     |
| `useReducer` 命中                | **1** 处（`TableContext.tsx:781`）                                                                        | ✅ 合理     |
| `useSyncExternalStore` 命中      | **0**                                                                                                     | ✅ 不需要   |
| `useImperativeHandle` 命中       | **0**                                                                                                     | ✅ 不需要   |
| 组件内定义组件                   | **0**                                                                                                     | ✅ 合规     |
| 渲染期 DOM 测量                  | **0**（1 处 `getBoundingClientRect` 在 effect 内）                                                        | ✅ 合规     |
| `import * as` 总数               | **129** 处 / 97 文件                                                                                      | —           |
| —— 其中 `react` / `@radix-ui`    | ~105                                                                                                      | ✅ 安全     |
| —— 其中 `recharts`               | **1**（`chart.tsx:4`）                                                                                    | ⚠️ 豁免     |
| 动态 `import()`                  | **0**                                                                                                     | ❌ 缺口     |
| `tsup` `splitting` / `treeshake` | `true` / `true`                                                                                           | ✅ 已开启   |
| `tsup` `external` 包数           | **49**（与依赖**完全对齐**）                                                                              | ✅ 合规     |
| `src/ui/index.ts` 聚合组件目录   | **56**                                                                                                    | —           |
| 顶层 barrel 运行时循环导入       | **2** 处                                                                                                  | ❌ 缺口     |
| `useId()` 命中                   | **3** 处（`chart` / `form` / `combobox`）                                                                 | ✅ 合理     |

---

## M+2. 豁免清单与缺口登记

### 豁免清单（存量豁免，新增代码 MUST 达标）

| #   | 对象                                                                        | 豁免依据                                                            |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| H1  | `import * as React from 'react'`（~85 处）                                  | React **官方推荐**写法；React 是 peer external，不影响 tree-shaking |
| H2  | `import * as XxxPrimitive from '@radix-ui/*'`（~20 处）                     | Radix **官方推荐**写法；peer external                               |
| H3  | `import * as RechartsPrimitive from 'recharts'`（1 处）                     | 图表组件**天然**需要 `recharts` 大部分 API；peer external（§5.2）   |
| H4  | `src/ui/table/` 的 21 处 `useMemo` + 11 处 `useCallback`                    | **长列表 / 复杂表格**场景 —— `useCallback` 的**正当用途**（§2.6）   |
| H5  | `src/ui/table/atoms/` 的 7 处 `React.memo`                                  | **昂贵子树**（表格原子组件）—— `memo` 的**正当用途**（§2.2）        |
| H6  | `src/ui/table/atoms/TableCell.tsx:72` 的 `offsetWidth`                      | 在**事件处理器**内测量（列宽拖拽起点）—— 非渲染期（§4.1）           |
| H7  | `src/design-system/components/ui/popover.tsx:13` 的 `getBoundingClientRect` | 在**位置修正 Hook**（effect 路径）内 —— 非渲染期（§4.1）            |

### 缺口登记（需排期修复）

| #        | 缺口                                                                                                 | 涉及维度 | 影响                                             |
| -------- | ---------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| G-R1     | **零**动态 `import()` —— 56 个组件 + `recharts` / `react-day-picker` / `embla` / `vaul` 全部静态耦合 | §5.3     | 消费方只用一个组件也下载全部重依赖               |
| G-R2     | `useCallback` **212** 处 / `useMemo` **110** 处（含简单表达式 memo 化）                              | 维度 ⑦⑧  | 徒增内存与比较开销，心智负担                     |
| G-R3     | `React.memo` 仅 **7 / 56** 个组件                                                                    | §2.5     | 长列表场景的重渲染成本                           |
| ~~G-R4~~ | ~~barrel **运行时**循环导入 **2** 处~~ —— **已消除**（2026-11-05，同 G-P2）                          | §5.1     | ~~初始化顺序不确定~~                             |
| G-R5     | React 19 并发 API **零使用**                                                                         | §1.1     | 消费方的并发优化被本库的手工模式抵消（部分场景） |

---

## M+3. 冲突裁决

> **外部规则（Vercel React 最佳实践 / Composition Patterns）与本库既有规范的冲突裁决。**

| #   | 冲突点                         | 外部规则                                           | 本库既有规范                           | 裁决                                                                                                                                                                                                                                                                       |
| --- | ------------------------------ | -------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `forwardRef`                   | 「React 19 不要用 `forwardRef`」                   | **必须** `forwardRef` + `displayName`  | **保留本库规范** —— 外部规则的依据是「用 `use()` 替代 `useContext()`」，与 ref 转发**无关**。`forwardRef` 在 React 19 中**仍是官方推荐**的 ref 转发方式，本库的 49 处 `forwardRef` 契约**不动**（详见 [`component-api-standard.md`](./component-api-standard.md) §M+3 C7） |
| C2  | `use()` 替代 `useContext()`    | 「用 `use()` 替代 `useContext()`」                 | 未涉及（`useContext` 16 处，全在顶层） | **不作为默认替换**（§1.3）—— 本库 Context 消费**全部**在组件顶层，`useContext` **完全够用**；`use()` 的条件调用能力会**诱使**破坏「无条件订阅」语义。仅在确需条件 / 循环内读取时可用 `use()`，且**必须**注明理由                                                           |
| C3  | `memo` 覆盖率                  | 「提取昂贵工作到 memo 化组件」                     | 未涉及（`memo` 仅 7 处）               | **采纳为方向，不强制铺开**（§2.2）—— 组件库的价值在**可组合**，不是极致性能。`memo` **必须**配「props 引用稳定」，否则**恒失效**                                                                                                                                           |
| C4  | `useMemo` / `useCallback` 滥用 | 「避免为简单值 memo 化」「依赖用原始值而非派生值」 | 未涉及                                 | **采纳**（§2.1 / §2.3）—— 本库 `useCallback` 212 处 / `useMemo` 110 处，其中「简单表达式 memo 化」属**过度优化**，登记为可选清理（G-R2）                                                                                                                                   |
| C5  | 派生状态优于 effect            | 「在渲染期派生，不要用 effect 同步状态」           | 未涉及                                 | **采纳**（§3.4）—— 本库 `useTableStorePage.ts:190-193` **正是**该范式，**已合规**，无需改                                                                                                                                                                                  |
| C6  | 组件内不定义组件               | 「不要在组件内部定义组件」                         | 未涉及                                 | **采纳**（§3.3）—— 本库**零**反模式，**已合规**                                                                                                                                                                                                                            |
| C7  | barrel 导入                    | 「直接导入，避免 barrel 文件」                     | **必须**用 barrel 导出                 | **部分采纳**（§5.1）—— **对外**必须走 barrel（公开 API 契约）；**内部**运行时 barrel 导入会**循环依赖**，必须直连源模块（原 2 处违规已修复）                                                                                                                               |
| C8  | 动态 import / 代码分割         | 「重组件用 `next/dynamic`」                        | 单 barrel + `splitting: true`          | **部分采纳**（§5.3）—— `next/dynamic` 是 **Next.js 专用**，本库**不适用**；但「按需加载」的诉求**成立** → 转为「提供懒加载入口 + 消费方文档示范」（G-R1）                                                                                                                  |
| C9  | `useActionState`               | 「表单用 `useActionState`」                        | 表单用 **`react-hook-form`**           | **保留本库规范**（§1.4）—— `useActionState` 面向**服务端动作 / 渐进增强**；组件库无 action 端点。本库用 `react-hook-form` 是**既有方案**，不引入第二套表单状态机制                                                                                                         |
| C10 | 虚拟化阈值                     | 「> 50 项需虚拟化」                                | 表格有 `VirtualList`                   | **采纳**（§6.1）—— 阈值直接采用 50；本库 `VirtualList` 已实现，**新增**长列表组件**必须**接入                                                                                                                                                                              |
| C11 | 异步并行 / waterfall           | 「用 `Promise.all` 并行独立操作」                  | 未涉及（组件库**无**数据获取层）       | **不适用** —— 本库是**纯组件**，无 API 调用 / 路由加载 / 数据获取。组件库内的「异步」只有浮层打开动画，不涉及 waterfall                                                                                                                                                    |
| C12 | `React.cache()` / LRU          | 「服务端 per-request 去重」                        | 无 SSR 层                              | **不适用** —— 本库**无**服务端渲染层（`spec-index.md` 已列「SSR 专用组件」为**不存在的约定**）                                                                                                                                                                             |
| C13 | `useSyncExternalStore`         | 「订阅外部 store」                                 | 未涉及                                 | **不适用** —— 本库**不引入**全局 store（[`i18n-standard.md`](./i18n-standard.md) §维度⑧ 明确禁止）                                                                                                                                                                         |
| C14 | 事件处理器存 ref               | 「把事件处理器存进 ref 避免重渲染」                | 未涉及                                 | **采纳为可选**（§2.6）—— 本库 `useRef` 45 处已含此类用法（`useTableRemoteData` 的 `actionsRef`）。**不强制** —— 属「稳定引用」问题，不是独立规范项                                                                                                                         |
| C15 | `memo` 化 `memo` 化组件        | 「`memo` 的组件默认浅比较」                        | 未涉及                                 | **采纳**（§2.2）—— 补「props 引用稳定」为**必要条件**，否则 `memo` 恒失效                                                                                                                                                                                                  |

---

## M+4. 模块检查清单

> **目的**：新增 / 评审组件渲染写法时的**自查**清单（不是任务列表，是合规性自检表）。

### 编写组件时

- [ ] 组件在**模块级**定义（不在渲染函数体内）
- [ ] 渲染期**无** DOM 测量（`getBoundingClientRect` / `offsetHeight` / `scrollTop`）
- [ ] 能派生的状态**在渲染期派生**，**不用** `useEffect` 同步
- [ ] `useEffect` 只做订阅 / 计时器 / 测量 / 外部副作用
- [ ] `useMemo` / `useCallback` 的依赖数组**完整**（含 `locale` 等上下文值）
- [ ] `useMemo` 内**不是**简单表达式；**不**包裹内联对象样式
- [ ] `memo` **仅**用于昂贵子树，且**确认**了 props 引用稳定
- [ ] 第三方库用**具名导入**（`recharts` 豁免）
- [ ] Context 值按 `state` / `actions` / `config` 分层；提供按需订阅 Hook
- [ ] 事件逻辑在**事件处理器**内，不在 `useEffect` 里
- [ ] 长列表（> 50 项）虚拟化或 `content-visibility`

### 评审渲染写法时

- [ ] 维度 ① ~ ⑩ 已全跑（一次跑全库，非按组件分批）
- [ ] React DevTools Profiler 中**无**「不必要的重渲染」
- [ ] `memo` 组件的实际重渲染次数**确实下降**（而非恒失效）
- [ ] 新增重依赖组件已在文档中给出**懒加载示例**
- [ ] `external` 同步（新增依赖后）

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-11-04 | **首版**。基于 `vercel-react-best-practices` 技能提炼，**结合本库真实实现**裁定。① 确立 **6 章条文**：React 19 API 采用策略（§1，含**适用边界表**与「不模拟并发」原则）、memoization 策略（§2，含「该用 / 不该用」对照表 + `memo` 的**三个必要条件** + 依赖数组完整性 + 「模块级优先于组件内 memo」+ 本库 `memo` 覆盖率的**健康性判定**）、重渲染控制（§3，Context 订阅粒度 / props 引用稳定性是消费方责任 / 禁止组件内定义组件 / 派生状态优于 effect / 事件逻辑放事件处理器）、渲染期副作用禁令（§4，禁 DOM 测量 + 批量读写）、加载成本与包体积（§5，barrel 代价 / 命名空间导入分级判定 / 零代码分割现状 / `external` 是性能红线）、长列表与大内容（§6，虚拟化阈值 50 / `content-visibility` 兜底 / 表格性能设计 4 条）；② **10 项扫描维度**（每项含命令 + 判定 + 修正模式）；③ **§M+3 冲突裁决 15 条（C1~C15）** —— 逐条裁定：**保留**本库 `forwardRef` 契约（C1，说明外部规则的 `use()` 与 ref 转发无关）、**保留** `react-hook-form` 而非 `useActionState`（C9）、**不适用** `use()` 默认替换（C2，附「条件调用会破坏无条件订阅语义」的技术理由）、**不适用** `Promise.all` / `React.cache` / `useSyncExternalStore`（C11 / C12 / C13，因本库无数据获取层、无 SSR 层、无全局 store）；**采纳**派生状态优于 effect（C5，本库已合规）、组件内不定义组件（C6）、虚拟化阈值 50（C10）、`memo` 需配 props 引用稳定（C15）；**部分采纳** barrel 与动态 import（C7 / C8，`next/dynamic` 不适用于组件库，转为「提供懒加载入口」）；④ **§M+2 豁免清单 7 条**（H1~H7）+ **缺口登记 5 条**（G-R1~G-R5），全部带实测数字（`memo` 7 处 / `useCallback` 212 / 动态 import 0 / external 56 / barrel 循环 2 处）；⑤ **§M+1 基线**逐项给出「值 + 判定」两列 —— 明确指出 `useCallback` / `useMemo` **偏多**（⚠️）而非「越多越好」。 |
| 1.1.0 | 2026-11-05 | **全量评审修正**。① **§M+1 基线日期刷新**（2026-11-05 实测；`external` 49 处、`memo` 7 / 56、`useCallback` 235 全库 / 212 `src/ui` 等口径经复核无误 —— 历史行中的「external 56」系**登记笔误**，正文 §5.4 与 §M+1 一直是 49，本版同步修订记录以绝后患）；② **口径注记** —— §M+1 的 `useCallback` / `useMemo` 行已分列「全库 / `src/ui`」双口径，刷新时以 `pnpm probe baseline` 为准。**规范条文本身不过期，只有数据基准会过期**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`architecture-standard.md`](./architecture-standard.md) —— 分层 / 构建链路 / `external` 契约
- [`component-standard.md`](./component-standard.md) —— 组件目录 / 导出 / `cn()` 合并
- [`component-api-standard.md`](./component-api-standard.md) —— props 形状 / Context 分层
- [`i18n-standard.md`](./i18n-standard.md) —— `locale` 必须进依赖数组
- [`code-quality.md`](./code-quality.md) —— lint / type-check / 构建门禁
- [`src/ui/table/context/TableContext.tsx`](../src/ui/table/context/TableContext.tsx) —— Context 四层分离 + 按需订阅的范式来源
- [`src/ui/table/organisms/BaseTable.tsx`](../src/ui/table/organisms/BaseTable.tsx) —— `useMemo` 稳定派生数组的范式来源
