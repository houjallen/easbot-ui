import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  // 📌 **禁用态用 `disabled:cursor-not-allowed` 而非 `disabled:pointer-events-none`** ——
  //    `pointer-events: none` 会让元素对鼠标完全透明，浏览器解析光标时命中的是**下层元素**，
  //    于是 `cursor: not-allowed` 永远不会生效（用户看到的仍是默认箭头）。
  //    详见 `src/theme/styles/prefix.css` 的「全局 button 鼠标样式」说明。
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      // ⚠️ hover 一律加 `not-disabled:` 前缀 —— `:hover` 对 `button:disabled` 依然命中，
      //    禁用按钮悬停时背景仍会变化（视觉上「禁用还亮着」）。
      //    不用 `enabled:hover:`：`asChild` 渲染成 `<a>` 时 `:enabled` 不成立，链接按钮会丢 hover。
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs not-disabled:hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-xs not-disabled:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground dark:border-input dark:bg-input-background/30 dark:not-disabled:hover:bg-input-background/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs not-disabled:hover:bg-secondary/80',
        ghost: 'not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground dark:not-disabled:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 not-disabled:hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
