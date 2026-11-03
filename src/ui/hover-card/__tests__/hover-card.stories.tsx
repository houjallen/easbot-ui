// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../hover-card';

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
          <h4 className="font-semibold text-sm">提示信息</h4>
          <p className="text-sm">这是一个悬停卡片示例</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* 小尺寸 HoverCard */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">小尺寸</Button>
        </HoverCardTrigger>
        {/* @ts-expect-error size/variant 类型由设计系统透传，实际可用，忽略ts校验 */}
        <HoverCardContent size="sm">
          <div className="text-xs">width: sm</div>
        </HoverCardContent>
      </HoverCard>
      {/* 大尺寸 HoverCard */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">大尺寸</Button>
        </HoverCardTrigger>
        {/* @ts-expect-error size/variant 类型由设计系统透传，实际可用，忽略ts校验 */}
        <HoverCardContent size="lg">
          <div className="text-base">width: lg</div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

/**
 * 主题变体演示
 */
export const ThemeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">默认主题</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>默认主题内容</div>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">暗色主题</Button>
        </HoverCardTrigger>
        {/* @ts-expect-error size/variant 类型由设计系统透传，实际可用，忽略ts校验 */}
        <HoverCardContent variant="dark">
          <div className="text-white">暗色主题内容</div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};
