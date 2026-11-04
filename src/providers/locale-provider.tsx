/**
 * 语言环境 Provider
 *
 * @description
 * 为组件库提供语言上下文。组件库本身**不持有**全局状态，
 * 消费方按需包裹即可切换全库文案。
 *
 * 实现要点（与 `ThemeProvider` 保持对称）：
 * 1. 语言偏好持久化在 `localStorage`，刷新后保持
 * 2. 受控模式（传入 `locale`）优先于持久化值
 * 3. 未受控时的**取值优先级**：已存语言 → `defaultLocale` → 浏览器语言推断 → `zh-CN`
 * 4. `setLocale` 写入持久化并更新上下文；`reloadPage` 为 `true` 时刷新页面
 * 5. 持久化**不区分受控 / 非受控** —— 生效值由外部决定，但用户偏好始终被记住
 *
 * @example
 * ```tsx
 * <LocaleProvider locale="en-US">
 *   <App />
 * </LocaleProvider>
 * ```
 */

import * as React from 'react';

import { isSupportedLocale, resolveLocale } from '../utils/locale';
import type { Locale } from '../utils/locale';

/** 语言存储键名 */
export const LOCALE_STORAGE_KEY = 'eas-ui-locale';

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

export interface LocaleProviderProps {
  children?: React.ReactNode;
  /**
   * 当前语言（**受控模式**）
   *
   * @description
   * 传入即为受控模式 —— 该值**优先于**持久化值与自动推断，
   * 组件库不会自行修改它；需配合 `setLocale` 使用。
   */
  locale?: string;
  /**
   * 设置语言（**受控模式**）
   *
   * @description
   * 消费方自行接管状态变更时的回调。**未受控**时本 Provider 会提供
   * 内置实现（写入 `localStorage` 并更新上下文）。
   */
  setLocale?: (locale: string, reloadPage?: boolean) => void;
  /**
   * 默认语言（未受控时的初始值）
   *
   * @description
   * **不传**时按浏览器语言推断（`resolveLocale`），仍无结果则回退 `zh-CN`；
   * **显式传入**时不再做浏览器推断 —— 消费方的明确意图优先。
   */
  defaultLocale?: string;
  /** 是否在切换语言后刷新页面（默认 `false`） */
  reloadPageOnChange?: boolean;
}

/**
 * 读取已存储的语言
 *
 * @description
 * 非浏览器环境（SSR）或存储被禁用时返回 `null`，由调用方回退。
 *
 * @returns 存储的语言标识；无则返回 `null`
 */
function readStoredLocale(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return value && isSupportedLocale(value) ? value : null;
  } catch {
    // localStorage 被禁用时忽略
    return null;
  }
}

/**
 * 把语言写入持久化存储
 *
 * @param locale 目标语言
 */
function persistLocale(locale: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage 被禁用时忽略
  }
}

/**
 * 语言环境 Provider
 *
 * @param props Provider 属性
 * @returns Provider 组件
 */
export function LocaleProvider({ locale: controlledLocale, setLocale: controlledSetLocale, defaultLocale, reloadPageOnChange = false, children }: LocaleProviderProps) {
  // 受控 / 非受控
  const [uncontrolledLocale, setUncontrolledLocale] = React.useState<string>(defaultLocale ?? resolveLocale(typeof navigator === 'undefined' ? undefined : navigator.language));
  const locale = controlledLocale ?? uncontrolledLocale;

  // 挂载时应用已存语言
  // biome-ignore lint/correctness/useExhaustiveDependencies: 仅在挂载时读取一次已存语言，后续语言变更由下方 effect 负责
  React.useEffect(() => {
    if (controlledLocale !== undefined) return;

    // 已存语言优先于一切推断
    const stored = readStoredLocale();
    if (stored) {
      setUncontrolledLocale(stored);
    }
  }, []);

  // 语言变化时同步持久化
  //
  // 📌 **不区分受控 / 非受控** —— 与 `ThemeProvider` 的 `applyTheme` 保持一致：
  //    语言的**生效值**由外部决定（受控时以 `locale` prop 为准），
  //    但「用户偏好」本身应当被记住 —— 工具栏切换语言走 globals 通道，
  //    不经过 `setLocale`，若此处也跳过受控分支，持久化就会失效。
  React.useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  // 切换语言的回调（供 useLocale 使用）
  const setLocale = React.useCallback(
    (next: string, reloadPage?: boolean) => {
      const target = isSupportedLocale(next) ? next : resolveLocale(next);

      if (controlledLocale === undefined) {
        setUncontrolledLocale(target);
      }
      persistLocale(target);
      controlledSetLocale?.(target, reloadPage);

      const shouldReload = reloadPage ?? reloadPageOnChange;
      if (shouldReload && typeof globalThis.location !== 'undefined') {
        globalThis.location.reload();
      }
    },
    [controlledLocale, controlledSetLocale, reloadPageOnChange],
  );

  const value = React.useMemo<LocaleContextValue>(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * 语言类型再导出
 *
 * @description
 * 便于消费方从 Provider 入口直接取用受支持的语言类型。
 */
export type { Locale };
