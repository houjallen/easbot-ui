'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as React from 'react';

import { buttonVariants } from './button';
import { cn } from '../../lib/utils';
import { overlayHeaderPrClass } from './overlay-surface';

interface AlertDialogProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialog({ children, className, ...props }: AlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props}>
      {children}
    </AlertDialogPrimitive.Root>
  );
}

interface AlertDialogTriggerProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogTrigger({ children, className, ref, ...props }: AlertDialogTriggerProps) {
  return (
    <AlertDialogPrimitive.Trigger ref={ref as any} data-slot="alert-dialog-trigger" {...props}>
      {children}
    </AlertDialogPrimitive.Trigger>
  );
}

interface AlertDialogPortalProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogPortal({ children, className, ...props }: AlertDialogPortalProps) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props}>
      {children}
    </AlertDialogPrimitive.Portal>
  );
}

interface AlertDialogOverlayProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogOverlay({ className, children, ...props }: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', 'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=open]:animate-in', className)}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Overlay>
  );
}

// Assuming DialogContentProps from the provided user context
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {}

interface AlertDialogContentProps extends Omit<DialogContentProps, 'onPointerDownOutside' | 'onInteractOutside'> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 sm:max-w-lg',
          'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=open]:animate-in',
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
}

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogHeader({ className, children, ...props }: AlertDialogHeaderProps) {
  return (
    <div data-slot="alert-dialog-header" className={cn('flex flex-col gap-2 text-center sm:text-left', overlayHeaderPrClass, className)} {...props}>
      {children}
    </div>
  );
}

interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogFooter({ className, children, ...props }: AlertDialogFooterProps) {
  return (
    <div data-slot="alert-dialog-footer" className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props}>
      {children}
    </div>
  );
}

interface AlertDialogTitleProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogTitle({ className, children, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn('font-semibold text-lg', className)} {...props}>
      {children}
    </AlertDialogPrimitive.Title>
  );
}

interface AlertDialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogDescription({ className, children, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn('text-muted-foreground text-sm', className)} {...props}>
      {children}
    </AlertDialogPrimitive.Description>
  );
}

interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogAction({ className, children, ref, ...props }: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action ref={ref as any} className={cn(buttonVariants(), className)} {...props}>
      {children}
    </AlertDialogPrimitive.Action>
  );
}

interface AlertDialogCancelProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AlertDialogCancel({ className, children, asChild, ref, ...props }: AlertDialogCancelProps) {
  // 📌 **`asChild` 时不注入 `buttonVariants`** ——
  //   Radix `asChild` 通过 `Slot` 把本组件的 className **合并进子元素**，
  //   而 `Slot` 的合并是**跨层拼接**（此处 `buttonVariants` 的 `px-3 py-2`
  //   与子元素自己的 `p-0` 各自跑过一次 `twMerge`），**冲突不会被消除** ——
  //   最终 `px-3 py-2` 依然生效，表现为「关闭按钮左右有 12px 内边距」。
  //
  //   故 `asChild` 场景（如右上角图标关闭按钮）必须让调用方**完全掌控样式**，
  //   此处只透传 `className`。
  return (
    <AlertDialogPrimitive.Cancel ref={ref as any} asChild={asChild} className={cn(asChild ? undefined : buttonVariants({ variant: 'outline' }), className)} {...props}>
      {children}
    </AlertDialogPrimitive.Cancel>
  );
}

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
