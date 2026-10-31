import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/classnames';

/**
 * 开关按钮组件
 *
 * @description
 * 提供状态切换功能，支持以下核心特性：
 * 1. 多种样式变体
 * 2. 尺寸控制
 * 3. 无障碍访问支持
 * 4. 键盘操作支持
 * 5. 自定义样式扩展
 */
const toggleVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'bg-[var(--toggle-background)] hover:bg-[var(--toggle-hover-background)] hover:text-[var(--toggle-hover-foreground)]',
    'ring-offset-[var(--toggle-ring-offset)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--toggle-ring)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-[var(--toggle-disabled-opacity)]',
    'data-[state=on]:bg-[var(--toggle-active-background)] data-[state=on]:text-[var(--toggle-active-foreground)]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-[var(--toggle-background)]',
        outline: 'border border-[var(--toggle-outline-border)] bg-transparent hover:bg-[var(--toggle-outline-hover-background)] hover:text-[var(--toggle-outline-hover-foreground)]',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, ToggleProps>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

// 明确定义 Props 类型
export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /** 自定义类名 */
    className?: string;
    /** 样式变体 */
    variant?: 'default' | 'outline';
    /** 尺寸规格 */
    size?: 'default' | 'sm' | 'lg';
  };

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
