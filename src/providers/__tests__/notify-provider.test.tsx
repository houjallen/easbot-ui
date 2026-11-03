/**
 * NotifyProvider 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Provider 渲染子节点
 * 2. 状态测试 - 验证语义 → 标题 / 描述 / 变体的映射结果
 * 3. 交互测试 - 验证 `notify.xxx()` 触发通知、`close()` 关闭全部通知
 * 4. 无障碍测试 - 验证通知标题与描述在 DOM 中可被读屏获取
 * 5. 边界测试 - 验证无 Provider 降级、显式标题覆盖、`warn` 别名
 *
 * @remarks
 * 1. `useToast` 的状态是**模块级**的（`memoryState`），用例之间会残留，
 *    因此每个用例结束后需调用 `dismiss()` 清理。
 * 2. 通知的 DOM 渲染由 `Toaster` 承担，它通过 `useToast()` 订阅模块级状态，
 *    因此必须把 `NotifyProvider` 一起渲染，否则看不到通知。
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { dismiss, useToast } from '../../ui/use-toast';
import type { State } from '../../ui/use-toast';
import { NotifyProvider, useNotify } from '../notify-provider';

/**
 * 读取模块级通知状态
 *
 * @description
 * `useToast` 的状态是**模块级**的（`memoryState`），
 * 某些参数（如 `duration`）被 Radix 内部消费、不渲染为 DOM 属性，
 * 只能通过状态断言。
 *
 * @returns 当前通知状态
 */
function getToastState(): State {
  let captured: State = { toasts: [] };
  const Probe = () => {
    captured = useToast();
    return null;
  };
  const { unmount } = render(<Probe />);
  unmount();
  return captured;
}

/**
 * 通知触发组件
 *
 * @description
 * 通过 `useNotify()` 拿到通知 API 并渲染成按钮，便于点击触发。
 *
 * @returns 通知触发组件
 */
const NotifyProbe = () => {
  const { notify, close } = useNotify();

  return (
    <div>
      <button type="button" onClick={() => notify.info('提示内容')}>
        触发提示
      </button>
      <button type="button" onClick={() => notify.success('成功内容')}>
        触发成功
      </button>
      <button type="button" onClick={() => notify.warning('警告内容')}>
        触发警告
      </button>
      <button type="button" onClick={() => notify.error('错误内容')}>
        触发错误
      </button>
      <button type="button" onClick={() => notify.success('成功内容', { title: '自定义标题' })}>
        触发成功自定义标题
      </button>
      <button type="button" onClick={() => notify.warn('别名内容')}>
        触发警告别名
      </button>
      <button type="button" onClick={() => notify.info('覆盖时长', { duration: 12345 })}>
        触发覆盖时长
      </button>
      <button type="button" onClick={() => notify.success('覆盖变体', { variant: 'info' })}>
        触发覆盖变体
      </button>
      <button type="button" onClick={() => notify.info('覆盖位置', { position: 'top-left' })}>
        触发覆盖位置
      </button>
      <button type="button" onClick={() => close()}>
        关闭全部
      </button>
    </div>
  );
};

/**
 * 无 Provider 时的降级探针
 *
 * @description
 * 在**不包裹** `NotifyProvider` 的情况下调用 `useNotify()`，
 * 验证其返回空实现而非抛错。
 *
 * @returns 降级探针组件
 */
const BareProbe = () => {
  const { notify, close } = useNotify();

  return (
    <button type="button" onClick={() => notify.info('不应渲染')}>
      降级
      {typeof close === 'function' ? '' : '缺失'}
    </button>
  );
};

afterEach(() => {
  // 清理模块级通知状态，避免用例间互相污染
  act(() => {
    dismiss();
  });
});

describe('NotifyProvider', () => {
  describe('渲染测试', () => {
    it('应渲染子节点', () => {
      render(
        <NotifyProvider>
          <span>子内容</span>
        </NotifyProvider>,
      );

      expect(screen.getByText('子内容')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('info 应使用提示语义标题与 info 变体', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发提示' }).click();
      });

      expect(screen.getByText('提示')).toBeInTheDocument();
      expect(screen.getByText('提示内容')).toBeInTheDocument();
    });

    it('success 应使用成功语义标题与 success 变体', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发成功' }).click();
      });

      expect(screen.getByText('成功')).toBeInTheDocument();
      expect(screen.getByText('成功内容')).toBeInTheDocument();
    });

    it('warning 应使用警告语义标题', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发警告' }).click();
      });

      expect(screen.getByText('警告')).toBeInTheDocument();
    });

    it('error 应使用错误语义标题（而非退化为 default）', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发错误' }).click();
      });

      expect(screen.getByText('错误')).toBeInTheDocument();
      expect(screen.getByText('错误内容')).toBeInTheDocument();
    });

    it('warn 应作为 warning 的别名', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发警告别名' }).click();
      });

      expect(screen.getByText('警告')).toBeInTheDocument();
      expect(screen.getByText('别名内容')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('close 应关闭全部通知', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发提示' }).click();
      });
      expect(screen.getByText('提示内容')).toBeInTheDocument();

      act(() => {
        screen.getByRole('button', { name: '关闭全部' }).click();
      });
      expect(screen.queryByText('提示内容')).not.toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('通知标题与描述应作为可读文本暴露给读屏', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发成功' }).click();
      });

      // 标题走 ToastTitle、描述走 ToastDescription —— 均为 Radix 的语义化元素
      expect(screen.getByText('成功')).toBeInTheDocument();
      expect(screen.getByText('成功内容')).toBeInTheDocument();
    });

    it('通知应提供关闭按钮', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发提示' }).click();
      });

      expect(screen.getByRole('button', { name: '关闭通知' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('未包裹 Provider 时应降级为 no-op 而不抛错', () => {
      render(<BareProbe />);

      expect(() => {
        act(() => {
          screen.getByRole('button', { name: /降级/ }).click();
        });
      }).not.toThrow();

      expect(screen.queryByText('不应渲染')).not.toBeInTheDocument();
    });

    it('显式传入的标题应覆盖默认语义标题', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发成功自定义标题' }).click();
      });

      expect(screen.getByText('自定义标题')).toBeInTheDocument();
      expect(screen.queryByText('成功')).not.toBeInTheDocument();
    });

    it('locale 覆盖应切换内置文案语言', () => {
      render(
        <NotifyProvider locale="en-US">
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发提示' }).click();
      });

      expect(screen.getByText('Info')).toBeInTheDocument();
    });
  });

  describe('覆盖项测试', () => {
    it('options.duration 应覆盖默认停留时长', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发覆盖时长' }).click();
      });

      // 📌 `duration` 被 Radix 内部消费（不渲染为 DOM 属性），
      //    故断言模块级状态中的实际取值。
      expect(screen.getByText('覆盖时长')).toBeInTheDocument();
      expect(getToastState().toasts[0]?.duration).toBe(12345);
    });

    it('options.variant 应覆盖语义默认变体', () => {
      render(
        <NotifyProvider>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发覆盖变体' }).click();
      });

      // `success` 语义被 `info` 变体覆盖 —— 应呈现 info 的蓝色边框而非 success 的绿色
      const item = screen.getByText('覆盖变体').closest('li');
      expect(item).toHaveClass('border-blue-400');
      expect(item).not.toHaveClass('border-green-400');
    });

    it('options.position 应覆盖 Provider 的默认位置', () => {
      render(
        <NotifyProvider position="bottom-right">
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发覆盖位置' }).click();
      });

      const item = screen.getByText('覆盖位置').closest('li');
      expect(item).toHaveClass('top-[var(--eas-gap-lg)]');
      expect(item).toHaveClass('left-[var(--eas-gap-lg)]');
      expect(item).not.toHaveClass('bottom-[var(--eas-gap-lg)]');
    });

    it('Provider 的 duration 应作为全局默认生效', () => {
      render(
        <NotifyProvider duration={8888}>
          <NotifyProbe />
        </NotifyProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: '触发提示' }).click();
      });

      expect(getToastState().toasts[0]?.duration).toBe(8888);
    });
  });
});
