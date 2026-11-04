/**
 * 语言环境基础配置
 *
 * @description
 * 由 `hxsoft-js-framework/repository/i18n` 移植而来，
 * 去除 `i18next` / `react-i18next` / `js-cookie` 依赖 ——
 * 组件库只需要「当前是什么语言」与「切换语言」两项能力。
 */

/** 支持的语言标识 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;

/** 语言类型 */
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** 默认语言 */
export const DEFAULT_LOCALE: Locale = 'zh-CN';

/** 语言环境 Cookie 名 */
export const LOCALE_COOKIE_NAME = 'locale';

/**
 * 语言 → 文案表 key 的映射
 *
 * @description
 * 语言项的**显示名**走 i18n 文案表（`locale` 域），以便消费方覆盖；
 * 本表只负责「哪个语言对应哪个 key」。
 *
 * ⚠️ 新增语言时**必须**同步：`SUPPORTED_LOCALES` + 本表 + `locale` 域文案表。
 */
export const LOCALE_MESSAGE_KEYS: Record<Locale, 'zhCN' | 'enUS'> = {
  'zh-CN': 'zhCN',
  'en-US': 'enUS',
};

/**
 * 判断字符串是否为受支持的语言
 *
 * @param locale 待判断的语言标识
 * @returns 是否受支持
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * 从浏览器语言推断最匹配的语言
 *
 * @param navigatorLanguage 浏览器语言（如 `zh-CN`）
 * @returns 受支持的语言标识
 */
export function resolveLocale(navigatorLanguage?: string): Locale {
  if (!navigatorLanguage) return DEFAULT_LOCALE;

  if (isSupportedLocale(navigatorLanguage)) return navigatorLanguage;

  // `zh` / `zh-TW` → `zh-CN`；`en` / `en-GB` → `en-US`
  const short = navigatorLanguage.split('-')[0];
  if (short === 'zh') return 'zh-CN';
  if (short === 'en') return 'en-US';

  return DEFAULT_LOCALE;
}

/**
 * 读取客户端当前语言
 *
 * @description
 * 读取顺序：Cookie → 浏览器语言 → 默认语言。
 * 非浏览器环境（SSR）直接返回默认语言。
 *
 * @returns 当前语言标识
 */
export function getLocaleOnClient(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;

  try {
    const fromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (fromCookie && isSupportedLocale(fromCookie)) return fromCookie;
  } catch {
    // Cookie 被禁用时忽略，走下面的回退逻辑
  }

  const navigatorLanguage = typeof navigator === 'undefined' ? undefined : navigator.language;
  return resolveLocale(navigatorLanguage);
}

/**
 * 设置客户端语言
 *
 * @param locale 目标语言
 * @param reloadPage 是否刷新页面（默认 `true`）
 */
export function setLocaleOnClient(locale: Locale, reloadPage = true): void {
  if (typeof document !== 'undefined') {
    try {
      // biome-ignore lint/suspicious/noDocumentCookie: 语言偏好需跨会话保持，cookie 是消费方服务端读取语言的标准载体；写入失败已被 try/catch 兜底
      document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000`;
    } catch {
      // Cookie 被禁用时忽略 —— 仍可通过 Provider 上下文切换
    }
  }

  if (reloadPage && typeof globalThis.location !== 'undefined') {
    globalThis.location.reload();
  }
}
