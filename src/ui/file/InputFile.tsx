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

/**
 * 空文件列表常量
 *
 * @description
 * 作为 `value` 的默认值时必须复用**同一个数组引用**——
 * 若在默认参数位置直接写 `[]`，每次渲染都会产生新数组，
 * 会让「同步外部 value」的 effect 依赖每渲染都变，触发无限渲染循环。
 */
const EMPTY_FILES: FileInfo[] = [];

export const InputFile: React.FC<InputFileProps> = ({
  httpClient = {},
  value = EMPTY_FILES,
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
  // 标记「最近一次 files 变化是否由内部操作触发」——
  // 内部触发才需要回调 onChange；外部 value 变化只做同步，不回抛。
  const internalChangeRef = useRef(false);
  // 创建消息处理器
  const getMessage = createMessageProcessor({
    locale: locale,
    messages: fileMessages,
    fallbackLocale: 'zh-CN',
  });

  // 检查是否达到最大文件数
  // 有效上限：单选模式（multiple=false）隐式为 1 —— 选满即应隐藏追加入口（+ 号区域）；
  // 多选模式取 validation.maxCount（未设置则不限）。
  // ⚠️ 仅用于 UI 判定（隐藏 + 号 / 禁用 input / 禁用拖拽区）；
  //    选择时的数量拦截（validateFileCount）仍以显式 maxCount 为准——
  //    单选是「替换」语义，不能被隐式上限 1 误拦。
  const effectiveMaxCount = multiple ? validation?.maxCount : (validation?.maxCount ?? 1);
  const isMaxFiles = effectiveMaxCount ? files.length >= effectiveMaxCount : false;

  // 判断上传模式
  const isDragMode = dropzone.enabled;
  const isAppendMode = fileList?.showUploadButton && !isDragMode;
  const isButtonMode = !isDragMode && !isAppendMode;

  // 同步外部value
  useEffect(() => {
    internalChangeRef.current = false;
    setFiles(value);
  }, [value]);

  // 内部状态变化时回调 onChange
  useEffect(() => {
    if (!internalChangeRef.current) return;
    internalChangeRef.current = false;
    onChange?.(files);
  }, [files, onChange]);

  // 更新文件列表
  const updateFiles = useCallback((newFiles: FileInfo[]) => {
    internalChangeRef.current = true;
    setFiles(newFiles);
  }, []);

  // 更新单个文件
  const updateFile = useCallback((fileId: string, updates: Partial<FileInfo>) => {
    // ⚠️ `onChange` 通过 effect 统一回抛 ——
    //    状态更新函数内不得有副作用（React 严格模式下会被重复调用，
    //    且若 `onChange` 反向驱动 `value` 会形成死循环）。
    internalChangeRef.current = true;
    setFiles((prevFiles) => prevFiles.map((file) => (file.id === fileId ? { ...file, ...updates } : file)));
  }, []);
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
        // ⚠️ 与 `onRemove` 同一纪律：**仅显式 `false` 否决上传**——
        //    `void` / `undefined`（常见于「只做副作用、不否决」的用法）一律放行。
        if (beforeUpload) {
          try {
            const canUpload = await beforeUpload(file, selectedFiles);
            if (canUpload === false) {
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
  // ⚠️ `onRemove` 的返回值**仅显式 `false`（或 `Promise<false>`）阻止删除**——
  //    `void` / `undefined` 一律视为允许。
  //    背景：Storybook 的 `actions.argTypesRegex` 会向所有 `on*` props 自动注入
  //    action 函数（返回 `undefined`），若把 `undefined` 当作「阻止」，
  //    任何未手动声明 `onRemove` 的 story 里删除按钮都会失效。
  const handleRemove = useCallback(
    async (fileInfo: FileInfo) => {
      if (onRemove) {
        try {
          const canRemove = await onRemove(fileInfo);
          if (canRemove === false) return;
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
