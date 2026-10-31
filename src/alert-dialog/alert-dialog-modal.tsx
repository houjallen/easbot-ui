import * as React from 'react';
import { Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './alert-dialog';

export type IconType = 'success' | 'info' | 'error' | 'warning';

export interface AlertDialogModalProps {
  title?: string;
  content: React.ReactNode | string;
  onOk?: () => void;
  onCancel?: () => void;
  iconType?: IconType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  okText?: string;
  cancelText?: string;
}

function getIcon(iconType: IconType = 'info') {
  switch (iconType) {
    case 'warning':
      return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case 'error':
      return <XCircle className="h-6 w-6 text-red-500" />;
    default:
      return <Info className="h-6 w-6 text-blue-500" />;
  }
}

function renderContent(content: React.ReactNode | string) {
  if (typeof content === 'string') {
    return <span dangerouslySetInnerHTML={{ __html: content as string }} />;
  }
  return content;
}

export function AlertDialogModal({ title = '', content, onOk, onCancel, iconType = 'info', open = false, onOpenChange, okText = '确认', cancelText = '取消' }: AlertDialogModalProps) {
  const handleOk = () => {
    onOk?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {getIcon(iconType)}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-sm text-muted-foreground">{renderContent(content)}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleOk}>{okText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
