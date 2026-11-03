import { EnhancedTable } from '../index';
import React, { useState } from 'react';
import { TableProvider } from '../context/TableContext';
import { BaseTable } from '../organisms/BaseTable';
import type { TableColumn } from '../types';

/**
 * 卡片模式示例数据
 */
const mockCardData = [
  {
    id: 'app_001',
    name: 'Trident - n0m16h',
    description: 'Internet Explorer 7',
    version: 'Win 95+',
    status: 'active',
    rating: 4.5,
    category: 'Browser',
    icon: '🌐',
    downloads: 1250000,
  },
  {
    id: 'app_002',
    name: 'Trident - 499gpu',
    description: 'Internet Explorer 5.0',
    version: 'Win 95+',
    status: 'inactive',
    rating: 3.8,
    category: 'Browser',
    icon: '🌐',
    downloads: 890000,
  },
  {
    id: 'app_003',
    name: 'Gecko - bqu2h',
    description: 'Firefox 1.0',
    version: 'Win 98+ / OSX.2+',
    status: 'active',
    rating: 4.2,
    category: 'Browser',
    icon: '🦊',
    downloads: 2100000,
  },
  {
    id: 'app_004',
    name: 'Gecko - s80wmb',
    description: 'Firefox 1.5',
    version: 'Win 98+ / OSX.2+',
    status: 'active',
    rating: 4.7,
    category: 'Browser',
    icon: '🦊',
    downloads: 3200000,
  },
];

/**
 * 卡片模式示例组件
 */
export const CardModeExample: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  // 定义列（虽然是卡片模式，但仍需要列定义用于数据处理）
  const columns: TableColumn[] = [
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
  ];

  // 定义统一的行操作配置，表格和卡片视图共用
  const rowActionConfig = {
    actions: [
      {
        key: 'view',
        label: '查看',
        icon: 'eye',
        priority: 1,
        onClick: (record: any) => {
          console.log('查看应用:', record);
        },
      },
      {
        key: 'edit',
        label: '编辑',
        icon: 'edit',
        priority: 2,
        onClick: (record: any) => {
          console.log('编辑应用:', record);
        },
      },
      {
        key: 'delete',
        label: '删除',
        icon: 'trash',
        priority: 3,
        showInMore: true, // 在更多菜单中显示
        onClick: (record: any) => {
          console.log('删除应用:', record);
        },
      },
    ],
    maxVisible: 2, // 最多显示2个操作，其余的在更多菜单中
    showLabel: false, // 表格中不显示标签，卡片中会显示
    size: 'sm' as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 font-bold text-2xl">卡片模式示例</h2>
        <p className="text-muted-foreground">展示表格数据以卡片形式呈现，支持选择、操作等交互功能。通过统一的 rowAction 配置，确保表格视图和卡片视图的操作行为完全一致。</p>
      </div>

      {/* 基础卡片模式 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">基础卡片网格</h3>
        <div className="rounded-lg border p-4">
          <TableProvider
            columns={columns}
            data={mockCardData}
            config={{
              displayMode: 'card',
              selectable: true,
              size: 'md',
              bordered: true,
              hoverable: true,
              // 统一的行操作配置，表格和卡片视图共用
              rowAction: rowActionConfig,
              card: {
                layout: 'grid',
                columns: 'auto',
                gap: 16,
                shadow: true,
                titleField: 'name',
                descriptionField: 'description',
                imageField: 'icon',
                onCardClick: (record) => {
                  console.log('卡片点击:', record);
                },
              },
              pagination: {
                pageNo: 1,
                pageSize: 10,
                show: true,
                total: mockCardData.length,
              },
            }}
          >
            <EnhancedTable className="h-96" />
          </TableProvider>
        </div>
      </div>

      {/* 填充容器模式 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">填充容器模式</h3>
        <div className="rounded-lg border" style={{ height: '500px' }}>
          <TableProvider
            config={{
              displayMode: 'card',
              fillContainer: true,
              selectable: true,
              size: 'lg',
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
                imageField: 'icon',
              },
            }}
          >
            <BaseTable columns={columns} data={mockCardData} />
          </TableProvider>
        </div>
      </div>

      {/* 自定义卡片渲染 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">自定义卡片渲染</h3>
        <div className="rounded-lg border p-4">
          <TableProvider
            config={{
              displayMode: 'card',
              size: 'md',
              bordered: true,
              hoverable: true,
              card: {
                layout: 'grid',
                columns: 'auto',
                minWidth: '300px',
                gap: 16,
                renderCard: (record, index) => (
                  <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{record.icon}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-foreground">{record.name}</h4>
                        <p className="mt-1 text-muted-foreground text-sm">{record.description}</p>
                        <div className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
                          <span>版本: {record.version}</span>
                          <span>下载: {record.downloads.toLocaleString()}</span>
                          <span className={`rounded-full px-2 py-1 ${record.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {record.status === 'active' ? '活跃' : '非活跃'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            }}
          >
            <BaseTable columns={columns} data={mockCardData} />
          </TableProvider>
        </div>
      </div>

      {/* 列表模式 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">列表模式</h3>
        <div className="rounded-lg border p-4">
          <TableProvider
            config={{
              displayMode: 'card',
              size: 'md',
              bordered: true,
              hoverable: true,
              // 统一的行操作配置
              rowAction: rowActionConfig,
              card: {
                layout: 'list',
                gap: 8,
                shadow: false,
                titleField: 'name',
                descriptionField: 'description',
                imageField: 'icon',
              },
            }}
          >
            <BaseTable columns={columns} data={mockCardData} />
          </TableProvider>
        </div>
      </div>

      {/* 对比示例：表格视图使用相同的 rowAction 配置 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">对比：表格视图（共用相同操作）</h3>
        <p className="text-muted-foreground text-sm">展示表格视图和卡片视图如何共用同一套 rowAction 配置，确保操作行为的一致性。</p>
        <div className="rounded-lg border p-4">
          <TableProvider
            columns={columns}
            data={mockCardData}
            config={{
              displayMode: 'table', // 表格视图
              selectable: true,
              size: 'md',
              bordered: true,
              hoverable: true,
              // 使用完全相同的 rowAction 配置
              rowAction: rowActionConfig,
              pagination: {
                pageNo: 1,
                pageSize: 10,
                show: true,
                total: mockCardData.length,
              },
            }}
          >
            <EnhancedTable className="h-96" />
          </TableProvider>
        </div>
      </div>
    </div>
  );
};
