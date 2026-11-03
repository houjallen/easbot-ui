import { cn } from '../../utils/classnames';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';
import type { buttonVariants } from './button';

const closeButtonVariants = cva(
  // 📌 **focus 而非 focus-visible** —— 关闭按钮在 Dialog / AlertDialog 打开时
  //   会被 Radix **自动聚焦**（它是内容区第一个可聚焦元素）。
  //   若用 `focus:ring-2`，程序化聚焦也会画出焦点环，
  //   表现为「打开即选中态」（用户反馈的缺陷）。
  //   `focus-visible` 只在**键盘操作**聚焦时显示焦点环，可访问性不降级。
  'inline-flex items-center justify-center rounded-md p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-foreground hover:bg-accent/20 hover:text-foreground focus-visible:ring-ring',
        secondary: 'text-secondary-foreground hover:bg-secondary/20 hover:text-secondary-foreground focus-visible:ring-ring',
        destructive: 'text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive',
        outline: 'border border-input text-foreground hover:bg-accent/20 hover:text-foreground focus-visible:ring-ring',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
        link: 'text-primary hover:text-primary hover:underline focus-visible:ring-ring',
        success: 'text-green-700 hover:bg-green-100 hover:text-green-700 focus-visible:ring-green-500',
        warning: 'text-yellow-700 hover:bg-yellow-100 hover:text-yellow-700 focus-visible:ring-yellow-500',
        info: 'text-blue-700 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-blue-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  iconClassName?: string;
}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(({ className, variant, iconClassName, ...props }, ref) => (
  <button ref={ref} className={cn(closeButtonVariants({ variant }), className)} {...props}>
    <X className={cn('h-4 w-4', iconClassName)} />
  </button>
));
CloseButton.displayName = 'CloseButton';

export { CloseButton, closeButtonVariants };
