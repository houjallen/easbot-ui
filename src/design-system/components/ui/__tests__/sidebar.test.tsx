/**
 * Sidebar 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证侧边栏容器、菜单、菜单按钮等子组件的基本渲染与类名
 * 2. 状态测试 - 验证展开/折叠状态、方向与变体属性
 * 3. 交互测试 - 验证触发器切换、菜单按钮点击与键盘快捷键
 * 4. 无障碍测试 - 验证触发器可访问名称、折叠条 aria-label 与菜单语义
 * 5. 边界测试 - 验证无 Provider 报错、受控模式与属性透传
 *
 * @remarks
 * 1. 侧边栏依赖 `SidebarProvider` 提供上下文 —— `useSidebar()` 在没有 Provider 时抛错。
 * 2. `useDevice()` 通过 User-Agent / 视口宽度判定移动端；jsdom 默认视口宽度为 1024，
 *    因此默认走桌面端渲染分支。
 * 3. `bg-sidebar` / `text-sidebar-foreground` 等 sidebar 语义类**未**在 `src/styles.css`
 *    的 `@theme inline` 中注册，因此这里只断言已在源码中出现的结构性类名。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '../sidebar';

describe('Sidebar 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染侧边栏包装容器', () => {
      render(
        <SidebarProvider>
          <span>内容</span>
        </SidebarProvider>,
      );

      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('min-h-svh');
      expect(wrapper).toHaveClass('w-full');
    });

    it('应该为包装容器注入侧边栏宽度变量', () => {
      render(
        <SidebarProvider>
          <span>内容</span>
        </SidebarProvider>,
      );

      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]') as HTMLElement;
      expect(wrapper.style.getPropertyValue('--sidebar-width')).toBe('16rem');
      expect(wrapper.style.getPropertyValue('--sidebar-width-icon')).toBe('3rem');
    });

    it('应该正确渲染触发器按钮', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger />
        </SidebarProvider>,
      );

      const trigger = screen.getByRole('button', { name: '切换侧边栏' });
      expect(trigger).toHaveAttribute('data-slot', 'sidebar-trigger');
      expect(trigger).toHaveAttribute('data-sidebar', 'trigger');
      expect(trigger).toHaveClass('size-7');
    });

    it('应该正确渲染侧边栏主体与内层容器', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const sidebar = document.querySelector('[data-slot="sidebar"]');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveAttribute('data-side', 'left');
      expect(sidebar).toHaveAttribute('data-variant', 'sidebar');

      expect(document.querySelector('[data-slot="sidebar-gap"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-container"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-inner"]')).toBeInTheDocument();
    });

    it('应该正确渲染菜单与菜单按钮', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>项目</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>,
      );

      const menu = document.querySelector('[data-slot="sidebar-menu"]');
      expect(menu?.tagName).toBe('UL');
      expect(menu).toHaveClass('flex');
      expect(menu).toHaveClass('w-full');

      const item = document.querySelector('[data-slot="sidebar-menu-item"]');
      expect(item?.tagName).toBe('LI');

      const button = document.querySelector('[data-slot="sidebar-menu-button"]');
      expect(button).toHaveAttribute('data-size', 'default');
      expect(button).toHaveAttribute('data-active', 'false');
      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('rounded-md');
    });

    it('应该正确渲染头部、内容、底部与分组结构', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>头部</SidebarHeader>
            <SidebarContent>内容</SidebarContent>
            <SidebarFooter>底部</SidebarFooter>
            <SidebarGroup>
              <SidebarGroupLabel>分组</SidebarGroupLabel>
              <SidebarGroupContent>分组内容</SidebarGroupContent>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar-header"]')).toHaveTextContent('头部');
      expect(document.querySelector('[data-slot="sidebar-content"]')).toHaveTextContent('内容');
      expect(document.querySelector('[data-slot="sidebar-footer"]')).toHaveTextContent('底部');
      expect(document.querySelector('[data-slot="sidebar-group"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-group-label"]')).toHaveTextContent('分组');
      expect(document.querySelector('[data-slot="sidebar-group-content"]')).toHaveTextContent('分组内容');
    });

    it('应该正确渲染主内容区域', () => {
      render(
        <SidebarProvider>
          <SidebarInset>主体内容</SidebarInset>
        </SidebarProvider>,
      );

      const inset = document.querySelector('[data-slot="sidebar-inset"]');
      expect(inset?.tagName).toBe('MAIN');
      expect(inset).toHaveClass('flex');
      expect(inset).toHaveClass('w-full');
      expect(inset).toHaveClass('flex-1');
      expect(inset).toHaveClass('bg-background');
    });

    it('应该正确渲染折叠条', () => {
      render(
        <SidebarProvider>
          <SidebarRail />
        </SidebarProvider>,
      );

      const rail = document.querySelector('[data-slot="sidebar-rail"]');
      expect(rail).toBeInTheDocument();
      // 默认语言为 zh-CN，折叠条的 aria-label 走内置文案表
      expect(rail).toHaveAttribute('aria-label', '切换侧边栏');
      expect(rail).toHaveAttribute('tabindex', '-1');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <SidebarProvider className="custom-provider">
          <SidebarTrigger className="custom-trigger" />
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toHaveClass('custom-provider');
      expect(screen.getByRole('button', { name: '切换侧边栏' })).toHaveClass('custom-trigger');
    });
  });

  describe('状态测试', () => {
    it('应该在默认状态下渲染 data-state 为 expanded', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-state', 'expanded');
    });

    it('应该在 defaultOpen 为 false 时渲染 data-state 为 collapsed', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-state', 'collapsed');
    });

    it('应该在折叠状态下渲染 data-collapsible 属性', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon">
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-collapsible', 'icon');
    });

    it('应该在右侧模式下渲染 data-side 为 right', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right">
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-side', 'right');
    });

    it('应该在浮动变体下渲染 data-variant 为 floating', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="floating">
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-variant', 'floating');
    });

    it('应该在 collapsible 为 none 时渲染简化结构的侧边栏', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none">
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const sidebar = document.querySelector('[data-slot="sidebar"]');
      expect(sidebar).toHaveClass('flex');
      expect(sidebar).toHaveClass('h-full');
      // 简化结构不再渲染 gap / container / inner 三层容器
      expect(document.querySelector('[data-slot="sidebar-gap"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-container"]')).not.toBeInTheDocument();
    });

    it('应该在菜单按钮上渲染激活态 data-active', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>项目</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar-menu-button"]')).toHaveAttribute('data-active', 'true');
    });

    it('应该在菜单按钮上渲染尺寸 data-size', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm">项目</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>,
      );

      const button = document.querySelector('[data-slot="sidebar-menu-button"]');
      expect(button).toHaveAttribute('data-size', 'sm');
      expect(button).toHaveClass('h-7');
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时切换侧边栏的展开状态', async () => {
      render(
        <SidebarProvider>
          <SidebarTrigger />
          <Sidebar>
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const sidebar = document.querySelector('[data-slot="sidebar"]');
      expect(sidebar).toHaveAttribute('data-state', 'expanded');

      fireEvent.click(screen.getByRole('button', { name: '切换侧边栏' }));

      await waitFor(() => {
        expect(sidebar).toHaveAttribute('data-state', 'collapsed');
      });
    });

    it('应该在点击触发器时触发 onOpenChange 回调', async () => {
      const handleOpenChange = vi.fn();
      render(
        <SidebarProvider onOpenChange={handleOpenChange}>
          <SidebarTrigger />
        </SidebarProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: '切换侧边栏' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('应该在点击带 children 的触发器时切换展开状态', async () => {
      render(
        <SidebarProvider>
          <SidebarTrigger>
            <span>自定义触发器</span>
          </SidebarTrigger>
          <Sidebar>
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const sidebar = document.querySelector('[data-slot="sidebar"]');
      fireEvent.click(screen.getByText('自定义触发器'));

      await waitFor(() => {
        expect(sidebar).toHaveAttribute('data-state', 'collapsed');
      });
    });

    it('应该在点击菜单按钮时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleClick}>项目</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: '项目' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在按下 Ctrl+B 快捷键时切换侧边栏展开状态', async () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const sidebar = document.querySelector('[data-slot="sidebar"]');

      fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

      await waitFor(() => {
        expect(sidebar).toHaveAttribute('data-state', 'collapsed');
      });
    });
  });

  describe('无障碍测试', () => {
    it('应该为触发器提供可访问名称「切换侧边栏」', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger />
        </SidebarProvider>,
      );

      expect(screen.getByRole('button', { name: '切换侧边栏' })).toBeInTheDocument();
    });

    it('应该为折叠条提供可访问名称', () => {
      render(
        <SidebarProvider>
          <SidebarRail />
        </SidebarProvider>,
      );

      expect(screen.getByRole('button', { name: '切换侧边栏' })).toBeInTheDocument();
    });

    it('应该让菜单按钮可通过键盘获得焦点', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>项目</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>,
      );

      const button = screen.getByRole('button', { name: '项目' });
      button.focus();
      expect(button).toHaveFocus();
    });

    it('应该让菜单与菜单项使用正确的语义标签', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>项目</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar-menu"]')?.tagName).toBe('UL');
      expect(document.querySelector('[data-slot="sidebar-menu-item"]')?.tagName).toBe('LI');
    });

    it('应该为搜索输入框提供可访问名称', () => {
      render(
        <SidebarProvider>
          <SidebarInput aria-label="搜索" placeholder="搜索项目" />
        </SidebarProvider>,
      );

      expect(screen.getByRole('textbox', { name: '搜索' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在没有 SidebarProvider 时让 useSidebar 抛出错误', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const Consumer = () => {
        useSidebar();
        return null;
      };

      expect(() => {
        render(<Consumer />);
      }).toThrow('useSidebar must be used within a SidebarProvider.');

      spy.mockRestore();
    });

    it('应该在受控模式下保持外部传入的展开状态', async () => {
      const handleOpenChange = vi.fn();
      render(
        <SidebarProvider open onOpenChange={handleOpenChange}>
          <SidebarTrigger />
          <Sidebar>
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const sidebar = document.querySelector('[data-slot="sidebar"]');
      fireEvent.click(screen.getByRole('button', { name: '切换侧边栏' }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      // 受控模式下展开状态由外部决定，组件本身不会自行变更
      expect(sidebar).toHaveAttribute('data-state', 'expanded');
    });

    it('应该在带 children 的触发器上剔除 Button 专属属性', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger type="submit" variant="destructive" size="lg" disabled>
            <span>自定义触发器</span>
          </SidebarTrigger>
        </SidebarProvider>,
      );

      const trigger = document.querySelector('[data-slot="sidebar-trigger"]');
      expect(trigger?.tagName).toBe('DIV');
      expect(trigger).not.toHaveAttribute('type');
      expect(trigger).not.toHaveAttribute('variant');
      expect(trigger).not.toHaveAttribute('size');
      expect(trigger).not.toBeDisabled();
    });

    it('应该允许渲染空的侧边栏', () => {
      render(
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar"]')).toBeInTheDocument();
    });

    it('应该正确渲染分隔线与附加操作元素', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupAction aria-label="新建分组">
                <span>+</span>
              </SidebarGroupAction>
            </SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>项目</SidebarMenuButton>
                <SidebarMenuAction aria-label="更多操作">···</SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>子项</SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar-separator"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-group-action"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-menu-action"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-menu-sub"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="sidebar-menu-sub-button"]')).toHaveTextContent('子项');
    });

    it('应该正确渲染菜单骨架屏', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar-menu-skeleton"]')).toBeInTheDocument();
      expect(document.querySelector('[data-sidebar="menu-skeleton-icon"]')).toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性到侧边栏容器', () => {
      render(
        <SidebarProvider>
          <Sidebar data-custom="value">
            <SidebarContent>内容</SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      expect(document.querySelector('[data-slot="sidebar-container"]')).toHaveAttribute('data-custom', 'value');
    });
  });
});
