/**
 * Avatar 头像组件
 *
 * @description
 * 用于展示用户头像，支持图片、文字、图标等多种形式
 * 提供尺寸、形状、状态指示等自定义选项
 */

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/classnames';

// 样式变体配置
const avatarVariants = cva('relative flex shrink-0 overflow-hidden border', {
  variants: {
    size: {
      sm: 'h-[var(--avatar-size-sm)] w-[var(--avatar-size-sm)]',
      md: 'h-[var(--avatar-size-md)] w-[var(--avatar-size-md)]',
      lg: 'h-[var(--avatar-size-lg)] w-[var(--avatar-size-lg)]',
    },
    shape: {
      circle: 'rounded-[var(--avatar-radius-circle)]',
      square: 'rounded-[var(--avatar-radius-square)]',
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
});

// 状态指示样式
const statusVariants = cva('rounded-full', {
  variants: {
    status: {
      online: 'bg-[var(--avatar-status-online)]',
      offline: 'bg-[var(--avatar-status-offline)]',
      busy: 'bg-[var(--avatar-status-busy)]',
      away: 'bg-[var(--avatar-status-away)]',
    },
  },
});

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, VariantProps<typeof avatarVariants> {
  /** 头像尺寸 @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** 头像形状 @default 'circle' */
  shape?: 'circle' | 'square';
  /** 状态指示类型 */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** 状态指示位置偏移 [水平, 垂直] @default [0, 0] */
  statusOffset?: [number | string, number | string];
}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(({ className, size, shape, status, statusOffset = [0, 0], ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size, shape }), 'border-[var(--avatar-border-color)]', 'bg-[var(--avatar-background)] text-[var(--avatar-foreground)]', className)}
    style={
      {
        '--border-width': 'var(--avatar-border-width)',
      } as React.CSSProperties
    }
    role="img"
    aria-label="用户头像"
    {...props}
  >
    {props.children}
    {status && (
      <span
        className={cn(
          statusVariants({ status }),
          'absolute bottom-0 right-0',
          'h-[var(--avatar-status-size)] w-[var(--avatar-status-size)]',
          'rounded-full',
          'border-[var(--avatar-status-border)]',
          'shadow-sm',
        )}
        style={
          {
            bottom: statusOffset[0],
            right: statusOffset[1],
          } as React.CSSProperties
        }
        aria-hidden="true"
        data-testid="avatar-status"
      />
    )}
  </AvatarPrimitive.Root>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
    /** 图片加载失败时隐藏图片 */
    onError?: React.ReactEventHandler<HTMLImageElement>;
  }
>(({ className, onError, ...props }, ref) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    onError?.(e);
  };

  return <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full', className)} alt="用户头像" onError={handleError} {...props} />;
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center',
      'bg-[var(--avatar-fallback-background)] text-[var(--avatar-fallback-foreground)]',
      'text-[var(--avatar-fallback-font-size)] font-[var(--avatar-fallback-font-weight)]',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
export type { VariantProps as AvatarVariantProps };
