import type { Meta, StoryObj } from '@storybook/react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './navigation-menu';

const meta: Meta<typeof NavigationMenu> = {
  title: 'EASAI/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>开始</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-[400px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
                    <div className="mb-2 mt-4 text-lg font-medium">快速开始</div>
                    <p className="text-sm leading-tight text-muted-foreground">了解如何快速开始使用我们的产品。</p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    href="/docs"
                  >
                    <div className="text-sm font-medium leading-none">文档</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">详细的使用文档和API参考。</p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>组件</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <a
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    href="/components/button"
                  >
                    <div className="text-sm font-medium leading-none">按钮</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">触发动作的按钮组件。</p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    href="/components/dialog"
                  >
                    <div className="text-sm font-medium leading-none">对话框</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">模态对话框组件。</p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// 新增暗色主题示例
export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
  },
  render: () => (
    <NavigationMenu className="bg-gray-800">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-100">文档</NavigationMenuTrigger>
          <NavigationMenuContent className="bg-gray-800 border-gray-700">
            <ul className="grid gap-3 p-4 w-[400px]">
              <li>
                <NavigationMenuLink asChild>
                  <a className="text-gray-100 hover:bg-gray-700 p-3 rounded" href="/docs">
                    使用指南
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// 新增移动端适配示例
export const MobileAdaptive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList className="flex-col items-start">
        <NavigationMenuItem>
          <NavigationMenuTrigger>移动菜单</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-[200px] p-2">
              <li>
                <NavigationMenuLink asChild>
                  <a href="/mobile">移动端功能</a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
