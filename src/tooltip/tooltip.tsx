import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../utils/classnames';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'overflow-hidden rounded-md',
        'z-[var(--tooltip-z-index)]',
        'bg-[var(--tooltip-background)] text-[var(--tooltip-foreground)]',
        'border border-[var(--tooltip-border)] shadow-[var(--tooltip-shadow)]',
        'px-[var(--tooltip-padding-x)] py-[var(--tooltip-padding-y)]',
        'text-[var(--tooltip-font-size)]',
        'animate-in fade-in-0 zoom-in-95 duration-100',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-[var(--tooltip-slide-offset)]',
        'data-[side=left]:slide-in-from-right-[var(--tooltip-slide-offset)]',
        'data-[side=right]:slide-in-from-left-[var(--tooltip-slide-offset)]',
        'data-[side=top]:slide-in-from-bottom-[var(--tooltip-slide-offset)]',
        className,
      )}
      {...props}
    />
  ),
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

export type TooltipProps = React.ComponentProps<typeof Tooltip>;
export type TooltipContentProps = React.ComponentProps<typeof TooltipContent>;
