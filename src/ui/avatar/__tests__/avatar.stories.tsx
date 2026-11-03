/**
 * Avatar 组件 Storybook 示例
 */

import { Button } from '../../button';
import type { Meta, StoryObj } from '@storybook/react';
import { User } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

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
    shape: {
      control: 'select',
      options: ['circle', 'square'],
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

// 组合示例
export const Combination: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Avatar shape="square">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <Avatar shape="square">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src="/user1.jpg" />
          <AvatarFallback>U1</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
};

// 用例：自定义实现多种状态点
export const CustomStatusDemo: Story = {
  render: () => (
    <div className="flex gap-6">
      {/* 在线状态，绿色 */}
      <Avatar showStatus statusColor="var(--success)">
        <AvatarFallback>在</AvatarFallback>
      </Avatar>
      {/* 离线状态，灰色 */}
      <Avatar showStatus statusColor="var(--muted)">
        <AvatarFallback>离</AvatarFallback>
      </Avatar>
      {/* 忙碌状态，红色 */}
      <Avatar showStatus statusColor="var(--destructive)">
        <AvatarFallback>忙</AvatarFallback>
      </Avatar>
      {/* 警告状态，黄色，左上角 */}
      <Avatar showStatus statusColor="var(--warning)" statusPosition="top-left">
        <AvatarFallback>警</AvatarFallback>
      </Avatar>
    </div>
  ),
};

// 用例：动态切换状态点
export const DynamicStatus: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [color, setColor] = React.useState('var(--success)');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [pos, setPos] = React.useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
    return (
      <>
        <Avatar showStatus statusColor={color} statusPosition={pos}>
          <AvatarFallback>我</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button onClick={() => setColor('var(--success)')}>在线</Button>
            <Button onClick={() => setColor('var(--destructive)')}>忙碌</Button>
            <Button onClick={() => setColor('var(--muted)')}>离线</Button>
            <Button onClick={() => setColor('var(--warning)')}>警告</Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPos('top-left')}>左上</Button>
            <Button onClick={() => setPos('top-right')}>右上</Button>
            <Button onClick={() => setPos('bottom-left')}>左下</Button>
            <Button onClick={() => setPos('bottom-right')}>右下</Button>
          </div>
        </div>
      </>
    );
  },
};
