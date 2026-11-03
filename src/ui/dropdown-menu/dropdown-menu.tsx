/**
 * DropdownMenu 下拉菜单组件
 *
 * @description
 * 基于 Radix UI 的下拉菜单组件封装，提供了完整的下拉菜单功能。
 * 支持嵌套菜单、复选框、单选框、分隔符、快捷键等功能。
 *
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button>打开菜单</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>菜单项 1</DropdownMenuItem>
 *     <DropdownMenuItem>菜单项 2</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */

import {
  DropdownMenu as DsDropdownMenu,
  DropdownMenuContent as DsDropdownMenuContent,
  DropdownMenuItem as DsDropdownMenuItem,
  DropdownMenuTrigger as DsDropdownMenuTrigger,
} from '../../design-system/components/ui/dropdown-menu';
import {
  DropdownMenuCheckboxItem as DsDropdownMenuCheckboxItem,
  DropdownMenuGroup as DsDropdownMenuGroup,
  DropdownMenuLabel as DsDropdownMenuLabel,
  DropdownMenuPortal as DsDropdownMenuPortal,
  DropdownMenuRadioGroup as DsDropdownMenuRadioGroup,
  DropdownMenuRadioItem as DsDropdownMenuRadioItem,
  DropdownMenuSeparator as DsDropdownMenuSeparator,
  DropdownMenuShortcut as DsDropdownMenuShortcut,
  DropdownMenuSub as DsDropdownMenuSub,
  DropdownMenuSubContent as DsDropdownMenuSubContent,
  DropdownMenuSubTrigger as DsDropdownMenuSubTrigger,
} from '../../design-system/components/ui/dropdown-menu';
import React from 'react';

// 组件导出
export const DropdownMenu = DsDropdownMenu;
export const DropdownMenuPortal = DsDropdownMenuPortal;
export const DropdownMenuTrigger = DsDropdownMenuTrigger;
export const DropdownMenuContent = DsDropdownMenuContent;
export const DropdownMenuGroup = DsDropdownMenuGroup;
export const DropdownMenuLabel = DsDropdownMenuLabel;
export const DropdownMenuItem = DsDropdownMenuItem;
export const DropdownMenuCheckboxItem = DsDropdownMenuCheckboxItem;
export const DropdownMenuRadioGroup = DsDropdownMenuRadioGroup;
export const DropdownMenuRadioItem = DsDropdownMenuRadioItem;
export const DropdownMenuSeparator = DsDropdownMenuSeparator;
export const DropdownMenuShortcut = DsDropdownMenuShortcut;
export const DropdownMenuSub = DsDropdownMenuSub;
export const DropdownMenuSubTrigger = DsDropdownMenuSubTrigger;
export const DropdownMenuSubContent = DsDropdownMenuSubContent;

// 类型导出，便于 IDE 智能提示
export type DropdownMenuProps = React.ComponentProps<typeof DropdownMenu>; // DropdownMenu 根组件
export type DropdownMenuPortalProps = React.ComponentProps<typeof DropdownMenuPortal>;
export type DropdownMenuTriggerProps = React.ComponentProps<typeof DropdownMenuTrigger>;
export type DropdownMenuContentProps = React.ComponentProps<typeof DropdownMenuContent>;
export type DropdownMenuGroupProps = React.ComponentProps<typeof DropdownMenuGroup>;
export type DropdownMenuLabelProps = React.ComponentProps<typeof DropdownMenuLabel>;
export type DropdownMenuItemProps = React.ComponentProps<typeof DropdownMenuItem>;
export type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof DropdownMenuCheckboxItem>;
export type DropdownMenuRadioGroupProps = React.ComponentProps<typeof DropdownMenuRadioGroup>;
export type DropdownMenuRadioItemProps = React.ComponentProps<typeof DropdownMenuRadioItem>;
export type DropdownMenuSeparatorProps = React.ComponentProps<typeof DropdownMenuSeparator>;
export type DropdownMenuShortcutProps = React.ComponentProps<typeof DropdownMenuShortcut>;
export type DropdownMenuSubProps = React.ComponentProps<typeof DropdownMenuSub>;
export type DropdownMenuSubTriggerProps = React.ComponentProps<typeof DropdownMenuSubTrigger>;
export type DropdownMenuSubContentProps = React.ComponentProps<typeof DropdownMenuSubContent>;
