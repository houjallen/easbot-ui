/**
 * Card 卡片组件
 *
 * @description
 * 用于展示内容的容器组件，可以包含标题、描述、内容和操作等。
 * 支持多种样式变体和交互效果。
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/classnames';

// Card 样式变体定义
const cardVariants = cva('rounded-lg border shadow-sm transition-colors border-[var(--card-border)] bg-[var(--card-background)] text-[var(--card-foreground)]', {
  variants: {
    variant: {
      default: 'border-border',
      destructive: 'border-destructive text-destructive hover:bg-destructive/5',
      success: 'border-success text-success hover:bg-success/5',
      warning: 'border-warning text-warning hover:bg-warning/5',
      info: 'border-info text-info hover:bg-info/5',
    },
    hover: {
      true: 'transition-shadow hover:shadow-[var(--card-hover-shadow)]',
      false: '',
    },
    size: {
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    hover: false,
    size: 'default',
  },
});

type BaseCardProps = VariantProps<typeof cardVariants> & {
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

// 增强类型定义
export type CardProps = ((BaseCardProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { clickable: true }) | (BaseCardProps & React.HTMLAttributes<HTMLDivElement> & { clickable?: false })) & {
  /** 加载状态 */
  loading?: boolean;
  /** 点击波纹效果颜色 */
  rippleColor?: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 波纹动画时长 (ms) */
  rippleDuration?: number;
  /** 滑动回调 */
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  /** 滑动灵敏度阈值 (px) */
  swipeThreshold?: number;
  /** 是否启用水波纹效果 */
  enableRipple?: boolean;
};

/**
 * Card 标题属性接口
 * @description 继承 HTMLDivElement 的所有属性，用于自定义卡片头部的样式和行为
 */
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Card 标题属性接口
 * @description 继承 HTMLHeadingElement 的所有属性，用于自定义卡片标题的样式和行为
 */
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * Card 描述属性接口
 * @description 继承 HTMLParagraphElement 的所有属性，用于自定义卡片描述的样式和行为
 */
type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

/**
 * Card 内容属性接口
 * @description 继承 HTMLDivElement 的所有属性，用于自定义卡片内容区域的样式和行为
 */
type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Card 底部属性接口
 * @description 继承 HTMLDivElement 的所有属性，用于自定义卡片底部区域的样式和行为
 */
type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Card 组件实现
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Card>
 *   <CardHeader>
 *     <CardTitle>标题</CardTitle>
 *     <CardDescription>描述</CardDescription>
 *   </CardHeader>
 *   <CardContent>内容</CardContent>
 *   <CardFooter>底部</CardFooter>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLElement, CardProps>((props, ref) => {
  const {
    className,
    variant,
    hover,
    size,
    clickable,
    onClick,
    loading,
    disabled,
    children,
    rippleColor = 'currentColor',
    rippleDuration = 600,
    swipeThreshold = 30,
    onSwipe,
    enableRipple = false,
    ...rest
  } = props;

  const Comp = clickable ? 'button' : 'div';
  const isInteractive = !disabled && (clickable || Boolean(onClick));

  // 波纹效果逻辑
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (disabled) return;
    // 添加波纹效果
    const rect = event.currentTarget.getBoundingClientRect();
    setRipples((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    ]);
    onClick?.(event as React.MouseEvent<HTMLButtonElement> & React.MouseEvent<HTMLDivElement>);
  };

  // 新增滑动检测逻辑
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;

    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
      const direction = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 'right' : 'left') : deltaY > 0 ? 'down' : 'up';
      onSwipe?.(direction);
    }
  };

  // 优化波纹效果自动清理
  React.useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples([]);
      }, rippleDuration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [ripples, rippleDuration]);

  return React.createElement(
    Comp,
    {
      ref,
      className: cn(
        cardVariants({ variant, hover: isInteractive || hover, size }),
        isInteractive && 'cursor-pointer relative overflow-hidden',
        loading && 'animate-pulse',
        disabled && 'opacity-[var(--card-disabled-opacity)] pointer-events-none',
        className,
      ),
      onClick: handleClick,
      disabled: disabled,
      'aria-disabled': disabled,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      ...rest,
    },
    <>
      {/* 优化波纹动画样式 */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn('absolute animate-ripple rounded-full', !enableRipple && 'hidden')}
          style={{
            animationDuration: `${rippleDuration}ms`,
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor || 'var(--card-ripple-color)',
          }}
        />
      ))}
      {children}
    </>,
  );
});
Card.displayName = 'Card';

/**
 * Card 头部组件
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />);
CardHeader.displayName = 'CardHeader';

/**
 * Card 标题组件
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight text-[var(--card-title)]', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

/**
 * Card 描述组件
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-[var(--card-description)]', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

/**
 * Card 内容组件
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0 text-[var(--card-content)]', className)} {...props} />);
CardContent.displayName = 'CardContent';

/**
 * Card 底部组件
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
