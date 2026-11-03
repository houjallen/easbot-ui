'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * 修正弹出框位置，确保不出现负坐标
 * @param element 弹出框元素
 */
function fixPopoverPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);

  // 检查是否需要修正位置
  let needsUpdate = false;
  const currentLeft = parseInt(computedStyle.left, 10) || 0;
  const currentTop = parseInt(computedStyle.top, 10) || 0;

  // 修正左侧位置 - 如果 left 为负数，设置为 0
  if (rect.left < 0) {
    const adjustment = -rect.left;
    element.style.left = `${Math.max(0, currentLeft + adjustment)}px`;
    needsUpdate = true;
  }

  // 修正顶部位置 - 如果 top 为负数，设置为 0
  if (rect.top < 0) {
    const adjustment = -rect.top;
    element.style.top = `${Math.max(0, currentTop + adjustment)}px`;
    needsUpdate = true;
  }

  return needsUpdate;
}

/**
 * 位置修正 Hook
 * @param enabled 是否启用位置修正
 */
function usePopoverPositionFix(enabled = true) {
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled || !elementRef.current) {
      return;
    }

    const element = elementRef.current;

    // 立即执行一次位置修正
    const timer = setTimeout(() => {
      fixPopoverPosition(element);
    }, 0);

    // 监听位置变化
    const observer = new MutationObserver(() => {
      // 延迟执行，避免频繁调用
      requestAnimationFrame(() => {
        fixPopoverPosition(element);
      });
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'data-state'],
    });

    // 监听窗口大小变化
    const handleResize = () => {
      fixPopoverPosition(element);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  return elementRef;
}

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Content> {
  /** 是否启用位置修正，防止负坐标 */
  enablePositionFix?: boolean;
}

function PopoverContent({ className, align = 'center', sideOffset = 4, enablePositionFix = true, ...props }: PopoverContentProps) {
  const positionRef = usePopoverPositionFix(enablePositionFix);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={positionRef}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
