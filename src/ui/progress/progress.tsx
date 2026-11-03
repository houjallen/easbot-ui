// 复用 design-system Progress 组件
import { Progress as DsProgress } from '../../design-system/components/ui/progress';
import React from 'react';

export const Progress = DsProgress;

// 类型导出，带中文注释
export type ProgressProps = React.ComponentProps<typeof Progress>; // 进度条组件属性
