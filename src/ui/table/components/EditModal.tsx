/**
 * 表格编辑模态组件
 * 提供统一的弹窗、抽屉、侧边栏和页面跳转功能
 * 用于表格行编辑、新增等场景
 */

import { Button } from '../../button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../dialog';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../drawer';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../../sheet';
import { cn } from '../../../utils/classnames';
import { useComponentMessage } from '../../../utils/use-component-message';
import type { UiMessages } from '../../../utils/ui-message';
import React, { useCallback, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * 编辑模态框组件属性接口
 */
export interface EditModalProps {
  /** 模态框类型：dialog | drawer | sheet | page，默认 'dialog' */
  mode?: 'dialog' | 'drawer' | 'sheet' | 'page';
  /** 位置，仅在 drawer 和 sheet 模式下有效 */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** 标题 */
  title?: ReactNode;
  /** 描述文本，仅在 dialog 模式下显示 */
  description?: ReactNode;
  /** 触发按钮 */
  trigger: ReactNode;
  /** 内容区域 */
  children: ReactNode;
  /** 底部操作区域，如果不提供则使用默认的确认和取消按钮 */
  footer?: ReactNode;
  /** 是否显示确认按钮，默认 true */
  showConfirm?: boolean;
  /** 是否显示取消按钮，默认 true */
  showCancel?: boolean;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 语言环境，优先级高于 LocaleProvider */
  locale?: string;
  /** 自定义文案（覆盖内置文案） */
  messages?: UiMessages;
  /** 确认按钮加载状态 */
  confirmLoading?: boolean;
  /** 确认按钮禁用状态 */
  confirmDisabled?: boolean;
  /** 取消按钮禁用状态 */
  cancelDisabled?: boolean;
  /** 确认回调 */
  onConfirm?: () => void | Promise<void>;
  /** 取消回调 */
  onCancel?: () => void;
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void;
  /** 是否受控打开状态 */
  open?: boolean;
  /** 页面跳转URL生成器（仅在 page 模式下有效） */
  urlGenerator?: () => string;
  /** 页面跳转目标，默认 '_blank' */
  urlTarget?: string;
  /** 对话框最大宽度，默认 '90vw' */
  maxWidth?: string;
  /** 对话框最大高度，默认 '90vh' */
  maxHeight?: string;
  /** 是否可调整大小，默认 true */
  resizable?: boolean;
  /** 是否可最大化，默认 true */
  maximizable?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 编辑模态框组件
 * 统一封装 Dialog、Drawer、Sheet 和页面跳转功能
 */
export const EditModal: React.FC<EditModalProps> = ({
  mode = 'dialog',
  side = mode === 'sheet' ? 'right' : 'bottom',
  title,
  description,
  trigger,
  children,
  footer,
  showConfirm = true,
  showCancel = true,
  confirmText,
  cancelText,
  locale,
  messages,
  confirmLoading = false,
  confirmDisabled = false,
  cancelDisabled = false,
  onConfirm,
  onCancel,
  onOpenChange,
  open: controlledOpen,
  urlGenerator,
  urlTarget = '_blank',
  maxWidth = '90vw',
  maxHeight = '90vh',
  resizable = false,
  maximizable = true,
  className,
}) => {
  // 内部状态管理（非受控模式）
  const [internalOpen, setInternalOpen] = useState(false);

  // 内置文案（消费方可经 locale / messages 覆盖）
  const { t } = useComponentMessage('table', { locale, messages });

  // 判断是否为受控模式
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // 状态变更处理
  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  // 确认操作
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm?.();
      // 如果没有提供onConfirm或onConfirm执行成功且没有阻止关闭，则关闭弹窗
      handleOpenChange(false);
    } catch (error) {
      console.error(t('form.confirmFailed', { error: String(error) }), error);
      // 错误处理由调用方负责
    }
  }, [onConfirm, handleOpenChange, t]);

  // 取消操作
  const handleCancel = useCallback(() => {
    onCancel?.();
    handleOpenChange(false);
  }, [onCancel, handleOpenChange]);

  // 处理页面跳转
  const handlePageNavigation = useCallback(() => {
    if (mode === 'page' && urlGenerator) {
      const url = urlGenerator();
      window.open(url, urlTarget);
    } else {
      handleOpenChange(true);
    }
  }, [mode, urlGenerator, urlTarget, handleOpenChange]);

  // 渲染触发器
  const renderTrigger = () => {
    // 如果是页面模式，直接绑定点击事件
    if (mode === 'page') {
      return React.cloneElement(
        trigger as React.ReactElement,
        {
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            handlePageNavigation();
          },
        } as React.HTMLAttributes<HTMLElement>,
      );
    }

    // 其他模式使用各自的Trigger组件
    return trigger;
  };

  // 渲染底部操作区
  const renderFooter = () => {
    if (footer) return footer;

    return (
      <div className="flex justify-end gap-2">
        {showCancel && (
          <Button variant="outline" onClick={handleCancel} disabled={cancelDisabled}>
            {cancelText ?? t('cancel')}
          </Button>
        )}
        {showConfirm && (
          <Button onClick={handleConfirm} disabled={confirmDisabled} loading={confirmLoading}>
            {confirmText ?? t('confirm')}
          </Button>
        )}
      </div>
    );
  };

  // 根据模式渲染不同的组件
  if (mode === 'dialog') {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
        <DialogContent
          className={cn('min-w-sm overflow-y-auto', resizable && 'resize', className)}
          style={{ maxWidth, maxHeight }}
          maximizable={maximizable}
          // 打开时自定义聚焦：优先聚焦 data-autofocus，其次第一个可编辑/可聚焦控件
          onOpenAutoFocus={(event) => {
            try {
              // 阻止默认把焦点放到关闭/最大化按钮
              event.preventDefault();
              const root = (event.currentTarget as HTMLElement) || document.body;
              const target = root.querySelector<HTMLElement>(
                '[data-autofocus], input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"], button:not([disabled])[data-primary], [tabindex]:not([tabindex="-1"])',
              );
              target?.focus();
            } catch {}
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-2">{children}</div>
          <DialogFooter>{renderFooter()}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  } else if (mode === 'drawer') {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
        <DrawerContent className={cn('max-h-[80vh]', className)} side={side}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">{children}</div>
          <DrawerFooter>{renderFooter()}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  } else if (mode === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{renderTrigger()}</SheetTrigger>
        <SheetContent className={cn('max-h-[80vh]', className)} side={side}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4">{children}</div>
          <SheetFooter>{renderFooter()}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  } else {
    // page 模式，只渲染触发按钮
    return renderTrigger();
  }
};

export default EditModal;
