/**
 * Badge 组件单元测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 变体测试 - 验证不同样式变体的应用
 * 3. 功能测试 - 验证组件的特殊功能
 */

import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染默认徽章', () => {
      render(<Badge>测试徽章</Badge>);
      expect(screen.getByText('测试徽章')).toBeInTheDocument();
    });

    it('应该正确渲染带数字的徽章', () => {
      render(<Badge count={5}>内容</Badge>);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('内容')).toBeInTheDocument();
    });

    it('应该正确处理超出最大值的数字', () => {
      render(
        <Badge count={100} overflowCount={99}>
          内容
        </Badge>,
      );
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('当count为0且showZero为false时不应显示数字', () => {
      render(
        <Badge count={0} showZero={false}>
          内容
        </Badge>,
      );
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  // 变体测试
  describe('变体测试', () => {
    it('应该正确应用默认变体样式', () => {
      render(<Badge variant="default">默认</Badge>);
      const badge = screen.getByText('默认');
      // Tailwind v4：语义类已替换为 CSS 变量任意值
      expect(badge).toHaveClass('bg-[var(--badge-default-bg)]');
    });

    it('应该正确应用成功变体样式', () => {
      render(<Badge variant="success">成功</Badge>);
      const badge = screen.getByText('成功');
      expect(badge).toHaveClass('bg-[var(--badge-success-bg)]');
    });

    it('应该正确应用警告变体样式', () => {
      render(<Badge variant="warning">警告</Badge>);
      const badge = screen.getByText('警告');
      expect(badge).toHaveClass('bg-[var(--badge-warning-bg)]');
    });

    it('应该正确应用不同尺寸', () => {
      render(<Badge size="lg">大号</Badge>);
      const badge = screen.getByText('大号');
      expect(badge).toHaveClass('px-[var(--badge-lg-padding-x)]', 'py-[var(--badge-lg-padding-y)]', 'text-[var(--badge-lg-font-size)]');
    });

    it('应该正确应用不同圆角', () => {
      render(<Badge rounded="sm">圆角</Badge>);
      const badge = screen.getByText('圆角');
      expect(badge).toHaveClass('rounded-[var(--badge-border-radius-sm)]');
    });
  });

  // 功能测试
  describe('功能测试', () => {
    it('应该正确渲染状态点', () => {
      render(<Badge dot>内容</Badge>);
      const container = screen.getByText('内容').parentElement;
      // Tailwind v4：状态点尺寸使用 CSS 变量任意值（CSS 选择器中的方括号需转义）
      const dot = container?.querySelector('.h-\\[var\\(--badge-dot-size\\)\\].w-\\[var\\(--badge-dot-size\\)\\].rounded-full');
      expect(dot).not.toBeNull();
      expect(container).toContainElement(dot as HTMLElement);
    });

    it('应该支持自定义状态点颜色', () => {
      render(
        <Badge dot dotColor="#ff0000">
          内容
        </Badge>,
      );
      const dot = screen.getByText('内容').parentElement?.querySelector('.rounded-full');
      expect(dot).toHaveClass('bg-[#ff0000]');
    });

    it('应该正确定位数字徽章', () => {
      render(<Badge count={5}>内容</Badge>);
      const badge = screen.getByText('5');
      // 数字徽章通过 absolute + 内联偏移量定位（默认 offset 为 [-4, -4]）
      expect(badge).toHaveClass('absolute');
      expect(badge).toHaveStyle({ right: '-4px', top: '-4px' });
    });
  });

  // 新增偏移量测试
  describe('偏移量测试', () => {
    it('应正确应用自定义位置偏移', () => {
      render(
        <Badge count={5} offset={[10, 20]}>
          内容
        </Badge>,
      );
      const badge = screen.getByText('5');
      expect(badge).toHaveStyle({ right: '10px' });
      expect(badge).toHaveStyle({ top: '20px' });
    });
  });

  // 新增最小宽度测试
  it('数字徽章应有最小宽度', () => {
    render(<Badge count={1}>内容</Badge>);
    expect(screen.getByText('1')).toHaveClass('min-w-[20px]');
  });
});
