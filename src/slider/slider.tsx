import { cn } from '../utils/classnames';
import * as SliderPrimitive from '@radix-ui/react-slider';
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
const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(({ className, ...props }, ref) => {
  // 计算滑块数量
  const values = props.value || props.defaultValue || [0];
  const thumbCount = Array.isArray(values) ? values.length : 1;
  const isVertical = props.orientation === 'vertical';

  return (
    <SliderPrimitive.Root ref={ref} className={cn('relative flex touch-none select-none', isVertical ? 'h-full flex-col items-center' : 'w-full items-center', className)} {...props}>
      <SliderPrimitive.Track
        className={cn('overflow-hidden rounded-full bg-[var(--slider-track-background)]', isVertical ? 'h-full w-[var(--slider-track-height)]' : 'h-[var(--slider-track-height)] w-full')}
      >
        <SliderPrimitive.Range className={cn('absolute bg-[var(--slider-range-background)]', isVertical ? 'w-full' : 'h-full')} />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-[var(--slider-thumb-size)] w-[var(--slider-thumb-size)] rounded-full border-2 border-[var(--slider-thumb-border)] bg-[var(--slider-thumb-background)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slider-thumb-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[var(--slider-disabled-opacity)]"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export type { SliderProps } from '@radix-ui/react-slider';
export { Slider };
