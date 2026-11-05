/**
 * 文件拖拽上传区域组件
 * @author xiaomo
 */

import { cn } from '../../utils/classnames';
import { fileMessages } from '../../utils/component-messages';
import { processUiMessage } from '../../utils/ui-message';
import { useLocale } from '../../hooks/use-locale';
import { FileText, Upload } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import type { DropzoneConfig } from './types';

interface DropzoneProps extends DropzoneConfig {
  /** 是否禁用 */
  disabled?: boolean;
  /** 文件拖拽回调 */
  onDrop?: (files: File[]) => void;
  /** 点击上传回调 */
  onUpload?: () => void;
  /** 接受的文件类型 */
  accept?: string;
  /** 是否多选 */
  multiple?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ enabled = true, text, hint, children, className, disabled = false, onDrop, onUpload, accept, multiple = false }) => {
  const { locale } = useLocale();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // 拖拽区文案来自内置文案表
  const finalText = text ?? processUiMessage('dropzoneText', { locale, messages: fileMessages });
  const finalHint = hint ?? processUiMessage('dropzoneHint', { locale, messages: fileMessages });
  const releaseText = processUiMessage('dropzoneRelease', { locale, messages: fileMessages });

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || !enabled) return;

      setDragCounter((prev) => prev + 1);
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true);
      }
    },
    [disabled, enabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || !enabled) return;

      setDragCounter((prev) => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragOver(false);
        }
        return newCounter;
      });
    },
    [disabled, enabled],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || !enabled) return;

      setIsDragOver(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDrop?.(files);
      }
    },
    [disabled, enabled, onDrop],
  );

  const handleClick = useCallback(() => {
    // ⚠️ 点击路径与键盘 / 拖拽路径的拦截条件必须一致 ——
    //    `enabled=false` 时不响应（否则会出现「无 button 语义但点击仍触发」的矛盾行为）。
    if (disabled || !enabled) return;
    onUpload?.();
  }, [disabled, enabled, onUpload]);

  if (children) {
    return (
      <div
        className={cn('relative outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring', enabled && !disabled && 'cursor-pointer', className)}
        role={enabled && !disabled ? 'button' : undefined}
        tabIndex={enabled && !disabled ? 0 : undefined}
        aria-disabled={disabled || undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={
          enabled && !disabled
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
      >
        {children}
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-primary border-dashed bg-primary/5">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 font-medium text-primary text-sm">{releaseText}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
        // 禁用时不得再拼 `hover:border-*` —— 悬停边框变深会让禁用拖拽区看起来可交互
        isDragOver ? 'border-primary bg-primary/5' : disabled ? 'border-muted-foreground/25' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50',
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role={enabled && !disabled ? 'button' : undefined}
      tabIndex={enabled && !disabled ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onKeyDown={
        enabled && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <div className="text-center">
        {isDragOver ? <Upload className="mx-auto h-12 w-12 text-primary" /> : <FileText className="mx-auto h-12 w-12 text-muted-foreground" />}

        <p className="mt-4 font-medium text-foreground text-sm">{isDragOver ? releaseText : finalText}</p>

        {finalHint && !isDragOver && <p className="mt-2 text-muted-foreground text-xs">{finalHint}</p>}
      </div>

      <input type="file" className="hidden" accept={accept} multiple={multiple} disabled={disabled} />
    </div>
  );
};
