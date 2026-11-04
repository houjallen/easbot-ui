/**
 * 视图粒度归一化工具
 *
 * @description
 * 日期选择器的月 / 年 / 季度视图在判定 `disabledDate` 时，
 * 必须把传入回调的日期**归一到该粒度的起点**（「尾部清零」语义）：
 *
 * - 月粒度 → 该月 **1 日 00:00:00**
 * - 年粒度 → 该年 **1 月 1 日 00:00:00**
 * - 季度粒度 → 该季度首月 **1 日 00:00:00**
 *
 * 消费方常见的写法是 `disabledDate={(d) => d.date() === 15}`（禁用每月 15 号）
 * 或 `d.month() === 0`（只允许 1 月）。若不归一，
 * 回调收到的日期会带上 `viewDate` 的日 / 时分秒，导致「按月首日」误判：
 * 例如 `viewDate` 是 3 月 20 日，判定 1 月时实际传入的是 **1 月 20 日**，
 * 与 `d.date() === 1` 不匹配，导致该月被错误禁用。
 *
 * @see 决策记录 `docs/decisions/0001-src-ui-defect-remediation.md`
 */

import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

/**
 * 视图粒度类型
 */
export type ViewGranularity = 'day' | 'month' | 'quarter' | 'year';

/**
 * 把日期归一到指定粒度的起点（尾部清零）
 *
 * @param date 原始日期
 * @param granularity 粒度
 * @returns 归一后的日期；月→1日00:00:00，年→1月1日00:00:00，季度→首月1日00:00:00
 *
 * @example
 * ```ts
 * truncateToGranularity(dayjs('2024-03-20T13:45:00'), 'month');
 * // → 2024-03-01T00:00:00
 * ```
 */
export function truncateToGranularity(date: Dayjs, granularity: ViewGranularity): Dayjs {
  switch (granularity) {
    case 'year':
      return date.startOf('year');
    case 'quarter':
      // 季度首月：1 / 4 / 7 / 10 月，再归零到当月 1 日
      return date.month(Math.floor(date.month() / 3) * 3).startOf('month');
    case 'month':
      return date.startOf('month');
    case 'day':
    default:
      return date.startOf('day');
  }
}
