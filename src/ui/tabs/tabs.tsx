import { Tabs as DsTabs, TabsContent as DsTabsContent, TabsList as DsTabsList, TabsTrigger as DsTabsTrigger } from '../../design-system/components/ui/tabs';
import * as React from 'react';

/**
 * 标签页组件
 *
 * @description
 * 提供内容分页切换功能，支持以下核心特性：
 * 1. 受控/非受控模式
 * 2. 响应式布局
 * 3. 无障碍访问支持
 * 4. 自定义样式扩展
 * 5. 动画过渡效果
 */
export const Tabs = DsTabs;

/**
 * 标签页列表容器
 * @param className 自定义类名
 */
export const TabsList = DsTabsList;

/**
 * 标签页触发器
 * @param className 自定义类名
 */
export const TabsTrigger = DsTabsTrigger;

/**
 * 标签页内容区域
 * @param className 自定义类名
 */
export const TabsContent = DsTabsContent;

// 类型导出，带中文注释
export type TabsProps = React.ComponentProps<typeof Tabs>; // 标签页根组件属性
export type TabsListProps = React.ComponentProps<typeof TabsList>; // 标签页列表容器属性
export type TabsTriggerProps = React.ComponentProps<typeof TabsTrigger>; // 标签页触发器属性
export type TabsContentProps = React.ComponentProps<typeof TabsContent>; // 标签页内容属性
