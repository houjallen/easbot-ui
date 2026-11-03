/**
 * 表格远端数据源单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 状态测试 - 验证初始状态快照与 fetch 后的四态回写（data / loading / error / total）
 * 2. 交互测试 - 验证 fetch / reload / setData / setTotal / subscribe / destroy 的行为
 * 3. 异常测试 - 验证请求失败的错误回写与过期响应的丢弃（竞态保护）
 * 4. 契约测试 - 验证 `toFetchParams` 剔除响应侧字段
 *
 * 说明：`createTableDataSource` 是框架无关的纯数据容器，
 * 因此本文件不依赖 React，直接以纯函数方式驱动。
 */

import { describe, expect, it, vi } from 'vitest';

import type { DataStorePage } from '../../../../models/index';
import type { TableFetchParams, TableFetchResult, TableFetcher } from '../tableDataSource';
import { createTableDataSource, toFetchParams } from '../tableDataSource';

/**
 * 创建受控的 Promise —— 用于模拟「慢请求后返回」的竞态场景
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

describe('表格远端数据源', () => {
  // 状态测试
  describe('状态测试', () => {
    it('应该在初始状态下返回空数据与非加载状态', () => {
      const fetcher = vi.fn<TableFetcher>();
      const dataSource = createTableDataSource({ fetcher });

      const state = dataSource.getState();

      expect(state.data).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.total).toBe(0);
      expect(state.pageNo).toBe(1);
      expect(state.pageSize).toBe(10);
    });

    it('应该允许配置默认每页条数与初始总条数', () => {
      const fetcher = vi.fn<TableFetcher>();
      const dataSource = createTableDataSource({ fetcher, defaultPageSize: 20, defaultTotal: 100 });

      const state = dataSource.getState();

      expect(state.pageSize).toBe(20);
      expect(state.total).toBe(100);
    });

    it('应该在fetch成功后回写数据与总条数', async () => {
      const list = [{ id: 1, name: '甲' }];
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list, total: 42 });
      const dataSource = createTableDataSource({ fetcher });

      const result = await dataSource.fetch({ pageNo: 1, pageSize: 10 });

      const state = dataSource.getState();
      expect(result).toEqual({ list, total: 42 });
      expect(state.data).toEqual(list);
      expect(state.total).toBe(42);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('应该在请求进行中把loading置为true', async () => {
      const deferred = createDeferred<TableFetchResult>();
      const fetcher = vi.fn<TableFetcher>().mockReturnValue(deferred.promise);
      const dataSource = createTableDataSource({ fetcher });

      const pending = dataSource.fetch({ pageNo: 1 });

      expect(dataSource.getState().loading).toBe(true);

      deferred.resolve({ list: [], total: 0 });
      await pending;

      expect(dataSource.getState().loading).toBe(false);
    });

    it('应该在fetch失败后回写错误信息并结束加载', async () => {
      const fetcher = vi.fn<TableFetcher>().mockRejectedValue(new Error('接口超时'));
      const dataSource = createTableDataSource({ fetcher });

      const result = await dataSource.fetch({ pageNo: 1 });

      const state = dataSource.getState();
      expect(result).toBeNull();
      expect(state.error).toBe('接口超时');
      expect(state.loading).toBe(false);
    });

    it('应该把非Error类型的异常转换为Error后回写', async () => {
      const fetcher = vi.fn<TableFetcher>().mockRejectedValue('字符串错误');
      const dataSource = createTableDataSource({ fetcher });

      await dataSource.fetch({ pageNo: 1 });

      expect(dataSource.getState().error).toBe('字符串错误');
    });

    it('应该在响应未携带total时保留原有总条数', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [{ id: 1 }] });
      const dataSource = createTableDataSource({ fetcher, defaultTotal: 7 });

      await dataSource.fetch({ pageNo: 1 });

      expect(dataSource.getState().total).toBe(7);
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应该把请求参数透传给fetcher', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      const dataSource = createTableDataSource({ fetcher });

      await dataSource.fetch({ pageNo: 3, pageSize: 25 });

      expect(fetcher).toHaveBeenCalledTimes(1);
      const [params] = fetcher.mock.calls[0] ?? [];
      expect(params?.pageNo).toBe(3);
      expect(params?.pageSize).toBe(25);
    });

    it('应该在未指定页码时沿用当前状态', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      const dataSource = createTableDataSource({ fetcher });

      await dataSource.fetch({ pageNo: 5, pageSize: 10 });
      await dataSource.fetch({});

      const [params] = fetcher.mock.calls[1] ?? [];
      expect(params?.pageNo).toBe(5);
      expect(params?.pageSize).toBe(10);
    });

    it('应该在请求成功时触发onSuccess回调', async () => {
      const onSuccess = vi.fn();
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [{ id: 1 }], total: 1 });
      const dataSource = createTableDataSource({ fetcher, onSuccess });

      await dataSource.fetch({ pageNo: 2 });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess.mock.calls[0]?.[0]).toEqual({ list: [{ id: 1 }], total: 1 });
      expect(onSuccess.mock.calls[0]?.[1]?.pageNo).toBe(2);
    });

    it('应该在请求失败时触发onError回调', async () => {
      const onError = vi.fn();
      const fetcher = vi.fn<TableFetcher>().mockRejectedValue(new Error('请求失败'));
      const dataSource = createTableDataSource({ fetcher, onError });

      await dataSource.fetch({ pageNo: 1 });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0]?.[0]?.message).toBe('请求失败');
    });

    it('应该在reload时复用上次的查询条件', async () => {
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [], total: 0 });
      const dataSource = createTableDataSource({ fetcher });

      await dataSource.fetch({ pageNo: 4, pageSize: 15 });
      await dataSource.reload();

      expect(fetcher).toHaveBeenCalledTimes(2);
      const [params] = fetcher.mock.calls[1] ?? [];
      expect(params?.pageNo).toBe(4);
      expect(params?.pageSize).toBe(15);
    });

    it('应该在setData后仅更新本地数据', async () => {
      const fetcher = vi.fn<TableFetcher>();
      const dataSource = createTableDataSource({ fetcher });

      dataSource.setData([{ id: 9 }]);

      expect(dataSource.getState().data).toEqual([{ id: 9 }]);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('应该在setTotal后仅更新总条数', async () => {
      const fetcher = vi.fn<TableFetcher>();
      const dataSource = createTableDataSource({ fetcher });

      dataSource.setTotal(88);

      expect(dataSource.getState().total).toBe(88);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('应该向订阅者推送状态变更', async () => {
      const listener = vi.fn();
      const fetcher = vi.fn<TableFetcher>().mockResolvedValue({ list: [{ id: 1 }], total: 3 });
      const dataSource = createTableDataSource({ fetcher });

      dataSource.subscribe(listener);
      await dataSource.fetch({ pageNo: 1 });

      expect(listener).toHaveBeenCalled();
      const lastState = listener.mock.calls[listener.mock.calls.length - 1]?.[0];
      expect(lastState?.data).toEqual([{ id: 1 }]);
      expect(lastState?.total).toBe(3);
    });

    it('应该在取消订阅后不再推送状态变更', () => {
      const listener = vi.fn();
      const dataSource = createTableDataSource({ fetcher: vi.fn<TableFetcher>() });

      const unsubscribe = dataSource.subscribe(listener);
      dataSource.setData([{ id: 1 }]);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      dataSource.setData([{ id: 2 }]);

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  // 异常测试
  describe('异常测试', () => {
    it('应该在后发请求先返回时丢弃先发请求的过期响应', async () => {
      const first = createDeferred<TableFetchResult>();
      const second = createDeferred<TableFetchResult>();
      const fetcher = vi.fn<TableFetcher>().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const dataSource = createTableDataSource({ fetcher });

      const firstPending = dataSource.fetch({ pageNo: 1 });
      const secondPending = dataSource.fetch({ pageNo: 2 });

      // 后发请求先返回
      second.resolve({ list: [{ id: 'new' }], total: 2 });
      await secondPending;

      // 先发请求后返回 —— 过期响应必须被丢弃
      first.resolve({ list: [{ id: 'old' }], total: 1 });
      const firstResult = await firstPending;

      const state = dataSource.getState();
      expect(firstResult).toBeNull();
      expect(state.data).toEqual([{ id: 'new' }]);
      expect(state.total).toBe(2);
    });

    it('应该在第二次请求时中止第一次在途请求', async () => {
      const first = createDeferred<TableFetchResult>();
      const second = createDeferred<TableFetchResult>();
      const fetcher = vi.fn<TableFetcher>().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const dataSource = createTableDataSource({ fetcher });

      const firstPending = dataSource.fetch({ pageNo: 1 });
      const firstSignal = fetcher.mock.calls[0]?.[1]?.signal;
      expect(firstSignal?.aborted).toBe(false);

      const secondPending = dataSource.fetch({ pageNo: 2 });

      expect(firstSignal?.aborted).toBe(true);
      const secondSignal = fetcher.mock.calls[1]?.[1]?.signal;
      expect(secondSignal?.aborted).toBe(false);

      second.resolve({ list: [], total: 0 });
      await secondPending;
      first.resolve({ list: [], total: 0 });
      await firstPending;
    });

    it('应该在被中止的请求抛错时不回写错误信息', async () => {
      const first = createDeferred<TableFetchResult>();
      const second = createDeferred<TableFetchResult>();
      const fetcher = vi.fn<TableFetcher>().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const dataSource = createTableDataSource({ fetcher });

      const firstPending = dataSource.fetch({ pageNo: 1 });
      const secondPending = dataSource.fetch({ pageNo: 2 });

      // 先发请求因被中止而失败 —— 不应污染 error 状态
      first.reject(new Error('AbortError'));
      await firstPending;

      expect(dataSource.getState().error).toBeNull();

      second.resolve({ list: [{ id: 1 }], total: 1 });
      await secondPending;

      expect(dataSource.getState().error).toBeNull();
      expect(dataSource.getState().data).toEqual([{ id: 1 }]);
    });

    it('应该在destroy后中止在途请求并清理监听器', async () => {
      const deferred = createDeferred<TableFetchResult>();
      const fetcher = vi.fn<TableFetcher>().mockReturnValue(deferred.promise);
      const listener = vi.fn();
      const dataSource = createTableDataSource({ fetcher });

      dataSource.subscribe(listener);
      const pending = dataSource.fetch({ pageNo: 1 });
      const signal = fetcher.mock.calls[0]?.[1]?.signal;

      dataSource.destroy();

      expect(signal?.aborted).toBe(true);

      deferred.resolve({ list: [{ id: 1 }], total: 1 });
      await pending;

      // 监听器已被清理，后续状态变更不再推送
      const callsAfterDestroy = listener.mock.calls.length;
      dataSource.setData([{ id: 2 }]);
      expect(listener.mock.calls.length).toBe(callsAfterDestroy);
    });
  });

  // 契约测试
  describe('契约测试', () => {
    it('应该把分页契约转换为请求参数并剔除响应侧字段', () => {
      const page: DataStorePage = {
        pageNo: 2,
        pageSize: 20,
        sorting: [{ field: 'name', order: 'asc' }],
        params: { keyword: '关键字' },
        // 以下为响应侧字段，不应出现在请求参数中
        total: 100,
        list: [{ id: 1 }],
        fields: [{ name: 'name' }],
        context: { traceId: 'abc' },
      };

      const params = toFetchParams(page);

      expect(params).toEqual({
        pageNo: 2,
        pageSize: 20,
        sorting: [{ field: 'name', order: 'asc' }],
        filter: undefined,
        params: { keyword: '关键字' },
      });
      expect(params).not.toHaveProperty('list');
      expect(params).not.toHaveProperty('total');
      expect(params).not.toHaveProperty('fields');
      expect(params).not.toHaveProperty('context');
    });

    it('应该在分页契约缺少可选字段时保持undefined', () => {
      const page: DataStorePage = { pageNo: 1, pageSize: 10 };

      const params: TableFetchParams = toFetchParams(page);

      expect(params.pageNo).toBe(1);
      expect(params.pageSize).toBe(10);
      expect(params.sorting).toBeUndefined();
      expect(params.filter).toBeUndefined();
      expect(params.params).toBeUndefined();
    });
  });
});
