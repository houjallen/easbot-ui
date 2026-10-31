import { render, screen } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

describe('Table 组件', () => {
  test('应正确渲染基础表格', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>内容</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('应应用斑马纹样式', () => {
    const { container } = render(
      <Table striped>
        <TableBody>
          <TableRow data-testid="row1" />
          <TableRow data-testid="row2" />
        </TableBody>
      </Table>,
    );
    // Tailwind v4：斑马纹通过 table 上的后代选择器实现（而非行上的 even:bg-*）
    expect(container.querySelector('table')).toHaveClass('[&_tbody_tr:nth-child(even)]:bg-[var(--table-row-striped)]');
  });

  test('应支持固定表头', () => {
    render(<TableHeader className="sticky top-0" />);
    expect(screen.getByRole('rowgroup')).toHaveClass('sticky');
  });
});
