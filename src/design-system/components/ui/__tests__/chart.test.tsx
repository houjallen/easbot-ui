/**
 * Chart 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证图表容器、CSS 变量注入与类名
 * 2. 状态测试 - 验证亮/暗主题的 CSS 变量、color 与 theme 配置差异
 * 3. 交互测试 - 验证提示框与图例内容的渲染与自定义 formatter
 * 4. 无障碍测试 - 验证容器属性透传与提示框内容可读性
 * 5. 边界测试 - 验证空 config、无 Provider 报错与属性透传
 *
 * @remarks
 * 1. `recharts` 的 `ResponsiveContainer` 在 jsdom 下尺寸恒为 0 —— 因此不会真的渲染图表，
 *    断言聚焦在容器、`ChartStyle` 注入的 CSS 变量与上下文行为上。
 * 2. `ChartTooltipContent` / `ChartLegendContent` 依赖 `ChartContainer` 提供的上下文，
 *    没有 Provider 时 `useChart()` 会抛出 "useChart must be used within a <ChartContainer />"。
 */

import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ChartContainer, ChartLegendContent, ChartStyle, ChartTooltipContent } from '../chart';

/** 图表配置（包含 color 与 theme 两种写法） */
const CHART_CONFIG = {
  desktop: { label: '桌面端', color: 'hsl(210 40% 50%)' },
  mobile: { label: '移动端', theme: { light: 'hsl(150 40% 50%)', dark: 'hsl(150 60% 40%)' } },
};

/**
 * 伪造元素尺寸
 *
 * @description
 * recharts 的 `ResponsiveContainer` 会读取容器的 `getBoundingClientRect()`；
 * jsdom 没有布局引擎，尺寸恒为 0 —— 导致子元素完全不渲染。
 * 这里临时把尺寸改为非 0，使 `ChartTooltipContent` / `ChartLegendContent` 能被渲染出来。
 *
 * @returns 恢复原始实现的函数
 */
const stubElementSize = (): (() => void) => {
  const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

  return () => spy.mockRestore();
};

describe('Chart 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染图表容器', () => {
      render(<ChartContainer config={CHART_CONFIG}>{null}</ChartContainer>);

      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('aspect-video');
      expect(container).toHaveClass('justify-center');
    });

    it('应该为图表容器渲染 data-chart 标识', () => {
      render(
        <ChartContainer id="sales" config={CHART_CONFIG}>
          {null}
        </ChartContainer>,
      );

      expect(document.querySelector('[data-slot="chart"]')).toHaveAttribute('data-chart', 'chart-sales');
    });

    it('应该在未传入 id 时自动生成 data-chart 标识', () => {
      render(<ChartContainer config={CHART_CONFIG}>{null}</ChartContainer>);

      const chartId = document.querySelector('[data-slot="chart"]')?.getAttribute('data-chart');
      expect(chartId).toBeTruthy();
      expect(chartId).toMatch(/^chart-/);
    });

    it('应该注入图表主题的 style 标签', () => {
      const { container } = render(
        <ChartContainer id="sales" config={CHART_CONFIG}>
          {null}
        </ChartContainer>,
      );

      const style = container.querySelector('style');
      expect(style).toBeInTheDocument();
      expect(style?.innerHTML).toContain('[data-chart=chart-sales]');
    });

    it('应该渲染 recharts 的响应式容器', () => {
      render(<ChartContainer config={CHART_CONFIG}>{null}</ChartContainer>);

      expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(
        <ChartContainer config={CHART_CONFIG} className="custom-chart">
          {null}
        </ChartContainer>,
      );

      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toHaveClass('custom-chart');
      expect(container).toHaveClass('aspect-video');
    });
  });

  describe('状态测试', () => {
    it('应该为 color 配置注入对应的 CSS 变量', () => {
      const { container } = render(
        <ChartContainer id="sales" config={CHART_CONFIG}>
          {null}
        </ChartContainer>,
      );

      const style = container.querySelector('style');
      expect(style?.innerHTML).toContain('--color-desktop: hsl(210 40% 50%);');
    });

    it('应该为 theme 配置同时注入亮色与暗色 CSS 变量', () => {
      const { container } = render(
        <ChartContainer id="sales" config={CHART_CONFIG}>
          {null}
        </ChartContainer>,
      );

      const style = container.querySelector('style');
      expect(style?.innerHTML).toContain('--color-mobile: hsl(150 40% 50%);');
      expect(style?.innerHTML).toContain('.dark [data-chart=chart-sales]');
      expect(style?.innerHTML).toContain('--color-mobile: hsl(150 60% 40%);');
    });

    it('应该在 config 没有颜色配置时不注入 style 标签', () => {
      const { container } = render(
        <ChartContainer id="plain" config={{ desktop: { label: '桌面端' } }}>
          {null}
        </ChartContainer>,
      );

      expect(container.querySelector('style')).not.toBeInTheDocument();
    });

    it('应该为单独的 ChartStyle 渲染 style 标签', () => {
      const { container } = render(<ChartStyle id="chart-x" config={{ a: { label: 'A', color: '#ff0000' } }} />);

      const style = container.querySelector('style');
      expect(style).toBeInTheDocument();
      expect(style?.innerHTML).toContain('--color-a: #ff0000;');
    });

    it('应该在 ChartStyle 没有颜色配置时返回 null', () => {
      const { container } = render(<ChartStyle id="chart-x" config={{ a: { label: 'A' } }} />);

      expect(container.querySelector('style')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该渲染提示框的标题与数值', async () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartTooltipContent active payload={[{ dataKey: 'desktop', name: 'desktop', value: 42, graphicalItemId: 'desktop' }]} />
        </ChartContainer>,
      );

      await waitFor(() => {
        expect(screen.getAllByText('桌面端').length).toBeGreaterThan(0);
      });
      expect(screen.getByText('42')).toBeInTheDocument();
      restore();
    });

    it('应该在提示框非激活时不渲染内容', () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartTooltipContent active={false} payload={[{ dataKey: 'desktop', name: 'desktop', value: 42, graphicalItemId: 'desktop' }]} />
        </ChartContainer>,
      );

      expect(screen.queryByText('桌面端')).not.toBeInTheDocument();
      restore();
    });

    it('应该在提示框负载为空时不渲染内容', () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartTooltipContent active payload={[]} />
        </ChartContainer>,
      );

      expect(screen.queryByText('桌面端')).not.toBeInTheDocument();
      restore();
    });

    it('应该通过 formatter 渲染自定义提示内容', async () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartTooltipContent active payload={[{ dataKey: 'desktop', name: 'desktop', value: 42, graphicalItemId: 'desktop' }]} formatter={(value) => <span>格式化：{String(value)}</span>} />
        </ChartContainer>,
      );

      await waitFor(() => {
        expect(screen.getByText('格式化：42')).toBeInTheDocument();
      });
      restore();
    });

    it('应该渲染图例内容', async () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartLegendContent payload={[{ dataKey: 'desktop', value: '桌面端', color: 'red' }]} />
        </ChartContainer>,
      );

      await waitFor(() => {
        expect(screen.getByText('桌面端')).toBeInTheDocument();
      });
      restore();
    });

    it('应该在图例负载为空时不渲染内容', () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartLegendContent payload={[]} />
        </ChartContainer>,
      );

      expect(screen.queryByText('桌面端')).not.toBeInTheDocument();
      restore();
    });
  });

  describe('无障碍测试', () => {
    it('应该透传 aria-label 到图表容器', () => {
      render(
        <ChartContainer config={CHART_CONFIG} aria-label="销售趋势图">
          {null}
        </ChartContainer>,
      );

      expect(document.querySelector('[data-slot="chart"]')).toHaveAttribute('aria-label', '销售趋势图');
    });

    it('应该让提示框内容可被读取', async () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartTooltipContent active payload={[{ dataKey: 'desktop', name: 'desktop', value: 42, graphicalItemId: 'desktop' }]} />
        </ChartContainer>,
      );

      await waitFor(() => {
        expect(screen.getAllByText('桌面端')[0]).toBeVisible();
      });
      restore();
    });

    it('应该为提示框容器应用背景与边框类名', async () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartTooltipContent active payload={[{ dataKey: 'desktop', name: 'desktop', value: 42, graphicalItemId: 'desktop' }]} />
        </ChartContainer>,
      );

      await waitFor(() => {
        const tooltip = screen.getAllByText('桌面端')[0]?.closest('div.grid');
        expect(tooltip).toHaveClass('bg-background');
        expect(tooltip).toHaveClass('border-border/50');
        expect(tooltip).toHaveClass('rounded-lg');
      });
      restore();
    });
  });

  describe('边界测试', () => {
    it('应该在没有 ChartContainer 时抛出上下文错误', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      expect(() => {
        render(<ChartTooltipContent active payload={[{ dataKey: 'desktop', name: 'desktop', value: 42, graphicalItemId: 'desktop' }]} />);
      }).toThrow('useChart must be used within a <ChartContainer />');

      spy.mockRestore();
    });

    it('应该允许使用空的 config 渲染容器', () => {
      render(<ChartContainer config={{}}>{null}</ChartContainer>);

      expect(document.querySelector('[data-slot="chart"]')).toBeInTheDocument();
    });

    it('应该允许隐藏提示框标题', async () => {
      const restore = stubElementSize();
      render(
        <ChartContainer config={CHART_CONFIG}>
          <ChartTooltipContent active hideLabel payload={[{ dataKey: 'desktop', name: 'desktop', value: 42, graphicalItemId: 'desktop' }]} />
        </ChartContainer>,
      );

      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument();
      });
      // `hideLabel` 只隐藏顶部的标题块，数据项的名称仍然渲染
      expect(document.querySelector('div.font-medium')).not.toBeInTheDocument();
      restore();
    });

    it('应该透传额外的 data-* 属性到图表容器', () => {
      render(
        <ChartContainer config={CHART_CONFIG} data-custom="value">
          {null}
        </ChartContainer>,
      );

      expect(document.querySelector('[data-slot="chart"]')).toHaveAttribute('data-custom', 'value');
    });
  });
});
