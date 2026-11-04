/**
 * ThemeToggle 组件 Storybook 示例
 *
 * @description
 * 📌 **主题由 Storybook 工具栏控制**（右上角「light theme / dark theme」）——
 *    `.storybook/preview.tsx` 已挂载**全局** `ThemeProvider`，
 *    本示例**不嵌套** Provider，避免两个 Provider 争抢 `<html data-theme>`。
 *
 * 📌 **工具栏切换 → 示例同步** —— 全局 Provider 是**受控模式**（`theme={globals.theme}`），
 *    `ThemeToggle` 读 `useTheme().resolvedTheme` 即可拿到工具栏选中的主题，
 *    无需在示例里做任何事。
 *
 * 📌 **示例内点击 → 工具栏同步** —— 受控模式下 `setTheme` 只触发 `onThemeChange`，
 *    而全局装饰器**没有**传 `onThemeChange` → 示例内点击主题**不会变**。
 *    这是**全局装饰器**的缺口，不应由每个 story 各自兜底。
 *
 *    消费方应用中不存在该问题 —— 应用自己挂**非受控**的 `ThemeProvider`，
 *    `setTheme` 会被 Provider 正常处理（切换 DOM 属性 + 写 localStorage）。
 */

import type { Meta, StoryObj } from '@storybook/react';

import { ThemeToggle } from '../theme-toggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'EASAI/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '主题切换按钮 —— 在浅色与深色两种主题间一键切换。图标表示点击后将进入的主题（浅色时显示月亮，深色时显示太阳）。' +
          '切换结果由 ThemeProvider 写入 localStorage 持久化。' +
          '主题由 Storybook 工具栏控制（右上角「light theme / dark theme」），本组件不嵌套 ThemeProvider 以免与全局 Provider 争抢 data-theme。',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: [24, 32, 40, 48], description: '按钮尺寸（像素）' },
    shape: { control: 'select', options: ['circle', 'square'], description: '按钮形状' },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

/**
 * 默认形态 —— 浅色主题下显示月亮图标（点击进入深色）。
 */
export const Default: Story = {
  render: (args) => <ThemeToggle {...args} />,
};

/**
 * 深色主题 —— 显示太阳图标（点击回到浅色）。
 *
 * 📌 需在 Storybook 工具栏切换到 **dark theme** 才能看到该效果。
 */
export const Dark: Story = {
  render: (args) => <ThemeToggle {...args} />,
  parameters: {
    docs: {
      description: {
        story: '深色主题下显示太阳图标（点击回到浅色）。请在 Storybook 工具栏切换到 dark theme 查看。',
      },
    },
  },
};

/**
 * 尺寸变体。
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <ThemeToggle {...args} size={24} />
      <ThemeToggle {...args} size={32} />
      <ThemeToggle {...args} size={40} />
      <ThemeToggle {...args} size={48} />
    </div>
  ),
};

/**
 * 形状变体 —— 圆形与方形。
 */
export const Shapes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <ThemeToggle {...args} shape="circle" />
      <ThemeToggle {...args} shape="square" />
    </div>
  ),
};
