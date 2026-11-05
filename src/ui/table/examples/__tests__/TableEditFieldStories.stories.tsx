import { Card } from '../../../card';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TableProvider } from '../../context/TableContext';
import { AdvancedTable } from '../../organisms/AdvancedTable';
import type { TableColumn } from '../../types';

// 示例数据类型
interface SampleData {
  id: string;
  text: string;
  textarea: string;
  number: number;
  boolean: boolean;
  date: string;
  enum: string;
  multiEnum: string[];
  list: string[];
  object: Record<string, any>;
  email: string;
  phone: string;
  url: string;
  file: string;
  image: string;
}

// 生成示例数据
const generateSampleData = (count: number): SampleData[] => {
  const enumOptions = ['选项1', '选项2', '选项3', '选项4'] as const;

  return Array.from({ length: count }, (_, index) => ({
    id: `row_${index + 1}`,
    text: `文本内容 ${index + 1}`,
    textarea: `这是多行文本内容\n第${index + 1}行数据\n包含换行符`,
    number: Math.floor(Math.random() * 1000),
    boolean: index % 2 === 0,
    date: new Date(2023, index % 12, (index % 28) + 1).getTime().toString(),
    enum: enumOptions[index % enumOptions.length]!,
    multiEnum: [enumOptions[index % enumOptions.length]!, enumOptions[(index + 1) % enumOptions.length]!],
    list: [`项目1-${index}`, `项目2-${index}`, `项目3-${index}`],
    object: { key1: `值1-${index}`, key2: `值2-${index}` },
    email: `user${index + 1}@example.com`,
    phone: `138${String(index + 1).padStart(8, '0')}`,
    url: `https://example.com/page${index + 1}`,
    file: `file-${index + 1}.pdf`,
    image: `https://picsum.photos/id/${(index % 30) + 1}/200/200`,
  }));
};

const sampleData = generateSampleData(20);

// 列配置 - 展示所有支持的编辑字段类型
const editColumns: TableColumn[] = [
  {
    name: 'text',
    title: '文本输入',
    dataIndex: 'text',
    width: 150,
    editable: true,
    editConfig: {
      type: 'input',
      placeholder: '请输入文本',
      rules: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
    },
  },
  {
    name: 'textarea',
    title: '多行文本',
    dataIndex: 'textarea',
    width: 200,
    editable: true,
    ellipsis: true,
    editConfig: {
      type: 'textarea',
      placeholder: '请输入多行文本',
      priority: 1,
      rules: {
        maxLength: 500,
      },
    },
  },
  {
    name: 'number',
    title: '数字输入',
    dataIndex: 'number',
    width: 120,
    editable: true,
    dataType: 'number',
    editConfig: {
      type: 'number',
      placeholder: '请输入数字',
      step: 1,
      rules: {
        required: true,
        min: 0,
        max: 10000,
      },
    },
    render: (value: number) => `¥${value.toLocaleString()}`,
  },
  {
    name: 'boolean',
    title: '布尔值',
    dataIndex: 'boolean',
    width: 100,
    editable: true,
    dataType: 'boolean',
    editConfig: {
      type: 'checkbox',
    },
    render: (value: boolean) => <span className={value ? 'text-green-600' : 'text-red-600'}>{value ? '是' : '否'}</span>,
  },
  {
    name: 'date',
    title: '日期选择',
    dataIndex: 'date',
    width: 150,
    editable: true,
    dataType: 'date',
    dateType: 'date',
    dateConfig: {
      mode: 'day',
    },
    format: 'YYYY-MM-DD',
    editConfig: {
      type: 'date',
    },
    render: (value: string) => {
      const date = new Date(Number.parseInt(value, 10));
      return date.toLocaleDateString('zh-CN');
    },
  },
  {
    name: 'enum',
    title: '单选枚举',
    dataIndex: 'enum',
    width: 120,
    editable: true,
    editConfig: {
      type: 'select',
      searchable: true,
    },
    options: [
      { label: '选项1', value: '选项1' },
      { label: '选项2', value: '选项2' },
      { label: '选项3', value: '选项3' },
      { label: '选项4', value: '选项4' },
    ],
    render: (value: string) => <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 text-xs">{value}</span>,
  },
  {
    name: 'multiEnum',
    title: '多选枚举',
    dataIndex: 'multiEnum',
    width: 150,
    editable: true,
    editConfig: {
      type: 'select',
      multiple: true,
      searchable: true,
    },
    options: [
      { label: '选项1', value: '选项1' },
      { label: '选项2', value: '选项2' },
      { label: '选项3', value: '选项3' },
      { label: '选项4', value: '选项4' },
    ],
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((item) => (
          <span key={item} className="rounded bg-green-100 px-1 py-0.5 text-green-800 text-xs">
            {item}
          </span>
        ))}
      </div>
    ),
  },
  {
    name: 'list',
    title: '列表编辑',
    dataIndex: 'list',
    dataType: 'list',
    width: 180,
    editable: true,
    editConfig: {
      type: 'list',
      itemType: 'string',
      addButtonText: '添加项目',
      sortable: true,
    },
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 2).map((item, index) => (
          <span key={index} className="rounded bg-purple-100 px-1 py-0.5 text-purple-800 text-xs">
            {item}
          </span>
        ))}
        {value.length > 2 && <span className="rounded bg-gray-100 px-1 py-0.5 text-gray-600 text-xs">+{value.length - 2}</span>}
      </div>
    ),
  },
  {
    name: 'object',
    title: '对象编辑',
    dataIndex: 'object',
    dataType: 'object',
    width: 180,
    editable: true,
    editConfig: {
      type: 'object',
      keyPlaceholder: '属性名',
      valuePlaceholder: '属性值',
      addButtonText: '添加属性',
    },
    render: (value: Record<string, any>) => (
      <div className="text-xs">
        {Object.entries(value)
          .slice(0, 2)
          .map(([key, val]) => (
            <div key={key} className="truncate">
              <span className="font-medium">{key}:</span> {String(val)}
            </div>
          ))}
        {Object.keys(value).length > 2 && <div className="text-muted-foreground">+{Object.keys(value).length - 2} more</div>}
      </div>
    ),
  },
  {
    name: 'email',
    title: '邮箱',
    dataIndex: 'email',
    width: 180,
    editable: true,
    editConfig: {
      type: 'input',
      placeholder: '请输入邮箱地址',
      rules: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '请输入有效的邮箱地址',
      },
    },
  },
  {
    name: 'phone',
    title: '电话',
    dataIndex: 'phone',
    width: 120,
    editable: true,
    editConfig: {
      type: 'input',
      placeholder: '请输入电话号码',
      rules: {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入有效的手机号码',
      },
    },
  },
  {
    name: 'url',
    title: '网址',
    dataIndex: 'url',
    width: 200,
    ellipsis: true,
    editable: true,
    editConfig: {
      type: 'input',
      placeholder: '请输入网址',
      rules: {
        pattern: /^https?:\/\/.+/,
        message: '请输入有效的网址',
      },
    },
    render: (value: string) => (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {value}
      </a>
    ),
  },
  {
    name: 'file',
    title: '文件上传',
    dataIndex: 'file',
    width: 150,
    editable: true,
    editConfig: {
      type: 'file',
      placeholder: '请上传文件',
      multiple: false,
    },
    render: (value: string) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          fn();
        }}
        className="flex items-center text-blue-600 hover:underline"
      >
        <span className="i-lucide-file mr-1" />
        {value}
      </a>
    ),
  },
  {
    name: 'image',
    title: '图片上传',
    dataIndex: 'image',
    width: 120,
    editable: true,
    editConfig: {
      type: 'image',
      placeholder: '请上传图片',
      multiple: true,
      maxCount: 5,
    },
    render: (value: string) => (
      <div className="flex justify-center">
        <img src={value} alt="预览图" className="h-10 w-10 rounded object-cover" onClick={fn()} style={{ cursor: 'pointer' }} />
      </div>
    ),
  },
];

const meta: Meta<typeof AdvancedTable> = {
  title: 'EASAI/Table/EditFields',
  component: AdvancedTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '展示表格支持的所有编辑字段类型，包括文本、数字、日期、枚举、列表、对象等。',
      },
    },
  },
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
    toolbar: {
      description: '工具栏配置',
      control: { type: 'object' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdvancedTable>;

// 单元格编辑示例
export const CellEdit: Story = {
  render: () => (
    <TableProvider
      data={sampleData}
      columns={editColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        contextMenuable: true,
        rowActionable: true,
        columnHeaderActionable: true,
        pluginable: true,
        toolbarable: true,
        toolbar: { show: true },
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          total: sampleData.length,
        },
        plugin: {
          config: {
            cellEdit: {
              enabled: true,
              onEditSuccess: fn(),
              onEditError: fn(),
            },
          },
        },
        eventListeners: {
          // 单元格编辑事件监听
          'table-cell-edit': {
            actionKey: 'table-cell-edit',
            handler: fn(),
            priority: 1,
          },
          // 行编辑事件监听
          'table-row-edit': {
            actionKey: 'table-row-edit',
            handler: fn(),
            priority: 1,
          },
        },
      }}
    >
      <Card className="flex h-[600px] w-full flex-col border-1 p-4">
        <AdvancedTable
          toolbar={{
            show: true,
            left: [
              {
                key: 'add-row',
                label: '添加行',
                icon: 'plus',
                execute: fn(),
              },
            ],
          }}
        />
      </Card>
    </TableProvider>
  ),
};

// 行编辑示例 - 对话框模式
export const RowEditDialog: Story = {
  render: () => (
    <TableProvider
      data={sampleData}
      columns={editColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        contextMenuable: true,
        rowActionable: true,
        columnHeaderActionable: true,
        pluginable: true,
        fillContainer: true,
        toolbarable: true,
        toolbar: { show: true },
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          total: sampleData.length,
        },
        plugin: {
          config: {
            editRow: {
              name: 'editRow',
              enabled: true,
              mode: 'dialog',
              layout: 'grid',
              gridCols: 'auto',
              minFieldWidth: 300,
              showLabel: true,
              singleLine: false,
              onEditSuccess: fn(),
              onEditError: fn(),
            },
          },
        },
        eventListeners: {
          // 单元格编辑事件监听
          'table-cell-edit': {
            actionKey: 'table-cell-edit',
            handler: fn(),
            priority: 1,
          },
          // 行编辑事件监听
          'table-row-edit': {
            actionKey: 'table-row-edit',
            handler: fn(),
            priority: 1,
          },
        },
      }}
    >
      <Card className="flex h-[600px] w-full flex-col border-1 p-4">
        <AdvancedTable
          toolbar={{
            show: true,
          }}
        />
      </Card>
    </TableProvider>
  ),
};

// 行编辑示例 - 抽屉模式
// ⚠️ 注意：EditRowPlugin 的 mode 只支持 dialog | drawer | sheet | page，
//    **没有 inline（行内整行编辑）模式** —— 此前这里传过 mode: 'inline'，
//    导致 EditModal 静默落入 page 分支只渲染裸触发器，点击「编辑」毫无反应。
//    行内单元格级编辑请看 CellEdit 示例（plugin.config.cellEdit）。
export const RowEditDrawer: Story = {
  render: () => (
    <TableProvider
      data={sampleData}
      columns={editColumns}
      config={{
        size: 'md',
        selectable: true,
        sortable: true,
        filterable: true,
        bordered: true,
        striped: true,
        hoverable: true,
        rowActionable: true,
        contextMenuable: true,
        columnHeaderActionable: true,
        pluginable: true,
        dataMode: {
          sort: 'local',
          filter: 'local',
          pagination: 'local',
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
          show: true,
          total: sampleData.length,
        },
        plugin: {
          config: {
            editRow: {
              enabled: true,
              mode: 'drawer',
              layout: 'grid',
              gridCols: 'auto',
              minFieldWidth: 200,
              showLabel: true,
              singleLine: false,
              onEditSuccess: fn(),
              onEditError: fn(),
            },
          },
        },
        eventListeners: {
          // 单元格编辑事件监听
          'table-cell-edit': {
            actionKey: 'table-cell-edit',
            handler: fn(),
            priority: 1,
          },
          // 行编辑事件监听
          'table-row-edit': {
            actionKey: 'table-row-edit',
            handler: fn(),
            priority: 1,
          },
        },
      }}
    >
      <Card className="flex h-[600px] w-full flex-col border-1 p-4">
        <AdvancedTable
          toolbar={{
            show: true,
          }}
        />
      </Card>
    </TableProvider>
  ),
};

// 表单验证示例
export const WithValidation: Story = {
  render: () => (
    <TableProvider
      data={sampleData}
      columns={editColumns.map((col) => ({
        ...col,
        editConfig: {
          ...col?.editConfig,
          rules: {
            ...col?.editConfig?.rules,
            // 添加更多验证规则示例
            ...(col.dataIndex === 'text' && {
              required: true,
              minLength: 2,
              maxLength: 50,
              pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
              message: '只能包含字母、数字和中文字符',
            }),
            ...(col.dataIndex === 'number' && {
              required: true,
              min: 0,
              max: 10000,
            }),
          },
        },
      }))}
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
          total: sampleData.length,
        },
        plugin: {
          plugins: [
            {
              name: 'cellEdit',
              config: {
                enabled: true,
                onEditSuccess: fn(),
                onEditError: fn(),
              },
            },
            {
              name: 'editRow',
              config: {
                enabled: true,
                mode: 'dialog',
                layout: 'grid',
                gridCols: 'auto',
                minFieldWidth: 300,
                showLabel: true,
                singleLine: false,
                onEditSuccess: fn(),
                onEditError: fn(),
              },
            },
          ],
        },
      }}
    >
      <Card className="flex h-[600px] w-full flex-col border-1 p-4">
        <AdvancedTable
          toolbar={{
            show: true,
            left: [
              {
                key: 'validate-all',
                label: '验证所有数据',
                icon: 'check-circle',
                execute: fn(),
              },
            ],
          }}
        />
      </Card>
    </TableProvider>
  ),
};
