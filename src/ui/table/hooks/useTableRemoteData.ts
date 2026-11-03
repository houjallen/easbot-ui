import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DataStorePage } from '../../../models/index';
import type { TableContextValue } from '../context/TableContext';
import type { BusinessQueryParams } from '../types/base';
import type { TableFetchParams, TableFetchResult, TableFetcher } from '../store/tableDataSource';
import { createTableDataSource, toFetchParams } from '../store/tableDataSource';
import { useTableStorePage } from './useTableStorePage';

/**
 * 表格远端数据 —— 配置项
 */
export interface UseTableRemoteDataOptions {
  /** 请求发起函数（消费方注入，内部需把响应解包为 `{ list, total }`） */
  fetcher: TableFetcher;
  /** 默认每页条数，默认 10 */
  defaultPageSize?: number;
  /** 是否在初始化时自动请求，默认 true */
  autoLoad?: boolean;
  /** 请求失败回调（消费方通常在此接入 toast 提示） */
  onError?: (error: Error, params: TableFetchParams) => void;
  /** 请求成功回调 */
  onSuccess?: (result: TableFetchResult, params: TableFetchParams) => void;
}

/**
 * 表格远端数据 —— 返回值
 */
export interface UseTableRemoteDataReturn {
  /** 当前页数据（可直接喂给 `TableProvider` 的 `data`） */
  data: Array<Record<string, unknown>>;
  /** 加载态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 总条数（喂给分页器的 `total`） */
  total: number;
  /** 手动刷新（复用上次查询条件） */
  refresh: () => Promise<void>;
  /** 手动触发一次参数提交（复用当前查询条件） */
  submitParams: (customParams?: Partial<BusinessQueryParams>) => Promise<void>;
}

/**
 * 表格远端数据 Hook
 *
 * @description
 * 把 `useTableStorePage` 产出的分页契约接到消费方注入的 `fetcher`，
 * 并把响应回写到表格状态（`data` / `pagination.total` / `loading` / `error`）。
 *
 * 设计要点：
 * 1. **组件库不碰 HTTP** —— 请求由消费方通过 `fetcher` 注入，
 *    组件库只负责契约转换、竞态保护与状态回写。
 * 2. **total 必须回写** —— 否则分页器总数恒为 0，翻页不可用。
 * 3. **不覆盖消费方已有的 `storePage` 回调** —— 若消费方同时提供了
 *    `storePage.onPageChange`，两者都会执行（消费方回调先执行）。
 *
 * @param context 表格上下文
 * @param options 配置项
 * @returns 远端数据状态
 */
export function useTableRemoteData(context: TableContextValue, options: UseTableRemoteDataOptions): UseTableRemoteDataReturn {
  const { fetcher, defaultPageSize = 10, autoLoad = true, onError, onSuccess } = options;

  const [state, setState] = useState(() => ({
    data: [] as Array<Record<string, unknown>>,
    loading: false,
    error: null as string | null,
    total: 0,
  }));

  // 数据源实例 —— 只在 fetcher 变化时重建
  const dataSourceRef = useRef<ReturnType<typeof createTableDataSource> | null>(null);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  onErrorRef.current = onError;
  onSuccessRef.current = onSuccess;

  if (!dataSourceRef.current) {
    dataSourceRef.current = createTableDataSource({
      fetcher,
      defaultPageSize,
      onError: (error, params) => onErrorRef.current?.(error, params),
      onSuccess: (result, params) => onSuccessRef.current?.(result, params),
    });
  }

  // 订阅状态变更
  useEffect(() => {
    const dataSource = dataSourceRef.current;
    if (!dataSource) {
      return;
    }
    return dataSource.subscribe((next) => {
      setState({ data: next.data, loading: next.loading, error: next.error, total: next.total });
    });
  }, []);

  // 卸载时中止在途请求
  useEffect(() => {
    return () => {
      dataSourceRef.current?.destroy();
    };
  }, []);

  const { actions } = context;

  // `TableContext` 的 actions 用 `useMemo([state])` 记忆化 —— 每次 state 变化都会产出
  // 新的函数引用。若把 `actions.setData` 等放进回写副作用的依赖数组，会形成
  // 「state 变化 → actions 变化 → 副作用重跑 → dispatch → state 变化」的死循环。
  // 因此这里用 ref 持有最新 actions，副作用只依赖数据值本身。
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  // 响应回写到表格状态
  useEffect(() => {
    actionsRef.current.setData(state.data);
  }, [state.data]);

  useEffect(() => {
    actionsRef.current.setLoading(state.loading);
  }, [state.loading]);

  useEffect(() => {
    actionsRef.current.setError(state.error);
  }, [state.error]);

  // 总条数回写到分页状态 —— 保证分页器可用
  // 注意：`updatePagination` 内部 reducer 用 `deepMerge` 合并，传 `{ total }` 不会丢字段；
  // 但它的值比较守卫是「完整对象 vs 局部对象」，恒不相等，因此这里保持只传 total，
  // 避免因携带过期字段覆盖用户刚切换的分页状态。
  const total = state.total;
  useEffect(() => {
    actionsRef.current.updatePagination({ total });
  }, [total]);

  // 把契约参数接到数据源
  const handlePageChange = useCallback(async (page: DataStorePage) => {
    const dataSource = dataSourceRef.current;
    if (!dataSource) {
      return;
    }
    await dataSource.fetch(toFetchParams(page));
  }, []);

  const storePage = useTableStorePage(context, {
    onPageChange: handlePageChange,
    triggerOnInit: autoLoad,
  });

  const refresh = useCallback(async () => {
    await dataSourceRef.current?.reload();
  }, []);

  return useMemo(
    () => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      total: state.total,
      refresh,
      /** 手动触发一次参数提交（复用当前查询条件） */
      submitParams: storePage.submitParams,
    }),
    [state.data, state.loading, state.error, state.total, refresh, storePage.submitParams],
  );
}
