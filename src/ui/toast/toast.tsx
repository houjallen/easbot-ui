import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import { CloseButton } from '../button';
import type { buttonVariants } from '../button';
import type { ToastProps, ToastPosition } from './types';

const ToastProvider = ToastPrimitive.Provider;

/**
 * 单条通知的定位类名（`position: fixed` 场景）
 *
 * @description
 * 📌 **为什么定位下沉到「每条通知」而不是「Viewport」** ——
 *
 * 此前 `position` 挂在 `ToastViewport` 上，只有 `Toaster` 的**全局默认位置**生效；
 * 而 `toast({ position: 'top-left' })` 传入的单条位置**从未被使用**
 * （`Toast` 组件虽然接收了 `position`，但内部并不用它做定位）——
 * 表现为「点了 top-left，Toast 仍出现在右下角」。
 *
 * Radix 的 `ToastViewport` 通过**全局 collection** 收集通知，
 * 多个 Viewport 会互相「抢」通知（每个都拿到全量），
 * 因此「多 Viewport 分组」方案不可行。
 *
 * 故采用 sonner 的做法：**Viewport 退化为全屏透明容器**，
 * 每条通知用 `position: fixed` 自己定位到目标角落。
 *
 * 📌 **偏移量用 `--eas-gap-lg`** —— 与 Viewport 原本的 `p-[var(--eas-gap-lg)]`
 *    保持一致（视口边距 16px）。
 *
 * 📌 **不含 `items-*`** —— 通知是 `fixed` 定位的单体，
 *    `items-*`（flex 主轴对齐）在此**无意义**；
 *    且与容器自身的 `items-center`（内容与关闭按钮的垂直对齐）
 *    属**同一 Tailwind 冲突组**，`twMerge` 会把后者**丢弃**，
 *    导致「内容与关闭按钮不在同一水平线上」。
 */
const toastPositionClassMap: Record<ToastPosition, string> = {
  'top-left': 'top-[var(--eas-gap-lg)] left-[var(--eas-gap-lg)]',
  'top-center': 'top-[var(--eas-gap-lg)] left-1/2 -translate-x-1/2',
  'top-right': 'top-[var(--eas-gap-lg)] right-[var(--eas-gap-lg)]',
  'bottom-left': 'bottom-[var(--eas-gap-lg)] left-[var(--eas-gap-lg)]',
  'bottom-center': 'bottom-[var(--eas-gap-lg)] left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-[var(--eas-gap-lg)] right-[var(--eas-gap-lg)]',
};

/**
 * Toast 关闭按钮类名
 *
 * @description
 * 与 Dialog 的 `overlayCloseIconButtonClass` **形状 / 尺寸 / 内边距一致**，
 * 但**定位策略不同**：
 *
 * | 项目       | Dialog（`overlayCloseIconButtonClass`） | Toast（本类）     |
 * | ---------- | -------------------------------------- | ----------------- |
 * | 定位       | `absolute top-4 right-4`（右上角绝对定位） | `self-center`（右侧居中，参与 flex 布局） |
 * | 形状       | `!rounded-xs`（方角）                    | `!rounded-xs`（方角） |
 * | 尺寸       | `size-6`（24px）                         | `size-6`（24px）  |
 * | 内边距     | `p-0`                                    | `p-0`            |
 *
 * 📌 **为什么 Toast 用「右侧居中」而非「右上角」** ——
 *    通知是**短时、浅层**的信息（标题 + 一行描述），
 *    关闭按钮与内容同行更紧凑；
 *    若置于右上角，则需为按钮预留顶部空白（`pt-9`），
 *    导致首行文字与按钮**不在同一水平线上**，视觉松散。
 *
 * 📌 **`shrink-0`** —— 防止按钮在窄通知中被压缩。
 *
 * 📌 **图标 `size-4` + `shrink-0`** —— 与 Dialog 的 `[&_svg]:size-4` 一致；
 *    `CloseButton` 自带的 `h-4 w-4` 不含 `shrink-0`，此处强制覆盖。
 */
const toastCloseButtonClass =
  '!rounded-xs inline-flex size-6 shrink-0 items-center justify-center self-center p-0 opacity-70 transition-opacity hover:opacity-100 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none';

/**
 * Toast 视口（通知容器）
 *
 * @description
 * 只做两件事：
 * 1. **提供 `position: fixed` 的包含块** —— 让内部通知的 `fixed` 定位
 *    相对**视口**（而非页面）计算，避免被祖先 `transform` 挤出屏幕；
 * 2. **承载 Radix 的焦点代理与键盘导航** —— 这是 Radix `Viewport` 的固有职责。
 *
 * 📌 **不再承担角落定位** —— 定位由每条通知自行完成（见 `toastPositionClassMap`），
 *    否则单条通知的 `position` 无处生效。
 *
 * 📌 **`pointer-events-none`** —— 覆盖全屏的透明容器不应拦截点击；
 *    通知本身用 `pointer-events-auto` 恢复交互（见 `toastVariants`）。
 */
const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> & {
    /**
     * @deprecated 定位已下沉到每条通知自身，此参数不再生效。
     * 保留仅为**向后兼容**（消费方可能仍在传），请改用 `toast({ position })`。
     */
    position?: string;
  }
>(({ className, position: _position, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'pointer-events-none fixed inset-0 z-[var(--eas-z-index-toast)] m-0 flex max-h-none w-auto max-w-none list-none justify-start overflow-visible border-0 bg-transparent p-0',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  // 📌 **定位与尺寸** ——
  //   - `fixed` —— 每条通知相对 **Viewport**（`fixed inset-0`）定位，
  //     由 `toastPositionClassMap` 决定具体角落；
  //   - `w-[var(--toast-min-width)] max-w-[var(--toast-max-width)]` ——
  //     宽度区间 **[240px, 350px]**：
  //     下限保证短文案（如「成功」）不缩成窄条（关闭按钮与标题不挤在一起），
  //     上限兼顾移动端（375px 小屏不溢出）与桌面端阅读行长；
  //   - `min-w-0` —— 允许内容列收缩，长文案换行而非撑破容器。
  //
  //   📌 **不用 `w-full`** —— 通知是 `fixed` 定位，
  //     `w-full` 会撑满视口宽度并覆盖 min/max 区间；
  //     固定基准宽度 + min/max 区间才是通知应有的行为。
  //
  //   📌 **圆角 `rounded-lg`** —— 与 Dialog / AlertDialog / Drawer / Card / Alert 一致
  //   （此前是 `rounded-md`，同一产品族内不一致）。
  //
  //   📌 **内容与关闭按钮同行** —— `items-center` 让两者垂直居中对齐，
  //   关闭按钮位于**右侧居中**（而非右上角）。
  //   这与 Toast 的「短时通知」属性更契合：
  //   通知通常只有标题 + 一行描述，无需为右上角按钮预留顶部空白
  //   （此前用 `pt-9` 预留，导致首行文字与按钮不在同一水平线上）。
  'group pointer-events-auto fixed flex min-h-[64px] w-[var(--toast-min-width)] max-w-[var(--toast-max-width)] min-w-0 items-center justify-between gap-[var(--eas-gap-sm)] overflow-hidden rounded-lg border px-[var(--eas-gap-lg)] py-[var(--eas-gap-sm)] shadow-md transition-all',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground *:data-[slot=toast-description]:text-card-foreground/90 [&>svg]:text-card-foreground', // 使用 card 的颜色
        destructive: 'border-destructive bg-red-50 text-destructive *:data-[slot=toast-description]:text-destructive/90 [&>svg]:text-destructive', // 使用具体的颜色值
        success: 'border-green-400 bg-green-50 text-green-700 *:data-[slot=toast-description]:text-green-700/90 [&>svg]:text-green-700',
        warning: 'border-yellow-400 bg-yellow-50 text-yellow-700 *:data-[slot=toast-description]:text-yellow-700/90 [&>svg]:text-yellow-700',
        info: 'border-blue-400 bg-blue-50 text-blue-700 *:data-[slot=toast-description]:text-blue-700/90 [&>svg]:text-blue-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// Radix Root 继承原生 `li` 属性，其中 `title` / `description` 是 HTML 字符串属性，
// 会与 ToastProps 的 ReactNode 版本交叉成 `string`，这里显式排除后由 ToastProps 接管
type ToastRootProps = Omit<React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>, 'title' | 'description'>;

const Toast = React.forwardRef<React.ComponentRef<typeof ToastPrimitive.Root>, ToastRootProps & VariantProps<typeof toastVariants> & ToastProps>(
  ({ className, variant, position = 'bottom-right', onClose, title, description, children, locale, messages, ...props }, ref) => {
    return (
      <ToastPrimitive.Root
        ref={ref}
        // 📌 **定位类由 `position` 决定** —— 每条通知自己定位到目标角落，
        //    这样 `toast({ position: 'top-left' })` 才真正生效。
        className={cn(toastVariants({ variant }), toastPositionClassMap[position] ?? toastPositionClassMap['bottom-right'], className)}
        onOpenChange={(open) => !open && onClose?.()}
        {...props}
      >
        {/* 📌 内容区 —— `min-w-0 flex-1`：
         *    - `min-w-0`：允许内容列收缩（长标题换行而非撑破容器）；
         *    - `flex-1`：占据剩余空间，把关闭按钮推到**右侧**。
         *
         *    📌 **不再需要 `pr-10`** —— 关闭按钮改为**参与 flex 布局**
         *    （右侧居中），自身占位，不再是 `absolute` 定位，
         *    故无需为它额外预留右侧留白。 */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
          {children}
        </div>
        <ToastClose variant={variant} locale={locale} messages={messages} />
      </ToastPrimitive.Root>
    );
  },
);
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<React.ComponentRef<typeof ToastPrimitive.Action>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-transparent px-3 font-medium text-sm ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:focus:ring-destructive group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close> &
    UiMessageProps & {
      variant?: VariantProps<typeof buttonVariants>['variant'];
    }
>(({ className, variant, 'aria-label': ariaLabel, locale, messages, ...props }, ref) => {
  const { t } = useComponentMessage('toast', { locale, messages });
  return (
    <ToastPrimitive.Close ref={ref} asChild {...props}>
      {/*
       * 📌 **关闭按钮位于右侧居中**（参与 flex 布局，不绝对定位）：
       *    - 位置 `self-center` —— 与内容垂直居中对齐，
       *      通知的「标题 + 一行描述」与按钮在同一水平线上；
       *    - 形状 `rounded-xs`（方角，**不是**圆形 / `rounded-full`）
       *    - 尺寸 `size-6`（24px，保证点击热区）
       *    - 内边距 `p-0`（与 Dialog 一致）
       *
       *    ⚠️ **不用 `overlayCloseIconButtonClass`** —— 该类是 Dialog 场景的
       *    `absolute top-4 right-4`（右上角绝对定位），
       *    Toast 采用**右侧居中**的同行布局，两者定位策略不同。
       *
       *    ⚠️ **`!rounded-xs` 必须带 `!`** —— `CloseButton` 基础类含 `rounded-md`，
       *    `twMerge` 会把同组的 `rounded-xs` **丢弃**（末位优先），
       *    导致形状仍是 `rounded-md`（渲染成圆形观感），与 Dialog 不一致。
       */}
      <CloseButton variant={variant} className={cn(toastCloseButtonClass, className)} aria-label={ariaLabel ?? t('closeAriaLabel')} />
    </ToastPrimitive.Close>
  );
});
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<React.ComponentRef<typeof ToastPrimitive.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('font-bold text-sm', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<React.ComponentRef<typeof ToastPrimitive.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-sm', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
