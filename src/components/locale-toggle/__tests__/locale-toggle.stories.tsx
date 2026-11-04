/**
 * LocaleToggle 组件 Storybook 示例
 *
 * @description
 * 📌 **语言由 Storybook 工具栏控制**（右上角「简体中文 / English」）——
 *    `.storybook/preview.tsx` 已挂载**全局** `LocaleProvider`（受控，
 *    `locale={globals.easLocale}` + `setLocale` 桥接 globals），
 *    本示例**不嵌套** `LocaleProvider`，避免内层屏蔽全局注入
 *    （受控模式 `locale="zh-CN"` 会让工具栏切换失效）。
 *
 * 📌 **主题由全局 Provider 控制** —— `.storybook/preview.tsx` 的全局 `ThemeProvider`
 *    是受控模式（`theme={globals.theme}`），主题由工具栏决定。
 */

import type { Meta, StoryObj } from '@storybook/react';

import { ThemeToggle } from '../../theme-toggle';
import { LocaleToggle } from '../locale-toggle';

const meta: Meta<typeof LocaleToggle> = {
  title: 'EASAI/LocaleToggle',
  component: LocaleToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '语言切换按钮 —— 点击弹出语言下拉菜单，在受支持的语言间切换。语言项始终以母语显示（简体中文 / English），' +
          '当前语言用圆点标记。切换结果由 LocaleProvider 写入 localStorage 持久化。' +
          '语言本身由 Storybook 工具栏控制（右上角「简体中文 / English」），本组件不嵌套 LocaleProvider 以免屏蔽全局 Provider。',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: [24, 32, 40, 48], description: '按钮尺寸（像素）' },
    align: { control: 'select', options: ['start', 'center', 'end'], description: '下拉内容对齐方式' },
  },
};

export default meta;
type Story = StoryObj<typeof LocaleToggle>;

/**
 * 默认形态 —— 语言由 Storybook 工具栏控制。
 */
export const Default: Story = {
  render: (args) => <LocaleToggle {...args} />,
};

/**
 * 英文界面。
 *
 * 📌 需在 Storybook 工具栏切换到 **English** 才能看到该效果。
 */
export const English: Story = {
  render: (args) => <LocaleToggle {...args} />,
  parameters: {
    docs: {
      description: {
        story: '英文界面 —— 请在 Storybook 工具栏切换到 English 查看。',
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
      <LocaleToggle {...args} size={24} />
      <LocaleToggle {...args} size={32} />
      <LocaleToggle {...args} size={40} />
      <LocaleToggle {...args} size={48} />
    </div>
  ),
};

/**
 * 与主题切换按钮组合使用。
 */
export const Combination: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <LocaleToggle {...args} />
      <ThemeToggle />
    </div>
  ),
};
