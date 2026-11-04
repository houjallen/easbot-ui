/**
 * YearView 年份视图组件
 */

'use client';

import { cn } from '../../../utils/classnames';
import { dateMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { useLocale } from '../../../hooks/use-locale';
import dayjs from 'dayjs';
import React from 'react';
import { Button } from '../../button';
import { useDatePickerLocale } from '../hooks/use-date-picker-locale';
import { truncateToGranularity } from './granularity';
import type { BaseRangeViewProps, BaseViewProps } from './types';

// 年份视图组件
export function YearView({ viewDate, selectedDate, onSelect, minDate, maxDate, isValidDate, className }: BaseViewProps): React.ReactNode {
  const startYear = Math.floor(viewDate.year() / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const isYearDisabled = (year: number) => {
    // ⚠️ 必须归一到「该年 1 月 1 日 00:00:00」——
    //    否则 `viewDate` 的月 / 日 / 时分秒会带入判定，导致误禁用。
    const yearDate = truncateToGranularity(viewDate.year(year), 'year');
    if (minDate && year < minDate.year()) return true;
    if (maxDate && year > maxDate.year()) return true;
    if (isValidDate && !isValidDate(yearDate)) return true;
    return false;
  };

  const isYearSelected = (year: number) => {
    return selectedDate?.year() === year;
  };

  const isCurrentYear = (year: number) => {
    return dayjs().year() === year;
  };

  return (
    <div className={cn('p-2', className)}>
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <Button
            key={year}
            variant={isYearSelected(year) ? 'default' : 'ghost'}
            size="sm"
            disabled={isYearDisabled(year)}
            onClick={() => onSelect(viewDate.year(year).startOf('year'))}
            className={cn('relative h-10 text-sm', isCurrentYear(year) && !isYearSelected(year) && 'ring-1 ring-primary/50', isYearDisabled(year) && 'opacity-40')}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}

// 年份范围视图组件
export function YearRangeView({ viewDate, selectedStartDate, selectedEndDate, onStartSelect, onEndSelect, minDate, maxDate, isValidDate, className }: BaseRangeViewProps): React.ReactNode {
  const locale = useDatePickerLocale();
  // 日期格式模板随语言变化，从当前语言上下文读取
  const { locale: currentLocale } = useLocale();
  const startYear = Math.floor(viewDate.year() / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const isYearDisabled = (year: number) => {
    // ⚠️ 必须归一到「该年 1 月 1 日 00:00:00」——
    //    否则 `viewDate` 的月 / 日 / 时分秒会带入判定，导致误禁用。
    const yearDate = truncateToGranularity(viewDate.year(year), 'year');
    if (minDate && year < minDate.year()) return true;
    if (maxDate && year > maxDate.year()) return true;
    if (isValidDate && !isValidDate(yearDate)) return true;
    return false;
  };

  const isYearInRange = (year: number) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const yearDate = truncateToGranularity(viewDate.year(year), 'year');
    return yearDate.isAfter(selectedStartDate, 'year') && yearDate.isBefore(selectedEndDate, 'year');
  };

  const isStartYear = (year: number) => {
    return selectedStartDate?.year() === year;
  };

  const isEndYear = (year: number) => {
    return selectedEndDate?.year() === year;
  };

  const isCurrentYear = (year: number) => {
    return dayjs().year() === year;
  };

  const handleYearClick = (year: number) => {
    const yearDate = viewDate.year(year);

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // 开始新的选择
      onStartSelect(yearDate);
    } else if (selectedStartDate && !selectedEndDate) {
      // 选择结束年份
      if (yearDate.isBefore(selectedStartDate, 'year')) {
        // 如果选择的年份早于开始年份，交换位置
        onEndSelect(selectedStartDate);
        onStartSelect(yearDate);
      } else {
        onEndSelect(yearDate);
      }
    }
  };

  const yearPattern = processUiMessage('formatPatterns.year', { locale: currentLocale, messages: dateMessages });

  return (
    <div className={cn('space-y-2', className)}>
      {/* 双列选择器头部 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <h3 className="font-medium text-sm">{locale.rangeLabels.startYear}</h3>
          <p className="text-muted-foreground text-xs">{selectedStartDate ? selectedStartDate.format(yearPattern) : locale.notSelected}</p>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-sm">{locale.rangeLabels.endYear}</h3>
          <p className="text-muted-foreground text-xs">{selectedEndDate ? selectedEndDate.format(yearPattern) : locale.notSelected}</p>
        </div>
      </div>

      {/* 年份选择网格 */}
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <Button
            key={year}
            variant={isStartYear(year) || isEndYear(year) ? 'default' : isYearInRange(year) ? 'secondary' : 'ghost'}
            size="sm"
            disabled={isYearDisabled(year)}
            onClick={() => handleYearClick(year)}
            className={cn(
              'relative h-10 text-sm',
              isCurrentYear(year) && !isStartYear(year) && !isEndYear(year) && 'ring-1 ring-primary/50',
              isYearDisabled(year) && 'opacity-40',
              isYearInRange(year) && 'bg-primary/10',
            )}
          >
            {year}
            {isStartYear(year) && (
              <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{locale.rangeMarkers.start}</span>
            )}
            {isEndYear(year) && (
              <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{locale.rangeMarkers.end}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
