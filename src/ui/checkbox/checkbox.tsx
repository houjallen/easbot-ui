/**
 * Checkbox 复选框组件
 *
 * @description
 * 基于 Radix UI 的 Checkbox 组件实现，提供了完善的无障碍支持。
 * 支持多种状态和样式变体。
 */

// Check and Minus icons are no longer needed as DsCheckbox handles its own indicator
import { cn } from '../../utils/classnames';
import { Checkbox as DsCheckbox } from '../../design-system/components/ui/checkbox';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

// Checkbox 属性接口定义
export type EunCheckboxRef = React.ElementRef<typeof DsCheckbox>;

const eunCheckboxVariants = cva(
  '', // Base classes for EunCheckbox, applied to DsCheckbox
  {
    variants: {
      variant: {
        default: '', // Relies on DsCheckbox's default theme (primary for checked state)
        destructive: [
          // Override Root styles for destructive variant
          // For unchecked state, primarily border color. DsCheckbox uses border-input.
          '!border-destructive',
          // For checked state: background, text (for indicator), and border.
          'data-[state=checked]:!bg-destructive data-[state=checked]:!text-destructive-foreground data-[state=checked]:!border-destructive',
          // Note: DsCheckbox already has aria-invalid styles for destructive border/ring.
          // This variant provides an explicit destructive theme regardless of aria-invalid.
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface EunCheckboxProps extends Omit<React.ComponentPropsWithoutRef<typeof DsCheckbox>, 'size' | 'children'>, VariantProps<typeof eunCheckboxVariants> {
  // Base on DsCheckbox props, omit children as we use label/children prop differently
  /** 中间态控制 */
  indeterminate?: boolean;
  /** 标签文本 */
  label?: string;
  /** 描述文本 */
  description?: string;
  /** 错误信息 */
  error?: string;
  // size prop is removed as DS Checkbox has a fixed size. EUN will no longer control core checkbox element size.
  /** 容器额外的 CSS 类名 */
  wrapperClassName?: string;
  /** 标签文本额外的 CSS 类名 */
  labelClassName?: string;
  /** 描述文本额外的 CSS 类名 */
  descriptionClassName?: string;
  /** 错误信息额外的 CSS 类名 */
  errorClassName?: string;
  /** 是否无效状态，用于显示错误样式 */
  isInvalid?: boolean; // Replaces direct error prop for styling the checkbox itself
  // disabled prop is already part of React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
}

/**
 * Checkbox 组件实现
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Checkbox>选项文本</Checkbox>
 *
 * // 带描述
 * <Checkbox description="这是一段描述文本">
 *   选项文本
 * </Checkbox>
 *
 * // 中间态
 * <Checkbox indeterminate>
 *   父选项
 * </Checkbox>
 * ```
 */
const Checkbox: React.ForwardRefExoticComponent<EunCheckboxProps & React.RefAttributes<EunCheckboxRef>> = React.forwardRef<EunCheckboxRef, EunCheckboxProps>(
  (
    {
      className,
      variant,
      indeterminate,
      label,
      description,
      error,
      disabled,
      wrapperClassName,
      labelClassName,
      descriptionClassName,
      errorClassName,
      isInvalid: propIsInvalid,
      onCheckedChange,
      checked,
      ...props
    },
    ref,
  ) => {
    // Removed 'children' and 'size', added 'checked' to destructure for clarity
    // DsCheckbox handles indeterminate state via its 'checked' prop being 'indeterminate'
    // The onCheckedChange callback from DsCheckbox will provide true, false, or 'indeterminate'
    // No separate state for isIndeterminate needed here if `indeterminate` prop directly controls `DsCheckbox`'s checked state.

    return (
      <div data-slot="checkbox-field-wrapper" className={cn('flex items-start gap-2', wrapperClassName)}>
        <DsCheckbox
          ref={ref} // Pass ref to DsCheckbox
          checked={indeterminate ? 'indeterminate' : checked} // Use EUN's indeterminate prop
          onCheckedChange={onCheckedChange} // Pass through onCheckedChange
          disabled={disabled}
          aria-invalid={propIsInvalid || !!error}
          aria-describedby={error && props.id ? `${props.id}-error-text` : undefined}
          className={cn(eunCheckboxVariants({ variant }), className)} // Apply CVA variants and passed className
          {...props} // Pass all other compatible props
        />
        {(label || description || error) && (
          <div data-slot="checkbox-text-wrapper" className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={props.id}
                data-slot="checkbox-label"
                className={cn(
                  'select-none font-medium text-sm leading-none',
                  {
                    'cursor-not-allowed opacity-70': disabled,
                    'text-destructive': !!error || propIsInvalid,
                  },
                  labelClassName,
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p data-slot="checkbox-description" className={cn('text-muted-foreground text-sm', descriptionClassName)}>
                {description}
              </p>
            )}
            {error && (
              <p data-slot="checkbox-error-text" id={props.id ? `${props.id}-error-text` : undefined} className={cn('font-medium text-destructive text-sm', errorClassName)}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'EunCheckbox';

export { Checkbox };
export type { EunCheckboxProps as CheckboxProps, EunCheckboxRef as CheckboxRef };
