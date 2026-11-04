/**
 * Button 组件的 Storybook 示例文件
 *
 * 展示了按钮组件的各种使用场景和样式变体，包括：
 * 1. 基础样式
 * 2. 尺寸变化
 * 3. 状态反馈
 * 4. 图标配置
 * 5. 移动适配
 */

// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronRight, Heart, Mail, Menu, Share2 } from 'lucide-react';
import * as React from 'react';
import { Icon } from '../../icon';
import { Button } from '../button';
import { CloseButton } from '../close-button';

// Storybook 配置
const meta = {
  title: 'EASAI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: 'light', color: '#ffffff' },
        { name: 'dark', class: 'dark', color: '#1a1a1a' },
      ],
    },
    docs: {
      description: {
        component: `
          按钮组件用于触发一个操作或事件，如提交表单、打开对话框、取消操作或执行删除操作。

          ## 特性
          - 支持多种样式变体：默认、危险、边框、次要、幽灵、链接等
          - 支持三种尺寸：小、中、大
          - 支持加载状态
          - 支持禁用状态
          - 支持图标按钮
          - 支持键盘操作
          - 支持无障碍访问
          - 支持移动端适配
          - 支持触摸反馈
        `,
      },
    },
  },
  tags: ['autodocs'],
  // 参数控制配置
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning'],
      description: '按钮变体样式，用于不同场景和用途',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'mobile'],
      description: '按钮尺寸，适应不同的空间需求',
    },
    loading: {
      control: 'boolean',
      description: '是否显示加载状态，用于异步操作反馈',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用按钮，用于控制交互状态',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 默认按钮示例
 * 展示最基础的按钮样式和用法
 */
export const Default: Story = {
  args: {
    children: '默认按钮',
    variant: 'default',
  },
};

/**
 * 按钮变体示例
 * 展示所有可用的按钮样式变体
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">默认按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="destructive">删除按钮</Button>
      <Button variant="outline">边框按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="link">链接按钮</Button>
      <Button variant="success">成功按钮</Button>
      <Button variant="warning">警告按钮</Button>
    </div>
  ),
};

/**
 * 按钮尺寸示例
 * 展示不同尺寸的按钮
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">小型按钮</Button>
      <Button size="default">默认按钮</Button>
      <Button size="lg">大型按钮</Button>
      <Button size="icon" variant="outline" leftIcon={<Icon name="eas-language" />} />
    </div>
  ),
};

/**
 * 加载状态示例
 * 展示按钮的加载和禁用状态
 */
export const Loading: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button loading>加载中</Button>
      <Button variant="outline" loading>
        加载中
      </Button>
      <Button disabled>禁用按钮</Button>
    </div>
  ),
};

/**
 * 图标按钮示例
 * 展示带有图标的按钮样式
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button leftIcon={<Mail className="h-4 w-4" />}>发送邮件</Button>
      <Button rightIcon={<ChevronRight className="h-4 w-4" />}>下一步</Button>
      <Button leftIcon={<Mail className="h-4 w-4" />} rightIcon={<ChevronRight className="h-4 w-4" />}>
        发送并继续
      </Button>
    </div>
  ),
};

/**
 * 组合示例
 * 展示按钮的各种组合用法
 */
export const Combinations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* 不同尺寸的加载状态 */}
      <div className="flex gap-4">
        <Button variant="default" loading size="sm">
          小型加载
        </Button>
        <Button variant="default" loading>
          默认加载
        </Button>
        <Button variant="default" loading size="lg">
          大型加载
        </Button>
      </div>
      {/* 不同状态的组合 */}
      <div className="flex gap-4">
        <Button variant="outline" leftIcon={<Mail className="h-4 w-4" />} disabled>
          禁用状态
        </Button>
        <Button variant="success" loading rightIcon={<ChevronRight className="h-4 w-4" />}>
          处理中
        </Button>
      </div>
    </div>
  ),
};

/**
 * 移动端示例
 * 展示移动端优化的按钮样式和交互
 */
export const Mobile: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button size="mobile">
          <Menu className="mr-2 h-5 w-5" />
          菜单按钮
        </Button>
        <Button size="mobile" variant="secondary">
          <Share2 className="mr-2 h-5 w-5" />
          分享
        </Button>
      </div>
      <div className="flex gap-4">
        <Button size="mobile" variant="destructive">
          删除
        </Button>
        <Button size="mobile" variant="success">
          确认
        </Button>
      </div>
      <div className="flex gap-4">
        <Button size="mobile" variant="outline">
          <Heart className="mr-2 h-5 w-5" />
          收藏
        </Button>
        <Button size="mobile" variant="ghost">
          取消
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '移动端按钮经过优化，包括更大的点击区域、触摸反馈和合适的图标尺寸。',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * 触摸反馈示例
 * 展示不同颜色的波纹效果
 */
export const TouchFeedback: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button size="mobile">默认波纹</Button>
      <Button size="mobile" variant="destructive">
        红色波纹
      </Button>
      <Button size="mobile" variant="success">
        绿色波纹
      </Button>
      <Button size="mobile" variant="warning">
        黄色波纹
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '通过 rippleColor 属性可以自定义波纹效果的颜色，为不同类型的按钮提供合适的视觉反馈。',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * 手势交互示例
 * 展示移动端手势交互功能
 */
export const GestureInteractions: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* 长按示例 */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">长按交互</h3>
        <Button size="mobile">长按我试试</Button>
      </div>

      {/* 滑动示例 */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">滑动交互</h3>
        <Button size="mobile" variant="outline">
          滑动我试试
        </Button>
      </div>

      {/* 压力感应示例 */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">压力感应</h3>
        <Button size="mobile" variant="secondary">
          用力按压试试
        </Button>
      </div>

      {/* 组合示例 */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">组合交互</h3>
        <Button size="mobile" variant="success">
          全部功能体验
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
移动端手势交互功能包括：
- 长按触发：支持自定义触发时间和回调
- 滑动手势：支持上下左右四个方向的滑动检测
- 压力感应：在支持的设备上提供压力反馈
- 触觉反馈：在支持的设备上提供震动反馈
        `,
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * 触觉反馈示例
 * 展示不同的触觉反馈模式
 */
export const HapticFeedback: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button size="mobile" variant="default" onClick={() => navigator.vibrate?.(10)}>
        轻触反馈
      </Button>
      <Button size="mobile" variant="destructive">
        长按反馈
      </Button>
      <Button size="mobile" variant="success" onClick={() => navigator.vibrate?.([10, 50, 10])}>
        自定义反馈
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '在支持的设备上，按钮可以提供不同模式的触觉反馈，增强用户的触摸体验。',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * CloseButton 变体示例
 * 展示所有可用的 CloseButton 样式变体
 */
export const CloseButtonVariants: Story = {
  args: {
    variant: 'default',
  },

  render: () => (
    <div className="flex flex-wrap gap-4">
      <CloseButton variant="default" />
      <CloseButton variant="secondary" />
      <CloseButton variant="destructive" />
      <CloseButton variant="outline" />
      <CloseButton variant="ghost" />
      <CloseButton variant="link" />
      <CloseButton variant="success" />
      <CloseButton variant="warning" />
      <CloseButton variant="info" />
    </div>
  ),

  parameters: {
    docs: {
      description: {
        story: '展示 CloseButton 的所有变体样式，与 Toast 的关闭按钮样式保持一致。',
      },
    },
  },
};

/**
 * 新增压力感应示例
 */
export const PressureSensitive: Story = {
  render: () => <Button style={{ transition: 'transform 0.2s' }}>用力按压试试</Button>,
  parameters: {
    docs: {
      description: {
        story: '在支持压力感应的设备上，按钮会根据按压力度产生形变效果',
      },
    },
  },
};

/**
 * 新增手势操作示例
 */
export const GestureDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button>四向滑动</Button>
      <Button>长按操作</Button>
    </div>
  ),
};

/**
 * 新增交互式示例
 */
export const PressureDemo: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [pressure, setPressure] = React.useState(0);
    return (
      <div className="flex flex-col gap-4">
        <Button onTouchStart={(e) => setPressure((e.touches[0] as any).force || 0)} style={{ transform: `scale(${1 - pressure * 0.1})` }}>
          压力感应按钮 ({pressure.toFixed(1)})
        </Button>
        <p className="text-muted-foreground text-sm">在支持压力感应的设备上用力按压查看效果</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '展示压力感应功能，需要设备支持3D Touch或类似技术',
      },
    },
  },
};
