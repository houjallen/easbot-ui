/**
 * 表格日期组件使用示例
 * 展示如何在表格中使用不同类型的日期组件
 */

import { EnhancedTable } from '../../index';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import type { TableColumn } from '../../types/base';

const meta: Meta<typeof EnhancedTable> = {
  title: 'EASAI/Table/DateComponents',
  component: EnhancedTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '展示表格中不同类型日期组件的使用方法。当列的 `dataType` 为 `date` 时，可以通过 `dateType` 指定使用哪种日期组件。',
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
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedTable>;

// 模拟数据
const sampleData = [
  {
    id: 1,
    name: '张三',
    birthday: '1990-05-15',
    workPeriod: ['2020-01-01', '2023-12-31'],
    lastLogin: '2023-12-01 14:30:00',
    meetingTime: ['2023-12-01 09:00:00', '2023-12-01 17:00:00'],
    workTime: '09:00:00',
    breakTime: ['12:00:00', '13:00:00'],
    status: 'active',
  },
  {
    id: 2,
    name: '李四',
    birthday: '1985-08-20',
    workPeriod: ['2019-03-15', '2024-03-14'],
    lastLogin: '2023-12-02 10:15:30',
    meetingTime: ['2023-12-02 10:00:00', '2023-12-02 16:00:00'],
    workTime: '08:30:00',
    breakTime: ['12:30:00', '13:30:00'],
    status: 'inactive',
  },
  {
    id: 3,
    name: '王五',
    birthday: '1992-12-03',
    workPeriod: ['2021-06-01', '2025-05-31'],
    lastLogin: '2023-12-03 16:45:22',
    meetingTime: ['2023-12-03 14:00:00', '2023-12-03 18:00:00'],
    workTime: '09:30:00',
    breakTime: ['11:30:00', '12:30:00'],
    status: 'active',
  },
];

// 基础日期组件示例
export const BasicDateComponents: Story = {
  args: {
    data: sampleData,
    onRowClick: fn(),
    columns: [
      {
        name: 'name',
        title: '姓名',
        dataIndex: 'name',
        type: 'text',
        width: 100,
      },
      {
        name: 'birthday',
        title: '生日',
        dataIndex: 'birthday',
        type: 'date',
        dataType: 'date',
        dateType: 'date',
        format: 'YYYY-MM-DD',
        width: 120,
        dateConfig: {
          placeholder: '请选择生日',
          showShortcuts: true,
          mode: 'day',
        },
      },
      {
        name: 'workPeriod',
        title: '工作期间',
        dataIndex: 'workPeriod',
        type: 'date',
        dataType: 'date',
        dateType: 'date-range',
        format: 'YYYY-MM-DD',
        width: 200,
        dateConfig: {
          placeholder: '请选择工作期间',
          separator: ' 至 ',
          mode: 'day',
        },
      },
      {
        name: 'lastLogin',
        title: '最后登录',
        dataIndex: 'lastLogin',
        type: 'date',
        dataType: 'date',
        dateType: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
        width: 160,
        dateConfig: {
          placeholder: '请选择登录时间',
          showShortcuts: true,
        },
      },
      {
        name: 'status',
        title: '状态',
        dataIndex: 'status',
        type: 'text',
        width: 80,
        render: (value: string) => (
          <span className={`rounded px-2 py-1 text-xs ${value === 'activrounded e' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{value === 'active' ? '活跃' : '非活跃'}</span>
        ),
      },
    ] as TableColumn[],
  },
  parameters: {
    docs: {
      description: {
        story: '展示基础的日期组件：单日期选择、日期范围选择和日期时间选择。',
      },
    },
  },
};

// 完整日期组件示例
export const AllDateComponents: Story = {
  args: {
    data: sampleData,
    columns: [
      {
        name: 'name',
        title: '姓名',
        dataIndex: 'name',
        type: 'text',
        width: 80,
      },
      {
        name: 'birthday',
        title: '生日',
        dataIndex: 'birthday',
        type: 'date',
        dataType: 'date',
        dateType: 'date',
        format: 'YYYY-MM-DD',
        width: 120,
        dateConfig: {
          placeholder: '选择生日',
          mode: 'day',
        },
      },
      {
        name: 'workPeriod',
        title: '工作期间',
        dataIndex: 'workPeriod',
        type: 'date',
        dataType: 'date',
        dateType: 'date-range',
        format: 'YYYY-MM-DD',
        width: 180,
        dateConfig: {
          separator: ' ~ ',
        },
      },
      {
        name: 'lastLogin',
        title: '最后登录',
        dataIndex: 'lastLogin',
        type: 'date',
        dataType: 'date',
        dateType: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
        width: 160,
      },
      {
        name: 'meetingTime',
        title: '会议时间',
        dataIndex: 'meetingTime',
        type: 'date',
        dataType: 'date',
        dateType: 'datetime-range',
        format: 'YYYY-MM-DD HH:mm:ss',
        width: 200,
        dateConfig: {
          separator: ' 到 ',
        },
      },
      {
        name: 'workTime',
        title: '上班时间',
        dataIndex: 'workTime',
        type: 'date',
        dataType: 'date',
        dateType: 'time',
        dateFormat: 'HH:mm:ss',
        width: 100,
      },
      {
        name: 'breakTime',
        title: '休息时间',
        dataIndex: 'breakTime',
        type: 'date',
        dataType: 'date',
        dateType: 'time-range',
        dateFormat: 'HH:mm:ss',
        width: 140,
        dateConfig: {
          separator: '-',
        },
      },
    ] as TableColumn[],
  },
  parameters: {
    docs: {
      description: {
        story: '展示所有类型的日期组件：date、date-range、datetime、datetime-range、time、time-range。',
      },
    },
  },
};

// 月份和年份选择示例
export const MonthYearSelection: Story = {
  args: {
    data: [
      {
        id: 1,
        project: '项目A',
        startMonth: '2023-01',
        projectYear: '2023',
        quarterRange: ['2023-01', '2023-03'],
      },
      {
        id: 2,
        project: '项目B',
        startMonth: '2023-06',
        projectYear: '2024',
        quarterRange: ['2023-04', '2023-06'],
      },
    ],
    columns: [
      {
        name: 'project',
        title: '项目名称',
        dataIndex: 'project',
        type: 'text',
        width: 120,
      },
      {
        name: 'startMonth',
        title: '开始月份',
        dataIndex: 'startMonth',
        type: 'date',
        dataType: 'date',
        dateType: 'date',
        dateFormat: 'YYYY-MM',
        width: 120,
        dateConfig: {
          mode: 'month',
          placeholder: '选择月份',
        },
      },
      {
        name: 'projectYear',
        title: '项目年份',
        dataIndex: 'projectYear',
        type: 'date',
        dataType: 'date',
        dateType: 'date',
        dateFormat: 'YYYY',
        width: 120,
        dateConfig: {
          mode: 'year',
          placeholder: '选择年份',
        },
      },
      {
        name: 'quarterRange',
        title: '季度范围',
        dataIndex: 'quarterRange',
        type: 'date',
        dataType: 'date',
        dateType: 'date-range',
        dateFormat: 'YYYY-MM',
        width: 180,
        dateConfig: {
          mode: 'month',
          separator: ' 至 ',
        },
      },
    ] as TableColumn[],
  },
  parameters: {
    docs: {
      description: {
        story: '展示月份和年份选择模式，通过 `dateConfig.mode` 控制选择精度。',
      },
    },
  },
};

// 自定义配置示例
export const CustomConfiguration: Story = {
  args: {
    data: sampleData,
    columns: [
      {
        name: 'name',
        title: '姓名',
        dataIndex: 'name',
        type: 'text',
        width: 100,
      },
      {
        name: 'birthday',
        title: '生日',
        dataIndex: 'birthday',
        type: 'date',
        dataType: 'date',
        dateType: 'date',
        dateFormat: 'YYYY年MM月DD日',
        width: 140,
        dateConfig: {
          placeholder: '请选择您的生日',
          showShortcuts: false,
          disabledDate: (date: Date) => {
            // 禁用未来日期
            return date > new Date();
          },
        },
      },
      {
        name: 'workPeriod',
        title: '工作期间',
        dataIndex: 'workPeriod',
        type: 'date',
        dataType: 'date',
        dateType: 'date-range',
        dateFormat: 'YYYY/MM/DD',
        width: 200,
        dateConfig: {
          separator: ' ～ ',
          placeholder: '选择工作起止时间',
          disabledDate: (date: Date) => {
            // 禁用周末
            const day = date.getDay();
            return day === 0 || day === 6;
          },
        },
      },
      {
        name: 'lastLogin',
        title: '最后登录',
        dataIndex: 'lastLogin',
        type: 'date',
        dataType: 'date',
        dateType: 'datetime',
        dateFormat: 'MM/DD/YYYY HH:mm',
        width: 150,
        dateConfig: {
          placeholder: '选择登录时间',
          readOnly: true, // 只读模式
        },
      },
    ] as TableColumn[],
  },
  parameters: {
    docs: {
      description: {
        story: '展示自定义日期格式、禁用日期规则、只读模式等高级配置。',
      },
    },
  },
};
