/**
 * AlertDialog 组件的 Storybook 示例文件
 *
 * 展示了AlertDialog组件的各种使用场景和交互方式
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';
import { Button } from '../button/button';
import { Trash2, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';
import React from 'react';

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
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

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
      <AlertDialogContent>
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
            <ul className="list-disc pl-4 space-y-2">
              <li>如何创建新项目？点击右上角的"新建"按钮。</li>
              <li>如何修改设置？进入个人中心，点击"设置"选项。</li>
              <li>如何导出数据？在项目列表中选择要导出的项目，点击"导出"。</li>
            </ul>
            <p className="text-sm text-muted-foreground">如果您还有其他问题，请联系技术支持。</p>
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
          <AlertDialogAction variant="destructive">确认删除</AlertDialogAction>
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
            <AlertDialogAction loading={isLoading} onClick={() => setIsLoading(true)}>
              确认提交
            </AlertDialogAction>
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
          <AlertDialogAction variant="success">确定</AlertDialogAction>
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
