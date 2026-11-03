import {
  Breadcrumb as DsBreadcrumb,
  BreadcrumbEllipsis as DsBreadcrumbEllipsis,
  BreadcrumbItem as DsBreadcrumbItem,
  BreadcrumbLink as DsBreadcrumbLink,
  BreadcrumbList as DsBreadcrumbList,
  BreadcrumbPage as DsBreadcrumbPage,
  BreadcrumbSeparator as DsBreadcrumbSeparator,
} from '../../design-system/components/ui/breadcrumb';
import type { UiMessageProps } from '../../utils/ui-message';
import * as React from 'react';

/** 面包屑根组件 —— 透传 `locale` / `messages` 供导航标签国际化 */
function Breadcrumb({ locale, messages, ...props }: React.ComponentProps<typeof DsBreadcrumb>) {
  return <DsBreadcrumb locale={locale} messages={messages} {...props} />;
}

/** 面包屑省略号 —— 透传 `locale` / `messages` */
function BreadcrumbEllipsis({ locale, messages, ...props }: React.ComponentProps<typeof DsBreadcrumbEllipsis>) {
  return <DsBreadcrumbEllipsis locale={locale} messages={messages} {...props} />;
}

export const BreadcrumbList = DsBreadcrumbList;
export const BreadcrumbItem = DsBreadcrumbItem;
export const BreadcrumbLink = DsBreadcrumbLink;
export const BreadcrumbPage = DsBreadcrumbPage;
export const BreadcrumbSeparator = DsBreadcrumbSeparator;

export { Breadcrumb, BreadcrumbEllipsis };

// 类型导出，带中文注释
export type BreadcrumbProps = React.ComponentProps<typeof Breadcrumb> & UiMessageProps; // 面包屑根组件属性
export type BreadcrumbListProps = React.ComponentProps<typeof BreadcrumbList>; // 面包屑列表属性
export type BreadcrumbItemProps = React.ComponentProps<typeof BreadcrumbItem>; // 面包屑项属性
export type BreadcrumbLinkProps = React.ComponentProps<typeof BreadcrumbLink>; // 面包屑链接属性
export type BreadcrumbPageProps = React.ComponentProps<typeof BreadcrumbPage>; // 面包屑页面属性
export type BreadcrumbSeparatorProps = React.ComponentProps<typeof BreadcrumbSeparator>; // 面包屑分隔符属性
export type BreadcrumbEllipsisProps = React.ComponentProps<typeof BreadcrumbEllipsis> & UiMessageProps; // 面包屑省略号属性
