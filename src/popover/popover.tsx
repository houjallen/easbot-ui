import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../utils/classnames';

/**
 * 浮层容器组件
 *
 * @description
 * 管理浮层的显示状态和交互逻辑
 */
const Popover = PopoverPrimitive.Root;

/**
 * 浮层触发器组件
 *
 * @description
 * 控制浮层的显示/隐藏，支持键盘交互和触摸设备
 */
const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * 浮层内容区域
 *
 * @description
 * 包含浮层内容，支持自定义位置和动画效果
 */
const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(
  ({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[var(--popover-z-index)] w-[var(--popover-width)] rounded-[var(--popover-radius)] border bg-popover p-[var(--popover-padding)] text-popover-foreground shadow-[var(--popover-shadow)] outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          '[&_input]:bg-[var(--popover-input-bg)] [&_input]:border-[var(--popover-input-border)] [&_input]:text-[var(--popover-input-text)]',
          '[&_input:focus]:border-[var(--popover-input-focus-border)] [&_input:focus]:ring-[var(--popover-input-focus-ring)]',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
export type { PopoverProps, PopoverTriggerProps, PopoverContentProps } from '@radix-ui/react-popover';
