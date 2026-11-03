/**
 * 设备检测 Hook
 *
 * @description
 * 由 `hxsoft-js-framework/repository/hooks/use-device` 移植而来。
 *
 * 判定依据：User-Agent 匹配移动端关键字 **或** 视口宽度 ≤ 768px。
 * 初始值固定为 `false`（SSR 安全，避免 hydration 不匹配）。
 */

import { useEffect, useState } from 'react';

/** 移动端 User-Agent 匹配规则 */
const MOBILE_UA_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/** 判定为移动端的视口宽度上限 */
const MOBILE_BREAKPOINT = 768;

/**
 * 设备检测 Hook
 *
 * @returns `true` 表示移动设备，`false` 表示桌面设备
 *
 * @example
 * ```tsx
 * const isMobile = useDevice();
 * return isMobile ? <Drawer /> : <Sidebar />;
 * ```
 */
export function useDevice(): boolean {
  // 默认 false，避免 SSR / hydration 不匹配
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = MOBILE_UA_REGEX.test(navigator.userAgent) || window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return isMobile;
}
