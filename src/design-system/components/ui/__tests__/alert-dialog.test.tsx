/**
 * AlertDialog 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态、禁用态
 * 3. 交互测试 - 验证点击触发器打开、确认/取消关闭与回调
 * 4. 无障碍测试 - 验证 alertdialog 语义角色、标题描述关联、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空内容
 *
 * @remarks
 * Radix 的 `AlertDialog` 内容渲染到 `document.body`（portal），
 * 因此必须用 `screen.findByRole(...)` 查询，不能用 `container`。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

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
  describe('渲染测试', () => {
    it('应该正确渲染触发器', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开确认框</AlertDialogTrigger>
        </AlertDialog>,
      );

      const trigger = screen.getByRole('button', { name: '打开确认框' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'alert-dialog-trigger');
    });

    it('应该正确渲染确认框结构', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>删除确认</AlertDialogTitle>
              <AlertDialogDescription>此操作不可撤销</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction>确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      const dialog = await screen.findByRole('alertdialog');
      expect(dialog).toHaveAttribute('data-slot', 'alert-dialog-content');
      expect(screen.getByText('删除确认')).toHaveAttribute('data-slot', 'alert-dialog-title');
      expect(screen.getByText('此操作不可撤销')).toHaveAttribute('data-slot', 'alert-dialog-description');
    });

    it('应该正确应用遮罩层类名', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      const overlay = document.querySelector('[data-slot="alert-dialog-overlay"]');
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('bg-black/50');
      expect(overlay).toHaveClass('data-[state=closed]:fade-out-0');
    });

    it('应该正确应用内容面板类名', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      const content = await screen.findByRole('alertdialog');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('rounded-lg');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('bg-background');
      expect(content).toHaveClass('p-6');
    });

    it('应该正确应用标题与描述类名', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>标题</AlertDialogTitle>
              <AlertDialogDescription>描述</AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>,
      );

      expect(await screen.findByText('标题')).toHaveClass('font-semibold');
      expect(await screen.findByText('描述')).toHaveClass('text-muted-foreground');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent className="custom-content">内容</AlertDialogContent>
        </AlertDialog>,
      );

      expect(await screen.findByRole('alertdialog')).toHaveClass('custom-content');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('应该在 defaultOpen 时渲染打开状态', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      const trigger = screen.getByRole('button', { name: '打开', hidden: true });
      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByRole('alertdialog')).toHaveAttribute('data-state', 'open');
    });

    it('应该在关闭状态下不渲染内容面板', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('应该在触发器禁用时不触发打开', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger disabled>打开</AlertDialogTrigger>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      const trigger = screen.getByRole('button', { name: '打开' });
      expect(trigger).toBeDisabled();

      fireEvent.click(trigger);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时打开确认框', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));

      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    });

    it('应该在点击取消按钮时关闭确认框', async () => {
      const handleOpenChange = vi.fn();
      render(
        <AlertDialog onOpenChange={handleOpenChange}>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel>取消</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('alertdialog');

      fireEvent.click(screen.getByRole('button', { name: '取消' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('应该在点击确认按钮时关闭确认框', async () => {
      const handleOpenChange = vi.fn();
      render(
        <AlertDialog onOpenChange={handleOpenChange}>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogAction>确认</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('alertdialog');

      fireEvent.click(screen.getByRole('button', { name: '确认' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('应该在点击确认按钮时触发动作回调', async () => {
      const handleAction = vi.fn();
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogAction onClick={handleAction}>确认</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('alertdialog');

      fireEvent.click(screen.getByRole('button', { name: '确认' }));

      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('应该在按下回车键时触发确认动作', async () => {
      const handleAction = vi.fn();
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogAction onClick={handleAction}>确认</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      const action = await screen.findByRole('button', { name: '确认' });

      // 真实浏览器在回车键上会合成 click 事件，jsdom 不会合成，
      // 因此这里显式模拟浏览器的行为。
      action.focus();
      fireEvent.keyDown(action, { key: 'Enter', code: 'Enter' });
      fireEvent.click(action);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 alertdialog 语义角色', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    });

    it('应该通过 aria-labelledby 关联标题', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogTitle>删除确认</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      const dialog = await screen.findByRole('alertdialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy as string)).toHaveTextContent('删除确认');
    });

    it('应该通过 aria-describedby 关联描述', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogTitle>删除确认</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>,
      );

      const dialog = await screen.findByRole('alertdialog');
      const describedBy = dialog.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent('此操作不可撤销');
    });

    it('应该在打开时把焦点移入内容面板', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogCancel>取消</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>,
      );

      const dialog = await screen.findByRole('alertdialog');
      // Radix 在打开时把焦点移入对话框内部（内容面板或内部首个可聚焦元素）
      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('应该暴露触发器的 aria-haspopup 属性', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
        </AlertDialog>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <AlertDialog open onOpenChange={handleOpenChange}>
          <AlertDialogTrigger>打开</AlertDialogTrigger>
          <AlertDialogContent>内容</AlertDialogContent>
        </AlertDialog>,
      );

      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

      // 对话框打开后 Radix 会把触发器标记为 aria-hidden，因此需要用 hidden 选项查询
      fireEvent.click(screen.getByRole('button', { name: '打开', hidden: true }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    });

    it('应该允许渲染没有标题与描述的确认框', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>仅有内容</AlertDialogContent>
        </AlertDialog>,
      );

      expect(await screen.findByRole('alertdialog')).toHaveTextContent('仅有内容');
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger data-custom="value">打开</AlertDialogTrigger>
        </AlertDialog>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该正确渲染页眉与页脚类名', async () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>标题</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      const header = document.querySelector('[data-slot="alert-dialog-header"]');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');

      const footer = document.querySelector('[data-slot="alert-dialog-footer"]');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('sm:flex-row');
    });
  });
});
