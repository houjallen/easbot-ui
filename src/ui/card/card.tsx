/**
 * Card 卡片组件（eas-ui-next 封装）
 *
 * @description
 * 该组件完全复用 design-system 的 Card 及其子组件，无任何自定义扩展。
 * 所有样式、结构、主题变量均与 design-system 保持一致。
 * 使用方式与 design-system 完全一致，详见 design-system 文档。
 */

import React from 'react';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '../../design-system/components/ui/card';

/**
 * Card 相关类型定义（eas-ui-next 按规范导出，便于类型提示和复用）
 */

/**
 * Card 组件 props 类型
 * @description 对应 <div> 元素的所有属性
 */
export type CardProps = React.ComponentProps<'div'>;

/**
 * CardHeader 组件 props 类型
 * @description 对应 <div> 元素的所有属性
 */
export type CardHeaderProps = React.ComponentProps<'div'>;

/**
 * CardTitle 组件 props 类型
 * @description 对应 <div> 元素的所有属性
 */
export type CardTitleProps = React.ComponentProps<'div'>;

/**
 * CardDescription 组件 props 类型
 * @description 对应 <div> 元素的所有属性
 */
export type CardDescriptionProps = React.ComponentProps<'div'>;

/**
 * CardContent 组件 props 类型
 * @description 对应 <div> 元素的所有属性
 */
export type CardContentProps = React.ComponentProps<'div'>;

/**
 * CardFooter 组件 props 类型
 * @description 对应 <div> 元素的所有属性
 */
export type CardFooterProps = React.ComponentProps<'div'>;

/**
 * CardAction 组件 props 类型
 * @description 对应 <div> 元素的所有属性
 */
export type CardActionProps = React.ComponentProps<'div'>;
