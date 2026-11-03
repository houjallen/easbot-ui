import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { useComponentMessage } from '../../../utils/use-component-message';
import type { UiMessageProps } from '../../../utils/ui-message';
import { cn } from '../../lib/utils';

function Breadcrumb({ 'aria-label': ariaLabel, locale, messages, ...props }: React.ComponentProps<'nav'> & UiMessageProps) {
  const { t } = useComponentMessage('breadcrumb', { locale, messages });
  return <nav aria-label={ariaLabel ?? t('navLabel')} data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return <ol data-slot="breadcrumb-list" className={cn('flex flex-wrap items-center gap-1.5 break-words text-muted-foreground text-sm sm:gap-2.5', className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return <Comp data-slot="breadcrumb-link" className={cn('transition-colors hover:text-foreground', className)} {...props} />;
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  // 当前页不可点击，故不使用 role="link"（避免引入不可聚焦的交互角色），仅以 aria-current 标注
  return <span data-slot="breadcrumb-page" aria-current="page" className={cn('font-normal text-foreground', className)} {...props} />;
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn('[&>svg]:size-3.5', className)} {...props}>
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, locale, messages, ...props }: React.ComponentProps<'span'> & UiMessageProps) {
  const { t } = useComponentMessage('breadcrumb', { locale, messages });
  return (
    <span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={cn('flex size-9 items-center justify-center', className)} {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">{t('more')}</span>
    </span>
  );
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis };
