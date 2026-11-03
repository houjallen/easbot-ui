/**
 * useDateFnsLocale Hook
 *
 * @description
 * 将我们的 locale 格式（如 'zh-CN', 'en-US'）转换为 date-fns 的 Locale 对象
 */

import { useLocale } from '../../../hooks/use-locale';
import type { Locale } from 'date-fns/locale';
import { de, enUS, es, fr, it, ja, ko, pt, ru, zhCN } from 'date-fns/locale';
import { useMemo } from 'react';

// date-fns locale 映射表
const dateFnsLocaleMap: Record<string, Locale> = {
  // 中文
  'zh-CN': zhCN,
  'zh-TW': zhCN, // 繁体中文暂时使用简体中文的 locale
  'zh-HK': zhCN, // 香港繁体中文暂时使用简体中文的 locale

  // 英文
  'en-US': enUS,
  'en-GB': enUS, // 英式英语使用美式英语的 locale
  'en-AU': enUS, // 澳式英语使用美式英语的 locale
  'en-CA': enUS, // 加拿大英语使用美式英语的 locale

  // 其他语言
  'ja-JP': ja, // 日语
  'ko-KR': ko, // 韩语
  'fr-FR': fr, // 法语
  'de-DE': de, // 德语
  'es-ES': es, // 西班牙语
  'it-IT': it, // 意大利语
  'pt-PT': pt, // 葡萄牙语
  'pt-BR': pt, // 巴西葡萄牙语
  'ru-RU': ru, // 俄语
};

/**
 * 获取 date-fns 的 Locale 对象
 *
 * @param curLocale - 我们的 locale 格式，如 'zh-CN', 'en-US' 等
 * @returns date-fns 的 Locale 对象
 */
export const useDateFnsLocale = (curLocale?: string) => {
  const { locale } = useLocale();
  return useMemo(() => {
    if (!locale) {
      return enUS; // 默认返回英文
    }

    return dateFnsLocaleMap[curLocale || locale] || enUS;
  }, [locale, curLocale]);
};

/**
 * 获取支持的 locale 列表
 *
 * @returns 支持的 locale 字符串数组
 */
export const getSupportedLocales = (): string[] => {
  return Object.keys(dateFnsLocaleMap);
};

/**
 * 检查是否支持指定的 locale
 *
 * @param locale - 要检查的 locale
 * @returns 是否支持
 */
export const isSupportedLocale = (locale: string): boolean => {
  return locale in dateFnsLocaleMap;
};
