/**
 * 主题切换按钮（Theme Toggle）
 *
 * @description
 * 在**浅色**与**深色**两种主题间一键切换的图标按钮。
 *
 * 设计要点：
 * 1. **只支持 light / dark 两态** —— 不含 `system`（跟随系统）。
 *    需要三态时消费方可自行用 `useTheme()` 组合下拉菜单。
 * 2. **图标语义 = 当前可切换到的目标** —— 当前为浅色时显示月亮图标（点击进入深色），
 *    当前为深色时显示太阳图标（点击回到浅色）。
 * 3. **组件自己记住当前主题** —— 用本地 `state` 记录**实际生效**的主题，
 *    初始值取自 `useTheme()` 的 `resolvedTheme`；
 *    用户点击后**先**更新本地 state（UI 立即反馈），
 *    **再**通过 `setTheme` 同步回 Provider / localStorage。
 *    外部主题变化（如 Storybook 工具栏切换 globals）时同步该 state。
 * 4. **状态来源是 `useTheme()`** —— 读 `resolvedTheme`（实际生效的主题），
 *    而非 `theme`（可能是 `'system'`）。
 * 5. **切换后写入 `localStorage`** —— 由 `ThemeProvider` 的 `setTheme` 负责持久化。
 * 6. **文案走内置文案表** —— `theme` 域（`themeMessages`），语言由 `LocaleProvider` 决定，
 *    无需消费方传入 `locale` / `messages`。
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */

'use client';

import * as React from 'react';

import { useTheme } from '../../hooks/use-theme';
import { useComponentMessage } from '../../utils/use-component-message';
import { IconButton } from '../../ui/icon';

/**
 * 主题切换按钮属性
 */
export interface ThemeToggleProps {
  /** 图标尺寸（像素） */
  size?: number;
  /** 按钮形状 */
  shape?: 'circle' | 'square';
  /** 附加类名 */
  className?: string;
}

/**
 * 主题切换按钮
 *
 * @param props 组件属性
 * @returns 图标按钮
 */
export const ThemeToggle = React.memo(function ThemeToggle({ size = 32, shape = 'circle', className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useComponentMessage('theme');

  // 📌 **组件自己记住当前主题** —— 初始值来自 `useTheme()`（即 Provider 注入的实际生效主题），
  //    用户点击后立即更新本地 state（UI 无需等待外部回传即可响应），
  //    同时通过 `setTheme` 同步回 Provider / localStorage。
  const [current, setCurrent] = React.useState<'light' | 'dark'>(resolvedTheme);

  // 外部主题变化时（如 Storybook 工具栏切换 globals）同步当前主题。
  // 依赖 `resolvedTheme` 而非 `current` —— 避免用户刚点完就被旧值覆盖。
  React.useEffect(() => {
    setCurrent(resolvedTheme);
  }, [resolvedTheme]);

  const isDark = current === 'dark';

  const handleClick = React.useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    // 先更新本地状态（UI 立即反馈），再同步到 Provider
    setCurrent(next);
    setTheme(next);
  }, [isDark, setTheme]);

  return (
    <IconButton
      // 图标表示**点击后将进入**的主题
      icon={isDark ? 'eas-sun' : 'eas-moon'}
      shape={shape}
      size={size}
      aria-label={t('toggleLabel')}
      className={className}
      onClick={handleClick}
    />
  );
});

ThemeToggle.displayName = 'ThemeToggle';
