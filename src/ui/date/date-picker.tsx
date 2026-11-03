/**
 * DatePicker 日期选择器组件
 *
 * @description
 * 基于 view 组件架构的日期选择器，支持日、月、年模式选择。
 * 具有视图选择器头部、快捷选择和确认取消功能。
 */

import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import * as React from 'react';
import { Button } from '../button';
import { Icon } from '../icon';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useDateFnsLocale } from './hooks/use-date-fns-locale';
import { useDatePickerLocale } from './hooks/use-date-picker-locale';
import type { DateShortcut } from './shortcuts';
import { DayView, MonthView, ShortcutView, ViewSelectorHeader, YearView, useDefaultDateShortcuts } from './view';
import type { ViewMode } from './view';

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

export interface DatePickerProps {
  /** 选中的日期 */
  selected?: Date;
  /** 日期选择回调 */
  onSelect?: (date: Date | undefined) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 日期格式 */
  format?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 禁用的日期判断函数 */
  disabledDate?: (date: Date) => boolean;
  /** 是否显示快捷选择 */
  showShortcuts?: boolean;
  /** 自定义快捷选择选项 */
  shortcuts?: DateShortcut[];
  /** 选择模式：day=日选择，month=月选择，year=年选择 */
  mode?: 'day' | 'month' | 'year';
  /** 额外的 CSS 类名 */
  className?: string;
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
}

export function DatePicker({
  selected,
  onSelect,
  format = DEFAULT_DATE_FORMAT,
  placeholder,
  disabled = false,
  disabledDate,
  showShortcuts = true,
  shortcuts,
  mode = 'day',
  className,
  popoverContentStyle,
}: DatePickerProps) {
  const fnsLocale = useDateFnsLocale();
  const pickerLocale = useDatePickerLocale();
  const defaultShortcuts = useDefaultDateShortcuts();
  const finalShortcuts = shortcuts || defaultShortcuts;
  const finalPlaceholder = placeholder || pickerLocale.placeholder;
  const [open, setOpen] = React.useState(false);
  const [tempSelected, setTempSelected] = React.useState<Date | undefined>(selected);
  const [viewMode, setViewMode] = React.useState<ViewMode>(() => {
    switch (mode) {
      case 'day':
        return 'days';
      case 'month':
        return 'months';
      case 'year':
        return 'years';
      default:
        return 'days';
    }
  });
  const [viewDate, setViewDate] = React.useState(dayjs());

  // 同步外部值到临时状态
  React.useEffect(() => {
    setTempSelected(selected);
    if (selected) {
      setViewDate(dayjs(selected));
    }
  }, [selected]);

  // 弹窗打开时初始化临时状态
  React.useEffect(() => {
    if (open) {
      setTempSelected(selected);
      if (selected) {
        setViewDate(dayjs(selected));
      } else {
        // 如果没有选中值，设置为当前月份
        setViewDate(dayjs());
      }
      // 根据mode设置初始视图
      switch (mode) {
        case 'day':
          setViewMode('days');
          break;
        case 'month':
          setViewMode('months');
          break;
        case 'year':
          setViewMode('years');
          break;
        default:
          break;
      }
    }
  }, [open, selected, mode]);

  // 处理快捷选择
  const handleShortcutSelect = (shortcut: DateShortcut) => {
    const selectedDate = shortcut.value();
    setTempSelected(selectedDate);
    onSelect?.(selectedDate);
    setOpen(false);
  };

  // 处理日期选择
  const handleDateSelect = (date: dayjs.Dayjs) => {
    if (viewMode === 'days') {
      // 在日视图中选择具体日期，直接返回
      setTempSelected(date.toDate());
      onSelect?.(date.toDate());
      setOpen(false);
    } else if (viewMode === 'months') {
      if (mode === 'month') {
        // 月模式：选择月份直接返回
        setTempSelected(date.toDate());
        onSelect?.(date.toDate());
        setOpen(false);
      } else {
        // 日模式：从月视图选择月份后切换到日视图
        setViewDate(date);
        setViewMode('days');
      }
    } else if (viewMode === 'years') {
      if (mode === 'year') {
        // 年模式：选择年份直接返回
        setTempSelected(date.toDate());
        onSelect?.(date.toDate());
        setOpen(false);
      } else if (mode === 'month') {
        // 月模式：从年视图选择年份后切换到月视图
        setViewDate(date);
        setViewMode('months');
      } else {
        // 日模式：从年视图选择年份后切换到月视图
        setViewDate(date);
        setViewMode('months');
      }
    }
  };

  // 确认选择（保留但不在UI中显示，仅用于快捷选择）
  const handleConfirm = () => {
    onSelect?.(tempSelected);
    setOpen(false);
  };

  // 取消选择（保留但不在UI中显示）
  const handleCancel = () => {
    setTempSelected(selected);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={disabled} className={cn(!selected && 'text-muted-foreground', className)} rightIcon={<Icon className="opacity-50" name="calendar" size={16} />}>
          {selected ? dayjs(selected).format(format) : <span>{finalPlaceholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
        <div className="flex">
          {/* 快捷选择侧边栏 */}
          {mode === 'day' && showShortcuts && finalShortcuts.length > 0 && <ShortcutView shortcuts={finalShortcuts} onSelect={handleShortcutSelect} show={true} title={pickerLocale.quickSelect} />}

          {/* 日期选择器 */}
          <div className="flex-1">
            {/* 视图选择器头部 */}
            <ViewSelectorHeader
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              viewDate={viewDate}
              onViewDateChange={setViewDate}
              selectedDate={tempSelected ? dayjs(tempSelected) : undefined}
              isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined}
            />

            {/* 根据视图模式渲染不同组件 */}
            {viewMode === 'days' && (
              <DayView
                viewDate={viewDate}
                selectedDate={tempSelected ? dayjs(tempSelected) : undefined}
                onSelect={handleDateSelect}
                isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined}
              />
            )}

            {viewMode === 'months' && (
              <MonthView
                viewDate={viewDate}
                selectedDate={tempSelected ? dayjs(tempSelected) : undefined}
                onSelect={handleDateSelect}
                isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined}
              />
            )}

            {viewMode === 'years' && (
              <YearView
                viewDate={viewDate}
                selectedDate={tempSelected ? dayjs(tempSelected) : undefined}
                onSelect={handleDateSelect}
                isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined}
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
