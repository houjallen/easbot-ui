/**
 * 文件上传请求参数 Schema
 *
 * @description
 * 由 `hxsoft-js-framework/repository/types/axios` 移植而来，
 * 并改为 **Zod 定义模式** —— schema 即运行时校验器，类型从 schema 推导。
 *
 * 组件库**不依赖 axios** —— 这里只定义与后端约定的**请求契约**，
 * 由消费方把自己的 HTTP 客户端适配到该契约上。
 */

import { z } from 'zod';

/**
 * 文件上传请求参数
 */
export const UploadFileParamsSchema = z.object({
  /** 待上传的文件 */
  file: z.instanceof(File),
  /** 表单字段名 */
  name: z.string().optional(),
  /** 服务端文件名 */
  filename: z.string().optional(),
  /** 附带的额外表单数据 */
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * 上传请求配置
 */
export const UploadRequestConfigSchema = z.object({
  /** 请求地址 */
  url: z.string().optional(),
  /** 请求方法 */
  method: z.string().optional(),
  /** 请求头 */
  headers: z.record(z.string(), z.unknown()).optional(),
  /** 上传进度回调 */
  onUploadProgress: z.function().optional(),
});

/** 文件上传请求参数类型 */
export type UploadFileParams = z.infer<typeof UploadFileParamsSchema>;
/** 上传请求配置类型 */
export type UploadRequestConfig = z.infer<typeof UploadRequestConfigSchema>;
