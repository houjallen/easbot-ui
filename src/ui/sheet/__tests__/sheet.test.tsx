/**
 * Sheet 组件测试
 *
 * @description
 * Sheet 基于 Radix Dialog 封装，内容通过 portal 渲染到 `document.body`，
 * 只有在打开状态下才会挂载，因此所有断言都需要先触发打开动作。
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { Button } from '../../button';
import { Sheet, SheetContent, SheetTrigger } from '../sheet';

describe('Sheet 组件', () => {
  test('应正确打开和关闭抽屉', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开抽屉</Button>
        </SheetTrigger>
        <SheetContent data-testid="sheet-content" />
      </Sheet>,
    );

    // Radix Dialog 的触发器走 `onPointerDown` 路径，必须用 userEvent 触发
    await user.click(screen.getByRole('button', { name: '打开抽屉' }));

    // 浮层内容渲染到 portal，异步挂载，需用 findBy 查询
    expect(await screen.findByTestId('sheet-content')).toBeVisible();

    // 通过 Esc 关闭抽屉，内容随之卸载
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();
    });
  });

  test('应支持不同定位方向', async () => {
    const user = userEvent.setup();

    // 左侧定位
    const { unmount } = render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开抽屉</Button>
        </SheetTrigger>
        <SheetContent side="left" data-testid="sheet" />
      </Sheet>,
    );

    await user.click(screen.getByRole('button', { name: '打开抽屉' }));
    expect(await screen.findByTestId('sheet')).toHaveClass('left-0');
    unmount();

    // 顶部定位（重新挂载，避免复用已打开的 Radix Dialog 上下文）
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开抽屉</Button>
        </SheetTrigger>
        <SheetContent side="top" data-testid="sheet" />
      </Sheet>,
    );

    await user.click(screen.getByRole('button', { name: '打开抽屉' }));
    expect(await screen.findByTestId('sheet')).toHaveClass('top-0');
  });

  test('应应用自定义类名', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开抽屉</Button>
        </SheetTrigger>
        <SheetContent className="custom-class" data-testid="sheet" />
      </Sheet>,
    );

    await user.click(screen.getByRole('button', { name: '打开抽屉' }));
    expect(await screen.findByTestId('sheet')).toHaveClass('custom-class');
  });
});
