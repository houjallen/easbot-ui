/**
 * ViewSelectorHeader 视图选择器头部组件
 */

'use client';

import { cn } from '../../../utils/classnames';
import { dateMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { useLocale } from '../../../hooks/use-locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useMemo } from 'react';
import { Button } from '../../button';
import { useDatePickerLocale } from '../hooks/use-date-picker-locale';
import type { ViewSelectorHeaderProps } from './types';

export function ViewSelectorHeader({
  viewMode,
  onViewModeChange,
  viewDate,
  onViewDateChange,
  minDate,
  maxDate,
  showTimeView = false,
  showQuarterView = false,
  className,
}: ViewSelectorHeaderProps): React.ReactNode {
  const localeConfig = useDatePickerLocale();
  // 日期格式模板随语言变化，从当前语言上下文读取
  const { locale: currentLocale } = useLocale();

  // 检查是否可以导航到上一个/下一个时间段
  const canNavigatePrevious = useMemo(() => {
    if (!minDate) return true;

    switch (viewMode) {
      case 'years': {
        const startYear = Math.floor(viewDate.year() / 12) * 12;
        return startYear > minDate.year();
      }
      case 'months':
        return viewDate.year() > minDate.year();
      case 'quarters':
        return viewDate.year() > minDate.year();
      case 'days':
        return viewDate.subtract(1, 'month').isAfter(minDate, 'month') || viewDate.subtract(1, 'month').isSame(minDate, 'month');
      default:
        return viewDate.subtract(1, 'month').isAfter(minDate, 'month') || viewDate.subtract(1, 'month').isSame(minDate, 'month');
    }
  }, [viewMode, viewDate, minDate]);

  const canNavigateNext = useMemo(() => {
    if (!maxDate) return true;

    switch (viewMode) {
      case 'years': {
        const endYear = Math.floor(viewDate.year() / 12) * 12 + 11;
        return endYear < maxDate.year();
      }
      case 'months':
        return viewDate.year() < maxDate.year();
      case 'quarters':
        return viewDate.year() < maxDate.year();
      case 'days':
        return viewDate.add(1, 'month').isBefore(maxDate, 'month') || viewDate.add(1, 'month').isSame(maxDate, 'month');
      default:
        return viewDate.add(1, 'month').isBefore(maxDate, 'month') || viewDate.add(1, 'month').isSame(maxDate, 'month');
    }
  }, [viewMode, viewDate, maxDate]);

  const handlePrevious = () => {
    if (!canNavigatePrevious) return;

    switch (viewMode) {
      case 'years':
        onViewDateChange(viewDate.subtract(12, 'year'));
        break;
      case 'months':
        onViewDateChange(viewDate.subtract(1, 'year'));
        break;
      case 'quarters':
        onViewDateChange(viewDate.subtract(1, 'year'));
        break;
      case 'days':
        onViewDateChange(viewDate.subtract(1, 'month'));
        break;
      default:
        onViewDateChange(viewDate.subtract(1, 'month'));
        break;
    }
  };

  const handleNext = () => {
    if (!canNavigateNext) return;

    switch (viewMode) {
      case 'years':
        onViewDateChange(viewDate.add(12, 'year'));
        break;
      case 'months':
        onViewDateChange(viewDate.add(1, 'year'));
        break;
      case 'quarters':
        onViewDateChange(viewDate.add(1, 'year'));
        break;
      case 'days':
        onViewDateChange(viewDate.add(1, 'month'));
        break;
      default:
        onViewDateChange(viewDate.add(1, 'month'));
        break;
    }
  };

  const getHeaderTitle = () => {
    // 中文格式模板来自内置文案表，英文走 date-fns 默认格式
    const yearPattern = processUiMessage('formatPatterns.year', { locale: currentLocale, messages: dateMessages });
    const yearMonthPattern = processUiMessage('formatPatterns.yearMonth', { locale: currentLocale, messages: dateMessages });

    switch (viewMode) {
      case 'years': {
        const startYear = Math.floor(viewDate.year() / 12) * 12;
        return `${startYear} - ${startYear + 11}`;
      }
      case 'months':
        return localeConfig.formats.date === 'MM/DD/YYYY' ? viewDate.format('YYYY') : viewDate.format(yearPattern);
      case 'quarters':
        return localeConfig.formats.date === 'MM/DD/YYYY' ? viewDate.format('YYYY') : viewDate.format(yearPattern);
      case 'days':
        return localeConfig.formats.date === 'MM/DD/YYYY' ? viewDate.format('MMMM YYYY') : viewDate.format(yearMonthPattern);
      default:
        return localeConfig.formats.date === 'MM/DD/YYYY' ? viewDate.format('MMMM YYYY') : viewDate.format(yearMonthPattern);
    }
  };

  const handleTitleClick = () => {
    switch (viewMode) {
      case 'days':
        onViewModeChange('months');
        break;
      case 'months':
        onViewModeChange('years');
        break;
      case 'quarters':
        onViewModeChange('years');
        break;
      default:
        break;
    }
  };

  // 判断标题是否可点击
  const isTitleClickable = viewMode === 'days' || viewMode === 'months' || viewMode === 'quarters';

  return (
    <div className={cn('flex items-center justify-between border-b px-2 py-1', className)}>
      <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={!canNavigatePrevious} className="h-8 w-8 p-0">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={isTitleClickable ? handleTitleClick : undefined}
        className={cn('h-8 px-4 font-medium', isTitleClickable && 'hover:bg-accent', !isTitleClickable && 'cursor-default')}
        disabled={!isTitleClickable}
      >
        {getHeaderTitle()}
      </Button>

      <Button variant="ghost" size="sm" onClick={handleNext} disabled={!canNavigateNext} className="h-8 w-8 p-0">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
