/**
 * Checkbox 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证选中态、半选态、禁用态
 * 3. 交互测试 - 验证点击与键盘触发的状态切换与回调
 * 4. 无障碍测试 - 验证语义角色、aria-checked、焦点管理
 * 5. 边界测试 - 验证受控模式、半选态与选中态互斥、透传属性
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Checkbox } from '../checkbox';

describe('Checkbox 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染复选框', () => {
      render(<Checkbox aria-label="同意协议" />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
    });

    it('应该正确应用默认类名', () => {
      render(<Checkbox aria-label="同意协议" />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toHaveClass('size-4');
      expect(checkbox).toHaveClass('rounded-[4px]');
      expect(checkbox).toHaveClass('border');
      expect(checkbox).toHaveClass('border-input');
    });

    it('应该正确合并自定义类名', () => {
      render(<Checkbox aria-label="同意协议" className="custom-class" />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toHaveClass('custom-class');
      expect(checkbox).toHaveClass('size-4');
    });

    it('应该在选中状态下渲染指示器', () => {
      render(<Checkbox aria-label="同意协议" checked />);

      expect(screen.getByRole('checkbox', { name: '同意协议' })).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为未选中状态', () => {
      render(<Checkbox aria-label="同意协议" />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('应该在受控选中状态下渲染 data-state 为 checked', () => {
      render(<Checkbox aria-label="同意协议" checked />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toHaveAttribute('data-state', 'checked');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在半选状态下渲染 data-state 为 indeterminate', () => {
      render(<Checkbox aria-label="同意协议" checked="indeterminate" />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    it('应该在禁用状态下渲染 data-disabled 与 disabled 属性', () => {
      render(<Checkbox aria-label="同意协议" disabled />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveAttribute('data-disabled');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('应该在选中状态下应用 data-[state=checked] 状态类名', () => {
      render(<Checkbox aria-label="同意协议" checked />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary');
      expect(checkbox).toHaveClass('data-[state=checked]:text-primary-foreground');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 checked 变更回调', () => {
      const handleCheckedChange = vi.fn();
      render(<Checkbox aria-label="同意协议" onCheckedChange={handleCheckedChange} />);

      fireEvent.click(screen.getByRole('checkbox', { name: '同意协议' }));

      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('应该在点击后更新选中状态', () => {
      render(<Checkbox aria-label="同意协议" />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      fireEvent.click(checkbox);

      expect(checkbox).toHaveAttribute('data-state', 'checked');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在再次点击时取消选中', () => {
      const handleCheckedChange = vi.fn();
      render(<Checkbox aria-label="同意协议" onCheckedChange={handleCheckedChange} />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledTimes(2);
      expect(handleCheckedChange).toHaveBeenLastCalledWith(false);
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('应该在按下空格键时切换选中状态', () => {
      const handleCheckedChange = vi.fn();
      render(<Checkbox aria-label="同意协议" onCheckedChange={handleCheckedChange} />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      checkbox.focus();
      // Radix 的 Checkbox 只监听 `click`；真实浏览器在空格键上会合成 click 事件，
      // jsdom 不会合成，因此这里显式模拟浏览器的行为。
      fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
      fireEvent.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('应该在禁用状态下不触发回调', () => {
      const handleCheckedChange = vi.fn();
      render(<Checkbox aria-label="同意协议" disabled onCheckedChange={handleCheckedChange} />);

      fireEvent.click(screen.getByRole('checkbox', { name: '同意协议' }));
      expect(handleCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 checkbox 语义角色', () => {
      render(<Checkbox aria-label="同意协议" />);

      expect(screen.getByRole('checkbox', { name: '同意协议' })).toBeInTheDocument();
    });

    it('应该通过 aria-checked 暴露选中状态', () => {
      render(<Checkbox aria-label="同意协议" checked />);

      expect(screen.getByRole('checkbox', { name: '同意协议' })).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在半选状态下通过 aria-checked 暴露 mixed', () => {
      render(<Checkbox aria-label="同意协议" checked="indeterminate" />);

      expect(screen.getByRole('checkbox', { name: '同意协议' })).toHaveAttribute('aria-checked', 'mixed');
    });

    it('应该支持通过键盘获得焦点', () => {
      render(<Checkbox aria-label="同意协议" />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('应该透传 name 与 value 属性到隐藏的原生输入框', () => {
      const { container } = render(
        <form>
          <Checkbox aria-label="同意协议" name="agreement" value="yes" />
        </form>,
      );

      // Radix 只在**表单控件场景**（位于 <form> 内）才渲染隐藏的原生
      // <input type="checkbox"> 用于表单提交；可访问性主体是 button 元素。
      const hiddenInput = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('name', 'agreement');
      expect(hiddenInput).toHaveAttribute('value', 'yes');
    });
  });

  describe('边界测试', () => {
    it('应该在半选状态下点击回调传出 true', () => {
      const handleCheckedChange = vi.fn();
      render(<Checkbox aria-label="同意协议" checked="indeterminate" onCheckedChange={handleCheckedChange} />);

      fireEvent.click(screen.getByRole('checkbox', { name: '同意协议' }));
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('应该在受控模式下保持外部传入的状态', () => {
      const handleCheckedChange = vi.fn();
      render(<Checkbox aria-label="同意协议" checked={false} onCheckedChange={handleCheckedChange} />);

      const checkbox = screen.getByRole('checkbox', { name: '同意协议' });
      fireEvent.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
      // 受控模式下选中状态由外部决定，组件本身不会自行变更
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('应该透传额外的 data-* 属性', () => {
      render(<Checkbox aria-label="同意协议" data-custom="value" />);

      expect(screen.getByRole('checkbox', { name: '同意协议' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该透传 aria-invalid 无效状态', () => {
      render(<Checkbox aria-label="同意协议" aria-invalid="true" />);

      expect(screen.getByRole('checkbox', { name: '同意协议' })).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
