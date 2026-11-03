import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import { useToast } from '../use-toast/use-toast';
import type { ToasterToast } from '../use-toast/use-toast';
import { Toast, ToastProvider, ToastViewport } from './toast';
import type { ToastPosition } from './types';

/**
 * 滑动方向映射表
 *
 * @description
 * Radix Toast 的 `swipeDirection` 决定手势滑动方向，
 * 而 `ToastPosition` 是九宫格定位，两者不是一一对应关系，
 * 因此需要显式建立映射。
 */
const swipeDirectionMap: Record<ToastPosition, 'up' | 'down' | 'left' | 'right'> = {
  'top-left': 'left',
  'top-center': 'up',
  'top-right': 'right',
  'bottom-left': 'left',
  'bottom-center': 'down',
  'bottom-right': 'right',
};

export interface ToasterProps extends UiMessageProps {
  /** 通知默认显示位置 */
  position?: ToastPosition;
  /** 通知默认停留时长（毫秒）；`Infinity` 表示不自动关闭 */
  duration?: number;
  /** 每条通知的默认样式类名 */
  className?: string;
}

/**
 * 通知渲染容器
 *
 * @description
 * 把 `useToast()` 维护的内存状态渲染为 DOM，是 `toast()` 调用的落地环节。
 *
 * 设计要点：
 * 1. **组件库零业务耦合** —— 不内置 i18n、不绑定任何通知方案，
 *    消费方如需「成功/失败」语义提示，自行通过 `toast({ variant })` 传入。
 * 2. **位置跟随单条通知** —— 每条 toast 可携带自己的 `position`，
 *    缺省时回退到 `Toaster` 的 `position`。
 * 3. **挂载即订阅** —— `useToast` 内部通过模块级 listener 订阅，
 *    因此本组件挂载后即可接收任意位置发起的 `toast()` 调用。
 * 4. **默认标题走内置文案表** —— 未显式传 `title` 时，按 `variant` 取语义化标题
 *    （提示 / 成功 / 警告 / 错误），文案来自内置文案表（见 `spec/i18n-standard.md`）。
 */
export const Toaster = ({ position = 'bottom-right', duration, className, locale, messages }: ToasterProps) => {
  const { toasts } = useToast();
  const { t } = useComponentMessage('toast', { locale, messages });

  // 变体 → 默认标题 key 的映射（缺省 variant 视为 info）
  const variantTitleKeyMap: Record<string, string> = {
    default: 'info',
    destructive: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info',
  };

  /**
   * 手势滑动方向
   *
   * @description
   * Radix 的 `swipeDirection` 是 **Provider 级**属性，不支持逐条设置。
   *
   * 📌 由于本库的 `TOAST_LIMIT = 1`（同时只展示一条通知），
   *    取**最新一条**（列表首项 —— `ADD_TOAST` 用 `[new, ...old]` 头插）的位置
   *    即可得到当前唯一可见通知的手势方向。
   *
   * 📌 若该条未指定位置，则回退到 `Toaster` 的全局默认位置。
   */
  const activePosition = toasts[0]?.position ?? position;

  return (
    // 📌 **`duration` 传给 Provider 作为默认值** ——
    //    Radix 的 `ToastProvider` 级 `duration` 是所有通知的默认展示时长；
    //    单条通知的 `duration`（Root 级）优先级更高，可逐条覆盖。
    <ToastProvider swipeDirection={swipeDirectionMap[activePosition]} duration={duration}>
      {toasts.map(({ id, title, description, action, className: toastClassName, position: toastPosition, variant, duration: toastDuration, ...props }: ToasterToast) => (
        <Toast
          key={id}
          className={cn(toastClassName, className)}
          title={title ?? t(variantTitleKeyMap[variant ?? 'default'] ?? 'info')}
          description={description}
          // 📌 单条通知的位置优先，回退到 `Toaster` 的全局默认位置
          position={toastPosition ?? position}
          // 📌 单条通知的停留时长优先，回退到 `Toaster` 的全局默认时长
          duration={toastDuration ?? duration}
          variant={variant}
          locale={locale}
          messages={messages}
          {...props}
        >
          {action}
        </Toast>
      ))}
      {/*
       * 📌 **Viewport 不再承担定位** ——
       *    定位已下沉到每条通知自身（见 `toastPositionClassMap`），
       *    否则单条通知的 `position` 无处生效
       *    （表现为「点了 top-left，Toast 仍出现在右下角」）。
       *
       *    Viewport 退化为「全屏透明容器」，仅提供 `fixed` 包含块
       *    与 Radix 的焦点代理 / 键盘导航能力。
       */}
      <ToastViewport />
    </ToastProvider>
  );
};
Toaster.displayName = 'Toaster';
