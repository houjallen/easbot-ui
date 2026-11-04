# 决策文档模板使用指南 (Decision Document Template Guide)

> **本指南是 `docs/decisions/` 目录下所有决策文档的统一规范。**
> 借鉴 `eas-planning-writer` 技能的「HTML 注释引导 + 速查卡片」哲学，确保每篇决策都"简洁高效、明确无歧义、可执行落地"。

---

## 一、决策的两大类型 (Two Decision Types)

按 **影响范围 + Review 必要性**，把决策分成两类，对应两套模板：

| 维度              | **架构/原则型** (Architecture)                                       | **执行型** (Execution)                                         |
| ----------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| **影响范围**      | 跨模块、影响 API/数据流                                              | 当前模块、阶段收尾、心跳                                       |
| **Review 必要性** | 必须 Review 才能稳定生效                                             | 可临时生效，事后 Review                                        |
| **典型案例**      | 0014 单一实现原则、0034 文档三层化、0037 Tool 输出规范               | 0021 心跳等待超时转换、0028 心跳暂停评估、0031 biome 实态      |
| **使用模板**      | [`templates/00NN-architecture.md`](./templates/00NN-architecture.md) | [`templates/00NN-execution.md`](./templates/00NN-execution.md) |
| **文件位置**      | `docs/decisions/00NN-xxx.md`                                         | `docs/decisions/00NN-xxx.md`（同名目录）                       |

**判定速查**：

- ✅ 影响 ≥ 2 个模块 / 引入新依赖 / 改变 API / 改变数据流 → **架构型**
- ✅ 影响当前心跳 / 阶段收尾 / 单模块修复 → **执行型**
- ⚠️ 不确定时，默认按 **架构型** 处理（事后可降级）

---

## 二、共用规范 (Shared Conventions)

两类模板共用以下规范，确保决策文档可索引、可检索、可追溯。

### 2.1 文件命名 (Naming)

```
00NN-{kebab-case-topic}.md
```

- `00NN`：4 位编号，**单调递增**（与现有 0001-0040 连续）
- `{topic}`：kebab-case 英文短语（10-50 字符）
- 不带版本号（同一决策修订直接在文件内追加"修订记录"，不另起文件）

**示例**：

- ✅ `0041-multi-agent-worktree.md`
- ❌ `41-xxx.md`（编号未补零）
- ❌ `0041-MultiAgentWorktree.md`（驼峰）
- ❌ `0041-multi-agent-worktree-v2.md`（修订不另起文件）

### 2.2 Frontmatter (统一索引)

所有决策 MUST 在文件头加 YAML frontmatter，用于索引/搜索/过滤：

```yaml
---
name: 00NN-{topic} # MUST：与文件名一致（不含扩展名）
description: '00NN: 一句话标题 —— 关键决策（不超过 200 字）' # MUST
category: architecture | execution # MUST：决策类型
author: <name> # MUST：决策起草人
version: 1.0.0 # MUST：首次为 1.0.0，修订递增
date: 'YYYY-MM-DD' # MUST：决策日期
keywords: # MAY：用于搜索
  - '00NN'
  - <tag1>
  - <tag2>
supersedes: 00NN-xxx # MAY：被本决策取代的旧决策
status: proposed | temporary | confirmed | deprecated # MUST：与文档内状态一致
---
```

**status 取值**（与正文"状态"字段一致）：

| 值           | 含义                        |
| ------------ | --------------------------- |
| `proposed`   | 草拟中，未生效              |
| `temporary`  | 临时生效，待 Review         |
| `confirmed`  | ✅ 已 Review 通过，稳定生效 |
| `deprecated` | ❌ 已废弃（保留可访问）     |

### 2.3 标题与元数据 (Title & Header)

```markdown
# 00NN: 决策标题（中文）
```

**文档开头 MUST 放元数据块**（用 blockquote，紧跟标题）：

```markdown
> **决策日期**：YYYY-MM-DD
> **决策人**：<决策人姓名>（自主推进，待 Review）
> **状态**：📋 草拟 / 🟡 临时生效 / ✅ 已通过 / ❌ 已废弃
> **类型**：架构型 / 执行型
> **影响范围**：[简列涉及模块/包/目录]
> **相关 spec**：[若有规范文档]
> **关联决策**：[相关编号，逗号分隔]
```

### 2.4 可执行落地 (Actionable Landing)

**铁律**：每篇决策 MUST 在「具体动作」或「后续任务」章节给出**可勾选的执行清单**，否则不算完成。

✅ **正确**：

```markdown
## 具体动作 (Actions)

- [ ] 修改 `packages/agent/src/cli/session.ts` L89：`--format` → `--json`
- [ ] 新增 `packages/agent/src/__tests__/session.test.ts`
- [ ] 更新 `docs/cli-output-spec.md` 表格
```

❌ **错误**：

```markdown
## 后续

- 把 `--format` 改掉
- 补一下测试
```

### 2.5 与 `eas-planning-writer` 的关系

```
.easbot/knowledge/tasks/{task-name}/      ← L2 任务笔记（临时，进度级）
├── task_plan.md    （当前阶段、决策记录）
├── findings.md     （研究、问题）
└── progress.md     （会话日志、测试结果）

docs/decisions/00NN-xxx.md   ← L1 决策日志（永久，跨 session）
└── references/templates/  （本目录）
```

**沉淀时机**（必读）：

- 任务笔记中**跨 session 才会复用**的判断 → 沉淀为决策日志
- **影响其他模块**的设计决策 → 沉淀
- 需要 **Review** 的判断 → 沉淀
- ❌ **不沉淀**：纯局部代码修复、临时变量命名、单文件内的实现细节

---

## 三、模板结构详解 (Template Anatomy)

### 3.1 架构型决策（11 章节）

完整结构见 [`templates/00NN-architecture.md`](./templates/00NN-architecture.md)。每章作用如下：

| #   | 章节                               | 作用                              | 必填   |
| --- | ---------------------------------- | --------------------------------- | ------ |
| 1   | **背景 (Context)**                 | 为什么要决策，痛点是什么          | ✅     |
| 2   | **约束 (Constraints)**             | 决策受哪些事实/资源/规范约束      | ✅     |
| 3   | **备选方案 (Alternatives)**        | 列出 ≥ 2 个候选，优缺点并列       | ✅     |
| 4   | **决策 (Decision)**                | 选了什么，**用一句话 + 表格明确** | ✅     |
| 5   | **依据 (Rationale)**               | 为什么选这个，与备选对比          | ✅     |
| 6   | **具体动作 (Actions)**             | 可勾选清单，必须落地到文件路径    | ✅     |
| 7   | **影响 (Impact)**                  | 正面 ✅ / 风险 ⚠️ / 副作用 ❌     | ✅     |
| 8   | **不适用范围 (Out of Scope)**      | 明确不做什么，避免误解            | SHOULD |
| 9   | **验收清单 (Acceptance Criteria)** | 如何验证决策已落地                | ✅     |
| 10  | **后续任务 (Follow-up)**           | 依赖此决策的下游任务              | SHOULD |
| 11  | **关联 (References)**              | 关联决策、相关 spec、参考实现     | ✅     |

### 3.2 执行型决策（8 章节，可精简）

完整结构见 [`templates/00NN-execution.md`](./templates/00NN-execution.md)。**章节更少、不强制备选方案**：

| #   | 章节                             | 作用                               | 必填   |
| --- | -------------------------------- | ---------------------------------- | ------ |
| 1   | **背景 (Context)**               | 触发条件、前置决策                 | ✅     |
| 2   | **触发条件检查 (Trigger Check)** | 用表格量化触发条件是否满足         | ✅     |
| 3   | **决策 (Decision)**              | 选了什么，**用「选项 A/B/C」格式** | ✅     |
| 4   | **依据 (Rationale)**             | 为什么选 A 不选 B/C                | ✅     |
| 5   | **实施 (Implementation)**        | 已执行的命令、产出物               | ✅     |
| 6   | **健康指标 (Health Metrics)**    | 验证基线（如 biome/tsc/test 数据） | SHOULD |
| 7   | **反思 (Reflection)**            | 这次执行学到了什么                 | SHOULD |
| 8   | **待决策 (Pending for Review)**  | 老侯下次该决策什么                 | ✅     |

---

## 四、修订与废弃 (Revision & Deprecation)

### 4.1 修订 (Revision)

**不另起文件**，在原文件追加"修订记录"章节，递增 `version`：

```markdown
## 修订记录 (Revision History)

| 版本  | 日期       | 修订内容                    | 修订人 |
| ----- | ---------- | --------------------------- | ------ |
| 1.0.0 | 2026-07-15 | 初版                        | XiaoMo |
| 1.1.0 | 2026-07-25 | 补充「session info --json」 | XiaoMo |
```

### 4.2 取代 (Supersedes)

新决策取代旧决策时：

- 新决策 frontmatter 加 `supersedes: 00NN-old-topic`
- **不删除旧决策文件**，仅在旧决策 frontmatter 改 `status: deprecated`
- 旧决策正文加一行：`> ⚠️ 本决策已被 [00NN-new-topic](00NN-new-topic.md) 取代`

### 4.3 废弃 (Deprecate)

仅在以下情况废弃：

- 决策与项目方向根本冲突（极少见）
- 决策前提已不存在（如某依赖被移除）

废弃流程：

1. 改 frontmatter `status: deprecated`
2. 正文加废弃原因
3. 在 [README.md](../../README.md) 决策索引表中标记 ❌
4. **不删除文件**

---

## 五、反模式 (Anti-Patterns)

| ❌ 不要                       | ✅ 应该                        |
| ----------------------------- | ------------------------------ |
| 决策无 frontmatter            | 必加 YAML frontmatter          |
| 决策无编号或编号跳号          | 严格 00NN 单调递增             |
| 备选方案只列 1 个             | 至少 2 个并列对比              |
| 决策无"具体动作"清单          | 每条决策 MUST 落到文件路径     |
| 决策无"影响"章节              | 必含正面/风险/副作用           |
| 自由散文式"依据"              | 用表格 / 一句话 + 理由         |
| 修订另起 v2 文件              | 在原文件追加"修订记录"         |
| 临时生效决策无"待 Review"清单 | MUST 列出待 Review 事项        |
| 执行型决策堆 1000+ 行         | 拆出"详细记录"到 `findings.md` |

---

## 六、速查卡片 (Cheat Sheet)

```
决策文档速查：

0. 先选类型：架构型（11 章）vs 执行型（8 章）
1. 文件名：00NN-{kebab-case}.md（编号单调递增）
2. 必加 frontmatter：name/description/category/author/version/date/status
3. 标题：# 00NN: 决策标题（中文）
4. 元数据块：日期/决策人/状态/类型/影响范围/相关 spec/关联决策
5. 架构型 11 章节：背景 → 约束 → 备选 → 决策 → 依据 → 动作 → 影响 → 不适用 → 验收 → 后续 → 关联
6. 执行型 8 章节：背景 → 触发检查 → 决策 → 依据 → 实施 → 健康指标 → 反思 → 待决策
7. [MUST] 每条决策 MUST 含可勾选动作清单（具体到文件路径）
8. [MUST-NOT] 不另起 v2 文件；修订追加"修订记录"
9. [MUST-NOT] 不删除旧决策；supersede 时仅改 status
10. 模板文件见 ./00NN-architecture.md 与 ./00NN-execution.md
```

---

**版本**：1.0.0 · 与 `docs/decisions/` 全量决策配套使用
