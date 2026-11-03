import { Card } from '../../../card';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TableProvider } from '../../context/TableContext';
import { AdvancedTable } from '../../organisms/AdvancedTable';
import type { TableColumn, TablePlugin } from '../../types';

// 示例数据类型
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  skills: string[];
  /** 行启用标记（1 = 启用，0 = 禁用） */
  enabled: number;
}

// 生成示例数据
const generateEmployees = (count: number): Employee[] => {
  const departments = ['技术部', '产品部', '设计部', '运营部', '人事部'] as const;
  const positions = ['工程师', '产品经理', '设计师', '运营专员', '人事专员'] as const;
  const statuses: Employee['status'][] = ['active', 'inactive', 'pending'];
  const skillsPool = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'Docker', 'Kubernetes'];

  return Array.from({ length: count }, (_, index) => ({
    id: `emp_${index + 1}`,
    name: `员工${index + 1}`,
    department: departments[index % departments.length]!,
    position: positions[index % positions.length]!,
    salary: Math.floor(Math.random() * 50000) + 80000,
    email: `employee${index + 1}@company.com`,
    phone: `138${String(index + 1).padStart(8, '0')}`,
    hireDate: new Date(2020 + (index % 4), index % 12, (index % 28) + 1).getTime().toString(),
    status: statuses[index % statuses.length]!,
    skills: skillsPool.slice(0, Math.floor(Math.random() * 4) + 2),
    enabled: 1,
  }));
};

const sampleEmployees = generateEmployees(50);

// 示例列配置
const employeeColumns: TableColumn[] = [
  {
    name: 'name',
    title: '姓名',
    dataIndex: 'name',
    width: 120,
    sortable: true,
    filterable: true,
    fixed: 'left',
    editable: false,
    editConfig: {
      type: 'input',
      placeholder: '请输入姓名',
      rules: {
        required: true,
        minLength: 2,
        maxLength: 10,
      },
    },
  },
  {
    name: 'department',
    title: '部门',
    dataIndex: 'department',
    width: 100,
    filterable: true,
    filterMultiple: true,
    editable: true,
    editConfig: {
      type: 'select',
      multiple: true,
      searchable: true,
    },
    options: [
      { label: '技术部', value: '技术部' },
      { label: '产品部', value: '产品部' },
      { label: '设计部', value: '设计部' },
      { label: '运营部', value: '运营部' },
      { label: '人事部', value: '人事部' },
    ],
  },
  {
    name: 'position',
    title: '职位',
    dataIndex: 'position',
    width: 120,
    sortable: true,
    filterable: true,
    editable: true,
    editConfig: {
      type: 'input',
      placeholder: '请输入职位',
      rules: {
        required: true,
        minLength: 2,
        maxLength: 20,
      },
    },
  },
  {
    name: 'salary',
    title: '薪资',
    dataIndex: 'salary',
    width: 100,
    sortable: true,
    editable: true,
    dataType: 'number',
    editConfig: {
      type: 'number',
      placeholder: '请输入薪资',
      step: 1000,
      rules: {
        required: true,
        min: 1000,
        max: 999999,
      },
    },
    render: (value: number) => `¥${value.toLocaleString()}`,
  },
  {
    name: 'email',
    title: '邮箱',
    dataIndex: 'email',
    width: 200,
    ellipsis: true,
  },
  {
    name: 'enabled',
    title: '启用',
    dataIndex: 'enabled',
    dataType: 'boolean',
    width: 100,
    editConfig: {
      trueValue: 1,
      falseValue: 0,
    },
  },
  {
    name: 'phone',
    title: '电话',
    dataIndex: 'phone',
    width: 120,
  },
  {
    type: 'date',
    name: 'hireDate',
    title: '入职日期',
    dataIndex: 'hireDate',
    format: 'YYYY-MM-DD',
    dataType: 'date',
    dateType: 'date',
    dateConfig: {
      mode: 'day',
    },
    width: 120,
    sortable: true,
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 100,
    filterable: true,
    editable: true,
    editConfig: {
      type: 'select',
      searchable: false,
    },
    options: [
      { label: '在职', value: 'active' },
      { label: '离职', value: 'inactive' },
      { label: '待入职', value: 'pending' },
    ],
    render: (value: string) => {
      const statusMap = {
        active: { text: '在职', className: 'bg-green-100 text-green-800' },
        inactive: { text: '离职', className: 'bg-red-100 text-red-800' },
        pending: { text: '待入职', className: 'bg-yellow-100 text-yellow-800' },
      };
      const status = statusMap[value as keyof typeof statusMap];
      return <span className={`rounded-full px-2 py-1 text-xs ${status.className}`}>{status.text}</span>;
    },
  },
  {
    name: 'skills',
    title: '技能',
    dataIndex: 'skills',
    width: 200,
    editConfig: {
      type: 'select',
      multiple: true,
      searchable: true,
    },
    options: [
      { label: 'JavaScript', value: 'JavaScript' },
      { label: 'React', value: 'React' },
      { label: 'TypeScript', value: 'TypeScript' },
      { label: 'Node.js', value: 'Node.js' },
      { label: 'Python', value: 'Python' },
      { label: 'Java', value: 'Java' },
      { label: 'Go', value: 'Go' },
      { label: 'Docker', value: 'Docker' },
      { label: 'Kubernetes', value: 'Kubernetes' },
    ],
    render: (skills: string[]) => (
      <div className="flex flex-wrap gap-1">
        {skills.slice(0, 3).map((skill) => (
          <span key={skill} className="rounded bg-blue-100 px-1 py-0.5 text-blue-800 text-xs">
            {skill}
          </span>
        ))}
        {skills.length > 3 && <span className="rounded bg-gray-100 px-1 py-0.5 text-gray-600 text-xs">+{skills.length - 3}</span>}
      </div>
    ),
  },
];

// 示例插件
const auditPlugin: TablePlugin = {
  name: 'audit',
  version: '1.0.0',

  init: fn(),

  transformColumns: (columns, context) => [
    ...columns,
    {
      name: 'audit',
      title: '操作',
      width: 120,
      dataIndex: 'id',
      render: (_, record) => (
        <div className="flex gap-2">
          <button type="button" className="text-blue-600 text-sm hover:text-blue-800" onClick={fn()}>
            查看
          </button>
          <button type="button" className="text-green-600 text-sm hover:text-green-800" onClick={fn()}>
            编辑
          </button>
        </div>
      ),
    },
  ],

  onEvent: fn(),
};

const meta: Meta<typeof AdvancedTable> = {
  title: 'EASAI/Table/AdvancedTable',
  component: AdvancedTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'AdvancedTable提供企业级表格功能，包括插件系统、工具栏、导出、打印等高级特性。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: '表格数据',
      control: { type: 'object' },
    },
    columns: {
      description: '列配置',
      control: { type: 'object' },
    },
    plugin: {
      description: '插件配置',
      control: { type: 'object' },
    },
    toolbar: {
      description: '工具栏配置',
      control: { type: 'object' },
    },
    search: {
      description: '查询面板配置',
      control: { type: 'object' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdvancedTable>;

// 基础企业级表格
export const Default: Story = {
  args: {
    data: sampleEmployees.slice(0, 20),
    columns: employeeColumns,
    config: {
      selectable: true,
      sortable: true,
      filterable: true,
      bordered: true,
      striped: true,
      hoverable: true,
    },
  },
};

// 带工具栏
export const WithToolbar: Story = {
  render: () => (
    <TableProvider
      data={sampleEmployees.slice(0, 20)}
      columns={employeeColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
        },
        selection: {
          type: 'multiple',
          onSelectionChange: fn(),
        },
      }}
    >
      <AdvancedTable
        toolbar={{
          show: true,
          left: [
            {
              key: 'add-employee',
              label: '新增员工',
              icon: '➕',
              execute: fn(),
            },
            {
              key: 'batch-delete',
              label: '批量删除',
              icon: '🗑️',
              disabled: (selectedRows) => selectedRows.length === 0,
              execute: fn(),
            },
          ],
        }}
      />
    </TableProvider>
  ),
};

// 带搜索面板
export const WithSearchPanel: Story = {
  render: () => (
    <TableProvider
      data={sampleEmployees.slice(0, 30)}
      columns={employeeColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          total: 30,
        },
      }}
    >
      <AdvancedTable
        search={{
          show: true,
          collapsible: true,
          defaultCollapsed: false,
          fields: [
            {
              name: 'name',
              dataIndex: ['name'],
              label: '姓名',
              type: 'text',
              placeholder: '请输入员工姓名',
            },
            {
              name: 'department',
              dataIndex: ['department'],
              label: '部门',
              type: 'select',
              options: [
                { label: '技术部', value: '技术部' },
                { label: '产品部', value: '产品部' },
                { label: '设计部', value: '设计部' },
                { label: '运营部', value: '运营部' },
                { label: '人事部', value: '人事部' },
              ],
            },
            {
              name: 'status',
              dataIndex: ['status'],
              label: '状态',
              type: 'select',
              options: [
                { label: '在职', value: 'active' },
                { label: '离职', value: 'inactive' },
                { label: '待入职', value: 'pending' },
              ],
            },
            {
              name: 'salary',
              dataIndex: ['salary'],
              label: '薪资',
              type: 'number',
              placeholder: '请输入薪资',
            },
          ],
        }}
        toolbar={{
          show: true,
        }}
      />
    </TableProvider>
  ),
};

// 带插件系统
export const WithPlugins: Story = {
  render: () => (
    <TableProvider
      data={sampleEmployees.slice(0, 15)}
      columns={employeeColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
        },
      }}
    >
      <AdvancedTable
        plugin={{
          plugins: [auditPlugin],
        }}
        toolbar={{
          show: true,
        }}
      />
    </TableProvider>
  ),
};

// 虚拟滚动大数据
export const VirtualScrolling: Story = {
  args: {
    data: generateEmployees(1000),
    columns: employeeColumns,
    config: {
      selectable: true,
      sortable: true,
      virtualizable: true,
      fillContainer: true,
      virtualization: {
        itemHeight: 50,
        height: 600,
      },
      pagination: {
        pageSize: 10000,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
      },
    },
    toolbar: {
      show: true,
    },
  },
};

// 分页功能
export const WithPagination: Story = {
  args: {
    data: sampleEmployees,
    columns: employeeColumns,
    config: {
      selectable: true,
      sortable: true,
      filterable: true,
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
      },
    },
    toolbar: {
      show: true,
    },
  },
};

// 展开行功能
export const WithExpansion: Story = {
  args: {
    data: sampleEmployees.slice(0, 10),
    columns: employeeColumns,
    config: {
      selectable: true,
      expandable: true,
      expansion: {
        renderExpandedRow: (record: Record<string, any>) => (
          <div className="bg-gray-50 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">员工ID:</span> {record.id}
                  </p>
                  <p>
                    <span className="font-medium">姓名:</span> {record.name}
                  </p>
                  <p>
                    <span className="font-medium">部门:</span> {record.department}
                  </p>
                  <p>
                    <span className="font-medium">职位:</span> {record.position}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">联系方式</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">邮箱:</span> {record.email}
                  </p>
                  <p>
                    <span className="font-medium">电话:</span> {record.phone}
                  </p>
                  <p>
                    <span className="font-medium">入职日期:</span> {record.hireDate}
                  </p>
                  <p>
                    <span className="font-medium">薪资:</span> ¥{record.salary.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="mb-2 font-semibold text-gray-900">技能标签</h4>
              <div className="flex flex-wrap gap-2">
                {record.skills.map((skill: string) => (
                  <span key={skill} className="rounded-full bg-blue-100 px-3 py-1 text-blue-800 text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ),
      },
    },
    toolbar: {
      show: true,
    },
  },
};

// 搜索模式 - 传统模式 (filterMultiple = false)
export const SearchTraditionalMode: Story = {
  render: () => (
    <TableProvider
      data={sampleEmployees.slice(0, 30)}
      columns={employeeColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
          search: 'local',
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          total: 30,
        },
        toolbar: {
          show: true,
          left: [
            {
              key: 'export',
              label: '导出数据',
              icon: '📤',
              execute: fn(),
            },
          ],
        },
        search: {
          show: true,
          collapsible: true,
          defaultCollapsed: false,
          filterMultiple: false, // 传统模式
          fields: [
            {
              name: 'name',
              label: '姓名',
              dataIndex: ['name'],
              type: 'text',
              placeholder: '请输入员工姓名',
              op: 'like',
            },
            {
              name: 'department',
              label: '部门',
              dataIndex: ['department'],
              type: 'select',
              op: 'eq',
              options: [
                { label: '技术部', value: '技术部' },
                { label: '产品部', value: '产品部' },
                { label: '设计部', value: '设计部' },
                { label: '运营部', value: '运营部' },
                { label: '人事部', value: '人事部' },
              ],
            },
            {
              name: 'status',
              label: '状态',
              dataIndex: ['status'],
              type: 'select',
              op: 'in',
              multiple: true, // 传统多选模式，使用 Checkbox
              options: [
                { label: '在职', value: 'active' },
                { label: '离职', value: 'inactive' },
                { label: '待入职', value: 'pending' },
              ],
            },
            {
              name: 'salary',
              label: '薪资',
              dataIndex: ['salary'],
              type: 'number',
              op: 'ge',
              placeholder: '最低薪资',
            },
          ],
          onSearchChange: fn(),
        },
      }}
    >
      <AdvancedTable />
    </TableProvider>
  ),
};

// 搜索模式 - Toggle/ToggleGroup 模式 (filterMultiple = true)
export const SearchToggleMode: Story = {
  render: () => (
    <TableProvider
      data={sampleEmployees.slice(0, 30)}
      columns={employeeColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        toolbarable: true,
        searchable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
          search: 'local',
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          total: 30,
        },
        toolbar: {
          show: true,
          left: [
            {
              key: 'filter-summary',
              label: '筛选汇总',
              icon: '📊',
              execute: fn(),
            },
          ],
        },
        search: {
          show: true,
          collapsible: true,
          defaultCollapsed: false,
          filterMultiple: true, // Toggle/ToggleGroup 模式
          fields: [
            {
              name: 'department',
              label: '部门筛选',
              dataIndex: ['department'],
              type: 'select',
              op: 'in',
              multiple: true, // 支持多选
              options: [
                { label: '技术部', value: '技术部' },
                { label: '产品部', value: '产品部' },
                { label: '设计部', value: '设计部' },
                { label: '运营部', value: '运营部' },
                { label: '人事部', value: '人事部' },
              ],
            },
            {
              name: 'status',
              label: '状态筛选',
              dataIndex: ['status'],
              type: 'select',
              op: 'in',
              multiple: true, // 支持多选
              options: [
                { label: '在职', value: 'active' },
                { label: '离职', value: 'inactive' },
                { label: '待入职', value: 'pending' },
              ],
            },
            {
              name: 'position',
              label: '职位筛选',
              dataIndex: ['position'],
              type: 'select',
              op: 'eq',
              multiple: false, // 单选模式
              options: [
                { label: '工程师', value: '工程师' },
                { label: '产品经理', value: '产品经理' },
                { label: '设计师', value: '设计师' },
                { label: '运营专员', value: '运营专员' },
                { label: '人事专员', value: '人事专员' },
              ],
            },
            {
              name: 'skills',
              label: '技能标签',
              dataIndex: ['skills'],
              type: 'select',
              op: 'in',
              multiple: true, // 支持多选
              options: [
                { label: 'JavaScript', value: 'JavaScript' },
                { label: 'React', value: 'React' },
                { label: 'TypeScript', value: 'TypeScript' },
                { label: 'Node.js', value: 'Node.js' },
                { label: 'Python', value: 'Python' },
                { label: 'Java', value: 'Java' },
                { label: 'Go', value: 'Go' },
                { label: 'Docker', value: 'Docker' },
              ],
            },
          ],
          onSearchChange: fn(),
        },
      }}
    >
      <AdvancedTable />
    </TableProvider>
  ),
};

// 完整功能演示
export const FullFeatured: Story = {
  render: () => (
    <TableProvider
      data={sampleEmployees}
      columns={employeeColumns.map((col) => ({
        ...col,
        resizeable: true,
        filterable: true,
        // 为所有文本字段和数字字段启用编辑功能
        // editable: true, // 简化为直接启用编辑
      }))}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        fixedable: true,
        filterable: true,
        expandable: true,
        resizeable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        clickable: true,
        fillContainer: true,
        searchable: true,
        toolbarable: true,
        statusBarable: true,
        paginable: true,
        pluginable: true,
        virtualizable: true,
        rowActionable: true,
        contextMenuable: true,
        columnHeaderActionable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          search: 'local',
          pagination: 'local',
        },
        storePage: {
          onPageChange: fn(),
          triggerOnInit: true, // 初始化时触发，便于测试
        },
        eventListeners: {
          // 刷新事件监听
          'table-refresh': {
            actionKey: 'table-refresh',
            handler: fn(),
            priority: 1,
          },

          // 导出事件监听
          'table-export': {
            actionKey: 'table-export',
            handler: fn(),
            priority: 1,
          },

          // 打印事件监听
          'table-print': {
            actionKey: 'table-print',
            handler: fn(),
            priority: 1,
          },

          // 全屏事件监听
          'table-fullscreen': {
            actionKey: 'table-fullscreen',
            handler: fn(),
            priority: 1,
          },

          // 列管理事件监听
          'table-column-toggle': {
            actionKey: 'table-columnSetting',
            handler: fn(),
            priority: 1,
          },

          // 行编辑事件监听
          'table-row-edit': {
            actionKey: 'table-row-edit',
            handler: fn(),
            priority: 1,
          },

          // 行删除事件监听
          'table-row-delete': {
            actionKey: 'table-row-delete',
            handler: fn(),
            priority: 1,
          },

          // 新增数据事件监听
          'table-add': {
            actionKey: 'table-add',
            handler: fn(),
            priority: 1,
          },

          // 导入数据事件监听
          'table-import': {
            actionKey: 'table-import',
            handler: fn(),
            priority: 1,
          },

          // 批量删除事件监听
          'table-delete': {
            actionKey: 'table-delete',
            handler: fn(),
            priority: 1,
          },

          // 行复制事件监听
          'table-row-copy': {
            actionKey: 'table-row-copy',
            handler: fn(),
            priority: 1,
          },

          // 行移动事件监听
          'table-row-move': {
            actionKey: 'table-row-move',
            handler: fn(),
            priority: 1,
          },

          // 行启用/禁用事件监听
          'table-row-enable': {
            actionKey: 'table-row-enable',
            handler: fn(),
            priority: 1,
          },

          // 单元格编辑事件监听
          'table-cell-edit': {
            actionKey: 'table-cell-edit',
            handler: fn(),
            priority: 1,
          },

          // 单元格复制事件监听
          'table-cell-copy': {
            actionKey: 'table-cell-copy',
            handler: fn(),
            priority: 1,
          },

          // 行查看事件监听
          'table-row-view': {
            actionKey: 'table-row-view',
            handler: fn(),
            priority: 1,
          },

          // 列筛选事件监听
          'table-column-filter': {
            actionKey: 'table-column-filter',
            handler: fn(),
            priority: 1,
          },

          // 列排序事件监听
          'table-column-sort': {
            actionKey: 'table-column-sort',
            handler: fn(),
            priority: 1,
          },
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: true,
          total: sampleEmployees.length,
        },
        selection: {
          type: 'multiple',
          onSelectionChange: fn(),
        },
        expansion: {
          renderExpandedRow: (record: Record<string, any>) => (
            <div className="border-blue-400 border-l-4 bg-blue-50 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h5 className="font-medium text-blue-900">基本信息</h5>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>ID: {record.id}</p>
                    <p>姓名: {record.name}</p>
                    <p>部门: {record.department}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-blue-900">联系方式</h5>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>邮箱: {record.email}</p>
                    <p>电话: {record.phone}</p>
                    <p>入职: {record.hireDate}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-blue-900">技能</h5>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {record.skills.map((skill: string) => (
                      <span key={skill} className="rounded bg-blue-200 px-2 py-0.5 text-blue-800 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        scroll: {
          x: 'auto',
          y: 'auto',
        },
        search: {
          show: true,
          className: 'border p-4 bg-muted/30 rounded-[var(--radius)]',
          showLabel: false,
          autoSearch: false,
          collapsible: true,
          defaultCollapsed: false,
          filterMultiple: false,
          fields: [
            {
              name: 'name',
              dataIndex: ['name'],
              label: '姓名',
              type: 'text',
              placeholder: '请输入员工姓名',
            },
            {
              name: 'department',
              dataIndex: ['department'],
              multiple: true,
              op: 'in',
              label: '部门',
              type: 'select',
              options: [
                { label: '技术部', value: '技术部' },
                { label: '产品部', value: '产品部' },
                { label: '设计部', value: '设计部' },
                { label: '运营部', value: '运营部' },
                { label: '人事部', value: '人事部' },
              ],
            },
            {
              name: 'status',
              dataIndex: ['status'],
              label: '状态',
              type: 'select',
              options: [
                { label: '在职', value: 'active' },
                { label: '离职', value: 'inactive' },
                { label: '待入职', value: 'pending' },
              ],
            },
            {
              name: 'salary',
              dataIndex: ['salary'],
              label: '薪资范围',
              dataType: 'number',
              type: 'range',
              placeholder: ['最低薪资', '最高薪资'],
            },
            {
              type: 'range',
              name: 'hireDate',
              label: '入职日期',
              format: 'YYYY-MM-DD',
              dataIndex: ['hireDate'],
              dataType: 'date',
              dateType: 'date-range',
              dateConfig: {
                mode: 'day',
              },
              op: 'between',
            },
          ],
        },
        toolbar: {
          show: true,
          showLabel: false,
          maxVisible: 3,
          left: [
            {
              key: 'add-employee',
              label: '自定义按钮',
              icon: 'plus',
              execute: fn(),
            },
          ],
          right: [
            {
              key: 'delete',
              priority: 100,
              label: '自定义菜单删除',
              icon: 'delete',
              execute: fn(),
            },
          ],
        },
        statusBar: {
          className: 'border-t bg-muted/30',
        },
        rowAction: {
          maxVisible: 3,
          actions: [
            {
              key: 'delete',
              label: '自定义删除',
              priority: 100,
              icon: 'delete',
              execute: fn(),
            },
          ],
        },
        plugin: {
          config: {
            'toggle-row': {
              /** 是否启用切换功能 */
              enabled: true,
              /** 状态字段名 */
              statusField: 'enabled',
              /** 启用状态的值 */
              enabledValue: 1,
              /** 禁用状态的值 */
              disabledValue: 0,
            },
          },
        },
        // 启用插件系统，包含单元格编辑插件
        // plugin: {
        //   enabled: true,
        //   plugins: [
        //     {
        //       name: 'cellEdit',
        //       config: {
        //         enabled: true,
        //         excludeColumns: [], // 不排除任何列
        //         readOnlyColumns: [], // 没有只读列
        //         onEditSuccess: (newValue, oldValue, record, column) => {
        //           console.log('🎉 单元格编辑成功:', {
        //             column: column.title,
        //             columnName: column.dataIndex,
        //             recordId: record.id,
        //             oldValue,
        //             newValue,
        //             timestamp: new Date().toLocaleTimeString(),
        //           });
        //         },
        //         onEditError: (error, record, column) => {
        //           console.error('❌ 单元格编辑失败:', {
        //             column: column.title,
        //             columnName: column.dataIndex,
        //             recordId: record.id,
        //             error: error.message,
        //             timestamp: new Date().toLocaleTimeString(),
        //           });
        //         },
        //         onValueChange: (newValue, oldValue, record, column) => {
        //           console.log('🔄 单元格值变化:', {
        //             column: column.title,
        //             columnName: column.dataIndex,
        //             recordId: record.id,
        //             oldValue,
        //             newValue,
        //             timestamp: new Date().toLocaleTimeString(),
        //           });
        //         },
        //       },
        //     },
        //     {
        //       name: 'editRow',
        //       config: {
        //         enabled: true,
        //         mode: 'dialog',
        //         layout: 'grid',
        //         gridCols: 'auto',
        //         minFieldWidth: 320,
        //         showLabel: true,
        //         singleLine: true,
        //         excludeFields: [], // 不排除任何字段
        //         includeFields: undefined, // 包含所有字段
        //         onEditSuccess: (newValues, oldValues, record) => {
        //           console.log('🎉 行编辑成功:', {
        //             recordId: record.id,
        //             oldValues,
        //             newValues,
        //             changedFields: Object.keys(newValues).filter(
        //               (key) =>
        //                 JSON.stringify(oldValues[key]) !==
        //                 JSON.stringify(newValues[key]),
        //             ),
        //             timestamp: new Date().toLocaleTimeString(),
        //           });
        //         },
        //         onEditError: (error, record) => {
        //           console.error('❌ 行编辑失败:', {
        //             recordId: record.id,
        //             error: error.message,
        //             timestamp: new Date().toLocaleTimeString(),
        //           });
        //         },
        //         onValueChange: (fieldName, newValue, oldValue, record) => {
        //           console.log('🔄 行编辑字段变化:', {
        //             recordId: record.id,
        //             fieldName,
        //             oldValue,
        //             newValue,
        //             timestamp: new Date().toLocaleTimeString(),
        //           });
        //         },
        //       },
        //     },
        //   ],
        // },
        contextMenu: {
          actions: [
            {
              key: 'copy',
              label: '自定义复制邮箱',
              icon: 'copy',
              priority: 100,
              execute: (record, context) => {
                if (record?.email) {
                  navigator.clipboard.writeText(record.email);
                  alert(`已复制邮箱: ${record.email}`);
                }
              },
            },
          ],
          showIcon: true,
          showSeparator: true,
          align: 'start',
          onBeforeOpen: fn(),
          onAfterClose: fn(),
        },
        columnHeaderAction: {
          maxVisible: 2,
          actions: [
            {
              key: 'toggle-all',
              label: '自定义列全选',
              icon: 'user-check',
              priority: 1,
              execute: fn(),
            },
          ],
        },
      }}
    >
      <Card className="flex h-[600px] w-full flex-col border-1 p-4">
        <AdvancedTable className="" onRowClick={fn()} />
      </Card>
    </TableProvider>
  ),
};
