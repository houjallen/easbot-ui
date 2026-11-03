/**
 * Sheet 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态与四个方向的样式类
 * 3. 交互测试 - 验证点击触发器打开、关闭按钮关闭与回调
 * 4. 无障碍测试 - 验证 dialog 语义角色、标题描述关联、焦点管理
 * 5. 边界测试 - 验证受控模式、缺省方向、透传属性
 *
 * @remarks
 * Radix 的 `Sheet` 基于 `react-dialog` 实现，内容渲染到 `document.body`（portal），
 * 因此必须用 `screen.findByRole(...)` 查询，不能用 `container`。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../sheet';

describe('Sheet 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发器', () => {
      render(
        <Sheet>
          <SheetTrigger>打开抽屉</SheetTrigger>
        </Sheet>,
      );

      const trigger = screen.getByRole('button', { name: '打开抽屉' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'sheet-trigger');
    });

    it('应该正确渲染抽屉结构', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>筛选条件</SheetTitle>
              <SheetDescription>调整后立即生效</SheetDescription>
            </SheetHeader>
            <SheetFooter>页脚</SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveAttribute('data-slot', 'sheet-content');
      expect(screen.getByText('筛选条件')).toHaveAttribute('data-slot', 'sheet-title');
      expect(screen.getByText('调整后立即生效')).toHaveAttribute('data-slot', 'sheet-description');
    });

    it('应该正确应用遮罩层类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      const overlay = document.querySelector('[data-slot="sheet-overlay"]');
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('bg-black/50');
      expect(overlay).toHaveClass('data-[state=open]:fade-in-0');
    });

    it('应该正确应用内容面板基础类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('flex');
      expect(content).toHaveClass('flex-col');
      expect(content).toHaveClass('bg-background');
      expect(content).toHaveClass('shadow-lg');
    });

    it('应该正确应用标题与描述类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>标题</SheetTitle>
              <SheetDescription>描述</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      expect(await screen.findByText('标题')).toHaveClass('font-semibold');
      expect(await screen.findByText('描述')).toHaveClass('text-muted-foreground');
    });

    it('应该渲染内置的关闭按钮', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      expect(await screen.findByRole('button', { name: '关闭' })).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent className="custom-content">内容</SheetContent>
        </Sheet>,
      );

      expect(await screen.findByRole('dialog')).toHaveClass('custom-content');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <Sheet>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('应该在 defaultOpen 时渲染打开状态', async () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByRole('button', { name: '打开', hidden: true });
      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByRole('dialog')).toHaveAttribute('data-state', 'open');
    });

    it('应该在右侧方向应用右侧滑出类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent side="right">内容</SheetContent>
        </Sheet>,
      );

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('inset-y-0');
      expect(content).toHaveClass('right-0');
      expect(content).toHaveClass('border-l');
      expect(content).toHaveClass('data-[state=open]:slide-in-from-right');
    });

    it('应该在左侧方向应用左侧滑出类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent side="left">内容</SheetContent>
        </Sheet>,
      );

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('inset-y-0');
      expect(content).toHaveClass('left-0');
      expect(content).toHaveClass('border-r');
      expect(content).toHaveClass('data-[state=open]:slide-in-from-left');
    });

    it('应该在顶部方向应用顶部滑出类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent side="top">内容</SheetContent>
        </Sheet>,
      );

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('inset-x-0');
      expect(content).toHaveClass('top-0');
      expect(content).toHaveClass('border-b');
      expect(content).toHaveClass('data-[state=open]:slide-in-from-top');
    });

    it('应该在底部方向应用底部滑出类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent side="bottom">内容</SheetContent>
        </Sheet>,
      );

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('inset-x-0');
      expect(content).toHaveClass('bottom-0');
      expect(content).toHaveClass('border-t');
      expect(content).toHaveClass('data-[state=open]:slide-in-from-bottom');
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时打开抽屉', async () => {
      render(
        <Sheet>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该在点击关闭按钮时关闭抽屉', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>内容</SheetContent>
        </Sheet>,
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

    it('应该在点击 SheetClose 时关闭抽屉', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>
            <SheetClose>关闭</SheetClose>
          </SheetContent>
        </Sheet>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('dialog');

      // 内置关闭按钮与自定义 SheetClose 同名「关闭」，此处定位自定义按钮
      fireEvent.click(screen.getAllByRole('button', { name: '关闭' })[0] as HTMLElement);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('应该在点击 SheetClose 时触发 onClick 回调', async () => {
      const handleClick = vi.fn();
      render(
        <Sheet>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>
            <SheetClose onClick={handleClick}>关闭</SheetClose>
          </SheetContent>
        </Sheet>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      await screen.findByRole('dialog');

      fireEvent.click(screen.getAllByRole('button', { name: '关闭' })[0] as HTMLElement);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在按下 Escape 键时关闭抽屉', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>内容</SheetContent>
        </Sheet>,
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
        <Sheet defaultOpen>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该通过 aria-labelledby 关联标题', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>筛选条件</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const dialog = await screen.findByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy as string)).toHaveTextContent('筛选条件');
    });

    it('应该通过 aria-describedby 关联描述', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>筛选条件</SheetTitle>
            <SheetDescription>调整后立即生效</SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      const dialog = await screen.findByRole('dialog');
      const describedBy = dialog.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent('调整后立即生效');
    });

    it('应该在打开时把焦点移入抽屉内部', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      const dialog = await screen.findByRole('dialog');
      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('应该暴露触发器的 aria-haspopup 属性', () => {
      render(
        <Sheet>
          <SheetTrigger>打开</SheetTrigger>
        </Sheet>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Sheet open onOpenChange={handleOpenChange}>
          <SheetTrigger>打开</SheetTrigger>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      // 抽屉打开后 Radix 会把触发器标记为 aria-hidden，因此需要用 hidden 选项查询
      fireEvent.click(screen.getByRole('button', { name: '打开', hidden: true }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该在缺省方向时使用右侧方向', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>内容</SheetContent>
        </Sheet>,
      );

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('right-0');
      expect(content).toHaveClass('data-[state=open]:slide-in-from-right');
    });

    it('应该允许渲染没有标题与描述的抽屉', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>仅有内容</SheetContent>
        </Sheet>,
      );

      expect(await screen.findByRole('dialog')).toHaveTextContent('仅有内容');
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Sheet>
          <SheetTrigger data-custom="value">打开</SheetTrigger>
        </Sheet>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该正确渲染页眉与页脚类名', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>标题</SheetTitle>
            </SheetHeader>
            <SheetFooter>页脚</SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      const header = document.querySelector('[data-slot="sheet-header"]');
      expect(header).toHaveClass('flex');
      // 📌 `p-6` 与 Dialog / AlertDialog / Drawer 统一（此前是 `p-4`）；
      //    `pr-10` 为右上角关闭按钮预留空间。
      expect(header).toHaveClass('p-6');
      expect(header).toHaveClass('pr-10');

      const footer = document.querySelector('[data-slot="sheet-footer"]');
      expect(footer).toHaveClass('mt-auto');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('p-6');
    });
  });
});
