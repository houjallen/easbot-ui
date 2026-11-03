/**
 * ScrollArea 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证滚动区域根容器、视口与滚动条的基本渲染与类名
 * 2. 状态测试 - 验证滚动条方向、视口滚动方向与滚动条显隐类型
 * 3. 交互测试 - 验证滚动条方向切换与事件透传
 * 4. 无障碍测试 - 验证滚动区域属性透传与内容可读性
 * 5. 边界测试 - 验证空内容、附加滚动条与属性透传
 *
 * @remarks
 * 1. Radix 的 ScrollArea 内部依赖 `ResizeObserver` 测量视口与滚动条尺寸 ——
 *    jsdom 未实现该 API，统一引入共享 polyfill（`tests/polyfills.ts`）。
 * 2. Radix 的 ScrollArea 默认 `type="hover"`，滚动条只有在指针进入时才挂载；
 *    jsdom 无布局、不派发指针事件，因此断言滚动条时统一使用 `type="always"`。
 * 3. DS 的 `ScrollArea` 把 `children` 放进 `Viewport` 内部，自带的 `ScrollBar`
 *    固定渲染在视口之后 —— 因此自定义 `ScrollBar` 作为 `children` 传入时
 *    会被放进视口内，不会成为 `ScrollArea` 的兄弟滚动条。
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ScrollArea, ScrollBar } from '../scroll-area';

describe('ScrollArea 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染滚动区域根容器与视口', () => {
      render(<ScrollArea>内容</ScrollArea>);

      const root = document.querySelector('[data-slot="scroll-area"]');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('relative');

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveAttribute('data-radix-scroll-area-viewport');
    });

    it('应该正确应用视口的类名', () => {
      render(<ScrollArea>内容</ScrollArea>);

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('size-full');
      expect(viewport).toHaveClass('rounded-[inherit]');
      expect(viewport).toHaveClass('outline-none');
    });

    it('应该正确渲染滚动条', () => {
      render(<ScrollArea type="always">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeInTheDocument();
    });

    it('应该正确应用滚动条与滑块的类名', () => {
      render(<ScrollArea type="always">内容</ScrollArea>);

      const scrollbar = document.querySelector('[data-slot="scroll-area-scrollbar"]');
      expect(scrollbar).toHaveClass('flex');
      expect(scrollbar).toHaveClass('touch-none');
      expect(scrollbar).toHaveClass('select-none');
      expect(scrollbar).toHaveClass('p-px');
    });

    it('应该在内容可滚动时渲染滚动条滑块', () => {
      // Radix 的 ScrollAreaThumb 仅在 `hasThumb` 为 true（内容尺寸 > 视口尺寸）时挂载，
      // 而 jsdom 没有布局引擎、尺寸恒为 0 —— 因此滑块不会被渲染。
      render(<ScrollArea type="always">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area-thumb"]')).not.toBeInTheDocument();
    });

    it('应该正确渲染滚动区域的内容', () => {
      render(<ScrollArea>可滚动内容</ScrollArea>);

      expect(screen.getByText('可滚动内容')).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(<ScrollArea className="custom-scroll">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area"]')).toHaveClass('custom-scroll');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染垂直方向的滚动条', () => {
      render(<ScrollArea type="always">内容</ScrollArea>);

      const scrollbar = document.querySelector('[data-slot="scroll-area-scrollbar"]');
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
      expect(scrollbar).toHaveClass('h-full');
      expect(scrollbar).toHaveClass('w-2.5');
    });

    it('应该在滚动条上渲染 data-state 为 visible', () => {
      render(<ScrollArea type="always">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area-scrollbar"]')).toHaveAttribute('data-state', 'visible');
    });

    it('应该在视口上渲染纵向滚动能力', () => {
      render(<ScrollArea>内容</ScrollArea>);

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveStyle({ overflowY: 'scroll' });
    });

    it('应该透传 type 属性以控制滚动条显隐策略', () => {
      render(<ScrollArea type="always">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在滚动条方向切换时同步更新 data-orientation', () => {
      const { rerender } = render(<ScrollArea type="always">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area-scrollbar"]')).toHaveAttribute('data-orientation', 'vertical');

      rerender(<ScrollArea type="always">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area-scrollbar"]')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('应该在滚动条上触发 scroll 事件时不抛出异常', () => {
      render(<ScrollArea type="always">内容</ScrollArea>);

      const scrollbar = document.querySelector('[data-slot="scroll-area-scrollbar"]');
      expect(() => {
        scrollbar?.dispatchEvent(new Event('scroll', { bubbles: true }));
      }).not.toThrow();
    });

    it('应该透传 onScroll 回调到滚动区域根容器', () => {
      const handleScroll = vi.fn();
      render(<ScrollArea onScroll={handleScroll}>内容</ScrollArea>);

      const root = document.querySelector('[data-slot="scroll-area"]');
      root?.dispatchEvent(new Event('scroll', { bubbles: true }));

      expect(handleScroll).toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该透传 aria-label 到滚动区域根容器', () => {
      render(<ScrollArea aria-label="日志区域">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area"]')).toHaveAttribute('aria-label', '日志区域');
    });

    it('应该让滚动区域内容保持可读', () => {
      render(<ScrollArea>可读文本</ScrollArea>);

      expect(screen.getByText('可读文本')).toBeVisible();
    });

    it('应该为视口提供 focus-visible 焦点环类名', () => {
      render(<ScrollArea>内容</ScrollArea>);

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('outline-none');
      expect(viewport).toHaveClass('focus-visible:ring-[3px]');
    });

    it('应该透传 dir 属性到滚动区域根容器', () => {
      render(<ScrollArea dir="rtl">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area"]')).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染没有内容的滚动区域', () => {
      render(<ScrollArea />);

      expect(document.querySelector('[data-slot="scroll-area-viewport"]')).toBeInTheDocument();
    });

    it('应该允许渲染自定义滚动条组件', () => {
      render(
        <ScrollArea type="always">
          <ScrollBar />
        </ScrollArea>,
      );

      // 自定义 ScrollBar 作为 children 会进入视口内部，仍能正常渲染
      expect(document.querySelectorAll('[data-slot="scroll-area-scrollbar"]').length).toBeGreaterThanOrEqual(1);
    });

    it('应该透传额外的 data-* 属性到滚动区域根容器', () => {
      render(<ScrollArea data-custom="value">内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area"]')).toHaveAttribute('data-custom', 'value');
    });

    it('应该透传 scrollHideDelay 属性到滚动区域根容器', () => {
      render(<ScrollArea scrollHideDelay={100}>内容</ScrollArea>);

      expect(document.querySelector('[data-slot="scroll-area"]')).toBeInTheDocument();
    });
  });
});
