/**
 * AdvancedTable 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证容器 / 表格主体 / 搜索面板 / 工具栏 / 状态栏的组合渲染
 * 2. 状态测试 - 验证 searchable / toolbarable / statusBarable 开关与默认配置合并
 * 3. 交互测试 - 验证行点击 / 双击 / 本地排序生效 / 选择框切换
 * 4. 无障碍测试 - 验证表格语义结构与选择框可访问名称
 *
 * 测试载体说明：
 * `AdvancedTable` 在没有 `TableProvider` 祖先时会自动包装一层 `TableProvider`，
 * 并深度合并默认配置（selectable / sortable / filterable / searchable /
 * toolbarable / pagination / dataMode 全部为 remote）。
 * 本地排序、筛选、分页需要把 `config.dataMode` 覆盖为 `local` 才会生效。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableLogic } from '../../context/TableContext';
import type { SearchFieldConfig, TableColumn } from '../../types';
import { AdvancedTable } from '../AdvancedTable';

/**
 * 测试数据
 */
const sampleData = [
  { id: '1', name: '张三', role: '管理员' },
  { id: '2', name: '李四', role: '访客' },
  { id: '3', name: '王五', role: '访客' },
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

/**
 * 数据探针 —— 读取上下文中的处理后数据，便于断言本地排序 / 筛选结果
 */
const ProcessedDataProbe = () => {
  const tableLogic = useTableLogic();
  const rows = tableLogic.getProcessedData();
  return (
    <ul data-testid="processed-data">
      {rows.map((row) => (
        <li key={String(row.id)}>{row.name}</li>
      ))}
    </ul>
  );
};

/**
 * 渲染助手 —— 独立渲染（触发 AdvancedTable 自动包装 TableProvider 的分支）
 */
const renderTable = (ui: React.ReactElement) => render(ui);

describe('AdvancedTable 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染高级表格容器', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      expect(container.querySelector('.eas-advanced-table-container')).toBeInTheDocument();
    });

    it('应该渲染表格主体与数据行', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
    });

    it('应该在配置搜索字段后渲染搜索面板', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} search={{ fields: [nameField] }} />);

      expect(container.querySelector('.eas-table-search-container')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入姓名')).toBeInTheDocument();
    });

    it('应该在工具栏配置 show 为 true 后渲染工具栏', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} toolbar={{ show: true, left: [{ key: 'custom-add', label: '自定义新增', icon: 'plus' }] }} />);

      expect(container.querySelector('.eas-table-toolbar-container')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /自定义新增/ })).toBeInTheDocument();
    });

    it('应该在开启 statusBarable 后渲染状态栏', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} config={{ statusBarable: true } as never} />);

      expect(container.querySelector('.eas-table-statusbar-container')).toBeInTheDocument();
    });

    it('应该在启用插件后渲染插件工具栏动作', async () => {
      // 回归用例：全屏插件曾用运行时 `require('../../button')` 打破循环依赖，
      // 在 ESM / Vitest 下抛 `Cannot find module`，导致插件动作完全不渲染。
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} config={{ toolbarable: true } as never} />);

      // 插件注册发生在 useEffect 中，需要等待一次状态回写
      await vi.waitFor(() => {
        const toolbar = container.querySelector('.eas-table-toolbar-container');
        expect(toolbar).toBeInTheDocument();
        expect(toolbar?.querySelectorAll('button').length).toBeGreaterThan(0);
      });
    });

    it('应该支持透传自定义类名到容器', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} className="custom-advanced" />);

      expect(container.querySelector('.eas-advanced-table-container')).toHaveClass('custom-advanced');
    });
  });

  describe('状态测试', () => {
    it('应该在默认配置下渲染选择列', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      // 默认 selectable 为 true
      expect(screen.getByRole('checkbox', { name: '全选' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeInTheDocument();
    });

    it('应该在 selectable 为 false 时不渲染选择列', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} config={{ selectable: false } as never} />);

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('应该在 searchable 为 false 时不渲染搜索面板', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} search={{ fields: [nameField] }} config={{ searchable: false } as never} />);

      expect(container.querySelector('.eas-table-search-container')).not.toBeInTheDocument();
    });

    it('应该在 toolbarable 为 false 时不渲染工具栏', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} toolbar={{ show: true }} config={{ toolbarable: false } as never} />);

      expect(container.querySelector('.eas-table-toolbar-container')).not.toBeInTheDocument();
    });

    it('应该在 statusBarable 为 false 时不渲染状态栏', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} config={{ statusBarable: false } as never} />);

      expect(container.querySelector('.eas-table-statusbar-container')).not.toBeInTheDocument();
    });

    it('应该在没有搜索字段时不渲染搜索面板', () => {
      const { container } = renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      expect(container.querySelector('.eas-table-search-container')).not.toBeInTheDocument();
    });

    it('应该在没有数据时渲染空状态', () => {
      renderTable(<AdvancedTable data={[]} columns={sampleColumns} />);

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });

    it('应该在加载时展示加载蒙层', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} loading />);

      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('应该在出错时展示错误状态', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} error="数据加载失败" />);

      expect(screen.getByText('数据加载失败')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击行时触发 onRowClick 回调', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} onRowClick={onRowClick} config={{ clickable: true } as never} />);

      await user.click(screen.getByText('张三'));

      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onRowClick.mock.calls[0]?.[0]).toMatchObject({ id: '1', name: '张三' });
    });

    it('应该在双击行时触发 onRowDoubleClick 回调', async () => {
      const user = userEvent.setup();
      const onRowDoubleClick = vi.fn();

      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} onRowDoubleClick={onRowDoubleClick} config={{ clickable: true } as never} />);

      await user.dblClick(screen.getByText('李四'));

      expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
      expect(onRowDoubleClick.mock.calls[0]?.[0]).toMatchObject({ id: '2', name: '李四' });
    });

    it('应该在本地数据模式下返回完整的本地分页数据', () => {
      render(
        <TableProvider data={sampleData} columns={sampleColumns} config={{ i18n: { locale: 'zh-CN' }, dataMode: { pagination: 'local' } } as never}>
          <ProcessedDataProbe />
        </TableProvider>,
      );

      const items = screen.getByTestId('processed-data').querySelectorAll('li');
      expect(items).toHaveLength(3);
      expect(items[0]?.textContent).toBe('张三');
    });

    it('应该在远程数据模式下原样返回数据', () => {
      render(
        <TableProvider data={sampleData} columns={sampleColumns} config={{ i18n: { locale: 'zh-CN' } } as never}>
          <ProcessedDataProbe />
        </TableProvider>,
      );

      const items = screen.getByTestId('processed-data').querySelectorAll('li');
      expect(items).toHaveLength(3);
      expect(items[0]?.textContent).toBe('张三');
    });

    it('应该在点击行选择框时切换选中状态', async () => {
      const user = userEvent.setup();

      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      const rowCheckbox = screen.getByRole('checkbox', { name: '选择第 1 行' });
      expect(rowCheckbox).not.toBeChecked();

      await user.click(rowCheckbox);

      await vi.waitFor(() => {
        expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeChecked();
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该渲染表格语义结构', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      // 默认 selectable 为 true —— 2 个数据列 + 1 个选择列
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.getAllByRole('row')).toHaveLength(4);
    });

    it('应该为选择框提供可访问名称', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      expect(screen.getByRole('checkbox', { name: '全选' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeInTheDocument();
    });

    it('应该在表头单元格上透传 data-column 属性', () => {
      renderTable(<AdvancedTable data={sampleData} columns={sampleColumns} />);

      const headerCell = screen.getByText('姓名').closest('th');
      expect(headerCell).toHaveAttribute('data-column', 'name');
    });

    it('应该在已有 TableProvider 上下文时复用外部上下文的数据', () => {
      render(
        <TableProvider data={sampleData} columns={sampleColumns}>
          <AdvancedTable />
        </TableProvider>,
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });
});
