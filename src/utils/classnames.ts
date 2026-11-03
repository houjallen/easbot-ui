/**
 * 类名合并工具
 *
 * @description
 * 基于 `clsx` + `tailwind-merge`，保证 Tailwind 冲突类名按「末位优先」正确覆盖。
 *
 * 本库**唯一**的 `cn()` 出口 —— 所有组件都必须用它合并类名。
 */

import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 className
 *
 * @param inputs - className 数组（支持字符串 / 数组 / 对象 / falsy 值）
 * @returns 合并后的 className 字符串
 *
 * @example
 * ```tsx
 * cn('px-2 py-1', 'bg-blue-500', { 'text-white': true })
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;
