/**
 * 打印插件
 * 提供表格打印功能，支持自定义样式和打印预览
 */

import type { TableContextValue } from '../index';
import { Button } from '../../button';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableActionConfig } from '../types/hooks';
import React from 'react';
import { Icon } from '../../icon/icon';
import type { ActionConfig, TablePlugin } from '../types';
import { formatCellValueToHtml } from '../utils/cellValueFormatter';

/**
 * 打印插件配置
 */
export interface PrintPluginConfig {
  /** 是否启用打印功能 */
  enabled?: boolean;
  /** 打印标题 */
  title?: string;
  /** 是否包含表头 */
  includeHeaders?: boolean;
  /** 自定义样式 */
  customStyles?: string;
  /** 是否只打印选中的行 */
  printSelectedOnly?: boolean;
  /** 页面方向 */
  orientation?: 'portrait' | 'landscape';
  /** 纸张大小 */
  paperSize?: 'A4' | 'A3' | 'Letter';
}

/**
 * 打印插件状态接口
 */
export interface PrintPluginState {
  /** 是否正在准备打印 */
  loading: boolean;
  /** 最后打印时间 */
  lastPrintTime?: Date;
}

/**
 * 打印插件定义
 */
const PrintPlugin: TablePlugin = {
  id: 'print',
  name: 'print',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Print table data', // 使用英文作为默认值，实际显示时会通过messages进行国际化
  messages: getTablePluginMessages('print'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-print',
      label: 'plugin.print.title',
      icon: 'print',
      position: [TablePluginContributionPoint.TOOLBAR_RIGHT],
      priority: 5,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('print'),
      variant: 'ghost',
      type: 'table-print', // 使用schema定义的标准action type
      interaction: {
        type: 'direct', // 直接执行打印
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (selectedRows, context) => {
        return true; // 默认启用，具体配置由外部控制
      },
      execute: async (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as PrintPluginState;

        try {
          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            loading: true,
          });

          const tableContext = context?.tableContext;
          const allData = tableContext?.state?.data || [];
          const columns = tableContext?.state?.columns?.filter((col) => col.visible !== false) || [];
          const selectedRowsData = tableContext?.getSelectedRows?.() || [];

          // 默认配置
          const defaultConfig: PrintPluginConfig = {
            title: processMessage('plugin.print.title', tableMessages),
            includeHeaders: true,
            printSelectedOnly: false,
            orientation: 'portrait',
            paperSize: 'A4',
          };

          // 确定要打印的数据
          const dataToPrint = defaultConfig.printSelectedOnly && selectedRowsData.length > 0 ? selectedRowsData : allData;

          if (dataToPrint.length === 0) {
            console.warn(processMessage('plugin.print.noDataToPrint', tableMessages));
            return;
          }

          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            loading: true,
          });

          // 打开打印窗口
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            throw new Error(processMessage('plugin.print.cannotOpenPrintWindow', tableMessages));
          }

          const now = new Date();
          const title = defaultConfig.title;
          const orientation = defaultConfig.orientation === 'landscape' ? 'landscape' : 'portrait';
          const paperSize = defaultConfig.paperSize || 'A4';

          // 生成打印样式
          const printStyles = `
            @page {
              size: ${paperSize} ${orientation};
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.4;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #333;
              padding-bottom: 10px;
            }
            .print-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin: 0;
            }
            .print-date {
              font-size: 10px;
              color: #666;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
                font-size: 11px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 6px 8px;
                text-align: left;
                word-wrap: break-word;
              }
              th {
                background-color: #f8f9fa;
                font-weight: bold;
                font-size: 10px;
                text-transform: uppercase;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .print-footer {
                margin-top: 20px;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
            `;

          // 构建打印内容
          let printContent = `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>${title}</title>
                  <meta charset="utf-8">
                  <style>${printStyles}</style>
                </head>
                <body>
                  <div class="print-header">
                    <h1 class="print-title">${title}</h1>
                    <div class="print-date">${processMessage('plugin.print.printTime', tableMessages, { time: now.toLocaleString() })}</div>
                  </div>
                  <table>
            `;

          // 添加表头
          if (columns.length > 0) {
            printContent += '<thead><tr>';
            columns.forEach((column) => {
              const title = column.title || column.dataIndex;
              printContent += `<th>${title}</th>`;
            });
            printContent += '</tr></thead>';
          }

          // 添加数据行
          printContent += '<tbody>';
          dataToPrint.forEach((row, rowIndex) => {
            printContent += '<tr>';
            columns.forEach((column) => {
              const key = column.dataIndex;
              const rawValue = row[key];
              const formattedValue = formatCellValueToHtml(rawValue, column, row, rowIndex);
              printContent += `<td>${formattedValue}</td>`;
            });
            printContent += '</tr>';
          });
          printContent += '</tbody>';

          printContent += `
                  </table>
                  <div class="print-footer">
                    ${processMessage('plugin.print.totalRecords', tableMessages, { count: dataToPrint.length })}
                  </div>
                </body>
              </html>
            `;

          printWindow.document.write(printContent);
          printWindow.document.close();

          // 等待内容加载完成后打印
          printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
          };

          // 更新最后打印时间
          context?.updateState?.({
            ...pluginState,
            loading: false,
            lastPrintTime: now,
          });

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-print',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { recordCount: dataToPrint.length },
                result: {
                  success: true,
                  data: { recordCount: dataToPrint.length },
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage('plugin.print.printSuccess', tableMessages));
        } catch (error) {
          console.error(processMessage('plugin.print.printFailed', tableMessages, { error: String(error) }), error);

          context?.updateState?.({
            ...pluginState,
            loading: false,
          });

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-print',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { recordCount: 0 },
                result: {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }
        }
      },
      render: (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);

        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

        const handleClick = (event?: React.MouseEvent) => {
          // 直接调用插件的pluginExecute方法，实现统一的事件处理
          if (action?.pluginExecute) {
            action?.pluginExecute(selectedRows, context, action);
          }
        };

        return React.createElement(
          Button,
          {
            variant: 'ghost',
            size: showLabel ? (action?.size ?? 'sm') : 'icon',
            className: 'shrink-0 p-1 cursor-pointer',
            title: processMessage('plugin.print.tooltip', tableMessages),
            leftIcon: React.createElement(Icon, {
              name: 'print',
              size: 16,
            }),
            onClick: (e) => {
              handleClick(e);
            },
          },
          showLabel ? processMessage('plugin.print.print', tableMessages) : null,
        );
      },
    },
  ] as TablePluginTableActionConfig[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: PrintPluginState = {
      loading: false,
      lastPrintTime: undefined,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理打印相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default PrintPlugin;
