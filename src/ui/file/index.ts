/**
 * 文件上传组件导出
 * @author xiaomo
 */

export { InputFile } from './InputFile';
export { InputImage } from './InputImage';
export { Dropzone } from './Dropzone';
export { FileList } from './FileList';

export type {
  FileInfo,
  FileStatus,
  UploadResponse,
  UploadConfig,
  FileValidation,
  DropzoneConfig,
  FileListConfig,
  CropConfig,
  BaseUploadProps,
  ImageUploadProps,
} from './types';

export {
  generateId,
  formatFileSize,
  validateFile,
  fileToFileInfo,
  isImageFile,
  getFilePreviewUrl,
  uploadFile,
} from './utils';
