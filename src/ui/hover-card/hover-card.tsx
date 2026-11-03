import { HoverCard as DsHoverCard, HoverCardContent as DsHoverCardContent, HoverCardTrigger as DsHoverCardTrigger } from '../../design-system/components/ui/hover-card';
import React from 'react';

export const HoverCard = DsHoverCard;
export const HoverCardTrigger = DsHoverCardTrigger;
export const HoverCardContent = DsHoverCardContent;

// 类型导出
export type HoverCardProps = React.ComponentProps<typeof HoverCard>;
export type HoverCardTriggerProps = React.ComponentProps<typeof HoverCardTrigger>;
export type HoverCardContentProps = React.ComponentProps<typeof HoverCardContent>;
