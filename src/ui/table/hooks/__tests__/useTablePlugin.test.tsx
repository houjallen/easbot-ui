/**
 * useTablePlugin Hook 单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Hook 返回的插件注册表、状态表与查询能力
 * 2. 状态测试 - 验证注册 / 注销 / 依赖 / 启用开关等插件生命周期行为
 * 3. 交互测试 - 验证按位置取渲染项、执行动作、配置更新与钩子执行
 * 4. 无障碍测试 - 验证动作显隐条件与插件标准文案（可访问名称来源）
 *
 * 测试载体说明：
 * `useTablePlugin` 以 `TableContextValue` 作为第一个入参（不是独立 Hook），
 * 因此在真实 `TableProvider` 下用探针组件消费，并把返回值透出。
 *
 * 关键约束：
 * - 插件注册 **受 `config.pluginable` 门控**：`pluginable` 为 false 时
 *   `registerPlugin` 不做任何事，`getRendersByPosition` 恒返回空数组。
 * - 插件列表为空时回退到内置默认插件列表（不含 `moveRow`）。
 */

import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import type { TableContextValue } from '../../context/TableContext';
import type { TableColumn, TablePlugin } from '../../types';
import type { UseTablePluginReturn } from '../../types/hooks';
import { useTablePlugin } from '../useTablePlugin';

/**
 * 测试列
 */
const sampleColumns: TableColumn[] = [
  { name: 'name', title: '名称', dataIndex: 'name' },
  { name: 'status', title: '状态', dataIndex: 'status' },
];

/**
 * 测试数据
 */
const sampleData = [
  { id: '1', name: '张三', status: 'active' },
  { id: '2', name: '李四', status: 'inactive' },
];

/**
 * 探针组件 —— 在真实 TableProvider 上下文中消费插件 Hook
 */
const PluginProbe = ({ plugins, config, onReady }: { plugins?: TablePlugin[]; config?: Record<string, any>; onReady: (value: UseTablePluginReturn, context: TableContextValue) => void }) => {
  const context = useTableContext();

  // 插件上下文 —— 仅需带上表格上下文即可
  const pluginContext = { tableContext: context };

  const value = useTablePlugin(context, {
    plugins,
    context: pluginContext,
    config,
  });

  onReady(value, context);

  return null;
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderPlugin = ({ plugins, pluginConfig, tableConfig }: { plugins?: TablePlugin[]; pluginConfig?: Record<string, any>; tableConfig?: Record<string, unknown> } = {}) => {
  const latest: { value?: UseTablePluginReturn; context?: TableContextValue } = {};

  const utils = render(
    <TableProvider data={sampleData} columns={sampleColumns} config={{ pluginable: true, ...(tableConfig ?? {}) } as never}>
      <PluginProbe
        plugins={plugins}
        config={pluginConfig}
        onReady={(value, context) => {
          latest.value = value;
          latest.context = context;
        }}
      />
    </TableProvider>,
  );

  return { ...utils, latest };
};

/**
 * 创建一个最小可用的自定义插件
 */
const createTestPlugin = (overrides: Partial<TablePlugin> = {}): TablePlugin => ({
  id: 'test-plugin',
  name: 'test-plugin',
  type: 'action',
  positionType: 'table',
  defaultState: { count: 0 },
  actions: [
    {
      key: 'test-action',
      label: '测试动作',
      position: ['toolbar.right'],
      priority: 10,
    },
  ],
  init: (context) => {
    context?.updateState?.({ count: 1 });
  },
  ...overrides,
});

describe('useTablePlugin Hook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('渲染测试', () => {
    it('应该暴露插件注册与管理的完整能力', () => {
      const { latest } = renderPlugin({ plugins: [] });

      expect(typeof latest.value?.registerPlugin).toBe('function');
      expect(typeof latest.value?.unregisterPlugin).toBe('function');
      expect(typeof latest.value?.getPlugin).toBe('function');
      expect(typeof latest.value?.isPluginRegistered).toBe('function');
      expect(typeof latest.value?.togglePlugin).toBe('function');
      expect(typeof latest.value?.getPluginState).toBe('function');
      expect(typeof latest.value?.updatePluginState).toBe('function');
      expect(typeof latest.value?.getPluginConfig).toBe('function');
      expect(typeof latest.value?.updatePluginConfig).toBe('function');
      expect(typeof latest.value?.executeHook).toBe('function');
      expect(typeof latest.value?.transformData).toBe('function');
      expect(typeof latest.value?.transformColumns).toBe('function');
      expect(typeof latest.value?.getRendersByPosition).toBe('function');
      expect(typeof latest.value?.getAllActions).toBe('function');
      expect(typeof latest.value?.getPluginActions).toBe('function');
      expect(typeof latest.value?.executeAction).toBe('function');
      expect(typeof latest.value?.getPluginStandardMessage).toBe('function');
    });

    it('应该返回插件状态表与已注册插件列表', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      expect(latest.value?.pluginStates).toBeTypeOf('object');
      expect(latest.value?.registeredPlugins?.map((plugin) => plugin.id)).toContain('test-plugin');
    });

    it('应该在插件列表为空时回退到内置默认插件列表', () => {
      const { latest } = renderPlugin({ plugins: [] });

      const registeredIds = latest.value?.registeredPlugins?.map((plugin) => plugin.id) ?? [];

      expect(registeredIds).toContain('refresh');
      expect(registeredIds).toContain('export');
      expect(registeredIds).toContain('print');
      // moveRow 插件功能未实现，默认列表不包含它
      expect(registeredIds).not.toContain('moveRow');
    });

    it('应该在插件功能关闭时不注册任何插件', () => {
      const latest: { value?: UseTablePluginReturn } = {};

      render(
        <TableProvider data={sampleData} columns={sampleColumns} config={{ pluginable: false } as never}>
          <PluginProbe
            plugins={[createTestPlugin()]}
            onReady={(value) => {
              latest.value = value;
            }}
          />
        </TableProvider>,
      );

      expect(latest.value?.registeredPlugins).toHaveLength(0);
      expect(latest.value?.isPluginRegistered('test-plugin')).toBe(false);
    });
  });

  describe('状态测试', () => {
    it('应该在注册插件时调用其 init 并写入插件状态', () => {
      const init = vi.fn((context: any) => {
        context?.updateState?.({ count: 7 });
      });
      const { latest } = renderPlugin({ plugins: [createTestPlugin({ init })] });

      expect(init).toHaveBeenCalledTimes(1);
      expect(latest.value?.getPluginState('test-plugin')).toEqual(expect.objectContaining({ count: 7 }));
    });

    it('应该在重复注册同一插件时跳过初始化', () => {
      const init = vi.fn();
      const plugin = createTestPlugin({ init });
      const { latest } = renderPlugin({ plugins: [plugin] });

      expect(init).toHaveBeenCalledTimes(1);

      act(() => {
        latest.value?.registerPlugin(plugin);
      });

      expect(init).toHaveBeenCalledTimes(1);
    });

    it('应该在插件配置 enable 为 false 时放弃注册', () => {
      const init = vi.fn();
      const { latest } = renderPlugin({ plugins: [createTestPlugin({ init, config: { enable: false } })] });

      expect(init).not.toHaveBeenCalled();
      expect(latest.value?.isPluginRegistered('test-plugin')).toBe(false);
    });

    it('应该在缺少依赖插件时放弃注册', () => {
      const init = vi.fn();
      const { latest } = renderPlugin({ plugins: [createTestPlugin({ init, dependencies: ['missing-plugin'] })] });

      expect(init).not.toHaveBeenCalled();
      expect(latest.value?.isPluginRegistered('test-plugin')).toBe(false);
    });

    it('应该在注销插件时调用其 destroy 并移除注册', () => {
      const destroy = vi.fn();
      const { latest } = renderPlugin({ plugins: [createTestPlugin({ destroy })] });

      expect(latest.value?.isPluginRegistered('test-plugin')).toBe(true);

      act(() => {
        latest.value?.unregisterPlugin('test-plugin');
      });

      expect(destroy).toHaveBeenCalledTimes(1);
      expect(latest.value?.isPluginRegistered('test-plugin')).toBe(false);
      expect(latest.value?.getPlugin('test-plugin')).toBeUndefined();
    });

    it('应该在注销插件后清理插件状态', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      expect(latest.value?.getPluginState('test-plugin')).toEqual(expect.objectContaining({ count: 1 }));

      act(() => {
        latest.value?.unregisterPlugin('test-plugin');
      });

      // 注销走 `clearPluginState` action，插件状态必须被真正清空
      expect(latest.value?.getPluginState('test-plugin')).toBeUndefined();
    });

    it('应该在更新插件状态后可以读回最新值', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      act(() => {
        latest.value?.updatePluginState('test-plugin', { count: 42 });
      });

      expect(latest.value?.getPluginState('test-plugin')).toEqual(expect.objectContaining({ count: 42 }));
    });

    it('应该在插件功能关闭时忽略注册请求', () => {
      const init = vi.fn();
      const latest: { value?: UseTablePluginReturn } = {};

      render(
        <TableProvider data={sampleData} columns={sampleColumns} config={{ pluginable: false } as never}>
          <PluginProbe
            plugins={[]}
            onReady={(value) => {
              latest.value = value;
            }}
          />
        </TableProvider>,
      );

      act(() => {
        latest.value?.registerPlugin(createTestPlugin({ init }));
      });

      expect(init).not.toHaveBeenCalled();
      expect(latest.value?.isPluginRegistered('test-plugin')).toBe(false);
    });
  });

  describe('交互测试', () => {
    it('应该按位置返回插件的渲染项并带上 pluginId', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      const renders = latest.value?.getRendersByPosition('toolbar.right') ?? [];

      expect(renders).toHaveLength(1);
      expect(renders[0]?.key).toBe('test-action');
      expect(renders[0]?.pluginId).toBe('test-plugin');
    });

    it('应该在位置不匹配时返回空的渲染项列表', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      expect(latest.value?.getRendersByPosition('row.actions')).toEqual([]);
    });

    it('应该在插件功能关闭时返回空的渲染项列表', () => {
      const latest: { value?: UseTablePluginReturn } = {};

      render(
        <TableProvider data={sampleData} columns={sampleColumns} config={{ pluginable: false } as never}>
          <PluginProbe
            plugins={[createTestPlugin()]}
            onReady={(value) => {
              latest.value = value;
            }}
          />
        </TableProvider>,
      );

      expect(latest.value?.getRendersByPosition('toolbar.right')).toEqual([]);
    });

    it('应该执行插件动作的 execute 实现', async () => {
      const execute = vi.fn();
      const { latest } = renderPlugin({
        plugins: [
          createTestPlugin({
            actions: [{ key: 'test-action', label: '测试动作', position: ['toolbar.right'], execute }],
          }),
        ],
      });

      await act(async () => {
        await latest.value?.executeAction('test-action');
      });

      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('应该在动作没有 execute 时回退到 onClick', async () => {
      const onClick = vi.fn();
      const { latest } = renderPlugin({
        plugins: [
          createTestPlugin({
            actions: [{ key: 'test-action', label: '测试动作', position: ['toolbar.right'], onClick }],
          }),
        ],
      });

      await act(async () => {
        await latest.value?.executeAction('test-action');
      });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('应该在动作不存在时不抛出异常', async () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      await act(async () => {
        await latest.value?.executeAction('not-exist-action');
      });

      expect(latest.value?.isPluginRegistered('test-plugin')).toBe(true);
    });

    it('应该返回全部动作与指定插件的动作', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      const allActions = latest.value?.getAllActions() ?? [];
      expect(allActions).toHaveLength(1);
      expect(allActions[0]?.pluginId).toBe('test-plugin');

      const pluginActions = latest.value?.getPluginActions('test-plugin') ?? [];
      expect(pluginActions).toHaveLength(1);
      expect(pluginActions[0]?.key).toBe('test-action');
    });

    it('应该在切换插件启用状态后更新插件配置', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      act(() => {
        latest.value?.togglePlugin('test-plugin', false);
      });

      expect(latest.value?.getPluginConfig('test-plugin')).toEqual(expect.objectContaining({ enable: false }));
    });

    it('应该在更新插件配置后合并到已有配置', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin({ config: { size: 'sm' } })] });

      act(() => {
        latest.value?.updatePluginConfig('test-plugin', { level: 'high' });
      });

      const pluginConfig = latest.value?.getPluginConfig('test-plugin');
      expect(pluginConfig).toEqual(expect.objectContaining({ size: 'sm', level: 'high' }));
    });

    it('应该在执行钩子时原样返回传入的参数', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      expect(latest.value?.executeHook('onReady', 1, 'two')).toEqual([1, 'two']);
    });

    it('应该原样返回数据与列的转换结果', () => {
      const { latest } = renderPlugin({ plugins: [createTestPlugin()] });

      expect(latest.value?.transformData(sampleData)).toEqual(sampleData);
      expect(latest.value?.transformColumns(sampleColumns)).toEqual(sampleColumns);
    });
  });

  describe('无障碍测试', () => {
    it('应该在动作显隐条件不满足时从渲染项中剔除该动作', () => {
      const { latest } = renderPlugin({
        plugins: [
          createTestPlugin({
            actions: [
              {
                key: 'test-action',
                label: '测试动作',
                position: ['toolbar.right'],
                when: () => false,
              },
            ],
          }),
        ],
      });

      expect(latest.value?.getRendersByPosition('toolbar.right')).toEqual([]);
    });

    it('应该在动作显隐条件满足时保留该动作', () => {
      const { latest } = renderPlugin({
        plugins: [
          createTestPlugin({
            actions: [
              {
                key: 'test-action',
                label: '测试动作',
                position: ['toolbar.right'],
                when: () => true,
              },
            ],
          }),
        ],
      });

      expect(latest.value?.getRendersByPosition('toolbar.right')).toHaveLength(1);
    });

    it('应该返回插件的标准文案供可访问名称使用', () => {
      const { latest } = renderPlugin({
        plugins: [
          createTestPlugin({
            messages: {
              'zh-CN': { title: '测试插件', description: '测试插件描述' },
              'en-US': { title: 'Test Plugin' },
            },
          }),
        ],
      });

      expect(latest.value?.getPluginStandardMessage('test-plugin', 'title')).toBe('测试插件');
      expect(latest.value?.getPluginStandardMessage('test-plugin', 'title', 'en-US')).toBe('Test Plugin');
      expect(latest.value?.getPluginStandardMessage('test-plugin', 'notExistKey')).toBeUndefined();
    });
  });
});
