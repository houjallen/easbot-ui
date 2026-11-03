/**
 * Skeleton 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证动画态与自定义尺寸
 * 3. 交互测试 - 验证属性透传与事件冒泡
 * 4. 无障碍测试 - 验证可访问名称与 aria 属性透传
 * 5. 边界测试 - 验证空 children、缺省属性、className 合并
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Skeleton } from '../skeleton';

describe('Skeleton 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染骨架占位元素', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    });

    it('应该正确应用基础类名', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-md');
      expect(skeleton).toHaveClass('bg-accent');
    });

    it('应该正确渲染子内容', () => {
      render(<Skeleton>加载中</Skeleton>);

      expect(screen.getByText('加载中')).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  describe('状态测试', () => {
    it('应该保持脉冲动画类名', () => {
      render(<Skeleton data-testid="skeleton" />);

      expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
    });

    it('应该正确应用自定义宽高尺寸类名', () => {
      render(<Skeleton className="h-4 w-32" data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-32');
    });

    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(<Skeleton className="rounded-full" data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
      expect(skeleton).not.toHaveClass('rounded-md');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Skeleton onClick={handleClick} data-testid="skeleton" />);

      fireEvent.click(screen.getByTestId('skeleton'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在鼠标进入时触发 onMouseEnter 回调', () => {
      const handleMouseEnter = vi.fn();
      render(<Skeleton onMouseEnter={handleMouseEnter} data-testid="skeleton" />);

      fireEvent.mouseEnter(screen.getByTestId('skeleton'));
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该透传 aria-label 属性', () => {
      render(<Skeleton aria-label="内容加载中" data-testid="skeleton" />);

      expect(screen.getByLabelText('内容加载中')).toBeInTheDocument();
    });

    it('应该透传 aria-busy 属性', () => {
      render(<Skeleton aria-busy="true" data-testid="skeleton" />);

      expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true');
    });

    it('应该透传 role 属性', () => {
      render(<Skeleton role="status" data-testid="skeleton" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的骨架元素', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveTextContent('');
    });

    it('应该允许渲染空字符串子内容', () => {
      render(<Skeleton data-testid="skeleton">{''}</Skeleton>);

      expect(screen.getByTestId('skeleton')).toBeEmptyDOMElement();
    });

    it('应该允许渲染不带任何属性的骨架元素', () => {
      render(<Skeleton />);

      expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    });
  });
});
