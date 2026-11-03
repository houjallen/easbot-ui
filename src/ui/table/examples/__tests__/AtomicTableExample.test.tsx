/**
 * AtomicTableExample 单元测试
 *
 * @description
 * 覆盖示例中两个易错点（回归防护）：
 * 1. **删除要真的移除行** —— 原实现数据放在模块级常量上，
 *    删除按钮只弹 `alert()`，行不会消失。
 * 2. **展开行要跨列** —— 缺 `colSpan` 时内容被压成第 1 列宽度，文字重叠。
 *
 * @remarks
 * 原子组件依赖 `TableContext`（`useTableConfig`），
 * 渲染时必须包裹 `TableProvider`，否则抛 `useTableContext` 错误。
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import { AtomicTableExample } from '../AtomicTableExample';

/**
 * 渲染示例
 *
 * @param props 示例属性
 * @returns 渲染结果
 */
const renderExample = (props: Partial<React.ComponentProps<typeof AtomicTableExample>> = {}) =>
  render(
    <TableProvider config={{ i18n: { locale: 'zh-CN' } }}>
      <AtomicTableExample {...props} />
    </TableProvider>,
  );

/**
 * 定位某单元格所在的行
 *
 * @param text 行内文本
 * @returns 行元素
 */
const getRowByText = (text: string): HTMLElement => {
  const row = screen.getByText(text).closest('tr');
  if (!row) throw new Error(`未找到包含「${text}」的行`);
  return row as HTMLElement;
};

/**
 * 取行内最后一个按钮（删除按钮）
 *
 * @param row 行元素
 * @returns 删除按钮
 */
const getDeleteButton = (row: HTMLElement): HTMLElement => {
  const buttons = within(row).getAllByRole('button');
  const deleteButton = buttons[buttons.length - 1];
  if (!deleteButton) throw new Error('行内未找到删除按钮');
  return deleteButton;
};

describe('AtomicTableExample', () => {
  describe('删除测试', () => {
    it('本地删除：点击删除按钮后该行应从表格中消失', () => {
      renderExample();

      // 初始有 5 行
      expect(screen.getAllByRole('row')).toHaveLength(6); // 1 表头 + 5 数据行

      // 删除「张三」行的删除按钮
      fireEvent.click(getDeleteButton(getRowByText('张三')));

      expect(screen.queryByText('张三')).not.toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(5); // 1 表头 + 4 数据行
    });

    it('本地删除：总数据计数应同步减少', () => {
      renderExample();

      expect(screen.getByText('总数据').previousSibling).toHaveTextContent('5');

      fireEvent.click(getDeleteButton(getRowByText('张三')));

      expect(screen.getByText('总数据').previousSibling).toHaveTextContent('4');
    });

    it('远程删除：数据应先保留，请求完成后才移除', async () => {
      renderExample({ deleteMode: 'remote' });

      fireEvent.click(getDeleteButton(getRowByText('张三')));

      // 请求未完成 —— 数据仍在
      expect(screen.getByText('张三')).toBeInTheDocument();

      // 等待模拟请求完成（300ms）
      await vi.waitFor(
        () => {
          expect(screen.queryByText('张三')).not.toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it('删除不应触发行展开（事件冒泡被阻止）', () => {
      renderExample();

      fireEvent.click(getDeleteButton(getRowByText('张三')));

      // 未点击行本身 → 不应出现展开详情
      expect(screen.queryByText('详细信息')).not.toBeInTheDocument();
    });
  });

  describe('展开行测试', () => {
    it('点击行后应显示详情，且详情单元格应跨全部列', () => {
      renderExample();

      fireEvent.click(screen.getByText('张三'));

      const detailCell = screen.getByText('详细信息').closest('td');
      expect(detailCell).not.toBeNull();

      // 7 列（选择 + 姓名 + 邮箱 + 状态 + 金额 + 部门 + 操作）
      expect(detailCell).toHaveAttribute('colspan', '7');
    });

    it('关闭选择列时详情单元格应跨 6 列', () => {
      renderExample({ selectable: false });

      fireEvent.click(screen.getByText('张三'));

      const detailCell = screen.getByText('详细信息').closest('td');
      expect(detailCell).toHaveAttribute('colspan', '6');
    });

    it('详情内容应完整渲染 4 个字段', () => {
      renderExample();

      fireEvent.click(screen.getByText('张三'));

      expect(screen.getByText('详细信息')).toBeInTheDocument();
      expect(screen.getByText('用户ID:')).toBeInTheDocument();
      expect(screen.getByText('部门:')).toBeInTheDocument();
      expect(screen.getByText('注册日期:')).toBeInTheDocument();
      expect(screen.getByText('当前状态:')).toBeInTheDocument();
    });

    it('再次点击行应收起详情', () => {
      renderExample();

      fireEvent.click(screen.getByText('张三'));
      expect(screen.getByText('详细信息')).toBeInTheDocument();

      fireEvent.click(screen.getByText('张三'));
      expect(screen.queryByText('详细信息')).not.toBeInTheDocument();
    });
  });

  describe('选择测试', () => {
    it('勾选行后「已选择」计数应更新', () => {
      renderExample();

      const zhangsanRow = getRowByText('张三');
      const checkbox = within(zhangsanRow).getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByText('已选择').previousSibling).toHaveTextContent('1');
    });
  });
});
