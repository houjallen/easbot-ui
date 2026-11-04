/**
 * InputDate 日期输入组件
 *
 * @description
 * 基于 Input 和 view 组件架构的日期输入组件，支持手动输入和选择器选择。
 * 支持日、月、年模式，具有视图选择器头部。
 */

import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import * as React from 'react';
import { Icon } from '../icon';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useDateFnsLocale } from './hooks/use-date-fns-locale';
import { useDatePickerLocale } from './hooks/use-date-picker-locale';
import type { DateShortcut } from './shortcuts';
import { DayView, MonthView, ShortcutView, ViewSelectorHeader, YearView, useDefaultDateShortcuts } from './view';
import type { ViewMode } from './view';

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

export interface InputDateProps {
  /** 日期值 */
  value?: string | Date;
  /** 值变化回调 */
  onChange?: (value: string | undefined) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 日期格式 */
  format?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 验证函数 */
  validate?: (value: string) => string | undefined;
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
  /** 输入框名称 */
  name?: string;
  /** 是否必填 */
  required?: boolean;
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
}

export const InputDate = React.forwardRef<HTMLInputElement, InputDateProps>(
  (
    {
      value,
      onChange,
      placeholder,
      format = DEFAULT_DATE_FORMAT,
      disabled = false,
      readOnly = false,
      error = false,
      errorMessage,
      validate,
      disabledDate,
      showShortcuts = true,
      shortcuts,
      mode = 'day',
      className,
      name,
      required,
      popoverContentStyle,
      ...props
    },
    ref,
  ) => {
    const fnsLocale = useDateFnsLocale();
    const pickerLocale = useDatePickerLocale();
    const defaultShortcuts = useDefaultDateShortcuts();
    const finalShortcuts = shortcuts || defaultShortcuts;
    const finalPlaceholder = placeholder || pickerLocale.placeholder;
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [internalError, setInternalError] = React.useState<string | undefined>();
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
    const [tempSelected, setTempSelected] = React.useState<Date | undefined>();

    // 计算最终的错误状态
    const hasError = error || !!internalError || !!errorMessage;
    const finalErrorMessage = errorMessage || internalError;

    // 格式化日期值
    const formatDate = React.useCallback(
      (date: string | Date | undefined): string => {
        if (!date) return '';
        try {
          return dayjs(date).format(format);
        } catch {
          return '';
        }
      },
      [format],
    );

    // 解析日期值
    const parseDate = React.useCallback(
      (dateStr: string): Date | undefined => {
        if (!dateStr) return undefined;
        try {
          const parsed = dayjs(dateStr, format, true);
          return parsed.isValid() ? parsed.toDate() : undefined;
        } catch {
          return undefined;
        }
      },
      [format],
    );

    // 同步外部值到内部状态
    React.useEffect(() => {
      setInputValue(formatDate(value));
      if (value) {
        setTempSelected(parseDate(formatDate(value)));
        setViewDate(dayjs(value));
      } else {
        setTempSelected(undefined);
      }
    }, [value, formatDate, parseDate]);

    // 弹窗打开时初始化临时状态
    React.useEffect(() => {
      if (open) {
        if (value) {
          setTempSelected(parseDate(formatDate(value)));
          setViewDate(dayjs(value));
        } else {
          setTempSelected(undefined);
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
    }, [open, value, mode, formatDate, parseDate]);

    // 处理输入框值变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 清除之前的错误信息
      setInternalError(undefined);

      // 尝试解析日期并触发回调
      if (!newValue) {
        onChange?.(undefined);
        return;
      }

      const parsedDate = parseDate(newValue);
      if (parsedDate) {
        // 自定义验证
        if (validate) {
          const validateError = validate(newValue);
          if (validateError) {
            setInternalError(validateError);
            return;
          }
        }

        // 检查禁用日期
        if (disabledDate?.(parsedDate)) {
          setInternalError(pickerLocale.dateDisabled);
          return;
        }

        onChange?.(newValue);
      }
    };

    // 处理快捷选择
    const handleShortcutSelect = (shortcut: DateShortcut) => {
      const selectedDate = shortcut.value();
      const formattedDate = formatDate(selectedDate);
      setInputValue(formattedDate);
      onChange?.(formattedDate);
      setOpen(false);
    };

    // 处理日期选择器选择
    const handleDateSelect = (date: dayjs.Dayjs) => {
      if (viewMode === 'days') {
        // 在日视图中选择具体日期，直接返回
        const formattedDate = formatDate(date.toDate());
        setInputValue(formattedDate);
        setTempSelected(date.toDate());
        onChange?.(formattedDate);
        setOpen(false);
      } else if (viewMode === 'months') {
        if (mode === 'month') {
          // 月模式：选择月份直接返回
          const formattedDate = formatDate(date.toDate());
          setInputValue(formattedDate);
          setTempSelected(date.toDate());
          onChange?.(formattedDate);
          setOpen(false);
        } else {
          // 日模式：从月视图选择月份后切换到日视图
          setViewDate(date);
          setViewMode('days');
        }
      } else if (viewMode === 'years') {
        if (mode === 'year') {
          // 年模式：选择年份直接返回
          const formattedDate = formatDate(date.toDate());
          setInputValue(formattedDate);
          setTempSelected(date.toDate());
          onChange?.(formattedDate);
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
      const formattedDate = tempSelected ? formatDate(tempSelected) : '';
      setInputValue(formattedDate);
      onChange?.(formattedDate || undefined);
      setOpen(false);
    };

    // 取消选择（保留但不在UI中显示）
    const handleCancel = () => {
      // 恢复到当前值
      if (value) {
        setTempSelected(parseDate(formatDate(value)));
        setViewDate(dayjs(value));
      } else {
        setTempSelected(undefined);
        setViewDate(dayjs());
      }
      setOpen(false);
    };

    // 处理输入框失焦
    const handleBlur = () => {
      if (!inputValue) {
        setInternalError(undefined);
        return;
      }

      const parsedDate = parseDate(inputValue);
      if (parsedDate) {
        // 格式化为标准格式
        const formattedDate = formatDate(parsedDate);
        setInputValue(formattedDate);
        onChange?.(formattedDate);
        setInternalError(undefined);
      } else {
        // 无法解析的日期，显示错误
        setInternalError(`${pickerLocale.formatError}，${pickerLocale.formatExample} ${format}`);
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className={cn('relative', className)}>
            <Input
              ref={ref}
              name={name}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder={finalPlaceholder}
              disabled={disabled}
              readOnly={readOnly}
              error={hasError}
              required={required}
              className="pr-10"
              suffix={
                <span
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={pickerLocale.selectDate}
                  aria-disabled={disabled || undefined}
                  className={cn(
                    'inline-flex cursor-pointer opacity-50 outline-offset-2 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring',
                    disabled && 'cursor-not-allowed opacity-30',
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
            {finalErrorMessage && <div className="mt-1 text-red-500 text-xs">{finalErrorMessage}</div>}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
          <div className="flex">
            {/* 快捷选择侧边栏 */}
            {mode === 'day' && showShortcuts && finalShortcuts.length > 0 && <ShortcutView shortcuts={finalShortcuts} onSelect={handleShortcutSelect} show={true} title={pickerLocale.quickSelect} />}

            {/* 日期选择器 */}
            <div className="flex-1">
              {/* 视图选择器头部 */}
              <ViewSelectorHeader viewMode={viewMode} onViewModeChange={setViewMode} viewDate={viewDate} onViewDateChange={setViewDate} />

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
  },
);

InputDate.displayName = 'InputDate';
