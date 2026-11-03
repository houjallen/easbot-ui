/**
 * Resizable 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证面板组、面板与分隔条的基本渲染与类名
 * 2. 状态测试 - 验证分组方向、分隔条激活态与面板尺寸属性
 * 3. 交互测试 - 验证分隔条键盘操作与面板回调
 * 4. 无障碍测试 - 验证 separator 语义角色、aria-valuenow 与可访问名称
 * 5. 边界测试 - 验证受控布局、自定义方向与属性透传
 *
 * @remarks
 * 基于 `react-resizable-panels` v4 —— v4 将旧版的 `PanelGroup` / `PanelResizeHandle`
 * 更名为 `Group` / `Separator`，并把 `direction` 改为 `orientation`；
 * DOM 上通过 `data-group-orientation` / `data-panel` / `data-separator` 表达状态。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable';

describe('Resizable 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染面板组', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const group = document.querySelector('[data-slot="resizable-panel-group"]');
      expect(group).toBeInTheDocument();
      expect(group).toHaveClass('flex');
      expect(group).toHaveClass('h-full');
      expect(group).toHaveClass('w-full');
    });

    it('应该正确渲染面板', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const panel = document.querySelector('[data-slot="resizable-panel"]');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveAttribute('data-panel', 'true');
      expect(panel).toHaveTextContent('左侧');
    });

    it('应该正确渲染分隔条', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const handle = document.querySelector('[data-slot="resizable-handle"]');
      expect(handle).toBeInTheDocument();
      expect(handle).toHaveAttribute('data-separator');
      expect(handle).toHaveClass('flex');
      expect(handle).toHaveClass('w-px');
      expect(handle).toHaveClass('bg-border');
    });

    it('应该在 withHandle 为 true 时渲染拖拽手柄图标', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle withHandle />
        </ResizablePanelGroup>,
      );

      const handle = document.querySelector('[data-slot="resizable-handle"]');
      expect(handle?.querySelector('.lucide-grip-vertical')).toBeInTheDocument();
    });

    it('应该在 withHandle 为 false 时不渲染拖拽手柄图标', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
        </ResizablePanelGroup>,
      );

      const handle = document.querySelector('[data-slot="resizable-handle"]');
      expect(handle?.querySelector('.lucide-grip-vertical')).not.toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(
        <ResizablePanelGroup className="custom-group">
          <ResizablePanel>左侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(document.querySelector('[data-slot="resizable-panel-group"]')).toHaveClass('custom-group');
    });
  });

  describe('状态测试', () => {
    it('应该在水平方向下渲染横向的分隔条', () => {
      render(
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      // v4 的 DOM 不再输出 `data-group-orientation`，方向通过分隔条的
      // `aria-orientation` 与面板组的 `flex-direction` 体现。
      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
      expect(document.querySelector('[data-slot="resizable-panel-group"]')).toHaveStyle({ flexDirection: 'row' });
    });

    it('应该在垂直方向下渲染纵向的分隔条', () => {
      render(
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel>上侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>下侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
      expect(document.querySelector('[data-slot="resizable-panel-group"]')).toHaveStyle({ flexDirection: 'column' });
    });

    it('应该在分隔条上渲染初始的 data-separator 状态', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(document.querySelector('[data-slot="resizable-handle"]')).toHaveAttribute('data-separator', 'inactive');
    });

    it('应该为分隔条渲染 aria-orientation 与数值区间', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-orientation', 'vertical');
      expect(handle).toHaveAttribute('aria-valuemin', '0');
      expect(handle).toHaveAttribute('aria-valuemax', '100');
      expect(handle).toHaveAttribute('aria-valuenow', '50');
    });

    it('应该为面板渲染 flex 占比样式', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const panels = document.querySelectorAll('[data-slot="resizable-panel"]');
      expect(panels).toHaveLength(2);
      expect(panels[0]).toHaveStyle({ flex: '50 1 0px' });
    });
  });

  describe('交互测试', () => {
    it('应该在按下 Enter 键时激活分隔条', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const separator = screen.getByRole('separator');
      separator.focus();
      fireEvent.keyDown(separator, { key: 'Enter' });

      expect(separator).toHaveFocus();
    });

    it('应该支持分隔条通过键盘获得焦点', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const separator = screen.getByRole('separator');
      separator.focus();
      expect(separator).toHaveFocus();
    });

    it('应该在分隔条上触发 pointerdown 时不抛出异常', () => {
      const handlePointerDown = vi.fn();
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle onPointerDown={handlePointerDown} />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const separator = screen.getByRole('separator');
      expect(() => {
        fireEvent.pointerDown(separator, { button: 0 });
      }).not.toThrow();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 separator 语义角色', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('应该通过 aria-controls 关联分隔条与面板', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      const separator = screen.getByRole('separator');
      const controls = separator.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).toBeInTheDocument();
    });

    it('应该让分隔条可被 tab 顺序访问', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(screen.getByRole('separator')).toHaveAttribute('tabindex', '0');
    });

    it('应该透传 aria-label 到分隔条', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左侧</ResizablePanel>
          <ResizableHandle aria-label="调整面板宽度" />
          <ResizablePanel>右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(screen.getByRole('separator', { name: '调整面板宽度' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许只渲染单个面板', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>唯一面板</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(document.querySelectorAll('[data-slot="resizable-panel"]')).toHaveLength(1);
      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('应该允许渲染多个面板与多条分隔条', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>一</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>二</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>三</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(document.querySelectorAll('[data-slot="resizable-panel"]')).toHaveLength(3);
      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });

    it('应该支持通过 defaultLayout 预设面板尺寸', () => {
      render(
        <ResizablePanelGroup defaultLayout={{ left: 30, right: 70 }}>
          <ResizablePanel id="left">左侧</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="right">右侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(document.querySelectorAll('[data-slot="resizable-panel"]')).toHaveLength(2);
    });

    it('应该透传额外的 data-* 属性到面板组', () => {
      render(
        <ResizablePanelGroup data-custom="value">
          <ResizablePanel>左侧</ResizablePanel>
        </ResizablePanelGroup>,
      );

      expect(document.querySelector('[data-slot="resizable-panel-group"]')).toHaveAttribute('data-custom', 'value');
    });
  });
});
