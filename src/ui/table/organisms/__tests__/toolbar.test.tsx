/**
 * Toolbar 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证工具栏容器 / 左右区域 / 动作按钮的渲染
 * 2. 状态测试 - 验证 toolbarable 关闭、show 关闭、禁用态、可见性函数
 * 3. 交互测试 - 验证动作点击回调、更多菜单展开与菜单项点击
 * 4. 无障碍测试 - 验证按钮可访问名称与区域语义标记
 *
 * 测试载体说明：
 * `Toolbar` 强依赖 `TableProvider`（内部调用 `useTableContext`），
 * 并且工具栏配置来自上下文中的 `config.toolbar`，
 * 因此所有用例都在真实 `TableProvider` 下渲染。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import type { TableColumn, ToolbarConfig } from '../../types';
import { Toolbar } from '../Toolbar';

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
 * 渲染助手 —— 统一包一层 TableProvider，并把工具栏配置写进上下文
 */
const renderToolbar = (toolbar?: ToolbarConfig, config?: Record<string, unknown>) =>
  render(
    <TableProvider data={sampleData} columns={sampleColumns} config={{ toolbarable: true, toolbar, ...config } as never}>
      <Toolbar />
    </TableProvider>,
  );

/**
 * 通过图标类名定位“更多”菜单触发器（图标为纯装饰，没有可访问名称）
 */
const queryMoreTrigger = (container: HTMLElement) => container.querySelector('svg.lucide-more-vertical');

describe('Toolbar 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染工具栏容器与左右区域', () => {
      const { container } = renderToolbar({ show: true });

      const root = container.querySelector('.eas-table-toolbar-container');
      expect(root).toBeInTheDocument();
      expect(container.querySelector('.eas-table-toolbar-left')).toBeInTheDocument();
      expect(container.querySelector('.eas-table-toolbar-right')).toBeInTheDocument();
    });

    it('应该渲染左侧动作并显示文本标签', () => {
      renderToolbar({
        show: true,
        left: [{ key: 'add', label: '新增', icon: 'plus' }],
      });

      expect(screen.getByRole('button', { name: /新增/ })).toBeInTheDocument();
    });

    it('应该渲染右侧动作但不显示文本标签', () => {
      const { container } = renderToolbar({
        show: true,
        right: [{ key: 'refresh', label: '刷新', icon: 'plus' }],
      });

      // 右侧动作是纯图标按钮 —— 按图标定位
      const right = container.querySelector('.eas-table-toolbar-right');
      expect(right).toBeInTheDocument();
      expect(right?.querySelector('svg.lucide-plus')).toBeInTheDocument();
      // 图标按钮没有可见文本
      expect(right?.textContent).toBe('');
    });

    it('应该支持透传自定义类名', () => {
      const { container } = renderToolbar({ show: true }, {});

      const root = container.querySelector('.eas-table-toolbar-container');
      expect(root).toBeInTheDocument();
    });

    it('应该在没有配置任何动作时渲染空的左右区域', () => {
      const { container } = renderToolbar({ show: true });

      expect(container.querySelector('.eas-table-toolbar-left')).toBeEmptyDOMElement();
      expect(container.querySelector('.eas-table-toolbar-right')).toBeEmptyDOMElement();
    });
  });

  describe('状态测试', () => {
    it('应该在 toolbarable 为 false 时不渲染工具栏', () => {
      const { container } = render(
        <TableProvider data={sampleData} columns={sampleColumns} config={{ toolbarable: false } as never}>
          <Toolbar />
        </TableProvider>,
      );

      expect(container.querySelector('.eas-table-toolbar-container')).not.toBeInTheDocument();
    });

    it('应该在 show 为 false 时不渲染工具栏', () => {
      const { container } = renderToolbar({ show: false });

      expect(container.querySelector('.eas-table-toolbar-container')).not.toBeInTheDocument();
    });

    it('应该在动作 disabled 为 true 时禁用对应按钮', () => {
      renderToolbar({
        show: true,
        left: [{ key: 'delete', label: '删除', disabled: true }],
      });

      expect(screen.getByRole('button', { name: /删除/ })).toBeDisabled();
    });

    it('应该在动作 visible 返回 false 时隐藏该动作', () => {
      renderToolbar({
        show: true,
        left: [{ key: 'hidden', label: '隐藏动作', visible: () => false }],
      });

      expect(screen.queryByRole('button', { name: /隐藏动作/ })).not.toBeInTheDocument();
    });

    it('应该把超过 maxVisible 数量的右侧动作移入更多菜单', () => {
      const { container } = renderToolbar({
        show: true,
        maxVisible: 1,
        right: [
          { key: 'a', label: '动作A', icon: 'plus' },
          { key: 'b', label: '动作B', icon: 'trash' },
        ],
      });

      const right = container.querySelector('.eas-table-toolbar-right');
      // 只保留第一个可见动作，第二个进入更多菜单
      expect(right?.querySelector('svg.lucide-plus')).toBeInTheDocument();
      expect(right?.querySelector('svg.lucide-trash')).not.toBeInTheDocument();
      // 更多菜单触发器出现
      expect(queryMoreTrigger(container)).toBeInTheDocument();
    });

    it('应该把 showInMore 为 true 的动作放入更多菜单', () => {
      const { container } = renderToolbar({
        show: true,
        right: [{ key: 'more-action', label: '更多动作', icon: 'trash', showInMore: true }],
      });

      const right = container.querySelector('.eas-table-toolbar-right');
      expect(right?.querySelector('svg.lucide-trash')).not.toBeInTheDocument();
      expect(queryMoreTrigger(container)).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击左侧动作时触发 execute 回调', async () => {
      const user = userEvent.setup();
      const execute = vi.fn();

      renderToolbar({
        show: true,
        left: [{ key: 'add', label: '新增', icon: 'plus', execute }],
      });

      await user.click(screen.getByRole('button', { name: /新增/ }));

      expect(execute).toHaveBeenCalledTimes(1);
      // 回调签名：execute(selectedRows, context, action)
      expect(execute.mock.calls[0]?.[0]).toEqual([]);
      expect(execute.mock.calls[0]?.[2]).toMatchObject({ key: 'add', label: '新增' });
    });

    it('应该在点击右侧动作时触发 execute 回调', async () => {
      const user = userEvent.setup();
      const execute = vi.fn();

      const { container } = renderToolbar({
        show: true,
        right: [{ key: 'refresh', label: '刷新', icon: 'plus', execute }],
      });

      const right = container.querySelector('.eas-table-toolbar-right') as HTMLElement;
      await user.click(right.querySelector('button') as HTMLElement);

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute.mock.calls[0]?.[2]).toMatchObject({ key: 'refresh' });
    });

    it('应该在禁用状态下不触发 execute 回调', async () => {
      const user = userEvent.setup();
      const execute = vi.fn();

      renderToolbar({
        show: true,
        left: [{ key: 'delete', label: '删除', disabled: true, execute }],
      });

      await user.click(screen.getByRole('button', { name: /删除/ }));

      expect(execute).not.toHaveBeenCalled();
    });

    it('应该在展开更多菜单后渲染菜单项', async () => {
      const user = userEvent.setup();

      const { container } = renderToolbar({
        show: true,
        right: [{ key: 'more-action', label: '更多动作', icon: 'trash', showInMore: true }],
      });

      const trigger = queryMoreTrigger(container)?.closest('button');
      expect(trigger).not.toBeNull();

      await user.click(trigger as HTMLElement);

      const menuItem = await screen.findByRole('menuitem');
      expect(menuItem).toBeInTheDocument();
      expect(screen.getByText('更多动作')).toBeInTheDocument();
    });

    it('应该在点击更多菜单项时触发 execute 回调', async () => {
      const user = userEvent.setup();
      const execute = vi.fn();

      const { container } = renderToolbar({
        show: true,
        right: [{ key: 'more-action', label: '更多动作', icon: 'trash', showInMore: true, execute }],
      });

      const trigger = queryMoreTrigger(container)?.closest('button');
      await user.click(trigger as HTMLElement);

      const menuItem = await screen.findByRole('menuitem');
      await user.click(menuItem);

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute.mock.calls[0]?.[2]).toMatchObject({ key: 'more-action' });
    });

    it('应该在按下 Escape 时关闭更多菜单', async () => {
      const user = userEvent.setup();

      const { container } = renderToolbar({
        show: true,
        right: [{ key: 'more-action', label: '更多动作', icon: 'trash', showInMore: true }],
      });

      const trigger = queryMoreTrigger(container)?.closest('button');
      await user.click(trigger as HTMLElement);

      expect(await screen.findByRole('menuitem')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await vi.waitFor(() => {
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该为左侧动作按钮提供可访问名称', () => {
      renderToolbar({
        show: true,
        left: [{ key: 'add', label: '新增数据', icon: 'plus' }],
      });

      expect(screen.getByRole('button', { name: /新增数据/ })).toBeInTheDocument();
    });

    it('应该把装饰性图标标记为对辅助技术隐藏', () => {
      const { container } = renderToolbar({
        show: true,
        left: [{ key: 'add', label: '新增', icon: 'plus' }],
      });

      const icon = container.querySelector('.eas-icon');
      expect(icon).toBeInTheDocument();
      expect(icon?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('应该渲染更多菜单触发器为按钮元素', async () => {
      const user = userEvent.setup();

      const { container } = renderToolbar({
        show: true,
        right: [{ key: 'more-action', label: '更多动作', icon: 'trash', showInMore: true }],
      });

      const trigger = queryMoreTrigger(container)?.closest('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger?.tagName).toBe('BUTTON');

      await user.click(trigger as HTMLElement);
      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });
  });
});
