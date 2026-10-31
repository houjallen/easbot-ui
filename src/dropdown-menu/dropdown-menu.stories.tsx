import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './dropdown-menu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'EASAI/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Basic: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">打开菜单</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>账户设置</DropdownMenuLabel>
        <DropdownMenuItem>个人资料</DropdownMenuItem>
        <DropdownMenuItem>安全设置</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>退出登录</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>小型菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent size="sm">
          <DropdownMenuItem>小号选项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>大型菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent size="lg">
          <DropdownMenuItem>大号选项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>禁用菜单</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled>禁用项</DropdownMenuItem>
        <DropdownMenuItem>正常项</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ThemeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>默认主题</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>默认样式</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>暗色主题</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent variant="dark">
          <DropdownMenuItem>暗色样式</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const MobileAdaptation: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>移动端菜单</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>适配触摸</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
