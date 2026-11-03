/**
 * Drawer 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证触发器、遮罩、内容区与标题描述的基本渲染与类名
 * 2. 状态测试 - 验证打开/关闭状态、方向属性与内容区样式
 * 3. 交互测试 - 验证触发器打开、关闭按钮关闭与回调
 * 4. 无障碍测试 - 验证 dialog 语义角色、aria-labelledby 与可访问名称
 * 5. 边界测试 - 验证四个方向、无描述与属性透传
 *
 * @remarks
 * 基于 `vaul` v1 —— 抽屉内容渲染到 `document.body`（portal），
 * 因此必须用 `screen.findByRole(...)` 查询。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../drawer';

/**
 * matchMedia 桩
 *
 * @description
 * jsdom 未实现 `window.matchMedia` —— vaul 在打开抽屉时用它查询
 * `(prefers-reduced-motion)` 等媒体查询，缺失时直接抛错。
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

describe('Drawer 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染抽屉触发器', () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
        </Drawer>,
      );

      const trigger = screen.getByRole('button', { name: '打开抽屉' });
      expect(trigger).toHaveAttribute('data-slot', 'drawer-trigger');
      expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在打开时渲染抽屉内容区', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const content = await screen.findByRole('dialog');
      expect(content).toHaveAttribute('data-slot', 'drawer-content');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('bg-background');
    });

    it('应该正确渲染遮罩层', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const overlay = await screen.findByText('', { selector: '[data-slot="drawer-overlay"]' });
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('z-50');
    });

    it('应该正确渲染抽屉标题与描述', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
            <DrawerDescription>抽屉描述</DrawerDescription>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      expect(await screen.findByText('抽屉标题')).toHaveAttribute('data-slot', 'drawer-title');
      expect(await screen.findByText('抽屉描述')).toHaveAttribute('data-slot', 'drawer-description');
    });

    it('应该正确渲染头部与底部容器', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>头部</DrawerHeader>
            <DrawerFooter>底部</DrawerFooter>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      expect(await screen.findByText('头部')).toHaveAttribute('data-slot', 'drawer-header');
      expect(await screen.findByText('底部')).toHaveAttribute('data-slot', 'drawer-footer');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Drawer>
          <DrawerTrigger className="custom-trigger">打开抽屉</DrawerTrigger>
        </Drawer>,
      );

      expect(screen.getByRole('button', { name: '打开抽屉' })).toHaveClass('custom-trigger');
    });
  });

  describe('状态测试', () => {
    it('应该在关闭状态下渲染 data-state 为 closed', () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
        </Drawer>,
      );

      expect(screen.getByRole('button', { name: '打开抽屉' })).toHaveAttribute('data-state', 'closed');
    });

    it('应该在打开状态下渲染 data-state 为 open', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      await waitFor(() => {
        // 抽屉打开后 Radix 会把外部内容标记为 aria-hidden，因此按属性选择器查询
        expect(document.querySelector('[data-slot="drawer-trigger"]')).toHaveAttribute('data-state', 'open');
      });
    });

    it('应该在底部方向下渲染底部定位类名', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent side="bottom">
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('inset-x-0');
      expect(content).toHaveClass('bottom-0');
      expect(content).toHaveClass('rounded-t-lg');
      expect(content).toHaveAttribute('data-vaul-drawer-direction', 'bottom');
    });

    it('应该在顶部方向下渲染顶部定位类名', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent side="top">
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('top-0');
      expect(content).toHaveClass('rounded-b-lg');
    });

    it('应该在右侧方向下渲染右侧定位类名', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent side="right">
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('right-0');
      expect(content).toHaveClass('w-3/4');
    });

    it('应该在左侧方向下渲染左侧定位类名', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent side="left">
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const content = await screen.findByRole('dialog');
      expect(content).toHaveClass('left-0');
      expect(content).toHaveClass('w-3/4');
    });

    it('应该通过 Drawer 的 direction 属性控制 vaul 的展开方向', async () => {
      render(
        <Drawer direction="right">
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent side="right">
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const content = await screen.findByRole('dialog');
      expect(content).toHaveAttribute('data-vaul-drawer-direction', 'right');
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时打开抽屉', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该在点击关闭按钮时关闭抽屉', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));
      await screen.findByRole('dialog');

      fireEvent.click(screen.getByRole('button', { name: '关闭' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('应该在点击自定义关闭按钮时关闭抽屉', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
            <DrawerClose>关闭</DrawerClose>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));
      await screen.findByRole('dialog');

      // 内置关闭按钮与自定义 DrawerClose 同名「关闭」，此处定位自定义按钮
      fireEvent.click(screen.getAllByRole('button', { name: '关闭' })[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('应该在打开状态变化时触发 onOpenChange 回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer onOpenChange={handleOpenChange}>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 dialog 语义角色', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('应该通过 aria-labelledby 关联抽屉标题', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      const dialog = await screen.findByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy as string)).toHaveTextContent('抽屉标题');
    });

    it('应该为触发器暴露 aria-haspopup 与 aria-expanded', () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
        </Drawer>,
      );

      const trigger = screen.getByRole('button', { name: '打开抽屉' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该为内置关闭按钮提供可访问名称', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      expect(await screen.findByRole('button', { name: '关闭' })).toBeInTheDocument();
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
        </Drawer>,
      );

      const trigger = screen.getByRole('button', { name: '打开抽屉' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染没有描述的抽屉', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>抽屉标题</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      expect(await screen.findByText('抽屉标题')).toBeInTheDocument();
      expect(screen.queryByText('抽屉描述')).not.toBeInTheDocument();
    });

    it('应该允许渲染没有标题的抽屉', async () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
          <DrawerContent>
            <p>只有内容</p>
          </DrawerContent>
        </Drawer>,
      );

      fireEvent.click(screen.getByRole('button', { name: '打开抽屉' }));

      expect(await screen.findByText('只有内容')).toBeInTheDocument();
    });

    it('应该允许渲染没有内容区的抽屉', () => {
      render(
        <Drawer>
          <DrawerTrigger>打开抽屉</DrawerTrigger>
        </Drawer>,
      );

      expect(screen.getByRole('button', { name: '打开抽屉' })).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Drawer>
          <DrawerTrigger data-custom="value">打开抽屉</DrawerTrigger>
        </Drawer>,
      );

      expect(screen.getByRole('button', { name: '打开抽屉' })).toHaveAttribute('data-custom', 'value');
    });
  });
});
