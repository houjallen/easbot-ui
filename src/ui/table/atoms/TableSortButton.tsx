import { Button } from '../../button';
import { useTableLogic } from '../context/TableContext';
import { cn } from '../../../utils/classnames';
import React, { useCallback } from 'react';
import { Icon, IconButton } from '../../icon';
import { useTableConfig, useTableState } from '../context/TableContext';
import type { ActionConfig, SortState } from '../types';
import type { TableColumn } from '../types/base';

export interface TableSortButtonProps {
  /** 排序动作配置 */
  action?: ActionConfig;
  /** 列定义 */
  column: TableColumn;
  /** 自定义类名 */
  className?: string;
  /** 过滤值变化回调 */
  onChange?: (e?: React.MouseEvent, value?: SortState | undefined) => void;
}

/**
 * 表格排序按钮组件
 * 提供列排序功能的交互界面
 */
export const TableSortButton: React.FC<TableSortButtonProps> = ({ action, column, className, onChange }) => {
  // 获取排序状态和逻辑
  const sortState = useTableState((state) => state.sortState);
  const tableLogic = useTableLogic();
  const tableConfig = useTableConfig();
  const showInMore = action?.showInMore === true;
  const { t } = tableLogic.i18n;

  // 检查当前列是否可排序
  const isSortable = column.sortable === true;

  // 获取当前列的排序状态
  const currentSort = sortState.columnName === column.name ? sortState.order : null;

  // 处理排序点击
  const handleSort = useCallback(
    (e?: React.MouseEvent) => {
      if (!isSortable) return;

      // 阻止事件冒泡
      e?.stopPropagation();

      // 使用 toggleSort 方法，与 BaseTable 保持一致
      tableLogic?.sort.toggleSort(column.name);
      // 触发 onChange 回调
      onChange?.(e, { columnName: column.name, order: currentSort });
    },
    [
      isSortable,
      column.name,
      tableLogic, // 触发 onChange 回调
      onChange,
      currentSort,
    ],
  );

  // 获取排序图标名称（用于IconButton）
  const getSortIconName = () => {
    switch (currentSort) {
      case 'asc':
        return 'table-sort-asc';
      case 'desc':
        return 'table-sort-desc';
      default:
        return 'table-sort-none';
    }
  };
  // 获取排序提示文本
  const getSortLabel = () => {
    switch (currentSort) {
      case 'asc':
        return t('sortAscending');
      case 'desc':
        return t('sortDescending');
      default:
        return t('sortText');
    }
  };

  // 获取排序提示文本
  const getSortTitle = () => {
    if (!isSortable) return undefined;

    switch (currentSort) {
      case null:
        return t('clickSortAsc');
      case 'asc':
        return t('clickSortDesc');
      case 'desc':
        return t('clickCancelSort');
      default:
        return t('clickSortAsc');
    }
  };

  if (!tableConfig.sortable) {
    return null;
  }

  return showInMore ? (
    <Button
      variant="ghost"
      size={tableConfig?.size}
      className={cn(currentSort ? 'shrink-0 bg-primary/10' : 'shrink-0', className)}
      leftIcon={<Icon name={getSortIconName()} size={16} />}
      title={getSortTitle()}
      onClick={(e) => {
        handleSort(e);
      }}
    >
      {getSortLabel()}
    </Button>
  ) : (
    <IconButton
      icon={getSortIconName()}
      size={20}
      shape="square"
      variant="default"
      className={cn(currentSort ? 'shrink-0 bg-primary/10' : 'shrink-0', className)}
      onClick={(e) => handleSort(e)}
      title={getSortTitle()}
    />
  );
};

export default TableSortButton;
