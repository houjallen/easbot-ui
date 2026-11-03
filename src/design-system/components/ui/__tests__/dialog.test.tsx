/**
 * Dialog 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态
 * 3. 交互测试 - 验证点击触发器打开、关闭按钮关闭与回调
 * 4. 无障碍测试 - 验证 dialog 语义角色、标题描述关联、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空内容
 *
 * @remarks
 * Radix 的 `Dialog` 内容渲染到 `document.body`（portal），
 * 因此必须用 `screen.findByRole(...)` 查询，不能用 `container`。
 * 对话框打开后，Radix 会把外部元素标记为 `aria-hidden`，
 * 此时查询触发器需要带 `hidden: true` 选项。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../dialog';

describe('Dialog 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发器', () => {
      render(
        <Dialog>
          <DialogTrigger>打开对话框</DialogTrigger>
        </Dialog>,
      );

      const trigger = screen.getByRole('button', { name: '打开对话框' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger');
    });

    it('应该正确渲染对话框结构', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑资料</DialogTitle>
              <DialogDescription>修改后点击保存</DialogDescription>
            </DialogHeader>
            <DialogFooter>页脚</DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveAttribute('data-slot', 'dialog-content');
      expect(screen.getByText('编辑资料')).toHaveAttribute('data-slot', 'dialog-title');
      expect(screen.getByText('修改后点击保存')).toHaveAttribute('data-slot', 'dialog-description');
    });

    it('应该正确应用遮罩层类名', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      const overlay = document.querySelector('[data-slot="dialog-overlay"]');
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('bg-black/50');
      expect(overlay).toHaveClass('data-[state=open]:fade-in-0');
    });

    it('应该正确应用内容面板类名', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('rounded-lg');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('bg-background');
      expect(content).toHaveClass('p-6');
    });

    it('应该正确应用标题与描述类名', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>标题</DialogTitle>
              <DialogDescription>描述</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      expect(await screen.findByText('标题')).toHaveClass('font-semibold');
      expect(await screen.findByText('描述')).toHaveClass('text-muted-foreground');
    });

    it('应该渲染内置的关闭按钮', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      const close = await screen.findByRole('button', { name: '关闭' });
      expect(close).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent className="custom-content">内容</DialogContent>
        </Dialog>,
      );

      expect(await screen.findByRole('dialog')).toHaveClass('custom-content');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <Dialog>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('应该在 defaultOpen 时渲染打开状态', async () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      const trigger = screen.getByRole('button', { name: '打开', hidden: true });
      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByRole('dialog')).toHaveAttribute('data-state', 'open');
    });

    it('应该在关闭状态下不渲染内容面板', () => {
      render(
        <Dialog>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时打开对话框', async () => {
      render(
        <Dialog>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该在点击关闭按钮时关闭对话框', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('dialog');

      fireEvent.click(screen.getByRole('button', { name: '关闭' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('应该在点击 DialogClose 时关闭对话框', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>
            <DialogClose>关闭</DialogClose>
          </DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('dialog');

      // 内置关闭按钮与自定义 DialogClose 同名「关闭」，此处定位内置按钮
      fireEvent.click(document.querySelector('[data-slot="dialog-close"]') as HTMLElement);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('应该在点击关闭按钮时触发 onClick 回调', async () => {
      const handleClick = vi.fn();
      render(
        <Dialog>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>
            <DialogClose onClick={handleClick}>关闭</DialogClose>
          </DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('dialog');

      // 内容面板内同时存在内置关闭按钮（sr-only 文案「关闭」）与自定义 DialogClose，
      // 此处按「可见文本为『关闭』」精确筛选出自定义的 DialogClose。
      const dialogClose = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dialog-content"] [data-slot="dialog-close"]')).find((element) => element.textContent === '关闭');
      expect(dialogClose).toBeDefined();
      fireEvent.click(dialogClose as HTMLElement);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在按下 Escape 键时关闭对话框', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      const dialog = await screen.findByRole('dialog');

      fireEvent.keyDown(dialog, { key: 'Escape' });

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 dialog 语义角色', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该通过 aria-labelledby 关联标题', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>编辑资料</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      const dialog = await screen.findByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy as string)).toHaveTextContent('编辑资料');
    });

    it('应该通过 aria-describedby 关联描述', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>编辑资料</DialogTitle>
            <DialogDescription>修改后点击保存</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      const dialog = await screen.findByRole('dialog');
      const describedBy = dialog.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent('修改后点击保存');
    });

    it('应该在打开时把焦点移入对话框内部', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      const dialog = await screen.findByRole('dialog');
      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('应该暴露触发器的 aria-haspopup 属性', () => {
      render(
        <Dialog>
          <DialogTrigger>打开</DialogTrigger>
        </Dialog>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('应该透传 aria-label 到内容面板', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent aria-label="设置对话框">内容</DialogContent>
        </Dialog>,
      );

      expect(await screen.findByRole('dialog', { name: '设置对话框' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Dialog open onOpenChange={handleOpenChange}>
          <DialogTrigger>打开</DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      // 对话框打开后 Radix 会把触发器标记为 aria-hidden，因此需要用 hidden 选项查询
      fireEvent.click(screen.getByRole('button', { name: '打开', hidden: true }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该允许渲染没有标题与描述的对话框', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>仅有内容</DialogContent>
        </Dialog>,
      );

      expect(await screen.findByRole('dialog')).toHaveTextContent('仅有内容');
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Dialog>
          <DialogTrigger data-custom="value">打开</DialogTrigger>
        </Dialog>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该正确渲染页眉与页脚类名', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>标题</DialogTitle>
            </DialogHeader>
            <DialogFooter>页脚</DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const header = document.querySelector('[data-slot="dialog-header"]');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');

      const footer = document.querySelector('[data-slot="dialog-footer"]');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('sm:flex-row');
    });
  });
});
