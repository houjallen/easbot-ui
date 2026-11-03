/**
 * Table 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证表格各子组件的渲染与类名
 * 2. 状态测试 - 验证选中态与自定义类名覆盖
 * 3. 交互测试 - 验证点击回调与完整表格结构
 * 4. 无障碍测试 - 验证表格语义角色与 aria 属性
 * 5. 边界测试 - 验证空表体、空表头、caption 缺省等场景
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../table';

describe('Table 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染表格容器与表格', () => {
      render(
        <Table>
          <TableBody />
        </Table>,
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute('data-slot', 'table');
      expect(table).toHaveClass('w-full');
      expect(table).toHaveClass('caption-bottom');
    });

    it('应该正确渲染表格容器', () => {
      render(
        <Table>
          <TableBody />
        </Table>,
      );

      const container = document.querySelector('[data-slot="table-container"]');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('overflow-x-auto');
    });

    it('应该正确渲染表头', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      );

      const header = screen.getByRole('rowgroup');
      expect(header).toHaveAttribute('data-slot', 'table-header');
    });

    it('应该正确渲染表体', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>内容</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      const body = document.querySelector('[data-slot="table-body"]');
      expect(body).toBeInTheDocument();
      expect(body).toHaveClass('[&_tr:last-child]:border-0');
    });

    it('应该正确渲染表尾', () => {
      render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>合计</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      );

      const footer = document.querySelector('[data-slot="table-footer"]');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('bg-muted/50');
    });

    it('应该正确渲染表头单元格', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      );

      const head = screen.getByRole('columnheader', { name: '名称' });
      expect(head).toHaveAttribute('data-slot', 'table-head');
      expect(head).toHaveClass('font-medium');
      expect(head).toHaveClass('text-foreground');
    });

    it('应该正确渲染数据单元格', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>内容</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      const cell = screen.getByRole('cell', { name: '内容' });
      expect(cell).toHaveAttribute('data-slot', 'table-cell');
      expect(cell).toHaveClass('whitespace-nowrap');
      expect(cell).toHaveClass('p-2');
    });

    it('应该正确渲染表格标题', () => {
      render(
        <Table>
          <TableCaption>数据列表</TableCaption>
          <TableBody />
        </Table>,
      );

      const caption = screen.getByText('数据列表');
      expect(caption).toHaveAttribute('data-slot', 'table-caption');
      expect(caption).toHaveClass('text-muted-foreground');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Table className="custom-table">
          <TableBody />
        </Table>,
      );

      const table = screen.getByRole('table');
      expect(table).toHaveClass('custom-table');
      expect(table).toHaveClass('w-full');
    });
  });

  describe('状态测试', () => {
    it('应该正确透传行的 data-state 选中态', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-state="selected">
              <TableCell>选中行</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      const row = screen.getByRole('row');
      expect(row).toHaveAttribute('data-state', 'selected');
    });

    it('应该正确应用行的选中态类名', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-state="selected">
              <TableCell>选中行</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      expect(screen.getByRole('row')).toHaveClass('data-[state=selected]:bg-muted');
    });

    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(
        <TableBody className="custom-body">
          <TableRow>
            <TableCell>内容</TableCell>
          </TableRow>
        </TableBody>,
      );

      const body = document.querySelector('[data-slot="table-body"]');
      expect(body).toHaveClass('custom-body');
    });
  });

  describe('交互测试', () => {
    it('应该在点击行时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(
        <Table>
          <TableBody>
            <TableRow onClick={handleClick}>
              <TableCell>可点击行</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      fireEvent.click(screen.getByRole('cell', { name: '可点击行' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该正确渲染完整的表格结构', () => {
      render(
        <Table>
          <TableCaption>数据列表</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>内容</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>合计</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '名称' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: '内容' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: '合计' })).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 table 语义角色', () => {
      render(
        <Table>
          <TableBody />
        </Table>,
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('应该暴露 columnheader 语义角色', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      );

      expect(screen.getByRole('columnheader', { name: '名称' })).toBeInTheDocument();
    });

    it('应该透传表格的 aria-label 属性', () => {
      render(
        <Table aria-label="用户列表">
          <TableBody />
        </Table>,
      );

      expect(screen.getByRole('table', { name: '用户列表' })).toBeInTheDocument();
    });

    it('应该透传单元格的 scope 属性', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">名称</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      );

      expect(screen.getByRole('columnheader')).toHaveAttribute('scope', 'col');
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的表体', () => {
      render(
        <Table>
          <TableBody />
        </Table>,
      );

      expect(document.querySelector('[data-slot="table-body"]')).toBeEmptyDOMElement();
    });

    it('应该允许渲染不含 caption 的表格', () => {
      render(
        <Table>
          <TableBody />
        </Table>,
      );

      expect(document.querySelector('[data-slot="table-caption"]')).not.toBeInTheDocument();
    });

    it('应该允许渲染没有任何行的表格', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>,
      );

      expect(screen.getAllByRole('row')).toHaveLength(1);
    });

    it('应该允许渲染空字符串的单元格', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>{''}</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      expect(screen.getByRole('cell')).toBeEmptyDOMElement();
    });
  });
});
