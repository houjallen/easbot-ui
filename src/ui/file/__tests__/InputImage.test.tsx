/**
 * InputImage 组件单元测试
 *
 * @description
 * `InputImage` 是 `InputFile` 的图片特化壳：
 * 1. 默认追加模式（picture-card + 「添加图片」按钮）
 * 2. 图片校验（非图片抛错、超过默认 5MB 报错）
 * 3. 图片预览对话框（打开 / 关闭）
 * 4. 受控删除（穿透到 `InputFile` 的移除链路）
 *
 * 本地预览依赖的 `URL.createObjectURL` 由 `tests/polyfills.ts` 全局提供。
 */

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InputImage } from '../InputImage';
import type { FileInfo } from '../types';
import type { ImageUploadProps } from '../types';

/** 获取组件自身的隐藏文件输入框 */
const getFileInput = (container: HTMLElement): HTMLInputElement => {
  const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
  const input = inputs[inputs.length - 1];
  if (!input) throw new Error('未找到文件输入框');
  return input;
};

/** 受控探针 —— 与 Story 一致的 value + onChange 用法 */
const ControlledImage = (props: ImageUploadProps) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  return <InputImage value={files} onChange={setFiles} {...props} />;
};

describe('InputImage 组件', () => {
  describe('渲染', () => {
    it('默认追加模式应渲染「添加图片」按钮', () => {
      render(<InputImage value={[]} />);

      expect(screen.getByText('添加图片')).toBeInTheDocument();
    });

    it('默认应关闭拖拽区（不渲染拖拽文案）', () => {
      render(<InputImage value={[]} />);

      expect(screen.queryByText('点击或拖拽图片到此区域上传')).not.toBeInTheDocument();
      expect(screen.queryByText('点击或拖拽文件到此区域上传')).not.toBeInTheDocument();
    });
  });

  describe('图片校验', () => {
    it('选择图片文件应进入受控列表', async () => {
      const onChange = vi.fn();
      const { container } = render(<ControlledImage onChange={onChange} />);

      const image = new File(['x'], 'a.png', { type: 'image/png' });
      fireEvent.change(getFileInput(container), { target: { files: [image] } });

      await waitFor(() => {
        expect(screen.getByText('a.png')).toBeInTheDocument();
      });
      // 上传链路是 async（内部 await beforeUpload 等），回调落地可能晚于 DOM 更新
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    /**
     * 非图片文件应入列表并标记错误
     * @description picture-card 错误态为红色图标遮罩（不渲染错误文本），
     * 错误信息经 `onError` 回调透出；accept 校验先于 beforeUpload 执行，
     * 故报「不支持的文件类型」而非「只能上传图片文件」。
     */
    it('非图片文件应入列表并触发 onError', async () => {
      const onError = vi.fn();
      const { container } = render(<InputImage onError={onError} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });

      await waitFor(() => {
        expect(screen.getByText('a.txt')).toBeInTheDocument();
      });
      expect(onError).toHaveBeenCalledTimes(1);
      const error = onError.mock.calls[0]?.[1];
      if (!(error instanceof Error)) throw new Error('onError 未携带 Error');
      expect(error.message).toContain('不支持的文件类型');
    });

    /**
     * 超过默认 5MB 的图片应被大小校验拦截
     * @description 错误信息经 `onError` 回调透出（picture-card 不渲染错误文本）
     */
    it('超过默认 5MB 的图片应触发大小错误', async () => {
      const onError = vi.fn();
      const { container } = render(<InputImage onError={onError} />);

      const bigImage = new File(['x'], 'big.png', { type: 'image/png' });
      Object.defineProperty(bigImage, 'size', { value: 6 * 1024 * 1024 });
      fireEvent.change(getFileInput(container), { target: { files: [bigImage] } });

      await waitFor(() => {
        expect(screen.getByText('big.png')).toBeInTheDocument();
      });
      expect(onError).toHaveBeenCalledTimes(1);
      const error = onError.mock.calls[0]?.[1];
      if (!(error instanceof Error)) throw new Error('onError 未携带 Error');
      expect(error.message).toContain('文件大小超出限制');
    });
  });

  describe('受控删除（穿透 InputFile 壳）', () => {
    // 📌 删除链路 `handleRemove` 是 async（内部 `await onRemove`），
    //    `fireEvent.click` 不会 flush 微任务 / act，导致断言随机超时（flaky）。
    //    用 `userEvent.click`（内部 await + act）保证状态更新落地后再断言。
    it('点击移除应从列表删除图片', async () => {
      const user = userEvent.setup();
      const { container } = render(<ControlledImage />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'b.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByText('b.png')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '移除' }));

      await waitFor(() => {
        expect(screen.queryByText('b.png')).not.toBeInTheDocument();
      });
    });

    it('onRemove 返回 void 时不应阻止删除', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const { container } = render(<ControlledImage onRemove={onRemove} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'c.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByText('c.png')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '移除' }));

      await waitFor(() => {
        expect(screen.queryByText('c.png')).not.toBeInTheDocument();
      });
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('图片预览对话框', () => {
    it('点击预览应打开对话框并显示文件名', async () => {
      const { container } = render(<InputImage />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'd.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '预览' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '预览' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      // 列表项与对话框标题同名，需限定在对话框内断言
      expect(within(screen.getByRole('dialog')).getByText('d.png')).toBeInTheDocument();
    });

    it('点击关闭应关闭预览对话框', async () => {
      const { container } = render(<InputImage />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'e.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '预览' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '预览' }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Radix DialogContent 内置关闭按钮与自定义关闭按钮同名，点击第一个即可
      const [closeButton] = screen.getAllByRole('button', { name: '关闭' });
      if (!closeButton) throw new Error('未找到关闭按钮');
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('预览时应透传 onPreview 回调', async () => {
      const onPreview = vi.fn();
      const { container } = render(<InputImage onPreview={onPreview} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'f.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '预览' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '预览' }));
      expect(onPreview).toHaveBeenCalledTimes(1);
      expect(onPreview.mock.calls[0]?.[0]?.name).toBe('f.png');
    });
  });

  describe('最大文件数与追加入口（isMaxFiles）', () => {
    /**
     * 单选选满 1 张后应隐藏「添加图片」入口
     * @description 回归背景：单选模式隐式上限为 1，未显式设置
     * validation.maxCount 时选满 1 张，「+ 添加图片」区域必须隐藏
     * （此前恒显示，即 Storybook Default story 的 bug 场景）。
     */
    it('单选选满 1 张后应隐藏「添加图片」入口', async () => {
      const { container } = render(<InputImage value={[]} />);

      expect(screen.getByText('添加图片')).toBeInTheDocument();

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'max1.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByText('max1.png')).toBeInTheDocument();
      });

      expect(screen.queryByText('添加图片')).not.toBeInTheDocument();
    });

    /**
     * 单选删除图片后「添加图片」入口应恢复
     * @description 隐藏逻辑随文件数联动：删除后可继续添加
     */
    it('单选删除图片后「添加图片」入口应重新显示', async () => {
      const { container } = render(<InputImage value={[]} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'max2.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByText('max2.png')).toBeInTheDocument();
      });
      expect(screen.queryByText('添加图片')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '移除' }));
      await waitFor(() => {
        expect(screen.queryByText('max2.png')).not.toBeInTheDocument();
      });

      expect(screen.getByText('添加图片')).toBeInTheDocument();
    });

    /**
     * 多选未达 maxCount 时「添加图片」入口应保留
     * @description 修复不得误伤多选场景
     */
    it('多选未达 maxCount 时「添加图片」入口应保留', async () => {
      const { container } = render(<InputImage value={[]} multiple validation={{ maxCount: 3 }} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'multi1.png', { type: 'image/png' })] } });
      await waitFor(() => {
        expect(screen.getByText('multi1.png')).toBeInTheDocument();
      });

      expect(screen.getByText('添加图片')).toBeInTheDocument();
    });

    /**
     * 多选达到 maxCount 后应隐藏「添加图片」入口
     * @description 显式 validation.maxCount 场景（原有逻辑回归保护）
     */
    it('多选达到 maxCount 后应隐藏「添加图片」入口', async () => {
      const { container } = render(<InputImage value={[]} multiple validation={{ maxCount: 2 }} />);

      fireEvent.change(getFileInput(container), {
        target: { files: [new File(['x'], 'multi1.png', { type: 'image/png' }), new File(['x'], 'multi2.png', { type: 'image/png' })] },
      });
      await waitFor(() => {
        expect(screen.getByText('multi2.png')).toBeInTheDocument();
      });

      expect(screen.queryByText('添加图片')).not.toBeInTheDocument();
    });
  });

  describe('beforeUpload 透传', () => {
    it('消费方 beforeUpload 返回 false 时应丢弃图片', async () => {
      const beforeUpload = vi.fn().mockReturnValue(false);
      const { container } = render(<InputImage beforeUpload={beforeUpload} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'g.png', { type: 'image/png' })] } });

      await waitFor(() => {
        expect(beforeUpload).toHaveBeenCalledTimes(1);
      });
      expect(screen.queryByText('g.png')).not.toBeInTheDocument();
    });

    it('消费方 beforeUpload 返回 void 时不应丢弃图片', async () => {
      const beforeUpload = vi.fn();
      const { container } = render(<InputImage beforeUpload={beforeUpload} />);

      fireEvent.change(getFileInput(container), { target: { files: [new File(['x'], 'h.png', { type: 'image/png' })] } });

      await waitFor(() => {
        expect(screen.getByText('h.png')).toBeInTheDocument();
      });
      expect(beforeUpload).toHaveBeenCalledTimes(1);
    });
  });
});
