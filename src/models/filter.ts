/**
 * 过滤表达式 Schema
 *
 * @description
 * 由 `hxsoft-js-framework/repository/schema/types/filter` 移植而来，
 * 并改为 **Zod 定义模式** —— schema 即运行时校验器，类型从 schema 推导。
 *
 * 对应后端 `net.huaxinsoft.common.core.base.page.FilterRule` / `FilterExpression`，
 * 结构保持一致，便于与业务系统对接。
 */

import { z } from 'zod';

/**
 * 过滤操作符
 *
 * 可选值：`eq` `ne` `gt` `ge` `lt` `le` `like` `notlike`
 * `in` `notin` `between` `notbetween` `isnull` `isnotnull`
 * `startwith` `endwith`
 */
export const FilterOperatorSchema = z.enum(['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'like', 'notlike', 'in', 'notin', 'between', 'notbetween', 'isnull', 'isnotnull', 'startwith', 'endwith']);

/**
 * 过滤数据类型
 */
export const FilterDataTypeSchema = z.enum(['string', 'int', 'float', 'long', 'double', 'date', 'boolean', 'enum', 'list', 'object']);

/**
 * 过滤表达式
 */
export const FilterExpressionSchema = z.object({
  /** 字段名 */
  field: z.string().min(1, '字段名不能为空'),
  /** 操作符 */
  op: FilterOperatorSchema,
  /** 值列表 */
  value: z.array(z.unknown()).optional(),
  /** 数据类型 */
  type: FilterDataTypeSchema.optional(),
  /** 格式化字符串（如日期格式） */
  format: z.string().optional(),
});

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
 * 过滤规则
 *
 * @description
 * 支持嵌套的分组（`and` / `or`）与表达式列表。
 * 通过 `z.lazy` 支持递归嵌套。
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

/** 过滤表达式类型 */
export type FilterExpression = z.infer<typeof FilterExpressionSchema>;
/** 过滤操作符类型 */
export type FilterOperator = z.infer<typeof FilterOperatorSchema>;
/** 过滤数据类型 */
export type FilterDataType = z.infer<typeof FilterDataTypeSchema>;
