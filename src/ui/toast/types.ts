import type * as React from 'react';
import type { UiMessageProps } from '../../utils/ui-message';

// 创建共享类型定义
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface ToastProps extends UiMessageProps {
  /** 标题 */
  title?: React.ReactNode;
  /** 描述内容 */
  description?: React.ReactNode;
  /** 样式变体 */
  variant?: ToastVariant;
  /** 显示时长（毫秒） */
  duration?: number;
  /** 显示位置 */
  position?: ToastPosition;
  /** 关闭回调 */
  onClose?: () => void;
  /** 暂停事件处理 (Radix 实际类型) */
  onPause?: () => void;
  /** 恢复事件处理 (Radix 实际类型) */
  onResume?: () => void;
  /** 操作按钮 */
  action?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

export type ToastType = ToastProps & { id: string };

export interface ToastContextValue {
  toasts: ToastType[];
  addToast: (toast: ToastProps) => void;
  removeToast: (id: string) => void;
}

export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children?: React.ReactNode;
}

export interface ToastCloseProps {
  /** 自定义类名 */
  className?: string;
  /** 变体样式 */
  variant?: ToastVariant;
}
