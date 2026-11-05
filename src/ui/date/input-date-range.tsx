/**
 * InputDateRange 日期范围输入组件
 *
 * @description
 * 基于 Input 组件封装的日期范围输入组件，支持手动输入和选择器选择。
 * 使用双列面板选择，每块独立控制日期选择和年月切换。
 * 支持 day/month/year 模式参数。
 */

import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import * as React from 'react';
import { useMemo } from 'react';
import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useDatePickerLocale } from './hooks/use-date-picker-locale';
import { DayView, MonthView, ViewSelectorHeader, YearView } from './view';
import type { ViewMode } from './view';

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

export interface InputDateRangeProps {
  /** 日期范围值 */
  value?: [string, string] | undefined;
  /** 值变化回调 */
  onChange?: (value: [string, string] | undefined) => void;
  /** 占位符文本 */
  placeholder?: string;
  /**
   * 日期格式
   *
   * @description
   * **唯一真值源** —— 所有模式（`day` / `month` / `year`）均按此格式解析与输出。
   *
   * ⚠️ 未传时按 `mode` 取对应精度的默认格式：
   * `day` → `'YYYY-MM-DD'` · `month` → `'YYYY-MM'` · `year` → `'YYYY'`。
   */
  format?: string;
  /** 选择器模式，控制选择的精度 */
  mode?: 'day' | 'month' | 'year';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 禁用的日期判断函数 */
  disabledDate?: (date: Date) => boolean;
  /** 分隔符 */
  separator?: string;
  /** 额外的 CSS 类名 */
  className?: string;
  /** 输入框名称 */
  name?: string;
  /** 是否必填 */
  required?: boolean;
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
}

export const InputDateRange = React.forwardRef<HTMLInputElement, InputDateRangeProps>(
  (
    {
      value,
      onChange,
      placeholder,
      format: formatProp,
      mode = 'day',
      disabled = false,
      readOnly = false,
      error = false,
      disabledDate,
      separator = ' ~ ',
      className,
      name,
      required,
      popoverContentStyle,
      ...props
    },
    ref,
  ) => {
    const pickerLocale = useDatePickerLocale();
    const finalPlaceholder = placeholder || pickerLocale.placeholderDateRange;

    // 📌 **`format` 是唯一真值源，`mode` 只决定「未传 format 时的默认值」** ——
    //    修复前，`mode === 'month' | 'year'` 会**硬编码**覆盖 `format`
    //    （`'YYYY-MM'` / `'YYYY'`），导致消费方传的 `format`（如 `'MM/DD/YYYY'`）
    //    在这两种模式下**完全失效** —— 与单选版 `InputDate`（所有模式一律走 `format`）行为不一致。
    //    现在：`format` 显式传入时**始终生效**；未传时按 `mode` 取对应精度的默认格式。
    const format = React.useMemo(() => {
      if (formatProp) return formatProp;
      if (mode === 'month') return 'YYYY-MM';
      if (mode === 'year') return 'YYYY';
      return DEFAULT_DATE_FORMAT;
    }, [formatProp, mode]);

    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [startViewMode, setStartViewMode] = React.useState<ViewMode>(mode === 'day' ? 'days' : mode === 'month' ? 'months' : 'years');
    const [endViewMode, setEndViewMode] = React.useState<ViewMode>(mode === 'day' ? 'days' : mode === 'month' ? 'months' : 'years');
    const [startViewDate, setStartViewDate] = React.useState<dayjs.Dayjs>(dayjs());
    const [endViewDate, setEndViewDate] = React.useState<dayjs.Dayjs>(dayjs());
    const [tempStartDate, setTempStartDate] = React.useState<dayjs.Dayjs | undefined>();
    const [tempEndDate, setTempEndDate] = React.useState<dayjs.Dayjs | undefined>();

    // 格式化日期范围值
    const formatDateRange = React.useCallback(
      (range: [string, string] | undefined): string => {
        if (!range?.[0] || !range[1]) return '';
        try {
          const start = dayjs(range[0]).format(format);
          const end = dayjs(range[1]).format(format);
          return `${start}${separator}${end}`;
        } catch {
          return '';
        }
      },
      [format, separator],
    );

    // 解析日期范围值 - 根据模式解析不同格式
    const parseDateRange = React.useCallback(
      (rangeStr: string): [string, string] | undefined => {
        if (!rangeStr) return undefined;
        try {
          const parts = rangeStr.split(separator);
          if (parts.length !== 2) return undefined;

          // 📌 解析 / 输出格式统一走 `format`（`mode` 的默认格式已在上面派生）
          const parseFormat = format;
          const outputFormat = format;

          // `noUncheckedIndexedAccess` 下索引访问可能为 undefined，
          // 但此处已由 `parts.length !== 2` 的提前返回保证恰好两段
          const start = dayjs(parts[0]!.trim(), parseFormat, true);
          const end = dayjs(parts[1]!.trim(), parseFormat, true);

          if (start.isValid() && end.isValid()) {
            return [start.format(outputFormat), end.format(outputFormat)];
          }
          return undefined;
        } catch {
          return undefined;
        }
      },
      // 📌 `mode` 不再是依赖 —— 它只用于派生 `format`（见上方 useMemo），
      //    `format` 变化即已覆盖 mode 变化的场景。
      [format, separator],
    );

    // 同步外部值到内部状态
    React.useEffect(() => {
      setInputValue(formatDateRange(value));
      if (value?.[0] && value[1]) {
        setTempStartDate(dayjs(value[0]));
        setTempEndDate(dayjs(value[1]));
      } else {
        setTempStartDate(undefined);
        setTempEndDate(undefined);
      }
    }, [value, formatDateRange]);

    // 弹窗打开时初始化临时状态
    React.useEffect(() => {
      if (open) {
        if (value?.[0] && value[1]) {
          const startDate = dayjs(value[0]);
          const endDate = dayjs(value[1]);
          setTempStartDate(startDate);
          setTempEndDate(endDate);
          setStartViewDate(startDate);
          setEndViewDate(endDate);
          // 同时设置相应的视图模式
          setStartViewMode(mode === 'day' ? 'days' : mode === 'month' ? 'months' : 'years');
          setEndViewMode(mode === 'day' ? 'days' : mode === 'month' ? 'months' : 'years');
        } else {
          setTempStartDate(undefined);
          setTempEndDate(undefined);
          const now = dayjs();
          setStartViewDate(now);
          setEndViewDate(now);
          // 设置初始视图模式
          setStartViewMode(mode === 'day' ? 'days' : mode === 'month' ? 'months' : 'years');
          setEndViewMode(mode === 'day' ? 'days' : mode === 'month' ? 'months' : 'years');
        }
      }
    }, [open, value, mode]);

    // 处理输入框值变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 手动输入时清空临时状态，避免与输入值不一致
      setTempStartDate(undefined);
      setTempEndDate(undefined);

      // 尝试解析并立即触发onChange
      if (newValue.trim()) {
        // 尝试解析日期范围值
        const parsedRange = parseDateRange(newValue);
        if (parsedRange) {
          // 解析成功时立即触发onChange
          onChange?.(parsedRange);
        }
        // 解析失败时不触发onChange，等待失焦处理
      } else {
        // 空值时立即触发onChange
        onChange?.(undefined);
      }
    };

    // 处理开始日期选择（根据模式直接选择相应精度）
    const handleStartDateSelect = (date: dayjs.Dayjs) => {
      if (mode === 'day') {
        if (startViewMode === 'days') {
          // 日选择
          setTempStartDate(date);
        } else if (startViewMode === 'months') {
          // 月选择 - 切换到日视图
          setStartViewDate(date);
          setStartViewMode('days');
        } else if (startViewMode === 'years') {
          // 年选择 - 切换到月视图
          setStartViewDate(date);
          setStartViewMode('months');
        }
      } else if (mode === 'month') {
        // 月模式：直接选择月份
        if (startViewMode === 'months') {
          setTempStartDate(date.startOf('month'));
        } else if (startViewMode === 'years') {
          // 年选择 - 切换到月视图
          setStartViewDate(date);
          setStartViewMode('months');
        }
      } else if (mode === 'year') {
        // 年模式：直接选择年份
        setTempStartDate(date.startOf('year'));
      }
    };

    const handleEndDateSelect = (date: dayjs.Dayjs) => {
      if (mode === 'day') {
        if (endViewMode === 'days') {
          // 日选择
          setTempEndDate(date);
        } else if (endViewMode === 'months') {
          // 月选择 - 切换到日视图
          setEndViewDate(date);
          setEndViewMode('days');
        } else if (endViewMode === 'years') {
          // 年选择 - 切换到月视图
          setEndViewDate(date);
          setEndViewMode('months');
        }
      } else if (mode === 'month') {
        // 月模式：直接选择月份
        if (endViewMode === 'months') {
          setTempEndDate(date.startOf('month'));
        } else if (endViewMode === 'years') {
          // 年选择 - 切换到月视图
          setEndViewDate(date);
          setEndViewMode('months');
        }
      } else if (mode === 'year') {
        // 年模式：直接选择年份
        setTempEndDate(date.startOf('year'));
      }
    };

    // 确认选择 - 根据模式返回不同精度的值
    const handleConfirm = () => {
      if (tempStartDate && tempEndDate) {
        // 📌 输出格式统一走 `format`（`mode` 的默认格式已在上面派生）
        const outputFormat = format;

        // 智能自动调整：确保结束时间大于等于开始时间
        let finalStartDate = tempStartDate;
        let finalEndDate = tempEndDate;

        if (tempEndDate.isBefore(tempStartDate)) {
          // 如果结束时间小于开始时间，自动交换两个值
          finalStartDate = tempEndDate;
          finalEndDate = tempStartDate;

          // 同时更新临时状态，让UI显示正确的选中状态
          setTempStartDate(finalStartDate);
          setTempEndDate(finalEndDate);
        }

        const formattedRange: [string, string] = [finalStartDate.format(outputFormat), finalEndDate.format(outputFormat)];
        setInputValue(formatDateRange(formattedRange));
        onChange?.(formattedRange);
      } else {
        setInputValue('');
        onChange?.(undefined);
      }
      setOpen(false);
    };

    // 取消选择
    const handleCancel = () => {
      // 恢复到当前值
      if (value?.[0] && value[1]) {
        setTempStartDate(dayjs(value[0]));
        setTempEndDate(dayjs(value[1]));
      } else {
        setTempStartDate(undefined);
        setTempEndDate(undefined);
      }
      setOpen(false);
    };

    // 处理输入框失焦
    const handleBlur = () => {
      const parsedRange = parseDateRange(inputValue);
      if (parsedRange) {
        const formattedRange = formatDateRange(parsedRange);
        setInputValue(formattedRange);
        onChange?.(parsedRange);
      } else if (inputValue) {
        // 如果输入的值无法解析，清空输入框
        setInputValue('');
        onChange?.(undefined);
      }
    };
    const contentClassName = useMemo(() => {
      let cName = 'h-[300px]';
      switch (mode) {
        case 'day':
          cName = 'h-[300px]';
          break;
        case 'month':
          cName = 'h-[270px]';
          break;
        case 'year':
          cName = 'h-[220px]';
          break;
        default:
          break;
      }

      return cName;
    }, [mode]);
    // 📌 禁用态必须在 Popover 层兜底：`PopoverTrigger asChild` 的事件合并到外层 div，
    //    点击图标会冒泡到该 div 触发 Radix 打开弹层，仅靠 suffix 守卫拦不住 Trigger。
    return (
      <Popover
        open={!disabled && open}
        onOpenChange={(nextOpen) => {
          if (!disabled) setOpen(nextOpen);
        }}
      >
        <PopoverTrigger asChild>
          <div className={cn('relative', disabled && 'cursor-not-allowed', className)} aria-disabled={disabled || undefined}>
            <Input
              ref={ref}
              name={name}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder={finalPlaceholder}
              disabled={disabled}
              readOnly={readOnly}
              error={error}
              required={required}
              className="pr-10"
              suffix={
                <span
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={pickerLocale.placeholderDateRange}
                  aria-disabled={disabled || undefined}
                  className={cn(
                    'inline-flex outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring',
                    // 禁用时不拼 `hover:opacity-100` —— 否则悬停反而变亮（禁用还像可用）
                    disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer opacity-50 hover:opacity-100',
                  )}
                  onClick={() => !disabled && setOpen(true)}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                >
                  <Icon name="calendar" size={16} aria-hidden="true" />
                </span>
              }
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
          <div className="flex">
            {/* 开始日期选择面板 */}
            <div className="border-r">
              <div className="border-b px-2 py-1">
                <div className="text-center font-medium text-sm">{pickerLocale.timeRangeLabels?.startTime || pickerLocale.startDate}</div>
              </div>

              {/* 开始日期内容区域 */}
              <div className={cn('flex flex-col p-2', contentClassName)}>
                {mode === 'day' && (
                  <div className="space-y-2">
                    {/* 视图选择器头部 */}
                    <ViewSelectorHeader viewMode={startViewMode} viewDate={startViewDate} onViewModeChange={setStartViewMode} onViewDateChange={setStartViewDate} />

                    {/* 具体视图内容 */}
                    {startViewMode === 'days' && (
                      <DayView viewDate={startViewDate} selectedDate={tempStartDate} onSelect={handleStartDateSelect} isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined} />
                    )}

                    {startViewMode === 'months' && <MonthView viewDate={startViewDate} selectedDate={tempStartDate} onSelect={handleStartDateSelect} />}

                    {startViewMode === 'years' && <YearView viewDate={startViewDate} selectedDate={tempStartDate} onSelect={handleStartDateSelect} />}
                  </div>
                )}

                {mode === 'month' && (
                  <div className="space-y-2">
                    {/* 视图选择器头部 */}
                    <ViewSelectorHeader viewMode={startViewMode} viewDate={startViewDate} onViewModeChange={setStartViewMode} onViewDateChange={setStartViewDate} />

                    {/* 具体视图内容 */}
                    {startViewMode === 'months' && (
                      <MonthView
                        viewDate={startViewDate}
                        selectedDate={tempStartDate}
                        onSelect={handleStartDateSelect}
                        isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined}
                      />
                    )}

                    {startViewMode === 'years' && <YearView viewDate={startViewDate} selectedDate={tempStartDate} onSelect={handleStartDateSelect} />}
                  </div>
                )}

                {mode === 'year' && (
                  <YearView
                    viewDate={tempStartDate || dayjs()}
                    selectedDate={tempStartDate}
                    onSelect={handleStartDateSelect}
                    isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined}
                  />
                )}
              </div>

              {/* 开始日期显示 */}
              <div className="border-t p-2">
                <div className="text-center text-muted-foreground text-sm">{tempStartDate ? tempStartDate.format(format) : pickerLocale.notSelected}</div>
              </div>
            </div>

            {/* 结束日期选择面板 */}
            <div>
              <div className="border-b px-2 py-1">
                <div className="text-center font-medium text-sm">{pickerLocale.timeRangeLabels?.endTime || pickerLocale.endDate}</div>
              </div>

              {/* 结束日期内容区域 */}
              <div className={cn('flex flex-col p-2', contentClassName)}>
                {mode === 'day' && (
                  <div className="space-y-2">
                    {/* 视图选择器头部 */}
                    <ViewSelectorHeader viewMode={endViewMode} viewDate={endViewDate} onViewModeChange={setEndViewMode} onViewDateChange={setEndViewDate} />

                    {/* 具体视图内容 */}
                    {endViewMode === 'days' && (
                      <DayView viewDate={endViewDate} selectedDate={tempEndDate} onSelect={handleEndDateSelect} isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined} />
                    )}

                    {endViewMode === 'months' && <MonthView viewDate={endViewDate} selectedDate={tempEndDate} onSelect={handleEndDateSelect} />}

                    {endViewMode === 'years' && <YearView viewDate={endViewDate} selectedDate={tempEndDate} onSelect={handleEndDateSelect} />}
                  </div>
                )}

                {mode === 'month' && (
                  <div className="space-y-2">
                    {/* 视图选择器头部 */}
                    <ViewSelectorHeader viewMode={endViewMode} viewDate={endViewDate} onViewModeChange={setEndViewMode} onViewDateChange={setEndViewDate} />

                    {/* 具体视图内容 */}
                    {endViewMode === 'months' && (
                      <MonthView viewDate={endViewDate} selectedDate={tempEndDate} onSelect={handleEndDateSelect} isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined} />
                    )}

                    {endViewMode === 'years' && <YearView viewDate={endViewDate} selectedDate={tempEndDate} onSelect={handleEndDateSelect} />}
                  </div>
                )}

                {mode === 'year' && (
                  <YearView
                    viewDate={tempEndDate || dayjs()}
                    selectedDate={tempEndDate}
                    onSelect={handleEndDateSelect}
                    isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined}
                  />
                )}
              </div>

              {/* 结束日期显示 */}
              <div className="border-t p-2">
                <div className="text-center text-muted-foreground text-sm">{tempEndDate ? tempEndDate.format(format) : pickerLocale.notSelected}</div>
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="border-t p-2">
            <div className="mb-2 text-center text-muted-foreground text-sm">
              {pickerLocale.currentSelection}: {tempStartDate && tempEndDate ? `${tempStartDate.format(format)}${separator}${tempEndDate.format(format)}` : pickerLocale.notSelected}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
                {pickerLocale.cancel}
              </Button>
              <Button size="sm" className="flex-1" onClick={handleConfirm} disabled={!tempStartDate || !tempEndDate}>
                {pickerLocale.confirm}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

InputDateRange.displayName = 'InputDateRange';
