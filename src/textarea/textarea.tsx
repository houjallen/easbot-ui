import { cn } from '../utils/classnames';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * 多行文本输入框组件
 *
 * @description
 * 提供多行文本输入功能，支持以下核心特性：
 * 1. 自适应高度调节
 * 2. 输入长度限制
 * 3. 禁用状态处理
 * 4. 自定义样式扩展
 * 5. 无障碍访问支持
 */

// 样式变体配置
const textareaVariants = cva(
  'flex w-full rounded-[var(--form-input-radius)] min-h-[80px] transition-all duration-200 resize-none',

  {
    variants: {
      variant: {
        default:
          'bg-[var(--form-input-bg)] border border-[var(--form-input-border)] text-[var(--form-input-text)] hover:bg-[var(--form-input-hover-bg)] hover:border-[var(--form-input-hover-border)] focus:bg-[var(--form-input-focus-bg)] focus:border-[var(--form-input-focus-border)] focus:text-[var(--form-input-focus-text)]',
        error:
          'bg-[var(--form-input-error-bg)] text-[var(--form-input-error-text)] border-[var(--form-input-error-border)] focus:border-[var(--form-input-error-border)] focus:bg-[var(--form-input-error-bg)] focus:ring-1 focus:ring-[var(--form-input-error-border)]',
        success:
          'bg-[var(--form-input-success-bg)] text-[var(--form-input-success-text)] border-[var(--form-input-success-border)] focus:border-[var(--form-input-success-border)] focus:bg-[var(--form-input-success-bg)] focus:ring-1 focus:ring-[var(--form-input-success-border)]',
      },
      size: {
        sm: 'p-2 text-sm',
        default: 'p-3 text-base',
        lg: 'p-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// 基础属性类型
type BaseTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

// 增强属性接口
export interface TextareaProps extends BaseTextareaProps, VariantProps<typeof textareaVariants> {
  /** 自定义类名 */
  className?: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 最大输入长度 */
  maxLength?: number;
  /** 错误状态 */
  error?: boolean;
  /** 成功状态 */
  success?: boolean;
  /** 是否启用自动调整高度 */
  autoSize?: boolean;
  /** 最大高度，当启用自动调整高度时有效 */
  maxHeight?: number | string;
  /** 是否使用自定义滚动条 */
  useScrollArea?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, maxLength, variant, size, error, success, autoSize = false, maxHeight, useScrollArea = true, ...props }, ref) => {
    // 自动高度调整逻辑
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (!autoSize) return;

      const target = e.currentTarget;
      // 先重置高度，然后设置为内容高度
      target.style.height = 'auto';

      // 如果设置了最大高度，则限制高度
      if (maxHeight) {
        const maxHeightValue = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
        target.style.maxHeight = maxHeightValue;
        // 如果内容高度超过最大高度，则显示滚动条
        if (target.scrollHeight > target.clientHeight) {
          target.style.overflowY = 'auto';
          return;
        }
      }

      target.style.height = `${target.scrollHeight}px`;
      // 确保没有滚动条
      target.style.overflowY = 'hidden';
    };

    // 确定当前变体
    const currentVariant = error ? 'error' : success ? 'success' : variant;

    // 在组件挂载时设置初始高度
    React.useEffect(() => {
      if (!autoSize || !(ref && 'current' in ref && ref.current)) return;

      const textarea = ref.current;
      // 延迟执行以确保内容已经渲染
      setTimeout(() => {
        textarea.style.height = 'auto';

        // 如果设置了最大高度
        if (maxHeight) {
          const maxHeightValue = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
          textarea.style.maxHeight = maxHeightValue;
          // 如果内容高度超过最大高度，则显示滚动条
          if (textarea.scrollHeight > textarea.clientHeight) {
            textarea.style.overflowY = 'auto';
            return;
          }
        }

        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }, 0);
    }, [ref, autoSize, maxHeight]);

    // 准备样式和属性
    const textareaStyles: React.CSSProperties = {
      ...(autoSize && maxHeight ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } : {}),
      ...(autoSize ? { overflow: 'hidden' } : {}),
    };

    const textareaElement = (
      <textarea
        ref={ref}
        className={cn(
          textareaVariants({ variant: currentVariant, size }),
          'placeholder:text-[var(--form-input-placeholder)]',
          'focus-visible:outline-none focus-visible:ring-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !useScrollArea && !autoSize && 'overflow-auto', // 如果不使用自定义滚动条和自动高度，则显示原生滚动条
          autoSize && 'overflow-hidden', // 如果使用自动高度，则隐藏滚动条
          className,
        )}
        onInput={handleInput}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error}
        style={textareaStyles}
        {...props}
      />
    );

    // 如果使用自定义滚动条且不使用自动高度，则使用自定义实现
    if (useScrollArea && !autoSize) {
      // 计算高度
      const heightStyle = maxHeight ? (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight) : 'auto';

      // 使用ScrollArea组件提供滚动功能
      return (
        <ScrollAreaPrimitive.Root
          className={cn(
            'relative w-full overflow-hidden',
            'border border-[var(--form-input-border)] rounded-[var(--form-input-radius)]',
            'hover:border-[var(--form-input-hover-border)]',
            'focus-within:border-[var(--form-input-focus-border)]',
            'focus-within:ring-1 focus-within:ring-[var(--form-input-focus-border)]',
            'bg-[var(--form-input-bg)]',
          )}
          style={{ height: heightStyle }}
          type="auto"
          scrollHideDelay={300}
        >
          <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] overflow-x-hidden">
            <div className="p-[var(--textarea-padding,0.5rem)] w-full">
              {React.cloneElement(textareaElement, {
                style: {
                  ...textareaStyles,
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: 0,
                  padding: 0,
                  backgroundColor: 'transparent',
                  resize: 'none',
                  overflow: 'auto', // 允许文本域自带的滚动条，确保滚动效果可见
                },
                // 注意：此处必须保留调用方传入的 className，
                // 否则 ScrollArea 包裹场景下自定义类名会被整体覆盖丢失
                className: cn(
                  'border-0 focus:ring-0 focus:border-0 rounded-none bg-transparent',
                  'placeholder:text-[var(--form-input-placeholder)]',
                  (textareaElement.props as { className?: string }).className,
                ),
                onFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => {
                  // 调用原始的onFocus处理函数（如果存在）
                  if (textareaElement.props.onFocus) {
                    textareaElement.props.onFocus(e);
                  }
                  // 添加一个类到父元素，使边框高亮
                  e.currentTarget.closest('div[class*="border"]')?.classList.add('textarea-focused');
                },
                onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
                  // 调用原始的onBlur处理函数（如果存在）
                  if (textareaElement.props.onBlur) {
                    textareaElement.props.onBlur(e);
                  }
                  // 移除高亮类
                  e.currentTarget.closest('div[class*="border"]')?.classList.remove('textarea-focused');
                },
              })}
            </div>
          </ScrollAreaPrimitive.Viewport>
          <ScrollAreaPrimitive.Scrollbar
            orientation="vertical"
            className={cn(
              'flex touch-none select-none transition-all duration-150 ease-in-out',
              'h-full w-[var(--scroll-bar-width)]',
              'border-l border-l-transparent',
              'p-[var(--scroll-bar-padding)]',
              'hover:bg-[var(--scroll-bar-hover-bg)]',
            )}
          >
            <ScrollAreaPrimitive.Thumb
              className={cn(
                'relative flex-1 rounded-[var(--scroll-bar-thumb-radius)]',
                'bg-[var(--scroll-bar-thumb-color)]',
                'transition-colors duration-150 ease-in-out',
                'hover:bg-[var(--scroll-bar-thumb-hover-color)]',
                'max-h-[var(--scroll-bar-thumb-max-size)]',
              )}
            />
          </ScrollAreaPrimitive.Scrollbar>
        </ScrollAreaPrimitive.Root>
      );
    }

    // 否则直接返回文本域
    return textareaElement;
  },
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
