import { render, screen } from '@testing-library/react';
import { Textarea } from '../textarea';
import '@testing-library/jest-dom';

describe('Textarea 组件', () => {
  test('应正确渲染基础功能', () => {
    render(<Textarea placeholder="测试输入框" />);
    expect(screen.getByPlaceholderText('测试输入框')).toBeInTheDocument();
  });

  test('应支持禁用状态', () => {
    const { container } = render(<Textarea disabled />);
    expect(container.querySelector('textarea')).toBeDisabled();
  });

  test('应应用自定义类名', () => {
    const { container } = render(<Textarea className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('应支持最大长度限制', () => {
    render(<Textarea maxLength={50} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '50');
  });
});
