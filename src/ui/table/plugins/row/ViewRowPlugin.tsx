/**
 * 查看行插件
 * 提供表格行数据查看详情功能
 */

import type { TableContextValue } from '../../index';
import { Button } from '../../../button';
import { Icon } from '../../../icon';
import { getTablePluginMessages, tableMessages } from '../../../../utils/component-messages';
import React, { useCallback, useState } from 'react';
import { EditRowModal } from '../../components/EditRowModal';
import type { ActionConfig, TablePlugin } from '../../types';
import { TablePluginContributionPoint } from '../../types/hooks';
import type { TablePluginRowAction } from '../../types/hooks';
import type { TablePluginContext } from '../../types/hooks';
import { generateStaticField } from '../../utils/field-generator';

/**
 * 查看行插件配置
 */
export interface ViewRowPluginConfig {
  /** 是否启用查看功能 */
  enabled?: boolean;
  /** 弹层类型：dialog | drawer | page，默认 'dialog' */
  mode?: 'dialog' | 'drawer' | 'sheet' | 'page';
  /** 自定义查看处理函数 */
  onView?: (record: any, index: number) => void;
  /** 模态框位置，仅在 drawer 和 sheet 模式下有效 */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** 布局模式：grid | list，drawer 默认 'list'，其他默认 'grid' */
  layout?: 'grid' | 'list';
  /** 网格列数，仅在 grid 模式下有效，'auto' 表示自适应，默认 'auto' */
  gridCols?: number | 'auto';
  /** 字段的默认最小宽度，默认 320px */
  minFieldWidth?: number;
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
  /** 排除的数据字段列表（按 dataIndex 排除） */
  excludeFields?: string[];
  /** 仅包含的数据字段列表（按 dataIndex 包含） */
  includeFields?: string[];
  /** 页面跳转URL生成器（仅在 page 模式下有效） */
  urlGenerator?: (record?: Record<string, any>, context?: any) => string;
}

/**
 * ViewRowComponent组件
 * 使用EditRowModal实现查看功能
 */
interface ViewRowComponentProps {
  record?: Record<string, any>;
  context?: TablePluginContext;
  action?: ActionConfig;
  processMessage?: (key: string, messages?: Record<string, any>) => string;
}

const ViewRowComponent: React.FC<ViewRowComponentProps> = ({ record = {}, context, action, processMessage = (key) => key }) => {
  // 获取插件状态和配置
  const tableConfig = context?.tableContext?.state?.config || {};
  const pluginState = context?.state as ViewRowPluginState;
  const config = (action?.config || {}) as ViewRowPluginConfig;
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

  // 处理打开查看
  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  // 处理关闭查看
  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  // 渲染触发按钮
  const renderTriggerButton = useCallback(() => {
    return React.createElement(
      Button,
      {
        variant: action?.variant || 'ghost',
        size: showLabel ? (action?.size ?? 'sm') : 'icon',
        className: 'shrink-0 p-1',
        title: processMessage('plugin.viewRow.tooltip', tableMessages),
        leftIcon: React.createElement(Icon, {
          name: action?.icon || 'eye',
          size: 16,
        }),
        disabled: loading,
      },
      showLabel ? processMessage('plugin.viewRow.view', tableMessages) : null,
    );
  }, [processMessage, showLabel, action?.size, loading, action?.variant, action?.icon]);

  // 自定义表单字段渲染函数，使用静态字段渲染
  // 确保与编辑模式保持完全一致的类型处理和字体大小
  const customFieldRenderer = useCallback(
    (column: any, value: any, record: any) => {
      // 获取字段类型，用于特殊处理
      const fieldType = column?.editConfig?.type || 'text';

      // 特殊处理不同类型字段的样式类
      let fieldClassName = '';
      if (fieldType === 'textarea') {
        fieldClassName = 'whitespace-pre-wrap';
      } else if (['file', 'image'].includes(fieldType)) {
        fieldClassName = 'flex items-center';
      }

      return generateStaticField(column, value, record, {
        context: 'static',
        t: processMessage,
        className: fieldClassName,
      });
    },
    [processMessage],
  );

  // 处理字段容器类名
  const getFieldContainerClass = useCallback((column: any) => {
    const fieldType = column?.editConfig?.type || 'text';
    const classes = ['eas-static-form-item'];

    // 特殊字段类型占满整行
    if (['textarea', 'file', 'image'].includes(fieldType)) {
      classes.push('col-span-full');
    }

    // 多行文本特殊处理
    if (fieldType === 'textarea') {
      classes.push('items-start');
    }

    return classes.join(' ');
  }, []);

  // 页面模式, 实现跳转
  if (mode === 'page' && urlGenerator) {
    return urlGenerator(record, context?.tableContext);
  }

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
      showLabel={true}
      singleLine={singleLine}
      fullWidthTypes={fullWidthTypes}
      excludeFields={excludeFields}
      includeFields={includeFields}
      title={processMessage('plugin.viewRow.title', tableMessages)}
      description={processMessage('plugin.viewRow.description', tableMessages)}
      cancelText={processMessage('plugin.viewRow.close', tableMessages)}
      open={open}
      onOpenChange={handleOpen}
      showConfirm={false}
      showCancel={true}
      onCancel={handleCancel}
      customFieldRenderer={customFieldRenderer}
      staticMode={true}
    />
  );
};

/**
 * 查看行插件状态接口
 */
export interface ViewRowPluginState {
  /** 是否正在加载 */
  loading: boolean;
  /** 当前查看的记录 */
  viewingRecord?: any;
  /** 最后查看时间 */
  lastViewTime?: Date;
}

/**
 * 查看行插件定义
 */
const ViewRowPlugin: TablePlugin = {
  id: 'viewRow',
  name: 'viewRow',
  type: 'action',
  positionType: 'row',
  version: '1.0.0',
  description: 'View table row details',
  messages: getTablePluginMessages('viewRow'),

  // 插件动作配置 - 统一的UI渲染和交互定义
  actions: [
    {
      key: 'table-row-view',
      label: 'plugin.viewRow.title',
      icon: 'eye',
      position: [TablePluginContributionPoint.ROW_ACTIONS],
      priority: 10,
      group: 'data',
      isPluginAction: true,
      messages: getTablePluginMessages('viewRow'),
      variant: 'ghost',
      type: 'table-row-view',
      interaction: {
        type: 'direct',
      },
      eventConfig: {
        emit: true,
        timing: 'before',
      },
      when: (record, context) => {
        return true; // 默认启用，具体配置由外部控制
      },
      execute: async (record = {}, context, action) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context?.state as ViewRowPluginState;

        try {
          // 更新插件状态
          context?.updateState?.({
            ...pluginState,
            loading: true,
            viewingRecord: record,
          });

          const config = (action?.config as ViewRowPluginConfig) || {};

          // 如果有自定义查看处理函数，调用它
          if (config.onView) {
            config.onView(record, 0); // 这里index暂时传0，实际使用时需要传递正确的index
          }

          // 更新最后查看时间
          const now = new Date();
          context?.updateState?.({
            ...pluginState,
            loading: false,
            lastViewTime: now,
          });

          // 操作完成后，通过统一的actionEvents实例emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-view',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { record, viewMode: config.mode },
                result: {
                  success: true,
                  data: { record },
                },
              },
              context?.tableContext as TableContextValue,
              action || ({} as ActionConfig),
            );
          }

          console.debug(processMessage('plugin.viewRow.viewSuccess', tableMessages));
        } catch (error) {
          console.error(processMessage('plugin.viewRow.viewFailed', tableMessages, { error: String(error) }), error);

          context?.updateState?.({
            ...pluginState,
            loading: false,
          });

          // 操作失败后，也emit事件
          const actionEvents = context?.tableContext?.tableLogic?.actionEvents;
          if (actionEvents) {
            await actionEvents.emitAction(
              'table-row-view',
              {
                source: 'plugin',
                timestamp: Date.now(),
                payload: { record },
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
      render: (record, context, action) => {
        return <ViewRowComponent record={record} context={context} action={action} processMessage={context?.processMessage} />;
      },
    },
  ] as TablePluginRowAction[],

  // 插件初始化
  init: (context) => {
    // 初始化插件状态
    const initialState: ViewRowPluginState = {
      loading: false,
      viewingRecord: undefined,
      lastViewTime: undefined,
    };

    context?.updateState?.(initialState);
  },

  // 插件销毁
  destroy: (context) => {
    // 清理查看相关资源
    // 目前没有需要清理的资源
  },

  transformColumns: (columns, context) => {
    return columns;
  },
};

export default ViewRowPlugin;
