/**
 * AspectRatio 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与比例属性
 * 2. 状态测试 - 验证不同比例值与自定义样式
 * 3. 交互测试 - 验证属性透传与事件回调
 * 4. 无障碍测试 - 验证语义角色与 aria 属性
 * 5. 边界测试 - 验证缺省比例、ratio 为 1 的极值场景
 *
 * @remarks
 * Radix 的 `AspectRatio.Root` 会渲染两层结构：
 * - 外层 wrapper 承载 `paddingBottom: ${100 / ratio}%`（比例的实际承载者）
 * - 内层是 `position: absolute` 的子内容容器（带 `data-slot="aspect-ratio"`）
 * 因此**比例断言必须打在 wrapper 上**，不能打在子内容上。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { AspectRatio } from '../aspect-ratio';

/**
 * 获取承载比例的 wrapper 元素
 *
 * @description
 * wrapper 通过 `data-radix-aspect-ratio-wrapper` 标识，
 * 是 `paddingBottom` 比例值的实际宿主元素。
 */
const getRatioWrapper = (): HTMLElement => {
  const wrapper = document.querySelector('[data-radix-aspect-ratio-wrapper]');
  if (!wrapper) {
    throw new Error('未找到 AspectRatio wrapper 元素');
  }
  return wrapper as HTMLElement;
};

describe('AspectRatio 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染宽高比容器', () => {
      render(<AspectRatio ratio={16 / 9}>内容</AspectRatio>);

      const ratio = screen.getByText('内容');
      expect(ratio).toBeInTheDocument();
      expect(ratio).toHaveAttribute('data-slot', 'aspect-ratio');
    });

    it('应该正确应用 16/9 比例', () => {
      render(<AspectRatio ratio={16 / 9}>内容</AspectRatio>);

      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '56.25%' });
    });

    it('应该正确应用 1/1 比例', () => {
      render(<AspectRatio ratio={1}>正方形</AspectRatio>);

      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '100%' });
    });

    it('应该正确渲染子内容', () => {
      render(
        <AspectRatio ratio={4 / 3}>
          <span>内部元素</span>
        </AspectRatio>,
      );

      expect(screen.getByText('内部元素')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该正确应用 4/3 比例', () => {
      render(<AspectRatio ratio={4 / 3}>内容</AspectRatio>);

      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '75%' });
    });

    it('应该正确应用 21/9 比例', () => {
      render(<AspectRatio ratio={21 / 9}>内容</AspectRatio>);

      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '42.857142857142854%' });
    });

    it('应该允许自定义 className 覆盖样式', () => {
      render(
        <AspectRatio ratio={16 / 9} className="custom-ratio">
          内容
        </AspectRatio>,
      );

      expect(screen.getByText('内容')).toHaveClass('custom-ratio');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(
        <AspectRatio ratio={1} onClick={handleClick}>
          内容
        </AspectRatio>,
      );

      fireEvent.click(screen.getByText('内容'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在更新比例后重新计算样式', () => {
      const { rerender } = render(<AspectRatio ratio={1}>内容</AspectRatio>);
      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '100%' });

      rerender(<AspectRatio ratio={2}>内容</AspectRatio>);
      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '50%' });
    });
  });

  describe('无障碍测试', () => {
    it('应该透传 aria-label 属性', () => {
      render(
        <AspectRatio ratio={1} aria-label="视频容器">
          内容
        </AspectRatio>,
      );

      expect(screen.getByLabelText('视频容器')).toBeInTheDocument();
    });

    it('应该透传 role 属性', () => {
      render(
        <AspectRatio ratio={1} role="img" aria-label="图片容器">
          内容
        </AspectRatio>,
      );

      expect(screen.getByRole('img', { name: '图片容器' })).toBeInTheDocument();
    });

    it('应该透传 data-* 属性', () => {
      render(
        <AspectRatio ratio={1} data-testid="custom-ratio">
          内容
        </AspectRatio>,
      );

      expect(screen.getByTestId('custom-ratio')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在缺省 ratio 时使用默认值 1', () => {
      render(<AspectRatio>内容</AspectRatio>);

      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '100%' });
    });

    it('应该在 ratio 为极大值时生成趋近 0 的比例', () => {
      render(<AspectRatio ratio={1000}>内容</AspectRatio>);

      expect(getRatioWrapper()).toHaveStyle({ paddingBottom: '0.1%' });
    });

    it('应该允许渲染没有子内容的宽高比容器', () => {
      const { container } = render(<AspectRatio ratio={1} aria-label="空容器" />);

      expect(container.querySelector('[data-radix-aspect-ratio-wrapper]')).toBeInTheDocument();
    });
  });
});
