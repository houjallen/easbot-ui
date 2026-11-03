'use client';

import {
  ContextMenu as DsContextMenu,
  ContextMenuCheckboxItem as DsContextMenuCheckboxItem,
  ContextMenuContent as DsContextMenuContent,
  ContextMenuGroup as DsContextMenuGroup,
  ContextMenuItem as DsContextMenuItem,
  ContextMenuLabel as DsContextMenuLabel,
  ContextMenuPortal as DsContextMenuPortal,
  ContextMenuRadioGroup as DsContextMenuRadioGroup,
  ContextMenuRadioItem as DsContextMenuRadioItem,
  ContextMenuSeparator as DsContextMenuSeparator,
  ContextMenuShortcut as DsContextMenuShortcut,
  ContextMenuSub as DsContextMenuSub,
  ContextMenuSubContent as DsContextMenuSubContent,
  ContextMenuSubTrigger as DsContextMenuSubTrigger,
  ContextMenuTrigger as DsContextMenuTrigger,
} from '../../design-system/components/ui/context-menu';
import React from 'react';

export const ContextMenu = DsContextMenu;
export const ContextMenuTrigger = DsContextMenuTrigger;
export const ContextMenuContent = DsContextMenuContent;
export const ContextMenuGroup = DsContextMenuGroup;
export const ContextMenuPortal = DsContextMenuPortal;
export const ContextMenuSub = DsContextMenuSub;
export const ContextMenuRadioGroup = DsContextMenuRadioGroup;
export const ContextMenuSubTrigger = DsContextMenuSubTrigger;
export const ContextMenuSubContent = DsContextMenuSubContent;
export const ContextMenuItem = DsContextMenuItem;
export const ContextMenuCheckboxItem = DsContextMenuCheckboxItem;
export const ContextMenuRadioItem = DsContextMenuRadioItem;
export const ContextMenuLabel = DsContextMenuLabel;
export const ContextMenuSeparator = DsContextMenuSeparator;
export const ContextMenuShortcut = DsContextMenuShortcut;

// 类型导出，带中文注释
export type ContextMenuProps = React.ComponentProps<typeof ContextMenu>; // 上下文菜单根组件属性
export type ContextMenuTriggerProps = React.ComponentProps<typeof ContextMenuTrigger>; // 触发器属性
export type ContextMenuContentProps = React.ComponentProps<typeof ContextMenuContent>; // 菜单内容属性
export type ContextMenuGroupProps = React.ComponentProps<typeof ContextMenuGroup>; // 菜单分组属性
export type ContextMenuPortalProps = React.ComponentProps<typeof ContextMenuPortal>; // 菜单门户属性
export type ContextMenuSubProps = React.ComponentProps<typeof ContextMenuSub>; // 子菜单属性
export type ContextMenuRadioGroupProps = React.ComponentProps<typeof ContextMenuRadioGroup>; // 单选组属性
export type ContextMenuSubTriggerProps = React.ComponentProps<typeof ContextMenuSubTrigger>; // 子菜单触发器属性
export type ContextMenuSubContentProps = React.ComponentProps<typeof ContextMenuSubContent>; // 子菜单内容属性
export type ContextMenuItemProps = React.ComponentProps<typeof ContextMenuItem>; // 菜单项属性
export type ContextMenuCheckboxItemProps = React.ComponentProps<typeof ContextMenuCheckboxItem>; // 复选菜单项属性
export type ContextMenuRadioItemProps = React.ComponentProps<typeof ContextMenuRadioItem>; // 单选菜单项属性
export type ContextMenuLabelProps = React.ComponentProps<typeof ContextMenuLabel>; // 标签属性
export type ContextMenuSeparatorProps = React.ComponentProps<typeof ContextMenuSeparator>; // 分隔符属性
export type ContextMenuShortcutProps = React.ComponentProps<typeof ContextMenuShortcut>; // 快捷键属性
