/**
 * TableError 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证错误标题、错误信息、默认图标渲染
 * 2. 状态测试 - 验证自定义信息 / 图片 / 操作按钮的替换行为
 * 3. 交互测试 - 验证默认「重新加载」按钮触发清错与重载
 * 4. 无障碍测试 - 验证标题语义与 DOM 属性透传
 *
 * 测试载体说明：
 * `TableError` 强依赖 `TableProvider`（内部调用 `useTableContext`），
 * 因此所有用例都在真实 `TableProvider` 下渲染，避免用 mock 掩盖上下文契约。
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import { TableError } from '../TableError';

/**
 * 表格状态探针 —— 通过 actions 写入初始错误，并把最新状态暴露给用例断言
 */
const StateProbe = ({ probeRef, seedError }: { probeRef: React.MutableRefObject<{ error: string | null; reloadTrigger?: number }>; seedError?: string }) => {
  const context = useTableContext();
  const seededRef = useRef(false);

  useEffect(() => {
    // 初始错误通过 actions 写入，避免依赖 Provider 的 error 属性回写链路
    if (seedError && !seededRef.current) {
      seededRef.current = true;
      context.actions.setError(seedError);
    }
  }, [context.actions, seedError]);

  useEffect(() => {
    probeRef.current = {
      error: context.state.error,
      reloadTrigger: context.state.pagination.reloadTrigger,
    };
  }, [context.state.error, context.state.pagination.reloadTrigger, probeRef]);

  return null;
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderTableError = (ui: React.ReactElement) => render(<TableProvider>{ui}</TableProvider>);

describe('TableError 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染错误页标题', () => {
      renderTableError(<TableError />);

      expect(screen.getByRole('heading', { name: '加载失败' })).toBeInTheDocument();
    });

    it('应该渲染默认的错误信息', () => {
      renderTableError(<TableError />);

      // 默认信息取自表格 i18n 文案表的 errorText，与标题文案一致
      expect(screen.getAllByText('加载失败')).toHaveLength(2);
    });

    it('应该渲染默认的错误图标', () => {
      const { container } = renderTableError(<TableError />);

      const icon = container.querySelector('.eas-icon');
      expect(icon).toBeInTheDocument();
      expect(icon?.querySelector('svg.lucide-circle-x')).toBeInTheDocument();
    });

    it('应该渲染默认的重新加载按钮', () => {
      renderTableError(<TableError />);

      expect(screen.getByRole('button', { name: '重新加载' })).toBeInTheDocument();
    });

    it('应该渲染错误容器与扩展类名', () => {
      const { container } = renderTableError(<TableError className="custom-error" />);

      const root = container.querySelector('.eas-table-error');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('custom-error');
    });
  });

  describe('状态测试', () => {
    it('应该使用自定义错误信息替换默认文案', () => {
      renderTableError(<TableError message="接口返回 500" />);

      expect(screen.getByText('接口返回 500')).toBeInTheDocument();
      expect(screen.getAllByText('加载失败')).toHaveLength(1);
    });

    it('应该使用自定义图片替换默认图标', () => {
      const { container } = renderTableError(<TableError image={<span className="custom-image">错误占位</span>} />);

      expect(screen.getByText('错误占位')).toBeInTheDocument();
      expect(container.querySelector('svg.lucide-circle-x')).not.toBeInTheDocument();
    });

    it('应该使用自定义操作按钮替换默认按钮', () => {
      renderTableError(<TableError action={<button type="button">联系管理员</button>} />);

      expect(screen.getByRole('button', { name: '联系管理员' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '重新加载' })).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击重新加载时清除错误状态', async () => {
      const user = userEvent.setup();
      const probeRef: React.MutableRefObject<{ error: string | null; reloadTrigger?: number }> = { current: { error: null } };

      render(
        <TableProvider>
          <TableError />
          <StateProbe probeRef={probeRef} seedError="接口异常" />
        </TableProvider>,
      );

      await waitFor(() => {
        expect(probeRef.current.error).toBe('接口异常');
      });

      await user.click(screen.getByRole('button', { name: '重新加载' }));

      await waitFor(() => {
        expect(probeRef.current.error).toBeNull();
      });
    });

    it('应该在点击重新加载时触发表格重载', async () => {
      const user = userEvent.setup();
      const probeRef: React.MutableRefObject<{ error: string | null; reloadTrigger?: number }> = { current: { error: null } };

      render(
        <TableProvider>
          <TableError />
          <StateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await waitFor(() => {
        expect(probeRef.current.reloadTrigger).toBeUndefined();
      });

      await user.click(screen.getByRole('button', { name: '重新加载' }));

      await waitFor(() => {
        expect(probeRef.current.reloadTrigger).toBe(1);
      });
    });

    it('应该触发自定义操作按钮的点击回调', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderTableError(
        <TableError
          action={
            <button type="button" onClick={onClick}>
              联系管理员
            </button>
          }
        />,
      );

      await user.click(screen.getByRole('button', { name: '联系管理员' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该把错误标题渲染在标题元素中', () => {
      renderTableError(<TableError />);

      const title = screen.getByRole('heading', { name: '加载失败' });
      expect(title.tagName).toBe('H3');
    });

    it('应该透传额外的 DOM 属性', () => {
      const { container } = renderTableError(<TableError role="alert" aria-live="assertive" />);

      const root = container.querySelector('.eas-table-error');
      expect(root).toHaveAttribute('role', 'alert');
      expect(root).toHaveAttribute('aria-live', 'assertive');
    });

    it('应该把装饰性图标标记为对辅助技术隐藏', () => {
      const { container } = renderTableError(<TableError />);

      const svg = container.querySelector('svg.lucide-circle-x');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
