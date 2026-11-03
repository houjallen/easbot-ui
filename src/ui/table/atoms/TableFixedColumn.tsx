import { cn } from '../../../utils/classnames';
import React from 'react';
import type { TableColumn } from '../types/base';

/**
 * 计算固定列的样式
 */
export interface FixedColumnStyle {
  position: 'sticky';
  left?: number;
  right?: number;
  zIndex: number;
  backgroundColor?: string;
  borderColor?: string;
  boxShadow?: string;
  backgroundClip?: React.CSSProperties['backgroundClip'];
  isolation?: React.CSSProperties['isolation'];
  transform?: React.CSSProperties['transform'];
  willChange?: React.CSSProperties['willChange'];
  outline?: React.CSSProperties['outline'];
  contain?: React.CSSProperties['contain'];
  marginLeft?: number;
  marginRight?: number;
}

/**
 * 内置列宽度常量
 */
const BUILTIN_COLUMN_WIDTH = 48;

/**
 * 计算固定列样式的工具函数
 * 修复：使用 column.name 作为列唯一标识符，column.dataIndex 作为数据字段引用
 * 优化：支持内置列（checkbox、expand）的自动固定，统一48px宽度
 */
export const calculateFixedColumnStyles = (
  columns: TableColumn[],
  columnWidths: Record<string, number> = {},
  options: {
    fixedable?: boolean;
    bordered?: boolean;
    hasSelection?: boolean;
    hasExpansion?: boolean;
    hasRowAction?: boolean;
  } = {},
): Record<string, FixedColumnStyle> => {
  const { fixedable = true, bordered = false, hasSelection = false, hasExpansion = false, hasRowAction = false } = options;

  // 如果禁用固定列功能，返回空样式
  if (!fixedable) {
    return {};
  }

  const styles: Record<string, FixedColumnStyle> = {};
  let leftOffset = 0;
  let rightOffset = 0;
  const defaultWidth = 120;

  // 处理内置列的固定逻辑
  // checkbox 列应该固定在最左侧
  if (hasSelection) {
    styles['__selection__'] = {
      position: 'sticky',
      left: leftOffset,
      zIndex: 60, // 再提升层级，确保最上层
      backgroundColor: 'var(--background)',
      outline: bordered ? '1px solid var(--border)' : 'none',
    };
    leftOffset += columnWidths['__selection__'] || BUILTIN_COLUMN_WIDTH;
  }

  // expand 列应该在 checkbox 列之后
  if (hasExpansion) {
    styles['__expansion__'] = {
      position: 'sticky',
      left: leftOffset,
      zIndex: 59, // 稍低于 checkbox 列
      backgroundColor: 'var(--background)',
      outline: bordered ? '1px solid var(--border)' : 'none',
    };
    leftOffset += columnWidths['__expansion__'] || BUILTIN_COLUMN_WIDTH;
  }

  // 计算左固定列（用户定义的列应该在内置列之后）
  // 只处理可见的固定列
  const leftFixedColumns = columns.filter((col) => {
    return col.fixed === 'left' && col.visible !== false;
  });

  leftFixedColumns.forEach((column, index) => {
    // 修复：使用 column.name 作为键，从 columnWidths 获取宽度
    const width = columnWidths[column.name] || (typeof column.width === 'number' ? column.width : defaultWidth);

    styles[column.name] = {
      position: 'sticky',
      left: leftOffset,
      zIndex: 55 - index, // 提升层级，但仍低于内置列
      backgroundColor: 'var(--background)',
      outline: bordered ? '1px solid var(--border)' : 'none',
    };

    leftOffset += width;
  });

  // 计算右固定列（从右到左）
  const rightFixedColumns = columns.filter((col) => {
    return col.fixed === 'right' && col.visible !== false;
  });

  rightFixedColumns.reverse().forEach((column, index) => {
    // 修复：使用 column.name 作为键
    const width = columnWidths[column.name] || (typeof column.width === 'number' ? column.width : defaultWidth);

    styles[column.name] = {
      position: 'sticky',
      right: rightOffset,
      zIndex: 55 - index,
      backgroundColor: 'var(--background)',
      outline: bordered ? '1px solid var(--border)' : 'none',
    };

    rightOffset += width;
  });

  // 行操作列应该固定在最右侧
  if (hasRowAction) {
    styles['__rowaction__'] = {
      position: 'sticky',
      right: rightOffset,
      zIndex: 60, // 最高层级，确保在最上层
      backgroundColor: 'var(--background)',
      outline: bordered ? '1px solid var(--border)' : 'none',
    };
  }

  return styles;
};

/**
 * 固定列包装组件属性
 * 优化：减少不必要的props传递，提高性能
 */
export interface TableFixedColumnProps {
  /** 列定义 */
  column: TableColumn;
  /** 是否有边框 */
  bordered?: boolean;
  /** 固定列样式（由父组件计算并传入，避免重复计算） */
  fixedStyle?: FixedColumnStyle;
  /** 子元素 */
  children: React.ReactNode;
  /** 是否为表头 */
  isHeader?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否是最后一个左固定列 */
  isLastLeftFixed?: boolean;
  /** 是否是第一个右固定列 */
  isFirstRightFixed?: boolean;
}

/**
 * 表格固定列组件
 * 优化：减少重复计算，提高性能
 * 修复：使用正确的列标识符逻辑
 * 修复：不再使用div包裹表格单元格，避免违反HTML规范
 */
export const TableFixedColumn: React.FC<TableFixedColumnProps> = ({
  column,
  bordered = false,
  fixedStyle,
  children,
  isHeader = false,
  className,
  isLastLeftFixed = false,
  isFirstRightFixed = false,
}) => {
  // 如果不是固定列或没有固定样式，直接返回子元素
  if (!column.fixed || !fixedStyle) {
    return <>{children}</>;
  }

  // 克隆子元素并添加固定列样式
  const child = React.Children.only(children) as React.ReactElement<any>;
  return React.cloneElement(child, {
    className: cn(
      'eas-table-fixed-column',
      child.props.className,
      // 左固定列阴影 - 只在最后一个左固定列显示
      isLastLeftFixed &&
        'relative after:pointer-events-none after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[6px] after:translate-x-full after:bg-gradient-to-r after:from-black/10 after:to-transparent',
      // 右固定列阴影 - 只在第一个右固定列显示
      isFirstRightFixed &&
        'before:-translate-x-full relative before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[6px] before:bg-gradient-to-l before:from-black/10 before:to-transparent',
      className,
    ),
    style: {
      ...(child.props.style || {}),
      ...fixedStyle,
      // 基础背景色 - CSS样式会根据状态覆盖
      backgroundColor: isHeader ? 'var(--muted)' : 'var(--background)',
      outline: bordered ? '1px solid var(--border)' : 'none',
      // 添加边框以区分固定列
      ...(isLastLeftFixed && {
        borderRight: '1px solid var(--border)',
        boxShadow: '4px 0 6px -2px rgba(0,0,0,0.08)',
      }),
      ...(isFirstRightFixed && {
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 6px -2px rgba(0,0,0,0.08)',
      }),
    },
  });
};

/**
 * 获取表格容器的固定列相关样式
 * 修复：使用 column.name 作为列标识符，统一内置列宽度为48px
 */
export const getTableFixedStyles = (
  columns: TableColumn[],
  columnWidths: Record<string, number> = {},
  options: {
    hasSelection?: boolean;
    hasExpansion?: boolean;
  } = {},
) => {
  const { hasSelection = false, hasExpansion = false } = options;

  const hasLeftFixed = columns.some((col) => col.fixed === 'left');
  const hasRightFixed = columns.some((col) => col.fixed === 'right');

  let leftFixedWidth = 0;
  let rightFixedWidth = 0;

  // 计算内置列宽度
  if (hasSelection) {
    leftFixedWidth += columnWidths['__selection__'] || BUILTIN_COLUMN_WIDTH;
  }
  if (hasExpansion) {
    leftFixedWidth += columnWidths['__expansion__'] || BUILTIN_COLUMN_WIDTH;
  }

  // 计算用户定义的左固定列宽度
  if (hasLeftFixed) {
    leftFixedWidth += columns
      .filter((col) => col.fixed === 'left')
      .reduce((sum, col) => {
        const width = columnWidths[col.name] || (typeof col.width === 'number' ? col.width : 120);
        return sum + width;
      }, 0);
  }

  // 计算右固定列宽度
  if (hasRightFixed) {
    rightFixedWidth = columns
      .filter((col) => col.fixed === 'right')
      .reduce((sum, col) => {
        const width = columnWidths[col.name] || (typeof col.width === 'number' ? col.width : 120);
        return sum + width;
      }, 0);
  }

  return {
    hasLeftFixed: hasLeftFixed || hasSelection || hasExpansion,
    hasRightFixed,
    leftFixedWidth,
    rightFixedWidth,
    // 表格容器样式
    containerStyle: {
      '--left-fixed-width': `${leftFixedWidth}px`,
      '--right-fixed-width': `${rightFixedWidth}px`,
    } as React.CSSProperties,
  };
};
