/**
 * 现代化表格主体组件
 * 采用最新React模式，提供表格数据内容容器
 */

import { cn } from '../../../utils/classnames';
import React, { forwardRef, memo } from 'react';
import type { TableBodyProps } from '../types';

/**
 * 现代化表格主体组件
 * 提供表格数据内容的容器功能
 */
export const TableBody = memo(
  forwardRef<HTMLTableSectionElement, TableBodyProps>(({ children, className, style, minHeight, ...props }, ref) => {
    const bodyClasses = cn(
      // 基础样式 - 与设计系统保持一致
      '[&_tr:last-child]:border-0',

      // EAS表格扩展样式
      'eas-table-body',

      className,
    );

    const bodyStyle: React.CSSProperties = {
      ...style,
      ...(minHeight && { minHeight }),
    };

    return (
      <tbody ref={ref} data-slot="table-body" className={bodyClasses} style={bodyStyle} {...props}>
        {children}
      </tbody>
    );
  }),
);

TableBody.displayName = 'TableBody';
