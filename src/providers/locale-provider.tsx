/**
 * 语言环境 Provider
 *
 * @description
 * 为组件库提供语言上下文。组件库本身**不持有**全局状态，
 * 消费方按需包裹即可切换全库文案。
 *
 * @example
 * ```tsx
 * <LocaleProvider locale="en-US">
 *   <App />
 * </LocaleProvider>
 * ```
 */

import * as React from 'react';

/** 语言上下文值 */
export interface LocaleContextValue {
  /** 当前语言 */
  locale: string;
  /** 设置语言 */
  setLocale?: (locale: string, reloadPage?: boolean) => void;
}

/**
 * 语言上下文
 *
 * @description
 * 默认为 `undefined`，便于 `useLocale` 在无 Provider 时回退到 `zh-CN`。
 */
export const LocaleContext = React.createContext<LocaleContextValue | undefined>(undefined);

export interface LocaleProviderProps extends LocaleContextValue {
  children?: React.ReactNode;
}

/**
 * 语言环境 Provider
 *
 * @param props Provider 属性
 * @returns Provider 组件
 */
export function LocaleProvider({ locale, setLocale, children }: LocaleProviderProps) {
  const value = React.useMemo<LocaleContextValue>(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
