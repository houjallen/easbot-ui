import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'EASAI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">悬停查看</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>这是一个提示信息</p>
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
          <Button variant="outline">帮助</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">提示标题</p>
            <p className="text-sm text-muted-foreground">这里是详细的提示说明内容。</p>
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
          <Button size="icon" variant="outline">
            <span className="h-4 w-4">ℹ️</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>图标按钮提示</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">延迟提示</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>500ms 后显示提示</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
