import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Slider } from '../slider';

/**
 * Slider 组件测试
 *
 * @description
 * Slider 基于 Radix `Slider` 封装：
 * - 滑块（thumb）语义角色为 `slider`，通过 `data-slot="slider-thumb"` 定位；
 * - 轨道（track）的禁用态由根节点的 `data-[disabled]:opacity-50` 控制；
 * - 数值变化通过 `onValueChange` 回调暴露。
 *
 * ⚠️ Root / Track / Thumb 全是 `<span>`，**没有** HTML `disabled` 属性，
 * 只有 `data-disabled` —— 禁用态样式必须用 `data-[disabled]:` 变体，
 * `disabled:` 变体（`:disabled` 伪类）在这里永远不生效。
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

  /**
   * 鼠标指针：可用态 pointer / 禁用态 not-allowed
   *
   * @description
   * 回归背景：全局 prefix.css 只给 `button` / `[role=button]` 设 cursor，
   * 而 Slider 是 span（Thumb 的 role 为 `slider`），不写类名就是默认箭头。
   * 参考 Switch（`button` + `disabled:cursor-not-allowed`）时不能直接照搬变体，
   * 必须用 `data-[disabled]:` —— 见文件头说明。
   */
  describe('鼠标指针样式', () => {
    test('可用态根节点与圆点都应是 cursor-pointer', () => {
      const { container } = render(<Slider defaultValue={[30]} />);
      const root = container.querySelector('[data-slot="slider"]');
      const thumb = container.querySelector('[data-slot="slider-thumb"]');

      expect(root).toHaveClass('cursor-pointer');
      expect(thumb).toHaveClass('cursor-pointer');
      // 全库交互控件统一指针语义，不得引入 grab / grabbing
      expect(thumb?.className).not.toMatch(/cursor-grab/);
    });

    test('区间模式的两个圆点都应有 cursor-pointer', () => {
      const { container } = render(<Slider defaultValue={[20, 80]} />);
      const thumbs = container.querySelectorAll('[data-slot="slider-thumb"]');

      expect(thumbs).toHaveLength(2);
      thumbs.forEach((thumb) => {
        expect(thumb).toHaveClass('cursor-pointer');
      });
    });

    test('禁用态根节点与圆点都应使用 data-[disabled]:cursor-not-allowed', () => {
      const { container } = render(<Slider disabled />);
      const root = container.querySelector('[data-slot="slider"]');
      const thumb = container.querySelector('[data-slot="slider-thumb"]');

      expect(root).toHaveClass('data-[disabled]:cursor-not-allowed');
      expect(thumb).toHaveClass('data-[disabled]:cursor-not-allowed');
    });

    test('不得使用对 span 永不生效的 disabled: 变体', () => {
      const { container } = render(<Slider disabled />);
      const classNames = [container.querySelector('[data-slot="slider"]')?.className, container.querySelector('[data-slot="slider-thumb"]')?.className].join(' ');

      expect(classNames).not.toMatch(/(^|\s)disabled:/);
    });

    test('禁用态不得用 pointer-events-none 表达禁用（规范 css-standard.md §4.9）', () => {
      const { container } = render(<Slider disabled />);
      const root = container.querySelector('[data-slot="slider"]');
      const thumb = container.querySelector('[data-slot="slider-thumb"]');

      // 只禁「禁用态屏蔽指针事件」；装饰性图标的 `[&_svg]:pointer-events-none` 属规范 §4.9 豁免
      expect(root?.className).not.toContain('data-[disabled]:pointer-events-none');
      expect(thumb?.className).not.toContain('data-[disabled]:pointer-events-none');
    });

    test('禁用态应关闭悬停反馈（hover ring 不得误导为可交互）', () => {
      const { container } = render(<Slider disabled />);
      const thumb = container.querySelector('[data-slot="slider-thumb"]');

      expect(thumb).toHaveClass('data-[disabled]:hover:ring-0');
    });
  });

  describe('禁用态鼠标与键盘事件', () => {
    test('禁用时指针按下与方向键都不应触发 onValueChange', () => {
      const onValueChange = vi.fn();
      const { container } = render(<Slider defaultValue={[50]} disabled onValueChange={onValueChange} />);
      const thumb = container.querySelector('[data-slot="slider-thumb"]');
      if (!thumb) throw new Error('未找到滑块圆点');

      fireEvent.pointerDown(thumb, { button: 0, pointerType: 'mouse' });
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    test('可用时方向键仍应触发 onValueChange（修复不得误伤交互）', () => {
      const onValueChange = vi.fn();
      const { container } = render(<Slider defaultValue={[50]} onValueChange={onValueChange} />);
      const thumb = container.querySelector('[data-slot="slider-thumb"]');
      if (!thumb) throw new Error('未找到滑块圆点');

      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(onValueChange).toHaveBeenCalled();
    });
  });
});
