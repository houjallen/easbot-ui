/**
 * 文件上传组件
 * @author xiaomo
 */

import { Button } from '../button';
import { Icon } from '../icon';
import { createMessageProcessor } from '../../utils/ui-message';
import { fileMessages } from '../../utils/component-messages';
import { cn } from '../../utils/classnames';
import type { UploadFileParams } from '../../models/axios';
import type { AxiosRequestConfig } from 'axios';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import type { FileInfo, FileStatus } from './types';
import type { BaseUploadProps } from './types';
import { fileToFileInfo, generateId, uploadFile, validateFile } from './utils';

export interface InputFileProps extends BaseUploadProps {
  /** 统一HTTP客户端实例 */
  httpClient?: {
    uploadFile: (requestConfig: AxiosRequestConfig, uploadParams: UploadFileParams) => Promise<any>;
  };
  /** 语言 */
  locale?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 上传按钮文本 */
  buttonText?: string;
  /** 字段名（表单场景用） */
  name?: string;
}

export const InputFile: React.FC<InputFileProps> = ({
  httpClient = {},
  value = [],
  onChange,
  multiple = false,
  disabled = false,
  upload,
  validation,
  dropzone = { enabled: true },
  fileList = { showList: true, listType: 'text' },
  autoUpload = true,
  className,
  placeholder,
  buttonText,
  name,
  beforeUpload,
  onProgress,
  onSuccess,
  onError,
  onRemove,
  onPreview,
  onDownload,
  locale = 'zh-CN',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileInfo[]>(value);
  // 创建消息处理器
  const getMessage = createMessageProcessor({
    locale: locale,
    messages: fileMessages,
    fallbackLocale: 'zh-CN',
  });

  // 检查是否达到最大文件数
  const isMaxFiles = validation?.maxCount ? files.length >= validation.maxCount : false;

  // 判断上传模式
  const isDragMode = dropzone.enabled;
  const isAppendMode = fileList?.showUploadButton && !isDragMode;
  const isButtonMode = !isDragMode && !isAppendMode;
  // 同步外部value
  useEffect(() => {
    setFiles(value);
  }, [value]);

  // 更新文件列表
  const updateFiles = useCallback(
    (newFiles: FileInfo[]) => {
      setFiles(newFiles);
      onChange?.(newFiles);
    },
    [onChange],
  );

  // 更新单个文件
  const updateFile = useCallback(
    (fileId: string, updates: Partial<FileInfo>) => {
      setFiles((prevFiles) => {
        const newFiles = prevFiles.map((file) => (file.id === fileId ? { ...file, ...updates } : file));
        onChange?.(newFiles);
        return newFiles;
      });
    },
    [onChange],
  );

  // 验证文件数量
  const validateFileCount = useCallback(
    (newFileCount: number) => {
      if (validation?.maxCount && files.length + newFileCount > validation.maxCount) {
        return getMessage('maxCountExceeded', { max: validation.maxCount });
      }
      return null;
    },
    [files.length, validation?.maxCount, getMessage],
  );

  // 上传单个文件
  // ⚠️ **必须定义在 `handleFileSelect` 之前** —— 后者在自动上传分支里调用它，
  // 若定义在其后，`useCallback` 的依赖数组会引用尚未初始化的变量（TS2448 / TS2454）。
  const uploadSingleFile = useCallback(
    async (fileInfo: FileInfo) => {
      if (!upload || !fileInfo.file) return;

      try {
        // 更新状态为上传中
        updateFile(fileInfo.id, { status: 'uploading', progress: 0 });

        // 执行上传
        const response = await uploadFile(httpClient, fileInfo.file, {
          url: upload.action,
          name: upload.name,
          data: upload.data,
          onProgress: (progress) => {
            updateFile(fileInfo.id, { progress });
            onProgress?.(fileInfo, progress);
          },
        });

        // 上传成功
        if (response.success) {
          const updatedFileInfo = {
            status: 'success' as FileStatus,
            progress: 100,
            url: response.url,
            thumbUrl: response.thumbUrl,
            extra: response.data,
          };
          updateFile(fileInfo.id, updatedFileInfo);
          onSuccess?.({ ...fileInfo, ...updatedFileInfo }, response);
        } else {
          throw new Error(response?.message || getMessage('uploadFailed'));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : getMessage('uploadFailed');
        updateFile(fileInfo.id, {
          status: 'error',
          error: errorMessage,
        });
        onError?.(fileInfo, error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [upload, updateFile, onProgress, onSuccess, onError, httpClient, getMessage],
  );

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (selectedFiles: File[]) => {
      if (disabled) return;

      // 验证文件数量
      const countError = validateFileCount(selectedFiles.length);
      if (countError) {
        onError?.(
          {
            id: generateId(),
            name: '',
            size: 0,
            type: '',
            status: 'error' as FileStatus,
          },
          new Error(countError),
        );
        return;
      }

      // 转换为FileInfo并验证
      const newFiles: FileInfo[] = [];
      for (const file of selectedFiles) {
        const fileInfo = fileToFileInfo(file);

        // 验证文件
        const validationError = validateFile(file, validation);
        if (validationError) {
          fileInfo.status = 'error';
          fileInfo.error = validationError;
          newFiles.push(fileInfo);
          onError?.(fileInfo, new Error(validationError));
          continue;
        }

        // 上传前回调
        if (beforeUpload) {
          try {
            const canUpload = await beforeUpload(file, selectedFiles);
            if (!canUpload) {
              continue;
            }
          } catch (error) {
            fileInfo.status = 'error';
            fileInfo.error = error instanceof Error ? error.message : getMessage('validationFailed');
            newFiles.push(fileInfo);
            onError?.(fileInfo, error instanceof Error ? error : new Error(getMessage('validationFailed')));
            continue;
          }
        }

        newFiles.push(fileInfo);
      }

      // 更新文件列表
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      updateFiles(updatedFiles);

      // 自动上传
      if (autoUpload && upload) {
        for (const fileInfo of newFiles) {
          if (fileInfo.status === 'pending') {
            await uploadSingleFile(fileInfo);
          }
        }
      }
    },
    [disabled, files, multiple, validation, beforeUpload, autoUpload, upload, updateFiles, validateFileCount, onError, uploadSingleFile, getMessage],
  );

  // 处理文件下载
  const handleDownload = useCallback(
    (file: FileInfo) => {
      if (onDownload) {
        onDownload(file);
      } else if (file.url) {
        // 默认下载行为
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    [onDownload],
  );

  // 处理文件输入变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        void handleFileSelect(selectedFiles);
      }
      // 清空input值，允许重复选择同一文件
      e.target.value = '';
    },
    [handleFileSelect],
  );

  // 处理拖拽上传
  const handleDrop = useCallback(
    (droppedFiles: File[]) => {
      void handleFileSelect(droppedFiles);
    },
    [handleFileSelect],
  );

  // 点击上传按钮
  const handleUploadClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  // 移除文件
  const handleRemove = useCallback(
    async (fileInfo: FileInfo) => {
      if (onRemove) {
        try {
          const canRemove = await onRemove(fileInfo);
          if (!canRemove) return;
        } catch (error) {
          return;
        }
      }

      const newFiles = files.filter((f) => f.id !== fileInfo.id);
      updateFiles(newFiles);
    },
    [files, onRemove, updateFiles],
  );

  // 预览文件
  const handlePreview = useCallback(
    (fileInfo: FileInfo) => {
      onPreview?.(fileInfo);
    },
    [onPreview],
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* 模式1: 拖拽模式 - 显示拖拽区域 + 文件列表（不显示追加按钮） */}
      {isDragMode && (
        <>
          <Dropzone {...dropzone} disabled={disabled || isMaxFiles} onDrop={handleDrop} onUpload={handleUploadClick} accept={validation?.accept?.join(',')} multiple={multiple} />
          <FileList
            {...fileList}
            files={files}
            onRemove={handleRemove}
            onPreview={onPreview}
            onDownload={handleDownload}
            disabled={disabled}
            isMaxFiles={isMaxFiles}
            showUploadButton={false} // 拖拽模式下不显示追加按钮
          />
        </>
      )}

      {/* 模式2: 按钮模式 - 显示上传按钮 + 文件列表（不显示追加按钮） */}
      {isButtonMode && (
        <div className="flex items-start gap-4">
          <Button variant="outline" disabled={disabled || isMaxFiles} onClick={handleUploadClick} className="flex-shrink-0 gap-2" leftIcon={<Icon name="upload" size={16} />}>
            {buttonText || getMessage('selectFileButton')}
          </Button>

          {files.length === 0 && (placeholder || getMessage('selectFile')) && <span className="text-muted-foreground text-sm">{placeholder || getMessage('selectFile')}</span>}

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="min-w-0 flex-1">
              <FileList
                {...fileList}
                files={files}
                onRemove={handleRemove}
                onPreview={onPreview}
                onDownload={handleDownload}
                disabled={disabled}
                isMaxFiles={isMaxFiles}
                showUploadButton={false} // 按钮模式下不显示追加按钮
              />
            </div>
          )}
        </div>
      )}

      {/* 模式3: 追加模式 - 只显示文件列表（包含追加按钮） */}
      {isAppendMode && (
        <FileList
          {...fileList}
          files={files}
          onRemove={handleRemove}
          onPreview={onPreview}
          onDownload={handleDownload}
          onUpload={handleUploadClick}
          disabled={disabled}
          isMaxFiles={isMaxFiles}
          showUploadButton={true} // 追加模式下显示追加按钮
        />
      )}

      {/* 隐藏的文件输入 */}
      <input ref={fileInputRef} type="file" className="hidden" name={name} accept={validation?.accept?.join(',')} multiple={multiple} disabled={disabled || isMaxFiles} onChange={handleInputChange} />
    </div>
  );
};

export default InputFile;
