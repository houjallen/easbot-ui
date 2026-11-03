/**
 * Date组件性能优化hooks
 *
 * @description
 * 提供日期组件的性能优化功能，包括缓存、防抖、虚拟化等
 */

import { useCallback, useMemo } from 'react';
import { useRef } from 'react';
import { dateMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import { useLocale } from '../../../hooks/use-locale';
import { dateComparisons, safeDateFormat, safeDateParse } from '../date-utils';

/**
 * 防抖hook配置
 */
interface UseDebounceOptions {
  delay?: number;
  immediate?: boolean;
}

/**
 * 日期缓存hook配置
 */
interface UseDateCacheOptions {
  maxCacheSize?: number;
  enableCache?: boolean;
}

/**
 * 防抖日期输入处理hook
 * @param callback 回调函数
 * @param options 配置选项
 */
export function useDebouncedDateInput(callback: (value: string | undefined) => void, options: UseDebounceOptions = {}) {
  const { delay = 300, immediate = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const lastCallTimeRef = useRef<number>(0);

  const debouncedCallback = useCallback(
    (value: string | undefined) => {
      const now = Date.now();

      if (immediate && now - lastCallTimeRef.current > delay) {
        callback(value);
        lastCallTimeRef.current = now;
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(value);
        lastCallTimeRef.current = Date.now();
      }, delay);
    },
    [callback, delay, immediate],
  );

  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedCallback, cancelDebounce };
}

/**
 * 日期格式化缓存hook
 * @param options 缓存配置
 */
export function useDateCache(options: UseDateCacheOptions = {}) {
  const { maxCacheSize = 100, enableCache = true } = options;
  const { locale } = useLocale();
  const formatCacheRef = useRef<Map<string, string>>(new Map());
  const parseCacheRef = useRef<Map<string, Date | undefined>>(new Map());

  const cachedFormat = useCallback(
    (date: Date | string | undefined, format: string): string => {
      if (!enableCache || !date) return '';

      const cacheKey = `${date.toString()}-${format}`;

      if (formatCacheRef.current.has(cacheKey)) {
        return formatCacheRef.current.get(cacheKey)!;
      }

      const result = safeDateFormat(date, format, '', locale);

      if (formatCacheRef.current.size >= maxCacheSize) {
        const firstKey = formatCacheRef.current.keys().next().value;
        formatCacheRef.current.delete(firstKey as string);
      }

      formatCacheRef.current.set(cacheKey, result.formatted);
      return result.formatted;
    },
    [enableCache, maxCacheSize, locale],
  );

  const cachedParse = useCallback(
    (dateStr: string, format: string): Date | undefined => {
      if (!enableCache || !dateStr) return undefined;

      const cacheKey = `${dateStr}-${format}`;

      if (parseCacheRef.current.has(cacheKey)) {
        return parseCacheRef.current.get(cacheKey);
      }

      const result = safeDateParse(dateStr, format, true, locale);

      if (parseCacheRef.current.size >= maxCacheSize) {
        const firstKey = parseCacheRef.current.keys().next().value;
        parseCacheRef.current.delete(firstKey as string);
      }

      parseCacheRef.current.set(cacheKey, result.date);
      return result.date;
    },
    [enableCache, maxCacheSize, locale],
  );

  const clearCache = useCallback(() => {
    formatCacheRef.current.clear();
    parseCacheRef.current.clear();
  }, []);

  const getCacheStats = useCallback(
    () => ({
      formatCacheSize: formatCacheRef.current.size,
      parseCacheSize: parseCacheRef.current.size,
      maxCacheSize,
      enableCache,
    }),
    [maxCacheSize, enableCache],
  );

  return {
    cachedFormat,
    cachedParse,
    clearCache,
    getCacheStats,
  };
}

/**
 * 日期比较优化hook
 * @param dates 要比较的日期数组
 */
export function useDateComparisons(dates: Date[]) {
  const comparisons = useMemo(() => {
    return dates.map((date) => ({
      date,
      isToday: dateComparisons.isToday(date),
      isYesterday: dateComparisons.isYesterday(date),
      isTomorrow: dateComparisons.isTomorrow(date),
      isThisWeek: dateComparisons.isThisWeek(date),
      isThisMonth: dateComparisons.isThisMonth(date),
      isThisYear: dateComparisons.isThisYear(date),
      isWorkingDay: dateComparisons.isWorkingDay(date),
      isWeekend: dateComparisons.isWeekend(date),
      isLeapYear: dateComparisons.isLeapYear(date),
    }));
  }, [dates]);

  return comparisons;
}

/**
 * 日期范围虚拟化hook（用于大数据量的日期列表）
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param itemHeight 每项高度
 * @param containerHeight 容器高度
 */
export function useDateVirtualization(startDate: Date, endDate: Date, itemHeight: number, containerHeight: number) {
  const totalDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const visibleCount = useMemo(() => {
    return Math.ceil(containerHeight / itemHeight);
  }, [containerHeight, itemHeight]);

  const getVisibleItems = useCallback(
    (scrollTop: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount + 1, totalDays - 1);

      const items: Record<string, any>[] = [];
      for (let i = startIndex; i <= endIndex; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        items.push({
          index: i,
          date,
          top: i * itemHeight,
        });
      }

      return {
        items,
        totalHeight: totalDays * itemHeight,
        startIndex,
        endIndex,
      };
    },
    [startDate, totalDays, itemHeight, visibleCount],
  );

  return {
    totalDays,
    visibleCount,
    getVisibleItems,
  };
}

/**
 * 智能日期输入建议hook
 * @param inputValue 输入值
 * @param maxSuggestions 最大建议数量
 */
export function useDateSuggestions(inputValue: string, maxSuggestions = 5) {
  const { locale } = useLocale();

  const suggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];

    const input = inputValue.toLowerCase();
    const suggestions: Array<{ text: string; date: Date; type: string }> = [];
    const today = new Date();

    // 相对日期建议
    const relativeSuggestions = [
      { text: processUiMessage('today', { locale, messages: dateMessages }), date: today, type: 'relative' },
      {
        text: processUiMessage('yesterday', { locale, messages: dateMessages }),
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        type: 'relative',
      },
      {
        text: processUiMessage('tomorrow', { locale, messages: dateMessages }),
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        type: 'relative',
      },
    ];

    // 匹配相对日期
    for (const suggestion of relativeSuggestions) {
      if (suggestion.text.includes(input) || input.includes(suggestion.text)) {
        suggestions.push(suggestion);
      }
    }

    // 尝试解析为具体日期
    const formats = ['YYYY-MM-DD', 'YYYY/MM/DD', 'MM-DD', 'MM/DD'];
    for (const format of formats) {
      const parseResult = safeDateParse(inputValue, format, true, locale);
      if (parseResult.isValid && parseResult.date) {
        suggestions.push({
          text: safeDateFormat(parseResult.date, 'YYYY-MM-DD', '', locale).formatted,
          date: parseResult.date,
          type: 'parsed',
        });
        break;
      }
    }

    return suggestions.slice(0, maxSuggestions);
  }, [inputValue, maxSuggestions, locale]);

  return suggestions;
}

/**
 * 日期输入验证hook
 * @param value 输入值
 * @param rules 验证规则
 */
export function useDateValidation(
  value: string | undefined,
  rules: {
    required?: boolean;
    format?: string;
    minDate?: Date;
    maxDate?: Date;
    customValidator?: (date: Date) => string | undefined;
  } = {},
) {
  const { required = false, format = 'YYYY-MM-DD', minDate, maxDate, customValidator } = rules;
  const { locale } = useLocale();

  const validation = useMemo(() => {
    if (!value) {
      return {
        isValid: !required,
        error: required ? processUiMessage('dateRequired', { locale, messages: dateMessages }) : undefined,
      };
    }

    // 格式验证
    const parseResult = safeDateParse(value, format, true, locale);
    if (!parseResult.isValid) {
      return {
        isValid: false,
        error: parseResult.error || processUiMessage('invalidDate', { locale, messages: dateMessages }),
      };
    }

    if (!parseResult.date) {
      return {
        isValid: false,
        error: processUiMessage('invalidDateValue', { locale, messages: dateMessages }),
      };
    }

    // 日期范围验证
    if (minDate && parseResult.date < minDate) {
      return {
        isValid: false,
        error: processUiMessage('dateBeforeMin', { locale, messages: dateMessages }, { date: safeDateFormat(minDate, format, '', locale).formatted }),
      };
    }

    if (maxDate && parseResult.date > maxDate) {
      return {
        isValid: false,
        error: processUiMessage('dateAfterMax', { locale, messages: dateMessages }, { date: safeDateFormat(maxDate, format, '', locale).formatted }),
      };
    }

    // 自定义验证
    if (customValidator) {
      const customError = customValidator(parseResult.date);
      if (customError) {
        return {
          isValid: false,
          error: customError,
        };
      }
    }

    return {
      isValid: true,
      error: undefined,
      date: parseResult.date,
    };
  }, [value, required, format, minDate, maxDate, customValidator, locale]);

  return validation;
}
