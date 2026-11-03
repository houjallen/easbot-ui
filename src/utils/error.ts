/**
 * 错误解析工具
 *
 * @description
 * 由 `hxsoft-js-framework/repository/observability/error` 移植而来。
 *
 * 目标：把各种形态的错误（`Error` / 字符串 / 未知对象）统一成
 * 「可读消息 + 可结构化字段」的形式，便于日志与提示展示。
 */

/**
 * 解析后的错误信息
 */
export interface ParsedError {
  /** 可读的错误描述 */
  message: string;
  /** 错误类型 / code */
  type?: string;
  /** 原始错误对象 */
  cause?: unknown;
  /** 附加的结构化信息 */
  details?: Record<string, unknown>;
}

/**
 * 从任意值中提取错误描述
 *
 * @param error 原始错误值
 * @returns 错误描述字符串
 */
function extractMessage(error: unknown): string {
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
 * 从任意值中提取错误类型
 *
 * @param error 原始错误值
 * @returns 错误类型 / code
 */
function extractType(error: unknown): string | undefined {
  if (error instanceof Error && error.name) return error.name;

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const candidate = record.type ?? record.code ?? record.status;
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate);
    }
  }

  return undefined;
}

/**
 * 解析错误
 *
 * @description
 * 把任意形态的错误值统一成 {@link ParsedError}。
 *
 * @param error 原始错误值
 * @returns 解析结果
 *
 * @example
 * ```ts
 * parseError(new Error('boom'));  // => { message: 'boom', type: 'Error', cause: ... }
 * parseError('bad request');      // => { message: 'bad request' }
 * ```
 */
export function parseError(error: unknown): ParsedError {
  const parsed: ParsedError = {
    message: extractMessage(error),
    cause: error,
  };

  const type = extractType(error);
  if (type) parsed.type = type;

  if (error && typeof error === 'object') {
    const details: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(error as Record<string, unknown>)) {
      if (key === 'message' || key === 'stack' || key === 'name') continue;
      details[key] = value;
    }
    if (Object.keys(details).length > 0) parsed.details = details;
  }

  return parsed;
}

/**
 * 解析错误并返回可读字符串
 *
 * @param error 原始错误值
 * @returns 可读的错误描述
 */
export function getErrorMessage(error: unknown): string {
  return parseError(error).message;
}
