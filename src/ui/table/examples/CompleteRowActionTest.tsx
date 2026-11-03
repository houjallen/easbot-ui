/**
 * 行操作功能完整测试示例
 * 验证resize、固定列、colgroup生成等所有相关功能
 */

import { Badge } from '../../badge';
import { Button } from '../../button';
import { Card, CardContent, CardHeader, CardTitle } from '../../card';
import { Label } from '../../label';
import { Switch } from '../../switch';
import { TableProvider } from '../context/TableContext';
import { BaseTable } from '../organisms/BaseTable';
import type { TableColumn, TableRowActionConfig } from '../types/base';
import { Plus } from 'lucide-react';
import { Download, Edit, Eye, Settings, Share, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

// 测试数据类型
interface TestItem {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// 测试数据
const testData: TestItem[] = [
  {
    id: '1',
    name: '功能开发任务A',
    category: '开发',
    status: 'active',
    priority: 'high',
    assignee: '张三',
    progress: 75,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    name: '测试用例编写B',
    category: '测试',
    status: 'pending',
    priority: 'medium',
    assignee: '李四',
    progress: 30,
    createdAt: '2024-01-16',
    updatedAt: '2024-01-19',
  },
  {
    id: '3',
    name: '文档更新任务C',
    category: '文档',
    status: 'inactive',
    priority: 'low',
    assignee: '王五',
    progress: 100,
    createdAt: '2024-01-17',
    updatedAt: '2024-01-18',
  },
  {
    id: '4',
    name: '性能优化任务D',
    category: '优化',
    status: 'active',
    priority: 'high',
    assignee: '赵六',
    progress: 45,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-21',
  },
  {
    id: '5',
    name: '代码重构任务E',
    category: '重构',
    status: 'pending',
    priority: 'medium',
    assignee: '钱七',
    progress: 0,
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19',
  },
];

export const CompleteRowActionTest: React.FC = () => {
  const [data, setData] = useState<TestItem[]>(testData);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 配置状态
  const [fixedable, setFixedable] = useState(true);
  const [resizeable, setResizeable] = useState(true);
  const [selectable, setSelectable] = useState(true);
  const [expandable, setExpandable] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const [maxVisible, setMaxVisible] = useState(3);

  // 定义表格列
  const columns: TableColumn[] = [
    {
      name: 'name',
      title: '任务名称',
      dataIndex: 'name',
      width: 200,
      minWidth: 150,
      maxWidth: 300,
      fixed: 'left', // 左固定
      render: (value: string) => <div className="font-medium text-gray-900">{value}</div>,
    },
    {
      name: 'category',
      title: '分类',
      dataIndex: 'category',
      width: 100,
      minWidth: 80,
      maxWidth: 150,
      render: (value: string) => <Badge variant="secondary">{value}</Badge>,
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
          active: { label: '进行中', className: 'bg-blue-100 text-blue-800' },
          pending: {
            label: '待处理',
            className: 'bg-yellow-100 text-yellow-800',
          },
          inactive: {
            label: '已完成',
            className: 'bg-green-100 text-green-800',
          },
        };
        const status = statusMap[value as keyof typeof statusMap];
        return <span className={`rounded-full px-2 py-1 text-xs ${status.className}`}>{status.label}</span>;
      },
    },
    {
      name: 'priority',
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      minWidth: 80,
      maxWidth: 150,
      render: (value: string) => {
        const priorityMap = {
          high: { label: '高', className: 'bg-red-100 text-red-800' },
          medium: { label: '中', className: 'bg-orange-100 text-orange-800' },
          low: { label: '低', className: 'bg-gray-100 text-gray-800' },
        };
        const priority = priorityMap[value as keyof typeof priorityMap];
        return <span className={`rounded-full px-2 py-1 text-xs ${priority.className}`}>{priority.label}</span>;
      },
    },
    {
      name: 'assignee',
      title: '负责人',
      dataIndex: 'assignee',
      width: 120,
      minWidth: 100,
      maxWidth: 180,
    },
    {
      name: 'progress',
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      minWidth: 100,
      maxWidth: 180,
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="h-2 flex-1 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
          </div>
          <span className="text-gray-600 text-sm">{value}%</span>
        </div>
      ),
    },
    {
      name: 'updatedAt',
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 120,
      minWidth: 100,
      maxWidth: 180,
      fixed: 'right', // 右固定（行操作列会在此列右侧）
    },
  ];

  // 行操作处理函数
  const handleView = (item: TestItem) => {
    toast.success(`查看任务: ${item.name}`);
  };

  const handleEdit = (item: TestItem) => {
    toast.success(`编辑任务: ${item.name}`);
  };

  const handleDelete = (item: TestItem) => {
    toast.success(`删除任务: ${item.name}`);
    setData((prev) => prev.filter((d) => d.id !== item.id));
  };

  const handleDownload = (item: TestItem) => {
    toast.success(`下载任务数据: ${item.name}`);
  };

  const handleShare = (item: TestItem) => {
    toast.success(`分享任务: ${item.name}`);
  };

  const handleSettings = (item: TestItem) => {
    toast.success(`任务设置: ${item.name}`);
  };

  // 定义行操作
  const rowActions: TableRowActionConfig[] = [
    {
      key: 'view',
      label: '查看',
      icon: Eye,
      execute: (record?: Record<string, any>) => handleView(record as TestItem),
      when: () => true,
    },
    {
      key: 'edit',
      label: '编辑',
      icon: Edit,
      execute: (record?: Record<string, any>) => handleEdit(record as TestItem),
      when: (record?: Record<string, any>) => (record as TestItem).status !== 'inactive',
    },
    {
      key: 'download',
      label: '下载',
      icon: Download,
      execute: (record?: Record<string, any>) => handleDownload(record as TestItem),
      when: () => true,
    },
    {
      key: 'share',
      label: '分享',
      icon: Share,
      execute: (record?: Record<string, any>) => handleShare(record as TestItem),
      when: (record?: Record<string, any>) => (record as TestItem).status === 'active',
    },
    {
      key: 'settings',
      label: '设置',
      icon: Settings,
      execute: (record?: Record<string, any>) => handleSettings(record as TestItem),
      when: () => true,
    },
    {
      key: 'delete',
      label: '删除',
      icon: Trash2,
      execute: (record?: Record<string, any>) => handleDelete(record as TestItem),
      when: (record?: Record<string, any>) => (record as TestItem).progress === 0,
      variant: 'destructive',
    },
  ];

  const addNewItem = () => {
    const newItem: TestItem = {
      id: Date.now().toString(),
      name: `新任务 ${data.length + 1}`,
      category: '开发',
      status: 'pending',
      priority: 'medium',
      assignee: '新用户',
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0] ?? '',
      updatedAt: new Date().toISOString().split('T')[0] ?? '',
    };
    setData((prev) => [...prev, newItem]);
    toast.success('已添加新任务');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">行操作功能完整测试</h2>
          <p className="text-muted-foreground">测试resize、固定列、colgroup生成等所有功能</p>
        </div>
        <Button onClick={addNewItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          添加任务
        </Button>
      </div>

      {/* 配置面板 */}
      <Card>
        <CardHeader>
          <CardTitle>功能配置面板</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Switch id="fixedable" checked={fixedable} onCheckedChange={setFixedable} />
              <Label htmlFor="fixedable">固定列功能</Label>
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
              <Label htmlFor="maxVisible">最大显示操作:</Label>
              <select id="maxVisible" value={maxVisible} onChange={(e) => setMaxVisible(Number(e.target.value))} className="rounded border px-2 py-1">
                <option value={1}>1个</option>
                <option value={2}>2个</option>
                <option value={3}>3个</option>
                <option value={4}>4个</option>
                <option value={5}>5个</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状态显示 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="font-medium">已选择行数:</span> {selectedRows.length}
            </div>
            <div>
              <span className="font-medium">总数据量:</span> {data.length}
            </div>
            <div>
              <span className="font-medium">固定列状态:</span>
              <span className={fixedable ? 'text-green-600' : 'text-gray-500'}>{fixedable ? '已启用' : '已禁用'}</span>
            </div>
            <div>
              <span className="font-medium">Resize状态:</span>
              <span className={resizeable ? 'text-green-600' : 'text-gray-500'}>{resizeable ? '已启用' : '已禁用'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <TableProvider
            columns={columns}
            data={data}
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
              selection: {
                selectedRowKeys: selectedRows,
                onSelectionChange: (keys) => setSelectedRows(keys.map(String)),
              },
              expansion: {
                renderExpandedRow: (record: Record<string, any>) => {
                  const item = record as TestItem;
                  return (
                    <div className="border-t bg-gray-50 p-4">
                      <h4 className="mb-2 font-semibold">任务详细信息</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">任务ID:</span> {item.id}
                        </div>
                        <div>
                          <span className="font-medium">创建时间:</span> {item.createdAt}
                        </div>
                        <div>
                          <span className="font-medium">当前进度:</span> {item.progress}%
                        </div>
                        <div>
                          <span className="font-medium">最后更新:</span> {item.updatedAt}
                        </div>
                      </div>
                    </div>
                  );
                },
              },
            }}
          >
            <BaseTable columns={columns} data={data} />
          </TableProvider>
        </CardContent>
      </Card>

      {/* 测试说明 */}
      <Card>
        <CardHeader>
          <CardTitle>测试验证项目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="mb-2 font-semibold text-green-600">✅ 已验证功能:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>行操作列类型定义正确（FixedPosition类型）</li>
                <li>行操作列在fixedable开启时自动固定到右侧</li>
                <li>TableColumnResizer正确排除行操作列的resize功能</li>
                <li>calculateFixedColumnStyles函数支持hasRowAction参数</li>
                <li>colgroup正确生成包含行操作列的宽度配置</li>
                <li>BaseTable中行操作列使用finalRowAction.fixed属性</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-blue-600">🔧 功能特性:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>任务名称列固定在左侧，更新时间列固定在右侧</li>
                <li>行操作列自动固定在最右侧（当fixedable开启时）</li>
                <li>所有普通列支持拖拽调整宽度（当resizeable开启时）</li>
                <li>行操作根据数据状态动态显示（如删除仅对进度为0的任务显示）</li>
                <li>支持操作数量控制和标签显示切换</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-orange-600">🧪 测试操作:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>切换各项配置开关，观察表格行为变化</li>
                <li>拖拽列边界调整宽度，验证resize功能</li>
                <li>点击行操作按钮，验证功能正常</li>
                <li>选择行并展开，验证选择和展开功能</li>
                <li>添加新任务，验证数据更新后的表格状态</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteRowActionTest;
