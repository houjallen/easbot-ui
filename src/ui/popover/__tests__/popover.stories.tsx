// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

const meta = {
  title: 'EASAI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '基础用法',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">点击查看</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">尺寸</h4>
            <p className="text-muted-foreground text-sm">设置您的尺寸偏好。</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="width" className="text-sm">
                宽度
              </label>
              <Input id="width" defaultValue="100%" className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="height" className="text-sm">
                高度
              </label>
              <Input id="height" defaultValue="25px" className="col-span-2" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// 复杂内容、嵌套表单、不同位置、交互等高级用法
export const Advanced: Story = {
  name: '高级用法（表单/复杂内容/交互/多位置）',
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">表单内容</Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <form className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">邮箱</label>
              <Input placeholder="请输入邮箱" />
            </div>
            <div>
              <label className="mb-1 block text-sm">密码</label>
              <Input type="password" placeholder="请输入密码" />
            </div>
            <Button type="submit" className="mt-2 w-full">
              登录
            </Button>
          </form>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">顶部弹出</Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-60">
          顶部内容
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">右侧弹出</Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-60">
          右侧内容
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <p className="mb-2 text-muted-foreground text-sm">禁用状态的浮层触发器无法点击，下面是示例展示：</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled>
              禁用浮层
            </Button>
          </PopoverTrigger>
          <PopoverContent>无法触发的浮层内容</PopoverContent>
        </Popover>
      </div>

      <div>
        <p className="mb-2 text-muted-foreground text-sm">正常状态的浮层对比：</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">可点击浮层</Button>
          </PopoverTrigger>
          <PopoverContent>正常状态的浮层内容</PopoverContent>
        </Popover>
      </div>
    </div>
  ),
};

export const PositionDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">顶部浮层</Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-48">
          顶部显示内容
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">右侧浮层</Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-48">
          右侧显示内容
        </PopoverContent>
      </Popover>
    </div>
  ),
};
