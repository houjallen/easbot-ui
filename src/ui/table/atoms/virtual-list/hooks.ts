/**
 * 虚拟列表相关Hooks
 * 提供虚拟滚动的状态管理和性能优化功能
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ItemSizeGetter, VirtualAlignment, VirtualDirection } from './types';

/**
 * 虚拟滚动状态管理Hook
 */
export const useVirtualScroll = (itemCount: number, itemSize: number | ItemSizeGetter, containerSize: number, direction: VirtualDirection = 'vertical') => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 处理滚动事件
  const handleScroll = useCallback((offset: number) => {
    setScrollOffset(offset);
    setIsScrolling(true);

    // 清除之前的超时
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 设置滚动结束标志
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number, alignment: VirtualAlignment = 'auto') => {
    // 这里可以添加滚动到指定索引的逻辑
    // 具体实现会在VirtualList组件中处理
    console.debug('Scroll to index:', index, alignment);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollOffset,
    isScrolling,
    handleScroll,
    scrollToIndex,
  };
};

/**
 * 项目尺寸缓存Hook - 增强版本
 */
export const useItemSizeCache = () => {
  const cache = useRef<Map<number, number>>(new Map());
  const estimatedSizes = useRef<Map<number, number>>(new Map());
  const totalMeasured = useRef(0);

  const getItemSize = useCallback((index: number, defaultSize: number) => {
    return cache.current.get(index) ?? estimatedSizes.current.get(index) ?? defaultSize;
  }, []);

  const setItemSize = useCallback((index: number, size: number) => {
    const wasEstimated = estimatedSizes.current.has(index);
    const wasMeasured = cache.current.has(index);

    cache.current.set(index, size);
    estimatedSizes.current.delete(index);

    if (!wasMeasured && !wasEstimated) {
      totalMeasured.current++;
    }
  }, []);

  const setEstimatedSize = useCallback((index: number, size: number) => {
    if (!cache.current.has(index)) {
      estimatedSizes.current.set(index, size);
    }
  }, []);

  // 清空缓存
  const clearCache = useCallback(() => {
    cache.current.clear();
    estimatedSizes.current.clear();
    totalMeasured.current = 0;
  }, []);

  const getAverageSize = useCallback(() => {
    if (cache.current.size === 0) return null;

    const sizes = Array.from(cache.current.values());
    return sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      measured: cache.current.size,
      estimated: estimatedSizes.current.size,
      total: totalMeasured.current,
      averageSize: getAverageSize(),
    };
  }, [getAverageSize]);

  return {
    getItemSize,
    setItemSize,
    setEstimatedSize,
    clearCache,
    getAverageSize,
    getCacheStats,
  };
};

/**
 * 虚拟列表性能监控Hook
 */
export const useVirtualListPerformance = () => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  });

  // 记录渲染性能
  const recordRender = useCallback(() => {
    const now = performance.now();
    renderCountRef.current += 1;

    if (lastRenderTimeRef.current > 0) {
      const renderTime = now - lastRenderTimeRef.current;
      setPerformanceMetrics((prev) => ({
        renderCount: renderCountRef.current,
        averageRenderTime: (prev.averageRenderTime * (prev.renderCount - 1) + renderTime) / prev.renderCount,
        lastRenderTime: renderTime,
      }));
    }

    lastRenderTimeRef.current = now;
  }, []);

  // 重置性能指标
  const resetMetrics = useCallback(() => {
    renderCountRef.current = 0;
    lastRenderTimeRef.current = 0;
    setPerformanceMetrics({
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
    });
  }, []);

  return {
    performanceMetrics,
    recordRender,
    resetMetrics,
  };
};
