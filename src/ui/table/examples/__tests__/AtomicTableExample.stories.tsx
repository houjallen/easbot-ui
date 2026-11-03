// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { TableProvider } from '../../context/TableContext';
import { AtomicTableExample } from '../AtomicTableExample';

/**
 * 原子组件（TableContainer / TableRow 等）依赖 TableContext，
 * 必须包裹 TableProvider 祖先，否则渲染时抛出 useTableContext 错误
 */
const withProvider = (children: ReactNode) => <TableProvider config={{ i18n: { locale: 'zh-CN' } }}>{children}</TableProvider>;

const meta: Meta<typeof AtomicTableExample> = {
  title: 'EASAI/Table/AtomicTableExample',
  component: AtomicTableExample,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '展示如何使用表格原子组件构建完整的表格功能。通过组合 TableContainer、TableGrid、TableHeader、TableBody、TableRow、TableCell 等原子组件，实现复杂的表格交互和功能。遵循组合式设计规范，每个原子组件专注单一职责。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: '表格大小',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    density: {
      description: '表格密度',
      control: { type: 'select' },
      options: ['compact', 'comfortable'],
    },
    bordered: {
      description: '是否显示边框',
      control: { type: 'boolean' },
    },
    selectable: {
      description: '是否启用选择功能',
      control: { type: 'boolean' },
    },
    hoverable: {
      description: '是否启用悬停效果',
      control: { type: 'boolean' },
    },
    stickyHeader: {
      description: '表头是否粘性定位',
      control: { type: 'boolean' },
    },
    loading: {
      description: '是否显示加载状态',
      control: { type: 'boolean' },
    },
    showEmpty: {
      description: '是否显示空状态',
      control: { type: 'boolean' },
    },
    scrollable: {
      description: '是否启用滚动',
      control: { type: 'boolean' },
    },
    resizeable: {
      description: '是否启用可调整大小',
      control: { type: 'boolean' },
    },
    ellipsis: {
      description: '是否启用截断文本',
      control: { type: 'boolean' },
    },
    deleteMode: {
      description: '删除模式：local 本地删除（立即移除）/ remote 远程删除（先请求后移除）',
      control: { type: 'select' },
      options: ['local', 'remote'],
    },
  },
} satisfies Meta<typeof AtomicTableExample>;

export default meta;
type Story = StoryObj<typeof AtomicTableExample>;

// 基础示例
export const Default: Story = {
  args: {
    size: 'md',
    density: 'comfortable',
    bordered: true,
    selectable: true,
    hoverable: true,
    stickyHeader: false,
    loading: false,
    showEmpty: false,
    scrollable: false,
    resizeable: false,
    ellipsis: false,
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '基础的原子组件表格示例，展示最常用的配置和功能。包含选择、悬停、点击展开等基础交互。',
      },
    },
  },
};

// 紧凑型表格
export const Compact: Story = {
  args: {
    size: 'sm',
    density: 'compact',
    bordered: true,
    selectable: true,
    hoverable: true,
    stickyHeader: false,
    loading: false,
    showEmpty: false,
    scrollable: false,
    resizeable: false,
    ellipsis: true,
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '紧凑型表格配置，使用小尺寸和紧凑密度，启用文本截断功能，适合空间有限的场景。',
      },
    },
  },
};

// 大型表格
export const Large: Story = {
  args: {
    size: 'lg',
    density: 'comfortable',
    bordered: true,
    selectable: true,
    hoverable: true,
    stickyHeader: true,
    loading: false,
    showEmpty: false,
    scrollable: true,
    resizeable: true,
    ellipsis: false,
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '大型表格配置，启用粘性表头、滚动和列大小调整功能，适合数据较多的场景。',
      },
    },
  },
};

// 加载状态
export const Loading: Story = {
  args: {
    size: 'md',
    density: 'comfortable',
    bordered: true,
    selectable: false,
    hoverable: false,
    stickyHeader: false,
    loading: true,
    showEmpty: false,
    scrollable: false,
    resizeable: false,
    ellipsis: false,
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '表格加载状态展示，使用 TableContainer 组件的内置加载状态功能。',
      },
    },
  },
};

// 空状态
export const Empty: Story = {
  args: {
    size: 'md',
    density: 'comfortable',
    bordered: true,
    selectable: false,
    hoverable: false,
    stickyHeader: false,
    loading: false,
    showEmpty: true,
    scrollable: false,
    resizeable: false,
    ellipsis: false,
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '表格空状态展示，使用 TableContainer 组件的内置空状态功能。',
      },
    },
  },
};

// 高级配置
export const Advanced: Story = {
  args: {
    size: 'lg',
    density: 'comfortable',
    bordered: true,
    selectable: true,
    hoverable: true,
    stickyHeader: true,
    loading: false,
    showEmpty: false,
    scrollable: true,
    resizeable: true,
    ellipsis: true,
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '高级配置示例，启用所有交互功能：粘性表头、滚动、列调整、文本截断、选择和悬停效果。',
      },
    },
  },
};

// 远程删除模式
export const RemoteDelete: Story = {
  args: {
    size: 'md',
    density: 'comfortable',
    bordered: true,
    selectable: true,
    hoverable: true,
    stickyHeader: false,
    loading: false,
    showEmpty: false,
    scrollable: false,
    resizeable: false,
    ellipsis: false,
    deleteMode: 'remote',
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '远程删除模式：点击删除后先模拟后端请求（约 300ms），成功后才移除该行；请求失败则数据保持不变。与本地删除的唯一差别是「何时改 data」。',
      },
    },
  },
};

// 简化表格
export const Minimal: Story = {
  args: {
    size: 'md',
    density: 'comfortable',
    bordered: false,
    selectable: false,
    hoverable: false,
    stickyHeader: false,
    loading: false,
    showEmpty: false,
    scrollable: false,
    resizeable: false,
    ellipsis: false,
  },
  render: (args) => withProvider(<AtomicTableExample {...args} />),
  parameters: {
    docs: {
      description: {
        story: '最简化的表格配置，去除所有额外功能，只保留基础的数据展示。',
      },
    },
  },
};
