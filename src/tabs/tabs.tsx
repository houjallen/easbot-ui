import { cn } from '../utils/classnames';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

/**
 * 标签页组件
 *
 * @description
 * 提供内容分页切换功能，支持以下核心特性：
 * 1. 受控/非受控模式
 * 2. 响应式布局
 * 3. 无障碍访问支持
 * 4. 自定义样式扩展
 * 5. 动画过渡效果
 */
const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={cn('w-full', className)} {...props} />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

/**
 * 标签页列表容器
 * @param className 自定义类名
 */
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('inline-flex items-center justify-center', 'gap-[var(--tabs-gap)]', 'border-b border-[var(--tabs-border)]', 'w-full', className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * 标签页触发器
 * @param className 自定义类名
 */
const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, disabled, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative pb-2 text-base font-normal text-[var(--tabs-text)]',
      'transition-all duration-200 ease-in-out',
      'hover:text-[var(--tabs-text-hover)]',
      'data-[state=active]:text-[var(--tabs-text-active)]',
      'after:absolute after:bottom-0 after:left-0',
      'after:h-[var(--tabs-indicator-height)] after:w-full',
      'after:bg-transparent after:transition-colors after:duration-200',
      'data-[state=active]:after:bg-[var(--tabs-indicator)]',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    disabled={disabled}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * 标签页内容区域
 * @param className 自定义类名
 */
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 text-[var(--tabs-text-active)]',
      'w-full',
      'ring-offset-[var(--tabs-ring-offset)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tabs-ring)] focus-visible:ring-offset-2',
      'transition-opacity duration-200 ease-in-out',
      'data-[state=inactive]:opacity-0 data-[state=active]:opacity-100',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// 类型导出
export type TabsProps = React.ComponentProps<typeof Tabs>;
export type TabsListProps = React.ComponentProps<typeof TabsList>;
export type TabsTriggerProps = React.ComponentProps<typeof TabsTrigger>;
export type TabsContentProps = React.ComponentProps<typeof TabsContent>;

export { Tabs, TabsContent, TabsList, TabsTrigger };
