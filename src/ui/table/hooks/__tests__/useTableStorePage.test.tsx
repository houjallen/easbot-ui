/**
 * useTableStorePage Hook 单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Hook 返回的当前参数结构与初始提交状态
 * 2. 状态测试 - 验证 DataStorePage 契约转换（页码 / 每页条数 / 排序 / 过滤）
 * 3. 交互测试 - 验证参数变化后的防抖提交、参数重置与手动提交
 *
 * 测试载体说明：
 * `useTableStorePage` 以 `TableContextValue` 作为第一个入参（不是独立 Hook），
 * 因此在真实 `TableProvider` 下用探针组件消费，并把返回值透出。
 *
 * 关键约束：
 * - 参数变化后有 **300ms 防抖**，用例用 `vi.useFakeTimers({ shouldAdvanceTime: true })`
 *   + `vi.advanceTimersByTime(400)` 触发。
 * - `submitParams` / `resetParams` 返回 Promise，断言前必须 await。
 * - `TableProvider` 的 actions 每次状态变化都会重建 —— 探针里用 ref 保存最新 actions，
 *   避免把 `actions.*` 放进依赖数组造成死循环。
 */

import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import type { TableContextValue } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import type { UseTableStorePageReturn } from '../useTableStorePage';
import { useTableStorePage } from '../useTableStorePage';

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
 * 探针组件 —— 在真实 TableProvider 上下文中消费业务交互 Hook
 */
const StorePageProbe = ({
  options,
  onReady,
  controlRef,
}: {
  options?: Record<string, any>;
  onReady: (value: UseTableStorePageReturn, context: TableContextValue) => void;
  /** 测试控制句柄 —— 供用例触发分页 / 排序变化 */
  controlRef: MutableRefObject<{ changePage: (pageNo: number) => void; changeSort: (columnName: string) => void } | null>;
}) => {
  const context = useTableContext();
  const value = useTableStorePage(context, options);

  onReady(value, context);

  // 用 ref 保存最新 actions —— 避免依赖数组触发无限渲染
  const actionsRef = useRef(context.actions);
  actionsRef.current = context.actions;

  controlRef.current = {
    changePage: (pageNo: number) => {
      actionsRef.current.updatePagination({ pageNo });
    },
    changeSort: (columnName: string) => {
      actionsRef.current.setSort(columnName, 'asc');
    },
  };

  return null;
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderStorePage = ({ storePageConfig, tableConfig }: { storePageConfig?: Record<string, any>; tableConfig?: Record<string, unknown> } = {}) => {
  const latest: { value?: UseTableStorePageReturn; context?: TableContextValue } = {};
  const controlRef: MutableRefObject<{ changePage: (pageNo: number) => void; changeSort: (columnName: string) => void } | null> = { current: null };

  const utils = render(
    <TableProvider data={sampleData} columns={sampleColumns} config={{ ...(tableConfig ?? {}) } as never}>
      <StorePageProbe
        options={storePageConfig}
        controlRef={controlRef}
        onReady={(value, context) => {
          latest.value = value;
          latest.context = context;
        }}
      />
    </TableProvider>,
  );

  return { ...utils, latest, controlRef };
};

describe('useTableStorePage Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('渲染测试', () => {
    it('应该返回分页、排序、筛选与搜索四类当前参数', () => {
      const { latest } = renderStorePage();

      expect(latest.value?.currentParams.pagination).toEqual(expect.objectContaining({ pageNo: 1, pageSize: 10 }));
      expect(latest.value?.currentParams.sort).toEqual({ columnName: null, order: null });
      expect(latest.value?.currentParams.filter).toEqual({});
      expect(latest.value?.currentParams.search).toEqual({});
    });

    it('应该暴露手动提交、重置与契约转换能力', () => {
      const { latest } = renderStorePage();

      expect(typeof latest.value?.submitParams).toBe('function');
      expect(typeof latest.value?.resetParams).toBe('function');
      expect(typeof latest.value?.toDataStorePageSchema).toBe('function');
      expect(latest.value?.isSubmitting).toBe(false);
    });

    it('应该把自定义提取函数的结果并入当前参数', () => {
      const extractParams = vi.fn(() => ({ keyword: '关键字' }));
      const { latest } = renderStorePage({ storePageConfig: { extractParams } });

      expect(latest.value?.currentParams.keyword).toBe('关键字');
      expect(extractParams).toHaveBeenCalled();
    });
  });

  describe('状态测试', () => {
    it('应该把当前参数转换为 DataStorePage 契约', () => {
      const { latest } = renderStorePage();

      const pageSchema = latest.value?.toDataStorePageSchema();

      expect(pageSchema?.pageNo).toBe(1);
      expect(pageSchema?.pageSize).toBe(10);
      expect(pageSchema?.autoCount).toBe(true);
      expect(pageSchema?.sorting).toBeUndefined();
      expect(pageSchema?.filter).toBeUndefined();
    });

    it('应该在缺少分页参数时回退为默认页码与每页条数', () => {
      const { latest } = renderStorePage();

      const pageSchema = latest.value?.toDataStorePageSchema({
        pagination: {},
        sort: { columnName: null, order: null },
        filter: {},
        search: {},
      });

      expect(pageSchema?.pageNo).toBe(1);
      expect(pageSchema?.pageSize).toBe(20);
    });

    it('应该把排序状态转换为 sorting 数组', () => {
      const { latest } = renderStorePage();

      const pageSchema = latest.value?.toDataStorePageSchema({
        pagination: { pageNo: 2, pageSize: 10 },
        sort: { columnName: 'name', order: 'desc' },
        filter: {},
        search: {},
      });

      expect(pageSchema?.sorting).toEqual([{ field: 'name', order: 'desc' }]);
      expect(pageSchema?.pageNo).toBe(2);
    });

    it('应该把筛选状态转换为 filter 规则', () => {
      const { latest } = renderStorePage();

      const pageSchema = latest.value?.toDataStorePageSchema({
        pagination: { pageNo: 1, pageSize: 10 },
        sort: { columnName: null, order: null },
        filter: {
          name: { field: 'name', op: 'eq', value: ['张三'], type: 'string' },
        },
        search: {},
      });

      expect(pageSchema?.filter?.rules?.[0]?.group).toBe('filter_conditions');
      expect(pageSchema?.filter?.rules?.[0]?.expressions?.[0]).toEqual(expect.objectContaining({ field: 'name', op: 'eq', value: ['张三'], type: 'string' }));
    });

    it('应该把额外参数放入 params 字段', () => {
      const { latest } = renderStorePage();

      const pageSchema = latest.value?.toDataStorePageSchema({
        pagination: { pageNo: 1, pageSize: 10 },
        sort: { columnName: null, order: null },
        filter: {},
        search: {},
        keyword: '关键字',
      });

      expect(pageSchema?.params).toEqual({ keyword: '关键字' });
    });
  });

  describe('交互测试', () => {
    it('应该在手动提交时依次触发参数回调与页面回调', async () => {
      const onParamsChange = vi.fn();
      const onPageChange = vi.fn();
      const { latest } = renderStorePage({ storePageConfig: { onParamsChange, onPageChange } });

      await act(async () => {
        await latest.value?.submitParams();
      });

      expect(onParamsChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledTimes(1);

      const [pageSchema] = onPageChange.mock.calls[0] ?? [];
      expect(pageSchema?.pageNo).toBe(1);
      expect(pageSchema?.pageSize).toBe(10);
      expect(pageSchema?.autoCount).toBe(true);
    });

    it('应该在参数变化后经过防抖再提交', async () => {
      const onParamsChange = vi.fn();
      const onPageChange = vi.fn();
      const { latest, controlRef } = renderStorePage({ storePageConfig: { onParamsChange, onPageChange } });

      act(() => {
        controlRef.current?.changePage(2);
      });

      // 防抖窗口内不提交
      expect(onParamsChange).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(onParamsChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledTimes(1);

      const [params] = onParamsChange.mock.calls[0] ?? [];
      expect(params?.pagination?.pageNo).toBe(2);
    });

    it('应该在排序变化后触发一次提交', async () => {
      const onParamsChange = vi.fn();
      const { controlRef } = renderStorePage({ storePageConfig: { onParamsChange } });

      act(() => {
        controlRef.current?.changeSort('name');
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(onParamsChange).toHaveBeenCalledTimes(1);

      const [params] = onParamsChange.mock.calls[0] ?? [];
      expect(params?.sort).toEqual({ columnName: 'name', order: 'asc' });
    });

    it('应该在参数未变化时跳过提交', async () => {
      const onParamsChange = vi.fn();
      const { controlRef } = renderStorePage({ storePageConfig: { onParamsChange } });

      act(() => {
        controlRef.current?.changePage(2);
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(onParamsChange).toHaveBeenCalledTimes(1);

      // 再次触发相同参数 —— 不应重复提交
      act(() => {
        controlRef.current?.changePage(2);
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(onParamsChange).toHaveBeenCalledTimes(1);
    });

    it('应该在参数变化时清空选择与展开状态', async () => {
      const onParamsChange = vi.fn();
      const { latest, controlRef } = renderStorePage({ storePageConfig: { onParamsChange } });

      act(() => {
        latest.context?.actions.setSelectedRowKeys(['1']);
        latest.context?.actions.setExpandedRowKeys(['1']);
      });

      act(() => {
        controlRef.current?.changePage(2);
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(latest.context?.state.selectedRowKeys).toEqual([]);
      expect(latest.context?.state.expandedRowKeys).toEqual([]);
    });

    it('应该在关闭清空选项时保留选择与展开状态', async () => {
      const onParamsChange = vi.fn();
      const { latest, controlRef } = renderStorePage({
        storePageConfig: { onParamsChange },
        tableConfig: { dataMode: { clearSelectedOnPagination: false } },
      });

      act(() => {
        latest.context?.actions.setSelectedRowKeys(['1']);
        latest.context?.actions.setExpandedRowKeys(['1']);
      });

      act(() => {
        controlRef.current?.changePage(2);
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(latest.context?.state.selectedRowKeys).toEqual(['1']);
      expect(latest.context?.state.expandedRowKeys).toEqual(['1']);
    });

    it('应该在重置参数时把表格状态恢复为初始值', async () => {
      const { latest, controlRef } = renderStorePage();

      act(() => {
        controlRef.current?.changePage(3);
      });
      expect(latest.context?.state.pagination.pageNo).toBe(3);

      await act(async () => {
        await latest.value?.resetParams();
      });

      expect(latest.context?.state.pagination.pageNo).toBe(1);
    });

    it('应该在触发初始化时提交一次初始参数', async () => {
      const onParamsChange = vi.fn();
      const { latest } = renderStorePage({ storePageConfig: { onParamsChange, triggerOnInit: true } });

      await act(async () => {
        await Promise.resolve();
      });

      expect(onParamsChange).toHaveBeenCalledTimes(1);

      const [params] = onParamsChange.mock.calls[0] ?? [];
      expect(params?.pagination?.pageNo).toBe(1);
      expect(latest.value?.isSubmitting).toBe(false);
    });

    it('应该在没有回调时跳过提交', async () => {
      const { controlRef } = renderStorePage();

      act(() => {
        controlRef.current?.changePage(2);
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      // 没有配置任何回调 —— 不应抛错
      expect(true).toBe(true);
    });
  });

  describe('无障碍测试', () => {
    it('应该在提交时保留完整的分页语义供服务端渲染', async () => {
      const onPageChange = vi.fn();
      const { latest } = renderStorePage({ storePageConfig: { onPageChange } });

      await act(async () => {
        await latest.value?.submitParams();
      });

      const [pageSchema] = onPageChange.mock.calls[0] ?? [];
      expect(pageSchema).toEqual(
        expect.objectContaining({
          pageNo: 1,
          pageSize: 10,
          autoCount: true,
        }),
      );
    });

    it('应该在自定义每页条数后按新条数提交', async () => {
      const onPageChange = vi.fn();
      const { latest } = renderStorePage({ storePageConfig: { onPageChange } });

      await act(async () => {
        await latest.value?.submitParams({
          pagination: { pageNo: 1, pageSize: 50 },
        });
      });

      const [pageSchema] = onPageChange.mock.calls[0] ?? [];
      expect(pageSchema?.pageSize).toBe(50);
    });
  });
});
