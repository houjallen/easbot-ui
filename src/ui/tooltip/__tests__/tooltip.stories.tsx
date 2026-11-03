// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';

import { Info } from 'lucide-react';
import { Badge } from '../../badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';

const meta = {
  title: 'EASAI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">悬停查看</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>这是一个基本提示信息</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">详细信息</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">提示标题</p>
            <p className="text-muted-foreground text-sm">这里是详细的提示说明内容。</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <Info className="mr-2 h-4 w-4" />
            帮助
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">提示标题</p>
            <p className="text-muted-foreground text-sm">带图标的提示说明。</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary">状态</Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>这是一个状态提示</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="outline">延迟显示</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">延迟提示</p>
            <p className="text-muted-foreground text-sm">延迟500毫秒后显示提示信息。</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const DifferentPositions: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">上</Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>顶部提示</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">右</Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>右侧提示</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">左</Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>左侧提示</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">下</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>底部提示</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  ),
};
