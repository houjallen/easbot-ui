/**
 * AlertDialog 警告对话框组件
 *
 * @description
 * 用于展示重要的警告信息或确认操作，需要用户明确的操作反馈。
 * 基于 Radix UI 的 AlertDialog 组件实现，提供了完善的无障碍支持。
 */

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '../utils/classnames';
import { buttonVariants } from '../button';
import { Spinner } from '../spinner';

// AlertDialog 根组件
const AlertDialog = AlertDialogPrimitive.Root;

// AlertDialog 触发器组件
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/**
 * AlertDialog 内容包装器组件
 */
const AlertDialogPortal = AlertDialogPrimitive.Portal;

/**
 * AlertDialog 遮罩层组件
 */
const AlertDialogOverlay = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-[var(--alert-dialog-overlay-z-index)]',
        'bg-[var(--alert-dialog-overlay-background)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
      ref={ref}
    />
  ),
);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

// 增强类型定义
type AlertDialogVariant = 'default' | 'destructive' | 'success';
type AlertDialogSize = 'sm' | 'default' | 'lg';

// 增强内容组件属性
interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  /** 对话框样式变体 @default 'default' */
  variant?: AlertDialogVariant;
  /** 对话框尺寸 @default 'default' */
  size?: AlertDialogSize;
}

/**
 * AlertDialog 内容组件
 */
const AlertDialogContent = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Content>, AlertDialogContentProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variantClasses = {
    default: ['border-[var(--alert-dialog-default-border)]', 'bg-[var(--alert-dialog-default-background)]', 'text-[var(--alert-dialog-default-foreground)]'].join(' '),
    destructive: ['border-[var(--alert-dialog-destructive-border)]', 'bg-[var(--alert-dialog-destructive-background)]', 'text-[var(--alert-dialog-destructive-foreground)]'].join(' '),
    success: ['border-[var(--alert-dialog-success-border)]', 'bg-[var(--alert-dialog-success-background)]', 'text-[var(--alert-dialog-success-foreground)]'].join(' '),
  };

  const sizeClasses = {
    sm: ['max-w-[var(--alert-dialog-sm-max-width)]', 'p-[var(--alert-dialog-sm-padding)]', 'gap-[var(--alert-dialog-sm-gap)]'].join(' '),
    default: ['max-w-[var(--alert-dialog-default-max-width)]', 'p-[var(--alert-dialog-default-padding)]', 'gap-[var(--alert-dialog-default-gap)]'].join(' '),
    lg: ['max-w-[var(--alert-dialog-lg-max-width)]', 'p-[var(--alert-dialog-lg-padding)]', 'gap-[var(--alert-dialog-lg-gap)]'].join(' '),
  };

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%]',
          'z-[var(--alert-dialog-content-z-index)]',
          'grid w-full',
          'translate-x-[-50%] translate-y-[-50%]',
          'border shadow-[var(--alert-dialog-shadow)]',
          'transition-[var(--alert-dialog-transition)]',
          'backdrop-filter backdrop-blur-[var(--alert-dialog-backdrop-filter)]',
          'min-w-[var(--alert-dialog-content-min-width)]',
          'border-[var(--alert-dialog-content-border-width)]',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/**
 * AlertDialog 头部组件
 */
const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col', 'space-y-[var(--alert-dialog-header-gap)]', 'text-center sm:text-left', className)} {...props} />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

/**
 * AlertDialog 底部组件
 */
const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end', 'gap-[var(--alert-dialog-footer-gap)]', className)} {...props} />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

/**
 * AlertDialog 标题组件
 */
const AlertDialogTitle = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-[var(--alert-dialog-title-font-size)]', 'font-[var(--alert-dialog-title-font-weight)]', 'leading-[var(--alert-dialog-title-line-height)]', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

/**
 * AlertDialog 描述组件
 */
const AlertDialogDescription = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>>(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn('text-[var(--alert-dialog-description-font-size)]', 'text-[var(--alert-dialog-description-color)]', 'leading-[var(--alert-dialog-description-line-height)]', className)}
      {...props}
    />
  ),
);
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

// 增强操作按钮属性
interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  /** 加载状态 @default false */
  loading?: boolean;
  /** 按钮变体 */
  variant?: 'default' | 'destructive' | 'success';
}

/**
 * AlertDialog 操作按钮组件
 */
const AlertDialogAction = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Action>, AlertDialogActionProps>(({ className, loading = false, variant, children, ...props }, ref) => {
  const variantStyle = variant ? buttonVariants({ variant }) : '';

  return (
    <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), variantStyle, loading && 'pointer-events-none opacity-75', className)} disabled={loading} {...props}>
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </AlertDialogPrimitive.Action>
  );
});
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

/**
 * AlertDialog 取消按钮组件
 */
const AlertDialogCancel = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Cancel>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} className={cn(buttonVariants({ variant: 'outline' }), className)} {...props} />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

export type { AlertDialogVariant, AlertDialogSize, AlertDialogContentProps, AlertDialogActionProps };
