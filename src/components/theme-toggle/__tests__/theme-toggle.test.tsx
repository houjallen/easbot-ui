/**
 * ThemeToggle 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证按钮渲染与图标选择
 * 2. 状态测试 - 验证浅色 / 深色下的图标切换
 * 3. 选中值记忆测试 - 验证组件自己记住当前主题，点击后立即反馈并同步 Provider
 * 4. 交互测试 - 验证点击切换主题并写入 localStorage
 * 5. 受控模式测试 - 验证外部传入的 `theme` 与 `onThemeChange` 回调
 * 6. 无障碍测试 - 验证按钮可访问名称随语言切换
 * 7. 边界测试 - 验证无 Provider 降级、受控模式
 * 8. i18n 测试 - 验证内置文案随 `LocaleProvider` 语言切换
 *
 * @remarks
 * 1. `ThemeProvider` 的 `useTheme` 依赖 `window.matchMedia` 判断系统偏好，
 *    jsdom 未实现它 —— 这里用最小 stub 顶替。
 * 2. 主题属性与 `localStorage` 会在用例之间残留，因此每个用例结束后都要清理。
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../../../providers/theme-provider';
import { LocaleProvider } from '../../../providers/locale-provider';
import { ThemeToggle } from '../theme-toggle';

/**
 * matchMedia 桩
 *
 * @description
 * jsdom 未实现 `window.matchMedia` —— 用最小实现顶替。
 */
const installMatchMediaStub = (): void => {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
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

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('color-scheme');
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('ThemeToggle 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染图标按钮', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('浅色主题下应该显示月亮图标（点击进入深色）', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      // 月亮图标的 aria-label 是「深色模式」
      expect(screen.getByLabelText('深色模式')).toBeInTheDocument();
    });

    it('深色主题下应该显示太阳图标（点击回到浅色）', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeToggle />
        </ThemeProvider>,
      );

      // 太阳图标的 aria-label 是「浅色模式」
      expect(screen.getByLabelText('浅色模式')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该读取 resolvedTheme 而非 theme 来决定图标', () => {
      // `theme='system'` 时 resolvedTheme 解析为 light —— 图标应为月亮
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('深色模式')).toBeInTheDocument();
    });
  });

  describe('选中值记忆测试', () => {
    it('点击后图标应该立即切换（组件自己记住当前主题）', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      // 初始：浅色 → 月亮图标（点击进入深色）
      expect(screen.getByLabelText('深色模式')).toBeInTheDocument();

      act(() => {
        screen.getByRole('button').click();
      });

      // 📌 点击后应立即变为太阳图标（点击回到浅色）—— 不依赖外部回传
      expect(screen.getByLabelText('浅色模式')).toBeInTheDocument();
    });

    it('点击后应该同时同步到 Provider（DOM 属性）', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button').click();
      });

      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });

    it('连续点击应该来回切换', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button').click();
      });
      expect(screen.getByLabelText('浅色模式')).toBeInTheDocument();

      act(() => {
        screen.getByRole('button').click();
      });
      expect(screen.getByLabelText('深色模式')).toBeInTheDocument();
    });

    it('外部主题变化后图标应该同步刷新', () => {
      const { rerender } = render(
        <ThemeProvider theme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('深色模式')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme="dark">
          <ThemeToggle />
        </ThemeProvider>,
      );

      // 📌 外部（Provider / 工具栏 globals）变更主题后，本地 state 应同步
      expect(screen.getByLabelText('浅色模式')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击后应该切换到深色主题', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button').click();
      });

      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });

    it('深色主题下点击后应该切换回浅色主题', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeToggle />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button').click();
      });

      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });

    it('切换后应该把主题写入 localStorage', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button').click();
      });

      expect(window.localStorage.getItem('eas-ui-theme')).toBe('dark');
    });
  });

  describe('受控模式测试', () => {
    it('受控模式下应该使用外部传入的主题', () => {
      render(
        <ThemeProvider theme="dark">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('浅色模式')).toBeInTheDocument();
    });

    it('受控模式下点击应该回调外部的 onThemeChange', () => {
      const onThemeChange = vi.fn();

      render(
        <ThemeProvider theme="light" onThemeChange={onThemeChange}>
          <ThemeToggle />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByRole('button').click();
      });

      expect(onThemeChange).toHaveBeenCalledWith('dark');
    });

    it('受控模式下外部变更主题后图标应该同步刷新', () => {
      const { rerender } = render(
        <ThemeProvider theme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('深色模式')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme="dark">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('浅色模式')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('按钮应该可被读屏获取到角色', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('按钮应该暴露内置文案的无障碍名称', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      // `theme` 域的 `toggleLabel`
      expect(screen.getByRole('button', { name: '切换主题' })).toBeInTheDocument();
    });

    it('图标应该暴露对应目标主题的可访问名称', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      const icon = screen.getByLabelText('深色模式');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('未包裹 ThemeProvider 时点击不应抛出异常', () => {
      render(<ThemeToggle />);

      expect(() => {
        act(() => {
          screen.getByRole('button').click();
        });
      }).not.toThrow();
    });

    it('应该允许自定义尺寸', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle size={48} />
        </ThemeProvider>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '48px', height: '48px' });
    });

    it('应该允许附加自定义类名', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle className="custom-class" />
        </ThemeProvider>,
      );

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('应该允许方形按钮', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle shape="square" />
        </ThemeProvider>,
      );

      // 圆形用 `rounded-full`，方形用 `rounded-[var(--radius-md)]`
      expect(screen.getByRole('button')).toHaveClass('rounded-[var(--radius-md)]');
      expect(screen.getByRole('button')).not.toHaveClass('rounded-full');
    });

    it('默认应为圆形按钮', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByRole('button')).toHaveClass('rounded-full');
    });
  });

  describe('i18n 测试', () => {
    it('语言切换后内置文案应该同步切换', () => {
      const { rerender } = render(
        <LocaleProvider locale="zh-CN">
          <ThemeProvider defaultTheme="light">
            <ThemeToggle />
          </ThemeProvider>
        </LocaleProvider>,
      );

      expect(screen.getByRole('button', { name: '切换主题' })).toBeInTheDocument();

      // 外部切换到英文 —— 文案应随之切换
      rerender(
        <LocaleProvider locale="en-US">
          <ThemeProvider defaultTheme="light">
            <ThemeToggle />
          </ThemeProvider>
        </LocaleProvider>,
      );

      expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
    });
  });
});
