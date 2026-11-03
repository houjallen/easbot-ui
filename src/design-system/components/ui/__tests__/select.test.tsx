/**
 * Select 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态、选中态、禁用态、尺寸变体
 * 3. 交互测试 - 验证键盘打开、选择项与回调
 * 4. 无障碍测试 - 验证 combobox/listbox/option 语义角色、焦点管理
 * 5. 边界测试 - 验证受控模式、分组与分隔线、透传属性
 *
 * @remarks
 * Radix 的 `SelectTrigger` 通过 `onPointerDown`（且 `pointerType === 'mouse'`）打开下拉，
 * 但该路径会调用 `target.hasPointerCapture(...)` —— **jsdom 未实现**该 API，会直接抛错。
 * 因此测试统一走键盘路径（`ArrowDown` / `Enter` / `空格` 属于 Radix 的 `OPEN_KEYS`）打开下拉。
 * 下拉内容渲染到 `document.body`（portal），必须用 `screen.findByRole(...)` 查询。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '../select';

/**
 * 打开下拉列表
 *
 * @description
 * Radix 的 `SelectTrigger` 鼠标路径依赖 `hasPointerCapture`（jsdom 未实现），
 * 这里统一用键盘 `ArrowDown` 打开（属于 Radix 的 `OPEN_KEYS`）。
 */
const openSelect = (trigger: HTMLElement): void => {
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
};

describe('Select 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染触发器与占位文本', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
      expect(trigger).toHaveTextContent('请选择');
    });

    it('应该正确应用触发器类名', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('rounded-md');
      expect(trigger).toHaveClass('border');
      expect(trigger).toHaveClass('border-input');
      expect(trigger).toHaveClass('px-3');
      expect(trigger).toHaveClass('py-2');
      expect(trigger).toHaveClass('text-sm');
      expect(trigger).toHaveClass('data-[size=default]:h-9');
    });

    it('应该正确渲染下拉内容与选项', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>分组</SelectLabel>
              <SelectItem value="a">选项 A</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectItem value="b">选项 B</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      const listbox = await screen.findByRole('listbox');
      expect(listbox).toHaveAttribute('data-slot', 'select-content');
      expect(screen.getByText('分组')).toHaveAttribute('data-slot', 'select-label');
      expect(screen.getByRole('option', { name: '选项 A' })).toHaveAttribute('data-slot', 'select-item');
    });

    it('应该正确应用下拉内容与选项类名', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      const listbox = await screen.findByRole('listbox');
      expect(listbox).toHaveClass('relative');
      expect(listbox).toHaveClass('z-50');
      expect(listbox).toHaveClass('min-w-[8rem]');
      expect(listbox).toHaveClass('rounded-md');
      expect(listbox).toHaveClass('border');
      expect(listbox).toHaveClass('bg-popover');

      const option = screen.getByRole('option', { name: '选项 A' });
      expect(option).toHaveClass('relative');
      expect(option).toHaveClass('flex');
      expect(option).toHaveClass('w-full');
      expect(option).toHaveClass('items-center');
      expect(option).toHaveClass('rounded-sm');
      expect(option).toHaveClass('py-1.5');
      expect(option).toHaveClass('pr-8');
      expect(option).toHaveClass('pl-2');
      expect(option).toHaveClass('focus:bg-accent');
      expect(option).toHaveClass('focus:text-accent-foreground');
    });

    it('应该正确应用分组标签与分隔线类名', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>分组</SelectLabel>
              <SelectItem value="a">选项 A</SelectItem>
            </SelectGroup>
            <SelectSeparator />
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      expect(await screen.findByText('分组')).toHaveClass('text-muted-foreground');
      expect(await screen.findByText('分组')).toHaveClass('text-xs');

      const separator = document.querySelector('[data-slot="select-separator"]');
      expect(separator).toHaveClass('h-px');
      expect(separator).toHaveClass('bg-border');
    });

    it('应该正确合并自定义类名', async () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent className="custom-content">
            <SelectItem value="a" className="custom-item">
              选项 A
            </SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toHaveClass('custom-trigger');

      openSelect(screen.getByRole('combobox'));

      expect(await screen.findByRole('listbox')).toHaveClass('custom-content');
      expect(await screen.findByRole('option', { name: '选项 A' })).toHaveClass('custom-item');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('应该在键盘打开后渲染打开状态', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      openSelect(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(await screen.findByRole('listbox')).toHaveAttribute('data-state', 'open');
    });

    it('应该在受控选中状态下渲染对应选项文本', () => {
      render(
        <Select value="a">
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
            <SelectItem value="b">选项 B</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('选项 A');
    });

    it('应该在选中状态下渲染选项的 data-state', async () => {
      render(
        <Select value="a">
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
            <SelectItem value="b">选项 B</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      const selected = await screen.findByRole('option', { name: '选项 A' });
      const unselected = screen.getByRole('option', { name: '选项 B' });
      expect(selected).toHaveAttribute('data-state', 'checked');
      expect(unselected).toHaveAttribute('data-state', 'unchecked');
    });

    it('应该在禁用选项上渲染 data-disabled 与 aria-disabled', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a" disabled>
              禁用项
            </SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      const option = await screen.findByRole('option', { name: '禁用项' });
      expect(option).toHaveAttribute('data-disabled');
      expect(option).toHaveAttribute('aria-disabled', 'true');
    });

    it('应该在禁用触发器上渲染 disabled 属性', () => {
      render(
        <Select>
          <SelectTrigger disabled>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled');
    });

    it('应该在 sm 尺寸下渲染 data-size 为 sm', () => {
      render(
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-size', 'sm');
      expect(trigger).toHaveClass('data-[size=sm]:h-8');
    });

    it('应该在缺省尺寸下渲染 data-size 为 default', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-size', 'default');
      expect(trigger).toHaveClass('data-[size=default]:h-9');
    });
  });

  describe('交互测试', () => {
    it('应该在按下 ArrowDown 键时打开下拉', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      expect(await screen.findByRole('listbox')).toBeInTheDocument();
    });

    it('应该在按下 Enter 键时打开下拉', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

      expect(await screen.findByRole('listbox')).toBeInTheDocument();
    });

    it('应该在点击选项时触发值变更回调', async () => {
      const handleValueChange = vi.fn();
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
            <SelectItem value="b">选项 B</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));
      fireEvent.click(await screen.findByRole('option', { name: '选项 B' }));

      expect(handleValueChange).toHaveBeenCalledWith('b');
    });

    it('应该在选择选项后更新触发器显示文本', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
            <SelectItem value="b">选项 B</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));
      fireEvent.click(await screen.findByRole('option', { name: '选项 B' }));

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('选项 B');
      });
    });

    it('应该在选择选项后关闭下拉', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));
      fireEvent.click(await screen.findByRole('option', { name: '选项 A' }));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('应该在点击禁用选项时不触发值变更回调', async () => {
      const handleValueChange = vi.fn();
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a" disabled>
              禁用项
            </SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));
      fireEvent.click(await screen.findByRole('option', { name: '禁用项' }));

      expect(handleValueChange).not.toHaveBeenCalled();
    });

    it('应该在按下 Escape 键时关闭下拉', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));
      const listbox = await screen.findByRole('listbox');

      fireEvent.keyDown(listbox, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 combobox 语义角色', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('应该暴露 listbox 与 option 语义角色', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      expect(await screen.findByRole('listbox')).toBeInTheDocument();
      expect(await screen.findByRole('option', { name: '选项 A' })).toBeInTheDocument();
    });

    it('应该通过 aria-expanded 暴露展开状态', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      openSelect(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该透传 aria-label 到触发器', () => {
      render(
        <Select>
          <SelectTrigger aria-label="选择颜色">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole('combobox', { name: '选择颜色' })).toBeInTheDocument();
    });

    it('应该通过 aria-controls 关联触发器与下拉内容', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      openSelect(trigger);

      const listbox = await screen.findByRole('listbox');
      const controls = trigger.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的选中值', async () => {
      const handleValueChange = vi.fn();
      render(
        <Select value="a" onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
            <SelectItem value="b">选项 B</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));
      fireEvent.click(await screen.findByRole('option', { name: '选项 B' }));

      expect(handleValueChange).toHaveBeenCalledWith('b');
      // 受控模式下选中值由外部决定，组件本身不会自行变更
      expect(screen.getByRole('combobox')).toHaveTextContent('选项 A');
    });

    it('应该允许渲染没有选项的下拉', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent />
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      expect(await screen.findByRole('listbox')).toBeInTheDocument();
    });

    it('应该允许渲染没有默认值的下拉', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('请选择');
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Select>
          <SelectTrigger data-custom="value">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('data-custom', 'value');
    });

    it('应该在打开后渲染下拉视口容器', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );

      openSelect(screen.getByRole('combobox'));

      await waitFor(() => {
        // Radix 的 Select 在内容中包裹一层 Viewport 容器
        expect(screen.getByRole('listbox').querySelector('[role="presentation"]')).toBeInTheDocument();
      });
    });
  });
});
