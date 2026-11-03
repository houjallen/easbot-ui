/**
 * 现代化表格头部组件
 * 采用最新React模式，支持粘性定位和自定义样式
 */

import { cn } from '../../../utils/classnames';
import React, { forwardRef, memo } from 'react';
import type { TableHeaderProps } from '../types';

/**
 * 现代化表格头部组件
 * 提供表格头部容器功能，支持粘性定位
 */
export const TableHeader = memo(
  forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ children, className, style, stickyHeader = false, stickyHeaderOffset = 0, ...props }, ref) => {
    const headerClasses = cn(
      // 基础样式 - 参考 Ant Design 和 Material-UI 的表头设计
      'bg-muted/50 [&_tr]:border-border/80 [&_tr]:border-b',
      // 增强表头的视觉层次感
      'backdrop-blur-sm',

      // 粘性样式 - 参考 GitHub 和 Linear 的粘性表头设计
      {
        'sticky z-20 border-border/80 border-b shadow-sm': stickyHeader,
      },

      // EAS表格扩展样式
      'eas-table-header',

      className,
    );

    const headerStyle: React.CSSProperties = {
      ...style,
      ...(stickyHeader && { top: stickyHeaderOffset }),
    };

    return (
      <thead ref={ref} data-slot="table-header" className={headerClasses} style={headerStyle} {...props}>
        {children}
      </thead>
    );
  }),
);

TableHeader.displayName = 'TableHeader';
