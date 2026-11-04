/**
 * 主题 Hook
 *
 * @description
 * 读取当前主题并提供切换能力。
 *
 * 与 [`LocaleProvider`](../providers/locale-provider.tsx) 的 `useLocale` 保持同一模式：
 * Hook 定义在 `src/hooks/`，从 `src/providers/` 导入 Context —— **反向依赖**，
 * 避免 `providers/` 与 `hooks/` 之间的循环依赖。
 *
 * 使用场景：
 * 1. 读取当前主题（`theme` / `resolvedTheme`）
 * 2. 切换主题（`setTheme`）
 *
 * @example
 * ```tsx
 * const { resolvedTheme, setTheme } = useTheme();
 * return <button onClick={() => setTheme('dark')}>切换暗色</button>;
 * ```
 */

import { useContext } from 'react';
import { ThemeContext } from '../providers/theme-provider';
import type { ThemeContextValue } from '../providers/theme-provider';

/**
 * 读取当前主题
 *
 * @description
 * 无 Provider 时**降级**：直接读 `<html>` 上的 `data-theme` 属性，
 * 此时 `setTheme` 为空实现（不做任何事），`enableSystem` 为 `false`。
 *
 * @returns 主题信息；无 Provider 时返回降级值
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context) return context;

  // 无 Provider 时降级：直接读 DOM
  const resolved = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

  return {
    theme: resolved,
    resolvedTheme: resolved,
    setTheme: () => {
      /* 无 Provider 时不做任何事 */
    },
    enableSystem: false,
  };
}
