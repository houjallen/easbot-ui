/**
 * ModernTable 组件 Storybook 示例
 * 展示现代化表格组件的全部功能和最佳实践
 */

import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from 'storybook/test';
// 导入Table用于Configurable示例
import { BaseTable } from '../../index';
import type { TableColumn } from '../../index';
import { TableProvider } from '../../context/TableContext';
import { AllModernExamples, BasicTableExample, InteractiveTableExample, ScrollAndStickyExample, SizeAndDensityExample, StripedAndStyleExample, TableStatesExample } from '../ModernTableExample';

/**
 * 示例数据（与 ModernTableExample 内部数据保持一致）
 * BaseTable 的数据来自 TableContext 上下文，Provider 的 data 需与示例渲染的数据一致
 */
const modernUsers = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: 'active',
    department: '技术部',
    joinDate: '2023-01-15',
    profile: { avatar: 'https://avatar.example.com/1.jpg', bio: '系统管理员，负责平台架构' },
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: '开发者',
    status: 'active',
    department: '技术部',
    joinDate: '2023-03-20',
    profile: { avatar: 'https://avatar.example.com/2.jpg', bio: '前端开发工程师' },
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
    profile: { avatar: 'https://avatar.example.com/4.jpg', bio: '负责产品规划和需求管理' },
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

/** 滚动演示用的扩展数据（20 条） */
const modernMoreUsers = [...Array(20)].map((_, index) => {
  const user = modernUsers[index % modernUsers.length]!;
  return {
    ...user,
    id: index + 1,
    name: `${user.name} ${Math.floor(index / modernUsers.length) + 1}`,
    email: `user${index + 1}@example.com`,
  };
});

/** 基础列配置 */
const modernBasicColumns: TableColumn[] = [
  { name: 'name', title: '姓名', dataIndex: 'name', width: 120 },
  { name: 'email', title: '邮箱', dataIndex: 'email', width: 200, ellipsis: true },
  { name: 'department', title: '部门', dataIndex: 'department', width: 120, align: 'center' },
  { name: 'role', title: '角色', dataIndex: 'role', width: 120 },
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

/** 高级列配置（在基础列之上追加头像与入职日期） */
const modernAdvancedColumns: TableColumn[] = [
  {
    name: 'avatar',
    title: '头像',
    dataIndex: 'profile.avatar',
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
  ...modernBasicColumns,
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
        <button type="button" className="rounded bg-blue-500 px-3 py-1 text-white text-xs transition-colors hover:bg-blue-600" onClick={fn()}>
          查看
        </button>
        <button type="button" className="rounded bg-green-500 px-3 py-1 text-white text-xs transition-colors hover:bg-green-600" onClick={fn()}>
          编辑
        </button>
      </div>
    ),
  },
];

/**
 * 包裹 TableProvider 的渲染辅助
 * BaseTable 依赖 TableContext 提供的配置与状态，必须有 Provider 祖先
 */
const withProvider = (children: ReactNode, data: Record<string, any>[], columns: TableColumn[]) => (
  <TableProvider
    data={data}
    columns={columns}
    config={{
      i18n: { locale: 'zh-CN' },
      rowKey: 'id',
      dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
    }}
  >
    {children}
  </TableProvider>
);

const meta: Meta<typeof BasicTableExample> = {
  title: 'EASAI/Table/ModernTable',
  component: BasicTableExample,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 现代化表格组件示例

展示Table组件的现代化功能和最佳实践，所有功能都基于Table组件实际支持的特性：

### 🚀 主要特性
- **多种尺寸**：支持 sm/md/lg 三种尺寸
- **密度控制**：compact（紧凑）和 comfortable（舒适）两种密度
- **状态管理**：完整的加载、错误、空数据状态支持
- **交互功能**：行点击、双击事件处理
- **滚动支持**：水平/垂直滚动和粘性表头
- **样式控制**：边框、条纹、自定义样式

### 📊 数据展示
使用真实的用户数据模拟，包含头像、部门、角色、状态等丰富信息，展示实际业务场景的应用效果。

### 🎨 设计规范
遵循Schema兼容性规范，使用标准的字段命名和配置方式，确保与后端数据结构的一致性。
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BasicTableExample>;

/**
 * 基础现代化示例
 * 展示表格的核心功能和数据展示
 */
export const Basic: Story = {
  name: '基础现代化示例',
  render: () => withProvider(<BasicTableExample />, modernUsers, modernBasicColumns),
  parameters: {
    docs: {
      description: {
        story: '展示现代化表格的基础功能，包括用户数据展示、头像渲染、状态标识等。',
      },
    },
  },
};

/**
 * 尺寸和密度控制
 * 支持实时切换不同的尺寸和密度配置
 */
export const SizeAndDensity: Story = {
  name: '尺寸和密度控制',
  render: () => withProvider(<SizeAndDensityExample />, modernUsers, modernBasicColumns),
  parameters: {
    docs: {
      description: {
        story: '提供交互式的尺寸和密度控制，用户可以实时切换查看不同配置的效果。',
      },
    },
  },
};

/**
 * 表格状态管理
 * 演示各种状态的切换和展示
 */
export const TableStates: Story = {
  name: '表格状态管理',
  render: () => withProvider(<TableStatesExample />, modernUsers, modernBasicColumns),
  parameters: {
    docs: {
      description: {
        story: '展示表格在不同状态下的表现，包括正常、加载中、错误和空数据状态。',
      },
    },
  },
};

/**
 * 滚动和粘性功能
 * 展示大数据量场景下的滚动处理
 */
export const ScrollAndSticky: Story = {
  name: '滚动和粘性功能',
  render: () => withProvider(<ScrollAndStickyExample />, modernMoreUsers, modernAdvancedColumns),
  parameters: {
    docs: {
      description: {
        story: '演示表格的滚动功能和粘性表头特性，支持大量数据的高效展示。',
      },
    },
  },
};

/**
 * 交互和事件处理
 * 展示行点击、双击等交互功能
 */
export const Interactive: Story = {
  name: '交互和事件处理',
  render: () => withProvider(<InteractiveTableExample />, modernUsers, modernAdvancedColumns),
  parameters: {
    docs: {
      description: {
        story: '展示表格的交互功能，包括行点击、双击事件的处理和状态反馈。',
      },
    },
  },
};

/**
 * 样式和外观控制
 * 展示条纹、边框等样式配置
 */
export const StripedAndStyle: Story = {
  name: '样式和外观控制',
  render: () => withProvider(<StripedAndStyleExample />, modernUsers, modernBasicColumns),
  parameters: {
    docs: {
      description: {
        story: '提供表格样式的交互式控制，包括条纹显示、边框控制等外观配置。',
      },
    },
  },
};

/**
 * 完整功能展示
 * 展示所有现代化表格功能的完整集合
 */
export const AllFeatures: Story = {
  name: '完整功能展示',
  render: () => withProvider(<AllModernExamples />, modernUsers, modernBasicColumns),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: '完整展示现代化表格的所有功能特性和使用场景。',
      },
    },
  },
};

/**
 * 可配置的现代化示例
 * 支持通过Controls面板实时调整参数
 */
export const Configurable: Story = {
  name: '可配置示例',
  args: {
    size: 'md',
    density: 'comfortable',
    bordered: true,
    striped: false,
    stickyHeader: false,
    showActions: true,
    userCount: 5,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '表格尺寸',
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
      },
    },
    density: {
      control: 'select',
      options: ['compact', 'comfortable'],
      description: '表格密度',
      table: {
        type: { summary: "'compact' | 'comfortable'" },
        defaultValue: { summary: "'comfortable'" },
      },
    },
    bordered: {
      control: 'boolean',
      description: '是否显示边框',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    striped: {
      control: 'boolean',
      description: '是否显示条纹',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    stickyHeader: {
      control: 'boolean',
      description: '是否启用粘性表头',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    showActions: {
      control: 'boolean',
      description: '是否显示操作列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    userCount: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: '显示用户数量',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
  },
  render: (args: any) => {
    // 使用固定的测试数据
    const testUsers = [
      {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        role: '系统管理员',
        status: 'active' as const,
        department: '技术中心',
        joinDate: '2023-01-15',
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
        status: 'active' as const,
        department: '技术中心',
        joinDate: '2023-03-20',
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
        status: 'inactive' as const,
        department: '设计中心',
        joinDate: '2022-12-10',
      },
      {
        id: 4,
        name: '赵六',
        email: 'zhaoliu@example.com',
        role: '产品经理',
        status: 'active' as const,
        department: '产品中心',
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
        status: 'active' as const,
        department: '质量中心',
        joinDate: '2023-02-28',
      },
    ];

    // 根据参数生成列配置
    const generateColumns = () => {
      const baseColumns: TableColumn[] = [
        {
          name: 'avatar',
          title: '头像',
          dataIndex: 'profile.avatar',
          width: 80,
          align: 'center' as const,
          render: (value: any, record: any) =>
            value ? (
              <img
                src={value}
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
          ellipsis: true,
        },
        {
          name: 'department',
          title: '部门',
          dataIndex: 'department',
          width: 120,
          align: 'center' as const,
        },
        {
          name: 'role',
          title: '角色',
          dataIndex: 'role',
          width: 150,
        },
        {
          name: 'status',
          title: '状态',
          dataIndex: 'status',
          width: 100,
          align: 'center' as const,
          render: (value: any) => (
            <span className={`inline-flex rounded-full px-2 py-1 font-medium text-xs ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {value === 'active' ? '活跃' : '禁用'}
            </span>
          ),
        },
      ];

      if (args.showActions) {
        baseColumns.push({
          name: 'actions',
          title: '操作',
          dataIndex: 'actions', // 添加缺失的dataIndex
          width: 150,
          align: 'center' as const,
          render: (_, record: any) => (
            <div className="flex justify-center gap-2">
              <button type="button" className="rounded bg-blue-500 px-3 py-1 text-white text-xs transition-colors hover:bg-blue-600" onClick={fn()}>
                查看
              </button>
              <button type="button" className="rounded bg-green-500 px-3 py-1 text-white text-xs transition-colors hover:bg-green-600" onClick={fn()}>
                编辑
              </button>
            </div>
          ),
        });
      }

      return baseColumns;
    };

    const displayData = testUsers.slice(0, args.userCount);
    const columns = generateColumns();

    return (
      <div className="space-y-4 p-6">
        <div>
          <h3 className="mb-2 font-semibold text-lg">可配置的现代化表格</h3>
          <p className="mb-4 text-gray-600 text-sm">使用Controls面板调整各种参数，实时查看表格的不同配置效果</p>
        </div>

        <TableProvider
          data={displayData}
          columns={columns}
          config={{
            i18n: { locale: 'zh-CN' },
            size: args.size,
            density: args.density,
            bordered: args.bordered,
            striped: args.striped,
            stickyHeader: args.stickyHeader,
          }}
        >
          <BaseTable columns={columns} data={displayData} rowKey="id" scroll={args.stickyHeader ? { y: 300 } : undefined} onRowClick={fn()} onRowDoubleClick={fn()} />
        </TableProvider>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '通过Controls面板可以实时调整表格的各种参数，体验现代化表格的完整功能。',
      },
    },
  },
};
