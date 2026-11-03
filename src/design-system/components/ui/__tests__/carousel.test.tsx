/**
 * Carousel 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证轮播容器、内容区、幻灯片与按钮的基本渲染与类名
 * 2. 状态测试 - 验证方向、按钮禁用态与 API 回调
 * 3. 交互测试 - 验证前后翻页按钮点击与方向键操作
 * 4. 无障碍测试 - 验证 carousel / slide 语义角色、可访问名称与焦点管理
 * 5. 边界测试 - 验证单张幻灯片、自定义 opts 与属性透传
 *
 * @remarks
 * 1. `embla-carousel` v8 依赖 `window.matchMedia`（查询断点）与 `IntersectionObserver`
 *    （判断可见幻灯片）—— jsdom 两者均未实现，必须局部 stub，否则挂载即抛错。
 * 2. jsdom 没有布局引擎，轮播无法真实滚动，因此断言聚焦在 DOM 结构、
 *    按钮禁用态与回调是否被触发上。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../carousel';

/**
 * matchMedia 桩
 *
 * @description
 * jsdom 未实现 `window.matchMedia` —— embla-carousel 在激活轮播时会调用它查询断点，
 * 缺失时直接抛 "window.matchMedia is not a function"。
 * 这里用最小实现顶替（永远返回不匹配）。
 */
if (typeof window.matchMedia !== 'function') {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  window.matchMedia = globalThis.matchMedia;
}

/**
 * IntersectionObserver 桩
 *
 * @description
 * jsdom 未实现 `IntersectionObserver` —— embla-carousel 用它判断哪些幻灯片进入视口，
 * 缺失时直接抛 "IntersectionObserver is not defined"。
 */
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '';
    readonly scrollMargin = '';
    readonly thresholds: readonly number[] = [];
    observe(_target: Element): void {
      // 可视区域判断在 jsdom 中无实际意义，保持空实现
    }
    unobserve(_target: Element): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

describe('Carousel 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染轮播容器', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      const root = document.querySelector('[data-slot="carousel"]');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('relative');
      expect(root).toHaveAttribute('aria-roledescription', '轮播图');
    });

    it('应该正确渲染内容区', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      const content = document.querySelector('[data-slot="carousel-content"]');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('overflow-hidden');
    });

    it('应该正确渲染幻灯片', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
            <CarouselItem>第二张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      const items = document.querySelectorAll('[data-slot="carousel-item"]');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveClass('min-w-0');
      expect(items[0]).toHaveClass('shrink-0');
      expect(items[0]).toHaveClass('grow-0');
      expect(items[0]).toHaveClass('basis-full');
      expect(items[0]).toHaveClass('pl-4');
    });

    it('应该正确渲染前后翻页按钮', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>,
      );

      const previous = document.querySelector('[data-slot="carousel-previous"]');
      const next = document.querySelector('[data-slot="carousel-next"]');
      expect(previous).toBeInTheDocument();
      expect(next).toBeInTheDocument();
      expect(previous).toHaveClass('absolute');
      expect(previous).toHaveClass('size-8');
      expect(previous).toHaveClass('rounded-full');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Carousel className="custom-carousel">
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(document.querySelector('[data-slot="carousel"]')).toHaveClass('custom-carousel');
    });
  });

  describe('状态测试', () => {
    it('应该在初始状态禁用前后翻页按钮', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>,
      );

      expect(screen.getByRole('button', { name: '上一张幻灯片' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '下一张幻灯片' })).toBeDisabled();
    });

    it('应该在垂直方向下渲染纵向的幻灯片类名', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(document.querySelector('[data-slot="carousel-item"]')).toHaveClass('pt-4');
      expect(document.querySelector('[data-slot="carousel-content"] > div')).toHaveClass('flex-col');
    });

    it('应该在挂载后把轮播 API 通过 setApi 回调暴露出去', () => {
      const handleSetApi = vi.fn();
      render(
        <Carousel setApi={handleSetApi}>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(handleSetApi).toHaveBeenCalled();
      expect(handleSetApi.mock.calls[0]?.[0]).toBeTruthy();
    });

    it('应该在 API 就绪后可通过 API 查询当前快照', () => {
      let api: { scrollSnapList: () => number[] } | undefined;
      render(
        <Carousel
          setApi={(value) => {
            api = value;
          }}
        >
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
            <CarouselItem>第二张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(api).toBeTruthy();
      expect(typeof api?.scrollSnapList).toBe('function');
    });
  });

  describe('交互测试', () => {
    it('应该在点击下一张按钮时触发滚动', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
            <CarouselItem>第二张</CarouselItem>
          </CarouselContent>
          <CarouselNext />
        </Carousel>,
      );

      const next = screen.getByRole('button', { name: '下一张幻灯片' });
      expect(() => {
        fireEvent.click(next);
      }).not.toThrow();
    });

    it('应该在点击上一张按钮时触发滚动', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
            <CarouselItem>第二张</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
        </Carousel>,
      );

      const previous = screen.getByRole('button', { name: '上一张幻灯片' });
      expect(() => {
        fireEvent.click(previous);
      }).not.toThrow();
    });

    it('应该在按下右方向键时触发下一张滚动', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
            <CarouselItem>第二张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      const root = document.querySelector('[data-slot="carousel"]');
      expect(() => {
        fireEvent.keyDown(root as HTMLElement, { key: 'ArrowRight' });
      }).not.toThrow();
    });

    it('应该在按下左方向键时触发上一张滚动', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
            <CarouselItem>第二张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      const root = document.querySelector('[data-slot="carousel"]');
      expect(() => {
        fireEvent.keyDown(root as HTMLElement, { key: 'ArrowLeft' });
      }).not.toThrow();
    });
  });

  describe('无障碍测试', () => {
    it('应该为轮播容器暴露 carousel 的角色描述', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(document.querySelector('[data-slot="carousel"]')).toHaveAttribute('aria-roledescription', '轮播图');
    });

    it('应该为幻灯片暴露 group 角色与 slide 角色描述', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      const item = screen.getByRole('group');
      expect(item).toHaveAttribute('aria-roledescription', '幻灯片');
    });

    it('应该为上一张按钮提供可访问名称', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
        </Carousel>,
      );

      expect(screen.getByRole('button', { name: '上一张幻灯片' })).toBeInTheDocument();
    });

    it('应该为下一张按钮提供可访问名称', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
          <CarouselNext />
        </Carousel>,
      );

      expect(screen.getByRole('button', { name: '下一张幻灯片' })).toBeInTheDocument();
    });

    it('应该支持翻页按钮通过键盘获得焦点', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
          <CarouselNext disabled={false} />
        </Carousel>,
      );

      const next = screen.getByRole('button', { name: '下一张幻灯片' });
      next.focus();
      expect(next).toHaveFocus();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染只有一张幻灯片的轮播', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>唯一一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(document.querySelectorAll('[data-slot="carousel-item"]')).toHaveLength(1);
    });

    it('应该允许通过 opts 自定义轮播选项', () => {
      render(
        <Carousel opts={{ loop: true, align: 'center' }}>
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(document.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
    });

    it('应该透传 aria-label 到轮播容器', () => {
      render(
        <Carousel aria-label="图片轮播">
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(document.querySelector('[data-slot="carousel"]')).toHaveAttribute('aria-label', '图片轮播');
    });

    it('应该透传额外的 data-* 属性到轮播容器', () => {
      render(
        <Carousel data-custom="value">
          <CarouselContent>
            <CarouselItem>第一张</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );

      expect(document.querySelector('[data-slot="carousel"]')).toHaveAttribute('data-custom', 'value');
    });
  });
});
