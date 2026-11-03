/**
 * NavigationMenu 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证打开/关闭状态、激活态、禁用态
 * 3. 交互测试 - 验证点击触发器展开内容与链接回调
 * 4. 无障碍测试 - 验证 navigation 语义角色、aria-expanded、焦点管理
 * 5. 边界测试 - 验证受控模式、视口开关、透传属性
 *
 * @remarks
 * Radix 的 `NavigationMenuTrigger` 在 `activationMode="automatic"`（默认）下通过
 * `onPointerMove`（且 `pointerType === 'mouse'`）展开内容，在 jsdom 中不稳定；
 * 而 `onClick` 走 `onItemSelect` 路径始终可用，因此测试统一用 `click` 展开内容。
 * `NavigationMenu` 根节点渲染为 `<nav>`，内容渲染到 `document.body`（portal）。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '../navigation-menu';

describe('NavigationMenu 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染导航根节点与列表', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('data-slot', 'navigation-menu');
      expect(nav).toHaveAttribute('data-viewport', 'true');
      expect(document.querySelector('[data-slot="navigation-menu-list"]')).toBeInTheDocument();
    });

    it('应该正确应用导航根节点类名', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('relative');
      expect(nav).toHaveClass('flex');
      expect(nav).toHaveClass('items-center');
      expect(nav).toHaveClass('justify-center');
    });

    it('应该正确应用列表与条目类名', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const list = document.querySelector('[data-slot="navigation-menu-list"]');
      expect(list).toHaveClass('flex');
      expect(list).toHaveClass('items-center');
      expect(list).toHaveClass('justify-center');
      expect(list).toHaveClass('gap-1');

      const item = document.querySelector('[data-slot="navigation-menu-item"]');
      expect(item).toHaveClass('relative');
    });

    it('应该正确应用触发器类名', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      expect(trigger).toHaveClass('inline-flex');
      expect(trigger).toHaveClass('h-9');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('rounded-md');
      expect(trigger).toHaveClass('bg-background');
      expect(trigger).toHaveClass('px-4');
      expect(trigger).toHaveClass('py-2');
      expect(trigger).toHaveClass('font-medium');
      expect(trigger).toHaveClass('text-sm');
      expect(trigger).toHaveClass('data-[state=open]:bg-accent/50');
    });

    it('应该正确渲染触发器内的下拉箭头图标', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      const icon = trigger.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveClass('size-3');
    });

    it('应该正确应用链接类名', async () => {
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const link = await screen.findByRole('link', { name: '产品 A' });
      expect(link).toHaveAttribute('data-slot', 'navigation-menu-link');
      expect(link).toHaveClass('flex');
      expect(link).toHaveClass('flex-col');
      expect(link).toHaveClass('gap-1');
      expect(link).toHaveClass('rounded-sm');
      expect(link).toHaveClass('p-2');
      expect(link).toHaveClass('text-sm');
      expect(link).toHaveClass('hover:bg-accent');
      expect(link).toHaveClass('data-[active=true]:bg-accent/50');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <NavigationMenu className="custom-root">
          <NavigationMenuList className="custom-list">
            <NavigationMenuItem className="custom-item">
              <NavigationMenuTrigger className="custom-trigger">产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByRole('navigation')).toHaveClass('custom-root');
      expect(document.querySelector('[data-slot="navigation-menu-list"]')).toHaveClass('custom-list');
      expect(document.querySelector('[data-slot="navigation-menu-item"]')).toHaveClass('custom-item');
      expect(screen.getByRole('button', { name: '产品' })).toHaveClass('custom-trigger');
    });

    it('应该正确暴露触发器样式生成函数', () => {
      const className = navigationMenuTriggerStyle();
      expect(className).toContain('inline-flex');
      expect(className).toContain('rounded-md');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在点击触发器后渲染打开状态', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该在关闭状态下不渲染内容面板', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.queryByRole('link', { name: '产品 A' })).not.toBeInTheDocument();
    });

    it('应该在激活链接上渲染 data-active 与 aria-current', async () => {
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a" active>
                  产品 A
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const link = await screen.findByRole('link', { name: '产品 A' });
      expect(link).toHaveAttribute('data-active');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('应该在未激活链接上不渲染 data-active', async () => {
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-b">产品 B</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const link = await screen.findByRole('link', { name: '产品 B' });
      expect(link).not.toHaveAttribute('data-active');
      expect(link).not.toHaveAttribute('aria-current');
    });

    it('应该在禁用触发器上渲染 disabled 属性', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger disabled>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled');
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时展开内容面板', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      fireEvent.click(screen.getByRole('button', { name: '产品' }));

      expect(await screen.findByRole('link', { name: '产品 A' })).toBeInTheDocument();
    });

    it('应该在点击触发器时触发值变更回调', async () => {
      const handleValueChange = vi.fn();
      render(
        <NavigationMenu onValueChange={handleValueChange}>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      fireEvent.click(screen.getByRole('button', { name: '产品' }));

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('product');
      });
    });

    it('应该在点击链接时触发 onSelect 回调', async () => {
      const handleSelect = vi.fn();
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a" onSelect={handleSelect}>
                  产品 A
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      fireEvent.click(await screen.findByRole('link', { name: '产品 A' }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('应该在点击链接时触发 onClick 回调', async () => {
      const handleClick = vi.fn();
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a" onClick={handleClick}>
                  产品 A
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      fireEvent.click(await screen.findByRole('link', { name: '产品 A' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在再次点击触发器时关闭内容面板', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      fireEvent.click(trigger);
      await screen.findByRole('link', { name: '产品 A' });

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: '产品 A' })).not.toBeInTheDocument();
      });
    });

    it('应该在点击禁用触发器时不展开内容面板', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger disabled>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      fireEvent.click(screen.getByRole('button', { name: '产品' }));

      expect(screen.queryByRole('link', { name: '产品 A' })).not.toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 navigation 语义角色', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('应该暴露 button 语义角色的触发器', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByRole('button', { name: '产品' })).toBeInTheDocument();
    });

    it('应该暴露 link 语义角色的导航链接', async () => {
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(await screen.findByRole('link', { name: '产品 A' })).toBeInTheDocument();
    });

    it('应该通过 aria-expanded 暴露触发器的展开状态', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('应该通过 aria-controls 关联触发器与内容面板', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-controls');
      });
      const controls = trigger.getAttribute('aria-controls');
      expect(document.getElementById(controls as string)).toBeInTheDocument();
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByRole('button', { name: '产品' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该透传 aria-label 到导航根节点', () => {
      render(
        <NavigationMenu aria-label="主导航">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的展开值', async () => {
      const handleValueChange = vi.fn();
      render(
        <NavigationMenu value="" onValueChange={handleValueChange}>
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      fireEvent.click(screen.getByRole('button', { name: '产品' }));

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('product');
      });
      // 受控模式下展开值由外部决定，组件本身不会自行变更
      expect(screen.queryByRole('link', { name: '产品 A' })).not.toBeInTheDocument();
    });

    it('应该在关闭视口时不渲染视口容器', () => {
      render(
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByRole('navigation')).toHaveAttribute('data-viewport', 'false');
      expect(document.querySelector('[data-slot="navigation-menu-viewport"]')).not.toBeInTheDocument();
    });

    it('应该在开启视口且菜单展开时渲染视口容器', () => {
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      // Radix 的 Viewport 仅在菜单展开（有激活项）时渲染
      expect(document.querySelector('[data-slot="navigation-menu-viewport"]')).toBeInTheDocument();
    });

    it('应该允许渲染没有子项的导航条目', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByRole('button', { name: '产品' })).toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性到导航根节点', () => {
      render(
        <NavigationMenu data-custom="value">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByRole('navigation')).toHaveAttribute('data-custom', 'value');
    });

    it('应该渲染内容面板', async () => {
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/product-a">产品 A</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const content = await screen.findByRole('link', { name: '产品 A' });
      expect(content.closest('[data-slot="navigation-menu-content"]')).toBeInTheDocument();
    });

    it('应该允许单独渲染视口组件', () => {
      render(
        <NavigationMenu defaultValue="product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>,
      );

      expect(document.querySelector('[data-slot="navigation-menu-viewport"]')).toBeInTheDocument();
    });
  });
});
