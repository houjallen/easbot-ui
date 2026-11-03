import { cn } from '../../../utils/classnames';
import React, { useCallback } from 'react';
import { IconButton } from '../../icon';
import { useTableConfig, useTableContext } from '../context/TableContext';

export interface TableRowExpandButtonProps {
  /** 当前行是否已展开 */
  isExpanded: boolean;
  /** 展开/收起回调 */
  onToggle: (expanded: boolean) => void;
  /** 行记录数据 */
  record: Record<string, any>;
  /** 行索引 */
  index: number;
  /** 自定义类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 表格行展开按钮组件
 * 提供行展开/收起功能的交互界面
 */
export const TableRowExpandButton: React.FC<TableRowExpandButtonProps> = ({ isExpanded, onToggle, record, index, className, disabled = false }) => {
  const tableConfig = useTableConfig();
  const tableContext = useTableContext();
  const { t } = tableContext.tableLogic.i18n;

  // 处理展开/收起点击
  const handleToggle = useCallback(
    (e?: React.MouseEvent) => {
      if (disabled) return;

      // 阻止事件冒泡
      e?.stopPropagation();

      // 切换展开状态
      onToggle(!isExpanded);
    },
    [disabled, isExpanded, onToggle],
  );

  // 获取展开图标名称
  const getExpandIconName = () => {
    return 'chevron-down'; // 统一使用向下箭头，通过CSS旋转控制方向
  };

  // 获取展开提示文本
  const getExpandTitle = () => {
    return isExpanded ? t('collapseRow', { index: index + 1 }) : t('expandRow', { index: index + 1 });
  };

  // 根据表格尺寸确定按钮大小
  const getButtonSize = () => {
    switch (tableConfig?.size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <IconButton
      icon={getExpandIconName()}
      size={getButtonSize()}
      shape="square"
      variant="default"
      className={cn('transition-transform duration-200', isExpanded && 'rotate-180', disabled && 'cursor-not-allowed opacity-50', className)}
      onClick={handleToggle}
      disabled={disabled}
      title={getExpandTitle()}
      aria-label={getExpandTitle()}
    />
  );
};

export default TableRowExpandButton;
