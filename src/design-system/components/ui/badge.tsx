import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive: 'border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'border-green-400 bg-green-50 text-green-700 *:data-[slot=alert-description]:text-green-700/90 [&>svg]:text-green-700',
        warning: 'border-yellow-400 bg-yellow-50 text-yellow-700 *:data-[slot=alert-description]:text-yellow-700/90 [&>svg]:text-yellow-700',
        info: 'border-blue-400 bg-blue-50 text-blue-700 *:data-[slot=alert-description]:text-blue-700/90 [&>svg]:text-blue-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// 新增：dot 状态点专用 class，统一透明度
const dotClass = 'ds-badge-dot';

function Badge({ className, variant, asChild = false, dot = false, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean; dot?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  // dot 状态点专用渲染
  if (dot) {
    return (
      <Comp
        data-slot="badge-dot"
        className={cn(dotClass, className)}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          opacity: 0.85,
          display: 'inline-block',
          background: 'currentColor',
        }}
        {...props}
      />
    );
  }

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
