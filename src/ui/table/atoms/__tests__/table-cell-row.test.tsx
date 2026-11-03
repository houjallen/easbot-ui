/**
 * TableCell / TableRow 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证单元格与行的语义结构与类名
 * 2. 状态测试 - 验证 th/td、对齐、固定、截断、选中 / 展开等状态差异
 * 3. 交互测试 - 验证行点击回调与复选框点击的屏蔽逻辑
 * 4. 无障碍测试 - 验证语义角色与 data-* 属性透传
 *
 * 测试载体说明：
 * `TableCell` **不依赖** `TableProvider`；`TableRow` 内部调用 `useTableConfig()`，
 * 因此所有涉及 `TableRow` 的用例都在真实 `TableProvider` 下渲染。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import { TableCell } from '../TableCell';
import { TableRow } from '../TableRow';

/**
 * 渲染助手 —— 统一包一层 TableProvider（TableRow 需要表格配置上下文）
 */
const renderTableRow = (ui: React.ReactElement, config?: Record<string, unknown>) => render(<TableProvider config={config as never}>{ui}</TableProvider>);

describe('TableCell 与 TableRow 组件', () => {
  describe('渲染测试', () => {
    it('应该默认渲染为数据单元格', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell>单元格内容</TableCell>
            </tr>
          </tbody>
        </table>,
      );

      const cell = screen.getByRole('cell', { name: '单元格内容' });
      expect(cell.tagName).toBe('TD');
      expect(cell).toHaveClass('eas-table-cell');
    });

    it('应该渲染为表头单元格', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableCell as="th">列名</TableCell>
            </tr>
          </thead>
        </table>,
      );

      const cell = screen.getByRole('columnheader', { name: '列名' });
      expect(cell.tagName).toBe('TH');
      expect(cell).toHaveClass('eas-table-cell');
    });

    it('应该渲染行容器与扩展类名', () => {
      const { container } = renderTableRow(
        <table>
          <tbody>
            <TableRow className="custom-row">
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      const row = container.querySelector('.eas-table-row');
      expect(row).toBeInTheDocument();
      expect(row).toHaveClass('custom-row');
    });

    it('应该渲染单元格与行的子内容', () => {
      renderTableRow(
        <table>
          <tbody>
            <TableRow>
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      expect(screen.getByRole('cell', { name: '单元格内容' })).toBeInTheDocument();
      expect(screen.getByRole('row')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该根据对齐方式切换文本对齐样式', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell align="center">居中</TableCell>
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByRole('cell', { name: '居中' })).toHaveClass('text-center');
    });

    it('应该在固定列时添加粘性定位样式', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell fixed="left">固定列</TableCell>
            </tr>
          </tbody>
        </table>,
      );

      const cell = screen.getByRole('cell', { name: '固定列' });
      expect(cell).toHaveClass('sticky', 'bg-background', 'left-0', 'z-10');
    });

    it('应该在截断开启时添加截断样式', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell ellipsis>截断内容</TableCell>
            </tr>
          </tbody>
        </table>,
      );

      const cell = screen.getByRole('cell', { name: '截断内容' });
      expect(cell).toHaveClass('max-w-0', 'truncate');
      expect(cell.querySelector('.truncate')).toBeInTheDocument();
    });

    it('应该把选中与展开状态写入 data 属性', () => {
      const { container } = renderTableRow(
        <table>
          <tbody>
            <TableRow selected expanded index={2}>
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      const row = container.querySelector('.eas-table-row');
      expect(row).toHaveAttribute('data-selected', 'true');
      expect(row).toHaveAttribute('data-expanded', 'true');
      expect(row).toHaveAttribute('data-index', '2');
    });

    it('应该在可点击状态下添加交互样式', () => {
      const { container } = renderTableRow(
        <table>
          <tbody>
            <TableRow clickable>
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      const row = container.querySelector('.eas-table-row');
      expect(row).toHaveClass('cursor-pointer', 'select-none');
    });

    it('应该在悬停状态下添加过渡动画样式', () => {
      const { container } = renderTableRow(
        <table>
          <tbody>
            <TableRow hoverable>
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      const row = container.querySelector('.eas-table-row');
      expect(row).toHaveClass('transition-all', 'duration-200');
    });
  });

  describe('交互测试', () => {
    it('应该在点击行时触发点击回调', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderTableRow(
        <table>
          <tbody>
            <TableRow clickable onClick={onClick}>
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      await user.click(screen.getByRole('cell', { name: '单元格内容' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('应该在点击行内复选框时不触发行点击回调', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderTableRow(
        <table>
          <tbody>
            <TableRow clickable onClick={onClick}>
              <TableCell>
                <input type="checkbox" aria-label="选择行" />
              </TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      await user.click(screen.getByRole('checkbox', { name: '选择行' }));

      // 行点击回调会屏蔽来自复选框的点击，避免选中态被重复切换
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该透传单元格的 data-slot 属性', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell>单元格内容</TableCell>
            </tr>
          </tbody>
        </table>,
      );

      expect(container.querySelector('[data-slot="table-cell"]')).toBeInTheDocument();
    });

    it('应该把表头单元格的 data-slot 标记为 table-head', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableCell as="th">列名</TableCell>
            </tr>
          </thead>
        </table>,
      );

      expect(container.querySelector('[data-slot="table-head"]')).toBeInTheDocument();
    });

    it('应该透传行的 data-slot 属性与额外 DOM 属性', () => {
      const { container } = renderTableRow(
        <table>
          <tbody>
            <TableRow aria-label="数据行">
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      const row = container.querySelector('[data-slot="table-row"]');
      expect(row).toBeInTheDocument();
      expect(row).toHaveAttribute('aria-label', '数据行');
    });

    it('应该渲染正确的行语义角色', () => {
      renderTableRow(
        <table>
          <tbody>
            <TableRow>
              <TableCell>单元格内容</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );

      expect(screen.getByRole('row')).toBeInTheDocument();
    });
  });
});
