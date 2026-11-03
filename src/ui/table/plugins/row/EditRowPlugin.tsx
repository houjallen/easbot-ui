import { Button } from '../../../button';
import { Icon } from '../../../icon';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import { EditRowModal } from '../../components/EditRowModal';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginRowAction } from '../../types/hooks';
import type { TablePluginContext } from '../../types/hooks';
import React, { useCallback, useState } from 'react';
import type { ActionConfig, TablePlugin } from '../../types';

/**
 * 编辑行组件属性接口
 */
interface EditRowComponentProps {
  record?: Record<string, any>;
  context?: TablePluginContext;
  action?: ActionConfig;
  processMessage: (key: string, messages?: any) => string;
}

/**
 * 编辑行组件 - 独立的React组件，使用EditRowModal组件
 */
const EditRowComponent: React.FC<EditRowComponentProps> = ({ record = {}, context, action, processMessage }) => {
  const tableConfig = context?.tableContext?.state?.config || {};
  const pluginState = context?.state as EditRowPluginState;
  const config = (context?.tableContext?.tableLogic?.plugin?.getPluginConfig(EditRowPlugin.id as string) as EditRowPluginConfig) || {};
  const [open, setOpen] = useState(false);
  const { loading = false } = pluginState || {};

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
  } = config;

  const showLabel = action?.showInMore || action?.showLabel;

  const columns = context?.tableContext?.state?.columns || [];

  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  // 渲染触发按钮
  const renderTriggerButton = () => {
    return React.createElement(
      Button,
      {
        variant: action?.variant || 'ghost',
        size: showLabel ? (action?.size ?? 'sm') : 'icon',
        className: 'shrink-0 p-1',
        title: processMessage('plugin.editRow.tooltip', tableMessages),
        leftIcon: React.createElement(Icon, {
          name: action?.icon || 'table-edit',
          size: 16,
        }),
        disabled: loading,
      },
      showLabel ? processMessage('plugin.editRow.edit', tableMessages) : null,
    );
  };

  // 处理值变更
  const handleValueChange = (fieldName: string, value: any) => {
    if (config.onValueChange) {
      const oldValue = record[fieldName];
      config.onValueChange(fieldName, value, oldValue, record);
    }
  };

  // 页面模式
  if (mode === 'page' && urlGenerator) {
    return urlGenerator(record, context?.tableContext);
  }

  // 使用通用的EditRowModal组件
  return (
    <EditRowModal
      trigger={renderTriggerButton()}
      tableContext={context?.tableContext}
      action={action}
      columns={columns}
      record={record}
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
      title={processMessage('plugin.editRow.title', tableMessages)}
      description={processMessage('plugin.editRow.description', tableMessages)}
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
 * 编辑行插件配置接口
 */
export interface EditRowPluginConfig {
  /** 是否启用插件功能 */
  enabled?: boolean;
  /** 弹层类型：dialog | drawer | page，默认 'dialog' */
  mode?: 'dialog' | 'drawer' | 'sheet' | 'page';
  /** 位置 drawer sheet 生效*/
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** 布局模式：grid | list，drawer 默认 'list'，其他默认 'grid' */
  layout?: 'grid' | 'list';
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
  /** 页面跳转URL生成器（仅在 page 模式下有效） */
  urlGenerator?: (record: Record<string, any>, context?: any) => string;
  /** 编辑成功回调 */
  onEditSuccess?: (newValues: Record<string, any>, oldValues: Record<string, any>, record: Record<string, any>) => void;
  /** 编辑失败回调 */
  onEditError?: (error: Error, record: Record<string, any>) => void;
  /** 值变更回调 */
  onValueChange?: (fieldName: string, newValue: any, oldValue: any, record: Record<string, any>) => void;
}

/**
 * 编辑插件状态接口
 */
export interface EditRowPluginState {
  loading: boolean;
  editingRowKey?: string | number;
  /** 编辑的数据 */
  editingData: Record<string, any>;
  /** 原始数据 */
  originalData: Record<string, any>;
}

/**
 * 编辑行插件定义
 */
const EditRowPlugin: TablePlugin = {
  id: 'editRow',
  name: 'editRow',
  type: 'action',
  positionType: 'row',
  version: '1.0.0',
  description: 'Edit row plugin for table',
  messages: getTablePluginMessages('editRow'),

  // 默认状态
  defaultState: {
    loading: false,
    editingRowKey: undefined,
    editingData: {},
    originalData: {},
  } as EditRowPluginState,

  // 初始化
  init: (context) => {
    context.updateState?.({
      loading: false,
      editingRowKey: undefined,
      editingData: {},
      originalData: {},
    });
  },

  // 销毁
  destroy: (context) => {
    // 清理资源
    context.updateState?.({
      loading: false,
      editingRowKey: undefined,
      editingData: {},
      originalData: {},
    });
  },

  // 动作定义
  actions: [
    {
      key: 'table-row-edit',
      label: 'plugin.editRow.title',
      icon: 'table-edit',
      position: [TablePluginContributionPoint.ROW_ACTIONS, TablePluginContributionPoint.ROW_CONTEXT_MENU],
      priority: 1,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('editRow'),
      variant: 'ghost',
      type: 'table-row-edit',
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

      when: (record, context) => {
        return true;
      },

      execute: async (record: Record<string, unknown>, context, action) => {},

      render: (record = {}, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);

        // 直接返回React组件，避免在render函数中使用Hooks
        return React.createElement(EditRowComponent, {
          record,
          context,
          action,
          processMessage,
        });
      },
    },
  ] as TablePluginRowAction[],
};

export default EditRowPlugin;
