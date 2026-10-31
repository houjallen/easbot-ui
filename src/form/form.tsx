/**
 * Form 组件
 *
 * @description
 * Form组件是一个基于react-hook-form的表单组件，提供了以下功能：
 * - 表单验证
 * - 错误提示
 * - 表单布局
 * - 表单控件组合
 * - 无障碍支持
 */

import { Label } from '../label';
import { Spinner } from '../spinner';
import { cn } from '../utils/classnames';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { useContext } from 'react';
import type { ControllerProps, FieldPath, FieldValues, FormProviderProps as RHFFormProviderProps, UseFormReturn } from 'react-hook-form';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

/**
 * Form 组件容器
 *
 * @description
 * 提供表单上下文，包裹整个表单组件树
 *
 * @example
 * <Form {...form}>
 *   <form>...</form>
 * </Form>
 */
type FormProps<TFieldValues extends FieldValues = FieldValues> = RHFFormProviderProps<TFieldValues> & {
  /** 触摸行为控制 */
  touchAction?: React.CSSProperties['touchAction'];
  /** 上下文扩展 */
  context?: UseFormReturn<TFieldValues> & {
    touchAction?: React.CSSProperties['touchAction'];
  };
  /** 自定义类名 */
  className?: string;
  /** 表单提交处理函数 */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** 子元素 */
  children?: React.ReactNode;
};

const Form = <TFieldValues extends FieldValues = FieldValues>({ touchAction = 'none', className, children, onSubmit, ...props }: FormProps<TFieldValues>) => {
  return (
    <FormProvider<TFieldValues>
      {...props}
      {...(props.context
        ? {
            context: {
              ...props.context,
              touchAction,
            },
          }
        : {})}
    >
      <form className={cn('touch-none', className)} onSubmit={onSubmit}>
        {children}
      </form>
    </FormProvider>
  );
};

// 表单项属性接口
type FormItemContextValue = {
  id: string;
};

// 表单项上下文
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

// 新增表单项样式变体
const formItemVariants = cva('space-y-2', {
  variants: {
    variant: {
      default: '', // 默认垂直布局
      horizontal: 'flex items-center gap-4 [&>div]:flex-1', // 水平布局
    },
    density: {
      compact: 'space-y-1', // 紧凑模式
      normal: 'space-y-2', // 常规模式
      comfortable: 'space-y-3', // 宽松模式
    },
  },
  defaultVariants: {
    variant: 'default',
    density: 'normal',
  },
});

/**
 * 表单项组件
 *
 * @description
 * 包裹单个表单字段，提供布局和错误状态管理
 *
 * @example
 * <FormItem>
 *   <FormLabel>用户名</FormLabel>
 *   <FormControl>
 *     <Input />
 *   </FormControl>
 * </FormItem>
 */
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof formItemVariants>>(({ className, variant, density, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn(
          formItemVariants({ variant, density }), // 应用样式变体
          className,
        )}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

/**
 * 表单标签组件
 *
 * @description
 * 自动关联表单项标签，支持错误状态样式
 *
 * @example
 * <FormLabel>用户名</FormLabel>
 */
const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        'text-[length:var(--form-label-font-size)] font-[var(--form-label-font-weight)] leading-[var(--form-label-line-height)]', // 基础样式
        error && 'text-destructive', // 错误状态
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

/**
 * 表单控件容器组件
 *
 * @description
 * 包裹表单输入控件，处理无障碍属性和错误状态
 *
 * @example
 * <FormControl>
 *   <Input />
 * </FormControl>
 */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & {
    /** 加载状态 */
    isLoading?: boolean;
  }
>(({ isLoading, children, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot ref={ref} id={formItemId} aria-busy={isLoading} aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" /> {/* 加载指示器 */}
          {children}
        </div>
      ) : (
        children
      )}
    </Slot>
  );
});
FormControl.displayName = 'FormControl';

// 表单描述组件
const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={cn('text-[length:var(--form-description-font-size)] text-[var(--form-description-color)]', className)} {...props} />;
});
FormDescription.displayName = 'FormDescription';

// 表单消息组件
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        'text-[length:var(--form-message-font-size)] font-[var(--form-message-font-weight)]',
        error
          ? ['text-[var(--form-message-error-color)]', 'bg-[var(--form-message-error-bg)]', 'border border-[var(--form-message-error-border)]', 'rounded-[var(--radius-sm)] px-2 py-1']
          : 'text-[var(--form-description-color)]',
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField 必须在 FormField 内使用');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// 类型导出
export type FormItemProps = React.ComponentPropsWithoutRef<typeof FormItem>;
export type FormLabelProps = React.ComponentPropsWithoutRef<typeof FormLabel>;
export type FormControlProps = React.ComponentPropsWithoutRef<typeof FormControl>;
export type FormDescriptionProps = React.ComponentPropsWithoutRef<typeof FormDescription>;
export type FormMessageProps = React.ComponentPropsWithoutRef<typeof FormMessage>;
export type FormFieldProps = React.ComponentProps<typeof FormField>;

export type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues> = {
  /** 表单字段名称 */
  name: FieldPath<TFieldValues>;
};

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };

export type { FormProps };
