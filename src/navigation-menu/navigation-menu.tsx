import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/classnames';

/**
 * 导航菜单根组件
 *
 * @description
 * 提供响应式导航菜单容器，管理子菜单布局和交互
 */
const NavigationMenu = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Root>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>>(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Root ref={ref} className={cn('relative z-[var(--nav-menu-z-index)] flex max-w-max flex-1 items-center justify-center', className)} {...props}>
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  ),
);
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

/**
 * 导航菜单列表容器
 *
 * @description
 * 包裹所有导航菜单项，处理布局和间距
 */
const NavigationMenuList = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.List>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.List ref={ref} className={cn('group flex flex-1 list-none items-center justify-center space-x-[var(--nav-menu-item-spacing)]', className)} {...props} />
  ),
);
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

/**
 * 菜单项触发器
 *
 * @description
 * 控制子菜单的展开/收起，支持键盘导航和触摸交互
 */
const NavigationMenuTrigger = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerVariants(), 'group', className)} {...props}>
      {children}
      <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  ),
);
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerVariants = cva(
  'group inline-flex h-[var(--nav-menu-trigger-height)] w-max items-center justify-center rounded-[var(--nav-menu-trigger-radius)] bg-background px-[var(--nav-menu-trigger-padding-x)] py-[var(--nav-menu-trigger-padding-y)] text-[var(--nav-menu-trigger-font-size)] font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
);

/**
 * 导航菜单内容区域
 *
 * @description
 * 包含子菜单项内容，支持响应式布局和动画效果
 */
const NavigationMenuContent = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto',
        className,
      )}
      {...props}
    />
  ),
);
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>>(
  ({ className, ...props }, ref) => (
    <div className={cn('absolute left-0 top-full flex justify-center')}>
      <NavigationMenuPrimitive.Viewport
        className={cn(
          'origin-top-center relative mt-[var(--nav-menu-viewport-margin)] h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-[var(--nav-menu-viewport-radius)] border bg-popover text-popover-foreground shadow-[var(--nav-menu-viewport-shadow)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  ),
);
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

export { navigationMenuTriggerVariants, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuViewport };

export type { NavigationMenuProps, NavigationMenuTriggerProps, NavigationMenuContentProps, NavigationMenuLinkProps, NavigationMenuViewportProps } from '@radix-ui/react-navigation-menu';
