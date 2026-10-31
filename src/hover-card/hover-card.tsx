import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/classnames';

/**
 * 悬停卡片根组件
 *
 * @description
 * 控制卡片的显示行为，包裹整个悬停卡片组件
 */
const HoverCard = HoverCardPrimitive.Root;

/**
 * 悬停卡片触发器
 *
 * @description
 * 触发卡片显示的交互元素，支持子元素透传
 */
const HoverCardTrigger = HoverCardPrimitive.Trigger;

// 卡片内容样式变体
const hoverCardVariants = cva(
  cn(
    'z-50 rounded-[var(--hover-card-radius)] border-[var(--hover-card-border)] bg-[var(--hover-card-bg)] p-[var(--hover-card-padding)] text-[var(--hover-card-fg)] shadow-[var(--hover-card-shadow)] outline-none',
  ),
  {
    variants: {
      size: {
        sm: 'w-[var(--hover-card-sm-width)]', // 小尺寸
        md: 'w-[var(--hover-card-md-width)]', // 中尺寸（默认）
        lg: 'w-[var(--hover-card-lg-width)]', // 大尺寸
      },
      variant: {
        default: '', // 默认主题
        dark: 'bg-[var(--hover-card-dark-bg)] text-[var(--hover-card-dark-fg)]', // 暗色主题
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

/**
 * 悬停卡片内容组件
 *
 * @description
 * 包含实际显示内容的卡片部分，支持动画效果和主题定制
 */
const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & VariantProps<typeof hoverCardVariants>
>(({ className, align = 'center', sideOffset = 4, size, variant, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      hoverCardVariants({ size, variant }),
      'data-[state=open]:animate-in data-[state=closed]:animate-out', // 动画控制
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', // 淡入淡出
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', // 缩放动画
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

// 在文件底部添加类型定义
export type HoverCardProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>;
export type HoverCardTriggerProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>;
export type HoverCardContentProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & VariantProps<typeof hoverCardVariants>;

export { HoverCard, HoverCardTrigger, HoverCardContent };
