import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InputFile } from '../InputFile';
import { uploadFile } from '../utils';

/**
 * InputFile 组件单元测试
 *
 * @description
 * 重点验证「未注入 HTTP 客户端」这一外部依赖缺失场景：
 * 上传必须**失败**并把文件标记为 `error`，不得出现「假成功」。
 */

/**
 * 获取组件自身的隐藏文件输入框
 *
 * @description
 * `InputFile` 渲染时会同时输出拖拽区（Dropzone）内部的 `<input type="file">`
 * 与组件自身的隐藏 `<input type="file">`；两者都是 `hidden`，
 * 只能通过「根容器直属的最后一个」来区分。
 */
const getFileInput = (container: HTMLElement): HTMLInputElement => {
  const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
  const input = inputs[inputs.length - 1];
  if (!input) throw new Error('未找到文件输入框');
  return input;
};

describe('InputFile 组件', () => {
  describe('渲染测试', () => {
    /**
     * 基础渲染测试
     * 验证组件能正常渲染出文件选择入口
     */
    it('应该正确渲染文件选择入口', () => {
      // 按钮模式（关闭拖拽区）→ 渲染「选择文件」按钮
      const { container } = render(<InputFile dropzone={{ enabled: false }} />);
      expect(screen.getByRole('button', { name: '选择文件' })).toBeInTheDocument();
      expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    /**
     * 未传 value 时不得无限渲染
     *
     * @description
     * `value` 的默认值若为内联 `[]`，每次渲染都是新数组引用，
     * 会让「同步外部 value」的 effect 依赖每渲染都变 → 无限渲染循环。
     */
    it('未传 value 时不得触发无限渲染', () => {
      const renderSpy = vi.fn();

      const Probe = () => {
        renderSpy();
        return <InputFile />;
      };

      render(<Probe />);

      expect(renderSpy.mock.calls.length).toBeLessThan(10);
    });
  });

  describe('未注入 HTTP 客户端（error 状态）', () => {
    /**
     * 未注入 httpClient 时上传必须失败
     * 验证文件状态被标记为 error，而不是假成功
     */
    it('未注入 httpClient 时应把文件标记为 error', async () => {
      const onError = vi.fn();
      const onSuccess = vi.fn();

      const { container } = render(<InputFile upload={{ action: '/api/upload' }} onError={onError} onSuccess={onSuccess} />);

      const file = new File(['hello'], 'a.txt', { type: 'text/plain' });
      fireEvent.change(getFileInput(container), { target: { files: [file] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(1);
      });

      // 不得触发成功回调
      expect(onSuccess).not.toHaveBeenCalled();

      const error = onError.mock.calls[0]?.[1] as Error;
      expect(error.message).toContain('HTTP');
    });

    /**
     * 失败后文件列表应展示错误态
     * 验证错误信息被写入 FileInfo.error 并渲染出来
     */
    it('未注入 httpClient 时文件列表应展示错误信息', async () => {
      const { container } = render(<InputFile upload={{ action: '/api/upload' }} />);

      const file = new File(['hello'], 'b.txt', { type: 'text/plain' });
      fireEvent.change(getFileInput(container), { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('b.txt')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/HTTP/)).toBeInTheDocument();
      });
    });
  });

  describe('注入 HTTP 客户端（成功路径）', () => {
    /**
     * 正常注入时应上传成功
     * 验证注入 httpClient 后上传成功并回写 url
     */
    it('注入 httpClient 后应上传成功并回写 url', async () => {
      const onSuccess = vi.fn();
      const uploadFileMock = vi.fn().mockResolvedValue({
        data: { url: 'https://example.com/a.txt' },
        msg: 'ok',
      });

      const { container } = render(<InputFile httpClient={{ uploadFile: uploadFileMock }} upload={{ action: '/api/upload' }} onSuccess={onSuccess} />);

      const file = new File(['hello'], 'c.txt', { type: 'text/plain' });
      fireEvent.change(getFileInput(container), { target: { files: [file] } });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });

      expect(uploadFileMock).toHaveBeenCalledTimes(1);
      const uploaded = onSuccess.mock.calls[0]?.[0];
      expect(uploaded.status).toBe('success');
      expect(uploaded.url).toBe('https://example.com/a.txt');
    });

    /**
     * 上传接口抛错时应标记 error
     * 验证异常路径下不出现假成功
     */
    it('上传接口抛错时应标记 error', async () => {
      const onError = vi.fn();
      const uploadFileMock = vi.fn().mockRejectedValue(new Error('boom'));

      const { container } = render(<InputFile httpClient={{ uploadFile: uploadFileMock }} upload={{ action: '/api/upload' }} onError={onError} />);

      const file = new File(['hello'], 'd.txt', { type: 'text/plain' });
      fireEvent.change(getFileInput(container), { target: { files: [file] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(1);
      });

      const error = onError.mock.calls[0]?.[1] as Error;
      expect(error.message).toBe('boom');
    });
  });

  describe('uploadFile 工具函数', () => {
    /**
     * 未注入 httpClient 时返回失败
     * 验证工具层不再返回恒真的 success
     */
    it('未注入 httpClient 时应返回 success: false', async () => {
      const file = new File(['hello'], 'e.txt', { type: 'text/plain' });
      const response = await uploadFile({}, file, { url: '/api/upload' });

      expect(response.success).toBe(false);
      expect(response.message).toContain('HTTP');
    });

    /**
     * 未注入 httpClient 时不应发起请求
     * 验证不会静默调用无效的客户端
     */
    it('未注入 httpClient 时不应发起请求', async () => {
      const file = new File(['hello'], 'f.txt', { type: 'text/plain' });
      const response = await uploadFile(undefined, file, { url: '/api/upload' });

      expect(response.success).toBe(false);
      expect(response.url).toBeUndefined();
    });

    /**
     * 注入 httpClient 时返回成功
     * 验证正常路径不受影响
     */
    it('注入 httpClient 时应返回 success: true', async () => {
      const uploadFileMock = vi.fn().mockResolvedValue({
        data: { url: 'https://example.com/g.txt' },
      });
      const file = new File(['hello'], 'g.txt', { type: 'text/plain' });
      const response = await uploadFile({ uploadFile: uploadFileMock }, file, {
        url: '/api/upload',
      });

      expect(response.success).toBe(true);
      expect(response.url).toBe('https://example.com/g.txt');
      expect(uploadFileMock).toHaveBeenCalledTimes(1);
    });
  });
});
