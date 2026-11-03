/**
 * 现代化表格容器组件
 * 采用最新React模式和TypeScript特性，负责表格的整体布局、滚动、状态管理
 */

import { TableError } from './TableError';
import { cn } from '../../../utils/classnames';
import React, { forwardRef, memo, useEffect, useRef } from 'react';
import { ScrollArea } from '../../scroll-area';
import { useTableContext } from '../context/TableContext';
import type { TableContainerProps } from '../types';

/**
 * 现代化表格容器组件
 * 提供表格的基础容器功能，支持滚动、状态显示等
 *
 * ## 滚动条控制逻辑
 *
 * ### 自定义滚动条 (ScrollArea)
 * 使用条件：
 * - **fillContainer模式**：自动启用，提供双向滚动
 * - **普通模式**：仅当明确配置了滚动尺寸时启用
 *   - `scroll.x` 为数字或非'auto'字符串时启用水平滚动
 *   - `scroll.y` 为数字或非'auto'字符串时启用垂直滚动
 *
 * ### 原生滚动条 (overflow)
 * 使用条件：
 * - 无scroll配置
 * - scroll配置为'auto'
 * - 只配置了水平滚动但未配置垂直滚动（表格高度自适应）
 *
 * ### 典型场景
 * ```typescript
 * // fillContainer模式 - 使用ScrollArea双向滚动
 * <TableContainer className="eas-table-fill-container" />
 *
 * // 固定高度滚动 - 使用ScrollArea
 * <TableContainer scroll={{ y: 400 }} />
 *
 * // 固定宽度滚动 - 使用ScrollArea
 * <TableContainer scroll={{ x: 800 }} />
 *
 * // 自适应内容 - 使用原生overflow
 * <TableContainer scroll={{ x: 'auto', y: 'auto' }} />
 * <TableContainer /> // 无配置
 * ```
 */
export const TableContainer = memo(
  forwardRef<HTMLDivElement, TableContainerProps>(
    (
      {
        children,
        className,
        style,
        size = 'md',
        density = 'comfortable',
        striped = false,
        stickyHeader = false,
        bordered = false,
        hoverable = false,
        scroll,
        fullscreen = false,
        fillContainer = false,
        loading = false,
        empty = false,
        error,
        ...props
      },
      ref,
    ) => {
      // 获取表格上下文
      const tableContext = useTableContext();
      const { t } = tableContext.tableLogic.i18n;
      const scrollAreaRef = useRef<HTMLDivElement>(null);

      // 计算容器样式和滚动配置
      const containerStyle: React.CSSProperties = {
        ...style,
      };

      // 判断是否需要使用自定义滚动条
      // fillContainer模式直接启用双向滚动，普通模式需要有明确的scroll配置
      const needsCustomScroll = fillContainer || (scroll?.y && scroll.y !== 'auto') || (scroll?.x && scroll.x !== 'auto');

      // 监听分页状态变化，自动滚动到顶部
      useEffect(() => {
        if (tableContext && needsCustomScroll) {
          const { state } = tableContext;
          const { config } = state;
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
      }, [tableContext?.state.pagination, tableContext?.state.config.paginable, tableContext?.state.config.scroll?.scrollToFirstRowOnChange, needsCustomScroll, tableContext]);

      // 水平滚动条配置
      const hasHorizontalScroll = fillContainer || (scroll?.x && scroll.x !== 'auto');

      // 如果有滚动配置，设置ScrollArea的尺寸
      // fillContainer模式忽略scroll的尺寸设置，保持响应式填充
      if (needsCustomScroll && scroll && !fillContainer) {
        if (scroll.x) {
          if (typeof scroll.x === 'number') {
            const widthPx = `${scroll.x}px`;
            containerStyle.width = widthPx;
            containerStyle.minWidth = widthPx;
            containerStyle.maxWidth = widthPx;
          } else if (typeof scroll.x === 'string' && scroll.x !== 'auto') {
            containerStyle.width = scroll.x;
          }
        }
        if (scroll.y) {
          if (typeof scroll.y === 'number') {
            const heightPx = `${scroll.y}px`;
            containerStyle.height = heightPx;
            containerStyle.minHeight = heightPx;
            containerStyle.maxHeight = heightPx;
          } else if (typeof scroll.y === 'string' && scroll.y !== 'auto') {
            containerStyle.height = scroll.y;
          }
        }
      }

      // 生成CSS类名 - 使用设计系统兼容的结构
      const containerClasses = cn(
        // 基础样式 - 保持与设计系统一致
        'relative w-full',

        // 滚动处理现在由ScrollArea组件处理，移除原有的overflow样式
        // 只有在不使用自定义滚动条时才使用原生overflow
        !needsCustomScroll && {
          'overflow-x-auto': scroll?.x,
          'overflow-y-auto': scroll?.y,
          'overflow-auto': scroll?.x && scroll?.y,
        },

        // EAS表格扩展样式
        'eas-table-container',

        // 大小样式
        {
          'eas-table-sm': size === 'sm',
          'eas-table-md': size === 'md',
          'eas-table-lg': size === 'lg',
        },

        // 密度样式
        {
          'eas-table-compact': density === 'compact',
          'eas-table-comfortable': density === 'comfortable',
          'eas-table-density': density === 'default',
        },

        // 边框样式
        {
          'eas-table-bordered': bordered,
        },

        // 全屏样式
        {
          'eas-table-fullscreen': fullscreen,
          'fixed inset-0 z-50 bg-background': fullscreen,
        },
        //显示条纹
        {
          'eas-table-striped': striped,
        },
        //固定表头
        {
          'eas-table-sticky-header': stickyHeader,
        },
        //悬停效果
        {
          'eas-table-hoverable': hoverable,
        },

        className,
      );

      // 渲染错误状态
      if (error) {
        return (
          <div ref={ref} data-slot="table-container" data-scroll-mode="native" className={containerClasses} style={containerStyle} {...props}>
            <TableError message={error} />
          </div>
        );
      }

      // 空数据状态不应该完全替换表格，而应该保留表头以便用户操作
      // 空数据提示将在表体中显示，这样可以保留表头和过滤功能

      // 渲染正常内容 - 添加data-slot属性
      // 如果需要自定义滚动条，使用ScrollArea包装内容
      if (needsCustomScroll) {
        return (
          <div ref={ref} data-slot="table-container" data-scroll-mode="custom" className={containerClasses} style={containerStyle} {...props}>
            <ScrollArea ref={scrollAreaRef} className={fillContainer ? 'h-full w-full' : 'h-auto w-full'} withHorizontalScrollbar={Boolean(hasHorizontalScroll)}>
              {children}
            </ScrollArea>
          </div>
        );
      }

      // 不需要自定义滚动条时，保持原有逻辑
      return (
        <div ref={ref} data-slot="table-container" data-scroll-mode="native" className={containerClasses} style={containerStyle} {...props}>
          {children}
        </div>
      );
    },
  ),
);

TableContainer.displayName = 'TableContainer';
