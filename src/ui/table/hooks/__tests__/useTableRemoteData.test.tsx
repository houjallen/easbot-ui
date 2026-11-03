/**
 * 表格远端数据 Hook 单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 状态测试 - 验证 Hook 返回值（data / loading / error / total）与表格状态的回写
 * 2. 交互测试 - 验证分页变化触发请求、refresh 复用上次查询条件、回调透传
 * 3. 异常测试 - 验证 fetcher 拒绝时错误信息回写与 loading 复位
 *
 * 测试载体说明：
 * 本文件使用**真实的 `TableProvider`** 渲染，确保「Hook 回写表格状态」这条链路
 * 在真实 Context 下成立 —— 这也顺带覆盖了回写副作用不得引发无限渲染的约束
 * （`TableProvider` 的 actions 每次 state 变化都会重建，若回写副作用把
 * `actions.xxx` 放进依赖数组，会形成死循环）。
 */

import { act, render, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import type { TableFetchParams, TableFetchResult, TableFetcher } from '../../store/tableDataSource';
import type { UseTableRemoteDataOptions, UseTableRemoteDataReturn } from '../useTableRemoteData';
import { useTableRemoteData } from '../useTableRemoteData';

/**
 * 创建受控的 Promise —— 用于构造「请求进行中」的中间态
 */
const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/**
 * 测试用的表格状态快照 —— 供用例断言回写结果
 */
interface TableStateSnapshot {
  data: Array<Record<string, unknown>>;
  loading: boolean;
  error: string | null;
  pagination: { pageNo?: number; pageSize?: number; total?: number };
}

/**
 * 测试载体 —— 在真实 TableProvider 上下文中消费远端数据
 */
const RemoteDataProbe = ({
  options,
  onReady,
  controlRef,
}: {
  options: UseTableRemoteDataOptions;
  onReady: (remote: UseTableRemoteDataReturn, snapshot: TableStateSnapshot) => void;
  /** 测试控制句柄 —— 供用例模拟分页变化 */
  controlRef: MutableRefObject<{ changePage: (pageNo: number) => void } | null>;
}) => {
  const context = useTableContext();

  const remote = useTableRemoteData(context, options);

  onReady(remote, {
    data: context.state.data,
    loading: context.state.loading,
    error: context.state.error,
    pagination: context.state.pagination,
  });

  // 暴露分页变更能力 —— 模拟消费方点击分页器
  const actionsRef = useRef(context.actions);
  actionsRef.current = context.actions;
  controlRef.current = {
    changePage: (pageNo: number) => {
      actionsRef.current.updatePagination({ pageNo });
    },
  };

  return null;
};

/**
 * 渲染测试载体
 */
const renderRemoteData = (options: UseTableRemoteDataOptions) => {
  const latest: { remote?: UseTableRemoteDataReturn; snapshot?: TableStateSnapshot } = {};
  const controlRef: MutableRefObject<{ changePage: (pageNo: number) => void } | null> = { current: null };

  const utils = render(
    <TableProvider data={[]} columns={[]}>
      <RemoteDataProbe
        options={options}
        controlRef={controlRef}
        onReady={(remote, snapshot) => {
          latest.remote = remote;
          latest.snapshot = snapshot;
        }}
      />
    </TableProvider>,
  );

  return { ...utils, latest, controlRef };
};

describe('表格远端数据 Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // 状态测试
  describe('状态测试', () => {
    it('应该在初始状态下返回空数据与零总数', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      const { latest } = renderRemoteData({ fetcher, autoLoad: false });

      expect(latest.remote?.data).toEqual([]);
      expect(latest.remote?.total).toBe(0);
      expect(latest.remote?.error).toBeNull();
      expect(latest.remote?.loading).toBe(false);
    });

    it('应该在响应返回后把数据回写到表格状态', async () => {
      const list = [{ id: 1, name: '甲' }];
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list, total: 1 });
      const { latest } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(latest.remote?.data).toEqual(list);
      });

      expect(latest.snapshot?.data).toEqual(list);
    });

    it('应该把响应的total回写到分页状态', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [{ id: 1 }], total: 128 });
      const { latest } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(latest.snapshot?.pagination.total).toBe(128);
      });

      expect(latest.remote?.total).toBe(128);
    });

    it('应该在请求进行中把loading置为true', async () => {
      const deferred = createDeferred<TableFetchResult>();
      const fetcher = vi.fn<TableFetcher>().mockReturnValue(deferred.promise);
      const { latest } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(latest.remote?.loading).toBe(true);
      });

      expect(latest.snapshot?.loading).toBe(true);

      await act(async () => {
        deferred.resolve({ list: [], total: 0 });
        await deferred.promise;
      });

      await waitFor(() => {
        expect(latest.remote?.loading).toBe(false);
      });

      expect(latest.snapshot?.loading).toBe(false);
    });

    it('应该在autoLoad关闭时不发起初始请求', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      renderRemoteData({ fetcher, autoLoad: false });

      await act(async () => {
        await Promise.resolve();
      });

      expect(fetcher).not.toHaveBeenCalled();
    });

    it('应该在autoLoad开启时发起初始请求', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      renderRemoteData({ fetcher, autoLoad: true });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      const [params] = fetcher.mock.calls[0] ?? [];
      expect(params?.pageNo).toBe(1);
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该在分页参数变化后重新发起请求', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      const { controlRef } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      // 模拟分页页码变化 —— 触发防抖后的参数提交
      await act(async () => {
        controlRef.current?.changePage(2);
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(2);
      });

      const [params] = fetcher.mock.calls[1] ?? [];
      expect(params?.pageNo).toBe(2);
    });

    it('应该把请求参数透传给消费方注入的fetcher', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      const [params, context] = fetcher.mock.calls[0] ?? [];
      // 请求参数来自表格上下文的分页契约
      expect(params?.pageNo).toBe(1);
      expect(params?.pageSize).toBe(10);
      expect(context?.signal).toBeInstanceOf(AbortSignal);
    });

    it('应该在refresh时复用上次的查询条件重新请求', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      const { latest } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        await latest.remote?.refresh();
      });

      expect(fetcher).toHaveBeenCalledTimes(2);
      const [params] = fetcher.mock.calls[1] ?? [];
      expect(params?.pageNo).toBe(1);
    });

    it('应该在请求成功时触发onSuccess回调', async () => {
      const onSuccess = vi.fn();
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [{ id: 1 }], total: 1 });
      renderRemoteData({ fetcher, onSuccess });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });

      const [result, params] = onSuccess.mock.calls[0] ?? [];
      expect(result).toEqual({ list: [{ id: 1 }], total: 1 });
      expect(params?.pageNo).toBe(1);
    });

    it('应该暴露submitParams以手动触发一次参数提交', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      const { latest } = renderRemoteData({ fetcher, autoLoad: false });

      expect(fetcher).not.toHaveBeenCalled();

      await act(async () => {
        await latest.remote?.submitParams();
      });

      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  // 异常测试
  describe('异常测试', () => {
    it('应该在fetcher拒绝时把错误信息回写到表格状态', async () => {
      const fetcher = vi.fn<TableFetcher>().mockRejectedValue(new Error('接口异常'));
      const { latest } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(latest.remote?.error).toBe('接口异常');
      });

      expect(latest.snapshot?.error).toBe('接口异常');
    });

    it('应该在fetcher拒绝后结束加载状态', async () => {
      const fetcher = vi.fn<TableFetcher>().mockRejectedValue(new Error('接口异常'));
      const { latest } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(latest.remote?.error).toBe('接口异常');
      });

      expect(latest.remote?.loading).toBe(false);
      expect(latest.snapshot?.loading).toBe(false);
    });

    it('应该在fetcher拒绝时触发onError回调', async () => {
      const onError = vi.fn();
      const fetcher = vi.fn<TableFetcher>().mockRejectedValue(new Error('网络超时'));
      renderRemoteData({ fetcher, onError });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(1);
      });

      const [error, params] = onError.mock.calls[0] ?? [];
      expect(error?.message).toBe('网络超时');
      expect(params?.pageNo).toBe(1);
    });

    it('应该在fetcher拒绝后保留原有的空数据', async () => {
      const fetcher = vi.fn<TableFetcher>().mockRejectedValue(new Error('接口异常'));
      const { latest } = renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(latest.remote?.error).toBe('接口异常');
      });

      expect(latest.remote?.data).toEqual([]);
      expect(latest.snapshot?.data).toEqual([]);
    });
  });

  // 契约测试
  describe('契约测试', () => {
    it('应该在发起请求时把分页契约转换为请求参数', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      renderRemoteData({ fetcher });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      const [params] = fetcher.mock.calls[0] ?? [];
      const fetchParams: Partial<TableFetchParams> = params ?? {};
      expect(fetchParams).not.toHaveProperty('list');
      expect(fetchParams).not.toHaveProperty('total');
      expect(fetchParams).not.toHaveProperty('fields');
      expect(fetchParams).not.toHaveProperty('context');
    });
  });
});
