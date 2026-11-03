/**
 * AlertDialog 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证触发器与对话框内容的渲染
 * 2. 交互测试 - 验证确认 / 取消按钮与关闭按钮行为
 * 3. 状态测试 - 验证尺寸变体与关闭按钮变体类名
 * 4. 无障碍测试 - 验证 alertdialog 语义角色与键盘操作
 *
 * 说明：`AlertDialogContent` 的 `variant` 只作用于内置关闭按钮的样式，
 * 不改变对话框容器的边框颜色；组件也没有加载态能力，故不对其做断言。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

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

describe('AlertDialog 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染触发按钮', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开对话框</AlertDialogTrigger>
        </AlertDialog>,
      );
      expect(screen.getByText('打开对话框')).toBeInTheDocument();
    });

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

      fireEvent.click(screen.getByText('打开对话框'));

      await waitFor(() => {
        expect(screen.getByText('确认操作')).toBeInTheDocument();
        expect(screen.getByText('您确定要执行此操作吗？')).toBeInTheDocument();
        expect(screen.getByText('取消')).toBeInTheDocument();
        expect(screen.getByText('确认')).toBeInTheDocument();
      });
    });

    it('应该默认渲染内置的关闭按钮', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>标题</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
      });
    });

    it('应该支持隐藏内置关闭按钮', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent showCloseButton={false}>
            <AlertDialogTitle>标题</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument();
      });
    });
  });

  // 交互测试
  describe('交互测试', () => {
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

      fireEvent.click(screen.getByText('打开对话框'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('确认'));
      });

      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

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

      fireEvent.click(screen.getByText('打开对话框'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('取消'));
      });

      expect(handleCancel).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应该正确应用大尺寸样式', async () => {
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
        expect(screen.getByRole('alertdialog')).toHaveClass('sm:max-w-xl');
      });
    });

    it('应该正确应用小尺寸样式', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogTitle>小尺寸对话框</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toHaveClass('sm:max-w-sm');
      });
    });

    it('应该正确应用关闭按钮的变体样式', async () => {
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
        const closeButton = screen.getByRole('button', { name: '关闭' });
        expect(closeButton).toHaveClass('text-destructive');
      });
    });

    it('关闭按钮应与 Dialog 一致：右上角、方角、无内边距、24px 方形', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>样式测试</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: '关闭' });
        // 📌 位置：右上角绝对定位（与 Dialog / Toast 一致）
        expect(closeButton).toHaveClass('absolute');
        expect(closeButton).toHaveClass('top-4');
        expect(closeButton).toHaveClass('right-4');
        // 📌 形状：方角（`!` 前缀强制覆盖 CloseButton 自带的 `rounded-md`）
        expect(closeButton).toHaveClass('!rounded-xs');
        expect(closeButton).not.toHaveClass('rounded-full');
        // 📌 内边距清零 —— `asChild` 场景下不得再被 `AlertDialogCancel`
        //    的 `buttonVariants`（`px-3 py-2`）污染
        expect(closeButton).toHaveClass('p-0');
        expect(closeButton).not.toHaveClass('px-3');
        expect(closeButton).not.toHaveClass('py-2');
        // 📌 尺寸 24×24
        expect(closeButton).toHaveClass('size-6');
      });
    });

    it('关闭按钮不应出现焦点环（打开时不应呈选中态）', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>焦点测试</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByText('打开'));

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: '关闭' });
        // 📌 焦点环必须用 `focus-visible`（仅键盘聚焦显示），
        //    不可用 `focus` —— Radix 打开时会自动聚焦关闭按钮，
        //    用 `focus` 会表现为「打开即选中态」。
        expect(closeButton.className).toContain('focus-visible:ring-2');
        expect(closeButton.className).not.toMatch(/(^|\s)focus:ring/);
      });
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
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

      fireEvent.click(screen.getByText('打开对话框'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByRole('heading')).toHaveAttribute('id');
        expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-labelledby');
      });
    });

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

      fireEvent.click(screen.getByText('打开对话框'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Radix AlertDialog 打开后自动聚焦到第一个可聚焦元素（此处为内置关闭按钮）
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '关闭' })).toHaveFocus();
      });
    });
  });
});
