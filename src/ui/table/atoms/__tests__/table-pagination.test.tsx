/**
 * TablePagination 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证分页容器、总数文案与页码按钮渲染
 * 2. 状态测试 - 验证隐藏态、布局裁剪、每页条数与快速跳页的显隐
 * 3. 交互测试 - 验证翻页、每页条数切换与快速跳页回调
 * 4. 无障碍测试 - 验证分页导航的可访问名称与按钮语义
 *
 * 测试载体说明：
 * `TablePagination` 强依赖 `TableProvider`（内部调用 `useTableContext` 取 i18n），
 * 因此所有用例都在真实 `TableProvider` 下渲染。
 *
 * 设备说明：jsdom 默认视口宽度为 1024px，大于移动端断点 768px，
 * 因此用例运行在桌面布局（`layout = ['total', 'perPage', 'pager', 'go']`）。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import type { PaginationConfig, PaginationState } from '../../types';
import { TablePagination } from '../TablePagination';

/**
 * 默认分页状态
 */
const paginationState: PaginationState = {
  pageNo: 1,
  pageSize: 10,
  total: 35,
  show: true,
};

/**
 * 默认分页配置
 */
const paginationConfig: PaginationConfig = {
  show: true,
  showTotal: true,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: [10, 20, 50, 100],
  layout: ['total', 'perPage', 'pager', 'go'],
  maxButtons: 5,
  simple: false,
  position: 'right',
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderPagination = (ui: React.ReactElement) => render(<TableProvider>{ui}</TableProvider>);

describe('TablePagination 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染分页容器与扩展类名', () => {
      const { container } = renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} className="custom-pagination" />);

      const root = container.querySelector('.eas-table-pagination');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('custom-pagination');
    });

    it('应该渲染总数统计文案', () => {
      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} />);

      // 总数文案取自表格 i18n 文案表的 pagination.totalInfo
      expect(screen.getByText('共 35 条，第 1-10 条')).toBeInTheDocument();
    });

    it('应该渲染页码按钮', () => {
      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} />);

      // 共 4 页（35 / 10 向上取整）
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    });

    it('应该渲染每页条数选择器与快速跳页输入框', () => {
      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该在 show 为 false 时不渲染分页', () => {
      const { container } = renderPagination(<TablePagination pagination={{ ...paginationState, show: false }} config={paginationConfig} />);

      expect(container.querySelector('.eas-table-pagination')).not.toBeInTheDocument();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('应该在关闭总数展示时不渲染总数文案', () => {
      renderPagination(<TablePagination pagination={paginationState} config={{ ...paginationConfig, showTotal: false }} />);

      expect(screen.queryByText('共 35 条，第 1-10 条')).not.toBeInTheDocument();
    });

    it('应该在关闭每页条数切换时不渲染选择器', () => {
      renderPagination(<TablePagination pagination={paginationState} config={{ ...paginationConfig, showSizeChanger: false }} />);

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('应该在关闭快速跳页时不渲染输入框', () => {
      renderPagination(<TablePagination pagination={paginationState} config={{ ...paginationConfig, showQuickJumper: false }} />);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('应该按 layout 裁剪渲染的区块', () => {
      renderPagination(<TablePagination pagination={paginationState} config={{ ...paginationConfig, layout: ['pager'] }} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.queryByText('共 35 条，第 1-10 条')).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('应该在首页时禁用上一页按钮', () => {
      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} />);

      // 📌 禁用态用 `cursor-not-allowed` 而非 `pointer-events-none`（规范 css-standard.md §4.9：
      //    鼠标穿透会让禁止光标永不生效）
      expect(screen.getByLabelText('转到上一页')).toHaveClass('cursor-not-allowed', 'opacity-50');
    });

    it('应该在末页时禁用下一页按钮', () => {
      renderPagination(<TablePagination pagination={{ ...paginationState, pageNo: 4 }} config={paginationConfig} />);

      expect(screen.getByLabelText('转到下一页')).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });

  describe('交互测试', () => {
    it('应该在点击页码时触发页码变化回调', async () => {
      const user = userEvent.setup();
      const onPageNoChange = vi.fn();

      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} onPageNoChange={onPageNoChange} />);

      await user.click(screen.getByRole('button', { name: '3' }));

      expect(onPageNoChange).toHaveBeenCalledTimes(1);
      expect(onPageNoChange).toHaveBeenCalledWith(3);
    });

    it('应该在点击下一页时触发页码变化回调', async () => {
      const user = userEvent.setup();
      const onPageNoChange = vi.fn();

      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} onPageNoChange={onPageNoChange} />);

      await user.click(screen.getByLabelText('转到下一页'));

      expect(onPageNoChange).toHaveBeenCalledWith(2);
    });

    it('应该在快速跳页输入合法页码后触发页码变化回调', async () => {
      const user = userEvent.setup();
      const onPageNoChange = vi.fn();

      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} onPageNoChange={onPageNoChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '3{Enter}');

      expect(onPageNoChange).toHaveBeenCalledWith(3);
    });

    it('应该在快速跳页输入越界页码时不触发页码变化回调', async () => {
      const user = userEvent.setup();
      const onPageNoChange = vi.fn();

      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} onPageNoChange={onPageNoChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '99{Enter}');

      expect(onPageNoChange).not.toHaveBeenCalled();
    });

    it('应该在切换每页条数时触发每页条数变化回调', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();

      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} onPageSizeChange={onPageSizeChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByRole('option', { name: '20' }));

      expect(onPageSizeChange).toHaveBeenCalledTimes(1);
      expect(onPageSizeChange).toHaveBeenCalledWith(20);
    });
  });

  describe('无障碍测试', () => {
    it('应该为分页导航提供可访问名称', () => {
      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} />);

      expect(screen.getByRole('navigation', { name: '分页导航' })).toBeInTheDocument();
    });

    it('应该为上一页与下一页提供可访问名称', () => {
      renderPagination(<TablePagination pagination={paginationState} config={paginationConfig} />);

      expect(screen.getByLabelText('转到上一页')).toBeInTheDocument();
      expect(screen.getByLabelText('转到下一页')).toBeInTheDocument();
    });

    it('应该标记当前页码按钮为选中态', () => {
      renderPagination(<TablePagination pagination={{ ...paginationState, pageNo: 2 }} config={paginationConfig} />);

      // 当前页按钮使用 default 变体，与其它页码按钮的 outline 变体区分
      expect(screen.getByRole('button', { name: '2' })).toHaveClass('border-primary', 'bg-primary');
      expect(screen.getByRole('button', { name: '1' })).toHaveClass('border-input', 'bg-background');
    });
  });
});
