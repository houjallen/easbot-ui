import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EnhancedTable } from '../../organisms/EnhancedTable';
import type { FilterState, SortState, TableColumn } from '../../types';

// 示例数据类型
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  createdAt: string;
  description?: string;
}

// 生成示例数据
const generateProducts = (count: number): Product[] => {
  const categories = ['电子产品', '服装', '家居', '图书', '运动'] as const;
  const statuses: Product['status'][] = ['available', 'out_of_stock', 'discontinued'];

  return Array.from({ length: count }, (_, index) => ({
    id: `prod_${index + 1}`,
    name: `产品 ${index + 1}`,
    category: categories[index % categories.length]!,
    price: Math.floor(Math.random() * 1000) + 10,
    stock: Math.floor(Math.random() * 100),
    status: statuses[index % statuses.length]!,
    createdAt: new Date(2024, 0, 1 + index).toISOString().split('T')[0]!,
    description: `这是产品 ${index + 1} 的详细描述信息。`,
  }));
};

const sampleProducts = generateProducts(20);

// 示例列配置
const productColumns: TableColumn[] = [
  {
    name: 'name',
    title: '产品名称',
    dataIndex: 'name',
    width: 150,
    sortable: true,
    filterable: true,
  },
  {
    name: 'category',
    title: '分类',
    dataIndex: 'category',
    width: 120,
    filterable: true,
  },
  {
    name: 'price',
    title: '价格',
    dataIndex: 'price',
    width: 100,
    sortable: true,
    render: (value: number) => `¥${value.toFixed(2)}`,
  },
  {
    name: 'stock',
    title: '库存',
    dataIndex: 'stock',
    width: 80,
    sortable: true,
    render: (value: number) => <span className={value > 10 ? 'text-green-600' : 'text-red-600'}>{value}</span>,
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 120,
    filterable: true,
    render: (value: string) => {
      const statusMap = {
        available: { text: '有库存', className: 'bg-green-100 text-green-800' },
        out_of_stock: {
          text: '缺货',
          className: 'bg-yellow-100 text-yellow-800',
        },
        discontinued: { text: '停产', className: 'bg-red-100 text-red-800' },
      };
      const status = statusMap[value as keyof typeof statusMap];
      return <span className={`rounded-full px-2 py-1 text-xs ${status.className}`}>{status.text}</span>;
    },
  },
  {
    name: 'createdAt',
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 120,
    sortable: true,
  },
];

const meta: Meta<typeof EnhancedTable> = {
  title: 'EASAI/Table/EnhancedTable',
  component: EnhancedTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'EnhancedTable集成了完整的Hook系统和TableContext，提供排序、筛选、选择、展开等功能。使用TableProvider包装，支持统一的状态管理。',
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
    config: {
      description: '表格配置对象',
      control: { type: 'object' },
    },
    onRowClick: {
      description: '行点击事件',
      control: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedTable>;

// 基础增强表格
export const Default: Story = {
  render: () => <EnhancedTable data={sampleProducts.slice(0, 10)} columns={productColumns} />,
};

// 带选择功能
export const WithSelection: Story = {
  render: () => (
    <EnhancedTable
      data={sampleProducts.slice(0, 10)}
      columns={productColumns}
      config={{
        size: 'md',
        selectable: true,
        selection: {
          type: 'multiple',
          selectedRowKeys: [],
        },
      }}
    />
  ),
};

// 带排序功能
export const WithSorting: Story = {
  render: () => (
    <EnhancedTable
      data={sampleProducts.slice(0, 10)}
      columns={productColumns}
      config={{
        size: 'md',
        sortable: true,
        sort: {
          columnName: 'price',
          order: 'desc',
        },
        dataMode: {
          sort: 'local',
        },
      }}
    />
  ),
};

// 带筛选功能
export const WithFiltering: Story = {
  render: () => (
    <EnhancedTable
      data={sampleProducts}
      columns={productColumns}
      config={{
        size: 'md',
        filterable: true,
        filter: {},
        dataMode: {
          filter: 'local',
        },
      }}
    />
  ),
};

// 带展开功能
export const WithExpansion: Story = {
  render: () => (
    <EnhancedTable
      data={sampleProducts.slice(0, 8)}
      columns={productColumns}
      config={{
        size: 'md',
        expandable: true,
        expansion: {
          type: 'single',
          expandedRowKeys: ['prod_1'],
          renderExpandedRow: (record: Record<string, any>) => (
            <div className="border-blue-400 border-l-4 bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-900">产品详情</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-medium">产品ID:</span> {record.id}
                  </p>
                  <p>
                    <span className="font-medium">分类:</span> {record.category}
                  </p>
                  <p>
                    <span className="font-medium">价格:</span> ¥{record.price}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">库存:</span> {record.stock}
                  </p>
                  <p>
                    <span className="font-medium">状态:</span> {record.status}
                  </p>
                  <p>
                    <span className="font-medium">创建时间:</span> {record.createdAt}
                  </p>
                </div>
              </div>
              {record.description && (
                <div className="mt-3">
                  <p className="font-medium">描述:</p>
                  <p className="text-gray-600">{record.description}</p>
                </div>
              )}
            </div>
          ),
        },
      }}
    />
  ),
};

// 列宽调整
export const WithResizing: Story = {
  render: () => (
    <EnhancedTable
      data={sampleProducts.slice(0, 10)}
      columns={productColumns}
      config={{
        size: 'md',
        resizeable: true,
        resize: {
          columnWidths: {
            name: 200,
            category: 100,
            price: 120,
            stock: 80,
            status: 140,
            createdAt: 130,
          },
        },
      }}
    />
  ),
};

// 虚拟滚动
export const WithVirtualization: Story = {
  render: () => (
    <EnhancedTable
      data={generateProducts(1000)}
      columns={productColumns}
      config={{
        size: 'md',
        virtualizable: true,
        virtualization: {
          itemHeight: 50,
          height: 400,
        },
      }}
    />
  ),
};

// 完整功能演示 - 自适应高度
export const FullFeatured: Story = {
  render: () => (
    <div className="flex h-[300px] flex-col">
      <EnhancedTable
        data={sampleProducts}
        columns={productColumns}
        onRowClick={fn()}
        config={{
          size: 'md',
          bordered: false,
          hoverable: true,
          striped: true,
          clickable: true,
          resizeable: true,
          sortable: true,
          filterable: true,
          fixedable: true,
          stickyHeader: true,
          stickyHeaderOffset: 0,
          fixedLayout: true,
          selectable: true,
          expandable: true,
          paginable: true,
          fillContainer: false,
          virtualizable: true,
          dataMode: {
            sort: 'local',
            filter: 'local',
            pagination: 'local',
            clearSelectedOnPagination: true,
          },
          pagination: {
            pageNo: 1,
            pageSize: 10,
            show: true,
            total: sampleProducts.length,
          },
          selection: {
            type: 'multiple',
            selectedRowKeys: ['prod_1'],
          },
          sort: {
            columnName: 'createdAt',
            order: 'desc',
          },
          resize: {
            columnWidths: {
              name: 200,
              category: 100,
              price: 120,
              stock: 80,
              status: 140,
              createdAt: 130,
            },
          },
          scroll: {
            x: 'auto',
            y: 'auto',
          },
          virtualization: {
            itemHeight: 50,
            height: 600,
          },
          expansion: {
            type: 'single',
            renderExpandedRow: (record: Record<string, any>) => (
              <div className="bg-blue-50 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="mb-2 font-medium text-blue-900">产品信息</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">ID:</span> {record.id}
                      </p>
                      <p>
                        <span className="font-medium">名称:</span> {record.name}
                      </p>
                      <p>
                        <span className="font-medium">分类:</span> {record.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-2 font-medium text-blue-900">库存信息</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">价格:</span> ¥{record.price}
                      </p>
                      <p>
                        <span className="font-medium">库存:</span> {record.stock}
                      </p>
                      <p>
                        <span className="font-medium">状态:</span> {record.status}
                      </p>
                    </div>
                  </div>
                </div>
                {record.description && (
                  <div className="mt-3 border-blue-200 border-t pt-3">
                    <p className="font-medium text-blue-900">描述</p>
                    <p className="mt-1 text-blue-700 text-sm">{record.description}</p>
                  </div>
                )}
              </div>
            ),
          },
        }}
      />
    </div>
  ),
};

// 交互式示例
export const Interactive: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(['prod_1']);
    const [sortState, setSortState] = useState<SortState>({
      columnName: 'name',
      order: 'asc',
    });

    const [filters, setFilters] = useState<FilterState>({});

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 font-medium">当前状态</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">已选择:</p>
              <p>{selectedKeys.join(', ') || '无'}</p>
            </div>
            <div>
              <p className="font-medium">排序:</p>
              <p>
                {sortState.columnName} ({sortState.order})
              </p>
            </div>
            <div>
              <p className="font-medium">筛选:</p>
              <p>
                {Object.entries(filters)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ') || '无'}
              </p>
            </div>
          </div>
        </div>

        <EnhancedTable
          data={sampleProducts}
          columns={productColumns}
          config={{
            selectable: true,
            sortable: true,
            filterable: true,
            expandable: true,
            selection: {
              type: 'multiple',
              selectedRowKeys: selectedKeys,
              onSelectionChange: (keys, rows) => setSelectedKeys(keys),
            },
            sort: sortState,
            filter: {},
            expansion: {
              renderExpandedRow: (record: Record<string, any>) => (
                <div className="bg-green-50 p-4">
                  <p className="text-green-800">展开的产品: {record.name}</p>
                  <p className="mt-1 text-green-600 text-sm">{record.description}</p>
                </div>
              ),
            },
          }}
        />
      </div>
    );
  },
};
