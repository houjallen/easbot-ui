/**
 * LocaleToggle 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证触发器渲染与无障碍名称
 * 2. 状态测试 - 验证下拉项文案与当前语言标记
 * 3. 交互测试 - 验证选择语言后切换并写入 localStorage
 * 4. 受控模式测试 - 验证外部传入的 `locale` 与 `setLocale` 回调（Storybook 的接入路径）
 * 5. 选中值记忆测试 - 验证组件自持选中值、选择后立即反馈、同步 store
 * 6. 无障碍测试 - 验证菜单语义角色与当前项标记
 * 7. 边界测试 - 验证无 Provider 降级、重复选择同一语言
 * 8. i18n 测试 - 验证内置文案随语言切换、语言名固定用母语
 *
 * @remarks
 * `localStorage` 是**全局共享**状态，用例之间需清理，
 * 否则会影响后续用例的「挂载时读取已存语言」行为。
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '../../../providers/locale-provider';
import { LocaleToggle } from '../locale-toggle';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('LocaleToggle 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染触发器按钮', () => {
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('应该使用语言图标', () => {
      const { container } = render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      expect(container.querySelector('.eas-icon')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('下拉项应该显示各语言的母语名称', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));

      expect(await screen.findByText('简体中文')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('当前语言项应该带圆点标记', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));

      const active = (await screen.findByText('简体中文')).closest('div');
      expect(active?.querySelector('.bg-primary')).toBeInTheDocument();
    });

    it('非当前语言项不应带圆点标记', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));

      const inactive = (await screen.findByText('English')).closest('div');
      expect(inactive?.querySelector('.bg-primary')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('选择语言后应该写入 localStorage', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider>
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      await user.click(await screen.findByText('简体中文'));

      await waitFor(() => {
        expect(window.localStorage.getItem('eas-ui-locale')).toBe('zh-CN');
      });
    });

    it('非受控模式下切换后应该更新触发器的无障碍名称', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider>
          <LocaleToggle />
        </LocaleProvider>,
      );

      // 📌 非受控模式的初始语言由**浏览器语言**推断（jsdom 为 `en-US`）
      expect(screen.getByRole('button', { name: 'Switch language' })).toBeInTheDocument();

      await user.click(screen.getByRole('button'));
      await user.click(await screen.findByText('简体中文'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '切换语言' })).toBeInTheDocument();
      });
    });
  });

  describe('受控模式测试', () => {
    it('受控模式下应该使用外部传入的语言', () => {
      render(
        <LocaleProvider locale="en-US">
          <LocaleToggle />
        </LocaleProvider>,
      );

      // `locale` 域的 `toggleLabel`（英文）
      expect(screen.getByRole('button', { name: 'Switch language' })).toBeInTheDocument();
    });

    it('受控模式下选择语言应该回调外部的 setLocale', async () => {
      const user = userEvent.setup();
      const onLocaleChange = vi.fn();

      render(
        <LocaleProvider locale="zh-CN" setLocale={onLocaleChange}>
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      await user.click(await screen.findByText('English'));

      await waitFor(() => {
        // 📌 `LocaleContextValue.setLocale` 的契约是 `(locale, reloadPage?)` ——
        //    Provider 会把 `reloadPage` 一并透传给外部回调。
        expect(onLocaleChange).toHaveBeenCalledWith('en-US', undefined);
      });
    });

    it('受控模式下选择当前语言不应触发回调', async () => {
      const user = userEvent.setup();
      const onLocaleChange = vi.fn();

      render(
        <LocaleProvider locale="zh-CN" setLocale={onLocaleChange}>
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      await user.click(await screen.findByText('简体中文'));

      // 📌 `handleSelect` 对相同语言提前返回，不产生无意义的写入
      expect(onLocaleChange).not.toHaveBeenCalled();
    });

    it('受控模式下外部变更语言后应该同步刷新圆点标记', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      expect((await screen.findByText('简体中文')).closest('div')?.querySelector('.bg-primary')).toBeInTheDocument();

      // 模拟外部（Storybook globals）切换语言
      rerender(
        <LocaleProvider locale="en-US">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('English').closest('div')?.querySelector('.bg-primary')).toBeInTheDocument();
      });
    });

    it('受控模式下切换语言仍会持久化，但语言值由外部 prop 决定', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="zh-CN" setLocale={() => {}}>
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      await user.click(await screen.findByText('English'));

      // 📌 用户的语言偏好仍需持久化（刷新后不丢）
      await waitFor(() => {
        expect(window.localStorage.getItem('eas-ui-locale')).toBe('en-US');
      });

      // 📌 但**生效**的语言由外部 prop 决定 —— Provider 不自行改 state，
      //    外部不更新 prop 时组件仍渲染旧语言
      expect(screen.getByRole('button', { name: '切换语言' })).toBeInTheDocument();
    });
  });

  describe('选中值记忆测试', () => {
    it('选择语言后圆点标记应立即移动到新选中项', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="zh-CN" setLocale={() => {}}>
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      expect((await screen.findByText('简体中文')).closest('div')?.querySelector('.bg-primary')).toBeInTheDocument();

      await user.click(screen.getByText('English'));

      // 📌 Radix 的 DropdownMenu 关闭后会**卸载**菜单内容，
      //    故需重新打开下拉来验证选中值。
      await user.click(screen.getByRole('button'));
      expect((await screen.findByText('English')).closest('div')?.querySelector('.bg-primary')).toBeInTheDocument();
      expect(screen.getByText('简体中文').closest('div')?.querySelector('.bg-primary')).not.toBeInTheDocument();
    });

    it('外部语言变化后圆点标记应同步到新的选中项', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      expect((await screen.findByText('简体中文')).closest('div')?.querySelector('.bg-primary')).toBeInTheDocument();

      // 模拟外部（Storybook globals）切换语言
      rerender(
        <LocaleProvider locale="en-US">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('English').closest('div')?.querySelector('.bg-primary')).toBeInTheDocument();
      });
    });

    it('选择语言后应同时同步到 store', async () => {
      const user = userEvent.setup();
      const onLocaleChange = vi.fn();

      render(
        <LocaleProvider locale="zh-CN" setLocale={onLocaleChange}>
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      await user.click(await screen.findByText('English'));

      // 📌 本地 state 更新 + store 同步 —— 两者都要发生
      await waitFor(() => {
        expect(onLocaleChange).toHaveBeenCalledWith('en-US', undefined);
      });

      // 📌 重新打开下拉，确认选中值已记住（组件自持 state）
      await user.click(screen.getByRole('button'));
      expect((await screen.findByText('English')).closest('div')?.querySelector('.bg-primary')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('触发器应该暴露可访问名称', () => {
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      expect(screen.getByRole('button', { name: '切换语言' })).toBeInTheDocument();
    });

    it('应该暴露菜单语义角色', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));

      expect(await screen.findByRole('menu')).toBeInTheDocument();
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });
  });

  describe('边界测试', () => {
    it('未包裹 LocaleProvider 时点击不应抛出异常', async () => {
      const user = userEvent.setup();
      render(<LocaleToggle />);

      expect(() => {
        act(() => {
          screen.getByRole('button').click();
        });
      }).not.toThrow();

      await user.click(screen.getByRole('button'));
      expect(await screen.findByText('简体中文')).toBeInTheDocument();
    });

    it('选择当前语言不应重复写入存储', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider>
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));
      // 📌 非受控模式的当前语言是 `en-US`（浏览器语言推断）
      await user.click(await screen.findByText('English'));

      // 初始挂载时已写入 'en-US'，重复选择不应改变结果
      expect(window.localStorage.getItem('eas-ui-locale')).toBe('en-US');
    });

    it('应该允许自定义尺寸', () => {
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle size={48} />
        </LocaleProvider>,
      );

      expect(screen.getByRole('button')).toHaveStyle({ width: '48px', height: '48px' });
    });

    it('应该允许附加自定义类名', () => {
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle className="custom-class" />
        </LocaleProvider>,
      );

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('应该允许自定义下拉内容对齐方式', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle align="start" />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));

      // Radix 的 `align` 会落到内容容器的 `data-align` 属性上
      expect(await screen.findByRole('menu')).toHaveAttribute('data-align', 'start');
    });
  });

  describe('i18n 测试', () => {
    it('语言切换后内置文案应该同步切换', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <LocaleProvider locale="zh-CN">
          <LocaleToggle />
        </LocaleProvider>,
      );

      expect(screen.getByRole('button', { name: '切换语言' })).toBeInTheDocument();

      // 外部切换到英文 —— 文案应随之切换
      rerender(
        <LocaleProvider locale="en-US">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Switch language' })).toBeInTheDocument();
      });
    });

    it('语言项的显示名应始终使用母语（不随界面语言变化）', async () => {
      const user = userEvent.setup();
      render(
        <LocaleProvider locale="en-US">
          <LocaleToggle />
        </LocaleProvider>,
      );

      await user.click(screen.getByRole('button'));

      // 📌 惯例是每种语言用**自己**的语言称呼自己
      expect(await screen.findByText('简体中文')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });
});
