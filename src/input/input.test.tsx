/**
 * Input 组件测试
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';
import { Search } from 'lucide-react';
import { vi } from 'vitest';

describe('Input 组件', () => {
  // 渲染测试
  it('正确渲染输入框', () => {
    render(<Input placeholder="请输入" />);
    expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument();
  });

  // 变体样式测试
  it('正确应用变体样式', () => {
    render(<Input variant="error" />);
    const input = screen.getByRole('textbox');
    // Tailwind v4：语义类已替换为 CSS 变量任意值
    expect(input).toHaveClass('border-[var(--form-input-error-border)]');
  });

  // 尺寸测试
  it('正确应用尺寸样式', () => {
    render(<Input size="lg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('h-12');
  });

  // 状态测试
  it('正确处理错误状态', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  // 禁用状态测试
  it('正确处理禁用状态', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    // 原生 disabled 属性会隐式阻止交互，组件不额外设置 aria-disabled
    expect(input).not.toHaveAttribute('aria-disabled');
  });

  // 加载状态测试
  it('正确处理加载状态', () => {
    render(<Input loading />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-busy', 'true');
  });

  // 前缀图标测试
  it('正确渲染前缀图标', () => {
    render(<Input prefix={<Search data-testid="prefix-icon" />} placeholder="搜索" />);
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('搜索');
    expect(input).toHaveClass('pl-8');
  });

  // 后缀图标测试
  it('正确渲染后缀图标', () => {
    render(<Input suffix={<Search data-testid="suffix-icon" />} placeholder="搜索" />);
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('搜索');
    expect(input).toHaveClass('pr-8');
  });

  // 值变更测试
  it('正确处理值变更', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test');
  });

  // 焦点测试
  it('正确处理焦点事件', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  // 类名测试
  it('正确应用自定义类名', () => {
    render(<Input className="custom-class" wrapperClassName="wrapper-class" prefix={<Search />} />);
    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('wrapper-class');
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  // 可访问性测试
  it('包含正确的ARIA属性', () => {
    render(<Input error disabled loading aria-label="测试输入框" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(input).toHaveAttribute('aria-label', '测试输入框');
  });

  // 新增组合状态测试
  describe('组合状态测试', () => {
    it('正确处理错误+禁用状态', () => {
      render(<Input error disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toBeDisabled();
    });

    it('正确处理加载+成功状态', () => {
      render(<Input loading success />);
      const input = screen.getByRole('textbox');
      // Tailwind v4：语义类已替换为 CSS 变量任意值
      expect(input).toHaveClass('border-[var(--form-input-success-border)]');
      expect(input).toBeDisabled();
    });
  });

  // 新增图标尺寸测试
  describe('图标尺寸测试', () => {
    it('正确应用自定义图标尺寸', () => {
      render(<Input prefix={<Search data-testid="prefix-icon" />} iconSize="1.5rem" />);
      const icon = screen.getByTestId('prefix-icon').parentElement;
      // 注意：jsdom 会把 calc(1.5rem + 0.5rem) 归一化为具体像素值（1rem = 16px）
      expect(icon).toHaveStyle({ width: '32px' });
      expect(icon).toHaveStyle({ height: '32px' });
    });
  });

  // 新增焦点样式测试
  it('正确显示焦点样式', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    // Tailwind v4：焦点态使用 focus:* 变体类（边框与背景色切换），而非 focus-visible:ring-2
    expect(input).toHaveClass('focus:border-[var(--form-input-focus-border)]');
    expect(input).toHaveClass('focus:bg-[var(--form-input-focus-bg)]');
  });

  // 新增测试用例
  describe('样式变体测试', () => {
    it('正确应用成功状态样式', () => {
      render(<Input success />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-[var(--form-input-success-border)]');
    });

    it('正确应用过渡动画', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('transition-colors');
    });

    it('禁用过渡动画', () => {
      render(<Input transition={false} />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('transition-colors');
    });
  });
});
