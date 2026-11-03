'use client';

import { AspectRatio as DsAspectRatio } from '../../design-system/components/ui/aspect-ratio';
import * as React from 'react';

export const AspectRatio = DsAspectRatio;

// 类型导出，带中文注释
export type AspectRatioProps = React.ComponentProps<typeof AspectRatio>; // 等比例容器属性
