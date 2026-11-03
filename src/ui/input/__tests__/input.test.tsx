/**
 * Input 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证输入框的基本渲染与自定义类名
 * 2. 状态测试 - 验证错误 / 成功 / 加载 / 禁用状态的类名与属性
 * 3. 交互测试 - 验证值变更与焦点事件
 * 4. 无障碍测试 - 验证 aria 属性与前后缀图标
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { Search } from 'lucide-react';
import { describe, it, vi } from 'vitest';

import { Input } from '../input';

describe('Input 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('正确渲染输入框', () => {
      render(<Input placeholder="请输入" />);
      expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument();
    });

    it('正确应用尺寸样式', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('w-full');
    });

    it('正确应用自定义类名', () => {
      render(<Input className="custom-class" wrapperClassName="wrapper-class" prefix={<Search />} />);
      const wrapper = screen.getByRole('textbox').parentElement;
      expect(wrapper).toHaveClass('wrapper-class');
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('正确应用过渡动画', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveClass('transition-[color,box-shadow]');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('正确应用错误状态样式', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-[var(--destructive)]');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('正确应用成功状态样式', () => {
      render(<Input success />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-[var(--success)]');
    });

    it('正确处理禁用状态', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('disabled');
    });

    it('正确处理加载状态', () => {
      render(<Input loading />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-busy', 'true');
    });

    it('正确处理错误+禁用状态', () => {
      render(<Input error disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toBeDisabled();
    });

    it('正确处理加载+成功状态', () => {
      render(<Input loading success />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-[var(--success)]');
      expect(input).toBeDisabled();
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('正确处理值变更', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

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

    it('正确显示焦点样式', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:ring-[3px]');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('包含正确的ARIA属性', () => {
      render(<Input error disabled loading aria-label="测试输入框" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-busy', 'true');
      expect(input).toHaveAttribute('aria-label', '测试输入框');
    });

    it('正确渲染前缀图标并调整内边距', () => {
      render(<Input prefix={<Search data-testid="prefix-icon" />} placeholder="搜索" />);
      expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('搜索')).toHaveClass('pl-10');
    });

    it('正确渲染后缀图标并调整内边距', () => {
      render(<Input suffix={<Search data-testid="suffix-icon" />} placeholder="搜索" />);
      expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('搜索')).toHaveClass('pr-10');
    });

    it('正确应用自定义图标尺寸', () => {
      render(<Input prefix={<Search data-testid="prefix-icon" />} iconSize="1.5rem" />);
      const icon = screen.getByTestId('prefix-icon');
      // jsdom 不解析 rem 单位的 width / height，因此断言内联样式字符串
      expect(icon.getAttribute('style')).toContain('font-size: 1.5rem');
      expect(icon.getAttribute('style')).toContain('width: 1.5rem');
      expect(icon.getAttribute('style')).toContain('height: 1.5rem');
    });
  });
});
