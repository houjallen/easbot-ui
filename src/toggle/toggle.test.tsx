import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './toggle';

describe('Toggle 组件', () => {
  test('应正确切换状态', () => {
    const { container } = render(<Toggle>测试</Toggle>);
    const button = container.firstChild;
    fireEvent.click(button!);
    expect(button).toHaveAttribute('data-state', 'on');
  });

  test('应支持禁用状态', () => {
    render(<Toggle disabled>禁用</Toggle>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
