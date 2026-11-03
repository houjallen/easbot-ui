/**
 * Typography 导出入口
 *
 * @description
 * Typography 组件族提供一整套排版原语（标题 / 段落 / 列表 / 表格 / 代码块 …）。
 *
 * ⚠️ **为什么只导出聚合对象 `Typography` 与 `Static`**：
 * 该目录下的裸组件名（`Table` / `Separator` / `ListItem` / `TableCell` …）与本库其它
 * 公开组件（`src/ui/table`、`src/ui/separator`、`src/ui/edit`）**同名**。
 * 若通过 `export *` 平铺导出，会与 `src/ui/index.ts` 的其它 barrel 产生 TS2308
 * 「重复导出」冲突，导致整个 barrel 无法编译。
 *
 * 因此 `typography.tsx` 内部的裸组件**不导出**，只通过聚合对象 `Typography`
 * 暴露（消费方用 `Typography.H1` 访问）；`Static` 单独导出（无同名冲突）。
 */

// 聚合对象：包含全部排版原语，消费方通过 `Typography.H1` 等方式访问
export { Typography } from './typography';
export type { LinkProps, StaticProps } from './typography';

// `Static` 是静态字段展示组件，与其它组件无同名冲突，单独导出
export { Static } from './typography';
