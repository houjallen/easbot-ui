/**
 * Avatar 组件 Storybook 示例
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { User } from 'lucide-react';
import React from 'react';
import { Button } from '../button';
import type { AvatarProps } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'EASAI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '用户头像组件，支持图片、文字、图标等多种展示形式',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// 基础示例
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

// 图片示例
export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// 图标示例
export const WithIcon: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  ),
};

// 状态指示示例
export const WithStatus: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar status="online" />
      <Avatar status="offline" />
      <Avatar status="busy" />
      <Avatar status="away" />
    </div>
  ),
};

// 组合示例
export const Combination: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Avatar size="sm" shape="square">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar size="md">
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <Avatar size="lg" shape="square">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex gap-4">
        <Avatar status="online">
          <AvatarImage src="/user1.jpg" />
          <AvatarFallback>U1</AvatarFallback>
        </Avatar>
        <Avatar status="busy">
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
};

// 新增动态状态示例
export const DynamicStatus: Story = {
  render: () => {
    const [status, setStatus] = React.useState<AvatarProps['status']>('online');
    return (
      <div className="flex flex-col gap-4">
        <Avatar status={status} />
        <div className="flex gap-2">
          <Button onClick={() => setStatus('online')}>在线</Button>
          <Button onClick={() => setStatus('busy')}>忙碌</Button>
          <Button onClick={() => setStatus('away')}>离开</Button>
        </div>
      </div>
    );
  },
};

// 新增自定义位置示例
export const CustomPosition: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar status="online" statusOffset={['2px', '2px']} />
      <Avatar status="busy" statusOffset={['-4px', '-4px']} />
    </div>
  ),
};
