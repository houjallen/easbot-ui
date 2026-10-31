/**
 * Badge 组件的 Storybook 示例文件
 *
 * 展示了Badge组件的各种使用场景和样式变体
 */

import type { Meta, StoryObj } from '@storybook/react';
import { AlertCircle, Bell, CheckCircle, Mail, MessageCircle, User } from 'lucide-react';
import * as React from 'react';
import { Button } from '../button';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'EASAI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

/**
 * 默认示例
 */
export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="default" className="px-3">
        默认徽标
      </Badge>
      <Badge variant="secondary" className="px-3">
        次要徽标
      </Badge>
      <Badge variant="destructive" className="px-3">
        危险徽标
      </Badge>
      <Badge variant="outline" className="px-3 border-2">
        轮廓徽标
      </Badge>
      <Badge variant="success" className="px-3">
        成功徽标
      </Badge>
      <Badge variant="warning" className="px-3">
        警告徽标
      </Badge>
      <Badge variant="info" className="px-3">
        信息徽标
      </Badge>
    </div>
  ),
};

/**
 * 变体
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="default" className="px-3">
        默认
      </Badge>
      <Badge variant="secondary" className="px-3">
        次要
      </Badge>
      <Badge variant="destructive" className="px-3">
        危险
      </Badge>
      <Badge variant="outline" className="px-3 border-2">
        轮廓
      </Badge>
      <Badge variant="success" className="px-3">
        成功
      </Badge>
      <Badge variant="warning" className="px-3">
        警告
      </Badge>
      <Badge variant="info" className="px-3">
        信息
      </Badge>
    </div>
  ),
};

/**
 * 不同尺寸
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="info" size="sm" className="px-3">
        小号
      </Badge>
      <Badge variant="info" size="default" className="px-3">
        默认
      </Badge>
      <Badge variant="info" size="lg" className="px-3">
        大号
      </Badge>
    </div>
  ),
};

/**
 * 圆角变体
 */
export const Rounded: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="success" rounded="none" className="px-3">
        无圆角
      </Badge>
      <Badge variant="success" rounded="sm" className="px-3">
        小圆角
      </Badge>
      <Badge variant="success" rounded="default" className="px-3">
        默认
      </Badge>
      <Badge variant="success" rounded="lg" className="px-3">
        大圆角
      </Badge>
      <Badge variant="success" rounded="full" className="px-3">
        全圆角
      </Badge>
    </div>
  ),
};

/**
 * 带图标
 */
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="default" className="px-3">
        <Bell className="mr-1 h-3 w-3" />
        通知
      </Badge>
      <Badge variant="secondary" className="px-3">
        <Mail className="mr-1 h-3 w-3" />
        邮件
      </Badge>
      <Badge variant="outline" className="px-3 border-2">
        <User className="mr-1 h-3 w-3" />
        用户
      </Badge>
      <Badge variant="success" className="px-3">
        <CheckCircle className="mr-1 h-3 w-3" />
        成功
      </Badge>
      <Badge variant="destructive" className="px-3">
        <AlertCircle className="mr-1 h-3 w-3" />
        错误
      </Badge>
    </div>
  ),
};

/**
 * 徽标数字
 */
export const WithCount: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Badge count={5} variant="default">
          <Bell className="h-6 w-6" />
        </Badge>
        <Badge count={99} variant="info">
          <Mail className="h-6 w-6" />
        </Badge>
        <Badge count={100} overflowCount={99} variant="success">
          <MessageCircle className="h-6 w-6" />
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="destructive" dot>
          <MessageCircle className="h-6 w-6" />
        </Badge>
        <Badge variant="warning" count={0} showZero>
          <User className="h-6 w-6" />
        </Badge>
        <Badge variant="secondary" count={5} offset={[-2, -2]}>
          <CheckCircle className="h-6 w-6" />
        </Badge>
      </div>
    </div>
  ),
};

/**
 * 新增偏移量示例
 */
export const WithOffset: Story = {
  render: () => (
    <div className="flex gap-4">
      <Badge count={5} offset={[10, 10]}>
        <Mail className="h-6 w-6" />
      </Badge>
      <Badge dot offset={[5, 5]}>
        <Bell className="h-6 w-6" />
      </Badge>
    </div>
  ),
};

/**
 * 新增组合示例
 */
export const Combination: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Badge variant="success" count={99}>
          <Mail className="h-6 w-6" />
        </Badge>
        <Badge variant="warning" rounded="full" count={100}>
          <Bell className="h-6 w-6" />
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="destructive" dot>
          <MessageCircle className="h-6 w-6" />
        </Badge>
        <Badge variant="info" count={0} showZero>
          <User className="h-6 w-6" />
        </Badge>
      </div>
    </div>
  ),
};

/**
 * 新增动态示例
 */
export const DynamicCount: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    return (
      <div className="flex flex-col gap-4">
        <Badge count={count}>
          <Mail className="h-6 w-6" />
        </Badge>
        <div className="flex gap-2">
          <Button onClick={() => setCount((c) => c + 1)}>增加</Button>
          <Button variant="outline" onClick={() => setCount(0)}>
            重置
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * 新增自定义样式示例
 */
export const CustomStyle: Story = {
  render: () => (
    <Badge dot dotColor="var(--custom-color)" className="border-dashed" style={{ '--custom-color': '#ff00ff' } as React.CSSProperties}>
      <User className="h-6 w-6" />
    </Badge>
  ),
};
