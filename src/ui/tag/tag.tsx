import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import { Slot } from '@radix-ui/react-slot';
import { X } from 'lucide-react';
import * as React from 'react';

export type TagVariant = 'default' | 'success' | 'warning' | 'info' | 'error' | 'secondary' | 'outline';
export type TagSize = 'sm' | 'md' | 'lg';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement>, UiMessageProps {
  /** 标签文本内容 */
  children?: React.ReactNode;
  /** 主题变体 */
  variant?: TagVariant;
  /** 尺寸 */
  size?: TagSize;
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭事件 */
  onClose?: (e: React.MouseEvent) => void;
  /** 图标 */
  icon?: React.ReactNode;
  /** 自定义颜色（优先级高于 variant） */
  color?: string;
  /** 是否作为子元素渲染 */
  asChild?: boolean;
}

const tagVariantClass: Record<TagVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  error: 'bg-red-50 text-red-700 border border-red-200',
  secondary: 'bg-gray-200 text-gray-700 border border-gray-300',
  outline: 'bg-transparent text-gray-800 border border-gray-300',
};

const tagSizeClass: Record<TagSize, string> = {
  sm: 'text-xs px-2 py-0.5 h-6',
  md: 'text-sm px-3 py-1 h-8',
  lg: 'text-base px-4 py-1.5 h-10',
};

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', size = 'md', closable = false, onClose, icon, color, children, asChild = false, style, locale, messages, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';
    const { t } = useComponentMessage('toast', { locale, messages });
    const mergedStyle = color ? { ...style, backgroundColor: color, borderColor: color, color: '#fff' } : style;

    // 📌 **children 必须包装成单个元素** ——
    //    Radix `Slot` 要求**唯一**的 React 元素子节点（`React.Children.count(children) === 1`），
    //    否则运行时抛 `Slot failed to slot onto its children`。
    //    本组件的内容由「图标 / 文本 / 关闭按钮」三部分组成，若直接作为 Slot 的 children
    //    就会违反该约束 —— 因此统一包进一个 `<span>`。
    //    对齐 `ui/button/button.tsx` 的同类处理（Button 也把 children 包进单个 `<div>`）。
    const content = (
      <>
        {icon && <span className="mr-1 flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {closable && (
          <button
            type="button"
            // 📌 焦点指示用 `outline`（绘制在元素**之外**）而非 `ring`（紧贴边缘）——
            //    `ring` 在小圆点上与 `border-radius` 完全重合，视觉上就是一圈「描边」，
            //    会被误读为「选中态」。详见 `ui/icon/icon-button.tsx` 的「焦点态约定」。
            // 📌 `hover:bg-accent` 走主题令牌，替代硬编码的 `hover:bg-gray-200`（不随暗色主题变化）。
            className="ml-1 rounded-full p-0.5 hover:bg-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2"
            aria-label={t('closeAriaLabel')}
            tabIndex={0}
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </>
    );

    return (
      <Comp
        ref={ref}
        className={cn('inline-flex select-none items-center rounded-full font-medium transition-colors', tagVariantClass[variant], tagSizeClass[size], className)}
        style={mergedStyle}
        {...props}
      >
        {asChild ? <span className="inline-flex items-center">{content}</span> : content}
      </Comp>
    );
  },
);
Tag.displayName = 'Tag';
