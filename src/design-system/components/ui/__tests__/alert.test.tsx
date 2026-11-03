/**
 * Alert 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证提示框及标题、描述的渲染与类名
 * 2. 状态测试 - 验证 destructive 变体与自定义类名覆盖
 * 3. 交互测试 - 验证点击回调与属性透传
 * 4. 无障碍测试 - 验证 alert 语义角色与 aria 属性
 * 5. 边界测试 - 验证空 children、缺省变体、className 合并
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from '../alert';

describe('Alert 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染提示框', () => {
      render(<Alert>提示内容</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('data-slot', 'alert');
      expect(alert).toHaveTextContent('提示内容');
    });

    it('应该正确应用提示框基础类名', () => {
      render(<Alert>提示内容</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('relative');
      expect(alert).toHaveClass('flex');
      expect(alert).toHaveClass('w-full');
      expect(alert).toHaveClass('rounded-lg');
      expect(alert).toHaveClass('border');
    });

    it('应该正确渲染提示标题', () => {
      render(
        <Alert>
          <AlertTitle>标题</AlertTitle>
        </Alert>,
      );

      const title = screen.getByText('标题');
      expect(title).toHaveAttribute('data-slot', 'alert-title');
      expect(title).toHaveClass('font-medium');
    });

    it('应该正确渲染提示描述', () => {
      render(
        <Alert>
          <AlertDescription>描述</AlertDescription>
        </Alert>,
      );

      const description = screen.getByText('描述');
      expect(description).toHaveAttribute('data-slot', 'alert-description');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('应该正确渲染完整的提示框组合', () => {
      render(
        <Alert>
          <AlertTitle>完整标题</AlertTitle>
          <AlertDescription>完整描述</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('完整标题')).toBeInTheDocument();
      expect(screen.getByText('完整描述')).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(<Alert className="custom-alert">提示</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
      expect(alert).toHaveClass('w-full');
    });
  });

  describe('状态测试', () => {
    it('应该正确应用 default 变体类名', () => {
      render(<Alert>提示内容</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-card');
      expect(alert).toHaveClass('text-card-foreground');
    });

    it('应该正确应用 destructive 变体类名', () => {
      render(<Alert variant="destructive">危险提示</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive');
      expect(alert).toHaveClass('bg-destructive/10');
      expect(alert).toHaveClass('text-destructive');
    });

    it('应该在自定义类名与变体类名冲突时保留自定义类名', () => {
      render(
        <Alert variant="destructive" className="bg-primary">
          冲突
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-primary');
      expect(alert).not.toHaveClass('bg-destructive/10');
    });

    it('应该正确透传 data-state 状态属性', () => {
      render(<Alert data-state="open">状态提示</Alert>);

      expect(screen.getByRole('alert')).toHaveAttribute('data-state', 'open');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Alert onClick={handleClick}>可点击提示</Alert>);

      fireEvent.click(screen.getByRole('alert'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在更新时替换标题与描述内容', () => {
      const { rerender } = render(
        <Alert>
          <AlertTitle>旧标题</AlertTitle>
          <AlertDescription>旧描述</AlertDescription>
        </Alert>,
      );
      expect(screen.getByText('旧标题')).toBeInTheDocument();

      rerender(
        <Alert>
          <AlertTitle>新标题</AlertTitle>
          <AlertDescription>新描述</AlertDescription>
        </Alert>,
      );
      expect(screen.getByText('新标题')).toBeInTheDocument();
      expect(screen.queryByText('旧标题')).not.toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 alert 语义角色', () => {
      render(<Alert>提示内容</Alert>);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('应该透传 aria-live 属性', () => {
      render(<Alert aria-live="polite">提示内容</Alert>);

      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('应该透传 aria-label 属性', () => {
      render(<Alert aria-label="系统提示">内容</Alert>);

      expect(screen.getByLabelText('系统提示')).toBeInTheDocument();
    });

    it('应该透传 data-* 属性', () => {
      render(<Alert data-testid="custom-alert">内容</Alert>);

      expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的提示框', () => {
      render(<Alert aria-label="空提示" />);

      expect(screen.getByLabelText('空提示')).toHaveAttribute('data-slot', 'alert');
    });

    it('应该允许渲染空的标题与描述', () => {
      render(
        <Alert>
          <AlertTitle />
          <AlertDescription />
        </Alert>,
      );

      expect(document.querySelector('[data-slot="alert-title"]')).toBeEmptyDOMElement();
      expect(document.querySelector('[data-slot="alert-description"]')).toBeEmptyDOMElement();
    });

    it('应该在缺省 variant 时应用 default 变体', () => {
      render(<Alert>缺省提示</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-card');
      expect(alert).not.toHaveClass('text-destructive');
    });
  });
});
