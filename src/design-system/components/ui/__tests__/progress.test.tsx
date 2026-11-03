/**
 * Progress 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证进度条与指示器的渲染与类名
 * 2. 状态测试 - 验证不同进度值的状态属性与位移
 * 3. 交互测试 - 验证属性透传与事件回调
 * 4. 无障碍测试 - 验证 progressbar 语义与 aria 属性
 * 5. 边界测试 - 验证缺省值、0%、100% 极值场景
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Progress } from '../progress';

describe('Progress 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染进度条', () => {
      render(<Progress value={30} />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveAttribute('data-slot', 'progress');
    });

    it('应该正确应用进度条类名', () => {
      render(<Progress value={30} />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('relative');
      expect(progress).toHaveClass('h-2');
      expect(progress).toHaveClass('w-full');
      expect(progress).toHaveClass('rounded-full');
      expect(progress).toHaveClass('bg-primary/20');
    });

    it('应该正确渲染进度指示器', () => {
      render(<Progress value={30} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('h-full');
      expect(indicator).toHaveClass('bg-primary');
    });

    it('应该正确合并自定义类名', () => {
      render(<Progress value={30} className="custom-progress" />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('custom-progress');
      expect(progress).toHaveClass('h-2');
    });
  });

  describe('状态测试', () => {
    it('应该在 30% 时应用对应位移', () => {
      render(<Progress value={30} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle({ transform: 'translateX(-70%)' });
    });

    it('应该在 0% 时应用满幅位移', () => {
      render(<Progress value={0} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('应该在 100% 时应用零位移', () => {
      render(<Progress value={100} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('应该正确透传 data-state 状态属性', () => {
      render(<Progress value={50} data-state="loading" />);

      expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'loading');
    });

    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(<Progress value={50} className="h-4" />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('h-4');
      expect(progress).not.toHaveClass('h-2');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Progress value={50} onClick={handleClick} />);

      fireEvent.click(screen.getByRole('progressbar'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在更新进度值后刷新指示器位移', () => {
      const { rerender } = render(<Progress value={10} />);
      expect(document.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
        transform: 'translateX(-90%)',
      });

      rerender(<Progress value={80} />);
      expect(document.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
        transform: 'translateX(-20%)',
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 progressbar 语义角色', () => {
      render(<Progress value={40} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Progress value={40} aria-label="上传进度" />);

      expect(screen.getByRole('progressbar', { name: '上传进度' })).toBeInTheDocument();
    });

    it('应该透传 aria-valuenow 属性', () => {
      render(<Progress value={40} aria-valuenow={40} />);

      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
    });

    it('应该透传 data-* 属性', () => {
      render(<Progress value={40} data-testid="custom-progress" />);

      expect(screen.getByTestId('custom-progress')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在缺省 value 时按 0 处理', () => {
      render(<Progress />);

      expect(document.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
        transform: 'translateX(-100%)',
      });
    });

    it('应该允许渲染 0% 的进度条', () => {
      render(<Progress value={0} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('应该允许渲染 100% 的进度条', () => {
      render(<Progress value={100} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
