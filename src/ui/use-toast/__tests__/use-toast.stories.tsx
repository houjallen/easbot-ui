// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { useToast } from '../';

const meta = {
  title: 'EASAI/UseToast',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof useToast>;

export default meta;

type Story = StoryObj<typeof meta>;

// 基础示例
export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { toast } = useToast();
    return <Button onClick={() => toast({ title: '测试' })}>显示 Toast</Button>;
  },
};

// 不同变体类型
export const Variants: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { toast } = useToast();
    return (
      <div className="space-y-2">
        <Button onClick={() => toast({ title: '默认', variant: 'default' })}>默认</Button>
        <Button onClick={() => toast({ title: '成功', variant: 'success' })}>成功</Button>
        <Button onClick={() => toast({ title: '警告', variant: 'warning' })}>警告</Button>
        <Button onClick={() => toast({ title: '信息', variant: 'info' })}>信息</Button>
        <Button onClick={() => toast({ title: '破坏性', variant: 'destructive' })}>破坏性</Button>
      </div>
    );
  },
};

// 不同位置
export const PositionExamples: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { toast } = useToast();
    return (
      <div className="space-y-2">
        <Button onClick={() => toast({ title: '右下', position: 'bottom-right' })}>右下</Button>
        <Button onClick={() => toast({ title: '左下', position: 'bottom-left' })}>左下</Button>
        <Button onClick={() => toast({ title: '右上', position: 'top-right' })}>右上</Button>
        <Button onClick={() => toast({ title: '左上', position: 'top-left' })}>左上</Button>
        <Button onClick={() => toast({ title: '顶部', position: 'top-center' })}>顶部</Button>
        <Button onClick={() => toast({ title: '底部', position: 'bottom-center' })}>底部</Button>
      </div>
    );
  },
};
