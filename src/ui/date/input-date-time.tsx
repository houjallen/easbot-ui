/**
 * InputDateTime 日期时间输入组件
 *
 * @description
 * 基于 Input 组件封装的日期时间输入组件，支持手动输入和选择器选择。
 * 结合了日期选择和时间选择功能，使用view组件架构。
 */

import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import * as React from 'react';
import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useDateFnsLocale } from './hooks/use-date-fns-locale';
import { useDatePickerLocale } from './hooks/use-date-picker-locale';
import type { DateShortcut } from './shortcuts';
import { DayView, MonthView, ShortcutView, TimeView, ViewSelectorHeader, YearView, useDefaultDateShortcuts } from './view';
import type { ViewMode } from './view';

const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export interface InputDateTimeProps {
  /** 日期时间值 */
  value?: string | Date;
  /** 值变化回调 */
  onChange?: (value: string | undefined) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 日期时间格式 */
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
  /** 是否显示秒 */
  showSeconds?: boolean;
  /** 时间约束 */
  timeConstraints?: {
    hours?: { min: number; max: number; step?: number };
    minutes?: { min: number; max: number; step?: number };
    seconds?: { min: number; max: number; step?: number };
  };
  /** 额外的 CSS 类名 */
  className?: string;
  /** 输入框名称 */
  name?: string;
  /** 是否必填 */
  required?: boolean;
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
}

export const InputDateTime = React.forwardRef<HTMLInputElement, InputDateTimeProps>(
  (
    {
      value,
      onChange,
      placeholder,
      format = DEFAULT_DATETIME_FORMAT,
      disabled = false,
      readOnly = false,
      error = false,
      errorMessage,
      validate,
      disabledDate,
      showShortcuts = true,
      shortcuts,
      showSeconds = true,
      timeConstraints,
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
    const finalPlaceholder = placeholder || `${pickerLocale.placeholder} ${pickerLocale.placeholderTime}`;
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [internalError, setInternalError] = React.useState<string | undefined>();
    const [selectedTab, setSelectedTab] = React.useState<'date' | 'time'>('time');
    const [viewMode, setViewMode] = React.useState<ViewMode>('days');
    const [viewDate, setViewDate] = React.useState<dayjs.Dayjs>(dayjs());
    const [tempDateTime, setTempDateTime] = React.useState<dayjs.Dayjs | undefined>();

    // 计算最终的错误状态
    const hasError = error || !!internalError || !!errorMessage;
    const finalErrorMessage = errorMessage || internalError;

    // 格式化日期时间值
    const formatDateTime = React.useCallback(
      (dateTime: string | Date | undefined): string => {
        if (!dateTime) return '';
        try {
          return dayjs(dateTime).format(format);
        } catch {
          return '';
        }
      },
      [format],
    );

    // 解析日期时间值
    const parseDateTime = React.useCallback(
      (dateTimeStr: string): Date | undefined => {
        if (!dateTimeStr) return undefined;
        try {
          const parsed = dayjs(dateTimeStr, format, true);
          return parsed.isValid() ? parsed.toDate() : undefined;
        } catch {
          return undefined;
        }
      },
      [format],
    );

    // 同步外部值到内部状态
    React.useEffect(() => {
      setInputValue(formatDateTime(value));
      if (value) {
        setTempDateTime(dayjs(value));
      } else {
        setTempDateTime(undefined);
      }
    }, [value, formatDateTime]);

    // 弹窗打开时初始化临时状态
    React.useEffect(() => {
      if (open) {
        if (value) {
          const dateTime = dayjs(value);
          setTempDateTime(dateTime);
          setViewDate(dateTime);
        } else {
          const now = dayjs();
          setTempDateTime(now);
          setViewDate(now);
        }
        // 重置为日视图
        setViewMode('days');
      }
    }, [open, value]);

    // 处理输入框值变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 清除之前的错误信息
      setInternalError(undefined);

      // 尝试解析日期时间并触发回调
      if (!newValue) {
        onChange?.(undefined);
        return;
      }

      const parsedDateTime = parseDateTime(newValue);
      if (parsedDateTime) {
        // 自定义验证
        if (validate) {
          const validateError = validate(newValue);
          if (validateError) {
            setInternalError(validateError);
            return;
          }
        }

        // 检查禁用日期
        if (disabledDate?.(parsedDateTime)) {
          setInternalError(pickerLocale.dateDisabled);
          return;
        }

        onChange?.(newValue);
      }
    };

    // 处理日期选择（支持多级视图导航）
    const handleDateSelect = (date: dayjs.Dayjs) => {
      if (viewMode === 'days') {
        // 日选择 - 保持原有的时间，更新日期部分
        if (tempDateTime) {
          const newDateTime = date.hour(tempDateTime.hour()).minute(tempDateTime.minute()).second(tempDateTime.second());
          setTempDateTime(newDateTime);
        } else {
          setTempDateTime(date);
        }
      } else if (viewMode === 'months') {
        // 月选择 - 切换到日视图
        setViewDate(date);
        setViewMode('days');
      } else if (viewMode === 'years') {
        // 年选择 - 切换到月视图
        setViewDate(date);
        setViewMode('months');
      }
    };

    // 处理时间选择
    const handleTimeSelect = (time: dayjs.Dayjs) => {
      if (tempDateTime) {
        // 保持原有的日期，更新时间部分
        const newDateTime = tempDateTime.hour(time.hour()).minute(time.minute()).second(time.second());
        setTempDateTime(newDateTime);
      } else {
        setTempDateTime(time);
      }
    };

    // 确认选择
    const handleConfirm = () => {
      if (tempDateTime) {
        const formattedDateTime = formatDateTime(tempDateTime.toDate());
        setInputValue(formattedDateTime);
        onChange?.(formattedDateTime);
      } else {
        setInputValue('');
        onChange?.(undefined);
      }
      setOpen(false);
    };

    // 取消选择
    const handleCancel = () => {
      // 恢复到当前值
      if (value) {
        setTempDateTime(dayjs(value));
      } else {
        setTempDateTime(undefined);
      }
      setOpen(false);
    };

    // 处理输入框失焦
    const handleBlur = () => {
      if (!inputValue) {
        setInternalError(undefined);
        return;
      }

      const parsedDateTime = parseDateTime(inputValue);
      if (parsedDateTime) {
        // 格式化为标准格式
        const formattedDateTime = formatDateTime(parsedDateTime);
        setInputValue(formattedDateTime);
        onChange?.(formattedDateTime);
        setInternalError(undefined);
      } else {
        // 无法解析的日期时间，显示错误
        setInternalError(`${pickerLocale.formatError}，${pickerLocale.formatExample} ${format}`);
      }
    };

    const currentDateTime = parseDateTime(inputValue);

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
                <Icon className={cn('cursor-pointer opacity-50 hover:opacity-100', disabled && 'cursor-not-allowed opacity-30')} name="calendar" size={16} onClick={() => !disabled && setOpen(true)} />
              }
              {...props}
            />
            {finalErrorMessage && <div className="mt-1 text-red-500 text-xs">{finalErrorMessage}</div>}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
          <div className="flex">
            {/* 快捷选择侧边栏 */}
            {showShortcuts && finalShortcuts.length > 0 && (
              <ShortcutView
                shortcuts={finalShortcuts}
                onSelect={(shortcut) => {
                  const selectedDate = shortcut.value();
                  setTempDateTime(dayjs(selectedDate));
                }}
                show={true}
                title={pickerLocale.quickSelect}
              />
            )}

            {/* 主选择区域 */}
            <div className="">
              {/* 标签页切换 */}
              <div className="flex border-b">
                <Button
                  variant={selectedTab === 'time' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none border-transparent border-b-2 data-[state=active]:border-primary"
                  onClick={() => setSelectedTab('time')}
                >
                  {pickerLocale.tabs.time}
                </Button>
                <Button
                  variant={selectedTab === 'date' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none border-transparent border-b-2 data-[state=active]:border-primary"
                  onClick={() => setSelectedTab('date')}
                >
                  {pickerLocale.tabs.date}
                </Button>
              </div>

              {/* 内容区域 */}
              <div className="p-2">
                {selectedTab === 'time' && <TimeView selectedDate={tempDateTime} onSelect={handleTimeSelect} showSeconds={showSeconds} timeConstraints={timeConstraints} />}

                {selectedTab === 'date' && (
                  <div className="space-y-2">
                    {/* 视图选择器头部 */}
                    <ViewSelectorHeader viewMode={viewMode} viewDate={viewDate} onViewModeChange={setViewMode} onViewDateChange={setViewDate} />

                    {/* 具体视图内容 */}
                    {viewMode === 'days' && (
                      <DayView viewDate={viewDate} selectedDate={tempDateTime} onSelect={handleDateSelect} isValidDate={disabledDate ? (date) => !disabledDate(date.toDate()) : undefined} />
                    )}

                    {viewMode === 'months' && <MonthView viewDate={viewDate} selectedDate={tempDateTime} onSelect={handleDateSelect} />}

                    {viewMode === 'years' && <YearView viewDate={viewDate} selectedDate={tempDateTime} onSelect={handleDateSelect} />}
                  </div>
                )}
              </div>

              {/* 当前选择的日期时间显示 */}
              <div className="border-t p-3">
                <div className="text-center text-muted-foreground text-sm">
                  {pickerLocale.currentSelection}: {tempDateTime ? tempDateTime.format(format) : pickerLocale.notSelected}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
                    {pickerLocale.cancel}
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleConfirm} disabled={!tempDateTime}>
                    {pickerLocale.confirm}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

InputDateTime.displayName = 'InputDateTime';
