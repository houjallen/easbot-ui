/**
 * 新增插件
 * 提供表格数据新增功能，支持单行新增和批量新增
 */

import { Button } from '../../button';
import { Icon } from '../../icon';
import { EditRowModal } from '../components/EditRowModal';
import { getTablePluginMessages, tableMessages } from '../../../utils/component-messages';
import React, { useCallback, useState } from 'react';
import type { TablePlugin } from '../types';
import type { ActionConfig } from '../types/base';
import { TablePluginContributionPoint } from '../types/hooks';
import type { TablePluginTableAction } from '../types/hooks';
import type { TablePluginContext } from '../types/hooks';

/**
 * 新增插件配置
 */
export interface AddPluginConfig {
  /** 是否启用新增功能 */
  enabled?: boolean;
  /** 默认新行数据 */
  defaultRowData?: Record<string, any>;
  /** 新增位置：顶部或底部 */
  position?: 'top' | 'bottom';
  /** 是否自动进入编辑模式 */
  autoEdit?: boolean;
  /** 自定义新增处理函数 */
  onAdd?: (data: Record<string, any>) => Promise<any>;
  /** 弹层类型：dialog | drawer | page，默认 'dialog' */
  mode?: 'dialog' | 'drawer' | 'sheet' | 'page';
  /** 位置 drawer sheet 生效*/
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** 布局模式：grid | list，drawer 默认 'list'，其他默认 'grid' */
  layout?: 'grid' | 'list';
  /** 网格列数，仅在 grid 模式下有
  /** 网格列数，仅在 grid 模式下有效，'auto' 表示自适应，默认 'auto' */
  gridCols?: number | 'auto';
  /** 字段的默认最小宽度，默认 320px */
  minFieldWidth?: number;
  /** 排除的数据字段列表（按 dataIndex 排除） */
  excludeFields?: string[];
  /** 仅包含的数据字段列表（按 dataIndex 包含） */
  includeFields?: string[];
  /** 是否显示字段标签，默认 true */
  showLabel?: boolean;
  /** 是否单行显示（label 和 field 在一行），默认 true */
  singleLine?: boolean;
  /**
   * 默认占满一行的字段类型列表
   * 当 gridCols = 'auto' 时，这些类型的字段会自动占满一行
   * 默认: ['textarea', 'file', 'image']
   */
  fullWidthTypes?: string[];
  /** 新增成功回调 */
  onAddSuccess?: (newValues: Record<string, any>) => void;
  /** 新增失败回调 */
  onAddError?: (error: Error) => void;
  /** 值变更回调 */
  onValueChange?: (fieldName: string, newValue: any, oldValue: any) => void;
  /** 页面跳转URL生成器（仅在 page 模式下有效） */
  urlGenerator?: (record?: Record<string, any>, context?: any) => string;
}

/**
 * 新增插件状态接口
 */
export interface AddPluginState {
  /** 是否正在新增 */
  loading: boolean;
  /** 最后新增时间 */
  lastAddTime?: Date;
}

/**
 * AddComponent组件，处理新增功能
 */
interface AddComponentProps {
  context?: TablePluginContext;
  action?: ActionConfig;
  processMessage: (key: string, messages?: any) => string;
}

const AddComponent: React.FC<AddComponentProps> = ({ context, action, processMessage }) => {
  // 获取插件状态和配置
  const pluginState = context?.state as AddPluginState;
  const config = (action?.config as AddPluginConfig) || {};
  const { loading = false } = pluginState || {};
  const [open, setOpen] = useState(false);

  // 获取表格上下文
  const tableContext = context?.tableContext;
  const tableConfig = tableContext?.state?.config;
  const columns = tableContext?.state?.columns || [];

  // 默认配置，参考 SearchPanel 的配置控制
  const {
    mode = 'dialog',
    side = mode === 'sheet' ? 'right' : 'bottom', // drawer, sheet 位置
    layout = mode === 'sheet' ? 'list' : 'grid', // drawer 默认 list，其他默认 grid
    gridCols = 'auto', // 默认使用 auto-fit 自适应布局
    minFieldWidth = 320, // 默认最小宽度 320px
    excludeFields = [],
    includeFields,
    showLabel: showFieldLabel = true, // 默认显示 label
    singleLine = true, // 默认 label 和 field 一行（参考 SearchPanel）
    fullWidthTypes = ['textarea', 'file', 'image'], // 默认占满一行的字段类型
    urlGenerator,
    defaultRowData,
  } = config;

  const showLabel = action?.showInMore || action?.position?.includes?.(TablePluginContributionPoint.TOOLBAR_LEFT) || action?.showLabel;

  // 处理值变更
  const handleValueChange = useCallback(
    (fieldName: string, newValue: any, oldValue: any) => {
      if (typeof config.onValueChange === 'function') {
        config.onValueChange(fieldName, newValue, oldValue);
      }
    },
    [config],
  );

  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  // 渲染触发按钮
  const renderTriggerButton = () => {
    return React.createElement(
      Button,
      {
        variant: action?.variant || 'default',
        size: showLabel ? (action?.size ?? 'sm') : 'icon',
        className: 'shrink-0 p-1',
        title: processMessage('plugin.add.tooltip', tableMessages),
        leftIcon: React.createElement(Icon, {
          name: action?.icon || 'table-add',
          className: 'text-primary-foreground',
          size: 16,
        }),
        disabled: loading,
      },
      showLabel ? processMessage('plugin.add.add', tableMessages) : null,
    );
  };

  // 页面模式，只有按钮
  if (config.mode === 'page' && urlGenerator) {
    return urlGenerator(defaultRowData, context?.tableContext);
  }

  return (
    <EditRowModal
      trigger={renderTriggerButton()}
      tableContext={context?.tableContext}
      action={action}
      columns={columns}
      record={defaultRowData}
      mode={mode as 'dialog' | 'drawer' | 'sheet'}
      side={side as 'top' | 'right' | 'bottom' | 'left'}
      layout={layout as 'grid' | 'list'}
      gridCols={gridCols}
      minFieldWidth={minFieldWidth}
      showLabel={showFieldLabel}
      singleLine={singleLine}
      fullWidthTypes={fullWidthTypes}
      excludeFields={excludeFields}
      includeFields={includeFields}
      title={processMessage('plugin.add.title', tableMessages)}
      description={processMessage('plugin.add.description', tableMessages)}
      cancelText={processMessage('cancel', tableMessages)}
      confirmText={processMessage('save', tableMessages)}
      onValueChange={handleValueChange}
      staticMode={false}
      open={open}
      onOpenChange={handleOpen}
      showConfirm={true}
      showCancel={true}
    />
  );
};

/**
 * 新增插件定义
 */
const AddPlugin: TablePlugin = {
  id: 'add',
  name: 'add',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: 'Add table data',
  messages: getTablePluginMessages('add'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-add',
      label: 'plugin.add.title',
      icon: 'table-add',
      position: [TablePluginContributionPoint.TOOLBAR_LEFT],
      priority: 1,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('add'),
      variant: 'default',
      type: 'table-add',
      interaction: {
        type: 'page',
        page: {
          urlGenerator: (context, record) => {
            const baseUrl = '/edit-page';
            const recordId = record?.id || 'new';
            return `${baseUrl}?id=${recordId}&mode=edit`;
          },
          target: '_blank',
          paramsExtractor: (context, record) => ({
            recordId: record?.id,
            tableName: context?.tableContext?.state?.config?.tableName,
            editMode: 'update',
          }),
        },
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (selectedRows, context) => {
        return true; // 默认启用，具体配置由外部控制
      },
      execute: async (selectedRows, context, action) => {},
      render: (selectedRows, context, action) => {
        // 直接返回React组件，避免在render函数中使用Hooks
        return React.createElement(AddComponent, {
          context,
          action,
          processMessage: context?.processMessage || ((key: string) => key),
        });
      },
    },
  ] as TablePluginTableAction[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: AddPluginState = {
      loading: false,
      lastAddTime: undefined,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理新增相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default AddPlugin;
