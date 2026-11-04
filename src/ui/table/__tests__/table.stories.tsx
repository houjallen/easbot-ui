/**
 * Table 组件 Storybook 示例（规范主入口）
 *
 * 位置与全库统一：`src/ui/<component>/__tests__/<component>.stories.tsx`
 *
 * 覆盖维度：默认形态 / 变体（列类型）/ 尺寸 / 状态 / 选择 / 展开 / 排序 / 分页 / 卡片模式 / Playground
 */

import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from 'storybook/test';
import { Badge } from '../../badge';
import { TableProvider } from '../context/TableContext';
import { BaseTable } from '../organisms/BaseTable';
import type { TableColumn } from '../types';

/** 订单数据类型 */
interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

/** 示例数据 */
const orders: Order[] = [
  { id: 'ORD-001', customer: '张三', amount: 1250.5, status: 'paid', createdAt: '2024-01-15 10:30:00' },
  { id: 'ORD-002', customer: '李四', amount: 860, status: 'pending', createdAt: '2024-01-16 09:15:00' },
  { id: 'ORD-003', customer: '王五', amount: 3480, status: 'failed', createdAt: '2024-01-17 16:45:00' },
  { id: 'ORD-004', customer: '赵六', amount: 219.9, status: 'paid', createdAt: '2024-01-18 11:20:00' },
  { id: 'ORD-005', customer: '钱七', amount: 6400, status: 'pending', createdAt: '2024-01-19 14:05:00' },
  { id: 'ORD-006', customer: '孙八', amount: 320, status: 'paid', createdAt: '2024-01-20 08:40:00' },
];

/** 基础列配置 */
const baseColumns: TableColumn[] = [
  { name: 'id', title: '订单编号', dataIndex: 'id', width: 140 },
  { name: 'customer', title: '客户', dataIndex: 'customer', width: 120 },
  { name: 'amount', title: '金额', dataIndex: 'amount', width: 120, align: 'right' },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 110,
    align: 'center',
    render: (value: string) => <Badge variant={value === 'paid' ? 'default' : 'destructive'}>{value === 'paid' ? '已支付' : value === 'pending' ? '待支付' : '已失败'}</Badge>,
  },
  { name: 'createdAt', title: '创建时间', dataIndex: 'createdAt', width: 180 },
];

/**
 * 包裹 TableProvider 的渲染辅助
 * BaseTable 依赖 TableContext 提供的配置与状态，必须有 Provider 祖先
 */
const withProvider = (children: ReactNode, config: Record<string, any> = {}, providerProps: Record<string, any> = {}) => (
  <TableProvider data={orders} columns={baseColumns} config={{ i18n: { locale: 'zh-CN' }, ...config }} {...providerProps}>
    {children}
  </TableProvider>
);

const meta: Meta<typeof BaseTable> = {
  title: 'EASAI/Table',
  component: BaseTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Table 是组件库的数据表格基础实现，基于 Radix UI + Tailwind CSS v4 构建。支持列类型渲染、排序、筛选、选择、展开、分页、卡片模式与状态态（加载 / 错误 / 空数据）。所有能力由 TableProvider 统一驱动配置与状态。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'object' },
      description: '列配置数组，每列需提供 name / title / dataIndex 三个必填字段',
      table: {
        type: { summary: 'TableColumn[]' },
        defaultValue: { summary: 'baseColumns' },
      },
    },
    data: {
      control: { type: 'object' },
      description: '表格数据源，每行为一条记录',
      table: {
        type: { summary: 'Record<string, any>[]' },
        defaultValue: { summary: 'orders' },
      },
    },
    rowKey: {
      control: 'text',
      description: '行主键对应的字段名',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'id' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '表格尺寸',
      table: {
        type: { summary: 'sm | md | lg' },
        defaultValue: { summary: 'md' },
      },
    },
    density: {
      control: 'select',
      options: ['compact', 'default', 'comfortable'],
      description: '表格密度',
      table: {
        type: { summary: 'compact | default | comfortable' },
        defaultValue: { summary: 'default' },
      },
    },
    bordered: {
      control: 'boolean',
      description: '是否显示单元格边框',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    striped: {
      control: 'boolean',
      description: '是否显示斑马纹行背景',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hoverable: {
      control: 'boolean',
      description: '是否在行悬浮时高亮',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    stickyHeader: {
      control: 'boolean',
      description: '是否固定表头（配合滚动容器生效）',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: '是否展示加载遮罩',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onRowClick: {
      control: { disable: true },
      description: '行点击事件回调',
    },
    onRowDoubleClick: {
      control: { disable: true },
      description: '行双击事件回调',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseTable>;

/** 默认形态 */
export const Default: Story = {
  args: {
    columns: baseColumns,
    data: orders,
    rowKey: 'id',
    onRowClick: fn(),
    onRowDoubleClick: fn(),
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

/** 变体：列类型 */
export const Variants: Story = {
  parameters: {
    controls: { exclude: ['columns'] },
    docs: {
      description: {
        story: '展示表格支持的列类型：文本、数字、日期、布尔、标签、图片、链接、JSON 与操作列。',
      },
    },
  },
  render: () => {
    const variantColumns: TableColumn[] = [
      { name: 'text', title: '文本', dataIndex: 'text', type: 'text', width: 110 },
      { name: 'number', title: '数字', dataIndex: 'number', type: 'number', width: 100, align: 'right' },
      { name: 'date', title: '日期', dataIndex: 'date', type: 'date', dateType: 'date', format: 'YYYY-MM-DD', width: 130 },
      { name: 'boolean', title: '布尔', dataIndex: 'boolean', type: 'boolean', width: 90 },
      { name: 'tag', title: '标签', dataIndex: 'tag', type: 'tag', width: 140 },
      { name: 'link', title: '链接', dataIndex: 'link', type: 'link', width: 150, ellipsis: true },
      { name: 'json', title: 'JSON', dataIndex: 'json', type: 'json', width: 200, ellipsis: true },
      {
        name: 'actions',
        title: '操作',
        dataIndex: 'actions',
        type: 'actions',
        width: 120,
        render: () => (
          <div className="flex justify-center gap-1">
            <button type="button" className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs" onClick={fn()}>
              查看
            </button>
            <button type="button" className="rounded border border-border px-2 py-1 text-xs" onClick={fn()}>
              编辑
            </button>
          </div>
        ),
      },
    ];

    const variantData = [
      {
        id: 1,
        text: '普通文本',
        number: 1024,
        date: '2024-01-15',
        boolean: true,
        tag: ['前端', 'React'],
        link: 'https://example.com',
        json: { key: 'value' },
      },
      {
        id: 2,
        text: '带截断的长文本内容示例',
        number: 2048,
        date: '2024-02-20',
        boolean: false,
        tag: ['后端', 'Java'],
        link: 'https://example.org',
        json: { key: 'other' },
      },
    ];

    return (
      <TableProvider data={variantData} columns={variantColumns} config={{ i18n: { locale: 'zh-CN' } }}>
        <BaseTable columns={variantColumns} data={variantData} rowKey="id" bordered />
      </TableProvider>
    );
  },
};

/** 尺寸 */
export const Sizes: Story = {
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story: '对比 sm / md / lg 三种表格尺寸的渲染效果。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <p className="mb-2 font-medium text-muted-foreground text-sm">size = {size}</p>
          <TableProvider data={orders} columns={baseColumns} config={{ i18n: { locale: 'zh-CN' }, size, bordered: true }}>
            <BaseTable columns={baseColumns} data={orders} rowKey="id" />
          </TableProvider>
        </div>
      ))}
    </div>
  ),
};

/** 状态：加载 / 空数据 / 错误 */
export const States: Story = {
  parameters: {
    controls: { exclude: ['loading'] },
    docs: {
      description: {
        story: '展示表格的三种状态：加载中（遮罩）、空数据（空状态提示）与错误（错误提示）。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-medium text-muted-foreground text-sm">加载中</p>
        <TableProvider data={orders} columns={baseColumns} loading config={{ i18n: { locale: 'zh-CN' } }}>
          <BaseTable columns={baseColumns} data={orders} rowKey="id" bordered />
        </TableProvider>
      </div>

      <div>
        <p className="mb-2 font-medium text-muted-foreground text-sm">空数据</p>
        <TableProvider data={[]} columns={baseColumns} config={{ i18n: { locale: 'zh-CN' } }}>
          <BaseTable columns={baseColumns} data={[]} rowKey="id" bordered />
        </TableProvider>
      </div>

      <div>
        <p className="mb-2 font-medium text-muted-foreground text-sm">错误</p>
        <TableProvider data={orders} columns={baseColumns} error="加载数据失败，请稍后重试" config={{ i18n: { locale: 'zh-CN' } }}>
          <BaseTable columns={baseColumns} data={orders} rowKey="id" bordered />
        </TableProvider>
      </div>
    </div>
  ),
};

/** 选择 */
export const Selection: Story = {
  parameters: {
    docs: {
      description: {
        story: '开启 config.selectable 后，表格左侧渲染全选复选框与逐行复选框。',
      },
    },
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      selectable: true,
      selection: { type: 'multiple', selectedRowKeys: [] },
    }),
  args: {
    columns: baseColumns,
    data: orders,
    rowKey: 'id',
  },
};

/** 展开 */
export const Expansion: Story = {
  parameters: {
    docs: {
      description: {
        story: '开启 config.expandable 并提供 expansion.renderExpandedRow 后，行左侧出现展开按钮。',
      },
    },
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      expandable: true,
      expansion: {
        type: 'single',
        renderExpandedRow: (record: Record<string, any>) => (
          <div className="bg-muted/40 p-4 text-muted-foreground text-sm">
            订单 <strong>{record.id}</strong> 的客户是 {record.customer}，金额 ¥{record.amount}。
          </div>
        ),
      },
    }),
  args: {
    columns: baseColumns,
    data: orders,
    rowKey: 'id',
  },
};

/** 排序 */
export const Sorting: Story = {
  parameters: {
    docs: {
      description: {
        story: '开启 config.sortable 并把 dataMode.sort 设为 local 后，列头排序按钮可在本地数据上生效。',
      },
    },
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      sortable: true,
      sort: { columnName: 'amount', order: 'desc' },
      dataMode: { sort: 'local' },
    }),
  args: {
    columns: baseColumns.map((col) => ({ ...col, sortable: true })),
    data: orders,
    rowKey: 'id',
  },
};

/** 分页 */
export const Pagination: Story = {
  parameters: {
    docs: {
      description: {
        story: '默认开启分页（config.paginable），把 dataMode.pagination 设为 local 后分页在本地数据上生效。',
      },
    },
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      paginable: true,
      dataMode: { pagination: 'local' },
      pagination: { pageNo: 1, pageSize: 3, show: true, total: orders.length },
    }),
  args: {
    columns: baseColumns,
    data: orders,
    rowKey: 'id',
  },
};

/** 卡片模式 */
export const CardMode: Story = {
  parameters: {
    docs: {
      description: {
        story: '把 config.displayMode 设为 card 后，同一份数据以卡片网格形式展示。',
      },
    },
  },
  render: () => (
    <TableProvider
      data={orders}
      columns={baseColumns}
      config={{
        i18n: { locale: 'zh-CN' },
        displayMode: 'card',
        size: 'md',
        bordered: true,
        card: {
          layout: 'grid',
          columns: 3,
          gap: 16,
          shadow: true,
          titleField: 'customer',
          descriptionField: 'id',
        },
      }}
    >
      <BaseTable columns={baseColumns} data={orders} rowKey="id" />
    </TableProvider>
  ),
};

/** 交互式演练场 */
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: '通过 Controls 面板实时调整表格的尺寸、密度、边框、斑马纹与悬浮效果。',
      },
    },
  },
  args: {
    columns: baseColumns,
    data: orders,
    rowKey: 'id',
    size: 'md',
    density: 'comfortable',
    bordered: true,
    striped: false,
    hoverable: true,
    stickyHeader: false,
    onRowClick: fn(),
    onRowDoubleClick: fn(),
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};
