import { cn } from '../../utils/classnames';
import { Slider as DSSlider } from '../../design-system/components/ui/slider';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * 滑动输入条组件
 *
 * @description
 * 提供精确数值输入控制，支持以下核心功能：
 * 1. 单点/范围选择模式
 * 2. 自定义刻度标记
 * 3. 响应式布局
 * 4. 无障碍访问支持
 * 5. 自定义样式扩展
 */
const eunSliderVariants = cva(
  '', // Base classes for EunSlider, applied to DSSlider's root
  {
    variants: {
      variant: {
        default: '', // Relies on DSSlider's default theme (primary for range and thumb border)
        destructive: [
          // Target the Range component (filled part of the track)
          '[&_[data-slot=slider-range]]:!bg-destructive',
          // Target the Thumb component
          '[&_[data-slot=slider-thumb]]:!border-destructive',
          // Optionally, adjust hover/focus ring for the thumb in destructive variant
          '[&_[data-slot=slider-thumb]]:hover:!ring-destructive/40',
          '[&_[data-slot=slider-thumb]]:focus-visible:!ring-destructive/40',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type EunSliderRef = React.ComponentRef<typeof DSSlider>;
type EunSliderProps = React.ComponentPropsWithoutRef<typeof DSSlider> & VariantProps<typeof eunSliderVariants>;

const Slider = React.forwardRef<EunSliderRef, EunSliderProps>(({ className, variant, ...props }, ref) => {
  // DSSlider handles its own internal structure, styling (including orientation), and thumb rendering.
  // eas-ui-next/Slider should pass through props and rely on DSSlider's implementation for UI consistency.
  return (
    <DSSlider
      ref={ref}
      className={cn(
        eunSliderVariants({ variant }),
        // Add any eas-ui-next specific functional (non-theme, non-sizing) classes here if absolutely necessary.
        // Primarily, rely on DSSlider's styling.
        className,
      )}
      {...props}
    />
  );
});
Slider.displayName = 'EunSlider';

export { Slider };
export type { EunSliderProps as SliderProps, EunSliderRef as SliderRef };
