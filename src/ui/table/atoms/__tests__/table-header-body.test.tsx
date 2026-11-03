/**
 * TableHeader / TableBody 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证表头 / 表体的语义结构与类名
 * 2. 状态测试 - 验证粘性表头、最小高度等状态差异
 * 3. 交互测试 - 验证子内容在表头 / 表体中的交互透传
 * 4. 无障碍测试 - 验证语义角色与 DOM 属性透传
 *
 * 测试载体说明：
 * `TableHeader` / `TableBody` **不依赖** `TableProvider`，
 * 因此本文件直接渲染组件本体。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableBody } from '../TableBody';
import { TableHeader } from '../TableHeader';

describe('TableHeader 与 TableBody 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染表头容器与扩展类名', () => {
      const { container } = render(<TableHeader className="custom-header">表头内容</TableHeader>);

      const header = container.querySelector('.eas-table-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('custom-header');
      expect(header?.tagName).toBe('THEAD');
    });

    it('应该渲染表体容器与扩展类名', () => {
      const { container } = render(<TableBody className="custom-body">表体内容</TableBody>);

      const body = container.querySelector('.eas-table-body');
      expect(body).toBeInTheDocument();
      expect(body).toHaveClass('custom-body');
      expect(body?.tagName).toBe('TBODY');
    });

    it('应该渲染表头与表体的子内容', () => {
      render(
        <table>
          <TableHeader>
            <tr>
              <th>列名</th>
            </tr>
          </TableHeader>
          <TableBody>
            <tr>
              <td>单元格</td>
            </tr>
          </TableBody>
        </table>,
      );

      expect(screen.getByText('列名')).toBeInTheDocument();
      expect(screen.getByText('单元格')).toBeInTheDocument();
    });

    it('应该给表体添加最后一行去边框的样式', () => {
      const { container } = render(<TableBody>表体内容</TableBody>);

      const body = container.querySelector('.eas-table-body');
      expect(body).toHaveClass('[&_tr:last-child]:border-0');
    });
  });

  describe('状态测试', () => {
    it('应该在非粘性状态下不添加粘性样式', () => {
      const { container } = render(<TableHeader>表头内容</TableHeader>);

      const header = container.querySelector('.eas-table-header');
      expect(header).not.toHaveClass('sticky');
      expect(header?.getAttribute('style')).toBeNull();
    });

    it('应该在粘性状态下添加粘性样式与偏移量', () => {
      const { container } = render(
        <TableHeader stickyHeader stickyHeaderOffset={48}>
          表头内容
        </TableHeader>,
      );

      const header = container.querySelector('.eas-table-header');
      expect(header).toHaveClass('sticky', 'z-20', 'shadow-sm');
      expect(header).toHaveStyle({ top: '48px' });
    });

    it('应该在表体设置最小高度时写入内联样式', () => {
      const { container } = render(<TableBody minHeight={120}>表体内容</TableBody>);

      const body = container.querySelector('.eas-table-body');
      expect(body).toHaveStyle({ minHeight: '120px' });
    });

    it('应该保留调用方传入的内联样式', () => {
      const { container } = render(<TableBody style={{ backgroundColor: 'rgb(1, 2, 3)' }}>表体内容</TableBody>);

      const body = container.querySelector('.eas-table-body');
      expect(body).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)' });
    });
  });

  describe('交互测试', () => {
    it('应该透传表头子元素的点击回调', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <table>
          <TableHeader>
            <tr>
              <th>
                <button type="button" onClick={onClick}>
                  表头操作
                </button>
              </th>
            </tr>
          </TableHeader>
        </table>,
      );

      await user.click(screen.getByRole('button', { name: '表头操作' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('应该透传表体子元素的点击回调', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <table>
          <TableBody>
            <tr>
              <td>
                <button type="button" onClick={onClick}>
                  表体操作
                </button>
              </td>
            </tr>
          </TableBody>
        </table>,
      );

      await user.click(screen.getByRole('button', { name: '表体操作' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该渲染表头行分组语义', () => {
      render(
        <table>
          <TableHeader>
            <tr>
              <th scope="col">列名</th>
            </tr>
          </TableHeader>
        </table>,
      );

      expect(screen.getByRole('rowgroup')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '列名' })).toBeInTheDocument();
    });

    it('应该渲染表体行分组与单元格语义', () => {
      render(
        <table>
          <TableBody>
            <tr>
              <td>单元格</td>
            </tr>
          </TableBody>
        </table>,
      );

      expect(screen.getByRole('rowgroup')).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: '单元格' })).toBeInTheDocument();
    });

    it('应该透传 data-slot 属性标识组件', () => {
      const { container } = render(
        <table>
          <TableHeader>
            <tr>
              <th>列名</th>
            </tr>
          </TableHeader>
          <TableBody>
            <tr>
              <td>单元格</td>
            </tr>
          </TableBody>
        </table>,
      );

      expect(container.querySelector('[data-slot="table-header"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="table-body"]')).toBeInTheDocument();
    });
  });
});
