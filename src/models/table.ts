/**
 * 表格 Action Schema
 *
 * @description
 * 由 `hxsoft-js-framework/repository/schema/types/table` 移植而来，
 * 并改为 **Zod 定义模式** —— schema 即运行时校验器，类型从 schema 推导。
 *
 * 定义表格各层级（表格 / 列 / 单元格 / 行）支持的内置 Action 类型。
 */

import { z } from 'zod';

/**
 * 表格（Table）组件支持的 Action 类型
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

/**
 * 表格列（Table Column）支持的 Action 类型
 */
export const TableColumnActionTypeSchema = z.enum([
  'table-column-sort', // 列排序
  'table-column-filter', // 列筛选
  'table-column-custom', // 自定义
]);

/**
 * 表格单元格（Table Cell）支持的 Action 类型
 */
export const TableCellActionTypeSchema = z.enum([
  'table-cell-copy', // 复制
  'table-cell-edit', // 编辑
  'table-cell-custom', // 自定义
]);

/**
 * 表格行（Table Row）支持的 Action 类型
 */
export const TableRowActionTypeSchema = z.enum([
  'table-row-edit', // 编辑
  'table-row-delete', // 删除
  'table-row-view', // 查看详情
  'table-row-copy', // 复制
  'table-row-move', // 移动
  'table-row-enable', // 启用
  'table-row-custom', // 自定义
]);

/** 表格 Action 类型 */
export type TableActionType = z.infer<typeof TableActionTypeSchema>;
/** 表格列 Action 类型 */
export type TableColumnActionType = z.infer<typeof TableColumnActionTypeSchema>;
/** 表格单元格 Action 类型 */
export type TableCellActionType = z.infer<typeof TableCellActionTypeSchema>;
/** 表格行 Action 类型 */
export type TableRowActionType = z.infer<typeof TableRowActionTypeSchema>;
