/**
 * DatePicker 组件测试
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DatePicker, InputDate, InputDateRange, InputTime, InputTimeRange } from '../index';

describe('DatePicker 组件', () => {
  it('正确渲染 DatePicker', () => {
    render(<DatePicker />);
    expect(screen.getByText('请选择日期')).toBeInTheDocument();
  });

  it('正确渲染 InputDate', () => {
    render(<InputDate />);
    expect(screen.getByPlaceholderText('请选择日期')).toBeInTheDocument();
  });

  it('正确渲染 InputTime', () => {
    render(<InputTime />);
    expect(screen.getByPlaceholderText('请选择时间')).toBeInTheDocument();
  });

  it('正确渲染 InputDateRange', () => {
    render(<InputDateRange />);
    expect(screen.getByPlaceholderText('请选择日期范围')).toBeInTheDocument();
  });

  it('正确渲染 InputTimeRange', () => {
    render(<InputTimeRange />);
    expect(screen.getByPlaceholderText('请选择时间范围')).toBeInTheDocument();
  });

  it('InputDate 支持值变化', () => {
    const onChange = vi.fn();
    render(<InputDate onChange={onChange} />);

    const input = screen.getByPlaceholderText('请选择日期');
    fireEvent.change(input, { target: { value: '2024-01-01' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('InputTime 支持显示秒', () => {
    render(<InputTime showSeconds />);
    expect(screen.getByPlaceholderText('请选择时间')).toBeInTheDocument();
  });
});
