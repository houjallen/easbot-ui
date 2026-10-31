import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { Button } from '../button';

const meta: Meta<typeof HoverCard> = {
  title: 'EASAI/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">悬停查看</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">提示信息</h4>
          <p className="text-sm">这是一个悬停卡片示例</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>小尺寸卡片</Button>
        </HoverCardTrigger>
        <HoverCardContent size="sm">
          <p>小尺寸内容区域</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>大尺寸卡片</Button>
        </HoverCardTrigger>
        <HoverCardContent size="lg">
          <p>大尺寸内容区域</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const ThemeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>默认主题</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <p>默认主题内容</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>暗色主题</Button>
        </HoverCardTrigger>
        <HoverCardContent variant="dark">
          <p>暗色主题内容</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};
