'use client';

import { ToggleGroup as DsToggleGroup, ToggleGroupItem as DsToggleGroupItem } from '../../design-system/components/ui/toggle-group';
import * as React from 'react';

export const ToggleGroup = DsToggleGroup;
export const ToggleGroupItem = DsToggleGroupItem;

// 类型导出，带中文注释
export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroup>; // 切换组属性
export type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupItem>; // 切换项属性
