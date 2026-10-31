import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { MessageSquareText, FolderIcon } from 'lucide-react';

const meta: Meta<typeof Tabs> = {
  title: 'EASAI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

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
            <label htmlFor="email" className="text-sm font-medium">
              邮箱
            </label>
            <input id="email" type="email" className="w-full rounded-md border px-3 py-2" placeholder="请输入邮箱" />
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              用户名
            </label>
            <input id="username" type="text" className="w-full rounded-md border px-3 py-2" placeholder="请输入用户名" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <label htmlFor="current" className="text-sm font-medium">
              当前密码
            </label>
            <input id="current" type="password" className="w-full rounded-md border px-3 py-2" placeholder="请输入当前密码" />
          </div>
          <div className="space-y-2">
            <label htmlFor="new" className="text-sm font-medium">
              新密码
            </label>
            <input id="new" type="password" className="w-full rounded-md border px-3 py-2" placeholder="请输入新密码" />
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

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="profile" orientation="vertical" className="h-[200px]">
      <TabsList className="flex flex-col h-full w-[150px]">
        <TabsTrigger value="profile">个人资料</TabsTrigger>
        <TabsTrigger value="settings">系统设置</TabsTrigger>
        <TabsTrigger value="security">安全中心</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="p-4">
        个人资料内容区域
      </TabsContent>
      <TabsContent value="settings" className="p-4">
        系统设置内容区域
      </TabsContent>
      <TabsContent value="security" className="p-4">
        安全中心内容区域
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

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="chat">
      <TabsList>
        <TabsTrigger value="chat">
          <MessageSquareText className="mr-2 h-4 w-4" />
          聊天
        </TabsTrigger>
        <TabsTrigger value="files">
          <FolderIcon className="mr-2 h-4 w-4" />
          文件
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};
