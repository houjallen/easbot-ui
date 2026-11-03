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

import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import { Alert as DSAlert, AlertDescription as DSAlertDescription, AlertTitle as DSAlertTitle } from '../../design-system/components/ui/alert'; // Aliased import
import { CloseButton } from '../button'; // 导入 CloseButton

const eunAlertVariants = cva('', {
  variants: {
    variant: {
      default: '', // 使用设计系统的默认样式
      destructive: 'border-destructive bg-red-50 text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-destructive',
      success: 'border-green-400 bg-green-50 text-green-700 *:data-[slot=alert-description]:text-green-700/90 [&>svg]:text-green-700',
      warning: 'border-yellow-400 bg-yellow-50 text-yellow-700 *:data-[slot=alert-description]:text-yellow-700/90 [&>svg]:text-yellow-700',
      info: 'border-blue-400 bg-blue-50 text-blue-700 *:data-[slot=alert-description]:text-blue-700/90 [&>svg]:text-blue-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof eunAlertVariants>, UiMessageProps {
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  closeAriaLabel?: string;
  showIcon?: boolean;
  // variant prop will now refer to 'default', 'destructive', 'success', 'warning', 'info'
}

const variantIconMap = {
  default: null, // Or a default icon if DSAlert doesn't provide one and EUN wants one
  destructive: <XCircle />, // DSAlert might provide its own, or we can pass this
  success: <CheckCircle />,
  warning: <AlertTriangle />,
  info: <Info />,
} as const;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default', // EUN variant
      children,
      closable = false,
      onClose,
      icon,
      closeAriaLabel,
      showIcon = true,
      locale,
      messages,
      ...props
    },
    ref,
  ) => {
    const { t } = useComponentMessage('alert', { locale, messages });
    const IconToRender = icon || (showIcon && variant ? variantIconMap[variant] : null);
    const dsAlertVariant = variant === 'success' || variant === 'warning' || variant === 'info' ? 'default' : variant;
    const finalCloseAriaLabel = closeAriaLabel ?? t('closeAriaLabel');

    return (
      <DSAlert
        ref={ref}
        variant={dsAlertVariant} // Pass adjusted variant to DSAlert
        className={cn(eunAlertVariants({ variant }), className)} // Apply EUN's specific styles for success, warning, info
        {...props}
      >
        {IconToRender && <div className="flex-shrink-0 self-start">{IconToRender}</div>}
        <div className="flex-grow">
          {children} {/* AlertTitle and AlertDescription will be passed here */}
        </div>
        {closable && (
          <CloseButton
            variant={variant} // 确保传入正确的 variant
            aria-label={finalCloseAriaLabel}
            onClick={onClose}
            className="absolute top-2 right-2 rounded-md" // 只保留定位和形状类，CloseButton 的 variant 会处理其他样式
          />
        )}
      </DSAlert>
    );
  },
);
Alert.displayName = 'Alert';

interface AlertTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * Alert 标题组件
 * Wraps @repo/design-system's AlertTitle
 */
const AlertTitle = React.forwardRef<
  HTMLDivElement, // DSAlertTitle is a div
  AlertTitleProps
>(({ className, children, ...props }, ref) => (
  <DSAlertTitle ref={ref} className={cn(className)} {...props}>
    {children as any}
  </DSAlertTitle>
));
AlertTitle.displayName = 'AlertTitle';

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * Alert 描述组件
 * Wraps @repo/design-system's AlertDescription
 */
const AlertDescription = React.forwardRef<
  HTMLDivElement, // DSAlertDescription is a div
  AlertDescriptionProps
>(({ className, children, ...props }, ref) => (
  <DSAlertDescription ref={ref} className={cn(className)} {...props}>
    {children as any}
  </DSAlertDescription>
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
