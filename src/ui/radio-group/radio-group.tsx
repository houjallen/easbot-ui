import { cn } from '../../utils/classnames';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { CircleIcon } from 'lucide-react';
import * as React from 'react';

export type EunRadioGroupRef = React.ElementRef<typeof RadioGroupPrimitive.Root>;
export type EunRadioGroupItemRef = React.ElementRef<typeof RadioGroupPrimitive.Item>;

// RadioGroup Props - mostly pass-through
export interface EunRadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {}

const radioGroupItemIndicatorVariants = cva('-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-2 fill-current', {
  variants: {
    variant: {
      default: 'text-primary', // Use text-primary to allow fill-current to pick it up
      destructive: 'text-destructive', // Use text-destructive for the indicator
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// RadioGroupItem Props - includes label, description, error
export interface EunRadioGroupItemProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'children'>, VariantProps<typeof radioGroupItemIndicatorVariants> {
  /** 标签文本 */
  label?: string;
  /** 描述文本 */
  description?: string;
  /** 错误信息 */
  error?: string;
  /** 是否无效状态，用于显示错误样式 */
  isInvalid?: boolean;
  /** 容器额外的 CSS 类名 */
  wrapperClassName?: string;
  /** 标签文本额外的 CSS 类名 */
  labelClassName?: string;
  /** 描述文本额外的 CSS 类名 */
  descriptionClassName?: string;
  /** 错误信息额外的 CSS 类名 */
  errorClassName?: string;
  // disabled is part of ComponentPropsWithoutRef
}

/**
 * 单选组根组件
 *
 * @description
 * 管理单选按钮组的状态和布局
 */
const RadioGroup: React.ForwardRefExoticComponent<EunRadioGroupProps & React.RefAttributes<EunRadioGroupRef>> = React.forwardRef<EunRadioGroupRef, EunRadioGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn('grid gap-3', className)} // DS styling
        ref={ref}
        {...props}
      />
    );
  },
);
RadioGroup.displayName = 'EunRadioGroup';

/**
 * 单选按钮项组件
 *
 * @description
 * 实现单个单选按钮的交互逻辑和样式
 */
const RadioGroupItem: React.ForwardRefExoticComponent<EunRadioGroupItemProps & React.RefAttributes<EunRadioGroupItemRef>> = React.forwardRef<EunRadioGroupItemRef, EunRadioGroupItemProps>(
  ({ className, label, description, error, disabled, isInvalid: propIsInvalid, wrapperClassName, labelClassName, descriptionClassName, errorClassName, variant, ...props }, ref) => (
    <div data-slot="radio-group-item-field-wrapper" className={cn('flex items-start gap-2', wrapperClassName)}>
      <RadioGroupPrimitive.Item
        ref={ref}
        data-slot="radio-group-item"
        className={cn(
          // Base styles from DS RadioGroupItem
          'aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input-background/30 dark:aria-invalid:ring-destructive/40',
          // If destructive variant, ensure the text color for the item itself (which indicator inherits via fill-current) is set.
          // This might be redundant if indicatorVariants directly sets fill, but good for consistency.
          // However, DS sets text-primary on the item, so indicator's fill-primary works.
          // For destructive, we want the indicator to be destructive, not necessarily the item's text color.
          // So, we'll primarily rely on radioGroupItemIndicatorVariants for the indicator's color.
          className,
        )}
        disabled={disabled}
        aria-invalid={propIsInvalid || !!error}
        {...props}
      >
        <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className={cn('relative flex items-center justify-center')}>
          <CircleIcon className={cn(radioGroupItemIndicatorVariants({ variant }))} />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>

      {(label || description || error) && (
        <div data-slot="radio-group-item-text-wrapper" className="grid gap-1.5 pt-0.5 leading-none">
          {' '}
          {/* Adjusted pt for better alignment with size-4 radio */}
          {label && (
            <label
              htmlFor={props.id}
              data-slot="radio-group-item-label"
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
            <p data-slot="radio-group-item-description" className={cn('text-muted-foreground text-sm', descriptionClassName)}>
              {description}
            </p>
          )}
          {error && (
            <p data-slot="radio-group-item-error-text" id={props.id ? `${props.id}-error-text` : undefined} className={cn('font-medium text-destructive text-sm', errorClassName)}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  ),
);
RadioGroupItem.displayName = 'EunRadioGroupItem';

export { RadioGroup, RadioGroupItem };
export type { EunRadioGroupProps as RadioGroupProps, EunRadioGroupItemProps as RadioGroupItemProps, EunRadioGroupRef as RadioGroupRef, EunRadioGroupItemRef as RadioGroupItemRef };
