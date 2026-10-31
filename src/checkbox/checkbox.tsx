/**
 * Checkbox 复选框组件
 *
 * @description
 * 基于 Radix UI 的 Checkbox 组件实现，提供了完善的无障碍支持。
 * 支持多种状态和样式变体。
 */

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Minus } from 'lucide-react';
import { cn } from '../utils/classnames';

// Checkbox 样式变体定义
const checkboxVariants = cva(
  'peer shrink-0 rounded-[2px] border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:border-gray-300 dark:disabled:border-gray-600 data-[state=checked]:border-primary data-[state=checked]:bg-primary',
  {
    variants: {
      variant: {
        default: 'border-gray-400 hover:border-gray-600 hover:bg-accent/20 active:bg-accent/30 dark:border-gray-500 dark:hover:border-gray-300',
        success: 'border-success data-[state=checked]:bg-success hover:bg-success/90',
        warning: 'border-warning data-[state=checked]:bg-warning hover:bg-warning/90',
        destructive: 'border-destructive data-[state=checked]:bg-destructive hover:bg-destructive/90',
      },
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Checkbox 属性接口定义
export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, VariantProps<typeof checkboxVariants> {
  /** 中间态控制 */
  indeterminate?: boolean;
  /** 标签文本 */
  label?: string;
  /** 描述文本 */
  description?: string;
  /** 错误信息 */
  error?: string;
  /** 波纹颜色 */
  rippleColor?: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 滑动回调 */
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  /** 波纹动画时长 (ms) */
  rippleDuration?: number;
  /** 是否启用水波纹效果 */
  enableRipple?: boolean;
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
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, variant, size, indeterminate, label, description, error, children, rippleColor, disabled, onSwipe, rippleDuration = 600, enableRipple = false, ...props }, ref) => {
    const [isIndeterminate, setIsIndeterminate] = React.useState(indeterminate);
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
      setIsIndeterminate(indeterminate);
    }, [indeterminate]);

    React.useEffect(() => {
      if (ripples.length > 0) {
        const timer = setTimeout(() => {
          setRipples([]);
        }, rippleDuration);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [ripples, rippleDuration]);

    const handleCheckedChange = (checked: CheckboxPrimitive.CheckedState) => {
      if (props.onCheckedChange) {
        props.onCheckedChange(checked);
      }
      if (checked === true || checked === false) {
        setIsIndeterminate(false);
      }
    };

    const handleClick = (event: React.MouseEvent) => {
      if (disabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      setRipples((prev) => [...prev, { id: Date.now(), x: event.clientX - rect.left, y: event.clientY - rect.top }]);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      setStartPos({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - startPos.x;
      const deltaY = touch.clientY - startPos.y;

      const SWIPE_THRESHOLD = 30; // 可配置化
      if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
        const direction = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 'right' : 'left') : deltaY > 0 ? 'down' : 'up';
        onSwipe?.(direction);
      }
    };

    return (
      <div className="flex gap-2 relative overflow-hidden">
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(checkboxVariants({ variant, size }), className)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          onCheckedChange={handleCheckedChange}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          {...props}
        >
          {/* 波纹效果层 */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className={cn('absolute animate-ripple rounded-full opacity-25', !enableRipple && 'hidden')}
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: 'translate(-50%, -50%)',
                backgroundColor: rippleColor || 'currentColor',
                animationDuration: `${rippleDuration}ms`,
              }}
            />
          ))}
          <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-primary-foreground')}>
            {isIndeterminate ? (
              <Minus
                className={cn({
                  'h-2 w-2': size === 'sm',
                  'h-3 w-3': size === 'default' || !size,
                  'h-4 w-4': size === 'lg',
                })}
              />
            ) : (
              <Check
                className={cn({
                  'h-2 w-2': size === 'sm',
                  'h-3 w-3': size === 'default' || !size,
                  'h-4 w-4': size === 'lg',
                })}
              />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {(label || description || children || error) && (
          <div className="grid gap-1.5 leading-none">
            {(label || children) && (
              <label htmlFor={props.id} className={cn('text-sm font-medium leading-none', { 'cursor-not-allowed opacity-70': disabled, 'text-destructive': error })}>
                {label || children}
              </label>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
