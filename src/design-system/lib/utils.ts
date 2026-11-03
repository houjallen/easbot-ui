import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 className
 *
 * @param inputs className 数组
 * @returns 合并后的类名字符串
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

/**
 * 首字母大写
 *
 * @param str 源字符串
 * @returns 首字母大写后的字符串
 */
export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * 提取错误描述
 *
 * @param error 任意错误值
 * @returns 可读的错误描述
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const candidate = record.message ?? record.msg ?? record.error;
    if (typeof candidate === 'string') return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (typeof nested.message === 'string') return nested.message;
    }
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * 统一处理错误 —— 弹出错误提示
 *
 * @param error 任意错误值
 */
export const handleError = (error: unknown): void => {
  toast.error(extractErrorMessage(error));
};
