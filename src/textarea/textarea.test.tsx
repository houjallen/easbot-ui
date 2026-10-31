import { render, screen } from '@testing-library/react';
import { Textarea } from './textarea';

// jsdom 未实现 ResizeObserver，而 Textarea 默认使用 Radix ScrollArea 包裹，
// ScrollArea 依赖 ResizeObserver 测量尺寸，因此在测试文件内局部补充 polyfill。
class ResizeObserverStub implements ResizeObserver {
  observe(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  unobserve(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  disconnect(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);

describe('Textarea 组件', () => {
  test('应正确渲染基础功能', () => {
    render(<Textarea placeholder="测试输入框" />);
    expect(screen.getByPlaceholderText('测试输入框')).toBeInTheDocument();
  });

  test('应支持禁用状态', () => {
    const { container } = render(<Textarea disabled />);
    expect(container.querySelector('textarea')).toBeDisabled();
  });

  test('应应用自定义类名', () => {
    const { container } = render(<Textarea className="custom-class" />);
    // 注意：默认 useScrollArea=true 时，textarea 被包裹在 Radix ScrollArea 内，
    // 自定义类名落在 textarea 元素本身而非根节点
    expect(container.querySelector('textarea')).toHaveClass('custom-class');
  });

  test('应支持最大长度限制', () => {
    render(<Textarea maxLength={50} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '50');
  });
});
