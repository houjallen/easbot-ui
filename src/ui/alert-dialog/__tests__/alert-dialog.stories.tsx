/**
 * AlertDialog 组件的 Storybook 示例文件
 *
 * 展示了AlertDialog组件的各种使用场景和交互方式
 */

// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { AlertTriangle, CheckCircle, HelpCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { Button } from '../../button/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'EASAI/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
          AlertDialog 组件用于展示重要的警告信息或确认操作，需要用户明确的操作反馈。

          ## 特性
          - 基于 Radix UI 实现，提供完善的无障碍支持
          - 支持键盘导航和操作
          - 支持自定义内容和按钮
          - 支持动画效果
          - 支持响应式布局
          - 支持右上角关闭按钮
          - 可配置点击遮罩层是否关闭对话框
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基础警告对话框示例
 */
export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">打开对话框</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认操作</AlertDialogTitle>
          <AlertDialogDescription>此操作不可撤销，您确定要继续吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>确认</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 带关闭按钮的对话框示例
 */
export const WithCloseButton: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">带关闭按钮的对话框</Button>
      </AlertDialogTrigger>
      <AlertDialogContent closeAriaLabel="关闭对话框">
        <AlertDialogHeader>
          <AlertDialogTitle>带关闭按钮的对话框</AlertDialogTitle>
          <AlertDialogDescription>此对话框右上角有关闭按钮，点击按钮可以关闭对话框。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>确认</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 禁止点击遮罩层关闭的对话框示例
 */
export const PreventOverlayClose: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">禁止点击背景关闭的对话框</Button>
      </AlertDialogTrigger>
      <AlertDialogContent closeOnOverlayClick={false}>
        <AlertDialogHeader>
          <AlertDialogTitle>重要操作确认</AlertDialogTitle>
          <AlertDialogDescription>此对话框禁止点击背景关闭，必须使用关闭按钮或底部的操作按钮才能关闭对话框。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>确认</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 删除确认对话框示例
 */
export const DeleteConfirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          删除项目
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent variant="destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            删除确认
          </AlertDialogTitle>
          <AlertDialogDescription>您确定要删除此项目吗？此操作将永久删除该项目及其所有相关数据，且不可恢复。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 帮助对话框示例
 */
export const HelpDialog: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <HelpCircle className="mr-2 h-4 w-4" />
          帮助说明
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-primary">
            <HelpCircle className="mr-2 h-5 w-5" />
            使用帮助
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>以下是一些常见问题的解答：</p>
            <ul className="list-disc space-y-2 pl-4">
              <li>如何创建新项目？点击右上角的&quot;新建&quot;按钮。</li>
              <li>如何修改设置？进入个人中心，点击&quot;设置&quot;选项。</li>
              <li>如何导出数据？在项目列表中选择要导出的项目，点击&quot;导出&quot;。</li>
            </ul>
            <p className="text-muted-foreground text-sm">如果您还有其他问题，请联系技术支持。</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>我知道了</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 自定义内容示例
 */
export const CustomContent: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>查看详情</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>项目详细信息</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h6 className="font-medium">基本信息</h6>
                <p className="text-sm">项目名称：示例项目</p>
                <p className="text-sm">创建时间：2024-02-08</p>
                <p className="text-sm">负责人：张三</p>
              </div>
              <div className="space-y-2">
                <h6 className="font-medium">统计数据</h6>
                <p className="text-sm">完成任务：12/20</p>
                <p className="text-sm">参与成员：5人</p>
                <p className="text-sm">剩余时间：7天</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>关闭</AlertDialogCancel>
          <AlertDialogAction>编辑</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 危险操作示例
 */
export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">删除项目</Button>
      </AlertDialogTrigger>
      <AlertDialogContent variant="destructive">
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>此操作将永久删除该项目</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>确认删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 加载状态示例
 */
export const LoadingState: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = React.useState(false);

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>提交数据</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认提交</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => setIsLoading(true)}>确认提交</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};

/**
 * 新增成功状态示例
 */
export const SuccessDialog: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="success">提交成功</Button>
      </AlertDialogTrigger>
      <AlertDialogContent variant="success">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            操作成功
          </AlertDialogTitle>
          <AlertDialogDescription>您的数据已成功提交</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>确定</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 隐藏关闭按钮示例
 */
export const HideCloseButton: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">无关闭按钮的对话框</Button>
      </AlertDialogTrigger>
      <AlertDialogContent showCloseButton={false}>
        <AlertDialogHeader>
          <AlertDialogTitle>无关闭按钮的对话框</AlertDialogTitle>
          <AlertDialogDescription>此对话框没有右上角的关闭按钮，只能通过底部的操作按钮关闭。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>确认</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * 新增尺寸示例
 */
export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>小尺寸</Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogTitle>小尺寸对话框</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>大尺寸</Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="lg">
          <AlertDialogTitle>大尺寸对话框</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
};
