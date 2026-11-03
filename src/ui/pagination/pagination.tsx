/**
 * Pagination 组件，支持页码、快速跳转、尺寸切换。
 *
 * @description
 * 完全复用 design-system 的 Pagination 及其子组件，仅在**文案层**做国际化包装：
 * 上一页 / 下一页 / 省略号 / 导航标签的默认文案来自内置文案表（见 `spec/i18n-standard.md`）。
 *
 * 消费方仍可通过 `children` / `aria-label` 覆盖默认文案，
 * 也可通过 `locale` / `messages` 覆盖语言与整段文案。
 */
import {
  Pagination as DsPagination,
  PaginationContent as DsPaginationContent,
  PaginationEllipsis as DsPaginationEllipsis,
  PaginationItem as DsPaginationItem,
  PaginationLink as DsPaginationLink,
  PaginationNext as DsPaginationNext,
  PaginationPrevious as DsPaginationPrevious,
} from '../../design-system/components/ui/pagination';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import React from 'react';

/** 分页导航容器 —— 补充可访问名称 */
function Pagination({ 'aria-label': ariaLabel, locale, messages, ...props }: React.ComponentProps<typeof DsPagination>) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return <DsPagination aria-label={ariaLabel ?? t('navLabel')} locale={locale} messages={messages} {...props} />;
}

const PaginationContent = DsPaginationContent;
const PaginationItem = DsPaginationItem;
const PaginationLink = DsPaginationLink;

/** 上一页 —— 补充默认文案与可访问名称 */
function PaginationPrevious({ children, 'aria-label': ariaLabel, locale, messages, ...props }: React.ComponentProps<typeof DsPaginationPrevious>) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return (
    <DsPaginationPrevious aria-label={ariaLabel ?? t('prevAriaLabel')} locale={locale} messages={messages} {...props}>
      {children ?? t('prev')}
    </DsPaginationPrevious>
  );
}

/** 下一页 —— 补充默认文案与可访问名称 */
function PaginationNext({ children, 'aria-label': ariaLabel, locale, messages, ...props }: React.ComponentProps<typeof DsPaginationNext>) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return (
    <DsPaginationNext aria-label={ariaLabel ?? t('nextAriaLabel')} locale={locale} messages={messages} {...props}>
      {children ?? t('next')}
    </DsPaginationNext>
  );
}

/** 省略号 —— 补充默认文案 */
function PaginationEllipsis({ children, locale, messages, ...props }: React.ComponentProps<typeof DsPaginationEllipsis>) {
  const { t } = useComponentMessage('pagination', { locale, messages });
  return (
    <DsPaginationEllipsis locale={locale} messages={messages} {...props}>
      {children ?? t('morePages')}
    </DsPaginationEllipsis>
  );
}

export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis };

// 类型导出，带中文注释，便于 IDE 智能提示
export type PaginationProps = React.ComponentProps<typeof Pagination> & UiMessageProps;
export type PaginationContentProps = React.ComponentProps<typeof PaginationContent>;
export type PaginationLinkProps = React.ComponentProps<typeof PaginationLink>;
export type PaginationItemProps = React.ComponentProps<typeof PaginationItem>;
export type PaginationPreviousProps = React.ComponentProps<typeof PaginationPrevious>;
export type PaginationNextProps = React.ComponentProps<typeof PaginationNext>;
export type PaginationEllipsisProps = React.ComponentProps<typeof PaginationEllipsis>;
