import { TableEmpty } from '../index';
import { ScrollArea } from '../../scroll-area';
import { cn } from '../../../utils/classnames';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useTableContext } from '../context/TableContext';
import type { CardLayoutMode, TableSize } from '../types';

/**
 * 表格卡片容器组件属性
 */
export interface TableCardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 布局模式 */
  layout?: CardLayoutMode;
  /** 卡片尺寸 */
  size?: TableSize;
  /** 每行卡片数量 */
  columns?: number | 'auto';
  /** 卡片间距 */
  gap?: number | string;
  /** 卡片最小宽度 */
  minWidth?: number | string;
  /** 卡片最大宽度 */
  maxWidth?: number | string;
  /** 是否填充容器 */
  fillContainer?: boolean;
  /** 是否显示容器边框 */
  bordered?: boolean;
  /** 是否为空数据状态 */
  empty?: boolean;
  /** 自定义空状态渲染函数 */
  renderEmpty?: () => React.ReactNode;
}

/**
 * 表格卡片容器组件
 */
export const TableCardContainer = forwardRef<HTMLDivElement, TableCardContainerProps>(
  (
    { className, layout = 'grid', size = 'md', columns = 'auto', gap = 16, minWidth = 240, maxWidth, fillContainer = false, bordered = false, empty = false, renderEmpty, children, style, ...props },
    ref,
  ) => {
    // 获取表格上下文和国际化文本
    const tableContext = useTableContext();
    const { t } = tableContext.tableLogic.i18n;
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // 监听分页状态变化，自动滚动到顶部
    useEffect(() => {
      if (tableContext && fillContainer) {
        const { state } = tableContext;
        const { pagination, config } = state;
        const { paginable, scroll } = config;
        const { scrollToFirstRowOnChange = true } = scroll || {};

        if (paginable && scrollToFirstRowOnChange && scrollAreaRef.current) {
          // 查找ScrollArea内部的滚动容器
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }
    }, [tableContext?.state.pagination, tableContext?.state.config.paginable, tableContext?.state.config.scroll?.scrollToFirstRowOnChange, fillContainer, tableContext]);
    // 计算网格样式
    const getGridStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        gap: typeof gap === 'number' ? `${gap}px` : gap,
      };

      if (layout === 'grid') {
        if (columns === 'auto') {
          // 自动计算列数 - 使用auto-fit确保折行，避免横向滚动
          const cardMinWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth || (size === 'sm' ? '240px' : size === 'md' ? '280px' : '320px');

          if (maxWidth) {
            const cardMaxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
            baseStyles.gridTemplateColumns = `repeat(auto-fit, minmax(${cardMinWidth}, ${cardMaxWidth}))`;
          } else {
            baseStyles.gridTemplateColumns = `repeat(auto-fit, minmax(${cardMinWidth}, 1fr))`;
          }
        } else {
          // 固定列数
          baseStyles.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }
      }

      return { ...baseStyles, ...style };
    };

    // 渲染空数据卡片
    const renderEmptyCard = () => {
      if (renderEmpty) {
        return renderEmpty();
      }

      const emptyText = t('emptyText');
      return (
        <div
          className={cn(
            // 基础样式
            'w-full rounded-lg border border-gray-300 border-dashed bg-gray-50/50',
            'flex flex-col items-center justify-center px-6 py-12',
            'text-center text-gray-500',

            // 尺寸适配 - 统一字体大小，只调整间距
            {
              'px-4 py-8': size === 'sm',
              'px-6 py-12': size === 'md',
              'px-8 py-16': size === 'lg',
            },
            // 统一字体大小，符合 DS 规范
            'text-sm',
          )}
        >
          <div className="mb-2 text-2xl opacity-50">
            <TableEmpty description={emptyText} />
          </div>
        </div>
      );
    };

    // 渲染容器内容
    const renderContent = () => {
      // 使用传入的empty状态来判断是否显示空数据卡片
      if (empty) {
        return renderEmptyCard();
      }

      return (
        <div
          className={cn(
            // 基础样式
            'w-full',

            // 布局样式
            {
              grid: layout === 'grid',
              'flex flex-col gap-4': layout === 'list',
            },

            // grid auto模式确保不出现横向滚动条
            layout === 'grid' && columns === 'auto' && 'overflow-hidden',

            // list模式确保不出现横向滚动条
            layout === 'list' && 'overflow-x-hidden',
          )}
          style={getGridStyles()}
        >
          {children}
        </div>
      );
    };

    // 如果填充容器，使用ScrollArea
    if (fillContainer) {
      // 计算是否需要横向滚动条
      // list模式和grid auto模式不开启横向滚动条，其他模式开启
      const withHorizontalScrollbar = !(layout === 'list' || (layout === 'grid' && columns === 'auto'));

      return (
        <div
          ref={ref}
          data-slot="table-card-container"
          data-scroll-mode="custom"
          className={cn(
            'eas-table-card-container h-full w-full',
            // 容器边框
            bordered && 'rounded-lg border',
            className,
          )}
          {...props}
        >
          <ScrollArea ref={scrollAreaRef} className="h-full w-full" withHorizontalScrollbar={withHorizontalScrollbar}>
            <div className="p-4">{renderContent()}</div>
          </ScrollArea>
        </div>
      );
    }

    // 普通模式
    return (
      <div
        ref={ref}
        data-slot="table-card-container"
        data-scroll-mode="native"
        className={cn(
          // 基础样式
          'eas-table-card-container w-full',

          // 容器边框
          bordered && 'rounded-lg border p-2',

          // 自定义类名
          className,
        )}
        {...props}
      >
        {renderContent()}
      </div>
    );
  },
);

TableCardContainer.displayName = 'TableCardContainer';
