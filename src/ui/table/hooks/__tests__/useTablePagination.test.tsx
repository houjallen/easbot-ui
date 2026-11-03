/**
 * useTablePagination Hook 单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证 Hook 返回的初始分页状态与默认分页配置
 * 2. 状态测试 - 验证页码 / 每页条数 / 总数 / 显隐开关对分页状态的回写
 * 3. 交互测试 - 验证 getPaginationProps 回调与本地分页数据切片
 *
 * 测试载体说明：
 * `useTablePagination` 以 `TableContextValue` 作为第一个入参（不是独立 Hook），
 * 因此所有用例都在真实 `TableProvider` 下渲染，通过探针组件把 Hook 返回值透出。
 *
 * 关键约束：
 * - `getPaginatedData` 在 `paginable` 为 false 或 `dataMode.pagination === 'remote'` 时是空操作，
 *   本地分页用例必须显式传 `dataMode: { pagination: 'local' }`。
 * - `setShowPagination` 写入的是 `PaginationState.show` 字段（而非 `showPagination`）。
 */

import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TableProvider, useTableContext } from '../../context/TableContext';
import type { PaginationConfig, PaginationState, TableColumn } from '../../types';
import type { UseTablePaginationLogicReturn } from '../useTablePagination';
import { useTablePagination } from '../useTablePagination';

/**
 * 测试数据 —— 12 条足以跨越多页
 */
const sampleData = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  name: `第 ${index + 1} 行`,
}));

/**
 * 测试列
 */
const sampleColumns: TableColumn[] = [{ name: 'name', title: '名称', dataIndex: 'name' }];

/**
 * 分页配置的实际运行时形态
 *
 * @description
 * `useTablePagination` 内部构造的默认配置里带有 `showPagination` 与
 * `onPaginationChange` 两个字段，但公开的 `PaginationConfig` 类型没有声明它们 ——
 * 这里按运行时真实形态做窄化断言。
 */
type RuntimePaginationConfig = PaginationConfig & {
  showPagination: boolean;
  onPaginationChange: (pagination: PaginationState) => void;
};

/**
 * 分页属性的实际运行时形态 —— `getPaginationProps` 额外返回 `showPagination`
 */
type RuntimePaginationProps = ReturnType<UseTablePaginationLogicReturn['getPaginationProps']> & {
  showPagination: boolean;
};

/**
 * 探针组件 —— 在真实 TableProvider 上下文中消费分页 Hook
 */
const PaginationProbe = ({ onReady }: { onReady: (value: UseTablePaginationLogicReturn) => void }) => {
  const context = useTableContext();
  const value = useTablePagination(context);

  onReady(value);

  return null;
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderPagination = (config?: Record<string, unknown>) => {
  const latest: { value?: UseTablePaginationLogicReturn } = {};

  const utils = render(
    <TableProvider
      data={sampleData}
      columns={sampleColumns}
      // 分页状态通过 pagination 属性传入 —— 初始 total 不会由 data 长度推导
      pagination={{ pageNo: 1, pageSize: 10, total: sampleData.length, show: true }}
      config={config as never}
    >
      <PaginationProbe
        onReady={(value) => {
          latest.value = value;
        }}
      />
    </TableProvider>,
  );

  return { ...utils, latest };
};

describe('useTablePagination Hook', () => {
  describe('渲染测试', () => {
    it('应该返回表格当前的初始分页状态', () => {
      const { latest } = renderPagination();

      expect(latest.value?.pagination.pageNo).toBe(1);
      expect(latest.value?.pagination.pageSize).toBe(10);
      expect(latest.value?.pagination.total).toBe(sampleData.length);
      expect(latest.value?.pagination.show).toBe(true);
    });

    it('应该返回默认的分页配置', () => {
      const { latest } = renderPagination();

      const paginationConfig = latest.value?.paginationConfig as RuntimePaginationConfig;

      expect(paginationConfig.showSizeChanger).toBe(true);
      expect(paginationConfig.showQuickJumper).toBe(true);
      expect(paginationConfig.pageSizeOptions).toEqual([10, 20, 50, 100]);
      expect(paginationConfig.showTotal).toBe(true);
      expect(paginationConfig.showPagination).toBe(true);
      expect(paginationConfig.simple).toBe(false);
      expect(paginationConfig.position).toBe('right');
      expect(paginationConfig.layout).toEqual(['total', 'perPage', 'pager', 'go']);
      expect(paginationConfig.maxButtons).toBe(5);
      expect(typeof paginationConfig.onPaginationChange).toBe('function');
    });

    it('应该用表格配置覆盖默认的分页配置', () => {
      const { latest } = renderPagination({
        pagination: { showTotal: false, maxButtons: 3, position: 'center' },
      });

      expect(latest.value?.paginationConfig.showTotal).toBe(false);
      expect(latest.value?.paginationConfig.maxButtons).toBe(3);
      expect(latest.value?.paginationConfig.position).toBe('center');
      // 未覆盖的项仍保持默认值
      expect(latest.value?.paginationConfig.showSizeChanger).toBe(true);
    });

    it('应该在分页功能关闭时隐藏分页组件', () => {
      const { latest } = renderPagination({ paginable: false });

      expect(latest.value?.showPagination).toBe(false);
    });
  });

  describe('状态测试', () => {
    it('应该在设置页码后更新分页状态', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.setPageNo(3);
      });

      expect(latest.value?.pagination.pageNo).toBe(3);
    });

    it('应该在设置每页条数后重置页码为第一页', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.setPageNo(3);
      });
      expect(latest.value?.pagination.pageNo).toBe(3);

      act(() => {
        latest.value?.setPageSize(20);
      });

      expect(latest.value?.pagination.pageSize).toBe(20);
      expect(latest.value?.pagination.pageNo).toBe(1);
    });

    it('应该在设置总数后更新分页状态', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.setTotal(100);
      });

      expect(latest.value?.pagination.total).toBe(100);
    });

    it('应该在关闭分页显示时把 show 字段置为 false', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.setShowPagination(false);
      });

      // 显隐字段是 PaginationState.show，不是 showPagination
      expect(latest.value?.pagination.show).toBe(false);
      expect(latest.value?.showPagination).toBe(false);
    });

    it('应该在重新开启分页显示时把 show 字段置为 true', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.setShowPagination(false);
      });
      expect(latest.value?.pagination.show).toBe(false);

      act(() => {
        latest.value?.setShowPagination(true);
      });

      expect(latest.value?.pagination.show).toBe(true);
      expect(latest.value?.showPagination).toBe(true);
    });

    it('应该在整体更新分页状态时合并已有字段', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.updatePagination({ pageNo: 2 });
      });

      expect(latest.value?.pagination.pageNo).toBe(2);
      expect(latest.value?.pagination.pageSize).toBe(10);
    });

    it('应该按总数与每页条数计算总页数', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.setTotal(35);
      });

      // 35 / 10 向上取整 = 4
      expect(latest.value?.getPaginationProps().totalPages).toBe(4);
    });
  });

  describe('交互测试', () => {
    it('应该在页码变化回调中更新分页状态', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.getPaginationProps().onChange(2);
      });

      expect(latest.value?.pagination.pageNo).toBe(2);
    });

    it('应该在每页条数变化回调中重置页码为第一页', () => {
      const { latest } = renderPagination();

      act(() => {
        latest.value?.getPaginationProps().onChange(4);
      });
      expect(latest.value?.pagination.pageNo).toBe(4);

      act(() => {
        latest.value?.getPaginationProps().onShowSizeChange(4, 50);
      });

      expect(latest.value?.pagination.pageSize).toBe(50);
      expect(latest.value?.pagination.pageNo).toBe(1);
    });

    it('应该在本地分页模式下按页码切片数据', () => {
      const { latest } = renderPagination({ dataMode: { pagination: 'local' } });

      const firstPage = latest.value?.getPaginatedData(sampleData);
      expect(firstPage).toHaveLength(10);
      expect(firstPage?.[0]?.id).toBe('1');

      act(() => {
        latest.value?.setPageNo(2);
      });

      const secondPage = latest.value?.getPaginatedData(sampleData);
      expect(secondPage).toHaveLength(2);
      expect(secondPage?.[0]?.id).toBe('11');
    });

    it('应该在远程分页模式下原样返回数据', () => {
      const { latest } = renderPagination({ dataMode: { pagination: 'remote' } });

      expect(latest.value?.getPaginatedData(sampleData)).toHaveLength(sampleData.length);
    });

    it('应该在分页功能关闭时原样返回数据', () => {
      const { latest } = renderPagination({ paginable: false, dataMode: { pagination: 'local' } });

      expect(latest.value?.getPaginatedData(sampleData)).toHaveLength(sampleData.length);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露分页显隐状态供渲染层判断', () => {
      const { latest } = renderPagination();

      expect(latest.value?.showPagination).toBe(true);

      act(() => {
        latest.value?.setShowPagination(false);
      });

      expect(latest.value?.showPagination).toBe(false);
    });

    it('应该在分页属性中返回可读的当前页与每页条数', () => {
      const { latest } = renderPagination();

      const props = latest.value?.getPaginationProps() as RuntimePaginationProps;

      expect(props?.pageNo).toBe(1);
      expect(props?.pageSize).toBe(10);
      expect(props?.total).toBe(sampleData.length);
      expect(props?.showPagination).toBe(true);
    });
  });
});
