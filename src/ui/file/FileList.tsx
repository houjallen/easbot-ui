/**
 * 文件列表组件
 * @author xiaomo
 */

import { AspectRatio } from '../aspect-ratio';
import { Badge } from '../badge';
import { Button } from '../button';
import { Icon, IconButton } from '../icon';
import { Progress } from '../progress';
import { cn } from '../../utils/classnames';
import { fileMessages } from '../../utils/component-messages';
import { processUiMessage } from '../../utils/ui-message';
import { useLocale } from '../../hooks/use-locale';
import { AlertCircle, CheckCircle, Download, Eye, FileText, Loader2, Plus, X } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import React from 'react';
import type { FileInfo } from './types';
import type { FileListConfig } from './types';
import { formatFileSize, isImageFile } from './utils';

interface FileListProps extends FileListConfig {
  /** 文件列表 */
  files: FileInfo[];
  /** 删除文件回调 */
  onRemove?: (file: FileInfo) => void;
  /** 预览文件回调 */
  onPreview?: (file: FileInfo) => void;
  /** 下载文件回调 */
  onDownload?: (file: FileInfo) => void;
  /** 追加上传回调 */
  onUpload?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否达到最大文件数 */
  isMaxFiles?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  showList = true,
  listType = 'text',
  showRemove = true,
  showDownload = true,
  showPreview = true,
  showUploadButton = false,
  uploadButtonText,
  itemRender,
  onRemove,
  onPreview,
  onDownload,
  onUpload,
  disabled = false,
  isMaxFiles = false,
  listClassName,
}) => {
  const { locale } = useLocale();
  // 追加上传按钮文案来自内置文案表
  const finalUploadButtonText = uploadButtonText ?? processUiMessage('addFile', { locale, messages: fileMessages });

  if (!showList) {
    return null;
  }

  // 如果没有文件且不显示上传按钮，则不显示
  if (files.length === 0 && !showUploadButton) {
    return null;
  }

  const renderFileIcon = (file: FileInfo) => {
    if (isImageFile(file)) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  // 渲染追加上传按钮
  const renderUploadButton = () => {
    if (!showUploadButton || disabled || isMaxFiles) {
      return null;
    }

    if (listType === 'tag') {
      return (
        <Badge variant="outline" className="flex cursor-pointer items-center gap-2 border-dashed transition-colors hover:bg-primary/10">
          <Button variant="ghost" size="sm" onClick={onUpload} className="hover:bg-transparent" leftIcon={<Plus className="h-3 w-3" />}>
            {finalUploadButtonText}
          </Button>
        </Badge>
      );
    }

    if (listType === 'picture-card') {
      return (
        <div
          className="relative w-[120px] min-w-[120px] max-w-[120px] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-muted-foreground/25 border-dashed bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted/80"
          onClick={onUpload}
        >
          <AspectRatio ratio={1} className="w-full">
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
              <Icon name="plus" size={24} className="text-muted-foreground" />
              <span className="text-center text-muted-foreground text-xs">{finalUploadButtonText}</span>
            </div>
          </AspectRatio>
        </div>
      );
    }

    return null;
  };

  const renderStatusIcon = (file: FileInfo) => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const renderTextItem = (file: FileInfo, index: number) => {
    if (itemRender) {
      return itemRender(file, index, { onRemove, onPreview, onDownload });
    }

    return (
      <div key={file.id} className="flex items-start gap-2 rounded-lg border p-1 transition-colors hover:bg-muted/50">
        {/* 文件图标 */}
        <div className="flex-shrink-0 text-muted-foreground">{renderFileIcon(file)}</div>

        {/* 文件信息 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-sm">{file.name}</p>
            {renderStatusIcon(file)}
          </div>

          <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
            <span>{formatFileSize(file.size)}</span>
            {file.status === 'uploading' && file.progress !== undefined && <span>{file.progress}%</span>}
            {file.status === 'error' && file.error && <span className="text-red-500">{file.error}</span>}
          </div>

          {/* 上传进度 */}
          {file.status === 'uploading' && file.progress !== undefined && <Progress value={file.progress} className="mt-2 h-1" />}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {showPreview && (file.url || file.thumbUrl) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview?.(file)}
              className="h-8 w-8 p-0"
              aria-label={processUiMessage('preview', { locale, messages: fileMessages })}
              rightIcon={<Eye className="h-4 w-4" aria-hidden="true" />}
            />
          )}

          {showDownload && file.url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload?.(file)}
              className="h-8 w-8 p-0"
              aria-label={processUiMessage('download', { locale, messages: fileMessages })}
              rightIcon={<Download className="h-4 w-4" aria-hidden="true" />}
            />
          )}

          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove?.(file)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              aria-label={processUiMessage('remove', { locale, messages: fileMessages })}
              rightIcon={<X className="h-4 w-4" aria-hidden="true" />}
            />
          )}
        </div>
      </div>
    );
  };

  const renderTagItem = (file: FileInfo, index: number) => {
    if (itemRender) {
      return itemRender(file, index, { onRemove, onPreview, onDownload });
    }

    const handleTagClick = () => {
      if (showDownload && file.url && file.status === 'success') {
        onDownload?.(file);
      }
    };

    const getTagVariant = () => {
      switch (file.status) {
        case 'uploading':
          return 'secondary';
        case 'success':
          return 'default';
        case 'error':
          return 'destructive';
        default:
          return 'outline';
      }
    };

    return (
      <Badge
        key={file.id}
        variant={getTagVariant()}
        className={cn(
          'flex max-w-xs cursor-pointer items-center gap-2 transition-colors',
          file.status === 'uploading' && 'cursor-not-allowed',
          showDownload && file.url && file.status === 'success' && 'hover:bg-primary/80',
        )}
        role={showDownload && file.url && file.status === 'success' && !file.status.startsWith('upload') ? 'button' : undefined}
        tabIndex={showDownload && file.url && file.status === 'success' ? 0 : undefined}
        onClick={handleTagClick}
        onKeyDown={
          showDownload && file.url && file.status === 'success'
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTagClick();
                }
              }
            : undefined
        }
      >
        {/* 文件图标和状态 */}
        <div className="flex items-center gap-2">
          {file.status === 'uploading' ? <Loader2 className="h-3 w-3 animate-spin" /> : renderFileIcon(file)}
          <span className="max-w-32 truncate" title={file.name}>
            {file.name}
          </span>
        </div>

        {/* 上传进度 */}
        {file.status === 'uploading' && file.progress !== undefined && <span className="text-xs">{file.progress}%</span>}

        {/* 删除按钮 */}
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(file);
            }}
            className="hover:bg-transparent"
            aria-label={processUiMessage('remove', { locale, messages: fileMessages })}
            rightIcon={<X className="h-3 w-3" aria-hidden="true" />}
          />
        )}
      </Badge>
    );
  };

  const renderPictureItem = (file: FileInfo, index: number) => {
    if (itemRender) {
      return itemRender(file, index, { onRemove, onPreview, onDownload });
    }

    const imageUrl = file.thumbUrl || file.url || (file.file ? URL.createObjectURL(file.file) : '');

    return (
      <div key={file.id} className="relative w-[120px] min-w-[120px] max-w-[120px] shrink-0 overflow-hidden rounded-lg border bg-muted">
        {/* 图片预览 - 使用 AspectRatio 确保 1:1 比例 */}
        <AspectRatio ratio={1} className="w-full">
          {imageUrl ? (
            <img src={imageUrl} alt={file.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>

        {/* 状态遮罩 */}
        {file.status === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              <p className="mt-1 text-xs">{file.progress}%</p>
            </div>
          </div>
        )}

        {file.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/80">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
        )}

        {/* 操作按钮（右上角） */}
        <div className="absolute top-1 right-1 flex gap-1">
          {showPreview && imageUrl && (
            <IconButton variant="default" size={20} onClick={() => onPreview?.(file)} icon="eye" aria-label={processUiMessage('preview', { locale, messages: fileMessages })} />
          )}

          {showDownload && file.url && (
            <IconButton variant="default" size={20} onClick={() => onDownload?.(file)} icon="download" aria-label={processUiMessage('download', { locale, messages: fileMessages })} />
          )}

          {showRemove && <IconButton variant="destructive" size={20} onClick={() => onRemove?.(file)} icon="x" aria-label={processUiMessage('remove', { locale, messages: fileMessages })} />}
        </div>

        {/* 文件名 */}
        <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-2">
          <p className="truncate text-white text-xs">{file.name}</p>
        </div>
      </div>
    );
  };

  if (listType === 'tag') {
    return (
      <div className={cn('m-0 flex flex-wrap gap-2 p-0', listClassName)}>
        {files.map((file, index) => renderTagItem(file, index))}
        {renderUploadButton()}
      </div>
    );
  }

  if (listType === 'picture-card') {
    return (
      <div className={cn('m-0 flex justify-start gap-2 p-0', listClassName)}>
        {files.map((file, index) => renderPictureItem(file, index))}
        {renderUploadButton()}
      </div>
    );
  }

  if (listType === 'picture') {
    return (
      <div className="gap-2">
        {files.map((file, index) => (
          <div key={file.id} className={cn('m-0 flex items-center gap-2 rounded-lg border p-1', listClassName)}>
            {/* 缩略图 */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border">
              {isImageFile(file) && (file.thumbUrl || file.url || file.file) ? (
                <img src={file.thumbUrl || file.url || (file.file ? URL.createObjectURL(file.file) : '')} alt={file.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">{renderFileIcon(file)}</div>
              )}
            </div>

            {/* 文件信息和操作 */}
            <div className="min-w-0 flex-1">{renderTextItem(file, index)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="m-0 gap-2 p-0">{files.map((file, index) => renderTextItem(file, index))}</div>;
};
