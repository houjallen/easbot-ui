/**
 * Select 组件测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 选项测试 - 验证选项的展示和选择
 * 3. 无障碍测试 - 验证组件的可访问性
 *
 * 说明：Radix Select 的触发器走 `onPointerDown` 路径，`fireEvent.click` 无法打开浮层，
 * 因此所有涉及浮层的用例统一使用 `@testing-library/user-event`。
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../select';

// 测试数据
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3', disabled: true },
];

const groupedOptions = [
  {
    label: '分组1',
    options: [
      { label: '选项1-1', value: '1-1' },
      { label: '选项1-2', value: '1-2' },
    ],
  },
  {
    label: '分组2',
    options: [
      { label: '选项2-1', value: '2-1' },
      { label: '选项2-2', value: '2-2' },
    ],
  },
];

describe('Select 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染基础Select', () => {
      render(<Select options={options} placeholder="请选择" />);
      expect(screen.getByText('请选择')).toBeInTheDocument();
    });

    it('应该正确渲染分组选项', async () => {
      const user = userEvent.setup();
      render(<Select groups={groupedOptions} />);

      await user.click(screen.getByRole('combobox'));

      // 浮层内容渲染到 portal，异步挂载
      expect(await screen.findByText('分组1')).toBeInTheDocument();
      expect(screen.getByText('分组2')).toBeInTheDocument();
    });

    it('应该正确渲染禁用状态', () => {
      render(<Select options={options} disabled />);
      const select = screen.getByRole('combobox');
      // 触发器为原生 button，禁用时带 `disabled` 属性
      expect(select).toBeDisabled();
    });
  });

  // 选项测试
  describe('选项测试', () => {
    it('应该正确选择选项', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(<Select options={options} onValueChange={handleValueChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('选项1'));

      expect(handleValueChange).toHaveBeenCalledWith('1');
      // 选择后触发器展示当前值
      expect(screen.getByRole('combobox')).toHaveTextContent('选项1');
    });

    it('不应该选择禁用选项', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(<Select options={options} onValueChange={handleValueChange} />);

      await user.click(screen.getByRole('combobox'));

      const disabledOption = await screen.findByText('选项3');
      const optionItem = disabledOption.closest('[role="option"]');
      expect(optionItem).toHaveAttribute('aria-disabled', 'true');
      expect(optionItem).toHaveAttribute('data-disabled');

      // 禁用选项不可点击，值不应发生变化
      await user.click(disabledOption);
      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的ARIA属性', () => {
      render(<Select options={options} aria-label="测试选择器" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '测试选择器');
    });

    it('应该支持键盘操作', async () => {
      const user = userEvent.setup();
      render(<Select options={options} />);

      const select = screen.getByRole('combobox');
      select.focus();

      // 空格键打开下拉框（首项自动获得焦点）
      await user.keyboard(' ');
      await screen.findByRole('listbox');

      // 方向键移动高亮，Enter 选中
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
      expect(screen.getByRole('combobox')).toHaveTextContent('选项2');
    });
  });
});
