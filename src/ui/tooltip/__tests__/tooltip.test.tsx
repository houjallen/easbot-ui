import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';

/**
 * Tooltip 组件测试
 *
 * @description
 * Tooltip 由 `hover` 事件触发（Radix `Tooltip.Trigger` 监听 `pointermove`），
 * 因此统一使用 `@testing-library/user-event` 的 `user.hover` / `user.unhover` 展开与收起浮层。
 *
 * 说明：
 * - Radix 的 TooltipContent **不会**输出 `aria-live` / `aria-hidden`，
 *   无障碍断言改用 `role="tooltip"` 与触发器的 `aria-describedby` 关联关系；
 * - 内置 `Tooltip` 组件内部自带 `TooltipProvider`（`delayDuration = 0`），
 *   因此延迟时长需通过 `Tooltip` 根组件的 `delayDuration` 属性设置。
 */
describe('Tooltip 组件', () => {
  // 基础渲染测试
  test('应正确渲染基础功能', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>触发按钮</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button');
    await user.hover(trigger);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('提示内容');
  });

  // 无障碍测试
  test('应有正确的ARIA属性', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>触发按钮</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button');
    await user.hover(trigger);

    const tooltip = await screen.findByRole('tooltip');
    // 浮层展开后，触发器通过 `aria-describedby` 关联到浮层内容
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  // 交互测试
  test('应响应鼠标悬停事件', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>触发按钮</TooltipTrigger>
          <TooltipContent>提示内容</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button');
    await user.hover(trigger);

    expect(await screen.findByRole('tooltip')).toBeVisible();

    // 移出触发器后，Radix 会建立一个「过渡区域」，
    // 需要把指针真正移到浮层区域之外才会关闭浮层
    await user.unhover(trigger);
    await user.pointer([{ target: document.body, coords: { clientX: 900, clientY: 900 } }]);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // 延迟显示测试
  test('应支持延迟显示', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger>触发按钮</TooltipTrigger>
          <TooltipContent>延迟提示</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button');
    await user.hover(trigger);

    // 延迟未到期前不应出现浮层
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // 等待延迟时长后浮层出现
    expect(await screen.findByRole('tooltip', {}, { timeout: 2000 })).toHaveTextContent('延迟提示');
  });
});
