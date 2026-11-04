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
    // 📌 **标题点击的下一级视图必须受 `showQuarterView` / `showTimeView` 约束** ——
    //    此前这两个 prop 虽然被传进来，但**从未被使用** → 标题点击恒定按
    //    `days → months → years` 跳转，导致：
    //    ① 开启 `showQuarterView` 时，用户从「月」点标题会跳到「年」，
    //       **跳过了「季度」视图**（季度视图只能靠上方的视图切换按钮进入）；
    //    ② 开启 `showTimeView` 时，从「年」点标题无处可去（`years` 已是最末级）。
    switch (viewMode) {
      case 'days':
        onViewModeChange('months');
        break;
      case 'months':
        // 有季度视图时，「月」的下一级是「季度」，否则才是「年」
        onViewModeChange(showQuarterView ? 'quarters' : 'years');
        break;
      case 'quarters':
        onViewModeChange('years');
        break;
      case 'years':
        // 开启时间视图时，「年」的下一级是「时间」
        if (showTimeView) {
          onViewModeChange('time');
        }
        break;
      default:
        break;
    }
  };

  // 判断标题是否可点击
  // 📌 `years` 开启 `showTimeView` 后**也可点击**（可进入时间视图）
  const isTitleClickable = viewMode === 'days' || viewMode === 'months' || viewMode === 'quarters' || (viewMode === 'years' && showTimeView);

  return (
    <div className={cn('flex items-center justify-between border-b px-2 py-1', className)}>
      <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={!canNavigatePrevious} className="h-8 w-8 shrink-0 p-0">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={isTitleClickable ? handleTitleClick : undefined}
        className={cn('h-8 shrink-0 px-4 font-medium', isTitleClickable && 'hover:bg-accent', !isTitleClickable && 'cursor-default')}
        disabled={!isTitleClickable}
      >
        {getHeaderTitle()}
      </Button>

      <Button variant="ghost" size="sm" onClick={handleNext} disabled={!canNavigateNext} className="h-8 w-8 shrink-0 p-0">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
