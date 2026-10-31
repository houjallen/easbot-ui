import { cn } from '../utils/classnames';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

/**
 * 标签组件
 *
 * @description
 * 用于表单元素的文本标签，支持与输入控件关联
 * 提供可定制的样式和状态处理
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    /** 是否必填标记 @default false */
    required?: boolean;
    /** 禁用状态 @default false */
    disabled?: boolean;
  }
>(({ className, required = false, disabled = false, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none text-[var(--label-text)]',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      disabled && 'opacity-50 cursor-not-allowed text-[var(--label-disabled)]',
      className,
    )}
    data-disabled={disabled}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-1 text-[var(--label-required)]" aria-hidden="true">
        *
      </span>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export type { LabelProps } from '@radix-ui/react-label';
export { Label };
