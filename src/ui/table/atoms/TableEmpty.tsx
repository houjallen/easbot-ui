import { Icon } from '../../icon';
import { useTableContext } from '../context';
import { cn } from '../../../utils/classnames';
import React from 'react';

/**
 * 表格空状态组件属性
 */
export interface TableEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 描述文本 */
  description?: React.ReactNode;
  /** 图片或图标 */
  image?: React.ReactNode;
  /** 操作按钮 */
  action?: React.ReactNode;
}

/**
 * 表格空状态组件
 */
export const TableEmpty: React.FC<TableEmptyProps> = ({ className, description, image, action, ...props }) => {
  const tableContext = useTableContext();
  const { t } = tableContext.tableLogic.i18n;
  const emptyText = description ?? t('emptyText');
  return (
    <div className={cn('eas-table-empty flex flex-col items-center justify-center py-12 text-center', className)} {...props}>
      {/* 图片/图标 */}
      {image || (
        <div className="mb-4 text-muted-foreground">
          <Icon name="file" size={64} className="mx-auto" />
        </div>
      )}

      {/* 描述文本 */}
      <p className="mb-4 text-md text-muted-foreground">{emptyText}</p>

      {/* 操作按钮 */}
      {action}
    </div>
  );
};
