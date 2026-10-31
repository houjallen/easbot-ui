import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { vi } from 'vitest';

describe('Tooltip 组件', () => {
  // 基础渲染测试
  test('应正确渲染基础功能', async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>触发按钮</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button');
    // Radix Tooltip v1.4 通过 onPointerMove 触发打开（而非 mouseover）
    fireEvent.pointerMove(trigger, { pointerType: 'mouse' });

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('提示内容');
    });
  });

  // 无障碍测试
  test('应有正确的ARIA属性', async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>触发按钮</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button');
    fireEvent.pointerMove(trigger, { pointerType: 'mouse' });

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      // Radix Tooltip v1.4 通过 role="tooltip" + 触发器 aria-describedby 关联
      expect(tooltip).toHaveAttribute('role', 'tooltip');
      expect(tooltip.id).toBeTruthy();
      expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    });
  });

  // 交互测试
  test('应响应鼠标悬停事件', async () => {
    render(
      // disableHoverableContent：指针离开触发器时立即关闭（否则 Radix 会保留可悬停内容）
      <TooltipProvider delayDuration={0}>
        <Tooltip disableHoverableContent>
          <TooltipTrigger>触发按钮</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button');
    fireEvent.pointerMove(trigger, { pointerType: 'mouse' });

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible();
    });

    // Radix Tooltip 通过 onPointerLeave 关闭
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // 延迟显示测试
  test('应支持延迟显示', async () => {
    vi.useFakeTimers();

    try {
      render(
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TooltipTrigger>触发按钮</TooltipTrigger>
            <TooltipContent>延迟提示</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      const trigger = screen.getByRole('button');
      fireEvent.pointerMove(trigger, { pointerType: 'mouse' });

      // 立即检查应不可见
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // 快进 500ms（需在 act 内推进，避免 React 状态更新未刷新）
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(screen.getByRole('tooltip')).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });
});
