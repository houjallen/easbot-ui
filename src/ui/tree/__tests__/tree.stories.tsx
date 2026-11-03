// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Tree } from '../tree';
import type { TreeNodeData } from '../tree';

// --- Sample Data ---

const sampleTreeData: TreeNodeData[] = [
  {
    id: '1',
    name: 'Parent 1 - With Icon',
    iconName: 'folder',
    children: [
      { id: '1-1', name: 'Child 1.1', iconName: 'file' },
      { id: '1-2', name: 'Child 1.2 (Disabled)', disabled: true },
      {
        id: '1-3',
        name: 'Child 1.3 - With Children',
        iconName: 'folder',
        children: [{ id: '1-3-1', name: 'Grandchild 1.3.1', iconName: 'file' }],
      },
    ],
  },
  {
    id: '2',
    name: 'Parent 2 - No Icon (Disabled)',
    disabled: true,
    children: [{ id: '2-1', name: 'Child 2.1' }],
  },
  {
    id: '3',
    name: 'Parent 3 - No Children',
  },
];

// --- Meta ---

const meta = {
  title: 'EASAI/Tree',
  component: Tree,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'The data for the tree structure.',
    },
    isSelectable: {
      control: 'boolean',
      description: '是否开启单选模式',
    },
    initialSelectedId: {
      control: 'text',
      description: '初始选中的节点ID (单选)',
    },
    onSelectChange: {
      action: 'onSelectChange',
      description: '单选模式下，选中节点变化时的回调函数',
    },
    isMultiSelectable: {
      control: 'boolean',
      description: '是否开启多选模式',
    },
    initialSelectedIds: {
      control: 'object',
      description: '初始选中的节点ID集合 (多选)',
    },
    onMultiSelectChange: {
      action: 'onMultiSelectChange',
      description: '多选模式下，选中节点变化时的回调函数',
    },
    initialExpandedIds: {
      control: 'object',
      description: 'A Set of initially expanded node IDs.',
    },
    allowNonLeafSelection: {
      control: 'boolean',
      description: '是否允许选择非叶子节点 (多选模式)',
    },
  },
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Default: Story = {
  args: {
    data: sampleTreeData,
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};

export const InitiallyExpanded: Story = {
  args: {
    ...Default.args,
    initialExpandedIds: new Set(['1', '1-3']),
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};

export const InitiallySelected: Story = {
  args: {
    ...Default.args,
    initialSelectedId: '1-1',
    initialExpandedIds: new Set(['1']), // expand parent to see selection
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};

export const NotSelectable: Story = {
  args: {
    ...Default.args,
    isSelectable: false,
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};

export const MultiSelectable: Story = {
  args: {
    ...Default.args,
    isSelectable: false,
    isMultiSelectable: true,
    initialExpandedIds: new Set(['1', '1-3']),
    initialSelectedIds: new Set(['1-1', '1-3-1']),
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};

export const MultiSelectLeafOnly: Story = {
  name: 'Multi-select (Leaf Only)',
  args: {
    ...MultiSelectable.args,
    allowNonLeafSelection: false,
    initialSelectedIds: new Set(['1-1', '1-3-1', '2-1']),
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};

export const WithDisabledNodes: Story = {
  name: 'With Disabled Nodes',
  args: {
    ...MultiSelectable.args,
    isMultiSelectable: true,
    allowNonLeafSelection: true,
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};

export const SingleSelectLeafOnly: Story = {
  name: 'Single-select (Leaf Only)',
  args: {
    ...Default.args,
    isSelectable: true,
    allowNonLeafSelection: false,
  },
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <Tree {...args} />
    </div>
  ),
};
