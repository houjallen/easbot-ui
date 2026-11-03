import { EnhancedTable, useTableContext } from '../../index';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { TableProvider } from '../../context/TableContext';
import type { TableColumn } from '../../types';

// 定义列配置（虽然是卡片模式，但仍需要列定义用于数据处理）
const mockColumns: TableColumn[] = [
  {
    name: 'name',
    title: '应用名称',
    dataIndex: 'name',
    type: 'text',
  },
  {
    name: 'description',
    title: '描述',
    dataIndex: 'description',
    type: 'text',
  },
  {
    name: 'version',
    title: '版本',
    dataIndex: 'version',
    type: 'text',
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    type: 'tag',
  },
  {
    name: 'category',
    title: '分类',
    dataIndex: 'category',
    type: 'text',
  },
  {
    name: 'rating',
    title: '评分',
    dataIndex: 'rating',
    type: 'number',
  },
];

const meta: Meta<typeof EnhancedTable> = {
  title: 'EASAI/Table/TableCardView',
  component: EnhancedTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '表格卡片视图组件，支持网格和列表布局，提供丰富的卡片配置选项和交互功能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: '卡片配置选项',
      control: { type: 'object' },
    },
    onRowClick: {
      description: '卡片点击事件',
      control: { disable: true },
    },
    onRowDoubleClick: {
      description: '卡片双击事件',
      control: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedTable>;

// 示例数据
const mockData = [
  {
    id: 'app_001',
    name: 'React Admin Dashboard',
    description: '基于 React 的现代化管理后台系统，提供丰富的组件和功能模块',
    version: 'v2.1.0',
    status: 'active',
    rating: 4.8,
    category: 'Dashboard',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
    downloads: 125000,
    author: '小莫',
    createTime: '2024-01-15',
    tags: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    id: 'app_002',
    name: 'Vue E-commerce Platform',
    description: 'Vue.js 电商平台解决方案，包含完整的购物车、支付、订单管理功能',
    version: 'v1.5.2',
    status: 'active',
    rating: 4.5,
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    downloads: 89000,
    author: '张三',
    createTime: '2024-02-20',
    tags: ['Vue', 'JavaScript', 'Element UI'],
  },
  {
    id: 'app_003',
    name: 'Angular CRM System',
    description: 'Angular 客户关系管理系统，支持客户信息管理、销售跟踪、报表分析',
    version: 'v3.0.1',
    status: 'inactive',
    rating: 4.2,
    category: 'CRM',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    downloads: 67000,
    author: '李四',
    createTime: '2024-03-10',
    tags: ['Angular', 'TypeScript', 'Material'],
  },
  {
    id: 'app_004',
    name: 'Node.js API Gateway',
    description: 'Node.js 微服务网关，提供路由、认证、限流、监控等功能',
    version: 'v1.8.0',
    status: 'active',
    rating: 4.7,
    category: 'Backend',
    image: 'code-brackets',
    downloads: 156000,
    author: '王五',
    createTime: '2024-01-25',
    tags: ['Node.js', 'Express', 'Redis'],
  },
  {
    id: 'app_005',
    name: 'Flutter Mobile App',
    description: 'Flutter 跨平台移动应用开发框架，支持 iOS 和 Android',
    version: 'v2.3.0',
    status: 'active',
    rating: 4.6,
    category: 'Mobile',
    image: 'smartphone',
    downloads: 203000,
    author: '赵六',
    createTime: '2024-02-05',
    tags: ['Flutter', 'Dart', 'Mobile'],
  },
  {
    id: 'app_006',
    name: 'Python Data Analytics',
    description: 'Python 数据分析平台，集成机器学习、数据可视化、报表生成功能',
    version: 'v1.2.3',
    status: 'active',
    rating: 4.4,
    category: 'Analytics',
    image: 'bar-chart-3',
    downloads: 78000,
    author: '孙七',
    createTime: '2024-03-01',
    tags: ['Python', 'Pandas', 'Matplotlib'],
  },
];

// 统一的行操作配置，表格和卡片视图共用
const rowActionConfig = {
  actions: [
    {
      key: 'view',
      label: '查看',
      icon: 'eye',
      priority: 1,
      onClick: fn(),
    },
    {
      key: 'edit',
      label: '编辑',
      icon: 'edit',
      priority: 2,
      onClick: fn(),
    },
    {
      key: 'download',
      label: '下载',
      icon: 'download',
      priority: 3,
      onClick: fn(),
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'trash',
      priority: 4,
      showInMore: true, // 在更多菜单中显示
      disabled: (record: any) => record?.status === 'active',
      onClick: fn(),
    },
  ],
  maxVisible: 3, // 最多显示3个操作，其余的在更多菜单中
  showLabel: true, // 卡片中显示标签
  size: 'sm' as const,
};

/**
 * 基础网格卡片
 */
export const BasicGrid: Story = {
  render: (args) => (
    <TableProvider
      data={mockData}
      columns={mockColumns}
      config={{
        displayMode: 'card',
        size: 'md',
        bordered: true,
        hoverable: true,
        rowActionable: true,
        // 统一的行操作配置
        rowAction: {
          ...rowActionConfig,
          maxVisible: 2, // 只显示前两个操作
        },
        card: {
          layout: 'grid',
          columns: 'auto',
          gap: 16,
          shadow: true,
          titleField: 'name',
          descriptionField: 'description',
          imageField: 'image',
        },
        selectable: false,
      }}
    >
      <EnhancedTable {...args} />
    </TableProvider>
  ),
};

/**
 * 可选择的网格卡片
 */
export const SelectableGrid: Story = {
  render: (args) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(['app_001', 'app_003']);

    return (
      <TableProvider
        data={mockData}
        columns={mockColumns}
        config={{
          displayMode: 'card',
          size: 'md',
          bordered: true,
          hoverable: true,
          rowActionable: true,
          paginable: true,
          fillContainer: true,
          toolbarable: true,
          // 统一的行操作配置
          rowAction: rowActionConfig,
          card: {
            layout: 'grid',
            columns: 3,
            gap: 20,
            shadow: true,
            titleField: 'name',
            descriptionField: 'description',
            imageField: 'image',
          },
          pagination: {
            pageNo: 1,
            pageSize: 10,
            show: true,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: true,
            total: mockColumns.length,
          },
          selectable: true,
          dataMode: {
            sort: 'local',
            filter: 'local',
            search: 'local',
            pagination: 'local',
          },
          selection: {
            selectedRowKeys,
            onSelectionChange: fn(),
          },
        }}
      >
        <EnhancedTable {...args} onRowClick={fn()} />
      </TableProvider>
    );
  },
};

/**
 * 列表布局
 */
export const ListLayout: Story = {
  render: (args) => (
    <TableProvider
      data={mockData}
      columns={mockColumns}
      config={{
        displayMode: 'card',
        size: 'md',
        bordered: true,
        hoverable: true,
        // 统一的行操作配置
        rowAction: {
          ...rowActionConfig,
          maxVisible: 2, // 列表模式只显示2个操作
        },
        card: {
          layout: 'list',
          gap: 8,
          shadow: false,
          titleField: 'name',
          descriptionField: 'description',
          imageField: 'image',
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: true,
          total: mockColumns.length,
        },
        selectable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          search: 'local',
          pagination: 'local',
        },
      }}
    >
      <EnhancedTable {...args} />
    </TableProvider>
  ),
};

/**
 * 大尺寸卡片
 */
export const LargeCards: Story = {
  render: (args) => (
    <TableProvider
      data={mockData.slice(0, 4)} // 只显示前4个
      columns={mockColumns}
      config={{
        displayMode: 'card',
        size: 'lg',
        bordered: true,
        hoverable: true,
        // 统一的行操作配置
        rowAction: rowActionConfig,
        card: {
          layout: 'grid',
          columns: 2,
          gap: 24,
          shadow: true,
          titleField: 'name',
          descriptionField: 'description',
          imageField: 'image',
        },
        selectable: false,
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: true,
          total: mockColumns.length,
        },
        dataMode: {
          sort: 'local',
          filter: 'local',
          search: 'local',
          pagination: 'local',
        },
      }}
    >
      <EnhancedTable {...args} />
    </TableProvider>
  ),
};

/**
 * 小尺寸卡片
 */
export const SmallCards: Story = {
  render: (args) => (
    <TableProvider
      data={mockData}
      columns={mockColumns}
      config={{
        displayMode: 'card',
        size: 'sm',
        bordered: true,
        hoverable: true,
        // 统一的行操作配置
        rowAction: {
          ...rowActionConfig,
          maxVisible: 1, // 小尺寸只显示1个操作
        },
        card: {
          layout: 'grid',
          columns: 4,
          gap: 12,
          shadow: true,
          titleField: 'name',
          descriptionField: 'description',
          imageField: 'image',
        },
        selectable: false,
      }}
    >
      <EnhancedTable {...args} />
    </TableProvider>
  ),
};

/**
 * 无边框卡片
 */
export const NoBorderCards: Story = {
  render: (args) => (
    <TableProvider
      data={mockData}
      columns={mockColumns}
      config={{
        displayMode: 'card',
        size: 'sm',
        bordered: false,
        hoverable: true,
        // 统一的行操作配置
        rowAction: rowActionConfig,
        card: {
          layout: 'grid',
          columns: 'auto',
          gap: 16,
          shadow: true,
          titleField: 'name',
          descriptionField: 'description',
          imageField: 'image',
        },
        selectable: false,
      }}
    >
      <EnhancedTable {...args} />
    </TableProvider>
  ),
};

/**
 * 填充容器模式
 */
export const FillContainer: Story = {
  render: (args) => (
    <div className="h-[600px] rounded-lg border">
      <TableProvider
        data={mockData}
        columns={mockColumns}
        config={{
          displayMode: 'card',
          fillContainer: true,
          paginable: true,
          selectable: true,
          size: 'sm',
          bordered: true,
          hoverable: true,
          // 统一的行操作配置
          rowAction: rowActionConfig,
          card: {
            layout: 'grid',
            columns: 3,
            gap: 20,
            shadow: true,
            titleField: 'name',
            descriptionField: 'description',
            imageField: 'image',
          },
          dataMode: {
            pagination: 'local',
          },
          pagination: {
            pageNo: 1,
            pageSize: 6,
            show: true,
            total: mockData.length,
          },
          selection: {
            type: 'multiple',
            onSelectionChange: fn(),
          },
        }}
      >
        <EnhancedTable {...args} />
      </TableProvider>
    </div>
  ),
};

/**
 * 自定义卡片渲染
 */
export const CustomCard: Story = {
  render: (args) => (
    <TableProvider
      data={mockData}
      columns={mockColumns}
      config={{
        displayMode: 'card',
        size: 'sm',
        bordered: true,
        hoverable: true,
        card: {
          layout: 'grid',
          columns: 'auto',
          minWidth: '320px',
          gap: 16,
          renderCard: (record, index) => (
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {typeof record.image === 'string' && record.image.startsWith('http') ? (
                    <img src={record.image} alt={record.name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-2xl">📱</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="truncate font-semibold text-foreground text-lg">{record.name}</h4>
                    <span
                      className={`rounded-full px-2 py-1 font-medium text-xs ${
                        record.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {record.status === 'active' ? '活跃' : '停用'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">{record.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-muted-foreground text-xs">
                    <span>版本: {record.version}</span>
                    <span>下载: {record.downloads.toLocaleString()}</span>
                    <span>评分: ⭐ {record.rating}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {record.tags?.map((tag: string) => (
                      <span key={tag} className="rounded bg-secondary px-2 py-1 text-secondary-foreground text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type={'button'} className="rounded bg-primary px-3 py-1 text-primary-foreground text-sm transition-colors hover:bg-primary/90">
                      查看详情
                    </button>
                    <button type={'button'} className="rounded border border-border px-3 py-1 text-sm transition-colors hover:bg-accent">
                      编辑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        selectable: false,
      }}
    >
      <EnhancedTable {...args} />
    </TableProvider>
  ),
};

/**
 * 空数据状态
 */
export const EmptyState: Story = {
  render: (args) => (
    <TableProvider
      data={[]}
      columns={mockColumns}
      config={{
        displayMode: 'card',
        size: 'sm',
        bordered: true,
        hoverable: true,
        // 统一的行操作配置
        rowAction: rowActionConfig,
        card: {
          layout: 'grid',
          columns: 'auto',
          gap: 16,
          shadow: true,
          titleField: 'name',
          descriptionField: 'description',
          imageField: 'image',
        },
        selectable: false,
      }}
    >
      <EnhancedTable {...args} />
    </TableProvider>
  ),
};

const InteractiveComponent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [columns, setColumns] = useState<number | 'auto'>(2);

  const tableLogic = useTableContext().tableLogic;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 rounded-lg bg-muted p-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">布局:</span>
          <select
            value={layout}
            onChange={(e) => {
              const layout = e.target.value as 'grid' | 'list';
              tableLogic.actions.updateConfig({
                card: { layout },
              });
              setLayout(layout);
            }}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="grid">网格</option>
            <option value="list">列表</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">尺寸:</span>
          <select
            value={size}
            onChange={(e) => {
              const size = e.target.value as 'sm' | 'md' | 'lg';
              tableLogic.actions.updateConfig({
                size,
              });
              setSize(size);
            }}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="sm">小</option>
            <option value="md">中</option>
            <option value="lg">大</option>
          </select>
        </div>
        {layout === 'grid' && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">列数:</span>
            <select
              value={columns}
              onChange={(e) => {
                const cols = e.target.value === 'auto' ? 'auto' : Number(e.target.value);
                tableLogic.actions.updateConfig({
                  card: { columns: cols },
                });
                setColumns(cols);
              }}
              className="rounded border px-2 py-1 text-sm"
            >
              <option value="auto">自动</option>
              <option value={2}>2列</option>
              <option value={3}>3列</option>
              <option value={4}>4列</option>
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">已选择: {selectedRowKeys.length} 项</span>
          {selectedRowKeys.length > 0 && (
            <button
              type={'button'}
              onClick={() => {
                tableLogic.selection.clearSelection();
                setSelectedRowKeys([]);
              }}
              className="rounded bg-destructive px-2 py-1 text-destructive-foreground text-sm"
            >
              清空选择
            </button>
          )}
        </div>
      </div>
      <div
        style={{
          height: '400px',
        }}
      >
        <EnhancedTable loading={false} onRowClick={fn()} onRowDoubleClick={fn()} />
      </div>
    </div>
  );
};
/**
 * 操作测试示例 - 展示统一的 rowAction 配置
 */
export const ActionTest: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-semibold text-lg">卡片视图 - 统一操作</h3>
        <p className="mb-4 text-muted-foreground text-sm">点击操作按钮测试功能，注意"删除"按钮对活跃状态的应用是禁用的。</p>
        <TableProvider
          data={mockData.slice(0, 3)}
          columns={mockColumns}
          config={{
            displayMode: 'card',
            size: 'md',
            bordered: true,
            hoverable: true,
            rowActionable: true,
            // 统一的行操作配置
            rowAction: rowActionConfig,
            card: {
              layout: 'grid',
              columns: 3,
              gap: 16,
              shadow: true,
              titleField: 'name',
              descriptionField: 'description',
              imageField: 'image',
            },
            selectable: false,
            pagination: {
              pageNo: 1,
              pageSize: 10,
              show: true,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: true,
              total: mockColumns.length,
            },
            dataMode: {
              sort: 'local',
              filter: 'local',
              search: 'local',
              pagination: 'local',
            },
          }}
        >
          <EnhancedTable {...args} />
        </TableProvider>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-lg">表格视图 - 相同操作</h3>
        <p className="mb-4 text-muted-foreground text-sm">使用完全相同的 rowAction 配置，确保操作行为一致。</p>
        <TableProvider
          data={mockData.slice(0, 3)}
          columns={mockColumns}
          config={{
            displayMode: 'table',
            size: 'md',
            bordered: true,
            hoverable: true,
            rowActionable: true,
            // 使用完全相同的 rowAction 配置
            rowAction: rowActionConfig,
            selectable: false,
            pagination: {
              pageNo: 1,
              pageSize: 10,
              show: true,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: true,
              total: mockColumns.length,
            },
            dataMode: {
              sort: 'local',
              filter: 'local',
              search: 'local',
              pagination: 'local',
            },
          }}
        >
          <EnhancedTable {...args} />
        </TableProvider>
      </div>
    </div>
  ),
};

/**
 * 交互式示例
 */
export const Interactive: Story = {
  render: () => {
    return (
      <TableProvider
        data={mockData}
        columns={mockColumns}
        config={{
          displayMode: 'card',
          size: 'md',
          paginable: true,
          bordered: true,
          hoverable: true,
          clickable: true,
          fillContainer: true,
          rowActionable: true,
          pluginable: true,
          // 统一的行操作配置
          card: {
            layout: 'grid',
            columns: 2,
            gap: 16,
            shadow: true,
            titleField: 'name',
            descriptionField: 'description',
            imageField: 'image',
          },
          selectable: true,
          selection: {
            onSelectionChange: fn(),
          },
          dataMode: {
            sort: 'local',
            filter: 'local',
            search: 'local',
            pagination: 'local',
          },
          pagination: {
            pageNo: 1,
            pageSize: 2,
            show: true,
            total: mockData.length,
          },
          rowAction: {
            maxVisible: 3,
            actions: [
              {
                key: 'delete',
                label: '自定义删除',
                priority: 100,
                icon: 'delete',
                execute: fn(),
              },
            ],
          },
        }}
      >
        <InteractiveComponent />
      </TableProvider>
    );
  },
};
