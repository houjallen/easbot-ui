import { render, fireEvent } from '@testing-library/react';
import { Slider } from './slider';

// jsdom 未实现 ResizeObserver，而 Radix Slider 依赖它来测量轨道尺寸，
// 因此在测试文件内局部补充一个最小可用的 polyfill。
class ResizeObserverStub implements ResizeObserver {
  observe(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  unobserve(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  disconnect(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);

describe('Slider 组件', () => {
  test('应正确渲染默认值', () => {
    const { container } = render(<Slider defaultValue={[30]} />);
    // Tailwind v4：尺寸使用 CSS 变量任意值
    const thumb = container.querySelector('.h-\\[var\\(--slider-thumb-size\\)\\].w-\\[var\\(--slider-thumb-size\\)\\]');
    expect(thumb).toBeInTheDocument();
    // 滑块数量与 defaultValue 数组长度一致
    expect(container.querySelectorAll('[role="slider"]').length).toBe(1);
    // 默认值映射到 aria-valuenow
    expect(container.querySelector('[role="slider"]')).toHaveAttribute('aria-valuenow', '30');
  });

  test('应响应值变化', () => {
    let currentValue = 0;
    const { container } = render(<Slider defaultValue={[50]} onValueChange={(val) => (currentValue = val[0] ?? 0)} />);

    const thumb = container.querySelector<HTMLElement>('[role="slider"]');
    expect(thumb).not.toBeNull();
    thumb!.focus();

    // 注意：jsdom 不执行布局（getBoundingClientRect 恒为 0），
    // 鼠标拖拽无法计算百分比，因此改用键盘方向键验证数值变化。
    fireEvent.keyDown(thumb!, { key: 'ArrowRight' });
    expect(currentValue).toBeGreaterThan(50);
  });

  test('应禁用交互', () => {
    const { container } = render(<Slider disabled />);
    // Tailwind v4：轨道背景色使用 CSS 变量任意值
    const track = container.querySelector('.bg-\\[var\\(--slider-track-background\\)\\]');
    expect(track).not.toBeNull();
    // 禁用态由根节点上的 data-disabled / aria-disabled 标识
    const root = container.querySelector('[data-orientation="horizontal"]');
    expect(root).toHaveAttribute('data-disabled');
    expect(root).toHaveAttribute('aria-disabled', 'true');
    // 滑块在禁用态应用 disabled:opacity-[var(--slider-disabled-opacity)]
    const thumb = container.querySelector('[role="slider"]');
    expect(thumb).toHaveClass('disabled:opacity-[var(--slider-disabled-opacity)]');
  });
});
