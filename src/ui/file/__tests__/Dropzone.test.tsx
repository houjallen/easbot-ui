/**
 * Dropzone 组件单元测试
 *
 * @description
 * 覆盖拖拽上传区的四大维度：
 * 渲染（默认 / 自定义文案 / children）、状态（拖拽高亮计数器）、
 * 交互（点击 / 键盘 / drop）、无障碍（role / tabIndex / aria-disabled）。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dropzone } from '../Dropzone';

/**
 * 手工派发带 dataTransfer 的拖拽事件
 *
 * @description
 * RTL 的 `fireEvent.dragEnter` 会用自带的 DataTransfer stub 重建 `dataTransfer`，
 * 只透传 `files` 等已知字段、**丢弃 `items`** —— 而 `handleDragEnter` 依赖
 * `dataTransfer.items.length` 判定高亮。因此高亮态用例必须手工构造事件
 * 并通过 `Object.defineProperty` 注入完整 `dataTransfer`。
 */
const fireDragEvent = (element: Element, type: 'dragenter' | 'dragleave', dataTransfer: object) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  fireEvent(element, event);
};

describe('Dropzone 组件', () => {
  describe('渲染', () => {
    it('默认模式应渲染内置文案并具备 button 语义', () => {
      render(<Dropzone />);

      expect(screen.getByText('点击或拖拽文件到此区域上传')).toBeInTheDocument();
      expect(screen.getByText('支持单个或批量上传')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveProperty('tabIndex', 0);
    });

    it('自定义 text / hint 应覆盖内置文案', () => {
      render(<Dropzone text="拖到这里" hint="最多 50MB" />);

      expect(screen.getByText('拖到这里')).toBeInTheDocument();
      expect(screen.getByText('最多 50MB')).toBeInTheDocument();
      expect(screen.queryByText('点击或拖拽文件到此区域上传')).not.toBeInTheDocument();
    });

    it('children 模式应渲染自定义内容且不出现内置文案', () => {
      render(
        <Dropzone>
          <div>自定义拖拽内容</div>
        </Dropzone>,
      );

      expect(screen.getByText('自定义拖拽内容')).toBeInTheDocument();
      expect(screen.queryByText('点击或拖拽文件到此区域上传')).not.toBeInTheDocument();
    });

    it('自定义 className 应合并到根节点', () => {
      const { container } = render(<Dropzone className="custom-zone" />);
      const root = container.firstElementChild as HTMLElement;

      expect(root).toHaveClass('custom-zone');
    });
  });

  describe('交互', () => {
    it('点击应触发 onUpload', () => {
      const onUpload = vi.fn();
      render(<Dropzone onUpload={onUpload} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onUpload).toHaveBeenCalledTimes(1);
    });

    it('Enter / Space 键应触发 onUpload', () => {
      const onUpload = vi.fn();
      render(<Dropzone onUpload={onUpload} />);
      const zone = screen.getByRole('button');

      fireEvent.keyDown(zone, { key: 'Enter' });
      fireEvent.keyDown(zone, { key: ' ' });
      expect(onUpload).toHaveBeenCalledTimes(2);
    });

    it('drop 事件应把文件透传给 onDrop', () => {
      const onDrop = vi.fn();
      const files = [new File(['x'], 'a.png', { type: 'image/png' })];
      render(<Dropzone onDrop={onDrop} />);

      fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files } });
      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onDrop.mock.calls[0]?.[0]).toEqual(files);
    });

    it('drop 空文件列表不应触发 onDrop', () => {
      const onDrop = vi.fn();
      render(<Dropzone onDrop={onDrop} />);

      fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [] } });
      expect(onDrop).not.toHaveBeenCalled();
    });

    it('disabled 时点击与 drop 均不响应', () => {
      const onUpload = vi.fn();
      const onDrop = vi.fn();
      const { container } = render(<Dropzone disabled onUpload={onUpload} onDrop={onDrop} />);
      const root = container.firstElementChild as HTMLElement;

      fireEvent.click(root);
      fireEvent.drop(root, { dataTransfer: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } });

      expect(onUpload).not.toHaveBeenCalled();
      expect(onDrop).not.toHaveBeenCalled();
    });

    it('enabled=false 时点击不触发 onUpload 且无 button 语义', () => {
      const onUpload = vi.fn();
      render(<Dropzone enabled={false} onUpload={onUpload} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('点击或拖拽文件到此区域上传'));
      expect(onUpload).not.toHaveBeenCalled();
    });
  });

  describe('状态（拖拽高亮）', () => {
    it('dragEnter 应显示释放文案，dragLeave 归零后恢复', () => {
      render(<Dropzone />);
      const zone = screen.getByText('点击或拖拽文件到此区域上传');

      fireDragEvent(zone, 'dragenter', { items: [{}] });
      expect(screen.getByText('释放文件开始上传')).toBeInTheDocument();

      // 嵌套拖拽：子元素会额外触发 dragEnter，计数器须归零后才退出高亮
      fireDragEvent(zone, 'dragenter', { items: [{}] });
      fireEvent.dragLeave(zone);
      expect(screen.getByText('释放文件开始上传')).toBeInTheDocument();

      fireEvent.dragLeave(zone);
      expect(screen.getByText('点击或拖拽文件到此区域上传')).toBeInTheDocument();
    });

    it('drop 后应立即退出高亮态', () => {
      render(<Dropzone />);
      const zone = screen.getByText('点击或拖拽文件到此区域上传');

      fireDragEvent(zone, 'dragenter', { items: [{}] });
      fireEvent.drop(zone, { dataTransfer: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } });

      expect(screen.getByText('点击或拖拽文件到此区域上传')).toBeInTheDocument();
    });

    it('children 模式下高亮时应叠加释放遮罩', () => {
      render(
        <Dropzone>
          <div>自定义拖拽内容</div>
        </Dropzone>,
      );
      const content = screen.getByText('自定义拖拽内容');

      fireDragEvent(content, 'dragenter', { items: [{}] });
      expect(screen.getByText('释放文件开始上传')).toBeInTheDocument();
    });
  });

  describe('无障碍', () => {
    it('disabled 时应标记 aria-disabled 且移除 button 语义', () => {
      const { container } = render(<Dropzone disabled />);
      const root = container.firstElementChild as HTMLElement;

      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('enabled 状态下应有 button 角色与键盘可达性', () => {
      render(<Dropzone />);
      const zone = screen.getByRole('button');

      expect(zone).toBeInTheDocument();
      expect(zone.getAttribute('tabIndex')).toBe('0');
    });
  });
});
