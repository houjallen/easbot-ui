/**
 * 文件上传工具函数
 * @author xiaomo
 */

import { createMessageProcessor } from '../../utils/ui-message';
import type { UiMessages } from '../../utils/ui-message';
import { fileMessages as builtinFileMessages } from '../../utils/component-messages';
import type { UploadResponse } from './types';
import type { FileInfo, FileValidation } from './types';

// 类型定义，避免直接依赖外部包
type UploadFileParams = {
  file: File;
  name?: string;
  filename?: string;
  data?: Record<string, any>;
};

type AxiosRequestConfig = {
  url?: string;
  method?: string;
  headers?: Record<string, any>;
  onUploadProgress?: (progressEvent: any) => void;
};

// 统一的HTTP客户端接口类型 - 使用 any 避免复杂的类型匹配
type HttpClient = any;

// 国际化消息定义 —— 复用组件库内置文案表（见 src/utils/component-messages.ts）
const fileMessages: UiMessages = builtinFileMessages;

// 创建文件组件的消息处理器
const getMessage = createMessageProcessor({
  messages: fileMessages,
  fallbackLocale: 'zh-CN',
});

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * 验证文件
 */
export function validateFile(file: File, validation?: FileValidation): string | null {
  if (!validation) return null;

  // 检查文件类型
  if (validation.accept && validation.accept.length > 0) {
    const isValidType = validation.accept.some((type) => {
      if (type.startsWith('.')) {
        // 扩展名匹配
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      } else if (type.includes('/')) {
        // MIME类型匹配
        return file.type.match(new RegExp(type.replace('*', '.*')));
      }
      return false;
    });

    if (!isValidType) {
      return getMessage('typeNotSupported', {
        types: validation.accept.join(', '),
      });
    }
  }

  // 检查文件大小
  if (validation.maxSize && file.size > validation.maxSize) {
    return getMessage('maxSizeExceeded', {
      max: formatFileSize(validation.maxSize),
    });
  }

  if (validation.minSize && file.size < validation.minSize) {
    return getMessage('minSizeNotReached', {
      minSize: formatFileSize(validation.minSize),
    });
  }

  return null;
}

/**
 * 文件转换为FileInfo
 */
export function fileToFileInfo(file: File): FileInfo {
  return {
    id: generateId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'pending',
    progress: 0,
  };
}

/**
 * 判断是否为图片文件
 */
export function isImageFile(file: File | FileInfo): boolean {
  const type = file instanceof File ? file.type : file.file?.type || file.type;
  return type ? type.startsWith('image/') : false;
}

/**
 * 获取文件预览URL
 */
export function getFilePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * 获取远程文件预览URL
 * 兼容统一的文件服务接口
 */
export function getRemoteFilePreviewUrl(url: string, isPublicAPI?: boolean): string {
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 如果是相对路径，需要拼接API前缀
  const apiPrefix = isPublicAPI ? '/public-api' : '/api';
  return `${apiPrefix}/files/view/${url}`;
}

/**
 * 清理预览URL，释放内存
 */
export function revokeFilePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * 使用统一HTTP客户端上传文件
 * @param httpClient 统一的HTTP客户端实例 (如 defHttp)
 * @param file 要上传的文件
 * @param config 上传配置
 */
export async function uploadFile(
  httpClient: HttpClient,
  file: File,
  config: {
    url?: string;
    name?: string;
    filename?: string;
    data?: Record<string, any> | ((file: File) => Record<string, any>);
    onProgress?: (progress: number) => void;
  } = {},
): Promise<UploadResponse> {
  try {
    // 处理额外数据
    const extraData = typeof config.data === 'function' ? config.data(file) : config.data;

    // 构建上传参数
    const uploadParams: UploadFileParams = {
      file,
      name: config.name || 'file',
      filename: config.filename,
      data: extraData,
    };

    // 构建请求配置
    const requestConfig: AxiosRequestConfig = {
      url: config.url || '/files/upload',
      onUploadProgress: config.onProgress
        ? (progressEvent: any) => {
            if (progressEvent.lengthComputable) {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              config.onProgress!(progress);
            }
          }
        : undefined,
    };

    // 使用统一的HTTP客户端上传
    // ⚠️ `httpClient` 由消费方注入；未注入（或缺少 uploadFile 方法）时**不能**假成功，
    //    必须返回失败结果，交由调用方把文件标记为 error。
    if (typeof httpClient?.uploadFile !== 'function') {
      return {
        success: false,
        message: getMessage('httpClientMissing'),
      };
    }

    const response = await httpClient.uploadFile(requestConfig, uploadParams);

    // 转换为统一的响应格式
    return {
      success: true,
      url: response?.data?.url || response?.url,
      thumbUrl: response?.data?.thumbUrl || response?.thumbUrl,
      data: response?.data,
      message: response?.msg || response?.message || getMessage('uploadSuccess'),
    };
  } catch (error: any) {
    throw new Error(error.message || getMessage('uploadFailed'));
  }
}

/**
 * 批量上传文件
 * @param httpClient 统一的HTTP客户端实例
 * @param files 文件列表
 * @param config 上传配置
 */
export async function uploadMultipleFiles(
  httpClient: HttpClient,
  files: File[],
  config: {
    url?: string;
    name?: string;
    data?: Record<string, any> | ((file: File) => Record<string, any>);
    onProgress?: (file: File, progress: number) => void;
    onSuccess?: (file: File, response: UploadResponse) => void;
    onError?: (file: File, error: Error) => void;
  } = {},
): Promise<UploadResponse[]> {
  const results: UploadResponse[] = [];

  for (const file of files) {
    try {
      const response = await uploadFile(httpClient, file, {
        ...config,
        onProgress: config.onProgress ? (progress) => config.onProgress!(file, progress) : undefined,
      });

      results.push(response);
      config.onSuccess?.(file, response);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(getMessage('uploadFailed'));
      config.onError?.(file, errorObj);
      throw errorObj;
    }
  }

  return results;
}
