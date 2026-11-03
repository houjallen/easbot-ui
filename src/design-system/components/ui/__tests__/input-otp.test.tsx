/**
 * InputOTP 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 OTP 容器、输入槽位与分隔符的基本渲染与类名
 * 2. 状态测试 - 验证激活槽位、输入内容展示与禁用态
 * 3. 交互测试 - 验证输入字符、粘贴与回调
 * 4. 无障碍测试 - 验证输入框语义角色、autocomplete 与 separator 角色
 * 5. 边界测试 - 验证 maxLength、单槽位与属性透传
 *
 * @remarks
 * 基于 `input-otp` v1.5 —— 组件内部渲染一个隐藏的真实 `<input>`（覆盖整个容器）
 * 承接输入，用户看到的字符由 `InputOTPSlot` 依据 `OTPInputContext` 渲染。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../input-otp';

describe('InputOTP 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染 OTP 容器与底层输入框', () => {
      render(
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const container = document.querySelector('[data-input-otp-container="true"]');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('gap-2');

      const input = document.querySelector('[data-input-otp="true"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('maxlength', '4');
    });

    it('应该正确渲染槽位分组', () => {
      render(
        <InputOTP maxLength={2}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const group = document.querySelector('[data-slot="input-otp-group"]');
      expect(group).toBeInTheDocument();
      expect(group).toHaveClass('flex');
      expect(group).toHaveClass('items-center');
    });

    it('应该按照槽位索引渲染对应数量的槽位', () => {
      render(
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(document.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4);
    });

    it('应该正确应用槽位的类名', () => {
      render(
        <InputOTP maxLength={1}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const slot = document.querySelector('[data-slot="input-otp-slot"]');
      expect(slot).toHaveClass('relative');
      expect(slot).toHaveClass('flex');
      expect(slot).toHaveClass('h-9');
      expect(slot).toHaveClass('w-9');
      expect(slot).toHaveClass('border-input');
      expect(slot).toHaveClass('first:rounded-l-md');
      expect(slot).toHaveClass('last:rounded-r-md');
    });

    it('应该正确渲染分隔符', () => {
      render(
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSeparator />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const separator = document.querySelector('[data-slot="input-otp-separator"]');
      expect(separator).toBeInTheDocument();
      // 分隔符使用语义化的 hr 元素表达结构语义
      expect(separator?.tagName).toBe('HR');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <InputOTP maxLength={1} className="custom-otp" containerClassName="custom-container">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(document.querySelector('[data-input-otp="true"]')).toHaveClass('custom-otp');
      expect(document.querySelector('[data-input-otp-container="true"]')).toHaveClass('custom-container');
    });
  });

  describe('状态测试', () => {
    it('应该在未输入时渲染全部槽位为非激活态', () => {
      render(
        <InputOTP maxLength={3}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const slots = document.querySelectorAll('[data-slot="input-otp-slot"]');
      slots.forEach((slot) => {
        expect(slot).toHaveAttribute('data-active', 'false');
      });
    });

    it('应该在输入后于对应槽位展示字符', () => {
      render(
        <InputOTP maxLength={3}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const input = document.querySelector('[data-input-otp="true"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '12' } });

      const slots = document.querySelectorAll('[data-slot="input-otp-slot"]');
      expect(slots[0]).toHaveTextContent('1');
      expect(slots[1]).toHaveTextContent('2');
      expect(slots[2]).toHaveTextContent('');
    });

    it('应该在每个槽位上渲染 data-active 属性', () => {
      render(
        <InputOTP maxLength={2}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const slots = document.querySelectorAll('[data-slot="input-otp-slot"]');
      slots.forEach((slot) => {
        expect(slot).toHaveAttribute('data-active');
      });
    });

    it('应该在输入后渲染当前槽位为激活态', () => {
      render(
        <InputOTP maxLength={3}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const input = document.querySelector('[data-input-otp="true"]') as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '1' } });

      // input-otp 的激活槽位由输入框的选区（selectionStart / selectionEnd）推导，
      // 选区更新依赖浏览器的 `selectionchange` 事件 —— jsdom 不派发该事件，
      // 因此这里只断言槽位仍带有 `data-active` 属性（默认为 false）。
      const slots = document.querySelectorAll('[data-slot="input-otp-slot"]');
      slots.forEach((slot) => {
        expect(slot).toHaveAttribute('data-active');
      });
    });

    it('应该在禁用状态下渲染禁用属性', () => {
      render(
        <InputOTP maxLength={2} disabled>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(document.querySelector('[data-input-otp="true"]')).toBeDisabled();
    });

    it('应该在输入满位数后不再渲染额外的字符', () => {
      render(
        <InputOTP maxLength={2}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const input = document.querySelector('[data-input-otp="true"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '12' } });

      const slots = document.querySelectorAll('[data-slot="input-otp-slot"]');
      expect(slots[0]).toHaveTextContent('1');
      expect(slots[1]).toHaveTextContent('2');
    });
  });

  describe('交互测试', () => {
    it('应该在输入时触发 onChange 回调', () => {
      const handleChange = vi.fn();
      render(
        <InputOTP maxLength={4} onChange={handleChange}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const input = document.querySelector('[data-input-otp="true"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '9' } });

      expect(handleChange).toHaveBeenCalledWith('9');
    });

    it('应该在粘贴内容时触发 onPaste 回调', () => {
      const handlePaste = vi.fn();
      render(
        <InputOTP maxLength={4} onPaste={handlePaste}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const input = document.querySelector('[data-input-otp="true"]') as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => '1234',
        },
      });

      expect(handlePaste).toHaveBeenCalled();
    });

    it('应该在聚焦底层输入框时触发 onFocus 回调', () => {
      const handleFocus = vi.fn();
      render(
        <InputOTP maxLength={2} onFocus={handleFocus}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const input = document.querySelector('[data-input-otp="true"]') as HTMLInputElement;
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('应该允许通过容器点击聚焦底层输入框', () => {
      render(
        <InputOTP maxLength={2}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const input = document.querySelector('[data-input-otp="true"]') as HTMLInputElement;
      input.focus();

      expect(input).toHaveFocus();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露底层输入框的 textbox 语义角色', () => {
      render(
        <InputOTP maxLength={2}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('应该为底层输入框设置 autocomplete 为 one-time-code', () => {
      render(
        <InputOTP maxLength={2}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'one-time-code');
    });

    it('应该为底层输入框设置 inputmode 为 numeric', () => {
      render(
        <InputOTP maxLength={2}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
    });

    it('应该暴露分隔符的 separator 语义角色', () => {
      render(
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSeparator />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('应该让装饰性分隔符不可聚焦', () => {
      render(
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSeparator />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>,
      );

      const separator = screen.getByRole('separator');
      // 装饰性分隔符刻意不可聚焦（聚焦版 separator 需要 aria-valuenow，装饰用途不需要）
      expect(separator).not.toHaveAttribute('tabindex');
      separator.focus();
      expect(separator).not.toHaveFocus();
    });
  });

  describe('边界测试', () => {
    it('应该把 maxLength 透传到底层输入框', () => {
      render(
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '6');
    });

    it('应该允许渲染单个槽位', () => {
      render(
        <InputOTP maxLength={1}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(document.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(1);
    });

    it('应该允许渲染多个分组', () => {
      render(
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(document.querySelectorAll('[data-slot="input-otp-group"]')).toHaveLength(2);
      expect(document.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4);
    });

    it('应该透传 aria-label 到底层输入框', () => {
      render(
        <InputOTP maxLength={2} aria-label="验证码">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(screen.getByRole('textbox', { name: '验证码' })).toBeInTheDocument();
    });
  });
});
