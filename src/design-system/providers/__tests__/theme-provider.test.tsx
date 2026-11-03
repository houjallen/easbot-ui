/**
 * ThemeProvider 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Provider 渲染子节点与主题属性写入 DOM
 * 2. 状态测试 - 验证 light / dark / system 三种主题的解析结果
 * 3. 交互测试 - 验证 setTheme 切换主题、onThemeChange 回调与系统偏好跟随
 * 4. 无障碍测试 - 验证 color-scheme 同步与主题属性可被外部读取
 * 5. 边界测试 - 验证无 Provider 降级、受控模式与存储持久化
 *
 * @remarks
 * 1. 主题状态写入 `<html data-theme="light|dark">` 属性，并同步 `document.documentElement.style.colorScheme`。
 * 2. 主题标识写入 `localStorage` 的 `easbot-ui-theme` 键。
 * 3. jsdom 未实现 `window.matchMedia` —— 这里用最小 stub 顶替，
 *    并通过 `matches` 开关模拟系统的暗色偏好。
 * 4. 主题属性与 `localStorage` 会在用例之间残留，因此每个用例结束后都要清理。
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { THEME_STORAGE_KEY, ThemeProvider, useTheme } from '../theme-provider';

/**
 * matchMedia 桩
 *
 * @description
 * jsdom 未实现 `window.matchMedia` —— ThemeProvider 依赖它判断系统是否偏好暗色主题。
 * 这里用最小实现顶替，并通过可变开关模拟系统偏好。
 */
let prefersDark = false;

const installMatchMediaStub = (): void => {
  globalThis.matchMedia = ((query: string) => ({
    get matches() {
      return prefersDark && query.includes('dark');
    },
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  window.matchMedia = globalThis.matchMedia;
};

installMatchMediaStub();

/**
 * 主题信息读取组件
 *
 * @description
 * 通过 `useTheme()` 读取当前主题信息并渲染到 DOM，便于断言。
 *
 * @returns 主题信息组件
 */
const ThemeProbe = () => {
  const { theme, resolvedTheme, enableSystem } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <span data-testid="enable-system">{String(enableSystem)}</span>
    </div>
  );
};

/**
 * 主题切换按钮组件
 *
 * @description
 * 调用 `setTheme` 切换主题，用于验证交互行为。
 *
 * @returns 主题切换按钮组件
 */
const ThemeSwitcher = () => {
  const { setTheme } = useTheme();

  return (
    <button type="button" onClick={() => setTheme('dark')}>
      切换到暗色
    </button>
  );
};

afterEach(() => {
  // 清理主题属性与本地存储，避免用例之间相互污染
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-changing-theme');
  document.documentElement.style.removeProperty('color-scheme');
  window.localStorage.clear();
  prefersDark = false;
});

describe('ThemeProvider 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染子节点', () => {
      render(
        <ThemeProvider>
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(screen.getByText('子节点')).toBeInTheDocument();
    });

    it('应该把主题属性写到 html 元素上', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });

    it('应该使用默认的属性名 data-theme', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });

    it('应该允许自定义主题属性名', () => {
      render(
        <ThemeProvider defaultTheme="dark" attribute="data-mode">
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(document.documentElement).toHaveAttribute('data-mode', 'dark');
      expect(document.documentElement).not.toHaveAttribute('data-theme');
    });

    it('应该把主题写入 localStorage', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });
  });

  describe('状态测试', () => {
    it('应该在 light 主题下返回 theme 为 light', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });

    it('应该在 dark 主题下返回 theme 为 dark', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });

    it('应该在 system 主题下返回 theme 为 system', () => {
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      expect(screen.getByTestId('enable-system')).toHaveTextContent('true');
    });

    it('应该在系统偏好亮色时把 system 解析为 light', () => {
      prefersDark = false;
      render(
        <ThemeProvider defaultTheme="system" enableSystem>
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });

    it('应该在系统偏好暗色时把 system 解析为 dark', () => {
      prefersDark = true;
      render(
        <ThemeProvider defaultTheme="system" enableSystem>
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });

    it('应该在未启用 system 时把 system 回退为 light', () => {
      prefersDark = true;
      render(
        <ThemeProvider defaultTheme="system" enableSystem={false}>
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('enable-system')).toHaveTextContent('false');
    });

    it('应该同步 color-scheme 到 html 元素', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(document.documentElement.style.colorScheme).toBe('dark');
    });
  });

  describe('交互测试', () => {
    it('应该在调用 setTheme 时切换主题', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeSwitcher />
          <ThemeProbe />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换到暗色' }).click();
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });

    it('应该在切换主题时触发 onThemeChange 回调', () => {
      const handleThemeChange = vi.fn();
      render(
        <ThemeProvider defaultTheme="light" onThemeChange={handleThemeChange}>
          <ThemeSwitcher />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换到暗色' }).click();
      });

      expect(handleThemeChange).toHaveBeenCalledWith('dark');
    });

    it('应该在切换主题时把新主题写入 localStorage', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeSwitcher />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换到暗色' }).click();
      });

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('应该在切换主题时同步 color-scheme', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeSwitcher />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换到暗色' }).click();
      });

      expect(document.documentElement.style.colorScheme).toBe('dark');
    });
  });

  describe('无障碍测试', () => {
    it('应该让外部脚本能读取到主题属性', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('应该让原生表单控件跟随 color-scheme', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(document.documentElement.style.getPropertyValue('color-scheme')).toBe('light');
    });

    it('应该在禁用过渡动画时临时标记 data-changing-theme 属性', () => {
      render(
        <ThemeProvider defaultTheme="light" disableTransitionOnChange>
          <span>子节点</span>
        </ThemeProvider>,
      );

      expect(document.documentElement).toHaveAttribute('data-changing-theme');
    });
  });

  describe('边界测试', () => {
    it('应该在没有 Provider 时降级为读取 DOM 上的主题', () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      render(<ThemeProbe />);

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('enable-system')).toHaveTextContent('false');
    });

    it('应该在没有 Provider 且 DOM 无主题时降级为 light', () => {
      render(<ThemeProbe />);

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });

    it('应该在受控模式下保持外部传入的主题', () => {
      const handleThemeChange = vi.fn();
      render(
        <ThemeProvider theme="light" onThemeChange={handleThemeChange}>
          <ThemeSwitcher />
          <ThemeProbe />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换到暗色' }).click();
      });

      expect(handleThemeChange).toHaveBeenCalledWith('dark');
      // 受控模式下主题由外部决定，组件本身不会自行变更
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('应该在挂载时读取已存储的主题', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      render(
        <ThemeProvider defaultTheme="light">
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });

    it('应该忽略 localStorage 中的非法主题值', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'not-a-theme');

      render(
        <ThemeProvider defaultTheme="light">
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('应该允许渲染没有子节点的 Provider', () => {
      render(<ThemeProvider defaultTheme="light" />);

      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });
  });
});
