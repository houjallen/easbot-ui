'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker, DayFlag, SelectionState, UI } from 'react-day-picker';

import { buttonVariants } from './button';
import { cn } from '../../lib/utils';

/**
 * 日历
 *
 * @description
 * 基于 `react-day-picker` v10 —— v10 的类名键由 `UI` 枚举常量定义
 * （如 `UI.MonthCaption` 对应 `month_caption`），并把 `caption` 拆分为
 * `month_caption` / `caption_label`；导航图标统一通过 `Chevron` 组件覆盖。
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        [UI.Months]: 'flex flex-col sm:flex-row gap-2',
        [UI.Month]: 'flex flex-col gap-4',
        [UI.MonthCaption]: 'flex justify-center pt-1 relative items-center w-full',
        [UI.CaptionLabel]: 'text-sm font-medium',
        [UI.Nav]: 'flex items-center gap-1',
        [UI.PreviousMonthButton]: cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'),
        [UI.NextMonthButton]: cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'),
        [UI.MonthGrid]: 'w-full border-collapse space-x-1',
        [UI.Weekdays]: 'flex',
        [UI.Weekday]: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        [UI.Week]: 'flex w-full mt-2',
        [UI.Day]: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        [UI.DayButton]: cn(buttonVariants({ variant: 'ghost' }), 'size-8 p-0 font-normal aria-selected:opacity-100'),
        [SelectionState.range_start]: 'day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground',
        [SelectionState.range_end]: 'day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground',
        [SelectionState.selected]: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        [DayFlag.today]: 'bg-accent text-accent-foreground',
        [DayFlag.outside]: 'day-outside text-muted-foreground aria-selected:text-muted-foreground',
        [DayFlag.disabled]: 'text-muted-foreground opacity-50',
        [SelectionState.range_middle]: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        [DayFlag.hidden]: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          if (orientation === 'left') {
            return <ChevronLeft className={cn('size-4', chevronClassName)} {...chevronProps} />;
          }
          if (orientation === 'right') {
            return <ChevronRight className={cn('size-4', chevronClassName)} {...chevronProps} />;
          }
          return <ChevronLeft className={cn('size-4', chevronClassName)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
