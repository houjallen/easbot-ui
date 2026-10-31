/**
 * Badge 徽章组件
 *
 * @description
 * 用于展示状态、计数或标签信息的小型组件。
 * 支持多种样式变体和尺寸。
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/classnames';
import { useMemo } from 'react';

// Badge 样式变体定义
const badgeVariants = cva('inline-flex items-center justify-center transition-colors font-[var(--badge-font-weight)] rounded-[var(--badge-border-radius)]', {
  variants: {
    variant: {
      default: ['border-[var(--badge-default-border)]', 'bg-[var(--badge-default-bg)]', 'text-[var(--badge-default-text)]'].join(' '),
      secondary: ['border-[var(--badge-secondary-border)]', 'bg-[var(--badge-secondary-bg)]', 'text-[var(--badge-secondary-text)]'].join(' '),
      destructive: ['border-[var(--badge-destructive-border)]', 'bg-[var(--badge-destructive-bg)]', 'text-[var(--badge-destructive-text)]'].join(' '),
      outline: ['border-[var(--badge-outline-border)]', 'bg-[var(--badge-outline-bg)]', 'text-[var(--badge-outline-text)]'].join(' '),
      success: ['border-[var(--badge-success-border)]', 'bg-[var(--badge-success-bg)]', 'text-[var(--badge-success-text)]'].join(' '),
      warning: ['border-[var(--badge-warning-border)]', 'bg-[var(--badge-warning-bg)]', 'text-[var(--badge-warning-text)]'].join(' '),
      info: ['border-[var(--badge-info-border)]', 'bg-[var(--badge-info-bg)]', 'text-[var(--badge-info-text)]'].join(' '),
    },
    size: {
      sm: [
        'h-[var(--badge-sm-height)]',
        'min-w-[var(--badge-sm-min-width)]',
        'px-[var(--badge-sm-padding-x)]',
        'py-[var(--badge-sm-padding-y)]',
        'text-[var(--badge-sm-font-size)]',
        'rounded-[var(--badge-border-radius-sm)]',
      ].join(' '),
      default: [
        'h-[var(--badge-default-height)]',
        'min-w-[var(--badge-default-min-width)]',
        'px-[var(--badge-default-padding-x)]',
        'py-[var(--badge-default-padding-y)]',
        'text-[var(--badge-default-font-size)]',
      ].join(' '),
      lg: [
        'h-[var(--badge-lg-height)]',
        'min-w-[var(--badge-lg-min-width)]',
        'px-[var(--badge-lg-padding-x)]',
        'py-[var(--badge-lg-padding-y)]',
        'text-[var(--badge-lg-font-size)]',
        'rounded-[var(--badge-border-radius-lg)]',
      ].join(' '),
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-[var(--badge-border-radius-sm)]',
      default: 'rounded-[var(--badge-border-radius)]',
      lg: 'rounded-[var(--badge-border-radius-lg)]',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    rounded: 'default',
  },
});

// Badge 属性接口定义
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  /** 是否显示点状标记 @default false */
  dot?: boolean;
  /** 显示的数字或文本 (支持负数自动归零) */
  count?: number | string;
  /** 封顶数字 @default 99 */
  overflowCount?: number;
  /** 当数值为0时是否展示 @default false */
  showZero?: boolean;
  /** 状态点的自定义颜色 (支持CSS变量) */
  dotColor?: `#${string}` | `var(--${string})`;
  /** 数字徽章位置偏移量 [水平, 垂直] @default [-4, -4] */
  offset?: [number, number];
  /** 动画持续时间 (ms) @default 300 */
  animationDuration?: number;
}

/**
 * Badge 组件实现
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Badge>默认徽章</Badge>
 *
 * // 带数字
 * <Badge count={5}>
 *   <Avatar />
 * </Badge>
 *
 * // 状态点
 * <Badge dot>
 *   <Icon />
 * </Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, rounded, dot, count, overflowCount = 99, showZero = false, dotColor, offset = [-4, -4], animationDuration, children, ...props }, ref) => {
    const [x, y] = offset;
    const displayCount = useMemo(() => {
      if (count === undefined) return null;
      const num = typeof count === 'string' ? Number.parseInt(count, 10) : count;
      if (Number.isNaN(num) || num < 0) return null;
      if (num === 0 && !showZero) return null;
      if (num > overflowCount!) return `${overflowCount}+`;
      return num.toString();
    }, [count, overflowCount, showZero]);

    const animationStyle = {
      '--enter-duration': `${animationDuration}ms`,
      '--exit-duration': `${animationDuration! / 2}ms`,
    } as React.CSSProperties;

    const dotStyle = React.useMemo(() => {
      const style: React.CSSProperties = {
        width: 'var(--badge-dot-size)',
        height: 'var(--badge-dot-size)',
        borderRadius: '50%',
        display: 'inline-block',
        marginInlineEnd: 6,
        borderWidth: 'var(--badge-dot-border-width)',
        borderStyle: 'solid',
        borderColor: 'var(--badge-dot-border-color)',
        backgroundColor: dotColor || 'var(--badge-dot-default-color)',
      };
      return style;
    }, [dotColor]);

    if (dot) {
      return (
        <span className="relative inline-block">
          {children}
          <span
            className={cn(
              'absolute rounded-full',
              'h-[var(--badge-dot-size)] w-[var(--badge-dot-size)]',
              'border-[var(--badge-dot-border-width)]',
              'border-[var(--badge-dot-border-color)]',
              dotColor ? `bg-[${dotColor}]` : 'bg-[var(--badge-dot-default-color)]',
            )}
            style={{ right: x, top: y }}
          />
        </span>
      );
    }

    if (displayCount !== null) {
      return (
        <span className="relative inline-block">
          {children}
          <span ref={ref} className={cn(badgeVariants({ variant, size, rounded }), 'absolute z-10 min-w-[20px] justify-center', className)} style={{ right: x, top: y, ...animationStyle }} {...props}>
            {displayCount}
          </span>
        </span>
      );
    }

    return (
      <div ref={ref} className={cn(badgeVariants({ variant, size, rounded }), className)} {...props}>
        {children}
      </div>
    );
  },
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };

export type { VariantProps } from 'class-variance-authority';
