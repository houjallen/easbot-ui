/**
 * ToggleGroup 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能、变体与尺寸类名
 * 2. 状态测试 - 验证选中状态、单选/多选模式
 * 3. 交互测试 - 验证点击触发的状态切换与回调
 * 4. 无障碍测试 - 验证语义角色、选中状态属性、焦点管理
 * 5. 边界测试 - 验证变体/尺寸优先级（上下文 > 单项自身 > cva 默认值）
 *
 * @remarks
 * Radix 的 `ToggleGroup.Root` **强制要求** `type`，且两种模式的**语义角色不同**：
 *
 * | `type`      | 容器角色         | 单项角色        | 状态属性        |
 * | ----------- | ---------------- | --------------- | --------------- |
 * | `single`    | `radiogroup`     | `radio`         | `aria-checked`  |
 * | `multiple`  | `toolbar`        | `button`        | `aria-pressed`  |
 *
 * 此外 `ToggleGroupItem` 必须置于 `ToggleGroup` 内部，否则抛
 * "`ToggleGroupItem` must be used within `ToggleGroup`"。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ToggleGroup, ToggleGroupItem } from '../toggle-group';

describe('ToggleGroup 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染切换组容器与单项', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-slot', 'toggle-group');
      expect(screen.getByRole('radio', { name: '加粗' })).toHaveAttribute('data-slot', 'toggle-group-item');
    });

    it('应该在多选模式下渲染 toolbar 容器与 button 单项', () => {
      render(
        <ToggleGroup type="multiple">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('toolbar')).toHaveAttribute('data-slot', 'toggle-group');
      expect(screen.getByRole('button', { name: '加粗' })).toHaveAttribute('data-slot', 'toggle-group-item');
    });

    it('应该正确应用单项的默认变体与尺寸类名', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveClass('bg-transparent');
      expect(item).toHaveClass('h-9');
      expect(item).toHaveClass('px-2');
    });

    it('应该正确应用单项自身的 outline 变体类名', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" variant="outline">
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveClass('border');
      expect(item).toHaveClass('border-input');
    });

    it('应该正确应用单项自身的 lg 尺寸类名', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" size="lg">
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveClass('h-10');
      expect(item).toHaveClass('min-w-10');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" className="custom-class">
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveClass('custom-class');
      expect(item).toHaveClass('flex-1');
      expect(item).toHaveClass('shrink-0');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为未选中状态', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveAttribute('data-state', 'off');
      expect(item).toHaveAttribute('aria-checked', 'false');
    });

    it('应该在受控选中状态下渲染 data-state 为 on', () => {
      render(
        <ToggleGroup type="single" value="bold">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveAttribute('data-state', 'on');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在禁用单项上渲染 data-disabled 与 disabled 属性', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" disabled>
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toBeDisabled();
      expect(item).toHaveAttribute('data-disabled');
    });

    it('应该在单选模式下只保留一个选中项', () => {
      render(
        <ToggleGroup type="single" value="bold">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
          <ToggleGroupItem value="italic">倾斜</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('radio', { name: '加粗' })).toHaveAttribute('data-state', 'on');
      expect(screen.getByRole('radio', { name: '倾斜' })).toHaveAttribute('data-state', 'off');
    });

    it('应该在多选模式下同时保留多个选中项', () => {
      render(
        <ToggleGroup type="multiple" value={['bold', 'italic']}>
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
          <ToggleGroupItem value="italic">倾斜</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('button', { name: '加粗' })).toHaveAttribute('data-state', 'on');
      expect(screen.getByRole('button', { name: '倾斜' })).toHaveAttribute('data-state', 'on');
    });
  });

  describe('交互测试', () => {
    it('应该在点击单项时触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <ToggleGroup type="single" onValueChange={handleValueChange}>
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      fireEvent.click(screen.getByRole('radio', { name: '加粗' }));

      expect(handleValueChange).toHaveBeenCalledTimes(1);
      expect(handleValueChange).toHaveBeenCalledWith('bold');
    });

    it('应该在多选模式下回调传出数组值', () => {
      const handleValueChange = vi.fn();
      render(
        <ToggleGroup type="multiple" onValueChange={handleValueChange}>
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
          <ToggleGroupItem value="italic">倾斜</ToggleGroupItem>
        </ToggleGroup>,
      );

      fireEvent.click(screen.getByRole('button', { name: '加粗' }));

      expect(handleValueChange).toHaveBeenCalledWith(['bold']);
    });

    it('应该在点击后更新单项的选中状态', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      fireEvent.click(item);

      expect(item).toHaveAttribute('data-state', 'on');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在禁用单项上不触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <ToggleGroup type="single" onValueChange={handleValueChange}>
          <ToggleGroupItem value="bold" disabled>
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      fireEvent.click(screen.getByRole('radio', { name: '加粗' }));
      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 radiogroup 语义角色并支持 aria-label', () => {
      render(
        <ToggleGroup type="single" aria-label="文本格式">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('radiogroup', { name: '文本格式' })).toBeInTheDocument();
    });

    it('应该在单选模式下通过 aria-checked 暴露单项的选中状态', () => {
      render(
        <ToggleGroup type="single" value="bold">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('radio', { name: '加粗' })).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在多选模式下通过 aria-pressed 暴露单项的选中状态', () => {
      render(
        <ToggleGroup type="multiple" value={['bold']}>
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('button', { name: '加粗' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('应该支持单项通过键盘获得焦点', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      item.focus();
      expect(item).toHaveFocus();
    });

    it('应该透传 aria-label 到单项', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" aria-label="加粗文本">
            B
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByRole('radio', { name: '加粗文本' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在 group 上设置 variant 时覆盖单项自身的 variant', () => {
      render(
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="bold" variant="default">
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveAttribute('data-variant', 'outline');
      expect(item).toHaveClass('border-input');
    });

    it('应该在 group 上设置 size 时覆盖单项自身的 size', () => {
      render(
        <ToggleGroup type="single" size="lg">
          <ToggleGroupItem value="bold" size="sm">
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveAttribute('data-size', 'lg');
      expect(item).toHaveClass('h-10');
    });

    it('应该在单项自身设置的值覆盖 cva 默认值', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" size="lg">
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveAttribute('data-size', 'lg');
      expect(item).toHaveClass('h-10');
      expect(item).not.toHaveClass('h-9');
    });

    it('应该在 group 未指定变体时让单项自身的 variant 生效', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" variant="outline" size="sm">
            加粗
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveAttribute('data-variant', 'outline');
      expect(item).toHaveAttribute('data-size', 'sm');
      expect(item).toHaveClass('border-input');
      expect(item).toHaveClass('h-8');
    });

    it('应该在 group 未指定变体时使用 cva 默认值', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold">加粗</ToggleGroupItem>
        </ToggleGroup>,
      );

      const item = screen.getByRole('radio', { name: '加粗' });
      expect(item).toHaveClass('h-9');
      expect(item).toHaveClass('bg-transparent');
    });

    it('应该允许渲染没有 children 的切换组', () => {
      render(<ToggleGroup type="single" aria-label="空组" />);

      expect(screen.getByRole('radiogroup', { name: '空组' })).toBeInTheDocument();
    });

    it('应该在脱离 group 使用单项时抛出明确的错误提示', () => {
      // Radix 要求 ToggleGroupItem 必须置于 ToggleGroup 内部
      expect(() => render(<ToggleGroupItem value="bold">独立项</ToggleGroupItem>)).toThrow(/ToggleGroupItem.*ToggleGroup/);
    });
  });
});
