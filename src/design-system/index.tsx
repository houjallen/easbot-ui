/**
 * 设计系统 Provider 组合
 *
 * @description
 * 把主题、Tooltip、Toast 三个 Provider 组合成一个，供消费方在应用根部一次性包裹。
 *
 * 说明：上游版本此处还包裹了 `AnalyticsProvider`（业务埋点）与 `AuthProvider`（鉴权），
 * 二者都属于**业务侧职责**，组件库不内置 —— 需要时请在消费方自行包裹。
 */

import type { ThemeProviderProps } from './providers/theme-provider';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme-provider';

/** DesignSystemProvider 属性 */
export type DesignSystemProviderProps = ThemeProviderProps & {
  /** 隐私政策地址 */
  privacyUrl?: string;
  /** 服务条款地址 */
  termsUrl?: string;
  /** 帮助中心地址 */
  helpUrl?: string;
};

/**
 * 设计系统 Provider
 *
 * @param props Provider 属性
 * @returns Provider 组件
 *
 * @example
 * ```tsx
 * <DesignSystemProvider defaultTheme="light">
 *   <App />
 * </DesignSystemProvider>
 * ```
 */
export const DesignSystemProvider = ({ children, privacyUrl: _privacyUrl, termsUrl: _termsUrl, helpUrl: _helpUrl, ...properties }: DesignSystemProviderProps) => (
  <ThemeProvider {...properties}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
);

export { ThemeProvider, useTheme } from './providers/theme-provider';
export type { Theme, ThemeProviderProps } from './providers/theme-provider';

export default DesignSystemProvider;
