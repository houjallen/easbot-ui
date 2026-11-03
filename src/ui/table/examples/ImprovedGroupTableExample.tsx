/**
 * 改进的分组表格示例
 * 解决展开位置、复选框大小、全选按钮等问题
 */

import { cn } from '../../../utils/classnames';
import React, { useState, useCallback } from 'react';
import type { TableColumn } from '../index';

// 示例数据类型
interface Invoice {
  readonly id: number;
  readonly invoice: string;
  readonly customer: string;
  readonly paymentStatus: 'paid' | 'pending' | 'failed';
  readonly totalAmount: string;
  readonly email: string;
  readonly phone?: string;
  readonly address?: string;
  readonly [key: string]: any;
}

// 示例数据
const invoices: Invoice[] = [
  {
    id: 1,
    invoice: 'INV001',
    customer: '张三',
    paymentStatus: 'paid',
    totalAmount: '¥250.00',
    email: 'zhangsan@example.com',
    phone: '138-0000-0001',
    address: '北京市朝阳区xxx街道',
  },
  {
    id: 2,
    invoice: 'INV002',
    customer: '李四',
    paymentStatus: 'pending',
    totalAmount: '¥150.00',
    email: 'lisi@example.com',
    phone: '138-0000-0002',
    address: '上海市浦东新区xxx路',
  },
  {
    id: 3,
    invoice: 'INV003',
    customer: '王五',
    paymentStatus: 'paid',
    totalAmount: '¥350.00',
    email: 'wangwu@example.com',
    phone: '138-0000-0003',
    address: '深圳市南山区xxx大道',
  },
  {
    id: 4,
    invoice: 'INV004',
    customer: '赵六',
    paymentStatus: 'pending',
    totalAmount: '¥450.00',
    email: 'zhaoliu@example.com',
    phone: '138-0000-0004',
    address: '广州市天河区xxx街',
  },
];

export function ImprovedGroupTableExample({
  columns: externalColumns,
  data: externalData,
  rowKey = 'id',
  size = 'md',
  density = 'comfortable',
  bordered = true,
  ...otherProps
}: {
  columns?: TableColumn[];
  data?: Invoice[];
  rowKey?: string;
  size?: 'sm' | 'md' | 'lg';
  density?: 'compact' | 'comfortable';
  bordered?: boolean;
  [key: string]: any;
} = {}) {
  // 使用外部传入的数据或默认数据
  const tableData = externalData || invoices;

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  // 全选逻辑
  const isAllSelected = selectedRowKeys.length === tableData.length;
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < tableData.length;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(tableData.map((item) => item.id));
    }
  }, [isAllSelected, tableData]);

  const handleSelectRow = useCallback((id: number) => {
    setSelectedRowKeys((prev) => {
      if (prev.includes(id)) {
        return prev.filter((key) => key !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleExpandRow = useCallback((id: number) => {
    setExpandedRowKeys((prev) => {
      if (prev.includes(id)) {
        return prev.filter((key) => key !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // 展开内容渲染函数
  const renderExpandedRow = useCallback((record: Invoice) => {
    return (
      <tr className="eas-table-expanded-content">
        <td colSpan={7}>
          <div className="eas-table-expanded-detail">
            <h4 className="mb-2 font-medium">发票详情</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>发票编号:</strong> {record.invoice}
              </div>
              <div>
                <strong>客户:</strong> {record.customer}
              </div>
              <div>
                <strong>邮箱:</strong> {record.email}
              </div>
              <div>
                <strong>电话:</strong> {record.phone}
              </div>
              <div>
                <strong>地址:</strong> {record.address}
              </div>
              <div>
                <strong>支付状态:</strong> {record.paymentStatus === 'paid' ? '已支付' : '待支付'}
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }, []);

  // 列配置 - 使用外部传入的或默认配置
  const defaultColumns: TableColumn[] = [
    {
      name: 'selection',
      dataIndex: 'selection',
      title: '',
      width: 50,
      render: (_, record) => <input type="checkbox" checked={selectedRowKeys.includes(record.id)} onChange={() => handleSelectRow(record.id)} className="cursor-pointer" />,
    },
    {
      name: 'expand',
      dataIndex: 'expand',
      title: '',
      width: 50,
      render: (_, record) => {
        const isExpanded = expandedRowKeys.includes(record.id);
        return (
          <button
            type="button"
            onClick={() => handleExpandRow(record.id)}
            className={cn('eas-table-expand-btn', 'relative inline-flex items-center justify-center', 'h-5 w-5 rounded transition-transform', 'hover:bg-muted', { expanded: isExpanded })}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        );
      },
    },
    {
      name: 'invoice',
      title: '发票编号',
      dataIndex: 'invoice',
      width: 150,
    },
    {
      name: 'customer',
      title: '客户',
      dataIndex: 'customer',
      width: 120,
    },
    {
      name: 'paymentStatus',
      title: '支付状态',
      dataIndex: 'paymentStatus',
      width: 120,
      align: 'center',
      render: (value) => {
        const statusMap = {
          paid: { label: '已支付', className: 'bg-green-100 text-green-800' },
          pending: {
            label: '待支付',
            className: 'bg-yellow-100 text-yellow-800',
          },
          failed: { label: '支付失败', className: 'bg-red-100 text-red-800' },
        };

        const status = statusMap[value as keyof typeof statusMap];

        return <span className={`rounded-full px-2 py-1 text-xs ${status.className}`}>{status.label}</span>;
      },
    },
    {
      name: 'totalAmount',
      title: '金额',
      dataIndex: 'totalAmount',
      width: 120,
      align: 'right',
    },
    {
      name: 'actions',
      dataIndex: 'id',
      title: '操作',
      width: 180,
      align: 'center',
      render: () => (
        <div className="flex justify-center gap-1">
          <button type="button" className="rounded p-1 hover:bg-muted">
            👁️
          </button>
          <button type="button" className="rounded p-1 hover:bg-muted">
            ✏️
          </button>
          <button type="button" className="rounded p-1 hover:bg-muted">
            📋
          </button>
          <button type="button" className="rounded p-1 hover:bg-muted">
            🗑️
          </button>
        </div>
      ),
    },
  ];

  // 使用外部传入的列配置或默认配置
  const columns = externalColumns || defaultColumns;

  // 自定义表格组件，支持展开行
  const CustomTable = () => (
    <div className={cn('rounded-md', bordered && 'border')}>
      <div data-slot="table-container" className={cn('eas-table-container relative w-full', `eas-table-${size}`, `eas-table-${density}`, bordered && 'eas-table-bordered')}>
        <table data-slot="table" className="eas-table w-full table-fixed caption-bottom border-collapse border-spacing-0 text-sm">
          <thead data-slot="table-header" className="eas-table-header [&_tr]:border-b">
            <tr data-slot="table-row" className="eas-table-row border-b transition-colors hover:bg-muted/50">
              {/* 全选列 */}
              <th data-slot="table-head" className="eas-table-cell h-10 whitespace-nowrap border-b px-2 text-left align-middle font-medium text-foreground" style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isIndeterminate;
                    }
                  }}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              {/* 其他列头 */}
              {columns.slice(1).map((column, index) => (
                <th
                  key={column.name}
                  data-slot="table-head"
                  className={cn('eas-table-cell h-10 whitespace-nowrap border-b px-2 align-middle font-medium text-foreground', {
                    'text-left': column.align === 'left' || !column.align,
                    'text-center': column.align === 'center',
                    'text-right': column.align === 'right',
                  })}
                  style={{ width: `${column.width}px` }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-slot="table-body" className="eas-table-body [&_tr:last-child]:border-0">
            {' '}
            {tableData.map((record, index) => {
              const isSelected = selectedRowKeys.includes(record.id);
              const isExpanded = expandedRowKeys.includes(record.id);

              return (
                <React.Fragment key={record.id}>
                  {/* 主要数据行 */}
                  <tr
                    data-slot="table-row"
                    className={cn('eas-table-row cursor-pointer select-none border-b transition-colors hover:bg-muted/50', {
                      'bg-muted/50': isSelected,
                      'bg-muted/30': isExpanded && !isSelected,
                    })}
                    data-index={index}
                    data-selected={isSelected}
                    data-expanded={isExpanded}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.name}
                        data-slot="table-cell"
                        className={cn('eas-table-cell whitespace-nowrap border-b p-2 align-middle', {
                          'text-left': column.align === 'left' || !column.align,
                          'text-center': column.align === 'center',
                          'text-right': column.align === 'right',
                        })}
                        style={{ width: `${column.width}px` }}
                      >
                        {column.render ? column.render(record[column.dataIndex || ''], record, index) : record[column.dataIndex || '']}
                      </td>
                    ))}
                  </tr>
                  {/* 展开行 */}
                  {isExpanded && renderExpandedRow(record)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">改进的分组表格示例</h2>
        <p className="text-muted-foreground text-sm">解决了展开位置、复选框大小、全选按钮等问题</p>
      </div>

      {/* 状态显示 */}
      <div className="grid grid-cols-4 gap-4 rounded-lg bg-blue-50 p-4">
        <div className="text-center">
          <div className="font-bold text-2xl text-blue-600">{tableData.length}</div>
          <div className="text-blue-600 text-sm">总记录</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-2xl text-green-600">{selectedRowKeys.length}</div>
          <div className="text-green-600 text-sm">已选择</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-2xl text-purple-600">{expandedRowKeys.length}</div>
          <div className="text-purple-600 text-sm">已展开</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-2xl text-orange-600">0</div>
          <div className="text-orange-600 text-sm">加载中</div>
        </div>
      </div>

      {/* 改进的表格 */}
      <CustomTable />

      <div className="mt-4 rounded-lg bg-green-50 p-4">
        <h4 className="mb-2 font-medium text-green-900">✅ 已解决的问题：</h4>
        <div className="space-y-1 text-green-800 text-sm">
          <div>
            • <strong>展开位置</strong>：展开内容现在正确插入到表格行之间
          </div>
          <div>
            • <strong>复选框大小</strong>：调整为16px，并优化了样式
          </div>
          <div>
            • <strong>全选按钮</strong>：在表头第一列添加全选/取消全选功能
          </div>
          <div>
            • <strong>半选状态</strong>：支持部分选中的中间状态显示
          </div>
          <div>
            • <strong>展开动画</strong>：添加了平滑的展开/收起动画效果
          </div>
        </div>
      </div>
    </div>
  );
}
