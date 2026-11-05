/**
 * 文件上传组件类型定义
 * @author xiaomo
 */

import type { ReactNode } from 'react';

/**
 * 文件状态枚举
 */
export type FileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'removed';

/**
 * 文件信息接口
 */
export interface FileInfo {
  /** 文件唯一标识 */
  id: string;
  /** 原始文件对象 */
  file?: File;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件类型 */
  type: string;
  /** 文件URL（上传成功后） */
  url?: string;
  /** 缩略图URL */
  thumbUrl?: string;
  /** 上传状态 */
  status: FileStatus;
  /** 上传进度 0-100 */
  progress?: number;
  /** 错误信息 */
  error?: string;
  /** 额外数据 */
  extra?: Record<string, any>;
}

/**
 * 上传响应接口
 */
export interface UploadResponse {
  /** 是否成功 */
  success: boolean;
  /** 文件URL */
  url?: string;
  /** 缩略图URL */
  thumbUrl?: string;
  /** 错误信息 */
  message?: string;
  /** 额外数据 */
  data?: Record<string, any>;
}

/**
 * 上传请求配置
 */
export interface UploadConfig {
  /** 上传接口地址 */
  action: string;
  /** 请求方法 */
  method?: 'POST' | 'PUT';
  /** 文件字段名 */
  name?: string;
  /** 额外的表单数据 */
  data?: Record<string, any> | ((file: File) => Record<string, any>);
  /** 请求头 */
  headers?: Record<string, string> | ((file: File) => Record<string, string>);
  /** 是否携带cookie */
  withCredentials?: boolean;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * 文件验证规则
 */
export interface FileValidation {
  /** 允许的文件类型 */
  accept?: string[];
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 最小文件大小（字节） */
  minSize?: number;
  /** 最大文件数量 */
  maxCount?: number;
}

/**
 * 拖拽区域配置
 */
export interface DropzoneConfig {
  /** 是否启用拖拽上传 */
  enabled?: boolean;
  /** 拖拽区域文本 */
  text?: string;
  /** 拖拽区域提示文本 */
  hint?: string;
  /** 自定义拖拽区域内容 */
  children?: ReactNode;
  /** 拖拽区域样式类名 */
  className?: string;
}

/**
 * 文件列表配置
 */
export interface FileListConfig {
  /** 是否显示文件列表 */
  showList?: boolean;
  /** 列表类型 */
  listType?: 'text' | 'picture' | 'picture-card' | 'tag';
  /** 是否显示删除按钮 */
  showRemove?: boolean;
  /** 是否显示下载按钮 */
  showDownload?: boolean;
  /** 是否显示预览按钮 */
  showPreview?: boolean;
  /** 是否显示追加上传按钮 */
  showUploadButton?: boolean;
  /** 追加上传按钮文本 */
  uploadButtonText?: string;
  /** 列表式样 */
  listClassName?: string;
  /** 自定义文件项渲染 */
  itemRender?: (
    file: FileInfo,
    index: number,
    actions: {
      onRemove?: (file: FileInfo) => void;
      onPreview?: (file: FileInfo) => void;
      onDownload?: (file: FileInfo) => void;
    },
  ) => ReactNode;
}

/**
 * 图片裁剪配置
 */
export interface CropConfig {
  /** 是否启用裁剪 */
  enabled?: boolean;
  /** 裁剪比例 */
  aspectRatio?: number;
  /** 裁剪质量 0-1 */
  quality?: number;
  /** 输出格式 */
  format?: 'jpeg' | 'png' | 'webp';
  /** 裁剪区域配置 */
  cropperProps?: Record<string, any>;
}

/**
 * 基础上传组件属性
 */
export interface BaseUploadProps {
  /** 文件列表 */
  value?: FileInfo[];
  /** 文件列表变化回调 */
  onChange?: (files: FileInfo[]) => void;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 上传配置 */
  upload?: UploadConfig;
  /** 文件验证规则 */
  validation?: FileValidation;
  /** 拖拽区域配置 */
  dropzone?: DropzoneConfig;
  /** 文件列表配置 */
  fileList?: FileListConfig;
  /** 自动上传 */
  autoUpload?: boolean;
  /** 组件样式类名 */
  className?: string;
  /**
   * 上传前回调
   * @description 返回 `false`（或 `Promise<false>`）阻止上传；`void` / `undefined` 视为允许
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: 回调合法用法包含「只做副作用、不否决」——同步 void 与异步 Promise<void> 均需兼容，此处 void 表达「忽略返回值」语义
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean | void> | undefined;
  /** 上传进度回调 */
  onProgress?: (file: FileInfo, progress: number) => void;
  /** 上传成功回调 */
  onSuccess?: (file: FileInfo, response: UploadResponse) => void;
  /** 上传失败回调 */
  onError?: (file: FileInfo, error: Error) => void;
  /**
   * 文件移除回调
   * @description 返回 `false`（或 `Promise<false>`）阻止删除；`void` / `undefined` 视为允许
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: 回调合法用法包含「只做副作用、不否决」——同步 void 与异步 Promise<void> 均需兼容，此处 void 表达「忽略返回值」语义
  onRemove?: (file: FileInfo) => boolean | Promise<boolean | void> | undefined;
  /** 文件预览回调 */
  onPreview?: (file: FileInfo) => void;
  /** 文件下载回调 */
  onDownload?: (file: FileInfo) => void;
}

/**
 * 图片文件列表配置（强制 picture-card 类型）
 */
export interface ImageFileListConfig extends Omit<FileListConfig, 'listType'> {
  /** 列表类型 - 强制为 picture-card */
  listType?: 'picture-card';
}

/**
 * 图片上传组件特有属性
 */
export interface ImageUploadProps extends Omit<BaseUploadProps, 'fileList'> {
  /** 语言 */
  locale?: string;
  /** 图片裁剪配置 */
  crop?: CropConfig;
  /** 文件列表配置 - 强制使用 picture-card 类型 */
  fileList?: ImageFileListConfig;
  /** 预览配置 */
  preview?: {
    /** 是否显示预览 */
    visible?: boolean;
    /** 预览图片列表 */
    images?: string[];
    /** 当前预览索引 */
    current?: number;
  };
}
