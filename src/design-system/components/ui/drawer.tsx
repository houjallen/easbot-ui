'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { useComponentMessage } from '../../../utils/use-component-message';
import type { UiMessageProps } from '../../../utils/ui-message';
import { cn } from '../../lib/utils';
import { XIcon } from 'lucide-react';
import { overlayCloseButtonClass, overlayHeaderPrClass } from './overlay-surface';

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn('data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in', className)}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  side = 'bottom',
  locale,
  messages,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
} & UiMessageProps) {
  const { t } = useComponentMessage('drawer', { locale, messages });
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'group/drawer-content fixed z-50 flex h-auto flex-col bg-background',
          side === 'top' && 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b',
          side === 'bottom' && 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t',
          side === 'right' && 'inset-y-0 right-0 w-3/4 sm:max-w-sm',
          side === 'left' && 'inset-y-0 left-0 w-3/4 sm:max-w-sm',
          className,
        )}
        {...props}
      >
        {/* 拖拽指示条 —— 仅 bottom 方向显示 */}
        <div className={cn('mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted', side === 'bottom' && 'block')} />
        {children}
        <DrawerPrimitive.Close
          data-slot="drawer-close"
          // 📌 **与 Dialog 基准一致**：`absolute top-4 right-4` + `rounded-xs`（方角）。
          //    此前 Drawer 用 `top-8 right-4`（比 Dialog 低 16px，为拖拽条让位），
          //    导致同一产品族内关闭按钮位置不一致。
          className={cn(overlayCloseButtonClass)}
        >
          <XIcon className="size-4" />
          <span className="sr-only">{t('closeLabel')}</span>
        </DrawerPrimitive.Close>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      // 📌 `p-6` 与 Dialog / AlertDialog 一致（此前是 `p-4`）；
      //    `pr-10` 为右上角关闭按钮预留空间（标题不得被压住）。
      className={cn('flex flex-col gap-1.5 p-6', overlayHeaderPrClass, className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2 p-6', className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn('font-semibold text-foreground', className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
