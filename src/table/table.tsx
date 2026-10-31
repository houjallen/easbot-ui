import * as React from 'react';
import { cn } from '../utils/classnames';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * 数据表格组件
 *
 * @description
 * 提供结构化数据展示方案，支持以下核心功能：
 * 1. 响应式滚动容器
 * 2. 斑马纹样式支持
 * 3. 表头固定定位
 * 4. 自定义单元格渲染
 * 5. 无障碍访问支持
 */

const tableVariants = cva('w-full caption-bottom text-[var(--table-font-size)]', {
  variants: {
    striped: {
      true: '[&_tbody_tr:nth-child(even)]:bg-[var(--table-row-striped)]',
    },
  },
  defaultVariants: {
    striped: false,
  },
});

interface TableProps extends React.HTMLAttributes<HTMLTableElement>, VariantProps<typeof tableVariants> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, striped, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn(tableVariants({ striped }), className)} {...props} />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b border-[var(--table-border)] bg-[var(--table-header-background)] text-[var(--table-header-foreground)]', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('border-t border-[var(--table-border)] bg-[var(--table-footer-background)] font-medium [&>tr]:last:border-b-0', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

/**
 * 表格标题
 * @param className 自定义类名
 */
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-[var(--table-caption-foreground)]', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b border-[var(--table-border)] transition-colors hover:bg-[var(--table-row-hover)]/50 data-[state=selected]:bg-[var(--table-row-selected)]', className)}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
));
TableCell.displayName = 'TableCell';

// 在文件最后添加类型导出
export type { TableProps };
export type TableHeaderProps = React.ComponentProps<typeof TableHeader>;
export type TableBodyProps = React.ComponentProps<typeof TableBody>;
export type TableFooterProps = React.ComponentProps<typeof TableFooter>;
export type TableHeadProps = React.ComponentProps<typeof TableHead>;
export type TableRowProps = React.ComponentProps<typeof TableRow>;
export type TableCellProps = React.ComponentProps<typeof TableCell>;
export type TableCaptionProps = React.ComponentProps<typeof TableCaption>;

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
