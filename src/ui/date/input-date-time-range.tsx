/**
 * InputDateTimeRange 日期时间范围输入组件
 *
 * @description
 * 基于 Input 组件封装的日期时间范围输入组件，支持手动输入和选择器选择。
 * 每块都是一个独立的 InputDateTime 组件，支持自己的时间日期选择。
 * 使用双列面板选择，带确认取消按钮。
 */

import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import * as React from 'react';
import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useDatePickerLocale } from './hooks/use-date-picker-locale';
import { InputDateTime } from './input-date-time';

const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export interface InputDateTimeRangeProps {
  /** 日期时间范围值 */
  value?: [Date?, Date?];
  /** 值变化回调 */
  onChange?: (value: [Date?, Date?]) => void;
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
  validate?: (value: [Date?, Date?]) => string | undefined;
  /** 禁用的日期判断函数 */
  disabledDate?: (date: Date) => boolean;
  /** 是否显示秒 */
  showSeconds?: boolean;
  /** 时间约束 */
  timeConstraints?: {
    hours?: { min: number; max: number; step?: number };
    minutes?: { min: number; max: number; step?: number };
    seconds?: { min: number; max: number; step?: number };
  };
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

export const InputDateTimeRange = React.forwardRef<HTMLInputElement, InputDateTimeRangeProps>(
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
      showSeconds = true,
      timeConstraints,
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
    const finalPlaceholder = placeholder || `${pickerLocale.placeholderRange}`;
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [internalError, setInternalError] = React.useState<string | undefined>();
    const [tempStartDateTime, setTempStartDateTime] = React.useState<string | undefined>();
    const [tempEndDateTime, setTempEndDateTime] = React.useState<string | undefined>();

    // 计算最终的错误状态
    const hasError = error || !!internalError || !!errorMessage;
    const finalErrorMessage = errorMessage || internalError;

    // 格式化日期时间范围值
    const formatDateTimeRange = React.useCallback(
      (dateTimeRange: [Date?, Date?] | undefined): string => {
        if (!dateTimeRange?.[0] || !dateTimeRange[1]) return '';
        try {
          const [start, end] = dateTimeRange;
          return `${dayjs(start).format(format)}${separator}${dayjs(end).format(format)}`;
        } catch {
          return '';
        }
      },
      [format, separator],
    );

    // 解析日期时间范围值
    const parseDateTimeRange = React.useCallback(
      (dateTimeRangeStr: string): [Date?, Date?] | undefined => {
        if (!dateTimeRangeStr) return undefined;
        try {
          const parts = dateTimeRangeStr.split(separator);
          if (parts.length !== 2) return undefined;

          const [startStr, endStr] = parts.map((s) => s.trim());
          const startParsed = dayjs(startStr, format, true);
          const endParsed = dayjs(endStr, format, true);

          if (startParsed.isValid() && endParsed.isValid()) {
            return [startParsed.toDate(), endParsed.toDate()];
          }
          return undefined;
        } catch {
          return undefined;
        }
      },
      [format, separator],
    );

    // 同步外部值到内部状态
    React.useEffect(() => {
      setInputValue(formatDateTimeRange(value));
      if (value?.[0] && value[1]) {
        setTempStartDateTime(dayjs(value[0]).format(format));
        setTempEndDateTime(dayjs(value[1]).format(format));
      } else {
        setTempStartDateTime(undefined);
        setTempEndDateTime(undefined);
      }
    }, [value, formatDateTimeRange, format]);

    // 弹窗打开时初始化临时状态
    React.useEffect(() => {
      if (open) {
        if (value?.[0] && value[1]) {
          setTempStartDateTime(dayjs(value[0]).format(format));
          setTempEndDateTime(dayjs(value[1]).format(format));
        } else {
          const now = dayjs();
          setTempStartDateTime(now.format(format));
          setTempEndDateTime(now.add(1, 'hour').format(format));
        }
      }
    }, [open, value, format]);

    // 处理输入框值变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 清除之前的错误信息
      setInternalError(undefined);

      // 手动输入时清空临时状态，避免与输入值不一致
      setTempStartDateTime(undefined);
      setTempEndDateTime(undefined);

      // 尝试解析并立即触发onChange
      if (newValue.trim()) {
        // 尝试解析日期时间范围值
        const parsedDateTimeRange = parseDateTimeRange(newValue);
        if (parsedDateTimeRange) {
          // 自定义验证
          if (validate) {
            const validateError = validate(parsedDateTimeRange);
            if (validateError) {
              setInternalError(validateError);
              return;
            }
          }

          // 检查禁用日期
          if (disabledDate && ((parsedDateTimeRange[0] && disabledDate(parsedDateTimeRange[0])) || (parsedDateTimeRange[1] && disabledDate(parsedDateTimeRange[1])))) {
            setInternalError(pickerLocale.dateDisabled);
            return;
          }

          onChange?.(parsedDateTimeRange);
        }
        // 解析失败时不触发onChange，等待失焦处理
      } else {
        // 空值时立即触发onChange
        onChange?.([undefined, undefined]);
      }
    };

    // 处理开始日期时间选择
    const handleStartDateTimeChange = (dateTime: string | undefined) => {
      setTempStartDateTime(dateTime);
    };

    // 处理结束日期时间选择
    const handleEndDateTimeChange = (dateTime: string | undefined) => {
      setTempEndDateTime(dateTime);
    };

    // 确认选择
    const handleConfirm = () => {
      if (tempStartDateTime && tempEndDateTime) {
        let startDate = dayjs(tempStartDateTime, format).toDate();
        let endDate = dayjs(tempEndDateTime, format).toDate();

        // 智能自动调整：确保结束时间大于等于开始时间
        if (endDate < startDate) {
          // 如果结束时间小于开始时间，自动交换两个值
          const temp = startDate;
          startDate = endDate;
          endDate = temp;

          // 同时更新临时状态
          setTempStartDateTime(dayjs(startDate).format(format));
          setTempEndDateTime(dayjs(endDate).format(format));
        }

        const newRange: [Date, Date] = [startDate, endDate];
        const formattedString = formatDateTimeRange(newRange);
        setInputValue(formattedString);
        onChange?.(newRange);
      } else {
        setInputValue('');
        onChange?.([undefined, undefined]);
      }
      setOpen(false);
    };

    // 取消选择
    const handleCancel = () => {
      // 恢复到当前值
      if (value?.[0] && value[1]) {
        setTempStartDateTime(dayjs(value[0]).format(format));
        setTempEndDateTime(dayjs(value[1]).format(format));
      } else {
        setTempStartDateTime(undefined);
        setTempEndDateTime(undefined);
      }
      setOpen(false);
    };

    // 处理输入框失焦
    const handleBlur = () => {
      if (!inputValue) {
        setInternalError(undefined);
        return;
      }

      const parsedDateTimeRange = parseDateTimeRange(inputValue);
      if (parsedDateTimeRange) {
        // 格式化为标准格式
        const formattedString = formatDateTimeRange(parsedDateTimeRange);
        setInputValue(formattedString);
        onChange?.(parsedDateTimeRange);
        setInternalError(undefined);
      } else {
        // 无法解析的日期时间范围，显示错误
        setInternalError(`${pickerLocale.formatError}，${pickerLocale.formatExample} ${format}`);
      }
    };

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
              error={hasError}
              required={required}
              className="pr-10"
              suffix={
                <span
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={pickerLocale.selectDateTime}
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
            {finalErrorMessage && <div className="mt-1 text-red-500 text-xs ">{finalErrorMessage}</div>}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
          <div>
            <div className="flex">
              {/* 开始日期时间选择面板 */}
              <div className="min-w-[180px] border-r">
                <div className="border-b px-2 py-1">
                  <div className="text-center font-medium text-sm">{pickerLocale.timeRangeLabels?.startTime || pickerLocale.startTime}</div>
                </div>

                {/* 开始日期时间内容区域 - 独立的 InputDateTime 组件 */}
                <div className="p-2">
                  <InputDateTime
                    value={tempStartDateTime}
                    onChange={handleStartDateTimeChange}
                    format={format}
                    showSeconds={showSeconds}
                    timeConstraints={timeConstraints}
                    disabledDate={disabledDate}
                    showShortcuts={false}
                    className="w-full"
                    placeholder={pickerLocale.placeholder}
                  />
                </div>
              </div>

              {/* 结束日期时间选择面板 */}
              <div className="min-w-[180px]">
                <div className="border-b px-2 py-1">
                  <div className="text-center font-medium text-sm">{pickerLocale.timeRangeLabels?.endTime || pickerLocale.endTime}</div>
                </div>

                {/* 结束日期时间内容区域 - 独立的 InputDateTime 组件 */}
                <div className="p-2">
                  <InputDateTime
                    value={tempEndDateTime}
                    onChange={handleEndDateTimeChange}
                    format={format}
                    showSeconds={showSeconds}
                    timeConstraints={timeConstraints}
                    disabledDate={disabledDate}
                    showShortcuts={false}
                    className="w-full"
                    placeholder={pickerLocale.placeholder}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="border-t p-2">
            <div className="mb-2 text-center text-muted-foreground text-sm">
              {pickerLocale.currentSelection}: {tempStartDateTime && tempEndDateTime ? `${tempStartDateTime}${separator}${tempEndDateTime}` : pickerLocale.notSelected}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
                {pickerLocale.cancel}
              </Button>
              <Button size="sm" className="flex-1" onClick={handleConfirm} disabled={!tempStartDateTime || !tempEndDateTime}>
                {pickerLocale.confirm}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

InputDateTimeRange.displayName = 'InputDateTimeRange';
