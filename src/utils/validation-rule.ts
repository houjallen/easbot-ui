/**
 * 表单字段校验规则
 *
 * @description
 * 由 `hxsoft-js-framework/packages/eas-ui-next/src/lib/utils/validation-rule` 移植而来，
 * 并改为 **Zod 定义模式** —— 规则 schema 即运行时校验器，类型从 schema 推导。
 *
 * 与 Zod 原生 schema 相比，本模块保留了「声明式规则 + 国际化错误消息」的能力：
 * 表格 / 表单的列配置里用对象描述规则，由本模块统一翻译成错误文案。
 */

import { z } from 'zod';
import { processUiMessage } from './ui-message';
import type { MessageProcessorOptions, UiMessages } from './ui-message';

/**
 * 预设格式类型
 */
export const ValidationFormatSchema = z.enum(['email', 'url', 'tel', 'number', 'integer', 'alpha', 'alphanum', 'alphanumunderscore']);

/**
 * 字段校验规则 Schema
 *
 * @description
 * 所有字段均为可选 —— 未声明的规则不参与校验。
 */
export const ValidationRuleSchema = z.object({
  /** 是否为必填字段 */
  required: z.boolean().optional(),
  /** 字符串或数组的最大长度 */
  maxLength: z.number().int().nonnegative().optional(),
  /** 字符串或数组的最小长度 */
  minLength: z.number().int().nonnegative().optional(),
  /** 数值的最大值 */
  max: z.number().optional(),
  /** 数值的最小值 */
  min: z.number().optional(),
  /** 最小项目数量（数组类型） */
  minItems: z.number().int().nonnegative().optional(),
  /** 最大项目数量（数组类型） */
  maxItems: z.number().int().nonnegative().optional(),
  /** 最小属性数量（对象类型） */
  minProperties: z.number().int().nonnegative().optional(),
  /** 最大属性数量（对象类型） */
  maxProperties: z.number().int().nonnegative().optional(),
  /** 用于校验的正则表达式 */
  pattern: z.union([z.instanceof(RegExp), z.string()]).optional(),
  /** 预设的格式校验 */
  format: ValidationFormatSchema.optional(),
  /** 自定义验证函数 —— 返回 `true` 通过，返回字符串为错误信息 */
  validator: z
    .function({
      input: [z.unknown()],
      output: z.union([z.boolean(), z.string()]),
    })
    .optional(),
  /** 校验失败时的错误提示信息（覆盖内置文案） */
  message: z.string().optional(),
});

/** 字段校验规则类型 */
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
/** 预设格式类型 */
export type ValidationFormat = z.infer<typeof ValidationFormatSchema>;

/**
 * 校验结果
 */
export interface ValidationResult {
  /** 是否校验通过 */
  valid: boolean;
  /** 错误信息，校验失败时提供 */
  message?: string;
  /** 校验的字段名 */
  field?: string;
}

/**
 * 校验上下文
 */
export interface ValidationContext {
  /** 字段名 */
  field?: string;
  /** 字段标签 */
  label?: string;
  /** 国际化选项 */
  i18nOptions?: MessageProcessorOptions;
}

/**
 * 内置校验消息定义
 */
const VALIDATION_MESSAGES: UiMessages = {
  'zh-CN': {
    validation: {
      required: '{label}不能为空',
      maxLength: '{label}长度不能超过{max}个字符',
      minLength: '{label}长度不能少于{min}个字符',
      max: '{label}不能大于{max}',
      min: '{label}不能小于{min}',
      maxItems: '{label}项目数量不能超过{max}个',
      minItems: '{label}项目数量不能少于{min}个',
      maxProperties: '{label}属性数量不能超过{max}个',
      minProperties: '{label}属性数量不能少于{min}个',
      pattern: '{label}格式不正确',
      email: '请输入有效的邮箱地址',
      url: '请输入有效的URL地址',
      tel: '请输入有效的电话号码',
      number: '请输入有效的数字',
      integer: '请输入有效的整数',
      alpha: '只能输入字母',
      alphanum: '只能输入字母和数字',
      alphanumunderscore: '只能输入字母、数字和下划线',
      validator: '{label}校验失败',
    },
  },
  'en-US': {
    validation: {
      required: '{label} is required',
      maxLength: '{label} cannot exceed {max} characters',
      minLength: '{label} must be at least {min} characters',
      max: '{label} cannot be greater than {max}',
      min: '{label} cannot be less than {min}',
      maxItems: '{label} cannot have more than {max} items',
      minItems: '{label} must have at least {min} items',
      maxProperties: '{label} cannot have more than {max} properties',
      minProperties: '{label} must have at least {min} properties',
      pattern: '{label} format is incorrect',
      email: 'Please enter a valid email address',
      url: 'Please enter a valid URL',
      tel: 'Please enter a valid phone number',
      number: 'Please enter a valid number',
      integer: 'Please enter a valid integer',
      alpha: 'Only letters are allowed',
      alphanum: 'Only letters and numbers are allowed',
      alphanumunderscore: 'Only letters, numbers and underscores are allowed',
      validator: '{label} validation failed',
    },
  },
};

/**
 * 预设格式的正则表达式
 */
const FORMAT_PATTERNS: Record<ValidationFormat, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  tel: /^1[3-9]\d{9}$/,
  number: /^-?\d+(\.\d+)?$/,
  integer: /^-?\d+$/,
  alpha: /^[a-zA-Z]+$/,
  alphanum: /^[a-zA-Z0-9]+$/,
  alphanumunderscore: /^[a-zA-Z0-9_]+$/,
};

/**
 * 获取校验错误消息
 *
 * @param ruleType 规则类型
 * @param context 校验上下文
 * @param params 消息参数
 * @returns 错误消息
 */
function getValidationMessage(ruleType: string, context: ValidationContext, params?: Record<string, unknown>): string {
  const { label = context.field || 'Field', i18nOptions } = context;

  // 用户提供的消息表覆盖内置消息
  const messages = i18nOptions?.messages ? { ...VALIDATION_MESSAGES, ...i18nOptions.messages } : VALIDATION_MESSAGES;

  const messageKey = `validation.${ruleType}`;
  const messageParams = { label, ...params };

  return processUiMessage(messageKey, { ...i18nOptions, messages }, messageParams);
}

/**
 * 检查值是否为空
 *
 * @param value 待检查的值
 * @returns 是否为空
 */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }
  return false;
}

/**
 * 获取值的长度
 *
 * @param value 待检查的值
 * @returns 长度
 */
function getLength(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string' || Array.isArray(value)) return value.length;
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length;
  }
  return String(value).length;
}

/**
 * 构造校验失败结果
 *
 * @param context 校验上下文
 * @param ruleType 规则类型
 * @param params 消息参数
 * @param customMessage 规则自定义消息（优先）
 * @returns 校验结果
 */
function fail(context: ValidationContext, ruleType: string, params?: Record<string, unknown>, customMessage?: string): ValidationResult {
  return {
    valid: false,
    message: customMessage ?? getValidationMessage(ruleType, context, params),
    field: context.field,
  };
}

/**
 * 执行单个字段的校验
 *
 * @description
 * 校验顺序：必填 → 长度 → 数值 → 项目数 → 属性数 → 正则 → 格式 → 自定义。
 * 值为空且非必填时**跳过**其余规则。
 *
 * @param value 字段值
 * @param rules 校验规则
 * @param context 校验上下文
 * @returns 校验结果
 */
export function validateField(value: unknown, rules: ValidationRule, context: ValidationContext = {}): ValidationResult {
  const customMessage = rules.message;

  // 必填校验
  if (rules.required && isEmptyValue(value)) {
    return fail(context, 'required', undefined, customMessage);
  }

  // 空值且非必填 → 跳过其余校验
  if (isEmptyValue(value)) return { valid: true };

  if (rules.maxLength !== undefined && getLength(value) > rules.maxLength) {
    return fail(context, 'maxLength', { max: rules.maxLength }, customMessage);
  }

  if (rules.minLength !== undefined && getLength(value) < rules.minLength) {
    return fail(context, 'minLength', { min: rules.minLength }, customMessage);
  }

  if (rules.max !== undefined) {
    const numValue = Number(value);
    if (!Number.isNaN(numValue) && numValue > rules.max) {
      return fail(context, 'max', { max: rules.max }, customMessage);
    }
  }

  if (rules.min !== undefined) {
    const numValue = Number(value);
    if (!Number.isNaN(numValue) && numValue < rules.min) {
      return fail(context, 'min', { min: rules.min }, customMessage);
    }
  }

  if (rules.maxItems !== undefined && Array.isArray(value)) {
    if (value.length > rules.maxItems) {
      return fail(context, 'maxItems', { max: rules.maxItems }, customMessage);
    }
  }

  if (rules.minItems !== undefined && Array.isArray(value)) {
    if (value.length < rules.minItems) {
      return fail(context, 'minItems', { min: rules.minItems }, customMessage);
    }
  }

  if (rules.maxProperties !== undefined && typeof value === 'object') {
    if (Object.keys(value as Record<string, unknown>).length > rules.maxProperties) {
      return fail(context, 'maxProperties', { max: rules.maxProperties }, customMessage);
    }
  }

  if (rules.minProperties !== undefined && typeof value === 'object') {
    if (Object.keys(value as Record<string, unknown>).length < rules.minProperties) {
      return fail(context, 'minProperties', { min: rules.minProperties }, customMessage);
    }
  }

  if (rules.pattern) {
    const regex = typeof rules.pattern === 'string' ? new RegExp(rules.pattern) : rules.pattern;
    if (!regex.test(String(value))) {
      return fail(context, 'pattern', undefined, customMessage);
    }
  }

  if (rules.format) {
    const pattern = FORMAT_PATTERNS[rules.format];
    if (pattern && !pattern.test(String(value))) {
      return fail(context, rules.format, undefined, customMessage);
    }
  }

  if (rules.validator) {
    try {
      const result = rules.validator(value);
      if (result !== true) {
        return fail(context, 'validator', undefined, typeof result === 'string' ? result : customMessage);
      }
    } catch {
      return fail(context, 'validator', undefined, customMessage);
    }
  }

  return { valid: true };
}

/**
 * 批量校验多个字段
 *
 * @param data 数据对象
 * @param rulesMap 字段规则映射
 * @param globalContext 全局校验上下文
 * @returns 校验失败的结果数组（通过校验的字段不返回）
 */
export function validateFields(data: Record<string, unknown>, rulesMap: Record<string, ValidationRule>, globalContext: Omit<ValidationContext, 'field'> = {}): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const field of Object.keys(rulesMap)) {
    const rules = rulesMap[field];
    // `noUncheckedIndexedAccess` 下索引访问可能为 undefined
    if (!rules) continue;

    const context: ValidationContext = {
      ...globalContext,
      field,
      label: globalContext.label || field,
    };

    const result = validateField(data[field], rules, context);
    if (!result.valid) results.push(result);
  }

  return results;
}

/**
 * 创建校验器工厂函数
 *
 * @param globalContext 全局校验上下文
 * @returns 校验器对象
 */
export function createValidator(globalContext: Omit<ValidationContext, 'field'> = {}) {
  return {
    /** 校验单个字段 */
    validateField: (value: unknown, rules: ValidationRule, field?: string) =>
      validateField(value, rules, {
        ...globalContext,
        field,
        label: globalContext.label || field,
      }),

    /** 批量校验字段 */
    validateFields: (data: Record<string, unknown>, rulesMap: Record<string, ValidationRule>) => validateFields(data, rulesMap, globalContext),

    /** 是否存在校验错误 */
    hasErrors: (results: ValidationResult[]) => results.some((result) => !result.valid),

    /** 获取第一个错误信息 */
    getFirstError: (results: ValidationResult[]) => results.find((result) => !result.valid)?.message,

    /** 获取所有错误信息 */
    getAllErrors: (results: ValidationResult[]) =>
      results
        .filter((result) => !result.valid)
        .map((result) => result.message)
        .filter((message): message is string => Boolean(message)),
  };
}

/**
 * 默认校验器实例
 */
export const defaultValidator = createValidator();

/**
 * 便捷校验函数 —— 判断是否通过
 *
 * @param value 待校验的值
 * @param rules 校验规则
 * @param label 字段标签
 * @returns 是否校验通过
 */
export function isValid(value: unknown, rules: ValidationRule, label?: string): boolean {
  return validateField(value, rules, { label }).valid;
}

/**
 * 便捷校验函数 —— 获取错误信息
 *
 * @param value 待校验的值
 * @param rules 校验规则
 * @param label 字段标签
 * @returns 错误信息；通过校验时返回 `undefined`
 */
export function getValidationError(value: unknown, rules: ValidationRule, label?: string): string | undefined {
  const result = validateField(value, rules, { label });
  return result.valid ? undefined : result.message;
}
