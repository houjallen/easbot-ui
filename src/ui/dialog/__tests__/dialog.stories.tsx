// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../dialog';

const meta = {
  title: 'EASAI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">打开对话框</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        {/* 标题与描述区 */}
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
          <DialogDescription>请完善您的个人信息，点击保存后立即生效。</DialogDescription>
        </DialogHeader>
        {/* 表单内容区 */}
        <form className="space-y-4 py-2">
          <div className="flex items-center gap-4">
            <label htmlFor="name" className="w-16 text-right text-muted-foreground text-sm">
              姓名
            </label>
            <input
              id="name"
              className="h-10 flex-1 rounded-md border bg-background px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="请输入姓名"
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="email" className="w-16 text-right text-muted-foreground text-sm">
              邮箱
            </label>
            <input
              id="email"
              className="h-10 flex-1 rounded-md border bg-background px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="请输入邮箱"
              type="email"
            />
          </div>
        </form>
        {/* 操作按钮区 */}
        <DialogFooter>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* 小尺寸对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>小尺寸</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle>小尺寸对话框</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* 大尺寸对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>大尺寸</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>大尺寸对话框</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* 带最大化功能的对话框，直接用 DialogContent maximizable 属性 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>可最大化</Button>
        </DialogTrigger>
        <DialogContent maximizable>
          <DialogHeader>
            <DialogTitle>支持最大化的对话框</DialogTitle>
            <DialogDescription>点击右上角最大化按钮可切换全屏/窗口模式。</DialogDescription>
          </DialogHeader>
          <div className="py-4">这里是对话框内容区，最大化后将铺满屏幕。</div>
          <DialogFooter>
            <Button type="submit">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const ThemeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>默认主题</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>默认主题</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button>暗色主题</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>暗色主题</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const Maximizable: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>可最大化对话框</Button>
      </DialogTrigger>
      <DialogContent maximizable>
        <DialogHeader>
          <DialogTitle>可最大化的对话框</DialogTitle>
          <DialogDescription>点击右上角的最大化按钮可以切换对话框大小。此对话框支持最大化和还原操作。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
