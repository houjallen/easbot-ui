import { cn } from '../utils/classnames';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';

/**
 * 分隔线组件
 *
 * @description
 * 用于内容区域的视觉分割，支持水平和垂直方向
 */
const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-[var(--separator-background)]',
        orientation === 'horizontal' ? 'h-[var(--separator-horizontal-height)] w-full' : 'h-full w-[var(--separator-vertical-width)]',
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export type { SeparatorProps } from '@radix-ui/react-separator';
export { Separator };
