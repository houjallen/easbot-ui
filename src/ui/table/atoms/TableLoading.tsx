import { cn } from '../../../utils/classnames';
import { useComponentMessage } from '../../../utils/use-component-message';
import type { UiMessages } from '../../../utils/ui-message';
import React from 'react';

/**
 * 表格加载状态组件属性
 */
export interface TableLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示加载状态 */
  spinning?: boolean;
  /** 加载文本 */
  tip?: React.ReactNode;
  /** 延迟显示时间(ms) */
  delay?: number;
  /** 自定义加载指示器 */
  indicator?: React.ReactNode;
  /** 语言标识，优先级高于 LocaleProvider */
  locale?: string;
  /** 自定义文案（覆盖内置文案） */
  messages?: UiMessages;
}

/**
 * 表格加载状态组件
 */
export const TableLoading: React.FC<TableLoadingProps> = ({ className, spinning = true, tip, indicator, children, locale, messages, ...props }) => {
  const { t } = useComponentMessage('table', { locale, messages });

  if (!spinning) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)} {...props}>
      {/* 内容 */}
      <div className={spinning ? 'pointer-events-none opacity-50' : ''}>{children}</div>

      {/* 加载蒙层 */}
      {spinning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          {/* 加载指示器 */}
          {indicator || <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2">&nbsp;</div>}

          {/* 加载文本 */}
          {tip === undefined ? <p className="mt-2 text-muted-foreground text-sm">{t('loading')}</p> : tip ? <p className="mt-2 text-muted-foreground text-sm">{tip}</p> : null}
        </div>
      )}
    </div>
  );
};

TableLoading.displayName = 'TableLoading';
