import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 className
 *
 * @param inputs - className 数组
 * @returns 合并后的 className 字符串
 *
 * @example
 * ```tsx
 * cn('px-2 py-1', 'bg-blue-500', { 'text-white': true })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default cn;
