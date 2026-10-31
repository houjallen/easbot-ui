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

import { cn } from '../utils/classnames';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

// 按钮样式变体定义
const buttonVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] overflow-hidden transition-[color,background-color,border-color,opacity] after:absolute after:inset-0 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] select-none touch-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // 变体样式
      variant: {
        // 默认样式（现代简约风格）
        default:
          'bg-[var(--button-default)] text-[var(--button-default-foreground)] hover:bg-[var(--button-default-hover)] active:bg-[var(--button-default-active)] disabled:bg-[var(--button-default-disabled)] disabled:text-[var(--button-default-disabled-foreground)] transition-colors duration-200',
        // 次要样式
        secondary:
          'bg-[var(--button-secondary)] text-[var(--button-secondary-foreground)] hover:bg-[var(--button-secondary-hover)] active:bg-[var(--button-secondary-active)] disabled:bg-[var(--button-secondary-disabled)] disabled:text-[var(--button-secondary-disabled-foreground)]',
        // 危险操作
        destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--button-destructive-hover)] active:bg-[var(--button-destructive-active)]',
        // 边框样式
        outline: 'border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] dark:hover:bg-[var(--button-accent-hover)]',
        // 幽灵按钮
        ghost: 'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] dark:hover:bg-[var(--button-accent-hover)]',
        // 链接样式
        link: 'text-[var(--primary)] underline-offset-4 hover:underline',
        // 成功样式
        success: 'bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--button-success-hover)] active:bg-[var(--button-success-active)]',
        // 警告样式
        warning: 'bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[var(--button-warning-hover)] active:bg-[var(--button-warning-active)]',
      },
      // 尺寸变体
      size: {
        default: 'h-10 px-4 py-2 text-sm/[1.125rem] tracking-normal', // 默认尺寸
        sm: 'h-9 px-3 rounded-md text-xs/[1.125rem] tracking-normal', // 小型按钮
        lg: 'h-11 px-8 rounded-md text-base/[1.125rem] tracking-normal', // 大型按钮
        icon: 'h-10 w-10 rounded-lg', // 图标按钮
        // 移动端尺寸
        mobile: 'h-12 px-5 py-2.5 text-base/[1.125rem] tracking-normal', // 移动端优化尺寸
      },
    },
    // 默认变体
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// 按钮属性接口定义
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** 是否作为子元素渲染 */
  asChild?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 波纹效果颜色 */
  rippleColor?: string;
  /** 是否启用触觉反馈 */
  hapticFeedback?: boolean;
  /** 是否启用压力感应 */
  pressureSensitive?: boolean;
  /** 长按触发时间（毫秒） */
  longPressDelay?: number;
  /** 长按回调 */
  onLongPress?: () => void;
  /** 滑动回调 */
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  /** 是否启用水波纹效果 */
  enableRipple?: boolean;
}

// 在文件顶部添加类型定义
interface TouchWithForce extends Omit<Touch, 'force'> {
  force?: number;
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export interface PressureSensitiveConfig {
  min?: number;
  max?: number;
  sensitivity?: number;
}

/**
 * Button 组件实现
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
 * <Button leftIcon={<Mail />}>发送邮件</Button>
 *
 * // 加载状态
 * <Button loading>提交中</Button>
 *
 * // 移动端优化
 * <Button
 *   size="mobile"
 *   hapticFeedback
 *   pressureSensitive
 *   onLongPress={() => console.log('长按触发')}
 *   onSwipe={(direction) => console.log('滑动方向:', direction)}
 * >
 *   移动端按钮
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      rippleColor,
      hapticFeedback = false,
      pressureSensitive = false,
      longPressDelay = 500,
      onLongPress,
      onSwipe,
      enableRipple = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    // 状态和引用定义
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const [touchForce, setTouchForce] = React.useState(0);
    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
    const touchStartTime = React.useRef<number>(0);
    const touchStartPos = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const rippleCount = React.useRef(0);

    // 组件类型选择
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    // 无障碍属性配置
    const ariaProps = {
      'aria-disabled': isDisabled,
      'aria-busy': loading,
      role: 'button',
      'aria-label': props['aria-label'] || (loading ? '加载中' : undefined),
    };

    // 增强移动端检测逻辑
    const isMobile = React.useMemo(() => {
      if (typeof window === 'undefined') return false;
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    // 创建波纹效果
    const createRipple = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
        if (isDisabled || !isMobile) return;

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        // 触屏事件取首个触点；鼠标事件直接用 clientX/clientY
        const isTouchEvent = 'touches' in event;
        const touch = isTouchEvent ? event.touches[0] : undefined;
        const clientX = isTouchEvent ? (touch?.clientX ?? 0) : event.clientX;
        const clientY = isTouchEvent ? (touch?.clientY ?? 0) : event.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const id = rippleCount.current++;

        setRipples((prev) => [...prev, { x, y, id }]);

        // 触觉反馈
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(10);
        }

        // 300ms 后移除波纹
        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
        }, 300);
      },
      [isDisabled, isMobile, hapticFeedback],
    );

    // 处理触摸开始
    const handleTouchStart = React.useCallback(
      (event: React.TouchEvent<HTMLButtonElement>) => {
        if (isDisabled) return;

        createRipple(event);
        props.onTouchStart?.(event);

        // 记录触摸开始时间和位置
        touchStartTime.current = Date.now();
        const touch = event.touches[0];
        if (touch) {
          touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        }

        // 触觉反馈
        if (hapticFeedback && navigator.vibrate) {
          navigator.vibrate(10);
        }

        // 压力感应支持
        if (pressureSensitive && touch) {
          const forceTouch = touch as TouchWithForce;
          if (forceTouch.force !== undefined) {
            setTouchForce(forceTouch.force);
          }
        }

        // 长按处理
        if (onLongPress) {
          longPressTimer.current = setTimeout(() => {
            // 触觉反馈
            if (hapticFeedback && navigator.vibrate) {
              navigator.vibrate([50]);
            }
            onLongPress();
          }, longPressDelay);
        }
      },
      [isDisabled, createRipple, props.onTouchStart, hapticFeedback, pressureSensitive, onLongPress, longPressDelay],
    );

    // 压力样式计算
    const pressureStyle = React.useMemo(
      () => ({
        transform: pressureSensitive ? `scale(${1 - touchForce * 0.1})` : undefined,
        transition: 'transform 0.1s ease-out',
      }),
      [pressureSensitive, touchForce],
    );

    // 增加手势冲突处理
    const handleTouchMove = React.useCallback(
      (event: React.TouchEvent<HTMLButtonElement>) => {
        if (isDisabled) return;

        // 处理压力感应
        if (pressureSensitive && event.touches[0]) {
          const touch = event.touches[0] as TouchWithForce;
          const force = touch.force || 0;
          setTouchForce(force);
        }

        // 处理滑动手势
        if (onSwipe) {
          const touch = event.touches[0];
          if (touch) {
            const deltaX = touch.clientX - touchStartPos.current.x;
            const deltaY = touch.clientY - touchStartPos.current.y;

            // 判断是否达到滑动阈值
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
              // 清除长按定时器
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
              }

              const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
              let direction: 'left' | 'right' | 'up' | 'down' = 'right';

              if (angle >= -45 && angle < 45) direction = 'right';
              else if (angle >= 45 && angle < 135) direction = 'down';
              else if (angle >= -135 && angle < -45) direction = 'up';
              else direction = 'left';

              onSwipe?.(direction);
            }
          }
        }

        props.onTouchMove?.(event);
      },
      [isDisabled, pressureSensitive, onSwipe, props.onTouchMove],
    );

    // 处理触摸结束
    const handleTouchEnd = React.useCallback(
      (event: React.TouchEvent<HTMLButtonElement>) => {
        // 清除长按定时器
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }

        // 重置压力值
        setTouchForce(0);

        props.onTouchEnd?.(event);
      },
      [props.onTouchEnd],
    );

    // 点击事件处理
    // 鼠标位置追踪
    const handleMouseMove = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) return;

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        button.style.setProperty('--mask-x', `${x}%`);
        button.style.setProperty('--mask-y', `${y}%`);
      },
      [isDisabled],
    );

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!isDisabled) {
          createRipple(event);
          onClick?.(event);
        }
      },
      [isDisabled, onClick, createRipple],
    );

    // 键盘事件处理
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (['Enter', ' '].includes(event.key)) {
          event.preventDefault();
          event.currentTarget.click();
        }
        props.onKeyDown?.(event);
      },
      [props.onKeyDown],
    );

    // 自动选择移动端尺寸
    const finalSize = isMobile && size === 'default' ? 'mobile' : size;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size: finalSize, className }), 'relative overflow-hidden')}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        style={pressureStyle}
        {...ariaProps}
        {...props}
      >
        {/* 使用单一容器包裹所有子元素 */}
        <div className="flex items-center">
          {/* 加载状态图标 */}
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-icon" aria-hidden="true" />}

          {/* 左侧图标 */}
          {!loading && leftIcon && (
            <span className="mr-2" aria-hidden="true">
              {leftIcon}
            </span>
          )}

          {/* 按钮内容 */}
          <span className="relative z-[1]">{children}</span>

          {/* 右侧图标 */}
          {!loading && rightIcon && (
            <span className="ml-2" aria-hidden="true">
              {rightIcon}
            </span>
          )}

          {/* 波纹效果 */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className={cn('absolute animate-ripple rounded-full bg-current opacity-25', !enableRipple && 'hidden')}
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: 'translate(-50%, -50%)',
                backgroundColor: rippleColor || 'currentColor',
              }}
            />
          ))}
        </div>
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
