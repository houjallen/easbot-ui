/**
 * 表格分页逻辑Hook - 统一分页功能
 * 整合TableContext的分页状态管理，提供完整的分页功能
 */

import { useCallback, useMemo } from 'react';
import type { TableContextValue } from '../context/TableContext';
import type { PaginationConfig, PaginationState } from '../types';
import { applyTablePagination } from '../utils/businessUtils';

export interface UseTablePaginationLogicOptions {
  /** 默认分页配置 */
  defaultPaginationConfig?: Partial<PaginationConfig>;
}

export interface UseTablePaginationLogicReturn {
  /** 当前分页状态 */
  pagination: PaginationState;
  /** 分页配置 */
  paginationConfig: PaginationConfig;
  /** 设置当前页 */
  setPageNo: (pageNo: number) => void;
  /** 设置每页条数 */
  setPageSize: (pageSize: number) => void;
  /** 设置总数 */
  setTotal: (total: number) => void;
  /** 设置分页显示状态 */
  setShowPagination: (showPagination?: boolean) => void;
  /** 更新分页状态 */
  updatePagination: (pagination?: PaginationState) => void;
  /** 获取分页属性 */
  getPaginationProps: () => {
    pageNo: number;
    pageSize: number;
    total: number;
    totalPages: number;
    showPagination: boolean;
    onChange: (pageNo: number, pageSize?: number) => void;
    onShowSizeChange: (pageNo: number, pageSize: number) => void;
  };
  /** 分页数据处理 */
  getPaginatedData: (data: Record<string, any>[]) => Record<string, any>[];
  /** 是否显示分页组件 */
  showPagination: boolean;
}

/**
 * 表格分页逻辑Hook
 * 统一管理分页状态，支持本地和远程分页
 */
export function useTablePagination(context: TableContextValue, options: UseTablePaginationLogicOptions = {}): UseTablePaginationLogicReturn {
  const { defaultPaginationConfig = {} } = options;

  const { state, actions } = context;
  const config = state.config;

  // 实时分页状态 - 从 PaginationState 获取核心字段
  const paginationState = state.pagination;
  const paginable = config.paginable;
  const remote = state.config?.dataMode?.pagination === 'remote';

  // 分页配置 - 从 TableConfig.pagination 获取配置项，但不包括 pageNo, total, pageSize
  const paginationConfig: PaginationConfig = useMemo(() => {
    const defaultConfig = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: [10, 20, 50, 100],
      showTotal: true,
      showPagination: true,
      simple: false,
      position: 'right' as const,
      layout: ['total', 'perPage', 'pager', 'go'] as ('total' | 'perPage' | 'pager' | 'go')[],
      maxButtons: 5,
      onPaginationChange: (pagination: PaginationState): void => {},
    };

    return {
      ...defaultConfig,
      ...state.config.pagination,
      ...defaultPaginationConfig,
    };
  }, [defaultPaginationConfig, state.config.pagination]);

  // 设置当前页
  const setPageNo = useCallback(
    (pageNo: number) => {
      const newPagination = { ...paginationState, pageNo };
      actions.updatePagination(newPagination);
    },
    [paginationState, actions],
  );

  // 设置每页条数
  const setPageSize = useCallback(
    (pageSize: number) => {
      const newPagination = {
        ...paginationState,
        pageSize,
        pageNo: 1, // 重置到第一页
      };
      actions.updatePagination(newPagination);
    },
    [paginationState, actions],
  );

  // 设置总数
  const setTotal = useCallback(
    (total: number) => {
      const newPagination = { ...paginationState, total };
      actions.updatePagination(newPagination);
    },
    [paginationState, actions],
  );

  // 设置分页显示状态
  // 注意：`PaginationState` 中控制显隐的字段名是 `show`，写 `showPagination` 会导致开关失效
  const setShowPagination = useCallback(
    (showPagination = true) => {
      const newPagination = { ...paginationState, show: showPagination };
      actions.updatePagination(newPagination);
    },
    [paginationState, actions],
  );

  // 更新分页状态
  const updatePagination = useCallback(
    (pagination: PaginationState = {}) => {
      const newPagination = { ...paginationState, ...pagination };
      actions.updatePagination(newPagination);
    },
    [paginationState, actions],
  );

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil((paginationState?.total ?? 0) / (paginationState?.pageSize ?? 10));
  }, [paginationState?.total, paginationState?.pageSize]);

  // 获取分页属性
  const getPaginationProps = useCallback(() => {
    return {
      pageNo: paginationState.pageNo ?? 1,
      pageSize: paginationState.pageSize ?? 10,
      total: paginationState.total ?? 0,
      showPagination: paginationState.show ?? true,
      totalPages,
      onChange: (pageNo: number, pageSize?: number) => {
        const newPagination = {
          ...paginationState,
          pageNo,
          ...(pageSize && { pageSize }),
        };
        actions.updatePagination(newPagination);
      },
      onShowSizeChange: (pageNo: number, pageSize: number) => {
        const newPagination = {
          ...paginationState,
          pageNo: 1, // 重置到第一页
          pageSize,
        };
        actions.updatePagination(newPagination);
      },
    };
  }, [paginationState, totalPages, actions]);

  // 本地分页数据处理
  const getPaginatedData = useCallback(
    (data: Record<string, any>[]): Record<string, any>[] => {
      if (!paginable || remote) {
        return data;
      }

      return applyTablePagination(data, paginationState);
    },
    [paginable, remote, paginationState],
  );

  // 是否显示分页组件
  const shouldShowPagination: boolean = useMemo(() => {
    // 当分页功能启用且需要显示分页时就显示，不严格依赖total值
    // 因为total可能在某些情况下没有及时设置，但分页功能仍然需要
    const { show = true } = paginationState;
    return Boolean(paginable) && show;
  }, [paginable, paginationState]);

  return {
    pagination: paginationState,
    paginationConfig,
    setPageNo,
    setPageSize,
    setTotal,
    setShowPagination,
    updatePagination,
    getPaginationProps,
    getPaginatedData,
    showPagination: shouldShowPagination,
  };
}
