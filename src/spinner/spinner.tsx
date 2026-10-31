/**
 * 加载指示器组件
 *
 * @description
 * 用于表示加载状态的旋转指示器，支持以下核心功能：
 * 1. 多尺寸适配（sm/md/lg）
 * 2. 颜色变体支持
 * 3. 自定义动画速度
 * 4. 无障碍访问支持
 * 5. 响应式设计
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/classnames';

// 样式变体配置
const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-[var(--spinner-size-sm)] w-[var(--spinner-size-sm)]',
      md: 'h-[var(--spinner-size-md)] w-[var(--spinner-size-md)]',
      lg: 'h-[var(--spinner-size-lg)] w-[var(--spinner-size-lg)]',
    },
    variant: {
      default: 'text-[var(--spinner-primary)]',
      primary: 'text-[var(--spinner-primary-foreground)]',
      destructive: 'text-[var(--spinner-destructive)]',
      success: 'text-[var(--spinner-success)]',
      warning: 'text-[var(--spinner-warning)]',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement>, VariantProps<typeof spinnerVariants> {}

/**
 * 加载指示器组件
 *
 * @param {SpinnerProps} props 组件属性
 * @param {string} [props.className] 自定义类名
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] 尺寸
 * @param {'default' | 'primary' | 'destructive' | 'success' | 'warning'} [props.variant='default'] 颜色变体
 * @returns {JSX.Element} 旋转指示器组件
 */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({ className, size, variant, ...props }, ref) => (
  <svg
    ref={ref}
    className={cn(spinnerVariants({ size, variant, className }))}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    role="status"
    aria-live="polite"
    aria-busy="true"
    {...props}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
));
Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
