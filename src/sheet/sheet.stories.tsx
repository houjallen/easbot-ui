import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Input } from '../input/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from './sheet';

const meta: Meta<typeof Sheet> = {
  title: 'EASAI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">打开设置</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>设置</SheetTitle>
          <SheetDescription>在这里管理您的账户设置和偏好。</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-sm font-medium text-right">
              名称
            </label>
            <div className="col-span-3">
              <Input id="name" placeholder="请输入名称" />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-sm font-medium text-right">
              用户名
            </label>
            <div className="col-span-3">
              <Input id="username" placeholder="请输入用户名" />
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">保存更改</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Side: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">从右侧打开</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>右侧抽屉</SheetTitle>
            <SheetDescription>这是一个从右侧打开的抽屉示例。</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">从左侧打开</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>左侧抽屉</SheetTitle>
            <SheetDescription>这是一个从左侧打开的抽屉示例。</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

export const FullScreen: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">打开全屏抽屉</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[95vh]">
        <SheetHeader>
          <SheetTitle>全屏模式</SheetTitle>
          <SheetDescription>支持自定义高度和内容布局</SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-auto p-4">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="mb-4">
              内容项 {i + 1}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const FormIntegration: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">打开表单</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>用户信息</SheetTitle>
          <SheetDescription>请填写您的个人信息</SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-sm font-medium text-right">
              名称
            </label>
            <div className="col-span-3">
              <Input id="name" placeholder="请输入名称" />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-sm font-medium text-right">
              用户名
            </label>
            <div className="col-span-3">
              <Input id="username" placeholder="请输入用户名" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">保存信息</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  ),
};
