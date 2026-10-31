import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table';
import React from 'react';

const meta: Meta<typeof Table> = {
  title: 'EASAI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: '已支付',
    totalAmount: '¥250.00',
    paymentMethod: '支付宝',
  },
  {
    invoice: 'INV002',
    paymentStatus: '待支付',
    totalAmount: '¥150.00',
    paymentMethod: '微信支付',
  },
  {
    invoice: 'INV003',
    paymentStatus: '待支付',
    totalAmount: '¥350.00',
    paymentMethod: '银行卡',
  },
  {
    invoice: 'INV004',
    paymentStatus: '已支付',
    totalAmount: '¥450.00',
    paymentMethod: '支付宝',
  },
  {
    invoice: 'INV005',
    paymentStatus: '已支付',
    totalAmount: '¥550.00',
    paymentMethod: '微信支付',
  },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>近期交易记录</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>发票编号</TableHead>
          <TableHead>支付状态</TableHead>
          <TableHead>支付方式</TableHead>
          <TableHead className="text-right">金额</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>总计</TableCell>
          <TableCell className="text-right">¥1,750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// 斑马纹表格示例
export const ZebraStriping: Story = {
  render: () => (
    <Table striped={true}>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead>发票编号</TableHead>
          <TableHead>支付状态</TableHead>
          <TableHead>支付方式</TableHead>
          <TableHead className="text-right">金额</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>总计</TableCell>
          <TableCell className="text-right">¥1,750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// 可排序表格示例
export const SortableTable: Story = {
  render: () => {
    type SortableKey = keyof (typeof invoices)[0];

    // 使用状态管理排序字段和排序方向
    const [sortConfig, setSortConfig] = React.useState<{
      key: SortableKey;
      direction: 'asc' | 'desc';
    }>({ key: 'invoice', direction: 'asc' });

    // 处理排序点击
    const handleSort = (key: SortableKey) => {
      setSortConfig((prevConfig) => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
      }));
    };

    // 根据排序配置对数据进行排序
    const sortedData = React.useMemo(() => {
      const sortableData = [...invoices];
      sortableData.sort((a, b) => {
        // 处理金额特殊情况
        if (sortConfig.key === 'totalAmount') {
          const aValue = Number(a.totalAmount.slice(1));
          const bValue = Number(b.totalAmount.slice(1));
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // 处理其他字符串字段
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      return sortableData;
    }, [sortConfig]);

    // 生成排序指示器
    const getSortIndicator = (key: SortableKey) => {
      if (sortConfig.key !== key) return null;
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    return (
      <Table striped={true}>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('invoice')} className="cursor-pointer hover:bg-muted/20 transition-colors">
              发票编号 {getSortIndicator('invoice')}
            </TableHead>
            <TableHead onClick={() => handleSort('paymentStatus')} className="cursor-pointer hover:bg-muted/20 transition-colors">
              支付状态 {getSortIndicator('paymentStatus')}
            </TableHead>
            <TableHead onClick={() => handleSort('paymentMethod')} className="cursor-pointer hover:bg-muted/20 transition-colors">
              支付方式 {getSortIndicator('paymentMethod')}
            </TableHead>
            <TableHead className="text-right cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => handleSort('totalAmount')}>
              金额 {getSortIndicator('totalAmount')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};
