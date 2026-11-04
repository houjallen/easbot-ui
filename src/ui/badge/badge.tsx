import { Badge as DSBadge, badgeVariants as dsBadgeVariants } from '../../design-system/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/classnames';

/**
 * 徽章组件，基于 design-system Badge 进行封装。
 * 仅做轻量包装，保持 props、样式、行为与 design-system 完全一致。
 * 如需自定义扩展，请先评估 design-system 是否已支持。
 */
export interface BadgeProps extends React.ComponentProps<typeof DSBadge>, VariantProps<typeof dsBadgeVariants> {
  /**
   * 是否作为子组件渲染（Slot）。
   */
  asChild?: boolean;
  /**
   * 是否显示状态点（dot）。
   */
  dot?: boolean;
  /**
   * 状态点颜色。
   */
  dotColor?: string;
  /**
   * 数字角标值。
   */
  count?: number;
  /**
   * 溢出值。
   */
  overflowCount?: number;
  /**
   * 是否显示零值。
   */
  showZero?: boolean;
  /**
   * 动画持续时间。
   */
  animationDuration?: number;
  /**
   * 偏移量。
   */
  offset?: [number, number];
}

// 颜色变体映射表，全部用 Tailwind 官方变量（如 var(--color-red-50)），不再用 HEX
const badgeVariantStyleMap = {
  destructive: {
    bg: 'var(--color-red-50)', // tailwind bg-red-50
    border: 'var(--color-red-400)', // tailwind border-red-400
  },
  success: {
    bg: 'var(--color-green-50)', // tailwind bg-green-50
    border: 'var(--color-green-400)', // tailwind border-green-400
  },
  warning: {
    bg: 'var(--color-yellow-50)', // tailwind bg-yellow-50
    border: 'var(--color-yellow-400)', // tailwind border-yellow-400
  },
  info: {
    bg: 'var(--color-blue-50)', // tailwind bg-blue-50
    border: 'var(--color-blue-400)', // tailwind border-blue-400
  },
  outline: {
    bg: 'var(--color-gray-50)', // tailwind bg-gray-50
    border: 'var(--color-gray-300)', // tailwind border-gray-300
  },
  secondary: {
    bg: 'var(--color-gray-100)', // tailwind bg-gray-100
    border: 'var(--color-gray-400)', // tailwind border-gray-400
  },
  default: {
    bg: 'var(--color-gray-100)', // tailwind bg-gray-100
    border: 'var(--color-gray-200)', // tailwind border-gray-200
  },
};

/**
 * Badge 组件（EAS UI Next 封装版）
 * @param props 传递给 design-system Badge 的所有参数
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', dot = false, count, overflowCount = 99, showZero = false, dotColor, offset = [-4, -4], animationDuration = 300, children, ...props }, ref) => {
    // 健壮处理 offset，保证为数组 [x, y]
    const [x, y] = Array.isArray(offset) && offset.length === 2 ? offset : [-4, -4];
    // 规范 variant 类型，防止为 null/undefined
    const safeVariant = (variant || 'default') as keyof typeof badgeVariantStyleMap;
    // dot 状态点颜色，优先 dotColor，否则按 variant 取映射表的 bg
    const dotBgColor = dotColor || badgeVariantStyleMap[safeVariant].bg;
    // dot 边框色，按 variant 取映射表的 border
    const dotBorderColor = badgeVariantStyleMap[safeVariant].border;
    const dsDotSize = '8px';

    // 计算数字展示内容
    const displayCount = React.useMemo(() => {
      if (count === undefined || count === null) return null;
      const num = typeof count === 'string' ? Number.parseInt(count, 10) : count;
      if (Number.isNaN(num) || num < 0) return null;
      if (num === 0 && !showZero) return null;
      if (num > overflowCount) return `${overflowCount}+`;
      return num.toString();
    }, [count, overflowCount, showZero]);

    const animationStyle = {
      transitionDuration: `${animationDuration}ms`,
    } as React.CSSProperties;

    // 扩展：状态点（dot），默认加透明度（最佳实践 0.85）
    if (dot) {
      // 📌 **dot 分支必须透传 `className` / 原生属性 / `ref`** ——
      //    修复前本分支直接 `return`，导致三者全部被静默丢弃。
      //    消费方传 `className` 给圆点容器定尺寸、或传 `data-*` / `aria-*` / `onClick`，
      //    都期望生效 —— 与 count 分支保持一致的行为契约。
      return (
        <span ref={ref} className={cn('relative inline-block align-middle', className)} {...props}>
          {children}
          <span
            className="absolute z-10 rounded-full"
            style={{
              right: x,
              top: y,
              width: dsDotSize,
              height: dsDotSize,
              backgroundColor: dotBgColor,
              opacity: 0.85,
              border: `1.5px solid ${dotBorderColor}`,
              ...animationStyle,
            }}
          />
        </span>
      );
    }

    // 扩展：数字角标（count），默认加透明度（最佳实践 0.85）
    if (displayCount !== null) {
      return (
        <span className="relative inline-block align-middle">
          {children}
          <span
            ref={ref}
            className={cn(
              dsBadgeVariants({ variant }),
              'absolute z-10 box-border flex min-w-[20px] items-center justify-center px-1',
              className,
              'opacity-85', // tailwind opacity-85
            )}
            style={{
              right: x,
              top: y,
              ...animationStyle,
            }}
            {...props}
          >
            {displayCount}
          </span>
        </span>
      );
    }

    // 默认：直接复用 ds Badge，asChild 需透传，保证 Slot 用法生效
    return (
      <DSBadge ref={ref} variant={variant} className={className} asChild={props.asChild} {...props}>
        {children}
      </DSBadge>
    );
  },
);

Badge.displayName = 'Badge';

export { dsBadgeVariants as badgeVariants };
