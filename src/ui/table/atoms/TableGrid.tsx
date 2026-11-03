/**
 * 现代化表格网格组件
 * 基础的HTML table元素封装，采用最新React模式
 */

import type { TableGridProps } from '../types';
import { cn } from '../../../utils/classnames';
import React, { forwardRef, memo } from 'react';

export const TableGrid = memo(
  forwardRef<HTMLTableElement, TableGridProps>(({ children, className, style, fixedLayout = true, tableMinWidth = 720, columnWidths, ...props }, ref) => {
    const tableClasses = cn(
      // 基础样式 - 与设计系统保持一致
      'w-full caption-bottom',

      // 布局样式
      {
        'table-fixed': fixedLayout,
        'table-auto': !fixedLayout,
      },

      // 边框样式
      'border-collapse border-spacing-0',

      // EAS表格扩展样式
      'eas-table',

      className,
    );
    // 渲染colgroup元素
    const renderColgroup = () => {
      if (!columnWidths || columnWidths.length === 0) {
        return null;
      }

      return (
        <colgroup>
          {columnWidths.map((colWidth, index) => {
            const colStyle: React.CSSProperties = {};

            if (colWidth.width) {
              colStyle.width = `${colWidth.width}px`;
            }
            if (colWidth.minWidth) {
              colStyle.minWidth = `${colWidth.minWidth}px`;
            }
            if (colWidth.maxWidth) {
              colStyle.maxWidth = `${colWidth.maxWidth}px`;
            }

            return <col key={index} data-index={index} style={Object.keys(colStyle).length > 0 ? colStyle : undefined} />;
          })}
        </colgroup>
      );
    };

    return (
      <table
        ref={ref}
        data-slot="table"
        className={cn(tableClasses, className)}
        style={{
          minWidth: tableMinWidth,
          ...style,
        }}
        {...props}
      >
        {renderColgroup()}
        {children}
      </table>
    );
  }),
);

TableGrid.displayName = 'TableGrid';
