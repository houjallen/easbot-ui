/**
 * 图片上传组件
 *
 * 设计理念：
 * 1. 强制使用 picture-card 列表类型，确保图片展示的一致性
 * 2. 默认开启 remove、download、preview 功能，提供完整的文件操作体验
 * 3. 默认使用追加上传模式，在图片列表中显示"+"按钮添加更多图片
 * 4. 上传模式互斥设计：
 *    - 拖拽模式：显示拖拽区域，不显示追加按钮
 *    - 追加模式（默认）：在图片网格中显示"+"按钮
 *    - 按钮模式：显示独立上传按钮
 * 5. 职责分离：
 *    - FileList 负责通用操作（预览、下载、删除、追加）
 *    - InputImage 负责图片验证和预览对话框
 * 6. 支持图片预览对话框和裁剪功能
 *
 * @author xiaomo
 */

import { Button } from '../button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { createMessageProcessor } from '../../utils/ui-message';
import { fileMessages } from '../../utils/component-messages';
import { ImageIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { InputFile } from './InputFile';
import type { InputFileProps } from './InputFile';
import type { FileInfo } from './types';
import type { ImageUploadProps } from './types';
import { isImageFile } from './utils';

export interface InputImageProps extends ImageUploadProps {
  /** 统一HTTP客户端实例（与 InputFile 保持一致） */
  httpClient?: InputFileProps['httpClient'];
  /** 字段名（表单场景用） */
  name?: string;
  /** 占位符文本 */
  placeholder?: string;
}

export const InputImage: React.FC<InputImageProps> = ({
  crop,
  preview,
  validation = {
    accept: ['image/*'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  fileList = {
    showList: true,
    listType: 'picture-card',
  },
  locale = 'zh-CN',
  ...props
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [cropVisible, setCropVisible] = useState(false);
  const [cropFile, setCropFile] = useState<FileInfo | null>(null);
  // 创建消息处理器
  const getMessage = createMessageProcessor({
    locale,
    messages: fileMessages,
    fallbackLocale: 'zh-CN',
  });
  // 处理文件选择前的验证
  const handleBeforeUpload = useCallback(
    async (file: File, fileList: File[]) => {
      // 验证是否为图片
      if (!isImageFile(file)) {
        throw new Error(getMessage('onlyImageFiles'));
      }
      // 调用原始的beforeUpload
      if (props.beforeUpload) {
        return props.beforeUpload(file, fileList);
      }

      return true;
    },
    [props.beforeUpload, getMessage],
  );

  // 处理图片预览
  const handlePreview = useCallback(
    (file: FileInfo) => {
      const imageUrl = file.url || file.thumbUrl || (file.file ? URL.createObjectURL(file.file) : '');
      if (imageUrl) {
        setPreviewImage(imageUrl);
        setPreviewTitle(file.name);
        setPreviewVisible(true);
      }

      props.onPreview?.(file);
    },
    [props.onPreview],
  );

  // 处理图片裁剪
  const handleCrop = useCallback(
    (file: FileInfo) => {
      if (crop?.enabled && file.file) {
        setCropFile(file);
        setCropVisible(true);
      }
    },
    [crop?.enabled],
  );

  // 关闭预览
  const handlePreviewClose = useCallback(() => {
    setPreviewVisible(false);
    setPreviewImage('');
    setPreviewTitle('');
  }, []);

  // 关闭裁剪
  const handleCropClose = useCallback(() => {
    setCropVisible(false);
    setCropFile(null);
  }, []);

  // 确认裁剪
  const handleCropConfirm = useCallback(
    (croppedFile?: File) => {
      // TODO: 实现裁剪逻辑
      // 这里需要集成裁剪库，如react-image-crop或cropperjs
      console.debug('裁剪文件:', croppedFile);
      handleCropClose();
    },
    [handleCropClose],
  );

  // 自定义拖拽区域内容
  const dropzoneChildren = (
    <div className="flex flex-col items-center justify-center p-8">
      <ImageIcon className="h-12 w-12 text-muted-foreground" />
      <p className="mt-4 font-medium text-sm">{getMessage('clickOrDragImage')}</p>
      <p className="mt-2 text-muted-foreground text-xs">
        {getMessage('supportFormats', {
          maxSize: Math.round((validation.maxSize || 0) / 1024 / 1024),
        })}
      </p>
    </div>
  );

  // 注意：不再使用 customItemRender，让 FileList 的 picture-card 类型处理所有通用功能
  // 如果需要添加裁剪功能，可以考虑通过其他方式实现，比如在预览对话框中添加裁剪按钮

  return (
    <>
      <InputFile
        {...props}
        httpClient={props.httpClient}
        validation={validation}
        fileList={{
          listType: 'picture-card', // 强制使用 picture-card 类型
          showList: true,
          showRemove: true, // 默认开启删除
          showDownload: true, // 默认开启下载
          showPreview: true, // 默认开启预览
          showUploadButton: true, // 默认开启追加上传模式
          uploadButtonText: getMessage('addImage'), // 图片上传的按钮文本
          ...fileList, // 允许外部覆盖配置
          // 不使用 customItemRender，让 FileList 处理所有通用功能
        }}
        dropzone={{
          enabled: false, // 默认关闭拖拽模式，使用追加模式
          children: dropzoneChildren,
          ...props.dropzone,
        }}
        beforeUpload={handleBeforeUpload}
        onPreview={handlePreview}
        onDownload={props.onDownload}
      />

      {/* 图片预览对话框 */}
      <Dialog open={previewVisible} onOpenChange={setPreviewVisible}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center">
            <img src={previewImage} alt={previewTitle} className="max-h-[70vh] max-w-full object-contain" />
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={handlePreviewClose}>
              {getMessage('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片裁剪对话框 */}
      {crop?.enabled && (
        <Dialog open={cropVisible} onOpenChange={setCropVisible}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{getMessage('cropTitle')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* TODO: 集成裁剪组件 */}
              <div className="flex h-96 items-center justify-center border-2 border-dashed">
                <p className="text-muted-foreground">{getMessage('cropPending')}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCropClose}>
                  {getMessage('cancel')}
                </Button>
                <Button onClick={() => handleCropConfirm(cropFile?.file)}>{getMessage('confirmCrop')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InputImage;
