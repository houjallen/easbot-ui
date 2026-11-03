/**
 * TableColumnFilter 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证筛选触发器按钮渲染
 * 2. 状态测试 - 验证更多菜单形态、已筛选状态样式与筛选弹层内容
 * 3. 交互测试 - 验证打开 / 关闭弹层、确定与清除筛选的回调
 * 4. 无障碍测试 - 验证触发器的弹层语义属性
 *
 * 测试载体说明：
 * `TableColumnFilter` 强依赖 `TableProvider`（内部调用 `useTableLogic` / `useTableConfig`），
 * 因此所有用例都在真实 `TableProvider` 下渲染。
 *
 * 浮层说明：筛选弹层基于 Radix Popover，内容渲染到 `document.body`（portal），
 * 且触发器走 `onPointerDown` 路径，因此统一使用 `userEvent` 驱动，并用 `Escape` 关闭。
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import { TableColumnFilter } from '../TableColumnFilter';

/**
 * 筛选状态探针 —— 把最新的筛选状态暴露给用例断言
 */
const FilterStateProbe = ({ probeRef }: { probeRef: React.MutableRefObject<Record<string, unknown>> }) => {
  const context = useTableContext();

  useEffect(() => {
    probeRef.current = context.state.filterState;
  }, [context.state.filterState, probeRef]);

  return null;
};

/**
 * 文本类型列定义
 */
const textColumn: TableColumn = {
  name: 'name',
  title: '姓名',
  dataIndex: 'name',
  dataType: 'string',
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderColumnFilter = (ui: React.ReactElement, options?: { config?: Record<string, unknown>; columns?: TableColumn[] }) =>
  render(
    <TableProvider columns={options?.columns ?? [textColumn]} config={options?.config as never}>
      {ui}
    </TableProvider>,
  );

describe('TableColumnFilter 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染筛选触发器按钮', () => {
      renderColumnFilter(<TableColumnFilter column={textColumn} />, { config: { filterable: true } });

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('应该渲染筛选图标', () => {
      const { container } = renderColumnFilter(<TableColumnFilter column={textColumn} />, { config: { filterable: true } });

      expect(container.querySelector('svg.lucide-funnel')).toBeInTheDocument();
    });

    it('应该把扩展类名透传到触发器', () => {
      const { container } = renderColumnFilter(<TableColumnFilter column={textColumn} className="custom-filter" />, { config: { filterable: true } });

      const trigger = container.querySelector('button');
      expect(trigger).toHaveClass('custom-filter');
    });
  });

  describe('状态测试', () => {
    it('应该在更多菜单形态下渲染带文案的筛选按钮', () => {
      renderColumnFilter(<TableColumnFilter column={textColumn} action={{ key: 'filter', label: '筛选', showInMore: true }} />, {
        config: { filterable: true },
      });

      // 更多菜单形态渲染的是带「筛选」文案的按钮
      expect(screen.getByRole('button', { name: /筛选/ })).toBeInTheDocument();
    });

    it('应该在已有筛选值时添加激活样式', async () => {
      const user = userEvent.setup();
      const probeRef: React.MutableRefObject<Record<string, unknown>> = { current: {} };

      render(
        <TableProvider columns={[textColumn]} config={{ filterable: true, filter: { name: { field: 'name', op: 'eq', type: 'string', value: ['张三'] } } }}>
          <TableColumnFilter column={textColumn} />
          <FilterStateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await waitFor(() => {
        expect(probeRef.current.name).toBeDefined();
      });

      // 已有筛选值时触发器带激活样式
      expect(screen.getByRole('button')).toHaveClass('bg-primary/10');
    });

    it('应该在打开弹层后渲染条件选择与筛选值输入', async () => {
      const user = userEvent.setup();

      renderColumnFilter(<TableColumnFilter column={textColumn} />, { config: { filterable: true } });

      await user.click(screen.getByRole('button'));

      // 弹层内容渲染到 portal，需异步查询
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('条件')).toBeInTheDocument();
      expect(screen.getByText('值')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('应该在更多菜单形态下打开对话框而非气泡层', async () => {
      const user = userEvent.setup();

      renderColumnFilter(<TableColumnFilter column={textColumn} action={{ key: 'filter', label: '筛选', showInMore: true }} />, {
        config: { filterable: true },
      });

      await user.click(screen.getByRole('button', { name: /筛选/ }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '筛选 姓名' })).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击确定后触发 onChange 回调并写入筛选状态', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const probeRef: React.MutableRefObject<Record<string, unknown>> = { current: {} };

      render(
        <TableProvider columns={[textColumn]} config={{ filterable: true }}>
          <TableColumnFilter column={textColumn} onChange={onChange} />
          <FilterStateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await user.click(screen.getByRole('button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '确定' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(probeRef.current.name).toBeDefined();
      });
    });

    it('应该在点击清除后触发 onChange 回调并清空筛选状态', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const probeRef: React.MutableRefObject<Record<string, unknown>> = { current: {} };

      render(
        <TableProvider columns={[textColumn]} config={{ filterable: true, filter: { name: { field: 'name', op: 'eq', type: 'string', value: ['张三'] } } }}>
          <TableColumnFilter column={textColumn} onChange={onChange} />
          <FilterStateProbe probeRef={probeRef} />
        </TableProvider>,
      );

      await user.click(screen.getByRole('button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '清除' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      // 清除时回调不携带筛选值
      expect(onChange.mock.calls[0]?.[1]).toBeUndefined();
      await waitFor(() => {
        expect(probeRef.current.name).toBeUndefined();
      });
    });

    it('应该在按下 Escape 后关闭筛选弹层', async () => {
      const user = userEvent.setup();

      renderColumnFilter(<TableColumnFilter column={textColumn} />, { config: { filterable: true } });

      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该给触发器声明弹层语义属性', async () => {
      const user = userEvent.setup();

      renderColumnFilter(<TableColumnFilter column={textColumn} />, { config: { filterable: true } });

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('应该把装饰性筛选图标标记为对辅助技术隐藏', () => {
      const { container } = renderColumnFilter(<TableColumnFilter column={textColumn} />, { config: { filterable: true } });

      const svg = container.querySelector('svg.lucide-funnel');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
