import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative flex w-full items-start gap-x-3 rounded-lg border px-4 py-3 text-sm', // Use flexbox for layout
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'border-destructive bg-destructive/10 text-destructive *:data-[slot=alert-description]:text-destructive *:data-[slot=alert-title]:text-destructive dark:border-destructive/30 dark:bg-destructive/10 dark:text-destructive-foreground dark:*:data-[slot=alert-description]:text-destructive-foreground dark:*:data-[slot=alert-title]:text-destructive-foreground [&>svg]:text-destructive dark:[&>svg]:text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-title" className={cn('line-clamp-1 min-h-4 font-medium tracking-tight', className)} {...props}>
      {children}
    </div>
  );
}

function AlertDescription({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-description" className={cn('grid justify-items-start gap-1 text-muted-foreground text-sm [&_p]:leading-relaxed', className)} {...props}>
      {children}
    </div>
  );
}

export { Alert, AlertTitle, AlertDescription };
