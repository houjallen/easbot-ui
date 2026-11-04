/**
 * EnhancedTable 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证表头 / 数据行 / 空状态 / 容器类名的基础渲染
 * 2. 状态测试 - 验证选择态 / 加载态 / 错误态 / 列可见性
 * 3. 交互测试 - 验证行点击 / 双击 / 行选择框 / 全选框
 * 4. 无障碍测试 - 验证表格语义结构与 data-column 属性透传
 *
 * 测试载体说明：
 * `EnhancedTable` 在没有 `TableProvider` 祖先时会自动包装一层 `TableProvider`，
 * 因此既可以独立渲染（验证自动包装分支），也可以显式包一层
 * `TableProvider`（验证复用外部上下文分支）。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import { EnhancedTable } from '../EnhancedTable';

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
 * 渲染助手 —— 统一包一层 TableProvider（验证复用外部上下文分支）
 */
const renderTable = (ui: React.ReactElement, config?: Record<string, unknown>, data = sampleData, columns = sampleColumns) =>
  render(
    <TableProvider data={data} columns={columns} config={config as never}>
      {ui}
    </TableProvider>,
  );

describe('EnhancedTable 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染表头与数据行', () => {
      renderTable(<EnhancedTable />);

      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('角色')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
    });

    it('应该渲染表格语义结构', () => {
      renderTable(<EnhancedTable />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
      expect(screen.getAllByRole('cell')).toHaveLength(4);
    });

    it('应该在没有 TableProvider 时自动包装上下文并渲染数据', () => {
      render(<EnhancedTable data={sampleData} columns={sampleColumns} />);

      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    it('应该在没有数据时渲染空状态', () => {
      renderTable(<EnhancedTable />, {}, [], sampleColumns);

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
      expect(screen.getByRole('row', { name: /暂无数据/ })).toHaveClass('eas-table-row-empty');
    });

    it('应该支持自定义类名透传到表格容器', () => {
      renderTable(<EnhancedTable className="custom-enhanced" />);

      expect(screen.getByRole('table').closest('.eas-table-container')).toHaveClass('custom-enhanced');
    });

    it('应该支持渲染自定义子组件', () => {
      renderTable(
        <EnhancedTable>
          <caption>自定义表内容</caption>
        </EnhancedTable>,
      );

      expect(screen.getByText('自定义表内容')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该在开启选择列时渲染全选框与行选择框', () => {
      renderTable(<EnhancedTable />, { selectable: true });

      expect(screen.getByRole('checkbox', { name: '全选' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '选择第 2 行' })).toBeInTheDocument();
    });

    it('应该在关闭选择列时不渲染选择框', () => {
      renderTable(<EnhancedTable />);

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('应该在加载时展示加载蒙层', () => {
      render(
        <TableProvider data={sampleData} columns={sampleColumns} loading>
          <EnhancedTable />
        </TableProvider>,
      );

      expect(screen.getByText('加载中…')).toBeInTheDocument();
    });

    it('应该在出错时展示错误状态', () => {
      render(
        <TableProvider data={sampleData} columns={sampleColumns} error="数据加载失败">
          <EnhancedTable />
        </TableProvider>,
      );

      expect(screen.getByText('数据加载失败')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('应该隐藏 visible 为 false 的列', () => {
      const columns: TableColumn[] = [
        { name: 'name', title: '姓名', dataIndex: 'name' },
        { name: 'role', title: '角色', dataIndex: 'role', visible: false },
      ];

      renderTable(<EnhancedTable />, {}, sampleData, columns);

      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.queryByText('角色')).not.toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(1);
    });
  });

  describe('交互测试', () => {
    it('应该在点击行时触发 onRowClick 回调', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      renderTable(<EnhancedTable onRowClick={onRowClick} />, { clickable: true });

      await user.click(screen.getByText('张三'));

      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onRowClick.mock.calls[0]?.[0]).toMatchObject({ id: '1', name: '张三' });
    });

    it('应该在双击行时触发 onRowDoubleClick 回调', async () => {
      const user = userEvent.setup();
      const onRowDoubleClick = vi.fn();

      renderTable(<EnhancedTable onRowDoubleClick={onRowDoubleClick} />, { clickable: true });

      await user.dblClick(screen.getByText('李四'));

      expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
      expect(onRowDoubleClick.mock.calls[0]?.[0]).toMatchObject({ id: '2', name: '李四' });
    });

    it('应该在点击行选择框时切换选中状态', async () => {
      const user = userEvent.setup();

      renderTable(<EnhancedTable />, { selectable: true });

      const rowCheckbox = screen.getByRole('checkbox', { name: '选择第 1 行' });
      expect(rowCheckbox).not.toBeChecked();

      await user.click(rowCheckbox);

      await vi.waitFor(() => {
        expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeChecked();
      });
    });

    it('应该在点击全选框时选中当前页所有行', async () => {
      const user = userEvent.setup();

      renderTable(<EnhancedTable />, { selectable: true });

      await user.click(screen.getByRole('checkbox', { name: '全选' }));

      await vi.waitFor(() => {
        expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: '选择第 2 行' })).toBeChecked();
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该在表头单元格上透传 data-column 属性', () => {
      renderTable(<EnhancedTable />);

      const headerCell = screen.getByText('姓名').closest('th');
      expect(headerCell).toHaveAttribute('data-column', 'name');
    });

    it('应该在数据单元格上透传 data-column-name 属性', () => {
      renderTable(<EnhancedTable />);

      const cell = screen.getByText('张三').closest('td');
      expect(cell).toHaveAttribute('data-column-name', 'name');
    });

    it('应该为选择框提供可访问名称', () => {
      renderTable(<EnhancedTable />, { selectable: true });

      expect(screen.getByRole('checkbox', { name: '全选' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeInTheDocument();
    });

    it('应该为可点击行添加可聚焦样式标记', () => {
      renderTable(<EnhancedTable onRowClick={vi.fn()} />, { clickable: true });

      const row = screen.getByText('张三').closest('tr');
      expect(row).toHaveClass('cursor-pointer');
    });
  });
});
