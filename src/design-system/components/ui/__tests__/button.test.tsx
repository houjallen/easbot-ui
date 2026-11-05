/**
 * Button 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能、变体与尺寸类名
 * 2. 状态测试 - 验证禁用态、无效态（aria-invalid）
 * 3. 交互测试 - 验证点击回调触发、asChild 渲染模式
 * 4. 无障碍测试 - 验证语义角色、可访问名称、透传属性
 * 5. 边界测试 - 验证空 children、额外透传属性、className 合并优先级
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Button, buttonVariants } from '../button';

describe('Button 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染默认按钮', () => {
      render(<Button>测试按钮</Button>);

      const button = screen.getByRole('button', { name: '测试按钮' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('应该正确应用默认变体与尺寸类名', () => {
      render(<Button>测试按钮</Button>);

      const button = screen.getByRole('button', { name: '测试按钮' });
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
      expect(button).toHaveClass('h-9');
      expect(button).toHaveClass('px-4');
    });

    it('应该正确应用 destructive 变体类名', () => {
      render(<Button variant="destructive">删除</Button>);

      const button = screen.getByRole('button', { name: '删除' });
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('text-white');
    });

    it('应该正确应用 outline 变体类名', () => {
      render(<Button variant="outline">轮廓</Button>);

      const button = screen.getByRole('button', { name: '轮廓' });
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('bg-background');
    });

    it('应该正确应用 ghost 变体类名', () => {
      render(<Button variant="ghost">幽灵</Button>);

      const button = screen.getByRole('button', { name: '幽灵' });
      // hover 带 `not-disabled:` 前缀 —— `:hover` 对 `button:disabled` 仍命中，
      // 裸 `hover:bg-accent` 会让禁用按钮悬停仍浮背景（spec/css-standard.md §4.9.3）
      expect(button).toHaveClass('not-disabled:hover:bg-accent');
    });

    it('应该正确应用 link 变体类名', () => {
      render(<Button variant="link">链接</Button>);

      const button = screen.getByRole('button', { name: '链接' });
      expect(button).toHaveClass('underline-offset-4');
    });

    it('应该正确应用 sm 尺寸类名', () => {
      render(<Button size="sm">小按钮</Button>);

      const button = screen.getByRole('button', { name: '小按钮' });
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('px-3');
    });

    it('应该正确应用 icon 尺寸类名', () => {
      render(<Button size="icon">图标</Button>);

      const button = screen.getByRole('button', { name: '图标' });
      expect(button).toHaveClass('size-9');
    });

    it('应该正确合并自定义类名', () => {
      render(<Button className="custom-class">自定义</Button>);

      const button = screen.getByRole('button', { name: '自定义' });
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-primary');
    });

    it('应该正确导出 buttonVariants 并生成类名', () => {
      expect(buttonVariants({ variant: 'destructive', size: 'lg' })).toContain('bg-destructive');
      expect(buttonVariants({ size: 'lg' })).toContain('h-10');
    });
  });

  describe('状态测试', () => {
    it('应该正确渲染禁用状态', () => {
      render(<Button disabled>禁用按钮</Button>);

      const button = screen.getByRole('button', { name: '禁用按钮' });
      expect(button).toBeDisabled();
    });

    it('应该正确渲染无效状态', () => {
      render(<Button aria-invalid="true">无效按钮</Button>);

      const button = screen.getByRole('button', { name: '无效按钮' });
      expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    it('应该在禁用状态下不触发点击回调', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          禁用按钮
        </Button>,
      );

      fireEvent.click(screen.getByRole('button', { name: '禁用按钮' }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发回调', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击按钮</Button>);

      fireEvent.click(screen.getByRole('button', { name: '点击按钮' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在 asChild 模式下渲染子元素而非 button', () => {
      render(
        <Button asChild>
          <a href="/target">链接按钮</a>
        </Button>,
      );

      const link = screen.getByRole('link', { name: '链接按钮' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/target');
      expect(link).toHaveAttribute('data-slot', 'button');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('应该在 asChild 模式下仍能触发点击回调', () => {
      const handleClick = vi.fn();
      render(
        <Button asChild onClick={handleClick}>
          <a href="/target">链接按钮</a>
        </Button>,
      );

      fireEvent.click(screen.getByRole('link', { name: '链接按钮' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 button 语义角色', () => {
      render(<Button>无障碍按钮</Button>);

      expect(screen.getByRole('button', { name: '无障碍按钮' })).toBeInTheDocument();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Button aria-label="关闭对话框">×</Button>);

      expect(screen.getByRole('button', { name: '关闭对话框' })).toBeInTheDocument();
    });

    it('应该透传 type 属性', () => {
      render(<Button type="submit">提交</Button>);

      expect(screen.getByRole('button', { name: '提交' })).toHaveAttribute('type', 'submit');
    });

    it('应该透传 data-* 属性', () => {
      render(<Button data-testid="custom-button">自定义</Button>);

      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的按钮', () => {
      render(<Button aria-label="空按钮" />);

      expect(screen.getByRole('button', { name: '空按钮' })).toBeInTheDocument();
    });

    it('应该在自定义类名与变体类名冲突时保留变体类名', () => {
      render(
        <Button variant="secondary" className="bg-primary">
          冲突
        </Button>,
      );

      const button = screen.getByRole('button', { name: '冲突' });
      // tailwind-merge 会让后传入的 className 覆盖同类工具类
      expect(button).toHaveClass('bg-primary');
      expect(button).not.toHaveClass('bg-secondary');
    });
  });
});
