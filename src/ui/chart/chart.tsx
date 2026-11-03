'use client';

import {
  ChartContainer as DsChartContainer,
  ChartLegend as DsChartLegend,
  ChartLegendContent as DsChartLegendContent,
  ChartTooltip as DsChartTooltip,
  ChartTooltipContent as DsChartTooltipContent,
} from '../../design-system/components/ui/chart';
import type { ChartConfig as DsChartConfig } from '../../design-system/components/ui/chart';
import React from 'react';
export const ChartContainer = DsChartContainer;
export const ChartTooltip = DsChartTooltip;
export const ChartTooltipContent = DsChartTooltipContent;
export const ChartLegend = DsChartLegend;
export const ChartLegendContent = DsChartLegendContent;

// 类型导出，带中文注释
// 直接导出设计系统 ChartConfig 类型，方便业务使用
export type ChartConfig = DsChartConfig;
export type ChartContainerProps = React.ComponentProps<typeof ChartContainer>; // 图表容器属性
export type ChartTooltipProps = React.ComponentProps<typeof ChartTooltip>; // 图表提示框属性
export type ChartTooltipContentProps = React.ComponentProps<typeof ChartTooltipContent>; // 图表提示框内容属性
export type ChartLegendProps = React.ComponentProps<typeof ChartLegend>; // 图例属性
export type ChartLegendContentProps = React.ComponentProps<typeof ChartLegendContent>; // 图例内容属性
