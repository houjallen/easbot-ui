import { Tooltip as DsTooltip, TooltipContent as DsTooltipContent, TooltipProvider as DsTooltipProvider, TooltipTrigger as DsTooltipTrigger } from '../../design-system/components/ui/tooltip';
import * as React from 'react';

export const Tooltip = DsTooltip;
export const TooltipTrigger = DsTooltipTrigger;
export const TooltipContent = DsTooltipContent;
export const TooltipProvider = DsTooltipProvider;

// 类型导出，带中文注释
export type TooltipProps = React.ComponentProps<typeof Tooltip>; // 提示框根组件属性
export type TooltipTriggerProps = React.ComponentProps<typeof TooltipTrigger>; // 提示框触发器属性
export type TooltipContentProps = React.ComponentProps<typeof TooltipContent>; // 提示框内容属性
export type TooltipProviderProps = React.ComponentProps<typeof TooltipProvider>; // 提示框提供者属性
