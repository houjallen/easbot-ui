import { Sheet as DSSheet, SheetClose, SheetContent as DsSheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../../design-system/components/ui/sheet';
import type { UiMessageProps } from '../../utils/ui-message';
import * as React from 'react';

/**
 * 侧边抽屉内容 —— 透传 `locale` / `messages` 供关闭按钮文案国际化
 */
function SheetContent({ locale, messages, ...props }: React.ComponentProps<typeof DsSheetContent>) {
  return <DsSheetContent locale={locale} messages={messages} {...props} />;
}

export { DSSheet as Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };

export type SheetProps = React.ComponentProps<typeof DSSheet>;
export type SheetContentProps = React.ComponentProps<typeof SheetContent> & UiMessageProps;
export type SheetHeaderProps = React.ComponentProps<typeof SheetHeader>;
export type SheetFooterProps = React.ComponentProps<typeof SheetFooter>;
export type SheetTitleProps = React.ComponentProps<typeof SheetTitle>;
export type SheetDescriptionProps = React.ComponentProps<typeof SheetDescription>;
