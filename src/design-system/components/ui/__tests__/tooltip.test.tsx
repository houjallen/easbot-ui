/**
 * Tooltip 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态与 data-state 属性
 * 3. 交互测试 - 验证聚焦/失焦触发的显示隐藏与回调
 * 4. 无障碍测试 - 验证 tooltip 语义角色、aria-describedby、焦点管理
 * 5. 边界测试 - 验证受控模式、延迟时长、透传属性
 *
 * @remarks
 * Radix 的 `TooltipTrigger` 通过 `onFocus` 打开提示（鼠标悬停走 `onPointerMove`，
 * jsdom 中不稳定），因此测试以聚焦 / 失焦作为主要交互路径。
 * `TooltipContent` 渲染到 `document.body`（portal），
 * 因此必须用 `screen.findByRole(...)` 查询，不能用 `container`。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';

describe('Tooltip 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发器', () => {
      render(
        <Tooltip>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
    });

    it('应该正确渲染提示内容', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const content = await screen.findByRole('tooltip');
      expect(content).toHaveAttribute('data-slot', 'tooltip-content');
      expect(content).toHaveTextContent('提示内容');
      // Radix 的 Tooltip 状态取值为 closed / instant-open / delayed-open
      expect(content.getAttribute('data-state')).not.toBe('closed');
    });

    it('应该正确应用提示内容类名', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const content = await screen.findByRole('tooltip');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('rounded-md');
      expect(content).toHaveClass('bg-primary');
      expect(content).toHaveClass('px-3');
      expect(content).toHaveClass('py-1.5');
      expect(content).toHaveClass('text-primary-foreground');
    });

    it('应该渲染提示箭头元素', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const content = await screen.findByRole('tooltip');
      const arrow = content.querySelector('svg');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass('size-2.5');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent className="custom-content">提示内容</TooltipContent>
        </Tooltip>,
      );

      expect(await screen.findByRole('tooltip')).toHaveClass('custom-content');
    });

    it('应该正确渲染 TooltipProvider', () => {
      const { container } = render(
        <TooltipProvider>
          <span>内容</span>
        </TooltipProvider>,
      );

      expect(container).toHaveTextContent('内容');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <Tooltip>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      expect(screen.getByRole('button', { name: '悬停提示' })).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('应该在 open 时渲染打开状态', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示', hidden: true });
      await waitFor(() => {
        // Radix 的 Tooltip 触发器状态取值为 closed / instant-open / delayed-open
        expect(trigger.getAttribute('data-state')).not.toBe('closed');
      });
      // Radix 的 Tooltip 状态取值为 closed / instant-open / delayed-open
      expect((await screen.findByRole('tooltip')).getAttribute('data-state')).not.toBe('closed');
    });

    it('应该在关闭状态下不渲染提示内容', () => {
      render(
        <Tooltip>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在触发器获得焦点时显示提示', async () => {
      render(
        <Tooltip>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示' });
      trigger.focus();

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });

    it('应该在触发器失去焦点时隐藏提示', async () => {
      render(
        <Tooltip>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示' });
      trigger.focus();
      await screen.findByRole('tooltip');

      fireEvent.blur(trigger);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('应该在聚焦时触发打开状态回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Tooltip onOpenChange={handleOpenChange}>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      screen.getByRole('button', { name: '悬停提示' }).focus();

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('应该在失焦时触发关闭状态回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Tooltip onOpenChange={handleOpenChange}>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示' });
      trigger.focus();
      await screen.findByRole('tooltip');

      fireEvent.blur(trigger);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('应该在点击触发器时触发点击回调', () => {
      const handleClick = vi.fn();
      render(
        <Tooltip>
          <TooltipTrigger onClick={handleClick}>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      fireEvent.click(screen.getByRole('button', { name: '悬停提示' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 tooltip 语义角色', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });

    it('应该通过 aria-describedby 关联提示内容', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示', hidden: true });
      const describedBy = trigger.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent('提示内容');
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <Tooltip>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该透传 aria-label 到触发器', () => {
      render(
        <Tooltip>
          <TooltipTrigger aria-label="查看帮助">?</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      expect(screen.getByRole('button', { name: '查看帮助' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Tooltip open onOpenChange={handleOpenChange}>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();

      // 提示打开后 Radix 会把触发器标记为 aria-hidden，因此需要用 hidden 选项查询
      fireEvent.click(screen.getByRole('button', { name: '悬停提示', hidden: true }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });

    it('应该允许渲染没有内容的提示', async () => {
      render(
        <Tooltip open>
          <TooltipTrigger>悬停提示</TooltipTrigger>
          <TooltipContent />
        </Tooltip>,
      );

      await waitFor(() => {
        expect(document.querySelector('[data-slot="tooltip-content"]')).toBeInTheDocument();
      });
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Tooltip>
          <TooltipTrigger data-custom="value">悬停提示</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>,
      );

      expect(screen.getByRole('button', { name: '悬停提示' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该在 TooltipProvider 缺省时使用零延迟', async () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>悬停提示</TooltipTrigger>
            <TooltipContent>提示内容</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      const trigger = screen.getByRole('button', { name: '悬停提示' });
      trigger.focus();

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });
  });
});
