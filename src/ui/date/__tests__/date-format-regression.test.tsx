/**
 * Date 组件回归测试（ADR 0001 / 批次二）
 *
 * 📌 覆盖两处缺陷：
 *
 * 1. **`InputDateRange` 在 `month` / `year` 模式忽略 `format`** ——
 *    修复前 `mode` 会**硬编码**覆盖 `format`（`'YYYY-MM'` / `'YYYY'`），
 *    导致消费方传的 `format` 在这两种模式下完全失效，
 *    且与单选版 `InputDate`（所有模式一律走 `format`）行为不一致。
 *
 * 2. **`ViewSelectorHeader` 的 `showQuarterView` / `showTimeView` 从未被使用** ——
 *    修复前标题点击恒按 `days → months → years` 跳转，
 *    开启季度视图时会**跳过季度**，开启时间视图时从「年」无处可去。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { InputDateRange } from '../input-date-range';
import { ViewSelectorHeader } from '../view/view-selector-header';

describe('InputDateRange format 回归测试', () => {
  it('day 模式应该按 format 显示外部值', () => {
    render(<InputDateRange value={['2024-03-15', '2024-06-20']} format="YYYY/MM/DD" separator=" ~ " />);
    expect(screen.getByDisplayValue('2024/03/15 ~ 2024/06/20')).toBeInTheDocument();
  });

  it('month 模式也应该按 format 显示（不再被硬编码覆盖）', () => {
    // 📌 回归防护：修复前 month 模式恒用 'YYYY-MM'，传入的 format 被忽略
    render(<InputDateRange value={['2024-03', '2024-06']} mode="month" format="YYYY年MM月" separator=" ~ " />);
    expect(screen.getByDisplayValue('2024年03月 ~ 2024年06月')).toBeInTheDocument();
  });

  it('year 模式也应该按 format 显示（不再被硬编码覆盖）', () => {
    // 📌 回归防护：修复前 year 模式恒用 'YYYY'，传入的 format 被忽略
    render(<InputDateRange value={['2024', '2026']} mode="year" format="YYYY年" separator=" ~ " />);
    expect(screen.getByDisplayValue('2024年 ~ 2026年')).toBeInTheDocument();
  });

  it('month 模式未传 format 时应使用该模式的默认格式 YYYY-MM', () => {
    render(<InputDateRange value={['2024-03', '2024-06']} mode="month" separator=" ~ " />);
    expect(screen.getByDisplayValue('2024-03 ~ 2024-06')).toBeInTheDocument();
  });

  it('year 模式未传 format 时应使用该模式的默认格式 YYYY', () => {
    render(<InputDateRange value={['2024', '2026']} mode="year" separator=" ~ " />);
    expect(screen.getByDisplayValue('2024 ~ 2026')).toBeInTheDocument();
  });

  it('day 模式未传 format 时应使用默认格式 YYYY-MM-DD', () => {
    render(<InputDateRange value={['2024-03-15', '2024-06-20']} separator=" ~ " />);
    expect(screen.getByDisplayValue('2024-03-15 ~ 2024-06-20')).toBeInTheDocument();
  });

  it('month 模式下手动输入按 format 解析后应触发 onChange', () => {
    const onChange = vi.fn();
    render(<InputDateRange mode="month" format="YYYY/MM" onChange={onChange} separator=" ~ " />);

    const input = screen.getByPlaceholderText('请选择日期范围');
    fireEvent.change(input, { target: { value: '2024/03 ~ 2024/06' } });

    // 📌 `onChange` 回传的是**按 `format` 归一化后**的值（`format` 是唯一真值源）
    expect(onChange).toHaveBeenCalledWith(['2024/03', '2024/06']);
  });
});

describe('ViewSelectorHeader showQuarterView / showTimeView 回归测试', () => {
  const baseProps = {
    viewDate: dayjs('2024-03-15'),
    onViewDateChange: vi.fn(),
  };

  it('days 视图点击标题应进入 months', () => {
    const onViewModeChange = vi.fn();
    render(<ViewSelectorHeader {...baseProps} viewMode="days" onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByRole('button', { name: /2024/ }));
    expect(onViewModeChange).toHaveBeenCalledWith('months');
  });

  it('开启 showQuarterView 时，months 视图点击标题应进入 quarters（不跳过季度）', () => {
    // 📌 回归防护：修复前恒跳 'years'，跳过了季度视图
    const onViewModeChange = vi.fn();
    render(<ViewSelectorHeader {...baseProps} viewMode="months" onViewModeChange={onViewModeChange} showQuarterView />);

    fireEvent.click(screen.getByRole('button', { name: /2024/ }));
    expect(onViewModeChange).toHaveBeenCalledWith('quarters');
  });

  it('未开启 showQuarterView 时，months 视图点击标题应进入 years', () => {
    const onViewModeChange = vi.fn();
    render(<ViewSelectorHeader {...baseProps} viewMode="months" onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByRole('button', { name: /2024/ }));
    expect(onViewModeChange).toHaveBeenCalledWith('years');
  });

  it('开启 showTimeView 时，years 视图标题应可点击并进入 time', () => {
    // 📌 回归防护：修复前 `years` 是最末级，标题不可点击 → 时间视图无法从标题进入
    const onViewModeChange = vi.fn();
    render(<ViewSelectorHeader {...baseProps} viewMode="years" onViewModeChange={onViewModeChange} showTimeView />);

    // 📌 `years` 视图的标题是**12 年区间**（含 2024 的区间为 `2016 - 2027`）
    const title = screen.getByRole('button', { name: '2016 - 2027' });
    expect(title).toBeEnabled();
    fireEvent.click(title);
    expect(onViewModeChange).toHaveBeenCalledWith('time');
  });

  it('未开启 showTimeView 时，years 视图标题不可点击', () => {
    const onViewModeChange = vi.fn();
    render(<ViewSelectorHeader {...baseProps} viewMode="years" onViewModeChange={onViewModeChange} />);

    const title = screen.getByRole('button', { name: '2016 - 2027' });
    expect(title).toBeDisabled();
    fireEvent.click(title);
    expect(onViewModeChange).not.toHaveBeenCalled();
  });

  it('quarters 视图点击标题应进入 years', () => {
    const onViewModeChange = vi.fn();
    render(<ViewSelectorHeader {...baseProps} viewMode="quarters" onViewModeChange={onViewModeChange} showQuarterView />);

    fireEvent.click(screen.getByRole('button', { name: /2024/ }));
    expect(onViewModeChange).toHaveBeenCalledWith('years');
  });
});
