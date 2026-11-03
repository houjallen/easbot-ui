/**
 * 行操作列resize和固定列功能测试示例
 * 验证行操作列在fixedable和resizeable模式下的完整功能
 */

import { AdvancedTable } from '../index';
import { Card, CardContent, CardHeader, CardTitle } from '../../card';
import { Label } from '../../label';
import { Switch } from '../../switch';
import { TableProvider } from '../context/TableContext';
import type { TableColumn, TableRowActionConfig } from '../types/base';
import { Download, Edit, Eye, Settings, Share, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

// 示例数据类型
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  description: string;
}

// 示例数据
const sampleProducts: Product[] = [
  {
    id: '1',
    name: '智能手机 Pro Max',
    category: '电子产品',
    price: 8999,
    stock: 150,
    status: 'active',
    createdAt: '2024-01-15',
    description: '最新款智能手机，配备先进的AI芯片',
  },
  {
    id: '2',
    name: '无线耳机',
    category: '音频设备',
    price: 299,
    stock: 80,
    status: 'active',
    createdAt: '2024-01-16',
    description: '高品质无线蓝牙耳机',
  },
  {
    id: '3',
    name: '笔记本电脑',
    category: '电脑设备',
    price: 12999,
    stock: 25,
    status: 'inactive',
    createdAt: '2024-01-17',
    description: '轻薄便携商务笔记本',
  },
  {
    id: '4',
    name: '智能手表',
    category: '可穿戴设备',
    price: 1999,
    stock: 0,
    status: 'discontinued',
    createdAt: '2024-01-18',
    description: '多功能健康监测智能手表',
  },
  {
    id: '5',
    name: '平板电脑',
    category: '电子产品',
    price: 3999,
    stock: 60,
    status: 'active',
    createdAt: '2024-01-19',
    description: '高性能创作平板电脑',
  },
];

export const RowActionResizeExample: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 功能开关状态
  const [fixedable, setFixedable] = useState(true);
  const [resizeable, setResizeable] = useState(true);
  const [selectable, setSelectable] = useState(true);
  const [expandable, setExpandable] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const [maxVisible, setMaxVisible] = useState(2);

  // 定义表格列
  const columns: TableColumn[] = [
    {
      name: 'name',
      title: '产品名称',
      dataIndex: 'name',
      width: 200,
      minWidth: 150,
      maxWidth: 300,
      fixed: 'left', // 测试左固定列
    },
    {
      name: 'category',
      title: '分类',
      dataIndex: 'category',
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      name: 'price',
      title: '价格',
      dataIndex: 'price',
      width: 100,
      minWidth: 80,
      maxWidth: 150,
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      name: 'stock',
      title: '库存',
      dataIndex: 'stock',
      width: 80,
      minWidth: 60,
      maxWidth: 120,
      render: (value: number) => <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>{value}</span>,
    },
    {
      name: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      minWidth: 80,
      maxWidth: 150,
      render: (value: string) => {
        const statusMap = {
          active: { label: '正常', className: 'bg-green-100 text-green-800' },
          inactive: {
            label: '停用',
            className: 'bg-yellow-100 text-yellow-800',
          },
          discontinued: { label: '停产', className: 'bg-red-100 text-red-800' },
        };
        const status = statusMap[value as keyof typeof statusMap];
        return <span className={`rounded-full px-2 py-1 text-xs ${status.className}`}>{status.label}</span>;
      },
    },
    {
      name: 'createdAt',
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
      minWidth: 100,
      maxWidth: 180,
      fixed: 'right', // 测试右固定列
    },
  ];

  // 行操作处理函数
  const handleView = (product: Product) => {
    toast.success(`查看产品: ${product.name}`);
  };

  const handleEdit = (product: Product) => {
    toast.success(`编辑产品: ${product.name}`);
  };

  const handleDelete = (product: Product) => {
    toast.success(`删除产品: ${product.name}`);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleDownload = (product: Product) => {
    toast.success(`下载产品数据: ${product.name}`);
  };

  const handleShare = (product: Product) => {
    toast.success(`分享产品: ${product.name}`);
  };

  const handleSettings = (product: Product) => {
    toast.success(`产品设置: ${product.name}`);
  };

  // 定义行操作
  const rowActions: TableRowActionConfig[] = [
    {
      key: 'view',
      label: '查看',
      icon: Eye,
      execute: (record) => handleView(record as Product),
      when: () => true,
    },
    {
      key: 'edit',
      label: '编辑',
      icon: Edit,
      execute: (record) => handleEdit(record as Product),
      when: (record) => (record as Product).status !== 'discontinued',
    },
    {
      key: 'download',
      label: '下载',
      icon: Download,
      execute: (record) => handleDownload(record as Product),
      when: () => true,
    },
    {
      key: 'share',
      label: '分享',
      icon: Share,
      execute: (record) => handleShare(record as Product),
      when: (record) => (record as Product).status === 'active',
    },
    {
      key: 'settings',
      label: '设置',
      icon: Settings,
      execute: (record) => handleSettings(record as Product),
      when: () => true,
    },
    {
      key: 'delete',
      label: '删除',
      icon: Trash2,
      execute: (record) => handleDelete(record as Product),
      when: (record) => (record as Product).stock === 0,
      variant: 'destructive',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-bold text-2xl">行操作列Resize和固定列测试</h2>
        <p className="text-muted-foreground">测试行操作列在不同配置下的resize和固定列功能</p>
      </div>

      {/* 功能控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>功能配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Switch id="fixedable" checked={fixedable} onCheckedChange={setFixedable} />
              <Label htmlFor="fixedable">固定列</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="resizeable" checked={resizeable} onCheckedChange={setResizeable} />
              <Label htmlFor="resizeable">列宽调整</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="selectable" checked={selectable} onCheckedChange={setSelectable} />
              <Label htmlFor="selectable">行选择</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="expandable" checked={expandable} onCheckedChange={setExpandable} />
              <Label htmlFor="expandable">行展开</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="showLabel" checked={showLabel} onCheckedChange={setShowLabel} />
              <Label htmlFor="showLabel">显示操作标签</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="maxVisible">最大显示操作数:</Label>
              <select id="maxVisible" value={maxVisible} onChange={(e) => setMaxVisible(Number(e.target.value))} className="rounded border px-2 py-1">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 表格展示 */}
      <Card>
        <CardHeader>
          <CardTitle>产品列表</CardTitle>
        </CardHeader>
        <CardContent>
          <TableProvider
            columns={columns}
            data={products}
            config={{
              fixedable,
              resizeable,
              selectable,
              expandable,
              rowActionable: true,
              rowAction: {
                actions: rowActions,
                maxVisible,
                showLabel,
              },
            }}
          >
            <AdvancedTable />
          </TableProvider>
        </CardContent>
      </Card>

      {/* 功能说明 */}
      <Card>
        <CardHeader>
          <CardTitle>测试说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold">固定列测试:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>产品名称列固定在左侧</li>
                <li>创建时间列固定在右侧</li>
                <li>行操作列在fixedable开启时自动固定在最右侧</li>
                <li>选择列和展开列在fixedable开启时自动固定在最左侧</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Resize测试:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>所有普通列都支持拖拽调整宽度</li>
                <li>行操作列、选择列、展开列不支持resize</li>
                <li>每列都有最小宽度和最大宽度限制</li>
                <li>colgroup会正确生成包含所有列的宽度信息</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">行操作测试:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>根据产品状态动态显示不同操作</li>
                <li>支持操作数量限制和更多菜单</li>
                <li>支持显示/隐藏操作标签</li>
                <li>操作按钮支持不同样式（如删除为destructive）</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RowActionResizeExample;
