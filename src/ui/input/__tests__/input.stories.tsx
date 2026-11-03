/**
 * Input 组件 Stories
 */
// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Eye, EyeOff, Loader2, Lock, Mail, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../input';

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
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础示例
export const Default: Story = {
  args: {
    placeholder: '请输入内容',
  },
};

// 变体示例
export const Variants: Story = {
  render: () => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input placeholder="默认输入框" />
      <Input error placeholder="错误输入框" />
      <Input success placeholder="成功输入框" />
    </div>
  ),
};

// 状态示例
export const States: Story = {
  render: () => (
    <div className="flex w-[300px] flex-col gap-4">
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
    <div className="flex w-[300px] flex-col gap-4">
      <Input prefix={<Search className="h-4 w-4 text-muted-foreground" />} placeholder="搜索..." />
      <Input prefix={<Mail className="h-4 w-4 text-muted-foreground" />} placeholder="请输入邮箱" />
      <Input prefix={<Lock className="h-4 w-4 text-muted-foreground" />} suffix={<Eye className="h-4 w-4 text-muted-foreground" />} type="password" placeholder="请输入密码" />
    </div>
  ),
};

// 密码输入框示例
export const Password: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
    <div className="flex w-[300px] flex-col gap-4">
      <Input loading prefix={<Search className="h-4 w-4 text-muted-foreground" />} suffix={<Loader2 className="h-4 w-4 animate-spin" />} placeholder="搜索中..." />
      <Input loading prefix={<Mail className="h-4 w-4 text-muted-foreground" />} suffix={<Loader2 className="h-4 w-4 animate-spin" />} placeholder="验证邮箱中..." />
    </div>
  ),
};

// 组合示例
export const Combinations: Story = {
  render: () => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input error prefix={<Search className="h-3 w-3 text-destructive" />} placeholder="搜索出错" />
      <Input success prefix={<Mail className="h-4 w-4 text-success" />} placeholder="邮箱验证成功" />
      <Input loading prefix={<Lock className="h-5 w-5 text-muted-foreground" />} suffix={<Loader2 className="h-5 w-5 animate-spin" />} placeholder="验证密码中..." />
    </div>
  ),
};

// 主题示例
export const Themed: Story = {
  decorators: [
    (Story) => (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background p-4">
          <h3 className="mb-4">浅色主题</h3>
          <Story />
        </div>
        <div className="dark bg-background p-4">
          <h3 className="mb-4 text-foreground">深色主题</h3>
          <Story />
        </div>
      </div>
    ),
  ],
  render: () => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input placeholder="默认输入框" />
      <Input error placeholder="错误输入框" />
      <Input prefix={<Search className="h-4 w-4 text-muted-foreground" />} placeholder="搜索..." />
    </div>
  ),
};

// 新增响应式示例
export const Responsive: Story = {
  render: () => (
    <div className="mx-auto max-w-[400px] space-y-4">
      <Input placeholder="响应式输入框" className="w-full" />
      <div className="gap-4 md:flex">
        <Input prefix={<Search />} className="md:w-3/4" />
        <Input suffix={<Mail />} className="mt-2 md:mt-0 md:w-1/4" />
      </div>
    </div>
  ),
};

// 新增表单集成示例
export const FormIntegration: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState('');
    return (
      <form className="w-64 space-y-4">
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="表单输入" />
        <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-white">
          提交
        </button>
      </form>
    );
  },
};

// 新增暗色主题示例
export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
  },
  render: () => (
    <div className="flex w-[300px] flex-col gap-4 rounded bg-gray-800 p-4">
      <Input placeholder="暗色主题输入框" />
      <Input error placeholder="错误状态" />
      <Input success placeholder="成功状态" />
    </div>
  ),
};
