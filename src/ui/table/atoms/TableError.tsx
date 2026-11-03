import { Button } from '../../button';
import { Icon } from '../../icon';
import { useTableContext } from '../context';
import { cn } from '../../../utils/classnames';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import React from 'react';

/**
 * 表格空状态组件属性
 */
export interface TableErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 描述文本 */
  message?: React.ReactNode;
  /** 图片或图标 */
  image?: React.ReactNode;
  /** 操作按钮 */
  action?: React.ReactNode;
}

/**
 * 表格错误状态组件
 */
export const TableError: React.FC<TableErrorProps> = ({ className, message, image, action, ...props }) => {
  const tableContext = useTableContext();
  const { t } = tableContext.tableLogic.i18n;
  const errorText = message ?? t('errorText');
  const { actions } = tableContext;

  const handleReload = () => {
    // 清除错误并触发重新加载，重置到第一页，保留筛选与排序
    actions.setError(null);
    // reload 返回 Promise，失败时由数据源回写 error 状态，此处显式忽略避免未处理的 rejection
    void actions.reload(true, true, true).catch((error: unknown) => {
      console.error(processUiMessage('reloadFailed', { locale: tableContext.getLocale(), messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
    });
  };
  return (
    <div className={cn('eas-table-error flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-md bg-background/60 py-12 text-center', className)} {...props}>
      {/* 图片/图标 */}
      {image || (
        <div className="mb-2 text-destructive">
          <Icon name="x-circle" variant="destructive" size={64} className="mx-auto drop-shadow-sm" />
        </div>
      )}

      {/* 标题 */}
      <h3 className="text-base font-semibold leading-6">{t('errorPage.title')}</h3>

      {/* 描述文本 */}
      <p className="mx-auto mb-2 max-w-[720px] px-4 text-balance text-sm text-muted-foreground">{errorText}</p>

      {/* 操作按钮 */}
      <div className="mt-2 flex items-center gap-3">
        {action || (
          <Button variant="outline" onClick={handleReload} leftIcon={<Icon name="table-refresh" size={16} />}>
            {t('reload')}
          </Button>
        )}
      </div>
    </div>
  );
};
