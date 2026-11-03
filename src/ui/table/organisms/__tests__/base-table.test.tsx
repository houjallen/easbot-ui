/**
 * BaseTable 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证表头 / 表体 / 数据行 / 空状态的基础渲染
 * 2. 状态测试 - 验证加载态 / 错误态 / 选择态 / 展开态 / 隐藏列
 * 3. 交互测试 - 验证行点击 / 双击 / 选择框 / 展开按钮
 * 4. 无障碍测试 - 验证 aria-label / role / data-column 属性透传
 *
 * 测试载体说明：
 * `BaseTable` 强依赖 `TableProvider`（内部调用 `useTableContext`），
 * 因此所有用例都在真实 `TableProvider` 下渲染，避免用 mock 掩盖上下文契约。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import { BaseTable } from '../BaseTable';

/**
 * 测试数据
 */
const sampleData = [
  { id: '1', name: '张三', role: '管理员', status: 'active' },
  { id: '2', name: '李四', role: '访客', status: 'inactive' },
];

const sampleColumns: TableColumn[] = [
  { name: 'name', title: '姓名', dataIndex: 'name' },
  { name: 'role', title: '角色', dataIndex: 'role' },
];

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderTable = (ui: React.ReactElement, config?: Record<string, unknown>, data = sampleData, columns = sampleColumns) =>
  render(
    <TableProvider data={data} columns={columns} config={config as never}>
      {ui}
    </TableProvider>,
  );

describe('BaseTable 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染表头与数据行', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />);

      // 表头列标题
      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('角色')).toBeInTheDocument();

      // 数据行内容
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('管理员')).toBeInTheDocument();
    });

    it('应该渲染表格语义结构', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
      expect(screen.getAllByRole('row')).toHaveLength(3);
      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
      expect(screen.getAllByRole('cell')).toHaveLength(4);
    });

    it('应该在没有数据时渲染空状态', () => {
      renderTable(<BaseTable columns={sampleColumns} data={[]} />, {}, [], sampleColumns);

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
      expect(screen.getByRole('row', { name: /暂无数据/ })).toHaveClass('eas-table-row-empty');
    });

    it('应该支持自定义空状态渲染', () => {
      renderTable(<BaseTable columns={sampleColumns} data={[]} renderEmpty={() => <span>没有匹配记录</span>} />, {}, [], sampleColumns);

      expect(screen.getByText('没有匹配记录')).toBeInTheDocument();
      expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
    });

    it('应该隐藏 visible 为 false 的列', () => {
      const columns: TableColumn[] = [
        { name: 'name', title: '姓名', dataIndex: 'name' },
        { name: 'role', title: '角色', dataIndex: 'role', visible: false },
      ];

      renderTable(<BaseTable columns={columns} data={sampleData} />, {}, sampleData, columns);

      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.queryByText('角色')).not.toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(1);
    });

    it('应该支持自定义类名透传', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} className="custom-table" />);

      expect(screen.getByRole('table').closest('.eas-table-container')).toHaveClass('custom-table');
    });

    it('应该支持渲染自定义子组件', () => {
      renderTable(
        <BaseTable columns={sampleColumns} data={sampleData}>
          <caption>自定义表内容</caption>
        </BaseTable>,
      );

      expect(screen.getByText('自定义表内容')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该在加载时展示加载蒙层', () => {
      render(
        <TableProvider data={sampleData} columns={sampleColumns} loading>
          <BaseTable columns={sampleColumns} data={sampleData} />
        </TableProvider>,
      );

      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('应该在出错时展示错误状态', () => {
      render(
        <TableProvider data={sampleData} columns={sampleColumns} error="数据加载失败">
          <BaseTable columns={sampleColumns} data={sampleData} />
        </TableProvider>,
      );

      expect(screen.getByText('数据加载失败')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('应该在开启选择列时渲染全选框与行选择框', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, { selectable: true });

      expect(screen.getByRole('checkbox', { name: '全选' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '选择第 2 行' })).toBeInTheDocument();
    });

    it('应该在开启展开列时渲染展开按钮', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, { expandable: true });

      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('应该在开启行操作列时渲染操作列表头', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, { rowActionable: true });

      expect(screen.getByText('操作')).toBeInTheDocument();
    });

    it('应该根据配置关闭表头显示', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, { showHeader: false });

      expect(screen.queryAllByRole('columnheader')).toHaveLength(0);
    });
  });

  describe('交互测试', () => {
    it('应该在点击行时触发 onRowClick 回调', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      renderTable(<BaseTable columns={sampleColumns} data={sampleData} onRowClick={onRowClick} />, {
        clickable: true,
      });

      await user.click(screen.getByText('张三'));

      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onRowClick.mock.calls[0]?.[0]).toMatchObject({ id: '1', name: '张三' });
      expect(onRowClick.mock.calls[0]?.[1]).toBe(0);
    });

    it('应该在双击行时触发 onRowDoubleClick 回调', async () => {
      const user = userEvent.setup();
      const onRowDoubleClick = vi.fn();

      renderTable(<BaseTable columns={sampleColumns} data={sampleData} onRowDoubleClick={onRowDoubleClick} />, {
        clickable: true,
      });

      await user.dblClick(screen.getByText('李四'));

      expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
      expect(onRowDoubleClick.mock.calls[0]?.[0]).toMatchObject({ id: '2', name: '李四' });
    });

    it('应该在未开启 clickable 时不添加可点击样式类', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      renderTable(<BaseTable columns={sampleColumns} data={sampleData} onRowClick={onRowClick} />);

      const row = screen.getByText('张三').closest('tr');
      expect(row).not.toHaveClass('cursor-pointer');

      await user.click(screen.getByText('张三'));

      // `clickable` 只控制视觉样式，回调本身仍然透传（与实现同源）
      expect(onRowClick).toHaveBeenCalledTimes(1);
    });

    it('应该在点击行选择框时切换选中状态', async () => {
      const user = userEvent.setup();

      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, { selectable: true });

      const rowCheckbox = screen.getByRole('checkbox', { name: '选择第 1 行' });
      expect(rowCheckbox).not.toBeChecked();

      await user.click(rowCheckbox);

      await vi.waitFor(() => {
        expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeChecked();
      });
    });

    it('应该在点击全选框时选中当前页所有行', async () => {
      const user = userEvent.setup();

      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, { selectable: true });

      await user.click(screen.getByRole('checkbox', { name: '全选' }));

      await vi.waitFor(() => {
        expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: '选择第 2 行' })).toBeChecked();
      });
    });

    it('应该在点击展开按钮时展开行内容', async () => {
      const user = userEvent.setup();

      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, {
        expandable: true,
        expansion: { renderExpandedRow: (record: Record<string, any>) => <span>展开详情-{record.name}</span> },
      });

      expect(screen.queryByText('展开详情-张三')).not.toBeInTheDocument();

      await user.click(screen.getAllByRole('button')[0] as HTMLElement);

      await vi.waitFor(() => {
        expect(screen.getByText('展开详情-张三')).toBeInTheDocument();
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该在表头单元格上透传 data-column 属性', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />);

      const headerCell = screen.getByText('姓名').closest('th');
      expect(headerCell).toHaveAttribute('data-column', 'name');
    });

    it('应该在数据单元格上透传 data-column-name 属性', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />);

      const cell = screen.getByText('张三').closest('td');
      expect(cell).toHaveAttribute('data-column-name', 'name');
    });

    it('应该为选择框提供可访问名称', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} />, { selectable: true });

      expect(screen.getByRole('checkbox', { name: '全选' })).toBeInTheDocument();
    });

    it('应该为可点击行添加可聚焦样式标记', () => {
      renderTable(<BaseTable columns={sampleColumns} data={sampleData} onRowClick={vi.fn()} />, {
        clickable: true,
      });

      const row = screen.getByText('张三').closest('tr');
      expect(row).toHaveClass('cursor-pointer');
    });
  });
});
