import { useTableLogic } from '../context/TableContext';
import { cn } from '../../../utils/classnames';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTableConfig, useTableState } from '../context/TableContext';
import type { TableColumn } from '../types/base';

export interface TableColumnResizerProps {
  /** 列定义 */
  column: TableColumn;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 自定义类名 */
  className?: string;
}

// 节流函数
function throttle<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 表格列宽调整器组件
 * 提供拖拽调整列宽的功能
 */
export const TableColumnResizer: React.FC<TableColumnResizerProps> = ({ column, minWidth = 80, maxWidth = 800, className }) => {
  // 使用 TableContext 获取列宽状态和配置
  const columnWidths = useTableState((state) => state.columnWidths);
  const config = useTableConfig();
  const tableLogic = useTableLogic();

  // 检查列是否可见
  const isColumnVisible = column.visible !== false;

  // 检查是否启用列宽调整
  // 优先级：column.resizeable > config.resizeable
  // 只有当全局禁用或列级别明确禁用时才不显示调整器
  // 排除特殊列：select、expand和rowaction列不允许调整大小
  // 排除隐藏列：隐藏的列不允许调整大小
  const isSpecialColumn = column.name === '__selection__' || column.name === '__expansion__' || column.name === '__rowaction__';
  const isResizeable = !isSpecialColumn && isColumnVisible && config.resizeable !== false && column.resizeable !== false;

  // 从上下文获取当前列宽
  const width = columnWidths[column.name] || (typeof column.width === 'number' ? column.width : 120);

  // 计算最小最大宽度：TableColumn 优先级高于 ResizeConfig
  const finalMinWidth = column.minWidth ?? config.resize?.minWidth ?? minWidth;
  const finalMaxWidth = column.maxWidth ?? config.resize?.maxWidth ?? maxWidth ?? Number.MAX_SAFE_INTEGER;

  // 状态变量
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);

  // 开发环境下的调试日志（生产环境会被优化掉）
  // if (process.env.NODE_ENV === 'development') {
  //   // 只在开发环境输出关键信息
  //   console.debug(
  //     `[TableColumnResizer] ${column.name}: resizeable=${isresizeable}, width=${width}`,
  //   );
  // }

  // 开始拖拽
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isResizeable) return;

      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = typeof width === 'number' ? width : 120;

      const handleMouseMove = throttle((e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(finalMinWidth, Math.min(finalMaxWidth, startWidth + deltaX));
        tableLogic.resize.setColumnWidth(column.name, newWidth);
      }, 16); // 约60fps

      const handleMouseUp = () => {
        setIsResizing(false);
        // 移除全局事件监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // 恢复样式
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };

      // 添加全局事件监听
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // 防止文本选择
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    },
    [isResizeable, width, finalMinWidth, finalMaxWidth, column.name, tableLogic.resize],
  );

  // 清理事件监听
  useEffect(() => {
    return () => {
      // 清理可能残留的事件监听器
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  // 如果不可调整大小，直接返回null
  if (!isResizeable) {
    return null;
  }

  return (
    <div
      ref={resizerRef}
      className={cn('group absolute top-0 right-0 h-full w-1 cursor-col-resize', 'hover:bg-primary/20 active:bg-primary/30', isResizing && 'bg-primary/30', className)}
      onMouseDown={handleMouseDown}
    >
      {/* 拖拽指示器 */}
      <div
        className={cn(
          '-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-4 w-0.5 transform rounded-full bg-border',
          'group-hover:h-6 group-hover:bg-primary',
          'transition-all duration-150',
          isResizing && 'h-6 bg-primary',
        )}
      />

      {/* 拖拽时的预览线 - 延伸到整个表格高度，紧贴拖拽体 */}
      {isResizing && (
        <div
          className="pointer-events-none absolute top-0 right-0 z-10 w-px bg-border"
          style={{
            height: '200vh', // 确保覆盖整个表格区域
            transform: 'translateY(-50%)', // 向上延伸
          }}
        />
      )}
    </div>
  );
};

/**
 * 表格列宽调整Hook
 */
export const useTableColumnResize = (initialColumns: TableColumn[], initialColumnWidths?: Record<string, number>) => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};

    initialColumns.forEach((column) => {
      const presetWidth = initialColumnWidths?.[column.name];
      if (presetWidth !== undefined) {
        widths[column.name] = presetWidth;
      } else if (typeof column.width === 'number') {
        widths[column.name] = column.width;
      } else {
        widths[column.name] = 120; // 默认宽度
      }
    });

    return widths;
  });

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  // 调整列宽
  const handleColumnResize = useCallback((columnKey: string, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: width,
    }));
  }, []);

  // 开始调整
  const handleResizeStart = useCallback((columnKey: string) => {
    setResizingColumn(columnKey);
  }, []);

  // 结束调整
  const handleResizeEnd = useCallback((columnKey: string, width: number) => {
    setResizingColumn(null);
  }, []);

  // 重置列宽
  const resetColumnWidths = useCallback(() => {
    const widths: Record<string, number> = {};

    initialColumns.forEach((column) => {
      if (typeof column.width === 'number') {
        widths[column.name] = column.width;
      } else {
        widths[column.name] = 120;
      }
    });

    setColumnWidths(widths);
  }, [initialColumns]);

  // 自动调整列宽
  const autoResizeColumns = useCallback(
    (containerWidth: number) => {
      const fixedWidthColumns = initialColumns.filter((col) => typeof col.width === 'number' || col.minWidth || col.maxWidth);
      const flexColumns = initialColumns.filter((col) => !fixedWidthColumns.includes(col));

      let usedWidth = 0;
      const newWidths: Record<string, number> = {};

      // 先处理固定宽度的列
      fixedWidthColumns.forEach((column) => {
        const width = typeof column.width === 'number' ? column.width : 120;
        newWidths[column.name] = width;
        usedWidth += width;
      });

      // 剩余宽度平均分配给弹性列
      const remainingWidth = containerWidth - usedWidth;
      const flexColumnWidth = Math.max(80, remainingWidth / flexColumns.length);

      flexColumns.forEach((column) => {
        newWidths[column.name] = flexColumnWidth;
      });

      setColumnWidths(newWidths);
    },
    [initialColumns],
  );

  return {
    columnWidths,
    resizingColumn,
    handleColumnResize,
    handleResizeStart,
    handleResizeEnd,
    resetColumnWidths,
    autoResizeColumns,
    setColumnWidths,
  };
};
