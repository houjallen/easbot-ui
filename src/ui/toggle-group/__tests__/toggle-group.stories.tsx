// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup, ToggleGroupItem } from '../toggle-group';

const meta: Meta<typeof ToggleGroup> = {
  title: 'EASAI/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const Basic: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="python">
      <ToggleGroupItem value="python">Python</ToggleGroupItem>
      <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      <ToggleGroupItem value="ruby">Ruby</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['python', 'javascript']}>
      <ToggleGroupItem value="python">Python</ToggleGroupItem>
      <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      <ToggleGroupItem value="ruby">Ruby</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="python">
      <ToggleGroupItem value="python">
        <span className="mr-2">🐍</span>
        Python
      </ToggleGroupItem>
      <ToggleGroupItem value="javascript">
        <span className="mr-2">⚡</span>
        JavaScript
      </ToggleGroupItem>
      <ToggleGroupItem value="ruby">
        <span className="mr-2">💎</span>
        Ruby
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="python">
      <ToggleGroupItem value="python">Python</ToggleGroupItem>
      <ToggleGroupItem value="javascript" disabled>
        JavaScript
      </ToggleGroupItem>
      <ToggleGroupItem value="ruby">Ruby</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithSize: Story = {
  render: () => (
    <div className="space-y-4">
      <ToggleGroup type="single" defaultValue="python" size="sm">
        <ToggleGroupItem value="python">Python</ToggleGroupItem>
        <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" defaultValue="python" size="default">
        <ToggleGroupItem value="python">Python</ToggleGroupItem>
        <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" defaultValue="python" size="lg">
        <ToggleGroupItem value="python">Python</ToggleGroupItem>
        <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const WithVariant: Story = {
  render: () => (
    <div className="space-y-4">
      <ToggleGroup type="single" defaultValue="python" variant="default">
        <ToggleGroupItem value="python">Python</ToggleGroupItem>
        <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" defaultValue="python" variant="outline">
        <ToggleGroupItem value="python">Python</ToggleGroupItem>
        <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};
