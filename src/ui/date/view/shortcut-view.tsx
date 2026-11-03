/**
 * 快捷选择视图组件
 *
 * @description
 * 提供日期和日期范围的快捷选择功能，支持单选、范围选择和组合模式
 */

import { cn } from '../../../utils/classnames';
import React from 'react';
import { Button } from '../../button';
import { useDatePickerLocale } from '../hooks/use-date-picker-locale';
import { createDateRangeShortcuts, createDateShortcuts } from '../shortcuts';
import type { CombinedShortcutViewProps, ShortcutRangeViewProps, ShortcutViewProps } from './types';

/**
 * 创建默认的日期快捷选择
 */
export function useDefaultDateShortcuts() {
  const locale = useDatePickerLocale();
  return createDateShortcuts(locale);
}

/**
 * 创建默认的日期范围快捷选择
 */
export function useDefaultDateRangeShortcuts() {
  const locale = useDatePickerLocale();
  return createDateRangeShortcuts(locale);
}

/**
 * 单选快捷选择组件
 *
 * 使用场景：
 * 1. 日期输入组件的快捷选择侧边栏
 * 2. 独立的日期快捷选择器
 * 3. 与日历组件配合使用的快捷入口
 *
 * 使用示例：
 * <pre>{@code
 * const shortcuts = [
 *   { label: '今天', value: () => new Date() },
 *   { label: '昨天', value: () => dayjs().subtract(1, 'day').toDate() }
 * ];
 *
 * <ShortcutView
 *   shortcuts={shortcuts}
 *   onSelect={(shortcut) => console.log(shortcut.label)}
 *   show={true}
 * />
 * }</pre>
 */
export function ShortcutView({ shortcuts, onSelect, show = true, className, title, minWidth = 'w-28' }: ShortcutViewProps): React.ReactNode | null {
  const locale = useDatePickerLocale();
  const finalTitle = title || locale.shortcuts.title;

  if (!show || shortcuts.length === 0) {
    return null;
  }

  return (
    <div className={cn(minWidth, 'border-r p-3', className)}>
      <div className="mb-2 font-medium text-sm">{finalTitle}</div>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <Button key={index} variant="ghost" size="sm" className="h-8 w-full justify-start text-xs" onClick={() => onSelect(shortcut)}>
            {shortcut.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * 范围选择快捷选择组件
 *
 * 使用场景：
 * 1. 日期范围输入组件的快捷选择侧边栏
 * 2. 时间范围选择器的快捷入口
 * 3. 报表查询中的时间范围快选
 *
 * 使用示例：
 * <pre>{@code
 * const rangeShortcuts = [
 *   { label: '最近7天', value: () => [startDate, endDate] },
 *   { label: '本月', value: () => [monthStart, monthEnd] }
 * ];
 *
 * <ShortcutRangeView
 *   shortcuts={rangeShortcuts}
 *   onSelect={(shortcut) => console.log(shortcut.label)}
 *   show={true}
 * />
 * }</pre>
 */
export function ShortcutRangeView({ shortcuts, onSelect, show = true, className, title, minWidth = 'w-28' }: ShortcutRangeViewProps) {
  const locale = useDatePickerLocale();
  const finalTitle = title || locale.shortcuts.title;

  if (!show || shortcuts.length === 0) {
    return null;
  }

  return (
    <div className={cn(minWidth, 'border-r p-3', className)}>
      <div className="mb-2 font-medium text-sm">{finalTitle}</div>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <Button key={index} variant="ghost" size="sm" className="h-8 w-full justify-start text-xs" onClick={() => onSelect(shortcut)}>
            {shortcut.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * 组合快捷选择组件
 *
 * 使用场景：
 * 1. 同时支持单日期和日期范围选择的组件
 * 2. 复杂查询界面的时间快捷选择
 * 3. 可切换单选/范围模式的日期选择器
 *
 * 使用示例：
 * <pre>{@code
 * <CombinedShortcutView
 *   dateShortcuts={dateShortcuts}
 *   rangeShortcuts={rangeShortcuts}
 *   onDateSelect={(shortcut) => handleDateSelect(shortcut)}
 *   onRangeSelect={(shortcut) => handleRangeSelect(shortcut)}
 *   mode="both"
 *   dateTitle="单日期"
 *   rangeTitle="日期范围"
 * />
 * }</pre>
 */
export function CombinedShortcutView({
  dateShortcuts = [],
  rangeShortcuts = [],
  onDateSelect,
  onRangeSelect,
  show = true,
  className,
  title,
  dateTitle,
  rangeTitle,
  mode = 'both',
  minWidth = 'w-32',
}: CombinedShortcutViewProps) {
  const locale = useDatePickerLocale();
  const finalTitle = title || locale.shortcuts.title;
  const finalDateTitle = dateTitle || locale.viewModes.day;
  const finalRangeTitle = rangeTitle || locale.placeholderRange;

  if (!show) {
    return null;
  }

  const shouldShowDate = (mode === 'date' || mode === 'both') && dateShortcuts.length > 0;
  const shouldShowRange = (mode === 'range' || mode === 'both') && rangeShortcuts.length > 0;

  if (!shouldShowDate && !shouldShowRange) {
    return null;
  }

  return (
    <div className={cn(minWidth, 'border-r p-3', className)}>
      {/* 主标题 */}
      {title && <div className="mb-3 border-b pb-2 font-medium text-sm">{finalTitle}</div>}

      {/* 单日期快捷选择 */}
      {shouldShowDate && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-muted-foreground text-xs">{finalDateTitle}</div>
          <div className="space-y-1">
            {dateShortcuts.map((shortcut, index) => (
              <Button key={`date-${index}`} variant="ghost" size="sm" className="h-7 w-full justify-start text-xs" onClick={() => onDateSelect?.(shortcut)}>
                {shortcut.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 日期范围快捷选择 */}
      {shouldShowRange && (
        <div>
          <div className="mb-2 font-medium text-muted-foreground text-xs">{finalRangeTitle}</div>
          <div className="space-y-1">
            {rangeShortcuts.map((shortcut, index) => (
              <Button key={`range-${index}`} variant="ghost" size="sm" className="h-7 w-full justify-start text-xs" onClick={() => onRangeSelect?.(shortcut)}>
                {shortcut.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 设置显示名称用于调试
ShortcutView.displayName = 'ShortcutView';
ShortcutRangeView.displayName = 'ShortcutRangeView';
CombinedShortcutView.displayName = 'CombinedShortcutView';
