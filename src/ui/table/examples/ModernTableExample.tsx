/**
 * 现代化Table组件使用示例
 * 展示Table组件的现代化功能和最佳实践
 * 所有功能都基于Table组件实际支持的特性
 */

import React, { useState } from 'react';
import { BaseTable } from '../index';
import type { TableColumn } from '../index';

// 示例数据类型
interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: 'active' | 'inactive';
  readonly department: string;
  readonly joinDate: string;
  readonly profile?: {
    readonly avatar: string;
    readonly bio: string;
  };
  // 添加索引签名以满足 TableRowData 约束
  readonly [key: string]: any;
}

// 示例数据 - 更丰富的数据集
const users: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: 'active',
    department: '技术部',
    joinDate: '2023-01-15',
    profile: {
      avatar: 'https://avatar.example.com/1.jpg',
      bio: '系统管理员，负责平台架构',
    },
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: '开发者',
    status: 'active',
    department: '技术部',
    joinDate: '2023-03-20',
    profile: {
      avatar: 'https://avatar.example.com/2.jpg',
      bio: '前端开发工程师',
    },
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: '设计师',
    status: 'inactive',
    department: '设计部',
    joinDate: '2022-12-10',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '产品经理',
    status: 'active',
    department: '产品部',
    joinDate: '2023-05-08',
    profile: {
      avatar: 'https://avatar.example.com/4.jpg',
      bio: '负责产品规划和需求管理',
    },
  },
  {
    id: 5,
    name: '钱七',
    email: 'qianqi@example.com',
    role: '测试工程师',
    status: 'active',
    department: '质量部',
    joinDate: '2023-02-28',
  },
];

// 基础列配置 - 展示Table支持的核心功能
const basicColumns: TableColumn[] = [
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
    ellipsis: true, // 支持文本省略
  },
  {
    name: 'department',
    title: '部门',
    dataIndex: 'department',
    width: 120,
    align: 'center',
  },
  {
    name: 'role',
    title: '角色',
    dataIndex: 'role',
    width: 120,
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    render: (value) => (
      <span className={`inline-flex rounded-full px-2 py-1 font-medium text-xs ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {value === 'active' ? '活跃' : '禁用'}
      </span>
    ),
  },
];

// 高级列配置 - 展示更多Table功能
const advancedColumns: TableColumn[] = [
  {
    name: 'avatar',
    title: '头像',
    dataIndex: 'profile.avatar', // 支持嵌套属性访问
    width: 80,
    align: 'center',
    render: (value, record) =>
      value ? (
        <img
          src={value as string}
          alt={`${record.name}的头像`}
          className="h-8 w-8 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 font-medium text-sm text-white">{record.name.charAt(0)}</div>
      ),
  },
  ...basicColumns,
  {
    name: 'joinDate',
    title: '入职日期',
    dataIndex: 'joinDate',
    width: 120,
    render: (value) => <span className="text-gray-600 text-sm">{new Date(value as string).toLocaleDateString('zh-CN')}</span>,
  },
  {
    name: 'actions',
    title: '操作',
    width: 150,
    dataIndex: 'id',
    align: 'center',
    render: (_, record) => (
      <div className="flex justify-center gap-2">
        <button type="button" className="rounded bg-blue-500 px-3 py-1 text-white text-xs transition-colors hover:bg-blue-600" onClick={() => console.log('查看用户:', record.name)}>
          查看
        </button>
        <button type="button" className="rounded bg-green-500 px-3 py-1 text-white text-xs transition-colors hover:bg-green-600" onClick={() => console.log('编辑用户:', record.name)}>
          编辑
        </button>
      </div>
    ),
  },
];

/**
 * 基础表格示例 - 展示Table的核心功能
 */
export function BasicTableExample() {
  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">基础表格示例</h2>
        <p className="mb-4 text-gray-600 text-sm">展示Table的基础功能：数据展示、列配置、文本省略等</p>
      </div>
      <BaseTable columns={basicColumns} data={users} rowKey="id" bordered size="md" density="comfortable" />
    </div>
  );
}

/**
 * 尺寸和密度示例 - 展示Table的不同尺寸和密度设置
 */
export function SizeAndDensityExample() {
  const [currentSize, setCurrentSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [currentDensity, setCurrentDensity] = useState<'compact' | 'comfortable'>('comfortable');

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">尺寸和密度设置示例</h2>
        <p className="mb-4 text-gray-600 text-sm">Table支持三种尺寸（sm/md/lg）和两种密度（compact/comfortable）</p>

        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">尺寸:</span>
            <select value={currentSize} onChange={(e) => setCurrentSize(e.target.value as any)} className="rounded border px-2 py-1 text-sm">
              <option value="sm">小型 (sm)</option>
              <option value="md">中型 (md)</option>
              <option value="lg">大型 (lg)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">密度:</span>
            <select value={currentDensity} onChange={(e) => setCurrentDensity(e.target.value as any)} className="rounded border px-2 py-1 text-sm">
              <option value="compact">紧凑 (compact)</option>
              <option value="comfortable">舒适 (comfortable)</option>
            </select>
          </div>
        </div>
      </div>

      <BaseTable columns={basicColumns} data={users} rowKey="id" bordered size={currentSize} density={currentDensity} />
    </div>
  );
}

/**
 * 表格状态示例 - 展示加载、错误、空数据状态
 */
export function TableStatesExample() {
  const [currentState, setCurrentState] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal');

  const getCurrentData = () => {
    switch (currentState) {
      case 'loading':
      case 'error':
      case 'empty':
        return [];
      default:
        return users;
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">表格状态示例</h2>
        <p className="mb-4 text-gray-600 text-sm">Table支持多种状态：正常、加载中、错误、空数据</p>

        <div className="mb-4 flex gap-2">
          {[
            { key: 'normal', label: '正常状态' },
            { key: 'loading', label: '加载中' },
            { key: 'error', label: '错误状态' },
            { key: 'empty', label: '空数据' },
          ].map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => setCurrentState(key as any)}
              className={`rounded px-3 py-1 text-sm transition-colors ${currentState === key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <BaseTable
        columns={basicColumns}
        data={getCurrentData()}
        rowKey="id"
        bordered
        loading={currentState === 'loading'}
        error={currentState === 'error' ? '数据加载失败，请重试' : undefined}
        empty={currentState === 'empty' ? '暂无用户数据' : undefined}
      />
    </div>
  );
}

/**
 * 滚动和粘性表头示例 - 展示Table的滚动和粘性功能
 */
export function ScrollAndStickyExample() {
  const [enableSticky, setEnableSticky] = useState(true);

  // 创建更多数据用于滚动演示
  const moreUsers = [...Array(20)].map((_, index) => {
    const user = users[index % users.length]!;
    return {
      ...user,
      id: index + 1,
      name: `${user.name} ${Math.floor(index / users.length) + 1}`,
      email: `user${index + 1}@example.com`,
    };
  });

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">滚动和粘性表头示例</h2>
        <p className="mb-4 text-gray-600 text-sm">Table支持滚动和粘性表头功能，适用于大量数据展示</p>

        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" id="sticky-toggle" checked={enableSticky} onChange={(e) => setEnableSticky(e.target.checked)} />
          <label htmlFor="sticky-toggle" className="text-sm">
            启用粘性表头
          </label>
        </div>
      </div>

      <div className="rounded-lg border">
        <BaseTable columns={advancedColumns} data={moreUsers} rowKey="id" bordered scroll={{ y: 400, x: 900 }} stickyHeader={enableSticky} stickyHeaderOffset={0} />
      </div>
    </div>
  );
}

/**
 * 交互和事件示例 - 展示Table的交互功能
 */
export function InteractiveTableExample() {
  const [lastClickedUser, setLastClickedUser] = useState<string | null>(null);
  const [lastDoubleClickedUser, setLastDoubleClickedUser] = useState<string | null>(null);

  const handleRowClick = (record: Record<string, any>, index: number, event: React.MouseEvent) => {
    console.log('行点击:', { record, index, event });
    setLastClickedUser(record.name);
  };

  const handleRowDoubleClick = (record: Record<string, any>, index: number, event: React.MouseEvent) => {
    console.log('行双击:', { record, index, event });
    setLastDoubleClickedUser(record.name);
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">交互和事件示例</h2>
        <p className="mb-4 text-gray-600 text-sm">Table支持行点击和双击事件，可用于构建交互式表格</p>

        <div className="mb-4 grid grid-cols-2 gap-4 rounded bg-gray-50 p-3">
          <div className="text-sm">
            <span className="font-medium">最后点击:</span>
            <span className="ml-2 text-blue-600">{lastClickedUser || '无'}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">最后双击:</span>
            <span className="ml-2 text-purple-600">{lastDoubleClickedUser || '无'}</span>
          </div>
        </div>
      </div>

      <BaseTable columns={advancedColumns} data={users} rowKey="id" bordered striped onRowClick={handleRowClick} onRowDoubleClick={handleRowDoubleClick} className="shadow-sm" />
    </div>
  );
}

/**
 * 条纹和样式示例 - 展示Table的样式功能
 */
export function StripedAndStyleExample() {
  const [enableStripes, setEnableStripes] = useState(true);
  const [enableBorder, setEnableBorder] = useState(true);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">条纹和样式示例</h2>
        <p className="mb-4 text-gray-600 text-sm">Table支持条纹显示和边框控制，提供更好的视觉效果</p>

        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enableStripes} onChange={(e) => setEnableStripes(e.target.checked)} />
            <span className="text-sm">显示条纹</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enableBorder} onChange={(e) => setEnableBorder(e.target.checked)} />
            <span className="text-sm">显示边框</span>
          </label>
        </div>
      </div>

      <BaseTable columns={basicColumns} data={users} rowKey="id" striped={enableStripes} bordered={enableBorder} className="shadow-sm" />
    </div>
  );
}

/**
 * 所有现代化功能合集 - 展示Table的全部支持功能
 */
export function AllModernExamples() {
  return (
    <div className="space-y-12">
      {/* 基础功能 */}
      <BasicTableExample />

      {/* 尺寸和密度 */}
      <SizeAndDensityExample />

      {/* 表格状态 */}
      <TableStatesExample />

      {/* 滚动和粘性 */}
      <ScrollAndStickyExample />

      {/* 交互和事件 */}
      <InteractiveTableExample />

      {/* 样式和外观 */}
      <StripedAndStyleExample />
    </div>
  );
}

// 默认导出
export default AllModernExamples;
