'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '../../lib/utils';

function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]), [value, defaultValue, min, max]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        // 📌 **光标必须显式声明**：全局 prefix.css 只给 `button` / `[role=button]`
        //    设置 cursor，而 Radix Slider 的 Root / Track / Thumb 全是 `<span>`
        //    （Thumb 的 role 是 `slider`），不受全局规则覆盖 —— 不写就是默认箭头。
        //    轨道点击可跳值，故 Root 用 `cursor-pointer`。
        //
        // ⚠️ **禁用态必须用 `data-[disabled]:` 而非 `disabled:`** ——
        //    Switch 的 Root 是原生 `<button disabled>`，`disabled:cursor-not-allowed` 有效；
        //    Slider 的 Root 只有 `data-disabled=""` / `aria-disabled`，**没有** HTML
        //    `disabled` 属性，`:disabled` 伪类永远不匹配（原 Thumb 上的
        //    `disabled:cursor-not-allowed disabled:opacity-50` 是死代码）。
        //    禁用态保留 pointer-events，仅改光标（规范 css-standard.md §4.9）。
        'relative flex w-full cursor-pointer touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderPrimitive.Range data-slot="slider-range" className={cn('absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full')} />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            // 📌 可用态统一 `cursor-pointer`（与 Switch / Select 触发器一致的
            //    「可点击」语义），不使用 `cursor-grab` —— 全库交互控件统一指针样式。
            // ⚠️ 禁用态同样走 `data-[disabled]:`（Thumb 是 span，无 :disabled）。
            //    `data-[disabled]:hover:ring-0` 关闭禁用态的悬停反馈，
            //    否则 Radix 不响应拖拽、视觉上却仍像可交互。
            'block size-4 shrink-0 cursor-pointer rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:ring-0',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
