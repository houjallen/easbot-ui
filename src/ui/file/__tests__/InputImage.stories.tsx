/**
 * InputImage 组件 Storybook 故事
 * @author xiaomo
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InputImage } from '../InputImage';
import type { FileInfo } from '../types';

const meta: Meta<typeof InputImage> = {
  title: 'EASAI/File/InputImage',
  component: InputImage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '图片上传组件，支持图片预览、裁剪、拖拽上传等功能。',
      },
    },
  },
  argTypes: {
    multiple: {
      control: 'boolean',
      description: '是否支持多图片选择',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用组件',
    },
    crop: {
      enabled: {
        control: 'boolean',
        description: '是否启用裁剪功能',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputImage>;

// 基础图片上传
export const Default: Story = {
  render: (args) => {
    const [images, setImages] = useState<FileInfo[]>([]);

    return (
      <InputImage
        {...args}
        value={images}
        onChange={setImages}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
        onPreview={(file) => console.log('Preview:', file.name)}
      />
    );
  },
};

// 多图片上传
export const Multiple: Story = {
  render: (args) => {
    const [images, setImages] = useState<FileInfo[]>([]);

    return (
      <InputImage
        {...args}
        value={images}
        onChange={setImages}
        multiple
        validation={{
          maxCount: 9,
          maxSize: 5 * 1024 * 1024, // 5MB
          accept: ['image/*'],
        }}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
        onPreview={(file) => console.log('Preview:', file.name)}
      />
    );
  },
};

// 带裁剪功能
export const WithCrop: Story = {
  render: (args) => {
    const [images, setImages] = useState<FileInfo[]>([]);

    return (
      <InputImage
        {...args}
        value={images}
        onChange={setImages}
        crop={{
          enabled: true,
          aspectRatio: 1, // 1:1 比例
          quality: 0.8,
        }}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
        onPreview={(file) => console.log('Preview:', file.name)}
      />
    );
  },
};

// 禁用状态
export const Disabled: Story = {
  render: (args) => {
    const [images, setImages] = useState<FileInfo[]>([
      {
        id: '1',
        name: 'example.jpg',
        size: 2 * 1024 * 1024,
        type: 'image/jpeg',
        status: 'success',
        url: 'https://picsum.photos/300/200?random=1',
        thumbUrl: 'https://picsum.photos/300/200?random=1',
      },
    ]);

    return <InputImage {...args} value={images} onChange={setImages} disabled />;
  },
};

// 图片卡片样式
export const PictureCard: Story = {
  render: (args) => {
    const [images, setImages] = useState<FileInfo[]>([
      {
        id: '1',
        name: 'image1.jpg',
        size: 3 * 1024 * 1024,
        type: 'image/jpeg',
        status: 'success',
        url: 'https://picsum.photos/200/200?random=1',
        thumbUrl: 'https://picsum.photos/200/200?random=1',
      },
      {
        id: '2',
        name: 'image2.png',
        size: 2.5 * 1024 * 1024,
        type: 'image/png',
        status: 'uploading',
        progress: 45,
      },
      {
        id: '3',
        name: 'image3.gif',
        size: 1.8 * 1024 * 1024,
        type: 'image/gif',
        status: 'error',
        error: '上传失败',
      },
    ]);

    return (
      <InputImage
        {...args}
        value={images}
        onChange={setImages}
        multiple
        fileList={{
          listType: 'picture-card',
          showList: true,
        }}
        validation={{
          maxCount: 6,
          maxSize: 5 * 1024 * 1024,
        }}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
        onPreview={(file) => console.log('Preview:', file.name)}
      />
    );
  },
};

// 图片卡片样式
export const ListPictureCard: Story = {
  render: (args) => {
    const [images, setImages] = useState<FileInfo[]>([
      {
        id: '1',
        name: 'image1.jpg',
        size: 3 * 1024 * 1024,
        type: 'image/jpeg',
        status: 'success',
        url: 'https://picsum.photos/200/200?random=1',
        thumbUrl: 'https://picsum.photos/200/200?random=1',
      },
      {
        id: '2',
        name: 'image2.png',
        size: 2.5 * 1024 * 1024,
        type: 'image/png',
        status: 'uploading',
        progress: 45,
      },
      {
        id: '3',
        name: 'image3.gif',
        size: 1.8 * 1024 * 1024,
        type: 'image/gif',
        status: 'error',
        error: '上传失败',
      },
    ]);

    return (
      <InputImage
        {...args}
        value={images}
        onChange={setImages}
        multiple
        fileList={{
          listType: 'picture-card',
          showList: true,
          showRemove: true,
          showDownload: true,
        }}
        validation={{
          maxCount: 3,
          maxSize: 5 * 1024 * 1024,
        }}
        dropzone={{ enabled: false }}
        onSuccess={(file, response) => console.log('Upload success:', file.name, response)}
        onError={(file, error) => console.log('Upload error:', file.name, error.message)}
        onPreview={(file) => console.log('Preview:', file.name)}
      />
    );
  },
};
