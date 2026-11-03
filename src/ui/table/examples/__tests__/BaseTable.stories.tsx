/**
 * BaseTable 组件 Storybook 示例
 * 展示基础表格的纯 UI 渲染能力，所有故事均包裹 TableProvider
 */

import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from 'storybook/test';
import { TableProvider } from '../../context/TableContext';
import { BaseTable } from '../../organisms/BaseTable';
import type { TableColumn } from '../../types';

// 示例数据类型
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// 示例数据
const sampleUsers: User[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: '用户',
    status: 'active',
    createdAt: '2024-01-16',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    role: '编辑',
    status: 'inactive',
    createdAt: '2024-01-17',
  },
  {
    id: '4',
    name: 'John Doe',
    email: 'john@example.com',
    role: '用户',
    status: 'active',
    createdAt: '2024-01-18',
  },
  {
    id: '5',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: '管理员',
    status: 'active',
    createdAt: '2024-01-19',
  },
];

// 示例列配置
const sampleColumns: TableColumn[] = [
  {
    name: 'name',
    title: '姓名',
    dataIndex: 'name',
    width: 120,
    sortable: true,
  },
  {
    name: 'email',
    title: '邮箱',
    dataIndex: 'email',
    width: 200,
    sortable: true,
  },
  {
    name: 'role',
    title: '角色',
    dataIndex: 'role',
    width: 100,
    filterable: true,
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (value: string) => (
      <span className={`rounded-full px-2 py-1 text-xs ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value === 'active' ? '活跃' : '非活跃'}</span>
    ),
  },
  {
    name: 'createdAt',
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 120,
    sortable: true,
  },
];

const meta: Meta<typeof BaseTable> = {
  title: 'EASAI/Table/Table',
  component: BaseTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Table是表格组件的基础实现，专注于纯UI渲染，支持国际化和基础交互功能。可独立使用或在TableContext中使用。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: '表格数据',
      control: { type: 'object' },
    },
    columns: {
      description: '列配置',
      control: { type: 'object' },
    },
    loading: {
      description: '加载状态',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    error: {
      description: '错误状态',
      control: 'boolean',
    },
    size: {
      description: '表格尺寸',
      control: 'select',
      options: ['sm', 'md', 'lg'],
      table: {
        type: { summary: 'sm | md | lg' },
        defaultValue: { summary: 'md' },
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
    hoverable: {
      description: '是否显示悬停效果',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    selectable: {
      description: '是否启用行选择',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    expandable: {
      description: '是否启用行展开',
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
  },
};

export default meta;
type Story = StoryObj<typeof BaseTable>;

/**
 * 包裹 TableProvider 的渲染辅助
 * BaseTable 依赖 TableContext 提供的配置与状态，必须有 Provider 祖先
 */
const withProvider = (children: ReactNode, config: Record<string, any> = {}, providerProps: Record<string, any> = {}) => (
  <TableProvider data={sampleUsers} columns={sampleColumns} config={{ i18n: { locale: 'zh-CN' }, ...config }} {...providerProps}>
    {children}
  </TableProvider>
);

// 基础表格
export const Default: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
    onRowClick: fn(),
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

// 加载状态
export const Loading: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
    loading: true,
  },
  render: (args) => withProvider(<BaseTable {...args} />, {}, { loading: true }),
};

// 空状态
export const Empty: Story = {
  args: {
    data: [],
    columns: sampleColumns,
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

// 错误状态
export const ErrorState: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
  },
  render: (args) => withProvider(<BaseTable {...args} />, {}, { error: '加载数据失败，请稍后重试' }),
};

// 可选择表格
export const Selectable: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
  },
  render: (args) => withProvider(<BaseTable {...args} />, { selectable: true }),
};

// 排序状态
export const WithSorting: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      sortable: true,
      dataMode: { sort: 'local' },
    }),
};

// 筛选状态
export const WithFiltering: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      filterable: true,
      dataMode: { filter: 'local' },
    }),
};

// 展开状态
export const WithExpansion: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      expandable: true,
      expansion: {
        renderExpandedRow: (record: Record<string, any>) => (
          <div className="bg-muted/40 p-4 text-muted-foreground text-sm">
            用户详情：{record.name}（{record.email}）
          </div>
        ),
      },
    }),
};

// 自定义列宽
export const CustomColumnWidths: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns.map((col) => ({
      ...col,
      width: col.name === 'email' ? 300 : col.width,
    })),
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

// 紧凑模式
export const Compact: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
    size: 'sm',
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

// 带边框
export const Bordered: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
    bordered: true,
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

// 斑马纹
export const Striped: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
    striped: true,
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

// 悬停效果
export const Hoverable: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
    hoverable: true,
  },
  render: (args) => withProvider(<BaseTable {...args} />),
};

// 组合功能
export const FullFeatured: Story = {
  args: {
    data: sampleUsers,
    columns: sampleColumns,
    bordered: true,
    striped: true,
    hoverable: true,
  },
  render: (args) =>
    withProvider(<BaseTable {...args} />, {
      selectable: true,
      sortable: true,
      filterable: true,
      dataMode: { sort: 'local', filter: 'local' },
    }),
};
