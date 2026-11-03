'use client';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { toggleVariants } from './toggle';
import { cn } from '../../lib/utils';

/**
 * ToggleGroup 上下文
 *
 * @description
 * 默认为 `undefined` —— 这样单项自身的 `variant` / `size` 才能生效；
 * 若默认填了具体值，层级优先级就永远被上下文覆盖。
 */
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants> | undefined>(undefined);

function ToggleGroup({ className, variant, size, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn('group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs', className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  // 优先级：上下文（ToggleGroup 级）> 单项自身 > toggleVariants 默认值
  const resolvedVariant = context?.variant ?? variant;
  const resolvedSize = context?.size ?? size;

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(
        toggleVariants({
          variant: resolvedVariant,
          size: resolvedSize,
        }),
        // 组内布局类：`min-w-0` 会覆盖尺寸变体的 `min-w-*`，导致 lg/sm 尺寸失效，
        // 因此这里只保留不影响尺寸语义的布局类（弹性、收缩、首末圆角、焦点层级）。
        'flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
