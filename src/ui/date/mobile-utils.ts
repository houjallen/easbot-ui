'use client';

import React, { useEffect, useState } from 'react';
import { dateMessages } from '../../utils/component-messages';
import { getUiMessageObject } from '../../utils/ui-message';

// 移动端检测 hook
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 初始检测
    checkIsMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

// 触摸设备检测
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkIsTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-expect-error
          navigator.msMaxTouchPoints > 0,
      );
    };

    checkIsTouchDevice();
  }, []);

  return isTouchDevice;
}

// 用户代理检测移动设备
export function detectMobileDevice(): {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  deviceType: 'desktop' | 'mobile' | 'tablet';
} {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      deviceType: 'desktop',
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = /mobile|android|iphone|ipad|phone|blackberry|opera mini|iemobile|wpdesktop/.test(userAgent);

  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

  if (/ipad|tablet/.test(userAgent) || (isAndroid && !/mobile/.test(userAgent))) {
    deviceType = 'tablet';
  } else if (isMobile) {
    deviceType = 'mobile';
  }

  return {
    isMobile: isMobile || deviceType !== 'desktop',
    isIOS,
    isAndroid,
    deviceType,
  };
}

// 响应式断点配置
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// 响应式 hook
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof BREAKPOINTS>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setCurrentBreakpoint('md');
      } else if (width >= BREAKPOINTS.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  return {
    current: currentBreakpoint,
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    is2Xl: currentBreakpoint === '2xl',
    isMobile: ['xs', 'sm'].includes(currentBreakpoint),
    isTablet: currentBreakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(currentBreakpoint),
  };
}

// 移动端优化的日期选择器配置
export function getMobileOptimizedConfig(isMobile: boolean) {
  return {
    // 移动端使用更大的触摸目标
    buttonSize: isMobile ? 'lg' : 'sm',
    // 移动端使用更大的间距
    spacing: isMobile ? 'p-4' : 'p-2',
    // 移动端简化视图切换
    showAllViews: !isMobile,
    // 移动端优先显示常用快捷选择
    maxShortcuts: isMobile ? 6 : 12,
    // 移动端使用全屏模式
    fullscreen: isMobile,
    // 移动端自动关闭弹窗
    autoClose: isMobile,
  };
}

// 触摸手势支持
export function useTouchGestures(element: React.RefObject<HTMLElement>, onSwipeLeft?: () => void, onSwipeRight?: () => void, onSwipeUp?: () => void, onSwipeDown?: () => void) {
  useEffect(() => {
    if (!element.current) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0]?.clientX ?? 0;
      startY = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      endX = e.touches[0]?.clientX ?? 0;
      endY = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchEnd = () => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    };

    const el = element.current;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
}

// 移动端友好的日期格式
export function getMobileFriendlyFormat(format: string, isMobile: boolean, locale?: string): string {
  if (!isMobile) return format;

  // 移动端使用更简洁的格式（格式模板来自内置文案表）
  const mobileFormats = getUiMessageObject<Record<string, string>>('mobileFormats', { locale, messages: dateMessages }) ?? {};

  return mobileFormats[format] || format;
}

// 移动端键盘优化
export function useMobileKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const heightDiff = windowHeight - viewportHeight;

      setKeyboardHeight(heightDiff);
      setIsKeyboardOpen(heightDiff > 150); // 假设键盘高度超过150px
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    } else {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return {
    keyboardHeight,
    isKeyboardOpen,
  };
}
