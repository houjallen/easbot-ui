/**
 * 通用工具函数集合
 *
 * @description
 * 由 `hxsoft-js-framework/repository/util/utils` 移植而来，去除 `lodash-es` 依赖，
 * 改为零依赖实现，行为保持一致。
 *
 * 提供四类能力：
 * 1. 类型判断 —— `isEmpty` / `isPlainObject`
 * 2. 值比较 —— `deepValueEqual`（表格参数比对场景专用）
 * 3. 对象合并 —— `deepMerge`
 * 4. 通用辅助 —— `sleep` / `asyncRunSafe` / `randomString` 等
 */

/**
 * 是否为空值
 *
 * @description
 * 判定规则（修复了 lodash `isEmpty` 对数值 / 布尔的误判）：
 * - 数值：仅 `NaN` 为空，`0` / 负数 / 正数**非空**
 * - 布尔：`true` / `false` **均非空**
 * - 字符串：空白字符串为空
 * - 数组 / Map / Set：长度为 0 时为空
 * - 对象：无可枚举属性时为空
 * - `null` / `undefined`：为空
 *
 * @param value 待判定的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === 'number') return Number.isNaN(value);

  if (typeof value === 'boolean') return false;

  if (typeof value === 'string') return value.trim().length === 0;

  if (Array.isArray(value)) return value.length === 0;

  if (value instanceof Map || value instanceof Set) return value.size === 0;

  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }

  return false;
}

/**
 * 深度值比较
 *
 * @description
 * 专用于表格参数比对：只比较**值**，忽略对象引用。
 *
 * - `null` / `undefined` / `[]` / `{}` / `''` 等空值之间**视为相等**
 * - `Date` 按时间戳比较
 * - `RegExp` 按字符串比较
 * - 键集合不同但差异处的值都是 `undefined` 时视为相等
 *
 * @param a 比较值 A
 * @param b 比较值 B
 * @returns 是否深度相等
 */
export function deepValueEqual(a: unknown, b: unknown): boolean {
  // 严格相等（含 NaN === NaN）
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;

  // 空值优先：两者皆空视为相等，一空一非空视为不等
  const aIsEmpty = isEmpty(a);
  const bIsEmpty = isEmpty(b);
  if (aIsEmpty && bIsEmpty) return true;
  if (aIsEmpty || bIsEmpty) return false;

  // 宽松判空（null == undefined）
  if (a == null || b == null) return a === b;

  const typeA = typeof a;
  const typeB = typeof b;
  if (typeA !== typeB) return false;

  // 基本类型走到这里说明值不同（相等性已在开头判定）
  if (typeA !== 'object') return false;

  // 数组
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepValueEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(b)) return false;

  // Date
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof Date || b instanceof Date) return false;

  // RegExp
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }
  if (a instanceof RegExp || b instanceof RegExp) return false;

  // 普通对象：逐键递归比较
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  const allKeys = new Set([...keysA, ...keysB]);
  const hasOwn = Object.prototype.hasOwnProperty;

  for (const key of allKeys) {
    const hasKeyA = hasOwn.call(a, key);
    const hasKeyB = hasOwn.call(b, key);

    if (hasKeyA !== hasKeyB) {
      // 缺失键的值为 undefined 时视为相等
      const valueA = hasKeyA ? (a as Record<string, unknown>)[key] : undefined;
      const valueB = hasKeyB ? (b as Record<string, unknown>)[key] : undefined;
      if (valueA !== undefined || valueB !== undefined) return false;
    } else if (hasKeyA && hasKeyB) {
      if (!deepValueEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
        return false;
      }
    }
  }

  return true;
}

/** 普通对象类型 */
type PlainObject = Record<string, unknown>;

/**
 * 是否为普通对象
 *
 * @param value 待判定的值
 * @returns 是否为可安全合并的普通对象
 */
export function isPlainObject(value: unknown): value is PlainObject {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * 递归合并两个对象
 *
 * @description
 * - `target` 的值覆盖 `source` 的值
 * - 两侧都是**普通对象**时递归合并
 * - 数组按 `mergeArrays` 策略处理，默认 `replace`（整体替换）
 * - `undefined` 不覆盖已有值
 * - 不修改入参，始终返回新对象
 *
 * @param source 源对象（优先级低）
 * @param target 目标对象（优先级高）
 * @param mergeArrays 数组合并策略
 * @returns 合并结果
 */
export function deepMerge<T extends object | null | undefined, U extends object | null | undefined>(
  source: T,
  target: U,
  mergeArrays: 'union' | 'intersection' | 'concat' | 'replace' = 'replace',
): T & U {
  if (!target) return source as T & U;
  if (!source) return target as T & U;

  const mergeArray = (sourceValue: unknown[], targetValue: unknown[]): unknown[] => {
    switch (mergeArrays) {
      case 'union': {
        const result = [...sourceValue];
        for (const item of targetValue) {
          if (!result.some((existing) => deepValueEqual(existing, item))) {
            result.push(item);
          }
        }
        return result;
      }
      case 'intersection':
        return sourceValue.filter((item) => targetValue.some((candidate) => deepValueEqual(candidate, item)));
      case 'concat':
        return [...sourceValue, ...targetValue];
      default:
        return [...targetValue];
    }
  };

  const result: PlainObject = { ...(source as PlainObject) };

  for (const [key, targetValue] of Object.entries(target as PlainObject)) {
    const sourceValue = (source as PlainObject)[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      result[key] = mergeArray(sourceValue, targetValue);
    } else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(sourceValue, targetValue, mergeArrays);
    } else if (targetValue === undefined) {
    } else {
      result[key] = targetValue;
    }
  }

  return result as T & U;
}

/**
 * 空函数
 */
export function noop(): void {
  /* 故意留空 */
}

/**
 * 延时
 *
 * @param ms 毫秒数
 * @returns 在指定毫秒后 resolve 的 Promise
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * 安全执行异步函数
 *
 * @param fn 待执行的 Promise
 * @returns `[错误, 结果]` 元组；成功时错误为 `null`
 */
export async function asyncRunSafe<T = unknown>(fn: Promise<T>): Promise<[Error] | [null, T]> {
  try {
    return [null, await fn];
  } catch (e: unknown) {
    return [e instanceof Error ? e : new Error('unknown error')];
  }
}

/**
 * 带重试的异步执行
 *
 * @param fn 待执行的 Promise
 * @param retries 重试次数
 * @returns `[错误, 结果]` 元组
 */
export async function fetchWithRetry<T = unknown>(fn: Promise<T>, retries = 3): Promise<[Error] | [null, T]> {
  const [error, res] = await asyncRunSafe(fn);

  if (error) {
    if (retries > 0) {
      return fetchWithRetry(fn, retries - 1);
    }
    return [error];
  }

  return [null, res];
}

/**
 * 生成随机字符串
 *
 * @param length 长度
 * @returns 随机字符串
 */
export function randomString(length: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * 获取浮层挂载节点
 *
 * @param node 参考节点
 * @returns 挂载容器（默认 `document.body`）
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body;
}
