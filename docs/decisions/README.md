# 决策日志：EASBot 关键决策记录

> 本目录记录 EASBot 关键决策（ADR, Architecture Decision Record），便于事后 Review 与跨模块追溯。
>
> **决策原则**：
>
> - 自主推进，写入决策日志
> - 影响跨模块 / API / 数据流的决策 → 走 [架构型模板](references/templates/00NN-architecture.md)
> - 心跳动作 / 阶段收尾 / 单模块修复 → 走 [执行型模板](references/templates/00NN-execution.md)

## 模板与规范

- 📘 **使用指南**：[`references/decision-template-guide.md`](references/decision-template-guide.md) —— 模板选择、共用规范、反模式
- 🏛️ **架构型模板**：[`references/templates/00NN-architecture.md`](references/templates/00NN-architecture.md) —— 11 章节完整结构
- ⚡ **执行型模板**：[`references/templates/00NN-execution.md`](references/templates/00NN-execution.md) —— 8 章节精简结构

## ⚠️ 编号冲突登记（引用时 MUST 带完整文件名）

> 本目录当前**无编号冲突**（仅 `0001` 一篇）。若后续迁入历史 ADR 出现同号双文件，
> 引用时 MUST 写完整文件名，不可只写编号，并在下表登记：

| 冲突编号 | 文件 A | 文件 B |
| -------- | ------ | ------ |
| （暂无） | —      | —      |

**处置决策**（2026-10-19）：**不重编号**（会破坏 git 历史追溯），改为在本表标注 + 所有 spec 的 `adrs` 字段改带文件名。新增 ADR 时 MUST 先 `Glob docs/decisions/00NN-*.md` 确认编号未占用。

## 决策索引

| 编号 | 日期       | 类型   | 主题                                       | 状态        | 文件                                                                   |
| ---- | ---------- | ------ | ------------------------------------------ | ----------- | ---------------------------------------------------------------------- |
| 0001 | 2026-11-04 | 架构型 | 修复 `src/ui` 公开组件层的 17 项源码级缺陷 | 🟡 临时生效 | [0001-src-ui-defect-remediation.md](0001-src-ui-defect-remediation.md) |

---

## 状态图例

- ✅ **已确认 / 已通过**：老侯 Review 通过，稳定生效
- 🟡 **临时生效**：心跳自主推进生效中，待 Review
- ⏸️ **已执行**：已执行但状态待确认（如暂停评估）
- 📋 **草拟**：未生效，等待启动
- 🚧 **待定**：未起草
- ❌ **已废弃**：被新决策取代（保留可访问）

---

## 决策沉淀流程（来自 `eas-planning-writer`）

```
.easbot/knowledge/tasks/{task-name}/     ← L2 临时任务笔记
└── progress.md / findings.md               （会话级、阶段级记录）
                    ↓ 沉淀
docs/decisions/00NN-xxx.md                ← L1 永久决策日志
                                            （跨 session、跨模块、需 Review）
```

**沉淀判定**：

- ✅ 跨 session 才会复用 → 沉淀
- ✅ 影响其他模块 → 沉淀
- ✅ 需要 Review → 沉淀
- ❌ 纯局部修复 / 临时变量 → 不沉淀
