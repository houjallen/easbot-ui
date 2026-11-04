import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { MonthView } from '../view/month-view';
import { YearView } from '../view/year-view';
import { truncateToGranularity } from '../view/granularity';

/**
 * 视图粒度归一化（尾部清零）单元测试
 *
 * @description
 * 月 / 年 / 季度视图在判定 `disabledDate` 时，必须把传入回调的日期
 * 归一到该粒度的**起点**：
 *
 * - 月粒度 → 该月 1 日 00:00:00
 * - 年粒度 → 该年 1 月 1 日 00:00:00
 * - 季度粒度 → 该季度首月 1 日 00:00:00
 *
 * 否则 `viewDate` 的日 / 时分秒会带入判定，导致误禁用。
 *
 * @see docs/decisions/0001-src-ui-defect-remediation.md
 */

describe('视图粒度归一化（尾部清零）', () => {
  describe('truncateToGranularity 工具函数', () => {
    /**
     * 月粒度归一
     * 验证日 / 时分秒被清零
     */
    it('月粒度应归一到当月 1 日 00:00:00', () => {
      const result = truncateToGranularity(dayjs('2024-03-20T13:45:30'), 'month');

      expect(result.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-03-01 00:00:00');
      expect(result.date()).toBe(1);
      expect(result.month()).toBe(2);
    });

    /**
     * 年粒度归一
     * 验证月 / 日 / 时分秒全部被清零
     */
    it('年粒度应归一到当年 1 月 1 日 00:00:00', () => {
      const result = truncateToGranularity(dayjs('2024-03-20T13:45:30'), 'year');

      expect(result.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-01 00:00:00');
      expect(result.month()).toBe(0);
      expect(result.date()).toBe(1);
    });

    /**
     * 季度粒度归一
     * 验证归一到该季度首月 1 日
     */
    it('季度粒度应归一到该季度首月 1 日 00:00:00', () => {
      // 3 月 → Q1 → 1 月
      expect(truncateToGranularity(dayjs('2024-03-20T13:45:30'), 'quarter').format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-01 00:00:00');
      // 8 月 → Q3 → 7 月
      expect(truncateToGranularity(dayjs('2024-08-20T13:45:30'), 'quarter').format('YYYY-MM-DD HH:mm:ss')).toBe('2024-07-01 00:00:00');
      // 12 月 → Q4 → 10 月
      expect(truncateToGranularity(dayjs('2024-12-20T13:45:30'), 'quarter').format('YYYY-MM-DD HH:mm:ss')).toBe('2024-10-01 00:00:00');
    });

    /**
     * 日粒度归一
     * 验证时分秒被清零但日期不变
     */
    it('日粒度应归一到当天 00:00:00', () => {
      const result = truncateToGranularity(dayjs('2024-03-20T13:45:30'), 'day');

      expect(result.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-03-20 00:00:00');
    });
  });

  describe('MonthView 的 disabledDate 粒度', () => {
    /**
     * 月视图判定时传入的日期必须已归零
     * 验证 `viewDate` 是 3 月 20 日时，判定 1 月传入的是 1 月 1 日 00:00:00
     */
    it('判定月份时应传入该月 1 日 00:00:00', () => {
      const isValidDate = vi.fn().mockReturnValue(false);
      // viewDate 刻意取「日 ≠ 1」且带时分秒的日期
      const viewDate = dayjs('2024-03-20T13:45:30');

      render(<MonthView viewDate={viewDate} onSelect={vi.fn()} isValidDate={isValidDate} />);

      expect(isValidDate).toHaveBeenCalled();

      // 每个月收到的日期都必须是「1 日 00:00:00」
      for (const call of isValidDate.mock.calls) {
        const date = call[0] as dayjs.Dayjs;
        expect(date.date()).toBe(1);
        expect(date.hour()).toBe(0);
        expect(date.minute()).toBe(0);
        expect(date.second()).toBe(0);
        expect(date.year()).toBe(2024);
      }
    });

    /**
     * 消费方常见写法：只允许 1 月
     * 验证 `d.month() === 0` 能正确只禁用其他月份（不误禁用 1 月）
     */
    it('只允许 1 月的 disabledDate 不应误禁用 1 月', () => {
      const isValidDate = vi.fn((date: dayjs.Dayjs) => date.month() === 0);

      render(<MonthView viewDate={dayjs('2024-03-20T13:45:30')} onSelect={vi.fn()} isValidDate={isValidDate} />);

      // 1 月按钮可用，其余月份禁用
      const january = screen.getByRole('button', { name: '1月' });
      const february = screen.getByRole('button', { name: '2月' });

      expect(january).not.toBeDisabled();
      expect(february).toBeDisabled();
    });
  });

  describe('YearView 的 disabledDate 粒度', () => {
    /**
     * 年视图判定时传入的日期必须已归零
     * 验证传入的是该年 1 月 1 日 00:00:00
     */
    it('判定年份时应传入该年 1 月 1 日 00:00:00', () => {
      const isValidDate = vi.fn().mockReturnValue(false);

      render(<YearView viewDate={dayjs('2024-03-20T13:45:30')} onSelect={vi.fn()} isValidDate={isValidDate} />);

      expect(isValidDate).toHaveBeenCalled();

      for (const call of isValidDate.mock.calls) {
        const date = call[0] as dayjs.Dayjs;
        expect(date.month()).toBe(0);
        expect(date.date()).toBe(1);
        expect(date.hour()).toBe(0);
        expect(date.minute()).toBe(0);
        expect(date.second()).toBe(0);
      }
    });

    /**
     * 消费方常见写法：只允许 2024 年
     * 验证 `d.year() === 2024` 能正确只禁用其他年份
     */
    it('只允许 2024 年的 disabledDate 不应误禁用 2024 年', () => {
      const isValidDate = vi.fn((date: dayjs.Dayjs) => date.year() === 2024);

      render(<YearView viewDate={dayjs('2024-03-20T13:45:30')} onSelect={vi.fn()} isValidDate={isValidDate} />);

      const year2024 = screen.getByRole('button', { name: '2024' });
      const year2025 = screen.getByRole('button', { name: '2025' });

      expect(year2024).not.toBeDisabled();
      expect(year2025).toBeDisabled();
    });
  });
});
