/**
 * 现代化表格单元格组件
 * 采用最新React模式，支持对齐、截断、固定等功能
 */

import { cn } from '../../../utils/classnames';
import React, { forwardRef, memo, useCallback } from 'react';
import type { TableCellProps } from '../types';

/**
 * 现代化表格单元格组件
 * 支持td和th两种渲染模式，提供完整的单元格功能
 */
export const TableCell = memo(
  forwardRef<HTMLTableCellElement, TableCellProps>(({ children, className, style, as = 'td', align = 'start', fixed, ellipsis = false, resizeable = false, onResize, ...props }, ref) => {
    const cellClasses = cn(
      // 基础样式 - 与设计系统保持一致
      'border-b align-middle',

      // 内边距 - 根据单元格类型调整
      {
        // 头部单元格样式
        'h-10 px-2 text-left font-medium text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]': as === 'th',
        // 普通单元格样式
        'p-2 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]': as === 'td',
      },

      // 对齐样式（兼容Schema和CSS逻辑属性）
      {
        'text-left': align === 'left',
        'text-center': align === 'center',
        'text-right': align === 'right',
      },

      // 固定样式（兼容Schema和CSS逻辑属性）
      {
        'sticky bg-background': fixed,
        'left-0 z-10': fixed === 'left',
        'right-0 z-10': fixed === 'right',
      },

      // 截断样式和最小宽度
      {
        'max-w-0 truncate': ellipsis,
        'whitespace-nowrap': !ellipsis, // 默认不换行
      },

      // 可调整大小样式
      {
        relative: resizeable,
      },

      // EAS表格扩展样式
      'eas-table-cell',

      className,
    );

    const cellStyle: React.CSSProperties = {
      ...style,
    };

    // 调整大小处理逻辑
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (!resizeable || !onResize) return;

        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = (e.currentTarget as HTMLElement).offsetWidth;

        const handleMouseMove = (e: MouseEvent) => {
          const newWidth = Math.max(50, startWidth + (e.clientX - startX));
          onResize(newWidth);
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },
      [resizeable, onResize],
    );

    const CellComponent = as === 'th' ? 'th' : 'td';

    return (
      <CellComponent ref={ref as any} data-slot={as === 'th' ? 'table-head' : 'table-cell'} className={cellClasses} style={cellStyle} {...props}>
        {/* 简化内容结构 - 去除不必要的嵌套div */}
        {ellipsis ? <div className="truncate">{children}</div> : children}

        {/* 调整大小手柄 */}
        {resizeable && (
          <div className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize opacity-0 hover:bg-primary/20 hover:opacity-100" onMouseDown={handleMouseDown}>
            <div className="h-full w-px bg-border" />
          </div>
        )}
      </CellComponent>
    );
  }),
);

TableCell.displayName = 'TableCell';
