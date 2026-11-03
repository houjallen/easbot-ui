/**
 * 增强表格组件
 * 基于BaseTable，集成TableContext，提供完整的表格功能
 */

import React, { forwardRef } from 'react';
import { TableProvider, useHasTableContext, useTableConfig, useTableState } from '../context/TableContext';
import type { EnhancedTableProps } from '../types';
import { BaseTable } from './BaseTable';

/**
 * 增强表格组件内部实现
 * 在TableProvider上下文中使用BaseTable，从Context获取数据和列配置
 */
const EnhancedTableInner = forwardRef<HTMLDivElement, Omit<EnhancedTableProps, 'data' | 'columns' | 'config' | 'selection' | 'sort' | 'filter' | 'expansion' | 'resize'>>(
  (props: Omit<EnhancedTableProps, 'data' | 'columns' | 'config' | 'selection' | 'sort' | 'filter' | 'expansion' | 'resize'>, ref: React.Ref<HTMLDivElement>) => {
    // 从Context获取数据和列配置
    const { data, columns, selectedRowKeys, sortState, filterState, expandedRowKeys, columnWidths } = useTableState();
    const config = useTableConfig();

    // BaseTable需要data和columns，从Context中获取
    // 同时传递Context中的状态，而不是Hook配置选项
    return (
      <BaseTable
        ref={ref as any}
        data={data}
        columns={columns}
        selection={
          config.selectable
            ? {
                selectedRowKeys,
                type: config.selection?.type || 'multiple',
              }
            : undefined
        }
        sort={sortState}
        filter={filterState}
        expansion={
          config.expandable
            ? {
                expandedRowKeys,
              }
            : undefined
        }
        resize={{
          columnWidths,
        }}
        onRowClick={props.onRowClick}
        onRowDoubleClick={props.onRowDoubleClick}
        {...props}
      />
    );
  },
);

EnhancedTableInner.displayName = 'EnhancedTableInner';

/**
 * 增强表格组件
 * 集成TableContext，提供开箱即用的表格体验
 */
export const EnhancedTable = forwardRef<HTMLDivElement, EnhancedTableProps>((props: EnhancedTableProps, ref: React.Ref<HTMLDivElement>) => {
  const { data = [], columns = [], config = {}, ...restProps } = props;
  const hasTableContext = useHasTableContext();

  if (hasTableContext) {
    return <EnhancedTableInner ref={ref} {...restProps} />;
  }

  return (
    <TableProvider data={data} columns={columns} config={config}>
      <EnhancedTableInner ref={ref} {...restProps} />
    </TableProvider>
  );
});

EnhancedTable.displayName = 'EnhancedTable';
