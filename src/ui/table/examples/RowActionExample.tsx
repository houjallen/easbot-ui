/**
 * 行操作功能使用示例
 * 展示如何在表格中使用行级操作功能
 */

import { AdvancedTable } from '../index';
import { Button } from '../../button';
import { TableProvider } from '../context/TableContext';
import type { TableColumn, TableRowActionConfig } from '../types/base';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Download, Share } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

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
    role: '用户',
    status: 'inactive',
    createdAt: '2024-01-17',
  },
];

export const RowActionExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>(sampleUsers);

  // 定义表格列
  const columns: TableColumn[] = [
    {
      name: 'name',
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      name: 'email',
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
    },
    {
      name: 'role',
      title: '角色',
      dataIndex: 'role',
      width: 100,
    },
    {
      name: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => (
        <span className={`rounded-full px-2 py-1 text-xs ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{value === 'active' ? '活跃' : '非活跃'}</span>
      ),
    },
    {
      name: 'createdAt',
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
    },
  ];

  // 行操作处理函数
  const handleView = (user: User) => {
    toast.success(`查看用户: ${user.name}`);
    console.log('查看用户:', user);
  };

  const handleEdit = (user: User) => {
    toast.success(`编辑用户: ${user.name}`);
    console.log('编辑用户:', user);
  };

  const handleDelete = (user: User) => {
    toast.success(`删除用户: ${user.name}`);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleDownload = (user: User) => {
    toast.success(`下载用户数据: ${user.name}`);
    console.log('下载用户数据:', user);
  };

  const handleShare = (user: User) => {
    toast.success(`分享用户: ${user.name}`);
    console.log('分享用户:', user);
  };

  // 定义行操作
  const rowActions: TableRowActionConfig[] = [
    {
      key: 'view',
      label: '查看',
      icon: Eye,
      execute: (record) => handleView(record as User),
      when: () => true, // 总是显示
    },
    {
      key: 'edit',
      label: '编辑',
      icon: Edit,
      execute: (record) => handleEdit(record as User),
      when: (record) => (record as User).status === 'active', // 只对活跃用户显示
    },
    {
      key: 'download',
      label: '下载',
      icon: Download,
      execute: (record) => handleDownload(record as User),
      when: () => true,
    },
    {
      key: 'share',
      label: '分享',
      icon: Share,
      execute: (record) => handleShare(record as User),
      when: () => true,
    },
    {
      key: 'delete',
      label: '删除',
      icon: Trash2,
      execute: (record) => handleDelete(record as User),
      when: (record) => (record as User).role !== '管理员', // 管理员不能删除
      variant: 'destructive',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-bold text-2xl">行操作功能示例</h2>
        <p className="text-muted-foreground">展示表格行级操作的各种用法，包括条件显示、不同样式等</p>
      </div>

      {/* 基础行操作示例 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">基础行操作</h3>
        <TableProvider
          columns={columns}
          data={users}
          config={{
            rowActionable: true,
            rowAction: {
              actions: rowActions,
              maxVisible: 2, // 最多显示2个按钮，其余放入更多菜单
              showLabel: false, // 不显示标签，只显示图标
            },
          }}
        >
          <AdvancedTable />
        </TableProvider>
      </div>

      {/* 显示标签的行操作示例 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">显示标签的行操作</h3>
        <TableProvider
          columns={columns}
          data={users}
          config={{
            rowActionable: true,
            rowAction: {
              actions: rowActions.slice(0, 3), // 只显示前3个操作
              maxVisible: 3,
              showLabel: true, // 显示标签
            },
          }}
        >
          <AdvancedTable />
        </TableProvider>
      </div>

      {/* 自定义渲染的行操作示例 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">自定义渲染</h3>
        <TableProvider
          columns={columns}
          data={users}
          config={{
            rowActionable: true,
            rowAction: {
              actions: [],
              render: (record) => {
                const user = record as User;
                return (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleView(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {user.status === 'active' && (
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {user.role !== '管理员' && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(user)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              },
            },
          }}
        >
          <AdvancedTable />
        </TableProvider>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 rounded-lg bg-muted p-4">
        <h4 className="mb-2 font-semibold">使用说明：</h4>
        <ul className="space-y-1 text-muted-foreground text-sm">
          <li>
            • 设置 <code>rowActionable: true</code> 启用行操作功能
          </li>
          <li>
            • 通过 <code>rowAction.actions</code> 定义操作列表
          </li>
          <li>
            • <code>maxVisible</code> 控制最多显示的按钮数量，超出部分会放入"更多"菜单
          </li>
          <li>
            • <code>showLabel</code> 控制是否显示操作标签
          </li>
          <li>
            • 每个操作可以通过 <code>when</code> 函数控制显示条件
          </li>
          <li>
            • 支持 <code>variant</code> 属性设置按钮样式（如删除操作使用 destructive）
          </li>
          <li>
            • 可以通过 <code>render</code> 函数完全自定义行操作的渲染
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RowActionExample;
