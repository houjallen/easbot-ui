// 复用 design-system Menubar 组件
import {
  Menubar as DsMenubar,
  MenubarCheckboxItem as DsMenubarCheckboxItem,
  MenubarContent as DsMenubarContent,
  MenubarGroup as DsMenubarGroup,
  MenubarItem as DsMenubarItem,
  MenubarLabel as DsMenubarLabel,
  MenubarMenu as DsMenubarMenu,
  MenubarPortal as DsMenubarPortal,
  MenubarRadioGroup as DsMenubarRadioGroup,
  MenubarRadioItem as DsMenubarRadioItem,
  MenubarSeparator as DsMenubarSeparator,
  MenubarShortcut as DsMenubarShortcut,
  MenubarSub as DsMenubarSub,
  MenubarSubContent as DsMenubarSubContent,
  MenubarSubTrigger as DsMenubarSubTrigger,
  MenubarTrigger as DsMenubarTrigger,
} from '../../design-system/components/ui/menubar';
import React from 'react';

export const Menubar = DsMenubar;
export const MenubarMenu = DsMenubarMenu;
export const MenubarTrigger = DsMenubarTrigger;
export const MenubarContent = DsMenubarContent;
export const MenubarItem = DsMenubarItem;
export const MenubarSeparator = DsMenubarSeparator;
export const MenubarLabel = DsMenubarLabel;
export const MenubarCheckboxItem = DsMenubarCheckboxItem;
export const MenubarRadioGroup = DsMenubarRadioGroup;
export const MenubarRadioItem = DsMenubarRadioItem;
export const MenubarPortal = DsMenubarPortal;
export const MenubarSubContent = DsMenubarSubContent;
export const MenubarSubTrigger = DsMenubarSubTrigger;
export const MenubarGroup = DsMenubarGroup;
export const MenubarSub = DsMenubarSub;
export const MenubarShortcut = DsMenubarShortcut;

// 类型导出，带中文注释
export type MenubarProps = React.ComponentProps<typeof Menubar>; // Menubar 根组件属性
export type MenubarMenuProps = React.ComponentProps<typeof MenubarMenu>;
export type MenubarTriggerProps = React.ComponentProps<typeof MenubarTrigger>;
export type MenubarContentProps = React.ComponentProps<typeof MenubarContent>;
export type MenubarItemProps = React.ComponentProps<typeof MenubarItem>;
export type MenubarSeparatorProps = React.ComponentProps<typeof MenubarSeparator>;
export type MenubarLabelProps = React.ComponentProps<typeof MenubarLabel>;
export type MenubarCheckboxItemProps = React.ComponentProps<typeof MenubarCheckboxItem>;
export type MenubarRadioGroupProps = React.ComponentProps<typeof MenubarRadioGroup>;
export type MenubarRadioItemProps = React.ComponentProps<typeof MenubarRadioItem>;
export type MenubarPortalProps = React.ComponentProps<typeof MenubarPortal>;
export type MenubarSubContentProps = React.ComponentProps<typeof MenubarSubContent>;
export type MenubarSubTriggerProps = React.ComponentProps<typeof MenubarSubTrigger>;
export type MenubarGroupProps = React.ComponentProps<typeof MenubarGroup>;
export type MenubarSubProps = React.ComponentProps<typeof MenubarSub>;
export type MenubarShortcutProps = React.ComponentProps<typeof MenubarShortcut>;
