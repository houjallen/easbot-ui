'use client';
import * as React from 'react';

import {
  Accordion as DsAccordion,
  AccordionContent as DsAccordionContent,
  AccordionItem as DsAccordionItem,
  AccordionTrigger as DsAccordionTrigger,
} from '../../design-system/components/ui/accordion';

export const Accordion = DsAccordion;
export const AccordionItem = DsAccordionItem;
export const AccordionTrigger = DsAccordionTrigger;
export const AccordionContent = DsAccordionContent;

// 类型导出，带中文注释
export type AccordionProps = React.ComponentProps<typeof Accordion>; // 手风琴根组件属性
export type AccordionItemProps = React.ComponentProps<typeof AccordionItem>; // 手风琴项属性
export type AccordionTriggerProps = React.ComponentProps<typeof AccordionTrigger>; // 手风琴触发器属性
export type AccordionContentProps = React.ComponentProps<typeof AccordionContent>; // 手风琴内容属性
