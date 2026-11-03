import {
  Sidebar as DSSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail as DsSidebarRail,
  SidebarSeparator,
  SidebarTrigger as DsSidebarTrigger,
  useSidebar,
} from '../../design-system/components/ui/sidebar';
import type { UiMessageProps } from '../../utils/ui-message';
import * as React from 'react';

/**
 * 侧边栏 —— 透传 `locale` / `messages` 供移动端标题与描述国际化
 */
function Sidebar({ locale, messages, ...props }: React.ComponentProps<typeof DSSidebar>) {
  return <DSSidebar locale={locale} messages={messages} {...props} />;
}

/** 侧边栏触发按钮 —— 透传 `locale` / `messages` 供「切换侧边栏」文案国际化 */
function SidebarTrigger({ locale, messages, ...props }: React.ComponentProps<typeof DsSidebarTrigger>) {
  return <DsSidebarTrigger locale={locale} messages={messages} {...props} />;
}

/** 侧边栏拖拽条 —— 透传 `locale` / `messages` 供「切换侧边栏」文案国际化 */
function SidebarRail({ locale, messages, ...props }: React.ComponentProps<typeof DsSidebarRail>) {
  return <DsSidebarRail locale={locale} messages={messages} {...props} />;
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

export type SidebarProps = React.ComponentProps<typeof Sidebar> & UiMessageProps;
export type SidebarProviderProps = React.ComponentProps<typeof SidebarProvider>;
export type SidebarContentProps = React.ComponentProps<typeof SidebarContent>;
export type SidebarFooterProps = React.ComponentProps<typeof SidebarFooter>;
export type SidebarGroupProps = React.ComponentProps<typeof SidebarGroup>;
export type SidebarGroupActionProps = React.ComponentProps<typeof SidebarGroupAction>;
export type SidebarGroupContentProps = React.ComponentProps<typeof SidebarGroupContent>;
export type SidebarGroupLabelProps = React.ComponentProps<typeof SidebarGroupLabel>;
export type SidebarHeaderProps = React.ComponentProps<typeof SidebarHeader>;
export type SidebarInputProps = React.ComponentProps<typeof SidebarInput>;
export type SidebarInsetProps = React.ComponentProps<typeof SidebarInset>;
export type SidebarMenuProps = React.ComponentProps<typeof SidebarMenu>;
export type SidebarMenuActionProps = React.ComponentProps<typeof SidebarMenuAction>;
export type SidebarMenuBadgeProps = React.ComponentProps<typeof SidebarMenuBadge>;
export type SidebarMenuButtonProps = React.ComponentProps<typeof SidebarMenuButton>;
export type SidebarMenuItemProps = React.ComponentProps<typeof SidebarMenuItem>;
export type SidebarMenuSkeletonProps = React.ComponentProps<typeof SidebarMenuSkeleton>;
export type SidebarMenuSubProps = React.ComponentProps<typeof SidebarMenuSub>;
export type SidebarMenuSubButtonProps = React.ComponentProps<typeof SidebarMenuSubButton>;
export type SidebarMenuSubItemProps = React.ComponentProps<typeof SidebarMenuSubItem>;
export type SidebarRailProps = React.ComponentProps<typeof SidebarRail> & UiMessageProps;
export type SidebarSeparatorProps = React.ComponentProps<typeof SidebarSeparator>;
export type SidebarTriggerProps = React.ComponentProps<typeof SidebarTrigger> & UiMessageProps;
