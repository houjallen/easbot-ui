import { cn } from '../utils/classnames';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * 开关切换组件
 *
 * @description
 * 提供状态切换交互控件，支持以下核心功能：
 * 1. 受控/非受控模式
 * 2. 无障碍访问支持
 * 3. 自定义样式扩展
 * 4. 禁用状态处理
 * 5. 交互动画效果
 * 6. 多种尺寸选项（sm/md/lg）
 */

// 定义开关组件的尺寸变体
const switchVariants = cva('peer group inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 ease-in-out', {
  variants: {
    size: {
      sm: 'h-[var(--switch-sm-height)] w-[var(--switch-sm-width)]',
      md: 'h-[var(--switch-md-height)] w-[var(--switch-md-width)]',
      lg: 'h-[var(--switch-lg-height)] w-[var(--switch-lg-width)]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// 定义滑块的尺寸变体
const thumbVariants = cva(
  'pointer-events-none block rounded-full shadow-[var(--switch-thumb-shadow)] ring-0 transition-all duration-200 ease-in-out bg-[var(--switch-thumb-background)] group-hover:shadow-md group-active:scale-95',
  {
    variants: {
      size: {
        sm: 'h-[var(--switch-sm-thumb-size)] w-[var(--switch-sm-thumb-size)] data-[state=checked]:translate-x-[calc(var(--switch-sm-width)_-_var(--switch-sm-height))]',
        md: 'h-[var(--switch-md-thumb-size)] w-[var(--switch-md-thumb-size)] data-[state=checked]:translate-x-[calc(var(--switch-md-width)_-_var(--switch-md-height))]',
        lg: 'h-[var(--switch-lg-thumb-size)] w-[var(--switch-lg-thumb-size)] data-[state=checked]:translate-x-[calc(var(--switch-lg-width)_-_var(--switch-lg-height))]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

// 开关组件属性定义
interface SwitchComponentProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, VariantProps<typeof switchVariants> {}
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchComponentProps>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      switchVariants({ size }),
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--form-input-focus-border)]',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
      'disabled:cursor-not-allowed disabled:opacity-50',

      /* 未选中状态 */
      'data-[state=unchecked]:bg-[var(--muted)]',
      'data-[state=unchecked]:border-[var(--border)]',
      'hover:data-[state=unchecked]:bg-[var(--switch-hover-background)]',
      'hover:data-[state=unchecked]:border-[var(--switch-hover-border)]',
      'active:data-[state=unchecked]:bg-[var(--switch-active-background)]',

      /* 选中状态 */
      'data-[state=checked]:bg-[var(--switch-checked-background)]',
      'data-[state=checked]:border-[var(--switch-checked-background)]',
      'hover:data-[state=checked]:bg-[var(--switch-checked-hover-background)]',
      'hover:data-[state=checked]:border-[var(--switch-checked-hover-background)]',

      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={cn(thumbVariants({ size }), 'data-[state=unchecked]:translate-x-0', 'data-[state=checked]:scale-110', 'group-hover:scale-105')} />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export type { SwitchProps } from '@radix-ui/react-switch';
export { Switch };
export type { SwitchComponentProps };
