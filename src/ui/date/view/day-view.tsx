/**
 * DayView 日期视图组件
 */

'use client';

import { Calendar } from '../../calendar';
import { useDateFnsLocale } from '../hooks/use-date-fns-locale';
import { useDatePickerLocale } from '../hooks/use-date-picker-locale';
import { cn } from '../../../utils/classnames';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import type { BaseRangeViewProps, BaseViewProps } from './types';

// 日期视图组件
export function DayView({ viewDate, selectedDate, onSelect, minDate, maxDate, isValidDate, className }: BaseViewProps): React.ReactNode {
  const fnsLocale = useDateFnsLocale();

  const disabledDate = (date: Date) => {
    if (minDate && dayjs(date).isBefore(dayjs(minDate.toDate()), 'day')) return true;
    if (maxDate && dayjs(date).isAfter(dayjs(maxDate.toDate()), 'day')) return true;
    if (isValidDate && !isValidDate(dayjs(date))) return true;
    return false;
  };

  return (
    <div className={cn('p-0', className)}>
      <Calendar
        locale={fnsLocale}
        mode="single"
        month={viewDate.toDate()}
        selected={selectedDate?.toDate()}
        onSelect={(date) => date && onSelect(dayjs(date))}
        disabled={disabledDate}
        components={{
          // ⚠️ `react-day-picker` v10 的组件键是 `MonthCaption`（v9 及更早叫 `Caption`）
          MonthCaption: () => <></>, // 隐藏月份标题
          // 📌 **必须隐藏 `Nav`** —— 翻页由 `ViewSelectorHeader` 统一提供。
          //    否则 react-day-picker 自带的 `PreviousMonthButton` / `NextMonthButton`
          //    （样式为 `absolute left-1` / `absolute right-1`）会因 `MonthCaption`
          //    为空而失去定位参照，**飘到快捷选择区两侧**，且点击不生效。
          Nav: () => <></>,
        }}
      />
    </div>
  );
}

// 日期范围视图组件
export function DayRangeView({ viewDate, selectedStartDate, selectedEndDate, onStartSelect, onEndSelect, minDate, maxDate, isValidDate, className }: BaseRangeViewProps): React.ReactNode {
  const fnsLocale = useDateFnsLocale();
  const locale = useDatePickerLocale();
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');

  // 构建DateRange对象供Calendar使用
  const dateRange: DateRange | undefined =
    selectedStartDate || selectedEndDate
      ? {
          from: selectedStartDate?.toDate(),
          to: selectedEndDate?.toDate(),
        }
      : undefined;

  const disabledDate = (date: Date) => {
    if (minDate && dayjs(date).isBefore(dayjs(minDate.toDate()), 'day')) return true;
    if (maxDate && dayjs(date).isAfter(dayjs(maxDate.toDate()), 'day')) return true;
    if (isValidDate && !isValidDate(dayjs(date))) return true;
    return false;
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) {
      // 清除选择
      onStartSelect(dayjs());
      onEndSelect(dayjs());
      setSelecting('start');
      return;
    }

    if (range.from && !range.to) {
      // 选择了开始日期
      onStartSelect(dayjs(range.from));
      setSelecting('end');
    } else if (range.from && range.to) {
      // 选择了范围
      onStartSelect(dayjs(range.from));
      onEndSelect(dayjs(range.to));
      setSelecting('start');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 双列选择器头部 */}
      <div className="grid grid-cols-2 gap-4 px-2">
        <div className="text-center">
          <h3 className="font-medium text-sm">{locale.rangeLabels.startDate}</h3>
          <p className="text-muted-foreground text-xs">{selectedStartDate ? selectedStartDate.format('YYYY-MM-DD') : locale.notSelected}</p>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-sm">{locale.rangeLabels.endDate}</h3>
          <p className="text-muted-foreground text-xs">{selectedEndDate ? selectedEndDate.format('YYYY-MM-DD') : locale.notSelected}</p>
        </div>
      </div>

      {/* 当前选择状态提示 */}
      <div className="px-2">
        <p className="text-center text-muted-foreground text-xs">{selecting === 'start' ? locale.selectionHints.selectStartDate : locale.selectionHints.selectEndDate}</p>
      </div>

      {/* 日期选择器 */}
      <div className="px-2">
        <Calendar
          locale={fnsLocale}
          mode="range"
          month={viewDate.toDate()}
          selected={dateRange}
          onSelect={handleDateSelect}
          disabled={disabledDate}
          components={{
            // ⚠️ `react-day-picker` v10 的组件键是 `MonthCaption`（v9 及更早叫 `Caption`）
            MonthCaption: () => <></>, // 隐藏月份标题
            // 📌 同 `DayView` —— 隐藏 `Nav`，翻页由 `ViewSelectorHeader` 统一提供
            Nav: () => <></>,
          }}
        />
      </div>
    </div>
  );
}
