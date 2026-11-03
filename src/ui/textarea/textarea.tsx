import { cn } from '../../utils/classnames'; // Standardized import
import { Textarea as DsTextarea } from '../../design-system/components/ui/textarea';
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

// Define EunTextareaProps for internal use, extending DsTextarea's props
interface EunTextareaProps extends React.ComponentProps<typeof DsTextarea> {
  /**
   * @title 错误状态，边框高亮为错误色
   */
  error?: boolean;
  /**
   * @title 成功状态，边框高亮为成功色
   */
  success?: boolean;
}

const Textarea = React.forwardRef<React.ElementRef<typeof DsTextarea>, EunTextareaProps>(({ className, error, success = false, disabled, maxLength, ...props }, ref) => {
  // DsTextarea handles its own styling, including error states via aria-invalid.
  // It also uses 'field-sizing-content' for auto-height behavior.
  // The custom autoSize JS logic, ScrollAreaPrimitive wrapper, and cva variants were removed.

  return (
    <DsTextarea
      ref={ref}
      className={cn(
        // 优先级：error > success > 默认
        error ? 'border-[var(--destructive)] focus:ring-[var(--destructive)]' : success ? 'border-[var(--success)] focus:ring-[var(--success)]' : '',
        className,
      )}
      disabled={disabled}
      maxLength={maxLength}
      aria-invalid={error || undefined} // 错误状态高亮
      {...props} // Pass all other compatible props to DsTextarea
    />
  );
});

Textarea.displayName = 'EunTextarea';

export { Textarea };
export type { EunTextareaProps as TextareaProps }; // Export EunTextareaProps as TextareaProps
