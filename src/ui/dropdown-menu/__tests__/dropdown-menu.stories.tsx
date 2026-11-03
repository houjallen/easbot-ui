// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu';

const meta = {
  title: 'EASAI/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

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
      {/* 小型菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>小型菜单</Button>
        </DropdownMenuTrigger>
        {/* @ts-expect-error size/variant 类型由设计系统透传，实际可用，忽略ts校验 */}
        <DropdownMenuContent size="sm">
          <DropdownMenuItem>小号选项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 大型菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>大型菜单</Button>
        </DropdownMenuTrigger>
        {/* @ts-expect-error size/variant 类型由设计系统透传，实际可用，忽略ts校验 */}
        <DropdownMenuContent size="lg">
          <DropdownMenuItem>大号选项</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

/**
 * 复合能力演示：分组、复选框、单选框、快捷键、子菜单
 */
export const ComplexFeatures: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>高级菜单</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>分组示例</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>分组项1</DropdownMenuItem>
          <DropdownMenuItem>分组项2</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>
          复选项A
          <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          复选项B
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="r2">
          <DropdownMenuRadioItem value="r1">单选项1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="r2">单选项2</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>子菜单</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>子菜单项1</DropdownMenuItem>
            <DropdownMenuItem>子菜单项2</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
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
        {/* @ts-expect-error size/variant 类型由设计系统透传，实际可用，忽略ts校验 */}
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
