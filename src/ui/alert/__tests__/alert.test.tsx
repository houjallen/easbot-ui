/**
 * Alert 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Alert 与标题 / 描述的基本渲染
 * 2. 变体测试 - 验证不同 variant 对应的样式类名
 * 3. 图标测试 - 验证默认图标与自定义图标的渲染
 * 4. 动画测试 - 验证自定义动画类名的透传
 * 5. 无障碍测试 - 验证 role / aria 属性与语义结构
 * 6. 交互测试 - 验证点击、键盘与关闭按钮行为
 * 7. 边界条件测试 - 验证空内容与无效变体的降级行为
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { Terminal } from 'lucide-react';
import { describe, it, vi } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from '../alert';

describe('Alert 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染基础Alert', () => {
      render(
        <Alert>
          <AlertTitle>测试标题</AlertTitle>
          <AlertDescription>测试描述</AlertDescription>
        </Alert>,
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('测试标题')).toBeInTheDocument();
      expect(screen.getByText('测试描述')).toBeInTheDocument();
    });

    it('应该正确渲染简单Alert', () => {
      render(
        <Alert>
          <AlertDescription>简单提示信息</AlertDescription>
        </Alert>,
      );
      expect(screen.getByText('简单提示信息')).toBeInTheDocument();
    });
  });

  // 变体测试
  describe('变体测试', () => {
    it('应该正确应用默认变体样式', () => {
      render(<Alert>默认提示</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('bg-card');
      expect(screen.getByRole('alert')).toHaveClass('text-card-foreground');
    });

    it('应该正确应用destructive变体样式', () => {
      render(<Alert variant="destructive">错误提示</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('border-destructive');
    });

    it('应该正确应用success变体样式', () => {
      render(<Alert variant="success">成功提示</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('border-green-400');
      expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
    });

    it('应该正确应用warning变体样式', () => {
      render(<Alert variant="warning">警告提示</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('border-yellow-400');
      expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
    });

    it('应该正确应用info变体样式', () => {
      render(<Alert variant="info">信息提示</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('border-blue-400');
      expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
    });
  });

  // 图标测试
  describe('图标测试', () => {
    it('应该正确渲染图标', () => {
      render(
        <Alert>
          <Terminal className="h-4 w-4" data-testid="alert-icon" />
          <AlertDescription>带图标的提示</AlertDescription>
        </Alert>,
      );
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('应该正确应用图标样式', () => {
      render(
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" data-testid="alert-icon" />
          <AlertDescription>错误提示</AlertDescription>
        </Alert>,
      );
      expect(screen.getByTestId('alert-icon')).toHaveClass('h-4', 'w-4');
    });
  });

  // 动画测试
  describe('动画测试', () => {
    it('应该正确应用动画类名', () => {
      render(
        <Alert className="fade-in-0 animate-in duration-300">
          <AlertDescription>动画提示</AlertDescription>
        </Alert>,
      );
      expect(screen.getByRole('alert')).toHaveClass('animate-in', 'fade-in-0', 'duration-300');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的role属性', () => {
      render(<Alert>提示信息</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('应该有正确的语义结构', () => {
      render(
        <Alert>
          <AlertTitle>重要提示</AlertTitle>
          <AlertDescription>这是一条重要信息</AlertDescription>
        </Alert>,
      );
      const alert = screen.getByRole('alert');
      expect(alert).toContainElement(screen.getByText('重要提示'));
      expect(alert).toContainElement(screen.getByText('这是一条重要信息'));
    });

    it('应该支持自定义aria属性', () => {
      render(
        <Alert aria-label="重要通知" aria-live="assertive">
          <AlertDescription>紧急提示</AlertDescription>
        </Alert>,
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', '重要通知');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该支持点击事件', () => {
      const handleClick = vi.fn();
      render(
        <Alert onClick={handleClick}>
          <AlertDescription>可点击提示</AlertDescription>
        </Alert>,
      );
      fireEvent.click(screen.getByRole('alert'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('应该支持键盘操作', () => {
      const handleKeyDown = vi.fn();
      render(
        <Alert onKeyDown={handleKeyDown} tabIndex={0}>
          <AlertDescription>键盘操作</AlertDescription>
        </Alert>,
      );
      const alert = screen.getByRole('alert');
      fireEvent.keyDown(alert, { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  // 新增组合测试
  describe('组合功能测试', () => {
    it('应该正确处理带关闭按钮的提示', () => {
      const handleClose = vi.fn();
      render(
        <Alert closable onClose={handleClose}>
          <AlertTitle>测试标题</AlertTitle>
          <AlertDescription>测试描述</AlertDescription>
        </Alert>,
      );

      const closeButton = screen.getByRole('button', { name: /关闭/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('应该正确应用自定义类名', () => {
      render(<Alert className="custom-class">测试内容</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });
  });

  // 新增边界测试
  describe('边界条件测试', () => {
    it('应该在没有子内容时渲染空的Alert容器', () => {
      const { container } = render(<Alert />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(container.firstChild).toBe(alert);
      // 无子内容时不渲染图标，内容区保持为空
      expect(alert).toHaveTextContent('');
    });

    it('应该正确处理无效变体', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      render(<Alert variant="invalid">测试</Alert>);
      // 未知变体不会命中任何 cva 变体类，仅保留基础布局类名
      expect(screen.getByRole('alert')).toHaveClass('rounded-lg');
      expect(screen.getByRole('alert')).not.toHaveClass('bg-card');
    });
  });

  // 新增图标控制测试
  describe('图标控制测试', () => {
    it('应正确隐藏默认图标', () => {
      render(
        <Alert showIcon={false} variant="success">
          测试
        </Alert>,
      );
      expect(screen.queryByTestId('alert-icon')).toBeNull();
    });
  });

  // 新增可访问性测试
  describe('可访问性测试', () => {
    it('关闭按钮应有正确的ARIA标签', () => {
      render(
        <Alert closable closeAriaLabel="关闭通知">
          测试
        </Alert>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '关闭通知');
    });
  });
});
