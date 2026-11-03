'use client';

import { cn } from '../../utils/classnames';
import React from 'react';
import type { ReactNode } from 'react';
import { Icon } from './icon';
import type { IconProps } from './icon';

/**
 * IconButton 组件 props
 * @property shape 按钮形状：圆形(circle) 或方形(square)
 * @property variant 主题变体
 * @property size 尺寸（像素）
 * @property disabled 是否禁用
 * @property children 可选内容（如 badge、角标）
 * @property onClick 点击事件
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon?: IconProps['name'] | React.ReactNode; // 图标名或自定义节点
  iconType?: IconProps['type']; // 新增：图标类型
  shape?: 'circle' | 'square';
  variant?: IconProps['variant'];
  size?: number | string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * IconButton 图标按钮组件
 * 主题样式与 Avatar 完全一致，支持圆形/方形、变体色、尺寸、禁用等
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconType, shape = 'circle', variant = 'default', size = 32, disabled = false, className, style, children, onClick, ...props }, ref) => {
    return (
      <button
        type="button"
        className={cn(
          'relative inline-flex items-center justify-center opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          shape === 'square' ? 'rounded-[var(--radius-md)]' : 'rounded-full',
          disabled ? 'pointer-events-none opacity-50' : '',
          'bg-card text-card-foreground shadow-sm',
          className,
        )}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          ...style,
        }}
        disabled={disabled}
        ref={ref}
        onClick={onClick}
        {...props}
      >
        {/* 图标内容 */}
        {typeof icon === 'string' ? <Icon name={icon} type={iconType} variant={variant} size={size && typeof size === 'number' ? size * 0.6 : 20} /> : icon}
        {/* 可选内容（如角标/badge等） */}
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'EASIconButton';
