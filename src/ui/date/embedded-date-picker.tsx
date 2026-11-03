'use client';

import { Button } from '../button';
import { useDateFnsLocale } from './hooks/use-date-fns-locale';
import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDatePickerLocale } from './hooks/use-date-picker-locale';
import { createDateShortcuts } from './shortcuts';
import type { DateShortcut } from './shortcuts';
import { DayView, MonthView, QuarterView, ShortcutView, TimeView, ViewSelectorHeader, YearView } from './view';
import type { ViewMode } from './view';

// 嵌入式日期选择器属性
export interface EmbeddedDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;

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

  // 移动端适配
  isMobile?: boolean;

  // 确认模式
  requireConfirm?: boolean;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
}

export function EmbeddedDatePicker({
  value,
  onChange,
  className,

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

  isMobile = false,

  requireConfirm = false,
  onConfirm,
  onCancel,
}: EmbeddedDatePickerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [viewDate, setViewDate] = useState(() => (value ? dayjs(value) : dayjs()));
  const [tempValue, setTempValue] = useState<Date | undefined>(value);
  const fnsLocale = useDateFnsLocale();
  const pickerLocale = useDatePickerLocale();

  // 使用locale创建默认快捷选择
  const defaultShortcuts = createDateShortcuts(pickerLocale);
  const finalShortcuts = shortcuts || defaultShortcuts;

  // 同步外部值
  useEffect(() => {
    setTempValue(value);
    if (value) {
      setViewDate(dayjs(value));
    }
  }, [value]);

  // 处理视图模式变化
  const handleViewModeChange = (newMode: ViewMode) => {
    if (allowedViews.includes(newMode) || (newMode === 'time' && showTimeView) || (newMode === 'quarters' && showQuarterView)) {
      setViewMode(newMode);
    }
  };

  // 处理日期选择
  const handleDateSelect = (date: dayjs.Dayjs) => {
    const newDate = date.toDate();

    if (requireConfirm) {
      setTempValue(newDate);
    } else {
      onChange?.(newDate);
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
    }
  };

  // 处理快捷选择
  const handleShortcutSelect = (shortcut: DateShortcut) => {
    const date = shortcut.value();
    handleDateSelect(dayjs(date));
  };

  // 处理确认
  const handleConfirm = () => {
    if (tempValue) {
      onChange?.(tempValue);
      onConfirm?.(tempValue);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setTempValue(value);
    onCancel?.();
  };

  // 渲染当前视图
  const renderCurrentView = () => {
    const selectedDate = (requireConfirm ? tempValue : value) ? dayjs(requireConfirm ? tempValue : value) : undefined;
    const minDayjs = minDate ? dayjs(minDate) : undefined;
    const maxDayjs = maxDate ? dayjs(maxDate) : undefined;

    const viewClassName = cn(isMobile && 'px-2', !isMobile && 'px-3');

    switch (viewMode) {
      case 'years':
        return <YearView viewDate={viewDate} selectedDate={selectedDate} onSelect={handleDateSelect} minDate={minDayjs} maxDate={maxDayjs} className={viewClassName} />;

      case 'months':
        return <MonthView viewDate={viewDate} selectedDate={selectedDate} onSelect={handleDateSelect} minDate={minDayjs} maxDate={maxDayjs} className={viewClassName} />;

      case 'quarters':
        return <QuarterView viewDate={viewDate} selectedDate={selectedDate} onSelect={handleDateSelect} minDate={minDayjs} maxDate={maxDayjs} className={viewClassName} />;

      case 'time':
        return <TimeView selectedDate={selectedDate} onSelect={handleDateSelect} showSeconds={showSeconds} timeConstraints={timeConstraints} className={viewClassName} />;

      case 'days':
        return (
          <div className={viewClassName}>
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
          </div>
        );
      default:
        return (
          <div className={viewClassName}>
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
          </div>
        );
    }
  };

  // 渲染视图模式切换按钮
  const renderViewModeButtons = () => {
    if (allowedViews.length <= 1 && !showTimeView && !showQuarterView) {
      return null;
    }

    const availableViews = [...allowedViews];
    if (showTimeView) availableViews.push('time');
    if (showQuarterView) availableViews.push('quarters');

    return (
      <div className={cn('flex gap-1 border-b p-2', isMobile && 'flex-wrap justify-center')}>
        {availableViews.map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? 'default' : 'ghost'}
            size={isMobile ? 'sm' : 'sm'}
            onClick={() => handleViewModeChange(mode)}
            className={cn('text-xs', isMobile && 'min-w-[60px]')}
          >
            {getViewModeLabel(mode)}
          </Button>
        ))}
      </div>
    );
  };

  // 获取视图模式标签
  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'years':
        return pickerLocale.viewModes.year;
      case 'months':
        return pickerLocale.viewModes.month;
      case 'quarters':
        return pickerLocale.viewModes.quarter;
      case 'days':
        return pickerLocale.viewModes.day;
      case 'time':
        return pickerLocale.viewModes.time;
      default:
        return mode;
    }
  };

  // 渲染快捷选择面板
  const renderShortcuts = () => {
    if (!showShortcuts || finalShortcuts.length === 0) return null;

    if (isMobile) {
      // 移动端横向滚动布局
      return (
        <div className="border-b p-2">
          <div className="mb-2 font-medium text-sm">{pickerLocale.shortcuts.title}</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {finalShortcuts.map((shortcut, index) => (
              <Button key={index} variant="ghost" size="sm" onClick={() => handleShortcutSelect(shortcut)} className="h-7 flex-shrink-0 whitespace-nowrap px-3 text-xs">
                {shortcut.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // 桌面端使用 ShortcutView 组件
    return <ShortcutView shortcuts={finalShortcuts} onSelect={handleShortcutSelect} show={true} title={pickerLocale.shortcuts.title} minWidth="w-32" className="flex-shrink-0" />;
  };

  // 渲染确认按钮
  const renderConfirmButtons = () => {
    if (!requireConfirm) return null;

    return (
      <div className={cn('flex gap-2 border-t p-3', isMobile && 'p-2')}>
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1">
          {pickerLocale.cancel}
        </Button>
        <Button size="sm" onClick={handleConfirm} className="flex-1">
          {pickerLocale.confirm}
        </Button>
      </div>
    );
  };

  return (
    <div className={cn('rounded-lg border bg-background shadow-sm', isMobile ? 'mx-auto w-full max-w-sm' : 'w-auto', className)}>
      {renderViewModeButtons()}

      <ViewSelectorHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        showTimeView={showTimeView}
        showQuarterView={showQuarterView}
        className={isMobile ? 'px-2' : undefined}
      />

      <div className={cn(isMobile ? 'flex flex-col' : 'flex')}>
        {renderShortcuts()}

        <div className="flex-1">{renderCurrentView()}</div>
      </div>

      {renderConfirmButtons()}
    </div>
  );
}
