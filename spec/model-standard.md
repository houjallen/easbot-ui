---
name: model-standard
description: 该规范定义 easbot-ui 组件库的数据契约层契约，含 Zod schema 定义模式（schema 即真值源、类型从 schema 推导）、递归结构的 z.lazy + z.ZodType<T> 写法、可选性表达约定（.optional 而非 .nullable）、Zod 与纯 TypeScript 契约层的分工边界、schema 清单（axios / filter / data-store / table 四模块 13 个 schema）、与 tsup external 的联动约束，以及 10 项扫描维度（每项含命令 + 判定 + 修正模式）。当定义或修改数据结构、接入新的后端请求契约、扩展表格动作类型时参考。
category: specification
version: 2.0.0
baseline-date: 2026-11-02
tags: [easbot-ui, model, zod, schema, type, contract, data-store]
related:
  - spec-index.md
  - architecture-standard.md
  - component-standard.md
  - code-quality.md
  - testing-guidelines.md
---

# EASBot UI 数据契约规范 (Model Standard)

> **真值源**：本规范以 [`src/models/`](../src/models/) 目录下的 Zod schema 为唯一执行真值；
> 规范与实现冲突时**规范改**。
>
> **本规范只管 `src/models/` 层的写法** —— 「什么结构该用 Zod、什么结构用纯 TypeScript」
> 见 §4「Zod 层与 TS 契约层的分工」，那是本规范最容易混淆的部分，**先读 §4 再写代码**。

---

## 概述 (Overview)

本库是**纯组件库**，绝大多数「数据结构」只是组件 props 的 TypeScript 类型。
但有一类结构是**例外** —— 它们跨进程边界（与后端约定）或需要**运行时校验**，
必须用 Zod schema 定义。

**核心约束**：

- ✅ **schema 即真值源** —— 类型从 schema 推导（`z.infer`），**不手写 interface**
- ✅ schema 位于 `src/models/` 目录，按**领域**分文件
- ✅ 递归结构用 `z.lazy` + `z.ZodType<T>` 显式标注
- ✅ 可选性**只用** `.optional()`，**不用** `.nullable()`
- ✅ schema **必须**经 `tsup.config.ts` 的 `external` 保持为外部依赖
- ❌ 禁止在 `src/models/` 下手写 `interface` / `type` 描述数据结构（递归 schema 除外，见 §2.3）
- ❌ 禁止用 `.strict()` / `.strictObject()`（会拒绝后端响应的额外字段）
- ❌ 禁止把 schema 写在组件文件里（**必须**下沉到 `src/models/`）
- ❌ 禁止用 `JSON.parse(JSON.stringify())` 做深拷贝（会静默丢弃函数）

---

## 1. 目录与命名

```
src/models/
├── index.ts        # barrel 出口（唯一允许不含 schema 的文件）
├── axios.ts        # 上传请求契约（与后端约定的表单形状）
├── data-store.ts   # 数据源分页契约（请求 / 响应）
├── filter.ts       # 过滤条件契约（表达式 + 递归规则树）
└── table.ts        # 表格动作类型枚举（4 组）
```

| 规则                                  | 说明                                                              |
| ------------------------------------- | ----------------------------------------------------------------- |
| 文件名 = 领域名                       | kebab-case（`data-store.ts` / `filter.ts`）                       |
| schema 常量 = `<领域>Schema` 或语义名 | 如 `DataStorePageSchema` / `FilterRuleSchema`                     |
| 类型名 = schema 名去 `Schema`         | `DataStorePageSchema` → `DataStorePage`                           |
| 类型**必须**用 `z.infer` 推导         | `export type DataStorePage = z.infer<typeof DataStorePageSchema>` |
| 类型名**不加** `I` 前缀               | 与 EASBot 家族一致                                                |
| barrel 必须导出全部 schema 与类型     | `src/models/index.ts`                                             |
| **只放 schema 与类型**                | 运行时代码放 `src/utils/`（见 §4.3）                              |

> 📌 **本层无运行时数据访问器** —— `src/models/` 的每个导出符号都是 schema 常量或类型。
> 需要运行时逻辑时放 `src/utils/`（如 `src/utils/validation-rule.ts` 就是
> 「schema + 运行时函数」的完整范例，见 §4.3）。

### 1.1 现有 schema 清单（真值源）

| 模块            | Schema                        | 类型推导                | 结构形态                              |
| --------------- | ----------------------------- | ----------------------- | ------------------------------------- |
| `axios.ts`      | `UploadFileParamsSchema`      | `UploadFileParams`      | `z.object`                            |
| `axios.ts`      | `UploadRequestConfigSchema`   | `UploadRequestConfig`   | `z.object`                            |
| `data-store.ts` | `DataStoreFieldSchema`        | `DataStoreField`        | `z.object`                            |
| `data-store.ts` | `DataStoreSortingSchema`      | `DataStoreSorting`      | `z.object`                            |
| `data-store.ts` | `DataStorePageSchema`         | `DataStorePage`         | `z.object`（引用 `FilterRuleSchema`） |
| `filter.ts`     | `FilterOperatorSchema`        | `FilterOperator`        | `z.enum`（17 值）                     |
| `filter.ts`     | `FilterDataTypeSchema`        | `FilterDataType`        | `z.enum`（10 值）                     |
| `filter.ts`     | `FilterExpressionSchema`      | `FilterExpression`      | `z.object`                            |
| `filter.ts`     | `FilterRuleSchema`            | `FilterRule` ⚠️         | `z.lazy`（**递归**）                  |
| `table.ts`      | `TableActionTypeSchema`       | `TableActionType`       | `z.enum`（13 值）                     |
| `table.ts`      | `TableColumnActionTypeSchema` | `TableColumnActionType` | `z.enum`（3 值）                      |
| `table.ts`      | `TableCellActionTypeSchema`   | `TableCellActionType`   | `z.enum`（3 值）                      |
| `table.ts`      | `TableRowActionTypeSchema`    | `TableRowActionType`    | `z.enum`（7 值）                      |

**合计**：**13 个 schema**（`src/models/` 内）+ **2 个**（`src/utils/validation-rule.ts`，见 §4.3）
= **全库 15 个**。

> ⚠️ **`FilterRule` 是手写 `interface`** —— 全库**唯一**的例外，
> 原因见 §2.3「递归 schema 的例外」。

---

## 2. schema 定义模式

### 2.1 标准模板

```ts
/**
 * 数据源分页契约 Schema
 *
 * @description
 * 与后端约定的分页请求 / 响应契约 —— 表格组件的远程数据源
 * （`useTableRemoteData` / `useTableStorePage`）以此为准。
 */
import { z } from 'zod';
import { FilterRuleSchema } from './filter';

/** 排序字段配置 Schema */
export const DataStoreSortingSchema = z.object({
  /** 排序字段 */ field: z.string(),
  /** 排序方向 */ order: z.enum(['asc', 'desc']),
});

/** 数据源分页契约 Schema */
export const DataStorePageSchema = z.object({
  /** 总记录数 */ total: z.number().int().nonnegative().optional(),
  /** 当前页码 */ pageNo: z.number().int().positive().default(1),
  /** 每页记录数 */ pageSize: z.number().int().positive().default(10),
  /** 过滤条件（支持嵌套分组与表达式） */ filter: FilterRuleSchema.optional(),
  /** 额外参数 */ params: z.record(z.string(), z.unknown()).optional(),
  /** 排序字段配置 */ sorting: z.array(DataStoreSortingSchema).optional(),
  /** 当前页的数据列表 */ list: z.array(z.record(z.string(), z.unknown())).optional(),
});

/** 数据源分页契约类型 */
export type DataStorePage = z.infer<typeof DataStorePageSchema>;
```

### 2.2 关键约定

| #   | 规则                                                           | 理由                                |
| --- | -------------------------------------------------------------- | ----------------------------------- |
| 1   | `z.object` 而非 `z.strictObject`                               | 拒绝未知字段会让后端响应解析失败    |
| 2   | 可选字段用 `.optional()`，**不用** `.nullable()`               | 「缺失」与「值为 null」语义不同     |
| 3   | 字符串约束**尽量具体**（`.min(1)` / `.int()` / `.positive()`） | 尽早失败，错误信息更准              |
| 4   | 枚举用 `z.enum([...])` 而非 `z.string()`                       | 编译期穷尽检查                      |
| 5   | 数组元素用独立子 schema                                        | 可复用、可单独测试                  |
| 6   | 字段**必须**带中文注释                                         | 与 EASBot 注释规范一致              |
| 7   | 有默认值语义时用 `.default()` 而非在消费方写 `?? fallback`     | 默认值随 schema 演进，不散落各处    |
| 8   | 动态键用 `z.record(z.string(), z.unknown())`                   | Zod v4 的 `z.record` 是**双参**形式 |
| 9   | 枚举成员用**行尾 `// 中文` 注释**（枚举无字段可挂 JSDoc）      | 与 `src/models/table.ts` 一致       |

> 📌 **`.nullable()` 在本库全库零使用**（`src/**` 无任何 `.nullable()` 调用）。
> 「缺失」用 `.optional()` 表达；真要表达「可为 null」时，先确认不是语义混淆。

### 2.3 递归结构用 `z.lazy`（全库唯一范例）

```ts
/**
 * 过滤规则类型
 *
 * @description
 * 递归结构：`rules` 字段的值仍是 `FilterRule`。
 * 这里显式声明 interface（而非 `z.infer`）以打破循环引用 ——
 * `z.infer<typeof FilterRuleSchema>` 会因 schema 自引用而报 TS2456。
 */
export interface FilterRule {
  /** 逻辑运算类型 */
  logic?: 'and' | 'or';
  /** 分组名称 */
  group?: string;
  /** 嵌套规则分组 */
  rules?: FilterRule[];
  /** 表达式列表 */
  expressions?: FilterExpression[];
}

/**
 * 过滤规则 Schema（递归）
 *
 * @remarks
 * 递归 schema 必须显式标注类型（`z.ZodType<FilterRule>`），否则 TypeScript
 * 无法推导自引用结构，会报 TS7022「implicitly has type 'any'」。
 */
export const FilterRuleSchema: z.ZodType<FilterRule> = z.lazy(() =>
  z.object({
    /** 逻辑运算类型 */
    logic: z.enum(['and', 'or']).optional(),
    /** 分组名称 */
    group: z.string().optional(),
    /** 嵌套规则分组 */
    rules: z.array(FilterRuleSchema).optional(),
    /** 表达式列表 */
    expressions: z.array(FilterExpressionSchema).optional(),
  }),
) as z.ZodType<FilterRule>;
```

**递归 schema 的 3 条硬规则**：

| #   | 规则                                                               | 违反后果                          |
| --- | ------------------------------------------------------------------ | --------------------------------- |
| 1   | **必须**手写 `export interface` 作为递归锚点（**不**用 `z.infer`） | TS2456「类型引用自身」            |
| 2   | **必须**显式标注 `z.ZodType<T>`（声明处 + 结尾 `as` 断言）         | TS7022「隐式 any」                |
| 3   | 手写 interface **必须**声明在 schema **之前**                      | TS2448「used before declaration」 |

> 📌 **这是「类型必须 `z.infer`」的唯一例外** —— 递归 schema 的类型**必须**手写。
> 其余所有类型一律 `z.infer`。

### 2.4 函数类型与运行时类检查

Zod v4 支持 `z.function()` 与 `z.instanceof()`，但**语义不同**：

| 写法                            | 用途                             | 本库范例                                       |
| ------------------------------- | -------------------------------- | ---------------------------------------------- |
| `z.instanceof(File)`            | 校验**运行时类**                 | `src/models/axios.ts:19`（`file` 字段）        |
| `z.function()`                  | 声明「这是个函数」（无签名校验） | `src/models/axios.ts:39`（`onUploadProgress`） |
| `z.function({ input, output })` | Zod v4 的**带签名**形式          | `src/utils/validation-rule.ts:51-56`           |

> ⚠️ **`z.instanceof()` 依赖 Zod 的类身份** —— 若 `zod` 被打进 bundle，
> 消费方会拿到**重复的 Zod 实例**，`instanceof` 校验**静默失败**。
> 这正是 `tsup.config.ts` 把 `zod` 放进 `external` 的原因（见 §5）。

---

## 3. Schema 的分类与归属

### 3.1 表格动作类型（`table.ts`）

4 组 `z.enum`，对应表格的 4 个动作作用域：

```ts
/**
 * 表格动作类型 Schema
 *
 * @description
 * 表格工具栏 / 行操作 / 列操作 / 单元格操作的动作标识 ——
 * 与后端约定的动作 code 一一对应。
 */
export const TableActionTypeSchema = z.enum([
  'table-refresh', // 刷新表格
  'table-add', // 新增行
  'table-delete', // 批量删除（单行或多行）
  'table-export', // 导出数据
  'table-sort', // 排序
  'table-search', // 搜索
  'table-columnSetting', // 列显示设置
  'table-filter', // 筛选
  'table-reset', // 重置
  'table-import', // 导入数据
  'table-print', // 打印
  'table-fullscreen', // 全屏显示
  'table-custom', // 自定义
]);
```

> 📌 **动作类型只在 `src/models/table.ts` 定义一次** ——
> `src/ui/table/types/base.ts` 的 `ActionConfig.type` 通过
> `TableActionType | TableRowActionType | TableColumnActionType | TableCellActionType | string`
> 引用它们（**类型层面**复用，非运行时校验）。

### 3.2 过滤契约（`filter.ts`）

| Schema                   | 作用                            | 备注                                   |
| ------------------------ | ------------------------------- | -------------------------------------- |
| `FilterOperatorSchema`   | 17 种过滤操作符                 | `eq` / `like` / `between` / `in` / …   |
| `FilterDataTypeSchema`   | 10 种被比较值的数据类型         | `string` / `int` / `date` / `enum` / … |
| `FilterExpressionSchema` | 单个字段的过滤表达式            | `field` + `op` + `value` + `type`      |
| `FilterRuleSchema`       | 递归规则树（分组 + 表达式列表） | **唯一递归 schema**（§2.3）            |

### 3.3 数据源分页契约（`data-store.ts`）

| Schema                   | 作用                                      | 消费方                                                         |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| `DataStoreFieldSchema`   | 字段元信息（名称 / 类型 / 必填 / 默认值） | 表格列配置的动态来源                                           |
| `DataStoreSortingSchema` | 单个排序字段（`field` + `order`）         | `DataStorePageSchema.sorting`                                  |
| `DataStorePageSchema`    | 一次分页请求 / 响应的完整形状             | `useTableStorePage` / `useTableRemoteData` / `tableDataSource` |

**唯一使用 `.default()` 的两个字段**：`pageNo`（默认 1）与 `pageSize`（默认 10）。

> ⚠️ **`DataStorePage` 是「请求 + 响应」的合体** —— 既有 `pageNo` / `sorting` / `filter`
> （请求侧），也有 `total` / `list` / `fields`（响应侧）。
> `src/ui/table/store/tableDataSource.ts` 的 `toFetchParams()` 负责在转请求时
> **剔除响应侧字段**（`list` / `total` / `fields` / `context`）。

### 3.4 上传请求契约（`axios.ts`）

> 📌 **组件库不依赖 axios** —— 这里只定义与后端约定的**请求形状**，
> 实际的 HTTP 客户端由**消费方**注入（`httpClient.uploadFile`）。

| Schema                      | 作用                                |
| --------------------------- | ----------------------------------- |
| `UploadFileParamsSchema`    | 待上传文件 + 表单字段名 + 附带数据  |
| `UploadRequestConfigSchema` | 请求地址 / 方法 / 请求头 / 进度回调 |

---

## 4. Zod 层与 TS 契约层的分工 ⭐

> **这是本规范最容易被误解的部分** —— 「所有数据结构都用 Zod」是**错的**。

### 4.1 判定决策树

```
这个结构需要 Zod 吗？
├── 需要跨进程边界（与后端约定 / 会被 JSON 序列化传输）
│   └── ✅ 用 Zod —— 放 src/models/
├── 需要运行时校验（消费方传进来的配置要在运行时被验证）
│   └── ✅ 用 Zod —— 放 src/models/
└── 只是组件 props 的 TypeScript 形状
    └── ❌ 用纯 TypeScript —— 留在组件目录
```

### 4.2 为什么 props 类型不用 Zod

`src/ui/table/types/` 有约 **180 个**导出类型（`base.ts` 1500 行 / `components.ts` 583 行 /
`hooks.ts` 697 行 / `utils.ts` 137 行），全部是**纯 TypeScript**。原因是它们的
主体是**函数值 props**：

```ts
export interface TableColumn extends UniversalFieldConfig {
  // ...
  /** 自定义渲染 */
  render?: (value: any, record: Record<string, any>, index: number) => ReactNode;
  /** 值格式化 */
  formatter?: (value: any, record: any) => string;
  /** 可见性判定 */
  when?: (selectedRows: any[], context: TableContextValue, action: ActionConfig) => boolean;
  /** 动作执行 */
  execute?: (selectedRows: any[], context: TableContextValue, action: ActionConfig) => void;
}
```

**Zod 无法校验函数的行为** —— `z.function()` 只能声明「这是个函数」，
既不校验参数签名也不校验返回值。给这类 props 套 Zod **只会带来噪音，不带来保障**。

### 4.3 边界表

| 关注点                     | 归属层                                | 判定依据                              |
| -------------------------- | ------------------------------------- | ------------------------------------- |
| 后端分页 / 过滤 / 排序契约 | `src/models/`（Zod）                  | 跨进程边界 + 需运行时校验             |
| 表格动作类型 code          | `src/models/table.ts`（Zod）          | 与后端约定的字符串枚举                |
| 上传请求形状               | `src/models/axios.ts`（Zod）          | 跨进程边界                            |
| 组件 props / 渲染函数      | 组件目录（纯 TS）                     | 含函数值，Zod 校验不了                |
| 表格配置（`TableConfig`）  | `src/ui/table/types/base.ts`（纯 TS） | 含大量函数值 + 递归可选结构           |
| 校验规则 + 校验函数        | `src/utils/validation-rule.ts`        | **schema + 运行时函数同文件**（见下） |

> 📌 **`src/utils/validation-rule.ts` 是唯一的「schema 在 `models/` 之外」的合法先例** ——
> 它导出 `ValidationFormatSchema` / `ValidationRuleSchema` **以及** 6 个运行时函数
> （`validateField` / `validateFields` / `createValidator` / `defaultValidator` /
> `isValid` / `getValidationError`）。
> 理由：schema 与它的运行时实现**必须同文件**才便于维护，拆开反而割裂。
> 该先例已在 [`code-quality.md`](./code-quality.md) §4.5 登记。

### 4.4 ⚠️ 已知不一致（`src/ui/table/types/base.ts`）

`src/ui/table/types/base.ts` 的 JSDoc 多次声称「与 schema 保持一致」
（如 `FilterOperator` / `DataType` 的注释），但：

1. **不存在** `TableColumnSchema` / `TableDataSchema` / `ScrollConfigSchema` /
   `PaginationConfigSchema` —— 这些注释是** aspirational**（指向不存在的 schema）；
2. `FilterOperator`（TS union，17 值）与 `FilterOperatorSchema`（Zod enum，17 值）
   **当前取值集合相同**，但**是两处独立定义** —— 改一处不会同步另一处；
3. `DataType`（TS union，**11** 值，含 `'number'`）与 `FilterDataTypeSchema`
   （Zod enum，**10** 值，无 `'number'`）**取值集合已不同**；
4. `src/ui/table/types/base.ts:158` 的 `searchConditionToFilterExpression()`
   多字段分支产出 `{ logic: 'or', conditions: [...] }`，
   而 `FilterRuleSchema` 期望的键是 **`expressions`** —— **形状不匹配且未经校验**。

> ⚠️ **本规范不要求把 `src/ui/table/types/` 迁进 Zod** —— §4.1 的判定树已给出结论。
> 但**必须**遵守：纯 TS 层与 Zod 层**同名枚举**并存时，
> **改动必须同步**（改动即补，见下方豁免清单）。

---

## 5. 与构建链路的联动

### 5.1 `zod` 必须是 `external`

`zod` 是 `dependencies`（`package.json`）中的**运行时依赖**，且必须出现在
`tsup.config.ts` 的 `external` 数组里。

**原因**（`tsup.config.ts` 的注释已写明）：Zod 被打进 bundle 时，
消费方会拿到**重复的 Zod 实例**，导致：

- `z.instanceof(File)` 这类**运行时类检查**静默失败
- `schema.parse()` 的错误实例与消费方 `instanceof z.ZodError` 不匹配

**判定**：见 §M 维度 ⑨。

### 5.2 schema 随 barrel 进入公开 API

`src/index.ts` 的第一段导出是 `export * from './models';` ——
**所有 schema 与类型都是公开 API**（出现在 `dist/index.d.ts`）。

> ⚠️ **schema 名与类型名都是公开契约** —— 改名等于破坏性变更，
> 需走 [`code-quality.md`](./code-quality.md) §4.4 的发布流程。

---

## M. 10 项扫描维度（评审必跑）

> **执行纪律**：⛔ **禁止按文件分批跑**，模式必须**一次跑全库**。

### 维度 ① `src/models/` 下禁止手写 interface

**扫描命令**：

```bash
rg -n "^export interface " src/models
```

**判定规则**：

- ❌ 违规：命中 `FilterRule` 之外的任何一行（类型必须从 schema 推导）
- ✅ 合规：仅命中 `FilterRule` 一行（递归锚点，§2.3 的合法例外）

**修正模式**：

```ts
// ❌ 违规
export interface DataStorePage {
  pageNo: number;
}

// ✅ 修正
export const DataStorePageSchema = z.object({ pageNo: z.number().int().positive().default(1) });
export type DataStorePage = z.infer<typeof DataStorePageSchema>;
```

### 维度 ② schema 必须导出类型（`z.infer`）

**扫描命令**：

```bash
Get-ChildItem src/models -Filter *.ts | Where-Object { $_.Name -ne 'index.ts' } | ForEach-Object {
  $c = Get-Content $_.FullName -Raw
  if ($c -notmatch 'z\.infer') { "NO z.infer: $($_.Name)" }
}
```

**判定规则**：

- ❌ 违规：任一模型文件缺 `z.infer` 推导
- ✅ 合规：无输出

### 维度 ③ 禁止 `.strict()` / `.strictObject()`

**扫描命令**：

```bash
rg -n "\.strict\(\)|\.strictObject\(\)" src
```

**判定规则**：

- ❌ 违规：命中任一行（会拒绝后端响应的额外字段）
- ✅ 合规：无输出

> 📌 **当前基线：全库 0 处**（该禁令**空跑**但必须保留 —— 后端加字段时
> 一旦有人顺手加了 `.strict()` 就会立刻炸掉整条链路）。

### 维度 ④ schema 必须在 `src/models/`（或 §4.3 的合法先例）而不在组件内

**扫描命令**：

```bash
rg -n "z\.(object|enum|array|union|lazy|discriminatedUnion|record)\(" src \
  -g "!src/models/**" -g "!**/__tests__/**" -g "!**/*.stories.tsx"
```

**判定规则**：

- ❌ 违规：命中 `src/utils/validation-rule.ts` 之外的任何一行
- ✅ 合规：仅命中 `src/utils/validation-rule.ts`（§4.3 的合法先例）

> 📌 **测试 / Story 文件里的 schema 是消费方侧的**（验证「组件能接受消费方自定义 schema」），
> 本维度**不**约束它们。

### 维度 ⑤ schema 字段必须有中文注释

**扫描命令**：

```bash
Get-ChildItem src/models -Filter *.ts | Where-Object { $_.Name -ne 'index.ts' } | ForEach-Object {
  $lines = Get-Content $_.FullName
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s{2}\w+:\s*z\.') {
      if ($lines[$i - 1] -notmatch '\*/') { "$($_.Name):$($i + 1) NO COMMENT: $($lines[$i].Trim())" }
    }
  }
}
```

**判定规则**：

- ❌ 违规：schema 字段前一行不是注释结尾（字段缺中文说明）
- ✅ 合规：无输出

### 维度 ⑥ `z.lazy` 必须显式标注类型

**扫描命令**：

```bash
rg -n "z\.lazy\(" src/models | Where-Object { $_ -notmatch 'z\.ZodType' }
```

**判定规则**：

- ❌ 违规：`z.lazy` 所在行**未**标注 `z.ZodType<T>`
- ✅ 合规：无输出

> 📌 **不要加 `-A 2` 的上下文行** —— 上下文里的 `z.object({` 与字段注释
> 本就不含 `z.ZodType`，会误报。只看 `z.lazy(` **所在的那一行**。

### 维度 ⑦ `src/models/index.ts` 必须导出全部模块

**扫描命令**：

```bash
$files = Get-ChildItem src/models -Filter *.ts | Where-Object { $_.Name -ne 'index.ts' } | ForEach-Object { $_.BaseName }
$barrel = Get-Content src/models/index.ts -Raw
foreach ($f in $files) {
  if ($barrel -notmatch "./$f") { "MISSING in barrel: $f" }
}
```

**判定规则**：

- ❌ 违规：任一模型文件未在 barrel 中导出（schema 不进公开 API）
- ✅ 合规：无输出

### 维度 ⑧ 禁止 `.nullable()`

**扫描命令**：

```bash
rg -n "\.nullable\(\)" src
```

**判定规则**：

- ❌ 违规：命中任一行（「缺失」用 `.optional()` 表达，§2.2 规则 2）
- ✅ 合规：无输出

> 📌 **当前基线：全库 0 处**。`.optional()` 是本库**唯一**的可选性机制。

### 维度 ⑨ `zod` 必须在 `tsup.config.ts` 的 `external` 里

**扫描命令**：

```bash
$ext = Get-Content tsup.config.ts -Raw
if ($ext -notmatch "'zod'") { "VIOLATION: zod 不在 external" } else { "OK" }
```

**判定规则**：

- ❌ 违规：`zod` 不在 `external` 数组（消费方拿到重复实例，`instanceof` 失效，§5.1）
- ✅ 合规：输出 `OK`

### 维度 ⑩ 禁止 `JSON.parse(JSON.stringify())` 深拷贝

**扫描命令**：

```bash
rg -n "JSON\.parse\(JSON\.stringify\(" src -g "!**/docs/**" -g "!**/*.md" |
  Where-Object { $_ -notmatch ':\s*\*' }
```

**判定规则**：

- ❌ 违规：命中任一行（JSON 序列化**静默丢弃函数** —— 表格的自定义渲染 / 格式化会失效）
- ✅ 合规：无输出

> 📌 **必须排除注释行与 `docs/` 下的 markdown** ——
> `src/ui/table/plugins/{FullscreenPlugin,ColumnManagerPlugin}.tsx` 的注释里
> 写着「**不能使用** `JSON.parse(JSON.stringify())`」，
> 那正是**禁令本身**的说明，不是违规代码。
>
> 📌 **`src/ui/table/plugins/` 与 `src/ui/table/utils/` 里已有正确写法** ——
> `clonePlainData()`（只拷纯数据行）与 `cloneColumns()`（保留函数引用），
> 见 `src/ui/table/plugins/FullscreenPlugin.tsx:44-70`。

---

## M+1. 历史基准（2026-11-02 实测）

> **作用域**：本节是**历史快照**。数据会过期，条文不过期。

| 指标                           | 值                                                     |
| ------------------------------ | ------------------------------------------------------ |
| `src/models/` 文件数           | **5**（4 个 schema 模块 + 1 个 barrel）                |
| `src/models/` schema 数        | **13**                                                 |
| 全库 schema 数                 | **15**（+ `src/utils/validation-rule.ts` 的 2 个）     |
| `src/models/` 导出类型数       | **13**（12 个 `z.infer` + 1 个手写 `FilterRule`）      |
| Zod 版本                       | **4.6.7**（`dependencies`，`^4.6.7`）                  |
| 递归 schema 数                 | **1**（`FilterRuleSchema`）                            |
| `.default()` 用量              | **2**（`pageNo` → 1 / `pageSize` → 10）                |
| `.min()` 用量（`src/models/`） | **1**（`FilterExpressionSchema.field`）                |
| `.nullable()` 用量（全库）     | **0**                                                  |
| `.strict()` 用量（全库）       | **0**                                                  |
| `z.discriminatedUnion` 用量    | **0**（本库**未使用**判别式联合）                      |
| `z.literal` 用量（全库）       | **0**                                                  |
| `JSON.parse` 用量（`src/`）    | **2**（均在 `src/ui/edit/`，解析**用户输入**，非契约） |
| `src/models/` 依赖             | 仅 `zod` + 兄弟模块（**纯叶子层**）                    |

---

## M+2. 豁免清单

| 对象                                                                                        | 豁免依据                                                                                |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/models/filter.ts` 的 `FilterRule` 手写 `interface`                                     | **递归 schema 的唯一合法锚点** —— `z.infer` 会报 TS2456（§2.3 规则 1）                  |
| `src/utils/validation-rule.ts` 的 schema 在 `models/` 之外                                  | **schema 与运行时实现同文件**的先例（§4.3）                                             |
| `src/utils/validation-rule.ts` 的 `ValidationResult` / `ValidationContext` 手写 `interface` | 这两个是**函数参数/返回值**形状，非数据契约（不含可校验的数据）                         |
| `src/ui/table/types/**` 全部纯 TypeScript                                                   | 含大量**函数值 props**，Zod 校验不了（§4.2）                                            |
| `src/ui/form/__tests__/` 与 `src/ui/form/__tests__/*.stories.tsx` 里的 schema               | **消费方侧** schema —— 验证组件能接受消费方自定义 schema（维度 ④ 不约束）               |
| `src/ui/edit/{ObjectEditor,ListEditor}.tsx` 的 `JSON.parse`                                 | 解析**用户手输的 JSON 字面量**，有 `try/catch` 兜底，非契约解析（§M 维度 ⑩ 只禁深拷贝） |
| `z.instanceof(File)`                                                                        | 校验**运行时类**，是 `axios.ts` 的核心诉求（§2.4）                                      |
| 裸 `z.function()`（`axios.ts:39`）                                                          | 只声明「这是个函数」，不校验签名 —— `UploadRequestConfigSchema` 不需要签名级校验        |

---

## M+3. 冲突裁决

| #   | 冲突点                 | 旧写法 / 外部惯例                      | 本库裁决                                                                  |
| --- | ---------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| C1  | 契约层的范围           | 「所有数据结构都用 Zod」               | **只管跨边界 + 需运行时校验的**（§4.1 判定树）                            |
| C2  | `src/models/` 的职责   | schema + 运行时数据访问器              | **只放 schema 与类型**，运行时逻辑放 `src/utils/`                         |
| C3  | 可选性表达             | `.nullable()` 或两者混用               | **只用 `.optional()`**（§2.2 规则 2）                                     |
| C4  | 多态结构               | `z.discriminatedUnion` + `z.literal()` | **本库未使用**（0 处）—— 不作为强制规范；表格动作类型是 4 组独立 `z.enum` |
| C5  | 递归 schema 的类型来源 | 统一 `z.infer`                         | **递归用手写 interface**（§2.3，全库唯一例外）                            |
| C6  | `z.record` 的参数个数  | Zod v3 单参 `z.record(valueType)`      | **Zod v4 双参** `z.record(z.string(), z.unknown())`                       |

---

## M+4. 模块检查清单

### 新增模型时

- [ ] 文件在 `src/models/` 下，kebab-case 命名（维度 ⑦）
- [ ] 用 `z.object` 而非 `interface`（维度 ①）
- [ ] 类型从 `z.infer` 推导（维度 ②）
- [ ] 每个字段有中文注释（维度 ⑤）
- [ ] 可选字段用 `.optional()`，**不用** `.nullable()`（维度 ⑧）
- [ ] 未引入 `.strict()`（维度 ③）
- [ ] 递归结构用 `z.lazy` + `z.ZodType<T>` + 手写 interface（维度 ⑥）
- [ ] 有文件头 JSDoc（§1 约定）
- [ ] 已加入 `src/models/index.ts`（维度 ⑦）
- [ ] 新增的第三方依赖已同步 `tsup.config.ts` 的 `external`（维度 ⑨）

### 修改模型时

- [ ] 未引入 `.strict()`（维度 ③）
- [ ] schema 未内联到组件（维度 ④）
- [ ] 未用 `JSON.parse(JSON.stringify())` 深拷贝（维度 ⑩）
- [ ] 若改动了与纯 TS 层同名的枚举，**同步**改了 `src/ui/table/types/base.ts`（§4.4）
- [ ] `pnpm type-check` 通过（下游类型未破）
- [ ] `pnpm build` 通过（`dist/index.d.ts` 正常生成）

---

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0 | 2026-11-02 | **全文重写 —— 对齐 `easbot-ui` 组件库真实实现**（原 v1.4.0 描述的是 `easbot-doc` 文档门户，与本库**完全无关**）。① 概述重写 —— 明确本库**大部分数据结构是纯 TypeScript props 类型**，只有跨进程边界 / 需运行时校验的结构才用 Zod；② §1 目录树改为真实的 5 文件（`axios` / `data-store` / `filter` / `table` + barrel），新增 §1.1 **完整 schema 清单表**（13 个 schema + 逐项真值源）；③ §2.2 关键约定由 6 条扩为 9 条（补 `.default()` 唯一性、Zod v4 双参 `z.record`、枚举成员行尾注释）；④ §2.3 递归结构改写为**全库唯一范例**（`FilterRuleSchema`），明确「手写 interface」是「类型必须 `z.infer`」的**唯一例外**，补 3 条硬规则（interface 先声明 / `z.ZodType<T>` 双处标注 / 声明顺序）；⑤ 新增 §2.4「函数类型与运行时类检查」（`z.instanceof` / `z.function` 的 Zod v4 形态）；⑥ §3 按真实模块重写（4 个模块各自的作用表 + 与消费方的对应关系），补 `DataStorePage` 「请求+响应合体」的关键约束；⑦ **新增 §4「Zod 层与 TS 契约层的分工」** —— 判定决策树 + props 为何不用 Zod（函数值 props）+ 边界表 + §4.3 `validation-rule.ts` 合法先例 + §4.4 `src/ui/table/types/` 已知不一致登记（aspirational 注释 / 两处枚举定义 / `conditions` vs `expressions` 形状不匹配）；⑧ **新增 §5「与构建链路的联动」** —— `zod` 必须 `external`（重复实例导致 `instanceof` 失效）+ schema 随 barrel 进公开 API；⑨ 维度由 9 项（其中 ⑩⑪ 描述本库不存在的判别式联合）改为 **10 项**，全部对齐真实实现（新增「禁止 `.nullable()`」「`zod` 必须在 external」「禁止 `JSON.parse(JSON.stringify())` 深拷贝」，删除判别式联合两项）；⑩ **新增 §M+3 冲突裁决 6 条**（契约层范围 / `models/` 职责 / 可选性 / 多态结构 / 递归类型来源 / `z.record` 参数个数）；⑪ §M+1 基线全面更新（Zod 4.6.7 / 13 schema / 1 递归 / 0 `.nullable()` / 0 `.strict()` / 0 判别式联合）；⑫ 豁免清单扩为 8 条。**本规范从「文档门户数据模型规范」彻底转为「组件库数据契约规范」**。 |

---

## 相关文档 (Related Documents)

- [`spec-index.md`](./spec-index.md) —— 规范总索引与导航
- [`architecture-standard.md`](./architecture-standard.md) —— 架构规范（`src/models/` 的层定位与依赖方向）
- [`component-standard.md`](./component-standard.md) —— 组件规范（props 类型写法）
- [`code-quality.md`](./code-quality.md) —— 代码质量门禁（依赖分区 / `external` 同步）
- [`testing-guidelines.md`](./testing-guidelines.md) —— 测试规范（schema 的测试写法）
