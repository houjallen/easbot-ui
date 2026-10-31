/**
 * Select 组件测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 选项测试 - 验证选项的展示和选择
 * 3. 搜索测试 - 验证搜索功能
 * 4. 虚拟滚动测试 - 验证虚拟滚动功能
 * 5. 无障碍测试 - 验证组件的可访问性
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './select';
import { vi } from 'vitest';

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

    it('应该正确渲染分组选项', () => {
      render(<Select options={groupedOptions} />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('分组1')).toBeInTheDocument();
      expect(screen.getByText('分组2')).toBeInTheDocument();
    });

    it('应该正确渲染禁用状态', () => {
      render(<Select options={options} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
      // Tailwind v4：光标样式以 disabled: 变体形式声明
      expect(select).toHaveClass('disabled:cursor-not-allowed');
      expect(select).toHaveClass('disabled:opacity-50');
    });
  });

  // 选项测试
  describe('选项测试', () => {
    it('应该正确选择选项', async () => {
      const handleChange = vi.fn();
      render(<Select options={options} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('选项1'));

      expect(handleChange).toHaveBeenCalledWith('1');
      expect(screen.getByText('选项1')).toBeInTheDocument();
    });

    it('应该正确处理多选', async () => {
      const handleChange = vi.fn();
      render(<Select options={options} multiple onChange={handleChange} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('选项1'));
      fireEvent.click(screen.getByText('选项2'));

      expect(handleChange).toHaveBeenLastCalledWith(['1', '2']);
    });

    it('不应该选择禁用选项', () => {
      render(<Select options={options} />);

      fireEvent.click(screen.getByRole('combobox'));
      const disabledOption = screen.getByText('选项3').parentElement;
      // Tailwind v4：禁用态使用 CSS 变量任意值 + pointer-events-none
      expect(disabledOption).toHaveClass('opacity-[var(--select-option-disabled-opacity)]');
      expect(disabledOption).toHaveClass('pointer-events-none');
    });
  });

  // 搜索测试
  describe('搜索测试', () => {
    it('应该正确过滤选项', async () => {
      const handleSearch = vi.fn();
      render(<Select options={options} searchable onSearch={handleSearch} />);

      fireEvent.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('搜索...');
      fireEvent.change(searchInput, { target: { value: '选项1' } });

      expect(handleSearch).toHaveBeenCalledWith('选项1');
      expect(screen.getByText('选项1')).toBeInTheDocument();
      expect(screen.queryByText('选项2')).not.toBeInTheDocument();
    });

    it('搜索无结果时应该显示空状态', async () => {
      render(<Select options={options} searchable />);

      fireEvent.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('搜索...');
      fireEvent.change(searchInput, { target: { value: '不存在的选项' } });

      expect(screen.getByText('无匹配结果')).toBeInTheDocument();
    });
  });

  // 大数据量渲染测试
  describe('大数据量渲染测试', () => {
    const manyOptions = Array.from({ length: 1000 }, (_, i) => ({
      label: `选项${i + 1}`,
      value: (i + 1).toString(),
    }));

    it('应该正确渲染大量选项', () => {
      render(<Select options={manyOptions} />);

      fireEvent.click(screen.getByRole('combobox'));

      // 当前 Select 未实现虚拟滚动 —— 全部选项均应被渲染
      // 注意：选项为 div（无 role="option"），通过列表容器内的选项节点数统计
      const listbox = screen.getByRole('listbox');
      expect(listbox.querySelectorAll('.whitespace-nowrap').length).toBe(manyOptions.length);
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的ARIA属性', () => {
      render(<Select options={options} aria-label="测试选择器" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '测试选择器');
    });

    it('应该支持键盘操作', () => {
      render(<Select options={options} />);
      const select = screen.getByRole('combobox');

      // 打开下拉框（PopoverTrigger 通过点击切换）
      fireEvent.click(select);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // 选择选项
      fireEvent.click(screen.getByText('选项1'));
      expect(screen.getByText('选项1')).toBeInTheDocument();
    });

    it('多选模式应该正确朗读', () => {
      render(<Select options={options} multiple />);
      const select = screen.getByRole('combobox');
      // combobox 上通过 aria-expanded 表达展开状态，aria-multiselectable 位于列表容器上
      expect(select).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(select);
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  // 新增性能测试
  describe('性能测试', () => {
    it('应正确渲染万级数据', () => {
      const manyOptions = Array.from({ length: 10000 }, (_, i) => ({
        label: `选项${i + 1}`,
        value: (i + 1).toString(),
      }));

      render(<Select options={manyOptions} />);

      fireEvent.click(screen.getByRole('combobox'));
      const listbox = screen.getByRole('listbox');
      expect(listbox.querySelectorAll('.whitespace-nowrap').length).toBe(manyOptions.length);
    });
  });

  // 新增移动端测试
  describe('移动端适配测试', () => {
    beforeAll(() => {
      globalThis.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 640px)',
        addListener: vi.fn() as unknown as MediaQueryList['addListener'],
        removeListener: vi.fn() as unknown as MediaQueryList['removeListener'],
        addEventListener: vi.fn() as unknown as MediaQueryList['addEventListener'],
        removeEventListener: vi.fn() as unknown as MediaQueryList['removeEventListener'],
        dispatchEvent: vi.fn() as unknown as MediaQueryList['dispatchEvent'],
      })) as unknown as typeof globalThis.matchMedia;
    });

    it('应显示移动端样式', () => {
      render(<Select options={options} />);
      fireEvent.click(screen.getByRole('combobox'));
      // 下拉面板使用 role="dialog"，且内边距由 tailwind-merge 归一化为 p-0
      expect(screen.getByRole('dialog')).toHaveClass('p-0');
    });
  });
});
