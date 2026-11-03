/**
 * MonthView 月份视图组件
 */

'use client';

import { cn } from '../../../utils/classnames';
import { dateMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { useLocale } from '../../../hooks/use-locale';
import dayjs from 'dayjs';
import React from 'react';
import { Button } from '../../button';
import { useDatePickerFormatters, useDatePickerLocale } from '../hooks/use-date-picker-locale';
import type { BaseRangeViewProps, BaseViewProps } from './types';

// 月份视图组件
export function MonthView({ viewDate, selectedDate, onSelect, minDate, maxDate, isValidDate, className }: BaseViewProps): React.ReactNode {
  const { formatMonth } = useDatePickerFormatters();
  const months = Array.from({ length: 12 }, (_, i) => i);

  const isMonthDisabled = (month: number) => {
    const monthDate = viewDate.month(month);
    if (minDate && monthDate.isBefore(minDate, 'month')) return true;
    if (maxDate && monthDate.isAfter(maxDate, 'month')) return true;
    if (isValidDate && !isValidDate(monthDate)) return true;
    return false;
  };

  const isMonthSelected = (month: number) => {
    return selectedDate?.year() === viewDate.year() && selectedDate?.month() === month;
  };

  const isCurrentMonth = (month: number) => {
    const now = dayjs();
    return now.year() === viewDate.year() && now.month() === month;
  };

  return (
    <div className={cn('p-2', className)}>
      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => (
          <Button
            key={month}
            variant={isMonthSelected(month) ? 'default' : 'ghost'}
            size="sm"
            disabled={isMonthDisabled(month)}
            onClick={() => onSelect(viewDate.month(month).startOf('month'))}
            className={cn('h-10 text-sm', isCurrentMonth(month) && !isMonthSelected(month) && 'ring-1 ring-primary/50', isMonthDisabled(month) && 'opacity-40')}
          >
            {formatMonth(month)}
          </Button>
        ))}
      </div>
    </div>
  );
}

// 月份范围视图组件
export function MonthRangeView({ viewDate, selectedStartDate, selectedEndDate, onStartSelect, onEndSelect, minDate, maxDate, isValidDate, className }: BaseRangeViewProps): React.ReactNode {
  const { formatMonth } = useDatePickerFormatters();
  const locale = useDatePickerLocale();
  // 日期格式模板随语言变化，从当前语言上下文读取
  const { locale: currentLocale } = useLocale();
  const yearMonthPattern = processUiMessage('formatPatterns.yearMonth', { locale: currentLocale, messages: dateMessages });
  const months = Array.from({ length: 12 }, (_, i) => i);

  const isMonthDisabled = (month: number) => {
    const monthDate = viewDate.month(month);
    if (minDate && monthDate.isBefore(minDate, 'month')) return true;
    if (maxDate && monthDate.isAfter(maxDate, 'month')) return true;
    if (isValidDate && !isValidDate(monthDate)) return true;
    return false;
  };

  const isMonthInRange = (month: number) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const monthDate = viewDate.month(month);
    return monthDate.isAfter(selectedStartDate, 'month') && monthDate.isBefore(selectedEndDate, 'month');
  };

  const isStartMonth = (month: number) => {
    return selectedStartDate?.year() === viewDate.year() && selectedStartDate?.month() === month;
  };

  const isEndMonth = (month: number) => {
    return selectedEndDate?.year() === viewDate.year() && selectedEndDate?.month() === month;
  };

  const isCurrentMonth = (month: number) => {
    const now = dayjs();
    return now.year() === viewDate.year() && now.month() === month;
  };

  const handleMonthClick = (month: number) => {
    const monthDate = viewDate.month(month);

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // 开始新的选择
      onStartSelect(monthDate);
    } else if (selectedStartDate && !selectedEndDate) {
      // 选择结束月份
      if (monthDate.isBefore(selectedStartDate, 'month')) {
        // 如果选择的月份早于开始月份，交换位置
        onEndSelect(selectedStartDate);
        onStartSelect(monthDate);
      } else {
        onEndSelect(monthDate);
      }
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 双列选择器头部 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <h3 className="font-medium text-sm">{locale.rangeLabels.startMonth}</h3>
          <p className="text-muted-foreground text-xs">{selectedStartDate ? selectedStartDate.format(yearMonthPattern) : locale.notSelected}</p>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-sm">{locale.rangeLabels.endMonth}</h3>
          <p className="text-muted-foreground text-xs">{selectedEndDate ? selectedEndDate.format(yearMonthPattern) : locale.notSelected}</p>
        </div>
      </div>

      {/* 月份选择网格 */}
      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => (
          <Button
            key={month}
            variant={isStartMonth(month) || isEndMonth(month) ? 'default' : isMonthInRange(month) ? 'secondary' : 'ghost'}
            size="sm"
            disabled={isMonthDisabled(month)}
            onClick={() => handleMonthClick(month)}
            className={cn(
              'relative h-10 text-sm',
              isCurrentMonth(month) && !isStartMonth(month) && !isEndMonth(month) && 'ring-1 ring-primary/50',
              isMonthDisabled(month) && 'opacity-40',
              isMonthInRange(month) && 'bg-primary/10',
            )}
          >
            {formatMonth(month)}
            {isStartMonth(month) && (
              <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{locale.rangeMarkers.start}</span>
            )}
            {isEndMonth(month) && (
              <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{locale.rangeMarkers.end}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
