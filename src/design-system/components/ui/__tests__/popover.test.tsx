/**
 * Popover 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态与 data-state 属性
 * 3. 交互测试 - 验证点击触发器打开/关闭与回调
 * 4. 无障碍测试 - 验证 trigger 语义角色、aria-expanded、焦点管理
 * 5. 边界测试 - 验证受控模式、位置修正开关、透传属性
 *
 * @remarks
 * Radix 的 `Popover` 内容渲染到 `document.body`（portal），
 * 因此必须用 `screen.findByRole(...)` 查询，不能用 `container`。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../popover';

describe('Popover 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发器', () => {
      render(
        <Popover>
          <PopoverTrigger>打开浮层</PopoverTrigger>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: '打开浮层' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'popover-trigger');
    });

    it('应该正确渲染浮层内容', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      const content = await screen.findByText('浮层内容');
      expect(content).toHaveAttribute('data-slot', 'popover-content');
      expect(content).toHaveAttribute('data-state', 'open');
    });

    it('应该正确应用浮层内容类名', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      const content = await screen.findByText('浮层内容');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('w-72');
      expect(content).toHaveClass('rounded-md');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('bg-popover');
      expect(content).toHaveClass('p-4');
      expect(content).toHaveClass('shadow-md');
    });

    it('应该正确应用 data-[state=open] 状态类名', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      const content = await screen.findByText('浮层内容');
      expect(content).toHaveClass('data-[state=open]:fade-in-0');
      expect(content).toHaveClass('data-[state=open]:zoom-in-95');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent className="custom-content">浮层内容</PopoverContent>
        </Popover>,
      );

      expect(await screen.findByText('浮层内容')).toHaveClass('custom-content');
    });

    it('应该正确渲染锚点元素', () => {
      render(
        <Popover>
          <PopoverAnchor>
            <button type="button">锚点</button>
          </PopoverAnchor>
          <PopoverTrigger>打开</PopoverTrigger>
        </Popover>,
      );

      const anchor = document.querySelector('[data-slot="popover-anchor"]');
      expect(anchor).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <Popover>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByText('浮层内容')).not.toBeInTheDocument();
    });

    it('应该在 defaultOpen 时渲染打开状态', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: '打开', hidden: true });
      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByText('浮层内容')).toHaveAttribute('data-state', 'open');
    });

    it('应该在关闭状态下不渲染浮层内容', () => {
      render(
        <Popover>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      expect(screen.queryByText('浮层内容')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时打开浮层', async () => {
      render(
        <Popover>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));

      expect(await screen.findByText('浮层内容')).toBeInTheDocument();
    });

    it('应该在再次点击触发器时关闭浮层', async () => {
      render(
        <Popover>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: '打开' });
      fireEvent.click(trigger);
      await screen.findByText('浮层内容');

      fireEvent.click(screen.getByRole('button', { name: '打开', hidden: true }));

      await waitFor(() => {
        expect(screen.queryByText('浮层内容')).not.toBeInTheDocument();
      });
    });

    it('应该在点击触发器时触发打开状态回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('应该在点击触发器时触发点击回调', () => {
      const handleClick = vi.fn();
      render(
        <Popover>
          <PopoverTrigger onClick={handleClick}>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在按下 Escape 键时关闭浮层', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开' }));
      const content = await screen.findByText('浮层内容');

      fireEvent.keyDown(content, { key: 'Escape' });

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 button 语义角色的触发器', () => {
      render(
        <Popover>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toBeInTheDocument();
    });

    it('应该通过 aria-expanded 暴露展开状态', async () => {
      render(
        <Popover>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: '打开' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '打开', hidden: true })).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <Popover>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: '打开' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该透传 aria-label 到触发器', () => {
      render(
        <Popover>
          <PopoverTrigger aria-label="打开帮助">?</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      expect(screen.getByRole('button', { name: '打开帮助' })).toBeInTheDocument();
    });

    it('应该在打开时把焦点移入浮层内容', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>
            <button type="button">浮层内按钮</button>
          </PopoverContent>
        </Popover>,
      );

      const content = await screen.findByRole('button', { name: '浮层内按钮' });
      await waitFor(() => {
        expect(content).toHaveFocus();
      });
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Popover open onOpenChange={handleOpenChange}>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      expect(await screen.findByText('浮层内容')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '打开', hidden: true }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(await screen.findByText('浮层内容')).toBeInTheDocument();
    });

    it('应该在关闭位置修正时仍能正常渲染浮层内容', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent enablePositionFix={false}>浮层内容</PopoverContent>
        </Popover>,
      );

      expect(await screen.findByText('浮层内容')).toBeInTheDocument();
    });

    it('应该允许渲染没有内容的浮层', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>打开</PopoverTrigger>
          <PopoverContent />
        </Popover>,
      );

      await waitFor(() => {
        expect(document.querySelector('[data-slot="popover-content"]')).toBeInTheDocument();
      });
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Popover>
          <PopoverTrigger data-custom="value">打开</PopoverTrigger>
          <PopoverContent>浮层内容</PopoverContent>
        </Popover>,
      );

      expect(screen.getByRole('button', { name: '打开' })).toHaveAttribute('data-custom', 'value');
    });
  });
});
