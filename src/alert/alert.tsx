/**
 * Alert 提示组件
 *
 * @description
 * 用于展示重要的提示信息，支持多种状态和样式变体。
 * 可以包含标题、描述文本和自定义图标。
 *
 * @example
 * <Alert variant="success" closable>
 *   <AlertTitle>操作成功</AlertTitle>
 *   <AlertDescription>数据已保存至云端</AlertDescription>
 * </Alert>
 */

import { cn } from '../utils/classnames';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import * as React from 'react';

// Alert 样式变体定义
const alertVariants = cva(
  // 基础样式
  [
    'relative w-full border shadow-[var(--alert-dialog-shadow)]',
    'rounded-[var(--radius)] p-[var(--alert-dialog-default-padding)]',
    '[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
    '[&>svg]:h-4 [&>svg]:w-4',
    '[&>svg~*]:pl-8',
    '[&>svg+div]:translate-y-[-3px]',
  ].join(' '),
  {
    variants: {
      // 变体样式
      variant: {
        default: [
          'border-[var(--alert-dialog-default-border)]',
          'bg-[var(--alert-dialog-default-background)]',
          'text-[var(--alert-dialog-default-foreground)]',
          '[&>svg]:text-[var(--muted-foreground)]',
        ].join(' '),
        destructive: ['border-[var(--destructive)]', 'bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)]', 'text-[var(--destructive)]', '[&>svg]:text-[var(--destructive)]'].join(' '),
        success: ['border-[var(--success)]', 'bg-[color-mix(in_srgb,var(--success)_10%,transparent)]', 'text-[var(--success)]', '[&>svg]:text-[var(--success)]'].join(' '),
        warning: ['border-[var(--warning)]', 'bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]', 'text-[var(--warning)]', '[&>svg]:text-[var(--warning)]'].join(' '),
        info: ['border-[var(--info)]', 'bg-[color-mix(in_srgb,var(--info)_10%,transparent)]', 'text-[var(--info)]', '[&>svg]:text-[var(--info)]'].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// Alert 属性接口定义
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** 是否可关闭 @default false */
  closable?: boolean;
  /** 关闭回调函数 */
  onClose?: () => void;
  /** 自定义图标（覆盖默认图标） */
  icon?: React.ReactNode;
  /** 关闭按钮的ARIA标签 @default '关闭提示' */
  closeAriaLabel?: string;
  /** 是否显示默认图标 @default true */
  showIcon?: boolean;
}

// 组件属性类型定义
type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

// 图标映射配置
const variantIconMap = {
  default: null,
  destructive: <XCircle className="h-4 w-4" />,
  success: <CheckCircle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
} as const;

/**
 * Alert 组件实现
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Alert>
 *   <AlertTitle>提示</AlertTitle>
 *   <AlertDescription>这是一条提示信息</AlertDescription>
 * </Alert>
 *
 * // 带图标
 * <Alert icon={<InfoIcon />}>
 *   <AlertTitle>信息</AlertTitle>
 *   <AlertDescription>这是一条信息提示</AlertDescription>
 * </Alert>
 *
 * // 可关闭
 * <Alert closable onClose={() => console.log('关闭')}>
 *   <AlertTitle>可关闭</AlertTitle>
 *   <AlertDescription>点击右上角可以关闭此提示</AlertDescription>
 * </Alert>
 * ```
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant, children, closable, onClose, icon, closeAriaLabel = '关闭提示', showIcon = true, ...props }, ref) => {
  // 图标渲染逻辑
  const IconComponent = React.useMemo(() => {
    if (icon !== undefined) return icon;
    if (!showIcon) return null;
    return variant ? variantIconMap[variant] : null;
  }, [variant, icon, showIcon]);

  // 关闭处理
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose?.();
  };

  return (
    <div ref={ref} role="alert" aria-live="polite" className={cn(alertVariants({ variant }), className)} {...props}>
      {IconComponent}
      <div className={cn('pr-6', closable ? 'pr-10' : 'pr-4')}>{children}</div>

      {closable && (
        <button
          type="button"
          onClick={handleClose}
          aria-label={closeAriaLabel}
          className={cn(
            'absolute right-4 top-4',
            'rounded-sm opacity-70',
            'ring-offset-background',
            'transition-opacity',
            'hover:opacity-100',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-ring',
            'focus:ring-offset-2',
            'disabled:pointer-events-none',
          )}
          data-testid="alert-close-button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
Alert.displayName = 'Alert';

/**
 * Alert 标题组件
 */
const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'text-[var(--alert-dialog-title-font-size)] font-[var(--alert-dialog-title-font-weight)] leading-[var(--alert-dialog-title-line-height)]',
      'mb-[var(--alert-dialog-header-gap)]',
      '[&:not(:first-child)]:mt-2',
      className,
    )}
    {...props}
  >
    {children}
  </h5>
));
AlertTitle.displayName = 'AlertTitle';

/**
 * Alert 描述组件
 */
const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('leading-[var(--alert-dialog-description-line-height)] text-[var(--muted-foreground)] text-sm', className)} {...props}>
    {children}
  </div>
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
