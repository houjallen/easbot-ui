import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '../utils/classnames';

/**
 * 滚动区域容器组件
 *
 * @description
 * 提供自定义滚动条和响应式滚动区域管理
 */
const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation="vertical" />
    <ScrollBar orientation="horizontal" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

/**
 * 自定义滚动条组件
 *
 * @description
 * 实现美观的滚动条样式，支持垂直/水平方向
 */
const ScrollBar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        'flex touch-none select-none transition-all duration-150 ease-in-out',
        orientation === 'vertical' && ['h-full w-[var(--scroll-bar-width)]', 'border-l border-l-transparent', 'p-[var(--scroll-bar-padding)]', 'hover:bg-[var(--scroll-bar-hover-bg)]'],
        orientation === 'horizontal' && ['h-[var(--scroll-bar-width)] w-full', 'border-t border-t-transparent', 'p-[var(--scroll-bar-padding)]', 'hover:bg-[var(--scroll-bar-hover-bg)]'],
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className={cn(
          'relative flex-1 rounded-[var(--scroll-bar-thumb-radius)]',
          'bg-[var(--scroll-bar-thumb-color)]',
          'transition-colors duration-150 ease-in-out',
          'hover:bg-[var(--scroll-bar-thumb-hover-color)]',
          // 确保水平滚动条的滑块不会占满整个轨道
          orientation === 'horizontal' && 'max-w-[var(--scroll-bar-thumb-max-size)]',
          // 确保垂直滚动条的滑块不会占满整个轨道
          orientation === 'vertical' && 'max-h-[var(--scroll-bar-thumb-max-size)]',
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  ),
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
export type { ScrollAreaProps } from '@radix-ui/react-scroll-area';
