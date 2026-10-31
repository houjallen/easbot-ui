import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'EASAI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md" style={{ width: '100%', minWidth: '300px' }}>
      <Progress value={60} />
      <div className="flex justify-between text-sm text-muted-foreground mt-1">
        <span>进度</span>
        <span>60%</span>
      </div>
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div className="w-full max-w-md" style={{ width: '100%', minWidth: '300px' }}>
      <Progress value={undefined} />
      <div className="flex justify-between text-sm text-muted-foreground mt-1">
        <span>不确定状态</span>
        <span>加载中...</span>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Progress value={80} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>进度</span>
        <span>80%</span>
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-6" style={{ width: '100%', minWidth: '300px' }}>
      <div>
        <Progress value={40} />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>默认</span>
          <span>40%</span>
        </div>
      </div>
      <div>
        <Progress value={60} indicatorClassName="bg-[var(--progress-indicator-success)]" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>成功</span>
          <span>60%</span>
        </div>
      </div>
      <div>
        <Progress value={80} indicatorClassName="bg-[var(--progress-indicator-warning)]" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>警告</span>
          <span>80%</span>
        </div>
      </div>
      <div>
        <Progress value={90} indicatorClassName="bg-[var(--progress-indicator-error)]" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>错误</span>
          <span>90%</span>
        </div>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-md" style={{ width: '100%', minWidth: '300px' }}>
      <Progress value={50} className="opacity-50 cursor-not-allowed" />
      <div className="flex justify-between text-sm text-muted-foreground mt-1">
        <span>禁用状态</span>
        <span>50%</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-6" style={{ width: '100%', minWidth: '300px' }}>
      <div>
        <Progress value={30} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>小尺寸</span>
          <span>30%</span>
        </div>
      </div>
      <div>
        <Progress value={50} className="h-3" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>中尺寸</span>
          <span>50%</span>
        </div>
      </div>
      <div>
        <Progress value={70} className="h-4" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>大尺寸</span>
          <span>70%</span>
        </div>
      </div>
    </div>
  ),
};
