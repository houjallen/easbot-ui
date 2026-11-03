// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
// 统一使用 lucide-react
import { User } from 'lucide-react';
import { Button } from '../../button/button';
import { Badge } from '../badge';

const meta: Meta<typeof Badge> = {
  title: 'EASAI/Badge',
  component: Badge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Badge>;

/**
 * 默认 Badge 示例
 */
export const Default: Story = {
  args: {
    children: '默认徽章',
  },
};

/**
 * 所有主题变体（variant）演示
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Badge>默认</Badge>
      <Badge variant="secondary">次要</Badge>
      <Badge variant="destructive">危险</Badge>
      <Badge variant="outline">轮廓</Badge>
    </div>
  ),
};

/**
 * asChild 用法示例（包裹 Button）
 */
export const AsChild: Story = {
  render: (args) => (
    <Badge asChild {...args}>
      <Button size="sm">按钮徽章</Button>
    </Badge>
  ),
  args: {},
};

/**
 * 自定义 className 示例（加粗字体+红色文字）
 */
export const CustomClassName: Story = {
  args: {
    children: '自定义样式徽章',
    className: 'font-bold text-red-600',
  },
};

/**
 * aria-invalid 场景示例
 */
export const AriaInvalid: Story = {
  args: {
    children: '错误状态徽章',
    'aria-invalid': true,
  },
};

/**
 * 数字徽章（count）用法
 */
export const Count: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Badge count={5}>通知</Badge>
      <Badge count={99} overflowCount={9}>
        超出封顶
      </Badge>
      <Badge count={0} showZero>
        显示零
      </Badge>
      <Badge count={-1}>负数不显示</Badge>
      <Badge count={8}>字符串数字</Badge>
      <Badge count={1000} overflowCount={999}>
        大数字
      </Badge>
    </div>
  ),
};

/**
 * 状态点徽章（dot）用法
 */
export const Dot: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Badge dot>纯点</Badge>
      <Badge dot dotColor="#52c41a">
        自定义颜色
      </Badge>
      <Badge dot offset={[0, 0]}>
        <User size={20} />
      </Badge>
      <Badge dot offset={[10, -10]}>
        偏移点
      </Badge>
    </div>
  ),
};

/**
 * 组合用法：头像+数字/点
 */
export const AvatarWithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge count={8}>
        <img src="https://api.dicebear.com/7.x/minidenticon/svg?seed=badge" alt="头像" width={40} height={40} style={{ borderRadius: 8 }} />
      </Badge>
      <Badge dot>
        <img src="https://api.dicebear.com/7.x/minidenticon/svg?seed=dot" alt="头像" width={40} height={40} style={{ borderRadius: 8 }} />
      </Badge>
    </div>
  ),
};

/**
 * 动画持续时间（animationDuration）演示
 */
export const Animation: Story = {
  render: () => (
    <Badge count={7} animationDuration={1000}>
      <Button>动画徽章</Button>
    </Badge>
  ),
};

/**
 * dot 类型所有变体对比
 */
export const DotVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      {/* 默认点 */}
      <Badge dot>默认</Badge>
      {/* 自定义颜色 */}
      <Badge dot dotColor="#52c41a">
        绿色
      </Badge>
      <Badge dot dotColor="red">
        红色
      </Badge>
      {/* 自定义大小（通过 className 或 style） */}
      <Badge dot className="!w-4 !h-4">
        大点
      </Badge>
      <Badge dot className="!w-2 !h-2">
        小点
      </Badge>
      {/* 偏移 */}
      <Badge dot offset={[8, -8]}>
        偏移
      </Badge>
      {/* 包裹头像 */}
      <Badge dot>
        <img src="https://api.dicebear.com/7.x/minidenticon/svg?seed=dot" alt="头像" width={32} height={32} style={{ borderRadius: 8 }} />
      </Badge>
      {/* 包裹 icon */}
      <Badge dot>
        <User size={20} />
      </Badge>
      {/* 动画演示 */}
      <Badge dot animationDuration={1000}>
        动画
      </Badge>
    </div>
  ),
};

/**
 * dot 类型所有 variant 变体对比
 */
export const DotVariantsByVariant: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge dot variant="default">
        default
      </Badge>
      <Badge dot variant="secondary">
        secondary
      </Badge>
      <Badge dot variant="destructive">
        destructive
      </Badge>
      <Badge dot variant="outline">
        outline
      </Badge>
      <Badge dot variant="success">
        success
      </Badge>
      <Badge dot variant="warning">
        warning
      </Badge>
      <Badge dot variant="info">
        info
      </Badge>
    </div>
  ),
};
