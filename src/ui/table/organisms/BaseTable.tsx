/**
 * 现代化基础表格组件
 * 全新设计，采用最新React模式和TypeScript特性，支持TableContext集成
 */

import { Checkbox } from '../../checkbox';
import { Icon } from '../../icon';
import { TableBody, TableCell, TableContainer, TableEmpty, TableGrid, TableHeader, TablePagination, TableRow } from '../atoms';
import { CellValue } from '../atoms/CellValue';
import { ColumnHeaderActionCell } from '../atoms/ColumnHeaderActionCell';
import { TableColumnResizer } from '../atoms/TableColumnResizer';
import { TableFixedColumn, calculateFixedColumnStyles } from '../atoms/TableFixedColumn';
import { TableRowExpandButton } from '../atoms/TableRowExpandButton';
import React, { type ComponentPropsWithoutRef, forwardRef, useMemo, useCallback, useRef } from 'react';
import { TableCardView } from './TableCardView';

import { RowActionCell } from '../atoms/RowActionCell';
import { useTableActions, useTableConfig, useTableContext, useTableState } from '../context/TableContext';
import { useTableLogic } from '../context/TableContext';
import { TableVirtualBody } from './TableVirtualView';
import type { ScrollConfig } from '../types';
import type { BaseTableProps, TableColumn } from '../types';
import { cn } from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';

/**
 * 基础表格组件
 * 专注于基础的数据展示功能，支持从TableContext获取配置，保持向后兼容性
 */
// 获取列值的工具函数
const getColumnValue = (record: Record<string, any>, column: TableColumn) => {
  if (!column.dataIndex) return undefined;

  // 支持嵌套属性访问，如 'user.name'
  const keys = String(column.dataIndex).split('.');
  return keys.reduce((obj: any, key: string) => obj?.[key], record);
};

const BaseTable = forwardRef(function BaseTable(
  {
    columns = [],
    data = [],
    empty,
    className,
    style,
    onRowClick,
    onRowDoubleClick,
    children,
    // 表头单元格样式类名
    headerCellClassName,
    // 表头行样式类名
    headerRowClassName,
    // 单元格样式类名
    cellClassName,
    // 行样式类名
    rowClassName,
    // 渲染空状态
    renderEmpty,
    // 其他属性
    ...containerProps
  }: BaseTableProps &
    ComponentPropsWithoutRef<'div'> & { ref?: React.Ref<HTMLDivElement> } & {
      headerCellClassName?: string | ((column: TableColumn) => string);
      headerRowClassName?: string | (() => string);
      cellClassName?: string | ((column: TableColumn, record: Record<string, any>, index: number) => string);
      rowClassName?: string | ((record: Record<string, any>, index: number) => string);
      renderEmpty?: () => React.ReactNode;
    },
  ref: React.Ref<HTMLTableElement> | null,
) {
  // 尝试从TableContext获取配置和状态（可选）
  const tableContext = useTableContext();
  const contextConfig = useTableConfig();
  const contextState = useTableState();
  const contextActions = useTableActions();
  const getRowKey = tableContext.getRowKey;
  const loading = contextState.loading;
  const error = contextState.error;
  // 获取表格逻辑处理器
  const tableLogic = useTableLogic();
  const { t } = tableLogic.i18n;

  // 智能合并配置：props优先，Context作为fallback
  const finalData = useMemo(() => {
    // 如果有Context且支持本地数据处理，直接使用getProcessedData获取处理后的数据
    if (contextState && tableLogic) {
      return tableLogic.getProcessedData();
    }

    // 否则使用原始数据：props优先，Context作为fallback
    return data.length > 0 ? data : contextState?.data || [];
  }, [data, contextState?.data, contextState, tableLogic]);

  // 是否显示数据加载蒙层（区别于容器级loading）
  const showDataLoading = loading;

  const finalColumns = useMemo(() => {
    return columns.length > 0 ? columns : contextState?.columns || [];
  }, [columns, contextState?.columns]);

  // `containerProps` 是 rest 展开得到的对象，每次渲染都是新引用。
  // 直接把它作为 `useMemo` 依赖会让下游 memo 永远失效，
  // 因此用 ref + 内容签名做一层缓存，内容不变时保持同一个对象引用。
  const containerPropsSignature = JSON.stringify(containerProps ?? {}, (key, value) => (typeof value === 'function' ? '[fn]' : value));
  const containerPropsCacheRef = useRef<{ signature: string; value: typeof containerProps } | null>(null);
  if (containerPropsCacheRef.current?.signature !== containerPropsSignature) {
    containerPropsCacheRef.current = { signature: containerPropsSignature, value: containerProps };
  }
  const stableContainerProps = containerPropsCacheRef.current.value;

  const finalConfig = useMemo(() => {
    // 使用deepMerge合并完整配置，确保所有TableConfig属性都被正确处理
    // contextConfig作为基础配置，containerProps作为覆盖配置
    return deepMerge(contextConfig, stableContainerProps);
  }, [contextConfig, stableContainerProps]);
  const finalSelection = useMemo(() => {
    if (finalConfig.selectable && contextState && contextActions) {
      // 计算当前页可见数据的行键
      const visibleRowKeys = finalData.map((record, index) => getRowKey(record, index));
      // 计算当前页中已选中的行键
      const visibleSelectedKeys = contextState.selectedRowKeys.filter((key) => visibleRowKeys.includes(key));
      // 基于当前页数据计算是否全选
      const allSelected = finalData.length > 0 && visibleSelectedKeys.length === finalData.length;

      return {
        enabled: contextState.config.selectable,
        selectedKeys: contextState.selectedRowKeys,
        allSelected,
        onRowSelect: (record: any, index: number) => {
          const key = getRowKey(record, index);
          tableLogic?.selection?.toggleRowSelection(key);
        },
        onSelectAll: () => {
          // 基于当前页的全选状态决定操作
          if (allSelected) {
            // 当前页全选时，取消当前页的选择
            const keysToDeselect = visibleRowKeys;
            const newSelectedKeys = contextState.selectedRowKeys.filter((key) => !keysToDeselect.includes(key));
            contextActions.setSelectedRowKeys(newSelectedKeys);
          } else {
            // 当前页未全选时，选择当前页所有数据
            const keysToSelect = visibleRowKeys.filter((key) => !contextState.selectedRowKeys.includes(key));
            contextActions.setSelectedRowKeys([...contextState.selectedRowKeys, ...keysToSelect]);
          }
        },
      };
    } else {
      return {
        enabled: false,
        selectedKeys: [],
        allSelected: false,
        onRowSelect: undefined,
        onSelectAll: undefined,
      };
    }
  }, [finalConfig?.selectable, contextState?.selectedRowKeys, tableLogic?.selection?.toggleRowSelection, finalData, contextState, contextActions, getRowKey]);

  const finalExpansion = useMemo(() => {
    if (finalConfig.expandable && contextState) {
      return {
        enabled: contextState.config.expandable,
        expandedKeys: contextState.expandedRowKeys,
        onRowExpand: (record: any, index: number, expanded: boolean) => {
          const key = getRowKey(record, index);
          tableLogic?.expansion?.toggleRowExpansion(key, record);
        },
        renderExpandedRow: contextState?.config?.expansion?.renderExpandedRow,
      };
    }

    return {
      enabled: false,
      expandedKeys: [],
      onRowExpand: undefined,
      renderExpandedRow: (record: Record<string, any>, index: number) => null,
    };
  }, [finalConfig?.expandable, contextState?.expandedRowKeys, tableLogic?.expansion?.toggleRowExpansion, contextState, getRowKey]);

  // 行操作配置
  const finalRowAction = useMemo(() => {
    if (finalConfig.rowActionable && contextState) {
      return {
        enabled: contextState.config.rowActionable ?? false,
        actions: contextState.config.rowAction?.actions ?? [],
        maxVisible: contextState.config.rowAction?.maxVisible ?? 3,
        showLabel: contextState.config.rowAction?.showLabel ?? false,
        // 操作列尺寸优先取 rowAction.size，未配置时跟随表格尺寸
        size: contextState.config.rowAction?.size ?? finalConfig.size ?? 'sm',
        // 当fixedable开启时，行操作列默认固定到右侧，类似selection列固定到左侧
        fixed: finalConfig.fixedable ? 'right' : undefined,
      };
    }

    return {
      enabled: false,
      actions: [],
      maxVisible: 3,
      showLabel: false,
      size: finalConfig.size ?? 'sm',
      fixed: undefined,
    };
  }, [finalConfig?.rowActionable, finalConfig?.fixedable, finalConfig?.size, contextState?.config?.rowActionable, contextState?.config?.rowAction, contextState]);

  // 使用上下文中的列宽状态
  const columnWidths = contextState?.columnWidths || {};

  // 计算固定列样式 - 优化：在 BaseTable 层级统一计算，避免重复计算
  const fixedColumnStyles = useMemo(() => {
    if (!finalConfig.fixedable) return {};

    return calculateFixedColumnStyles(finalColumns, columnWidths, {
      fixedable: finalConfig.fixedable,
      bordered: finalConfig.bordered,
      hasSelection: finalSelection.enabled,
      hasExpansion: finalExpansion.enabled,
      hasRowAction: finalRowAction.enabled,
    });
  }, [finalColumns, columnWidths, finalConfig.fixedable, finalSelection.enabled, finalExpansion.enabled, finalRowAction.enabled, finalConfig.bordered]);

  // 计算固定列位置信息 - 优化：预计算固定列位置，提高渲染性能
  const fixedColumnPositions = useMemo(() => {
    const leftFixedColumns = finalColumns.filter((col) => col.fixed === 'left');
    const rightFixedColumns = finalColumns.filter((col) => col.fixed === 'right');

    // 构建完整的左固定列列表（包括内置列）
    const allLeftFixed: string[] = [];
    if (finalSelection.enabled) allLeftFixed.push('__selection__');
    if (finalExpansion.enabled) allLeftFixed.push('__expansion__');
    allLeftFixed.push(...leftFixedColumns.map((col) => col.name));

    // 构建完整的右固定列列表（包括内置列）
    const allRightFixed: string[] = [];
    allRightFixed.push(...rightFixedColumns.map((col) => col.name));
    if (finalRowAction.enabled) allRightFixed.push('__rowaction__');

    return {
      leftFixed: leftFixedColumns.map((col) => col.name),
      rightFixed: rightFixedColumns.map((col) => col.name),
      allLeftFixed, // 包含内置列的完整左固定列列表
      allRightFixed, // 包含内置列的完整右固定列列表
      lastLeftFixed: allLeftFixed[allLeftFixed.length - 1], // 最后一个左固定列（可能是内置列）
      firstRightFixed: allRightFixed[0], // 第一个右固定列（可能是内置列）
    };
  }, [finalColumns, finalSelection.enabled, finalExpansion.enabled, finalRowAction.enabled]);

  const visibleColumns = useMemo(() => finalColumns.filter((col) => col.visible !== false), [finalColumns]);

  // 获取行样式类名
  const getRowClassName = useCallback(
    (record: Record<string, any>, index: number): string => {
      const baseClasses: string[] = [];

      if (rowClassName) {
        if (typeof rowClassName === 'function') {
          const customClass = rowClassName(record, index);
          if (customClass) baseClasses.push(customClass);
        } else {
          baseClasses.push(rowClassName);
        }
      }

      return baseClasses.join(' ');
    },
    [rowClassName],
  );

  // 获取单元格样式类名
  const getCellClassName = useCallback(
    (column: TableColumn, record: Record<string, any>, index: number): string => {
      const baseClasses: string[] = [];

      if (cellClassName) {
        if (typeof cellClassName === 'function') {
          const customClass = cellClassName(column, record, index);
          if (customClass) baseClasses.push(customClass);
        } else {
          baseClasses.push(cellClassName);
        }
      }

      if (column.className) {
        baseClasses.push(column.className);
      }

      return baseClasses.join(' ');
    },
    [cellClassName],
  );

  // 获取表头单元格样式类名
  const getHeaderCellClassName = useCallback(
    (column: TableColumn): string => {
      const baseClasses: string[] = [];

      if (headerCellClassName) {
        if (typeof headerCellClassName === 'function') {
          const customClass = headerCellClassName(column);
          if (customClass) baseClasses.push(customClass);
        } else {
          baseClasses.push(headerCellClassName);
        }
      }

      return baseClasses.join(' ');
    },
    [headerCellClassName],
  );

  // 获取表头行样式类名
  const getHeaderRowClassName = useCallback((): string => {
    const baseClasses: string[] = [];

    if (headerRowClassName) {
      if (typeof headerRowClassName === 'function') {
        const customClass = headerRowClassName();
        if (customClass) baseClasses.push(customClass);
      } else {
        baseClasses.push(headerRowClassName);
      }
    }

    return baseClasses.join(' ');
  }, [headerRowClassName]);

  // 渲染表头
  const renderHeader = useCallback(() => {
    if (!finalConfig.showHeader) return null;

    return (
      <TableHeader stickyHeader={finalConfig.stickyHeader} stickyHeaderOffset={finalConfig.stickyHeaderOffset}>
        <TableRow hoverable={false} clickable={false} className={getHeaderRowClassName()}>
          {/* 选择列 */}
          {finalSelection.enabled && (
            <TableFixedColumn
              column={{ name: '__selection__', fixed: 'left' } as any}
              bordered={finalConfig.bordered}
              fixedStyle={fixedColumnStyles['__selection__']}
              isHeader={true}
              isLastLeftFixed={fixedColumnPositions.lastLeftFixed === '__selection__'}
              isFirstRightFixed={false}
            >
              <TableCell as="th" className="w-[48px] min-w-[48px] max-w-[48px] text-center">
                <span className="flex items-center justify-center">
                  <Checkbox
                    className={cn(
                      'cursor-pointer border-gray-300 focus:ring-1 focus:ring-primary',
                      finalConfig?.size === 'sm' ? 'h-3 w-3' : (finalConfig?.size as any) === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
                    )}
                    checked={(() => {
                      if (!finalSelection.selectedKeys) return false;
                      const totalRows = finalData.length;
                      const selectedCount = finalSelection.selectedKeys.length;
                      if (selectedCount === 0) return false;
                      if (selectedCount === totalRows && totalRows > 0) return true;
                      return 'indeterminate';
                    })()}
                    onCheckedChange={(checked) => {
                      finalSelection.onSelectAll?.();
                    }}
                    aria-label={t('selectAll')}
                  />
                </span>
              </TableCell>
            </TableFixedColumn>
          )}
          {/* 展开列 */}
          {finalExpansion.enabled && (
            <TableFixedColumn
              column={{ name: '__expansion__', fixed: 'left' } as any}
              bordered={finalConfig.bordered}
              fixedStyle={fixedColumnStyles['__expansion__']}
              isHeader={true}
              isLastLeftFixed={fixedColumnPositions.lastLeftFixed === '__expansion__'}
              isFirstRightFixed={false}
            >
              <TableCell as="th" className="w-[48px] min-w-[48px] max-w-[48px] text-center" />
            </TableFixedColumn>
          )}
          {visibleColumns.map((column) => {
            // 将name映射为React需要的key
            const cellKey = column.name;

            // 从Context状态获取当前列的排序状态
            const currentSortDirection = contextState?.sortState?.columnName === column.name ? contextState.sortState.order : null;
            const isResizeable = finalConfig.resizeable !== false && column.resizeable !== false;
            return (
              <TableFixedColumn
                key={cellKey}
                column={column}
                bordered={finalConfig.bordered}
                fixedStyle={fixedColumnStyles[column.name]}
                isHeader={true}
                isLastLeftFixed={fixedColumnPositions.lastLeftFixed === column.name}
                isFirstRightFixed={fixedColumnPositions.firstRightFixed === column.name}
              >
                <TableCell
                  as="th"
                  align={column.align}
                  ellipsis={column.ellipsis}
                  className={cn(column.className, getHeaderCellClassName(column))}
                  style={{
                    width: finalConfig.resizeable === true ? undefined : columnWidths[column.name] || column.width,
                    minWidth: finalConfig.resizeable === true ? undefined : (column.minWidth ?? finalConfig?.resize?.minWidth),
                    maxWidth: finalConfig.resizeable === true ? undefined : (column.maxWidth ?? finalConfig?.resize?.maxWidth),
                    ...column.style,
                  }}
                  data-column={column.name}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex-1 font-medium text-muted-foreground">{column.title}</span>

                    <div className="flex items-center gap-1">
                      {/* 列头操作区域 */}
                      {finalConfig.columnHeaderActionable && <ColumnHeaderActionCell column={column} config={{ size: finalConfig.size }} />}

                      {/* 列宽调整器 */}
                      {isResizeable && <TableColumnResizer column={column} minWidth={column.minWidth ?? finalConfig?.resize?.minWidth} maxWidth={column.maxWidth ?? finalConfig?.resize?.maxWidth} />}
                    </div>
                  </div>
                </TableCell>
              </TableFixedColumn>
            );
          })}
          {/* 行操作列 */}
          {finalRowAction.enabled && (
            <TableFixedColumn
              column={{ name: '__rowaction__', fixed: finalRowAction.fixed } as any}
              bordered={finalConfig.bordered}
              fixedStyle={fixedColumnStyles['__rowaction__']}
              isHeader={true}
              isLastLeftFixed={false}
              isFirstRightFixed={fixedColumnPositions.firstRightFixed === '__rowaction__'}
            >
              <TableCell as="th" className="w-[160px] min-w-[160px] max-w-[160px] text-center">
                <span className="font-medium text-muted-foreground">{t('rowAction.title')}</span>
              </TableCell>
            </TableFixedColumn>
          )}
        </TableRow>
      </TableHeader>
    );
  }, [
    finalConfig,
    finalData,
    contextState,
    finalSelection,
    finalExpansion,
    finalRowAction,
    visibleColumns,
    fixedColumnStyles,
    fixedColumnPositions,
    getHeaderRowClassName,
    getHeaderCellClassName,
    columnWidths,
    t,
  ]);

  // 渲染空状态
  const renderEmptyContent = useCallback(() => {
    if (renderEmpty) {
      return renderEmpty();
    }
    const emptyText = t('emptyText');
    return (
      <TableRow className="eas-table-row-empty">
        <TableCell colSpan={visibleColumns.length + (finalSelection.enabled ? 1 : 0) + (finalExpansion.enabled ? 1 : 0)} className="eas-table-cell-empty py-8 text-center text-gray-500">
          <TableEmpty description={emptyText} />
        </TableCell>
      </TableRow>
    );
  }, [renderEmpty, visibleColumns, finalSelection.enabled, finalExpansion.enabled, t]);

  // 渲染展开行
  const renderExpandedRowContent = useCallback(
    (record: Record<string, any>, index: number) => {
      if (!finalExpansion.renderExpandedRow) {
        return null;
      }

      return (
        <TableRow key={`${getRowKey(record, index)}-expanded`} className="eas-table-row-expanded">
          <TableCell colSpan={visibleColumns.length + (finalSelection.enabled ? 1 : 0) + (finalExpansion.enabled ? 1 : 0) + (finalRowAction.enabled ? 1 : 0)} className="eas-table-cell-expanded">
            {finalExpansion.renderExpandedRow(record, index)}
          </TableCell>
        </TableRow>
      );
    },
    [finalExpansion.renderExpandedRow, visibleColumns, finalSelection.enabled, finalExpansion.enabled, finalRowAction.enabled, getRowKey],
  );

  // 渲染单行数据
  const renderTableRow = useCallback(
    (record: any, index: number) => {
      const key = getRowKey(record, index);
      const isSelected = finalSelection.enabled && finalSelection.selectedKeys?.some((id) => String(id) === String(key));
      const isExpanded = Boolean(finalExpansion.enabled && finalExpansion.expandedKeys?.some((id) => String(id) === String(key)));

      return (
        <React.Fragment key={key}>
          <TableRow
            key={`${key}-${index}`}
            index={index}
            record={record}
            className={getRowClassName(record, index)}
            hoverable={finalConfig?.hoverable ?? true}
            clickable={finalConfig.clickable && !!(onRowClick || onRowDoubleClick)}
            selected={isSelected}
            onClick={(e) => onRowClick?.(record, index, e)}
            onDoubleClick={(e) => onRowDoubleClick?.(record, index, e)}
          >
            {/* 选择列 */}
            {finalSelection.enabled && (
              <TableFixedColumn
                column={{ name: '__selection__', fixed: 'left' } as any}
                bordered={finalConfig.bordered}
                fixedStyle={fixedColumnStyles['__selection__']}
                isHeader={false}
                isLastLeftFixed={fixedColumnPositions.lastLeftFixed === '__selection__'}
                isFirstRightFixed={false}
              >
                <TableCell className="w-[48px] min-w-[48px] max-w-[48px] text-center">
                  <span className="flex items-center justify-center">
                    <Checkbox
                      className={cn(
                        'cursor-pointer border-gray-300 focus:ring-1 focus:ring-primary',
                        finalConfig?.size === 'sm' ? 'h-3 w-3' : (finalConfig?.size as any) === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
                      )}
                      checked={isSelected}
                      onCheckedChange={() => finalSelection.onRowSelect?.(record, index)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={t('selectRow', { index: index + 1 })}
                    />
                  </span>
                </TableCell>
              </TableFixedColumn>
            )}
            {/* 展开列 */}
            {finalExpansion.enabled && (
              <TableFixedColumn
                column={{ name: '__expansion__', fixed: 'left' } as any}
                bordered={finalConfig.bordered}
                fixedStyle={fixedColumnStyles['__expansion__']}
                isHeader={false}
                isLastLeftFixed={fixedColumnPositions.lastLeftFixed === '__expansion__'}
                isFirstRightFixed={false}
              >
                <TableCell className="w-[48px] min-w-[48px] max-w-[48px] text-center">
                  <TableRowExpandButton isExpanded={isExpanded} onToggle={(expanded) => finalExpansion.onRowExpand?.(record, index, expanded)} record={record} index={index} />
                </TableCell>
              </TableFixedColumn>
            )}
            {visibleColumns.map((column) => {
              return (
                <TableFixedColumn
                  key={column.name}
                  column={column}
                  bordered={finalConfig.bordered}
                  fixedStyle={fixedColumnStyles[column.name]}
                  isHeader={false}
                  isLastLeftFixed={fixedColumnPositions.lastLeftFixed === column.name}
                  isFirstRightFixed={fixedColumnPositions.firstRightFixed === column.name}
                >
                  <TableCell
                    align={column.align}
                    ellipsis={column.ellipsis}
                    className={cn(column.className, getCellClassName(column, record, index))}
                    style={{
                      width: finalConfig.resizeable === true ? undefined : columnWidths[column.name] || column.width,
                      minWidth: finalConfig.resizeable === true ? undefined : (column.minWidth ?? finalConfig?.resize?.minWidth),
                      maxWidth: finalConfig.resizeable === true ? undefined : (column.maxWidth ?? finalConfig?.resize?.maxWidth),
                      ...column.style,
                    }}
                    data-column-name={column.name}
                  >
                    <CellValue value={getColumnValue(record, column)} column={column} record={record} index={index} getColumnValue={getColumnValue} />
                  </TableCell>
                </TableFixedColumn>
              );
            })}
            {/* 行操作列 */}
            {finalRowAction.enabled && (
              <TableFixedColumn
                column={{ name: '__rowaction__', fixed: finalRowAction.fixed } as any}
                bordered={finalConfig.bordered}
                fixedStyle={fixedColumnStyles['__rowaction__']}
                isHeader={false}
                isLastLeftFixed={false}
                isFirstRightFixed={fixedColumnPositions.firstRightFixed === '__rowaction__'}
              >
                <TableCell className="w-[160px] min-w-[160px] max-w-[160px] text-center">
                  <RowActionCell
                    record={record}
                    rowIndex={index}
                    config={{
                      actions: finalRowAction.actions,
                      maxVisible: finalRowAction.maxVisible,
                      showLabel: finalRowAction.showLabel,
                      size: finalRowAction.size,
                    }}
                  />
                </TableCell>
              </TableFixedColumn>
            )}
          </TableRow>
          {/* 展开行 */}
          {isExpanded && renderExpandedRowContent(record, index)}
        </React.Fragment>
      );
    },
    [
      getRowKey,
      finalSelection,
      finalExpansion,
      finalRowAction,
      getRowClassName,
      finalConfig,
      onRowClick,
      onRowDoubleClick,
      fixedColumnStyles,
      fixedColumnPositions,
      t,
      visibleColumns,
      getCellClassName,
      columnWidths,
      renderExpandedRowContent,
    ],
  );

  // 渲染表体数据行
  const renderBody = useCallback(() => {
    if (finalData.length === 0) {
      return renderEmptyContent();
    }

    return finalData.map((record, index) => renderTableRow(record, index));
  }, [finalData, renderEmptyContent, renderTableRow]);

  // 分页逻辑
  const tablePagination = tableLogic.pagination;
  const finalPagination = useMemo(() => {
    // 远程分页
    if (finalConfig?.dataMode?.pagination === 'remote') {
      return tablePagination.pagination;
    }

    // 应用筛选
    let localData = contextState?.data ?? [];
    if (finalConfig?.dataMode?.search !== 'remote' && Object.keys(contextState.searchState).length > 0) {
      localData = tableLogic.search.getSearchedData(localData);
    }

    // 应用筛选（基于搜索后的数据）
    if (finalConfig?.dataMode?.filter !== 'remote' && Object.keys(contextState.filterState).length > 0) {
      localData = tableLogic.filter.getFilteredData(localData);
    }

    if (
      (finalConfig?.dataMode?.filter !== 'remote' && Object.keys(contextState.filterState).length > 0) ||
      (finalConfig?.dataMode?.search !== 'remote' && Object.keys(contextState.searchState).length > 0)
    ) {
      return deepMerge(tablePagination.pagination, {
        total: localData.length,
      });
    } else {
      return deepMerge(tablePagination.pagination, {
        total: Math.max(localData.length, tablePagination?.pagination?.total ?? 0),
      });
    }
  }, [
    tablePagination.pagination,
    contextState.filterState,
    contextState.searchState,
    tableLogic.filter.getFilteredData,
    finalConfig?.dataMode?.filter,
    tableLogic.search.getSearchedData,
    finalConfig?.dataMode?.search,
    finalConfig?.dataMode?.pagination,
    contextState?.data,
  ]);
  // 渲染分页组件
  const renderPagination = useCallback(() => {
    // 只有当分页功能启用且需要显示分页时才渲染
    if (!finalConfig.paginable || !finalPagination.show) {
      return null;
    }

    return (
      <TablePagination
        pagination={finalPagination}
        config={tablePagination.paginationConfig}
        onPageNoChange={tablePagination.setPageNo}
        onPageSizeChange={tablePagination.setPageSize}
        size={finalConfig.size}
      />
    );
  }, [finalPagination, finalConfig.paginable, finalConfig.size, tablePagination.paginationConfig, tablePagination.setPageNo, tablePagination.setPageSize]);

  // 渲染数据加载蒙层
  const renderDataLoadingOverlay = useCallback(() => {
    if (!showDataLoading) return null;

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
        <div className="flex items-center gap-2 p-4">
          <Icon name="eas-refresh" className="animate-spin" size={24} />
          <span className="text-muted-foreground text-sm">{t('loadingText')}</span>
        </div>
      </div>
    );
  }, [showDataLoading, t]);

  // 如果有自定义子组件，直接渲染
  if (children) {
    return (
      <TableContainer
        ref={ref}
        size={finalConfig.size}
        density={finalConfig.density}
        bordered={finalConfig.bordered}
        hoverable={finalConfig.hoverable}
        fillContainer={finalConfig.fillContainer}
        scroll={finalConfig.scroll as ScrollConfig}
        error={error}
        empty={finalData.length === 0}
        className={className}
        style={style}
        {...containerProps}
      >
        {children}
      </TableContainer>
    );
  }

  // 处理错误状态
  if (error) {
    return (
      <TableContainer
        ref={ref}
        size={finalConfig.size}
        density={finalConfig.density}
        bordered={finalConfig.bordered}
        hoverable={finalConfig.hoverable}
        scroll={finalConfig.scroll as ScrollConfig}
        fillContainer={finalConfig.fillContainer}
        error={error}
        empty={finalData.length === 0}
        className={className}
        style={style}
        {...containerProps}
      />
    );
  }

  // 卡片模式渲染
  if (finalConfig.displayMode === 'card') {
    return (
      <div id={finalConfig.tableId} className={cn('eas-table-container', finalConfig.fillContainer && 'flex h-full min-h-0 w-full flex-1 flex-col')}>
        {finalConfig.fillContainer ? (
          // fillContainer模式的卡片视图
          <div className="relative h-0 min-h-0 flex-1">
            <TableCardView
              className={cn('eas-table-fill-container h-full w-full', className)}
              rowClassName={rowClassName}
              style={style}
              onCardClick={(record, index, e) => onRowClick?.(record, index, e)}
              onCardDoubleClick={(record, index, e) => onRowDoubleClick?.(record, index, e)}
            />
            {/* 数据加载蒙层 */}
            {renderDataLoadingOverlay()}
          </div>
        ) : (
          // 普通模式的卡片视图
          <div className="relative">
            <TableCardView
              className={className}
              rowClassName={rowClassName}
              style={style}
              onCardClick={(record, index, e) => onRowClick?.(record, index, e)}
              onCardDoubleClick={(record, index, e) => onRowDoubleClick?.(record, index, e)}
            />
            {/* 数据加载蒙层 */}
            {renderDataLoadingOverlay()}
          </div>
        )}
        {/* 分页组件 */}
        {renderPagination()}
      </div>
    );
  }

  // 表格模式渲染
  return (
    <div id={finalConfig.tableId} className={cn('eas-table-container', finalConfig.fillContainer && 'flex h-full min-h-0 w-full flex-1 flex-col')}>
      {finalConfig.fillContainer ? (
        // fillContainer模式
        <div className="relative h-0 min-h-0 flex-1">
          <TableContainer
            className={cn('eas-table-fill-container h-full w-full', className)}
            style={style}
            size={finalConfig.size}
            density={finalConfig.density}
            bordered={finalConfig.bordered}
            striped={finalConfig.striped}
            hoverable={finalConfig.hoverable}
            stickyHeader={finalConfig.stickyHeader}
            scroll={finalConfig.scroll as ScrollConfig}
            fillContainer={finalConfig.fillContainer}
          >
            <TableGrid ref={ref as any} fixedLayout={finalConfig.fixedLayout} tableMinWidth={finalConfig?.scroll?.tableMinWidth} columnWidths={tableLogic?.columnWidths} {...containerProps}>
              {/* 表头 */}
              {renderHeader()}

              {/* 表体 */}
              <TableBody>
                {finalConfig.displayMode === 'virtual' && finalConfig.virtualizable ? (
                  <TableVirtualBody data={finalData} columns={visibleColumns} getRowKey={getRowKey} virtualizationConfig={finalConfig.virtualization} renderTableRow={renderTableRow} />
                ) : (
                  renderBody()
                )}
              </TableBody>
            </TableGrid>
          </TableContainer>
          {/* 数据加载蒙层 */}
          {renderDataLoadingOverlay()}
        </div>
      ) : (
        // 普通模式：保持原有结构
        <div className="relative">
          <TableContainer
            className={className}
            style={style}
            size={finalConfig.size}
            density={finalConfig.density}
            bordered={finalConfig.bordered}
            striped={finalConfig.striped}
            hoverable={finalConfig.hoverable}
            stickyHeader={finalConfig.stickyHeader}
            scroll={finalConfig.scroll as ScrollConfig}
            fillContainer={finalConfig.fillContainer}
          >
            <TableGrid ref={ref as any} fixedLayout={finalConfig.fixedLayout} tableMinWidth={finalConfig?.scroll?.tableMinWidth} columnWidths={tableLogic?.columnWidths} {...containerProps}>
              {/* 表头 */}
              {renderHeader()}

              {/* 表体 */}
              <TableBody>
                {finalConfig.displayMode === 'virtual' && finalConfig.virtualizable ? (
                  <TableVirtualBody data={finalData} columns={visibleColumns} getRowKey={getRowKey} virtualizationConfig={finalConfig.virtualization} renderTableRow={renderTableRow} />
                ) : (
                  renderBody()
                )}
              </TableBody>
            </TableGrid>
          </TableContainer>
          {/* 数据加载蒙层 */}
          {renderDataLoadingOverlay()}
        </div>
      )}
      {/* 分页组件 */}
      {renderPagination()}
    </div>
  );
});

export { BaseTable };
