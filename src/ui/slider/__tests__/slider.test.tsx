import { fireEvent, render, screen } from '@testing-library/react';
import { Slider } from '../slider';

/**
 * Slider 组件测试
 *
 * @description
 * Slider 基于 Radix `Slider` 封装：
 * - 滑块（thumb）语义角色为 `slider`，通过 `data-slot="slider-thumb"` 定位；
 * - 轨道（track）的禁用态由根节点的 `data-[disabled]:opacity-50` 控制；
 * - 数值变化通过 `onValueChange` 回调暴露。
 */
describe('Slider 组件', () => {
  test('应正确渲染默认值', () => {
    const { container } = render(<Slider defaultValue={[30]} />);
    const thumb = container.querySelector('[data-slot="slider-thumb"]');
    expect(thumb).toBeInTheDocument();
    // 单值滑块只渲染一个滑块
    expect(container.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(1);
    expect(thumb).toHaveAttribute('aria-valuenow', '30');
  });

  test('应响应值变化', () => {
    let currentValue = 0;
    const { container } = render(<Slider defaultValue={[50]} onValueChange={(val) => (currentValue = val[0] ?? 0)} />);

    const slider = container.querySelector('[data-slot="slider-thumb"]')!;
    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    expect(currentValue).toBeGreaterThan(50);
  });

  test('应禁用交互', () => {
    const { container } = render(<Slider disabled />);
    const root = container.querySelector('[data-slot="slider"]');
    // 禁用态由根节点的 `data-disabled` 驱动，配合 `data-[disabled]:opacity-50` 样式
    expect(root).toHaveAttribute('data-disabled');
    expect(root).toHaveClass('data-[disabled]:opacity-50');
    expect(container.querySelector('[data-slot="slider-thumb"]')).toHaveAttribute('data-disabled');
  });

  test('应支持键盘调整数值', () => {
    let currentValue = 0;
    render(<Slider defaultValue={[20]} onValueChange={(val) => (currentValue = val[0] ?? 0)} />);

    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });

    expect(currentValue).toBe(21);
  });
});
