/**
 * 表格工具类型定义
 * 包含通用的工具类型和辅助类型
 */

/**
 * 如果T是数组，返回元素类型，否则返回T
 */
export type UnwrapArray<T> = T extends (infer U)[] ? U : T;

/**
 * 如果T是Promise，返回resolved类型，否则返回T
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// ============ 对象操作工具类型 ============

/**
 * 部分必需
 */
export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * 部分可选
 */
export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 重写类型
 */
export type Override<T, U> = Omit<T, U & keyof T> & U;

/**
 * 合并类型
 */
export type Merge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};

// ============ 字符串工具类型 ============

/**
 * 驼峰转短横线
 */
export type CamelToKebab<S extends string> = S extends `${infer T}${infer U}` ? `${T extends Capitalize<T> ? '-' : ''}${Lowercase<T>}${CamelToKebab<U>}` : S;

/**
 * 短横线转驼峰
 */
export type KebabToCamel<S extends string> = S extends `${infer T}-${infer U}` ? `${T}${Capitalize<KebabToCamel<U>>}` : S;

// ============ 数字工具类型 ============

/**
 * 正数
 */
export type Positive<T extends number> = `${T}` extends `-${string}` ? never : T;

/**
 * 负数
 */
export type Negative<T extends number> = `${T}` extends `-${string}` ? T : never;

/**
 * 整数
 */
export type Integer<T extends number> = `${T}` extends `${string}.${string}` ? never : T;

// ============ 元组工具类型 ============

/**
 * 元组长度
 */
export type Length<T extends readonly any[]> = T['length'];

/**
 * 元组头部
 */
export type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;

/**
 * 元组尾部
 */
export type Tail<T extends readonly any[]> = T extends readonly [any, ...infer T] ? T : [];

/**
 * 元组最后一个元素
 */
export type Last<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never;

// ============ 联合类型工具 ============

/**
 * 联合转交叉
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * 联合转元组
 */
export type UnionToTuple<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? [R] : never;

// ============ 条件判断工具类型 ============

/**
 * 判断是否为any类型
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * 判断是否为never类型
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * 判断是否为unknown类型
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

/**
 * 判断两个类型是否相等
 */
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

/**
 * 判断是否为数组类型
 */
export type IsArray<T> = T extends readonly any[] ? true : false;

/**
 * 判断是否为对象类型
 */
export type IsObject<T> = T extends object ? (T extends any[] ? false : true) : false;

/**
 * 判断是否为函数类型
 */
export type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
