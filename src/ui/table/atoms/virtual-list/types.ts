/**
 * 虚拟列表类型定义
 * 基于我们的组件规范，使用函数式组件和现代React模式
 */

import type { VirtualizationConfig } from '../../index';
import type { ReactNode } from 'react';

/**
 * 对齐方式枚举
 */
export type VirtualAlignment = 'auto' | 'start' | 'center' | 'end';

/**
 * 滚动方向枚举
 */
export type VirtualDirection = 'vertical' | 'horizontal';

/**
 * 滚动变化原因
 */
export type ScrollChangeReason = 'observed' | 'requested';

/**
 * 项目尺寸获取函数
 */
export type ItemSizeGetter = (index: number) => number;

/**
 * 项目渲染函数
 */
export type ItemRenderer = (params: { index: number; style: React.CSSProperties; isScrolling?: boolean }) => ReactNode;

/**
 * 滚动事件回调
 */
export interface ScrollEventData {
  scrollDirection: VirtualDirection;
  scrollOffset: number;
  scrollUpdateWasRequested: boolean;
}

/**
 * 项目渲染事件回调
 */
export interface ItemsRenderedEventData {
  overscanStartIndex: number;
  overscanStopIndex: number;
  visibleStartIndex: number;
  visibleStopIndex: number;
}

/**
 * 虚拟列表配置接口
 * 继承VirtualizationConfig并重写必需的属性
 */
export interface VirtualListProps extends Omit<VirtualizationConfig, 'renderItem' | 'itemCount' | 'height'> {
  /** 容器高度 - 必需参数 */
  height: number;
  /** 项目数量 - 必需参数 */
  itemCount: number;
  /** 项目渲染函数 - 必需参数 */
  renderItem: ItemRenderer;
}

/**
 * 尺寸和位置数据
 */
export interface SizeAndPositionData {
  offset: number;
  size: number;
}

/**
 * 可见范围数据
 */
export interface VisibleRange {
  start: number;
  stop: number;
}

/**
 * 滚动到索引的配置
 */
export interface ScrollToIndexConfig {
  index: number;
  alignment?: VirtualAlignment;
}
