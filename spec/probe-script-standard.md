---
name: probe-script-standard
description: 该规范定义 easbot-ui 规范探针脚本（spec/scripts/）的编写与维护标准，含目录契约（probe.ts 单入口子命令式 + check-i18n / check-spec 两个专项脚本）、9 项硬性约束（零外部依赖 / 只读 / 根目录自推导 / 退出码契约 / ERROR-WARN 豁免语义 / 维度映射同步 / 跨平台兼容 / 自身注解合规 / 转发契约）、基线刷新流程与 9 项扫描维度（每项含命令 + 判定 + 修正模式）。当新增探针、调整扫描维度、维护豁免清单或刷新基线数据时参考。
category: specification
version: 1.0.0
baseline-date: 2026-11-05
tags: [easbot-ui, spec, probe, script, scan, baseline, ci]
related:
  - spec-index.md
  - component-standard.md
  - css-standard.md
  - architecture-standard.md
  - model-standard.md
  - testing-guidelines.md
  - code-annotation-standard.md
  - i18n-standard.md
---

# 探针脚本规范（Probe Script Standard）

> **本规范是 `spec/scripts/` 目录的唯一真值源**：定义探针脚本的定位、目录契约、硬性约束、
> 判定语义、维度映射与维护流程。
>
> 📌 **探针与规范的关系**：各规范 §M 章节定义「**怎么判**」（命令 + 判定 + 修正模式），
> 探针脚本是「**怎么跑**」的可复跑实现 —— 规范是契约，探针是执行器。
> **两者必须同步演进**（见 §M 维度⑥）。

---

## 1. 定位与目录契约

### 1.1 目录结构

```
spec/scripts/
├── probe.ts        # ⭐ 统一入口（子命令式，承载多数自有域探针）
├── check-i18n.ts   # i18n 专项（维度 ①③④⑤⑥）
├── check-spec.ts   # 跨域专项（a11y / component-api / react-performance / css⑮⑯⑰，含豁免机制）
└── README.md       # 目录索引（脚本清单 + 维度映射表）
```

### 1.2 职责划分

| 脚本            | 职责                                                | 新增维度去向               |
| --------------- | --------------------------------------------------- | -------------------------- |
| `probe.ts`      | 多域统一入口 + 基线数字输出 + 转发既有脚本          | 默认落点（新子命令）       |
| `check-i18n.ts` | i18n 维度专用（消息表结构解析逻辑复杂，独立成文件） | 仅 i18n 文档新增维度时扩展 |
| `check-spec.ts` | 需要**存量豁免清单**（`EXEMPTIONS`）的确定性判定域  | 新域若需豁免机制则落此文件 |

### 1.3 调用契约

```bash
pnpm probe all            # 一键全跑（自有域 + 转发两个专项脚本）
pnpm probe <name>         # 单域（component / css / arch / model / testing / annotation / baseline / i18n / spec）
pnpm probe css --with-build   # 带构建产物检查的探针用 flag 声明
```

- **pnpm script 是唯一推荐入口**（`package.json` → `probe` / `check:i18n` / `check:spec`）；
  直接 `npx tsx spec/scripts/<file>.ts` 亦合法，但**必须**在仓库根目录执行。
- **CI / 提交前自检**：`pnpm probe all` 的退出码即规范合规状态（ERROR → 1）。

---

## 2. 硬性约束

| #   | 约束                                                                                                           | 理由                                                   |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | **零外部依赖**：仅 `node:fs` / `node:path` / `node:child_process` / `node:url`                                 | 规范检查不能反过来引入新依赖；消费方 clone 即跑        |
| 2   | **不依赖 `rg` / GNU grep**                                                                                     | Windows PowerShell 环境无 `rg`；正则一律在 Node 内实现 |
| 3   | **只读**：不修改 / 删除任何源码文件                                                                            | 探针是检查器，不是修复器（修复是人的责任）             |
| 4   | **根目录自推导**：用 `import.meta.url` 推导 `ROOT`，不信任 `process.cwd()`                                     | 防止从子目录调用时路径漂移                             |
| 5   | **退出码契约**：0 = 无 ERROR；1 = 存在 ERROR；2 = 用法错误                                                     | CI 可判定；WARN 恒不阻塞                               |
| 6   | **判定语义**：ERROR = 可确定性判定；WARN = 启发式 / 存量豁免                                                   | 与 `check-spec.ts` 头注释口径一致（见 §M 维度⑤）       |
| 7   | **维度映射同步**：探针域 ↔ 规范 §M 维度 ↔ README 表 ↔ spec-index 表                                            | 四处同步，见 §M 维度⑥                                  |
| 8   | **自身注解合规**：探针脚本自己**必须**满足 `code-annotation-standard.md`（文件头块注释 / 中文 JSDoc / 无禁词） | 己身不正何以正人                                       |
| 9   | **转发契约**：`probe all` 必须把 `check:i18n` / `check:spec` 一并跑完并汇总                                    | 禁止「部分绿灯」—— 汇总退出码取全部探针的**最坏值**    |

---

## 3. 判定语义与豁免机制

### 3.1 ERROR / WARN

- **ERROR** —— 正则即可确认、无合理豁免的违规。计入退出码。
- **WARN** —— 两类：
  1. **启发式候选**（需人工确认，如「疑似组件内部定义组件」）；
  2. **存量豁免**（§M+2 登记的存量缺口，改动即补）。

### 3.2 豁免登记

- 豁免的**真值源**是各规范文档的 **§M+2 豁免清单**（人读）。
- 探针侧实现豁免时**必须**在违规消息中带上豁免编号（如 `api H2` / `G4`），
  使「探针输出 ↔ 文档登记」可互相追溯。
- 豁免清空后，探针消息自动失去豁免依据 → 人工将其升级为 ERROR
  （`check-spec.ts` 的 `EXEMPTIONS` 数组结构支持一文件多理由，见 §M+3 C2）。

### 3.3 与「已知缺口」的关系

探针发现的**未登记**违规：先在对应规范 §M+2 或 spec-index §「已知缺口」登记（编号 + 状态），
再决定是否豁免。**禁止**让探针长期红灯而文档无登记 —— 红灯必须可解释。

---

## 4. 维度映射与维护流程

**新增 / 修改一条扫描维度的完整链路**（四处同步，缺一即违规）：

1. 规范文档 §M：写「命令 + 判定 + 修正模式」三件套；
2. 探针脚本：实现对应判定（`probe.ts` 新子命令或既有专项脚本）；
3. `spec/scripts/README.md`：维度映射表加行；
4. `spec-index.md`：分类表 / 分解表 / 自检命令表同步。

**基线刷新流程**：

```bash
pnpm probe baseline    # 输出全部基线数字
```

把输出写回 `spec-index.md` §「全库现状」与各规范 §M+1，**同时更新** `baseline-date`
（本索引 frontmatter + 章节标题）。数据会过期，条文不过期。

---

## M. 9 项扫描维度（评审必跑）

> **统一口径**：本规范自身维度的检查对象是 `spec/scripts/*.ts` 与其映射关系。
> 维度命令一律可在仓库根目录的 PowerShell 直跑。

### 维度 ① 依赖纯净

**扫描命令**：

```powershell
Select-String -Path spec\scripts\*.ts -Pattern '^\s*import .*from [''"](?<!node:)'
```

**判定**：只允许 `node:fs` / `node:path` / `node:child_process` / `node:url`（`node:` 前缀）。
**修正模式**：删除第三方 import；确需解析复杂结构时用 Node 内置能力或轻量正则。

### 维度 ② 只读性

**扫描命令**：

```powershell
Select-String -Path spec\scripts\*.ts -Pattern 'writeFileSync|rmSync|unlinkSync|appendFileSync'
```

**判定**：唯一合法命中 = `css --with-build` 对 `dist/styles.css` 的产物检查（`fs.readFileSync` 读产物不违规）；
任何 `writeFileSync` / `rmSync` 均违规（`pnpm build:css` 由 pnpm 自身产出，属构建流程）。
**修正模式**：把修改逻辑移出探针；探针只报问题。

### 维度 ③ 根目录自推导

**扫描命令**：

```powershell
Select-String -Path spec\scripts\*.ts -Pattern 'fileURLToPath|import\.meta\.url'
```

**判定**：每个脚本必须由 `import.meta.url` 推导 `ROOT`；裸 `process.cwd()` 仅允许出现在
「必须在根目录执行」注释约束之下（现有两专项脚本即此形态，README 已声明）。
**修正模式**：改用 `fileURLToPath(import.meta.url)` 推导。

### 维度 ④ 退出码契约

**扫描命令**：

```powershell
pnpm probe baseline; "exit=$LASTEXITCODE"   # 恒 0
pnpm probe model;    "exit=$LASTEXITCODE"   # 0 或 1
```

**判定**：`baseline` 恒 0；判定型探针只有 0 / 1 / 2 三种退出值。
**修正模式**：补齐 `process.exit(...)` 分支；禁止静默 return 0。

### 维度 ⑤ ERROR / WARN 语义

**扫描命令**：

```powershell
Select-String -Path spec\scripts\*.ts -Pattern "'ERROR'|'WARN'"
```

**判定**：确定性判定用 `ERROR`；启发式候选与存量豁免用 `WARN` 且消息**必须**带豁免编号或「需人工确认」字样。
**修正模式**：重分级；WARN 消息补编号。

### 维度 ⑥ 维度映射同步

**扫描命令**：对照检查四处（人工评审项，无自动命令）：

1. 规范文档 §M 维度编号；
2. 探针实现（`probe.ts` 头注释的域清单 / 专项脚本头注释）；
3. `spec/scripts/README.md` 映射表；
4. `spec-index.md` 分类表 + 分解表 + 自检命令表。

**判定**：任一处缺失或口径不一致即违规。
**修正模式**：按 §4 链路补齐四处。

### 维度 ⑦ 跨平台兼容

**扫描命令**：

```powershell
Select-String -Path spec\scripts\*.ts -Pattern '\\\\|`grep |rg '
```

**判定**：脚本内不得出现 Bash 续行符 `\`、`grep` / `rg` 调用；路径拼接一律 `path.join`。
**修正模式**：改 Node 原生实现。

### 维度 ⑧ 自身注解合规

**扫描命令**：

```powershell
Get-ChildItem spec\scripts\*.ts | ForEach-Object {
  if (-not ((Get-Content $_.FullName -TotalCount 3) -match '/\*\*')) { $_.Name }
}
```

**判定**：无输出 = 合规（每脚本前 3 行内有块注释）；输出文件名 = 违规（annotation 维度⑧ 对探针自身同样生效）。
**修正模式**：按 `code-annotation-standard.md` §3 模板补文件头。

### 维度 ⑨ 转发契约

**扫描命令**：

```powershell
pnpm probe all
```

**判定**：输出必须包含 `check-i18n` 与 `check-spec` 两段转发；汇总退出码 = 全部探针最坏值。
**修正模式**：`probe all` 分支补转发项。

---

## M+1. 历史基准（2026-11-05 实测）

| 项目                      | 现状                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------- |
| 探针脚本数                | **3**（probe / check-i18n / check-spec）                                                |
| 自有域探针                | **7**（component / css / arch / model / testing / annotation / baseline）               |
| 转发域                    | **2**（i18n → check-i18n；spec → check-spec）                                           |
| `pnpm probe all` 当前状态 | **ERROR**（来源：arch G-AR1 6 处 / annotation G-N1 26 处 / check-spec 41 处 G-A3+G-A7） |
| `pnpm check:i18n`         | **0 违规**                                                                              |
| 外部依赖                  | **0**（仅 node: 内置模块）                                                              |

## M+2. 豁免清单

| 对象                                                   | 豁免依据                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `check-i18n.ts` / `check-spec.ts` 使用 `process.cwd()` | 维度③ 存量豁免：pnpm script 保证 cwd = 仓库根；头注释已声明约束 |
| `probe.ts` css 域 `--with-build` 触发 `pnpm build:css` | 维度② 受控例外：产物属构建流程输出，非探针写入源码              |

## M+3. 冲突裁决

| 编号 | 议题                      | 裁定                                                                                       |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------ |
| C1   | 探针 vs `EXEMPTIONS` 结构 | `check-spec.ts` 的豁免值为**数组**（一文件可挂多理由）—— 迁移自 string 结构（TS1117 教训） |
| C2   | 豁免真值源                | 文档 §M+2 是**人读真值源**；脚本内豁免清单是**机读投影**，两者必须同步改                   |
| C3   | 探针与 `rg` 命令并存      | 规范 §M 保留命令作**规则说明**；可复跑口径**只认探针**（Windows 无 `rg`）                  |
| C4   | `baseline` 是否计入退出码 | **不计入**（信息型恒 0）—— 基线数字无对错，只有新旧                                        |

## M+4. 模块检查清单

- [ ] 新探针零外部依赖（维度①）
- [ ] 只读（维度②）
- [ ] 退出码正确（维度④）
- [ ] WARN 带豁免编号（维度⑤）
- [ ] README 映射表 + spec-index 已同步（维度⑥）
- [ ] 文件头块注释（维度⑧）
- [ ] `pnpm probe all` 全链路实测过（维度⑨）

## M+5. 修订记录

| 版本  | 日期       | 变更                                                                                                                                                |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-11-05 | 初版。沉淀 `probe.ts` 统一入口（7 自有域 + 2 转发域）+ 基线探针；`check-i18n.ts` / `check-spec.ts` 迁入 `spec/scripts/`；确立四处同步链路与豁免机制 |
