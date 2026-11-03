// 复用 design-system Popover 组件
import { Popover as DsPopover, PopoverContent as DsPopoverContent, PopoverTrigger as DsPopoverTrigger } from '../../design-system/components/ui/popover';
import React from 'react';

export const Popover = DsPopover;
export const PopoverTrigger = DsPopoverTrigger;
export const PopoverContent = DsPopoverContent;

// 类型导出，带中文注释
export type PopoverProps = React.ComponentProps<typeof Popover>; // Popover 根组件属性
export type PopoverTriggerProps = React.ComponentProps<typeof PopoverTrigger>;
export type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;
