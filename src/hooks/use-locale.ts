/**
 * 语言环境 Hook
 *
 * @description
 * 由 `hxsoft-js-framework/repository/hooks/use-locale` 移植而来，
 * 去除 zustand 全局 store 依赖 —— 组件库本身不持有全局状态，
 * 语言由消费方通过 `LocaleProvider` 注入或直接传参。
 *
 * 使用场景：
 * 1. 读取当前语言
 * 2. 在组件中响应语言变化
 *
 * @example
 * ```tsx
 * const { locale } = useLocale();
 * return <span>{locale === 'zh-CN' ? '你好' : 'Hello'}</span>;
 * ```
 */

import { useCallback, useContext, useMemo } from 'react';
import { LocaleContext } from '../providers/locale-provider';

/**
 * 语言环境 Hook
 *
 * @param overrideLocale 覆盖当前上下文的语言（优先级最高）
 * @returns 当前语言与语言设置函数
 */
export const useLocale = (overrideLocale?: string) => {
  const context = useContext(LocaleContext);

  const locale = overrideLocale ?? context?.locale ?? 'zh-CN';
  const setLocale = context?.setLocale;

  const setLocaleAction = useCallback(
    (newLocale: string, reloadPage?: boolean) => {
      setLocale?.(newLocale, reloadPage);
    },
    [setLocale],
  );

  return useMemo(() => ({ locale, setLocale: setLocaleAction }), [locale, setLocaleAction]);
};

/**
 * 仅获取当前语言的 Hook（不包含设置函数）
 *
 * @param overrideLocale 覆盖当前上下文的语言
 * @returns 当前语言
 */
export const useCurrentLocale = (overrideLocale?: string): string => useLocale(overrideLocale).locale;

/**
 * 语言切换 Hook（仅包含设置函数）
 *
 * @returns 语言设置函数
 */
export const useLocaleActions = () => useLocale().setLocale;
