import { cn } from '../../utils/classnames';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';

// Type Aliases for ScrollArea
type EunScrollAreaRef = React.ElementRef<typeof ScrollAreaPrimitive.Root>;
type EunScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  /**
   * 是否渲染水平滚动条，默认为 false。
   * When true, a horizontal ScrollBar component will be rendered if content overflows horizontally.
   */
  withHorizontalScrollbar?: boolean;
};

/**
 * 滚动区域容器组件
 *
 * @description
 * 提供自定义滚动条和响应式滚动区域管理。
 * 默认显示垂直滚动条，可通过 `withHorizontalScrollbar` 属性启用水平滚动条的渲染。
 */
const ScrollArea: React.ForwardRefExoticComponent<EunScrollAreaProps & React.RefAttributes<EunScrollAreaRef>> = React.forwardRef<EunScrollAreaRef, EunScrollAreaProps>(
  ({ className, children, withHorizontalScrollbar = false, ...props }, ref) => (
    <ScrollAreaPrimitive.Root ref={ref} data-slot="scroll-area" className={cn('relative', className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar /> {/* Vertical scrollbar by default */}
      {withHorizontalScrollbar && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  ),
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// Type Aliases for ScrollBar
type EunScrollBarRef = React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>;
type EunScrollBarProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>;

/**
 * 自定义滚动条组件
 *
 * @description
 * 实现美观的滚动条样式，支持垂直/水平方向
 */
const ScrollBar: React.ForwardRefExoticComponent<EunScrollBarProps & React.RefAttributes<EunScrollBarRef>> = React.forwardRef<EunScrollBarRef, EunScrollBarProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      data-slot="scroll-area-scrollbar"
      className={cn(
        'flex touch-none select-none p-px transition-colors',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb data-slot="scroll-area-thumb" className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  ),
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
export type { ScrollAreaProps } from '@radix-ui/react-scroll-area';
