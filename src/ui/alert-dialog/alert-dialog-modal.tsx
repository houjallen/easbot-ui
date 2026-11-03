/**
 * AlertDialogModal 警告对话框模态组件
 *
 * @description
 * 基于 AlertDialog 组件封装的模态对话框，提供了标准的警告对话框界面和交互。
 * 支持不同类型的图标和自定义内容。
 */

import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import * as React from 'react';
import { Button } from '../button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './alert-dialog';
import type { AlertDialogVariants } from './alert-dialog';

export interface AlertDialogModalProps extends UiMessageProps {
  title?: string;
  content: React.ReactNode | string;
  onOk?: () => void;
  onCancel?: () => void;
  variant?: AlertDialogVariants;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  okText?: string;
  cancelText?: string;
  showCloseButton?: boolean;
  closeAriaLabel?: string;
  children?: React.ReactNode;
}

function getIcon(variant: AlertDialogVariants = 'default') {
  switch (variant) {
    case 'warning':
      return <AlertCircle className="h-6 w-6 text-destructive" />;
    case 'success':
      return <CheckCircle className="h-6 w-6 text-success" />;
    case 'destructive':
      return <XCircle className="h-6 w-6 text-destructive" />;
    default:
      return <Info className="h-6 w-6 text-primary" />;
  }
}

function renderContent(content: React.ReactNode | string) {
  if (typeof content === 'string') {
    return <span>{content}</span>;
  }
  return content;
}

export function AlertDialogModal({
  title = '',
  content,
  onOk,
  onCancel,
  variant = 'default',
  open = false,
  onOpenChange,
  okText,
  cancelText,
  showCloseButton = true,
  closeAriaLabel,
  locale,
  messages,
}: AlertDialogModalProps) {
  const { t } = useComponentMessage('alert', { locale, messages });
  const finalOkText = okText ?? t('confirmLabel');
  const finalCancelText = cancelText ?? t('cancelLabel');
  const finalCloseAriaLabel = closeAriaLabel ?? t('closeLabel');

  const handleOk = () => {
    onOk?.();
    onOpenChange?.(false);
  };

  const handleClose = () => {
    onOpenChange?.(false);
    onCancel?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn('sm:max-w-lg', 'rounded-lg', 'bg-card', 'shadow-lg')} size="default" showCloseButton={showCloseButton} closeAriaLabel={finalCloseAriaLabel} variant={variant}>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            {getIcon(variant)}
            <AlertDialogTitle
              className={cn(
                variant === 'success'
                  ? 'font-bold text-success'
                  : variant === 'destructive'
                    ? 'font-bold text-destructive'
                    : variant === 'warning'
                      ? 'font-bold text-yellow-700'
                      : 'font-bold text-primary',
              )}
            >
              {title}
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription>{renderContent(content)}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button onClick={handleClose} variant="secondary">
              {finalCancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleOk}>{finalOkText}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
