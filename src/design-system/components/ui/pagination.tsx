import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import * as React from 'react';

import { buttonVariants } from './button';
import type { Button } from './button';
import { useComponentMessage } from '../../../utils/use-component-message';
import type { UiMessageProps } from '../../../utils/ui-message';
import { cn } from '../../lib/utils';

function Pagination({ className, 'aria-label': ariaLabel, locale, messages, ...props }: React.ComponentProps<'nav'> & UiMessageProps) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return <nav aria-label={ariaLabel ?? t('navLabel')} data-slot="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />;
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="pagination-content" className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'> &
  UiMessageProps;

function PaginationLink({ className, isActive = false, size = 'icon', locale, messages, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, children, 'aria-label': ariaLabel, locale, messages, ...props }: React.ComponentProps<typeof PaginationLink>) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return (
    <PaginationLink aria-label={ariaLabel ?? t('prevAriaLabel')} size="default" className={cn('gap-1 px-2.5 sm:pl-2.5', className)} {...props}>
      <ChevronLeftIcon />
      <span className="hidden sm:block">{`${children ?? t('prev')}`}</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, children, 'aria-label': ariaLabel, locale, messages, ...props }: React.ComponentProps<typeof PaginationLink>) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return (
    <PaginationLink aria-label={ariaLabel ?? t('nextAriaLabel')} size="default" className={cn('gap-1 px-2.5 sm:pr-2.5', className)} {...props}>
      <span className="hidden sm:block">{`${children ?? t('next')}`}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, children, locale, messages, ...props }: React.ComponentProps<'span'> & UiMessageProps) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return (
    <span aria-hidden data-slot="pagination-ellipsis" className={cn('flex size-9 items-center justify-center', className)} {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{`${children ?? t('morePages')}`}</span>
    </span>
  );
}

export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis };
