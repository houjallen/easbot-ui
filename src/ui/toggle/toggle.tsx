import { Toggle as DsToggle } from '../../design-system/components/ui/toggle';
import * as React from 'react';

/**
 * 开关按钮组件
 *
 * @description
 * 提供状态切换功能，支持以下核心特性：
 * 1. 多种样式变体
 * 2. 尺寸控制
 * 3. 无障碍访问支持
 * 4. 键盘操作支持
 * 5. 自定义样式扩展
 */
export const Toggle = DsToggle;

// 类型导出，带中文注释
export type ToggleProps = React.ComponentProps<typeof Toggle>; // 开关按钮组件属性
