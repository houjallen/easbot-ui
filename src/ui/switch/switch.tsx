import { cn } from '../../utils/classnames';
import { Switch as DSSwitch } from '../../design-system/components/ui/switch';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * 开关切换组件
 *
 * @description
 * 提供状态切换交互控件，支持以下核心功能：
 * 1. 受控/非受控模式
 * 2. 无障碍访问支持
 * 3. 自定义样式扩展
 * 4. 禁用状态处理
 * 5. 交互动画效果
 * 6. 多种尺寸选项（sm/md/lg）
 */

// 开关组件属性定义
const eunSwitchVariants = cva(
  // Base classes for EUN Switch if any, applied to the DSSwitch component itself.
  // DSSwitch handles its own base styling, so this might often be empty.
  '',
  {
    variants: {
      variant: {
        default: '', // Relies on DSSwitch's default :bg-primary theme
        destructive: [
          // Override Root colors
          'data-[state=checked]:!bg-destructive dark:data-[state=checked]:!bg-destructive',
          'data-[state=unchecked]:!bg-destructive/30 dark:data-[state=unchecked]:!bg-destructive/30',
          // Override Thumb colors by targeting the child with data-slot
          // This assumes the thumb's default bg is simple enough to be overridden or is transparent and shows root's bg.
          // More robust thumb styling might need CSS variables in DSSwitch or more specific selectors.
          '[&>[data-slot=switch-thumb]]:!bg-destructive-foreground dark:[&>[data-slot=switch-thumb]]:!bg-destructive-foreground',
          // Ensure focus ring also uses destructive color if possible
          // DSSwitch uses 'focus-visible:border-ring focus-visible:ring-ring/50'
          // We might need to override these or accept the default ring color for now.
          // For simplicity, let's start without overriding focus ring yet.
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type EunSwitchRef = React.ComponentRef<typeof DSSwitch>;
export interface EunSwitchProps extends React.ComponentPropsWithoutRef<typeof DSSwitch>, VariantProps<typeof eunSwitchVariants> {}

const Switch = React.forwardRef<EunSwitchRef, EunSwitchProps>(({ className, variant, ...props }, ref) => <DSSwitch className={cn(eunSwitchVariants({ variant }), className)} {...props} ref={ref} />);
Switch.displayName = 'EunSwitch';

export { Switch };
export type { EunSwitchProps as SwitchProps, EunSwitchRef as SwitchRef };
