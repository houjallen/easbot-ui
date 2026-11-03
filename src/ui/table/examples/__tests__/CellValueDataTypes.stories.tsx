/**
 * CellValue组件所有数据类型示例
 * 展示CellValue组件支持的所有数据类型的渲染效果
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../../button/button';
import { Icon } from '../../../icon/icon';
import { TableProvider } from '../../context/TableContext';
import { AdvancedTable } from '../../organisms/AdvancedTable';
import type { TableColumn } from '../../types/base';

const meta: Meta<typeof AdvancedTable> = {
  title: 'EASAI/Table/CellValue Data Types',
  component: AdvancedTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '展示CellValue组件支持的所有数据类型的渲染效果，包括格式化选项和样式展示。',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdvancedTable>;

// 示例数据
const sampleData = [
  {
    id: 1,
    name: '张三',
    age: 28,
    salary: 15000.5,
    percentage: 0.85,
    isActive: true,
    birthDate: 1695024000000, // 2023-09-18
    avatar: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=张',
    website: 'https://www.example.com',
    tags: ['前端', 'React', 'TypeScript'],
    singleTag: 'Senior',
    skills: ['JavaScript', 'React', 'Vue', 'Node.js'],
    profile: {
      department: '技术部',
      position: '高级前端工程师',
      experience: 5,
    },
    status: 'active',
    description: '这是一段很长的描述文本，用于展示文本类型的渲染效果。它可能包含多行内容，需要合适的显示方式。',
    shortText: '简短文本',
  },
  {
    id: 2,
    name: '李四',
    age: 32,
    salary: 22000.75,
    percentage: 0.92,
    isActive: false,
    birthDate: 1577836800000, // 2020-01-01
    avatar: 'https://via.placeholder.com/40x40/EF4444/FFFFFF?text=李',
    website: 'https://www.github.com',
    tags: ['后端', 'Java', 'Spring'],
    singleTag: 'Lead',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
    profile: {
      department: '技术部',
      position: '技术负责人',
      experience: 8,
    },
    status: 'inactive',
    description: '另一段描述文本',
    shortText: '测试',
  },
  {
    id: 3,
    name: '王五',
    age: 25,
    salary: 12000.0,
    percentage: 0.78,
    isActive: true,
    birthDate: 1672531200000, // 2023-01-01
    avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=王',
    website: 'https://www.stackoverflow.com',
    tags: ['全栈', 'Python', 'Django'],
    singleTag: 'Junior',
    skills: ['Python', 'Django', 'PostgreSQL'],
    profile: {
      department: '产品部',
      position: '全栈工程师',
      experience: 2,
    },
    status: 'pending',
    description: null, // 测试null值
    shortText: '',
  },
];

// 列配置
const columns: TableColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    name: 'id',
    type: 'number',
    width: 80,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    name: 'name',
    dataType: 'string',
    width: 100,
  },
  {
    title: '年龄',
    dataIndex: 'age',
    name: 'age',
    dataType: 'int',
    width: 80,
  },
  {
    title: '薪资',
    dataIndex: 'salary',
    name: 'salary',
    type: 'number',
    format: ',', // 千分位格式
    width: 120,
  },
  {
    title: '完成率',
    dataIndex: 'percentage',
    name: 'percentage',
    type: 'number',
    format: '%', // 百分比格式
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'isActive',
    name: 'isActive',
    type: 'boolean',
    width: 80,
  },
  {
    title: '生日',
    dataIndex: 'birthDate',
    name: 'birthDate',
    type: 'date',
    format: 'YYYY-MM-DD',
    width: 120,
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    name: 'avatar',
    type: 'image',
    width: 80,
  },
  {
    title: '网站',
    dataIndex: 'website',
    name: 'website',
    type: 'link',
    ellipsis: true,
    width: 150,
  },
  {
    title: '技能标签',
    dataIndex: 'tags',
    name: 'tags',
    type: 'tag',
    width: 200,
  },
  {
    title: '等级',
    dataIndex: 'singleTag',
    name: 'singleTag',
    type: 'tag',
    width: 100,
  },
  {
    title: '技能列表',
    dataIndex: 'skills',
    name: 'skills',
    dataType: 'list',
    format: ' | ', // 使用管道符分隔
    width: 200,
  },
  {
    title: '个人资料',
    dataIndex: 'profile',
    name: 'profile',
    type: 'json',
    width: 250,
  },
  {
    title: '工作状态',
    dataIndex: 'status',
    name: 'status',
    dataType: 'enum',
    width: 100,
  },
  {
    title: '描述',
    dataIndex: 'description',
    name: 'description',
    type: 'text',
    width: 200,
  },
  {
    title: '操作',
    dataIndex: 'id',
    name: 'actions',
    type: 'actions',
    width: 120,
    render: (_, record) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <Icon name="edit" size={14} />
        </Button>
        <Button size="sm" variant="outline">
          <Icon name="trash" size={14} />
        </Button>
      </div>
    ),
  },
];

/**
 * 基础数据类型展示
 * 展示所有支持的数据类型及其默认渲染效果
 */
export const AllDataTypes: Story = {
  render: () => (
    <TableProvider
      data={sampleData}
      columns={columns}
      config={{
        i18n: { locale: 'zh-CN' },
        scroll: { x: 1800 },
      }}
    >
      <AdvancedTable />
    </TableProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: '展示CellValue组件支持的所有数据类型，包括：字符串、数字、日期、布尔值、标签、图片、链接、JSON对象、列表、枚举和操作列。',
      },
    },
  },
};

/**
 * 数字格式化示例
 * 展示不同的数字格式化选项
 */
export const NumberFormats: Story = {
  render: () => (
    <TableProvider
      data={[
        { id: 1, value: 1234567.89, percentage: 0.856 },
        { id: 2, value: 98765.4321, percentage: 0.234 },
        { id: 3, value: 5000, percentage: 1.0 },
      ]}
      columns={[
        {
          title: '原始数字',
          dataIndex: 'value',
          name: 'raw',
          type: 'number',
          width: 120,
        },
        {
          title: '千分位',
          dataIndex: 'value',
          name: 'comma',
          type: 'number',
          format: ',',
          width: 120,
        },
        {
          title: '两位小数',
          dataIndex: 'value',
          name: 'decimal',
          type: 'number',
          format: '0.00',
          width: 120,
        },
        {
          title: '百分比',
          dataIndex: 'percentage',
          name: 'percent',
          type: 'number',
          format: '%',
          width: 120,
        },
      ]}
      config={{
        pagination: {
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        dataMode: {
          sort: 'local',
          filter: 'local',
          search: 'local',
          pagination: 'local',
        },
      }}
    >
      <AdvancedTable />
    </TableProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: '展示数字类型的不同格式化选项：原始数字、千分位分隔符、小数位控制、百分比格式。',
      },
    },
  },
};

/**
 * 日期格式化示例
 * 展示不同的日期格式化选项
 */
export const DateFormats: Story = {
  args: {
    columns: [
      {
        title: '完整日期时间',
        dataIndex: 'timestamp',
        name: 'full',
        type: 'date',
        dateType: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
        width: 180,
      },
      {
        title: '仅日期',
        dataIndex: 'timestamp',
        name: 'date',
        type: 'date',
        format: 'YYYY-MM-DD',
        width: 120,
      },
      {
        title: '仅时间',
        dataIndex: 'timestamp',
        name: 'time',
        type: 'date',
        dateType: 'time',
        format: 'HH:mm:ss',
        width: 100,
      },
      {
        title: '中文格式',
        dataIndex: 'timestamp',
        name: 'chinese',
        type: 'date',
        format: 'YYYY年MM月DD日',
        dateType: 'date',
        width: 140,
      },
    ],
    data: [
      { id: 1, timestamp: Date.now() },
      { id: 2, timestamp: Date.now() - 86400000 }, // 昨天
      { id: 3, timestamp: Date.now() + 86400000 }, // 明天
    ],
    config: {
      i18n: { locale: 'zh-CN' },
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 3,
      },
      dataMode: {
        sort: 'local',
        filter: 'local',
        search: 'local',
        pagination: 'local',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: '展示日期类型的不同格式化选项：完整日期时间、仅日期、仅时间、中文格式。',
      },
    },
  },
};

/**
 * 标签类型示例
 * 展示单个标签和多个标签的渲染效果
 */
export const TagTypes: Story = {
  args: {
    columns: [
      {
        title: '姓名',
        dataIndex: 'name',
        name: 'name',
        dataType: 'string',
        width: 100,
      },
      {
        title: '单个标签',
        dataIndex: 'level',
        name: 'level',
        type: 'tag',
        width: 120,
      },
      {
        title: '技能标签',
        dataIndex: 'skills',
        name: 'skills',
        type: 'tag',
        width: 250,
      },
      {
        title: '部门标签',
        dataIndex: 'departments',
        name: 'departments',
        type: 'tag',
        width: 200,
      },
    ],
    data: [
      {
        id: 1,
        name: '张三',
        level: 'Senior',
        skills: ['React', 'TypeScript', 'Node.js'],
        departments: ['前端组', '架构组'],
      },
      {
        id: 2,
        name: '李四',
        level: 'Lead',
        skills: ['Java', 'Spring', 'MySQL', 'Redis', 'Kubernetes'],
        departments: ['后端组'],
      },
      {
        id: 3,
        name: '王五',
        level: 'Junior',
        skills: ['Python', 'Django'],
        departments: ['全栈组', '数据组', '算法组'],
      },
    ],
    config: {
      i18n: { locale: 'zh-CN' },
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 3,
      },
      dataMode: {
        sort: 'local',
        filter: 'local',
        search: 'local',
        pagination: 'local',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: '展示标签类型的渲染效果，包括单个标签和多个标签的情况。',
      },
    },
  },
};

/**
 * 列表格式化示例
 * 展示不同分隔符的列表格式化
 */
export const ListFormats: Story = {
  args: {
    columns: [
      {
        title: '姓名',
        dataIndex: 'name',
        name: 'name',
        dataType: 'string',
        width: 100,
      },
      {
        title: '默认分隔符',
        dataIndex: 'items',
        name: 'default',
        dataType: 'list',
        width: 200,
      },
      {
        title: '管道分隔符',
        dataIndex: 'items',
        name: 'pipe',
        dataType: 'list',
        format: ' | ',
        ellipsis: true,
        width: 200,
      },
      {
        title: '换行分隔符',
        dataIndex: 'items',
        name: 'newline',
        dataType: 'list',
        format: '\n',
        width: 200,
      },
    ],
    data: [
      {
        id: 1,
        name: '项目A',
        items: ['需求分析', '系统设计', '编码实现', '测试验证', '上线部署'],
      },
      {
        id: 2,
        name: '项目B',
        items: ['前端开发', '后端开发', '数据库设计'],
      },
      {
        id: 3,
        name: '项目C',
        items: ['UI设计', '交互设计'],
      },
    ],
    config: {
      i18n: { locale: 'zh-CN' },
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 3,
      },
      dataMode: {
        sort: 'local',
        filter: 'local',
        search: 'local',
        pagination: 'local',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: '展示列表类型的不同分隔符格式：默认逗号分隔、管道分隔、换行分隔。',
      },
    },
  },
};

/**
 * 特殊值处理示例
 * 展示null、undefined、空字符串等特殊值的处理
 */
export const SpecialValues: Story = {
  args: {
    columns: [
      {
        title: '字段名',
        dataIndex: 'field',
        name: 'field',
        dataType: 'string',
        width: 120,
      },
      {
        title: '值',
        dataIndex: 'value',
        name: 'value',
        dataType: 'string',
        width: 150,
      },
      {
        title: '数字值',
        dataIndex: 'numberValue',
        name: 'numberValue',
        type: 'number',
        width: 100,
      },
      {
        title: '布尔值',
        dataIndex: 'boolValue',
        name: 'boolValue',
        type: 'boolean',
        width: 100,
      },
      {
        title: '数组值',
        dataIndex: 'arrayValue',
        name: 'arrayValue',
        dataType: 'list',
        width: 150,
      },
    ],
    data: [
      {
        id: 1,
        field: 'null值',
        value: null,
        numberValue: null,
        boolValue: null,
        arrayValue: null,
      },
      {
        id: 2,
        field: 'undefined值',
        value: undefined,
        numberValue: undefined,
        boolValue: undefined,
        arrayValue: undefined,
      },
      {
        id: 3,
        field: '空字符串',
        value: '',
        numberValue: '',
        boolValue: '',
        arrayValue: [],
      },
      {
        id: 4,
        field: '零值',
        value: '0',
        numberValue: 0,
        boolValue: false,
        arrayValue: [''],
      },
    ],
    config: {
      i18n: { locale: 'zh-CN' },
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 4,
      },
      dataMode: {
        sort: 'local',
        filter: 'local',
        search: 'local',
        pagination: 'local',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: '展示CellValue组件对特殊值的处理：null、undefined、空字符串、零值等。',
      },
    },
  },
};
