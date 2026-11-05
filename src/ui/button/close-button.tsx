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
  // 📌 **禁用态用 `disabled:cursor-not-allowed` 而非 `disabled:pointer-events-none`** ——
  //    `pointer-events: none` 会让元素对鼠标完全透明，`cursor: not-allowed` 永远不会生效。
  //    详见 `src/theme/styles/prefix.css` 的「全局 button 鼠标样式」说明。
  'inline-flex items-center justify-center rounded-md p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      // ⚠️ hover 一律加 `not-disabled:` 前缀（`:hover` 对 `button:disabled` 依然命中，
      //    禁用关闭按钮悬停仍会浮出背景，见 spec/css-standard.md §4.9.3）。
      // 📌 hover 强度与 `Button` / `IconButton` 同基准 —— 必须肉眼可辨：
      //    此前 default/secondary/outline 只有 `bg-accent/20`（≈ 2% 灰，白底上不可见）、
      //    destructive 只有 `bg-destructive/10`，用户悬停时以为「没有 mouse over」。
      variant: {
        default: 'text-foreground not-disabled:hover:bg-accent focus-visible:ring-ring',
        secondary: 'text-secondary-foreground not-disabled:hover:bg-secondary/80 not-disabled:hover:text-secondary-foreground focus-visible:ring-ring',
        destructive: 'text-destructive not-disabled:hover:bg-destructive/20 not-disabled:hover:text-destructive focus-visible:ring-destructive',
        outline: 'border border-input text-foreground not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground focus-visible:ring-ring',
        ghost: 'text-foreground not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground focus-visible:ring-ring',
        link: 'text-primary not-disabled:hover:text-primary not-disabled:hover:underline focus-visible:ring-ring',
        success: 'text-green-700 not-disabled:hover:bg-green-100 not-disabled:hover:text-green-700 focus-visible:ring-green-500',
        warning: 'text-yellow-700 not-disabled:hover:bg-yellow-100 not-disabled:hover:text-yellow-700 focus-visible:ring-yellow-500',
        info: 'text-blue-700 not-disabled:hover:bg-blue-100 not-disabled:hover:text-blue-700 focus-visible:ring-blue-500',
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
