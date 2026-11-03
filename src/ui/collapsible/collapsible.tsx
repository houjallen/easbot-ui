'use client';

import { Collapsible as DsCollapsible, CollapsibleContent as DsCollapsibleContent, CollapsibleTrigger as DsCollapsibleTrigger } from '../../design-system/components/ui/collapsible';
import React from 'react';

export const Collapsible = DsCollapsible;
export const CollapsibleTrigger = DsCollapsibleTrigger;
export const CollapsibleContent = DsCollapsibleContent;

// 类型导出，带中文注释
export type CollapsibleProps = React.ComponentProps<typeof Collapsible>; // 可折叠容器属性
export type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>; // 可折叠触发器属性
export type CollapsibleContentProps = React.ComponentProps<typeof CollapsibleContent>; // 可折叠内容属性
