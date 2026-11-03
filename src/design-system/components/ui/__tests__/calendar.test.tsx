/**
 * Calendar 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证日历网格、月份标题、星期表头与导航按钮的基本渲染与类名
 * 2. 状态测试 - 验证选中态、今日态、范围选择态与禁用态
 * 3. 交互测试 - 验证月份导航、日期选择与回调
 * 4. 无障碍测试 - 验证 grid/gridcell 语义角色、aria-label 与焦点管理
 * 5. 边界测试 - 验证受控模式、范围模式、classNames 覆盖与属性透传
 *
 * @remarks
 * 基于 `react-day-picker` v10 —— 类名键由 `UI` 枚举定义，状态修饰符由
 * `SelectionState` / `DayFlag` 枚举定义；导航图标通过 `components={{ Chevron }}` 覆盖。
 *
 * 补充说明：
 * 1. 日期以 `<button>` 渲染在 `<td role="gridcell">` 内部，且只有设置了
 *    `mode` / `onDayClick`（即进入交互模式）时才会渲染按钮。
 * 2. `showOutsideDays={false}` 时相邻月份的格子仍会渲染，但带 `data-hidden="true"`
 *    并附加 `invisible` 修饰类名。
 * 3. 星期表头位于 `<thead aria-hidden="true">` 内，不暴露 `columnheader` 语义角色。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Calendar } from '../calendar';

/** 固定月份，确保断言稳定（2026 年 11 月） */
const DEFAULT_MONTH = new Date(2026, 10, 1);

describe('Calendar 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染日历网格', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('w-full');
      expect(grid).toHaveClass('border-collapse');
    });

    it('应该正确渲染月份标题', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(screen.getByText('November 2026')).toBeInTheDocument();
    });

    it('应该正确渲染星期表头', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      const header = document.querySelector('thead');
      expect(header).toHaveAttribute('aria-hidden', 'true');
      expect(header?.querySelectorAll('th')).toHaveLength(7);
      expect(header?.querySelector('th')).toHaveTextContent('Su');
    });

    it('应该正确应用月份标题的类名', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(screen.getByText('November 2026')).toHaveClass('text-sm');
      expect(screen.getByText('November 2026')).toHaveClass('font-medium');
    });

    it('应该正确应用日期单元格的类名', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      const cell = document.querySelector('td[role="gridcell"]');
      expect(cell).toHaveClass('relative');
      expect(cell).toHaveClass('text-center');
      expect(cell).toHaveClass('text-sm');
    });

    it('应该正确应用根容器的类名', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(document.querySelector('.rdp-root')).toHaveClass('p-3');
    });

    it('应该正确合并自定义类名', () => {
      render(<Calendar month={DEFAULT_MONTH} className="custom-calendar" />);

      expect(document.querySelector('.rdp-root')).toHaveClass('custom-calendar');
      expect(document.querySelector('.rdp-root')).toHaveClass('p-3');
    });
  });

  describe('状态测试', () => {
    it('应该在选中日期上渲染 aria-selected 与选中态类名', () => {
      render(<Calendar mode="single" month={DEFAULT_MONTH} selected={new Date(2026, 10, 15)} onSelect={() => undefined} />);

      const selected = document.querySelector('td[aria-selected="true"]');
      expect(selected).toBeInTheDocument();
      expect(selected).toHaveClass('bg-primary');
      expect(selected).toHaveClass('text-primary-foreground');
    });

    it('应该在今天渲染 data-today 与今日态类名', () => {
      render(<Calendar month={new Date()} />);

      const today = document.querySelector('td[data-today="true"]');
      expect(today).toBeInTheDocument();
      expect(today).toHaveClass('bg-accent');
      expect(today).toHaveClass('text-accent-foreground');
    });

    it('应该在范围模式下渲染范围起止的 day-range 标记类名', () => {
      render(<Calendar mode="range" month={DEFAULT_MONTH} selected={{ from: new Date(2026, 10, 10), to: new Date(2026, 10, 14) }} onSelect={() => undefined} />);

      const start = document.querySelector('.day-range-start');
      const end = document.querySelector('.day-range-end');
      expect(start).toBeInTheDocument();
      expect(end).toBeInTheDocument();
      expect(start).toHaveClass('bg-primary');
      expect(end).toHaveClass('bg-primary');
    });

    it('应该在范围中间的日子渲染 range_middle 修饰类名', () => {
      render(<Calendar mode="range" month={DEFAULT_MONTH} selected={{ from: new Date(2026, 10, 10), to: new Date(2026, 10, 14) }} onSelect={() => undefined} />);

      const middle = document.querySelector('[class*="aria-selected:bg-accent"]');
      expect(middle).toBeInTheDocument();
    });

    it('应该在禁用日期上渲染 data-disabled 与禁用态类名', () => {
      render(<Calendar month={DEFAULT_MONTH} disabled={new Date(2026, 10, 20)} />);

      const disabled = document.querySelector('td[data-disabled="true"]');
      expect(disabled).toBeInTheDocument();
      expect(disabled).toHaveClass('text-muted-foreground');
      expect(disabled).toHaveClass('opacity-50');
    });

    it('应该在 showOutsideDays 关闭时把相邻月份日期标记为隐藏', () => {
      render(<Calendar month={DEFAULT_MONTH} showOutsideDays={false} />);

      const outside = document.querySelector('td[data-outside="true"]');
      expect(outside).toBeInTheDocument();
      expect(outside).toHaveAttribute('data-hidden', 'true');
      expect(outside).toHaveClass('invisible');
    });

    it('应该在 showOutsideDays 开启时渲染可见的相邻月份日期', () => {
      render(<Calendar month={DEFAULT_MONTH} showOutsideDays />);

      const outside = document.querySelector('td[data-outside="true"]');
      expect(outside).toBeInTheDocument();
      expect(outside).not.toHaveAttribute('data-hidden');
      expect(outside).toHaveClass('day-outside');
    });
  });

  describe('交互测试', () => {
    it('应该在点击下个月按钮时触发月份切换', () => {
      const handleMonthChange = vi.fn();
      render(<Calendar month={DEFAULT_MONTH} onMonthChange={handleMonthChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to the Next Month' }));

      expect(handleMonthChange).toHaveBeenCalled();
    });

    it('应该在点击上个月按钮时触发月份切换', () => {
      const handleMonthChange = vi.fn();
      render(<Calendar month={DEFAULT_MONTH} onMonthChange={handleMonthChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to the Previous Month' }));

      expect(handleMonthChange).toHaveBeenCalled();
    });

    it('应该在点击日期按钮时触发选择回调', () => {
      const handleSelect = vi.fn();
      render(<Calendar mode="single" month={DEFAULT_MONTH} selected={undefined} onSelect={handleSelect} />);

      const dayButton = document.querySelector('td[data-day="2026-11-15"] button');
      expect(dayButton).toBeInTheDocument();
      fireEvent.click(dayButton as HTMLElement);

      expect(handleSelect).toHaveBeenCalled();
    });

    it('应该在非受控模式下点击导航按钮后切换月份标题', () => {
      render(<Calendar defaultMonth={DEFAULT_MONTH} />);

      fireEvent.click(screen.getByRole('button', { name: 'Go to the Next Month' }));

      expect(screen.getByText('December 2026')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 grid 语义角色', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('应该暴露 gridcell 语义角色', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
    });

    it('应该为日期单元格提供完整的可访问名称', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(screen.getByRole('gridcell', { name: /November 15th, 2026/ })).toBeInTheDocument();
    });

    it('应该为月份标题暴露 status 角色与 aria-live', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      const caption = screen.getByRole('status');
      expect(caption).toHaveAttribute('aria-live', 'polite');
      expect(caption).toHaveTextContent('November 2026');
    });

    it('应该为导航容器提供 navigation 可访问名称', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(screen.getByRole('navigation', { name: 'Navigation bar' })).toBeInTheDocument();
    });

    it('应该支持导航按钮通过键盘获得焦点', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      const next = screen.getByRole('button', { name: 'Go to the Next Month' });
      next.focus();
      expect(next).toHaveFocus();
    });

    it('应该为交互模式下的日期按钮提供可访问名称', () => {
      render(<Calendar mode="single" month={DEFAULT_MONTH} selected={undefined} onSelect={() => undefined} />);

      expect(screen.getByRole('button', { name: /November 15th, 2026/ })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的月份', () => {
      render(<Calendar month={DEFAULT_MONTH} />);

      expect(screen.getByText('November 2026')).toBeInTheDocument();
    });

    it('应该允许渲染没有选中日期的单选日历', () => {
      render(<Calendar mode="single" month={DEFAULT_MONTH} selected={undefined} onSelect={() => undefined} />);

      expect(document.querySelector('td[aria-selected="true"]')).not.toBeInTheDocument();
    });

    it('应该允许通过 classNames 覆盖日期单元格类名', () => {
      render(<Calendar month={DEFAULT_MONTH} classNames={{ day: 'custom-day' }} />);

      expect(document.querySelector('.custom-day')).toBeInTheDocument();
    });

    it('应该允许通过 classNames 覆盖日期按钮类名', () => {
      render(<Calendar mode="single" month={DEFAULT_MONTH} selected={undefined} onSelect={() => undefined} classNames={{ day_button: 'custom-day-button' }} />);

      expect(document.querySelector('.custom-day-button')).toBeInTheDocument();
    });

    it('应该透传 lang 属性到日历根容器', () => {
      render(<Calendar month={DEFAULT_MONTH} lang="zh-CN" />);

      expect(document.querySelector('.rdp-root')).toHaveAttribute('lang', 'zh-CN');
    });
  });
});
