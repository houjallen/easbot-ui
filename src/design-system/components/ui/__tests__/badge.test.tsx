/**
 * Badge 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与变体类名
 * 2. 状态测试 - 验证 dot 状态点模式与无效态样式
 * 3. 交互测试 - 验证点击回调触发与 asChild 渲染模式
 * 4. 无障碍测试 - 验证可访问名称与属性透传
 * 5. 边界测试 - 验证空 children、缺省 variant、className 合并
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Badge, badgeVariants } from '../badge';

describe('Badge 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染默认徽标', () => {
      render(<Badge>新</Badge>);

      const badge = screen.getByText('新');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('应该正确应用默认变体类名', () => {
      render(<Badge>新</Badge>);

      const badge = screen.getByText('新');
      expect(badge).toHaveClass('bg-primary');
      expect(badge).toHaveClass('text-primary-foreground');
      expect(badge).toHaveClass('border-transparent');
    });

    it('应该正确应用 secondary 变体类名', () => {
      render(<Badge variant="secondary">次要</Badge>);

      const badge = screen.getByText('次要');
      expect(badge).toHaveClass('bg-secondary');
      expect(badge).toHaveClass('text-secondary-foreground');
    });

    it('应该正确应用 destructive 变体类名', () => {
      render(<Badge variant="destructive">危险</Badge>);

      const badge = screen.getByText('危险');
      expect(badge).toHaveClass('bg-destructive');
      expect(badge).toHaveClass('text-white');
    });

    it('应该正确应用 outline 变体类名', () => {
      render(<Badge variant="outline">轮廓</Badge>);

      const badge = screen.getByText('轮廓');
      expect(badge).toHaveClass('text-foreground');
      expect(badge).toHaveClass('[a&]:hover:bg-accent');
    });

    it('应该正确应用 success 变体类名', () => {
      render(<Badge variant="success">成功</Badge>);

      const badge = screen.getByText('成功');
      expect(badge).toHaveClass('border-green-400');
      expect(badge).toHaveClass('bg-green-50');
      expect(badge).toHaveClass('text-green-700');
    });

    it('应该正确应用 warning 变体类名', () => {
      render(<Badge variant="warning">警告</Badge>);

      const badge = screen.getByText('警告');
      expect(badge).toHaveClass('border-yellow-400');
      expect(badge).toHaveClass('bg-yellow-50');
    });

    it('应该正确应用 info 变体类名', () => {
      render(<Badge variant="info">信息</Badge>);

      const badge = screen.getByText('信息');
      expect(badge).toHaveClass('border-blue-400');
      expect(badge).toHaveClass('bg-blue-50');
    });

    it('应该正确合并自定义类名', () => {
      render(<Badge className="custom-badge">自定义</Badge>);

      const badge = screen.getByText('自定义');
      expect(badge).toHaveClass('custom-badge');
      expect(badge).toHaveClass('bg-primary');
    });

    it('应该正确导出 badgeVariants 并生成类名', () => {
      expect(badgeVariants({ variant: 'destructive' })).toContain('bg-destructive');
      expect(badgeVariants({})).toContain('bg-primary');
    });
  });

  describe('状态测试', () => {
    it('应该在 dot 模式下渲染状态点而非徽标容器', () => {
      render(<Badge dot>状态点</Badge>);

      const dot = screen.getByText('状态点');
      expect(dot).toHaveAttribute('data-slot', 'badge-dot');
      expect(dot).toHaveClass('ds-badge-dot');
    });

    it('应该正确设置 dot 状态点的尺寸与圆形样式', () => {
      render(<Badge dot>状态点</Badge>);

      const dot = screen.getByText('状态点');
      expect(dot).toHaveStyle({ width: '8px', height: '8px', borderRadius: '50%' });
    });

    it('应该在 dot 模式下不应用徽标变体类名', () => {
      render(
        <Badge dot variant="destructive">
          状态点
        </Badge>,
      );

      const dot = screen.getByText('状态点');
      expect(dot).not.toHaveClass('bg-destructive');
    });

    it('应该正确透传 aria-invalid 无效态属性', () => {
      render(<Badge aria-invalid="true">无效徽标</Badge>);

      expect(screen.getByText('无效徽标')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发回调', () => {
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>可点击</Badge>);

      fireEvent.click(screen.getByText('可点击'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在 asChild 模式下渲染子元素而非 span', () => {
      render(
        <Badge asChild>
          <a href="/target">链接徽标</a>
        </Badge>,
      );

      const link = screen.getByRole('link', { name: '链接徽标' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/target');
      expect(link).toHaveAttribute('data-slot', 'badge');
      expect(screen.queryByText('链接徽标')?.tagName).toBe('A');
    });

    it('应该在 asChild 模式下仍能触发点击回调', () => {
      const handleClick = vi.fn();
      render(
        <Badge asChild onClick={handleClick}>
          <a href="/target">链接徽标</a>
        </Badge>,
      );

      fireEvent.click(screen.getByRole('link', { name: '链接徽标' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露徽标的文本内容为可访问名称', () => {
      render(<Badge>已完成</Badge>);

      expect(screen.getByText('已完成')).toBeInTheDocument();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Badge aria-label="状态徽标">●</Badge>);

      expect(screen.getByLabelText('状态徽标')).toBeInTheDocument();
    });

    it('应该透传 data-* 属性', () => {
      render(<Badge data-testid="custom-badge">自定义</Badge>);

      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的徽标', () => {
      render(<Badge aria-label="空徽标" />);

      expect(screen.getByLabelText('空徽标')).toBeInTheDocument();
    });

    it('应该在缺省 variant 时应用 default 变体', () => {
      render(<Badge>缺省</Badge>);

      const badge = screen.getByText('缺省');
      expect(badge).toHaveClass('bg-primary');
      expect(badge).not.toHaveClass('bg-secondary');
    });

    it('应该在自定义类名与变体类名冲突时保留自定义类名', () => {
      render(
        <Badge variant="secondary" className="bg-primary">
          冲突
        </Badge>,
      );

      const badge = screen.getByText('冲突');
      expect(badge).toHaveClass('bg-primary');
      expect(badge).not.toHaveClass('bg-secondary');
    });

    it('应该允许 dot 模式不传 children', () => {
      render(<Badge dot aria-label="空状态点" />);

      expect(screen.getByLabelText('空状态点')).toHaveAttribute('data-slot', 'badge-dot');
    });
  });
});
