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
    return (
      <Comp
        ref={ref}
        className={cn('inline-flex select-none items-center rounded-full font-medium transition-colors', tagVariantClass[variant], tagSizeClass[size], className)}
        style={mergedStyle}
        {...props}
      >
        {icon && <span className="mr-1 flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {closable && (
          <button
            type="button"
            className="ml-1 rounded-full p-0.5 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={t('closeAriaLabel')}
            tabIndex={0}
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Comp>
    );
  },
);
Tag.displayName = 'Tag';
