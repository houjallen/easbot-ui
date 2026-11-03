// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible';

const meta = {
  title: 'EASAI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger>点击展开</CollapsibleTrigger>
      <CollapsibleContent>
        <p>这是可折叠的内容区域</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger>
        <span className="mr-2">🔍</span>
        详细信息
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p>这是包含图标和详细信息的可折叠内容区域</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger disabled>
        <span className="mr-2">🔒</span>
        禁用的可折叠
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p>这个可折叠被禁用了</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4">
      <Collapsible>
        <CollapsibleTrigger>第一项</CollapsibleTrigger>
        <CollapsibleContent>
          <p>这是第一项的内容</p>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger>第二项</CollapsibleTrigger>
        <CollapsibleContent>
          <p>这是第二项的内容</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
