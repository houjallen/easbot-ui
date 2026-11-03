/**
 * Slider 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证滑块轨道、范围与滑块拇指的基本渲染与类名
 * 2. 状态测试 - 验证受控值、禁用态、方向与取值范围
 * 3. 交互测试 - 验证键盘操作与值变更回调
 * 4. 无障碍测试 - 验证 slider 语义角色、aria-valuenow 与可访问名称
 * 5. 边界测试 - 验证单值/多值滑块、自定义 min/max 与属性透传
 *
 * @remarks
 * Radix 的 Slider 内部使用 `ResizeObserver` 测量轨道尺寸 —— jsdom 未实现该 API，
 * 因此统一引入共享 polyfill（`tests/polyfills.ts`）。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Slider } from '../slider';

describe('Slider 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染滑块根容器与轨道', () => {
      render(<Slider defaultValue={[20, 60]} />);

      const root = document.querySelector('[data-slot="slider"]');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('relative');
      expect(root).toHaveClass('flex');
      expect(root).toHaveClass('w-full');

      expect(document.querySelector('[data-slot="slider-track"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="slider-range"]')).toBeInTheDocument();
    });

    it('应该正确应用轨道与范围的类名', () => {
      render(<Slider defaultValue={[20, 60]} />);

      const track = document.querySelector('[data-slot="slider-track"]');
      expect(track).toHaveClass('relative');
      expect(track).toHaveClass('grow');
      expect(track).toHaveClass('rounded-full');
      expect(track).toHaveClass('bg-muted');

      const range = document.querySelector('[data-slot="slider-range"]');
      expect(range).toHaveClass('absolute');
      expect(range).toHaveClass('bg-primary');
    });

    it('应该按照取值个数渲染对应数量的滑块拇指', () => {
      render(<Slider defaultValue={[20, 60]} />);

      expect(screen.getAllByRole('slider')).toHaveLength(2);
    });

    it('应该正确应用滑块拇指的类名', () => {
      render(<Slider defaultValue={[20]} />);

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('data-slot', 'slider-thumb');
      expect(thumb).toHaveClass('block');
      expect(thumb).toHaveClass('rounded-full');
      expect(thumb).toHaveClass('border-primary');
      expect(thumb).toHaveClass('bg-background');
    });

    it('应该正确合并自定义类名', () => {
      render(<Slider className="custom-slider" defaultValue={[10]} />);

      expect(document.querySelector('[data-slot="slider"]')).toHaveClass('custom-slider');
    });
  });

  describe('状态测试', () => {
    it('应该在受控模式下渲染外部传入的值', () => {
      render(<Slider value={[30, 70]} onValueChange={() => undefined} />);

      const thumbs = screen.getAllByRole('slider');
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '30');
      expect(thumbs[1]).toHaveAttribute('aria-valuenow', '70');
    });

    it('应该在禁用状态下渲染 aria-disabled 与禁用类名', () => {
      render(<Slider defaultValue={[50]} disabled />);

      const root = document.querySelector('[data-slot="slider"]');
      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(root).toHaveClass('data-[disabled]:opacity-50');
    });

    it('应该在水平方向下渲染 data-orientation 为 horizontal', () => {
      render(<Slider defaultValue={[50]} />);

      expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('data-orientation', 'horizontal');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('应该在垂直方向下渲染 data-orientation 为 vertical', () => {
      render(<Slider defaultValue={[50]} orientation="vertical" />);

      expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('data-orientation', 'vertical');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('应该渲染默认的取值范围 min 与 max', () => {
      render(<Slider defaultValue={[50]} />);

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('交互测试', () => {
    it('应该在按下右方向键时递增滑块值', () => {
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const thumb = screen.getByRole('slider');
      thumb.focus();
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(handleValueChange).toHaveBeenCalled();
      expect(handleValueChange).toHaveBeenCalledWith([51]);
    });

    it('应该在按下左方向键时递减滑块值', () => {
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const thumb = screen.getByRole('slider');
      thumb.focus();
      fireEvent.keyDown(thumb, { key: 'ArrowLeft' });

      expect(handleValueChange).toHaveBeenCalled();
      expect(handleValueChange).toHaveBeenCalledWith([49]);
    });

    it('应该在按下 Home 键时跳转到最小值', () => {
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const thumb = screen.getByRole('slider');
      thumb.focus();
      fireEvent.keyDown(thumb, { key: 'Home' });

      expect(handleValueChange).toHaveBeenCalled();
      expect(handleValueChange).toHaveBeenCalledWith([0]);
    });

    it('应该在按下 End 键时跳转到最大值', () => {
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const thumb = screen.getByRole('slider');
      thumb.focus();
      fireEvent.keyDown(thumb, { key: 'End' });

      expect(handleValueChange).toHaveBeenCalled();
      expect(handleValueChange).toHaveBeenCalledWith([100]);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 slider 语义角色', () => {
      render(<Slider defaultValue={[50]} />);

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('应该通过 aria-valuenow 暴露当前值', () => {
      render(<Slider defaultValue={[42]} />);

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
    });

    it('应该为多值滑块的拇指提供不同的可访问名称', () => {
      render(<Slider defaultValue={[20, 60]} />);

      expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '20');
      expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '60');
    });

    it('应该支持滑块拇指通过键盘获得焦点', () => {
      render(<Slider defaultValue={[50]} />);

      const thumb = screen.getByRole('slider');
      thumb.focus();
      expect(thumb).toHaveFocus();
    });

    it('应该透传 aria-label 到滑块根容器', () => {
      render(<Slider defaultValue={[50]} aria-label="音量" />);

      expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('aria-label', '音量');
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染单值滑块', () => {
      render(<Slider defaultValue={[50]} />);

      expect(screen.getAllByRole('slider')).toHaveLength(1);
    });

    it('应该渲染自定义的取值范围 min 与 max', () => {
      render(<Slider defaultValue={[5]} min={0} max={10} />);

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '10');
    });

    it('应该在未传入值时渲染最小值对应的单个滑块拇指', () => {
      render(<Slider />);

      // Radix 的 Slider 在未传 value / defaultValue 时内部默认取 `[min]`，
      // 因此只渲染一个拇指（取值 = min）。
      const thumbs = screen.getAllByRole('slider');
      expect(thumbs).toHaveLength(1);
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '0');
    });

    it('应该透传额外的 data-* 属性到滑块根容器', () => {
      render(<Slider defaultValue={[50]} data-custom="value" />);

      expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('data-custom', 'value');
    });
  });
});
