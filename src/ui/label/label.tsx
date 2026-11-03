import { cn } from '../../utils/classnames'; // Updated cn import path
import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

// Type Aliases for Label
type EunLabelRef = React.ElementRef<typeof LabelPrimitive.Root>;
type EunLabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  /**
   * 是否显示必填星号标记。
   * @default false
   */
  required?: boolean;
  /**
   * 是否禁用标签本身，使其显示为禁用状态。
   * 注意：这独立于关联控件的禁用状态（通过 peer-disabled 处理）或父级 Fieldset 的禁用状态（通过 group-data-[disabled] 处理）。
   * @default false
   */
  disabled?: boolean;
};

/**
 * 标签组件
 *
 * @description
 * 用于表单元素的文本标签，基于 Radix UI LabelPrimitive，样式与 Design System 对齐。
 * 支持通过 `disabled` prop 直接禁用标签，通过 `required` prop 显示必填星号。
 */
const Label: React.ForwardRefExoticComponent<EunLabelProps & React.RefAttributes<EunLabelRef>> = React.forwardRef<EunLabelRef, EunLabelProps>(
  ({ className, required = false, disabled = false, children, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label" // Added data-slot from DS
      data-disabled={disabled} // Kept for EUN 'disabled' prop
      className={cn(
        // Base classes from Design System
        'flex select-none items-center gap-2 font-medium text-sm leading-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        // Styling for EUN 'disabled' prop
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        // Styled asterisk for 'required' prop using DS semantic color
        <span className="ml-1 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  ),
);
Label.displayName = 'EunLabel';

export { Label };
export type { EunLabelProps as LabelProps, EunLabelRef as LabelRef };
