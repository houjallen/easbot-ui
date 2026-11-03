// 复用 design-system NavigationMenu 组件
import {
  NavigationMenu as DsNavigationMenu,
  NavigationMenuContent as DsNavigationMenuContent,
  NavigationMenuItem as DsNavigationMenuItem,
  NavigationMenuLink as DsNavigationMenuLink,
  NavigationMenuList as DsNavigationMenuList,
  NavigationMenuTrigger as DsNavigationMenuTrigger,
  NavigationMenuViewport as DsNavigationMenuViewport,
} from '../../design-system/components/ui/navigation-menu';
import { navigationMenuTriggerStyle as dsNavigationMenuTriggerStyle } from '../../design-system/components/ui/navigation-menu';
import React from 'react';

/**
 * NavigationMenu 组件，自动包裹 position:relative 和合理宽高容器，保证浮层内容正常显示。
 * 如需自定义容器样式，可通过 containerClassName 传递。
 */
export const NavigationMenu = DsNavigationMenu;
export const NavigationMenuList = DsNavigationMenuList;
export const NavigationMenuItem = DsNavigationMenuItem;
export const NavigationMenuContent = DsNavigationMenuContent;
export const NavigationMenuTrigger = DsNavigationMenuTrigger;
export const NavigationMenuLink = DsNavigationMenuLink;
export const NavigationMenuViewport = DsNavigationMenuViewport;
export const navigationMenuTriggerStyle = dsNavigationMenuTriggerStyle;

// 类型导出，带中文注释
export type NavigationMenuProps = React.ComponentProps<typeof NavigationMenu>; // NavigationMenu 根组件属性
export type NavigationMenuListProps = React.ComponentProps<typeof NavigationMenuList>;
export type NavigationMenuItemProps = React.ComponentProps<typeof NavigationMenuItem>;
export type NavigationMenuContentProps = React.ComponentProps<typeof NavigationMenuContent>;
export type NavigationMenuTriggerProps = React.ComponentProps<typeof NavigationMenuTrigger>;
export type NavigationMenuLinkProps = React.ComponentProps<typeof NavigationMenuLink>;
export type NavigationMenuViewportProps = React.ComponentProps<typeof NavigationMenuViewport>;
