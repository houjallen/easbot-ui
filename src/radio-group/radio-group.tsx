import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '../utils/classnames';

// 扩展RadioGroupItem属性接口
export interface RadioGroupItemWithLabelProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /** 标签文本 */
  label?: string;
  /** 描述文本 */
  description?: string;
  /** 错误信息 */
  error?: string;
  /** 禁用状态 */
  disabled?: boolean;
}

/**
 * 单选组根组件
 *
 * @description
 * 管理单选按钮组的状态和布局
 */
const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-[var(--radio-gap)]', className)} ref={ref} {...props} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/**
 * 单选按钮项组件
 *
 * @description
 * 实现单个单选按钮的交互逻辑和样式
 */
const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemWithLabelProps>(({ className, label, description, error, disabled, ...props }, ref) => (
  <div className="flex items-start gap-2">
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square rounded-full border-2 bg-[var(--radio-background)]',
        'h-[var(--radio-size)] w-[var(--radio-size)] border-[var(--radio-border)]',
        'transition-colors hover:border-[var(--radio-hover-border)] hover:bg-[var(--radio-hover-bg)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--radio-focus-ring)]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--radio-focus-ring-offset)]',
        'focus:border-[var(--radio-focus-border)]',
        'disabled:cursor-not-allowed disabled:opacity-[var(--radio-disabled-opacity)]',
        'data-[state=checked]:border-[var(--radio-checked-border)] data-[state=checked]:bg-[var(--radio-checked-bg)]',
        className,
      )}
      disabled={disabled}
      aria-invalid={!!error}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className={cn('fill-[var(--radio-indicator)] text-[var(--radio-indicator)]', 'h-[var(--radio-indicator-size)] w-[var(--radio-indicator-size)]')} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>

    {(label || description || error) && (
      <div className="grid gap-1.5 leading-none pt-1">
        {label && (
          <label htmlFor={props.id} className={cn('text-sm font-medium leading-none', { 'cursor-not-allowed opacity-70': disabled, 'text-destructive': error })}>
            {label}
          </label>
        )}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    )}
  </div>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
export type { RadioGroupProps, RadioGroupItemProps } from '@radix-ui/react-radio-group';
