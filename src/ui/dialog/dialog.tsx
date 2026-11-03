/**
 * Dialog 对话框组件（eas-ui-next 封装）
 *
 * @description
 * 完全复用 design-system 的 Dialog 及其子组件，无任何自定义扩展。
 * 所有样式、结构、主题变量均与 design-system 保持一致。
 * 使用方式与 design-system 完全一致，详见 design-system 文档。
 */

import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import {
  Dialog,
  DialogClose,
  DialogContent as DsDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../../design-system/components/ui/dialog';
import { Maximize, Minimize } from 'lucide-react';
import * as React from 'react';

/**
 * 扩展型 DialogContent，支持最大化按钮（maximizable 属性）
 * 默认不显示最大化按钮，仅在 maximizable 为 true 时渲染
 */
export interface EunDialogContentProps extends React.ComponentProps<typeof DsDialogContent>, UiMessageProps {
  /** 是否显示最大化按钮 */
  maximizable?: boolean;
}

export const EunDialogContent = React.forwardRef<HTMLDivElement, EunDialogContentProps>(({ maximizable = false, className, children, locale, messages, ...props }, ref) => {
  const [maximized, setMaximized] = React.useState(false);
  const { t } = useComponentMessage('dialog', { locale, messages });
  const toggleLabel = maximized ? t('restore') : t('maximize');
  return (
    <DsDialogContent
      ref={ref}
      locale={locale}
      messages={messages}
      {...props}
      className={cn(maximized ? '!max-w-none !w-full !h-full !top-0 !left-0 !translate-x-0 !translate-y-0 fixed inset-0 m-0 rounded-none' : '', className)}
    >
      {/* 右上角最大化/还原按钮，仅在 maximizable 时显示 */}
      {maximizable && (
        <button
          type="button"
          aria-label={toggleLabel}
          className="absolute top-4 right-10 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          style={{ cursor: 'pointer' }}
          onClick={() => setMaximized((m) => !m)}
        >
          {maximized ? <Minimize /> : <Maximize />}
          <span className="sr-only">{toggleLabel}</span>
        </button>
      )}
      {children}
    </DsDialogContent>
  );
});
EunDialogContent.displayName = 'EunDialogContent';

// 其余组件直接导出，ds 相关统一 Ds 前缀
export { Dialog, DialogTrigger, DialogPortal, DialogOverlay, EunDialogContent as DialogContent, DialogClose, DialogHeader, DialogFooter, DialogTitle, DialogDescription };

/**
 * Dialog 相关类型定义（eas-ui-next 按规范导出，便于类型提示和复用）
 */
export type DialogProps = React.ComponentProps<typeof Dialog>;
export type DialogContentProps = EunDialogContentProps;
export type DialogTriggerProps = React.ComponentProps<typeof DialogTrigger>;
export type DialogPortalProps = React.ComponentProps<typeof DialogPortal>;
export type DialogOverlayProps = React.ComponentProps<typeof DialogOverlay>;
export type DialogCloseProps = React.ComponentProps<typeof DialogClose>;
export type DialogHeaderProps = React.ComponentProps<'div'>;
export type DialogFooterProps = React.ComponentProps<'div'>;
export type DialogTitleProps = React.ComponentProps<typeof DialogTitle>;
export type DialogDescriptionProps = React.ComponentProps<typeof DialogDescription>;

// 类型也挂载到组件对象上，方便外部通过 Dialog.xxxProps 访问
(Dialog as any).DialogProps = undefined as unknown as DialogProps;
(Dialog as any).TriggerProps = undefined as unknown as DialogTriggerProps;
(Dialog as any).PortalProps = undefined as unknown as DialogPortalProps;
(Dialog as any).OverlayProps = undefined as unknown as DialogOverlayProps;
(Dialog as any).ContentProps = undefined as unknown as DialogContentProps;
(Dialog as any).CloseProps = undefined as unknown as DialogCloseProps;
(Dialog as any).HeaderProps = undefined as unknown as DialogHeaderProps;
(Dialog as any).FooterProps = undefined as unknown as DialogFooterProps;
(Dialog as any).TitleProps = undefined as unknown as DialogTitleProps;
(Dialog as any).DescriptionProps = undefined as unknown as DialogDescriptionProps;
