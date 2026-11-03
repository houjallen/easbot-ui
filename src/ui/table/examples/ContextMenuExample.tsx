/**
 * 表格右键菜单使用示例
 * 展示如何配置和使用表格行的右键菜单功能
 */

import React from 'react';
import { AdvancedTable } from '../organisms/AdvancedTable';
import type { ContextMenuActionConfig } from '../types/base';
import type { TableConfig } from '../types/base';
import type { TableColumn } from '../types/base';

// 示例数据
const sampleData = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    status: '激活',
    role: '管理员',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    status: '禁用',
    role: '用户',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    status: '激活',
    role: '编辑',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    status: '激活',
    role: '用户',
  },
];

// 表格列配置
const columns: TableColumn[] = [
  {
    name: 'name',
    title: '姓名',
    dataIndex: 'name',
    type: 'text',
    width: 120,
  },
  {
    name: 'email',
    title: '邮箱',
    dataIndex: 'email',
    type: 'text',
    width: 200,
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    type: 'tag',
    width: 100,
  },
  {
    name: 'role',
    title: '角色',
    dataIndex: 'role',
    type: 'text',
    width: 120,
  },
];

// 右键菜单操作配置
const contextMenuActions: ContextMenuActionConfig[] = [
  {
    key: 'view',
    label: '查看详情',
    icon: 'eye',
    priority: 1,
    group: 'view',
    execute: (record, context) => {
      console.log('查看详情:', record);
      alert(`查看用户: ${record?.name}`);
    },
  },
  {
    key: 'edit',
    label: '编辑',
    icon: 'edit',
    priority: 2,
    group: 'edit',
    execute: (record, context) => {
      console.log('编辑用户:', record);
      alert(`编辑用户: ${record?.name}`);
    },
    when: (record) => {
      // 只有激活状态的用户才能编辑
      return record?.status === '激活';
    },
  },
  {
    key: 'copy',
    label: '复制邮箱',
    icon: 'copy',
    priority: 3,
    group: 'edit',
    execute: (record, context) => {
      if (record?.email) {
        navigator.clipboard.writeText(record.email);
        alert(`已复制邮箱: ${record.email}`);
      }
    },
  },
  {
    key: 'delete',
    label: '删除',
    icon: 'trash',
    priority: 10,
    group: 'danger',
    variant: 'destructive',
    execute: (record, context) => {
      if (confirm(`确定要删除用户 ${record?.name} 吗？`)) {
        console.log('删除用户:', record);
        alert(`已删除用户: ${record?.name}`);
      }
    },
    when: (record) => {
      // 管理员不能被删除
      return record?.role !== '管理员';
    },
  },
];

// 表格配置
const tableConfig: TableConfig = {
  rowKey: 'id',
  selectable: true,
  hoverable: true,
  bordered: true,
  contextMenuable: true,
  // 启用右键菜单
  contextMenu: {
    actions: contextMenuActions,
    showIcon: true,
    showSeparator: true,
    align: 'start',
    size: 'md',
    onBeforeOpen: (record, context) => {
      console.log('右键菜单即将打开:', record);
      return true; // 返回 false 可以阻止菜单打开
    },
    onAfterClose: (record, context) => {
      console.log('右键菜单已关闭:', record);
    },
  },
};

/**
 * 右键菜单示例组件
 */
export const ContextMenuExample: React.FC = () => {
  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-bold text-2xl">表格右键菜单示例</h2>
        <p className="mb-4 text-gray-600">在表格行上右键点击可以打开上下文菜单。菜单项会根据行数据动态显示或隐藏。</p>
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-800">功能说明：</h3>
          <ul className="space-y-1 text-blue-700">
            <li>• 右键点击任意行可打开上下文菜单</li>
            <li>• 编辑功能只对"激活"状态的用户可用</li>
            <li>• 删除功能对"管理员"角色不可用</li>
            <li>• 菜单项按组分组显示，支持图标和分隔线</li>
            <li>• 支持菜单打开前和关闭后的回调</li>
          </ul>
        </div>
      </div>

      <AdvancedTable columns={columns} data={sampleData} config={tableConfig} loading={false} />
    </div>
  );
};

export default ContextMenuExample;
