import type { Meta, StoryObj } from '@storybook/react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from './menubar';

const meta: Meta<typeof Menubar> = {
  title: 'EASAI/Menubar',
  component: Menubar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>文件</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            新建 <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            打开 <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            保存 <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>编辑</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            撤销 <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            重做 <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            剪切 <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            复制 <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            粘贴 <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

// 新增暗色主题示例
export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
  },
  render: () => (
    <Menubar className="bg-gray-800 border-gray-700">
      <MenubarMenu>
        <MenubarTrigger className="text-gray-100">文件</MenubarTrigger>
        <MenubarContent className="bg-gray-800 border-gray-700">
          <MenubarItem className="text-gray-100 hover:bg-gray-700">
            新建 <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

// 新增禁用状态示例
export const DisabledItems: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>设置</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>禁用项</MenubarItem>
          <MenubarItem>启用项</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
