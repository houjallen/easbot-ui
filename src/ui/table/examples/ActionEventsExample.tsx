/**
 * 表格Action事件系统使用示例
 * 展示如何在插件和业务组件中使用useTableActions hook
 */

import React, { useEffect } from 'react';
import type { TableContextValue } from '../context/TableContext';
import { useTableEventActions } from '../hooks/useTableEventActions';
import type { ActionEventData } from '../types';

/**
 * 示例1: 基础事件监听和发射
 */
export function BasicActionEventsExample({ tableContext }: { tableContext: TableContextValue }) {
  const { emitAction, onAction, offAction } = useTableEventActions(tableContext);

  useEffect(() => {
    // 监听编辑事件
    const unsubscribeEdit = onAction('table-row-edit', async (data, context, action) => {
      console.log('编辑事件触发:', data);

      // 模拟编辑操作
      if (data.record) {
        console.log('编辑记录:', data.record);

        // 可以在这里调用API、打开弹窗等
        // 返回操作结果
        return {
          success: true,
          message: '编辑成功',
          updatedRecord: { ...data.record, updated: true },
        };
      }

      return { success: false, message: '未找到要编辑的记录' };
    });

    // 监听删除事件
    const unsubscribeDelete = onAction('table-row-delete', async (data, context, action) => {
      console.log('删除事件触发:', data);

      if (data.record) {
        // 显示确认对话框
        const confirmed = window.confirm(`确定要删除记录 ${data.record.id} 吗？`);
        if (confirmed) {
          console.log('删除记录:', data.record);
          return { success: true, message: '删除成功' };
        } else {
          return { success: false, message: '用户取消删除' };
        }
      }

      return { success: false, message: '<UNK>' };
    });

    // 清理监听器
    return () => {
      unsubscribeEdit();
      unsubscribeDelete();
    };
  }, [onAction]);

  // 触发事件的示例函数
  const handleEditClick = async (record: any, rowIndex: number) => {
    const result = await emitAction(
      'table-row-edit',
      {
        record,
        rowIndex,
        source: 'user',
        timestamp: Date.now(),
      },
      {} as any,
      {} as any,
    );

    console.log('编辑事件执行结果:', result);
  };

  const handleDeleteClick = async (record: any, rowIndex: number) => {
    const result = await emitAction(
      'table-row-delete',
      {
        record,
        rowIndex,
        source: 'user',
        timestamp: Date.now(),
      },
      {} as any,
      {} as any,
    );

    console.log('删除事件执行结果:', result);
  };

  return (
    <div>
      <h3>基础Action事件示例</h3>
      <button type="button" onClick={() => handleEditClick({ id: 1, name: '测试记录' }, 0)}>
        触发编辑事件
      </button>
      <button type="button" onClick={() => handleDeleteClick({ id: 1, name: '测试记录' }, 0)}>
        触发删除事件
      </button>
    </div>
  );
}

/**
 * 示例2: 高级事件监听选项
 */
export function AdvancedActionEventsExample({ tableContext }: { tableContext: TableContextValue }) {
  const { onAction, emitAction } = useTableEventActions(tableContext);

  useEffect(() => {
    // 带条件检查的监听器
    const unsubscribeConditional = onAction(
      'table-row-edit',
      async (data, context, action) => {
        console.log('条件监听器触发:', data);
        return { success: true, message: '条件检查通过' };
      },
      {
        condition: (data, context, action) => {
          // 只处理特定条件的事件
          return data.record ? data.record.editable !== false : false;
        },
        priority: 1, // 高优先级
      },
    );

    // 防抖监听器
    const unsubscribeDebounced = onAction(
      'table-search',
      async (data, context, action) => {
        console.log('防抖搜索事件:', data);
        // 模拟搜索API调用
        return { success: true, results: [] };
      },
      {
        debounce: 300, // 300ms防抖
        priority: 0,
      },
    );

    // 一次性监听器
    const unsubscribeOnce = onAction(
      'table-init',
      async (data, context, action) => {
        console.log('表格初始化事件（只执行一次）:', data);
        return { success: true, message: '初始化完成' };
      },
      {
        once: true, // 只执行一次
      },
    );

    // 节流监听器
    const unsubscribeThrottled = onAction(
      'table-scroll',
      async (data, context, action) => {
        console.log('节流滚动事件:', data);
        return { success: true };
      },
      {
        throttle: 100, // 100ms节流
      },
    );

    return () => {
      unsubscribeConditional();
      unsubscribeDebounced();
      unsubscribeOnce();
      unsubscribeThrottled();
    };
  }, [onAction]);

  return (
    <div>
      <h3>高级Action事件示例</h3>
      <button type="button" onClick={() => emitAction('table-row-edit', { record: { id: 1, editable: true } }, {} as any, {} as any)}>
        触发可编辑记录事件
      </button>
      <button type="button" onClick={() => emitAction('table-row-edit', { record: { id: 2, editable: false } }, {} as any, {} as any)}>
        触发不可编辑记录事件（会被条件过滤）
      </button>
      <button type="button" onClick={() => emitAction('table-init', {}, {} as any, {} as any)}>
        触发初始化事件（一次性）
      </button>
    </div>
  );
}

/**
 * 示例3: 自定义插件中使用Action事件
 */
export function CustomPluginExample({ tableContext }: { tableContext: TableContextValue }) {
  const actionEvents = useTableEventActions(tableContext);

  // 模拟自定义插件
  const customPlugin = {
    name: 'CustomActionPlugin',

    // 插件初始化时注册事件监听器
    initialize: () => {
      // 监听批量操作事件
      const unsubscribeBatch = actionEvents.onAction(
        'table-batch-action',
        async (data: ActionEventData, context, action) => {
          console.log('批量操作事件:', data);

          if (data.selectedRows && data.selectedRows.length > 0) {
            const actionType = data.payload?.actionType;

            switch (actionType) {
              case 'delete':
                return await handleBatchDelete(data.selectedRows);
              case 'export':
                return await handleBatchExport(data.selectedRows);
              case 'update':
                return await handleBatchUpdate(data.selectedRows, data.payload?.updateData);
              default:
                return { success: false, message: '未知的批量操作类型' };
            }
          }

          return { success: false, message: '没有选中的记录' };
        },
        {
          priority: 0,
          condition: (data) => (data.selectedRows ? data.selectedRows.length > 0 : false),
        },
      );

      // 监听状态变更事件
      const unsubscribeStatus = actionEvents.onAction('table-status-change', async (data, context, action) => {
        console.log('状态变更事件:', data);

        // 更新记录状态
        if (data.record && data.payload?.newStatus) {
          const result = await updateRecordStatus(data.record.id, data.payload.newStatus);

          if (result.success) {
            // 刷新表格数据
            context.actions.updateItem(data.rowIndex!, result.updatedRecord);
          }

          return result;
        }

        return { success: false, message: '缺少必要参数' };
      });

      return () => {
        unsubscribeBatch();
        unsubscribeStatus();
      };
    },

    // 插件提供的方法
    triggerBatchAction: (actionType: string, selectedRows: any[], updateData?: any) => {
      return actionEvents.emitAction(
        'table-batch-action',
        {
          selectedRows,
          source: 'plugin',
          payload: { actionType, updateData },
          timestamp: Date.now(),
        },
        {} as any,
        {} as any,
      );
    },

    triggerStatusChange: (record: any, rowIndex: number, newStatus: string) => {
      return actionEvents.emitAction(
        'table-status-change',
        {
          record,
          rowIndex,
          source: 'plugin',
          payload: { newStatus },
          timestamp: Date.now(),
        },
        {} as any,
        {} as any,
      );
    },
  };

  // 模拟API调用函数
  async function handleBatchDelete(records: any[]) {
    console.log('批量删除:', records);
    // 模拟API调用
    return { success: true, message: `成功删除 ${records.length} 条记录` };
  }

  async function handleBatchExport(records: any[]) {
    console.log('批量导出:', records);
    // 模拟导出逻辑
    return { success: true, message: `成功导出 ${records.length} 条记录` };
  }

  async function handleBatchUpdate(records: any[], updateData: any) {
    console.log('批量更新:', records, updateData);
    // 模拟批量更新
    return { success: true, message: `成功更新 ${records.length} 条记录` };
  }

  async function updateRecordStatus(id: string, newStatus: string) {
    console.log('更新记录状态:', id, newStatus);
    // 模拟状态更新API
    return {
      success: true,
      message: '状态更新成功',
      updatedRecord: {
        id,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  useEffect(() => {
    const cleanup = customPlugin.initialize();
    return cleanup;
  }, [customPlugin.initialize]);

  return (
    <div>
      <h3>自定义插件Action事件示例</h3>
      <button
        type="button"
        onClick={() =>
          customPlugin.triggerBatchAction('delete', [
            { id: 1, name: '记录1' },
            { id: 2, name: '记录2' },
          ])
        }
      >
        触发批量删除
      </button>
      <button
        type="button"
        onClick={() =>
          customPlugin.triggerBatchAction('export', [
            { id: 1, name: '记录1' },
            { id: 2, name: '记录2' },
          ])
        }
      >
        触发批量导出
      </button>
      <button type="button" onClick={() => customPlugin.triggerStatusChange({ id: 1, name: '记录1', status: 'active' }, 0, 'inactive')}>
        触发状态变更
      </button>
    </div>
  );
}

/**
 * 示例4: 事件管理和调试
 */
export function EventManagementExample({ tableContext }: { tableContext: TableContextValue }) {
  const { onAction, offAction, offAllActions, getRegisteredActionKeys, hasActionListeners, getActionListenerCount } = useTableEventActions(tableContext);

  const [actionInfo, setActionInfo] = React.useState<any>({});

  // 注册一些示例监听器
  useEffect(() => {
    const listeners = [
      onAction('test-action-1', async () => ({ success: true })),
      onAction('test-action-1', async () => ({ success: true }), {
        priority: 1,
      }),
      onAction('test-action-2', async () => ({ success: true })),
      onAction('test-action-3', async () => ({ success: true }), {
        once: true,
      }),
    ];

    return () => {
      listeners.forEach((unsubscribe) => {
        unsubscribe();
      });
    };
  }, [onAction]);

  // 更新action信息
  const updateActionInfo = () => {
    const registeredActions = getRegisteredActionKeys();
    const info: any = {};

    Object.keys(registeredActions).forEach((actionKey) => {
      info[actionKey] = {
        hasListeners: hasActionListeners(actionKey),
        listenerCount: getActionListenerCount(actionKey),
        listenerDetails: registeredActions[actionKey],
      };
    });

    setActionInfo(info);
  };

  return (
    <div>
      <h3>事件管理和调试示例</h3>

      <div style={{ marginBottom: '16px' }}>
        <button type="button" onClick={updateActionInfo}>
          刷新Action信息
        </button>
        <button type="button" onClick={() => offAction('test-action-1')}>
          移除test-action-1的所有监听器
        </button>
        <button type="button" onClick={() => offAllActions()}>
          移除所有监听器
        </button>
      </div>

      <div>
        <h4>已注册的Action信息:</h4>
        <pre style={{ background: '#f5f5f5', padding: '8px', fontSize: '12px' }}>{JSON.stringify(actionInfo, null, 2)}</pre>
      </div>
    </div>
  );
}

/**
 * 完整示例组合
 */
export function ActionEventsExampleContainer({ tableContext }: { tableContext: TableContextValue }) {
  return (
    <div style={{ padding: '16px' }}>
      <h2>表格Action事件系统使用示例</h2>

      <div style={{ marginBottom: '32px' }}>
        <BasicActionEventsExample tableContext={tableContext} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <AdvancedActionEventsExample tableContext={tableContext} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <CustomPluginExample tableContext={tableContext} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <EventManagementExample tableContext={tableContext} />
      </div>
    </div>
  );
}

export default ActionEventsExampleContainer;
