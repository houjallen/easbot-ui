/**
 * StatusBar 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证状态栏容器 / 模式文案 / 缓存与持久化文案 / 统计信息
 * 2. 状态测试 - 验证 statusBarable 关闭、show 关闭、缓存与持久化开关、远程与本地模式
 * 3. 交互测试 - 验证选中行后状态栏展示已选行数
 * 4. 无障碍测试 - 验证装饰性图标对辅助技术隐藏与容器结构
 *
 * 测试载体说明：
 * `StatusBar` 强依赖 `TableProvider`（内部调用 `useTableContext`），
 * 状态信息完全来自上下文，因此所有用例都在真实 `TableProvider` 下渲染。
 * 语言通过 `config.i18n.locale` 固定为 `zh-CN`，保证断言可复现。
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import { StatusBar } from '../../molecules/StatusBar';

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

/**
 * 渲染助手 —— 统一包一层 TableProvider，并固定语言与状态栏开关
 */
const renderStatusBar = (config?: Record<string, unknown>, data = sampleData) =>
  render(
    <TableProvider data={data} columns={sampleColumns} config={{ i18n: { locale: 'zh-CN' }, statusBarable: true, ...config } as never}>
      <StatusBar />
    </TableProvider>,
  );

describe('StatusBar 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染状态栏容器', () => {
      const { container } = renderStatusBar();

      expect(container.querySelector('.eas-table-statusbar-container')).toBeInTheDocument();
    });

    it('应该渲染数据模式文案', () => {
      renderStatusBar();

      // 默认 dataMode 全部为 remote —— 展示服务器模式
      expect(screen.getByText('服务器模式')).toBeInTheDocument();
      expect(screen.queryByText('本地模式')).not.toBeInTheDocument();
    });

    it('应该渲染缓存与持久化状态文案', () => {
      renderStatusBar({ cacheable: true, persistable: true });

      expect(screen.getByText('缓存：启用')).toBeInTheDocument();
      expect(screen.getByText('持久化：启用')).toBeInTheDocument();
    });

    it('应该渲染数据总行数与插件数量', () => {
      renderStatusBar();

      expect(screen.getByText('总计：2 行')).toBeInTheDocument();
      expect(screen.getByText('插件：0')).toBeInTheDocument();
    });

    it('应该在没有选中行时不渲染已选行数', () => {
      renderStatusBar();

      expect(screen.queryByText(/已选：/)).not.toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该在 statusBarable 为 false 时不渲染状态栏', () => {
      const { container } = renderStatusBar({ statusBarable: false });

      expect(container.querySelector('.eas-table-statusbar-container')).not.toBeInTheDocument();
    });

    it('应该在 show 为 false 时不渲染状态栏', () => {
      const { container } = renderStatusBar({ statusBar: { show: false } });

      expect(container.querySelector('.eas-table-statusbar-container')).not.toBeInTheDocument();
    });

    it('应该在关闭缓存与持久化时展示禁用文案', () => {
      renderStatusBar({ cacheable: false, persistable: false });

      expect(screen.getByText('缓存：禁用')).toBeInTheDocument();
      expect(screen.getByText('持久化：禁用')).toBeInTheDocument();
    });

    it('应该在本地数据模式下展示本地模式文案', () => {
      renderStatusBar({
        dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
      });

      expect(screen.getByText('本地模式')).toBeInTheDocument();
      expect(screen.queryByText('服务器模式')).not.toBeInTheDocument();
    });

    it('应该在远程排序模式下仍展示服务器模式文案', () => {
      renderStatusBar({
        dataMode: { sort: 'remote', filter: 'local', search: 'local', pagination: 'local' },
      });

      expect(screen.getByText('服务器模式')).toBeInTheDocument();
    });

    it('应该在没有数据时展示零行', () => {
      renderStatusBar({}, []);

      expect(screen.getByText('总计：0 行')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在存在选中行时展示已选行数', () => {
      renderStatusBar({
        selectable: true,
        dataMode: { clearSelectedOnPagination: false },
        selection: { selectedRowKeys: ['1'] },
      });

      expect(screen.getByText(/已选：1 行/)).toBeInTheDocument();
      expect(screen.getByText('总计：2 行')).toBeInTheDocument();
    });

    it('应该在存在多个选中行时展示对应的已选行数', () => {
      renderStatusBar({
        selectable: true,
        dataMode: { clearSelectedOnPagination: false },
        selection: { selectedRowKeys: ['1', '2'] },
      });

      expect(screen.getByText(/已选：2 行/)).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该把状态图标标记为对辅助技术隐藏', () => {
      const { container } = renderStatusBar();

      const svgs = container.querySelectorAll('.eas-table-statusbar-container svg');
      expect(svgs.length).toBeGreaterThan(0);
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('应该把状态文本渲染在 span 元素中', () => {
      const { container } = renderStatusBar();

      const mode = screen.getByText('服务器模式');
      expect(mode.tagName).toBe('SPAN');
      expect(container.querySelector('.eas-table-statusbar-container')).toContainElement(mode);
    });
  });
});
