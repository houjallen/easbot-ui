// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Badge } from '../../../badge';
import { Button } from '../../../button';
import { BaseTable, TableBody, TableCell, TableContainer, TableGrid, TableHeader, TableRow } from '../../index';
import type { TableColumn } from '../../index';
import { TableProvider } from '../../context/TableContext';
import { ImprovedGroupTableExample } from '../ImprovedGroupTableExample';

// 定义数据类型
interface Invoice {
  invoice: string;
  paymentStatus: string;
  totalAmount: string;
  paymentMethod: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

const meta: Meta<typeof BaseTable> = {
  title: 'EASAI/Table/Table',
  component: BaseTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '现代化Table组件系统，采用最新React模式和TypeScript特性。支持原子组合式设计、完整类型安全、与Schema字段命名一致。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      description: '表格列配置数组（使用name字段作为列标识，与Schema保持一致）',
      control: { type: 'object' },
    },
    data: {
      description: '表格数据源',
      control: { type: 'object' },
    },
    rowKey: {
      description: '表格行 key 的取值字段',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'id' },
      },
    },
    size: {
      description: '表格大小',
      control: 'select',
      options: ['sm', 'md', 'lg'],
      table: {
        type: { summary: 'sm | md | lg' },
        defaultValue: { summary: 'md' },
      },
    },
    density: {
      description: '表格密度',
      control: 'select',
      options: ['compact', 'comfortable'],
      table: {
        type: { summary: 'compact | comfortable' },
        defaultValue: { summary: 'comfortable' },
      },
    },
    bordered: {
      description: '是否显示边框',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    striped: {
      description: '是否显示斑马纹',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    stickyHeader: {
      description: '是否固定表头',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      description: '是否加载中',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onRowClick: {
      description: '行点击事件',
      control: { disable: true },
    },
    onRowDoubleClick: {
      description: '行双击事件',
      control: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseTable>;

const invoices: Record<string, any>[] = [
  {
    id: 1,
    invoice: 'INV001',
    paymentStatus: '已支付',
    totalAmount: '¥250.00',
    paymentMethod: '支付宝',
    date: '2023-06-10',
    customer: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    address: '北京市朝阳区',
    remark: '普通客户',
    createTime: '2023-06-10 10:30:00',
    updateTime: '2023-06-10 14:20:00',
  },
  {
    id: 2,
    invoice: 'INV002',
    paymentStatus: '待支付',
    totalAmount: '¥150.00',
    paymentMethod: '微信支付',
    date: '2023-06-11',
    customer: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    address: '上海市浦东新区',
    remark: 'VIP客户',
    createTime: '2023-06-11 09:15:00',
    updateTime: '2023-06-11 09:15:00',
  },
  {
    id: 3,
    invoice: 'INV003',
    paymentStatus: '待支付',
    totalAmount: '¥350.00',
    paymentMethod: '银行卡',
    date: '2023-06-12',
    customer: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    address: '广州市天河区',
    remark: '企业客户',
    createTime: '2023-06-12 16:45:00',
    updateTime: '2023-06-12 16:45:00',
  },
  {
    id: 4,
    invoice: 'INV004',
    paymentStatus: '已支付',
    totalAmount: '¥450.00',
    paymentMethod: '支付宝',
    date: '2023-06-13',
    customer: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    address: '深圳市南山区',
    remark: '普通客户',
    createTime: '2023-06-13 11:20:00',
    updateTime: '2023-06-13 15:30:00',
  },
];

// 为ImprovedGroupTable创建兼容的测试数据
const improvedGroupTestData = [
  {
    id: 1,
    invoice: 'INV001',
    customer: '张三',
    paymentStatus: 'paid' as const,
    totalAmount: '¥250.00',
    email: 'zhangsan@example.com',
    phone: '138-0000-0001',
    address: '北京市朝阳区xxx街道',
  },
  {
    id: 2,
    invoice: 'INV002',
    customer: '李四',
    paymentStatus: 'pending' as const,
    totalAmount: '¥150.00',
    email: 'lisi@example.com',
    phone: '138-0000-0002',
    address: '上海市浦东新区xxx路',
  },
  {
    id: 3,
    invoice: 'INV003',
    customer: '王五',
    paymentStatus: 'paid' as const,
    totalAmount: '¥350.00',
    email: 'wangwu@example.com',
    phone: '138-0000-0003',
    address: '深圳市南山区xxx大道',
  },
  {
    id: 4,
    invoice: 'INV004',
    customer: '赵六',
    paymentStatus: 'pending' as const,
    totalAmount: '¥450.00',
    email: 'zhaoliu@example.com',
    phone: '138-0000-0004',
    address: '广州市天河区xxx街',
  },
  {
    id: 5,
    invoice: 'INV005',
    customer: '钱七',
    paymentStatus: 'failed' as const,
    totalAmount: '¥125.00',
    email: 'qianqi@example.com',
    phone: '138-0000-0005',
    address: '杭州市西湖区xxx路',
  },
];

// 定义列配置（使用Schema兼容的字段命名）
const basicColumns: TableColumn[] = [
  {
    name: 'invoice', // 使用name而不是key
    title: '发票编号',
    dataIndex: 'invoice',
    width: 120,
  },
  {
    name: 'paymentStatus',
    title: '支付状态',
    dataIndex: 'paymentStatus',
    width: 100,
    align: 'center', // 使用Schema对齐方式
    render: (value) => <Badge variant={value === '已支付' ? 'default' : 'destructive'}>{value as string}</Badge>,
  },
  {
    name: 'totalAmount',
    title: '金额',
    dataIndex: 'totalAmount',
    width: 100,
    align: 'right',
  },
  {
    name: 'paymentMethod',
    title: '支付方式',
    dataIndex: 'paymentMethod',
    width: 120,
  },
];

export const Basic: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-lg">基础表格</h3>
        <p className="text-muted-foreground text-sm">使用Table组件的基础用法，展示Schema兼容的列配置（使用name字段）。</p>
      </div>
      <TableProvider
        data={args.data}
        columns={args.columns}
        config={{
          i18n: { locale: 'zh-CN' },
          rowKey: args.rowKey ?? 'id',
          bordered: args.bordered ?? false,
          dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
        }}
      >
        <BaseTable rowKey="id" bordered className="rounded-md border" {...args} />
      </TableProvider>
    </div>
  ),
  args: {
    columns: basicColumns,
    data: invoices,
    rowKey: 'id',
    bordered: true,
  },
};

export const AtomicComposition: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-lg">原子组合示例</h3>
        <p className="text-muted-foreground text-sm">使用原子组件组合构建表格，显示组合式设计的灵活性。</p>
      </div>
      <div className="rounded-md border">
        <TableProvider
          data={invoices}
          columns={basicColumns}
          config={{
            i18n: { locale: 'zh-CN' },
            rowKey: 'id',
            dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
          }}
        >
          <TableContainer>
            <TableGrid>
              <TableHeader>
                <TableRow>
                  <TableCell as="th">发票编号</TableCell>
                  <TableCell as="th">客户</TableCell>
                  <TableCell as="th" align="right">
                    金额
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 3).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell align="right">{invoice.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableGrid>
          </TableContainer>
        </TableProvider>
      </div>
    </div>
  ),
  args: {},
};

export const LoadingAndErrorStates: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [data, setData] = React.useState<Record<string, any>[]>(invoices);

    const columns: TableColumn[] = [
      {
        name: 'invoice',
        title: '发票编号',
        dataIndex: 'invoice',
      },
      {
        name: 'customer',
        title: '客户',
        dataIndex: 'customer',
      },
      {
        name: 'totalAmount',
        title: '金额',
        dataIndex: 'totalAmount',
        align: 'right',
      },
    ];

    const handleLoadData = () => {
      setError(null);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setData(invoices);
      }, 2000);
    };

    const handleSimulateError = () => {
      setData([]);
      setLoading(false);
      setError('模拟的错误信息：无法加载数据');
    };

    const handleClearData = () => {
      setData([]);
      setError(null);
      setLoading(false);
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 font-semibold text-lg">加载和错误状态</h3>
          <p className="text-muted-foreground text-sm">展示表格在加载、错误和空数据状态下的表现。</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleLoadData} disabled={loading}>
            {loading ? '加载中…' : '加载数据'}
          </Button>
          <Button onClick={handleSimulateError} variant="destructive">
            模拟错误
          </Button>
          <Button onClick={handleClearData} variant="outline">
            清空数据
          </Button>
        </div>

        <div className="rounded-md border">
          <TableProvider
            data={data}
            columns={columns}
            loading={loading}
            error={error ?? undefined}
            config={{
              i18n: { locale: 'zh-CN' },
              rowKey: 'id',
              bordered: true,
              dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
            }}
          >
            <BaseTable
              columns={columns}
              data={data}
              rowKey="id"
              loading={loading}
              error={error ? <div className="text-red-600">{error}</div> : undefined}
              empty={'暂无数据，请点击加载数据按钮'}
              bordered
            />
          </TableProvider>
        </div>
      </div>
    );
  },
  args: {},
};

export const SchemaCompatibility: Story = {
  render: () => {
    const columns: TableColumn[] = [
      {
        name: 'invoice', // Schema兼容：使用name而不是key
        title: '发票编号',
        dataIndex: 'invoice',
        align: 'left', // Schema兼容：left/center/right
        width: 150,
      },
      {
        name: 'customer',
        title: '客户信息',
        dataIndex: 'customer',
        align: 'left',
        ellipsis: true,
      },
      {
        name: 'status',
        title: '状态',
        dataIndex: 'paymentStatus',
        align: 'center',
        visible: true, // Schema兼容：visible控制显示/隐藏
        render: (value) => <Badge variant={value === '已支付' ? 'default' : 'destructive'}>{value as string}</Badge>,
      },
      {
        name: 'amount',
        title: '金额',
        dataIndex: 'totalAmount',
        align: 'right', // Schema兼容：右对齐
        fixed: 'right', // Schema兼容：left/right固定
        width: 120,
      },
    ];

    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-semibold text-lg">Schema兼容性展示</h3>
          <p className="text-muted-foreground text-sm">展示与Schema定义完全兼容的字段命名和配置选项。</p>
          <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm">
            <h4 className="mb-1 font-medium text-blue-900">Schema兼容特性：</h4>
            <ul className="space-y-1 text-blue-700">
              <li>
                • 使用 <code>name</code> 字段而不是 <code>key</code>
              </li>
              <li>
                • 对齐方式使用 <code>left/center/right</code>
              </li>
              <li>
                • 固定位置使用 <code>left/right</code>
              </li>
              <li>
                • 可见性控制使用 <code>visible</code> 而不是 <code>hidden</code>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-md border">
          <TableProvider
            data={invoices}
            columns={columns}
            config={{
              i18n: { locale: 'zh-CN' },
              rowKey: 'id',
              bordered: true,
              size: 'md',
              density: 'comfortable',
              dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
            }}
          >
            <BaseTable columns={columns} data={invoices} rowKey="id" bordered size="md" density="comfortable" scroll={{ x: 600 }} />
          </TableProvider>
        </div>
      </div>
    );
  },
  args: {},
};

// 新增：改进的分组表格示例
export const ImprovedGroupTable: Story = {
  render: () => <ImprovedGroupTableExample data={improvedGroupTestData} rowKey="id" size="lg" density="comfortable" bordered />,
  parameters: {
    docs: {
      description: {
        story: '改进后的分组表格，解决了展开位置、复选框大小、全选按钮等问题。包含正确的展开行插入、优化的复选框样式、完整的全选功能和平滑的交互动画。',
      },
    },
  },
};
