import { TableProvider, useHasTableContext, useTableActions, useTableConfig } from '../context/TableContext';
import SearchPanel from './SearchPanel';
import Toolbar from './Toolbar';
import type { TableColumn } from '../types/base';
import type { PluginConfig, SearchConfig, TableConfig, ToolbarConfig } from '../types/base';
import cn from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';
import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import { StatusBar } from '../molecules/StatusBar';
import { EnhancedTable } from './EnhancedTable';

export interface AdvancedTableProps {
  data?: any[];
  columns?: TableColumn[];
  plugin?: PluginConfig;
  toolbar?: ToolbarConfig;
  search?: SearchConfig;
  config?: TableConfig;
  loading?: boolean;
  error?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onRowClick?: (row: any, index: number) => void;
  onRowDoubleClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}

/**
 * 配置同步组件
 *
 * @description
 * `AdvancedTable` 在**已有** `TableProvider` 上下文时，不再自建 Provider，
 * 此时它自身传入的 `config` / `data` / `columns` / `loading` / `error`
 * 若不显式同步回上下文就会被**静默丢弃**。
 *
 * 该组件在挂载后把这些 props 合并写回外层 Provider 的状态，
 * 使「外层 Provider + AdvancedTable」的组合与「AdvancedTable 自建 Provider」行为一致。
 */
const TableConfigSync = ({ config, data, columns, loading, error }: { config: TableConfig; data?: any[]; columns?: TableColumn[]; loading?: boolean; error?: string | null }) => {
  const actions = useTableActions();
  // `actions` 每次状态变化都会重建，用 ref 持有最新值避免把依赖数组撑爆
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  // 标记首次同步是否已完成，避免覆盖消费方后续主动修改的状态
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    if (config && Object.keys(config).length > 0) {
      actionsRef.current.updateConfig(config);
    }
    if (data && data.length > 0) {
      actionsRef.current.setData(data);
    }
    if (columns && columns.length > 0) {
      actionsRef.current.setColumns(columns);
    }
    if (loading !== undefined) {
      actionsRef.current.setLoading(loading);
    }
    if (error !== undefined) {
      actionsRef.current.setError(error);
    }
  }, [config, data, columns, loading, error]);

  return null;
};

/**
 * AdvancedTable 内部组件
 * 纯布局组件：搜索面板 + 工具栏 + 表格主体 + 状态栏
 * 各功能组件自己从TableContext获取数据和处理逻辑
 */
const AdvancedTableInner = forwardRef<HTMLDivElement, Omit<AdvancedTableProps, 'data' | 'loading' | 'error'>>(({ className, style, ...props }, ref) => {
  const tabelConfig = useTableConfig();
  return (
    <div ref={ref} className={cn('eas-advanced-table-container flex h-full min-h-0 w-full flex-col', className)} style={style}>
      {/* 搜索面板区域 - SearchPanel组件自己从TableContext获取配置和处理逻辑 */}
      {tabelConfig.searchable && <SearchPanel />}

      {/* 工具栏区域 - Toolbar组件自己从TableContext获取配置和处理逻辑 */}
      {tabelConfig.toolbarable && <Toolbar />}

      {/* 表格主体 - 直接渲染，BaseTable 在 fillContainer 模式下会承担 flex-1/min-h-0 */}
      <EnhancedTable {...props} />

      {/* 状态栏 - TableStatusBar组件自己从TableContext获取状态信息 */}
      {tabelConfig.statusBarable && <StatusBar />}
    </div>
  );
});

AdvancedTableInner.displayName = 'AdvancedTableInner';

/**
 * AdvancedTable 组件
 *
 * 高级表格组件，提供完整的表格功能：
 * - 智能检测是否已在 TableProvider 上下文中
 * - 如果不在上下文中，自动包装 TableProvider
 * - 从 config.plugin 获取插件配置而不是直接传递 plugins prop
 * - 支持排序、筛选、分页、选择等功能
 * - 支持插件系统扩展
 */
export const AdvancedTable = forwardRef<HTMLDivElement, AdvancedTableProps>(({ columns, data, config = {}, search, toolbar, plugin, loading = false, error = null, ...restProps }, ref) => {
  // 检查是否已在TableProvider上下文中
  const hasTableContext = useHasTableContext();

  // 合并默认配置
  const advancedTableConfig: TableConfig = useMemo(() => {
    const defaultConfig: TableConfig = {
      // 基础功能
      selectable: true,
      selection: {
        type: 'multiple',
      },

      // 排序功能
      sortable: true,

      // 筛选功能
      filterable: true,

      // 调整列宽
      resizeable: true,
      // 插件系统
      pluginable: true,
      // 搜索功能
      searchable: true,
      // 工具栏
      toolbarable: true,
      // 缓存配置
      cacheable: true,
      // 性能优化
      persistable: true,

      // 分页功能
      pagination: {
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
        show: true,
      },
      // 数据处理模式
      dataMode: {
        sort: 'remote',
        filter: 'remote',
        search: 'remote',
        pagination: 'remote',
      },
    };

    let finalConfig = deepMerge(defaultConfig, config);
    finalConfig = deepMerge(finalConfig, { search, plugin, toolbar });
    // `TableProvider` 的 `toolbar.show` 默认为 false，而 `Toolbar` 在 `show` 为 false 时返回 null。
    // 这里当「工具栏已启用」且消费方没有显式关闭时，把 `toolbar.show` 打开，
    // 否则 `toolbarable: true` 只是白设 —— 工具栏永远不渲染。
    if (finalConfig.toolbarable && toolbar?.show !== false) {
      finalConfig.toolbar = { ...(finalConfig.toolbar ?? {}), show: true };
    }
    return finalConfig;
  }, [config, toolbar, search, plugin]);

  // 如果已经在 TableProvider 上下文中，直接渲染内部组件
  // 注意：此时外层 Provider 的配置优先，仍需把本组件的 `config` / `search` / `toolbar` / `plugin`
  // 合并进去，否则这些 props 在「已有 Provider」场景下会被静默丢弃。
  if (hasTableContext) {
    return (
      <>
        <TableConfigSync config={advancedTableConfig} data={data} columns={columns} loading={loading} error={error} />
        <AdvancedTableInner ref={ref} {...restProps} />
      </>
    );
  }

  // 否则包装 TableProvider
  return (
    <TableProvider columns={columns} data={data} config={advancedTableConfig} loading={loading} error={error}>
      <AdvancedTableInner ref={ref} {...restProps} />
    </TableProvider>
  );
});

AdvancedTable.displayName = 'AdvancedTable';
