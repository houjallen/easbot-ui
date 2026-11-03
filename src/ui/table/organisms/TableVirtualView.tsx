/**
 * 表格虚拟滚动Body组件
 * 只负责虚拟滚动的body渲染，复用BaseTable的表头和容器逻辑
 */

import { VirtualList } from '../atoms/virtual-list';
import type { VirtualizationConfig } from '../types';
import type { TableColumn } from '../types/base';
import React, { useMemo } from 'react';

/**
 * 虚拟滚动Body属性
 */
export interface TableVirtualBodyProps {
  /** 表格数据 */
  data: Record<string, any>[];
  /** 可见列配置 */
  columns: TableColumn[];
  /** 获取行key的函数 */
  getRowKey: (record: Record<string, any>, index: number) => string | number;
  /** 虚拟化配置 */
  virtualizationConfig?: VirtualizationConfig;
  /** 获取行类名的函数 */
  rowClassName?: string | ((record: Record<string, any>, index: number) => string);
  /** 单元格类名 */
  cellClassName?: string | ((column: any, record: Record<string, any>, index: number) => string);
  /** 渲染单行数据 */
  renderTableRow: (record: Record<string, any>, index: number) => React.ReactNode;
}

/**
 * 表格虚拟滚动Body组件
 */
export const TableVirtualBody: React.FC<TableVirtualBodyProps> = ({ data, columns, getRowKey, virtualizationConfig, renderTableRow }) => {
  // 合并虚拟化配置
  const finalVirtualConfig = useMemo(() => {
    return {
      height: 400,
      itemHeight: 48,
      estimatedItemSize: 48,
      overscanCount: 5,
      threshold: 100,
      ...virtualizationConfig,
    };
  }, [virtualizationConfig]);

  // 检查是否启用虚拟滚动
  const shouldUseVirtualization = useMemo(() => {
    const threshold = finalVirtualConfig.threshold || 100;
    return data.length >= threshold;
  }, [data.length, finalVirtualConfig.threshold]);

  // 创建虚拟滚动的renderRow函数
  const renderVirtualRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const record = data[index];
    if (!record) return null;

    return (
      <div key={getRowKey(record, index)} style={style}>
        {renderTableRow(record, index)}
      </div>
    );
  };

  // 如果不需要虚拟滚动，直接渲染所有行
  if (!shouldUseVirtualization) {
    return <>{data.map((record, index) => renderTableRow(record, index))}</>;
  }

  // 虚拟滚动模式
  return (
    <VirtualList
      height={finalVirtualConfig.height!}
      itemCount={data.length}
      itemSize={finalVirtualConfig.itemHeight!}
      estimatedItemSize={finalVirtualConfig.estimatedItemSize}
      overscanCount={finalVirtualConfig.overscanCount}
      renderItem={renderVirtualRow}
    />
  );
};
