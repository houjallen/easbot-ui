/**
 * 现代化表格行组件
 * 采用最新React模式，支持选中、悬停、点击等交互状态
 */

import { cn } from '../../../utils/classnames';
import React, { forwardRef, memo, useCallback } from 'react';
import { useTableConfig } from '../context/TableContext';
import type { TableRowProps } from '../types';
import { RowContextMenu } from './RowContextMenu';

/**
 * 现代化表格行组件
 * 提供完整的行交互功能和状态管理
 */
export const TableRow = memo(
  forwardRef<HTMLTableRowElement, TableRowProps>(({ children, className, selected = false, expanded = false, hoverable = false, clickable = false, index, record, onClick, ...props }, ref) => {
    const tableConfig = useTableConfig();
    const rowClasses = cn(
      // 基础样式 - 参考 Ant Design 和 GitHub 的设计
      'border-border/80 border-b',

      // 只为非表头行添加过渡动画
      {
        'transition-all duration-200 ease-in-out': hoverable,
      },

      // 可点击样式 - 增强可访问性
      {
        'cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2': clickable,
      },

      // EAS表格扩展样式 - 依赖CSS文件中的样式
      'eas-table-row',

      className,
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLTableRowElement>) => {
        // Checkbox has its own click handler, so we prevent double-toggling
        if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
          return;
        }

        if (onClick) {
          onClick(e);
        }
      },
      [onClick],
    );

    // 如果启用了右键菜单且有行数据，则包装右键菜单
    const rowElement = (
      <tr
        ref={ref}
        data-slot="table-row"
        data-selected={selected}
        data-expanded={expanded}
        className={rowClasses}
        onClick={handleClick}
        data-index={index}
        // 📌 可点击行必须键盘可达 —— `<tr onClick>` 不是交互元素，
        //    补 `tabIndex={0}` + Enter/Space 触发，否则纯键盘用户无法选中该行。
        tabIndex={clickable && onClick ? 0 : undefined}
        onKeyDown={
          clickable && onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </tr>
    );

    // 如果启用了右键菜单且有行数据，包装右键菜单
    if (tableConfig.contextMenuable && record && index !== undefined) {
      return (
        <RowContextMenu record={record} rowIndex={index} className={className} config={{ size: 'sm' }}>
          {rowElement}
        </RowContextMenu>
      );
    }

    return rowElement;
  }),
);

TableRow.displayName = 'TableRow';
