/**
 * file 组件工具函数单元测试
 *
 * @description
 * 覆盖 `src/ui/file/utils.ts` 的纯函数：
 * `generateId` / `formatFileSize` / `validateFile` / `fileToFileInfo` /
 * `isImageFile` / `uploadFile`（响应映射与参数构建）/
 * `getRemoteFilePreviewUrl` / `revokeFilePreviewUrl`。
 *
 * `uploadFile` 的「未注入 httpClient」失败路径已在
 * `InputFile.test.tsx` 覆盖，本文件聚焦参数构建与响应归一化。
 */

import { describe, expect, it, vi } from 'vitest';
import { fileToFileInfo, formatFileSize, generateId, getRemoteFilePreviewUrl, isImageFile, revokeFilePreviewUrl, uploadFile, validateFile } from '../utils';
import type { FileInfo } from '../types';

describe('file 工具函数', () => {
  describe('generateId', () => {
    it('应生成 file_ 前缀的唯一 ID', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));

      expect(ids.size).toBe(100);
      for (const id of ids) {
        expect(id).toMatch(/^file_\d+_[a-z0-9]+$/);
      }
    });
  });

  describe('formatFileSize', () => {
    it('应格式化字节单位', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('应保留两位小数', () => {
      // 276390 / 1024 = 269.912109375 → 269.91 KB
      expect(formatFileSize(276390)).toBe('269.91 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('validateFile', () => {
    const imageFile = new File(['x'], 'photo.JPG', { type: 'image/jpeg' });

    it('未传 validation 时应放行', () => {
      expect(validateFile(imageFile)).toBeNull();
    });

    it('accept 为空数组时应放行', () => {
      expect(validateFile(imageFile, { accept: [] })).toBeNull();
    });

    it('扩展名匹配应忽略大小写', () => {
      expect(validateFile(imageFile, { accept: ['.jpg', '.png'] })).toBeNull();
      expect(validateFile(imageFile, { accept: ['.png'] })).not.toBeNull();
    });

    it('MIME 通配符应匹配', () => {
      expect(validateFile(imageFile, { accept: ['image/*'] })).toBeNull();
      expect(validateFile(imageFile, { accept: ['text/*'] })).not.toBeNull();
    });

    it('类型不匹配时应返回类型错误信息', () => {
      const error = validateFile(imageFile, { accept: ['.pdf'] });
      expect(error).toContain('不支持的文件类型');
      expect(error).toContain('.pdf');
    });

    it('超过 maxSize 时应返回大小错误信息', () => {
      const bigFile = new File(['x'.repeat(2048)], 'big.txt', { type: 'text/plain' });
      const error = validateFile(bigFile, { maxSize: 1024 });
      expect(error).toContain('文件大小超出限制');
    });

    it('小于 minSize 时应返回大小错误信息', () => {
      const smallFile = new File(['x'], 'small.txt', { type: 'text/plain' });
      const error = validateFile(smallFile, { minSize: 1024 });
      expect(error).toContain('文件大小不能小于');
    });
  });

  describe('fileToFileInfo', () => {
    it('应把 File 转换为 pending 状态的 FileInfo', () => {
      const file = new File(['x'], 'a.txt', { type: 'text/plain' });
      const info = fileToFileInfo(file);

      expect(info.file).toBe(file);
      expect(info.name).toBe('a.txt');
      expect(info.size).toBe(file.size);
      expect(info.type).toBe('text/plain');
      expect(info.status).toBe('pending');
      expect(info.progress).toBe(0);
      expect(info.id).toMatch(/^file_/);
    });
  });

  describe('isImageFile', () => {
    it('应识别 File 与 FileInfo 两种入参', () => {
      expect(isImageFile(new File(['x'], 'a.png', { type: 'image/png' }))).toBe(true);
      expect(isImageFile(new File(['x'], 'a.txt', { type: 'text/plain' }))).toBe(false);

      const info: FileInfo = { id: '1', name: 'a.png', size: 1, type: 'image/png', status: 'success' };
      expect(isImageFile(info)).toBe(true);
    });

    it('FileInfo 优先取原始 File 的 type', () => {
      const file = new File(['x'], 'b.jpg', { type: 'image/jpeg' });
      const info = fileToFileInfo(file);
      // FileInfo.type 兜底、原始 file 优先
      expect(isImageFile(info)).toBe(true);
    });

    it('无类型时应返回 false', () => {
      const info: FileInfo = { id: '1', name: 'unknown', size: 1, type: '', status: 'pending' };
      expect(isImageFile(info)).toBe(false);
    });
  });

  describe('uploadFile', () => {
    it('应提取 response.data.url 并归一化响应', async () => {
      const uploadFileMock = vi.fn().mockResolvedValue({
        data: { url: 'https://example.com/a.png', thumbUrl: 'https://example.com/a-thumb.png' },
        msg: 'ok',
      });

      const response = await uploadFile({ uploadFile: uploadFileMock }, new File(['x'], 'a.png', { type: 'image/png' }), {
        url: '/api/upload',
        name: 'attachment',
      });

      expect(response.success).toBe(true);
      expect(response.url).toBe('https://example.com/a.png');
      expect(response.thumbUrl).toBe('https://example.com/a-thumb.png');
      expect(response.message).toBe('ok');

      // 参数构建：url / name / file 均透传给 httpClient
      const [requestConfig, uploadParams] = uploadFileMock.mock.calls[0] as [{ url?: string }, { file: File; name?: string }];
      expect(requestConfig.url).toBe('/api/upload');
      expect(uploadParams.file.name).toBe('a.png');
      expect(uploadParams.name).toBe('attachment');
    });

    it('data 为函数时应按文件计算额外表单数据', async () => {
      const uploadFileMock = vi.fn().mockResolvedValue({ data: {} });
      const file = new File(['x'], 'b.png', { type: 'image/png' });

      await uploadFile({ uploadFile: uploadFileMock }, file, {
        data: (f) => ({ filename: `prefix-${f.name}` }),
      });

      const [, uploadParams] = uploadFileMock.mock.calls[0] as [unknown, { data?: Record<string, string> }];
      expect(uploadParams.data).toEqual({ filename: 'prefix-b.png' });
    });

    it('响应无 msg 时应回退到内置成功文案', async () => {
      const uploadFileMock = vi.fn().mockResolvedValue({ data: { url: 'u' } });
      const response = await uploadFile({ uploadFile: uploadFileMock }, new File(['x'], 'c.png', { type: 'image/png' }));

      expect(response.message).toBe('上传成功');
    });

    it('httpClient 抛错时应向上抛出 Error', async () => {
      const uploadFileMock = vi.fn().mockRejectedValue(new Error('network down'));

      await expect(uploadFile({ uploadFile: uploadFileMock }, new File(['x'], 'd.png', { type: 'image/png' }))).rejects.toThrow('network down');
    });
  });

  describe('getRemoteFilePreviewUrl', () => {
    it('完整 URL 应原样返回', () => {
      expect(getRemoteFilePreviewUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
      expect(getRemoteFilePreviewUrl('http://cdn.example.com/a.png', true)).toBe('http://cdn.example.com/a.png');
    });

    it('相对路径应拼接 API 前缀', () => {
      expect(getRemoteFilePreviewUrl('abc.png')).toBe('/api/files/view/abc.png');
      expect(getRemoteFilePreviewUrl('abc.png', true)).toBe('/public-api/files/view/abc.png');
    });
  });

  describe('revokeFilePreviewUrl', () => {
    it('仅释放 blob: 前缀的 URL', () => {
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      revokeFilePreviewUrl('blob:mock-object-url');
      expect(revokeSpy).toHaveBeenCalledTimes(1);

      revokeFilePreviewUrl('https://example.com/a.png');
      expect(revokeSpy).toHaveBeenCalledTimes(1); // 远程 URL 不应触发释放

      revokeSpy.mockRestore();
    });
  });
});
