/**
 * Card 组件的 Storybook 示例文件
 *
 * 展示了Card组件的各种使用场景和样式变体
 */

// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarFallback, AvatarImage } from '../../avatar/avatar';
import { Badge } from '../../badge/badge';
import { Button } from '../../button/button';
import { Skeleton } from '../../skeleton/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';

const meta = {
  title: 'EASAI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
          Card 组件用于展示内容的容器，可以包含标题、描述、内容和操作等。
          
          ## 特性
          - 支持多种样式变体：默认、成功、警告、危险等
          - 支持不同尺寸和悬浮效果
          - 支持可点击状态
          - 支持加载状态
          - 灵活的内容布局
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基础卡片示例
 */
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>卡片标题</CardTitle>
        <CardDescription>这是一个基础的卡片示例，展示了标准的布局结构。</CardDescription>
      </CardHeader>
      <CardContent>
        <p>卡片的主要内容区域，可以放置任何内容。</p>
      </CardContent>
      <CardFooter>
        <Button>确认</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * 卡片变体示例
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>默认卡片</CardTitle>
          <CardDescription>默认样式的卡片</CardDescription>
        </CardHeader>
        <CardContent>默认卡片内容</CardContent>
      </Card>

      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>危险卡片</CardTitle>
          <CardDescription>用于危险操作的卡片</CardDescription>
        </CardHeader>
        <CardContent>危险操作内容</CardContent>
      </Card>

      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>成功卡片</CardTitle>
          <CardDescription>表示成功状态的卡片</CardDescription>
        </CardHeader>
        <CardContent>成功状态内容</CardContent>
      </Card>
    </div>
  ),
};

/**
 * 可交互卡片示例
 */
export const Interactive: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-[250px]" onClick={() => console.log('卡片被点击')}>
        <CardHeader>
          <CardTitle>可点击卡片</CardTitle>
          <CardDescription>点击查看详情</CardDescription>
        </CardHeader>
        <CardContent>点击整个卡片区域都可以触发点击事件</CardContent>
      </Card>

      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle>悬浮效果</CardTitle>
          <CardDescription>仅显示悬浮阴影</CardDescription>
        </CardHeader>
        <CardContent>鼠标悬浮时会显示阴影效果</CardContent>
      </Card>
    </div>
  ),
};

/**
 * 加载状态示例
 */
export const Loading: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-4 w-[200px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[300px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-[100px]" />
        </CardFooter>
      </Card>

      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>加载完成</CardTitle>
          <CardDescription>这是加载完成后的内容</CardDescription>
        </CardHeader>
        <CardContent>
          <p>实际的内容区域</p>
        </CardContent>
        <CardFooter>
          <Button>操作按钮</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/**
 * 复杂内容示例
 */
export const ComplexContent: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" alt="用户头像" />
            <AvatarFallback>用户</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>用户信息卡片</CardTitle>
            <CardDescription>展示用户的详细信息</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">状态</span>
          <Badge variant="default">在线</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">角色</span>
          <Badge variant="secondary">管理员</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">项目数</span>
          <Badge>12</Badge>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline">查看详情</Button>
        <Button>编辑资料</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * 尺寸示例
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle>小型卡片</CardTitle>
          <CardDescription>较小的内边距</CardDescription>
        </CardHeader>
        <CardContent>小型卡片内容</CardContent>
      </Card>

      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>默认卡片</CardTitle>
          <CardDescription>默认的内边距</CardDescription>
        </CardHeader>
        <CardContent>默认卡片内容</CardContent>
      </Card>

      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>大型卡片</CardTitle>
          <CardDescription>较大的内边距</CardDescription>
        </CardHeader>
        <CardContent>大型卡片内容</CardContent>
      </Card>
    </div>
  ),
};

/**
 * 禁用状态示例
 */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>禁用卡片</CardTitle>
          <CardDescription>无法交互的卡片示例</CardDescription>
        </CardHeader>
        <CardContent>禁用状态下的内容</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>禁用可点击卡片</CardTitle>
          <CardDescription>点击不会触发任何操作</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
};
