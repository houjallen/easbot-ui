/**
 * Skeleton 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证骨架容器的基础样式与自定义类名
 * 2. 状态测试 - 验证响应式尺寸类名的透传
 * 3. 无障碍测试 - 验证 aria 属性透传
 *
 * 说明：`Skeleton` 渲染的是普通 `div`，不自带 `status` 语义角色，
 * 需要无障碍语义时由消费方通过 `role` / `aria-*` 自行补充。
 */

import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

import { Skeleton } from '../skeleton';

describe('Skeleton 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应正确渲染基础骨架', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-md');
      expect(skeleton).toHaveClass('bg-accent');
    });

    it('应应用自定义类名', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应支持响应式尺寸', () => {
      const { container } = render(<Skeleton className="md:w-1/2" />);
      expect(container.firstChild).toHaveClass('md:w-1/2');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应透传aria属性', () => {
      const { container } = render(<Skeleton role="status" aria-label="加载中" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', '加载中');
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', '加载中');
    });
  });
});
