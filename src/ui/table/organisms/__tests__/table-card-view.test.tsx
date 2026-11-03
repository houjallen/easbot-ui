/**
 * TableCardView 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证卡片容器 / 卡片标题 / 卡片描述的渲染
 * 2. 状态测试 - 验证空数据、选择态、自定义字段映射与自定义渲染
 * 3. 交互测试 - 验证卡片点击 / 双击 / 选择框切换
 * 4. 无障碍测试 - 验证卡片标题语义层级与选择框可访问性
 *
 * 测试载体说明：
 * `TableCardView` 没有 data 属性，数据完全来自上下文
 * （`tableLogic.getProcessedData()`），因此所有用例都在真实
 * `TableProvider` 下渲染。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import { TableCardView } from '../TableCardView';

/**
 * 测试数据
 */
const sampleData = [
  { id: '1', name: '张三', description: '张三的描述', role: '管理员' },
  { id: '2', name: '李四', description: '李四的描述', role: '访客' },
];

const sampleColumns: TableColumn[] = [
  { name: 'name', title: '姓名', dataIndex: 'name' },
  { name: 'role', title: '角色', dataIndex: 'role' },
];

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderCardView = (ui: React.ReactElement, config?: Record<string, unknown>, data = sampleData, columns = sampleColumns) =>
  render(
    <TableProvider data={data} columns={columns} config={{ displayMode: 'card', ...config } as never}>
      {ui}
    </TableProvider>,
  );

describe('TableCardView 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染卡片容器', () => {
      const { container } = renderCardView(<TableCardView />);

      expect(container.querySelector('.eas-table-card-container')).toBeInTheDocument();
    });

    it('应该按数据条数渲染卡片', () => {
      const { container } = renderCardView(<TableCardView />);

      expect(container.querySelectorAll('.eas-table-card')).toHaveLength(2);
    });

    it('应该渲染卡片标题与描述', () => {
      renderCardView(<TableCardView />);

      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('张三的描述')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('李四的描述')).toBeInTheDocument();
    });

    it('应该支持透传自定义类名到外层容器', () => {
      const { container } = renderCardView(<TableCardView className="custom-card-view" />);

      const root = container.querySelector('.w-full');
      expect(root).toHaveClass('custom-card-view');
    });
  });

  describe('状态测试', () => {
    it('应该在没有数据时渲染空状态', () => {
      renderCardView(<TableCardView />, {}, []);

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
      expect(document.querySelectorAll('.eas-table-card')).toHaveLength(0);
    });

    it('应该在开启 selectable 时渲染卡片选择框', () => {
      const { container } = renderCardView(<TableCardView />, { selectable: true });

      expect(container.querySelectorAll('[data-slot="checkbox"]')).toHaveLength(2);
    });

    it('应该在关闭 selectable 时不渲染卡片选择框', () => {
      const { container } = renderCardView(<TableCardView />);

      expect(container.querySelectorAll('[data-slot="checkbox"]')).toHaveLength(0);
    });

    it('应该支持自定义标题与描述字段', () => {
      renderCardView(<TableCardView cardConfig={{ titleField: 'role', descriptionField: 'name' }} />);

      expect(screen.getByText('管理员')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    it('应该支持自定义卡片渲染函数', () => {
      renderCardView(
        <TableCardView
          cardConfig={{
            renderCard: (record) => <span>自定义卡片-{record.name}</span>,
          }}
        />,
      );

      expect(screen.getByText('自定义卡片-张三')).toBeInTheDocument();
      expect(screen.getByText('自定义卡片-李四')).toBeInTheDocument();
      expect(document.querySelectorAll('.eas-table-card')).toHaveLength(0);
    });

    it('应该通过 rowClassName 为卡片追加类名', () => {
      const { container } = renderCardView(<TableCardView rowClassName="row-style" />);

      const card = container.querySelector('.eas-table-card');
      expect(card).toHaveClass('row-style');
    });
  });

  describe('交互测试', () => {
    it('应该在点击卡片时触发 onCardClick 回调', async () => {
      const user = userEvent.setup();
      const onCardClick = vi.fn();

      renderCardView(<TableCardView onCardClick={onCardClick} />, { clickable: true });

      await user.click(screen.getByText('张三'));

      expect(onCardClick).toHaveBeenCalledTimes(1);
      expect(onCardClick.mock.calls[0]?.[0]).toMatchObject({ id: '1', name: '张三' });
      expect(onCardClick.mock.calls[0]?.[1]).toBe(0);
    });

    it('应该在双击卡片时触发 onCardDoubleClick 回调', async () => {
      const user = userEvent.setup();
      const onCardDoubleClick = vi.fn();

      renderCardView(<TableCardView onCardDoubleClick={onCardDoubleClick} />, { clickable: true });

      await user.dblClick(screen.getByText('李四'));

      expect(onCardDoubleClick).toHaveBeenCalledTimes(1);
      expect(onCardDoubleClick.mock.calls[0]?.[0]).toMatchObject({ id: '2', name: '李四' });
    });

    it('应该在点击卡片选择框时触发 onCheckedChange 回调', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      const { container } = renderCardView(<TableCardView onCheckedChange={onCheckedChange} />, {
        selectable: true,
      });

      const checkbox = screen.getAllByRole('checkbox')[0] as HTMLElement;
      expect(checkbox).toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="checkbox"]')).toHaveLength(2);

      await user.click(checkbox);

      await vi.waitFor(() => {
        expect(onCheckedChange).toHaveBeenCalledTimes(1);
      });
      expect(onCheckedChange.mock.calls[0]?.[0]).toMatchObject({ id: '1', name: '张三' });
      expect(onCheckedChange.mock.calls[0]?.[2]).toBe(true);
    });

    it('应该在未开启 selectable 时不触发 onCheckedChange 回调', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      renderCardView(<TableCardView onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByText('张三'));

      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该把卡片标题渲染为三级标题元素', () => {
      renderCardView(<TableCardView />);

      const title = screen.getByText('张三');
      expect(title.tagName).toBe('H3');
      expect(screen.getByRole('heading', { level: 3, name: '张三' })).toBeInTheDocument();
    });

    it('应该把卡片描述渲染为段落元素', () => {
      renderCardView(<TableCardView />);

      expect(screen.getByText('张三的描述').tagName).toBe('P');
    });

    it('应该为卡片选择框提供可访问的复选框角色', () => {
      renderCardView(<TableCardView />, { selectable: true });

      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });
  });
});
