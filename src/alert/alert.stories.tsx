/**
 * Alert 组件的 Storybook 示例文件
 *
 * 展示了Alert组件的各种使用场景和样式变体
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'EASAI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
          Alert 组件用于展示重要的提示信息，支持多种状态和样式变体。
          
          ## 特性
          - 支持多种样式变体：默认、危险、成功、警告、信息
          - 支持自定义图标
          - 支持可关闭功能
          - 支持标题和描述文本
          - 支持无障碍访问
        `,
      },
      componentDescription: ['### 组件特性', '- 多状态样式支持（成功/警告/错误/信息）', '- 可配置关闭功能', '- 自适应图标系统', '- 完善的类型定义', '- 符合WAI-ARIA标准'].join('\n'),
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'success', 'warning', 'info'],
      description: '提示框视觉变体',
      table: {
        category: '样式',
        defaultValue: { summary: 'default' },
      },
    },
    closable: {
      control: 'boolean',
      description: '是否显示关闭按钮',
      table: {
        category: '交互',
        defaultValue: { summary: 'false' },
      },
    },
    icon: {
      control: 'boolean',
      description: '是否显示图标',
    },
  },
};

type Story = StoryObj<typeof Alert>;

/**
 * 默认提示框示例
 */
export const Default: Story = {
  args: {
    children: (
      <>
        <AlertTitle>默认提示</AlertTitle>
        <AlertDescription>这是一个默认样式的提示框，用于展示一般信息。</AlertDescription>
      </>
    ),
  },
};

/**
 * 提示框变体示例
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Alert>
        <AlertTitle>默认提示</AlertTitle>
        <AlertDescription>这是默认样式的提示框。</AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTitle>错误提示</AlertTitle>
        <AlertDescription>这是错误样式的提示框。</AlertDescription>
      </Alert>

      <Alert variant="success">
        <AlertTitle>成功提示</AlertTitle>
        <AlertDescription>这是成功样式的提示框。</AlertDescription>
      </Alert>

      <Alert variant="warning">
        <AlertTitle>警告提示</AlertTitle>
        <AlertDescription>这是警告样式的提示框。</AlertDescription>
      </Alert>

      <Alert variant="info">
        <AlertTitle>信息提示</AlertTitle>
        <AlertDescription>这是信息样式的提示框。</AlertDescription>
      </Alert>
    </div>
  ),
};

/**
 * 自定义图标示例
 */
export const CustomIcon: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Alert icon={<Info className="h-4 w-4" />}>
        <AlertTitle>自定义图标</AlertTitle>
        <AlertDescription>这是使用自定义图标的提示框。</AlertDescription>
      </Alert>

      <Alert variant="destructive" icon={<AlertTriangle className="h-4 w-4" />}>
        <AlertTitle>自定义警告图标</AlertTitle>
        <AlertDescription>这是使用自定义警告图标的提示框。</AlertDescription>
      </Alert>
    </div>
  ),
};

/**
 * 可关闭提示框示例
 */
export const Closable: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Alert closable onClose={() => console.log('关闭默认提示')}>
        <AlertTitle>可关闭提示</AlertTitle>
        <AlertDescription>这是一个可以关闭的提示框。</AlertDescription>
      </Alert>

      <Alert variant="info" closable onClose={() => console.log('关闭信息提示')}>
        <AlertTitle>可关闭信息</AlertTitle>
        <AlertDescription>这是一个可以关闭的信息提示框。</AlertDescription>
      </Alert>
    </div>
  ),
};

/**
 * 组合示例
 */
export const Combinations: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Alert variant="success" icon={<CheckCircle className="h-4 w-4" />} closable>
        <AlertTitle>保存成功</AlertTitle>
        <AlertDescription>您的更改已成功保存。</AlertDescription>
      </Alert>

      <Alert variant="destructive" icon={<XCircle className="h-4 w-4" />} closable>
        <AlertTitle>删除失败</AlertTitle>
        <AlertDescription>
          <p>删除操作失败，请检查以下问题：</p>
          <ul className="mt-2 list-disc pl-4">
            <li>确保您有足够的权限</li>
            <li>检查网络连接是否正常</li>
            <li>如果问题持续，请联系管理员</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  ),
};

/**
 * 新增图标控制示例
 */
export const IconControl: Story = {
  args: {
    showIcon: false,
    children: (
      <>
        <AlertTitle>隐藏图标</AlertTitle>
        <AlertDescription>通过showIcon属性控制默认图标显示</AlertDescription>
      </>
    ),
  },
};

/**
 * 新增可访问性示例
 */
export const Accessibility: Story = {
  render: () => (
    <Alert closable closeAriaLabel="关闭重要通知">
      <AlertTitle>无障碍示例</AlertTitle>
      <AlertDescription>包含自定义ARIA标签的关闭按钮</AlertDescription>
    </Alert>
  ),
};

export default meta;
