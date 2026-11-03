/**
 * TableSortButton 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证排序按钮的图标、提示文案与标签渲染
 * 2. 状态测试 - 验证排序关闭、排序方向切换与更多菜单形态
 * 3. 交互测试 - 验证点击排序触发表格排序切换与 onChange 回调
 * 4. 无障碍测试 - 验证可访问名称（title）与按钮语义
 *
 * 测试载体说明：
 * `TableSortButton` 强依赖 `TableProvider`（内部调用 `useTableLogic` / `useTableConfig`），
 * 因此所有用例都在真实 `TableProvider` 下渲染，避免用 mock 掩盖上下文契约。
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import { TableSortButton } from '../TableSortButton';

/**
 * 排序状态探针 —— 把最新的排序状态暴露给用例断言
 */
const SortStateProbe = ({ probeRef }: { probeRef: React.MutableRefObject<{ columnName: string | null; order: string | null }> }) => {
  const context = useTableContext();

  useEffect(() => {
    probeRef.current = {
      columnName: context.state.sortState.columnName,
      order: context.state.sortState.order,
    };
  }, [context.state.sortState.columnName, context.state.sortState.order, probeRef]);

  return null;
};

/**
 * 可排序列定义
 */
const sortableColumn: TableColumn = {
  name: 'name',
  title: '姓名',
  dataIndex: 'name',
  sortable: true,
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderSortButton = (ui: React.ReactElement, options?: { config?: Record<string, unknown>; columns?: TableColumn[] }) =>
  render(
    <TableProvider columns={options?.columns ?? [sortableColumn]} config={options?.config as never}>
      {ui}
    </TableProvider>,
  );

describe('TableSortButton 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染排序图标按钮', () => {
      const { container } = renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: true } });

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.querySelector('svg.lucide-chevrons-up-down')).toBeInTheDocument();
    });

    it('应该渲染未排序状态的提示文案', () => {
      renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: true } });

      // 未排序时提示为「点击升序排序」
      expect(screen.getByTitle('点击升序排序')).toBeInTheDocument();
    });

    it('应该渲染更多菜单形态的文本标签', () => {
      renderSortButton(<TableSortButton column={sortableColumn} action={{ key: 'sort', label: '排序', showInMore: true }} />, {
        config: { sortable: true },
      });

      // 更多菜单形态渲染带文案标签的按钮
      expect(screen.getByRole('button', { name: /排序/ })).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该在表格未开启排序时不渲染任何内容', () => {
      const { container } = renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: false } });

      expect(container.firstElementChild).toBeNull();
    });

    it('应该在升序状态下切换排序图标与提示文案', async () => {
      const user = userEvent.setup();

      renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: true } });

      await user.click(screen.getByTitle('点击升序排序'));

      await waitFor(() => {
        expect(screen.getByTitle('点击降序排序')).toBeInTheDocument();
      });
      expect(screen.getByTitle('点击降序排序').querySelector('svg.lucide-arrow-up')).toBeInTheDocument();
    });

    it('应该在降序状态下切换排序图标与提示文案', async () => {
      const user = userEvent.setup();

      renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: true } });

      await user.click(screen.getByTitle('点击升序排序'));
      await waitFor(() => {
        expect(screen.getByTitle('点击降序排序')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('点击降序排序'));

      await waitFor(() => {
        expect(screen.getByTitle('点击清除排序')).toBeInTheDocument();
      });
      expect(screen.getByTitle('点击清除排序').querySelector('svg.lucide-arrow-down')).toBeInTheDocument();
    });

    it('应该在列不可排序时不设置提示文案', () => {
      const notSortableColumn: TableColumn = { name: 'name', title: '姓名', dataIndex: 'name' };

      renderSortButton(<TableSortButton column={notSortableColumn} />, { config: { sortable: true } });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('title');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时把排序状态切换为升序', async () => {
      const user = userEvent.setup();
      const probeRef: React.MutableRefObject<{ columnName: string | null; order: string | null }> = { current: { columnName: null, order: null } };

      render(
        <TableProvider columns={[sortableColumn]} config={{ sortable: true }}>
          <TableSortButton column={sortableColumn} />
          <SortStateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await user.click(screen.getByTitle('点击升序排序'));

      await waitFor(() => {
        expect(probeRef.current).toEqual({ columnName: 'name', order: 'asc' });
      });
    });

    it('应该在再次点击时把排序状态切换为降序', async () => {
      const user = userEvent.setup();
      const probeRef: React.MutableRefObject<{ columnName: string | null; order: string | null }> = { current: { columnName: null, order: null } };

      render(
        <TableProvider columns={[sortableColumn]} config={{ sortable: true }}>
          <TableSortButton column={sortableColumn} />
          <SortStateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await user.click(screen.getByTitle('点击升序排序'));
      await waitFor(() => {
        expect(probeRef.current.order).toBe('asc');
      });

      await user.click(screen.getByTitle('点击降序排序'));

      await waitFor(() => {
        expect(probeRef.current).toEqual({ columnName: 'name', order: 'desc' });
      });
    });

    it('应该在第三次点击时清除排序状态', async () => {
      const user = userEvent.setup();
      const probeRef: React.MutableRefObject<{ columnName: string | null; order: string | null }> = { current: { columnName: null, order: null } };

      render(
        <TableProvider columns={[sortableColumn]} config={{ sortable: true }}>
          <TableSortButton column={sortableColumn} />
          <SortStateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await user.click(screen.getByTitle('点击升序排序'));
      await waitFor(() => {
        expect(probeRef.current.order).toBe('asc');
      });

      await user.click(screen.getByTitle('点击降序排序'));
      await waitFor(() => {
        expect(probeRef.current.order).toBe('desc');
      });

      await user.click(screen.getByTitle('点击清除排序'));

      await waitFor(() => {
        expect(probeRef.current).toEqual({ columnName: null, order: null });
      });
    });

    it('应该在点击时触发 onChange 回调并携带切换前的排序状态', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderSortButton(<TableSortButton column={sortableColumn} onChange={onChange} />, { config: { sortable: true } });

      await user.click(screen.getByTitle('点击升序排序'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]?.[1]).toEqual({ columnName: 'name', order: null });
    });

    it('应该在列不可排序时不触发表格排序', async () => {
      const user = userEvent.setup();
      const notSortableColumn: TableColumn = { name: 'name', title: '姓名', dataIndex: 'name' };
      const onChange = vi.fn();
      const probeRef: React.MutableRefObject<{ columnName: string | null; order: string | null }> = { current: { columnName: null, order: null } };

      render(
        <TableProvider columns={[notSortableColumn]} config={{ sortable: true }}>
          <TableSortButton column={notSortableColumn} onChange={onChange} />
          <SortStateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await user.click(screen.getByRole('button'));

      expect(onChange).not.toHaveBeenCalled();
      expect(probeRef.current).toEqual({ columnName: null, order: null });
    });
  });

  describe('无障碍测试', () => {
    it('应该通过 title 提供可访问的排序说明', () => {
      renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: true } });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', '点击升序排序');
    });

    it('应该渲染为原生按钮元素', () => {
      renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: true } });

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('应该把装饰性排序图标标记为对辅助技术隐藏', () => {
      const { container } = renderSortButton(<TableSortButton column={sortableColumn} />, { config: { sortable: true } });

      const svg = container.querySelector('svg.lucide-chevrons-up-down');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
