/**
 * RadioGroup 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证选中态、禁用态
 * 3. 交互测试 - 验证点击与键盘方向键触发的选择与回调
 * 4. 无障碍测试 - 验证 radio 语义角色、aria-checked、焦点管理
 * 5. 边界测试 - 验证受控模式、单选互斥、透传属性
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { RadioGroup, RadioGroupItem } from '../radio-group';

describe('RadioGroup 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染单选组与选项', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radiogroup', { name: '颜色选择' })).toHaveAttribute('data-slot', 'radio-group');
      expect(screen.getByRole('radio', { name: '红色' })).toHaveAttribute('data-slot', 'radio-group-item');
    });

    it('应该正确应用默认类名', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      expect(item).toHaveClass('size-4');
      expect(item).toHaveClass('rounded-full');
      expect(item).toHaveClass('border');
      expect(item).toHaveClass('border-input');
      expect(item).toHaveClass('text-primary');
    });

    it('应该正确渲染选中指示器', () => {
      render(
        <RadioGroup value="red" aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      expect(item.querySelector('[data-slot="radio-group-indicator"]')).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" className="custom-class" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      expect(item).toHaveClass('custom-class');
      expect(item).toHaveClass('size-4');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为未选中状态', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      expect(item).toHaveAttribute('data-state', 'unchecked');
      expect(item).toHaveAttribute('aria-checked', 'false');
    });

    it('应该在受控选中状态下渲染 data-state 为 checked', () => {
      render(
        <RadioGroup value="red" aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      expect(item).toHaveAttribute('data-state', 'checked');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在禁用选项上渲染 data-disabled 与 disabled 属性', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" disabled />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      expect(item).toBeDisabled();
      expect(item).toHaveAttribute('data-disabled');
      expect(item).toHaveAttribute('aria-checked', 'false');
    });

    it('应该在整组禁用时禁用所有选项', () => {
      render(
        <RadioGroup disabled aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
          <RadioGroupItem value="blue" aria-label="蓝色" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radio', { name: '红色' })).toBeDisabled();
      expect(screen.getByRole('radio', { name: '蓝色' })).toBeDisabled();
    });
  });

  describe('交互测试', () => {
    it('应该在点击选项时触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleValueChange} aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      fireEvent.click(screen.getByRole('radio', { name: '红色' }));

      expect(handleValueChange).toHaveBeenCalledTimes(1);
      expect(handleValueChange).toHaveBeenCalledWith('red');
    });

    it('应该在点击后更新选项的选中状态', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      fireEvent.click(item);

      expect(item).toHaveAttribute('data-state', 'checked');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在单选组内保持互斥选中', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
          <RadioGroupItem value="blue" aria-label="蓝色" />
        </RadioGroup>,
      );

      const red = screen.getByRole('radio', { name: '红色' });
      const blue = screen.getByRole('radio', { name: '蓝色' });

      fireEvent.click(red);
      expect(red).toHaveAttribute('data-state', 'checked');
      expect(blue).toHaveAttribute('data-state', 'unchecked');

      fireEvent.click(blue);
      expect(red).toHaveAttribute('data-state', 'unchecked');
      expect(blue).toHaveAttribute('data-state', 'checked');
    });

    it('应该在按下方向下键时移动选中项', async () => {
      const handleValueChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleValueChange} aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
          <RadioGroupItem value="blue" aria-label="蓝色" />
        </RadioGroup>,
      );

      const red = screen.getByRole('radio', { name: '红色' });
      red.focus();
      fireEvent.keyDown(red, { key: 'ArrowDown' });

      // Radix 的 roving focus 通过 setTimeout 异步移动焦点，
      // 焦点落位后触发 RadioGroup 的选中逻辑 → onValueChange
      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('blue');
      });
    });

    it('应该在禁用选项上不触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleValueChange} aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" disabled />
        </RadioGroup>,
      );

      fireEvent.click(screen.getByRole('radio', { name: '红色' }));
      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 radiogroup 语义角色', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radiogroup', { name: '颜色选择' })).toBeInTheDocument();
    });

    it('应该暴露 radio 语义角色', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radio', { name: '红色' })).toBeInTheDocument();
    });

    it('应该通过 aria-checked 暴露选项的选中状态', () => {
      render(
        <RadioGroup value="red" aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radio', { name: '红色' })).toHaveAttribute('aria-checked', 'true');
    });

    it('应该支持选项通过键盘获得焦点', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio', { name: '红色' });
      item.focus();
      expect(item).toHaveFocus();
    });

    it('应该透传 aria-label 到选项', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radio', { name: '红色' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的选中值', () => {
      const handleValueChange = vi.fn();
      render(
        <RadioGroup value="red" onValueChange={handleValueChange} aria-label="颜色选择">
          <RadioGroupItem value="blue" aria-label="蓝色" />
        </RadioGroup>,
      );

      const blue = screen.getByRole('radio', { name: '蓝色' });
      fireEvent.click(blue);

      expect(handleValueChange).toHaveBeenCalledWith('blue');
      // 受控模式下选中值由外部决定，组件本身不会自行变更
      expect(blue).toHaveAttribute('data-state', 'unchecked');
    });

    it('应该允许渲染没有选项的单选组', () => {
      render(<RadioGroup aria-label="空组" />);

      expect(screen.getByRole('radiogroup', { name: '空组' })).toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性到选项', () => {
      render(
        <RadioGroup aria-label="颜色选择">
          <RadioGroupItem value="red" aria-label="红色" data-custom="value" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radio', { name: '红色' })).toHaveAttribute('data-custom', 'value');
    });
  });
});
