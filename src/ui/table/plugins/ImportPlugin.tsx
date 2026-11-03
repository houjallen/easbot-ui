/**
 * 导入插件
 * 提供表格数据导入功能，支持Excel、CSV等格式文件导入
 */

import type { TableContextValue } from '../index';
import { Button } from '../../button';
import { Icon } from '../../icon';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import React from 'react';
import type { ActionConfig, TablePlugin } from '../types';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableActionConfig } from '../types/hooks';

/**
 * 导入插件配置
 */
export interface ImportPluginConfig {
  /** 是否启用导入功能 */
  enabled?: boolean;
  /** 支持的文件格式 */
  acceptedFormats?: string[];
  /** 最大文件大小(MB) */
  maxFileSize?: number;
  /** 是否覆盖现有数据 */
  overwrite?: boolean;
  /** 导入模式：追加或替换 */
  mode?: 'append' | 'replace';
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 字段映射配置 */
  fieldMapping?: Record<string, string>;
  /** 自定义导入处理函数 */
  onImport?: (data: any[], file: File) => Promise<any[]>;
}

/**
 * 导入插件状态接口
 */
export interface ImportPluginState {
  /** 是否正在导入 */
  loading: boolean;
  /** 最后导入时间 */
  lastImportTime?: Date;
  /** 导入进度 */
  progress?: number;
}

/**
 * 解析CSV文件
 */
const parseCSV = (text: string): any[] => {
  const lines = text.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0]?.split(',').map((h) => h.trim().replace(/"/g, '')) ?? [];
  const data: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]?.split(',').map((v) => v.trim().replace(/"/g, '')) ?? [];
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
};

/**
 * 读取文件内容
 *
 * @param file 待读取的文件
 * @returns 文件文本内容
 */
const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(processUiMessage('plugin.import.fileReadError', { messages: getTablePluginMessages('import'), fallbackLocale: 'zh-CN' })));
    reader.readAsText(file);
  });
};

/**
 * 导入插件定义
 */
const ImportPlugin: TablePlugin = {
  id: 'import',
  name: 'import',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Import table data from file',
  messages: getTablePluginMessages('import'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-import',
      label: 'plugin.import.title',
      icon: 'upload',
      position: [TablePluginContributionPoint.TOOLBAR_LEFT],
      priority: 3,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('import'),
      variant: 'outline',
      type: 'table-import',
      interaction: {
        type: 'direct',
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
        const pluginState = context?.state as ImportPluginState;

        // 创建文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv,.xlsx,.xls';
        fileInput.style.display = 'none';

        const config = (action?.config as ImportPluginConfig) || {};
        const acceptedFormats = config.acceptedFormats || ['.csv', '.xlsx', '.xls'];
        const maxFileSize = config.maxFileSize || 10; // 默认10MB

        fileInput.accept = acceptedFormats.join(',');

        fileInput.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          try {
            // 验证文件格式
            const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
            if (!acceptedFormats.includes(fileExtension)) {
              alert(processMessage('plugin.import.invalidFileFormat', tableMessages));
              return;
            }

            // 验证文件大小
            if (file.size > maxFileSize * 1024 * 1024) {
              alert(
                processMessage('plugin.import.fileTooLarge', tableMessages, {
                  size: maxFileSize,
                }),
              );
              return;
            }

            // 更新插件状态
            context?.updateState?.({
              ...pluginState,
              loading: true,
              progress: 0,
            });

            let importedData: any[] = [];

            // 根据文件类型解析数据
            if (fileExtension === '.csv') {
              const text = await readFile(file);
              importedData = parseCSV(text);
            } else {
              // 对于Excel文件，这里需要使用专门的库如SheetJS
              // 暂时提示用户转换为CSV格式
              alert(processMessage('plugin.import.excelNotSupported', tableMessages));
              context?.updateState?.({
                ...pluginState,
                loading: false,
              });
              return;
            }

            // 如果有自定义导入处理函数，调用它
            if (config.onImport) {
              importedData = await config.onImport(importedData, file);
            }

            // 应用字段映射
            if (config.fieldMapping) {
              importedData = importedData.map((row) => {
                const mappedRow: any = {};
                Object.keys(row).forEach((key) => {
                  const mappedKey = config.fieldMapping?.[key] || key;
                  mappedRow[mappedKey] = row[key];
                });
                return mappedRow;
              });
            }

            // 导入逻辑 - 通过事件通知外部业务系统处理
            console.debug(
              processMessage('plugin.import.importSuccess', tableMessages, {
                count: importedData.length,
              }),
            );

            // 更新最后导入时间
            const now = new Date();
            context?.updateState?.({
              ...pluginState,
              loading: false,
              lastImportTime: now,
              progress: 100,
            });

            // 操作完成后，通过统一的actionEvents实例emit事件
            const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
            if (actionEvents) {
              await actionEvents.emitAction(
                'table-import',
                {
                  source: 'plugin',
                  timestamp: Date.now(),
                  payload: {
                    fileName: file.name,
                    fileSize: file.size,
                    importedCount: importedData.length,
                    mode: config.mode || 'append',
                  },
                  result: {
                    success: true,
                    data: importedData,
                  },
                },
                context?.tableContext as TableContextValue,
                action || ({} as ActionConfig),
              );
            }

            console.debug(processMessage('plugin.import.importSuccess', tableMessages));
            alert(
              processMessage('plugin.import.importedRecords', tableMessages, {
                count: importedData.length,
              }),
            );
          } catch (error) {
            console.error(processMessage('plugin.import.importFailed', tableMessages, { error: String(error) }), error);

            context?.updateState?.({
              ...pluginState,
              loading: false,
              progress: 0,
            });

            // 操作失败后，也emit事件
            const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
            if (actionEvents) {
              await actionEvents.emitAction(
                'table-import',
                {
                  source: 'plugin',
                  timestamp: Date.now(),
                  payload: {
                    fileName: file?.name || '',
                    fileSize: file?.size || 0,
                  },
                  result: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  },
                },
                context?.tableContext as TableContextValue,
                action || ({} as ActionConfig),
              );
            }

            alert(processMessage('plugin.import.importFailed', tableMessages));
          } finally {
            // 清理文件输入元素
            document.body.removeChild(fileInput);
          }
        };

        // 添加到DOM并触发点击
        document.body.appendChild(fileInput);
        fileInput.click();
      },
      render: (selectedRows, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as ImportPluginState;

        const tableConfig = context?.tableContext?.state?.config || {};
        const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

        const handleClick = (event?: React.MouseEvent) => {
          if (action?.pluginExecute) {
            action?.pluginExecute(selectedRows, context, action);
          }
        };

        return React.createElement(
          Button,
          {
            variant: 'outline',
            size: showLabel ? (action?.size ?? 'sm') : 'icon',
            className: 'shrink-0 p-1',
            title: processMessage('plugin.import.tooltip', tableMessages),
            leftIcon: React.createElement(Icon, {
              name: 'upload',
              size: 16,
            }),
            disabled: pluginState?.loading,
            onClick: (e) => {
              handleClick(e);
            },
          },
          showLabel ? processMessage('plugin.import.import', tableMessages) : null,
        );
      },
    },
  ] as TablePluginTableActionConfig[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: ImportPluginState = {
      loading: false,
      lastImportTime: undefined,
      progress: 0,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理导入相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default ImportPlugin;
