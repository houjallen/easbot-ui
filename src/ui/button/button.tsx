/**
 * Button 按钮组件
 *
 * @description
 * 用于触发一个操作或事件，如提交表单、打开对话框、取消操作或执行删除操作。
 *
 * 特性：
 * 1. 样式变体 - 支持多种预设样式
 * 2. 尺寸变化 - 支持不同大小按钮
 * 3. 状态反馈 - 支持加载、禁用状态
 * 4. 图标支持 - 支持左右图标配置
 * 5. 移动适配：
 *    - 优化触摸区域
 *    - 波纹反馈效果
 *    - 手势支持
 *    - 压力感应
 *    - 触觉反馈
 * 6. 无障碍 - 支持键盘导航和屏幕阅读
 */

import { Icon } from '../icon';
import { cn } from '../../utils/classnames';
import { buttonMessages } from '../../utils/component-messages';
import { processUiMessage } from '../../utils/ui-message';
import { useLocale } from '../../hooks/use-locale';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { buttonSizeMapping, buttonSizeTokens } from './size-tokens';
import type { ButtonSize } from './size-tokens';

// 按钮样式变体定义 - 使用统一的尺寸令牌系统
const buttonVariants = cva(
  // 基础样式 - 移除固定的尺寸和文本大小，由 size 变体控制
  // 📌 **禁用态用 `disabled:cursor-not-allowed` 而非 `disabled:pointer-events-none`** ——
  //    `pointer-events: none` 会让元素对鼠标完全透明，浏览器解析光标时命中的是**下层元素**，
  //    于是 `cursor: not-allowed` 永远不会生效（用户看到的仍是默认箭头）。
  //    详见 `src/theme/styles/prefix.css` 的「全局 button 鼠标样式」说明。
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 border border-transparent',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline: 'border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-input',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'border-green-400 bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-500/30 dark:border-green-600 dark:bg-green-700/20 dark:text-green-400 dark:hover:bg-green-700/30',
        warning:
          'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus-visible:ring-yellow-500/30 dark:border-yellow-600 dark:bg-yellow-700/20 dark:text-yellow-400 dark:hover:bg-yellow-700/30',
        info: 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-500/30 dark:border-blue-600 dark:bg-blue-700/20 dark:text-blue-400 dark:hover:bg-blue-700/30',
      },
      // 使用统一的尺寸令牌系统
      size: {
        xs: '', // 将通过 getSizeClasses 动态生成
        sm: '', // 将通过 getSizeClasses 动态生成
        default: '', // 将通过 getSizeClasses 动态生成
        md: '', // 将通过 getSizeClasses 动态生成
        lg: '', // 将通过 getSizeClasses 动态生成
        xl: '', // 将通过 getSizeClasses 动态生成
        icon: '', // 将通过 getSizeClasses 动态生成
        mobile: '', // 将通过 getSizeClasses 动态生成
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md', // 使用 md 作为默认尺寸，符合前端统一标准
    },
  },
);

/**
 * 获取按钮尺寸相关的 CSS 类名
 * @param size 按钮尺寸
 * @param locale 当前语言（用于日志文案）
 * @returns CSS 类名字符串
 */
function getSizeClasses(size: ButtonSize = 'md', locale?: string): string {
  // 映射传入的 size 到标准尺寸
  const mappedSize = buttonSizeMapping[size] || 'md';
  const token = buttonSizeTokens[mappedSize];

  if (!token) {
    console.warn(processUiMessage('unknownSize', { locale, messages: buttonMessages }, { size }));
    return getSizeClasses('md', locale);
  }

  const classes = [token.height, token.paddingX, token.paddingY, token.fontSize];

  // 图标按钮特殊处理
  if (mappedSize === 'icon') {
    classes.push('w-8', 'rounded-md'); // 32px 固定宽度，与 icon-button.tsx 一致
  } else if (token.minWidth) {
    classes.push(token.minWidth);
  }

  return classes.filter(Boolean).join(' ');
}

// 按钮属性接口定义 - 支持统一尺寸系统
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Omit<VariantProps<typeof buttonVariants>, 'size'> {
  /** 是否作为子元素渲染 */
  asChild?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 按钮尺寸 - 使用统一的尺寸令牌系统 */
  size?: ButtonSize;
  /**
   * 按钮形状
   *
   * @description
   * - `circle` —— 圆形（`rounded-full`），适合纯图标按钮
   * - `square` —— 方形圆角（`rounded-[var(--radius-md)]`），与 `Avatar` / `IconButton` 的 `shape` 语义一致
   *
   * ⚠️ **不传时保持默认的圆角矩形**（`rounded-md`）——
   *    常规文字按钮不应被强制成圆形/方形。
   */
  shape?: 'circle' | 'square';
}

/**
 * Button 组件实现 (简化版)
 *
 * @param props - 按钮属性
 * @param ref - 按钮引用
 * @returns React 组件
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Button>点击我</Button>
 *
 * // 带图标
 * <Button leftIcon={<UserIcon />}>用户</Button>
 *
 * // 加载状态
 * <Button loading>加载中...</Button>
 *
 * // 不同变体和尺寸
 * <Button variant="destructive" size="sm">删除</Button>
 *
 * // 作为子元素链接
 * <Button asChild variant="link">
 *   <a href="/login">登录</a>
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      // 显式解构所有 ButtonProps 中定义的属性，以及在组件逻辑中直接使用的标准HTML属性
      className,
      variant,
      size = 'md',
      shape,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled, // 来自 React.ButtonHTMLAttributes, 在内部逻辑中使用
      children, // 来自 React.ButtonHTMLAttributes, 直接传递
      // 收集所有其他未被显式解构的属性
      ...restButtonProps
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = loading || disabled; // 使用解构出来的 disabled
    const { locale } = useLocale();

    // 从 restButtonProps 中提取出我们想明确控制的 ARIA 属性和 onKeyDown，
    // 以避免它们与我们自己定义的 ariaProps 或 handleKeyDown 逻辑冲突。
    const {
      // 调用方显式指定的 aria-busy / aria-disabled 优先（例如 Combobox 的加载态），
      // 未指定时才回退到组件自身的 loading / disabled 推导值
      'aria-busy': ariaBusyFromCaller,
      'aria-disabled': ariaDisabledFromCaller,
      'aria-live': _ariaLiveFromCaller,
      // 调用方显式指定的 role 优先（例如 Combobox 需要 role="combobox"），
      // 未指定时才回退到默认的 "button"
      role: roleFromCaller,
      onKeyDown: onKeyDownFromCaller, // 用于 handleKeyDown 的依赖和调用
      ...trulyRestProps // 剩余的 props，如 id, type, onClick, 或其他自定义传入的 props
    } = restButtonProps;

    // ARIA 属性，并添加显式类型注解
    // Radix 的 aria-busy / aria-disabled 类型为 `Booleanish`（含 'true' / 'false' 字符串），
    // 这里统一收敛为 boolean，避免把字符串布尔值透传到 DOM
    const ariaProps: {
      'aria-busy'?: boolean;
      'aria-disabled'?: boolean;
      'aria-live'?: 'polite' | 'off' | 'assertive';
      role: 'button' | (string & {});
    } = {
      'aria-busy': ariaBusyFromCaller === undefined ? loading || undefined : ariaBusyFromCaller === true || ariaBusyFromCaller === 'true',
      'aria-disabled': ariaDisabledFromCaller === undefined ? isDisabled || undefined : ariaDisabledFromCaller === true || ariaDisabledFromCaller === 'true',
      'aria-live': loading ? 'polite' : undefined,
      role: roleFromCaller ?? 'button',
    };

    // 键盘事件处理 (保留基础的 Enter 和 Space 点击行为)
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (['Enter', ' '].includes(event.key)) {
          event.preventDefault();
          // 触发原生 click 事件，如果 asChild 为 true，Slot 会处理
          (event.currentTarget as HTMLElement).click();
        }
        // 如果调用者传入了 onKeyDown，则调用它
        onKeyDownFromCaller?.(event);
      },
      [onKeyDownFromCaller], // 依赖于从 restButtonProps 解构出来的 onKeyDownFromCaller
    );

    // 获取尺寸相关的类名
    const sizeClasses = getSizeClasses(size as ButtonSize, locale);
    const sizeToken = buttonSizeTokens[buttonSizeMapping[size as ButtonSize] || 'md'];

    // 📌 **形状类名** —— `shape` 此前是死 prop（声明了但既不解构也无分支），
    //    导致 `shape="square"` 完全无效，且泄漏为非法 DOM 属性 `<button shape="square">`。
    //    语义与 `Avatar` / `IconButton` 的 `shape` 保持一致；
    //    不传时保留 base 里的 `rounded-md`（圆角矩形），常规文字按钮不应被强制变形。
    const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-[var(--radius-md)]' : '';

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size: undefined, className }), // size 设为 undefined，使用我们的 sizeClasses
          sizeClasses, // 应用统一的尺寸类名
          shapeClass, // 应用形状类名（覆盖 base 的 rounded-md）
        )}
        ref={ref}
        disabled={isDisabled} // 直接使用 isDisabled
        onKeyDown={handleKeyDown} // 添加键盘事件处理器
        {...ariaProps} // 优先应用我们控制的 ARIA 属性
        {...trulyRestProps} // 应用其余来自调用者的属性
      >
        {/* 使用单一容器包裹所有子元素 */}
        <div
          className={cn(
            'flex items-center justify-center',
            children && sizeToken?.gap, // 使用令牌中定义的间距
          )}
        >
          {/* 加载状态图标 */}
          {loading && <Loader2 className={cn('animate-spin', sizeToken?.iconSize || 'size-4')} data-testid="loading-icon" aria-hidden="true" />}

          {/* 左侧图标 —— 加载态下不渲染任何自定义图标 */}
          {!loading && leftIcon && (React.isValidElement(leftIcon) && leftIcon.type === Icon ? leftIcon : <span aria-hidden="true">{leftIcon}</span>)}

          {/* 按钮内容 */}
          {children && <span>{children}</span>}

          {/* 右侧图标 —— 加载态下不渲染任何自定义图标 */}
          {!loading && rightIcon && (React.isValidElement(rightIcon) && rightIcon.type === Icon ? rightIcon : <span aria-hidden="true">{rightIcon}</span>)}
        </div>
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
