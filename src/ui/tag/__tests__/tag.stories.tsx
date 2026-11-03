import type { Meta, StoryObj } from '@storybook/react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import * as React from 'react';
import { Tag } from '../tag';

const meta: Meta<typeof Tag> = {
  title: 'EASAI/Tag',
  component: Tag,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    children: '默认标签',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tag>默认</Tag>
      <Tag variant="success">成功</Tag>
      <Tag variant="warning">警告</Tag>
      <Tag variant="info">信息</Tag>
      <Tag variant="error">错误</Tag>
      <Tag variant="secondary">次要</Tag>
      <Tag variant="outline">轮廓</Tag>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tag size="sm">小</Tag>
      <Tag size="md">中</Tag>
      <Tag size="lg">大</Tag>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tag icon={<Info size={14} />}>信息</Tag>
      <Tag icon={<CheckCircle size={14} />} variant="success">
        成功
      </Tag>
      <Tag icon={<AlertTriangle size={14} />} variant="warning">
        警告
      </Tag>
      <Tag icon={<XCircle size={14} />} variant="error">
        错误
      </Tag>
    </div>
  ),
};

export const Closable: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    return (
      <div style={{ display: 'flex', gap: 16 }}>
        {visible && (
          <Tag closable onClose={() => setVisible(false)}>
            可关闭标签
          </Tag>
        )}
        <Tag closable variant="success">
          成功
        </Tag>
        <Tag closable variant="warning">
          警告
        </Tag>
      </div>
    );
  },
};

export const CustomColor: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tag color="#722ed1">自定义紫色</Tag>
      <Tag color="#13c2c2">自定义青色</Tag>
      <Tag color="#eb2f96">自定义粉色</Tag>
    </div>
  ),
};

export const CustomClassName: Story = {
  args: {
    children: '自定义样式',
    className: 'font-bold text-blue-600',
  },
};
