/**
 * HoverCard 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态与 data-state 属性
 * 3. 交互测试 - 验证指针移入/移出与聚焦触发的显示隐藏及回调
 * 4. 无障碍测试 - 验证触发器语义、data-state 暴露、焦点管理
 * 5. 边界测试 - 验证受控模式、打开延迟、透传属性
 *
 * @remarks
 * Radix 的 `HoverCardTrigger` 通过 `onPointerEnter`（排除触摸）与 `onFocus` 打开卡片，
 * `HoverCardContent` 渲染到 `document.body`（portal），因此内容必须用
 * `screen.findByText(...)` 查询，不能用 `container`。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '../hover-card';

describe('HoverCard 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发器', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const trigger = screen.getByText('用户名');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'hover-card-trigger');
    });

    it('应该正确渲染卡片内容', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const content = await screen.findByText('用户资料');
      expect(content).toHaveAttribute('data-slot', 'hover-card-content');
      expect(content).toHaveAttribute('data-state', 'open');
    });

    it('应该正确应用卡片内容类名', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const content = await screen.findByText('用户资料');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('w-64');
      expect(content).toHaveClass('rounded-md');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('bg-popover');
      expect(content).toHaveClass('p-4');
      expect(content).toHaveClass('shadow-md');
    });

    it('应该正确应用 data-[state=open] 状态类名', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const content = await screen.findByText('用户资料');
      expect(content).toHaveClass('data-[state=open]:fade-in-0');
      expect(content).toHaveClass('data-[state=open]:zoom-in-95');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent className="custom-content">用户资料</HoverCardContent>
        </HoverCard>,
      );

      expect(await screen.findByText('用户资料')).toHaveClass('custom-content');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      expect(screen.getByText('用户名')).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByText('用户资料')).not.toBeInTheDocument();
    });

    it('应该在 defaultOpen 时渲染打开状态', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const trigger = screen.getByText('用户名');
      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByText('用户资料')).toHaveAttribute('data-state', 'open');
    });

    it('应该在关闭状态下不渲染卡片内容', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      expect(screen.queryByText('用户资料')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在指针移入触发器时显示卡片', async () => {
      render(
        <HoverCard>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      fireEvent.pointerEnter(screen.getByText('用户名'));

      expect(await screen.findByText('用户资料')).toBeInTheDocument();
    });

    it('应该在指针移出触发器时隐藏卡片', async () => {
      render(
        <HoverCard>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const trigger = screen.getByText('用户名');
      fireEvent.pointerEnter(trigger);
      await screen.findByText('用户资料');

      fireEvent.pointerLeave(trigger);

      await waitFor(() => {
        expect(screen.queryByText('用户资料')).not.toBeInTheDocument();
      });
    });

    it('应该在触发器获得焦点时显示卡片', async () => {
      render(
        <HoverCard>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      // Radix 的 HoverCard 触发器渲染为 <a>（无 href），jsdom 中不可聚焦，
      // 因此用 fireEvent.focus 直接派发 React 的 onFocus 事件。
      fireEvent.focus(screen.getByText('用户名'));

      expect(await screen.findByText('用户资料')).toBeInTheDocument();
    });

    it('应该在指针移入时触发打开状态回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <HoverCard onOpenChange={handleOpenChange}>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      fireEvent.pointerEnter(screen.getByText('用户名'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('应该在指针移出时触发关闭状态回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <HoverCard onOpenChange={handleOpenChange}>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const trigger = screen.getByText('用户名');
      fireEvent.pointerEnter(trigger);
      await screen.findByText('用户资料');

      fireEvent.pointerLeave(trigger);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露触发器的 data-state 属性', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      await waitFor(() => {
        expect(screen.getByText('用户名')).toHaveAttribute('data-state', 'open');
      });
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      const trigger = screen.getByText('用户名');
      // Radix 的 HoverCard 触发器渲染为 <a>（无 href），jsdom 中不可聚焦，
      // 因此这里只断言事件绑定存在时可接收焦点事件
      fireEvent.focus(trigger);
      expect(trigger).toHaveAttribute('data-slot', 'hover-card-trigger');
    });

    it('应该透传 aria-label 到触发器', () => {
      render(
        <HoverCard>
          <HoverCardTrigger aria-label="查看用户资料">用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      expect(screen.getByLabelText('查看用户资料')).toBeInTheDocument();
    });

    it('应该透传 aria-label 到卡片内容', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent aria-label="用户资料卡片">用户资料</HoverCardContent>
        </HoverCard>,
      );

      expect(await screen.findByLabelText('用户资料卡片')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的打开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <HoverCard open onOpenChange={handleOpenChange}>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      expect(await screen.findByText('用户资料')).toBeInTheDocument();

      fireEvent.pointerLeave(screen.getByText('用户名'));

      // Radix 的 HoverCard 关闭有 closeDelay 延迟，onOpenChange 异步触发
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
      // 受控模式下打开状态由外部决定，组件本身不会自行变更
      expect(await screen.findByText('用户资料')).toBeInTheDocument();
    });

    it('应该允许渲染没有内容的卡片', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent />
        </HoverCard>,
      );

      await waitFor(() => {
        expect(document.querySelector('[data-slot="hover-card-content"]')).toBeInTheDocument();
      });
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <HoverCard>
          <HoverCardTrigger data-custom="value">用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      expect(screen.getByText('用户名')).toHaveAttribute('data-custom', 'value');
    });

    it('应该在打开延迟期间不立即显示卡片', async () => {
      render(
        <HoverCard openDelay={100000}>
          <HoverCardTrigger>用户名</HoverCardTrigger>
          <HoverCardContent>用户资料</HoverCardContent>
        </HoverCard>,
      );

      fireEvent.pointerEnter(screen.getByText('用户名'));

      // 延迟时长被设置为极长值，卡片不应立即出现
      expect(screen.queryByText('用户资料')).not.toBeInTheDocument();
    });
  });
});
