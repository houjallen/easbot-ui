/**
 * QuarterView 季度视图组件
 */

'use client';

import { cn } from '../../../utils/classnames';
import { dateMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { useLocale } from '../../../hooks/use-locale';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import React from 'react';
import { Button } from '../../button';
import { useDatePickerFormatters, useDatePickerLocale } from '../hooks/use-date-picker-locale';
import { truncateToGranularity } from './granularity';
import type { BaseRangeViewProps, BaseViewProps } from './types';

// 扩展dayjs支持季度操作
dayjs.extend(quarterOfYear);

// 季度视图组件
export function QuarterView({ viewDate, selectedDate, onSelect, minDate, maxDate, isValidDate, className }: BaseViewProps): React.ReactNode {
  const { formatQuarter } = useDatePickerFormatters();
  const localeConfig = useDatePickerLocale();

  const quarters = [
    { quarter: 1 as const, months: [0, 1, 2] },
    { quarter: 2 as const, months: [3, 4, 5] },
    { quarter: 3 as const, months: [6, 7, 8] },
    { quarter: 4 as const, months: [9, 10, 11] },
  ];

  const isQuarterDisabled = (quarter: number) => {
    const quarterStartMonth = (quarter - 1) * 3;
    // ⚠️ 必须归一到「该季度首月 1 日 00:00:00」——
    //    否则 `viewDate` 的日 / 时分秒会带入判定，导致误禁用。
    const quarterDate = truncateToGranularity(viewDate.month(quarterStartMonth), 'quarter');
    if (minDate && quarterDate.isBefore(minDate, 'quarter')) return true;
    if (maxDate && quarterDate.isAfter(maxDate, 'quarter')) return true;
    if (isValidDate && !isValidDate(quarterDate)) return true;
    return false;
  };

  const isQuarterSelected = (quarter: number) => {
    if (!selectedDate || selectedDate.year() !== viewDate.year()) return false;
    const selectedQuarter = Math.floor(selectedDate.month() / 3) + 1;
    return selectedQuarter === quarter;
  };

  const isCurrentQuarter = (quarter: number) => {
    const now = dayjs();
    if (now.year() !== viewDate.year()) return false;
    const currentQuarter = Math.floor(now.month() / 3) + 1;
    return currentQuarter === quarter;
  };

  return (
    <div className={cn('p-2', className)}>
      <div className="grid grid-cols-2 gap-2">
        {quarters.map(({ quarter }) => (
          <Button
            key={quarter}
            variant={isQuarterSelected(quarter) ? 'default' : 'ghost'}
            size="sm"
            disabled={isQuarterDisabled(quarter)}
            onClick={() => onSelect(viewDate.month((quarter - 1) * 3))}
            className={cn('flex h-16 flex-col gap-1 text-sm', isCurrentQuarter(quarter) && !isQuarterSelected(quarter) && 'ring-1 ring-primary/50', isQuarterDisabled(quarter) && 'opacity-40')}
          >
            <span className="font-medium">{formatQuarter(quarter)}</span>
            <span className="text-xs opacity-70">{localeConfig.quarterDescriptions[`Q${quarter}` as keyof typeof localeConfig.quarterDescriptions]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// 季度范围视图组件
export function QuarterRangeView({ viewDate, selectedStartDate, selectedEndDate, onStartSelect, onEndSelect, minDate, maxDate, isValidDate, className }: BaseRangeViewProps): React.ReactNode {
  const { formatQuarter } = useDatePickerFormatters();
  const localeConfig = useDatePickerLocale();
  // 日期格式模板随语言变化，从当前语言上下文读取
  const { locale: currentLocale } = useLocale();
  const yearPattern = processUiMessage('formatPatterns.year', { locale: currentLocale, messages: dateMessages });

  const quarters = [
    { quarter: 1 as const, months: [0, 1, 2] },
    { quarter: 2 as const, months: [3, 4, 5] },
    { quarter: 3 as const, months: [6, 7, 8] },
    { quarter: 4 as const, months: [9, 10, 11] },
  ];

  const isQuarterDisabled = (quarter: number) => {
    const quarterStartMonth = (quarter - 1) * 3;
    // ⚠️ 必须归一到「该季度首月 1 日 00:00:00」——
    //    否则 `viewDate` 的日 / 时分秒会带入判定，导致误禁用。
    const quarterDate = truncateToGranularity(viewDate.month(quarterStartMonth), 'quarter');
    if (minDate && quarterDate.isBefore(minDate, 'quarter')) return true;
    if (maxDate && quarterDate.isAfter(maxDate, 'quarter')) return true;
    if (isValidDate && !isValidDate(quarterDate)) return true;
    return false;
  };

  const isQuarterInRange = (quarter: number) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const quarterDate = truncateToGranularity(viewDate.month((quarter - 1) * 3), 'quarter');
    return quarterDate.isAfter(selectedStartDate, 'quarter') && quarterDate.isBefore(selectedEndDate, 'quarter');
  };

  const isStartQuarter = (quarter: number) => {
    if (!selectedStartDate || selectedStartDate.year() !== viewDate.year()) return false;
    const selectedQuarter = Math.floor(selectedStartDate.month() / 3) + 1;
    return selectedQuarter === quarter;
  };

  const isEndQuarter = (quarter: number) => {
    if (!selectedEndDate || selectedEndDate.year() !== viewDate.year()) return false;
    const selectedQuarter = Math.floor(selectedEndDate.month() / 3) + 1;
    return selectedQuarter === quarter;
  };

  const isCurrentQuarter = (quarter: number) => {
    const now = dayjs();
    if (now.year() !== viewDate.year()) return false;
    const currentQuarter = Math.floor(now.month() / 3) + 1;
    return currentQuarter === quarter;
  };

  const handleQuarterClick = (quarter: number) => {
    const quarterDate = viewDate.month((quarter - 1) * 3);

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // 开始新的选择
      onStartSelect(quarterDate);
    } else if (selectedStartDate && !selectedEndDate) {
      // 选择结束季度
      if (quarterDate.isBefore(selectedStartDate, 'quarter')) {
        // 如果选择的季度早于开始季度，交换位置
        onEndSelect(selectedStartDate);
        onStartSelect(quarterDate);
      } else {
        onEndSelect(quarterDate);
      }
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 双列选择器头部 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <h3 className="font-medium text-sm">{localeConfig.rangeLabels.startQuarter}</h3>
          <p className="text-muted-foreground text-xs">{selectedStartDate ? `${selectedStartDate.format(yearPattern)}Q${Math.floor(selectedStartDate.month() / 3) + 1}` : localeConfig.notSelected}</p>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-sm">{localeConfig.rangeLabels.endQuarter}</h3>
          <p className="text-muted-foreground text-xs">{selectedEndDate ? `${selectedEndDate.format(yearPattern)}Q${Math.floor(selectedEndDate.month() / 3) + 1}` : localeConfig.notSelected}</p>
        </div>
      </div>

      {/* 季度选择网格 */}
      <div className="grid grid-cols-2 gap-2">
        {quarters.map(({ quarter }) => (
          <Button
            key={quarter}
            variant={isStartQuarter(quarter) || isEndQuarter(quarter) ? 'default' : isQuarterInRange(quarter) ? 'secondary' : 'ghost'}
            size="sm"
            disabled={isQuarterDisabled(quarter)}
            onClick={() => handleQuarterClick(quarter)}
            className={cn(
              'relative flex h-16 flex-col gap-1 text-sm',
              isCurrentQuarter(quarter) && !isStartQuarter(quarter) && !isEndQuarter(quarter) && 'ring-1 ring-primary/50',
              isQuarterDisabled(quarter) && 'opacity-40',
              isQuarterInRange(quarter) && 'bg-primary/10',
            )}
          >
            <span className="font-medium">{formatQuarter(quarter)}</span>
            <span className="text-xs opacity-70">{localeConfig.quarterDescriptions[`Q${quarter}` as keyof typeof localeConfig.quarterDescriptions]}</span>
            {isStartQuarter(quarter) && (
              <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{localeConfig.rangeMarkers.start}</span>
            )}
            {isEndQuarter(quarter) && (
              <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{localeConfig.rangeMarkers.end}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
