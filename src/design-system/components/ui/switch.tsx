'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '../../lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // 📌 **unchecked 状态必须有可见边框** ——
        //    unchecked 背景是半透明灰，若边框也是 `border-transparent`，
        //    控件在白底上**完全失去边界**（表现为「滑块像没有边框 / 消失」）。
        //    故 unchecked 用不透明的 `--input-border-color`，
        //    checked 背景本身是不透明主色，边框保持透明即可。
        //
        // 📌 track 配色同样走**语义 token**（`--switch-*`），
        //    与 thumb 的反差契约成对定义在 light.css / dark.css，
        //    组件侧不需要 `dark:` 变体。
        'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-transparent data-[state=checked]:bg-[var(--switch-checked-background)] data-[state=unchecked]:border-[var(--input-border-color)] data-[state=unchecked]:bg-[var(--switch-unchecked-background)]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // 📌 **thumb 必须与 track 形成反差**，否则看不出开关状态。
          //
          // 配色契约（light / dark **同一套**，无需 dark: 变体）：
          //   - checked   → track = `bg-primary`（实色），thumb = `--switch-thumb-checked-background`
          //                （= `--primary-foreground`，与 primary 互为反色，自动满足反差）
          //   - unchecked → track = `bg-input-background`（半透明灰），
          //                thumb = `--switch-thumb-unchecked-background`（**不透明中灰**）
          //
          // ⚠️ **unchecked 的 thumb 不能用 `bg-background`** ——
          //    dark 下 `--background` 是近黑，落在深色轨道上**完全看不出滑块**
          //    （用户反馈的缺陷）。参考 Material Design 1「Switch」：
          //    Dark 态 Thumb Off = Grey 400 #BDBDBD（不透明中灰），
          //    Track Off = #FFFFFF 30%（半透明）—— 靠「实心 thumb + 半透明 track」拉开层次。
          //
          // 📌 两个状态都用**语义 token**，由 light.css / dark.css 分别赋值，
          //    组件侧无需 `dark:` 变体（避免再次出现「只写了 dark 版」的缺陷）。
          'pointer-events-none block size-4 rounded-full bg-[var(--switch-thumb-unchecked-background)] ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-[var(--switch-thumb-checked-background)]',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
