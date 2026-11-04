/**
 * Combobox 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证触发器、分组选项与禁用状态
 * 2. 选项测试 - 验证选项选择、多选与禁用选项
 * 3. 搜索测试 - 验证搜索过滤与空状态
 * 4. 交互测试 - 验证键盘操作与回调
 * 5. 无障碍测试 - 验证 combobox 语义角色与 aria 属性
 *
 * 说明：Combobox 的浮层基于 Radix Popover，触发器走 `onPointerDown` 路径，
 * 因此统一使用 `@testing-library/user-event` 的 `user.click` 打开浮层，
 * 并用 `user.keyboard('{Escape}')` 关闭（Radix 会给 body 加 `pointer-events: none`，
 * jsdom 中无法可靠模拟「点击外部」关闭）。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, vi } from 'vitest';
import { Combobox } from '../combobox';

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

describe('Combobox 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染基础Combobox', () => {
      render(<Combobox options={options} placeholder="请选择" />);
      expect(screen.getByText('请选择')).toBeInTheDocument();
    });

    it('应该正确渲染分组选项', async () => {
      const user = userEvent.setup();
      render(<Combobox options={groupedOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(await screen.findByText('分组1')).toBeInTheDocument();
      expect(screen.getByText('分组2')).toBeInTheDocument();
    });

    it('应该正确渲染禁用状态', () => {
      render(<Combobox options={options} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
      expect(select).toHaveClass('disabled:cursor-not-allowed');
    });

    it('应该正确渲染加载状态', () => {
      render(<Combobox options={options} loading />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
      expect(select).toHaveAttribute('aria-busy', 'true');
    });
  });

  // 选项测试
  describe('选项测试', () => {
    it('应该正确选择选项', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Combobox options={options} onChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('选项1'));

      expect(handleChange).toHaveBeenCalledWith('1');
    });

    it('应该正确处理多选', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Combobox options={options} multiple onChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('选项1'));
      await user.click(screen.getByText('选项2'));

      expect(handleChange).toHaveBeenLastCalledWith(['1', '2']);
    });

    it('受控模式下应该以传入的value为准', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Combobox options={options} multiple value={['1']} onChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('选项2'));

      expect(handleChange).toHaveBeenLastCalledWith(['1', '2']);
    });

    it('不应该选择禁用选项', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Combobox options={options} onChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      const disabledOption = await screen.findByText('选项3');
      expect(disabledOption.parentElement).toHaveClass('opacity-50');
      expect(disabledOption.parentElement).toHaveAttribute('aria-disabled', 'true');

      await user.click(disabledOption);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('触发器内不应出现嵌套的 button（避免非法 HTML 与 hydration 错误）', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      render(<Combobox options={options} multiple />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('选项1'));

      // 📌 回归防护：触发器是 <button>，多选态的「移除 X」此前也是 <button>，
      //    构成非法嵌套（React 告警 + SSR hydration 错误）。
      const trigger = screen.getByRole('combobox');
      expect(trigger.querySelector('button')).toBeNull();

      // React 19 对非法嵌套会通过 console.error 告警
      expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('cannot be a descendant of'), expect.anything());
      consoleError.mockRestore();
    });

    it('移除控件应该是可聚焦的 role=button，且能通过键盘触发', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Combobox options={options} multiple value={['1']} onChange={handleChange} />);

      const removeControl = screen.getByRole('button', { name: '移除选项' });
      expect(removeControl).toHaveAttribute('tabindex', '0');
      expect(removeControl.tagName).toBe('SPAN');

      removeControl.focus();
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenLastCalledWith([]);
    });
  });

  // 搜索测试
  describe('搜索测试', () => {
    it('应该正确过滤选项', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      render(<Combobox options={options} searchable onSearch={handleSearch} />);

      await user.click(screen.getByRole('combobox'));
      const searchInput = await screen.findByPlaceholderText('搜索选项');
      await user.type(searchInput, '选项1');

      expect(handleSearch).toHaveBeenCalledWith('选项1');
      expect(screen.getByText('选项1')).toBeInTheDocument();
      expect(screen.queryByText('选项2')).not.toBeInTheDocument();
    });

    it('搜索无结果时应该显示空状态', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} searchable />);

      await user.click(screen.getByRole('combobox'));
      const searchInput = await screen.findByPlaceholderText('搜索选项');
      await user.type(searchInput, '不存在的选项');

      expect(await screen.findByText('未找到匹配结果')).toBeInTheDocument();
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该支持键盘操作打开下拉框', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} />);
      const select = screen.getByRole('combobox');

      select.focus();
      await user.keyboard('{Enter}');

      expect(await screen.findByRole('listbox')).toBeInTheDocument();
    });

    it('应该在选中选项后关闭下拉框', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('选项1'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('应该在多选模式下保持下拉框打开', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} multiple />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('选项1'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的ARIA属性', () => {
      render(<Combobox options={options} aria-label="测试选择器" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '测试选择器');
    });

    it('应该暴露展开状态属性', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-expanded', 'false');

      await user.click(select);
      expect(select).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该在错误状态下标记aria-invalid', () => {
      render(<Combobox options={options} error aria-label="错误选择器" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  // 样式测试
  describe('样式测试', () => {
    it('触发器应有可见的边框样式（border-input）', () => {
      render(<Combobox options={options} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border');
      expect(trigger).toHaveClass('border-input');
    });

    it('触发器应为左右分布布局（justify-between），保证图标靠右', () => {
      render(<Combobox options={options} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('justify-between');
    });

    it('触发器不应有多余的包裹层（图标与文字应同为直接子元素）', () => {
      render(<Combobox options={options} />);
      const trigger = screen.getByRole('combobox');

      // 📌 回归防护：此前触发器用 `Button` 渲染，其内部会包一层
      //    `<div class="flex items-center justify-center">`，
      //    导致 `justify-between` 失效 → 图标被挤到文字下方换行。
      //    修复后触发器的直接子元素应为「文字 span」+「图标 span」两个。
      const directChildren = Array.from(trigger.children);
      expect(directChildren).toHaveLength(2);
      expect(directChildren[0]?.tagName).toBe('SPAN');
      expect(directChildren[1]?.tagName).toBe('SPAN');
      // 第一个是文字容器，第二个是图标容器
      expect(directChildren[0]?.querySelector('svg')).toBeNull();
      expect(directChildren[1]?.querySelector('svg')).not.toBeNull();
    });

    it('错误状态应覆盖边框为 destructive 色', () => {
      render(<Combobox options={options} error />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-[var(--destructive)]');
    });

    it('成功状态应覆盖边框为 success 色', () => {
      render(<Combobox options={options} success />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-[var(--success)]');
    });

    it('triggerClassName 应追加到触发器上（末位生效）', () => {
      render(<Combobox options={options} triggerClassName="custom-trigger" />);
      expect(screen.getByRole('combobox')).toHaveClass('custom-trigger');
    });
  });

  // 回归测试（ADR 0001 / 批次二-2）
  describe('属性透传回归测试', () => {
    it('className 应该作用于外层容器（而不是被静默吞掉）', () => {
      // 📌 回归防护：此前 `className` 被解构出来却**从未使用** ——
      //    消费方传的类名被静默丢弃，只能用 `triggerClassName` 给内层 button 加样式，
      //    却无法给外层 wrapper（`grid w-full gap-1.5`）加样式。
      const { container } = render(<Combobox options={options} className="custom-wrapper" />);
      expect(container.firstChild).toHaveClass('custom-wrapper');
    });

    it('errorMessage 应该渲染为错误文案', () => {
      // 📌 回归防护：此前 `errorMessage` 是**死 prop** —— 声明了但从未被读取，
      //    落入 `...props` 被展开到触发器 `<button>` 上，
      //    变成非法 DOM 属性 `<button errorMessage="…">`，而非显示为错误文案。
      render(<Combobox options={options} error errorMessage="请选择有效选项" />);
      expect(screen.getByText('请选择有效选项')).toBeInTheDocument();
    });

    it('errorMessage 不应泄漏为 DOM 属性', () => {
      render(<Combobox options={options} error errorMessage="请选择有效选项" />);
      expect(screen.getByRole('combobox')).not.toHaveAttribute('errorMessage');
    });

    it('errorMessage 应该与 aria-invalid 联动', () => {
      render(<Combobox options={options} error errorMessage="请选择有效选项" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('未传 errorMessage 时不应渲染错误文案段落', () => {
      const { container } = render(<Combobox options={options} error />);
      // 📌 `error` 是 boolean，React 渲染 boolean 为文本节点时不输出任何内容 ——
      //    因此未传 `errorMessage` 时不应存在 `text-destructive` 的错误文案段落。
      expect(container.querySelector('.text-destructive')).toBeNull();
    });
  });
});
