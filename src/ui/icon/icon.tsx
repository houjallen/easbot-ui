'use client';

import { cn } from '../../utils/classnames';
import type { UiMessageProps } from '../../utils/ui-message';
import React from 'react';
import type { ReactNode } from 'react';

/**
 * Icon 组件类型
 * @type iconType: 'name' | 'url' | 'class'
 * @type name: 图标名称（全局注册/内置）
 * @type url: 外部 SVG 或图片链接
 * @type className: 自定义 class（如 iconfont）
 * @type variant: 变体颜色
 */
export type IconType = 'name' | 'url' | 'class';
export type IconVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface IconProps extends UiMessageProps {
  type?: IconType;
  name?: string;
  url?: string;
  clazzName?: string; // class 模式专用 className，避免与外层冲突
  variant?: IconVariant;
  size?: number | string;
  children?: React.ReactNode;
  // 透传任意其它属性给内部元素（事件 / data-* / aria-* 等）。
  // ⚠️ 该索引签名会让解构出的具名字段类型退化为 `any`，
  // 因此凡是需要索引 `Record<...>` 的字段（如 `variant`），必须在解构处显式标注类型。
  [key: string]: any; // Allow any other props to be passed through
}

// 变体颜色映射，统一由外层容器控制
const variantColor: Record<IconVariant, string> = {
  default: 'text-[var(--foreground)]',
  destructive: 'text-[var(--destructive)]',
  success: 'text-[var(--success)]',
  warning: 'text-[var(--warning)]',
  info: 'text-[var(--info)]',
};

// 全局 icon 注册表
const globalIconRegistry = new Map<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>();

// 支持 i18n 文案（`locale` / `messages`）的 icon 注册表
//
// ⚠️ 与普通 icon 注册表分开的原因：
// `locale` / `messages` 是 React 侧专用属性，透传到普通 SVG 组件（lucide / radix）
// 会触发 React 未知属性告警。只有带 i18n 文案的图标（主题图标）才接收这两个属性。
const i18nIconRegistry = new Map<string, React.ComponentType<EasIconComponentProps>>();

/** 支持 i18n 文案的图标组件 props */
export type EasIconComponentProps = React.SVGProps<SVGSVGElement> & UiMessageProps;

// 获取全局 icon 注册表副本
export function getGlobalIconRegistry() {
  return globalIconRegistry;
}

/**
 * 全局注册支持 i18n 文案的 icon
 * @param name 图标名称
 * @param Component 组件
 */
export function registerI18nIcon(name: string, Component: React.ComponentType<EasIconComponentProps>) {
  i18nIconRegistry.set(name, Component);
}

/**
 * 全局注册 icon
 * @param name 图标名称
 * @param Component React 组件
 */
export function registerIcon(name: string, Component: React.ComponentType<React.SVGProps<SVGSVGElement>>) {
  globalIconRegistry.set(name, Component);
}

/**
 * Icon 组件，支持三种模式：name/url/class
 * - 普通模式直接返回原始节点
 * - 组件模式支持变体、事件、尺寸
 */
export const Icon = React.forwardRef<HTMLElement, IconProps>(
  (
    {
      type,
      name,
      url,
      clazzName,
      size = 20,
      children,
      variant: variantProp,
      locale,
      messages,
      ...restProps // Capture all other props for inner element
    }: IconProps,
    ref,
  ) => {
    // ⚠️ **必须在此显式标注 `variant` 的类型** ——
    // `IconProps` 的索引签名 `[key: string]: any` 会让解构出的 `variant` 退化为 `any`，
    // 直接用于 `variantColor[variant]` 会报 TS7053。
    // 同时它**不能**进入 `restProps`，否则会被透传到 DOM 元素上（React 未知属性告警）。
    const variant: IconVariant = (variantProp as IconVariant) ?? 'default';
    let autoType: IconType = 'name';
    if (type) {
      autoType = type;
    } else if (url) autoType = 'url';
    else if (clazzName) autoType = 'class';
    else if (name) autoType = 'name';

    let inner: ReactNode = null;

    if (autoType === 'name' && name) {
      // 带 i18n 文案的图标（主题图标）：透传 `locale` / `messages`
      const I18nIconComponent = i18nIconRegistry.get(name);
      if (I18nIconComponent) {
        const finalProps: EasIconComponentProps = { ...restProps, locale, messages };
        if (typeof size === 'number' || typeof size === 'string') {
          finalProps.width = size;
          finalProps.height = size;
        }
        inner = React.createElement(I18nIconComponent, finalProps);
      } else {
        const IconComponent = globalIconRegistry.get(name);
        if (IconComponent) {
          // Merge width/height with other SVG props
          const finalProps = { ...restProps };
          if (typeof size === 'number' || typeof size === 'string') {
            finalProps.width = size;
            finalProps.height = size;
          }
          inner = React.createElement(IconComponent, finalProps);
        }
      }
    } else if (autoType === 'url' && url) {
      // Merge width/height with other img props
      const finalProps = { ...restProps };
      finalProps.src = url;
      finalProps.alt = name || 'icon';
      finalProps.draggable = false;
      if (typeof size === 'number' || typeof size === 'string') {
        finalProps.width = size;
        finalProps.height = size;
      }
      inner = React.createElement('img', finalProps);
    } else if (autoType === 'class' && clazzName) {
      // Merge clazzName with other i props
      const finalProps = { ...restProps };
      finalProps.className = cn(clazzName, finalProps.className);
      finalProps['aria-hidden'] = true;
      inner = React.createElement('i', finalProps, children);
    }

    return (
      <span
        className={cn('eas-icon', variantColor[variant])}
        style={{
          fontSize: size,
          display: 'inline-flex',
          lineHeight: 1,
        }}
        ref={ref as any}
      >
        {inner}
      </span>
    );
  },
);

Icon.displayName = 'EASIcon';
