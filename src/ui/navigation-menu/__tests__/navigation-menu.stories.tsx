// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '../navigation-menu';

const meta = {
  title: 'EASAI/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '基础用法',
  render: () => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger value="products">产品</NavigationMenuTrigger>
          <NavigationMenuContent className="h-auto w-auto overflow-auto">
            <ul className="grid max-h-[240px] w-[320px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <a className="block rounded-md p-3 transition-colors hover:bg-accent" href="/overview">
                    <div className="font-medium">产品概览</div>
                    <div className="text-muted-foreground text-xs">了解我们产品的主要功能和优势。</div>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a className="block rounded-md p-3 transition-colors hover:bg-accent" href="/pricing">
                    <div className="font-medium">价格方案</div>
                    <div className="text-muted-foreground text-xs">查看不同的订阅和付费选项。</div>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger value="solutions">解决方案</NavigationMenuTrigger>
          <NavigationMenuContent className="h-auto w-auto overflow-auto">
            <ul className="grid max-h-[240px] w-[320px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <a className="block rounded-md p-3 transition-colors hover:bg-accent" href="/solutions/saas">
                    <div className="font-medium">SaaS 企业</div>
                    <div className="text-muted-foreground text-xs">为SaaS业务量身定制的解决方案。</div>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a className="block rounded-md p-3 transition-colors hover:bg-accent" href="/solutions/retail">
                    <div className="font-medium">零售行业</div>
                    <div className="text-muted-foreground text-xs">提升零售数字化体验。</div>
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

// 分组、嵌套、禁用、只读、图标等高级用法
export const Advanced: Story = {
  name: '高级用法（分组/嵌套/禁用/只读/图标）',
  render: () => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger value="docs">文档</NavigationMenuTrigger>
          <NavigationMenuContent className="h-auto w-auto overflow-auto">
            <ul className="grid max-h-[240px] w-[320px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="/docs/intro" className="block rounded p-2 hover:bg-accent">
                    快速入门
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a href="/docs/api" className="block rounded p-2 hover:bg-accent">
                    API 文档
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a href="/docs/faq" className="block rounded p-2 hover:bg-accent">
                    常见问题
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger value="more">更多</NavigationMenuTrigger>
          <NavigationMenuContent className="h-auto w-auto overflow-auto">
            <ul className="grid max-h-[240px] w-[320px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="/about" className="block rounded p-2 hover:bg-accent">
                    关于我们
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                {/* 禁用项演示 */}
                {/* @ts-expect-error design-system 支持 disabled，但类型未声明 */}
                <NavigationMenuLink asChild disabled>
                  <a href="#" className="block cursor-not-allowed rounded p-2 opacity-50">
                    禁用项
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
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>文档</NavigationMenuTrigger>
          <NavigationMenuContent className="h-auto w-auto overflow-auto">
            <ul className="grid w-[400px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <a className="rounded p-3 text-gray-100 hover:bg-gray-700" href="/docs">
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
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="flex-col items-start">
        <NavigationMenuItem>
          <NavigationMenuTrigger>移动菜单</NavigationMenuTrigger>
          <NavigationMenuContent className="h-auto w-auto overflow-auto">
            <ul className="grid max-h-[240px] w-[320px] gap-3 p-4">
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
