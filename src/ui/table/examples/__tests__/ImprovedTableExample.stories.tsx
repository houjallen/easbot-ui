/**
 * ImprovedTable 组件 Storybook 示例
 * 展示改进后的表格组件，与设计系统保持一致的实现
 */

import { cn } from '../../../../utils/classnames';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from 'storybook/test';
// 导入Table用于Interactive示例
import { BaseTable } from '../../index';
import type { TableColumn } from '../../index';
import { TableProvider } from '../../context/TableContext';
import { AllImprovedExamples, ImprovedTableExample, ScrollAndStickyExample, SizeAndDensityExample, TableStatesExample } from '../ImprovedTableExample';

/**
 * 示例数据（与 ImprovedTableExample 内部数据保持一致）
 * BaseTable 的数据来自 TableContext 上下文，Provider 的 data 需与示例渲染的数据一致
 */
const improvedInvoices = [
  { id: 1, invoice: 'INV001', customer: '张三', paymentStatus: 'paid', totalAmount: '¥250.00', createTime: '2024-01-15', department: '销售部' },
  { id: 2, invoice: 'INV002', customer: '李四', paymentStatus: 'pending', totalAmount: '¥150.00', createTime: '2024-01-20', department: '技术部' },
  { id: 3, invoice: 'INV003', customer: '王五', paymentStatus: 'paid', totalAmount: '¥350.00', createTime: '2024-01-25', department: '市场部' },
  { id: 4, invoice: 'INV004', customer: '赵六', paymentStatus: 'failed', totalAmount: '¥450.00', createTime: '2024-02-01', department: '财务部' },
  { id: 5, invoice: 'INV005', customer: '钱七', paymentStatus: 'pending', totalAmount: '¥120.00', createTime: '2024-02-05', department: '人事部' },
];

/** 列配置（展示实际支持的功能） */
const improvedColumns: TableColumn[] = [
  { name: 'invoice', title: '发票编号', dataIndex: 'invoice', width: 150, ellipsis: true },
  { name: 'customer', title: '客户', dataIndex: 'customer', width: 120, align: 'left' },
  {
    name: 'department',
    title: '部门',
    dataIndex: 'department',
    width: 100,
    align: 'center',
    render: (value) => <span className="rounded bg-blue-50 px-2 py-1 text-blue-600 text-xs">{(value as string) || '未分配'}</span>,
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
        pending: { label: '待支付', className: 'bg-yellow-100 text-yellow-800' },
        failed: { label: '支付失败', className: 'bg-red-100 text-red-800' },
      };
      const status = statusMap[value as keyof typeof statusMap];
      return <span className={cn('rounded-full px-2 py-1 font-medium text-xs ', status.className)}>{status.label}</span>;
    },
  },
  { name: 'totalAmount', title: '金额', dataIndex: 'totalAmount', width: 120, align: 'right', className: 'font-mono' },
  {
    name: 'createTime',
    title: '创建时间',
    dataIndex: 'createTime',
    width: 120,
    ellipsis: true,
    render: (value) => <span className="text-gray-600 text-xs">{value as string}</span>,
  },
];

/**
 * 包裹 TableProvider 的渲染辅助
 * BaseTable 依赖 TableContext 提供的配置与状态，必须有 Provider 祖先
 */
const withProvider = (children: ReactNode) => (
  <TableProvider
    data={improvedInvoices}
    columns={improvedColumns}
    config={{
      i18n: { locale: 'zh-CN' },
      rowKey: 'id',
      dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
    }}
  >
    {children}
  </TableProvider>
);

const meta: Meta<typeof ImprovedTableExample> = {
  title: 'EASAI/Table/ImprovedTable',
  component: ImprovedTableExample,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 改进后的表格组件示例

展示与设计系统更好兼容的结构和Table组件实际支持的功能：

### ✅ 实际支持的功能
- \`data-slot\` 属性，与设计系统保持一致
- 简化的单元格内容结构
- Schema兼容的字段命名（name, align, visible）
- 文本截断功能（ellipsis）
- 自定义渲染函数
- 自定义CSS类名和样式
- 嵌套属性访问支持
- 行点击和双击事件

### 使用场景
适用于需要展示业务数据（如发票、订单等）的场景，提供完整的表格功能和良好的用户体验。
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImprovedTableExample>;

/**
 * 基础改进示例
 * 展示最常用的功能配置和发票数据展示
 */
export const Basic: Story = {
  name: '基础改进示例',
  render: () => withProvider(<ImprovedTableExample />),
  parameters: {
    docs: {
      description: {
        story: '展示基础的表格功能，包括数据展示、状态渲染、自定义样式等核心特性。',
      },
    },
  },
};

/**
 * 尺寸和密度控制
 * 展示不同的表格尺寸和密度配置
 */
export const SizeAndDensity: Story = {
  name: '尺寸和密度示例',
  render: () => withProvider(<SizeAndDensityExample />),
  parameters: {
    docs: {
      description: {
        story: '演示表格的不同尺寸（sm/md/lg）和密度（compact/comfortable）配置效果。',
      },
    },
  },
};

/**
 * 表格状态展示
 * 展示加载、空数据、错误等状态
 */
export const TableStates: Story = {
  name: '表格状态示例',
  render: () => withProvider(<TableStatesExample />),
  parameters: {
    docs: {
      description: {
        story: '展示表格在不同状态下的表现：加载中、空数据、错误状态。',
      },
    },
  },
};

/**
 * 滚动和粘性表头
 * 展示滚动配置和粘性表头功能
 */
export const ScrollAndSticky: Story = {
  name: '滚动和粘性表头',
  render: () => withProvider(<ScrollAndStickyExample />),
  parameters: {
    docs: {
      description: {
        story: '演示表格的水平/垂直滚动功能和粘性表头特性，适用于大量数据展示。',
      },
    },
  },
};

/**
 * 完整功能集合
 * 展示所有改进后的表格功能
 */
export const AllFeatures: Story = {
  name: '完整功能集合',
  render: () => withProvider(<AllImprovedExamples />),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: '完整展示所有改进后的表格功能和使用场景。',
      },
    },
  },
};

/**
 * 可交互的基础示例
 * 支持通过Controls面板调整参数
 */
export const Interactive: Story = {
  name: '可交互示例',
  args: {
    bordered: true,
    striped: false,
    size: 'md',
    density: 'comfortable',
    loading: false,
    showHeader: true,
  },
  argTypes: {
    bordered: {
      control: 'boolean',
      description: '是否显示边框',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    striped: {
      control: 'boolean',
      description: '是否显示条纹',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '表格尺寸',
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
      },
    },
    density: {
      control: 'select',
      options: ['compact', 'comfortable'],
      description: '表格密度',
      table: {
        type: { summary: "'compact' | 'comfortable'" },
        defaultValue: { summary: "'comfortable'" },
      },
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    showHeader: {
      control: 'boolean',
      description: '是否显示表头',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
  render: (args: any) => {
    // 使用固定的测试数据
    const testData = [
      {
        id: 1,
        invoice: 'INV001',
        customer: '张三',
        paymentStatus: 'paid' as const,
        totalAmount: '¥250.00',
        createTime: '2024-01-15',
        department: '销售部',
      },
      {
        id: 2,
        invoice: 'INV002',
        customer: '李四',
        paymentStatus: 'pending' as const,
        totalAmount: '¥150.00',
        createTime: '2024-01-20',
        department: '技术部',
      },
      {
        id: 3,
        invoice: 'INV003',
        customer: '王五',
        paymentStatus: 'failed' as const,
        totalAmount: '¥350.00',
        createTime: '2024-01-25',
        department: '市场部',
      },
    ];

    const testColumns: TableColumn[] = [
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
        name: 'department',
        title: '部门',
        dataIndex: 'department',
        width: 100,
        align: 'center' as const,
      },
      {
        name: 'paymentStatus',
        title: '支付状态',
        dataIndex: 'paymentStatus',
        width: 120,
        align: 'center' as const,
        render: (value: any) => {
          const statusMap = {
            paid: { label: '已支付', className: 'bg-green-100 text-green-800' },
            pending: {
              label: '待支付',
              className: 'bg-yellow-100 text-yellow-800',
            },
            failed: { label: '支付失败', className: 'bg-red-100 text-red-800' },
          };
          const status = statusMap[value as keyof typeof statusMap];
          return <span className={cn('rounded-full px-2 py-1 font-medium text-xs', status.className)}>{status.label}</span>;
        },
      },
      {
        name: 'totalAmount',
        title: '金额',
        dataIndex: 'totalAmount',
        width: 120,
        align: 'right' as const,
      },
    ];

    return (
      <div className="p-6">
        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-lg">可交互的改进表格示例</h3>
          <p className="text-gray-600 text-sm">使用Controls面板调整表格参数，观察不同配置的效果</p>
        </div>

        <div className="rounded-md border">
          <TableProvider
            data={args.loading ? [] : testData}
            columns={testColumns}
            loading={args.loading}
            config={{
              i18n: { locale: 'zh-CN' },
              size: args.size,
              density: args.density,
              bordered: args.bordered,
              striped: args.striped,
              showHeader: args.showHeader,
            }}
          >
            <BaseTable columns={testColumns} data={args.loading ? [] : testData} rowKey="id" onRowClick={fn()} />
          </TableProvider>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '通过Controls面板可以实时调整表格的各种参数，观察不同配置下的表现效果。',
      },
    },
  },
};
