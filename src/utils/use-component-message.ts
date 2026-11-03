/**
 * 组件文案 Hook
 *
 * @description
 * 组件库内置 i18n 的 React 入口。统一走 `src/utils/ui-message.ts` 处理引擎，
 * 不引入任何外部 i18n 库（见 `spec/i18n-standard.md`）。
 *
 * 语言来源优先级：
 * 1. `options.locale`（组件 prop，最高优先级）
 * 2. `LocaleProvider` 注入的语言（经 `useLocale()` 读取）
 * 3. `zh-CN`（缺省）
 *
 * 文案来源优先级：
 * 1. 消费方传入的 `options.messages`（按 locale 匹配）
 * 2. `src/utils/component-messages.ts` 内置文案
 *
 * @example
 * ```tsx
 * const { t } = useComponentMessage('table');
 * return <span>{t('noData')}</span>;
 * ```
 */

import { useCallback, useMemo } from 'react';

import { useLocale } from '../hooks/use-locale';
import type { ComponentMessageDomain } from './component-messages';
import { componentMessages } from './component-messages';
import { processUiMessage } from './ui-message';
import type { UiMessages } from './ui-message';

/**
 * 组件文案 Hook 配置
 */
export interface UseComponentMessageOptions {
  /** 语言覆盖（优先级高于 LocaleProvider） */
  locale?: string;
  /** 消费方自定义文案（优先级高于内置文案） */
  messages?: UiMessages;
}

/**
 * 组件文案 Hook 返回值
 */
export interface UseComponentMessageReturn {
  /** 按 key 取文案，支持点号路径与 `{param}` 插值 */
  t: (key: string, params?: Record<string, unknown>) => string;
  /** 当前生效语言 */
  locale: string;
}

/**
 * 读取组件域文案
 *
 * @param domain 组件域
 * @param options 配置项
 * @returns 文案读取函数与当前语言
 */
export function useComponentMessage(domain: ComponentMessageDomain, options: UseComponentMessageOptions = {}): UseComponentMessageReturn {
  const { locale: contextLocale } = useLocale();
  const { locale: overrideLocale, messages } = options;

  const locale = overrideLocale ?? contextLocale;

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      // 合并内置文案与消费方文案（消费方优先）
      const builtin = componentMessages[domain];
      const merged: UiMessages = {
        ...builtin,
        ...messages,
      };
      return processUiMessage(key, { locale, messages: merged, fallbackLocale: 'zh-CN' }, params);
    },
    [domain, locale, messages],
  );

  return useMemo(() => ({ t, locale }), [t, locale]);
}
