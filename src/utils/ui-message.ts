/**
 * UI 国际化消息工具
 *
 * @description
 * 由 `hxsoft-js-framework/repository/util/utils/UiMessageUtils` 移植而来，
 * 去除 `@repo/i18n` 依赖（组件库无全局 store，语言由调用方传入）。
 *
 * 消息表结构为「语言 → 消息 key → 文案模板」，
 * 文案模板中可用 `{param}` 占位符，由调用时传入的参数替换。
 */

/** 消息表：语言 → key → 文案 */
export interface UiMessages {
  [locale: string]: {
    [key: string]: unknown;
  };
}

/**
 * 组件级文案覆盖属性
 *
 * @description
 * 组件通过该属性把「语言覆盖」与「自定义文案」透传给 `useComponentMessage`，
 * 使消费方既能按组件实例切换语言，也能覆盖内置文案。
 */
export interface UiMessageProps {
  /** 语言覆盖（优先级高于 LocaleProvider） */
  locale?: string;
  /** 自定义文案（优先级高于内置文案） */
  messages?: UiMessages;
}

/** 消息参数表 */
export type UiMessageParams = Record<string, unknown>;

/** 消息处理选项 */
export interface MessageProcessorOptions {
  /** 当前语言 */
  locale?: string;
  /** 从上下文获取语言的提供者（优先于 `locale`） */
  localeProvider?: () => string;
  /** 消息表 */
  messages?: UiMessages;
  /** 回退语言 */
  fallbackLocale?: string;
}

/**
 * 通过点号路径获取嵌套对象的值
 *
 * @param obj 目标对象
 * @param path 点号分隔的路径
 * @returns 获取到的值，未命中返回 `undefined`
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in (current as object)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * 处理消息插值替换
 *
 * @param message 原始消息
 * @param params 插值参数
 * @returns 处理后的消息
 */
function interpolateMessage(message: string, params?: Record<string, unknown>): string {
  if (!params) return message;

  let result = message;
  for (const paramKey of Object.keys(params)) {
    const placeholder = `{${paramKey}}`;
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(params[paramKey]));
  }

  return result;
}

/**
 * 解析当前生效的语言
 *
 * @param options 处理选项
 * @returns 语言标识
 */
function resolveLocale(options: MessageProcessorOptions): string {
  const { locale, localeProvider, fallbackLocale = 'zh-CN' } = options;
  return locale ?? localeProvider?.() ?? fallbackLocale;
}

/**
 * 读取消息表中的嵌套对象
 *
 * @description
 * 适用于「文案表本身是一个对象 / 数组」的场景（如日期格式示例表）——
 * 这类值无法用点号路径直接取值（key 内含 `.`），需要按 locale 取整张表后再取子对象。
 *
 * @param key 消息键名（支持点号路径）
 * @param options 处理选项
 * @returns 命中的对象，未命中返回 `undefined`
 */
export function getUiMessageObject<T = unknown>(key: string, options: MessageProcessorOptions = {}): T | undefined {
  const { messages = {}, fallbackLocale = 'zh-CN' } = options;
  const resolvedLocale = resolveLocale(options);

  const currentMessages = messages[resolvedLocale] ?? {};
  const fallbackMessages = messages[fallbackLocale] ?? {};

  const current = getNestedValue(currentMessages, key);
  if (current !== undefined) return current as T;

  return getNestedValue(fallbackMessages, key) as T | undefined;
}

/**
 * 核心消息处理函数
 *
 * @description
 * 纯函数实现。取值顺序：
 * 1. 当前语言
 * 2. 回退语言
 * 3. key 本身（作为兜底文案）
 *
 * 支持点号路径（如 `pagination.total`）与 `{param}` 插值。
 *
 * @param key 消息键名
 * @param options 处理选项
 * @param params 插值参数
 * @returns 处理后的消息文本
 *
 * @example
 * ```ts
 * const message = processUiMessage('title', {
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': { title: '导出数据' },
 *     'en-US': { title: 'Export Data' },
 *   },
 * });
 * ```
 */
export function processUiMessage(key: string, options: MessageProcessorOptions = {}, params?: Record<string, unknown>): string {
  const { messages = {}, fallbackLocale = 'zh-CN' } = options;
  const resolvedLocale = resolveLocale(options);

  const currentMessages = messages[resolvedLocale] ?? {};
  const fallbackMessages = messages[fallbackLocale] ?? {};

  // 先取当前语言
  let message = currentMessages[key];

  // 直接取不到时尝试点号路径
  if (message === undefined && key.includes('.')) {
    message = getNestedValue(currentMessages, key);
  }

  // 当前语言没有则回退
  if (message === undefined) {
    message = fallbackMessages[key];
    if (message === undefined && key.includes('.')) {
      message = getNestedValue(fallbackMessages, key);
    }
  }

  // 仍取不到则用 key 兜底
  if (message === undefined) {
    message = key;
  }

  return interpolateMessage(String(message), params);
}

/**
 * 创建消息处理器工厂函数
 *
 * @description
 * 预设配置，返回一个绑定了配置的处理函数。
 *
 * @param options 预设的处理选项
 * @returns 绑定了配置的消息处理函数
 *
 * @example
 * ```ts
 * const t = createMessageProcessor({
 *   locale: 'zh-CN',
 *   messages: { 'zh-CN': { hello: '你好，{name}' } },
 * });
 *
 * t('hello', { name: '小莫' }); // => '你好，小莫'
 * ```
 */
export function createMessageProcessor(options: MessageProcessorOptions) {
  return (key: string, params?: Record<string, unknown>): string => processUiMessage(key, options, params);
}

/**
 * 创建上下文消息处理器工厂
 *
 * @description
 * 语言由 `localeProvider` 动态提供，适合「同一处理器服务多语言场景」。
 *
 * @param localeProvider 语言提供者
 * @param messages 消息表
 * @param fallbackLocale 回退语言
 * @returns 消息处理函数
 */
export function createContextMessageProcessor(localeProvider: () => string, messages: UiMessages, fallbackLocale = 'zh-CN') {
  return (key: string, params?: Record<string, unknown>) => processUiMessage(key, { localeProvider, messages, fallbackLocale }, params);
}

/**
 * 批量处理消息
 *
 * @param keys 消息键数组
 * @param options 处理选项
 * @param params 插值参数（应用到所有消息）
 * @returns key → 文案 的映射
 */
export function processBatchMessages(keys: string[], options: MessageProcessorOptions = {}, params?: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = processUiMessage(key, options, params);
  }
  return result;
}

/**
 * 检查消息是否存在
 *
 * @param key 消息键名
 * @param options 处理选项
 * @returns 是否存在该消息
 */
export function hasMessage(key: string, options: MessageProcessorOptions = {}): boolean {
  const { messages = {}, fallbackLocale = 'zh-CN' } = options;
  const resolvedLocale = resolveLocale(options);

  const currentMessages = messages[resolvedLocale] ?? {};
  const fallbackMessages = messages[fallbackLocale] ?? {};

  if (currentMessages[key] !== undefined) return true;
  if (key.includes('.') && getNestedValue(currentMessages, key) !== undefined) {
    return true;
  }
  if (fallbackMessages[key] !== undefined) return true;
  if (key.includes('.') && getNestedValue(fallbackMessages, key) !== undefined) {
    return true;
  }

  return false;
}

/**
 * 获取所有可用的消息键
 *
 * @param options 处理选项
 * @returns 所有消息键路径数组
 */
export function getAvailableMessageKeys(options: MessageProcessorOptions = {}): string[] {
  const { messages = {} } = options;
  const resolvedLocale = resolveLocale(options);
  const currentMessages = messages[resolvedLocale] ?? {};

  const keys: string[] = [];

  const extractKeys = (obj: unknown, prefix = ''): void => {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        extractKeys(value, fullKey);
      } else {
        keys.push(fullKey);
      }
    }
  };

  extractKeys(currentMessages);
  return keys;
}

/**
 * 合并多个消息对象
 *
 * @param messagesList 消息对象数组
 * @returns 合并后的消息对象
 */
export function mergeUiMessages(...messagesList: UiMessages[]): UiMessages {
  const result: UiMessages = {};

  for (const messages of messagesList) {
    for (const locale of Object.keys(messages)) {
      result[locale] = { ...result[locale], ...messages[locale] };
    }
  }

  return result;
}
