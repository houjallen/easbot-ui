/**
 * Input 输入框组件
 *
 * 用于获取用户文本输入，支持多种状态、尺寸和样式变体。
 * 可以添加前缀/后缀图标，支持错误状态和禁用状态。
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/classnames';

// 新增类型定义
export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'default' | 'lg';

// 增强样式变体配置
const inputVariants = cva(
  'flex w-full text-base transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--form-input-placeholder)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-default bg-[var(--form-input-bg)] border border-[var(--form-input-border)] text-[var(--form-input-text)] rounded-[var(--form-input-radius)]',
  {
    variants: {
      variant: {
        default:
          'hover:bg-[var(--form-input-hover-bg)] hover:border-[var(--form-input-hover-border)] focus:bg-[var(--form-input-focus-bg)] focus:border-[var(--form-input-focus-border)] focus:text-[var(--form-input-focus-text)]',
        error:
          'bg-[var(--form-input-error-bg)] text-[var(--form-input-error-text)] border-[var(--form-input-error-border)] focus:border-[var(--form-input-error-border)] focus:bg-[var(--form-input-error-bg)] focus:ring-1 focus:ring-[var(--form-input-error-border)]',
        success:
          'bg-[var(--form-input-success-bg)] text-[var(--form-input-success-text)] border-[var(--form-input-success-border)] focus:border-[var(--form-input-success-border)] focus:bg-[var(--form-input-success-bg)] focus:ring-1 focus:ring-[var(--form-input-success-border)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// 基础输入框属性
type BaseInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'suffix'>;

// 增强属性接口
export interface InputProps extends BaseInputProps, VariantProps<typeof inputVariants> {
  /** 前缀内容（图标或文本） */
  prefix?: React.ReactNode;
  /** 后缀内容（图标或文本） */
  suffix?: React.ReactNode;
  /** 错误状态（优先级高于success） */
  error?: boolean;
  /** 成功状态 */
  success?: boolean;
  /** 加载状态（自动禁用输入） */
  loading?: boolean;
  /** 包装容器类名 */
  wrapperClassName?: string;
  /** 自定义图标尺寸 @default "1rem" */
  iconSize?: string;
  /** 过渡动画开关 @default true */
  transition?: boolean;
}

/**
 * Input 组件实现
 *
 * @param props - 输入框属性
 * @param ref - 输入框引用
 * @returns React 组件
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Input placeholder="请输入" />
 *
 * // 带图标
 * <Input prefix={<Search />} placeholder="搜索..." />
 *
 * // 错误状态
 * <Input error placeholder="请输入正确的内容" />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = 'text', prefix, suffix, error, success, loading, disabled, wrapperClassName, iconSize = '1rem', transition = true, ...props }, ref) => {
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    const isDisabled = disabled || loading;

    // 新增过渡动画类
    const transitionClass = transition ? 'transition-colors duration-200 ease-in-out' : '';

    // 图标包装样式
    const iconWrapperStyle = {
      width: `calc(${iconSize} + 0.5rem)`, // 图标尺寸 + 内边距
      height: `calc(${iconSize} + 0.5rem)`,
    };

    return (
      <div className={cn('relative', wrapperClassName)}>
        {prefix && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2" style={iconWrapperStyle}>
            {React.cloneElement(prefix as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, {
              className: cn('w-full h-full', (prefix as React.ReactElement<{ className?: string; style?: React.CSSProperties }>)?.props?.className),
              style: { fontSize: iconSize },
            })}
          </div>
        )}

        {suffix && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2" style={iconWrapperStyle}>
            {React.cloneElement(suffix as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, {
              className: cn('w-full h-full', (suffix as React.ReactElement<{ className?: string; style?: React.CSSProperties }>)?.props?.className),
              style: { fontSize: iconSize },
            })}
          </div>
        )}

        <input
          type={type}
          className={cn(inputVariants({ variant: currentVariant, size }), prefix && 'pl-8', suffix && 'pr-8', transitionClass, className)}
          ref={ref}
          disabled={isDisabled}
          aria-invalid={error}
          aria-busy={loading}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };
