/**
 * TimeView 时间视图组件
 */

'use client';

import { cn } from '../../../utils/classnames';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useMemo } from 'react';
import { useDatePickerLocale } from '../hooks/use-date-picker-locale';
import type { TimeRangeViewProps, TimeViewProps } from './types';

/**
 * 滚动到选中项。
 *
 * 该函数是纯计算（不依赖组件内的 props / state），提升到模块作用域，
 * 使其引用在多次渲染间保持稳定 —— 否则放进 `useEffect` 依赖数组会导致副作用每帧重跑。
 */
export function scrollToSelectedItem(scrollRef: React.RefObject<HTMLDivElement | null>, selectedValue: number, options: number[]): void {
  if (!scrollRef.current) return;

  // 找到最接近的选项索引
  let selectedIndex = options.indexOf(selectedValue);
  if (selectedIndex === -1) {
    // 如果精确值不存在，找到最接近的值
    selectedIndex = options.reduce((closestIndex, option, index) => {
      // `noUncheckedIndexedAccess` 下索引访问可能为 undefined，
      // 但 `reduce` 的初始值为 0 且 `options` 非空，故 `closestIndex` 必然有效
      return Math.abs(option - selectedValue) < Math.abs(options[closestIndex]! - selectedValue) ? index : closestIndex;
    }, 0);
  }

  if (selectedIndex >= 0) {
    // 优化滚动计算，确保选中项在可视区域中央
    const itemHeight = 28; // 按钮实际高度 (py-1 + text-sm + 边距)
    const containerHeight = scrollRef.current.clientHeight;
    const maxScrollTop = scrollRef.current.scrollHeight - containerHeight;
    const targetScrollTop = selectedIndex * itemHeight - containerHeight / 2 + itemHeight / 2;

    scrollRef.current.scrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
  }
}

// 时间视图组件
export function TimeView({ selectedDate, onSelect, showMinutes = true, showSeconds = false, timeConstraints, className }: TimeViewProps): React.ReactNode {
  const locale = useDatePickerLocale();
  const currentTime = selectedDate || dayjs();

  // 滚动容器的ref
  const hourScrollRef = useRef<HTMLDivElement | null>(null);
  const minuteScrollRef = useRef<HTMLDivElement | null>(null);
  const secondScrollRef = useRef<HTMLDivElement | null>(null);

  const hourConstraints = timeConstraints?.hours || {
    min: 0,
    max: 23,
    step: 1,
  };
  const minuteConstraints = timeConstraints?.minutes || {
    min: 0,
    max: 59,
    step: 1,
  };
  const secondConstraints = timeConstraints?.seconds || {
    min: 0,
    max: 59,
    step: 1,
  };

  // 生成时间选项
  const timeOptions = useMemo(() => {
    const generateOptions = (min: number, max: number, step = 1) => {
      const options: number[] = [];
      for (let i = min; i <= max; i += step) {
        options.push(i);
      }
      return options;
    };

    const hours = generateOptions(hourConstraints.min, hourConstraints.max, hourConstraints.step || 1);
    const minutes = generateOptions(minuteConstraints.min, minuteConstraints.max, minuteConstraints.step || 1);
    const seconds = showSeconds ? generateOptions(secondConstraints.min, secondConstraints.max, secondConstraints.step || 1) : [];

    return { hours, minutes, seconds };
  }, [hourConstraints, minuteConstraints, secondConstraints, showSeconds]);

  const handleTimeChange = (type: 'hour' | 'minute' | 'second', value: number) => {
    let newTime = currentTime;

    switch (type) {
      case 'hour':
        newTime = newTime.hour(value);
        break;
      case 'minute':
        newTime = newTime.minute(value);
        break;
      case 'second':
        newTime = newTime.second(value);
        break;
    }

    onSelect(newTime);
  };

  // 滚动到选中项 - 优化逻辑，确保正确初始化和滚动
  useEffect(() => {
    // 延迟执行滚动，确保DOM渲染完成
    const timer = setTimeout(() => {
      const { hours, minutes, seconds } = timeOptions;
      scrollToSelectedItem(hourScrollRef, currentTime.hour(), hours);
      if (showMinutes) {
        scrollToSelectedItem(minuteScrollRef, currentTime.minute(), minutes);
      }
      if (showSeconds) {
        scrollToSelectedItem(secondScrollRef, currentTime.second(), seconds);
      }
    }, 150); // 增加延迟时间，确保DOM完全渲染

    return () => clearTimeout(timer);
  }, [currentTime, timeOptions, showMinutes, showSeconds]);

  return (
    <div className={cn('p-2', className)}>
      <div className="flex gap-2">
        {/* 小时选择 */}
        <div className="flex flex-col">
          <span className="mb-2 text-center font-medium text-sm">{locale.timeUnits.hour}</span>
          <div ref={hourScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
            {timeOptions.hours.map((hour) => (
              <button
                key={hour}
                type="button"
                className={cn(
                  'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                  hour === currentTime.hour() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                )}
                onClick={() => handleTimeChange('hour', hour)}
              >
                {hour.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* 分钟选择 */}
        {showMinutes && (
          <div className="flex flex-col">
            <span className="mb-2 text-center font-medium text-sm">{locale.timeUnits.minute}</span>
            <div ref={minuteScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
              {timeOptions.minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  className={cn(
                    'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                    minute === currentTime.minute() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  )}
                  onClick={() => handleTimeChange('minute', minute)}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 秒选择 */}
        {showSeconds && (
          <div className="flex flex-col">
            <span className="mb-2 text-center font-medium text-sm">{locale.timeUnits.second}</span>
            <div ref={secondScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
              {timeOptions.seconds.map((second) => (
                <button
                  key={second}
                  type="button"
                  className={cn(
                    'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                    second === currentTime.second() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  )}
                  onClick={() => handleTimeChange('second', second)}
                >
                  {second.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 时间范围视图组件
export function TimeRangeView({
  selectedStartDate,
  selectedEndDate,
  onStartSelect,
  onEndSelect,
  showMinutes = true,
  showSeconds = false,
  timeConstraints,
  separator = ' - ',
  className,
}: TimeRangeViewProps): React.ReactNode {
  const locale = useDatePickerLocale();

  // 生成时间选项
  const generateTimeOptions = () => {
    const hourConstraints = timeConstraints?.hours || {
      min: 0,
      max: 23,
      step: 1,
    };
    const minuteConstraints = timeConstraints?.minutes || {
      min: 0,
      max: 59,
      step: 1,
    };
    const secondConstraints = timeConstraints?.seconds || {
      min: 0,
      max: 59,
      step: 1,
    };

    const hours = Array.from(
      {
        length: Math.ceil((hourConstraints.max - hourConstraints.min + 1) / (hourConstraints.step || 1)),
      },
      (_, i) => hourConstraints.min + i * (hourConstraints.step || 1),
    );
    const minutes = Array.from(
      {
        length: Math.ceil((minuteConstraints.max - minuteConstraints.min + 1) / (minuteConstraints.step || 1)),
      },
      (_, i) => minuteConstraints.min + i * (minuteConstraints.step || 1),
    );
    const seconds = showSeconds
      ? Array.from(
          {
            length: Math.ceil((secondConstraints.max - secondConstraints.min + 1) / (secondConstraints.step || 1)),
          },
          (_, i) => secondConstraints.min + i * (secondConstraints.step || 1),
        )
      : [0];

    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = generateTimeOptions();

  // 当前开始和结束时间
  const currentStartTime = selectedStartDate || dayjs().hour(0).minute(0).second(0);
  const currentEndTime = selectedEndDate || dayjs().hour(0).minute(0).second(0);

  // 滚动容器的ref
  const startHourScrollRef = useRef<HTMLDivElement | null>(null);
  const startMinuteScrollRef = useRef<HTMLDivElement | null>(null);
  const startSecondScrollRef = useRef<HTMLDivElement | null>(null);
  const endHourScrollRef = useRef<HTMLDivElement | null>(null);
  const endMinuteScrollRef = useRef<HTMLDivElement | null>(null);
  const endSecondScrollRef = useRef<HTMLDivElement | null>(null);

  const handleStartTimeChange = (type: 'hour' | 'minute' | 'second', value: number) => {
    let newTime = currentStartTime;
    switch (type) {
      case 'hour':
        newTime = newTime.hour(value);
        break;
      case 'minute':
        newTime = newTime.minute(value);
        break;
      case 'second':
        newTime = newTime.second(value);
        break;
      default:
        break;
    }
    onStartSelect(newTime);
  };

  const handleEndTimeChange = (type: 'hour' | 'minute' | 'second', value: number) => {
    let newTime = currentEndTime;
    switch (type) {
      case 'hour':
        newTime = newTime.hour(value);
        break;
      case 'minute':
        newTime = newTime.minute(value);
        break;
      case 'second':
        newTime = newTime.second(value);
        break;
      default:
        break;
    }
    onEndSelect(newTime);
  };

  // 滚动到选中项（已提升到模块作用域，见文件顶部）

  // 当时间改变时滚动到选中项
  useEffect(() => {
    const timer = setTimeout(() => {
      // 滚动开始时间选择器
      scrollToSelectedItem(startHourScrollRef, currentStartTime.hour(), hours);
      if (showMinutes) {
        scrollToSelectedItem(startMinuteScrollRef, currentStartTime.minute(), minutes);
      }
      if (showSeconds) {
        scrollToSelectedItem(startSecondScrollRef, currentStartTime.second(), seconds);
      }

      // 滚动结束时间选择器
      scrollToSelectedItem(endHourScrollRef, currentEndTime.hour(), hours);
      if (showMinutes) {
        scrollToSelectedItem(endMinuteScrollRef, currentEndTime.minute(), minutes);
      }
      if (showSeconds) {
        scrollToSelectedItem(endSecondScrollRef, currentEndTime.second(), seconds);
      }
    }, 150); // 增加延迟时间，与TimeView保持一致

    return () => clearTimeout(timer);
  }, [
    currentStartTime,
    currentEndTime,
    hours,
    minutes,
    seconds,
    showMinutes,
    showSeconds, // 滚动结束时间选择器
    // `scrollToSelectedItem` 是模块作用域的稳定函数引用，无需作为依赖
  ]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* 双列时间选择器 */}
      <div className="flex gap-6">
        {/* 开始时间选择器 */}
        <div className="flex flex-col">
          <h3 className="mb-3 text-center font-medium text-sm">{locale.timeRangeLabels.startTime}</h3>
          <div className="flex gap-2">
            {/* 开始时间 - 小时选择 */}
            <div className="flex flex-col">
              <span className="mb-2 text-center font-medium text-xs">{locale.timeUnits.hour}</span>
              <div ref={startHourScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={cn(
                      'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                      hour === currentStartTime.hour() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                    )}
                    onClick={() => handleStartTimeChange('hour', hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* 开始时间 - 分钟选择 */}
            {showMinutes && (
              <div className="flex flex-col">
                <span className="mb-2 text-center font-medium text-xs">{locale.timeUnits.minute}</span>
                <div ref={startMinuteScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className={cn(
                        'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                        minute === currentStartTime.minute() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                      )}
                      onClick={() => handleStartTimeChange('minute', minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 开始时间 - 秒选择 */}
            {showSeconds && (
              <div className="flex flex-col">
                <span className="mb-2 text-center font-medium text-xs">{locale.timeUnits.second}</span>
                <div ref={startSecondScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
                  {seconds.map((second) => (
                    <button
                      key={second}
                      type="button"
                      className={cn(
                        'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                        second === currentStartTime.second() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                      )}
                      onClick={() => handleStartTimeChange('second', second)}
                    >
                      {second.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="flex items-center">
          <div className="h-32 w-px bg-border" />
        </div>

        {/* 结束时间选择器 */}
        <div className="flex flex-col">
          <h3 className="mb-3 text-center font-medium text-sm">{locale.timeRangeLabels.endTime}</h3>
          <div className="flex gap-2">
            {/* 结束时间 - 小时选择 */}
            <div className="flex flex-col">
              <span className="mb-2 text-center font-medium text-xs">{locale.timeUnits.hour}</span>
              <div ref={endHourScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={cn(
                      'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                      hour === currentEndTime.hour() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                    )}
                    onClick={() => handleEndTimeChange('hour', hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* 结束时间 - 分钟选择 */}
            {showMinutes && (
              <div className="flex flex-col">
                <span className="mb-2 text-center font-medium text-xs">{locale.timeUnits.minute}</span>
                <div ref={endMinuteScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className={cn(
                        'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                        minute === currentEndTime.minute() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                      )}
                      onClick={() => handleEndTimeChange('minute', minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 结束时间 - 秒选择 */}
            {showSeconds && (
              <div className="flex flex-col">
                <span className="mb-2 text-center font-medium text-xs">{locale.timeUnits.second}</span>
                <div ref={endSecondScrollRef} className="max-h-40 w-16 overflow-y-auto rounded border p-1">
                  {seconds.map((second) => (
                    <button
                      key={second}
                      type="button"
                      className={cn(
                        'w-full rounded px-2 py-1 text-center text-sm hover:bg-accent',
                        second === currentEndTime.second() && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                      )}
                      onClick={() => handleEndTimeChange('second', second)}
                    >
                      {second.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
