/**
 * InputTimeRange 时间范围输入组件
 *
 * @description
 * 基于 Input 组件封装的时间范围输入组件，支持手动输入和选择器选择。
 * 使用 TimeView 组件实现时间选择功能，采用双列面板布局。
 */

import { cn } from '../../utils/classnames';
import dayjs from 'dayjs';
import * as React from 'react';
import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useDatePickerLocale } from './hooks/use-date-picker-locale';
import { TimeView } from './view';
import type { TimeConstraints } from './view/types';

const DEFAULT_TIME_FORMAT = 'HH:mm:ss';

export interface InputTimeRangeProps {
  /** 时间范围值 */
  value?: [string, string] | undefined;
  /** 值变化回调 */
  onChange?: (value: [string, string] | undefined) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 时间格式 */
  format?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 是否显示分钟 */
  showMinutes?: boolean;
  /** 是否显示秒 */
  showSeconds?: boolean;
  /** 时间约束 */
  timeConstraints?: TimeConstraints;
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

export const InputTimeRange = React.forwardRef<HTMLInputElement, InputTimeRangeProps>(
  (
    {
      value,
      onChange,
      placeholder,
      format,
      disabled = false,
      readOnly = false,
      error = false,
      showMinutes = true,
      showSeconds = false,
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
    const locale = useDatePickerLocale();
    const finalPlaceholder = placeholder || locale.placeholderTimeRange;
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [tempStartDateTime, setTempStartDateTime] = React.useState<dayjs.Dayjs | undefined>();
    const [tempEndDateTime, setTempEndDateTime] = React.useState<dayjs.Dayjs | undefined>();

    // 根据显示选项动态生成格式
    const actualFormat = React.useMemo(() => {
      if (format) return format;
      if (showSeconds) return 'HH:mm:ss';
      if (showMinutes) return 'HH:mm';
      return 'HH'; // 只显示小时
    }, [format, showMinutes, showSeconds]);

    // 格式化时间范围值
    const formatTimeRange = React.useCallback(
      (range: [string, string] | undefined): string => {
        if (!range) return '';
        try {
          const [start, end] = range;
          const today = dayjs().format('YYYY-MM-DD');
          const startFullDateTime = `${today} ${start}`;
          const endFullDateTime = `${today} ${end}`;
          const startParsed = dayjs(startFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
          const endParsed = dayjs(endFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);

          const startFormatted = startParsed.isValid() ? startParsed.format(actualFormat) : start;
          const endFormatted = endParsed.isValid() ? endParsed.format(actualFormat) : end;
          return `${startFormatted}${separator}${endFormatted}`;
        } catch {
          return '';
        }
      },
      [actualFormat, separator],
    );

    // 解析时间范围值
    const parseTimeRange = React.useCallback(
      (rangeStr: string): [string, string] | undefined => {
        if (!rangeStr) return undefined;
        try {
          const [start, end] = rangeStr.split(separator);
          const today = dayjs().format('YYYY-MM-DD');
          const startFullDateTime = `${today} ${start?.trim()}`;
          const endFullDateTime = `${today} ${end?.trim()}`;
          const startParsed = dayjs(startFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
          const endParsed = dayjs(endFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);

          if (startParsed.isValid() && endParsed.isValid()) {
            return [startParsed.format(actualFormat), endParsed.format(actualFormat)];
          }
          return undefined;
        } catch {
          return undefined;
        }
      },
      [actualFormat, separator],
    );

    // 同步外部值到内部状态
    React.useEffect(() => {
      const formatted = formatTimeRange(value);
      setInputValue(formatted);
      if (value?.[0] && value[1]) {
        // 有完整范围值时更新临时状态
        const today = dayjs().format('YYYY-MM-DD');
        const startFullDateTime = `${today} ${value[0]}`;
        const endFullDateTime = `${today} ${value[1]}`;
        const startParsed = dayjs(startFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
        const endParsed = dayjs(endFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);

        if (startParsed.isValid() && endParsed.isValid()) {
          setTempStartDateTime(startParsed);
          setTempEndDateTime(endParsed);
        } else {
          setTempStartDateTime(undefined);
          setTempEndDateTime(undefined);
        }
      } else {
        // 无效或空值时清空临时状态
        setTempStartDateTime(undefined);
        setTempEndDateTime(undefined);
      }
    }, [value, formatTimeRange, actualFormat]);

    // 弹窗打开时初始化临时状态
    React.useEffect(() => {
      if (open) {
        if (value?.[0] && value[1]) {
          // 有完整范围值时使用该值
          const today = dayjs().format('YYYY-MM-DD');
          const startFullDateTime = `${today} ${value[0]}`;
          const endFullDateTime = `${today} ${value[1]}`;
          const startParsed = dayjs(startFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
          const endParsed = dayjs(endFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);

          if (startParsed.isValid() && endParsed.isValid()) {
            setTempStartDateTime(startParsed);
            setTempEndDateTime(endParsed);
          } else {
            // 解析失败时使用默认时间范围
            const now = dayjs();
            setTempStartDateTime(now);
            setTempEndDateTime(now.add(1, 'hour'));
          }
        } else {
          // 没有完整范围值时使用默认时间范围
          const now = dayjs();
          setTempStartDateTime(now);
          setTempEndDateTime(now.add(1, 'hour'));
        }
      }
    }, [open, value, actualFormat]);

    // 事件处理
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 手动输入时清空临时状态，避免与输入值不一致
      setTempStartDateTime(undefined);
      setTempEndDateTime(undefined);

      // 尝试解析并立即触发onChange
      if (newValue.trim()) {
        // 尝试解析时间范围值
        const parsedRange = parseTimeRange(newValue);
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

    const handleStartTimeSelect = (time: dayjs.Dayjs) => {
      setTempStartDateTime(time);
    };

    const handleEndTimeSelect = (time: dayjs.Dayjs) => {
      setTempEndDateTime(time);
    };

    const handleConfirm = () => {
      if (tempStartDateTime && tempEndDateTime) {
        let startTime = tempStartDateTime;
        let endTime = tempEndDateTime;

        // 智能自动调整：确保结束时间大于等于开始时间
        if (endTime.isBefore(startTime)) {
          // 如果结束时间小于开始时间，自动交换两个值
          const temp = startTime;
          startTime = endTime;
          endTime = temp;

          // 同时更新临时状态
          setTempStartDateTime(startTime);
          setTempEndDateTime(endTime);
        }

        const formattedRange: [string, string] = [startTime.format(actualFormat), endTime.format(actualFormat)];
        setInputValue(`${formattedRange[0]}${separator}${formattedRange[1]}`);
        onChange?.(formattedRange);
      } else {
        setInputValue('');
        onChange?.(undefined);
      }
      setOpen(false);
    };

    const handleCancel = () => {
      if (value) {
        const today = dayjs().format('YYYY-MM-DD');
        const startFullDateTime = `${today} ${value[0]}`;
        const endFullDateTime = `${today} ${value[1]}`;
        const startParsed = dayjs(startFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
        const endParsed = dayjs(endFullDateTime, `YYYY-MM-DD ${actualFormat}`, true);

        if (startParsed.isValid() && endParsed.isValid()) {
          setTempStartDateTime(startParsed);
          setTempEndDateTime(endParsed);
        }
      } else {
        setTempStartDateTime(undefined);
        setTempEndDateTime(undefined);
      }
      setOpen(false);
    };

    const handleBlur = () => {
      const parsedRange = parseTimeRange(inputValue);
      if (parsedRange) {
        setInputValue(`${parsedRange[0]}${separator}${parsedRange[1]}`);
        onChange?.(parsedRange);
      } else if (inputValue) {
        setInputValue('');
        onChange?.(undefined);
      }
    };

    // 事件处理 - 简化的版本，移除复杂的滚动逻辑

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
              error={error}
              required={required}
              className="pr-10"
              suffix={
                <span
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={locale.placeholderTimeRange}
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
                  <Icon name="clock" size={16} aria-hidden="true" />
                </span>
              }
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
          <div className="flex">
            {/* 开始时间选择面板 */}
            <div className="border-r">
              <div className="border-b px-2 py-1">
                <div className="text-center font-medium text-sm">{locale.timeRangeLabels?.startTime || locale.startTime}</div>
              </div>

              {/* 开始时间内容区域 */}
              <div className="p-2">
                <TimeView selectedDate={tempStartDateTime} onSelect={handleStartTimeSelect} showMinutes={showMinutes} showSeconds={showSeconds} timeConstraints={timeConstraints} />
              </div>

              {/* 开始时间显示 */}
              <div className="border-t p-2">
                <div className="text-center text-muted-foreground text-sm">{tempStartDateTime ? tempStartDateTime.format(actualFormat) : locale.notSelected}</div>
              </div>
            </div>

            {/* 结束时间选择面板 */}
            <div>
              <div className="border-b px-2 py-1">
                <div className="text-center font-medium text-sm">{locale.timeRangeLabels?.endTime || locale.endTime}</div>
              </div>

              {/* 结束时间内容区域 */}
              <div className="p-2">
                <TimeView selectedDate={tempEndDateTime} onSelect={handleEndTimeSelect} showMinutes={showMinutes} showSeconds={showSeconds} timeConstraints={timeConstraints} />
              </div>

              {/* 结束时间显示 */}
              <div className="border-t p-2">
                <div className="text-center text-muted-foreground text-sm">{tempEndDateTime ? tempEndDateTime.format(actualFormat) : locale.notSelected}</div>
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="border-t p-2">
            <div className="mb-2 text-center text-muted-foreground text-sm">
              {locale.currentSelection}: {tempStartDateTime && tempEndDateTime ? `${tempStartDateTime.format(actualFormat)}${separator}${tempEndDateTime.format(actualFormat)}` : locale.notSelected}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
                {locale.cancel}
              </Button>
              <Button size="sm" className="flex-1" onClick={handleConfirm} disabled={!tempStartDateTime || !tempEndDateTime}>
                {locale.confirm}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

InputTimeRange.displayName = 'InputTimeRange';
