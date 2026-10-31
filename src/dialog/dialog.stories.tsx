import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'EASAI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">打开对话框</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
          <DialogDescription>在此处修改您的个人资料信息。点击保存后生效。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              姓名
            </label>
            <input
              id="name"
              className="col-span-3 h-10 rounded-[var(--dialog-input-radius)] border-[var(--dialog-input-border)] bg-[var(--dialog-input-bg)] text-[var(--dialog-input-text)] px-3 focus:border-[var(--dialog-input-focus-border)] focus:bg-[var(--dialog-input-focus-bg)] focus:text-[var(--dialog-input-focus-text)] focus:outline-none focus:ring-1 focus:ring-[var(--dialog-input-focus-border)]"
              placeholder="请输入姓名"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">
              用户名
            </label>
            <input
              id="username"
              className="col-span-3 h-10 rounded-[var(--dialog-input-radius)] border-[var(--dialog-input-border)] bg-[var(--dialog-input-bg)] text-[var(--dialog-input-text)] px-3 focus:border-[var(--dialog-input-focus-border)] focus:bg-[var(--dialog-input-focus-bg)] focus:text-[var(--dialog-input-focus-text)] focus:outline-none focus:ring-1 focus:ring-[var(--dialog-input-focus-border)]"
              placeholder="请输入用户名"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">保存修改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>小尺寸</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>小尺寸对话框</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button>大尺寸</Button>
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>大尺寸对话框</DialogTitle>
          </DialogHeader>
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
        <DialogContent variant="dark">
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
          <DialogDescription>点击右上角的最大化按钮可以切换对话框大小。 此对话框支持最大化和还原操作。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="content" className="text-right">
              示例内容
            </label>
            <textarea
              id="content"
              className="col-span-3 h-32 rounded-[var(--dialog-input-radius)] border-[var(--dialog-input-border)] bg-[var(--dialog-input-bg)] text-[var(--dialog-input-text)] p-3 focus:border-[var(--dialog-input-focus-border)] focus:bg-[var(--dialog-input-focus-bg)] focus:text-[var(--dialog-input-focus-text)] focus:outline-none focus:ring-1 focus:ring-[var(--dialog-input-focus-border)]"
              placeholder="这里是一些示例内容..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button">
            取消
          </Button>
          <Button type="submit">确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
