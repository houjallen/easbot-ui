import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InputFile } from '../InputFile';
import type { InputFileProps } from '../InputFile';
import type { FileInfo } from '../types';
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

  describe('文件移除（onRemove 返回值语义）', () => {
    /** 初始带一个文件的受控探针，模拟 Storybook 中 value + onChange 的受控用法 */
    const ControlledProbe = ({ onRemove }: { onRemove?: InputFileProps['onRemove'] }) => {
      const [files, setFiles] = useState<FileInfo[]>([
        {
          id: '1',
          name: 'sample.txt',
          size: 1024,
          type: 'text/plain',
          status: 'success',
          url: 'https://example.com/files/sample.txt',
        },
      ]);
      return <InputFile value={files} onChange={setFiles} onRemove={onRemove} />;
    };

    /**
     * 未提供 onRemove 时删除应生效
     * @description 回归背景：受控模式下点「移除」必须真正移除文件
     */
    it('未提供 onRemove 时点击移除应删除文件', () => {
      render(<ControlledProbe />);
      expect(screen.getByText('sample.txt')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '移除' }));

      expect(screen.queryByText('sample.txt')).not.toBeInTheDocument();
    });

    /**
     * onRemove 返回 void / undefined 时删除应生效
     * @description 回归背景：Storybook 的 `actions.argTypesRegex` 会向所有 `on*`
     * props 自动注入 action 函数（返回 `undefined`），若把 `undefined`
     * 当作「阻止」，story 里删除按钮会失效。只有显式 `false` 才阻止。
     */
    it('onRemove 返回 void 时不应阻止删除', async () => {
      const onRemove = vi.fn();
      render(<ControlledProbe onRemove={onRemove} />);

      fireEvent.click(screen.getByRole('button', { name: '移除' }));

      // `await onRemove(...)` 引入微任务边界，移除在下一轮微任务后才生效
      await waitFor(() => {
        expect(screen.queryByText('sample.txt')).not.toBeInTheDocument();
      });
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    /**
     * onRemove 显式返回 false 时应阻止删除
     * @description 验证「确认后才能删除」的受控场景仍然有效
     */
    it('onRemove 显式返回 false 时应阻止删除', () => {
      const onRemove = vi.fn().mockReturnValue(false);
      render(<ControlledProbe onRemove={onRemove} />);

      fireEvent.click(screen.getByRole('button', { name: '移除' }));

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(screen.getByText('sample.txt')).toBeInTheDocument();
    });

    /**
     * onRemove 异步返回 false 时应阻止删除
     * @description 验证 Promise 拒绝路径与异步 false 均不删除
     */
    it('onRemove 异步返回 false 时应阻止删除', async () => {
      const onRemove = vi.fn().mockResolvedValue(false);
      render(<ControlledProbe onRemove={onRemove} />);

      fireEvent.click(screen.getByRole('button', { name: '移除' }));

      await waitFor(() => {
        expect(onRemove).toHaveBeenCalledTimes(1);
      });
      expect(screen.getByText('sample.txt')).toBeInTheDocument();
    });
  });

  describe('上传前拦截（beforeUpload 返回值语义）', () => {
    /**
     * beforeUpload 返回 void / undefined 时应放行
     * @description 与 `onRemove` 同一纪律：常见用法是「只做副作用、不否决」
     * （如打日志），返回 `void` 不应被误判为否决。
     */
    it('beforeUpload 返回 void 时文件应正常入列表', async () => {
      const beforeUpload = vi.fn();
      const { container } = render(<InputFile beforeUpload={beforeUpload} />);

      const file = new File(['x'], 'void.txt', { type: 'text/plain' });
      fireEvent.change(getFileInput(container), { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('void.txt')).toBeInTheDocument();
      });
      expect(beforeUpload).toHaveBeenCalledTimes(1);
    });

    /**
     * beforeUpload 返回 true 时应放行
     * @description 验证显式允许路径
     */
    it('beforeUpload 返回 true 时文件应正常入列表', async () => {
      const beforeUpload = vi.fn().mockReturnValue(true);
      const { container } = render(<InputFile beforeUpload={beforeUpload} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'ok.txt', { type: 'text/plain' })] } });

      await waitFor(() => {
        expect(screen.getByText('ok.txt')).toBeInTheDocument();
      });
    });

    /**
     * beforeUpload 显式返回 false 时应丢弃文件
     * @description 文档契约：返回 `false` 的文件不入列表、不触发 `onError`
     */
    it('beforeUpload 返回 false 时文件应被丢弃', async () => {
      const beforeUpload = vi.fn().mockReturnValue(false);
      const onError = vi.fn();
      const { container } = render(<InputFile beforeUpload={beforeUpload} onError={onError} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'skip.txt', { type: 'text/plain' })] } });

      await waitFor(() => {
        expect(beforeUpload).toHaveBeenCalledTimes(1);
      });
      expect(screen.queryByText('skip.txt')).not.toBeInTheDocument();
      expect(onError).not.toHaveBeenCalled();
    });

    /**
     * beforeUpload 异步返回 false 时应丢弃文件
     * @description 验证 Promise 形式的否决同样生效
     */
    it('beforeUpload 异步返回 false 时文件应被丢弃', async () => {
      const beforeUpload = vi.fn().mockResolvedValue(false);
      const { container } = render(<InputFile beforeUpload={beforeUpload} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'async-skip.txt', { type: 'text/plain' })] } });

      await waitFor(() => {
        expect(beforeUpload).toHaveBeenCalledTimes(1);
      });
      expect(screen.queryByText('async-skip.txt')).not.toBeInTheDocument();
    });

    /**
     * beforeUpload 抛错时文件应入列表并标记错误
     * @description 文档契约：抛错 → 文件入列表、`status` 为 error、触发 `onError`
     */
    it('beforeUpload 抛错时文件应入列表并标记错误', async () => {
      const beforeUpload = vi.fn().mockImplementation(() => {
        throw new Error('校验未通过');
      });
      const onError = vi.fn();
      const { container } = render(<InputFile beforeUpload={beforeUpload} onError={onError} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'bad.txt', { type: 'text/plain' })] } });

      await waitFor(() => {
        expect(screen.getByText('bad.txt')).toBeInTheDocument();
      });
      expect(screen.getByText('校验未通过')).toBeInTheDocument();
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('最大文件数与追加入口（isMaxFiles）', () => {
    /** 追加模式探针：关闭拖拽区 + picture-card 列表 + 显示追加按钮 */
    const AppendModeProbe = (props: InputFileProps) => <InputFile dropzone={{ enabled: false }} fileList={{ listType: 'picture-card', showUploadButton: true }} {...props} />;

    /**
     * 单选达到隐式上限后应隐藏追加入口
     * @description 回归背景：单选模式（multiple=false）隐式上限为 1，
     * 未显式设置 validation.maxCount 时选满 1 个文件，
     * 「+ 添加文件」区域必须隐藏（此前恒显示，bug 场景）。
     */
    it('单选选满 1 个文件后应隐藏追加入口', async () => {
      const { container } = render(<AppendModeProbe />);

      expect(screen.getByText('添加文件')).toBeInTheDocument();

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'one.txt', { type: 'text/plain' })] } });
      await waitFor(() => {
        expect(screen.getByText('one.txt')).toBeInTheDocument();
      });

      expect(screen.queryByText('添加文件')).not.toBeInTheDocument();
    });

    /**
     * 单选删除文件后追加入口应恢复
     * @description 隐藏逻辑必须随文件数变化联动，删除后可继续选择
     */
    it('单选删除文件后追加入口应重新显示', async () => {
      const { container } = render(<AppendModeProbe />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'two.txt', { type: 'text/plain' })] } });
      await waitFor(() => {
        expect(screen.getByText('two.txt')).toBeInTheDocument();
      });
      expect(screen.queryByText('添加文件')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '移除' }));
      await waitFor(() => {
        expect(screen.queryByText('two.txt')).not.toBeInTheDocument();
      });

      expect(screen.getByText('添加文件')).toBeInTheDocument();
    });

    /**
     * 多选未达显式上限时追加入口应保留
     * @description 修复不得误伤多选场景：maxCount=2 选 1 个时仍显示
     */
    it('多选未达 maxCount 时追加入口应保留', async () => {
      const { container } = render(<AppendModeProbe multiple validation={{ maxCount: 2 }} />);

      fireEvent.change(getFileInput(container), {
        target: { files: [new File(['x'], 'm1.txt', { type: 'text/plain' })] },
      });
      await waitFor(() => {
        expect(screen.getByText('m1.txt')).toBeInTheDocument();
      });

      expect(screen.getByText('添加文件')).toBeInTheDocument();
    });

    /**
     * 多选达到显式上限后应隐藏追加入口
     * @description 显式 validation.maxCount 场景（原有逻辑回归保护）
     */
    it('多选达到 maxCount 后应隐藏追加入口', async () => {
      const { container } = render(<AppendModeProbe multiple validation={{ maxCount: 2 }} />);

      fireEvent.change(getFileInput(container), {
        target: { files: [new File(['x'], 'm1.txt', { type: 'text/plain' }), new File(['x'], 'm2.txt', { type: 'text/plain' })] },
      });
      await waitFor(() => {
        expect(screen.getByText('m2.txt')).toBeInTheDocument();
      });

      expect(screen.queryByText('添加文件')).not.toBeInTheDocument();
    });

    /**
     * 单选选满后数量校验不应被隐式上限误拦（替换语义）
     * @description 隐式上限 1 只用于 UI 判定；数量拦截仍以显式 maxCount 为准，
     * 单选在已有文件时再选择属于「替换」，不得报 maxCountExceeded。
     * 注：选满后隐藏 input 已 disabled，fireEvent 可绕过 disabled 直接触发 change，
     * 这正好模拟「编程式 setValue / 受控重置后再选择」的替换路径。
     */
    it('单选重复选择不应触发数量超限错误', async () => {
      const onError = vi.fn();
      const { container } = render(<AppendModeProbe onError={onError} />);

      // 模拟「替换」：外部受控把 value 重置为空后再选（或直接两次 change，
      // 单选第二次选择会替换而非追加，均不应报错）
      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'r1.txt', { type: 'text/plain' })] } });
      await waitFor(() => {
        expect(screen.getByText('r1.txt')).toBeInTheDocument();
      });

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'r2.txt', { type: 'text/plain' })] } });
      await waitFor(() => {
        expect(screen.getByText('r2.txt')).toBeInTheDocument();
      });

      expect(onError).not.toHaveBeenCalled();
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
