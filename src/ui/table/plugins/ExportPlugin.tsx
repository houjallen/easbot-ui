import type { TableContextValue } from '../index';
import { Button } from '../../button';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../dropdown-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../../dropdown-menu';
import { Icon } from '../../icon';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableActionConfig } from '../types/hooks';
import type { TablePluginContext } from '../types/hooks';
import React, { useCallback, useState } from 'react';
import type { ActionConfig, TablePlugin } from '../types';
import { formatCellValueForExport } from '../utils/cellValueFormatter';

/**
 * 导出插件配置
 */
export interface ExportPluginConfig {
  /** 是否启用插件功能 */
  enabled?: boolean;
  /** 支持的导出格式 */
  formats?: ('csv' | 'json' | 'excel')[];
  /** 导出文件名前缀 */
  filename?: string;
  /** 是否包含表头 */
  includeHeaders?: boolean;
  /** CSV分隔符 */
  csvSeparator?: string;
  /** 自定义列标题映射 */
  customHeaders?: Record<string, string>;
}

/**
 * 导出插件状态接口
 */
export interface ExportPluginState {
  /** 是否正在导出 */
  loading: boolean;
  /** 当前导出格式 */
  currentFormat?: string;
  /** 导出进度 */
  progress?: number;
}

/**
 * 导出菜单组件
 */
const ExportMenu: React.FC<{
  context?: TablePluginContext;
  action?: ActionConfig;
  onClose?: () => void;
}> = ({ context, onClose, action }) => {
  const processMessage = context?.processMessage || ((key: string) => key);
  const [isExporting, setIsExporting] = useState(false);

  const tableContext = context?.tableContext;
  const data = tableContext?.state?.data || [];
  const columns = tableContext?.state?.columns || [];
  const selectedRows = tableContext?.getSelectedRows?.() || [];

  // 导出CSV
  const handleExportCsv = useCallback(async () => {
    if (!data || data.length === 0) {
      console.warn(processMessage('noDataToExport', tableMessages));
      return;
    }

    setIsExporting(true);
    try {
      await exportToCsv(data, columns);

      // 操作完成后，通过统一的actionEvents实例emit事件
      const actionEvents = tableContext?.tableLogic?.actionEvents;
      if (actionEvents) {
        await actionEvents.emitAction(
          'table-export',
          {
            selectedRows: data,
            source: 'plugin',
            timestamp: Date.now(),
            payload: { format: 'csv', recordCount: data.length },
            result: {
              success: true,
              data: { format: 'csv', recordCount: data.length },
            },
          },
          context?.tableContext as TableContextValue,
          action || ({} as ActionConfig),
        );
      }

      console.debug(processMessage('exportSuccess', tableMessages));
    } catch (error) {
      // 操作失败后，也emit事件
      const actionEvents = tableContext?.tableLogic?.actionEvents;
      if (actionEvents) {
        await actionEvents.emitAction(
          'table-export',
          {
            selectedRows: data,
            source: 'plugin',
            timestamp: Date.now(),
            payload: { format: 'csv', recordCount: data.length },
            result: {
              success: false,
              error: error as Error,
            },
          },
          context?.tableContext as TableContextValue,
          action || ({} as ActionConfig),
        );
      }

      console.error(processMessage('plugin.export.exportFailed', tableMessages, { error: String(error) }), error);
    } finally {
      setIsExporting(false);
      onClose?.();
    }
  }, [data, columns, processMessage, onClose, tableContext, action, context?.tableContext]);

  // 导出JSON
  const handleExportJson = useCallback(async () => {
    if (!data || data.length === 0) {
      console.warn(processMessage('noDataToExport', tableMessages));
      return;
    }

    setIsExporting(true);
    try {
      await exportToJson(data, columns);

      // 操作完成后，通过统一的actionEvents实例emit事件
      const actionEvents = tableContext?.tableLogic?.actionEvents;
      if (actionEvents) {
        await actionEvents.emitAction(
          'table-export',
          {
            selectedRows: data,
            source: 'plugin',
            timestamp: Date.now(),
            payload: { format: 'json', recordCount: data.length },
            result: {
              success: true,
              data: { format: 'json', recordCount: data.length },
            },
          },
          context?.tableContext as TableContextValue,
          action || ({} as ActionConfig),
        );
      }

      console.debug(processMessage('exportSuccess', tableMessages));
    } catch (error) {
      // 操作失败后，也emit事件
      const actionEvents = tableContext?.tableLogic?.actionEvents;
      if (actionEvents) {
        await actionEvents.emitAction(
          'table-export',
          {
            selectedRows: data,
            source: 'plugin',
            timestamp: Date.now(),
            payload: { format: 'json', recordCount: data.length },
            result: {
              success: false,
              error: error as Error,
            },
          },
          context?.tableContext as TableContextValue,
          action || ({} as ActionConfig),
        );
      }

      console.error(processMessage('plugin.export.exportFailed', tableMessages, { error: String(error) }), error);
    } finally {
      setIsExporting(false);
      onClose?.();
    }
  }, [data, columns, processMessage, onClose, tableContext, context?.tableContext, action]);

  // 导出选中数据CSV
  const handleExportSelectedCsv = useCallback(async () => {
    if (!selectedRows || selectedRows.length === 0) {
      console.warn(processMessage('noSelectedData', tableMessages));
      return;
    }

    setIsExporting(true);
    try {
      await exportToCsv(selectedRows, columns, 'selected-data');
      console.debug(processMessage('exportSuccess', tableMessages));
    } catch (error) {
      console.error(processMessage('plugin.export.exportFailed', tableMessages, { error: String(error) }), error);
    } finally {
      setIsExporting(false);
      onClose?.();
    }
  }, [selectedRows, columns, processMessage, onClose]);

  return (
    <>
      {/* 导出全部数据 */}
      <DropdownMenuLabel className="text-muted-foreground">{processMessage('plugin.export.exportAll', tableMessages)}</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={handleExportCsv} disabled={isExporting || data.length === 0} className="cursor-pointer">
          <Icon name="file-spreadsheet" size={16} className="mr-2" />
          {processMessage('plugin.export.exportCsv', tableMessages)}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportJson} disabled={isExporting || data.length === 0} className="cursor-pointer">
          <Icon name="file-text" size={16} className="mr-2" />
          {processMessage('plugin.export.exportJson', tableMessages)}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      {/* 导出选中数据 */}
      {selectedRows.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground">
            {processMessage('plugin.export.exportSelected', tableMessages)} ({selectedRows.length})
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleExportSelectedCsv} disabled={isExporting} className="cursor-pointer">
              <Icon name="file-spreadsheet" size={16} className="mr-2" />
              {processMessage('plugin.export.exportCsv', tableMessages)}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      )}
    </>
  );
};

// 格式化值函数 - 使用专门的导出格式化工具
const formatValue = (value: any, column: any, record?: any, index?: number) => {
  return formatCellValueForExport(value, column, record, index);
};

// 导出工具函数
const exportToCsv = async (data: any[], columns: any[], filenamePrefix = 'table-data') => {
  const headers = columns.filter((col) => col.visible !== false).map((col) => col.title || col.label || col.key || col.dataIndex);

  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      columns
        .filter((col) => col.visible !== false)
        .map((col) => {
          const key = col.key || col.dataIndex;
          const rawValue = row[key];
          const value = formatValue(rawValue, col, row, data.indexOf(row));

          // 处理包含逗号、引号或换行符的值
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(','),
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8',
  }); // 添加BOM以支持中文
  downloadFile(blob, `${filenamePrefix}.csv`);
};

const exportToJson = async (data: any[], columns: any[] = [], filenamePrefix = 'table-data') => {
  // 如果有列配置，则格式化数据
  let processedData = data;
  if (columns && columns.length > 0) {
    processedData = data.map((row) => {
      const processedRow: any = {};
      columns.forEach((col) => {
        const key = col.key || col.dataIndex;
        if (key && Object.hasOwn(row, key)) {
          processedRow[key] = formatValue(row[key], col, row, data.indexOf(row));
        }
      });
      // 保留未在列配置中的字段
      Object.keys(row).forEach((key) => {
        if (!Object.hasOwn(processedRow, key)) {
          processedRow[key] = row[key];
        }
      });
      return processedRow;
    });
  }

  const jsonContent = JSON.stringify(processedData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadFile(blob, `${filenamePrefix}.json`);
};

// 文件下载辅助函数
const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 导出插件
 */
const ExportPlugin: TablePlugin = {
  id: 'export',
  name: 'export',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Export table data', // 使用英文作为默认值，实际显示时会通过messages进行国际化
  messages: getTablePluginMessages('export'),

  // 默认状态
  defaultState: {
    loading: false,
    currentFormat: undefined,
    progress: 0,
  } as ExportPluginState,

  // 插件初始化
  init: (context: TablePluginContext) => {
    // 初始化插件状态
    context?.updateState?.({
      isExporting: false,
      currentFormat: undefined,
      progress: 0,
    });
  },

  // 插件动作配置
  actions: [
    {
      key: 'table-export',
      label: 'plugin.export.title',
      icon: 'download',
      position: [TablePluginContributionPoint.TOOLBAR_RIGHT],
      priority: 4,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('export'),
      variant: 'ghost',
      type: 'table-export', // 使用schema定义的标准action type
      interaction: {
        type: 'menu',
        menu: {
          placement: 'bottomRight',
        },
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (selectedRows, context) => {
        return true; // 默认启用，具体配置由外部控制
      },
      execute: (selectedRows, context, action) => {},
      render: (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

        return React.createElement(
          DropdownMenu,
          {},
          React.createElement(
            DropdownMenuTrigger,
            { asChild: true },
            React.createElement(
              Button,
              {
                variant: 'ghost',
                size: showLabel ? (action?.size ?? 'sm') : 'icon',
                className: 'shrink-0 p-1 cursor-pointer',
                title: processMessage('plugin.export.tooltip', tableMessages),
                leftIcon: React.createElement(Icon, {
                  name: 'table-export',
                  size: 16,
                }),
              },
              showLabel ? processMessage('plugin.export.export', tableMessages) : null,
            ),
          ),
          React.createElement(
            DropdownMenuContent,
            {
              align: 'end',
              className: 'p-0 eas-dropdown-content',
              style: { zIndex: 'calc(var(--eas-z-index-dropdown) + 10)' },
            },
            React.createElement(ExportMenu, {
              context,
              action,
              onClose: () => console.debug('Export menu closed'),
            }),
          ),
        );
      },
    },
  ] as TablePluginTableActionConfig[],

  transformColumns: (columns, context) => {
    return columns;
  },
};

// 导出ExportMenu组件供外部使用
export { ExportMenu };
export default ExportPlugin;
