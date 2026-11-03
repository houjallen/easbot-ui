/**
 * TableLoading 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证加载蒙层、指示器与默认文案渲染
 * 2. 状态测试 - 验证 spinning 关闭、自定义提示与自定义指示器
 * 3. 交互测试 - 验证子内容在加载态下仍可渲染与交互
 * 4. 无障碍测试 - 验证文案节点语义与额外 DOM 属性透传
 *
 * 测试载体说明：
 * `TableLoading` 只依赖内置 i18n（`useComponentMessage('table', ...)`），
 * **不依赖** `TableProvider`，因此本文件直接渲染组件本体。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableLoading } from '../TableLoading';

describe('TableLoading 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染默认的加载文案', () => {
      render(
        <TableLoading>
          <span>表格内容</span>
        </TableLoading>,
      );

      // 默认文案取自内置表格文案表的 loading
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('应该渲染加载指示器', () => {
      const { container } = render(
        <TableLoading>
          <span>表格内容</span>
        </TableLoading>,
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'h-8', 'w-8');
    });

    it('应该渲染子内容并为其添加禁用交互的样式', () => {
      const { container } = render(
        <TableLoading>
          <span>表格内容</span>
        </TableLoading>,
      );

      expect(screen.getByText('表格内容')).toBeInTheDocument();

      const content = container.querySelector('.pointer-events-none');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('opacity-50');
    });

    it('应该渲染加载容器与扩展类名', () => {
      const { container } = render(
        <TableLoading className="custom-loading">
          <span>表格内容</span>
        </TableLoading>,
      );

      const root = container.firstElementChild;
      expect(root).toHaveClass('relative', 'custom-loading');
    });
  });

  describe('状态测试', () => {
    it('应该在 spinning 为 false 时只渲染子内容', () => {
      const { container } = render(
        <TableLoading spinning={false}>
          <span>表格内容</span>
        </TableLoading>,
      );

      expect(screen.getByText('表格内容')).toBeInTheDocument();
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      // spinning 关闭时不渲染任何包装容器
      expect(container.firstElementChild?.tagName).toBe('SPAN');
    });

    it('应该使用自定义提示替换默认加载文案', () => {
      render(
        <TableLoading tip="正在同步数据...">
          <span>表格内容</span>
        </TableLoading>,
      );

      expect(screen.getByText('正在同步数据...')).toBeInTheDocument();
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    it('应该在提示为空值时不渲染任何提示文案', () => {
      render(
        <TableLoading tip={null}>
          <span>表格内容</span>
        </TableLoading>,
      );

      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    it('应该使用自定义指示器替换默认指示器', () => {
      const { container } = render(
        <TableLoading indicator={<span className="custom-indicator">自定义指示器</span>}>
          <span>表格内容</span>
        </TableLoading>,
      );

      expect(screen.getByText('自定义指示器')).toBeInTheDocument();
      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    it('应该按照 locale 覆盖加载文案语言', () => {
      render(
        <TableLoading locale="en-US">
          <span>表格内容</span>
        </TableLoading>,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    it('应该按照 messages 覆盖加载文案', () => {
      render(
        <TableLoading messages={{ 'zh-CN': { loading: '数据加载中' } }}>
          <span>表格内容</span>
        </TableLoading>,
      );

      expect(screen.getByText('数据加载中')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该透传子内容的点击回调', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <TableLoading>
          <button type="button" onClick={onClick}>
            表格操作
          </button>
        </TableLoading>,
      );

      await user.click(screen.getByRole('button', { name: '表格操作' }));

      // jsdom 不解析 CSS 的 pointer-events，禁用交互由内容层的 pointer-events-none 样式实现
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('应该在非加载态下允许子内容响应点击', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <TableLoading spinning={false}>
          <button type="button" onClick={onClick}>
            表格操作
          </button>
        </TableLoading>,
      );

      await user.click(screen.getByRole('button', { name: '表格操作' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该把加载文案渲染在段落元素中', () => {
      render(
        <TableLoading>
          <span>表格内容</span>
        </TableLoading>,
      );

      const tip = screen.getByText('加载中...');
      expect(tip.tagName).toBe('P');
    });

    it('应该透传额外的 DOM 属性到加载容器', () => {
      const { container } = render(
        <TableLoading role="status" aria-live="polite">
          <span>表格内容</span>
        </TableLoading>,
      );

      const root = container.firstElementChild;
      expect(root).toHaveAttribute('role', 'status');
      expect(root).toHaveAttribute('aria-live', 'polite');
    });
  });
});
