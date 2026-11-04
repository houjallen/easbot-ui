# spec/scripts — 规范探针脚本目录

> **定位**：`spec/` 各规范文档 §M 扫描维度的**可复跑实现**。
> 规范条文定义「怎么判」，本目录的脚本是「怎么跑」的唯一保证口径。
>
> **编写与维护规范**：见 [`../probe-script-standard.md`](../probe-script-standard.md)（**唯一真值源**）。

## 脚本清单

| 脚本                               | 职责                                                                                                         | 运行方式                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| [`probe.ts`](./probe.ts)           | **统一入口**：component / css / arch / model / testing / annotation / baseline 七个自有域 + 转发两个既有脚本 | `pnpm probe <name>` / `pnpm probe all` |
| [`check-i18n.ts`](./check-i18n.ts) | i18n 规范维度 ①③④⑤⑥（硬编码文案 / console 文案 / 消息表一致性）                                              | `pnpm check:i18n`                      |
| [`check-spec.ts`](./check-spec.ts) | a11y / component-api / react-performance / css⑮⑯⑰ 的可自动判定维度（含存量豁免机制）                         | `pnpm check:spec`                      |

## probe 子命令 → 规范维度映射

| 探针名       | 覆盖维度                                                           | 对应规范                                |
| ------------ | ------------------------------------------------------------------ | --------------------------------------- |
| `component`  | component ①②（目录 4 件套 / `export default`）                     | `component-standard.md`                 |
| `css`        | css ⑤⑥⑫（主题变量集合 / 编译入口唯一）；`--with-build` 加 ⑨        | `css-standard.md`                       |
| `arch`       | architecture ②③⑤⑥⑧ + code-quality ⑧⑨（依赖方向 / 别名 / external） | `architecture-standard.md` 等           |
| `model`      | model ①③⑧⑨⑩                                                        | `model-standard.md`                     |
| `testing`    | testing ②（`jest.*`）+ polyfill 去重                               | `testing-guidelines.md`                 |
| `annotation` | annotation ①②⑦⑧（人称 / 决策编号 / spec 路径 / 文件头）            | `code-annotation-standard.md`           |
| `baseline`   | 输出全库基线数字（信息型，恒 0 退出）                              | `spec-index.md` §「全库现状」           |
| `i18n`       | 转发 `pnpm check:i18n`                                             | `i18n-standard.md`                      |
| `spec`       | 转发 `pnpm check:spec`                                             | a11y / component-api / react-perf / css |

## 约定（摘要，完整规范见 probe-script-standard.md）

1. **零外部依赖**：仅 `node:*` 内置模块；不依赖 `rg` / GNU grep（Windows PowerShell 可直跑）。
2. **只读**：不修改任何源码（唯一例外：`css --with-build` 产生 `dist/` 构建产物）。
3. **退出码**：0 = 无 ERROR；1 = 存在 ERROR；2 = 用法错误。WARN 不阻塞。
4. **豁免机制**：存量豁免登记在各规范 §M+2；探针侧以 WARN 呈现并在消息中标注豁免编号，清空后自动升级 ERROR。
5. **根目录推导**：脚本由自身位置推导仓库根，**必须**在仓库根目录经 pnpm script 调用。
6. **基线刷新**：`pnpm probe baseline` 输出数字 → 写回 `spec-index.md` §「全库现状」并更新 `baseline-date`。
