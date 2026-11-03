/**
 * Textarea 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与基础类名
 * 2. 状态测试 - 验证禁用态与无效态属性
 * 3. 交互测试 - 验证输入、聚焦与变更回调
 * 4. 无障碍测试 - 验证语义角色、可访问名称与属性透传
 * 5. 边界测试 - 验证空值、只读态与 className 合并
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Textarea } from '../textarea';

describe('Textarea 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染多行文本框', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('data-slot', 'textarea');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('应该正确应用基础类名', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('flex');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('border-input');
    });

    it('应该正确应用 focus-visible 焦点环类名', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('focus-visible:border-ring');
      expect(textarea).toHaveClass('focus-visible:ring-[3px]');
    });

    it('应该正确合并自定义类名', () => {
      render(<Textarea className="custom-textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
      expect(textarea).toHaveClass('w-full');
    });
  });

  describe('状态测试', () => {
    it('应该正确渲染禁用状态', () => {
      render(<Textarea disabled />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('应该正确渲染无效状态', () => {
      render(<Textarea aria-invalid="true" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('应该正确渲染只读状态', () => {
      render(<Textarea readOnly value="只读内容" onChange={() => undefined} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
      expect(textarea).toHaveValue('只读内容');
    });
  });

  describe('交互测试', () => {
    it('应该在输入时触发 onChange 回调', () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: '多行内容' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('应该在聚焦时触发 onFocus 回调', () => {
      const handleFocus = vi.fn();
      render(<Textarea onFocus={handleFocus} />);

      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('应该在失焦时触发 onBlur 回调', () => {
      const handleBlur = vi.fn();
      render(<Textarea onBlur={handleBlur} />);

      fireEvent.blur(screen.getByRole('textbox'));
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('应该在获得焦点时持有焦点', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();
      expect(textarea).toHaveFocus();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 textbox 语义角色', () => {
      render(<Textarea />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('应该通过 aria-label 提供可访问名称', () => {
      render(<Textarea aria-label="备注" />);

      expect(screen.getByRole('textbox', { name: '备注' })).toBeInTheDocument();
    });

    it('应该透传 placeholder 属性', () => {
      render(<Textarea placeholder="请输入备注" />);

      expect(screen.getByPlaceholderText('请输入备注')).toBeInTheDocument();
    });

    it('应该透传 name 属性', () => {
      render(<Textarea name="remark" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'remark');
    });
  });

  describe('边界测试', () => {
    it('应该允许空值输入', () => {
      render(<Textarea value="" onChange={() => undefined} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('应该允许渲染不带任何属性的文本框', () => {
      render(<Textarea />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性', () => {
      render(<Textarea data-custom="value" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('data-custom', 'value');
    });
  });
});
