/**
 * 虚拟列表组件
 * 基于我们的组件规范，使用函数式组件和现代React模式
 * 提供高性能的大数据列表渲染能力
 */

import React, { forwardRef, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { VirtualListProps } from './types';
import { calculateScrollToIndex, calculateSizeAndPosition, calculateVisibleRange, createItemStyle, getScrollProp, getSizeProp, getTotalSize } from './utils';

/**
 * 虚拟列表组件
 * 支持固定和动态项目尺寸，提供高性能的大数据渲染
 */
export const VirtualList = memo(
  forwardRef<HTMLDivElement, VirtualListProps>(
    (
      {
        height,
        width,
        itemCount = 0,
        itemSize = 48,
        estimatedItemSize = 48,
        overscanCount = 3,
        scrollDirection = 'vertical',
        scrollToIndex,
        scrollToAlignment = 'auto',
        scrollOffset,
        renderItem,
        onScroll,
        onItemsRendered,
        stickyHeader,
        className,
        style,
        ...props
      },
      ref,
    ) => {
      // 内部状态
      const [internalScrollOffset, setInternalScrollOffset] = useState(0);
      const [isScrolling, setIsScrolling] = useState(false);

      // Refs
      const containerRef = useRef<HTMLDivElement>(null);
      const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

      // 合并外部ref和内部ref
      const mergedRef = useCallback(
        (node: HTMLDivElement | null) => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        },
        [ref],
      );

      // 使用外部scrollOffset或内部状态
      const currentScrollOffset = scrollOffset ?? internalScrollOffset;

      // 计算尺寸和位置数据
      const sizeAndPositionData = useMemo(() => {
        return calculateSizeAndPosition(itemCount, itemSize, estimatedItemSize);
      }, [itemCount, itemSize, estimatedItemSize]);

      // 计算总尺寸
      const totalSize = useMemo(() => {
        return getTotalSize(sizeAndPositionData);
      }, [sizeAndPositionData]);

      // 计算容器尺寸
      const containerSize = scrollDirection === 'vertical' ? height : width || 0;

      // 动态行高支持
      const itemSizeCache = useRef<Map<number, number>>(new Map());

      const getItemHeight = useCallback(
        (index: number) => {
          if (typeof itemSize === 'function') {
            // 检查缓存
            if (itemSizeCache.current.has(index)) {
              return itemSizeCache.current.get(index)!;
            }
            // 计算并缓存
            const height = itemSize(index);
            itemSizeCache.current.set(index, height);
            return height;
          }
          return itemSize;
        },
        [itemSize],
      );

      // 清理缓存当数据变化时
      useEffect(() => {
        itemSizeCache.current.clear();
      }, []);

      // 计算可见范围
      const visibleRange = useMemo(() => {
        return calculateVisibleRange(containerSize, currentScrollOffset, itemCount, sizeAndPositionData, overscanCount);
      }, [containerSize, currentScrollOffset, itemCount, sizeAndPositionData, overscanCount]);

      // 清理定时器
      useEffect(() => {
        return () => {
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
        };
      }, []);

      // 处理滚动到指定索引
      useLayoutEffect(() => {
        if (scrollToIndex !== undefined && containerRef.current) {
          const targetOffset = calculateScrollToIndex(scrollToIndex, scrollToAlignment, containerSize, sizeAndPositionData, currentScrollOffset);

          if (targetOffset !== currentScrollOffset) {
            containerRef.current[getScrollProp(scrollDirection)] = targetOffset;
            setInternalScrollOffset(targetOffset);

            onScroll?.({
              scrollDirection,
              scrollOffset: targetOffset,
              scrollUpdateWasRequested: true,
            });
          }
        }
      }, [scrollToIndex, scrollToAlignment, containerSize, sizeAndPositionData, scrollDirection, onScroll, currentScrollOffset]);

      // 处理外部设置的滚动偏移
      useLayoutEffect(() => {
        if (scrollOffset !== undefined && containerRef.current) {
          const currentOffset = containerRef.current[getScrollProp(scrollDirection)];
          if (currentOffset !== scrollOffset) {
            containerRef.current[getScrollProp(scrollDirection)] = scrollOffset;
          }
        }
      }, [scrollOffset, scrollDirection]);

      // 触发项目渲染回调
      useEffect(() => {
        onItemsRendered?.({
          overscanStartIndex: visibleRange.start,
          overscanStopIndex: visibleRange.stop,
          visibleStartIndex: Math.max(0, visibleRange.start - overscanCount),
          visibleStopIndex: Math.min(itemCount - 1, visibleRange.stop + overscanCount),
        });
      }, [visibleRange, overscanCount, itemCount, onItemsRendered]);

      // 渲染可见项目
      const visibleItems = useMemo(() => {
        const items: React.ReactNode[] = [];

        for (let index = visibleRange.start; index <= visibleRange.stop; index++) {
          if (index >= itemCount) break;

          const itemStyle = createItemStyle(index, sizeAndPositionData, scrollDirection);

          items.push(
            renderItem({
              index,
              style: itemStyle,
              isScrolling,
            }),
          );
        }

        return items;
      }, [visibleRange, itemCount, sizeAndPositionData, scrollDirection, renderItem, isScrolling]);

      // 容器样式
      const containerStyle: React.CSSProperties = {
        position: 'relative',
        height: scrollDirection === 'vertical' ? height : '100%',
        width: scrollDirection === 'horizontal' ? width : '100%',
        overflow: 'auto',
        willChange: 'scroll-position',
        ...style,
      };

      // 内容区域样式
      const contentStyle: React.CSSProperties = {
        position: 'relative',
        [getSizeProp(scrollDirection)]: totalSize,
      };

      return (
        <div
          ref={mergedRef}
          className={className}
          style={containerStyle}
          onScroll={(event) => {
            const target = event.target as HTMLDivElement;
            const newScrollOffset = target[getScrollProp(scrollDirection)];

            setInternalScrollOffset(newScrollOffset);
            setIsScrolling(true);

            // 清除之前的超时
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }

            // 设置滚动结束标志
            scrollTimeoutRef.current = setTimeout(() => {
              setIsScrolling(false);
            }, 150);

            // 触发外部滚动回调
            onScroll?.({
              scrollDirection,
              scrollOffset: newScrollOffset,
              scrollUpdateWasRequested: false,
            });
          }}
          {...props}
        >
          {/* 固定表头支持 */}
          {stickyHeader && (
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backgroundColor: 'var(--background)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {stickyHeader}
            </div>
          )}

          {/* 虚拟内容区域 */}
          <div style={contentStyle}>{visibleItems}</div>
        </div>
      );
    },
  ),
);

VirtualList.displayName = 'VirtualList';
