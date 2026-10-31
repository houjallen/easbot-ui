/**
 * AlertDialog 组件单元测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 交互测试 - 验证按钮点击和对话框状态
 * 3. 无障碍测试 - 验证可访问性
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
import { vi } from 'vitest';

describe('AlertDialog 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    /**
     * 基础渲染测试
     * 验证AlertDialog的基本渲染是否正确
     */
    it('应该正确渲染触发按钮', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开对话框</AlertDialogTrigger>
        </AlertDialog>,
      );
      expect(screen.getByText('打开对话框')).toBeInTheDocument();
    });

    /**
     * 内容渲染测试
     * 验证点击后对话框内容是否正确显示
     */
    it('点击触发按钮后应该显示对话框内容', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开对话框</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认操作</AlertDialogTitle>
              <AlertDialogDescription>您确定要执行此操作吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction>确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      // 点击触发按钮
      fireEvent.click(screen.getByText('打开对话框'));

      // 等待对话框内容显示
      await waitFor(() => {
        expect(screen.getByText('确认操作')).toBeInTheDocument();
        expect(screen.getByText('您确定要执行此操作吗？')).toBeInTheDocument();
        expect(screen.getByText('取消')).toBeInTheDocument();
        expect(screen.getByText('确认')).toBeInTheDocument();
      });
    });
  });

  // 交互测试
  describe('交互测试', () => {
    /**
     * 确认按钮测试
     * 验证确认按钮的点击事件是否正确触发
     */
    it('点击确认按钮应该触发回调', async () => {
      const handleConfirm = vi.fn();

      render(
        <AlertDialog>
          <AlertDialogTrigger>打开对话框</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认操作</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      // 打开对话框
      fireEvent.click(screen.getByText('打开对话框'));

      // 等待对话框显示并点击确认
      await waitFor(() => {
        fireEvent.click(screen.getByText('确认'));
      });

      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    /**
     * 取消按钮测试
     * 验证取消按钮的点击事件是否正确触发
     */
    it('点击取消按钮应该关闭对话框', async () => {
      const handleCancel = vi.fn();

      render(
        <AlertDialog>
          <AlertDialogTrigger>打开对话框</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>取消</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      // 打开对话框
      fireEvent.click(screen.getByText('打开对话框'));

      // 等待对话框显示并点击取消
      await waitFor(() => {
        fireEvent.click(screen.getByText('取消'));
      });

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    /**
     * ARIA属性测试
     * 验证对话框的无障碍属性是否正确
     */
    it('应该有正确的ARIA属性', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开对话框</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>确认操作</AlertDialogTitle>
            <AlertDialogDescription>您确定要执行此操作吗？</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>,
      );

      // 打开对话框
      fireEvent.click(screen.getByText('打开对话框'));

      // 等待对话框显示并检查ARIA属性
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByRole('heading')).toHaveAttribute('id');
        expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-labelledby');
      });
    });

    /**
     * 键盘导航测试
     * 验证键盘操作是否正确响应
     */
    it('应该支持键盘操作', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开对话框</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction>确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      // 打开对话框
      fireEvent.click(screen.getByText('打开对话框'));

      // 等待对话框显示并测试键盘操作
      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        // Radix AlertDialog 会把初始焦点放在第一个可聚焦元素（取消按钮）上
        expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();

        // 测试 Escape 键关闭
        fireEvent.keyDown(dialog, { key: 'Escape' });
      });

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  // 新增变体测试
  describe('变体测试', () => {
    it('应正确应用危险变体样式', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent variant="destructive">
            <AlertDialogTitle>危险操作</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      await waitFor(() => {
        // Tailwind v4：语义类已替换为 CSS 变量任意值
        expect(screen.getByRole('alertdialog')).toHaveClass('border-[var(--alert-dialog-destructive-border)]');
      });
    });

    it('应正确应用成功变体样式', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent variant="success">
            <AlertDialogTitle>操作成功</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toHaveClass('border-[var(--alert-dialog-success-border)]');
      });
    });
  });

  // 新增加载状态测试
  describe('加载状态测试', () => {
    it('应正确显示加载状态', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogAction loading>确认</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '确认' })).toBeDisabled();
        // 加载指示器使用 Spinner 组件，其无障碍角色为 status
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  // 新增尺寸测试
  describe('尺寸测试', () => {
    it('应正确应用大尺寸样式', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent size="lg">
            <AlertDialogTitle>大尺寸对话框</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      await waitFor(() => {
        // Tailwind v4：尺寸使用 CSS 变量任意值
        expect(screen.getByRole('alertdialog')).toHaveClass('max-w-[var(--alert-dialog-lg-max-width)]');
      });
    });
  });
});
