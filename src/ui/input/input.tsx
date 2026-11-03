import { cn } from '../../utils/classnames'; // Updated cn import path
import { Input as DsInput } from '../../design-system/components/ui/input';
import * as React from 'react';

// Type Aliases for Input
/**
 * @title Input 组件的 Ref 类型。
 * @en Ref type for the Input component.
 */
type EunInputRef = React.ElementRef<typeof DsInput>;

/**
 * @title Input 组件的属性。
 * @en Props for the Input component.
 */
interface EunInputProps extends Omit<React.ComponentProps<typeof DsInput>, 'size' | 'prefix'> {
  /**
   * @title 前缀内容（通常是图标或文本）。
   */
  prefix?: React.ReactNode;
  /**
   * @title 后缀内容（通常是图标或文本）。
   */
  suffix?: React.ReactNode;
  /**
   * @title 错误状态。
   * @default false
   */
  error?: boolean;
  /**
   * @title 成功状态。
   * @default false
   */
  success?: boolean;
  /**
   * @title 加载状态。
   * @default false
   */
  loading?: boolean;
  /**
   * @title 外部包裹 `div` 的 CSS 类名。
   */
  wrapperClassName?: string;
  /**
   * @title 前缀/后缀图标的尺寸。
   * @default '1rem'
   */
  iconSize?: string;
}

/**
 * @title Input 输入框组件
 * @description
 * 基于 `@repo/design-system` 的 `Input` 组件进行封装，提供了更灵活的前后缀支持。
 * 样式和核心行为依赖于 `design-system`。
 * 支持通过 `error` 属性展示错误状态，通过 `loading` 属性展示加载状态。
 * `warning` 状态的视觉反馈建议由外层表单项组件处理。
 */
const Input: React.ForwardRefExoticComponent<EunInputProps & React.RefAttributes<EunInputRef>> = React.forwardRef<EunInputRef, EunInputProps>(
  ({ className, type = 'text', prefix, suffix, error = false, success = false, loading = false, disabled, wrapperClassName, iconSize = '1rem', ...props }, ref) => {
    const isDisabled = disabled || loading;
    const hasError = !!error;

    // 根据是否存在前缀/后缀动态添加内边距，确保文本不会与图标重叠
    const prefixPaddingClass = prefix ? 'pl-10' : ''; // 假设图标容器宽度为 w-10 (2.5rem)
    const suffixPaddingClass = suffix ? 'pr-10' : ''; // 假设图标容器宽度为 w-10 (2.5rem)

    return (
      <div className={cn('relative flex items-center', wrapperClassName)}>
        {prefix && (
          <div
            className="absolute top-0 left-0 flex h-full w-10 items-center justify-center text-muted-foreground"
            style={{ height: '100%' }} // 确保图标容器占满高度以便垂直居中
          >
            {/* 克隆前缀元素并注入样式以控制其尺寸 */}
            {React.isValidElement(prefix)
              ? React.cloneElement(prefix as React.ReactElement<{ style?: React.CSSProperties }>, {
                  ...((
                    prefix as React.ReactElement<{
                      style?: React.CSSProperties;
                    }>
                  ).props || {}),
                  style: {
                    ...((
                      prefix as React.ReactElement<{
                        style?: React.CSSProperties;
                      }>
                    ).props?.style || {}),
                    fontSize: iconSize,
                    width: iconSize,
                    height: iconSize,
                  },
                })
              : prefix}
          </div>
        )}
        <DsInput
          type={type}
          ref={ref}
          className={cn(
            prefixPaddingClass,
            suffixPaddingClass,
            // 优先级：error > success > 默认
            error ? 'border-[var(--destructive)] focus:ring-[var(--destructive)]' : success ? 'border-[var(--success)] focus:ring-[var(--success)]' : '',
            className,
          )}
          disabled={isDisabled}
          aria-invalid={hasError || undefined} // DS Input 应根据此属性应用错误样式
          aria-busy={loading || undefined} // 指示组件正在加载
          {...props} // 将其余属性传递给底层的 DsInput
        />
        {suffix && (
          <div
            className="absolute top-0 right-0 flex h-full w-10 items-center justify-center text-muted-foreground"
            style={{ height: '100%' }} // 确保图标容器占满高度以便垂直居中
          >
            {/* 克隆后缀元素并注入样式以控制其尺寸 */}
            {React.isValidElement(suffix)
              ? React.cloneElement(suffix as React.ReactElement<{ style?: React.CSSProperties }>, {
                  ...((
                    suffix as React.ReactElement<{
                      style?: React.CSSProperties;
                    }>
                  ).props || {}),
                  style: {
                    ...((
                      suffix as React.ReactElement<{
                        style?: React.CSSProperties;
                      }>
                    ).props?.style || {}),
                    fontSize: iconSize,
                    width: iconSize,
                    height: iconSize,
                  },
                })
              : suffix}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'EunInput'; // 设置组件的显示名称，便于调试

export { Input };
export type { EunInputProps as InputProps, EunInputRef as InputRef };
