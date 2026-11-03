/**
 * SchemaCompatible 组件 Storybook 示例
 * 展示与后端Schema完全兼容的表格组件实现
 */

import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from 'storybook/test';
// 导入Table用于Interactive示例
import { BaseTable } from '../../index';
import type { TableColumn } from '../../index';
import { TableProvider } from '../../context/TableContext';
import { DynamicColumnsExample, FixedColumnsExample, SchemaCompatibleExamples, SchemaCompatibleTableExample } from '../SchemaCompatibleExample';

/**
 * 示例数据（与 SchemaCompatibleExample 内部数据保持一致）
 * BaseTable 的数据来自 TableContext 上下文，Provider 的 data 需与示例渲染的数据一致
 */
const schemaUsers = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '系统管理员',
    status: 'active',
    department: '技术中心',
    createTime: '2023-01-15T08:30:00Z',
    updateTime: '2023-08-20T10:15:00Z',
    profile: { avatar: 'https://avatar.example.com/1.jpg', bio: '负责系统架构和运维工作' },
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
    profile: { avatar: 'https://avatar.example.com/2.jpg', bio: '专注于React和TypeScript开发' },
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
    profile: { avatar: 'https://avatar.example.com/4.jpg', bio: '负责产品规划和需求管理' },
  },
];

/** Schema 兼容的基础列配置 */
const schemaCompatibleColumns: TableColumn[] = [
  { name: 'name', title: '用户姓名', dataIndex: 'name', width: 120, visible: true },
  { name: 'email', title: '邮箱地址', dataIndex: 'email', width: 200, ellipsis: true, align: 'left' },
  { name: 'department', title: '所属部门', dataIndex: 'department', width: 120, align: 'center' },
  { name: 'role', title: '职务角色', dataIndex: 'role', width: 150, align: 'left' },
  {
    name: 'status',
    title: '账户状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    render: (value) => {
      const statusConfig = {
        active: { label: '活跃', className: 'bg-green-100 text-green-800 border-green-200' },
        inactive: { label: '停用', className: 'bg-red-100 text-red-800 border-red-200' },
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
 * 包裹 TableProvider 的渲染辅助
 * BaseTable 依赖 TableContext 提供的配置与状态，必须有 Provider 祖先
 */
const withProvider = (children: ReactNode) => (
  <TableProvider
    data={schemaUsers}
    columns={schemaCompatibleColumns}
    config={{
      i18n: { locale: 'zh-CN' },
      rowKey: 'id',
      dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
    }}
  >
    {children}
  </TableProvider>
);

const meta: Meta<typeof SchemaCompatibleTableExample> = {
  title: 'EASAI/Table/SchemaCompatible',
  component: SchemaCompatibleTableExample,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Schema兼容性表格组件示例

展示Table组件与后端Schema字段命名的完全兼容性，确保前后端数据结构的一致性和互操作性。

### 🔄 Schema字段映射关系
- **name**: 列的唯一标识（替代传统的key）
- **visible**: 控制列显示（替代传统的hidden，逻辑更直观）
- **align**: 对齐方式使用 \`'left'|'center'|'right'\`（标准化命名）
- **fixed**: 固定位置使用 \`'left'|'right'\`（与Schema标准一致）

### 📋 实际业务场景
使用真实的用户管理数据模拟，包含：
- 用户基本信息（姓名、邮箱、部门）
- 职务角色和账户状态
- 时间字段（创建时间、更新时间）
- 完整的CRUD操作支持

### 🎯 设计目标
1. **字段命名标准化**：与后端Schema定义完全一致
2. **类型安全**：TypeScript类型定义与Schema匹配
3. **易于维护**：减少前后端数据转换的复杂性
4. **向后兼容**：支持现有系统的平滑迁移

### 💡 最佳实践
- 使用Schema标准的字段命名约定
- 保持配置的简洁性和实用性
- 确保组件功能与配置项严格匹配
- 提供清晰的文档说明和示例代码
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SchemaCompatibleTableExample>;

/**
 * 基础Schema兼容示例
 * 展示与后端Schema字段的对应关系
 */
export const Basic: Story = {
  name: '基础Schema兼容',
  render: () => withProvider(<SchemaCompatibleTableExample />),
  parameters: {
    docs: {
      description: {
        story: '展示Table与后端Schema字段命名的完全兼容性，包括字段映射关系的详细说明。',
      },
    },
  },
};

/**
 * 固定列功能示例
 * 展示Schema兼容的列固定功能
 */
export const FixedColumns: Story = {
  name: 'Schema兼容的固定列',
  render: () => withProvider(<FixedColumnsExample />),
  parameters: {
    docs: {
      description: {
        story: '演示使用Schema标准的fixed属性（left/right）实现列固定功能，适用于宽表格的操作列固定。',
      },
    },
  },
};

/**
 * 动态列显示示例
 * 展示使用visible属性控制列的显示和隐藏
 */
export const DynamicColumns: Story = {
  name: '动态列显示控制',
  render: () => withProvider(<DynamicColumnsExample />),
  parameters: {
    docs: {
      description: {
        story: '使用Schema标准的visible属性动态控制列的显示和隐藏，提供灵活的表格定制功能。',
      },
    },
  },
};

/**
 * 完整Schema兼容功能
 * 展示所有Schema兼容特性的集合
 */
export const AllFeatures: Story = {
  name: '完整Schema兼容功能',
  render: () => withProvider(<SchemaCompatibleExamples />),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: '完整展示所有Schema兼容特性和使用场景的集合。',
      },
    },
  },
};

/**
 * 可交互的Schema兼容示例
 * 支持通过Controls面板调整Schema相关参数
 */
export const Interactive: Story = {
  name: '可交互Schema示例',
  args: {
    enableNameColumn: true,
    enableEmailColumn: true,
    enableDepartmentColumn: true,
    enableRoleColumn: true,
    enableStatusColumn: true,
    enableTimeColumn: true,
    alignStrategy: 'mixed',
    enableFixedColumns: false,
    tableSize: 'md',
    tableDensity: 'comfortable',
    showBorder: true,
    enableStripes: false,
  },
  argTypes: {
    enableNameColumn: {
      control: 'boolean',
      description: '显示姓名列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableEmailColumn: {
      control: 'boolean',
      description: '显示邮箱列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableDepartmentColumn: {
      control: 'boolean',
      description: '显示部门列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableRoleColumn: {
      control: 'boolean',
      description: '显示角色列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableStatusColumn: {
      control: 'boolean',
      description: '显示状态列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableTimeColumn: {
      control: 'boolean',
      description: '显示时间列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    alignStrategy: {
      control: 'select',
      options: ['left', 'center', 'right', 'mixed'],
      description: '对齐策略',
      table: {
        type: { summary: "'left' | 'center' | 'right' | 'mixed'" },
        defaultValue: { summary: "'mixed'" },
      },
    },
    enableFixedColumns: {
      control: 'boolean',
      description: '启用固定列',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    tableSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '表格尺寸',
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
      },
    },
    tableDensity: {
      control: 'select',
      options: ['compact', 'comfortable'],
      description: '表格密度',
      table: {
        type: { summary: "'compact' | 'comfortable'" },
        defaultValue: { summary: "'comfortable'" },
      },
    },
    showBorder: {
      control: 'boolean',
      description: '显示边框',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableStripes: {
      control: 'boolean',
      description: '启用条纹',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  render: (args: any) => {
    // 使用固定的Schema兼容测试数据
    const schemaTestData = [
      {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        role: '系统管理员',
        status: 'active' as const,
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
        status: 'active' as const,
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
        status: 'inactive' as const,
        department: '设计中心',
        createTime: '2022-12-10T14:20:00Z',
        updateTime: '2023-06-30T11:30:00Z',
      },
      {
        id: 4,
        name: '赵六',
        email: 'zhaoliu@example.com',
        role: '产品经理',
        status: 'active' as const,
        department: '产品中心',
        createTime: '2023-05-08T13:45:00Z',
        updateTime: '2023-08-22T09:20:00Z',
        profile: {
          avatar: 'https://avatar.example.com/4.jpg',
          bio: '负责产品规划和需求管理',
        },
      },
    ];

    // 根据参数动态生成Schema兼容的列配置
    const generateSchemaColumns = () => {
      const allColumns: TableColumn[] = [
        {
          name: 'name',
          title: '用户姓名',
          dataIndex: 'name',
          width: 120,
          visible: args.enableNameColumn,
          align: args.alignStrategy === 'mixed' ? 'left' : args.alignStrategy,
          fixed: args.enableFixedColumns ? 'left' : undefined,
        },
        {
          name: 'email',
          title: '邮箱地址',
          dataIndex: 'email',
          width: 200,
          ellipsis: true,
          visible: args.enableEmailColumn,
          align: args.alignStrategy === 'mixed' ? 'left' : args.alignStrategy,
        },
        {
          name: 'department',
          title: '所属部门',
          dataIndex: 'department',
          width: 120,
          visible: args.enableDepartmentColumn,
          align: args.alignStrategy === 'mixed' ? 'center' : args.alignStrategy,
        },
        {
          name: 'role',
          title: '职务角色',
          dataIndex: 'role',
          width: 150,
          visible: args.enableRoleColumn,
          align: args.alignStrategy === 'mixed' ? 'left' : args.alignStrategy,
        },
        {
          name: 'status',
          title: '账户状态',
          dataIndex: 'status',
          width: 100,
          visible: args.enableStatusColumn,
          align: args.alignStrategy === 'mixed' ? 'center' : args.alignStrategy,
          render: (value: string) => {
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
          visible: args.enableTimeColumn,
          align: args.alignStrategy === 'mixed' ? 'center' : args.alignStrategy,
          render: (value: string) => (
            <span className="text-gray-600 text-sm">
              {new Date(value).toLocaleString('zh-CN', {
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

      if (args.enableFixedColumns) {
        allColumns.push({
          name: 'actions',
          title: '操作',
          dataIndex: 'actions', // 添加缺失的dataIndex
          width: 150,
          visible: true,
          align: 'center' as const,
          fixed: 'right' as const,
          render: (value: any, record: any) => (
            <div className="flex justify-center gap-1">
              <button type="button" className="rounded bg-blue-500 px-2 py-1 text-white text-xs transition-colors hover:bg-blue-600" onClick={fn()}>
                查看
              </button>
              <button type="button" className="rounded bg-green-500 px-2 py-1 text-white text-xs transition-colors hover:bg-green-600" onClick={fn()}>
                编辑
              </button>
            </div>
          ),
        } as any);
      }

      return allColumns;
    };

    const columns = generateSchemaColumns();

    return (
      <div className="space-y-4 p-6">
        <div>
          <h3 className="mb-2 font-semibold text-lg">可交互的Schema兼容表格</h3>
          <p className="mb-4 text-gray-600 text-sm">通过Controls面板体验Schema兼容的字段配置和功能特性</p>

          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">当前Schema配置</h4>
            <div className="space-y-1 text-blue-800 text-sm">
              <div>
                • <strong>字段命名</strong>: 使用name作为列标识
              </div>
              <div>
                • <strong>显示控制</strong>: 使用visible属性（
                {columns.filter((col) => col.visible).length}/{columns.length}
                列可见）
              </div>
              <div>
                • <strong>对齐策略</strong>: {args.alignStrategy === 'mixed' ? '混合对齐' : `统一${args.alignStrategy}对齐`}
              </div>
              <div>
                • <strong>固定列</strong>: {args.enableFixedColumns ? '已启用' : '未启用'}
              </div>
            </div>
          </div>
        </div>

        <div className={args.enableFixedColumns ? 'rounded-lg border' : ''}>
          <TableProvider
            data={schemaTestData}
            columns={columns}
            config={{
              i18n: { locale: 'zh-CN' },
              size: args.tableSize,
              density: args.tableDensity,
              bordered: args.showBorder,
              striped: args.enableStripes,
              stickyHeader: args.enableFixedColumns,
            }}
          >
            <BaseTable columns={columns} data={schemaTestData} rowKey="id" scroll={args.enableFixedColumns ? { x: 900 } : undefined} />
          </TableProvider>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '通过Controls面板可以实时体验Schema兼容的各种配置选项，观察字段映射和功能特性的表现。',
      },
    },
  },
};
