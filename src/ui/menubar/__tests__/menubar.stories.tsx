// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '../menubar';

const meta = {
  title: 'EASAI/Menubar',
  component: Menubar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '基础用法',
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

// 分组、分隔符、快捷键、禁用、只读、子菜单等高级用法
export const Advanced: Story = {
  name: '高级用法（分组/子菜单/快捷键/禁用/只读）',
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>编辑</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            撤销 <MenubarShortcut>Ctrl+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            重做 <MenubarShortcut>Ctrl+Y</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            剪切 <MenubarShortcut>Ctrl+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            复制 <MenubarShortcut>Ctrl+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            粘贴 <MenubarShortcut>Ctrl+V</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>只读项</MenubarItem>
          <MenubarSeparator />
          <MenubarMenu>
            <MenubarTrigger>更多</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>查找</MenubarItem>
              <MenubarItem>替换</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>视图</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>放大</MenubarItem>
          <MenubarItem>缩小</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>全屏</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>分组/复选/单选</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>普通项</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>复选项1</MenubarItem>
          <MenubarItem>复选项2</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>单选项A</MenubarItem>
          <MenubarItem>单选项B</MenubarItem>
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
    <Menubar className="border-gray-700 bg-gray-800">
      <MenubarMenu>
        <MenubarTrigger className="text-gray-100">文件</MenubarTrigger>
        <MenubarContent className="border-gray-700 bg-gray-800">
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
