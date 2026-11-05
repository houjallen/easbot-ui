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
 *
 * @description
 * 纯图标按钮（无文字标签），用于表格工具栏、浮层操作、切换器等场景。
 *
 * ## 默认样式：ghost（无背景 / 无边框 / 无阴影）
 *
 * 📌 与全库图标按钮的既有约定保持一致 —— `CloseButton`（`ui/button/close-button.tsx`）、
 *   `Button variant="ghost"`（`ui/button/button.tsx`）、`overlayCloseButtonClass`
 *   （`design-system/components/ui/overlay-surface.ts`）**三者均为 ghost 风格**：
 *   无静态背景、无边框、无阴影，仅在 `hover` 时给出背景反馈。
 *
 *   IconButton 曾默认使用 `bg-card + shadow-sm`，是全库**唯一**带底色的图标按钮，
 *   与上述约定相悖 —— 深色背景上浮出的白色方块尤其突兀（见 `ui/file/FileList.tsx`）。
 *
 * ⚠️ **应用如需特殊外观，请通过 `className` 自行指定**
 *    （如 `bg-primary/10` 表达激活态、`bg-muted` 表达实体按钮）。
 *    `className` 经 `cn()`（clsx + twMerge）合并，末位类名可**覆盖**默认样式。
 *
 * ## 焦点态约定
 *
 * 📌 焦点指示**不得**表现为「描边」—— 一旦在元素边缘画出一圈实线，
 *    用户会把它当成「选中态」而非「当前焦点」。
 *
 * 📌 与全库 design-system 组件保持一致（见 `design-system/components/ui/button.tsx`）：
 * - `outline-none` —— 移除浏览器默认焦点框；
 * - `focus-visible:*` —— 仅**键盘**导航时显示焦点指示（鼠标点击不显示）；
 * - `focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2`
 *   —— 用 **`outline`** 而非 `ring` 表达焦点。
 *
 * ⚠️ **为什么不用 `ring`** ——
 *    `ring` 会**紧贴元素边缘绘制**，在圆形按钮上它与 `border-radius` 完全重合，
 *    视觉上就是一圈「描边」；`ring` 只有在**配合 `ring-offset`** 留出空隙时
 *    才能与描边区分，但空隙会被元素自身背景切割，看起来仍是双层边框。
 *    `outline` 绘制在**元素之外**且自带 `outline-offset`，天然与元素分离，
 *    既保留焦点可见性（WCAG 2.4.7），又不会被误读为「选中样式」。
 *
 * ⚠️ **不得**用 `focus:`（而非 `focus-visible:`）—— 鼠标点击也会触发，
 *    点击后焦点圈常驻，看起来像「选中态」。
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconType, shape = 'circle', variant = 'default', size = 32, disabled = false, className, style, children, onClick, ...props }, ref) => {
    return (
      <button
        type="button"
        className={cn(
          'relative inline-flex items-center justify-center transition-opacity',
          // 📌 ghost 风格 —— 无静态背景 / 边框 / 阴影，仅 hover 时反馈（对齐全库图标按钮约定）
          'hover:bg-accent hover:text-accent-foreground',
          // 📌 **禁用态必须显式关掉 hover 反馈** —— `:hover` 伪类对 `button:disabled`
          //    依然命中：事件被拦住了，但鼠标悬停仍会浮出 `bg-accent` 背景、文字变
          //    `accent-foreground`，看起来「禁用还亮着」。
          //    用 `disabled:hover:*`（特异性 0,2,0）压过调用方 `className` 里的
          //    自定义 hover 类（0,1,0，如 Tree 箭头的 `hover:bg-muted-foreground/20`）。
          'disabled:hover:bg-transparent disabled:hover:text-current',
          // 📌 焦点指示 —— 用 `outline`（绘制在元素**之外**）而非 `ring`（紧贴边缘）。
          //    圆形按钮上 `ring` 会与 `border-radius` 重合成一圈「描边」，被误读为选中态。
          'outline-none focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2',
          shape === 'square' ? 'rounded-[var(--radius-md)]' : 'rounded-full',
          // 📌 **禁用态用 `cursor-not-allowed` 而非 `pointer-events-none`** ——
          //    `pointer-events: none` 让元素对鼠标完全透明，浏览器解析光标时命中的是**下层元素**，
          //    于是 `cursor: not-allowed` 永远不会生效（用户看到的仍是默认箭头）。
          //    详见 `src/theme/styles/prefix.css` 的「全局 button 鼠标样式」说明。
          disabled ? 'cursor-not-allowed opacity-50' : '',
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
