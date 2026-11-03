import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TableProvider, useTableState } from '../../context/TableContext';
import { EnhancedTable } from '../../organisms/EnhancedTable';
import type { TableColumn } from '../../types';

// 示例数据类型
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  experience: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  email: string;
  skills: string[];
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

// 生成示例数据
const generateEmployees = (count: number): Employee[] => {
  const departments = ['技术部', '产品部', '设计部', '市场部', '人事部'] as const;
  const positions = ['工程师', '产品经理', '设计师', '市场专员', '人事专员'] as const;
  const statuses: Employee['status'][] = ['active', 'inactive', 'pending'];
  const performances: Employee['performance'][] = ['excellent', 'good', 'average', 'poor'];
  const skillsPool = ['JavaScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'UI设计', '产品设计', '数据分析', '市场营销'];

  return Array.from({ length: count }, (_, index) => ({
    id: `emp_${String(index + 1).padStart(3, '0')}`,
    name: `员工${index + 1}`,
    department: departments[index % departments.length]!,
    position: positions[index % positions.length]!,
    salary: Math.floor(Math.random() * 50000) + 8000,
    experience: Math.floor(Math.random() * 10) + 1,
    status: statuses[index % statuses.length]!,
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]!,
    email: `employee${index + 1}@company.com`,
    skills: skillsPool.slice(0, Math.floor(Math.random() * 4) + 1),
    performance: performances[index % performances.length]!,
  }));
};

const sampleEmployees = generateEmployees(50);

// 完整的列配置，展示所有筛选功能
const employeeColumns: TableColumn[] = [
  {
    name: 'id',
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    fixed: 'left',
    sortable: true,
    filterable: true,
    filterOp: 'like',
    onSort: fn(),
    onFilter: fn(),
  },
  {
    name: 'name',
    title: '姓名',
    dataIndex: 'name',
    width: 120,
    fixed: 'left',
    sortable: true,
    filterable: true,
    filterOp: 'like',
  },
  {
    name: 'department',
    title: '部门',
    dataIndex: 'department',
    width: 120,
    filterable: true,
    filterMultiple: true,
    filterOp: 'in',
    options: [
      { label: '技术部', value: '技术部' },
      { label: '产品部', value: '产品部' },
      { label: '设计部', value: '设计部' },
      { label: '市场部', value: '市场部' },
      { label: '人事部', value: '人事部' },
    ],
  },
  {
    name: 'position',
    title: '职位',
    dataIndex: 'position',
    width: 120,
    filterable: true,
    options: [
      { label: '工程师', value: '工程师' },
      { label: '产品经理', value: '产品经理' },
      { label: '设计师', value: '设计师' },
      { label: '市场专员', value: '市场专员' },
      { label: '人事专员', value: '人事专员' },
    ],
  },
  {
    name: 'salary',
    title: '薪资',
    dataIndex: 'salary',
    width: 120,
    sortable: true,
    filterable: true,
    filterOp: 'between',
    dataType: 'number',
    render: (value: number) => `¥${value.toLocaleString()}`,
  },
  {
    name: 'experience',
    title: '工作经验',
    dataIndex: 'experience',
    width: 100,
    sortable: true,
    filterable: true,
    dataType: 'number',
    render: (value: number) => `${value}年`,
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 100,
    filterable: true,
    filterMultiple: true,
    filterOp: 'in',
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
    name: 'performance',
    title: '绩效',
    dataIndex: 'performance',
    width: 100,
    filterable: true,
    options: [
      { label: '优秀', value: 'excellent' },
      { label: '良好', value: 'good' },
      { label: '一般', value: 'average' },
      { label: '较差', value: 'poor' },
    ],
    render: (value: string) => {
      const performanceMap = {
        excellent: { text: '优秀', className: 'bg-blue-100 text-blue-800' },
        good: { text: '良好', className: 'bg-green-100 text-green-800' },
        average: { text: '一般', className: 'bg-yellow-100 text-yellow-800' },
        poor: { text: '较差', className: 'bg-red-100 text-red-800' },
      };
      const performance = performanceMap[value as keyof typeof performanceMap];
      return <span className={`rounded-full px-2 py-1 text-xs ${performance.className}`}>{performance.text}</span>;
    },
  },
  {
    name: 'joinDate',
    title: '入职日期',
    dataIndex: 'joinDate',
    width: 120,
    sortable: true,
    filterable: true,
    dataType: 'date',
    filterOp: 'between',
  },
  {
    name: 'email',
    title: '邮箱',
    dataIndex: 'email',
    width: 200,
    filterable: true,
    filterOp: 'like',
  },
  {
    name: 'skills',
    title: '技能',
    dataIndex: 'skills',
    width: 200,
    render: (skills: string[]) => (
      <div className="flex flex-wrap gap-1">
        {skills.slice(0, 2).map((skill, index) => (
          <span key={index} className="rounded bg-blue-100 px-1 py-0.5 text-blue-800 text-xs">
            {skill}
          </span>
        ))}
        {skills.length > 2 && <span className="text-gray-500 text-xs">+{skills.length - 2}</span>}
      </div>
    ),
  },
  {
    name: 'actions',
    title: '操作',
    dataIndex: 'id',
    width: 150,
    fixed: 'right',
    render: () => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded bg-blue-100 px-2 py-1 text-blue-700 text-xs transition-colors hover:bg-blue-200"
          onClick={(e) => {
            e.stopPropagation();
            fn();
          }}
        >
          查看
        </button>
        <button
          type="button"
          className="rounded bg-green-100 px-2 py-1 text-green-700 text-xs transition-colors hover:bg-green-200"
          onClick={(e) => {
            e.stopPropagation();
            fn();
          }}
        >
          编辑
        </button>
        <button
          type="button"
          className="rounded bg-red-100 px-2 py-1 text-red-700 text-xs transition-colors hover:bg-red-200"
          onClick={(e) => {
            e.stopPropagation();
            fn();
          }}
        >
          删除
        </button>
      </div>
    ),
  },
];

const meta: Meta<typeof EnhancedTable> = {
  title: 'EASAI/Table/CompleteFilterExample',
  component: EnhancedTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '完整的表格筛选功能演示，包含所有筛选类型、固定列、列宽调整等功能。',
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
    config: {
      description: '表格配置对象',
      control: { type: 'object' },
    },
    onRowClick: {
      description: '行点击事件',
      control: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedTable>;

// 完整功能演示
export const CompleteFilterDemo: Story = {
  render: () => (
    <div className="flex h-screen flex-col p-4">
      <div className="h-[500px] flex-1 rounded-lg border ">
        <EnhancedTable
          data={sampleEmployees}
          columns={employeeColumns}
          loading={false}
          config={{
            i18n: { locale: 'zh-CN' },
            size: 'md',
            striped: true,
            bordered: true,
            showHeader: true,
            stickyHeader: true,
            sortable: true,
            filterable: true,
            selectable: true,
            expandable: true,
            paginable: true,
            fillContainer: true,
            fixedLayout: true,
            resizeable: true,
            hoverable: true,
            clickable: true,
            fixedable: true,
            dataMode: {
              sort: 'local',
              filter: 'local',
              pagination: 'local',
            },
            pagination: {
              pageNo: 1,
              pageSize: 10,
              show: true,
              total: sampleEmployees.length,
            },
            selection: {
              type: 'multiple',
              selectedRowKeys: [],
            },
            resize: {
              columnWidths: {
                id: 100,
                name: 120,
                department: 120,
                position: 120,
                salary: 120,
                experience: 100,
                status: 100,
                performance: 100,
                joinDate: 120,
                email: 200,
                skills: 200,
              },
            },
            scroll: {
              x: 1400,
              y: 'auto',
            },
          }}
          onRowClick={fn()}
        />
      </div>
      <div className="mb-4">
        <h2 className="mb-2 font-bold text-xl">完整筛选功能演示</h2>
        <div className="space-y-1 text-gray-600 text-sm">
          <p>
            • <strong>固定列：</strong>ID 和姓名固定在左侧，技能固定在右侧
          </p>
          <p>
            • <strong>多选筛选：</strong>部门和状态支持多选筛选（filterMultiple + filterOp: 'in'）
          </p>
          <p>
            • <strong>单选筛选：</strong>职位和绩效支持单选筛选（filterOptions）
          </p>
          <p>
            • <strong>范围筛选：</strong>薪资和入职日期支持范围筛选（filterOp: 'between'）
          </p>
          <p>
            • <strong>模糊搜索：</strong>ID、姓名、邮箱支持模糊搜索（filterOp: 'like'）
          </p>
          <p>
            • <strong>数值筛选：</strong>工作经验支持数值比较筛选
          </p>
          <p>
            • <strong>列宽调整：</strong>所有列支持拖拽调整宽度
          </p>
        </div>
      </div>
    </div>
  ),
};

const InteractiveComponent = () => {
  const filters = useTableState((state) => state.filterState);
  const sortState = useTableState((state) => state.sortState);
  const selectedKeys = useTableState((state) => state.selectedRowKeys);
  return (
    <div className="flex h-screen flex-col p-4">
      <div className="mb-4">
        <h2 className="mb-2 font-bold text-xl">交互式筛选演示</h2>

        <div className="h-[500px] flex-1">
          <EnhancedTable loading={false} />
        </div>

        {/* 状态显示 */}
        <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
          <div>
            <h3 className="mb-2 font-medium text-sm">当前筛选条件</h3>
            <div className="space-y-1 text-xs">
              {Object.entries(filters).length > 0 ? (
                Object.entries(filters).map(([field, value]) => (
                  <div key={field} className="flex items-center gap-2">
                    <span className="font-medium">{field}:</span>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">{JSON.stringify(value)}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500">无筛选条件</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-sm">当前排序</h3>
            <div className="text-xs">
              <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                {sortState.columnName} ({sortState.order === 'asc' ? '升序' : '降序'})
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-sm">已选择行</h3>
            <div className="text-xs">
              <span className="rounded bg-purple-100 px-2 py-1 text-purple-800">{selectedKeys.length} 行</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// 交互式筛选演示
export const InteractiveFilterDemo: Story = {
  render: () => {
    return (
      <TableProvider
        data={sampleEmployees}
        columns={employeeColumns}
        config={{
          i18n: { locale: 'zh-CN' },
          size: 'md',
          striped: true,
          bordered: true,
          showHeader: true,
          stickyHeader: true,
          clickable: true,
          sortable: true,
          filterable: true,
          selectable: true,
          paginable: true,
          fixedable: false,
          fillContainer: true,
          resizeable: true,
          hoverable: true,
          dataMode: {
            sort: 'local',
            filter: 'local',
            pagination: 'local',
          },
          pagination: {
            pageNo: 1,
            pageSize: 2,
            show: true,
            total: sampleEmployees.length,
          },
          selection: {
            type: 'multiple',
            onSelectionChange: fn(),
          },
          // sort 和 filter 是状态初始值，不是回调配置
          sort: { columnName: 'joinDate', order: 'desc' },
          filter: {},
          scroll: {
            x: 1400,
            y: 'auto',
          },
        }}
      >
        <InteractiveComponent />
      </TableProvider>
    );
  },
};

// 筛选类型演示
export const FilterTypesDemo: Story = {
  render: () => (
    <div className="flex h-screen flex-col p-4">
      <div className="h-[500px] flex-1 rounded-lg border">
        <EnhancedTable
          data={sampleEmployees.slice(0, 20)}
          columns={employeeColumns}
          config={{
            i18n: { locale: 'zh-CN' },
            size: 'sm',
            striped: true,
            bordered: true,
            showHeader: true,
            stickyHeader: true,
            sortable: true,
            filterable: true,
            selectable: true,
            expandable: true,
            paginable: true,
            fixedable: true,
            fillContainer: true,
            resizeable: true,
            dataMode: {
              sort: 'local',
              filter: 'local',
              pagination: 'local',
            },
            pagination: {
              pageNo: 1,
              pageSize: 8,
              show: true,
              total: 20,
            },
            scroll: {
              x: 1400,
              y: 'auto',
            },
          }}
        />
      </div>
      <div className="mb-4">
        <h2 className="mb-2 font-bold text-xl">筛选类型演示</h2>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-3">
            <h3 className="mb-2 font-medium text-blue-900">文本筛选</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• ID: 模糊搜索 (like)</li>
              <li>• 姓名: 模糊搜索 (like)</li>
              <li>• 邮箱: 模糊搜索 (like)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-green-50 p-3">
            <h3 className="mb-2 font-medium text-green-900">选项筛选</h3>
            <ul className="space-y-1 text-green-700">
              <li>• 部门: 多选 (filterMultiple)</li>
              <li>• 状态: 多选 (filterMultiple)</li>
              <li>• 职位: 单选 (filterOptions)</li>
              <li>• 绩效: 单选 (filterOptions)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-purple-50 p-3">
            <h3 className="mb-2 font-medium text-purple-900">数值/日期筛选</h3>
            <ul className="space-y-1 text-purple-700">
              <li>• 薪资: 范围筛选 (between)</li>
              <li>• 工作经验: 数值比较</li>
              <li>• 入职日期: 日期范围</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};
