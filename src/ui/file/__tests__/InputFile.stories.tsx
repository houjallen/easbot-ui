/**
 * InputFile 组件 Storybook 故事
 * @author xiaomo
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InputFile } from '../InputFile';
import type { FileInfo } from '../types';

const meta: Meta<typeof InputFile> = {
  title: 'EASAI/File/InputFile',
  component: InputFile,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '文件上传组件，支持拖拽上传、多文件选择、上传进度显示等功能。',
      },
    },
  },
  argTypes: {
    multiple: {
      control: 'boolean',
      description: '是否支持多文件选择',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用组件',
    },
    autoUpload: {
      control: 'boolean',
      description: '是否自动上传',
    },
    buttonText: {
      control: 'text',
      description: '上传按钮文本',
    },
    placeholder: {
      control: 'text',
      description: '占位符文本',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputFile>;

// 模拟上传函数
const mockUpload = (file: File): Promise<{ success: boolean; url?: string; message?: string }> => {
  return new Promise((resolve) => {
    // 模拟上传延迟
    setTimeout(
      () => {
        // 90% 成功率
        if (Math.random() > 0.1) {
          resolve({
            success: true,
            url: `https://example.com/files/${file.name}`,
          });
        } else {
          resolve({
            success: false,
            message: '上传失败，请重试',
          });
        }
      },
      2000 + Math.random() * 3000,
    ); // 2-5秒随机延迟
  });
};

// 基础示例
export const Default: Story = {
  render: (args) => {
    const [files, setFiles] = useState<FileInfo[]>([]);

    return (
      <InputFile
        {...args}
        value={files}
        onChange={setFiles}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
      />
    );
  },
  args: {
    placeholder: '请选择文件',
    buttonText: '选择文件',
  },
};

// 多文件上传
export const Multiple: Story = {
  render: (args) => {
    const [files, setFiles] = useState<FileInfo[]>([]);

    return (
      <InputFile
        {...args}
        value={files}
        onChange={setFiles}
        multiple
        validation={{
          maxCount: 5,
          maxSize: 10 * 1024 * 1024, // 10MB
        }}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
      />
    );
  },
  args: {
    buttonText: '选择多个文件',
  },
};

// 拖拽上传
export const Dropzone: Story = {
  render: (args) => {
    const [files, setFiles] = useState<FileInfo[]>([]);

    return (
      <InputFile
        {...args}
        value={files}
        onChange={setFiles}
        multiple
        dropzone={{
          enabled: true,
          text: '拖拽文件到此区域上传',
          hint: '支持批量上传，单个文件不超过50MB',
        }}
        validation={{
          maxSize: 50 * 1024 * 1024,
        }}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
      />
    );
  },
};

// 带上传功能
export const WithUpload: Story = {
  render: (args) => {
    const [files, setFiles] = useState<FileInfo[]>([]);

    return (
      <InputFile
        {...args}
        value={files}
        onChange={setFiles}
        multiple
        upload={{
          action: '/api/upload', // 模拟接口
          name: 'file',
          headers: {
            Authorization: 'Bearer token',
          },
        }}
        validation={{
          maxSize: 20 * 1024 * 1024,
          maxCount: 3,
          accept: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
        }}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
        onProgress={(file, progress) => console.log('Upload progress:', file.name, progress)}
        beforeUpload={(file) => {
          console.log('Upload before:', file.name);
          return true;
        }}
      />
    );
  },
};

// 文件类型限制
export const FileTypeRestriction: Story = {
  render: (args) => {
    const [files, setFiles] = useState<FileInfo[]>([]);

    return (
      <InputFile
        {...args}
        value={files}
        onChange={setFiles}
        multiple
        validation={{
          accept: ['.pdf', '.doc', '.docx'],
          maxSize: 5 * 1024 * 1024,
        }}
        dropzone={{
          enabled: true,
          text: '仅支持文档文件',
          hint: '支持 PDF、DOC、DOCX 格式',
        }}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
      />
    );
  },
};

// 禁用状态
export const Disabled: Story = {
  render: (args) => {
    const [files, setFiles] = useState<FileInfo[]>([
      {
        id: '1',
        name: 'example.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
        status: 'success',
        url: 'https://example.com/files/example.pdf',
      },
    ]);

    return <InputFile {...args} value={files} onChange={setFiles} disabled />;
  },
};

// 不同列表样式
export const ListTypes: Story = {
  render: () => {
    const [textFiles, setTextFiles] = useState<FileInfo[]>([
      {
        id: '1',
        name: 'document.pdf',
        size: 2 * 1024 * 1024,
        type: 'application/pdf',
        status: 'success',
        url: 'https://example.com/files/document.pdf',
      },
    ]);

    const [pictureFiles, setPictureFiles] = useState<FileInfo[]>([
      {
        id: '3',
        name: 'image1.jpg',
        size: 3 * 1024 * 1024,
        type: 'image/jpeg',
        status: 'success',
        url: 'https://picsum.photos/200/200?random=1',
        thumbUrl: 'https://picsum.photos/200/200?random=1',
      },
    ]);

    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-semibold text-lg">文本列表样式</h3>
          <InputFile
            value={textFiles}
            onChange={setTextFiles}
            fileList={{
              listType: 'text',
              showList: true,
            }}
            dropzone={{ enabled: false }}
          />
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-lg">图片列表样式</h3>
          <InputFile
            value={pictureFiles}
            onChange={setPictureFiles}
            fileList={{
              listType: 'picture',
              showList: true,
            }}
            dropzone={{ enabled: false }}
          />
        </div>
        <div>
          <h3 className="mb-4 font-semibold text-lg">图片列表样式</h3>
          <InputFile
            value={pictureFiles}
            onChange={setPictureFiles}
            fileList={{
              listType: 'picture-card',
              showList: true,
            }}
            dropzone={{ enabled: false }}
          />
        </div>
      </div>
    );
  },
};

// 标签列表样式
export const TagListTypes: Story = {
  render: () => {
    const [textFiles, setTextFiles] = useState<FileInfo[]>([
      {
        id: '1',
        name: 'document_leng_123456789dddfgjlklkhhk.pdf',
        size: 2 * 1024 * 1024,
        type: 'application/pdf',
        status: 'success',
        url: 'https://example.com/files/document.pdf',
      },
      {
        id: '2',
        name: 'image.jpg',
        size: 1.5 * 1024 * 1024,
        type: 'image/jpeg',
        status: 'success',
        url: 'https://picsum.photos/200/200?random=1',
      },
      {
        id: '3',
        name: 'uploading.docx',
        size: 3 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        status: 'uploading',
        progress: 65,
      },
      {
        id: '4',
        name: 'error.xlsx',
        size: 800 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        status: 'error',
        error: '上传失败',
      },
    ]);

    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-semibold text-lg">标签样式 - 单行显示</h3>
          <div className="w-full overflow-x-auto">
            <InputFile
              value={textFiles}
              onChange={setTextFiles}
              multiple={true}
              validation={{
                maxCount: 5, // 最多5个文件
              }}
              fileList={{
                listType: 'tag',
                showList: true,
                showRemove: true,
                showDownload: true,
                showUploadButton: true,
              }}
              dropzone={{ enabled: false }}
              onDownload={(file) => console.log('Download:', file.name)}
              className="min-w-0"
            />
          </div>
        </div>
      </div>
    );
  },
};
