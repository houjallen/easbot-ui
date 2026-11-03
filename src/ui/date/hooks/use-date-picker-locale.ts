import { useLocale } from '../../../hooks/use-locale';
import type { Locale } from '../../../utils/locale';
import { useMemo } from 'react';
import { getDatePickerLocale } from '../locale';
import type { DatePickerLocale } from '../locale';

/**
 * 日期选择器国际化 Hook
 *
 * 使用场景：
 * 1. 在日期选择器组件中获取当前语言的文本配置
 * 2. 根据系统语言自动切换日期选择器的显示文本
 * 3. 提供格式化函数用于日期时间的显示
 *
 * @returns 当前语言的日期选择器配置和格式化函数
 */
export const useDatePickerLocale = (curLocale?: Locale) => {
  const { locale } = useLocale();

  const datePickerLocale = useMemo(() => {
    // 强制返回中文配置，忽略系统语言设置
    return getDatePickerLocale('zh-CN');
  }, []);

  return datePickerLocale;
};

/**
 * 日期选择器格式化函数 Hook
 *
 * 使用场景：
 * 1. 格式化日期显示文本
 * 2. 格式化时间显示文本
 * 3. 格式化相对时间显示
 *
 * @returns 格式化函数集合
 */
export const useDatePickerFormatters = (curLocale?: Locale) => {
  const locale = useDatePickerLocale(curLocale);

  const formatters = useMemo(() => {
    return {
      /**
       * 格式化月份显示
       * @param month 月份索引 (0-11)
       * @param type 显示类型
       */
      formatMonth: (month: number, type: 'short' | 'long' = 'short') => {
        return locale.months[type][month] || '';
      },

      /**
       * 格式化星期显示
       * @param weekday 星期索引 (0-6, 0为周日)
       * @param type 显示类型
       */
      formatWeekday: (weekday: number, type: 'short' | 'long' | 'min' = 'short') => {
        return locale.weekdays[type][weekday] || '';
      },

      /**
       * 格式化季度显示
       * @param quarter 季度 (1-4)
       * @param withDescription 是否包含描述
       */
      formatQuarter: (quarter: 1 | 2 | 3 | 4, withDescription = false) => {
        const quarterKey = `Q${quarter}` as keyof typeof locale.quarters;
        const quarterText = locale.quarters[quarterKey];

        if (withDescription) {
          const description = locale.quarterDescriptions[quarterKey];
          return `${quarterText} (${description})`;
        }

        return quarterText;
      },

      /**
       * 格式化时间单位
       * @param unit 时间单位
       */
      formatTimeUnit: (unit: 'hour' | 'minute' | 'second' | 'millisecond') => {
        return locale.timeUnits[unit];
      },

      /**
       * 格式化时间标签
       * @param unit 时间单位
       */
      formatTimeLabel: (unit: 'hour' | 'minute' | 'second' | 'millisecond') => {
        return locale.timeLabels[unit];
      },

      /**
       * 格式化相对时间
       * @param key 相对时间键
       */
      formatRelativeTime: (key: keyof DatePickerLocale['relative']) => {
        return locale.relative[key];
      },

      /**
       * 格式化范围标签
       * @param labelType 标签类型
       */
      formatRangeLabel: (labelType: keyof DatePickerLocale['rangeLabels']) => {
        return locale.rangeLabels[labelType];
      },

      /**
       * 格式化选择提示
       * @param hintType 提示类型
       */
      formatSelectionHint: (hintType: keyof DatePickerLocale['selectionHints']) => {
        return locale.selectionHints[hintType];
      },

      /**
       * 格式化范围标记
       * @param markerType 标记类型
       */
      formatRangeMarker: (markerType: keyof DatePickerLocale['rangeMarkers']) => {
        return locale.rangeMarkers[markerType];
      },

      /**
       * 格式化视图模式标签
       * @param mode 视图模式
       */
      formatViewMode: (mode: keyof DatePickerLocale['viewModes']) => {
        return locale.viewModes[mode];
      },

      /**
       * 格式化验证信息
       * @param validationType 验证类型
       */
      formatValidation: (validationType: keyof DatePickerLocale['validation']) => {
        return locale.validation[validationType];
      },

      /**
       * 格式化状态文本
       * @param status 状态类型
       */
      formatStatus: (status: keyof DatePickerLocale['status']) => {
        return locale.status[status];
      },

      /**
       * 格式化操作文本
       * @param action 操作类型
       */
      formatAction: (action: keyof DatePickerLocale['actions']) => {
        return locale.actions[action];
      },

      /**
       * 格式化快捷选择文本
       * @param shortcut 快捷选择类型
       */
      formatShortcut: (shortcut: keyof DatePickerLocale['shortcuts']) => {
        return locale.shortcuts[shortcut];
      },

      /**
       * 格式化导航文本
       * @param direction 导航方向
       */
      formatNavigation: (direction: 'previous' | 'next' | 'previousYear' | 'nextYear' | 'previousMonth' | 'nextMonth' | 'previousDecade' | 'nextDecade') => {
        return locale[direction];
      },

      /**
       * 格式化时间范围标签
       * @param type 时间范围类型
       */
      formatTimeRangeLabel: (type: keyof DatePickerLocale['timeRangeLabels']) => {
        return locale.timeRangeLabels[type];
      },

      /**
       * 格式化AM/PM
       * @param period 时间段
       */
      formatPeriod: (period: 'am' | 'pm') => {
        return locale[period];
      },
    };
  }, [locale]);

  return formatters;
};
