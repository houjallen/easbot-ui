/**
 * 表格右键菜单与插件集成示例
 * 展示如何同时使用配置操作和插件操作
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
    createTime: '2024-01-15',
    lastLogin: '2024-01-20 10:30:00',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    status: '禁用',
    role: '用户',
    createTime: '2024-01-16',
    lastLogin: '2024-01-19 14:20:00',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    status: '激活',
    role: '编辑',
    createTime: '2024-01-17',
    lastLogin: '2024-01-21 09:15:00',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    status: '激活',
    role: '用户',
    createTime: '2024-01-18',
    lastLogin: '2024-01-20 16:45:00',
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
  {
    name: 'createTime',
    title: '创建时间',
    dataIndex: 'createTime',
    type: 'date',
    width: 120,
  },
  {
    name: 'lastLogin',
    title: '最后登录',
    dataIndex: 'lastLogin',
    type: 'text',
    width: 150,
  },
];

// 配置的右键菜单操作（业务相关）
const contextMenuActions: ContextMenuActionConfig[] = [
  {
    key: 'view-profile',
    label: '查看资料',
    icon: 'user',
    priority: 1,
    group: 'view',
    execute: (record, context) => {
      console.log('查看用户资料:', record);
      alert(`查看用户资料: ${record?.name}\n邮箱: ${record?.email}\n角色: ${record?.role}`);
    },
  },
  {
    key: 'send-email',
    label: '发送邮件',
    icon: 'mail',
    priority: 2,
    group: 'communication',
    execute: (record, context) => {
      if (record?.email) {
        window.open(`mailto:${record.email}?subject=Hello&body=Hi ${record.name},`);
      }
    },
    when: (record) => {
      return !!record?.email;
    },
  },
  {
    key: 'toggle-status',
    label: (record) => (record?.status === '激活' ? '禁用用户' : '激活用户'),
    icon: (record) => (record?.status === '激活' ? 'user-x' : 'user-check'),
    priority: 5,
    group: 'management',
    variant: 'outline',
    execute: (record, context) => {
      const newStatus = record?.status === '激活' ? '禁用' : '激活';
      if (confirm(`确定要${newStatus}用户 ${record?.name} 吗？`)) {
        console.log(`${newStatus}用户:`, record);
        alert(`已${newStatus}用户: ${record?.name}`);
        // 这里可以调用API更新状态
      }
    },
    when: (record) => {
      // 管理员不能被禁用
      return record?.role !== '管理员' || record?.status !== '激活';
    },
  },
  {
    key: 'reset-password',
    label: '重置密码',
    icon: 'key',
    priority: 6,
    group: 'management',
    execute: (record, context) => {
      if (confirm(`确定要重置用户 ${record?.name} 的密码吗？`)) {
        console.log('重置密码:', record);
        alert(`已为用户 ${record?.name} 重置密码，新密码已发送到邮箱`);
      }
    },
    when: (record) => {
      return record?.status === '激活';
    },
  },
  {
    key: 'delete-user',
    label: '删除用户',
    icon: 'trash-2',
    priority: 10,
    group: 'danger',
    variant: 'destructive',
    execute: (record, context) => {
      if (confirm(`确定要删除用户 ${record?.name} 吗？此操作不可撤销！`)) {
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
  // 启用插件系统
  pluginable: true,
  // 启用右键菜单
  contextMenu: {
    actions: contextMenuActions,
    showIcon: true,
    showSeparator: true,
    align: 'start',
    size: 'lg',
    onBeforeOpen: (record, context) => {
      console.log('右键菜单即将打开:', record);
      return true;
    },
    onAfterClose: (record, context) => {
      console.log('右键菜单已关闭:', record);
    },
  },
  // 插件配置
  plugin: {
    enabled: true,
    plugins: [],
    context: {
      // 插件配置
      'row-context-menu-plugin': {
        enabled: true,
        showCopy: true,
        showExport: true,
        showRefresh: true,
      },
    },
  },
};

/**
 * 右键菜单与插件集成示例组件
 */
export const ContextMenuWithPluginExample: React.FC = () => {
  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-bold text-2xl">表格右键菜单与插件集成示例</h2>
        <p className="mb-4 text-gray-600">展示如何同时使用配置操作和插件操作来构建丰富的右键菜单功能。</p>
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-800">功能特性：</h3>
          <div className="grid grid-cols-1 gap-4 text-green-700 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">配置操作（业务相关）：</h4>
              <ul className="space-y-1 text-sm">
                <li>• 查看用户资料</li>
                <li>• 发送邮件</li>
                <li>• 切换用户状态</li>
                <li>• 重置密码</li>
                <li>• 删除用户</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">插件操作（通用功能）：</h4>
              <ul className="space-y-1 text-sm">
                <li>• 复制行数据到剪贴板</li>
                <li>• 导出行数据为JSON文件</li>
                <li>• 刷新行数据</li>
                <li>• 支持加载状态显示</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="mb-2 font-semibold text-yellow-800">交互说明：</h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            <li>• 右键点击任意行可打开上下文菜单</li>
            <li>• 菜单项会根据用户角色和状态动态显示</li>
            <li>• 管理员用户有特殊的权限限制</li>
            <li>• 插件操作和配置操作会按组分类显示</li>
            <li>• 支持图标、工具提示和分隔线</li>
          </ul>
        </div>
      </div>

      <AdvancedTable columns={columns} data={sampleData} config={tableConfig} loading={false} />
    </div>
  );
};

export default ContextMenuWithPluginExample;
