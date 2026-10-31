/**
 * Input 组件 Stories
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Search, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof Input> = {
  title: 'EASAI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Input 输入框组件用于获取用户文本输入，支持多种状态、尺寸和样式变体。
可以添加前缀/后缀图标，支持错误状态和禁用状态。
        `,
      },
      story: {
        height: '300px',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: '输入框变体样式',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'radio',
      options: ['default', 'sm', 'lg'],
      description: '输入框尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    loading: {
      control: 'boolean',
      description: '是否加载中',
    },
    error: {
      control: 'boolean',
      description: '是否错误状态',
    },
    success: {
      control: 'boolean',
      description: '是否成功状态',
    },
    iconSize: {
      control: 'text',
      description: '自定义图标尺寸（CSS单位）',
    },
    wrapperClassName: {
      control: 'text',
      description: '容器类名（用于自定义布局）',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

// 基础示例
export const Default: Story = {
  args: {
    placeholder: '请输入内容',
  },
};

// 变体示例
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input placeholder="默认输入框" />
      <Input variant="error" placeholder="错误输入框" />
      <Input variant="success" placeholder="成功输入框" />
    </div>
  ),
};

// 尺寸示例
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input size="sm" placeholder="小型输入框" />
      <Input size="default" placeholder="默认输入框" />
      <Input size="lg" placeholder="大型输入框" />
    </div>
  ),
};

// 状态示例
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input disabled placeholder="禁用状态" />
      <Input loading placeholder="加载状态" />
      <Input error placeholder="错误状态" />
      <Input success placeholder="成功状态" />
    </div>
  ),
};

// 图标示例
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input prefix={<Search className="h-4 w-4 text-muted-foreground" />} placeholder="搜索..." />
      <Input prefix={<Mail className="h-4 w-4 text-muted-foreground" />} placeholder="请输入邮箱" />
      <Input prefix={<Lock className="h-4 w-4 text-muted-foreground" />} suffix={<Eye className="h-4 w-4 text-muted-foreground" />} type="password" placeholder="请输入密码" />
    </div>
  ),
};

// 密码输入框示例
export const Password: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="w-[300px]">
        <Input
          type={showPassword ? 'text' : 'password'}
          prefix={<Lock className="h-4 w-4 text-muted-foreground" />}
          suffix={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
              {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </button>
          }
          placeholder="请输入密码"
        />
      </div>
    );
  },
};

// 加载状态示例
export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input loading prefix={<Search className="h-4 w-4 text-muted-foreground" />} suffix={<Loader2 className="h-4 w-4 animate-spin" />} placeholder="搜索中..." />
      <Input loading prefix={<Mail className="h-4 w-4 text-muted-foreground" />} suffix={<Loader2 className="h-4 w-4 animate-spin" />} placeholder="验证邮箱中..." />
    </div>
  ),
};

// 组合示例
export const Combinations: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input size="sm" error prefix={<Search className="h-3 w-3 text-destructive" />} placeholder="搜索出错" />
      <Input success prefix={<Mail className="h-4 w-4 text-success" />} placeholder="邮箱验证成功" />
      <Input size="lg" loading prefix={<Lock className="h-5 w-5 text-muted-foreground" />} suffix={<Loader2 className="h-5 w-5 animate-spin" />} placeholder="验证密码中..." />
    </div>
  ),
};

// 主题示例
export const Themed: Story = {
  decorators: [
    (Story) => (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-background">
          <h3 className="mb-4">浅色主题</h3>
          <Story />
        </div>
        <div className="p-4 bg-background dark">
          <h3 className="mb-4 text-foreground">深色主题</h3>
          <Story />
        </div>
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input placeholder="默认输入框" />
      <Input error placeholder="错误输入框" />
      <Input prefix={<Search className="h-4 w-4 text-muted-foreground" />} placeholder="搜索..." />
    </div>
  ),
};

// 新增响应式示例
export const Responsive: Story = {
  render: () => (
    <div className="max-w-[400px] mx-auto space-y-4">
      <Input placeholder="响应式输入框" className="w-full" />
      <div className="md:flex gap-4">
        <Input prefix={<Search />} className="md:w-3/4" />
        <Input suffix={<Mail />} className="md:w-1/4 mt-2 md:mt-0" />
      </div>
    </div>
  ),
};

// 新增表单集成示例
export const FormIntegration: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <form className="space-y-4 w-64">
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="表单输入" />
        <button type="submit" className="text-sm px-4 py-2 bg-primary text-white rounded">
          提交
        </button>
      </form>
    );
  },
};

// 新增过渡动画示例
export const Transition: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input placeholder="默认带过渡" />
      <Input transition={false} placeholder="禁用过渡" />
    </div>
  ),
};

// 新增暗色主题示例
export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
  },
  render: () => (
    <div className="flex flex-col gap-4 w-[300px] p-4 bg-gray-800 rounded">
      <Input placeholder="暗色主题输入框" />
      <Input error placeholder="错误状态" />
      <Input success placeholder="成功状态" />
    </div>
  ),
};
