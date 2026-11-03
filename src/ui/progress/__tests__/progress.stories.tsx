// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Progress } from '../progress';

const meta = {
  title: 'EASAI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

// 动画演示
export const Animated: Story = {
  name: '动态进度演示',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = React.useState(10);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      const timer = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 800);
      return () => clearInterval(timer);
    }, []);
    return (
      <div className="w-full max-w-md" style={{ width: '100%', minWidth: '300px' }}>
        <Progress value={value} />
        <div className="mt-1 flex justify-between text-muted-foreground text-sm">
          <span>动态进度</span>
          <span>{value}%</span>
        </div>
      </div>
    );
  },
};

export const Default: Story = {
  name: '基础用法',
  render: () => (
    <div className="w-full max-w-md" style={{ width: '100%', minWidth: '300px' }}>
      <Progress value={60} />
      <div className="mt-1 flex justify-between text-muted-foreground text-sm">
        <span>进度</span>
        <span>60%</span>
      </div>
    </div>
  ),
};

export const Indeterminate: Story = {
  name: '不确定进度',
  render: () => (
    <div className="w-full max-w-md" style={{ width: '100%', minWidth: '300px' }}>
      <Progress value={undefined} />
      <div className="mt-1 flex justify-between text-muted-foreground text-sm">
        <span>不确定状态</span>
        <span>加载中...</span>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  name: '带标签',
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Progress value={80} />
      <div className="flex justify-between text-muted-foreground text-sm">
        <span>进度</span>
        <span>80%</span>
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  name: '多色变体',
  render: () => (
    <div className="w-full max-w-md space-y-6" style={{ width: '100%', minWidth: '300px' }}>
      <div>
        <Progress value={40} />
        <div className="mt-1 flex justify-between text-muted-foreground text-sm">
          <span>默认</span>
          <span>40%</span>
        </div>
      </div>
      <div>
        <Progress value={60} className="[&_[data-slot=progress-indicator]]:bg-green-500" />
        <div className="mt-1 flex justify-between text-green-600 text-sm">
          <span>成功</span>
          <span>60%</span>
        </div>
      </div>
      <div>
        <Progress value={80} className="[&_[data-slot=progress-indicator]]:bg-yellow-400" />
        <div className="mt-1 flex justify-between text-sm text-yellow-600">
          <span>警告</span>
          <span>80%</span>
        </div>
      </div>
      <div>
        <Progress value={90} className="[&_[data-slot=progress-indicator]]:bg-red-500" />
        <div className="mt-1 flex justify-between text-red-600 text-sm">
          <span>错误</span>
          <span>90%</span>
        </div>
      </div>
      <div>
        <Progress value={50} className="[&_[data-slot=progress-indicator]]:bg-blue-500" />
        <div className="mt-1 flex justify-between text-blue-600 text-sm">
          <span>信息</span>
          <span>50%</span>
        </div>
      </div>
      <div>
        <Progress value={70} className="[&_[data-slot=progress-indicator]]:bg-purple-500" />
        <div className="mt-1 flex justify-between text-purple-600 text-sm">
          <span>品牌</span>
          <span>70%</span>
        </div>
      </div>
      <div>
        <Progress value={30} className="[&_[data-slot=progress-indicator]]:bg-pink-500" />
        <div className="mt-1 flex justify-between text-pink-600 text-sm">
          <span>自定义</span>
          <span>30%</span>
        </div>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  name: '禁用状态',
  render: () => (
    <div className="w-full max-w-md" style={{ width: '100%', minWidth: '300px' }}>
      <Progress value={50} className="cursor-not-allowed opacity-50" />
      <div className="mt-1 flex justify-between text-muted-foreground text-sm">
        <span>禁用状态</span>
        <span>50%</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: '不同尺寸',
  render: () => (
    <div className="w-full max-w-md space-y-6" style={{ width: '100%', minWidth: '300px' }}>
      <div>
        <Progress value={30} className="h-2" />
        <div className="mt-1 flex justify-between text-muted-foreground text-sm">
          <span>小尺寸</span>
          <span>30%</span>
        </div>
      </div>
      <div>
        <Progress value={50} className="h-3" />
        <div className="mt-1 flex justify-between text-muted-foreground text-sm">
          <span>中尺寸</span>
          <span>50%</span>
        </div>
      </div>
      <div>
        <Progress value={70} className="h-4" />
        <div className="mt-1 flex justify-between text-muted-foreground text-sm">
          <span>大尺寸</span>
          <span>70%</span>
        </div>
      </div>
    </div>
  ),
};
