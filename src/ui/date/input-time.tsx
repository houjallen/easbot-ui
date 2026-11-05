/**
 * InputTime 时间输入组件
 *
 * @description
 * 基于 Input 组件封装的时间输入组件，支持手动输入和选择器选择。
 * 使用 TimeView 组件实现时间选择功能。
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

export interface InputTimeProps {
  /** 时间值 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string | undefined) => void;
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
  /** 额外的 CSS 类名 */
  className?: string;
  /** 输入框名称 */
  name?: string;
  /** 是否必填 */
  required?: boolean;
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
}

export const InputTime = React.forwardRef<HTMLInputElement, InputTimeProps>(
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
      className,
      name,
      required,
      popoverContentStyle,
      ...props
    },
    ref,
  ) => {
    const locale = useDatePickerLocale();
    const finalPlaceholder = placeholder || locale.placeholderTime;
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [tempDateTime, setTempDateTime] = React.useState<dayjs.Dayjs | undefined>();

    // 根据显示选项动态生成格式
    const actualFormat = React.useMemo(() => {
      if (format) return format;
      if (showSeconds) return 'HH:mm:ss';
      if (showMinutes) return 'HH:mm';
      return 'HH'; // 只显示小时
    }, [format, showMinutes, showSeconds]);

    // 格式化时间值
    const formatTime = React.useCallback(
      (time: string | undefined): string => {
        if (!time) return '';
        try {
          const today = dayjs().format('YYYY-MM-DD');
          const fullDateTime = `${today} ${time}`;
          const parsed = dayjs(fullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
          return parsed.isValid() ? parsed.format(actualFormat) : time;
        } catch {
          return time;
        }
      },
      [actualFormat],
    );

    // 解析时间值
    const parseTime = React.useCallback(
      (timeStr: string): string | undefined => {
        if (!timeStr) return undefined;
        try {
          const today = dayjs().format('YYYY-MM-DD');
          const fullDateTime = `${today} ${timeStr}`;
          const parsed = dayjs(fullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
          return parsed.isValid() ? parsed.format(actualFormat) : undefined;
        } catch {
          return undefined;
        }
      },
      [actualFormat],
    );

    // 同步外部值到内部状态
    React.useEffect(() => {
      const formatted = formatTime(value);
      setInputValue(formatted);
      if (value && formatted) {
        // 有效值时更新临时状态
        const today = dayjs().format('YYYY-MM-DD');
        const fullDateTime = `${today} ${formatted}`;
        const parsed = dayjs(fullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
        if (parsed.isValid()) {
          setTempDateTime(parsed);
        } else {
          setTempDateTime(undefined);
        }
      } else {
        // 无效或空值时清空临时状态
        setTempDateTime(undefined);
      }
    }, [value, formatTime, actualFormat]);

    // 弹窗打开时初始化临时状态
    React.useEffect(() => {
      if (open) {
        if (value) {
          // 有值时使用该值
          const formatted = formatTime(value);
          if (formatted) {
            const today = dayjs().format('YYYY-MM-DD');
            const fullDateTime = `${today} ${formatted}`;
            const parsed = dayjs(fullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
            if (parsed.isValid()) {
              setTempDateTime(parsed);
            } else {
              // 解析失败时使用当前时间
              setTempDateTime(dayjs());
            }
          } else {
            // 格式化失败时使用当前时间
            setTempDateTime(dayjs());
          }
        } else {
          // 没有值时使用当前时间
          setTempDateTime(dayjs());
        }
      }
    }, [open, value, formatTime, actualFormat]);

    // 处理输入框值变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 手动输入时清空临时状态，避免与输入值不一致
      setTempDateTime(undefined);

      // 尝试解析并立即触发onChange
      if (newValue.trim()) {
        // 尝试解析时间值
        const parsedTime = parseTime(newValue);
        if (parsedTime) {
          // 解析成功时立即触发onChange
          onChange?.(parsedTime);
        }
        // 解析失败时不触发onChange，等待失焦处理
      } else {
        // 空值时立即触发onChange
        onChange?.(undefined);
      }
    };

    // 处理时间选择
    const handleTimeSelect = (time: dayjs.Dayjs) => {
      setTempDateTime(time);
    };

    // 确认时间选择
    const handleConfirm = () => {
      if (tempDateTime) {
        const formattedTime = tempDateTime.format(actualFormat);
        setInputValue(formattedTime);
        onChange?.(formattedTime);
      } else {
        setInputValue('');
        onChange?.(undefined);
      }
      setOpen(false);
    };

    // 取消时间选择
    const handleCancel = () => {
      if (value) {
        const formatted = formatTime(value);
        if (formatted) {
          const today = dayjs().format('YYYY-MM-DD');
          const fullDateTime = `${today} ${formatted}`;
          const parsed = dayjs(fullDateTime, `YYYY-MM-DD ${actualFormat}`, true);
          if (parsed.isValid()) {
            setTempDateTime(parsed);
          }
        }
      } else {
        setTempDateTime(undefined);
      }
      setOpen(false);
    };

    // 处理输入框失焦
    const handleBlur = () => {
      const parsedTime = parseTime(inputValue);
      if (parsedTime) {
        setInputValue(parsedTime);
        onChange?.(parsedTime);
      } else if (inputValue) {
        setInputValue('');
        onChange?.(undefined);
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
              error={error}
              required={required}
              className="pr-10"
              suffix={
                <span
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={locale.selectTime}
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
                  <Icon name="clock" size={16} aria-hidden="true" />
                </span>
              }
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
          <div className="">
            {/* 时间选择器 */}
            <TimeView selectedDate={tempDateTime} onSelect={handleTimeSelect} showMinutes={showMinutes} showSeconds={showSeconds} timeConstraints={timeConstraints} />

            {/* 确认和取消按钮 */}
            <div className="border-t p-2">
              <div className="mb-2 text-center text-muted-foreground text-sm">
                {locale.currentSelection}: {tempDateTime ? tempDateTime.format(actualFormat) : locale.notSelected}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
                  {locale.cancel}
                </Button>
                <Button size="sm" className="flex-1" onClick={handleConfirm} disabled={!tempDateTime}>
                  {locale.confirm}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

InputTime.displayName = 'InputTime';
