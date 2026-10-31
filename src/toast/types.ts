import * as React from 'react';

// 创建共享类型定义
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type ToastVariant = 'default' | 'destructive' | 'success';

export interface ToastProps {
  /** 标题 */
  title?: React.ReactNode;
  /** 描述内容 */
  description?: React.ReactNode;
  /** 样式变体 */
  variant?: 'default' | 'destructive' | 'success';
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
