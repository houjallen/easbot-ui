import { render, screen, fireEvent } from '@testing-library/react';
import { Sheet, SheetTrigger, SheetContent } from './sheet';
import { Button } from '../button';

describe('Sheet 组件', () => {
  test('应正确打开和关闭抽屉', async () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开抽屉</Button>
        </SheetTrigger>
        <SheetContent data-testid="sheet-content" />
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByTestId('sheet-content')).toBeVisible();
  });

  test('应支持不同定位方向', () => {
    // 注意：SheetContent 通过 Radix Portal 渲染，且只有 Sheet 处于打开状态时才会挂载，
    // 因此这里需要显式传入 open 属性
    const { rerender } = render(
      <Sheet open>
        <SheetContent side="left" data-testid="sheet" />
      </Sheet>,
    );
    expect(screen.getByTestId('sheet')).toHaveClass('left-0');

    rerender(
      <Sheet open>
        <SheetContent side="top" data-testid="sheet" />
      </Sheet>,
    );
    expect(screen.getByTestId('sheet')).toHaveClass('top-0');
  });

  test('应应用自定义类名', () => {
    render(
      <Sheet open>
        <SheetContent className="custom-class" data-testid="sheet" />
      </Sheet>,
    );
    expect(screen.getByTestId('sheet')).toHaveClass('custom-class');
  });
});
