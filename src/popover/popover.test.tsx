import { render, screen, fireEvent } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Button } from '../button';

describe('Popover 组件', () => {
  test('应正确显示/隐藏内容', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>触发按钮</Button>
        </PopoverTrigger>
        <PopoverContent data-testid="content">测试内容</PopoverContent>
      </Popover>,
    );

    const button = screen.getByText('触发按钮');
    fireEvent.click(button);
    expect(await screen.findByTestId('content')).toBeVisible();
  });

  test('应处理禁用状态', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button disabled>禁用按钮</Button>
        </PopoverTrigger>
        <PopoverContent>不可见内容</PopoverContent>
      </Popover>,
    );

    const button = screen.getByText('禁用按钮');
    fireEvent.click(button);
    expect(screen.queryByText('不可见内容')).not.toBeInTheDocument();
  });
});
