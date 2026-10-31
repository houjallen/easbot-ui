import * as React from 'react';
import { cn } from '../utils/classnames';

/**
 * 骨架屏组件
 *
 * @description
 * 用于数据加载时的占位显示，提供平滑的渐变动画效果
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - 继承 div 元素属性
 * @param {string} className - 自定义样式类名
 */
const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-[var(--skeleton-border-radius)] bg-[var(--skeleton-background)]',
      'relative overflow-hidden',
      'before:absolute before:inset-0 before:-translate-x-full',
      'before:animate-[shimmer_var(--skeleton-animation-duration)_infinite]',
      'before:bg-gradient-to-r before:from-transparent before:via-[var(--skeleton-highlight)] before:to-transparent',
      'data-[state=loading]:before:animate-[shimmer_var(--skeleton-animation-duration)_infinite]', // 加载状态动画
      className,
    )}
    {...props}
  />
));
Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;
