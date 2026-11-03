/**
 * 数据仓库分页 Schema
 *
 * @description
 * 由 `hxsoft-js-framework/repository/schema/types/store` 移植而来，
 * 并改为 **Zod 定义模式** —— schema 即运行时校验器，类型从 schema 推导。
 *
 * `DataStorePageSchema` 是表格 / 列表与服务端交互时的分页参数契约，
 * 与后端 `net.huaxinsoft.common.core.base.page.Page` 结构对齐。
 */

import { z } from 'zod';
import { FilterRuleSchema } from './filter';

/**
 * 数据仓库字段定义
 */
export const DataStoreFieldSchema = z.object({
  /** 字段名 */
  name: z.string().optional(),
  /** 字段显示名 */
  label: z.string().optional(),
  /** 字段类型 */
  type: z.string().optional(),
  /** 字段说明 */
  description: z.string().optional(),
  /** 是否必填 */
  required: z.boolean().optional(),
  /** 默认值 */
  defaultValue: z.unknown().optional(),
  /** 字段级配置 */
  config: z.record(z.string(), z.unknown()).optional(),
});

/**
 * 排序字段配置
 */
export const DataStoreSortingSchema = z.object({
  /** 排序字段 */
  field: z.string(),
  /** 排序方向 */
  order: z.enum(['asc', 'desc']),
});

/**
 * 数据仓库分页参数
 */
export const DataStorePageSchema = z.object({
  /** 总记录数 */
  total: z.number().int().nonnegative().optional(),
  /** 是否自动计算总数 */
  autoCount: z.boolean().optional(),
  /**
   * 当前页码
   * @default 1
   */
  pageNo: z.number().int().positive().default(1),
  /**
   * 每页记录数
   * @default 10
   */
  pageSize: z.number().int().positive().default(10),
  /** 过滤条件（支持嵌套分组与表达式） */
  filter: FilterRuleSchema.optional(),
  /** 额外参数 */
  params: z.record(z.string(), z.unknown()).optional(),
  /** 排序字段配置 */
  sorting: z.array(DataStoreSortingSchema).optional(),
  /** 上下文信息 */
  context: z.record(z.string(), z.unknown()).optional(),
  /** 当前页的数据列表 */
  list: z.array(z.record(z.string(), z.unknown())).optional(),
  /** 指定要输出的字段 */
  includes: z.array(z.string()).optional(),
  /** 字段定义列表 */
  fields: z.array(DataStoreFieldSchema).optional(),
});

/** 数据仓库字段定义类型 */
export type DataStoreField = z.infer<typeof DataStoreFieldSchema>;
/** 排序配置类型 */
export type DataStoreSorting = z.infer<typeof DataStoreSortingSchema>;
/** 数据仓库分页参数类型 */
export type DataStorePage = z.infer<typeof DataStorePageSchema>;
