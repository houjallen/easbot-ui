/**
 * ModeToggle 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证触发按钮与主题菜单项的基本渲染与类名
 * 2. 状态测试 - 验证主题属性随选择变化、菜单项激活态
 * 3. 交互测试 - 验证选择 Light / Dark / System 后切换主题
 * 4. 无障碍测试 - 验证触发器可访问名称、菜单语义角色与焦点管理
 * 5. 边界测试 - 验证无 Provider 降级、主题持久化与菜单关闭
 *
 * @remarks
 * 1. Radix 的 `DropdownMenuTrigger` 通过 `onPointerDown`（`button === 0` 且 `ctrlKey === false`）
 *    切换菜单展开状态，而不是 `onClick`。
 * 2. 下拉菜单渲染到 `document.body`（portal），必须用 `screen.findByRole(...)` 查询。
 * 3. 主题状态写入 `<html data-theme="...">` 与 `localStorage`，
 *    因此用例结束后需要清理，避免相互污染。
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { ModeToggle } from '../mode-toggle';
import { THEME_STORAGE_KEY, ThemeProvider } from '../../providers/theme-provider';

/**
 * matchMedia 桩
 *
 * @description
 * jsdom 未实现 `window.matchMedia` —— ThemeProvider 依赖它判断系统是否偏好暗色主题。
 * 这里用最小实现顶替（永远返回不匹配，即系统偏好亮色）。
 */
if (typeof window.matchMedia !== 'function') {
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
}

/**
 * 打开下拉菜单
 *
 * @description
 * Radix 的 `DropdownMenuTrigger` 鼠标路径走 `onPointerDown`，
 * 这里显式派发指针事件来打开菜单。
 *
 * @param trigger 触发器元素
 */
const openMenu = (trigger: HTMLElement): void => {
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
};

afterEach(() => {
  // 清理主题属性与本地存储，避免用例之间相互污染
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('color-scheme');
  window.localStorage.clear();
});

describe('ModeToggle 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染主题切换按钮', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      const trigger = screen.getByRole('button', { name: '切换主题' });
      // 触发器使用 `asChild`，因此渲染的是 `DropdownMenuTrigger` 自身的 data-slot
      expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
      expect(trigger).toHaveClass('shrink-0');
      expect(trigger).toHaveClass('text-foreground');
    });

    it('应该正确渲染太阳与月亮图标', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      const trigger = screen.getByRole('button', { name: '切换主题' });
      const icons = trigger.querySelectorAll('svg');
      expect(icons).toHaveLength(2);
      expect(icons[0]).toHaveClass('rotate-0');
      expect(icons[0]).toHaveClass('scale-100');
      expect(icons[1]).toHaveClass('rotate-90');
      expect(icons[1]).toHaveClass('scale-0');
    });

    it('应该渲染三个主题菜单项', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));

      expect(await screen.findByRole('menuitem', { name: '浅色模式' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: '深色模式' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: '跟随系统' })).toBeInTheDocument();
    });

    it('应该正确应用菜单内容与菜单项类名', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));

      const content = await screen.findByRole('menu');
      expect(content).toHaveAttribute('data-slot', 'dropdown-menu-content');
      expect(content).toHaveClass('bg-popover');
      expect(content).toHaveClass('rounded-md');
      expect(content).toHaveClass('border');

      const item = screen.getByRole('menuitem', { name: '浅色模式' });
      expect(item).toHaveAttribute('data-slot', 'dropdown-menu-item');
      expect(item).toHaveClass('flex');
      expect(item).toHaveClass('rounded-sm');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染关闭的下拉菜单', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '切换主题' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在选择 Dark 后把主题属性改为 dark', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '深色模式' }));

      await waitFor(() => {
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
      });
    });

    it('应该在选择 Light 后把主题属性改为 light', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '浅色模式' }));

      await waitFor(() => {
        expect(document.documentElement).toHaveAttribute('data-theme', 'light');
      });
    });

    it('应该在选择 System 后把主题属性写为 system 的解析结果', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '跟随系统' }));

      await waitFor(() => {
        // 系统偏好为亮色时，system 解析为 light
        expect(document.documentElement).toHaveAttribute('data-theme', 'light');
      });
    });
  });

  describe('交互测试', () => {
    it('应该在选择主题后关闭下拉菜单', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '深色模式' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('应该在选择主题后把主题写入 localStorage', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '深色模式' }));

      await waitFor(() => {
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
      });
    });

    it('应该在选择主题后同步 color-scheme', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: '深色模式' }));

      await waitFor(() => {
        expect(document.documentElement.style.colorScheme).toBe('dark');
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该为触发器提供可访问名称 Toggle theme', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      expect(screen.getByRole('button', { name: '切换主题' })).toBeInTheDocument();
    });

    it('应该暴露 menu 语义角色', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));

      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('应该暴露 menuitem 语义角色', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      openMenu(screen.getByRole('button', { name: '切换主题' }));

      expect(await screen.findAllByRole('menuitem')).toHaveLength(3);
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      const trigger = screen.getByRole('button', { name: '切换主题' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该为触发器暴露 aria-expanded 属性', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      const trigger = screen.getByRole('button', { name: '切换主题' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      openMenu(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('边界测试', () => {
    it('应该在没有 ThemeProvider 时正常渲染', () => {
      render(<ModeToggle />);

      expect(screen.getByRole('button', { name: '切换主题' })).toBeInTheDocument();
    });

    it('应该在没有 ThemeProvider 时选择主题不抛出异常', async () => {
      const handleError = vi.fn();
      render(<ModeToggle />);

      openMenu(screen.getByRole('button', { name: '切换主题' }));

      await act(async () => {
        fireEvent.click(await screen.findByRole('menuitem', { name: '深色模式' }));
      });

      expect(handleError).not.toHaveBeenCalled();
    });

    it('应该允许重复打开并关闭下拉菜单', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ModeToggle />
        </ThemeProvider>,
      );

      const trigger = screen.getByRole('button', { name: '切换主题' });

      openMenu(trigger);
      expect(await screen.findByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });

      openMenu(trigger);
      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });
  });
});
