/**
 * 主题 Provider（框架无关）
 *
 * @description
 * **不依赖 `next-themes`** —— 本组件库同时支持 Next.js 与纯 React 应用，
 * 因此主题能力必须自实现，不能绑定任何框架运行时。
 *
 * 实现要点：
 * 1. 主题状态存放在 `<html data-theme="...">` 属性上（与主题 CSS 的选择器约定一致）
 * 2. `system` 主题跟随 `prefers-color-scheme` 媒体查询
 * 3. 主题切换写入 `localStorage`，刷新后保持
 * 4. 首次挂载前同步读取已存主题，避免闪烁（`suppressHydrationWarning`）
 *
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 * ```
 */

import * as React from 'react';

/** 主题标识 */
export type Theme = 'light' | 'dark' | 'system';

/** 主题存储键名 */
export const THEME_STORAGE_KEY = 'eas-ui-theme';

/**
 * 主题 Provider 属性
 *
 * @description
 * 支持**受控**（`theme` + `onThemeChange`）与**非受控**（`defaultTheme`）两种模式，
 * 受控值优先于非受控值。
 */
export interface ThemeProviderProps {
  /** 子节点 */
  children?: React.ReactNode;
  /** 挂载到哪个元素上 */
  container?: HTMLElement | null;
  /**
   * 主题属性名
   *
   * @defaultValue 'data-theme'
   *
   * @description
   * 写入 `<html>` 的属性名，需与主题 CSS 的选择器约定一致
   * （本库为 `:root[data-theme='light|dark']`，与主题 CSS 的选择器约定一致）。
   */
  attribute?: string;
  /**
   * 默认主题（非受控模式的初始值）
   *
   * @defaultValue 'system'
   */
  defaultTheme?: Theme;
  /**
   * 是否启用 `system` 主题
   *
   * @defaultValue true
   *
   * @description
   * 关闭后 `theme` 不会取到 `'system'`。
   */
  enableSystem?: boolean;
  /** 是否禁用切换过渡动画 */
  disableTransitionOnChange?: boolean;
  /** 所有可用主题 */
  themes?: Theme[];
  /**
   * 受控模式的主题值
   *
   * @description
   * 传入即为受控模式 —— 本 Provider **不会**自行修改该值。
   */
  theme?: Theme;
  /** 主题变化回调 */
  onThemeChange?: (theme: Theme) => void;
}

/**
 * 主题上下文值
 *
 * @description
 * `theme` 可能是 `'system'`（用户意图），`resolvedTheme` 是**实际生效**的主题
 * （`'system'` 已被解析为 `light` / `dark`）—— 组件读样式时**必须**用后者。
 */
export interface ThemeContextValue {
  /** 当前主题（可能是 `system`） */
  theme: Theme;
  /** 实际生效的主题（`system` 已解析为 light/dark） */
  resolvedTheme: 'light' | 'dark';
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 是否启用 system 主题 */
  enableSystem: boolean;
}

/**
 * 主题上下文
 *
 * @description
 * 默认为 `undefined`，便于 `useTheme` 在无 Provider 时降级读 DOM。
 */
export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

/**
 * 读取系统偏好主题
 *
 * @returns 系统是否为暗色
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 读取已存储的主题
 *
 * @returns 存储的主题标识；无则返回 `null`
 */
function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
  } catch {
    // localStorage 被禁用时忽略
    return null;
  }
}

/**
 * 把主题写入 DOM 与存储
 *
 * @param theme 目标主题
 * @param attribute 属性名
 * @param enableSystem 是否启用 system
 */
function applyTheme(theme: Theme, attribute: string, enableSystem: boolean) {
  if (typeof document === 'undefined') return;

  const resolved: 'light' | 'dark' = theme === 'system' ? (enableSystem ? getSystemTheme() : 'light') : theme;
  const root = document.documentElement;

  root.setAttribute(attribute, resolved);
  // 同步 `color-scheme`，让原生控件（滚动条、表单）跟随主题
  root.style.colorScheme = resolved;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage 被禁用时忽略
  }
}

/**
 * 主题 Provider
 *
 * @param props Provider 属性
 * @returns Provider 组件
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  attribute = 'data-theme',
  disableTransitionOnChange = false,
  theme: controlledTheme,
  onThemeChange,
}: ThemeProviderProps) {
  // 受控 / 非受控
  const [uncontrolledTheme, setUncontrolledTheme] = React.useState<Theme>(defaultTheme);
  const theme = controlledTheme ?? uncontrolledTheme;

  // 挂载时应用已存主题
  // biome-ignore lint/correctness/useExhaustiveDependencies: 仅在挂载时读取一次已存主题，后续主题变更由下方 effect 负责
  React.useEffect(() => {
    const stored = readStoredTheme();
    if (stored && controlledTheme === undefined) {
      setUncontrolledTheme(stored);
      applyTheme(stored, attribute, enableSystem);
      return;
    }
    applyTheme(theme, attribute, enableSystem);
  }, []);

  // 主题变化时同步 DOM
  React.useEffect(() => {
    applyTheme(theme, attribute, enableSystem);
  }, [theme, attribute, enableSystem]);

  // 跟随系统偏好变化
  React.useEffect(() => {
    if (!enableSystem || theme !== 'system') return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system', attribute, enableSystem);

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme, attribute, enableSystem]);

  // 切换主题的回调（供 useTheme 使用）
  const setTheme = React.useCallback(
    (next: Theme) => {
      if (controlledTheme === undefined) {
        setUncontrolledTheme(next);
      }
      applyTheme(next, attribute, enableSystem);
      onThemeChange?.(next);
    },
    [attribute, enableSystem, controlledTheme, onThemeChange],
  );

  const contextValue = React.useMemo<ThemeContextValue>(() => {
    // `resolvedTheme` 只能是 `light | dark`：
    // - `theme === 'system'` 且启用 system 时跟随系统偏好
    // - `theme === 'system'` 但未启用 system 时，回退到 `light`
    // - `enableSystem` 为 false 时 `theme` 不会取到 `'system'`（见下方守卫）
    const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (enableSystem ? getSystemTheme() : 'light') : theme;

    return { theme, resolvedTheme, setTheme, enableSystem };
  }, [theme, setTheme, enableSystem]);

  return <ThemeContext.Provider value={contextValue}>{disableTransitionOnChange ? <DisableTransition>{children}</DisableTransition> : children}</ThemeContext.Provider>;
}

/**
 * 临时禁用过渡动画的包装
 *
 * @description
 * 切换主题的瞬间给 `<html>` 打上标记，让 CSS 过渡失效 ——
 * 避免「背景色已变、边框色未变」的中间态闪烁。
 *
 * @param props 组件属性
 * @returns 包装组件
 */
function DisableTransition({ children }: { children?: React.ReactNode }) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: 仅在挂载与 children 变化时临时禁用过渡动画，effect 内不读取 children
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-changing-theme', '');
    const timer = setTimeout(() => {
      root.removeAttribute('data-changing-theme');
    }, 100);

    return () => clearTimeout(timer);
  }, [children]);

  return <>{children}</>;
}

export default ThemeProvider;
