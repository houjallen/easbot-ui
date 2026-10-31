import { cn } from '../utils/classnames';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

/**
 * 进度条组件
 *
 * @description
 * 可视化展示操作进度，支持确定和不确定两种状态
 */
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** 进度指示条自定义样式 */
  indicatorClassName?: string;
  /** 进度值（0-100） */
  value?: number;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(({ className, value, indicatorClassName, ...props }, ref) => {
  // 计算进度百分比（0-100）
  const percentage = Math.min(Math.max(value || 0, 0), 100);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('relative w-full overflow-hidden', 'bg-[var(--progress-background)]', 'h-[var(--progress-height)]', 'rounded-[var(--progress-border-radius)]', 'transition-colors', className)}
      style={{
        transitionDuration: 'var(--progress-transition-duration)',
        transitionTimingFunction: 'var(--progress-transition-timing)',
      }}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full w-full flex-1', 'bg-[var(--progress-indicator)]', 'transition-transform', indicatorClassName)}
        style={{
          transform: `translateX(-${100 - percentage}%)`,
          transitionProperty: 'transform',
          transitionDuration: 'var(--progress-transition-duration)',
          transitionTimingFunction: 'var(--progress-transition-timing)',
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
export type { ProgressProps };
