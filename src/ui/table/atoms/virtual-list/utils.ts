/**
 * 虚拟列表工具函数
 * 基于函数式编程，提供尺寸计算、位置管理等核心功能
 */

import React from 'react';
import type { ItemSizeGetter, SizeAndPositionData, VirtualAlignment, VirtualDirection, VisibleRange } from './types';

/**
 * 获取滚动属性名
 */
export const getScrollProp = (direction: VirtualDirection): 'scrollTop' | 'scrollLeft' => {
  return direction === 'vertical' ? 'scrollTop' : 'scrollLeft';
};

/**
 * 获取尺寸属性名
 */
export const getSizeProp = (direction: VirtualDirection): string => {
  return direction === 'vertical' ? 'height' : 'width';
};

/**
 * 获取偏移属性名
 */
export const getOffsetProp = (direction: VirtualDirection): string => {
  return direction === 'vertical' ? 'top' : 'left';
};

/**
 * 计算项目的尺寸和位置
 */
export const calculateSizeAndPosition = (itemCount: number, itemSize: number | ItemSizeGetter, estimatedItemSize = 50): SizeAndPositionData[] => {
  const sizeAndPositionData: SizeAndPositionData[] = [];
  let totalSize = 0;

  for (let i = 0; i < itemCount; i++) {
    const size = typeof itemSize === 'function' ? itemSize(i) : itemSize;
    sizeAndPositionData[i] = {
      offset: totalSize,
      size,
    };
    totalSize += size;
  }

  return sizeAndPositionData;
};

/**
 * 计算可见范围
 */
export const calculateVisibleRange = (containerSize: number, scrollOffset: number, itemCount: number, sizeAndPositionData: SizeAndPositionData[], overscanCount = 0): VisibleRange => {
  if (itemCount === 0) {
    return { start: 0, stop: 0 };
  }

  // 二分查找起始索引
  let start = 0;
  let end = itemCount - 1;

  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    const item = sizeAndPositionData[middle];
    if (!item) break;
    const { offset, size } = item;

    if (offset + size <= scrollOffset) {
      start = middle + 1;
    } else if (offset > scrollOffset) {
      end = middle - 1;
    } else {
      start = middle;
      break;
    }
  }

  // 计算结束索引
  let stop = start;
  let currentOffset = sizeAndPositionData[start]?.offset || 0;
  const maxOffset = scrollOffset + containerSize;

  while (stop < itemCount && currentOffset < maxOffset) {
    currentOffset += sizeAndPositionData[stop]?.size || 0;
    stop++;
  }

  // 应用预渲染数量
  const overscanStart = Math.max(0, start - overscanCount);
  const overscanStop = Math.min(itemCount - 1, stop + overscanCount);

  return {
    start: overscanStart,
    stop: overscanStop,
  };
};

/**
 * 计算滚动到指定索引的偏移量
 */
export const calculateScrollToIndex = (index: number, alignment: VirtualAlignment, containerSize: number, sizeAndPositionData: SizeAndPositionData[], currentScrollOffset: number): number => {
  if (index < 0 || index >= sizeAndPositionData.length) {
    return currentScrollOffset;
  }

  const item = sizeAndPositionData[index];
  if (!item) {
    return currentScrollOffset;
  }
  const { offset, size } = item;

  switch (alignment) {
    case 'start':
      return offset;

    case 'end':
      return offset + size - containerSize;

    case 'center':
      return offset + size / 2 - containerSize / 2;

    case 'auto':
      // 如果项目已经完全可见，不需要滚动
      if (offset >= currentScrollOffset && offset + size <= currentScrollOffset + containerSize) {
        return currentScrollOffset;
      }
      // 如果项目在视口上方，滚动到开始位置
      else if (offset < currentScrollOffset) {
        return offset;
      } else {
        // 如果项目在视口下方，滚动到结束位置
        return offset + size - containerSize;
      }
    default:
      // 如果项目已经完全可见，不需要滚动
      if (offset >= currentScrollOffset && offset + size <= currentScrollOffset + containerSize) {
        return currentScrollOffset;
      }
      // 如果项目在视口上方，滚动到开始位置
      else if (offset < currentScrollOffset) {
        return offset;
      } else {
        // 如果项目在视口下方，滚动到结束位置
        return offset + size - containerSize;
      }
  }
};

/**
 * 获取总尺寸
 */
export const getTotalSize = (sizeAndPositionData: SizeAndPositionData[]): number => {
  if (sizeAndPositionData.length === 0) {
    return 0;
  }

  const lastItem = sizeAndPositionData[sizeAndPositionData.length - 1];
  if (!lastItem) {
    return 0;
  }
  return lastItem.offset + lastItem.size;
};

/**
 * 创建项目样式
 */
export const createItemStyle = (index: number, sizeAndPositionData: SizeAndPositionData[], direction: VirtualDirection): React.CSSProperties => {
  const item = sizeAndPositionData[index];
  if (!item) {
    return {};
  }

  const { offset, size } = item;
  const offsetProp = getOffsetProp(direction);
  const sizeProp = getSizeProp(direction);

  return {
    position: 'absolute',
    [offsetProp]: offset,
    [sizeProp]: size,
    [direction === 'vertical' ? 'width' : 'height']: '100%',
  };
};

/**
 * 节流函数 - 支持React事件
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(null, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(null, args);
      }, remaining);
    }
  }) as T;
};

/**
 * React事件专用节流函数
 */
export const throttleReactEvent = (func: (event: React.UIEvent<HTMLDivElement>) => void, wait: number): ((event: React.UIEvent<HTMLDivElement>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return (event: React.UIEvent<HTMLDivElement>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(event);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(event);
      }, remaining);
    }
  };
};
