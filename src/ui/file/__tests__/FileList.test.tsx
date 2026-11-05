/**
 * FileList 组件单元测试
 *
 * @description
 * 覆盖四种列表样式（text / tag / picture / picture-card）的渲染、
 * 操作按钮（移除 / 预览 / 下载 / 追加上传）的显隐与回调、
 * 状态展示（进度 / 错误）、itemRender 接管与空态边界。
 *
 * 图片缩略图依赖的 `URL.createObjectURL` 由 `tests/polyfills.ts` 全局提供。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileList } from '../FileList';
import type { FileInfo } from '../types';

const successFile: FileInfo = {
  id: '1',
  name: 'report.pdf',
  size: 2 * 1024 * 1024,
  type: 'application/pdf',
  status: 'success',
  url: 'https://example.com/files/report.pdf',
};

const uploadingFile: FileInfo = {
  id: '2',
  name: 'uploading.docx',
  size: 1024 * 1024,
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  status: 'uploading',
  progress: 65,
};

const errorFile: FileInfo = {
  id: '3',
  name: 'error.xlsx',
  size: 800 * 1024,
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  status: 'error',
  error: '上传失败',
};

describe('FileList 组件', () => {
  describe('渲染（text 列表）', () => {
    it('应渲染文件名与格式化后的大小', () => {
      render(<FileList files={[successFile]} />);

      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('2 MB')).toBeInTheDocument();
    });

    it('uploading 状态应渲染进度百分比', () => {
      render(<FileList files={[uploadingFile]} />);

      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('error 状态应渲染错误信息', () => {
      render(<FileList files={[errorFile]} />);

      expect(screen.getByText('error.xlsx')).toBeInTheDocument();
      expect(screen.getByText('上传失败')).toBeInTheDocument();
    });

    it('多个文件应全部渲染', () => {
      render(<FileList files={[successFile, uploadingFile]} />);

      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('uploading.docx')).toBeInTheDocument();
    });
  });

  describe('空态边界', () => {
    it('showList 为 false 时应返回 null', () => {
      const { container } = render(<FileList files={[successFile]} showList={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('无文件且不显示追加上传按钮时应返回 null', () => {
      const { container } = render(<FileList files={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('无文件但显示追加上传按钮时应渲染按钮', () => {
      // 追加上传按钮仅 tag / picture-card 样式渲染
      render(<FileList files={[]} listType="tag" showUploadButton onUpload={vi.fn()} />);

      expect(screen.getByText('添加文件')).toBeInTheDocument();
    });
  });

  describe('操作按钮显隐', () => {
    it('默认应渲染移除按钮，且预览 / 下载依赖 url', () => {
      render(<FileList files={[successFile]} />);

      expect(screen.getByRole('button', { name: '移除' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '预览' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '下载文件' })).toBeInTheDocument();
    });

    it('无 url 的文件不渲染预览与下载按钮', () => {
      render(<FileList files={[uploadingFile]} />);

      expect(screen.queryByRole('button', { name: '预览' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '下载文件' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '移除' })).toBeInTheDocument();
    });

    it('showRemove / showDownload / showPreview 关闭时应隐藏对应按钮', () => {
      render(<FileList files={[successFile]} showRemove={false} showDownload={false} showPreview={false} />);

      expect(screen.queryByRole('button', { name: '移除' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '下载文件' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '预览' })).not.toBeInTheDocument();
    });
  });

  describe('操作回调（text 列表）', () => {
    it('点击移除 / 预览 / 下载应触发对应回调', () => {
      const onRemove = vi.fn();
      const onPreview = vi.fn();
      const onDownload = vi.fn();
      render(<FileList files={[successFile]} onRemove={onRemove} onPreview={onPreview} onDownload={onDownload} />);

      fireEvent.click(screen.getByRole('button', { name: '移除' }));
      fireEvent.click(screen.getByRole('button', { name: '预览' }));
      fireEvent.click(screen.getByRole('button', { name: '下载文件' }));

      expect(onRemove).toHaveBeenCalledWith(successFile);
      expect(onPreview).toHaveBeenCalledWith(successFile);
      expect(onDownload).toHaveBeenCalledWith(successFile);
    });

    it('未提供回调时点击不应抛错', () => {
      render(<FileList files={[successFile]} />);

      expect(() => fireEvent.click(screen.getByRole('button', { name: '移除' }))).not.toThrow();
    });
  });

  describe('tag 列表', () => {
    it('应渲染标签形式并支持删除', () => {
      const onRemove = vi.fn();
      render(<FileList files={[successFile]} listType="tag" onRemove={onRemove} />);

      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '移除' }));
      expect(onRemove).toHaveBeenCalledWith(successFile);
    });

    it('error 文件应使用 destructive 变体', () => {
      render(<FileList files={[errorFile]} listType="tag" />);

      // Badge destructive 变体携带 bg-destructive 语义类
      const badge = screen.getByText('error.xlsx').closest('[data-slot="badge"]');
      expect(badge).not.toBeNull();
      expect(badge).toHaveClass('bg-destructive');
    });

    it('showUploadButton 时应渲染追加上传按钮并响应点击', () => {
      const onUpload = vi.fn();
      render(<FileList files={[successFile]} listType="tag" showUploadButton onUpload={onUpload} />);

      fireEvent.click(screen.getByText('添加文件'));
      expect(onUpload).toHaveBeenCalledTimes(1);
    });

    it('达到最大文件数时应隐藏追加上传按钮', () => {
      render(<FileList files={[successFile]} listType="tag" showUploadButton isMaxFiles />);

      expect(screen.queryByText('添加文件')).not.toBeInTheDocument();
    });
  });

  describe('picture-card 列表', () => {
    const imageFile: FileInfo = {
      id: '4',
      name: 'photo.jpg',
      size: 3 * 1024 * 1024,
      type: 'image/jpeg',
      status: 'success',
      url: 'https://example.com/files/photo.jpg',
      thumbUrl: 'https://example.com/files/photo-thumb.jpg',
    };

    it('应渲染缩略图与文件名', () => {
      render(<FileList files={[imageFile]} listType="picture-card" />);

      const img = screen.getByAltText('photo.jpg') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.getAttribute('src')).toBe('https://example.com/files/photo-thumb.jpg');
      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    });

    it('应渲染右上角操作按钮并响应移除', () => {
      const onRemove = vi.fn();
      render(<FileList files={[imageFile]} listType="picture-card" onRemove={onRemove} />);

      fireEvent.click(screen.getByRole('button', { name: '移除' }));
      expect(onRemove).toHaveBeenCalledWith(imageFile);
    });

    it('uploading 状态应显示进度遮罩', () => {
      const uploadingImage: FileInfo = { ...imageFile, id: '5', name: 'uploading.png', status: 'uploading', progress: 40 };
      render(<FileList files={[uploadingImage]} listType="picture-card" />);

      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  describe('picture 列表', () => {
    const imageFile: FileInfo = {
      id: '6',
      name: 'cover.jpg',
      size: 1024,
      type: 'image/jpeg',
      status: 'success',
      url: 'https://example.com/files/cover.jpg',
    };

    it('应渲染缩略图与文件信息', () => {
      render(<FileList files={[imageFile]} listType="picture" />);

      expect(screen.getByAltText('cover.jpg')).toBeInTheDocument();
      expect(screen.getByText('cover.jpg')).toBeInTheDocument();
      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });
  });

  /**
   * 禁用态与配合图标
   *
   * @description
   * 回归背景：组件 disabled 时只隐藏了追加上传入口，各列表样式的
   * 移除 / 预览 / 下载图标仍可点击、仍显示 pointer —— 「主体禁用、
   * 配合图标未禁用」。修复后 `disabled` 统一下传给所有操作按钮，
   * tag 的 Badge（非 button）用 aria-disabled + 事件早退兜底。
   */
  describe('禁用态与配合图标', () => {
    it('text 列表禁用时所有操作按钮应不可点击', () => {
      const onRemove = vi.fn();
      const onPreview = vi.fn();
      const onDownload = vi.fn();
      render(<FileList files={[successFile]} disabled onRemove={onRemove} onPreview={onPreview} onDownload={onDownload} />);

      for (const name of ['移除', '预览', '下载文件']) {
        const button = screen.getByRole('button', { name });
        expect(button).toBeDisabled();
        // Button 用 `disabled:` 变体表达禁用光标（picture-card 的 IconButton 是裸条件类）
        expect(button).toHaveClass('disabled:cursor-not-allowed');
        fireEvent.click(button);
      }

      expect(onRemove).not.toHaveBeenCalled();
      expect(onPreview).not.toHaveBeenCalled();
      expect(onDownload).not.toHaveBeenCalled();
    });

    it('picture-card 禁用时右上角图标应 disabled 且不可触发回调', () => {
      const onRemove = vi.fn();
      const imageFile: FileInfo = { ...successFile, id: 'img', name: 'photo.jpg', type: 'image/jpeg', thumbUrl: 'https://example.com/thumb.jpg' };
      render(<FileList files={[imageFile]} listType="picture-card" disabled onRemove={onRemove} />);

      const removeButton = screen.getByRole('button', { name: '移除' });
      expect(removeButton).toBeDisabled();
      expect(removeButton).toHaveClass('cursor-not-allowed');

      fireEvent.click(removeButton);
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('tag 禁用时 Badge 不应触发下载且应标记 aria-disabled', () => {
      const onDownload = vi.fn();
      render(<FileList files={[successFile]} listType="tag" disabled onDownload={onDownload} />);

      const badge = screen.getByText('report.pdf').closest('[data-slot="badge"]');
      expect(badge).toHaveAttribute('aria-disabled', 'true');
      expect(badge).toHaveClass('cursor-not-allowed');

      // Badge 不是 button，靠 handleTagClick 早退兜底
      if (badge) fireEvent.click(badge);
      expect(onDownload).not.toHaveBeenCalled();

      expect(screen.getByRole('button', { name: '移除' })).toBeDisabled();
    });
  });

  describe('itemRender 接管', () => {
    it('提供 itemRender 时应完全替换内置单项渲染', () => {
      const onRemove = vi.fn();
      render(
        <FileList
          files={[successFile]}
          itemRender={(file) => (
            <button type="button" onClick={() => onRemove(file)}>
              自定义-{file.name}
            </button>
          )}
        />,
      );

      expect(screen.getByText('自定义-report.pdf')).toBeInTheDocument();
      // 内置渲染的移除按钮不应出现
      expect(screen.queryByRole('button', { name: '移除' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('自定义-report.pdf'));
      expect(onRemove).toHaveBeenCalledWith(successFile);
    });

    it('itemRender 第三个参数应透传操作回调', () => {
      const onRemove = vi.fn();
      render(
        <FileList
          files={[successFile]}
          itemRender={(file, _index, actions) => (
            <button type="button" onClick={() => actions.onRemove?.(file)}>
              透传
            </button>
          )}
          onRemove={onRemove}
        />,
      );

      fireEvent.click(screen.getByText('透传'));
      expect(onRemove).toHaveBeenCalledWith(successFile);
    });
  });
});
