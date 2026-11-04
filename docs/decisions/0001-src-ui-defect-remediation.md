---
name: 0001-src-ui-defect-remediation
description: '0001: 修复 src/ui 公开组件层的 17 项源码级缺陷 —— 导出缺失 / 死 prop / 属性丢失 / 语义分歧 / 占位实现'
category: architecture
author: 小莫
version: 1.1.0
date: '2026-11-04'
keywords:
  - '0001'
  - src-ui
  - defect-remediation
  - public-api
  - barrel-export
status: temporary
related_task: task-docs-rewrite-src-ui
---

# 0001: 修复 src/ui 公开组件层的 17 项源码级缺陷

> **决策日期**：2026-11-04
> **决策人**：小莫（自主推进，待 Review）
> **状态**：📋 草拟 / 🟡 临时生效 / ✅ 已通过 / ❌ 已废弃
> **类型**：架构型
> **影响范围**：`src/ui/`（12 个组件）、`src/design-system/components/ui/sidebar.tsx`、包根 barrel 导出面、公开 API 契约
> **相关 spec**：[`spec/component-standard.md`](../../spec/component-standard.md)、[`spec/css-standard.md`](../../spec/css-standard.md)、[`spec/testing-guidelines.md`](../../spec/testing-guidelines.md)
> **关联决策**：无（本库首篇 ADR）
> **相关任务**：[`.easbot/knowledge/tasks/docs-rewrite-src-ui/`](../../.easbot/knowledge/tasks/docs-rewrite-src-ui/)

---

## 背景 (Context)

在「按源码重写 `docs/`」任务（`docs-rewrite-src-ui`）的撰写过程中，通过**逐个组件精读源码**发现了 **17 项 `src/ui` 的真实源码级缺陷**。

这些缺陷此前**从未被记录**，也没有任何对应的 issue 或 TODO 追踪。它们的共同特征是：**文档写出来的 API 与组件实际行为对不上**，消费方按文档使用会静默失败。

### 缺陷分类

| 类别                                  | 数量 | 后果                                       | 涉及组件                                 |
| ------------------------------------- | ---- | ------------------------------------------ | ---------------------------------------- |
| **A. 公开 API 缺失/错位**             | 3    | 消费方 import 失败或拿到错误类型           | `resizable` / `table` / `typography`     |
| **B. 声明但未实现的 prop（死 prop）** | 4    | 消费方传了参数静默无效；非法属性泄漏到 DOM | `button` / `combobox` / `table` / `date` |
| **C. 属性透传丢失**                   | 2    | `className` / 原生属性 / `ref` 被静默吞掉  | `badge` / `combobox`                     |
| **D. 运行时崩溃**                     | 1    | `asChild` 路径直接抛异常                   | `tag`                                    |
| **E. 样式失效**                       | 1    | `box-shadow` 声明被浏览器丢弃              | `sidebar`                                |
| **F. 占位实现 / 假成功**              | 4    | 功能看似可用实则无效                       | `table` / `file`                         |
| **G. 行为/语义不一致**                | 2    | 同族组件行为分歧                           | `date` / `select`                        |

### 为什么现在必须修

1. **文档正在重写** —— `docs/` 基于当前源码生成。若不先修源码，重写出的文档会把这些缺陷**固化成"官方契约"**，形成"文档描述 bug 行为"的错误基线。
2. **违反项目宪法** —— [AGENTS.md](../../../AGENTS.md) 第 8 条要求"每个新功能 / Bug 修复 / 重构必须配套单元测试"，第 10 条要求"规范与实现冲突时改规范，不留双轨"。当前状态是**实现有缺陷、规范未覆盖、测试未覆盖**的三重缺失。
3. **部分缺陷是崩溃级** —— `tag` 的 `asChild` 与 `table` 的 `config.enabled` 属于「消费方按文档用就炸」的级别。

---

## 约束 (Constraints)

- **约束 1**：本库是**纯组件库**，不引入后端 / CLI / Agent 运行时 / 数据库逻辑。`file` 组件的 `httpClient` 属消费方注入的边界，本决策只修**库的契约表达**，不实现上传后端。
- **约束 2**：对外契约（props / 导出名 / DOM 结构）变更 MUST 走 ADR + CHANGELOG + 版本 bump（AGENTS.md 第 2 条）。
- **约束 3**：**不得**为修缺陷而扩大改动面 —— 每个修复必须是最小变更（eas-dev-diagnose Phase 3）。
- **约束 4**：不引入新 npm 依赖；不新增 Radix 包。
- **约束 5**：修复 MUST 配套 Vitest 回归测试，且**必须验证"修复前失败 / 修复后通过"**（eas-dev-diagnose Phase 4）。
- **约束 6**：组件目录 MUST 保持自包含（`src/ui/<component>/` + `__tests__/`），唯一 barrel 入口为 `src/ui/index.ts`（spec/component-standard.md §1）。
- **约束 7**：注释 / JSDoc 使用完整规范中文；类型 MUST 用 `import type` 显式导入；**禁止** `@/` 路径别名。

---

## 备选方案 (Alternatives)

### 方案 A：全部 17 项一次性修完

| 维度 | 评估                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 优点 | 一次性消除技术债；文档重写有干净基线                                                                                                      |
| 缺点 | 改动面大（12 个组件 + barrel），review 成本高；部分项（如 `file` 的裁剪弹窗、table 插件钩子）实为**未完成功能**而非 bug，修法涉及产品决策 |
| 风险 | 中 —— 可能与正在进行的文档重写冲突                                                                                                        |
| 成本 | 高                                                                                                                                        |

### 方案 B：只修「崩溃级 + 契约级」，其余记录 TODO

| 维度 | 评估                                                                                         |
| ---- | -------------------------------------------------------------------------------------------- |
| 优点 | 改动最小；风险低                                                                             |
| 缺点 | 死 prop / 属性丢失这类**静默失败**问题比崩溃更危险 —— 消费方不会发现，会持续按错误契约写代码 |
| 风险 | 高 —— 技术债继续累积，且文档仍会固化错误契约                                                 |
| 成本 | 低                                                                                           |

### 方案 C：按「缺陷性质」分三批，先做批次一（选定方案）

| 维度 | 评估                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 优点 | 每批改动可控、可独立 review 与回滚；批次一解决**崩溃 + 契约错位**（最高危），批次二三解决静默失败与体验分歧 |
| 缺点 | 需要 3 次提交                                                                                               |
| 风险 | 低 —— 每批独立验证，出问题只回滚该批                                                                        |
| 成本 | 中                                                                                                          |

### 方案 D：不修，只在文档中标注"已知问题"

| 维度 | 评估                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| 优点 | 零代码改动                                                                                                                      |
| 缺点 | 把缺陷写成"官方行为"；与 AGENTS.md 第 10 条「不留双轨」直接冲突；`tag` 的崩溃、`table` 的插件关不掉属于**无法靠文档规避**的问题 |
| 风险 | 极高                                                                                                                            |
| 成本 | 极低                                                                                                                            |

---

## 决策 (Decision)

**本决策选择：方案 C —— 按缺陷性质分三批修复，批次一（本决策范围）解决「运行时崩溃」与「公开 API 错位」两类。**

| 项         | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 选了什么   | 方案 C（三批修复），本 ADR 锁定**批次一**范围                                    |
| 批次一范围 | D 类（崩溃）+ A 类（API 缺失/错位）+ E 类（样式失效）+ C 类中属性丢失（`badge`） |
| 批次二范围 | B 类（死 prop）+ C 类（`combobox` 属性丢失）                                     |
| 批次三范围 | F 类（占位实现 / 假成功）+ G 类（行为不一致）                                    |
| 适用范围   | `src/ui/` 公开组件层                                                             |
| 生效日期   | 2026-11-04                                                                       |
| 审批状态   | 📋 草拟                                                                          |

### 批次一逐项决策

| #   | 组件         | 缺陷                                                             | 决策    | 修法                                                                      |
| --- | ------------ | ---------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| D-1 | `tag`        | `asChild` 运行时抛错                                             | ✅ 修复 | children 包装为**单个**元素，与 `Button`（L230）写法对齐                  |
| A-1 | `resizable`  | 未从 barrel 导出                                                 | ✅ 修复 | `src/ui/index.ts` 补 `export * from './resizable'`（需验证无 TS2308）     |
| A-2 | `typography` | `index.ts` 死文件（双入口）                                      | ✅ 修复 | 删除 `src/ui/typography/index.ts`（保留 `index.tsx` 为唯一入口）          |
| A-3 | `table`      | `AdvancedTableProps` / `TablePaginationProps` 双份定义且导出错位 | ✅ 修复 | 统一到**组件实际使用**的版本；`types/components.ts` 那份删除              |
| E-1 | `sidebar`    | `hsl(var(--sidebar-border))` 嵌套非法 → 描边失效                 | ✅ 修复 | 直接用 `var(--sidebar-border)`（去掉多余 `hsl()` 包装）；hover 分支同步修 |
| C-1 | `badge`      | 圆点模式丢弃 `className` / 原生属性 / `ref`                      | ✅ 修复 | dot 分支补 `{...props}` + `className` 合并 + `ref` 挂载                   |

---

## 依据 (Rationale)

1. **为什么不是方案 A（一次全修）**：F 类缺陷（`file` 裁剪弹窗、`table` 插件钩子、`httpClient` 假成功）本质是**未完成的功能**，不是 bug —— 修法涉及产品决策（"裁剪要不要接第三方库？"、"插件钩子按什么语义实现？"），不是诊断能回答的。混在一起会让 review 无法聚焦。

2. **为什么不是方案 B（只修崩溃级）**：C 类（属性丢失）比崩溃更危险 —— `badge` 的圆点模式吞掉 `className` **不会报错**，消费方会一直以为样式生效了。B 类死 prop 同理：`combobox` 的 `errorMessage` 传进去会变成非法 DOM 属性 `<button errorMessage="...">`，不报错但功能完全无效。

3. **为什么 A-3（table 类型）必须修**：这不只是"内部冗余" —— 包根 `AdvancedTableProps` 导出的是 `types/components.ts` 那份**死代码版本**（字段结构与组件实际签名完全不同），消费方按导出类型写 props 会得到类型层面就错误的反馈。这是**对外 API 契约级别**的缺陷。

4. **否决方案 D（只写文档）**：`tag` 的 `asChild` 崩溃、`table` 的 `config.enabled` 关不掉插件、`sidebar` 的描边失效 —— 这三个**无法靠文档规避**。文档再详细，消费方一用就炸。

5. **为什么 `typography` 选"删除死文件"而非"合并两个入口"**：`index.tsx` L7-L14 已明确注释说明「只导出聚合对象 `Typography` 与 `Static`」是**刻意设计**（裸组件名 `Table` / `Separator` / `ListItem` 与 `src/ui/table`、`src/ui/separator`、`src/ui/edit` 同名，平铺导出会触发 TS2308 冲突）。所以 `index.ts` 是残留死文件，删除是唯一正解 —— 反向把 `index.tsx` 改成平铺导出会**破坏** barrel 编译。

### 批次二的补充决策

| 项                                                         | 决策                                                     | 理由                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button.shape`                                             | **实现**（而非删除 prop）                                | ① `shape` 已在 `ButtonProps` 中**公开**，属于对外 API 契约 —— 删除属破坏性变更；② 同库 `Avatar` / `IconButton` 的 `shape` 语义已是 `circle` / `square`，实现可保持全库一致；③ 「不传时保持 `rounded-md`」确保常规文字按钮外观不变 —— 零回归；④ 顺带消除 `shape` 泄漏为非法 DOM 属性 `<button shape="square">` |
| `combobox.errorMessage`                                    | **实现**（渲染错误文案）                                 | ① prop 已公开且语义明确；② 组件内已有 `<p className="text-destructive">` 的错误文案位置，只是渲染了 boolean 导致**恒为空**；③ 修复后 `error`（boolean）继续只管边框高亮，`errorMessage`（string）管文案 —— 职责清晰                                                                                           |
| `combobox.className`                                       | **作用于外层容器**                                       | 组件有两层可加样式：外层 wrapper 与内层 trigger。已有 `triggerClassName` 专管 trigger，故 `className` 归给外层 —— 两者互补不重叠，且符合 spec 的「`className` 末位优先」约定                                                                                                                                  |
| `InputDateRange` 的 `format`                               | **`format` 为唯一真值源**，`mode` 只决定未传时的默认格式 | ① 单选版 `InputDate` 所有模式一律走 `format`，双选版应一致；② `mode` 的语义是「选择精度」而非「输出格式」；③ 这样 `format` 不再是死参数，且默认行为（不传 `format`）与修复前**完全一致** —— 零回归                                                                                                            |
| `ViewSelectorHeader` 的 `showTimeView` / `showQuarterView` | **实现标题导航约束**                                     | ① 两个 prop 已被 `enhanced-date-picker.tsx` 传入，只是头部**从未消费**；② 修复后「月 → 季度」不再跳过季度、「年 → 时间」可达 —— 与 `renderViewModeButtons` 的视图集合保持一致；③ 未传时行为与修复前**完全一致** —— 零回归                                                                                     |

> 📌 **批次二的共同原则**：所有修复都保证「**未传该 prop 时的行为与修复前完全一致**」，
> 即只把「无效参数」变成「有效参数」，不改变任何既有默认行为 —— 这是「保证业务正确执行」的落地方式。

### 批次三的补充决策

| 项                                   | 决策                                                    | 理由                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file` 的 `httpClient` 未注入        | **标记 `error`，不假成功**                              | ① `httpClient` 是**消费方注入的外部依赖**，不是组件库能兜底的东西；② 原实现 `httpClient?.uploadFile?.(...)` 用可选链短路后，`success` 仍**恒为 `true`** —— 文件被标记 `success` 但 `url` 是 `undefined`，属典型「假成功」；③ 修复后 `uploadFile` 返回 `success: false` + 明确文案，调用方走既有失败分支把文件标记 `error`；④ 不实现上传后端（约束 1）                                               |
| `date` 的 `disabledDate` 月 / 年粒度 | **尾部清零**（月→1 日 00:00:00，年→1 月 1 日 00:00:00） | ① 原实现直接传 `viewDate.month(month)`，**保留了 `viewDate` 的日 / 时分秒**；② 消费方常见写法 `d.month() === 0`（只允许 1 月）在 `viewDate` 为 3 月 20 日时，判定 1 月实际传入 `1 月 20 日` —— 语义错位导致误禁用；③ 「尾部清零」把月归一到 `1 月 1 日 00:00:00`，**月 / 年判定与粒度天然对齐**；④ 判定粒度统一由 `truncateToGranularity` 承载，月 / 年 / 季度三处不再各写一套                      |
| `AdvancedTableProps` 字段结构变化    | **记录为破坏性变更**，本轮不做版本 bump                 | ① 批次一统一类型时，删除的是 `src/ui/table/types/components.ts` 的**死代码版本**（其字段 `plugins` / `searchPanel` 与组件实际签名 `plugin` / `search` 完全不同）；② 但**包根导出的正是那份死代码版本** —— 改了就等于改对外契约；③ 按 AGENTS.md 第 2 条须走「ADR + CHANGELOG + 版本 bump」，用户明确指示「破坏性变更先记录 adr」，故本轮只落 ADR 记录，版本 bump 与 CHANGELOG 待批次三收尾时统一执行 |

> 📌 **批次三的共同原则**：涉及**对外契约**的变更（`AdvancedTableProps` 字段结构）
> MUST 先落 ADR 记录再改代码；涉及**行为语义**的变更（粒度归零 / 失败标记）
> MUST 有对应的 Vitest 回归测试锁死行为。

---

## 具体动作 (Actions)

### 批次一（本决策范围）

> ✅ **2026-11-04 已全部完成** —— 回归测试 34/34 通过；全库 122 文件 / 1979 用例全绿；
> `type-check` / `lint` / `check:i18n` / `build` 均通过。
> 诊断记录：[`.easbot/knowledge/docs/dev/fix-src-ui-defects/diagnose.md`](../../.easbot/knowledge/docs/dev/fix-src-ui-defects/diagnose.md)

- [x] 修改 `src/ui/index.ts`：补 `export * from './resizable';`（按字母序插在 `radio-group` 与 `scroll-area` 之间）
- [x] 删除 `src/ui/typography/index.ts`：保留 `index.tsx` 为唯一入口（消除双入口隐患）
- [x] 修改 `src/ui/tag/tag.tsx` L52-L75：`asChild` 分支把 3 个 children 包装为**单个** `<span>`，使 Radix `Slot` 满足单子元素约束
- [x] 修改 `src/ui/table/index.ts` L30 与 L48：统一导出**组件实际使用**的 `AdvancedTableProps`（`organisms/`）与 `TablePaginationProps`（`atoms/`）；删除 `src/ui/table/types/components.ts` 中的重复定义
- [x] 修改 `src/design-system/components/ui/sidebar.tsx` L423：`hsl(var(--sidebar-border))` → `var(--sidebar-border)`；hover 分支 `hsl(var(--sidebar-accent))` → `var(--sidebar-accent)` 同步修
- [x] 修改 `src/ui/badge/badge.tsx` L110-L129（dot 分支）：补 `className` 合并 + `{...props}` 透传 + `ref` 挂载
- [x] 新增 `src/ui/tag/__tests__/tag.test.tsx`：`asChild` 路径回归测试（修复前抛错 → 修复后通过）
- [x] 新增 `src/ui/badge/__tests__/badge.test.tsx`：dot 模式断言 className / 原生属性 / ref
- [x] 新增 `src/ui/resizable/__tests__/resizable.test.tsx`：包根导出面 + 组件渲染
- [x] 新增 `src/ui/table/__tests__/table-export-surface.test.tsx`：类型导出回归测试（编译期同源断言）
- [x] 新增 `src/ui/sidebar/__tests__/sidebar-menu-button.test.tsx`：outline 变体描边类名断言
- [x] 更新 `docs/components/navigation/resizable.md`：移除"未从包根导出"的标注
- [x] 更新 `docs/components/table/table.md` L243 / L514：修正类型导出的记述（当前与代码实际相反）
- [x] 更新 `spec/component-standard.md`：新增维度⑫「组件目录必须有**唯一** barrel 入口」
- [x] 更新 `spec/storybook-standard.md`：新增 §2.5「Trigger / Close 类组件与 `asChild`」+ 维度⑪
- [x] 顺带修复 `src/ui/context-menu/__tests__/context-menu.stories.tsx`：4 处 `ContextMenuTrigger` 补 `asChild` + 硬编码灰阶改主题令牌

### 批次二 / 批次三（后续任务，不在本决策范围）

- [x] 批次二-1：`table` 的 `config.enable` → `enabled`（拼写修正）—— **同时修 `togglePlugin` 写入端**，
      否则「注册判定读 `enabled`、写入写 `enable`」仍是两套语义
- [x] 批次二-2：`combobox` 的 `errorMessage`（死 prop → 渲染错误文案）+ `className`（作用于外层容器）
- [x] 批次二-3：`button` 的 `shape`（死 prop → 实现 `circle` / `square`）
- [x] 批次二-4：`date` 的 `InputDateRange` month/year 模式忽略 `format` → `format` 成为唯一真值源
- [x] 批次二-5：`date` 的 `ViewSelectorHeader` 未消费 `showTimeView` / `showQuarterView` → 实现标题导航约束
- [ ] 批次三：`table` 的 `useTablePlugin` 占位钩子 + `onSelectionChange` 无消费方 + `MoveRowPlugin` 默认注释；
      `file` 的裁剪弹窗不可打开 + `UploadConfig` 4 字段未使用；
      `icon` 的 radix 图标缺 `aria-hidden`；`date` 的 `InputTime`/`InputDate` 失焦不一致；
      `date` 的 `InputTime` 失焦清空 vs `InputDate` 失焦保留

### 批次三（部分完成）

> ✅ **2026-11-04 已完成**：`file` 的 `httpClient` 假成功、`date` 的 `disabledDate` 月 / 年粒度。
> 回归测试：新增 17 个用例（`InputFile.test.tsx` 9 个 + `view-granularity.test.tsx` 8 个）全通过。

- [x] `src/ui/file/utils.ts`：`uploadFile` 在 `httpClient.uploadFile` 缺失时返回 `success: false` +
      `httpClientMissing` 文案（**不再假成功**）；新增文案键 `fileMessages.httpClientMissing`（zh-CN + en-US）
- [x] `src/ui/file/InputFile.tsx`：修复 `value` 默认值内联 `[]` 导致的**无限渲染循环** ——
      改为模块级 `EMPTY_FILES` 常量 + `onChange` 通过 effect 统一回抛（不在 setState 更新函数内做副作用）
- [x] `src/ui/date/view/granularity.ts`：新增 `truncateToGranularity`（月→1 日 00:00:00 / 年→1 月 1 日 00:00:00 /
      季度→首月 1 日 00:00:00 / 日→当天 00:00:00）
- [x] `src/ui/date/view/month-view.tsx`：`MonthView` / `MonthRangeView` 的 `isMonthDisabled` 改用归一化日期
- [x] `src/ui/date/view/year-view.tsx`：`YearView` / `YearRangeView` 的 `isYearDisabled` 改用归一化日期
      （并把 `dayjs().year(year)` 改为 `viewDate.year(year)`，与视图年份一致）
- [x] `src/ui/date/view/quarter-view.tsx`：`QuarterView` / `QuarterRangeView` 同步归一化
- [x] 新增 `src/ui/file/__tests__/InputFile.test.tsx`：9 个用例（未注入 → error / 注入 → success / 工具函数 / 无限渲染回归）
- [x] 新增 `src/ui/date/__tests__/view-granularity.test.tsx`：8 个用例（工具函数 4 个 + 月视图 2 个 + 年视图 2 个）
- [x] 本 ADR 新增「破坏性变更记录 (Breaking Changes)」章节：BC-1 `AdvancedTableProps` 字段结构 + BC-2 `disabledDate` 粒度语义
- [ ] `file` 的 `UploadConfig` 4 个未使用字段（`method` / `headers` / `withCredentials` / `timeout`）—— 待决策：实现还是删除
- [ ] `file` 的裁剪弹窗（`cropPending` 占位）
- [ ] `table` 的 `useTablePlugin` 占位钩子 + `onSelectionChange` 无消费方 + `MoveRowPlugin` 默认注释
- [ ] `icon` 的 radix 图标缺 `aria-hidden`；`date` 的 `InputTime`/`InputDate` 失焦不一致
- [ ] 批次三的 CHANGELOG 与版本 bump（BC-1 属破坏性变更，须走完整三件套）

---

## 破坏性变更记录 (Breaking Changes)

> 📌 本节登记本次修复涉及的**对外契约破坏性变更**。
> 按 AGENTS.md 第 2 条，这些变更 MUST 走「ADR 记录 + CHANGELOG + 版本 bump」三件套。
> **当前状态**：已落 ADR 记录（本文档）；CHANGELOG 与版本 bump **⏳ 待批次三收尾时统一执行**。

### BC-1：`AdvancedTableProps` 字段结构变化

| 项           | 内容                                         |
| ------------ | -------------------------------------------- |
| **变更类型** | ❌ 破坏性变更（Breaking Change）             |
| **影响组件** | `table`（`AdvancedTable`）                   |
| **影响面**   | 包根导出的 `AdvancedTableProps` **类型字段** |
| **生效版本** | ⏳ 待定（版本 bump 时填写）                  |
| **迁移成本** | 低 —— 仅字段名变化，结构层级不变             |

#### 变更前后对照

| 变更前（`src/ui/table/types/components.ts` 死代码版本） | 变更后（组件实际使用版本）     |
| ------------------------------------------------------- | ------------------------------ |
| `plugins?: PluginConfig`                                | `plugin?: PluginConfig`        |
| `searchPanel?: SearchConfig`                            | `search?: SearchConfig`        |
| `toolbar?: ToolbarConfig`                               | `toolbar?: ToolbarConfig`      |
| `config?: AdvancedTableConfig`                          | `config?: AdvancedTableConfig` |
| `scroll?: ScrollConfig`                                 | `scroll?: ScrollConfig`        |

> 📌 **层级不变**：只是 `plugins` → `plugin`、`searchPanel` → `search` 两个**字段名**的修正，
> 其嵌套结构（`PluginConfig` / `SearchConfig` / …）保持一致。

#### 根因

`src/ui/table/types/components.ts` 与 `src/ui/table/organisms/` 各自定义了一份 `AdvancedTableProps`。
**包根 `src/ui/table/index.ts` 导出的是前者（死代码版本）**，而 `AdvancedTable` 组件**实际使用的是后者**。
结果：消费方按包根类型写 props，拿到的是与运行时**完全不同**的字段结构 —— 组件静默忽略所有配置。

批次一删除了死代码版本，让包根类型与组件实际签名**同源**。这一步**必然**改变包根导出的类型形状，
因此构成破坏性变更。

#### 迁移指引

```diff
- <AdvancedTable
-   plugins={{ columnSort: { enabled: true } }}
-   searchPanel={{ enabled: true }}
- />
+ <AdvancedTable
+   plugin={{ columnSort: { enabled: true } }}
+   search={{ enabled: true }}
+ />
```

> ⚠️ **插件开关的双层 `enabled` 语义**（批次二已修正）：
> 顶层 `plugin.enabled` 控制**插件系统整体**开关；
> 单个插件开关是 `plugin.config[<插件 id>].enabled`。
> 两者**同名不同层**，不可混用。

### BC-2：`date` 视图的 `disabledDate` 月 / 年粒度判定语义

| 项           | 内容                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| **变更类型** | ⚠️ 行为语义变更（消费方若依赖旧的「按月首日」判定需复核）                                                    |
| **影响组件** | `date`（`MonthView` / `MonthRangeView` / `YearView` / `YearRangeView` / `QuarterView` / `QuarterRangeView`） |
| **影响面**   | 传给消费方 `disabledDate` / `isValidDate` 回调的**日期值**                                                   |
| **生效版本** | ⏳ 待定（版本 bump 时填写）                                                                                  |
| **迁移成本** | 低 —— 对「按粒度判定」的写法（`d.month() === 0`）**无影响**；仅「按具体日期判定」的写法需复核                |

#### 变更前后对照

| 粒度 | 变更前传入的日期           | 变更后传入的日期     |
| ---- | -------------------------- | -------------------- |
| 月   | `viewDate` 的日 + 时分秒   | `1 日 00:00:00`      |
| 年   | `dayjs()` 当天的月日时分秒 | `1 月 1 日 00:00:00` |
| 季度 | `viewDate` 的日 + 时分秒   | `首月 1 日 00:00:00` |

#### 根因

原实现直接传 `viewDate.month(month)` —— dayjs 的 `month()` **保留原 `viewDate` 的 day 与 time**，
导致回调收到的日期带上无关的日 / 时分秒。消费方的粒度判定表达式（`d.date() === 1`、`d.month() === 0`）
因此无法正确匹配，产生**误禁用**。

#### 迁移指引

- ✅ **无需改动**（推荐写法，按粒度判定）：
  ```tsx
  <DatePicker disabledDate={(d) => d.month() === 0} />       // 只允许 1 月
  <DatePicker disabledDate={(d) => d.year() === 2024} />      // 只允许 2024 年
  ```
- ⚠️ **需复核**（依赖具体日期判定的写法）：
  ```tsx
  // 修复前收到的是「1 月 20 日」，修复后是「1 月 1 日」
  <DatePicker disabledDate={(d) => d.date() === 20} />
  ```
  若消费方确实想「每月 20 日不可选」，应改用**日视图**（`DayView` 粒度本就是 start-of-day），
  或在回调内自行按月判断。

---

## 影响 (Impact)

### ✅ 正面影响

- `tag` 的 `asChild` 从「运行时抛错」变为「正常工作」—— 该路径此前**零测试覆盖**，是最隐蔽的崩溃点。
- `resizable` 从「不可从包根 import」变为「可用」—— 文档不再需要标注"未导出"这个尴尬状态。
- `table` 的类型导出让包根类型与组件实际签名**同源**—— 消除消费方类型层面的错误反馈。
- `sidebar` 的 outline 变体描边从「被浏览器丢弃」变为「生效」。
- `badge` 圆点模式恢复 `className` / 原生属性 / `ref` 支持。

### ⚠️ 风险

- **`table` 类型统一是破坏性变更** —— 包根 `AdvancedTableProps` 的字段结构会变（从 `types/components.ts` 版切到 `organisms/` 版）。已有消费方若依赖旧字段需同步迁移。这正是 AGENTS.md 第 2 条要求版本 bump + CHANGELOG 的原因。
- **删除 `src/ui/typography/index.ts`** —— 若有消费方深路径 import（`@easbot/ui/dist/typography` 之类）会失效。已核查库内无深路径引用，但**外部消费方无法在本库内验证**。
- **barrel 新增 `resizable` 导出** —— 需实测无 TS2308 同名冲突（`ResizablePanel` / `ResizablePanelGroup` / `ResizableHandle` 与 design-system 层无同名）。

### ❌ 副作用 / 取舍

- **批次二/三留到后续** —— 意味着当前文档重写仍会基于未修完的源码。这是有意的取舍：宁可文档慢一点，也不把"未完成功能"写成契约。
- **不修 `MoveRowPlugin`** —— 它用原生 `prompt()` 做交互，即使开启体验也差。批次三需先做产品决策。
- **不实现 `file` 裁剪** —— 需要第三方裁剪库或自研，超出"修 bug"范围。

---

## 不适用范围 (Out of Scope)

- ❌ **不实现 `file` 的裁剪功能** —— 需引入裁剪库 / 自研画布，超出诊断范围（批次三仅做契约澄清或标记未开放）。
- ❌ **不实现 `table` 的插件 transform 钩子** —— 涉及插件生命周期的语义设计（批次三）。
- ❌ **不改 `src/design-system/` 的组件 API** —— 本次仅修 `sidebar.tsx` 的一处 CSS 语法错误，不动 DS 层组件契约。
- ❌ **不重构 `src/ui` 与 `src/design-system` 的重复** —— 这是架构级议题，需独立 ADR。
- ❌ **不新增第三方依赖** —— 约束 4。

---

## 验收清单 (Acceptance Criteria)

### 批次一 + 批次二 + 批次三-部分（✅ 已达成）

- [x] 所有「批次一」动作清单已完成
- [x] **每个修复都有对应的 Vitest 回归测试**，且**已验证「修复前失败 / 修复后通过」**
      —— 批次一：修复前 16 个失败 → 修复后 34/34；批次二：新增 26 个全通过；
      批次三（部分）：新增 17 个全通过（`file` 9 + `date` 8）
- [x] `pnpm test` 全绿 —— **123 文件 / 2005 用例**（基线 118 / 1946）
- [x] `pnpm type-check` 0 error
- [x] `pnpm lint` 0 error（既有 1 条 `useTablePlugin.ts` warning 属批次三范围）
      → [x] `pnpm check:i18n` 0 违规
- [x] `pnpm build` 成功 —— `dist/index.d.ts` 中 `AdvancedTableProps` 字段确为 `plugin`/`toolbar`/`search`/`config`（死代码版已消失），`ResizablePanelGroup` / `TablePaginationProps` 已在包根导出
- [x] **破坏性变更已记录 ADR**（本决策「破坏性变更记录 (Breaking Changes)」章节：BC-1 + BC-2）
- [ ] 批次一 / 批次二 / 批次三的变更已写入 `CHANGELOG.md` 并完成版本 bump —— **⏳ 待执行**
      （`AdvancedTableProps` 字段结构变化属破坏性变更，按 AGENTS.md 第 2 条须走完整三件套）
- [x] 相关 `docs/` 与 `spec/` 已同步更新
- [ ] Review 通过 —— **⏳ 待老侯 Review**

### 全局（批次三完成后）

- [ ] `npm pack --dry-run` 产物不含 `src/` `tests/`
- [ ] 批次三的诊断与修复出一份 `diagnose.md` 补充章节

---

## 后续任务 (Follow-up)

| 任务                                                                                                    | 负责模块      | 优先级 | 状态      |
| ------------------------------------------------------------------------------------------------------- | ------------- | ------ | --------- |
| 批次二：死 prop 清理（`button.shape` / `combobox` / `table.config.enabled` / `date.format`）            | `src/ui`      | 🔴 高  | 📋 待启动 |
| 批次三：占位实现与假成功（`table` 插件 / `file` 上传 / `icon` aria / `date` 失焦 / `select` / `label`） | `src/ui`      | 🟡 中  | 📋 待启动 |
| `file` 裁剪功能的产品决策（是否引入裁剪库）                                                             | `src/ui/file` | 🟢 低  | 📋 待启动 |
| `src/ui` 与 `src/design-system` 的重复组件收敛                                                          | 架构          | 🟢 低  | 📋 待启动 |

---

## 关联 (References)

- **发现来源**：[`.easbot/knowledge/tasks/docs-rewrite-src-ui/findings.md`](../../.easbot/knowledge/tasks/docs-rewrite-src-ui/findings.md) §R10（17 项源码级缺陷清单）
- **诊断记录**：[`.easbot/knowledge/docs/dev/fix-src-ui-defects/diagnose.md`](../../.easbot/knowledge/docs/dev/fix-src-ui-defects/diagnose.md)
- **相关 spec**：[`spec/component-standard.md`](../../spec/component-standard.md)、[`spec/css-standard.md`](../../spec/css-standard.md)、[`spec/testing-guidelines.md`](../../spec/testing-guidelines.md)
- **相关代码**：[`src/ui/index.ts`](../../src/ui/index.ts)、[`src/ui/tag/tag.tsx`](../../src/ui/tag/tag.tsx)、[`src/ui/badge/badge.tsx`](../../src/ui/badge/badge.tsx)、[`src/ui/table/index.ts`](../../src/ui/table/index.ts)、[`src/ui/typography/index.tsx`](../../src/ui/typography/index.tsx)、[`src/design-system/components/ui/sidebar.tsx`](../../src/design-system/components/ui/sidebar.tsx)
- **项目宪法**：[`AGENTS.md`](../../../AGENTS.md) 第 2 / 8 / 10 条
- **诊断方法**：[`eas-dev-diagnose` 技能](https://c:\Users\houjian.trae\skills\eas-dev-diagnose)（4 阶段：复现 → 定位 → 修复 → 回归）

---

## 修订记录 (Revision History)

| 版本  | 日期       | 修订内容                                                                                                                                        | 修订人 |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1.0.0 | 2026-11-04 | 初版：锁定批次一（崩溃 + API 错位 + 样式失效 + badge 属性丢失），批次二/三列为后续任务                                                          | 小莫   |
| 1.1.0 | 2026-11-04 | 批次二补充决策（5 项）；批次三补充决策（3 项）；新增「破坏性变更记录」章节（BC-1 `AdvancedTableProps` 字段结构 / BC-2 `disabledDate` 粒度语义） | 小莫   |

---

**最后更新**：2026-11-04
