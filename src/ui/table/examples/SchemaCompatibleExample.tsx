/**
 * Schema兼容性Table组件使用示例
 * 展示Table与后端Schema字段命名的完全兼容性
 * 确保前后端字段定义的一致性和互操作性
 */

import { useState } from 'react';
import { BaseTable } from '../index';
import type { TableColumn } from '../index';

// 示例数据类型（与Schema保持一致的命名）
interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: 'active' | 'inactive';
  readonly department: string;
  readonly createTime: string;
  readonly updateTime: string;
  readonly profile?: {
    readonly avatar: string;
    readonly bio: string;
  };
  // 添加索引签名以满足 TableRowData 约束
  readonly [key: string]: any;
}

// Schema兼容的示例数据
const users: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '系统管理员',
    status: 'active',
    department: '技术中心',
    createTime: '2023-01-15T08:30:00Z',
    updateTime: '2023-08-20T10:15:00Z',
    profile: {
      avatar: 'https://avatar.example.com/1.jpg',
      bio: '负责系统架构和运维工作',
    },
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: '前端开发工程师',
    status: 'active',
    department: '技术中心',
    createTime: '2023-03-20T09:00:00Z',
    updateTime: '2023-08-18T16:45:00Z',
    profile: {
      avatar: 'https://avatar.example.com/2.jpg',
      bio: '专注于React和TypeScript开发',
    },
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: 'UI/UX设计师',
    status: 'inactive',
    department: '设计中心',
    createTime: '2022-12-10T14:20:00Z',
    updateTime: '2023-06-30T11:30:00Z',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '产品经理',
    status: 'active',
    department: '产品中心',
    createTime: '2023-05-08T13:45:00Z',
    updateTime: '2023-08-22T09:20:00Z',
    profile: {
      avatar: 'https://avatar.example.com/4.jpg',
      bio: '负责产品规划和需求管理',
    },
  },
];

/**
 * Schema兼容的基础列配置
 *
 * 关键对应关系：
 * - name: 列的唯一标识（Schema中使用name而不是key）
 * - visible: 控制列显示（Schema中使用visible而不是hidden）
 * - align: 对齐方式使用 'left'|'center'|'right'（Schema标准）
 * - fixed: 固定位置使用 'left'|'right'（Schema标准）
 */
const schemaCompatibleColumns: TableColumn[] = [
  {
    name: 'name', // ✅ Schema标准：使用name作为列标识
    title: '用户姓名',
    dataIndex: 'name',
    width: 120,
    visible: true, // ✅ Schema标准：使用visible控制显示
  },
  {
    name: 'email',
    title: '邮箱地址',
    dataIndex: 'email',
    width: 200,
    ellipsis: true,
    align: 'left', // ✅ Schema标准：使用left而不是start
  },
  {
    name: 'department',
    title: '所属部门',
    dataIndex: 'department',
    width: 120,
    align: 'center', // ✅ Schema标准：center对齐
  },
  {
    name: 'role',
    title: '职务角色',
    dataIndex: 'role',
    width: 150,
    align: 'left',
  },
  {
    name: 'status',
    title: '账户状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    render: (value) => {
      const statusConfig = {
        active: {
          label: '活跃',
          className: 'bg-green-100 text-green-800 border-green-200',
        },
        inactive: {
          label: '停用',
          className: 'bg-red-100 text-red-800 border-red-200',
        },
      };
      const config = statusConfig[value as keyof typeof statusConfig];

      return <span className={`inline-flex rounded-full border px-2 py-1 font-medium text-xs ${config.className}`}>{config.label}</span>;
    },
  },
  {
    name: 'createTime',
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
    align: 'center',
    render: (value) => (
      <span className="text-gray-600 text-sm">
        {new Date(value as string).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    ),
  },
];

/**
 * Schema兼容性基础表格示例
 */
export function SchemaCompatibleTableExample() {
  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">Schema兼容性表格示例</h2>
        <p className="mb-4 text-gray-600 text-sm">展示Table与后端Schema字段命名的完全兼容性，确保前后端数据结构的一致性</p>

        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-medium text-blue-900">Schema字段映射关系</h3>
          <div className="grid grid-cols-1 gap-3 text-blue-800 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <code className="rounded bg-blue-100 px-2 py-1">name</code>
              <span>→ 列标识（替代key）</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-blue-100 px-2 py-1">visible</code>
              <span>→ 显示控制（替代hidden）</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-blue-100 px-2 py-1">align: 'left'|'center'|'right'</code>
              <span>→ 对齐方式</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-blue-100 px-2 py-1">fixed: 'left'|'right'</code>
              <span>→ 固定位置</span>
            </div>
          </div>
        </div>
      </div>

      <BaseTable columns={schemaCompatibleColumns} data={users} rowKey="id" bordered size="md" density="comfortable" />
    </div>
  );
}

/**
 * Schema兼容的固定列示例
 */
export function FixedColumnsExample() {
  const fixedColumns: TableColumn[] = [
    {
      name: 'name',
      title: '用户姓名',
      dataIndex: 'name',
      width: 120,
      fixed: 'left', // ✅ Schema标准：使用'left'而不是'start'
      className: 'font-medium',
    },
    {
      name: 'email',
      title: '邮箱地址',
      dataIndex: 'email',
      width: 220,
      ellipsis: true,
    },
    {
      name: 'department',
      title: '所属部门',
      dataIndex: 'department',
      width: 150,
      align: 'center',
    },
    {
      name: 'role',
      title: '职务角色',
      dataIndex: 'role',
      width: 180,
    },
    {
      name: 'createTime',
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
      align: 'center',
      render: (value) => <span className="text-gray-600 text-sm">{new Date(value as string).toLocaleDateString('zh-CN')}</span>,
    },
    {
      name: 'actions',
      dataIndex: 'id',
      title: '操作',
      width: 150,
      fixed: 'right', // ✅ Schema标准：使用'right'而不是'end'
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <button type="button" className="rounded bg-blue-500 px-2 py-1 text-white text-xs transition-colors hover:bg-blue-600" onClick={() => console.log('查看用户:', record.name)}>
            查看
          </button>
          <button type="button" className="rounded bg-green-500 px-2 py-1 text-white text-xs transition-colors hover:bg-green-600" onClick={() => console.log('编辑用户:', record.name)}>
            编辑
          </button>
          <button type="button" className="rounded bg-red-500 px-2 py-1 text-white text-xs transition-colors hover:bg-red-600" onClick={() => console.log('删除用户:', record.name)}>
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">Schema兼容的固定列示例</h2>
        <p className="mb-4 text-gray-600 text-sm">展示Table的列固定功能，使用Schema标准的fixed属性（left/right）</p>
      </div>

      <div className="rounded-lg border">
        <BaseTable columns={fixedColumns} data={users} rowKey="id" scroll={{ x: 900 }} bordered stickyHeader />
      </div>
    </div>
  );
}

/**
 * Schema兼容的动态列显示示例
 */
export function DynamicColumnsExample() {
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    department: true,
    role: true,
    status: true,
    createTime: true,
  });

  // 基于可见性动态生成列配置
  const dynamicColumns: TableColumn[] = schemaCompatibleColumns.map((col) => ({
    ...col,
    visible: visibleColumns[col.name as keyof typeof visibleColumns] !== false,
  }));

  const toggleColumn = (columnName: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">Schema兼容的动态列显示</h2>
        <p className="mb-4 text-gray-600 text-sm">使用Schema标准的visible属性动态控制列的显示和隐藏</p>

        <div className="mb-4 rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-3 font-medium">列显示控制</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.entries(visibleColumns).map(([key, visible]) => {
              const labels = {
                name: '用户姓名',
                email: '邮箱地址',
                department: '所属部门',
                role: '职务角色',
                status: '账户状态',
                createTime: '创建时间',
              };

              return (
                <label key={key} className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={visible} onChange={() => toggleColumn(key as keyof typeof visibleColumns)} className="rounded" />
                  <span className="text-sm">{labels[key as keyof typeof labels]}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <BaseTable columns={dynamicColumns} data={users} rowKey="id" bordered striped />
    </div>
  );
}

/**
 * Schema兼容性示例集合 - 展示与后端Schema完全兼容的表格实现
 */
export function SchemaCompatibleExamples() {
  return (
    <div className="space-y-12">
      {/* 基础Schema兼容性 */}
      <SchemaCompatibleTableExample />

      {/* 固定列功能 */}
      <FixedColumnsExample />

      {/* 动态列显示 */}
      <DynamicColumnsExample />
    </div>
  );
}

// 默认导出
export default SchemaCompatibleExamples;
