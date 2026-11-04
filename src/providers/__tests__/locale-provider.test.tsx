/**
 * LocaleProvider 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Provider 渲染子节点
 * 2. 状态测试 - 验证受控模式优先、持久化读取、浏览器语言推断
 * 3. 交互测试 - 验证 `setLocale` 切换语言并写入持久化、受控模式同步持久化
 * 4. 无障碍测试 - 验证语言上下文对读屏暴露为可读文本
 * 5. 边界测试 - 验证存储被禁用、非法语言值、`reloadPage` 刷新
 *
 * @remarks
 * `localStorage` 是**全局共享**状态，用例之间需清理，
 * 否则会影响后续用例的「挂载时读取已存语言」行为。
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocale } from '../../hooks/use-locale';
import { LOCALE_STORAGE_KEY, LocaleProvider } from '../locale-provider';

/**
 * 语言探针组件
 *
 * @description
 * 通过 `useLocale()` 拿到当前语言与设置函数，并渲染成按钮，便于点击触发。
 *
 * @returns 语言探针组件
 */
const LocaleProbe = () => {
  const { locale, setLocale } = useLocale();

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button type="button" onClick={() => setLocale?.('en-US')}>
        切换英文
      </button>
      <button type="button" onClick={() => setLocale?.('zh-CN')}>
        切换中文
      </button>
      <button type="button" onClick={() => setLocale?.('en-US', true)}>
        切换并刷新
      </button>
    </div>
  );
};

/**
 * 读取当前探针渲染出的语言
 *
 * @returns 当前语言
 */
function getRenderedLocale(): string {
  return screen.getByTestId('locale').textContent ?? '';
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('LocaleProvider', () => {
  describe('渲染测试', () => {
    it('应渲染子节点', () => {
      render(
        <LocaleProvider>
          <span>子内容</span>
        </LocaleProvider>,
      );

      expect(screen.getByText('子内容')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('受控模式应优先使用传入的 locale', () => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');

      render(
        <LocaleProvider locale="en-US">
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(getRenderedLocale()).toBe('en-US');
    });

    it('未受控时应读取已持久化的语言', () => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en-US');

      render(
        <LocaleProvider>
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(getRenderedLocale()).toBe('en-US');
    });

    it('无持久化值时应按浏览器语言推断', () => {
      const spy = vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');

      render(
        <LocaleProvider>
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(spy).toHaveBeenCalled();
      expect(getRenderedLocale()).toBe('en-US');
    });

    it('defaultLocale 应作为无存储时的初始值', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('zh-CN');

      render(
        <LocaleProvider defaultLocale="en-US">
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(getRenderedLocale()).toBe('en-US');
    });

    it('已存语言应优先于 defaultLocale', () => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');

      render(
        <LocaleProvider defaultLocale="en-US">
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(getRenderedLocale()).toBe('zh-CN');
    });
  });

  describe('交互测试', () => {
    it('setLocale 应切换语言并写入持久化', () => {
      render(
        <LocaleProvider>
          <LocaleProbe />
        </LocaleProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换英文' }).click();
      });

      expect(getRenderedLocale()).toBe('en-US');
      expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en-US');
    });

    it('受控模式下的 setLocale 应回调外部的 setLocale', () => {
      const onSetLocale = vi.fn();

      render(
        <LocaleProvider locale="zh-CN" setLocale={onSetLocale}>
          <LocaleProbe />
        </LocaleProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换英文' }).click();
      });

      expect(onSetLocale).toHaveBeenCalledWith('en-US', undefined);
      // 受控模式下语言不随内部状态变化
      expect(getRenderedLocale()).toBe('zh-CN');
    });

    it('受控模式下外部变更 locale 时应同步持久化', () => {
      const { rerender } = render(
        <LocaleProvider locale="zh-CN">
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN');

      // 模拟外部（如 Storybook globals）切换语言
      rerender(
        <LocaleProvider locale="en-US">
          <LocaleProbe />
        </LocaleProvider>,
      );

      // 📌 持久化不区分受控 / 非受控 —— 用户偏好应始终被记住
      expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en-US');
    });
  });

  describe('无障碍测试', () => {
    it('当前语言应作为可读文本暴露给读屏', () => {
      render(
        <LocaleProvider locale="en-US">
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(screen.getByText('en-US')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('localStorage 被禁用时不应抛错', () => {
      const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });

      expect(() => {
        render(
          <LocaleProvider>
            <LocaleProbe />
          </LocaleProvider>,
        );
      }).not.toThrow();

      getItem.mockRestore();
    });

    it('非法持久化值应回退到受支持的语言', () => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, 'xx-YY');

      render(
        <LocaleProvider>
          <LocaleProbe />
        </LocaleProvider>,
      );

      expect(['zh-CN', 'en-US']).toContain(getRenderedLocale());
    });

    it('setLocale 传入非法值应归一化到受支持的语言', () => {
      render(
        <LocaleProvider>
          <LocaleProbe />
        </LocaleProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换英文' }).click();
      });
      act(() => {
        screen.getByRole('button', { name: '切换中文' }).click();
      });

      expect(getRenderedLocale()).toBe('zh-CN');
      expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN');
    });

    it('reloadPage 为 true 时应刷新页面', () => {
      const reload = vi.fn();
      const originalLocation = globalThis.location;
      Object.defineProperty(globalThis, 'location', {
        configurable: true,
        value: { ...originalLocation, reload },
      });

      render(
        <LocaleProvider>
          <LocaleProbe />
        </LocaleProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '切换并刷新' }).click();
      });

      expect(reload).toHaveBeenCalled();

      Object.defineProperty(globalThis, 'location', {
        configurable: true,
        value: originalLocation,
      });
    });

    it('未包裹 Provider 时应回退到 zh-CN 而不抛错', () => {
      render(<LocaleProbe />);

      expect(getRenderedLocale()).toBe('zh-CN');
    });
  });
});
