/**
 * 虚拟滚动表格使用示例
 * 演示如何使用TableVirtualView组件和虚拟滚动配置
 */

import { EnhancedTable } from '../index';
import { TableProvider } from '../context/TableContext';
import type { TableColumn } from '../types';
import type { TableConfig } from '../types';
import React, { useMemo } from 'react';

// 生成大量测试数据
const generateLargeDataset = (count = 10000) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `用户 ${index + 1}`,
    email: `user${index + 1}@example.com`,
    age: Math.floor(Math.random() * 50) + 20,
    department: ['技术部', '产品部', '运营部', '市场部'][Math.floor(Math.random() * 4)],
    salary: Math.floor(Math.random() * 50000) + 50000,
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    status: ['在职', '离职', '试用'][Math.floor(Math.random() * 3)],
  }));
};

// 表格列配置
const columns: TableColumn[] = [
  {
    name: 'id',
    dataIndex: 'id',
    title: 'ID',
    width: 80,
    sortable: true,
  },
  {
    name: 'name',
    dataIndex: 'name',
    title: '姓名',
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    name: 'email',
    dataIndex: 'email',
    title: '邮箱',
    width: 200,
    sortable: true,
  },
  {
    name: 'age',
    dataIndex: 'age',
    title: '年龄',
    width: 80,
    sortable: true,
    align: 'center',
  },
  {
    name: 'department',
    dataIndex: 'department',
    title: '部门',
    width: 120,
    filterable: true,
  },
  {
    name: 'salary',
    dataIndex: 'salary',
    title: '薪资',
    width: 120,
    sortable: true,
    align: 'right',
    render: (value: number) => `¥${value.toLocaleString()}`,
  },
  {
    name: 'joinDate',
    dataIndex: 'joinDate',
    title: '入职日期',
    width: 120,
    dataType: 'date',
    sortable: true,
  },
  {
    name: 'status',
    dataIndex: 'status',
    title: '状态',
    width: 100,
    filterable: true,
    render: (value: string) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
          value === '在职' ? 'bg-green-100 text-green-800' : value === '试用' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {value}
      </span>
    ),
  },
];

/**
 * 虚拟滚动表格示例组件
 */
export const VirtualScrollExample: React.FC = () => {
  // 生成大量数据
  const data = useMemo(() => generateLargeDataset(10000), []);

  // 表格配置
  const tableConfig: TableConfig = {
    // 启用虚拟滚动显示模式
    displayMode: 'virtual',

    // 虚拟滚动配置
    virtualization: {
      height: 600, // 容器高度
      overscanCount: 10, // 预渲染行数
      threshold: 100, // 启用虚拟滚动的最小数据量
    },

    // 基础配置
    rowKey: 'id',
    size: 'md',
    density: 'default',
    bordered: true,
    striped: true,
    hoverable: true,
    stickyHeader: true,
    fillContainer: true,

    // 功能配置
    sortable: true,
    filterable: true,
    selectable: true,
    resizeable: true,

    // 分页配置（虚拟滚动通常不需要分页）
    paginable: false,

    // 选择配置
    selection: {
      type: 'multiple',
    },

    // 滚动配置
    scroll: {
      x: 1000,
      y: 600,
    },
  };

  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">虚拟滚动表格示例</h2>
        <p className="text-muted-foreground">演示包含 {data.length.toLocaleString()} 条数据的虚拟滚动表格，支持排序、筛选、选择等功能</p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <TableProvider columns={columns} config={tableConfig} data={data}>
          <EnhancedTable
            onRowClick={(record, index) => {
              console.log('行点击:', record, index);
            }}
            onRowDoubleClick={(record, index) => {
              console.log('行双击:', record, index);
            }}
            className="h-[600px]"
          />
        </TableProvider>
      </div>

      <div className="text-muted-foreground text-sm">
        <p>性能提示：</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>虚拟滚动只渲染可见区域的行，大幅提升大数据量表格的性能</li>
          <li>支持动态行高和固定表头</li>
          <li>预渲染机制确保滚动流畅性</li>
          <li>自动启用阈值：当数据量超过 {tableConfig.virtualization?.threshold} 条时启用虚拟滚动</li>
        </ul>
      </div>
    </div>
  );
};

export default VirtualScrollExample;
