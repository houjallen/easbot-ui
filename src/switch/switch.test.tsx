import { render, fireEvent } from '@testing-library/react';
import { Switch } from './switch';

describe('Switch 组件', () => {
  test('应正确切换状态', () => {
    let checked = false;
    const { container } = render(<Switch checked={checked} onCheckedChange={(val) => (checked = val)} />);

    const switchElement = container.querySelector('button');
    fireEvent.click(switchElement!);
    expect(checked).toBe(true);
  });

  test('应禁用交互', () => {
    const { container } = render(<Switch disabled />);
    const switchElement = container.querySelector('button');
    expect(switchElement).toBeDisabled();
  });

  test('应应用自定义类名', () => {
    const { container } = render(<Switch className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('应支持无障碍属性', () => {
    const { container } = render(<Switch aria-label="切换开关" />);
    expect(container.querySelector('[aria-label="切换开关"]')).toBeInTheDocument();
  });
});
