/**
 * Input 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与基础类名
 * 2. 状态测试 - 验证禁用态与无效态属性
 * 3. 交互测试 - 验证输入、聚焦与变更回调
 * 4. 无障碍测试 - 验证语义角色、可访问名称与属性透传
 * 5. 边界测试 - 验证空值、缺省 type、只读态与 className 合并
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Input } from '../input';

describe('Input 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染输入框', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('应该正确应用基础类名', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('border-input');
    });

    it('应该正确应用 focus-visible 焦点环类名', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:border-ring');
      expect(input).toHaveClass('focus-visible:ring-[3px]');
    });

    it('应该正确合并自定义类名', () => {
      render(<Input className="custom-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass('w-full');
    });
  });

  describe('状态测试', () => {
    it('应该正确渲染禁用状态', () => {
      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('应该正确渲染无效状态', () => {
      render(<Input aria-invalid="true" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('应该正确渲染只读状态', () => {
      render(<Input readOnly value="只读内容" onChange={() => undefined} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('只读内容');
    });
  });

  describe('交互测试', () => {
    it('应该在输入时触发 onChange 回调', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: '输入内容' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('应该在聚焦时触发 onFocus 回调', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('应该在失焦时触发 onBlur 回调', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      fireEvent.blur(screen.getByRole('textbox'));
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('应该在获得焦点时持有焦点', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 textbox 语义角色', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('应该通过 aria-label 提供可访问名称', () => {
      render(<Input aria-label="用户名" />);

      expect(screen.getByRole('textbox', { name: '用户名' })).toBeInTheDocument();
    });

    it('应该透传 placeholder 属性', () => {
      render(<Input placeholder="请输入内容" />);

      expect(screen.getByPlaceholderText('请输入内容')).toBeInTheDocument();
    });

    it('应该透传 name 属性', () => {
      render(<Input name="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email');
    });
  });

  describe('边界测试', () => {
    it('应该在缺省 type 时不设置 type 属性', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).not.toHaveAttribute('type');
    });

    it('应该正确渲染 password 类型的输入框', () => {
      render(<Input type="password" />);

      // password 类型在无障碍树中不暴露 textbox 角色，只能通过选择器定位
      const input = document.querySelector('[data-slot="input"]');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('应该允许空值输入', () => {
      render(<Input value="" onChange={() => undefined} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('应该允许渲染不带任何属性的输入框', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
