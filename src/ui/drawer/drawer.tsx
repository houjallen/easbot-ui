'use client';

import {
  Drawer as DsDrawer,
  DrawerClose as DsDrawerClose,
  DrawerContent as DsDrawerContent,
  DrawerDescription as DsDrawerDescription,
  DrawerFooter as DsDrawerFooter,
  DrawerHeader as DsDrawerHeader,
  DrawerOverlay as DsDrawerOverlay,
  DrawerTitle as DsDrawerTitle,
  DrawerTrigger as DsDrawerTrigger,
} from '../../design-system/components/ui/drawer';
import type { UiMessageProps } from '../../utils/ui-message';
import React from 'react';

/**
 * 抽屉内容 —— 透传 `locale` / `messages` 供关闭按钮文案国际化
 */
function DrawerContent({ locale, messages, ...props }: React.ComponentProps<typeof DsDrawerContent>) {
  return <DsDrawerContent locale={locale} messages={messages} {...props} />;
}

export const Drawer = DsDrawer;
export const DrawerTrigger = DsDrawerTrigger;
export const DrawerClose = DsDrawerClose;
export const DrawerOverlay = DsDrawerOverlay;
export { DrawerContent };
export const DrawerHeader = DsDrawerHeader;
export const DrawerFooter = DsDrawerFooter;
export const DrawerTitle = DsDrawerTitle;
export const DrawerDescription = DsDrawerDescription;

// 类型导出，带中文注释
export type DrawerProps = React.ComponentProps<typeof Drawer>; // 抽屉根组件属性
export type DrawerTriggerProps = React.ComponentProps<typeof DrawerTrigger>; // 触发器属性
export type DrawerCloseProps = React.ComponentProps<typeof DrawerClose>; // 关闭按钮属性
export type DrawerOverlayProps = React.ComponentProps<typeof DrawerOverlay>; // 遮罩属性
export type DrawerContentProps = React.ComponentProps<typeof DrawerContent> & UiMessageProps; // 内容属性
export type DrawerHeaderProps = React.ComponentProps<typeof DrawerHeader>; // 头部属性
export type DrawerFooterProps = React.ComponentProps<typeof DrawerFooter>; // 底部属性
export type DrawerTitleProps = React.ComponentProps<typeof DrawerTitle>; // 标题属性
export type DrawerDescriptionProps = React.ComponentProps<typeof DrawerDescription>; // 描述属性
