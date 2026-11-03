/**
 * SearchPanel 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证搜索面板容器 / 字段标签 / 搜索与重置按钮的渲染
 * 2. 状态测试 - 验证 searchable 关闭、show 关闭、无搜索字段时不渲染
 * 3. 交互测试 - 验证搜索提交、重置清空、autoSearch 隐藏搜索按钮
 * 4. 无障碍测试 - 验证字段标签与按钮的可访问名称
 *
 * 测试载体说明：
 * `SearchPanel` 强依赖 `TableProvider`（内部调用 `useTableContext`），
 * 且搜索字段来自上下文的 `config.search.fields`，
 * 因此所有用例都在真实 `TableProvider` 下渲染。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableState } from '../../context/TableContext';
import type { SearchFieldConfig, TableColumn } from '../../types';
import { SearchPanel } from '../SearchPanel';

/**
 * 测试数据
 */
const sampleData = [
  { id: '1', name: '张三', role: '管理员' },
  { id: '2', name: '李四', role: '访客' },
];

const sampleColumns: TableColumn[] = [
  { name: 'name', title: '姓名', dataIndex: 'name' },
  { name: 'role', title: '角色', dataIndex: 'role' },
];

const nameField: SearchFieldConfig = {
  name: 'name',
  label: '姓名',
  type: 'text',
  dataIndex: ['name'],
  placeholder: '请输入姓名',
};

const roleField: SearchFieldConfig = {
  name: 'role',
  label: '角色',
  type: 'text',
  dataIndex: ['role'],
  placeholder: '请输入角色',
};

/**
 * 状态探针 —— 读取上下文中的搜索条件，便于断言搜索是否真正写入上下文
 */
const SearchStateProbe = () => {
  const searchState = useTableState((state) => state.searchState);
  return <pre data-testid="search-state">{JSON.stringify(searchState)}</pre>;
};

/**
 * 渲染助手 —— 统一包一层 TableProvider，并把搜索配置写进上下文
 */
const renderSearchPanel = (search: Record<string, unknown>, config?: Record<string, unknown>) =>
  render(
    <TableProvider data={sampleData} columns={sampleColumns} config={{ searchable: true, search, ...config } as never}>
      <SearchPanel />
      <SearchStateProbe />
    </TableProvider>,
  );

describe('SearchPanel 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染搜索面板容器', () => {
      const { container } = renderSearchPanel({ fields: [nameField] });

      expect(container.querySelector('.eas-table-search-container')).toBeInTheDocument();
    });

    it('应该渲染搜索字段标签', () => {
      renderSearchPanel({ fields: [nameField, roleField] });

      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('角色')).toBeInTheDocument();
    });

    it('应该渲染搜索输入框', () => {
      renderSearchPanel({ fields: [nameField, roleField] });

      expect(screen.getByPlaceholderText('请输入姓名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入角色')).toBeInTheDocument();
    });

    it('应该渲染搜索与重置按钮', () => {
      renderSearchPanel({ fields: [nameField] });

      expect(screen.getByRole('button', { name: /搜索/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重置/ })).toBeInTheDocument();
    });

    it('应该在 showLabel 为 false 时隐藏字段标签', () => {
      renderSearchPanel({ fields: [nameField], showLabel: false });

      expect(screen.queryByText('姓名')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入姓名')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该在 searchable 为 false 时不渲染搜索面板', () => {
      const { container } = render(
        <TableProvider data={sampleData} columns={sampleColumns} config={{ searchable: false } as never}>
          <SearchPanel />
        </TableProvider>,
      );

      expect(container.querySelector('.eas-table-search-container')).not.toBeInTheDocument();
    });

    it('应该在 show 为 false 时不渲染搜索面板', () => {
      const { container } = renderSearchPanel({ fields: [nameField], show: false });

      expect(container.querySelector('.eas-table-search-container')).not.toBeInTheDocument();
    });

    it('应该在没有搜索字段时不渲染搜索面板', () => {
      const { container } = renderSearchPanel({ fields: [] });

      expect(container.querySelector('.eas-table-search-container')).not.toBeInTheDocument();
    });

    it('应该在 autoSearch 为 true 时隐藏搜索按钮但保留重置按钮', () => {
      renderSearchPanel({ fields: [nameField], autoSearch: true });

      expect(screen.queryByRole('button', { name: /搜索/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重置/ })).toBeInTheDocument();
    });

    it('应该在 filterMultiple 为 true 时不渲染搜索与重置按钮', () => {
      renderSearchPanel({ fields: [nameField], filterMultiple: true });

      expect(screen.queryByRole('button', { name: /搜索/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /重置/ })).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击搜索按钮后把搜索条件写入上下文', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      renderSearchPanel({ fields: [nameField], onSearchChange });

      await user.type(screen.getByPlaceholderText('请输入姓名'), '张');
      await user.click(screen.getByRole('button', { name: /搜索/ }));

      await vi.waitFor(() => {
        expect(onSearchChange).toHaveBeenCalled();
      });

      const searchState = JSON.parse(screen.getByTestId('search-state').textContent ?? '{}');
      expect(searchState).toMatchObject({
        name: {
          field: ['name'],
          operator: 'like',
          value: ['张'],
          type: 'string',
        },
      });
    });

    it('应该在点击重置按钮后清空搜索条件并调用 onSearchChange 回调', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      renderSearchPanel({ fields: [nameField], onSearchChange });

      await user.type(screen.getByPlaceholderText('请输入姓名'), '张');
      await user.click(screen.getByRole('button', { name: /搜索/ }));

      await vi.waitFor(() => {
        expect(onSearchChange).toHaveBeenCalled();
      });

      onSearchChange.mockClear();

      await user.click(screen.getByRole('button', { name: /重置/ }));

      await vi.waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledWith({});
      });

      await vi.waitFor(() => {
        expect(JSON.parse(screen.getByTestId('search-state').textContent ?? '{}')).toEqual({});
      });
    });

    it('应该在重置后清空输入框的值', async () => {
      const user = userEvent.setup();

      renderSearchPanel({ fields: [nameField] });

      const input = screen.getByPlaceholderText('请输入姓名');
      await user.type(input, '张');
      expect(input).toHaveValue('张');

      await user.click(screen.getByRole('button', { name: /重置/ }));

      await vi.waitFor(() => {
        expect(screen.getByPlaceholderText('请输入姓名')).toHaveValue('');
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该为搜索与重置按钮提供可访问名称', () => {
      renderSearchPanel({ fields: [nameField] });

      expect(screen.getByRole('button', { name: /搜索/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重置/ })).toBeInTheDocument();
    });

    it('应该为搜索输入框提供占位提示作为可访问名称', () => {
      renderSearchPanel({ fields: [nameField] });

      expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入姓名')).toBeInTheDocument();
    });

    it('应该为字段标签渲染为 label 元素', () => {
      const { container } = renderSearchPanel({ fields: [nameField] });

      const label = container.querySelector('.eas-table-search-field-md');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toBe('姓名');
    });
  });
});
