/**
 * 通知（Notify）Provider
 *
 * @description
 * 为组件库提供**语义化通知**能力：把 `notify.success('保存成功')` 这类
 * 简短调用映射为库内 `toast()` 的完整参数（标题 / 描述 / 变体）。
 *
 * 设计要点：
 * 1. **框架无关** —— 只依赖 React 与本库自有组件，**不引入** `next-themes` /
 *    `use-context-selector` 等外部运行时（消费方可自由搭配 Next.js / Vite / 纯 React）。
 * 2. **复用库内 `Toaster` + `toast()`** —— `src/ui/use-toast` 的 `toast()` 是
 *    **模块级函数**，可在任意位置（事件回调、非组件函数）调用，
 *    因此本 Provider 只需提供「语义 → 参数」的映射与上下文分发，
 *    避免同一套通知出现两份实现（样式 / i18n / 关闭行为不一致）。
 * 3. **标题走内置文案表** —— 缺省标题按 `variant` 取语义化文案
 *    （提示 / 成功 / 警告 / 错误），由 `useComponentMessage('toast')` 读取，
 *    因此 **不出现内联中英文字符串字面量**（见 `spec/i18n-standard.md`）。
 * 4. **变体映射正确** —— 每种语义对应一个 `ToastVariant`，
 *    使 `error` 走 `destructive` 红色样式、`warning` 走 `warning` 黄色样式，
 *    而不是全部退化为 `default`。
 *
 * @example
 * ```tsx
 * <NotifyProvider>
 *   <App />
 * </NotifyProvider>
 * ```
 *
 * @example
 * ```tsx
 * // 组件内部消费
 * const { notify, close } = useNotify();
 * notify.success('配置已保存');
 * ```
 */

import * as React from 'react';

import { useComponentMessage } from '../utils/use-component-message';
import { Toaster } from '../ui/toast';
import type { ToastPosition, ToastVariant } from '../ui/toast/types';
import { dismiss, toast } from '../ui/use-toast';
import type { ToastOptions } from '../ui/use-toast';

/**
 * 通知语义
 *
 * @description
 * `info` / `success` / `warning` / `error` 四种语义，
 * 各自映射到对应的 Toast 变体（见 `variantMap`）。
 */
export type NotifyVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * 单次通知的可选参数
 *
 * @description
 * 允许消费方在调用语义化通知时**逐次覆盖**默认行为：
 * - `title` —— 覆盖该语义的内置默认标题；
 * - `duration` —— 覆盖该语义（或 Provider）的默认停留时长（毫秒）；
 * - `variant` —— 覆盖该语义映射的 Toast 变体（如 `success` 语义但用 `info` 外观）；
 * - `position` —— 覆盖该次通知的显示位置。
 *
 * 📌 **直接复用 `ToastOptions`** —— 通知参数的类型来源**唯一**，
 *    位于 `src/ui/use-toast`（`toast()` 的入参类型），
 *    避免「两份定义、两套字段」的漂移。
 */
export type NotifyOptions = ToastOptions;

/**
 * 通知 API
 *
 * @description
 * 每个方法接受「描述内容」与可选的覆盖项；
 * 标题缺省时按语义取内置文案（也可通过 `options.title` 显式覆盖）。
 *
 * 📌 **标题只有一处来源** —— `options.title`，
 *    不再单独提供 `title` 位置参数，避免「两处定义标题」的歧义。
 */
export interface NotifyApi {
  /** 提示（蓝色） */
  info: (message: string, options?: NotifyOptions) => void;
  /** 成功（绿色） */
  success: (message: string, options?: NotifyOptions) => void;
  /** 警告（黄色） */
  warning: (message: string, options?: NotifyOptions) => void;
  /** 错误（红色） */
  error: (message: string, options?: NotifyOptions) => void;
  /**
   * 警告的别名
   *
   * @description
   * 兼容以 `warn` 命名的调用习惯，行为与 `warning` 完全一致。
   */
  warn: (message: string, options?: NotifyOptions) => void;
}

/** 通知上下文值 */
export interface NotifyContextValue {
  /** 语义化通知 API */
  notify: NotifyApi;
  /** 关闭全部通知 */
  close: () => void;
}

/**
 * 通知上下文
 *
 * @description
 * 默认值为空实现（no-op），使组件在**未包裹 Provider** 时也能安全调用
 * `notify.xxx()` —— 不会抛错，只是不会渲染通知。
 */
export const NotifyContext = React.createContext<NotifyContextValue | null>(null);

/** 空操作（未包裹 Provider 时的兜底） */
function noop(): void {
  /* 无 Provider 时不做任何事 */
}

/** 空操作通知 API（未包裹 Provider 时的兜底） */
const noopNotify: NotifyApi = {
  info: noop,
  success: noop,
  warning: noop,
  error: noop,
  warn: noop,
};

/**
 * 语义 → Toast 变体映射
 *
 * @description
 * `ToastVariant` 与 `NotifyVariant` 的取值不完全一致：
 * Toast 用 `destructive` 表达错误，而 `info` / `success` / `warning` 两者同名。
 */
const variantMap: Record<NotifyVariant, ToastVariant> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
};

/**
 * 语义 → 内置文案 key 映射
 *
 * @description
 * 与 `src/utils/component-messages.ts` 的 `toast` 域 key 对齐。
 */
const titleKeyMap: Record<NotifyVariant, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

/**
 * 读取通知上下文
 *
 * @returns 通知 API 与关闭方法；未包裹 Provider 时返回空实现
 */
export function useNotify(): NotifyContextValue {
  const context = React.useContext(NotifyContext);
  if (context) return context;
  return { notify: noopNotify, close: noop };
}

/** 通知 Provider 属性 */
export interface NotifyProviderProps {
  children?: React.ReactNode;
  /** 通知默认显示位置 */
  position?: ToastPosition;
  /** 通知默认停留时长（毫秒）；`Infinity` 表示不自动关闭 */
  duration?: number;
  /** 语言覆盖（优先级高于 `LocaleProvider`） */
  locale?: string;
}

/**
 * 通知 Provider
 *
 * @param props Provider 属性
 * @returns Provider 组件
 */
export function NotifyProvider({ children, position = 'bottom-right', duration, locale }: NotifyProviderProps) {
  const { t } = useComponentMessage('toast', { locale });

  const notify = React.useMemo<NotifyApi>(() => {
    const push = (variant: NotifyVariant) => (message: string, options?: NotifyOptions) => {
      toast({
        // 📌 **标题只有一处来源** —— `options.title`；
        //    缺省时按语义取内置文案。
        title: options?.title || t(titleKeyMap[variant]),
        description: message,
        // 📌 **逐次覆盖优先于语义默认** ——
        //    `options.variant` 让消费方在保持语义调用的同时切换外观；
        //    缺省时回退到该语义映射的变体（见 `variantMap`）。
        variant: options?.variant ?? variantMap[variant],
        // 📌 **停留时长三级优先级**：`options.duration` > Provider 默认 > 组件默认
        duration: options?.duration ?? duration,
        // 📌 **位置三级优先级**：`options.position` > Provider 默认 > 组件默认
        position: options?.position ?? position,
      });
    };

    return {
      info: push('info'),
      success: push('success'),
      warning: push('warning'),
      error: push('error'),
      warn: push('warning'),
    };
  }, [t, position, duration]);

  const close = React.useCallback(() => {
    dismiss();
  }, []);

  const value = React.useMemo<NotifyContextValue>(() => ({ notify, close }), [notify, close]);

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Toaster position={position} duration={duration} locale={locale} />
    </NotifyContext.Provider>
  );
}
