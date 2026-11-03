// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { FolderIcon, MessageSquareText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

const meta = {
  title: 'EASAI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">账户</TabsTrigger>
        <TabsTrigger value="password">密码</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <label htmlFor="email" className="font-medium text-sm">
              邮箱
            </label>
            <input id="email" type="email" className="w-full rounded-md border px-3 py-2" placeholder="请输入邮箱" />
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className="font-medium text-sm">
              用户名
            </label>
            <input id="username" type="text" className="w-full rounded-md border px-3 py-2" placeholder="请输入用户名" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <label htmlFor="password" className="font-medium text-sm">
              当前密码
            </label>
            <input id="password" type="password" className="w-full rounded-md border px-3 py-2" placeholder="请输入当前密码" />
          </div>
          <div className="space-y-2">
            <label htmlFor="newPassword" className="font-medium text-sm">
              新密码
            </label>
            <input id="newPassword" type="password" className="w-full rounded-md border px-3 py-2" placeholder="请输入新密码" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="font-medium text-sm">
              确认新密码
            </label>
            <input id="confirmPassword" type="password" className="w-full rounded-md border px-3 py-2" placeholder="请确认新密码" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="messages" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="messages">
          <MessageSquareText className="mr-2 h-4 w-4" />
          消息
        </TabsTrigger>
        <TabsTrigger value="files">
          <FolderIcon className="mr-2 h-4 w-4" />
          文件
        </TabsTrigger>
      </TabsList>
      <TabsContent value="messages">
        <div className="space-y-4 p-4">
          <p className="text-sm">消息内容区域</p>
        </div>
      </TabsContent>
      <TabsContent value="files">
        <div className="space-y-4 p-4">
          <p className="text-sm">文件内容区域</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="flex flex-col gap-2">
        <TabsTrigger value="account">账户</TabsTrigger>
        <TabsTrigger value="password">密码</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <label htmlFor="email" className="font-medium text-sm">
              邮箱
            </label>
            <input id="email" type="email" className="w-full rounded-md border px-3 py-2" placeholder="请输入邮箱" />
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className="font-medium text-sm">
              用户名
            </label>
            <input id="username" type="text" className="w-full rounded-md border px-3 py-2" placeholder="请输入用户名" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <label htmlFor="password" className="font-medium text-sm">
              当前密码
            </label>
            <input id="password" type="password" className="w-full rounded-md border px-3 py-2" placeholder="请输入当前密码" />
          </div>
          <div className="space-y-2">
            <label htmlFor="newPassword" className="font-medium text-sm">
              新密码
            </label>
            <input id="newPassword" type="password" className="w-full rounded-md border px-3 py-2" placeholder="请输入新密码" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const Simple: Story = {
  render: () => (
    <Tabs defaultValue="music" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="music">音乐</TabsTrigger>
        <TabsTrigger value="videos">视频</TabsTrigger>
        <TabsTrigger value="photos">照片</TabsTrigger>
      </TabsList>
      <TabsContent value="music" className="p-4">
        这里是音乐内容区域。
      </TabsContent>
      <TabsContent value="videos" className="p-4">
        这里是视频内容区域。
      </TabsContent>
      <TabsContent value="photos" className="p-4">
        这里是照片内容区域。
      </TabsContent>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">可用标签</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          禁用标签
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};
