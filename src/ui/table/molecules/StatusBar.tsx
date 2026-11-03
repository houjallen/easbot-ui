import { useTableConfig } from '../context';
import { useTableLogic } from '../context/TableContext';
import { useTableContext } from '../context/TableContext';
import type { StatusBarConfig } from '../types/base';
import { cn } from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';
import { useComponentMessage } from '../../../utils/use-component-message';
import { Database, HardDrive, Server, Zap } from 'lucide-react';
import React from 'react';

/**
 * 表格状态栏组件
 * 显示表格运行状态信息，如服务器模式、缓存状态、持久化状态等
 * 直接从TableContext获取状态数据，实现组件自治
 */

/**
 * 表格状态栏属性
 */
export interface TableStatusBarProps {
  config?: StatusBarConfig;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 表格状态栏组件
 * 自动从TableContext获取状态信息并显示
 */
export const StatusBar: React.FC<TableStatusBarProps> = ({ config, className }) => {
  // 从TableContext获取状态数据
  const { state } = useTableContext();
  const tableLogic = useTableLogic();
  const tableConfig = useTableConfig();
  const { t } = useComponentMessage('table', { locale: tableLogic.i18n.locale });
  const finalConfig = deepMerge(tableConfig.statusBar || {}, config);
  const { show = true, size = tableConfig.size ?? 'sm' } = finalConfig;

  if (tableConfig.statusBarable === false || !show) return null;
  // 从配置中获取状态信息
  const isServerMode = state.config.dataMode?.pagination === 'remote' || state.config.dataMode?.sort === 'remote' || state.config.dataMode?.filter === 'remote';

  const isCacheEnabled = state.config.cacheable ?? false;
  const isPersistEnabled = state.config.persistable ?? false;
  const pluginCount = tableLogic.plugin.registeredPlugins.length;
  const totalRows = state.data.length;
  const selectedCount = state.selectedRowKeys.length;

  return (
    <div
      className={cn('eas-table-statusbar-container flex shrink-0 items-center justify-between gap-2 py-2 text-muted-foreground text-xs', finalConfig.className, className)}
      style={finalConfig.style}
    >
      {/* 左侧状态信息 */}
      <div className="flex items-center gap-2">
        {/* 服务器模式 */}
        <div className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          <span>{isServerMode ? t('serverMode') : t('localMode')}</span>
        </div>

        {/* 缓存状态 */}
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          <span>{t('cache', { status: isCacheEnabled ? t('enabled') : t('disabled') })}</span>
        </div>

        {/* 持久化状态 */}
        <div className="flex items-center gap-1">
          <HardDrive className="h-3 w-3" />
          <span>{t('persistence', { status: isPersistEnabled ? t('enabled') : t('disabled') })}</span>
        </div>

        {/* 数据统计 */}
        <div className="flex items-center gap-1">
          <span>{t('totalRows', { count: totalRows })}</span>
          {selectedCount > 0 && <span>&nbsp;|&nbsp;{t('selectedRows', { count: selectedCount })}</span>}
        </div>
      </div>

      {/* 右侧插件信息 */}
      <div className="flex items-center gap-1">
        <Database className="h-3 w-3" />
        <span>{t('pluginCount', { count: pluginCount })}</span>
      </div>
    </div>
  );
};

export default StatusBar;

StatusBar.displayName = 'TableStatusBar';
