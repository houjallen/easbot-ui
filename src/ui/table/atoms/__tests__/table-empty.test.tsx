/**
 * TableEmpty 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证默认文案、图标、自定义图片与操作区渲染
 * 2. 状态测试 - 验证自定义描述 / 图片 / 操作按钮的替换行为
 * 3. 交互测试 - 验证操作区按钮的点击回调
 * 4. 无障碍测试 - 验证 DOM 属性透传与语义结构
 *
 * 测试载体说明：
 * `TableEmpty` 强依赖 `TableProvider`（内部调用 `useTableContext`），
 * 因此所有用例都在真实 `TableProvider` 下渲染，避免用 mock 掩盖上下文契约。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import { TableEmpty } from '../TableEmpty';

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderTableEmpty = (ui: React.ReactElement) => render(<TableProvider>{ui}</TableProvider>);

describe('TableEmpty 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染默认的空状态文案', () => {
      renderTableEmpty(<TableEmpty />);

      // 默认文案取自表格 i18n 文案表的 emptyText
      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });

    it('应该渲染默认的文件图标', () => {
      const { container } = renderTableEmpty(<TableEmpty />);

      const icon = container.querySelector('.eas-icon');
      expect(icon).toBeInTheDocument();
      // 默认图标为 lucide 的 file 图标
      expect(icon?.querySelector('svg.lucide-file')).toBeInTheDocument();
    });

    it('应该渲染空状态容器与扩展类名', () => {
      const { container } = renderTableEmpty(<TableEmpty className="custom-empty" />);

      const root = container.querySelector('.eas-table-empty');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('custom-empty');
    });
  });

  describe('状态测试', () => {
    it('应该使用自定义描述替换默认文案', () => {
      renderTableEmpty(<TableEmpty description="没有匹配的数据" />);

      expect(screen.getByText('没有匹配的数据')).toBeInTheDocument();
      expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
    });

    it('应该使用自定义图片替换默认图标', () => {
      const { container } = renderTableEmpty(<TableEmpty image={<span className="custom-image">图片占位</span>} />);

      expect(screen.getByText('图片占位')).toBeInTheDocument();
      expect(container.querySelector('svg.lucide-file')).not.toBeInTheDocument();
    });

    it('应该渲染自定义操作按钮', () => {
      renderTableEmpty(<TableEmpty action={<button type="button">新建数据</button>} />);

      expect(screen.getByRole('button', { name: '新建数据' })).toBeInTheDocument();
    });

    it('应该在没有操作按钮时不渲染操作区', () => {
      const { container } = renderTableEmpty(<TableEmpty />);

      expect(container.querySelector('button')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该触发自定义操作按钮的点击回调', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderTableEmpty(
        <TableEmpty
          action={
            <button type="button" onClick={onClick}>
              新建数据
            </button>
          }
        />,
      );

      await user.click(screen.getByRole('button', { name: '新建数据' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该把描述文案渲染在段落元素中', () => {
      renderTableEmpty(<TableEmpty description="暂无匹配记录" />);

      const description = screen.getByText('暂无匹配记录');
      expect(description.tagName).toBe('P');
    });

    it('应该透传额外的 DOM 属性', () => {
      const { container } = renderTableEmpty(<TableEmpty role="status" aria-label="空状态" />);

      const root = container.querySelector('.eas-table-empty');
      expect(root).toHaveAttribute('role', 'status');
      expect(root).toHaveAttribute('aria-label', '空状态');
    });

    it('应该把装饰性图标标记为对辅助技术隐藏', () => {
      const { container } = renderTableEmpty(<TableEmpty />);

      const svg = container.querySelector('svg.lucide-file');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
