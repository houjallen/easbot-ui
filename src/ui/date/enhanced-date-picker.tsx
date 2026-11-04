'use client';

import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Button } from '../button';
import { Icon } from '../icon';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useDateFnsLocale } from './hooks/use-date-fns-locale';
import { useDatePickerFormatters, useDatePickerLocale } from './hooks/use-date-picker-locale';
import type { DatePickerLocale } from './locale';
import type { DateShortcut } from './shortcuts';
import { DayView, MonthView, QuarterView, ShortcutView, TimeView, ViewSelectorHeader, YearView, useDefaultDateShortcuts } from './view';
import type { ViewMode } from './view';
import { resolveLocale } from '../../utils/locale';

// 增强日期选择器属性
export interface EnhancedDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  popoverClassName?: string;
  locale?: string;

  // 视图模式相关
  viewMode?: ViewMode;
  allowedViews?: ViewMode[];
  showTimeView?: boolean;
  showQuarterView?: boolean;

  // 时间约束
  timeConstraints?: {
    hours?: { min: number; max: number; step?: number };
    minutes?: { min: number; max: number; step?: number };
    seconds?: { min: number; max: number; step?: number };
  };
  showSeconds?: boolean;

  // 日期约束
  minDate?: Date;
  maxDate?: Date;
  disabledDate?: (date: Date) => boolean;

  // 快捷选择
  showShortcuts?: boolean;
  shortcuts?: DateShortcut[];

  // 确认模式
  requireConfirm?: boolean;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
}

export function EnhancedDatePicker({
  value,
  onChange,
  format,
  placeholder,
  disabled = false,
  className,
  popoverClassName,
  locale,

  viewMode: initialViewMode = 'days',
  allowedViews = ['days', 'months', 'years'],
  showTimeView = false,
  showQuarterView = false,

  timeConstraints,
  showSeconds = false,

  minDate,
  maxDate,
  disabledDate,

  showShortcuts = false,
  shortcuts,

  requireConfirm = false,
  onConfirm,
  onCancel,
}: EnhancedDatePickerProps) {
  const fnsLocale = useDateFnsLocale();
  // `locale` 对外为宽松的 `string`，内部收敛为受支持的 `Locale`（'zh-CN' | 'en-US'）
  const resolvedLocale = locale ? resolveLocale(locale) : undefined;
  const pickerLocale = useDatePickerLocale(resolvedLocale);
  const { formatViewMode } = useDatePickerFormatters(resolvedLocale);
  const defaultShortcuts = useDefaultDateShortcuts();
  const finalShortcuts = shortcuts || defaultShortcuts;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [viewDate, setViewDate] = useState(() => (value ? dayjs(value) : dayjs()));
  const [tempValue, setTempValue] = useState<Date | undefined>(value);

  // 动态确定格式和占位符
  const displayFormat = useMemo(() => {
    if (format) return format;

    const hasTime = showTimeView || allowedViews.includes('time');
    const hasSeconds = showSeconds;

    if (viewMode === 'time') {
      return hasSeconds ? pickerLocale.formats.time : 'HH:mm';
    }

    if (hasTime) {
      return hasSeconds ? pickerLocale.formats.datetime : 'YYYY-MM-DD HH:mm';
    }

    return pickerLocale.formats.date;
  }, [format, showTimeView, allowedViews, viewMode, showSeconds, pickerLocale]);

  const displayPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;

    const hasTime = showTimeView || allowedViews.includes('time');

    if (viewMode === 'time') {
      return pickerLocale.selectTime;
    }

    if (hasTime) {
      return pickerLocale.selectDateTime;
    }

    return pickerLocale.selectDate;
  }, [placeholder, showTimeView, allowedViews, viewMode, pickerLocale]);

  // 处理视图模式变化
  const handleViewModeChange = (newMode: ViewMode) => {
    if (allowedViews.includes(newMode) || (newMode === 'time' && showTimeView) || (newMode === 'quarters' && showQuarterView)) {
      setViewMode(newMode);
    }
  };

  // 处理快捷选择
  const handleShortcutSelect = (shortcut: DateShortcut) => {
    const selectedDate = shortcut.value();
    handleDateSelect(dayjs(selectedDate));
  };

  // 处理日期选择
  const handleDateSelect = (date: dayjs.Dayjs) => {
    const newDate = date.toDate();

    if (requireConfirm) {
      setTempValue(newDate);
    } else {
      onChange?.(newDate);
      if (viewMode === 'days' && !showTimeView) {
        setIsOpen(false);
      }
    }

    // 根据视图模式决定下一步
    switch (viewMode) {
      case 'years':
        if (allowedViews.includes('months')) {
          setViewMode('months');
          setViewDate(date);
        } else if (allowedViews.includes('days')) {
          setViewMode('days');
          setViewDate(date);
        }
        break;
      case 'months':
        if (allowedViews.includes('days')) {
          setViewMode('days');
          setViewDate(date);
        }
        break;
      case 'quarters':
        if (allowedViews.includes('days')) {
          setViewMode('days');
          setViewDate(date);
        }
        break;
      default:
        break;
    }
  };

  // 处理确认
  const handleConfirm = () => {
    if (tempValue) {
      onChange?.(tempValue);
      onConfirm?.(tempValue);
    }
    setIsOpen(false);
  };

  // 处理取消
  const handleCancel = () => {
    setTempValue(value);
    onCancel?.();
    setIsOpen(false);
  };

  // 渲染当前视图
  const renderCurrentView = () => {
    const selectedDate = (requireConfirm ? tempValue : value) ? dayjs(requireConfirm ? tempValue : value) : undefined;
    const minDayjs = minDate ? dayjs(minDate) : undefined;
    const maxDayjs = maxDate ? dayjs(maxDate) : undefined;

    switch (viewMode) {
      case 'years':
        return <YearView viewDate={viewDate} selectedDate={selectedDate} onSelect={handleDateSelect} minDate={minDayjs} maxDate={maxDayjs} />;

      case 'months':
        return <MonthView viewDate={viewDate} selectedDate={selectedDate} onSelect={handleDateSelect} minDate={minDayjs} maxDate={maxDayjs} />;

      case 'quarters':
        return <QuarterView viewDate={viewDate} selectedDate={selectedDate} onSelect={handleDateSelect} minDate={minDayjs} maxDate={maxDayjs} />;

      case 'time':
        return <TimeView selectedDate={selectedDate} onSelect={handleDateSelect} showSeconds={showSeconds} timeConstraints={timeConstraints} />;
      case 'days':
        return (
          <DayView
            viewDate={viewDate}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
            minDate={minDayjs}
            maxDate={maxDayjs}
            isValidDate={(date) => {
              if (disabledDate?.(date.toDate())) return false;
              return true;
            }}
          />
        );
      default:
        return (
          <DayView
            viewDate={viewDate}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
            minDate={minDayjs}
            maxDate={maxDayjs}
            isValidDate={(date) => {
              if (disabledDate?.(date.toDate())) return false;
              return true;
            }}
          />
        );
    }
  };

  // 渲染视图模式切换按钮
  const renderViewModeButtons = () => {
    if (allowedViews.length <= 1 && !showTimeView && !showQuarterView) {
      return null;
    }

    // 📌 用 `Set` 去重 —— `allowedViews` 可能已含 `time` / `quarters`，
    //    再 `push` 会产生**重复 key**（React 报 "Encountered two children with the same key"）。
    const availableViews = new Set<ViewMode>(allowedViews);
    if (showTimeView) availableViews.add('time');
    if (showQuarterView) availableViews.add('quarters');

    // ViewMode 到 viewModes 键的映射
    const viewModeToKey = (mode: ViewMode): keyof DatePickerLocale['viewModes'] => {
      switch (mode) {
        case 'days':
          return 'day';
        case 'months':
          return 'month';
        case 'years':
          return 'year';
        case 'quarters':
          return 'quarter';
        case 'time':
          return 'time';
        default:
          return 'day';
      }
    };

    return (
      <div className="flex gap-1 border-b p-2">
        {Array.from(availableViews).map((mode) => (
          <Button key={mode} variant={viewMode === mode ? 'default' : 'ghost'} size="sm" onClick={() => handleViewModeChange(mode)} className="text-xs">
            {formatViewMode(viewModeToKey(mode))}
          </Button>
        ))}
      </div>
    );
  };

  // 渲染确认按钮
  const renderConfirmButtons = () => {
    if (!requireConfirm) return null;

    return (
      <div className="flex gap-2 border-t p-2">
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1">
          {pickerLocale.cancel}
        </Button>
        <Button size="sm" onClick={handleConfirm} className="flex-1">
          {pickerLocale.confirm}
        </Button>
      </div>
    );
  };

  const displayValue = (requireConfirm ? tempValue : value) ? dayjs(requireConfirm ? tempValue : value).format(displayFormat) : '';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={disabled} className={cn(!displayValue && 'text-muted-foreground', className)} rightIcon={<Icon name="calendar" size={16} />}>
          {displayValue || displayPlaceholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', popoverClassName)} align="start">
        {renderViewModeButtons()}

        <ViewSelectorHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          viewDate={viewDate}
          onViewDateChange={setViewDate}
          showTimeView={showTimeView}
          showQuarterView={showQuarterView}
        />

        <div className="flex">
          {/* 快捷选择侧边栏 */}
          {showShortcuts && finalShortcuts.length > 0 && <ShortcutView shortcuts={finalShortcuts} onSelect={handleShortcutSelect} show={true} title={pickerLocale.quickSelect} />}

          {/* 主选择区域 */}
          <div className="flex-1">{renderCurrentView()}</div>
        </div>

        {renderConfirmButtons()}
      </PopoverContent>
    </Popover>
  );
}
