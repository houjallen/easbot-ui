'use client';

import { cn } from '../../utils/classnames'; // design-system 工具函数 cn
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import {
  AlertDialog as DSAlertDialog,
  AlertDialogAction as DSAlertDialogAction,
  AlertDialogCancel as DSAlertDialogCancel,
  AlertDialogContent as DSAlertDialogContent,
  AlertDialogDescription as DSAlertDialogDescription,
  AlertDialogFooter as DSAlertDialogFooter,
  AlertDialogHeader as DSAlertDialogHeader,
  AlertDialogOverlay as DSAlertDialogOverlay,
  AlertDialogPortal as DSAlertDialogPortal,
  AlertDialogTitle as DSAlertDialogTitle,
  AlertDialogTrigger as DSAlertDialogTrigger,
} from '../../design-system/components/ui/alert-dialog';
import * as React from 'react';
import { CloseButton } from '../button'; // 导入 CloseButton
import { overlayCloseIconButtonClass } from '../../design-system/components/ui/overlay-surface';

/**
 * @description EunAlertDialogProps - AlertDialog 根组件的 Props 接口。
 */
interface EunAlertDialogProps extends React.ComponentPropsWithoutRef<typeof DSAlertDialog> {
  children?: React.ReactNode; // 明确添加 children
  className?: string; // 明确添加 className
  open?: boolean; // 明确添加 open
  onOpenChange?: (open: boolean) => void; // 明确添加 onOpenChange
}

/**
 * @description AlertDialog 组件的根组件，用于包裹其他 AlertDialog 子组件。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#root Radix UI AlertDialog Root}
 * @see {@link https://github.com/shadcn-ui/ui/blob/main/apps/www/components/ui/alert-dialog.tsx Shadcn UI AlertDialog}
 */
// 定义组件的显式类型，确保包含 children 和 className
type EunAlertDialogComponent = React.ForwardRefExoticComponent<EunAlertDialogProps & React.RefAttributes<React.ElementRef<typeof DSAlertDialog>>> & { displayName?: string };

// 将组件赋值给显式类型的常量
const EunAlertDialog: EunAlertDialogComponent = React.forwardRef<React.ElementRef<typeof DSAlertDialog>, EunAlertDialogProps>((props, ref) => <DSAlertDialog ref={ref} {...props} />);
EunAlertDialog.displayName = 'EunAlertDialog';

/**
 * @description AlertDialog 的触发器组件，用于打开对话框。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#trigger Radix UI AlertDialog Trigger}
 */
// 定义组件的显式类型
type EunAlertDialogTriggerComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogTrigger> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogTrigger>> & {
      children?: React.ReactNode;
      className?: string;
    } // Explicitly add children and className
> & { displayName?: string };

// 将组件赋值给显式类型的常量
const EunAlertDialogTrigger: EunAlertDialogTriggerComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogTrigger>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogTrigger> & {
    children?: React.ReactNode;
    className?: string;
  }
>((props, ref) => <DSAlertDialogTrigger ref={ref} {...props} />);
EunAlertDialogTrigger.displayName = 'EunAlertDialogTrigger';

/**
 * @description AlertDialog 的传送门组件，用于将对话框内容渲染到 DOM 的不同位置（通常是 body）。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#portal Radix UI AlertDialog Portal}
 */
// 定义组件的显式类型
type EunAlertDialogPortalComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogPortal> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogPortal>> & {
      children?: React.ReactNode;
      className?: string;
    }
> & { displayName?: string };

// 将组件赋值给显式类型的常量
const EunAlertDialogPortal: EunAlertDialogPortalComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogPortal>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogPortal> & {
    children?: React.ReactNode;
    className?: string;
  }
>(({ children, ...props }, ref) => (
  <DSAlertDialogPortal ref={ref} {...props}>
    {children}
  </DSAlertDialogPortal>
));

EunAlertDialogPortal.displayName = 'EunAlertDialogPortal';

/**
 * @description AlertDialog 的遮罩层组件，覆盖在对话框内容之下。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#overlay Radix UI AlertDialog Overlay}
 */
// 定义组件的显式类型
type EunAlertDialogOverlayComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogOverlay> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogOverlay>> & {
      children?: React.ReactNode;
      className?: string;
    }
> & { displayName?: string };

// 将组件赋值给显式类型的常量
const EunAlertDialogOverlay: EunAlertDialogOverlayComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogOverlay>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogOverlay> & {
    children?: React.ReactNode;
    className?: string;
  }
>(({ style, ...props }, ref) => <DSAlertDialogOverlay ref={ref} {...props} style={{ zIndex: 'var(--eas-z-index-dialog-overlay)', ...(style || {}) }} />);

EunAlertDialogOverlay.displayName = 'EunAlertDialogOverlay';

// AlertDialogContent: 扩展了 DSAlertDialogContent，增加了 size, showCloseButton, closeAriaLabel, closeOnOverlayClick 等 props
// ---------------------------------------------------------------------------------------------------------------------
export type AlertDialogVariants = 'default' | 'destructive' | 'success' | 'warning' | 'info';
/**
 * @description EunAlertDialogContent 组件的特定 Props。
 */
interface EunAlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof DSAlertDialogContent>, UiMessageProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg'; // 内容区域大小
  showCloseButton?: boolean; // 是否显示关闭按钮
  closeAriaLabel?: string; // 关闭按钮的 aria-label
  closeOnOverlayClick?: boolean; // 点击遮罩层是否关闭
  variant?: AlertDialogVariants; // 新增：关闭按钮的变体
  children?: React.ReactNode; // 明确添加 children
}

// 定义组件的显式类型
type EunAlertDialogContentComponent = React.ForwardRefExoticComponent<
  EunAlertDialogContentProps & // Use our explicitly defined props
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogContent>>
> & { displayName?: string };

// 将组件赋值给显式类型的常量
const EunAlertDialogContent: EunAlertDialogContentComponent = React.forwardRef<React.ElementRef<typeof DSAlertDialogContent>, EunAlertDialogContentProps>(
  (
    {
      className,
      size = 'default',
      showCloseButton = true,
      closeAriaLabel,
      closeOnOverlayClick = true,
      children, // 确保 children 被解构
      variant = 'default', // 解构新增的属性
      locale,
      messages,
      ...props // 剩余的 props，包括 Radix UI 的 onEscapeKeyDown 和 onPointerDownOutside
    },
    ref,
  ): React.ReactElement => {
    const { t } = useComponentMessage('alert', { locale, messages });
    const finalCloseAriaLabel = closeAriaLabel ?? t('closeLabel');
    const sizeClasses = {
      sm: 'sm:max-w-sm',
      default: 'sm:max-w-lg',
      lg: 'sm:max-w-xl',
    };

    const finalProps: React.ComponentPropsWithoutRef<typeof DSAlertDialogContent> = {
      ...props, // Spread remaining props, includes any standard HTML attributes
      children, // Pass children directly
      className: cn(sizeClasses[size], className), // Combine classes here
    };

    if (!closeOnOverlayClick) {
      // if (!finalProps.onEscapeKeyDown)
      //   finalProps.onEscapeKeyDown = (e) => e.preventDefault();
      // if (!finalProps.onPointerDownOutside)
      //   finalProps.onPointerDownOutside = (e) => e.preventDefault();
    }

    return (
      <DSAlertDialogContent ref={ref} {...finalProps}>
        {children} {/* 确保 children 被渲染 */}
        {showCloseButton && ( // 如果需要显示关闭按钮
          <DSAlertDialogCancel asChild>
            {/*
             * 📌 **统一使用 `overlayCloseIconButtonClass`**
             *    （见 `design-system/components/ui/overlay-surface.ts`）——
             *    此前 AlertDialog 用**内联 style** 定位（`position/right/top`）+
             *    `rounded-full`（圆形），与 Dialog / Drawer 的 `rounded-xs`（方角）
             *    **互不一致**；且内联 style 无法被 `cn()` / `twMerge` 覆盖。
             *
             *    现与 **Dialog 基准**对齐：
             *    - 位置 `absolute top-4 right-4`（16px）
             *    - 形状 `rounded-xs`（方角，`!` 前缀强制覆盖 CloseButton 自带的 `rounded-md`）
             *    - 尺寸 `size-6`（24px，保证点击热区）
             */}
            <CloseButton
              variant={variant || 'ghost'} // 使用传入的变体，或回退到 "ghost"
              className={overlayCloseIconButtonClass}
              aria-label={finalCloseAriaLabel}
            />
          </DSAlertDialogCancel>
        )}
      </DSAlertDialogContent>
    );
  },
);
EunAlertDialogContent.displayName = 'EunAlertDialogContent';

/**
 * @description AlertDialog 的头部区域组件。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#header Radix UI AlertDialog Header}
 */
// 定义组件的显式类型
type EunAlertDialogHeaderComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogHeader> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogHeader>> & {
      children?: React.ReactNode;
      className?: string;
    }
> & {
  displayName?: string;
};

// 将组件赋值给显式类型的常量
const EunAlertDialogHeader: EunAlertDialogHeaderComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogHeader>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogHeader> & {
    children?: React.ReactNode;
    className?: string;
  }
>((props, ref) => <DSAlertDialogHeader ref={ref} {...props} />);

EunAlertDialogHeader.displayName = 'EunAlertDialogHeader';

/**
 * @description AlertDialog 的底部区域组件，通常放置操作按钮。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#footer Radix UI AlertDialog Footer}
 */
// 定义组件的显式类型
type EunAlertDialogFooterComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogFooter> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogFooter>> & {
      children?: React.ReactNode;
      className?: string;
    }
> & {
  displayName?: string;
};

// 将组件赋值给显式类型的常量
const EunAlertDialogFooter: EunAlertDialogFooterComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogFooter>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogFooter> & {
    children?: React.ReactNode;
    className?: string;
  }
>((props, ref) => <DSAlertDialogFooter ref={ref} {...props} />);
EunAlertDialogFooter.displayName = 'EunAlertDialogFooter';

/**
 * @description AlertDialog 的标题组件。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#title Radix UI AlertDialog Title}
 */
// 定义组件的显式类型
type EunAlertDialogTitleComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogTitle> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogTitle>> & {
      children?: React.ReactNode;
      className?: string;
    }
> & {
  displayName?: string;
};

// 将组件赋值给显式类型的常量
const EunAlertDialogTitle: EunAlertDialogTitleComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogTitle>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogTitle> & {
    children?: React.ReactNode;
    className?: string;
  }
>((props, ref) => <DSAlertDialogTitle ref={ref} {...props} />);
EunAlertDialogTitle.displayName = 'EunAlertDialogTitle';

/**
 * @description AlertDialog 的描述文本组件。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#description Radix UI AlertDialog Description}
 */
// 定义组件的显式类型
type EunAlertDialogDescriptionComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogDescription> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogDescription>> & {
      children?: React.ReactNode;
      className?: string;
    }
> & {
  displayName?: string;
};

// 将组件赋值给显式类型的常量
const EunAlertDialogDescription: EunAlertDialogDescriptionComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogDescription>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogDescription> & {
    children?: React.ReactNode;
    className?: string;
  }
>((props, ref) => <DSAlertDialogDescription ref={ref} {...props} />);
EunAlertDialogDescription.displayName = 'EunAlertDialogDescription';

/**
 * @description AlertDialog 的操作按钮组件，通常用于确认操作。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#action Radix UI AlertDialog Action}
 */
// 定义组件的显式类型
type EunAlertDialogActionComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogAction> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogAction>> & {
      children?: React.ReactNode;
      className?: string;
      asChild?: boolean; // 添加 asChild
      onClick?: React.MouseEventHandler<HTMLButtonElement>; // 重新添加 onClick
    }
> & {
  displayName?: string;
};

// 将组件赋值给显式类型的常量
const EunAlertDialogAction: EunAlertDialogActionComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogAction>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogAction> & {
    children?: React.ReactNode;
    className?: string;
    asChild?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>; // 重新添加 onClick
  }
>((props, ref) => <DSAlertDialogAction ref={ref} {...props} />);
EunAlertDialogAction.displayName = 'EunAlertDialogAction';

/**
 * @description AlertDialog 的取消按钮组件，用于关闭对话框。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/alert-dialog#cancel Radix UI AlertDialog Cancel}
 */
// 定义组件的显式类型
type EunAlertDialogCancelComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DSAlertDialogCancel> &
    React.RefAttributes<React.ElementRef<typeof DSAlertDialogCancel>> & {
      children?: React.ReactNode;
      className?: string;
      asChild?: boolean; // 添加 asChild
      onClick?: React.MouseEventHandler<HTMLButtonElement>; // 重新添加 onClick
    }
> & {
  displayName?: string;
};

// 将组件赋值给显式类型的常量
const EunAlertDialogCancel: EunAlertDialogCancelComponent = React.forwardRef<
  React.ElementRef<typeof DSAlertDialogCancel>,
  React.ComponentPropsWithoutRef<typeof DSAlertDialogCancel> & {
    children?: React.ReactNode;
    className?: string;
    asChild?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>; // 重新添加 onClick
  }
>((props, ref) => <DSAlertDialogCancel ref={ref} {...props} />);
EunAlertDialogCancel.displayName = 'EunAlertDialogCancel';

// 导出所有 AlertDialog 相关组件
export {
  EunAlertDialog as AlertDialog,
  EunAlertDialogTrigger as AlertDialogTrigger,
  EunAlertDialogPortal as AlertDialogPortal,
  EunAlertDialogOverlay as AlertDialogOverlay,
  EunAlertDialogContent as AlertDialogContent,
  EunAlertDialogHeader as AlertDialogHeader,
  EunAlertDialogFooter as AlertDialogFooter,
  EunAlertDialogTitle as AlertDialogTitle,
  EunAlertDialogDescription as AlertDialogDescription,
  EunAlertDialogAction as AlertDialogAction,
  EunAlertDialogCancel as AlertDialogCancel,
  // Prop types
  type EunAlertDialogContentProps,
};

// 导出 AlertDialogContent 的 props 类型定义，供外部使用
export type { EunAlertDialogContentProps as AlertDialogContentProps };
